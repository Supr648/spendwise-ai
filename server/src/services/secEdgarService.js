import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CACHE_DIR = path.resolve(__dirname, '../../.cache/sec_edgar');

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// User-Agent mandated by SEC EDGAR fair access policy: Sample Company Name AdminContact@domain.com
const SEC_HEADERS = {
  'User-Agent': 'FinSightAI FinancialAnalytics/2.0 (contact@finsight-analytics.org)',
  'Accept-Encoding': 'gzip, deflate',
  Host: 'data.sec.gov',
};

// In-memory quick lookup cache (1 hour TTL)
const memoryCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000;

/**
 * Fetch raw XBRL Company Facts from data.sec.gov
 */
export const fetchSecCompanyFacts = async (cik) => {
  const paddedCik = cik.padStart(10, '0');
  const cacheKey = `CIK${paddedCik}`;
  const diskCacheFile = path.join(CACHE_DIR, `${cacheKey}.json`);

  // Check memory cache
  const cachedMem = memoryCache.get(cacheKey);
  if (cachedMem && Date.now() - cachedMem.timestamp < CACHE_TTL_MS) {
    return { data: cachedMem.data, source: 'SEC EDGAR (Memory Cache)', isLive: true };
  }

  // Check disk cache
  if (fs.existsSync(diskCacheFile)) {
    try {
      const stats = fs.statSync(diskCacheFile);
      if (Date.now() - stats.mtimeMs < 24 * 60 * 60 * 1000) {
        const diskData = JSON.parse(fs.readFileSync(diskCacheFile, 'utf8'));
        memoryCache.set(cacheKey, { data: diskData, timestamp: stats.mtimeMs });
        return { data: diskData, source: 'SEC EDGAR XBRL (Local Disk Cache)', isLive: true };
      }
    } catch (e) {
      // ignore cache read error, fetch fresh
    }
  }

  // Fetch live from SEC EDGAR
  const url = `https://data.sec.gov/api/xbrl/companyfacts/CIK${paddedCik}.json`;
  try {
    const res = await axios.get(url, {
      headers: SEC_HEADERS,
      timeout: 10000,
    });

    if (res.data && res.data.facts) {
      fs.writeFileSync(diskCacheFile, JSON.stringify(res.data), 'utf8');
      memoryCache.set(cacheKey, { data: res.data, timestamp: Date.now() });
      return { data: res.data, source: 'SEC EDGAR XBRL Official API (Live)', isLive: true };
    }
    throw new Error('SEC response did not contain company facts.');
  } catch (err) {
    // If disk cache exists (even if stale), return it gracefully
    if (fs.existsSync(diskCacheFile)) {
      const staleData = JSON.parse(fs.readFileSync(diskCacheFile, 'utf8'));
      return { data: staleData, source: 'SEC EDGAR (Stale Fallback Cache)', isLive: false };
    }
    throw err;
  }
};

/**
 * Extract prioritized US-GAAP tag units by fiscal year
 */
const extractMetricAnnualSeries = (usGaap, tagNames, targetUnit = 'USD') => {
  for (const tag of tagNames) {
    if (usGaap[tag] && usGaap[tag].units) {
      const units = usGaap[tag].units[targetUnit] || usGaap[tag].units['shares'] || [];
      // Filter strictly for 10-K (Annual reports) and Form 10-K/A
      const annuals = units.filter(
        (u) =>
          (u.form === '10-K' || u.form === '10-K/A') &&
          u.fy &&
          u.val !== undefined &&
          // Annual reports generally cover ~350-375 days if fp === 'FY'
          (u.fp === 'FY' || !u.fp)
      );

      if (annuals.length > 0) {
        // Deduplicate by fiscal year, prefer later filed date or end date
        const byYear = new Map();
        annuals.forEach((entry) => {
          const year = parseInt(entry.fy, 10);
          if (!isNaN(year) && year >= 2018) {
            const existing = byYear.get(year);
            if (!existing || new Date(entry.filed) >= new Date(existing.filed)) {
              byYear.set(year, {
                fy: year,
                val: entry.val,
                end: entry.end,
                filed: entry.filed,
                form: entry.form,
                tag,
              });
            }
          }
        });
        return Array.from(byYear.values()).sort((a, b) => a.fy - b.fy);
      }
    }
  }
  return [];
};

/**
 * Parse raw SEC EDGAR facts into structured annual financial statements
 */
export const parseSecFinancialStatements = (secRawData) => {
  if (!secRawData || !secRawData.facts || !secRawData.facts['us-gaap']) {
    return null;
  }

  const usGaap = secRawData.facts['us-gaap'];

  // Income Statement Tags
  const revenueSeries = extractMetricAnnualSeries(usGaap, [
    'RevenueFromContractWithCustomerExcludingAssessedTax',
    'SalesRevenueNet',
    'Revenues',
  ]);

  const costOfRevenueSeries = extractMetricAnnualSeries(usGaap, [
    'CostOfGoodsAndServicesSold',
    'CostOfRevenue',
  ]);

  const grossProfitSeries = extractMetricAnnualSeries(usGaap, ['GrossProfit']);

  const operatingIncomeSeries = extractMetricAnnualSeries(usGaap, [
    'OperatingIncomeLoss',
  ]);

  const netIncomeSeries = extractMetricAnnualSeries(usGaap, [
    'NetIncomeLoss',
    'ProfitLoss',
  ]);

  const epsSeries = extractMetricAnnualSeries(usGaap, [
    'EarningsPerShareDiluted',
    'EarningsPerShareBasic',
  ], 'USD/shares');

  // Balance Sheet Tags
  const totalAssetsSeries = extractMetricAnnualSeries(usGaap, ['Assets']);
  const currentAssetsSeries = extractMetricAnnualSeries(usGaap, ['AssetsCurrent']);
  const cashSeries = extractMetricAnnualSeries(usGaap, [
    'CashAndCashEquivalentsAtCarryingValue',
    'CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents',
  ]);
  const totalLiabilitiesSeries = extractMetricAnnualSeries(usGaap, ['Liabilities']);
  const currentLiabilitiesSeries = extractMetricAnnualSeries(usGaap, ['LiabilitiesCurrent']);
  const longTermDebtSeries = extractMetricAnnualSeries(usGaap, [
    'LongTermDebtNoncurrent',
    'LongTermDebtAndCapitalLeaseObligations',
  ]);
  const stockholdersEquitySeries = extractMetricAnnualSeries(usGaap, [
    'StockholdersEquity',
    'StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest',
  ]);

  // Cash Flow Statement Tags
  const operatingCashFlowSeries = extractMetricAnnualSeries(usGaap, [
    'NetCashProvidedByUsedInOperatingActivities',
  ]);
  const capexSeries = extractMetricAnnualSeries(usGaap, [
    'PaymentsToAcquirePropertyPlantAndEquipment',
    'PaymentsToAcquireProductiveAssets',
  ]);

  // Combine into unified annual periods
  const yearsSet = new Set();
  revenueSeries.forEach((r) => yearsSet.add(r.fy));
  netIncomeSeries.forEach((n) => yearsSet.add(n.fy));
  totalAssetsSeries.forEach((a) => yearsSet.add(a.fy));

  const sortedYears = Array.from(yearsSet).filter((y) => y >= 2020).sort((a, b) => a - b);

  const getVal = (series, fy) => {
    const item = series.find((s) => s.fy === fy);
    return item ? item.val : null;
  };

  const scaleToMillions = (val) => {
    if (val === null || val === undefined) return null;
    if (Math.abs(val) >= 1000000) {
      return Math.round(val / 1000000);
    }
    return val;
  };

  const annuals = sortedYears.map((year) => {
    const revenue = getVal(revenueSeries, year);
    let grossProfit = getVal(grossProfitSeries, year);
    const costOfRevenue = getVal(costOfRevenueSeries, year);

    if (grossProfit === null && revenue !== null && costOfRevenue !== null) {
      grossProfit = revenue - costOfRevenue;
    }

    const operatingIncome = getVal(operatingIncomeSeries, year);
    const netIncome = getVal(netIncomeSeries, year);
    const eps = getVal(epsSeries, year);

    const totalAssets = getVal(totalAssetsSeries, year);
    const currentAssets = getVal(currentAssetsSeries, year);
    const cash = getVal(cashSeries, year);
    const totalLiabilities = getVal(totalLiabilitiesSeries, year);
    const currentLiabilities = getVal(currentLiabilitiesSeries, year);
    const longTermDebt = getVal(longTermDebtSeries, year) || 0;
    const stockholdersEquity = getVal(stockholdersEquitySeries, year);

    const operatingCashFlow = getVal(operatingCashFlowSeries, year);
    const capex = getVal(capexSeries, year);
    const freeCashFlow =
      operatingCashFlow !== null && capex !== null
        ? operatingCashFlow - capex
        : operatingCashFlow;

    const opExp = grossProfit !== null && operatingIncome !== null ? grossProfit - operatingIncome : null;

    return {
      period: `FY${year}`,
      fiscalYear: year,
      periodType: 'annual',
      incomeStatement: {
        revenue: scaleToMillions(revenue),
        costOfGoodsSold: scaleToMillions(costOfRevenue),
        costOfRevenue: scaleToMillions(costOfRevenue),
        grossProfit: scaleToMillions(grossProfit),
        operatingExpenses: scaleToMillions(opExp),
        operatingIncome: scaleToMillions(operatingIncome),
        netIncome: scaleToMillions(netIncome),
        eps: eps !== null ? Number(eps.toFixed(2)) : null,
        dilutedEps: eps !== null ? Number(eps.toFixed(2)) : null,
      },
      balanceSheet: {
        totalAssets: scaleToMillions(totalAssets),
        currentAssets: scaleToMillions(currentAssets),
        cashAndEquivalents: scaleToMillions(cash),
        totalLiabilities: scaleToMillions(totalLiabilities),
        currentLiabilities: scaleToMillions(currentLiabilities),
        longTermDebt: scaleToMillions(longTermDebt),
        stockholdersEquity: scaleToMillions(stockholdersEquity),
        workingCapital: scaleToMillions(
          currentAssets !== null && currentLiabilities !== null
            ? currentAssets - currentLiabilities
            : null
        ),
      },
      cashFlow: {
        operatingCashFlow: scaleToMillions(operatingCashFlow),
        capitalExpenditure: scaleToMillions(capex),
        freeCashFlow: scaleToMillions(freeCashFlow),
      },
    };
  });

  return {
    entityName: secRawData.entityName,
    cik: secRawData.cik,
    periods: annuals.filter((a) => a.incomeStatement.revenue !== null || a.incomeStatement.netIncome !== null),
  };
};


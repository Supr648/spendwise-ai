import { getCompanyByTicker, COMPANY_DIRECTORY } from '../data/companyDirectory.js';
import { fetchSecCompanyFacts, parseSecFinancialStatements } from './secEdgarService.js';
import { getIndianCompanyFinancials } from './indianMarketService.js';
import { VERIFIED_US_BASELINES } from '../data/verifiedUsBaselines.js';

/**
 * Get comprehensive financial dataset for any supported company
 */
export const getCompanyFinancials = async (ticker) => {
  const clean = ticker.toUpperCase().replace('.NS', '').replace('.BO', '').trim();
  const profile = getCompanyByTicker(clean);

  if (!profile) {
    throw new Error(`Company with ticker "${ticker}" not found in directory.`);
  }

  // 1. Indian Equities
  if (profile.market === 'IN') {
    const indianData = getIndianCompanyFinancials(clean);
    if (!indianData) {
      throw new Error(`Financial statements for Indian ticker "${clean}" could not be retrieved.`);
    }

    return {
      profile,
      periods: indianData.periods,
      metadata: {
        source: indianData.source,
        reportingStandard: profile.reportingStandard,
        currency: profile.currency,
        currencySymbol: profile.currencySymbol,
        unit: profile.unit || 'Crores',
        isLive: true,
        isDemo: false,
        dataFreshness: 'FY2020 - FY2024 (Annual Audited Reports)',
        lastUpdated: new Date().toISOString(),
      },
    };
  }

  // 2. US Equities (SEC EDGAR Live with Verified Baseline Fallback)
  let secParsed = null;
  let sourceLabel = 'SEC EDGAR XBRL (Official Form 10-K API)';

  if (profile.cik) {
    try {
      const { data, source } = await fetchSecCompanyFacts(profile.cik);
      secParsed = parseSecFinancialStatements(data);
      sourceLabel = source;
    } catch (secErr) {
      console.warn(`[SEC EDGAR Live] Warning fetching CIK ${profile.cik} (${clean}): ${secErr.message}. Utilizing verified audited 10-K baseline.`);
    }
  }

  // Fallback to verified audited US baseline if live parsing was empty or errored
  if (!secParsed || !secParsed.periods || secParsed.periods.length === 0) {
    const baseline = VERIFIED_US_BASELINES[clean];
    if (baseline) {
      return {
        profile,
        periods: baseline.periods,
        metadata: {
          source: 'SEC EDGAR Audited Form 10-K (Verified Archive)',
          reportingStandard: profile.reportingStandard,
          currency: profile.currency,
          currencySymbol: profile.currencySymbol,
          unit: profile.unit || 'Millions',
          isLive: false,
          isDemo: false,
          dataFreshness: 'FY2020 - FY2024 (Audited Annual Filings)',
          lastUpdated: new Date().toISOString(),
        },
      };
    }
  }

  return {
    profile,
    periods: secParsed.periods,
    metadata: {
      source: sourceLabel,
      reportingStandard: profile.reportingStandard,
      currency: profile.currency,
      currencySymbol: profile.currencySymbol,
      unit: profile.unit || 'Millions',
      isLive: true,
      isDemo: false,
      dataFreshness: 'Live SEC EDGAR Filings',
      lastUpdated: new Date().toISOString(),
    },
  };
};

/**
 * List all supported companies with basic metrics
 */
export const getAllCompanies = () => {
  return COMPANY_DIRECTORY;
};


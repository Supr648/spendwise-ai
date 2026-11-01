/**
 * Institutional Financial Ratio, Growth & Health Engine
 * All calculations handle zero-division gracefully, document mathematical formulas,
 * and format precision accurately.
 */

const safeDiv = (num, den, multiplier = 1, decimals = 2) => {
  if (num === null || num === undefined || den === null || den === undefined || den === 0) {
    return null;
  }
  const val = (num / den) * multiplier;
  if (!isFinite(val) || isNaN(val)) return null;
  return Number(val.toFixed(decimals));
};

const safeGrowth = (current, previous) => {
  if (
    current === null ||
    current === undefined ||
    previous === null ||
    previous === undefined ||
    previous === 0
  ) {
    return null;
  }
  // If previous was negative and current is positive, or vice versa
  if (previous < 0 && current > 0) {
    return Number((((current - previous) / Math.abs(previous)) * 100).toFixed(2));
  }
  const growth = ((current - previous) / Math.abs(previous)) * 100;
  return Number(growth.toFixed(2));
};

const calculateCAGR = (startVal, endVal, periodsCount) => {
  if (
    startVal === null ||
    startVal === undefined ||
    endVal === null ||
    endVal === undefined ||
    startVal <= 0 ||
    endVal <= 0 ||
    periodsCount <= 0
  ) {
    return null;
  }
  const cagr = (Math.pow(endVal / startVal, 1 / periodsCount) - 1) * 100;
  return Number(cagr.toFixed(2));
};

/**
 * Compute exhaustive financial ratios across all periods
 */
export const computeCompanyRatios = (periods) => {
  if (!periods || periods.length === 0) return [];

  return periods.map((p, idx) => {
    const is = p.incomeStatement || {};
    const bs = p.balanceSheet || {};
    const cf = p.cashFlow || {};

    const prevPeriod = idx > 0 ? periods[idx - 1] : null;
    const prevIs = prevPeriod ? prevPeriod.incomeStatement || {} : {};
    const prevCf = prevPeriod ? prevPeriod.cashFlow || {} : {};

    // 1. Growth Ratios
    const revenueGrowthYoY = safeGrowth(is.revenue, prevIs.revenue);
    const netIncomeGrowthYoY = safeGrowth(is.netIncome, prevIs.netIncome);
    const operatingIncomeGrowthYoY = safeGrowth(is.operatingIncome, prevIs.operatingIncome);
    const fcfGrowthYoY = safeGrowth(cf.freeCashFlow, prevCf.freeCashFlow);

    // 2. Profitability Ratios
    const grossMargin = safeDiv(is.grossProfit, is.revenue, 100);
    const operatingMargin = safeDiv(is.operatingIncome, is.revenue, 100);
    const netProfitMargin = safeDiv(is.netIncome, is.revenue, 100);
    const roa = safeDiv(is.netIncome, bs.totalAssets, 100);
    const roe = safeDiv(is.netIncome, bs.stockholdersEquity, 100);

    // 3. DuPont 3-Stage Analysis: ROE = Net Margin * Asset Turnover * Equity Multiplier
    const assetTurnover = safeDiv(is.revenue, bs.totalAssets, 1, 3);
    const equityMultiplier = safeDiv(bs.totalAssets, bs.stockholdersEquity, 1, 2);

    // 4. Liquidity & Solvency
    const currentRatio = safeDiv(bs.currentAssets, bs.currentLiabilities, 1, 2);
    const cashRatio = safeDiv(bs.cashAndEquivalents, bs.currentLiabilities, 1, 2);
    const workingCapital =
      bs.currentAssets !== null && bs.currentLiabilities !== null
        ? bs.currentAssets - bs.currentLiabilities
        : null;

    // 5. Leverage Ratios
    const debtToEquity = safeDiv(bs.longTermDebt, bs.stockholdersEquity, 1, 2);
    const debtToAssets = safeDiv(bs.longTermDebt, bs.totalAssets, 1, 2);

    // 6. Cash Flow Quality
    const ocfToNetIncome = safeDiv(cf.operatingCashFlow, is.netIncome, 1, 2);
    const fcfMargin = safeDiv(cf.freeCashFlow, is.revenue, 100);

    return {
      period: p.period,
      fiscalYear: p.fiscalYear,
      growth: {
        revenueGrowthYoY: {
          value: revenueGrowthYoY,
          unit: '%',
          formula: '((Revenue_t - Revenue_{t-1}) / |Revenue_{t-1}|) * 100',
        },
        netIncomeGrowthYoY: {
          value: netIncomeGrowthYoY,
          unit: '%',
          formula: '((NetIncome_t - NetIncome_{t-1}) / |NetIncome_{t-1}|) * 100',
        },
        operatingIncomeGrowthYoY: {
          value: operatingIncomeGrowthYoY,
          unit: '%',
          formula: '((OperatingIncome_t - OperatingIncome_{t-1}) / |OperatingIncome_{t-1}|) * 100',
        },
        fcfGrowthYoY: {
          value: fcfGrowthYoY,
          unit: '%',
          formula: '((FCF_t - FCF_{t-1}) / |FCF_{t-1}|) * 100',
        },
      },
      profitability: {
        grossMargin: {
          value: grossMargin,
          unit: '%',
          formula: '(Gross Profit / Total Revenue) * 100',
        },
        operatingMargin: {
          value: operatingMargin,
          unit: '%',
          formula: '(Operating Income (EBIT) / Total Revenue) * 100',
        },
        netProfitMargin: {
          value: netProfitMargin,
          unit: '%',
          formula: '(Net Income / Total Revenue) * 100',
        },
        roa: {
          value: roa,
          unit: '%',
          formula: '(Net Income / Total Assets) * 100',
        },
        roe: {
          value: roe,
          unit: '%',
          formula: '(Net Income / Stockholders’ Equity) * 100',
        },
        dupont: {
          netProfitMarginFraction: safeDiv(is.netIncome, is.revenue, 1, 4),
          assetTurnover,
          equityMultiplier,
          calculatedRoe: roe,
          formula: 'ROE = (Net Income / Revenue) * (Revenue / Assets) * (Assets / Equity)',
        },
      },
      liquidity: {
        currentRatio: {
          value: currentRatio,
          unit: 'x',
          benchmark: '>= 1.2x desired',
          formula: 'Current Assets / Current Liabilities',
        },
        cashRatio: {
          value: cashRatio,
          unit: 'x',
          benchmark: '>= 0.5x desired',
          formula: 'Cash & Cash Equivalents / Current Liabilities',
        },
        workingCapital: {
          value: workingCapital,
          formula: 'Current Assets - Current Liabilities',
        },
      },
      leverage: {
        debtToEquity: {
          value: debtToEquity,
          unit: 'x',
          benchmark: '< 1.5x desired',
          formula: 'Total Long-Term Debt / Stockholders’ Equity',
        },
        debtToAssets: {
          value: debtToAssets,
          unit: 'x',
          benchmark: '< 0.5x desired',
          formula: 'Total Long-Term Debt / Total Assets',
        },
        financialLeverage: {
          value: equityMultiplier,
          unit: 'x',
          formula: 'Total Assets / Stockholders’ Equity',
        },
      },
      efficiency: {
        assetTurnover: {
          value: assetTurnover,
          unit: 'x',
          formula: 'Total Revenue / Total Assets',
        },
        ocfToNetIncome: {
          value: ocfToNetIncome,
          unit: 'x',
          benchmark: '>= 1.0x indicates earnings backed by actual cash',
          formula: 'Cash Flow from Operations / Net Income',
        },
        fcfMargin: {
          value: fcfMargin,
          unit: '%',
          formula: '(Free Cash Flow / Total Revenue) * 100',
        },
      },
    };
  });
};

/**
 * Compute Multi-Year Compound Annual Growth Rates (CAGR)
 */
export const computeMultiYearCAGR = (periods) => {
  if (!periods || periods.length < 2) return null;

  const first = periods[0].incomeStatement;
  const latest = periods[periods.length - 1].incomeStatement;
  const numYears = periods.length - 1;

  const revenueCAGR = calculateCAGR(first.revenue, latest.revenue, numYears);
  const netIncomeCAGR = calculateCAGR(first.netIncome, latest.netIncome, numYears);

  return {
    startYear: periods[0].fiscalYear,
    endYear: periods[periods.length - 1].fiscalYear,
    durationYears: numYears,
    revenueCAGR,
    netIncomeCAGR,
  };
};

/**
 * Compute Holistic Financial Health Score (0 - 100)
 */
export const computeHealthScore = (ratios) => {
  if (!ratios || ratios.length === 0) return { score: 50, grade: 'C', summary: 'Insufficient data' };

  const latest = ratios[ratios.length - 1];
  let score = 50; // Neutral baseline

  // Profitability component (+/- 25 pts)
  const netMargin = latest.profitability.netProfitMargin?.value || 0;
  const roe = latest.profitability.roe?.value || 0;
  if (netMargin > 20) score += 15;
  else if (netMargin > 10) score += 10;
  else if (netMargin > 0) score += 5;
  else score -= 15;

  if (roe > 20) score += 10;
  else if (roe > 10) score += 5;
  else if (roe < 0) score -= 10;

  // Growth component (+/- 15 pts)
  const revGrowth = latest.growth.revenueGrowthYoY?.value || 0;
  if (revGrowth > 15) score += 15;
  else if (revGrowth > 5) score += 10;
  else if (revGrowth < 0) score -= 10;

  // Solvency component (+/- 15 pts)
  const dte = latest.leverage.debtToEquity?.value;
  if (dte !== null) {
    if (dte < 0.5) score += 15;
    else if (dte < 1.0) score += 10;
    else if (dte > 2.0) score -= 15;
  }

  // Cash Quality component (+/- 15 pts)
  const cashQuality = latest.efficiency.ocfToNetIncome?.value;
  if (cashQuality !== null) {
    if (cashQuality >= 1.1) score += 15;
    else if (cashQuality >= 0.9) score += 10;
    else if (cashQuality < 0.6) score -= 15;
  }

  // Clamp 0 - 100
  score = Math.max(10, Math.min(99, Math.round(score)));

  let grade = 'C';
  let badgeColor = 'amber';
  if (score >= 85) {
    grade = 'A+';
    badgeColor = 'emerald';
  } else if (score >= 75) {
    grade = 'A';
    badgeColor = 'emerald';
  } else if (score >= 65) {
    grade = 'B+';
    badgeColor = 'blue';
  } else if (score >= 55) {
    grade = 'B';
    badgeColor = 'blue';
  } else if (score >= 45) {
    grade = 'C';
    badgeColor = 'amber';
  } else {
    grade = 'D';
    badgeColor = 'rose';
  }

  return {
    score,
    grade,
    badgeColor,
    metricsEvaluated: {
      netMargin,
      roe,
      revGrowth,
      debtToEquity: dte,
      cashQuality,
    },
  };
};


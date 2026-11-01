/**
 * Institutional Interactive DCF (Discounted Cash Flow) Valuation Engine
 * Supports multi-scenario modeling (Base, Bull, Bear),
 * 2D WACC vs. Terminal Growth sensitivity heatmaps, and full formula disclosure.
 */

export const calculateDCF = ({
  latestRevenue,
  latestCash = 0,
  latestDebt = 0,
  sharesOutstanding = 1000, // in millions, default fallback
  forecastYears = 5,
  revenueGrowthRate = 0.09, // 9%
  operatingMargin = 0.28,   // 28%
  taxRate = 0.18,           // 18%
  capexPercentOfSales = 0.05, // 5%
  nwcPercentOfSales = 0.02,   // 2%
  wacc = 0.09,              // 9.0% Discount Rate
  terminalGrowthRate = 0.025, // 2.5% Perpetual Growth
}) => {
  if (!latestRevenue || latestRevenue <= 0) {
    throw new Error('Latest revenue must be a positive number for DCF modeling.');
  }

  // Guard against WACC <= terminal growth rate (leads to infinite or negative denominator)
  const effectiveWacc = Math.max(wacc, terminalGrowthRate + 0.005);

  const projections = [];
  let currentRev = latestRevenue;
  let sumPvFcf = 0;

  for (let year = 1; year <= forecastYears; year++) {
    currentRev = currentRev * (1 + revenueGrowthRate);
    const ebit = currentRev * operatingMargin;
    const taxes = ebit * taxRate;
    const nopat = ebit - taxes;
    const capex = currentRev * capexPercentOfSales;
    const changeNwc = currentRev * nwcPercentOfSales;
    const fcf = nopat - capex - changeNwc;

    const discountFactor = Math.pow(1 + effectiveWacc, year);
    const pvFcf = fcf / discountFactor;
    sumPvFcf += pvFcf;

    projections.push({
      year: `Year ${year}`,
      projectedRevenue: Number(currentRev.toFixed(1)),
      projectedEbit: Number(ebit.toFixed(1)),
      nopat: Number(nopat.toFixed(1)),
      capex: Number(capex.toFixed(1)),
      changeInNwc: Number(changeNwc.toFixed(1)),
      unleveredFcf: Number(fcf.toFixed(1)),
      discountFactor: Number(discountFactor.toFixed(4)),
      pvFcf: Number(pvFcf.toFixed(1)),
    });
  }

  // Terminal Value (Gordon Growth Model)
  const finalYearFcf = projections[projections.length - 1].unleveredFcf;
  const terminalValue =
    (finalYearFcf * (1 + terminalGrowthRate)) / (effectiveWacc - terminalGrowthRate);
  const pvTerminalValue = terminalValue / Math.pow(1 + effectiveWacc, forecastYears);

  // Enterprise Value & Equity Value Bridge
  const enterpriseValue = sumPvFcf + pvTerminalValue;
  const netDebt = latestDebt - latestCash;
  const equityValue = enterpriseValue - netDebt; // Subtract net debt (or add net cash)
  const impliedSharePrice = sharesOutstanding > 0 ? equityValue / sharesOutstanding : null;

  return {
    assumptions: {
      latestRevenue,
      forecastYears,
      revenueGrowthRate: Number((revenueGrowthRate * 100).toFixed(2)),
      operatingMargin: Number((operatingMargin * 100).toFixed(2)),
      taxRate: Number((taxRate * 100).toFixed(2)),
      capexPercentOfSales: Number((capexPercentOfSales * 100).toFixed(2)),
      nwcPercentOfSales: Number((nwcPercentOfSales * 100).toFixed(2)),
      wacc: Number((effectiveWacc * 100).toFixed(2)),
      terminalGrowthRate: Number((terminalGrowthRate * 100).toFixed(2)),
      sharesOutstanding,
      latestCash,
      latestDebt,
      netDebt: Number(netDebt.toFixed(1)),
    },
    projections,
    valuationBridge: {
      sumPvOfFcf: Number(sumPvFcf.toFixed(1)),
      terminalValue: Number(terminalValue.toFixed(1)),
      pvOfTerminalValue: Number(pvTerminalValue.toFixed(1)),
      enterpriseValue: Number(enterpriseValue.toFixed(1)),
      cashAndEquivalents: Number(latestCash.toFixed(1)),
      totalDebt: Number(latestDebt.toFixed(1)),
      netDebt: Number(netDebt.toFixed(1)),
      equityValue: Number(equityValue.toFixed(1)),
      impliedSharePrice: impliedSharePrice ? Number(impliedSharePrice.toFixed(2)) : null,
      pvTerminalValuePercent: Number(((pvTerminalValue / enterpriseValue) * 100).toFixed(1)),
    },
    formulaGuide: {
      nopat: 'NOPAT = EBIT * (1 - Tax Rate)',
      unleveredFcf: 'Free Cash Flow = NOPAT - CapEx - Change in NWC',
      terminalValue: 'TV = (Final FCF * (1 + g)) / (WACC - g)',
      enterpriseValue: 'EV = Sum(PV of FCFs) + PV of Terminal Value',
      equityValue: 'Equity Value = Enterprise Value + Cash - Debt',
      impliedPerShare: 'Fair Value = Equity Value / Diluted Shares Outstanding',
    },
  };
};

/**
 * Generate Multi-Scenario DCF (Base, Bull, Bear)
 */
export const calculateScenarios = (baseParams) => {
  const base = calculateDCF(baseParams);

  // Bull Scenario: +3% Growth, +2% Margin, -0.5% WACC
  const bull = calculateDCF({
    ...baseParams,
    revenueGrowthRate: (baseParams.revenueGrowthRate || 0.09) + 0.03,
    operatingMargin: (baseParams.operatingMargin || 0.28) + 0.02,
    wacc: Math.max(0.065, (baseParams.wacc || 0.09) - 0.005),
    terminalGrowthRate: (baseParams.terminalGrowthRate || 0.025) + 0.005,
  });

  // Bear Scenario: -3% Growth, -3% Margin, +1.0% WACC
  const bear = calculateDCF({
    ...baseParams,
    revenueGrowthRate: Math.max(0.01, (baseParams.revenueGrowthRate || 0.09) - 0.03),
    operatingMargin: Math.max(0.1, (baseParams.operatingMargin || 0.28) - 0.03),
    wacc: (baseParams.wacc || 0.09) + 0.01,
    terminalGrowthRate: Math.max(0.01, (baseParams.terminalGrowthRate || 0.025) - 0.005),
  });

  return {
    base: {
      impliedSharePrice: base.valuationBridge.impliedSharePrice,
      enterpriseValue: base.valuationBridge.enterpriseValue,
      growthRate: base.assumptions.revenueGrowthRate,
      operatingMargin: base.assumptions.operatingMargin,
      wacc: base.assumptions.wacc,
    },
    bull: {
      impliedSharePrice: bull.valuationBridge.impliedSharePrice,
      enterpriseValue: bull.valuationBridge.enterpriseValue,
      growthRate: bull.assumptions.revenueGrowthRate,
      operatingMargin: bull.assumptions.operatingMargin,
      wacc: bull.assumptions.wacc,
    },
    bear: {
      impliedSharePrice: bear.valuationBridge.impliedSharePrice,
      enterpriseValue: bear.valuationBridge.enterpriseValue,
      growthRate: bear.assumptions.revenueGrowthRate,
      operatingMargin: bear.assumptions.operatingMargin,
      wacc: bear.assumptions.wacc,
    },
  };
};

/**
 * Generate 2D Sensitivity Matrix (WACC vs. Terminal Growth Rate)
 */
export const calculateSensitivityMatrix = (params) => {
  const centerWacc = params.wacc || 0.09;
  const centerTerminalGrowth = params.terminalGrowthRate || 0.025;

  const waccSteps = [
    centerWacc - 0.015,
    centerWacc - 0.0075,
    centerWacc,
    centerWacc + 0.0075,
    centerWacc + 0.015,
  ];

  const growthSteps = [
    centerTerminalGrowth - 0.01,
    centerTerminalGrowth - 0.005,
    centerTerminalGrowth,
    centerTerminalGrowth + 0.005,
    centerTerminalGrowth + 0.01,
  ];

  const matrix = waccSteps.map((w) => {
    const row = growthSteps.map((g) => {
      try {
        const result = calculateDCF({
          ...params,
          wacc: w,
          terminalGrowthRate: g,
        });
        return {
          wacc: Number((w * 100).toFixed(2)),
          growth: Number((g * 100).toFixed(2)),
          impliedSharePrice: result.valuationBridge.impliedSharePrice,
          enterpriseValue: result.valuationBridge.enterpriseValue,
        };
      } catch (e) {
        return {
          wacc: Number((w * 100).toFixed(2)),
          growth: Number((g * 100).toFixed(2)),
          impliedSharePrice: null,
          enterpriseValue: null,
        };
      }
    });
    return {
      waccPercent: Number((w * 100).toFixed(2)),
      values: row,
    };
  });

  return {
    waccHeaders: waccSteps.map((w) => Number((w * 100).toFixed(2))),
    growthHeaders: growthSteps.map((g) => Number((g * 100).toFixed(2))),
    matrix,
  };
};


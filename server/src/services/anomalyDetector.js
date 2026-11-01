/**
 * Forensic Financial Risk & Red Flag Anomaly Engine
 * Runs 7 institutional automated audits across multi-year financial statements.
 * Flags are treated as analytical signals for investigation, never proof of wrongdoing.
 */

export const detectFinancialAnomalies = (periods, ratios) => {
  if (!periods || periods.length < 2) {
    return {
      auditTimestamp: new Date().toISOString(),
      overallRiskScore: 0,
      riskLevel: 'Low',
      summary: 'Insufficient multi-year filing history to run comparative forensic audits.',
      flags: [],
    };
  }

  const flags = [];
  const latestPeriod = periods[periods.length - 1];
  const priorPeriod = periods[periods.length - 2];

  const latestRatios = ratios && ratios.length > 0 ? ratios[ratios.length - 1] : null;
  const priorRatios = ratios && ratios.length > 1 ? ratios[ratios.length - 2] : null;

  const latestIs = latestPeriod.incomeStatement || {};
  const priorIs = priorPeriod.incomeStatement || {};
  const latestBs = latestPeriod.balanceSheet || {};
  const priorBs = priorPeriod.balanceSheet || {};
  const latestCf = latestPeriod.cashFlow || {};
  const priorCf = priorPeriod.cashFlow || {};

  // 1. Audit #1: Revenue Rising while Operating Cash Flow Declines (Cash Flow Divergence)
  if (latestIs.revenue && priorIs.revenue && latestCf.operatingCashFlow !== undefined && priorCf.operatingCashFlow !== undefined) {
    const revGrowth = ((latestIs.revenue - priorIs.revenue) / priorIs.revenue) * 100;
    const ocfGrowth = ((latestCf.operatingCashFlow - priorCf.operatingCashFlow) / Math.abs(priorCf.operatingCashFlow || 1)) * 100;

    if (revGrowth > 5 && ocfGrowth < -5) {
      flags.push({
        id: 'ocf_divergence',
        title: 'Operating Cash Flow Divergence',
        severity: 'Critical',
        category: 'Earnings Quality',
        status: 'Triggered',
        periodsCompared: `${priorPeriod.period} vs ${latestPeriod.period}`,
        metrics: {
          revenueGrowth: `${revGrowth.toFixed(1)}%`,
          operatingCashFlowGrowth: `${ocfGrowth.toFixed(1)}%`,
          operatingCashFlowLatest: latestCf.operatingCashFlow,
          revenueLatest: latestIs.revenue,
        },
        formula: 'Revenue_Growth > +5% AND OCF_Growth < -5%',
        explanation: `Revenue expanded by ${revGrowth.toFixed(1)}% while Operating Cash Flow contracted by ${Math.abs(ocfGrowth).toFixed(1)}%. This divergence may indicate aggressive revenue recognition, growing uncollected receivables, or working capital drag.`,
      });
    } else {
      flags.push({
        id: 'ocf_divergence',
        title: 'Operating Cash Flow Alignment',
        severity: 'Low',
        category: 'Earnings Quality',
        status: 'Pass',
        periodsCompared: `${priorPeriod.period} vs ${latestPeriod.period}`,
        metrics: {
          revenueGrowth: `${revGrowth.toFixed(1)}%`,
          operatingCashFlowGrowth: `${ocfGrowth.toFixed(1)}%`,
        },
        formula: 'Revenue_Growth vs OCF_Growth',
        explanation: 'Operating cash flow growth is in healthy alignment with reported top-line revenue expansion.',
      });
    }
  }

  // 2. Audit #2: Margin Deterioration / Severe Compression
  if (latestRatios && priorRatios) {
    const latestNetMargin = latestRatios.profitability.netProfitMargin?.value;
    const priorNetMargin = priorRatios.profitability.netProfitMargin?.value;
    const latestOpMargin = latestRatios.profitability.operatingMargin?.value;
    const priorOpMargin = priorRatios.profitability.operatingMargin?.value;

    if (latestNetMargin !== null && priorNetMargin !== null) {
      const marginDelta = latestNetMargin - priorNetMargin;
      if (marginDelta < -2.5) {
        flags.push({
          id: 'margin_compression',
          title: 'Net Margin Deterioration',
          severity: marginDelta < -5 ? 'Critical' : 'Medium',
          category: 'Profitability',
          status: 'Triggered',
          periodsCompared: `${priorPeriod.period} (${priorNetMargin}%) vs ${latestPeriod.period} (${latestNetMargin}%)`,
          metrics: {
            latestNetMargin: `${latestNetMargin}%`,
            priorNetMargin: `${priorNetMargin}%`,
            marginChangeBasisPoints: `${(marginDelta * 100).toFixed(0)} bps`,
          },
          formula: 'NetMargin_t - NetMargin_{t-1} < -250 bps',
          explanation: `Net profit margin contracted by ${Math.abs(marginDelta).toFixed(1)} percentage points YoY, reflecting pricing pressure, cost inflation, or higher operating overhead.`,
        });
      } else {
        flags.push({
          id: 'margin_compression',
          title: 'Profit Margin Stability',
          severity: 'Low',
          category: 'Profitability',
          status: 'Pass',
          periodsCompared: `${priorPeriod.period} vs ${latestPeriod.period}`,
          metrics: {
            latestNetMargin: `${latestNetMargin}%`,
            priorNetMargin: `${priorNetMargin}%`,
          },
          formula: 'NetMargin YoY delta >= -2.5%',
          explanation: 'Profit margins remain robust or expanding within acceptable operational bounds.',
        });
      }
    }
  }

  // 3. Audit #3: Rapid Long-Term Debt Growth
  if (latestBs.longTermDebt !== undefined && priorBs.longTermDebt !== undefined) {
    const priorDebt = priorBs.longTermDebt || 0;
    const latestDebt = latestBs.longTermDebt || 0;
    if (priorDebt > 0) {
      const debtGrowth = ((latestDebt - priorDebt) / priorDebt) * 100;
      if (debtGrowth > 30 && latestDebt > (latestBs.stockholdersEquity || 1) * 0.5) {
        flags.push({
          id: 'debt_surge',
          title: 'Rapid Debt Expansion',
          severity: debtGrowth > 50 ? 'Critical' : 'Medium',
          category: 'Solvency & Leverage',
          status: 'Triggered',
          periodsCompared: `${priorPeriod.period} vs ${latestPeriod.period}`,
          metrics: {
            priorDebt,
            latestDebt,
            debtGrowthRate: `${debtGrowth.toFixed(1)}%`,
          },
          formula: 'Debt_Growth > 30% AND Debt > 0.5 * Equity',
          explanation: `Long-term obligations surged by ${debtGrowth.toFixed(1)}% in a single fiscal year. Rapid leveraging increases fixed interest burdens and default risk during macroeconomic downturns.`,
        });
      } else {
        flags.push({
          id: 'debt_surge',
          title: 'Prudent Balance Sheet Leverage',
          severity: 'Low',
          category: 'Solvency & Leverage',
          status: 'Pass',
          periodsCompared: `${priorPeriod.period} vs ${latestPeriod.period}`,
          metrics: {
            latestDebt,
            priorDebt,
          },
          formula: 'Debt Growth <= 30%',
          explanation: 'Debt levels have been managed prudently without alarming YoY spikes.',
        });
      }
    }
  }

  // 4. Audit #4: Repeated Negative Free Cash Flow
  const negativeFcfYears = periods.filter(
    (p) => p.cashFlow && p.cashFlow.freeCashFlow !== null && p.cashFlow.freeCashFlow < 0
  );
  if (negativeFcfYears.length >= 2) {
    flags.push({
      id: 'negative_fcf_burn',
      title: 'Structural Free Cash Flow Deficit',
      severity: 'Critical',
      category: 'Cash Generation',
      status: 'Triggered',
      periodsCompared: `Multi-year audit (${negativeFcfYears.length} periods negative)`,
      metrics: {
        deficitPeriods: negativeFcfYears.map((p) => p.period).join(', '),
        latestFreeCashFlow: latestCf.freeCashFlow,
      },
      formula: 'Count(FCF < 0) >= 2 in sample window',
      explanation: `The company recorded negative Free Cash Flow in ${negativeFcfYears.length} reporting periods, indicating heavy external capital reliance to fund operations and capital expenditures.`,
    });
  } else {
    flags.push({
      id: 'negative_fcf_burn',
      title: 'Self-Sustaining Cash Generation',
      severity: 'Low',
      category: 'Cash Generation',
      status: 'Pass',
      periodsCompared: 'Multi-year track record',
      metrics: {
        latestFreeCashFlow: latestCf.freeCashFlow,
      },
      formula: 'Count(FCF < 0) < 2',
      explanation: 'The enterprise consistently generates positive organic Free Cash Flow to fund dividends, buybacks, or debt retirement.',
    });
  }

  // 5. Audit #5: Working Capital Deficit / Negative Working Capital
  const currentRatio = latestRatios?.liquidity?.currentRatio?.value;
  if (currentRatio !== null && currentRatio !== undefined && currentRatio < 0.9) {
    flags.push({
      id: 'working_capital_deficit',
      title: 'Current Liquidity Compression',
      severity: currentRatio < 0.7 ? 'Critical' : 'Medium',
      category: 'Liquidity',
      status: 'Triggered',
      periodsCompared: `${latestPeriod.period}`,
      metrics: {
        currentRatio: `${currentRatio}x`,
        currentAssets: latestBs.currentAssets,
        currentLiabilities: latestBs.currentLiabilities,
      },
      formula: 'Current Ratio < 0.9x',
      explanation: `Current assets do not fully cover short-term liabilities (Current Ratio is ${currentRatio}x). Note: In high-cash-turnover businesses (e.g. Apple or supermarkets), negative working capital can reflect negative cash conversion cycles rather than insolvency.`,
    });
  } else {
    flags.push({
      id: 'working_capital_deficit',
      title: 'Adequate Short-Term Solvency',
      severity: 'Low',
      category: 'Liquidity',
      status: 'Pass',
      periodsCompared: `${latestPeriod.period}`,
      metrics: {
        currentRatio: currentRatio !== null ? `${currentRatio}x` : 'N/A',
      },
      formula: 'Current Ratio >= 0.9x',
      explanation: 'Short-term obligations are comfortably backed by liquid current assets.',
    });
  }

  // 6. Audit #6: High Financial Leverage (Debt-to-Equity > 2.5x)
  const dte = latestRatios?.leverage?.debtToEquity?.value;
  if (dte !== null && dte !== undefined && dte > 2.5) {
    flags.push({
      id: 'high_leverage',
      title: 'Elevated Financial Leverage',
      severity: 'Medium',
      category: 'Solvency & Capital Structure',
      status: 'Triggered',
      periodsCompared: `${latestPeriod.period}`,
      metrics: {
        debtToEquityRatio: `${dte}x`,
      },
      formula: 'Debt-to-Equity > 2.5x',
      explanation: `Long-term debt exceeds stockholders equity by ${dte}x, indicating an aggressive debt-financed capital structure.`,
    });
  }

  // 7. Audit #7: Low Cash Conversion Quality (OCF / Net Income < 0.75x)
  const cashQuality = latestRatios?.efficiency?.ocfToNetIncome?.value;
  if (cashQuality !== null && cashQuality !== undefined && cashQuality < 0.75 && (latestIs.netIncome || 0) > 0) {
    flags.push({
      id: 'poor_cash_conversion',
      title: 'Sub-Optimal Cash Earnings Conversion',
      severity: 'Medium',
      category: 'Earnings Quality',
      status: 'Triggered',
      periodsCompared: `${latestPeriod.period}`,
      metrics: {
        operatingCashFlow: latestCf.operatingCashFlow,
        netIncome: latestIs.netIncome,
        conversionRatio: `${cashQuality}x`,
      },
      formula: 'OCF / Net Income < 0.75x',
      explanation: `Operating Cash Flow converted only ${Number((cashQuality * 100).toFixed(0))}% of reported Net Income into realized cash, signaling potential accrual build-up.`,
    });
  }

  // Compute composite risk score
  const triggeredCount = flags.filter((f) => f.status === 'Triggered').length;
  const criticalCount = flags.filter((f) => f.status === 'Triggered' && f.severity === 'Critical').length;

  let riskLevel = 'Low';
  let riskBadgeColor = 'emerald';
  let overallRiskScore = Math.min(100, triggeredCount * 18 + criticalCount * 15);

  if (overallRiskScore >= 60 || criticalCount >= 2) {
    riskLevel = 'High';
    riskBadgeColor = 'rose';
  } else if (overallRiskScore >= 30 || criticalCount >= 1) {
    riskLevel = 'Moderate';
    riskBadgeColor = 'amber';
  }

  return {
    auditTimestamp: new Date().toISOString(),
    overallRiskScore,
    riskLevel,
    riskBadgeColor,
    triggeredCount,
    totalAudits: flags.length,
    summary:
      triggeredCount === 0
        ? 'All 7 forensic accounting audit checks passed cleanly with no material divergence detected.'
        : `${triggeredCount} audit signal(s) triggered out of ${flags.length} checks (${criticalCount} Critical). Review the specific metrics and comparisons below.`,
    flags,
  };
};


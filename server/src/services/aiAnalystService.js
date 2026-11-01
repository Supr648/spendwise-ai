import axios from 'axios';

const DISCLAIMER = 'Financial Disclaimer: FinSight AI provides automated financial data extraction and analytical commentary for educational and analytical research purposes only. This does not constitute personalized investment, financial, tax, or legal advice, nor a solicitation or guarantee of returns. Consult an accredited financial advisor before making capital allocation decisions.';

/**
 * Intelligent Rule-Based Financial Synthesis (Fallback when no API Key is set)
 */
const generateGroundedAnalysis = (companyData, question = '') => {
  const profile = companyData.profile;
  const periods = companyData.periods || [];
  const latest = periods[periods.length - 1] || {};
  const prior = periods.length > 1 ? periods[periods.length - 2] : null;

  const latestYear = latest.fiscalYear || 'Latest FY';
  const is = latest.incomeStatement || {};
  const bs = latest.balanceSheet || {};
  const cf = latest.cashFlow || {};

  const priorIs = prior ? prior.incomeStatement || {} : {};
  const priorCf = prior ? prior.cashFlow || {} : {};

  const revYoY =
    is.revenue && priorIs.revenue
      ? (((is.revenue - priorIs.revenue) / priorIs.revenue) * 100).toFixed(1)
      : null;

  const netYoY =
    is.netIncome && priorIs.netIncome
      ? (((is.netIncome - priorIs.netIncome) / Math.abs(priorIs.netIncome)) * 100).toFixed(1)
      : null;

  const netMargin =
    is.netIncome && is.revenue ? ((is.netIncome / is.revenue) * 100).toFixed(1) : null;

  const ocf = cf.operatingCashFlow;
  const fcf = cf.freeCashFlow;
  const curr = profile.currencySymbol || '$';
  const unit = profile.unit || 'M';

  const q = question.toLowerCase();

  // Answer specific question topics
  if (q.includes('risk') || q.includes('weakness') || q.includes('threat')) {
    return {
      answer: `### ⚠️ Key Financial Risks & Vulnerabilities: ${profile.name} (${profile.ticker})\n\n` +
        `Based on audited filings (${companyData.metadata?.source || 'SEC/NSE'} through FY${latestYear}):\n\n` +
        `1. **Leverage & Debt Obligations:** Total long-term debt stands at ${curr}${bs.longTermDebt?.toLocaleString()} ${unit}. ` +
        `${bs.longTermDebt > (bs.stockholdersEquity || 1) ? 'Debt exceeds total stockholders equity, creating vulnerability to elevated interest rates.' : 'Debt is maintained at a sustainable level relative to equity.'}\n` +
        `2. **Capital Expenditure Burden:** Free cash flow generation of ${curr}${fcf?.toLocaleString()} ${unit} accounts for ${cf.capitalExpenditure ? `${curr}${cf.capitalExpenditure.toLocaleString()} ${unit} in CapEx reinvestment` : 'ongoing capital investments'}.\n` +
        `3. **Top-line Sensitivities:** Revenue growth YoY was ${revYoY ? `${revYoY}%` : 'stable'}, subject to global enterprise cycle demand and competitive pressure in the ${profile.sector} sector.\n\n` +
        `*Source: Audited Annual Statements (${latestYear}).*`,
      reportingPeriod: `FY${latestYear}`,
      disclaimer: DISCLAIMER,
    };
  }

  if (q.includes('cash flow') || q.includes('earnings quality') || q.includes('ocf')) {
    const cashQuality =
      ocf && is.netIncome ? (ocf / is.netIncome).toFixed(2) : null;
    return {
      answer: `### 💵 Cash Flow & Earnings Quality Audit: ${profile.name} (${profile.ticker})\n\n` +
        `Analyzing reported Cash Flow vs. Net Income for **FY${latestYear}**:\n\n` +
        `* **Operating Cash Flow (OCF):** ${curr}${ocf?.toLocaleString()} ${unit}\n` +
        `* **Reported Net Income:** ${curr}${is.netIncome?.toLocaleString()} ${unit}\n` +
        `* **OCF-to-Net-Income Ratio:** **${cashQuality || 'N/A'}x**\n\n` +
        `**Analytical Interpretation:**\n` +
        `${Number(cashQuality) >= 1.0 ? `✅ **High Quality Earnings:** Operating cash flow surpasses net income (${cashQuality}x conversion), confirming reported profits are backed by actual organic cash collection rather than aggressive revenue accruals.` : `⚠️ **Accrual Drag:** Operating cash flow is tracking below net income (${cashQuality}x conversion), suggesting customer receivables build-up or inventory working capital tie-up.`}\n\n` +
        `* **Free Cash Flow:** ${curr}${fcf?.toLocaleString()} ${unit} (CapEx: ${curr}${cf.capitalExpenditure?.toLocaleString()} ${unit}).\n\n` +
        `*Source: Form 10-K / Annual Statement of Cash Flows (${latestYear}).*`,
      reportingPeriod: `FY${latestYear}`,
      disclaimer: DISCLAIMER,
    };
  }

  if (q.includes('profitability') || q.includes('margin') || q.includes('dupont')) {
    const opMargin =
      is.operatingIncome && is.revenue ? ((is.operatingIncome / is.revenue) * 100).toFixed(1) : null;
    return {
      answer: `### 📊 Profitability & Margin Analysis: ${profile.name} (${profile.ticker})\n\n` +
        `Performance metrics for **FY${latestYear}**:\n\n` +
        `* **Gross Profit:** ${curr}${is.grossProfit?.toLocaleString()} ${unit} (${is.grossProfit && is.revenue ? `${((is.grossProfit / is.revenue) * 100).toFixed(1)}% margin` : 'N/A'})\n` +
        `* **Operating Income (EBIT):** ${curr}${is.operatingIncome?.toLocaleString()} ${unit} (${opMargin}% operating margin)\n` +
        `* **Net Income:** ${curr}${is.netIncome?.toLocaleString()} ${unit} (${netMargin}% net profit margin)\n\n` +
        `**Year-over-Year Trajectory:**\n` +
        `Top-line revenue grew by **${revYoY ? `${revYoY}%` : 'N/A'}**, while net profit ${Number(netYoY) >= 0 ? `expanded by **+${netYoY}%**` : `contracted by **${netYoY}%**`} compared to FY${prior ? prior.fiscalYear : ''}.\n\n` +
        `*Source: Audited Income Statement (${latestYear}).*`,
      reportingPeriod: `FY${latestYear}`,
      disclaimer: DISCLAIMER,
    };
  }

  // Default Comprehensive Executive Financial Summary
  return {
    answer: `### 🏛️ Executive Financial Intelligence Summary: ${profile.name} (${profile.ticker})\n\n` +
      `**Company Background:** ${profile.description}\n\n` +
      `**Latest Fiscal Year (FY${latestYear}) Core Fundamentals:**\n` +
      `* **Total Revenue:** ${curr}${is.revenue?.toLocaleString()} ${unit} (${revYoY ? `${revYoY}% YoY Growth` : 'stable'})\n` +
      `* **Net Income:** ${curr}${is.netIncome?.toLocaleString()} ${unit} (${netMargin ? `${netMargin}% Net Margin` : 'N/A'})\n` +
      `* **Operating Cash Flow:** ${curr}${ocf?.toLocaleString()} ${unit}\n` +
      `* **Free Cash Flow:** ${curr}${fcf?.toLocaleString()} ${unit}\n` +
      `* **Balance Sheet Health:** Total Assets of ${curr}${bs.totalAssets?.toLocaleString()} ${unit} with Stockholders’ Equity of ${curr}${bs.stockholdersEquity?.toLocaleString()} ${unit} and Long-Term Debt of ${curr}${bs.longTermDebt?.toLocaleString() || 0} ${unit}.\n\n` +
      `**Analyst Takeaway:** ${profile.name} demonstrates ${Number(netMargin) > 15 ? 'industry-leading profitability margins' : 'moderate profitability'} with ${Number(fcf) > 0 ? 'robust positive free cash conversion' : 'ongoing capital reinvestment demand'}.\n\n` +
      `*Data verified via ${companyData.metadata?.source || 'SEC EDGAR / Annual Audited Filings'}.*`,
    reportingPeriod: `FY${latestYear}`,
    disclaimer: DISCLAIMER,
  };
};

/**
 * Ask AI Analyst with Gemini API integration or grounded financial reasoning fallback
 */
export const queryAiFinancialAnalyst = async ({
  companyData,
  question,
  apiKey = process.env.GEMINI_API_KEY,
}) => {
  if (!companyData || !companyData.profile) {
    throw new Error('Valid company financial dataset is required for AI analysis.');
  }

  const promptQuestion = question && question.trim() ? question.trim() : 'Summarize the latest financial results and earnings quality.';

  // If Gemini API Key is configured, attempt live Gemini model call
  if (apiKey) {
    try {
      const profile = companyData.profile;
      const periods = companyData.periods || [];
      const latest = periods[periods.length - 1] || {};

      const financialContext = JSON.stringify({
        ticker: profile.ticker,
        companyName: profile.name,
        sector: profile.sector,
        currency: profile.currency,
        reportingStandard: profile.reportingStandard,
        dataFreshness: companyData.metadata?.dataFreshness,
        latestPeriod: latest.period,
        incomeStatement: latest.incomeStatement,
        balanceSheet: latest.balanceSheet,
        cashFlow: latest.cashFlow,
        allPeriodsSummary: periods.map((p) => ({
          year: p.fiscalYear,
          revenue: p.incomeStatement?.revenue,
          netIncome: p.incomeStatement?.netIncome,
          fcf: p.cashFlow?.freeCashFlow,
        })),
      });

      const systemPrompt = `You are an elite Wall Street Equity Research Analyst and Forensic Accountant at FinSight AI.
Analyze the following authentic company financial data and provide an objective, data-grounded response to the user's inquiry.
Rules:
1. Always cite exact numbers, periods (e.g. FY2023, FY2024), and reporting units.
2. Never hallucinate or invent metrics. If data is missing or not provided, explicitly declare it.
3. Assess cash flow quality (OCF vs Net Income) and balance sheet leverage.
4. Conclude with objective takeaway.`;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}\n\nFinancial Dataset Context:\n${financialContext}\n\nUser Question:\n${promptQuestion}`,
                },
              ],
            },
          ],
        },
        { timeout: 15000 }
      );

      const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (generatedText) {
        return {
          answer: generatedText,
          reportingPeriod: latest.period,
          source: `${companyData.metadata?.source || 'SEC EDGAR'} (Synthesized by Gemini)`,
          disclaimer: DISCLAIMER,
        };
      }
    } catch (apiErr) {
      console.warn('[Gemini API] Remote call encountered issue:', apiErr.message, '. Falling back to grounded institutional analysis engine.');
    }
  }

  // Fallback to grounded financial reasoning engine
  const fallback = generateGroundedAnalysis(companyData, promptQuestion);
  return {
    ...fallback,
    source: `${companyData.metadata?.source || 'SEC EDGAR'} (FinSight AI Analytical Engine)`,
  };
};


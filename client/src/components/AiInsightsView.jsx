import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { api } from '../services/api';
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Calendar,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

export const AiInsightsView = () => {
  const { dashboardData, formatCurrency } = useFinance();

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hello! I am **SpendWise AI**, your personal finance advisor and budget optimization coach.\n\nI analyze your actual recorded transactions, monthly category limits, and savings goals to give you objective, actionable financial insights.\n\nAsk me anything about your spending habits, budget overruns, or strategies to increase your savings!`,
      timestamp: 'Active Session',
      model: 'SpendWise AI',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const promptPresets = [
    'Summarize my spending patterns this month',
    'Explain my budget overruns and top expenses',
    'How can I improve my personal savings rate?',
    'Where did I spend the most money?',
    'Suggest realistic budget adjustments for next month',
    'Am I on track with my savings goals?',
  ];

  const handleAsk = async (questionText) => {
    const q = questionText || inputQuery;
    if (!q.trim()) return;

    const userMsg = { role: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsAsking(true);

    try {
      const res = await api.getAiInsights(q);
      const aiMsg = {
        role: 'assistant',
        text: res.insight || 'No analysis available for this inquiry.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: res.model || 'SpendWise Engine',
        isConfigured: res.isConfigured,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `⚠️ Query encountered an error: ${err.message}. Please check server connectivity.`,
          timestamp: 'Error',
          model: 'Error Log',
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="fin-card p-6 flex flex-col h-[750px]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              SpendWise AI Financial Advisor
              <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalized budget guidance grounded in your authenticated bank and cash ledgers
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
          <Lightbulb className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Grounded in Real User Data</span>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="py-3 border-b border-slate-100 dark:border-slate-800/80">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
          Recommended Advisor Inquiries:
        </span>
        <div className="flex flex-wrap gap-2">
          {promptPresets.map((preset, i) => (
            <button
              key={i}
              onClick={() => handleAsk(preset)}
              disabled={isAsking}
              className="px-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl transition disabled:opacity-50 text-left shadow-sm active:scale-95"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return (
            <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-3xl rounded-2xl p-4 text-xs leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold">
                        <Bot className="w-3.5 h-3.5 mr-1" /> {m.model || 'SpendWise Advisor'}
                      </span>
                      <span>•</span>
                      <span>{m.timestamp}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(m.text, idx)}
                      className="p-1 hover:text-slate-900 dark:hover:text-white rounded-lg transition"
                      title="Copy response"
                    >
                      {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}

                <div className="whitespace-pre-line font-sans">
                  {m.text}
                </div>
              </div>
            </div>
          );
        })}

        {isAsking && (
          <div className="flex justify-start">
            <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs text-slate-600 dark:text-slate-400 flex items-center space-x-3 shadow-sm">
              <RefreshCw className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin" />
              <span>Analyzing your personal spending habits and computing budget benchmarks...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            placeholder="Ask anything about your personal expenses, savings rate, or budget..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isAsking}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-xl pl-4 pr-12 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition shadow-sm"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isAsking}
            className="absolute right-2 p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg transition active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center mt-2.5">
          SpendWise AI runs strictly on your private records. Data is never shared or used for ad targeting.
        </p>
      </div>
    </div>
  );
};

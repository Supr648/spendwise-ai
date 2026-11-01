import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { api } from '../services/api';
import {
  Target,
  Plus,
  TrendingUp,
  CheckCircle2,
  Calendar,
  PiggyBank,
  Trash2,
  X,
  Sparkles,
} from 'lucide-react';

export const GoalsView = () => {
  const {
    goalsData,
    refreshGoals,
    refreshDashboard,
    formatCurrency,
    isAddGoalModalOpen,
    setIsAddGoalModalOpen,
    isContribModalOpen,
    setIsContribModalOpen,
    targetGoal,
    setTargetGoal,
  } = useFinance();

  // New Goal form
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [goalCategory, setGoalCategory] = useState('Emergency');
  const [goalNotes, setGoalNotes] = useState('');
  const [submittingGoal, setSubmittingGoal] = useState(false);

  // Contribution form
  const [contribAmount, setContribAmount] = useState('');
  const [contribNotes, setContribNotes] = useState('');
  const [submittingContrib, setSubmittingContrib] = useState(false);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!goalName.trim() || !targetAmount) return;
    setSubmittingGoal(true);
    try {
      await api.createGoal({
        name: goalName.trim(),
        targetAmount: parseFloat(targetAmount),
        initialAmount: parseFloat(initialAmount) || 0,
        targetDate,
        category: goalCategory,
        notes: goalNotes,
      });
      setIsAddGoalModalOpen(false);
      setGoalName('');
      setTargetAmount('');
      setInitialAmount('');
      setTargetDate('');
      setGoalNotes('');
      refreshGoals();
      refreshDashboard();
    } catch (err) {
      alert(`Error creating savings goal: ${err.message}`);
    } finally {
      setSubmittingGoal(false);
    }
  };

  const handleAddContribution = async (e) => {
    e.preventDefault();
    if (!targetGoal || !contribAmount || parseFloat(contribAmount) <= 0) return;
    setSubmittingContrib(true);
    try {
      await api.addGoalContribution(targetGoal.id, {
        amount: parseFloat(contribAmount),
        notes: contribNotes,
      });
      setIsContribModalOpen(false);
      setContribAmount('');
      setContribNotes('');
      setTargetGoal(null);
      refreshGoals();
      refreshDashboard();
    } catch (err) {
      alert(`Error adding contribution: ${err.message}`);
    } finally {
      setSubmittingContrib(false);
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await api.deleteGoal(id);
      refreshGoals();
      refreshDashboard();
    } catch (err) {
      alert(`Error deleting goal: ${err.message}`);
    }
  };

  const goals = goalsData?.goals || [];
  const summary = goalsData?.summary || {};

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="fin-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Savings Goals &amp; Milestone Tracking</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Build emergency reserves, plan vacations, and fund major milestones with automated completion forecasting.
            </p>
          </div>

          <button
            onClick={() => setIsAddGoalModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition self-start md:self-auto shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Goal</span>
          </button>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Total Target Pool</span>
            <span className="text-xl font-mono font-bold text-slate-900 dark:text-white block">
              {formatCurrency(summary.totalTarget)}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Across {goals.length} milestones</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Total Saved So Far</span>
            <span className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
              {formatCurrency(summary.totalSaved)}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">{summary.overallProgress}% of target funded</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Remaining to Target</span>
            <span className="text-xl font-mono font-bold text-blue-600 dark:text-blue-400 block">
              {formatCurrency(summary.totalRemaining)}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Total shortfall</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Overall Progress</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-xl font-mono font-bold text-purple-600 dark:text-purple-400">
                {summary.overallProgress}%
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">funded</span>
            </div>
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((g) => {
          const isComplete = g.remainingAmount === 0;

          return (
            <div
              key={g.id}
              className={`fin-card fin-card-hover p-6 flex flex-col justify-between border-t-4 transition ${
                isComplete
                  ? 'border-t-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : 'border-t-blue-500 bg-white dark:bg-slate-900/70'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {g.name}
                      {isComplete && <CheckCircle2 className="w-4 h-4 text-emerald-500 inline" />}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      Category: {g.category || 'General'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteGoal(g.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Delete Goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 my-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700 dark:text-slate-300 font-medium font-mono">
                      Saved: {formatCurrency(g.currentAmount)}
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      Target: {formatCurrency(g.targetAmount)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isComplete ? 'bg-emerald-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(100, g.progressPercentage)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                    <span>{g.progressPercentage}% achieved</span>
                    <span>Shortfall: {formatCurrency(g.remainingAmount)}</span>
                  </div>
                </div>

                {/* Target Date & Forecast */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-1 mb-4">
                  {g.targetDate && (
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5" /> Target Date:
                      </span>
                      <span className="font-mono">{g.targetDate}</span>
                    </div>
                  )}
                  {g.velocityEstimateMonths && (
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span className="text-slate-500 dark:text-slate-400">Estimated Completion:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        ~{g.velocityEstimateMonths} month(s)
                      </span>
                    </div>
                  )}
                  {g.notes && (
                    <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200 dark:border-slate-800/80">
                      "{g.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Action Button: Add Contribution */}
              <button
                onClick={() => {
                  setTargetGoal(g);
                  setIsContribModalOpen(true);
                }}
                className={`w-full py-2 px-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95 ${
                  isComplete
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Goal Contribution</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Create Goal Modal */}
      {isAddGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="fin-card w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Create Savings Milestone
              </h3>
              <button onClick={() => setIsAddGoalModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 6-Month Emergency Fund"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Target Amount</label>
                  <input
                    type="number"
                    step="100"
                    required
                    placeholder="e.g. 300000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Starting Amount</label>
                  <input
                    type="number"
                    step="100"
                    placeholder="0"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Category</label>
                  <select
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Emergency">Emergency Fund</option>
                    <option value="Travel">Travel &amp; Vacation</option>
                    <option value="Investment">Investment Pool</option>
                    <option value="Vehicle">Vehicle / Auto</option>
                    <option value="Home">Home Downpayment</option>
                    <option value="Electronics">Tech &amp; Gadgets</option>
                    <option value="General">General Savings</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="Optional motivation or details"
                  value={goalNotes}
                  onChange={(e) => setGoalNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddGoalModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingGoal}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-95"
                >
                  {submittingGoal ? 'Saving...' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Contribution Modal */}
      {isContribModalOpen && targetGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="fin-card w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Add Contribution
              </h3>
              <button
                onClick={() => {
                  setIsContribModalOpen(false);
                  setTargetGoal(null);
                }}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Contributing towards: <strong className="text-slate-900 dark:text-white">{targetGoal.name}</strong>
            </p>

            <form onSubmit={handleAddContribution} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Contribution Amount ({formatCurrency(0).slice(0, 1)})
                </label>
                <input
                  type="number"
                  step="100"
                  required
                  placeholder="e.g. 5000"
                  value={contribAmount}
                  onChange={(e) => setContribAmount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Diwali bonus or monthly transfer"
                  value={contribNotes}
                  onChange={(e) => setContribNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsContribModalOpen(false);
                    setTargetGoal(null);
                  }}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingContrib}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-95"
                >
                  {submittingContrib ? 'Processing...' : 'Deposit Funds'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

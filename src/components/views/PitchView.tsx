import React from 'react';
import { ShieldCheck, Scale, SlidersHorizontal, Calendar, Smartphone, Share2, ArrowRight, Sparkles, CheckCircle2, Zap } from 'lucide-react';
import { useHouse } from '../../context/HouseContext';

export const PitchView: React.FC = () => {
  const { setActiveTab } = useHouse();

  const differentiators = [
    {
      title: 'Smart Pro-Rata Math Engine',
      description: 'Calculates exact share = (days stayed × weight) ÷ sum of all (days × weight). Supports room sizes, AC/heater hours, and appliance loads.',
      tab: 'breakdown',
      icon: Scale,
    },
    {
      title: 'What-If Interactive Sandbox',
      description: 'Drag move-out dates, appliance hours, or bills and watch shares update in real-time with visual delta indicators (+₹X / -₹Y).',
      tab: 'whatif',
      icon: SlidersHorizontal,
    },
    {
      title: 'Fairness Score & Discrepancy Index',
      description: 'Highlights the financial injustice of a naive 1/N equal split and quantifies exact savings prevented for departing roommates.',
      tab: 'dashboard',
      icon: ShieldCheck,
    },
    {
      title: 'Mid-Month Event Residency Timeline',
      description: 'Visual day-by-day Gantt timeline showing who lived in the flat on each date, overlap windows, and co-living density.',
      tab: 'timeline',
      icon: Calendar,
    },
    {
      title: 'Settle-Up & Instant Mock UPI Gateway',
      description: 'Greedy debt simplification minimizing transactions, paired with simulated 1-click UPI payments, QR codes, and confetti.',
      tab: 'settleup',
      icon: Smartphone,
    },
    {
      title: 'Group Chat Export & Clean PDF',
      description: 'One-click copy formatted WhatsApp summary with emojis and breakdown, plus print-ready receipt layouts.',
      tab: 'dashboard',
      icon: Share2,
    },
  ];

  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>EquiShare · The Pro-Rata Bill Splitter</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white text-balance leading-tight">
          Never let an unfair bill split break flatmate friendships again.
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          When flatmates move in or out mid-month, run ACs for different hours, or inhabit disparate room sizes, naive equal splits are deeply unfair. EquiShare turns complex pro-rata math into plain-language transparency.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 shadow-md transition-all"
          >
            <span>Explore Demo Apartment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('whatif')}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span>Test What-If Sliders</span>
          </button>
        </div>
      </div>

      {/* The Problem vs Solution Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="p-6 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
            The Naive Split Failure
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Divide Total by N Roommates
          </h3>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold shrink-0">✕</span>
              <span>Rahul moved out on Nov 14, yet gets billed for a full 30 days of rent and high-speed Wi-Fi.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold shrink-0">✕</span>
              <span>Ananya in a 120 sq ft room pays identical rent to Priya in a 220 sq ft master bedroom with ensuite.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold shrink-0">✕</span>
              <span>Silent resentment builds up over who ran the AC or whose heavy gaming rig spiked the power bill.</span>
            </li>
          </ul>
        </div>

        <div className="p-6 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            The EquiShare Pro-Rata Solution
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Day-Accurate Weighted Split
          </h3>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Exact calendar overlap calculations ensure zero charges for days outside residency.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Rent pro-rated by square footage; electricity pro-rated by appliance load and daily AC hours.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Plain-language "Why You Owe This" calculation cards eliminate every dispute.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Feature Showcase Grid */}
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Engineered for Fair Flat Living
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Built with production-grade craft and mathematics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {differentiators.map((diff, idx) => {
            const Icon = diff.icon;
            return (
              <div
                key={idx}
                onClick={() => setActiveTab(diff.tab as any)}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                    {diff.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {diff.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                  <span>Open View</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

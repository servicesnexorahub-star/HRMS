import { useState } from 'react';
import { PerformanceReview, Employee } from '../types';
import { Star, Award, Crosshair, Users } from 'lucide-react';

interface PerformanceManagementProps {
  reviews: PerformanceReview[];
  employees: Employee[];
  onCommitEvaluation: (reviewId: string, updatedReview: PerformanceReview) => void;
  currentActor: Employee;
}

export default function PerformanceManagement({ reviews, employees, onCommitEvaluation, currentActor }: PerformanceManagementProps) {
  const [selectedReviewId, setSelectedReviewId] = useState('');
  
  // Rating states for selected evaluation
  const [selfRating, setSelfRating] = useState<Record<string, number>>({});
  const [managerRating, setManagerRating] = useState<Record<string, number>>({});
  const [selfComments, setSelfComments] = useState('');
  const [managerFeedback, setManagerFeedback] = useState('');
  const [recommendation, setRecommendation] = useState<'None' | 'Promotion' | 'Increment' | 'Performance Plan'>('None');

  const activeReview = reviews.find(r => r.id === selectedReviewId);

  const handleReviewSelect = (reviewId: string) => {
    setSelectedReviewId(reviewId);
    const rev = reviews.find(r => r.id === reviewId);
    if (rev) {
      setSelfComments(rev.selfEvaluation || '');
      setManagerFeedback(rev.managerComments || '');
      setRecommendation(rev.recommendation || 'None');
      
      const selfRates: Record<string, number> = {};
      const managerRates: Record<string, number> = {};
      rev.kpis.forEach(k => {
        if (k.selfRating) selfRates[k.id] = k.selfRating;
        if (k.managerRating) managerRates[k.id] = k.managerRating;
      });
      setSelfRating(selfRates);
      setManagerRating(managerRates);
    }
  };

  const handleSaveEvaluation = () => {
    if (!activeReview) return;

    // Calculate aggregated overall score from weights
    let totalWeight = 0;
    let weightedScore = 0;

    const updatedKPIs = activeReview.kpis.map(k => {
      const sVal = selfRating[k.id] || k.selfRating || 3;
      const mVal = managerRating[k.id] || k.managerRating || 3;
      
      // manager score dictates real score
      weightedScore += (mVal * k.weight);
      totalWeight += k.weight;

      return {
        ...k,
        selfRating: sVal,
        managerRating: mVal
      };
    });

    const averageRating = totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 10) / 10 : 3.5;

    const updatedReview: PerformanceReview = {
      ...activeReview,
      status: 'Completed',
      kpis: updatedKPIs,
      selfEvaluation: selfComments,
      managerComments: managerFeedback,
      appraisalRating: averageRating,
      recommendation: recommendation,
    };

    onCommitEvaluation(activeReview.id, updatedReview);
    alert(`Appraisal review details committed successfully under audit code rev-${activeReview.id}`);
  };

  return (
    <div className="space-y-6" id="performance-management">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800/60">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white font-display">Performance Reviews & Appraisal recommendations</h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">Determine staff goals, manage weighted KPIs, capture 360 feedback reviews and authorize promotional tracks.</p>
        </div>
        <div className="flex items-center gap-1.5 self-start bg-emerald-500/10 border border-emerald-500/25 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-emerald-400 font-sans">
          <Award className="w-4 h-4 text-emerald-400" />
          Core Appraisals Cycle: Q2 FY26
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Active loops and review targets */}
        <div className="bg-[#111114] rounded-2xl border border-slate-800/50 shadow-md divide-y divide-slate-800/40 lg:col-span-1 overflow-hidden">
          <div className="p-4 bg-[#09090b]/45 border-b border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-widest">Evaluation Audit Pool</h4>
          </div>
          {reviews.map((rev) => (
            <div
              key={rev.id}
              onClick={() => handleReviewSelect(rev.id)}
              className={`p-4 transition-all hover:bg-[#09090b]/30 cursor-pointer ${selectedReviewId === rev.id ? 'bg-emerald-500/5 border-l-2 border-emerald-500' : ''}`}
            >
              <div className="flex justify-between items-start text-xs">
                <div>
                  <span className="block font-semibold text-white font-sans">{rev.employeeName}</span>
                  <span className="block text-[10px] text-slate-400 font-sans">Period: {rev.reviewPeriod}</span>
                </div>
                <span className={`px-2 py-0.5 text-[9px] rounded-md font-semibold ${
                  rev.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {rev.status}
                </span>
              </div>
              {rev.appraisalRating && (
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="flex text-amber-400 text-xs">★</span>
                  <span className="text-xs text-slate-300 font-semibold font-sans">Current Grade: {rev.appraisalRating} / 5</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Detailed KPI and Appraisal scoring workspace */}
        <div className="bg-[#111114] rounded-2xl border border-slate-800/50 shadow-md p-6 lg:col-span-2 space-y-6">
          {activeReview ? (
            <div className="space-y-6 text-xs text-slate-300">
              {/* Review target banner */}
              <div className="pb-4 border-b border-slate-800/60 flex justify-between items-start leading-none">
                <div>
                  <h3 className="text-sm font-bold text-white font-sans">{activeReview.employeeName}</h3>
                  <span className="text-[10px] text-slate-400 font-sans block mt-1.5">Direct workspace review and goal performance score sheets.</span>
                </div>
                <span className="text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2.5 py-1 rounded-md font-semibold">
                  Target ID: rev-{activeReview.id}
                </span>
              </div>

              {/* Targets and Goals tracker lists */}
              <div className="space-y-3">
                <span className="block text-[10px] uppercase font-mono text-slate-400 tracking-wider flex items-center gap-1.5 font-bold">
                  <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
                  Performance OKRs & Primary Milestones
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeReview.goals.map((g) => (
                    <div key={g.id} className="border border-slate-850 rounded-xl p-3.5 bg-[#09090b]/40 space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-slate-200 leading-normal block">{g.title}</span>
                        <span className={`inline-block text-[8px] px-1.5 py-0.5 rounded font-bold font-mono uppercase ${
                          g.status === 'Achieved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {g.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic KPI Grading weights */}
              <div className="space-y-4">
                <span className="block text-[10px] uppercase font-mono text-slate-400 tracking-wider flex items-center gap-1.5 font-bold">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  Weighted KPI Assessment Parameters
                </span>

                <div className="space-y-4 bg-[#09090b]/40 p-4 rounded-xl border border-slate-850">
                  {activeReview.kpis.map((kpi) => (
                    <div key={kpi.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-200">{kpi.title} <span className="text-[10px] text-emerald-400 font-mono font-semibold">({kpi.weight}% Weight)</span></span>
                        <div className="flex gap-4 font-mono text-[10px]">
                          <span>Self Score: <span className="font-bold text-slate-400">{selfRating[kpi.id] || kpi.selfRating || "--"}</span></span>
                          <span>Manager Score: <span className="font-bold text-emerald-400">{managerRating[kpi.id] || kpi.managerRating || "--"}</span></span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Employee Self Sliders */}
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500 uppercase font-mono block">Simulate Staff Rating (Self)</label>
                          <input
                            type="range"
                            min="1"
                            max="5"
                            step="1"
                            value={selfRating[kpi.id] || 3}
                            onChange={(e) => setSelfRating({ ...selfRating, [kpi.id]: parseInt(e.target.value) })}
                            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                          />
                        </div>

                        {/* Manager Sliders */}
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500 uppercase font-mono block font-bold text-emerald-400">Supervisor / HR Rating</label>
                          <input
                            type="range"
                            min="1"
                            max="5"
                            step="1"
                            value={managerRating[kpi.id] || 3}
                            disabled={currentActor.email === 'vikram.sharma@acme.com'} // vikram is engineer, can't grade managers rating on himself!
                            onChange={(e) => setManagerRating({ ...managerRating, [kpi.id]: parseInt(e.target.value) })}
                            className="w-full accent-emerald-500 disabled:opacity-40 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Written evaluations comments */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-slate-400">Employee Self Declarations</label>
                  <textarea
                    value={selfComments}
                    onChange={(e) => setSelfComments(e.target.value)}
                    rows={3}
                    className="w-full bg-[#09090b] border border-slate-800 rounded-lg p-3 placeholder-slate-600 focus:outline-hidden resize-none leading-relaxed text-slate-200 focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-emerald-400 font-bold">Manager Assessment feedback</label>
                  <textarea
                    value={managerFeedback}
                    disabled={currentActor.email === 'vikram.sharma@acme.com'} // vikram cannot write comment on managers thoughts
                    onChange={(e) => setManagerFeedback(e.target.value)}
                    rows={3}
                    className="w-full bg-[#09090b] border border-slate-800 rounded-lg p-3 placeholder-slate-600 disabled:opacity-50 focus:outline-hidden resize-none leading-relaxed text-slate-200 focus:border-emerald-500/50"
                  />
                </div>
              </div>

              {/* Promotion recommendations slab */}
              <div className="bg-[#09090b]/40 border border-slate-850 p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <span className="block text-[10px] uppercase font-mono text-emerald-400 font-semibold mb-1">Authorization promotion recommendation</span>
                  <p className="text-[10px] text-slate-500">Mark promotional tracking or fiscal salary hikes based on calculated scores.</p>
                </div>

                <select
                  value={recommendation}
                  disabled={currentActor.email === 'vikram.sharma@acme.com'}
                  onChange={(e) => setRecommendation(e.target.value as any)}
                  className="bg-[#09090b] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-sans focus:outline-hidden"
                >
                  <option value="None">None (Standard grade evaluation)</option>
                  <option value="Increment">Standard Salary Increment</option>
                  <option value="Promotion">Promotional Grade Track Upgrade</option>
                  <option value="Performance Plan">Structured PIP (Performance Plan)</option>
                </select>
              </div>

              {/* Actions */}
              <button
                onClick={handleSaveEvaluation}
                className="w-full bg-emerald-600 text-white hover:bg-emerald-500 text-xs font-semibold py-3 rounded-lg transition-all text-center cursor-pointer font-sans shadow-lg shadow-emerald-500/10"
              >
                Log Assessment Ratings and Close Appraisals loop
              </button>

            </div>
          ) : (
            <div className="text-center py-20 text-slate-500 font-sans">
              <Users className="w-12 h-12 text-slate-800 mx-auto mb-1.5" />
              <p className="font-semibold text-slate-400">Pick Appraisal card from list</p>
              <p className="text-[10px] text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">Select one of the assessment targets in the left sidebar directory index to begin weighted scoring calibration sessions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Send, Loader2, Share2, CheckCircle, Building2, Briefcase, GraduationCap, ClipboardCheck, Gauge, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SHARE_COMPANIES } from '../data/shareCompanies';

const initialFormData = {
  company: '',
  customCompany: '',
  role: '',
  batch: '2025',
  verdict: 'Selected',
  difficulty: 'Medium',
  content: ''
};

const ShareExperience = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);

  const companyOptions = useMemo(() => SHARE_COMPANIES, []);

  const batchOptions = useMemo(
    () => Array.from({ length: 12 }, (_, index) => `${2022 + index}`),
    []
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const userEmail = user.email;
      const finalCompany = formData.company === 'Other' ? formData.customCompany.trim() : formData.company;

      const { error } = await supabase
        .from('experiences')
        .insert([{
          company: finalCompany,
          role: formData.role,
          batch: formData.batch,
          verdict: formData.verdict,
          difficulty: formData.difficulty,
          content: formData.content,
          author_email: userEmail
        }]);

      if (error) throw error;

      setStep(2);
    } catch (err) {
      console.error(err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prep-hero-grid pt-24 pb-20 min-h-screen px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-cyan-100/70 via-indigo-100/35 to-transparent"></div>
      <div className="max-w-3xl mx-auto">
        {step === 1 ? (
          <div className="glass-panel mesh-card visible-card-border rounded-[2rem] p-8 shadow-xl border relative">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-white/85 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4 border visible-card-border shadow-sm">
                <Share2 className="w-4 h-4" />
                <span>Share Your Journey</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900">Experience Details</h2>
              <p className="text-gray-600 mt-3 text-base md:text-lg">
                Write your full experience and include the interview questions inside the text.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border visible-card-border bg-white/70 p-4">
                  <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                    <Building2 className="w-4 h-4 text-blue-600" /> Company
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-300/80 bg-white/90 p-3 outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value, customCompany: e.target.value === 'Other' ? formData.customCompany : '' })}
                  >
                    <option value="">Select company</option>
                    {companyOptions.map((company) => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
                </div>

                <div className="rounded-2xl border visible-card-border bg-white/70 p-4">
                  <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                    <Briefcase className="w-4 h-4 text-indigo-600" /> Role
                  </label>
                  <input
                    type="text"
                    placeholder="Role (e.g. SDE Intern)"
                    className="w-full rounded-xl border border-slate-300/80 bg-white/90 p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  />
                </div>
              </div>

              {formData.company === 'Other' && (
                <div className="rounded-2xl border visible-card-border bg-white/70 p-4">
                  <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                    <Building2 className="w-4 h-4 text-cyan-600" /> Write Company Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter company name"
                    className="w-full rounded-xl border border-slate-300/80 bg-white/90 p-3 outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                    value={formData.customCompany}
                    onChange={(e) => setFormData({ ...formData, customCompany: e.target.value })}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-2xl border visible-card-border bg-white/70 p-4">
                  <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                    <GraduationCap className="w-4 h-4 text-violet-600" /> Batch
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-300/80 bg-white/90 p-3 outline-none focus:ring-2 focus:ring-violet-500"
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  >
                    {batchOptions.map((batch) => (
                      <option key={batch} value={batch}>{batch}</option>
                    ))}
                  </select>
                </div>
                <div className="rounded-2xl border visible-card-border bg-white/70 p-4">
                  <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                    <ClipboardCheck className="w-4 h-4 text-emerald-600" /> Verdict
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-300/80 bg-white/90 p-3 outline-none focus:ring-2 focus:ring-emerald-500"
                    value={formData.verdict}
                    onChange={(e) => setFormData({ ...formData, verdict: e.target.value })}
                  >
                    <option>Selected</option>
                    <option>Rejected</option>
                    <option>Pending</option>
                  </select>
                </div>
                <div className="rounded-2xl border visible-card-border bg-white/70 p-4">
                  <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                    <Gauge className="w-4 h-4 text-amber-600" /> Difficulty
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-300/80 bg-white/90 p-3 outline-none focus:ring-2 focus:ring-amber-500"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 rounded-[1.75rem] border visible-card-border bg-white/70 p-5">
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <FileText className="w-4 h-4 text-cyan-600" /> Full Experience
                </label>
                <textarea
                  rows="10"
                  placeholder={`Describe the rounds and include questions in the same text.\n\nExample:\nRound 1: DSA\nQ1: Reverse a linked list\nQ2: Two sum\n\nRound 2: Core CS\nQuestion: Difference between process and thread?\nQuestion: What is normalization in DBMS?`}
                  className="w-full rounded-2xl border border-slate-300/80 bg-white/90 p-4 resize-none outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white p-4 rounded-2xl font-bold flex justify-center items-center hover:shadow-lg transition-all disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><Send className="mr-2 h-5 w-5" /> Publish Experience</>}
              </button>
            </form>
          </div>
        ) : (
          <div className="glass-panel mesh-card visible-card-border p-12 rounded-[2rem] shadow-xl text-center border">
            <div className="flex justify-center mb-4"><CheckCircle className="w-16 h-16 text-green-500" /></div>
            <h2 className="text-3xl font-bold mb-4">Published Successfully!</h2>
            <p className="text-gray-600 mb-8">
              Your experience is now live on the Explore feed, and its interview questions will also contribute to that company&apos;s prep material.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setStep(1);
                  setFormData(initialFormData);
                }}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200"
              >
                Share Another
              </button>
              <button
                onClick={() => navigate('/explore')}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700"
              >
                Go to Feed
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareExperience;

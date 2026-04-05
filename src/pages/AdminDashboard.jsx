import React, { useEffect, useMemo, useState } from 'react';
import {
  Shield,
  Edit2,
  Trash2,
  Save,
  X,
  Loader2,
  Building2,
  PlusCircle,
  CheckCircle,
  List,
  FileUp,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { CAMPUS_COMPANIES } from '../data/campusCompanies';
import StudyMaterialAdminPanel from '../components/StudyMaterialAdminPanel';
import {
  QUESTION_CATEGORIES,
  createEmptyQuestionBuckets,
  mergeCompanyQuestions
} from '../utils/experienceAnalysis';
import { extractQuestionsFromPdf } from '../utils/pdfQuestionImport';

const createInitialPrepForm = () => ({
  name: '',
  role: '',
  visitDate: '',
  ctc: '',
  eligibility: '',
  description: '',
  drivesInput: '',
  roundsInput: '',
  questions: createEmptyQuestionBuckets()
});

const getCompanyKey = (name = '') => name.trim().toLowerCase();

const mergeQuestionsForForm = (currentQuestions, incomingQuestions) =>
  mergeCompanyQuestions(currentQuestions || createEmptyQuestionBuckets(), incomingQuestions || createEmptyQuestionBuckets());

const countQuestions = (questions = {}) =>
  QUESTION_CATEGORIES.reduce((total, category) => total + ((questions[category] || []).length), 0);

const createPayloadFromForm = (form) => ({
  name: form.name,
  role: form.role,
  visitDate: form.visitDate,
  ctc: form.ctc,
  eligibility: form.eligibility,
  description: form.description,
  drives: form.drivesInput.split(',').map((s) => s.trim()).filter(Boolean),
  rounds: form.roundsInput.split(',').map((s) => s.trim()).filter(Boolean),
  questions: form.questions
});

const QuestionBucketsPreview = ({ questions, onRemove }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {QUESTION_CATEGORIES.map((cat) => (
      questions?.[cat]?.length > 0 ? (
        <div key={cat} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h5 className="font-bold text-sm uppercase text-gray-500 mb-2">{cat} Questions ({questions[cat].length})</h5>
          <ul className="space-y-2">
            {questions[cat].map((q, idx) => (
              <li key={`${cat}-${idx}`} className="flex justify-between items-start gap-3 text-sm bg-gray-50 p-2 rounded-lg">
                <span>
                  <span className="font-medium">{q.q}</span>{' '}
                  <span className="text-xs text-gray-400">({q.freq || 'Low'})</span>
                  {q.source?.includes('pdf') && <span className="text-xs text-emerald-600 ml-2">PDF</span>}
                </span>
                {onRemove && (
                  <button type="button" onClick={() => onRemove(cat, idx)} className="text-red-500 hover:text-red-700">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null
    ))}
  </div>
);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('experiences');
  const [experiences, setExperiences] = useState([]);
  const [loadingExp, setLoadingExp] = useState(true);
  const [isSavingExp, setIsSavingExp] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const [prepMaterials, setPrepMaterials] = useState([]);
  const [loadingPrep, setLoadingPrep] = useState(false);
  const [showAddPrepForm, setShowAddPrepForm] = useState(false);
  const [isSubmittingPrep, setIsSubmittingPrep] = useState(false);
  const [prepSuccess, setPrepSuccess] = useState('');
  const [editingPrepId, setEditingPrepId] = useState(null);
  const [editPrepForm, setEditPrepForm] = useState(null);
  const [prepForm, setPrepForm] = useState(createInitialPrepForm());
  const [qCategory, setQCategory] = useState('other');
  const [qText, setQText] = useState('');
  const [qFreq, setQFreq] = useState('High');
  const [qDiff, setQDiff] = useState('Medium');
  const [pdfImportingTarget, setPdfImportingTarget] = useState('');

  const prepCompanyKeys = useMemo(
    () => new Set(prepMaterials.map((item) => getCompanyKey(item.name))),
    [prepMaterials]
  );

  useEffect(() => {
    const fetchExperiences = async () => {
      setLoadingExp(true);
      const { data, error } = await supabase.from('experiences').select('*').order('created_at', { ascending: false });
      if (!error) setExperiences(data || []);
      setLoadingExp(false);
    };

    const fetchPrepMaterials = async () => {
      setLoadingPrep(true);
      const { data, error } = await supabase.from('prep_materials').select('*').order('created_at', { ascending: false });
      if (!error) setPrepMaterials(data || []);
      setLoadingPrep(false);
    };

    if (activeTab === 'experiences') fetchExperiences();
    if (activeTab === 'prep') fetchPrepMaterials();
  }, [activeTab]);

  const handleDeleteExp = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    const { error } = await supabase.from('experiences').delete().eq('id', id);
    if (!error) setExperiences(experiences.filter((exp) => exp.id !== id));
    else alert(`Error: ${error.message}`);
  };

  const saveEditExp = async () => {
    setIsSavingExp(true);
    const updateData = { company: editForm.company, role: editForm.role, content: editForm.content };
    const { error } = await supabase.from('experiences').update(updateData).eq('id', editForm.id);

    if (!error) {
      setExperiences(experiences.map((exp) => (exp.id === editForm.id ? { ...exp, ...updateData } : exp)));
      setEditingId(null);
    } else {
      alert(`Error: ${error.message}`);
    }

    setIsSavingExp(false);
  };

  const handleAddQuestion = () => {
    if (!qText.trim()) return;

    const newQuestion = {
      q: qText.trim(),
      freq: qFreq,
      difficulty: qCategory === 'dsa' ? qDiff : undefined,
      source: 'manual'
    };

    setPrepForm((prev) => ({
      ...prev,
      questions: {
        ...prev.questions,
        [qCategory]: [...prev.questions[qCategory], newQuestion]
      }
    }));

    setQText('');
  };

  const handleRemoveQuestion = (cat, idx, target = 'add') => {
    const updater = (prev) => {
      const updatedCat = [...(prev.questions?.[cat] || [])];
      updatedCat.splice(idx, 1);
      return {
        ...prev,
        questions: { ...prev.questions, [cat]: updatedCat }
      };
    };

    if (target === 'edit') {
      setEditPrepForm((prev) => updater(prev));
      return;
    }

    setPrepForm((prev) => updater(prev));
  };

  const handlePdfImport = async (file, target = 'add') => {
    if (!file) return;

    const importKey = `${target}-${file.name}`;
    setPdfImportingTarget(importKey);
    setPrepSuccess('');

    try {
      const { questions } = await extractQuestionsFromPdf(file);
      const totalImported = countQuestions(questions);

      if (!totalImported) {
        setPrepSuccess(`No clear interview questions were detected in ${file.name}.`);
        return;
      }

      if (target === 'edit') {
        setEditPrepForm((prev) => ({
          ...prev,
          questions: mergeQuestionsForForm(prev.questions, questions)
        }));
      } else {
        setPrepForm((prev) => ({
          ...prev,
          questions: mergeQuestionsForForm(prev.questions, questions)
        }));
      }

      setPrepSuccess(`${totalImported} questions imported from ${file.name}.`);
    } catch (error) {
      console.error('PDF import failed:', error);
      alert(`PDF import failed: ${error.message}`);
    } finally {
      setPdfImportingTarget('');
    }
  };

  const handleSubmitPrep = async (e) => {
    e.preventDefault();
    setIsSubmittingPrep(true);
    setPrepSuccess('');

    const payload = createPayloadFromForm(prepForm);
    const existing = prepMaterials.find((item) => getCompanyKey(item.name) === getCompanyKey(prepForm.name));

    let response;
    if (existing) {
      response = await supabase.from('prep_materials').update(payload).eq('id', existing.id).select();
    } else {
      response = await supabase.from('prep_materials').insert([payload]).select();
    }

    const { data, error } = response;

    if (error) {
      alert(`Error saving company: ${error.message}`);
    } else {
      const savedItem = data?.[0] || { ...payload, id: existing?.id };
      setPrepMaterials((prev) => {
        if (existing) {
          return prev.map((item) => (item.id === existing.id ? { ...item, ...savedItem } : item));
        }
        return [savedItem, ...prev];
      });
      setPrepSuccess(`${payload.name} successfully ${existing ? 'updated' : 'added'}!`);
      setPrepForm(createInitialPrepForm());
      setShowAddPrepForm(false);
      window.scrollTo(0, 0);
    }

    setIsSubmittingPrep(false);
  };

  const handleDeletePrep = async (id) => {
    if (!window.confirm('Kya aap sach me is company ka prep material delete karna chahte hain?')) return;
    const { error } = await supabase.from('prep_materials').delete().eq('id', id);
    if (!error) setPrepMaterials(prepMaterials.filter((p) => p.id !== id));
    else alert(`Error deleting: ${error.message}`);
  };

  const startEditingPrep = (prep) => {
    setEditingPrepId(prep.id);
    setEditPrepForm({
      ...prep,
      drivesInput: (prep.drives || []).join(', '),
      roundsInput: (prep.rounds || []).join(', '),
      questions: prep.questions || createEmptyQuestionBuckets()
    });
  };

  const saveEditPrep = async () => {
    setIsSubmittingPrep(true);

    const updateData = createPayloadFromForm(editPrepForm);
    const { data, error } = await supabase.from('prep_materials').update(updateData).eq('id', editPrepForm.id).select();

    if (!error) {
      const savedItem = data?.[0] || { ...editPrepForm, ...updateData };
      setPrepMaterials(prepMaterials.map((p) => (p.id === editPrepForm.id ? { ...p, ...savedItem } : p)));
      setEditingPrepId(null);
      setPrepSuccess(`${updateData.name} updated successfully.`);
    } else {
      alert(`Error updating: ${error.message}`);
    }

    setIsSubmittingPrep(false);
  };

  const handleSeedCompanies = async () => {
    const missingCompanies = CAMPUS_COMPANIES.filter((company) => !prepCompanyKeys.has(getCompanyKey(company.name)));

    if (missingCompanies.length === 0) {
      setPrepSuccess('All default companies are already present in prep material.');
      return;
    }

    setIsSubmittingPrep(true);
    setPrepSuccess('');

    const payload = missingCompanies.map((company) => ({
      name: company.name,
      role: company.role,
      visitDate: company.visitDate,
      ctc: company.ctc,
      eligibility: company.eligibility,
      description: `${company.name} prep page seeded from the default campus company list.`,
      drives: company.drives || company.resources || [],
      rounds: company.rounds || [],
      questions: createEmptyQuestionBuckets()
    }));

    const { data, error } = await supabase.from('prep_materials').insert(payload).select();

    if (error) {
      alert(`Error seeding companies: ${error.message}`);
    } else {
      setPrepMaterials((prev) => [...(data || []), ...prev]);
      setPrepSuccess(`${payload.length} default companies added to prep material.`);
    }

    setIsSubmittingPrep(false);
  };

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-purple-100 gap-4">
          <h2 className="text-3xl font-bold flex items-center gap-2 text-gray-900">
            <Shield className="text-purple-600 w-8 h-8" /> Admin Portal
          </h2>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('experiences')}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'experiences' ? 'bg-white shadow-sm text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Community Feed
            </button>
            <button
              onClick={() => { setActiveTab('prep'); setShowAddPrepForm(false); }}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'prep' ? 'bg-white shadow-sm text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Building2 className="w-4 h-4" /> Prep Material
            </button>
            <button
              onClick={() => setActiveTab('study')}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'study' ? 'bg-white shadow-sm text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FileUp className="w-4 h-4" /> Study Material
            </button>
          </div>
        </div>

        {activeTab === 'experiences' && (
          <div className="grid gap-6 animate-in fade-in duration-300">
            {loadingExp ? (
              <div className="text-center py-10 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-purple-600" /></div>
            ) : experiences.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-xl border">No post .</div>
            ) : (
              experiences.map((exp) => (
                <div key={exp.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative group">
                  {editingId === exp.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" value={editForm.company} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} className="border p-2 rounded-lg" placeholder="Company Name" />
                        <input type="text" value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="border p-2 rounded-lg" placeholder="Job Role" />
                      </div>
                      <textarea value={editForm.content} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} className="border p-3 w-full h-32 rounded-lg resize-none" />
                      <div className="flex justify-end gap-3">
                        <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">Cancel</button>
                        <button onClick={saveEditExp} disabled={isSavingExp} className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-1">
                          {isSavingExp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start">
                        <div><h3 className="font-bold text-xl text-blue-600">{exp.company} <span className="text-gray-400 font-normal">| {exp.role}</span></h3></div>
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingId(exp.id); setEditForm({ ...exp }); }} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Edit2 className="w-5 h-5" /></button>
                          <button onClick={() => handleDeleteExp(exp.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Posted by: {exp.author_email || 'Anonymous'}</p>`r`n                      <p className="text-gray-700 mt-4 whitespace-pre-wrap">{exp.content}</p>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'prep' && (
          <div className="bg-white rounded-3xl p-8 shadow-md border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center mb-6 border-b pb-4 gap-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{showAddPrepForm ? 'Publish New Material' : 'Manage Prep Materials'}</h3>
                <p className="text-gray-500">
                  {showAddPrepForm ? 'Add details, manual questions, or import a PDF.' : 'Edit, seed, import PDF questions, or delete existing company details.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSeedCompanies}
                  disabled={isSubmittingPrep}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-70"
                >
                  {isSubmittingPrep ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Seed Default Companies
                </button>
                <button
                  onClick={() => setShowAddPrepForm(!showAddPrepForm)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${showAddPrepForm ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                >
                  {showAddPrepForm ? <><List className="w-4 h-4" /> View List</> : <><PlusCircle className="w-4 h-4" /> Add New Company</>}
                </button>
              </div>
            </div>

            {prepSuccess && (
              <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 flex items-center gap-2 font-bold border border-green-200">
                <CheckCircle className="w-6 h-6" /> {prepSuccess}
              </div>
            )}

            {showAddPrepForm ? (
              <form onSubmit={handleSubmitPrep} className="space-y-8 animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h4 className="md:col-span-2 font-bold text-indigo-700 flex items-center gap-2"><Building2 className="w-5 h-5" /> Basic Details</h4>
                  <div><label className="block text-sm font-bold mb-2">Company Name</label><input required value={prepForm.name} onChange={(e) => setPrepForm({ ...prepForm, name: e.target.value })} className="w-full p-3 border rounded-xl" placeholder="e.g. Microsoft" /></div>
                  <div><label className="block text-sm font-bold mb-2">Role/Position</label><input required value={prepForm.role} onChange={(e) => setPrepForm({ ...prepForm, role: e.target.value })} className="w-full p-3 border rounded-xl" placeholder="e.g. SDE Intern" /></div>
                  <div><label className="block text-sm font-bold mb-2">Visit Date</label><input type="date" value={prepForm.visitDate} onChange={(e) => setPrepForm({ ...prepForm, visitDate: e.target.value })} className="w-full p-3 border rounded-xl" /></div>
                  <div><label className="block text-sm font-bold mb-2">CTC / Stipend</label><input required value={prepForm.ctc} onChange={(e) => setPrepForm({ ...prepForm, ctc: e.target.value })} className="w-full p-3 border rounded-xl" placeholder="e.g. 45 LPA" /></div>
                  <div className="md:col-span-2"><label className="block text-sm font-bold mb-2">Eligibility Criteria</label><input required value={prepForm.eligibility} onChange={(e) => setPrepForm({ ...prepForm, eligibility: e.target.value })} className="w-full p-3 border rounded-xl" placeholder="e.g. CGPA > 8.0, CSE/IT" /></div>
                  <div className="md:col-span-2"><label className="block text-sm font-bold mb-2">About Company</label><textarea required rows={3} value={prepForm.description} onChange={(e) => setPrepForm({ ...prepForm, description: e.target.value })} className="w-full p-3 border rounded-xl" placeholder="Brief description..." /></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                  <h4 className="md:col-span-2 font-bold text-blue-700">Process & Drives</h4>
                  <div><label className="block text-sm font-bold mb-2">Drive Types (Comma Separated)</label><input value={prepForm.drivesInput} onChange={(e) => setPrepForm({ ...prepForm, drivesInput: e.target.value })} className="w-full p-3 border rounded-xl" placeholder="e.g. Internship, Full Time" /></div>
                  <div><label className="block text-sm font-bold mb-2">Interview Rounds (Comma Separated)</label><input value={prepForm.roundsInput} onChange={(e) => setPrepForm({ ...prepForm, roundsInput: e.target.value })} className="w-full p-3 border rounded-xl" placeholder="e.g. Online Test, Tech 1, HR" /></div>
                </div>

                <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h4 className="font-bold text-purple-700 flex items-center gap-2"><PlusCircle className="w-5 h-5" /> Add Interview Questions</h4>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-purple-200 rounded-xl text-sm font-semibold text-purple-700 cursor-pointer hover:bg-purple-100">
                      {pdfImportingTarget.startsWith('add-') ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
                      Import Questions From PDF
                      <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handlePdfImport(e.target.files?.[0], 'add')} />
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-4 items-end bg-white p-4 rounded-xl border border-purple-200 shadow-sm">
                    <div className="flex-1 min-w-40"><label className="block text-xs font-bold mb-1">Category</label><select value={qCategory} onChange={(e) => setQCategory(e.target.value)} className="w-full p-2 border rounded-lg"><option value="dsa">DSA</option><option value="oops">OOPs</option><option value="os">OS</option><option value="dbms">DBMS</option><option value="other">Other</option></select></div>
                    <div className="flex-[2] min-w-60"><label className="block text-xs font-bold mb-1">Question Text</label><input value={qText} onChange={(e) => setQText(e.target.value)} className="w-full p-2 border rounded-lg" placeholder="e.g. Reverse a Linked List" /></div>
                    <div className="flex-1 min-w-28"><label className="block text-xs font-bold mb-1">Frequency</label><select value={qFreq} onChange={(e) => setQFreq(e.target.value)} className="w-full p-2 border rounded-lg"><option>High</option><option>Medium</option><option>Low</option></select></div>
                    {qCategory === 'dsa' && <div className="flex-1 min-w-28"><label className="block text-xs font-bold mb-1">Difficulty</label><select value={qDiff} onChange={(e) => setQDiff(e.target.value)} className="w-full p-2 border rounded-lg"><option>Easy</option><option>Medium</option><option>Hard</option></select></div>}
                    <button type="button" onClick={handleAddQuestion} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-700">Add Q</button>
                  </div>
                  <QuestionBucketsPreview questions={prepForm.questions} onRemove={(cat, idx) => handleRemoveQuestion(cat, idx, 'add')} />
                </div>

                <div className="border-t pt-6">
                  <button type="submit" disabled={isSubmittingPrep} className="w-full py-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                    {isSubmittingPrep ? <Loader2 className="animate-spin w-6 h-6" /> : <Save className="w-6 h-6" />}
                    {isSubmittingPrep ? 'Publishing...' : 'Publish Prep Material'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid gap-6 animate-in fade-in">
                {loadingPrep ? (
                  <div className="text-center py-10 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-indigo-600" /></div>
                ) : prepMaterials.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed">No company prep materials added yet.</div>
                ) : (
                  prepMaterials.map((prep) => (
                    <div key={prep.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative">
                      {editingPrepId === prep.id ? (
                        <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <h4 className="font-bold text-indigo-700 mb-2">Edit Company Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="text-xs font-bold">Company</label><input type="text" value={editPrepForm.name} onChange={(e) => setEditPrepForm({ ...editPrepForm, name: e.target.value })} className="border p-2 rounded-lg w-full" /></div>
                            <div><label className="text-xs font-bold">Role</label><input type="text" value={editPrepForm.role} onChange={(e) => setEditPrepForm({ ...editPrepForm, role: e.target.value })} className="border p-2 rounded-lg w-full" /></div>
                            <div><label className="text-xs font-bold">CTC</label><input type="text" value={editPrepForm.ctc} onChange={(e) => setEditPrepForm({ ...editPrepForm, ctc: e.target.value })} className="border p-2 rounded-lg w-full" /></div>
                            <div><label className="text-xs font-bold">Visit Date</label><input type="date" value={editPrepForm.visitDate} onChange={(e) => setEditPrepForm({ ...editPrepForm, visitDate: e.target.value })} className="border p-2 rounded-lg w-full" /></div>
                          </div>
                          <div><label className="text-xs font-bold">Eligibility</label><input type="text" value={editPrepForm.eligibility} onChange={(e) => setEditPrepForm({ ...editPrepForm, eligibility: e.target.value })} className="border p-2 rounded-lg w-full" /></div>
                          <div><label className="text-xs font-bold">Drives (Comma Separated)</label><input type="text" value={editPrepForm.drivesInput} onChange={(e) => setEditPrepForm({ ...editPrepForm, drivesInput: e.target.value })} className="border p-2 rounded-lg w-full" /></div>
                          <div><label className="text-xs font-bold">Rounds (Comma Separated)</label><input type="text" value={editPrepForm.roundsInput} onChange={(e) => setEditPrepForm({ ...editPrepForm, roundsInput: e.target.value })} className="border p-2 rounded-lg w-full" /></div>
                          <div><label className="text-xs font-bold">Description</label><textarea value={editPrepForm.description} onChange={(e) => setEditPrepForm({ ...editPrepForm, description: e.target.value })} className="border p-2 rounded-lg w-full resize-none" rows="3" /></div>
                          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-gray-200 rounded-xl p-4">
                            <div>
                              <p className="font-semibold text-gray-800">Import or review questions</p>
                              <p className="text-sm text-gray-500">PDF import merges new questions into the existing company question bank.</p>
                            </div>
                            <label className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-semibold text-emerald-700 cursor-pointer hover:bg-emerald-100">
                              {pdfImportingTarget.startsWith('edit-') ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
                              Import PDF
                              <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handlePdfImport(e.target.files?.[0], 'edit')} />
                            </label>
                          </div>
                          <QuestionBucketsPreview questions={editPrepForm.questions} onRemove={(cat, idx) => handleRemoveQuestion(cat, idx, 'edit')} />

                          <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setEditingPrepId(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold">Cancel</button>
                            <button onClick={saveEditPrep} disabled={isSubmittingPrep} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-1 text-sm font-bold">
                              {isSubmittingPrep ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Details
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h3 className="font-bold text-xl text-indigo-600">{prep.name} <span className="text-gray-400 font-normal">| {prep.role}</span></h3>
                              <p className="text-sm text-gray-500 mt-1">CTC: {prep.ctc} � Visited: {prep.visitDate || 'TBD'}</p>
                              <p className="text-sm text-gray-500 mt-1">Questions stored: {countQuestions(prep.questions || createEmptyQuestionBuckets())}</p>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => startEditingPrep(prep)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"><Edit2 className="w-5 h-5" /></button>
                              <button onClick={() => handleDeletePrep(prep.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 className="w-5 h-5" /></button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'study' && <StudyMaterialAdminPanel />}
      </div>
    </div>
  );
};

export default AdminDashboard;

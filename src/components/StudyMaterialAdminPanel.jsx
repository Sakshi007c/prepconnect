

import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, CheckCircle, Edit2, Globe, Library, Loader2, PlusCircle, Save, Trash2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { STUDY_SUBJECTS } from '../data/studySubjects';

const createInitialForm = () => ({
  subject_key: STUDY_SUBJECTS[0]?.key || 'dsa',
  title: STUDY_SUBJECTS[0]?.title || '',
  description: STUDY_SUBJECTS[0]?.description || '',
  questionsInput: '',
  resourcesInput: ''
});

const parseQuestions = (input = '') =>
  input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const parseResources = (input = '') =>
  input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split('|');
      const url = rest.join('|').trim();

      if (!url) {
        return { label: line, url: line };
      }

      return {
        label: label.trim() || url,
        url
      };
    })
    .filter((resource) => resource.url);

const resourcesToInput = (resources = []) =>
  resources
    .map((resource) => `${resource.label || resource.url} | ${resource.url}`)
    .join('\n');

const buildPayload = (form) => ({
  subject_key: form.subject_key,
  title: form.title.trim(),
  description: form.description.trim(),
  questions: parseQuestions(form.questionsInput),
  resources: parseResources(form.resourcesInput)
});

const findSubjectMeta = (subjectKey) =>
  STUDY_SUBJECTS.find((subject) => subject.key === subjectKey) || STUDY_SUBJECTS[0];

const StudyMaterialAdminPanel = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [success, setSuccess] = useState('');
  const [tableMissing, setTableMissing] = useState(false);
  const [form, setForm] = useState(createInitialForm());
  const [editForm, setEditForm] = useState(null);

  const subjectMap = useMemo(
    () => new Map(STUDY_SUBJECTS.map((subject) => [subject.key, subject])),
    []
  );

  const loadMaterials = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('study_materials')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      if (error.code === '42P01') {
        setTableMissing(true);
        setMaterials([]);
      } else {
        alert(`Error loading study materials: ${error.message}`);
      }
    } else {
      setTableMissing(false);
      setMaterials(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadMaterials();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const handleSubjectChange = (subjectKey, target = 'add') => {
    const meta = findSubjectMeta(subjectKey);

    if (target === 'edit') {
      setEditForm((prev) => ({
        ...prev,
        subject_key: subjectKey,
        title: prev?.title || meta.title,
        description: prev?.description || meta.description
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      subject_key: subjectKey,
      title: prev.title || meta.title,
      description: prev.description || meta.description
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');

    const payload = buildPayload(form);
    const existing = materials.find((item) => item.subject_key === payload.subject_key);
    const { error } = existing
      ? await supabase.from('study_materials').update(payload).eq('id', existing.id)
      : await supabase.from('study_materials').insert([payload]);

    if (error) {
      alert(`Error saving study material: ${error.message}`);
    } else {
      await loadMaterials();
      setForm(createInitialForm());
      setShowAddForm(false);
      setSuccess(`${payload.title} study material saved successfully.`);
    }

    setSaving(false);
  };

  const startEditing = (item) => {
    setEditingId(item.id);
    setEditForm({
      ...item,
      questionsInput: (item.questions || []).join('\n'),
      resourcesInput: resourcesToInput(item.resources || [])
    });
  };

  const saveEdit = async () => {
    setSaving(true);
    const payload = buildPayload(editForm);
    const { error } = await supabase.from('study_materials').update(payload).eq('id', editForm.id);

    if (error) {
      alert(`Error updating study material: ${error.message}`);
    } else {
      await loadMaterials();
      setEditingId(null);
      setEditForm(null);
      setSuccess(`${payload.title} updated successfully.`);
    }

    setSaving(false);
  };

  const deleteMaterial = async (id) => {
    if (!window.confirm('Delete this study material?')) return;

    const { error } = await supabase.from('study_materials').delete().eq('id', id);

    if (error) {
      alert(`Error deleting study material: ${error.message}`);
      return;
    }

    await loadMaterials();
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-md border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col lg:flex-row justify-between lg:items-center mb-6 border-b pb-4 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{showAddForm ? 'Add Shared Subject' : 'Manage Study Material'}</h3>
          <p className="text-gray-500">
            Admin can manage common subjects, shared questions, and external learning resources from here.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm((prev) => !prev)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${showAddForm ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
        >
          {showAddForm ? <><Library className="w-4 h-4" /> View List</> : <><PlusCircle className="w-4 h-4" /> Add Subject</>}
        </button>
      </div>

      {tableMissing && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800">
          The `study_materials` table does not exist yet. Create it first, then admin-added questions and resource links will start saving here.
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 flex items-center gap-2 font-bold border border-green-200">
          <CheckCircle className="w-6 h-6" /> {success}
        </div>
      )}

      {showAddForm ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div>
              <label className="block text-sm font-bold mb-2">Subject</label>
              <select
                value={form.subject_key}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full p-3 border rounded-xl"
              >
                {STUDY_SUBJECTS.map((subject) => (
                  <option key={subject.key} value={subject.key}>{subject.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Display Title</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full p-3 border rounded-xl"
                placeholder="e.g. Data Structures & Algorithms"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-2">Description</label>
              <textarea
                rows={3}
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full p-3 border rounded-xl"
                placeholder="Short subject intro..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <label className="block text-sm font-bold mb-2">Questions</label>
              <textarea
                rows={10}
                value={form.questionsInput}
                onChange={(e) => setForm({ ...form, questionsInput: e.target.value })}
                className="w-full p-3 border rounded-xl"
                placeholder={'One question per line\nExample:\nExplain Kadane algorithm\nWhat is normalization?'}
              />
            </div>
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
              <label className="block text-sm font-bold mb-2">Resources</label>
              <textarea
                rows={10}
                value={form.resourcesInput}
                onChange={(e) => setForm({ ...form, resourcesInput: e.target.value })}
                className="w-full p-3 border rounded-xl"
                placeholder={'One resource per line\nFormat: Label | https://example.com\nExample:\nStriver DSA Sheet | https://takeuforward.org'}
              />
            </div>
          </div>

          <button type="submit" disabled={saving || tableMissing} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
            {saving ? <Loader2 className="animate-spin w-6 h-6" /> : <Save className="w-6 h-6" />}
            {saving ? 'Saving...' : 'Save Study Material'}
          </button>
        </form>
      ) : (
        <div className="grid gap-6">
          {loading ? (
            <div className="text-center py-10 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-indigo-600" /></div>
          ) : materials.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed">No shared study materials added yet.</div>
          ) : (
            materials.map((item) => {
              const subjectMeta = subjectMap.get(item.subject_key);

              return (
                <div key={item.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative">
                  {editingId === item.id ? (
                    <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold">Subject</label>
                          <select
                            value={editForm.subject_key}
                            onChange={(e) => setEditForm({ ...editForm, subject_key: e.target.value })}
                            className="border p-2 rounded-lg w-full"
                          >
                            {STUDY_SUBJECTS.map((subject) => (
                              <option key={subject.key} value={subject.key}>{subject.title}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold">Title</label>
                          <input
                            type="text"
                            value={editForm.title}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            className="border p-2 rounded-lg w-full"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold">Description</label>
                        <textarea
                          rows={3}
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="border p-2 rounded-lg w-full"
                        />
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold">Questions</label>
                          <textarea
                            rows={8}
                            value={editForm.questionsInput}
                            onChange={(e) => setEditForm({ ...editForm, questionsInput: e.target.value })}
                            className="border p-2 rounded-lg w-full"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold">Resources</label>
                          <textarea
                            rows={8}
                            value={editForm.resourcesInput}
                            onChange={(e) => setEditForm({ ...editForm, resourcesInput: e.target.value })}
                            className="border p-2 rounded-lg w-full"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3">
                        <button onClick={() => { setEditingId(null); setEditForm(null); }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold">
                          Cancel
                        </button>
                        <button onClick={saveEdit} disabled={saving || tableMissing} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-1 text-sm font-bold disabled:opacity-70">
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-xl text-indigo-600">{item.title}</h3>
                            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100">
                              {subjectMeta?.shortTitle || item.subject_key}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                          <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {(item.questions || []).length} questions</span>
                            <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> {(item.resources || []).length} resources</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => startEditing(item)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"><Edit2 className="w-5 h-5" /></button>
                          <button onClick={() => deleteMaterial(item.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                          <p className="font-semibold text-gray-800 mb-2">Questions Preview</p>
                          {(item.questions || []).length > 0 ? (
                            <ul className="space-y-2 text-sm text-gray-600">
                              {(item.questions || []).slice(0, 4).map((question, index) => (
                                <li key={`${question}-${index}`} className="flex items-start gap-2">
                                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                                  <span>{question}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-400">No questions added yet.</p>
                          )}
                        </div>

                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                          <p className="font-semibold text-gray-800 mb-2">Resources Preview</p>
                          {(item.resources || []).length > 0 ? (
                            <ul className="space-y-2 text-sm text-gray-600">
                              {(item.resources || []).slice(0, 4).map((resource, index) => (
                                <li key={`${resource.url}-${index}`} className="flex items-start justify-between gap-3">
                                  <span>{resource.label || resource.url}</span>
                                  <a href={resource.url} target="_blank" rel="noreferrer" className="text-emerald-600 hover:text-emerald-700">
                                    Open
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-400">No resources added yet.</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default StudyMaterialAdminPanel;

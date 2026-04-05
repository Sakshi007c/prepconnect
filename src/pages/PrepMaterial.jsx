import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  Building2,
  Calendar,
  Award,
  BookOpen,
  ArrowLeft,
  Code2,
  Database,
  Monitor,
  Layers,
  Briefcase,
  Clock,
  CheckCircle2,
  ChevronRight,
  Library,
  Link as LinkIcon,
  Globe,
  FolderOpen
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { CAMPUS_COMPANIES } from '../data/campusCompanies';
import { STUDY_SUBJECTS, getStudySubjectMeta } from '../data/studySubjects';
import {
  analyzeExperienceQuestions,
  mergeCompanyQuestions,
  QUESTION_CATEGORIES,
  createEmptyQuestionBuckets
} from '../utils/experienceAnalysis';

const getCompanyColor = (companyName) => {
  const colors = [
    'bg-blue-600',
    'bg-red-500',
    'bg-green-600',
    'bg-yellow-500',
    'bg-purple-600',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500'
  ];

  if (!companyName) return colors[0];

  let hash = 0;
  for (let i = 0; i < companyName.length; i += 1) {
    hash = companyName.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

const getCompanyKey = (name = '') => name.trim().toLowerCase();

const createCompanyBase = (company = {}) => ({
  id: company.id || `company-${getCompanyKey(company.name)}`,
  name: company.name || '',
  role: company.role || 'Role details coming soon',
  visitDate: company.visitDate || '',
  ctc: company.ctc || '',
  eligibility: company.eligibility || 'Eligibility details coming soon.',
  description: company.description || 'Community-generated prep page.',
  drives: Array.isArray(company.drives) ? company.drives : [],
  rounds: Array.isArray(company.rounds) ? company.rounds : [],
  questions: company.questions || createEmptyQuestionBuckets(),
  sourceLabel: company.sourceLabel || 'prep',
  isSeededOnly: company.isSeededOnly || false
});

const SUBJECT_ICON_MAP = {
  dsa: Code2,
  oops: Layers,
  os: Monitor,
  dbms: Database,
  cn: Globe,
  aptitude: BookOpen,
  'system-design': Library,
  html: Building2,
  css: Layers,
  javascript: Code2,
  python: Code2,
  statistics: BookOpen,
  probability: BookOpen,
  'linear-algebra': Database,
  'machine-learning': Library,
  hr: Briefcase
};

const createStudyMaterialBase = (item = {}) => {
  const meta = getStudySubjectMeta(item.subject_key || item.subjectKey || '');

  return {
    id: item.id || `study-${item.subject_key || item.subjectKey || meta?.key || 'subject'}`,
    subject_key: item.subject_key || item.subjectKey || meta?.key || '',
    title: item.title || meta?.title || 'Untitled Subject',
    shortTitle: item.shortTitle || meta?.shortTitle || item.title || 'Subject',
    description: item.description || meta?.description || 'Shared study material managed by admin.',
    questions: Array.isArray(item.questions) ? item.questions.filter(Boolean) : [],
    resources: Array.isArray(item.resources)
      ? item.resources.filter((resource) => resource?.label || resource?.url)
      : []
  };
};

const loadStudyMaterials = async () => {
  const response = await supabase
    .from('study_materials')
    .select('*')
    .order('created_at', { ascending: true });

  if (response.error) {
    if (response.error.code === '42P01') {
      return { data: [], missingTable: true };
    }

    throw response.error;
  }

  return { data: response.data || [], missingTable: false };
};

const ResourceLinkCard = ({ resource }) => (
  <a
    href={resource.url}
    target="_blank"
    rel="noreferrer"
    className="group subject-card-glow visible-card-border mesh-card flex items-start justify-between gap-4 rounded-2xl border bg-white/90 p-5 transition-all hover:-translate-y-0.5 hover:border-indigo-300"
  >
    <div>
      <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
        {resource.label || resource.url}
      </p>
      <p className="mt-2 break-all text-sm text-gray-500">{resource.url}</p>
    </div>
      <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 shadow-sm">
        <LinkIcon className="h-4 w-4" />
      </div>
    </a>
  );

const Reveal = ({ children, direction = 'up', delay = 0 }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const directionClass = direction === 'left'
    ? 'scroll-from-left'
    : direction === 'right'
      ? 'scroll-from-right'
      : 'scroll-from-up';

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${directionClass} ${visible ? 'is-visible' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default function PrepMaterial() {
  const [prepMaterials, setPrepMaterials] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedStudyMaterial, setSelectedStudyMaterial] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [prepSection, setPrepSection] = useState('company');
  const [studyMaterialsAvailable, setStudyMaterialsAvailable] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const [prepResponse, experienceResponse, studyResponse] = await Promise.all([
          supabase.from('prep_materials').select('*').order('created_at', { ascending: false }),
          supabase.from('experiences').select('id, company, role, content, created_at').order('created_at', { ascending: false }),
          loadStudyMaterials()
        ]);

        if (prepResponse.error) throw prepResponse.error;
        if (experienceResponse.error) throw experienceResponse.error;

        setPrepMaterials(prepResponse.data || []);
        setExperiences(experienceResponse.data || []);
        setStudyMaterials(studyResponse.data || []);
        setStudyMaterialsAvailable(!studyResponse.missingTable);
      } catch (error) {
        console.error('Error fetching prep data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const companyQuestionMap = useMemo(() => analyzeExperienceQuestions(experiences), [experiences]);

  const companies = useMemo(() => {
    const byKey = new Map();

    CAMPUS_COMPANIES.forEach((company) => {
      byKey.set(
        getCompanyKey(company.name),
        createCompanyBase({
          ...company,
          description: company.description,
          drives: company.drives || company.resources || [],
          sourceLabel: 'seed',
          isSeededOnly: true
        })
      );
    });

    prepMaterials.forEach((company) => {
      const key = getCompanyKey(company.name);
      const existing = byKey.get(key) || createCompanyBase({ name: company.name });
      byKey.set(
        key,
        createCompanyBase({
          ...existing,
          ...company,
          id: company.id || existing.id,
          name: company.name || existing.name,
          role: company.role || existing.role,
          visitDate: company.visitDate || existing.visitDate,
          ctc: company.ctc || existing.ctc,
          eligibility: company.eligibility || existing.eligibility,
          description: company.description || existing.description,
          drives: company.drives || existing.drives,
          rounds: company.rounds || existing.rounds,
          questions: company.questions || existing.questions,
          sourceLabel: 'prep',
          isSeededOnly: false
        })
      );
    });

    experiences.forEach((experience) => {
      const key = getCompanyKey(experience.company);
      if (!key) return;

      const existing = byKey.get(key) || createCompanyBase({
        name: experience.company,
        role: experience.role,
        sourceLabel: 'experience',
        isSeededOnly: true,
        description: 'This company page was created automatically from community experiences.'
      });

      byKey.set(
        key,
        createCompanyBase({
          ...existing,
          name: existing.name || experience.company,
          role: existing.role === 'Role details coming soon' ? (experience.role || existing.role) : existing.role,
          sourceLabel: existing.sourceLabel,
          isSeededOnly: existing.isSeededOnly
        })
      );
    });

    return Array.from(byKey.values())
      .map((company) => {
        const analyzedQuestions = companyQuestionMap[getCompanyKey(company.name)] || createEmptyQuestionBuckets();
        const mergedQuestions = mergeCompanyQuestions(company.questions, analyzedQuestions);
        const autoQuestionCount = QUESTION_CATEGORIES.reduce(
          (count, category) => count + (analyzedQuestions[category]?.length || 0),
          0
        );

        return {
          ...company,
          mergedQuestions,
          autoQuestionCount
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [prepMaterials, experiences, companyQuestionMap]);

  const filteredCompanies = companies.filter((company) =>
    (company.name && company.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (company.role && company.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const mergedStudyMaterials = useMemo(() => {
    const byKey = new Map();

    STUDY_SUBJECTS.forEach((subject) => {
      byKey.set(subject.key, createStudyMaterialBase({
        subject_key: subject.key,
        title: subject.title,
        shortTitle: subject.shortTitle,
        description: subject.description
      }));
    });

    studyMaterials.forEach((item) => {
      const key = item.subject_key || item.subjectKey;
      if (!key) return;

      byKey.set(
        key,
        createStudyMaterialBase({
          ...byKey.get(key),
          ...item
        })
      );
    });

    return Array.from(byKey.values());
  }, [studyMaterials]);

  const filteredStudyMaterials = mergedStudyMaterials.filter((item) => {
    const text = searchTerm.toLowerCase();

    return (
      item.title.toLowerCase().includes(text) ||
      item.shortTitle.toLowerCase().includes(text) ||
      item.description.toLowerCase().includes(text)
    );
  });

  const selectedCompanyWithQuestions = selectedCompany
    ? companies.find((company) => company.id === selectedCompany.id || getCompanyKey(company.name) === getCompanyKey(selectedCompany.name)) || selectedCompany
    : null;

  const selectedStudyMaterialItem = selectedStudyMaterial
    ? mergedStudyMaterials.find((item) => item.id === selectedStudyMaterial.id || item.subject_key === selectedStudyMaterial.subject_key) || selectedStudyMaterial
    : null;

  const TABS = [
    { id: 'overview', label: 'Overview', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'dsa', label: 'DSA Questions', icon: <Code2 className="w-4 h-4" /> },
    { id: 'oops', label: 'OOPs', icon: <Layers className="w-4 h-4" /> },
    { id: 'os', label: 'OS', icon: <Monitor className="w-4 h-4" /> },
    { id: 'dbms', label: 'DBMS', icon: <Database className="w-4 h-4" /> },
    { id: 'other', label: 'Other', icon: <BookOpen className="w-4 h-4" /> }
  ];

  if (selectedCompanyWithQuestions && prepSection === 'company') {
    return (
      <div className="prep-hero-grid min-h-screen bg-transparent pt-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setSelectedCompany(null)}
            className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors mb-6 font-medium"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Companies
          </button>

          <div className="glass-panel mesh-card floating-ring visible-card-border rounded-[2rem] p-8 border mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className={`w-20 h-20 ${getCompanyColor(selectedCompanyWithQuestions.name)} rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-lg`}>
                  {selectedCompanyWithQuestions.name?.[0] || 'C'}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedCompanyWithQuestions.name}</h1>
                  <p className="text-lg text-gray-600 font-medium">{selectedCompanyWithQuestions.role}</p>
                  {selectedCompanyWithQuestions.autoQuestionCount > 0 && (
                    <p className="text-sm text-indigo-600 mt-2 font-medium">
                      {selectedCompanyWithQuestions.autoQuestionCount} question patterns detected from shared experiences.
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <span className="bg-green-100 text-green-800 px-4 py-2 rounded-xl text-sm font-bold border border-green-200 flex items-center gap-2 w-fit">
                  <Award className="w-4 h-4" /> {selectedCompanyWithQuestions.ctc || 'N/A'}
                </span>
                <span className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold border border-indigo-100 flex items-center gap-2 w-fit">
                  <Calendar className="w-4 h-4" /> Visited: {selectedCompanyWithQuestions.visitDate || 'TBD'}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-panel floating-ring visible-card-border flex overflow-x-auto hide-scrollbar gap-2 mb-8 p-2 rounded-2xl border">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="glass-panel floating-ring visible-card-border rounded-[2rem] p-8 border min-h-100">
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Building2 className="w-5 h-5 text-indigo-500" /> About Company</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">{selectedCompanyWithQuestions.description || 'Description not available.'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-blue-500" /> Drive Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCompanyWithQuestions.drives?.map((drive, idx) => (
                        <span key={idx} className="bg-white text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm border border-gray-200 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-green-500" /> {drive}
                        </span>
                      ))}
                      {(!selectedCompanyWithQuestions.drives || selectedCompanyWithQuestions.drives.length === 0) && <span className="text-gray-500 text-sm">No drives data listed.</span>}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-orange-500" /> Eligibility Criteria</h3>
                    <p className="text-gray-700 font-medium">{selectedCompanyWithQuestions.eligibility || 'Not specified.'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-indigo-500" /> Recruitment Process</h3>
                  <div className="space-y-3">
                    {selectedCompanyWithQuestions.rounds?.map((round, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">{idx + 1}</div>
                        <span className="text-gray-800 font-medium">{round}</span>
                      </div>
                    ))}
                    {(!selectedCompanyWithQuestions.rounds || selectedCompanyWithQuestions.rounds.length === 0) && <p className="text-gray-500 italic">Recruitment rounds info coming soon.</p>}
                  </div>
                </div>
              </div>
            )}

            {QUESTION_CATEGORIES.includes(activeTab) && (
              <div className="animate-in fade-in duration-300">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 capitalize">Frequently Asked {activeTab.toUpperCase()} Questions</h3>
                <p className="text-sm text-gray-500 mb-6">
                  This list combines admin-added prep material with questions automatically detected from shared interview experiences.
                </p>
                {selectedCompanyWithQuestions.mergedQuestions?.[activeTab]?.length > 0 ? (
                  <div className="space-y-4">
                    {selectedCompanyWithQuestions.mergedQuestions[activeTab].map((item, idx) => (
                      <div key={`${item.q}-${idx}`} className="group p-5 bg-white border border-gray-200 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 mt-0.5" />
                          <div>
                            <h4 className="text-lg font-medium text-gray-800">{item.q}</h4>
                            {item.source?.includes('experience') && (
                              <p className="text-xs text-indigo-500 mt-1">Auto-detected from shared experiences</p>
                            )}
                            {item.source?.includes('pdf') && (
                              <p className="text-xs text-emerald-600 mt-1">Imported from admin PDF</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                          {item.difficulty && (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${item.difficulty === 'Easy' ? 'bg-green-50 text-green-700 border-green-200' : item.difficulty === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                              {item.difficulty}
                            </span>
                          )}
                          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">
                            Freq: {item.freq || 'N/A'}
                          </span>
                          {item.freqCount > 0 && (
                            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
                              {item.freqCount} mentions
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                    <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No {activeTab.toUpperCase()} questions recorded for this company yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (selectedStudyMaterialItem && prepSection === 'study') {
    const SubjectIcon = SUBJECT_ICON_MAP[selectedStudyMaterialItem.subject_key] || Library;

    return (
      <div className="prep-hero-grid min-h-screen bg-transparent pt-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setSelectedStudyMaterial(null)}
            className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors mb-6 font-medium"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Study Material
          </button>

          <div className="glass-panel mesh-card floating-ring visible-card-border rounded-[2rem] p-8 border mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                  <SubjectIcon className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedStudyMaterialItem.title}</h1>
                  <p className="text-lg text-gray-600 font-medium max-w-2xl">{selectedStudyMaterialItem.description}</p>
                </div>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-3 w-fit">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Shared Subject Bank</p>
                <p className="mt-1 text-sm font-medium text-indigo-900">
                  {selectedStudyMaterialItem.questions.length} questions | {selectedStudyMaterialItem.resources.length} resources
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
            <div className="glass-panel floating-ring visible-card-border rounded-[2rem] p-8 border">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                <h2 className="text-2xl font-bold text-gray-900">Core Questions</h2>
              </div>

              {selectedStudyMaterialItem.questions.length > 0 ? (
                <div className="space-y-4">
                  {selectedStudyMaterialItem.questions.map((question, index) => (
                    <div key={`${question}-${index}`} className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-gray-800 pt-1">{question}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                  <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Admin has not added questions for this subject yet.</p>
                </div>
              )}
            </div>

            <div className="glass-panel floating-ring visible-card-border rounded-[2rem] p-8 border">
              <div className="flex items-center gap-3 mb-6">
                <LinkIcon className="w-5 h-5 text-emerald-500" />
                <h2 className="text-2xl font-bold text-gray-900">Resources</h2>
              </div>

              {selectedStudyMaterialItem.resources.length > 0 ? (
                <div className="space-y-4">
                  {selectedStudyMaterialItem.resources.map((resource, index) => (
                    <ResourceLinkCard key={`${resource.url}-${index}`} resource={resource} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                  <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Admin has not added external resources for this subject yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="prep-hero-grid pt-24 pb-20 min-h-screen relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-indigo-100/70 via-sky-100/40 to-transparent"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-500 relative">
          <div className="inline-flex items-center gap-2 bg-white/80 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4 border visible-card-border shadow-sm">
            <Building2 className="w-4 h-4" /> <span>Campus Drive Archives</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-4">Prep Material</h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-base md:text-lg">
            Switch between company-specific prep pages and shared subject-wise study material managed by admin.
          </p>
        </div>

        <div className="glass-panel floating-ring visible-card-border max-w-2xl mx-auto mb-6 flex flex-col gap-4 rounded-[2rem] border p-5 animate-in fade-in zoom-in duration-500 delay-100 md:flex-row md:items-center">
          <div className="min-w-44">
            <label htmlFor="prep-section" className="block text-sm font-semibold text-gray-600 mb-2">Choose Section</label>
            <select
              id="prep-section"
              value={prepSection}
              onChange={(e) => {
                setPrepSection(e.target.value);
                setSearchTerm('');
                setSelectedCompany(null);
                setSelectedStudyMaterial(null);
              }}
              className="w-full rounded-2xl border border-white/70 bg-white/85 px-4 py-3 font-medium text-gray-800 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
            >
              <option value="company">Company</option>
              <option value="study">Study Material</option>
            </select>
          </div>

          <div className="relative flex-1">
            <label htmlFor="prep-search" className="block text-sm font-semibold text-gray-600 mb-2">
              {prepSection === 'company' ? 'Search Company' : 'Search Subject'}
            </label>
            <Search className="absolute left-4 top-[3.35rem] -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="prep-search"
              type="text"
              placeholder={prepSection === 'company' ? 'Search by company name or role...' : 'Search by subject name...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-white/70 bg-white/85 py-3 pl-12 pr-4 text-gray-700 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
            />
          </div>
        </div>

        {!studyMaterialsAvailable && prepSection === 'study' && (
          <div className="max-w-4xl mx-auto mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800">
            The study material table is not available yet, so this section is showing the common subjects layout without saved admin content. Once the table is created, admin-added questions and links will appear here.
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
        ) : (
          <>
            {prepSection === 'company' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredCompanies.map((company, index) => (
                    <Reveal
                      key={company.id}
                      direction={index % 2 === 0 ? 'left' : 'right'}
                      delay={Math.min(index * 70, 280)}
                    >
                      <div
                        onClick={() => {
                          setSelectedCompany(company);
                          setActiveTab('overview');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="glass-panel mesh-card subject-card-glow visible-card-border rounded-[2rem] border hover:-translate-y-1 transition-all duration-300 overflow-hidden group cursor-pointer"
                      >
                        <div className="p-6 border-b border-white/60 relative">
                          <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight className="w-6 h-6 text-indigo-500" /></div>
                          <div className="flex justify-between items-start mb-4">
                            <div className={`w-14 h-14 ${getCompanyColor(company.name)} rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg`}>
                              {company.name?.[0] || 'C'}
                            </div>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">{company.name}</h3>
                          <p className="text-gray-500 font-medium">{company.role}</p>
                        </div>

                        <div className="p-6 space-y-4">
                          <div className="flex items-center gap-3 text-sm text-gray-600 font-medium flex-wrap">
                            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-lg border border-green-100">{company.ctc || 'N/A'}</span>
                            <span className="bg-gray-50 text-gray-700 px-3 py-1 rounded-lg border border-gray-200 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {company.visitDate || 'TBD'}</span>
                          </div>
                          <div className="flex items-start gap-3 text-sm text-gray-600 pt-2">
                            <Layers className="w-5 h-5 text-indigo-400 shrink-0" />
                            <div>
                              <span className="font-bold block text-gray-900 mb-1">Drives Setup</span>
                              <div className="flex flex-wrap gap-1">
                                {company.drives?.map((d, i) => <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100">{d}</span>)}
                                {(!company.drives || company.drives.length === 0) && <span className="text-xs text-gray-400">Will grow from experiences and admin updates</span>}
                              </div>
                            </div>
                          </div>
                          <div className="pt-2 flex flex-wrap gap-2">
                            <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100">
                              Auto questions: {company.autoQuestionCount}
                            </span>
                            {company.isSeededOnly && (
                              <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-100">
                                Community-ready page
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="px-6 py-4 bg-white/55 border-t border-white/60 text-center text-sm font-semibold text-indigo-700 group-hover:bg-indigo-50/90 transition-colors">Click to view full details & questions</div>
                      </div>
                    </Reveal>
                  ))}
                </div>

                {filteredCompanies.length === 0 && (
                  <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 max-w-2xl mx-auto">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No companies found</h3>
                    <p className="text-gray-500">We couldn&apos;t find any companies matching "{searchTerm}".</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredStudyMaterials.map((item, index) => {
                    const SubjectIcon = SUBJECT_ICON_MAP[item.subject_key] || Library;

                    return (
                      <Reveal
                        key={item.id}
                        direction={index % 2 === 0 ? 'left' : 'right'}
                        delay={Math.min(index * 70, 280)}
                      >
                        <div
                          onClick={() => {
                            setSelectedStudyMaterial(item);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="glass-panel mesh-card subject-card-glow visible-card-border rounded-[2rem] border hover:-translate-y-1 transition-all duration-300 p-6 group cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-4 mb-5">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                              <SubjectIcon className="w-7 h-7" />
                            </div>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{item.shortTitle}</h3>
                          <p className="text-sm font-medium text-gray-500 mb-4">{item.title}</p>
                          <p className="text-sm leading-6 text-gray-600 min-h-18">{item.description}</p>
                          <div className="mt-6 flex flex-wrap gap-2">
                            <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs text-blue-700">
                              Questions: {item.questions.length}
                            </span>
                            <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700">
                              Resources: {item.resources.length}
                            </span>
                          </div>
                        </div>
                      </Reveal>
                    );
                  })}
                </div>

                {filteredStudyMaterials.length === 0 && (
                  <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 max-w-2xl mx-auto">
                    <Library className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No study subjects found</h3>
                    <p className="text-gray-500">We couldn&apos;t find any study material matching "{searchTerm}".</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

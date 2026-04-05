import React, { useEffect, useRef, useState } from 'react';
import { Search, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../supabaseClient';

const PREVIEW_LENGTH = 240;

const RevealCard = ({ children, delay = 0 }) => {
  const [visible, setVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const node = cardRef.current;
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
      { threshold: 0.16, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className={`scroll-reveal ${visible ? 'is-visible' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const Explore = () => {
  const [experiences, setExperiences] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching feed:', error);
      } else {
        setExperiences(data || []);
      }

      setLoading(false);
    };

    fetchFeed();
  }, []);

  const filteredExperiences = experiences.filter((exp) =>
    (exp.company && exp.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (exp.role && exp.role.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (exp.content && exp.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleExpanded = (id) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="prep-hero-grid pt-24 pb-20 min-h-screen relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-sky-100/70 via-indigo-100/30 to-transparent"></div>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 relative">
          <div className="inline-flex items-center gap-2 bg-white/80 text-sky-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4 border visible-card-border shadow-sm">
            <Search className="w-4 h-4" /> <span>Explore Feed</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-4">Community Experiences</h2>
          <p className="text-slate-600 text-base md:text-lg">Browse real stories from batchmates and seniors.</p>
        </div>

        <div className="glass-panel visible-card-border p-4 rounded-2xl shadow-sm border mb-8 sticky top-20 z-40">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search companies, roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/90 border border-slate-300/70 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-blue-600">
            <Loader2 className="w-10 h-10 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredExperiences.length > 0 ? filteredExperiences.map((exp, index) => {
              const content = exp.content || '';
              const isExpanded = !!expandedCards[exp.id];
              const shouldShowToggle = content.length > PREVIEW_LENGTH;
              const displayContent = !shouldShowToggle || isExpanded
                ? content
                : `${content.slice(0, PREVIEW_LENGTH).trimEnd()}...`;

              return (
                <RevealCard key={exp.id} delay={(index % 6) * 50}>
                  <div className="glass-panel mesh-card visible-card-border rounded-[1.75rem] border p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div>
                      <h3 className="font-bold text-xl text-blue-600 mb-1">{exp.company}</h3>
                      <p className="font-semibold text-gray-800 mb-2">{exp.role}</p>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                      Shared by: {exp.author_email || 'Anonymous'}
                    </p>
                    <p className="text-gray-700 whitespace-pre-wrap leading-7">{displayContent}</p>
                    {shouldShowToggle && (
                      <button
                        type="button"
                        onClick={() => toggleExpanded(exp.id)}
                        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {isExpanded ? 'View less' : 'View more'}
                      </button>
                    )}
                  </div>
                </RevealCard>
              );
            }) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-400/80">
                <p className="text-gray-500 text-lg">No data found. </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;

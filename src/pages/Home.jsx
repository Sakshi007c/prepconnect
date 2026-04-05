import React, { useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Target, MessageSquare, Compass, Share2 } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';
import GradientText from '../components/GradientText';
import TypingText from '../components/TypingText';
import { supabase } from '../supabaseClient';

const EXPERIENCE_PREVIEW = 180;
const WORD_TOKEN_PATTERN = /\S+\s*/g;

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
      { threshold: 0.18 }
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

const defaultItemVariant = {
  hidden: { x: 150, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.7, ease: 'easeOut' }
  }
};

const SplittingText = React.forwardRef(function SplittingText(
  {
    text,
    type = 'chars',
    motionVariants = {},
    inView = false,
    inViewMargin = '0px',
    inViewOnce = true,
    delay = 0,
    className = '',
    itemClassName = '',
    ...props
  },
  ref
) {
  const items = useMemo(() => {
    if (Array.isArray(text)) {
      return text.flatMap((line, i) => [
        <React.Fragment key={`line-${i}`}>{line}</React.Fragment>,
        i < text.length - 1 ? <br key={`br-${i}`} /> : null
      ]);
    }

    if (type === 'words') {
      const tokens = text.match(WORD_TOKEN_PATTERN) || [];
      return tokens.map((token, i) => <React.Fragment key={i}>{token}</React.Fragment>);
    }

    return text.split('').map((char, i) => <React.Fragment key={i}>{char}</React.Fragment>);
  }, [text, type]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: delay / 1000,
        staggerChildren:
          motionVariants.stagger ?? (type === 'chars' ? 0.05 : type === 'words' ? 0.2 : 0.3)
      }
    }
  };

  const itemVariants = {
    hidden: {
      ...defaultItemVariant.hidden,
      ...(motionVariants.initial || {})
    },
    visible: {
      ...defaultItemVariant.visible,
      ...(motionVariants.animate || {}),
      transition: {
        ...(defaultItemVariant.visible.transition || {}),
        ...(motionVariants.transition || {})
      }
    }
  };

  const localRef = useRef(null);
  useImperativeHandle(ref, () => localRef.current);

  const inViewResult = useInView(localRef, {
    once: inViewOnce,
    margin: inViewMargin
  });
  const isInView = !inView || inViewResult;

  return (
    <motion.span
      animate={isInView ? 'visible' : 'hidden'}
      initial="hidden"
      ref={localRef}
      variants={containerVariants}
      className={className}
      {...props}
    >
      {items.map(
        (item, index) =>
          item && (
            <React.Fragment key={index}>
              <motion.span
                style={{
                  display: 'inline-block',
                  whiteSpace: type === 'chars' ? 'pre' : 'normal'
                }}
                className={itemClassName}
                variants={itemVariants}
              >
                {item}
              </motion.span>
              {type === 'words' && ' '}
            </React.Fragment>
          )
      )}
    </motion.span>
  );
});

const Home = () => {
  const [featuredExperiences, setFeaturedExperiences] = useState([]);

  useEffect(() => {
    const loadFeaturedExperiences = async () => {
      const { data, error } = await supabase
        .from('experiences')
        .select('id, company, role, content, author_email')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error loading featured experiences:', error);
        return;
      }

      setFeaturedExperiences(data || []);
    };

    loadFeaturedExperiences();
  }, []);

  return (
    <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.16),transparent_26%),radial-gradient(circle_at_top_right,rgba(129,140,248,0.14),transparent_24%),linear-gradient(180deg,#f7fbff_0%,#eef4ff_48%,#f8fafc_100%)]">
      <div className="absolute inset-0 opacity-55 bg-[linear-gradient(rgba(99,102,241,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.06)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      <div className="pointer-events-none absolute left-1/2 top-44 h-[420px] w-[780px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.12),transparent_62%)] blur-3xl"></div>

      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-28 overflow-hidden">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <Reveal direction="up">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
                <Users className="w-4 h-4" />
                <span>Connecting Students Together</span>
              </div>
            </Reveal>

            <Reveal direction="up" delay={60}>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                <SplittingText
                  text="Learn from real stories."
                  type="words"
                  inView
                  className="block"
                  motionVariants={{
                    initial: { x: 110, opacity: 0, filter: 'blur(8px)' },
                    animate: { x: 0, opacity: 1, filter: 'blur(0px)' },
                    transition: { duration: 0.7, ease: 'easeOut' },
                    stagger: 0.18
                  }}
                />
                <SplittingText
                  text="Share your success."
                  type="words"
                  inView
                  delay={250}
                  className="mt-2 block"
                  itemClassName="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"
                  motionVariants={{
                    initial: { x: 110, opacity: 0, filter: 'blur(8px)' },
                    animate: { x: 0, opacity: 1, filter: 'blur(0px)' },
                    transition: { duration: 0.7, ease: 'easeOut' },
                    stagger: 0.18
                  }}
                />
              </h1>
            </Reveal>

            <Reveal direction="right" delay={140}>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                PrepConnect is a student-driven preparation platform that helps users explore real interview experiences,
                discover company-specific prep material, and build confidence through shared community insights.
              </p>
            </Reveal>

            <Reveal direction="up" delay={200}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/explore"
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2 group"
                >
                  Explore Experiences
                  <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                </Link>
                <Link
                  to="/share"
                  className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border-2 border-gray-100 rounded-2xl font-bold text-lg hover:border-blue-200 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                >
                  Share Experience
                  <Share2 className="w-5 h-5 text-gray-500" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal direction="left">
            <div className="text-center mb-16">
              <TypingText
                as="h2"
                text="Connect, Share, Grow"
                startOnVisible
                loop={false}
                typingSpeed={55}
                initialDelay={120}
                showCursor
                className="text-3xl md:text-4xl font-bold mb-4 text-gray-900"
                cursorClassName="ml-1"
              />
              <p className="text-gray-500 max-w-2xl mx-auto">A platform built around the power of shared knowledge and community support.</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Reveal direction="left">
              <FeatureCard
                icon={Target}
                title="Real Interview Archives"
                description="Access a massive database of recent interview questions and experiences from top companies."
                color="bg-blue-600"
              />
            </Reveal>
            <Reveal direction="up" delay={60}>
              <FeatureCard
                icon={Users}
                title="Find a Mentor"
                description="Connect with seniors and professionals who have already cracked the exams you are preparing for."
                color="bg-indigo-600"
              />
            </Reveal>
            <Reveal direction="right" delay={120}>
              <FeatureCard
                icon={MessageSquare}
                title="Prepare yourself"
                description="Find questions of different companies, roles, and difficulty levels to practice and prepare effectively."
                color="bg-orange-500"
              />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Reveal direction="up">
            <div className="text-center mb-14">
              <div className="inline-flex items-center rounded-xl bg-indigo-300/70 px-4 py-2 text-sm font-semibold text-white mb-6">
                Experience Highlights
              </div>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900">
                <GradientText
                  text="True experiences from our feed"
                  neon
                  className="pb-2"
                  gradient="linear-gradient(90deg, #1d4ed8 0%, #7c3aed 25%, #ec4899 50%, #7c3aed 75%, #1d4ed8 100%)"
                />
              </h2>
              <p className="mt-4 text-sm md:text-base text-gray-600">
                A quick look at what students have actually shared on PrepConnect
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {featuredExperiences.map((item, index) => (
              <Reveal
                key={item.id}
                direction={index % 2 === 0 ? 'left' : 'right'}
                delay={index * 80}
              >
                <div className="glass-panel mesh-card visible-card-border rounded-[1.4rem] border p-6 min-h-[250px] bg-white/62 shadow-[0_20px_48px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
                  <div className="mb-5 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {item.company || 'Community Post'}
                  </div>
                  <p className="text-gray-900 leading-7 text-[15px] font-medium">
                    &quot;{(item.content || '').length > EXPERIENCE_PREVIEW ? `${item.content.slice(0, EXPERIENCE_PREVIEW).trimEnd()}...` : (item.content || 'Experience coming soon.')}&quot;
                  </p>
                  <div className="mt-8 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{item.author_email || 'Anonymous'}</p>
                      <p className="text-sm text-gray-600">{item.role || 'Role not shared'}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {featuredExperiences.length === 0 && (
        <section className="pb-24 relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="glass-panel visible-card-border rounded-3xl border p-10 text-center bg-white/70">
              <p className="text-gray-600">No shared experiences yet. Once students start posting, the latest 3 will appear here.</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;

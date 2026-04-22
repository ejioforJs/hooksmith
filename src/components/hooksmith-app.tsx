"use client";

import Image from "next/image";
import {
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useTransition,
} from "react";

import {
  CATEGORY_SUMMARIES,
  FILTERS,
  SAMPLE_TOPICS,
  generateHooks,
  type GeneratedHook,
  type HookCategory,
  type HookFilter,
} from "@/lib/hook-engine";

const TOPIC_HISTORY_KEY = "hooksmith:recent-topics";

const FOUNDER = {
  name: "Paul Nweke",
  title: "Founder, HookSmith",
  address: "58B Ibadan Street, Ebute-Metta (West), Lagos State",
  image: "/founder.jpeg",
  linkedIn:
    "https://www.linkedin.com/in/paul-nweke-164803370?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
};

const HERO_STATS = [
  {
    label: "Hooks per run",
    value: "10",
    detail: "Each topic returns ten hook options.",
  },
  {
    label: "Hook types",
    value: "4",
    detail: "Curiosity, story, contrarian, and urgency.",
  },
  {
    label: "Saved topics",
    value: "5",
    detail: "Recent topics stay available on this device.",
  },
];

const WORKFLOW_POINTS = [
  "Enter a topic or content idea.",
  "Generate a fresh batch of opening lines.",
  "Filter the batch and copy the hooks you want to test.",
];

const USE_CASES = [
  "Short-form videos",
  "Launch campaigns",
  "Brand storytelling",
  "Social content",
];

const WORKSPACE_FEATURES = [
  {
    title: "Generate",
    detail: "Create ten hooks from one topic in a single run.",
  },
  {
    title: "Review",
    detail: "Filter the results by category so strong angles stand out quickly.",
  },
  {
    title: "Reuse",
    detail: "Keep recent topics on-device and rerun them whenever you need a fresh batch.",
  },
];

export function HookSmithApp() {
  const [topic, setTopic] = useState("");
  const [recentTopics, setRecentTopics] = useState<string[]>(() => readStoredTopics());
  const [hooks, setHooks] = useState<GeneratedHook[]>([]);
  const [activeFilter, setActiveFilter] = useState<HookFilter>("All");
  const [lastGeneratedTopic, setLastGeneratedTopic] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const generationTimerRef = useRef<number | null>(null);
  const deferredTopic = useDeferredValue(topic.trim());

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(TOPIC_HISTORY_KEY, JSON.stringify(recentTopics));
  }, [recentTopics]);

  useEffect(() => {
    if (!copiedId) {
      return;
    }

    const timeout = window.setTimeout(() => setCopiedId(null), 1800);
    return () => window.clearTimeout(timeout);
  }, [copiedId]);

  useEffect(() => {
    return () => {
      if (generationTimerRef.current !== null) {
        window.clearTimeout(generationTimerRef.current);
      }
    };
  }, []);

  const visibleHooks =
    activeFilter === "All"
      ? hooks
      : hooks.filter((hook) => hook.category === activeFilter);

  const totalHookCount = hooks.length;
  const isBusy = isGenerating || isPending;
  const canGenerate = Boolean(topic.trim()) && !isBusy;
  const currentTopicLabel = deferredTopic || "none yet";

  function runGeneration(overrideTopic?: string) {
    const nextTopic = sanitizeTopic(overrideTopic ?? topic);

    if (!nextTopic || isGenerating) {
      return;
    }

    if (generationTimerRef.current !== null) {
      window.clearTimeout(generationTimerRef.current);
    }

    setIsGenerating(true);
    setCopiedId(null);
    generationTimerRef.current = window.setTimeout(() => {
      const nextHooks = generateHooks(nextTopic, 10);

      startTransition(() => {
        setHooks(nextHooks);
        setActiveFilter("All");
        setLastGeneratedTopic(nextTopic);
        setTopic(nextTopic);
        setRecentTopics((previousTopics) => mergeRecentTopics(previousTopics, nextTopic));
      });

      setIsGenerating(false);
      generationTimerRef.current = null;
    }, 680);
  }

  const handleShortcut = useEffectEvent(() => {
    runGeneration();
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        handleShortcut();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function handleCopy(hook: GeneratedHook) {
    try {
      await navigator.clipboard.writeText(hook.text);
      setCopiedId(hook.id);
    } catch {
      setCopiedId(null);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runGeneration();
  }

  function handleClearRecent() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(TOPIC_HISTORY_KEY);
    }

    setRecentTopics([]);
  }

  return (
    <main className="app-shell mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <header className="sticky top-3 z-30 mb-6">
        <div className="topbar-shell flex flex-col gap-4 rounded-[1.7rem] px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <a href="#" className="flex items-center gap-3">
            <span className="brand-mark shrink-0" aria-hidden="true" />
            <div>
              <p className="text-lg font-semibold tracking-[-0.03em] text-zinc-50">HookSmith</p>
              <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-zinc-500">
                Hook generation workspace
              </p>
            </div>
          </a>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
            <nav className="flex flex-wrap gap-2">
              <a href="#generator" className="secondary-button w-full sm:w-auto">
                Generator
              </a>
              <a href="#results" className="secondary-button w-full sm:w-auto">
                Results
              </a>
              <a href="#founder" className="secondary-button w-full sm:w-auto">
                Founder
              </a>
            </nav>
            <a href="#generator" className="primary-button w-full sm:w-auto">
              Start generating
            </a>
          </div>
        </div>
      </header>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] 2xl:items-start">
        <section className="surface-panel surface-panel--hero hero-panel fade-rise min-w-0 rounded-[2.2rem] px-5 py-6 sm:px-7 sm:py-8 lg:px-8 lg:py-9">
          <div className="flex flex-wrap items-center gap-3">
            <span className="eyebrow-badge rounded-full border border-amber-300/18 bg-amber-300/10 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-amber-100">
              Hook generator
            </span>
            <span className="eyebrow-badge rounded-full border border-sky-300/16 bg-sky-300/10 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-sky-100">
              Videos, posts, and campaigns
            </span>
          </div>

          <div className="mt-8 grid min-w-0 gap-8">
            <div className="hero-copy max-w-3xl pr-1 sm:pr-2">
              <h1 className="max-w-4xl font-serif text-[3rem] leading-[1.02] tracking-[-0.04em] text-zinc-50 sm:text-[4rem] sm:leading-[0.98] lg:text-[5rem] lg:leading-[0.94]">
                Generate stronger hooks from one topic.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
                HookSmith turns a topic into ten opening lines you can review, filter, and copy for
                your next video, post, script, or launch.
              </p>
            </div>

            <form id="generator" onSubmit={handleSubmit} className="min-w-0">
              <div className="generator-console min-w-0 rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-3 sm:p-4">
                <label
                  htmlFor="topic"
                  className="block px-2 pb-3 text-sm font-medium tracking-[0.01em] text-zinc-400"
                >
                  Topic or idea
                </label>
                <div className="flex min-w-0 flex-col gap-3 2xl:flex-row">
                  <input
                    id="topic"
                    type="text"
                    value={topic}
                    onChange={(event) => setTopic(event.target.value)}
                    placeholder="Enter a topic to generate hooks"
                    className="app-input min-w-0 flex-1"
                  />
                  <button
                    type="submit"
                    disabled={!canGenerate}
                    className="primary-button w-full disabled:cursor-not-allowed disabled:opacity-55 2xl:w-auto"
                  >
                    {isBusy ? "Forging hooks..." : "Generate hooks"}
                  </button>
                </div>
                <div className="mt-4 flex flex-col gap-2 px-1 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
                  <p>
                    Current focus: <span className="text-zinc-200">{currentTopicLabel}</span>
                  </p>
                  <p>
                    Shortcut: <span className="font-semibold text-zinc-200">Cmd/Ctrl + Enter</span>
                  </p>
                </div>
              </div>
            </form>

            <div className="mt-1 min-w-0">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-zinc-300">Quick topics</p>
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Tap to autofill
                </p>
              </div>
              <div className="quick-topic-row mt-4 flex max-w-full gap-2 overflow-x-auto pb-2">
                {SAMPLE_TOPICS.map((sampleTopic) => (
                  <button
                    key={sampleTopic}
                    type="button"
                    onClick={() => {
                      setTopic(sampleTopic);
                      runGeneration(sampleTopic);
                    }}
                    className="chip-button shrink-0"
                  >
                    {sampleTopic}
                  </button>
                ))}
              </div>
            </div>

            <div className="stats-grid grid min-w-0 gap-3 sm:grid-cols-3">
              {HERO_STATS.map((item) => (
                <article
                  key={item.label}
                  className="metric-card rounded-[1.5rem] border border-white/9 bg-white/[0.035] px-4 py-4"
                >
                  <p className="text-sm font-medium text-zinc-400">{item.label}</p>
                  <strong className="mt-4 block text-[2rem] font-semibold tracking-[-0.05em] text-zinc-50">
                    {item.value}
                  </strong>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <aside className="surface-panel surface-panel--deep fade-rise min-w-0 rounded-[2.2rem] px-5 py-6 sm:px-6 sm:py-7 xl:w-full">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            Workflow
          </p>
          <h2 className="mt-3 text-[1.65rem] font-semibold tracking-[-0.04em] text-zinc-50">
            From one idea to a ready-to-review batch.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-zinc-400">
            The interface stays narrow on purpose so you can move from input to usable hook options
            without losing momentum.
          </p>

          <div className="mt-6 space-y-3">
            {WORKFLOW_POINTS.map((point, index) => (
              <article
                key={point}
                className="step-card flex items-start gap-4 rounded-[1.45rem] border border-white/8 bg-white/[0.03] px-4 py-4"
              >
                <span className="step-index mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-300/18 bg-amber-300/10 text-sm font-semibold text-amber-100">
                  0{index + 1}
                </span>
                <p className="text-sm leading-7 text-zinc-300">{point}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-[1.55rem] border border-white/8 bg-black/20 px-4 py-5">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Best for
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {USE_CASES.map((useCase) => (
                <span
                  key={useCase}
                  className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-zinc-300"
                >
                  {useCase}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <article className="rounded-[1.35rem] border border-white/9 bg-white/[0.025] px-4 py-4">
              <p className="text-sm font-medium text-zinc-400">Current topic</p>
              <p className="mt-3 text-lg font-semibold tracking-[-0.03em] text-zinc-100">
                {currentTopicLabel}
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Update the topic field at any time and generate a fresh direction.
              </p>
            </article>

            <article className="rounded-[1.35rem] border border-white/9 bg-white/[0.025] px-4 py-4">
              <p className="text-sm font-medium text-zinc-400">Saved locally</p>
              <p className="mt-3 text-lg font-semibold tracking-[-0.03em] text-zinc-100">
                {recentTopics.length} recent {recentTopics.length === 1 ? "topic" : "topics"}
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Reopen previous ideas quickly without leaving the page.
              </p>
            </article>
          </div>
        </aside>
      </section>

      <section
        id="results"
        className="mt-6 surface-panel rounded-[2.2rem] px-5 py-6 sm:px-7 sm:py-7"
      >
        <div className="flex flex-col gap-6 border-b border-white/8 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Generated hooks
            </p>
            <h2 className="mt-2 text-[1.9rem] font-semibold tracking-[-0.045em] text-zinc-50">
              {lastGeneratedTopic ? `Hooks for ${lastGeneratedTopic}` : "Your hooks will appear here"}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
              {lastGeneratedTopic
                ? `Filter the batch by type, copy what works, and generate another set whenever you need a new direction.`
                : "Generate a topic above to see ten hooks here."}
            </p>
          </div>

          <div className="filter-rail -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                data-active={activeFilter === filter}
                className="filter-tab shrink-0"
              >
                <span>{filter}</span>
                <span className="text-xs text-zinc-500">
                  {filter === "All"
                    ? totalHookCount
                    : hooks.filter((hook) => hook.category === filter).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {recentTopics.length ? (
          <div className="mt-5 flex flex-col gap-4 rounded-[1.55rem] border border-white/8 bg-white/[0.025] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-300">Recent topics</p>
              <p className="mt-1 text-sm text-zinc-500">Saved on this device for quick reruns.</p>
            </div>
            <div className="quick-topic-row flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
              {recentTopics.map((savedTopic) => (
                <button
                  key={savedTopic}
                  type="button"
                  onClick={() => {
                    setTopic(savedTopic);
                    runGeneration(savedTopic);
                  }}
                  className="chip-button"
                >
                  {savedTopic}
                </button>
              ))}
              <button type="button" onClick={handleClearRecent} className="copy-button">
                Clear
              </button>
            </div>
          </div>
        ) : null}

        {isGenerating ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {Array.from({ length: 10 }, (_, index) => (
              <article
                key={index}
                className="skeleton-shimmer rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5"
              >
                <div className="h-7 w-28 rounded-full bg-white/[0.06]" />
                <div className="mt-5 h-4 w-11/12 rounded-full bg-white/[0.06]" />
                <div className="mt-3 h-4 w-full rounded-full bg-white/[0.06]" />
                <div className="mt-3 h-4 w-4/5 rounded-full bg-white/[0.06]" />
                <div className="mt-6 h-10 w-24 rounded-full bg-white/[0.06]" />
              </article>
            ))}
          </div>
        ) : totalHookCount ? (
          visibleHooks.length ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {visibleHooks.map((hook) => (
                <article
                  key={hook.id}
                  className="hook-card group rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5 shadow-[0_16px_38px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:border-amber-300/24 hover:bg-white/[0.05]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="rounded-full border border-amber-300/16 bg-amber-300/10 px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-amber-100">
                        {hook.badge}
                      </span>
                      <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                        {hook.category}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(hook)}
                      data-copied={copiedId === hook.id}
                      className="copy-button shrink-0"
                    >
                      {copiedId === hook.id ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <p className="mt-6 text-[1.12rem] leading-8 tracking-[-0.02em] text-zinc-50">
                    {hook.text}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[1.6rem] border border-dashed border-white/12 bg-white/[0.025] px-5 py-6 text-center">
              <p className="text-sm font-medium text-zinc-200">No {activeFilter} hooks in this run.</p>
              <p className="mt-2 text-sm leading-7 text-zinc-500">
                Switch back to <span className="text-zinc-300">All</span> or generate a new batch.
              </p>
            </div>
          )
        ) : (
          <section className="mt-6 rounded-[1.8rem] border border-dashed border-white/12 bg-white/[0.025] px-6 py-8 text-center">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              No hooks yet
            </p>
            <h3 className="mt-3 font-serif text-[2.2rem] tracking-[-0.05em] text-zinc-50">
              Enter a topic to generate your first batch.
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
              You can also start with one of the quick topics below.
            </p>
            <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
              {SAMPLE_TOPICS.map((sampleTopic) => (
                <button
                  key={sampleTopic}
                  type="button"
                  onClick={() => {
                    setTopic(sampleTopic);
                    runGeneration(sampleTopic);
                  }}
                  className="rounded-[1.35rem] border border-white/8 bg-white/[0.03] px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-white/16 hover:bg-white/[0.05]"
                >
                  <p className="text-sm font-semibold text-zinc-100">{sampleTopic}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">Generate hooks for this topic.</p>
                </button>
              ))}
            </div>
          </section>
        )}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
        <section className="surface-panel rounded-[2.2rem] px-5 py-6 sm:px-7 sm:py-7">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            Hook types
          </p>
          <h2 className="mt-3 text-[1.8rem] font-semibold tracking-[-0.045em] text-zinc-50">
            Each batch uses four simple hook categories.
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {(Object.keys(CATEGORY_SUMMARIES) as HookCategory[]).map((category, index) => (
              <article
                key={category}
                className="category-card rounded-[1.55rem] border border-white/8 bg-white/[0.03] px-4 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm font-semibold tracking-[-0.02em] text-zinc-100">{category}</p>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                    0{index + 1}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-zinc-500">
                  {CATEGORY_SUMMARIES[category]}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="surface-panel surface-panel--deep rounded-[2.2rem] px-5 py-6 sm:px-7 sm:py-7">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            What you can do
          </p>
          <h2 className="mt-3 text-[1.8rem] font-semibold tracking-[-0.045em] text-zinc-50">
            Built to feel clean on mobile and expansive on desktop.
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {WORKSPACE_FEATURES.map((feature) => (
              <FeatureRow key={feature.title} title={feature.title} detail={feature.detail} />
            ))}
          </div>
        </section>
      </section>

      <footer className="mt-6 grid gap-6">
        <section className="surface-panel rounded-[2.2rem] px-5 py-6 sm:px-7 sm:py-7">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            About HookSmith
          </p>
          <div className="mt-3 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)] lg:items-start">
            <div>
              <h2 className="text-[1.8rem] font-semibold tracking-[-0.045em] text-zinc-50">
                Hook generation for creators and marketing teams.
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
                HookSmith helps turn one topic into multiple opening lines for content, campaigns,
                and short-form ideas. The workflow is simple: enter a topic, review the batch, copy
                what fits, and generate again when you want more options.
              </p>
            </div>

            <div className="rounded-[1.7rem] border border-white/8 bg-white/[0.03] px-4 py-5">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Built for
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {USE_CASES.map((useCase) => (
                  <span
                    key={useCase}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-300"
                  >
                    {useCase}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="founder"
          className="surface-panel surface-panel--deep rounded-[2.2rem] px-5 py-6 sm:px-7 sm:py-7"
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)] lg:items-stretch">
            <div className="founder-photo-shell relative min-h-[360px] overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.03]">
              <Image
                src={FOUNDER.image}
                alt={`Portrait of ${FOUNDER.name}`}
                fill
                sizes="(min-width: 1024px) 360px, 100vw"
                className="object-cover object-[center_24%]"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-5 bottom-5">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-zinc-200/80">
                  Founder spotlight
                </p>
                <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">
                  {FOUNDER.name}
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Founder
                </p>
                <h2 className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-zinc-50 sm:text-[2.4rem]">
                  Paul Nweke leads the product direction behind HookSmith.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
                  HookSmith is being built as a focused tool for creators and teams who need
                  stronger opening lines without a bloated workflow.
                </p>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.55rem] border border-white/8 bg-white/[0.03] px-4 py-4">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Role
                  </p>
                  <p className="mt-2 text-sm font-medium leading-7 text-zinc-200">{FOUNDER.title}</p>
                </div>
                <div className="rounded-[1.55rem] border border-white/8 bg-white/[0.03] px-4 py-4">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Company address
                  </p>
                  <address className="mt-2 not-italic text-sm leading-7 text-zinc-300">
                    {FOUNDER.address}
                  </address>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-xl text-sm leading-7 text-zinc-400">
                  For partnerships, collaborations, and product inquiries, reach out through the founder&apos;s
                  LinkedIn profile.
                </p>
                <a
                  href={FOUNDER.linkedIn}
                  target="_blank"
                  rel="noreferrer"
                  className="secondary-button w-full sm:w-auto"
                >
                  View LinkedIn
                </a>
              </div>
            </div>
          </div>
        </section>
      </footer>
    </main>
  );
}

function FeatureRow({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <article className="feature-card rounded-[1.45rem] border border-white/8 bg-white/[0.03] px-4 py-4">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">{title}</p>
      <p className="mt-2 text-sm leading-7 text-zinc-500">{detail}</p>
    </article>
  );
}

function readStoredTopics() {
  if (typeof window === "undefined") {
    return [];
  }

  const storedValue = window.localStorage.getItem(TOPIC_HISTORY_KEY);

  if (!storedValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(storedValue);
    return Array.isArray(parsedValue)
      ? parsedValue.filter((value): value is string => typeof value === "string").slice(0, 5)
      : [];
  } catch {
    return [];
  }
}

function mergeRecentTopics(previousTopics: string[], nextTopic: string) {
  return [nextTopic, ...previousTopics.filter((topic) => topic !== nextTopic)].slice(0, 5);
}

function sanitizeTopic(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

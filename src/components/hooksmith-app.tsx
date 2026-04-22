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
    <main className="app-shell mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <a href="#" className="flex items-center gap-3">
          <span className="brand-mark shrink-0" aria-hidden="true" />
          <div>
            <p className="text-lg font-semibold tracking-[-0.03em] text-zinc-50">HookSmith</p>
          </div>
        </a>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <a href="#generator" className="secondary-button w-full sm:w-auto">
            Generator
          </a>
          <a href="#results" className="secondary-button w-full sm:w-auto">
            Results
          </a>
          <a href="#founder" className="secondary-button w-full sm:w-auto">
            Founder
          </a>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,320px)]">
        <section className="surface-panel surface-panel--hero fade-rise rounded-[2rem] px-5 py-6 sm:px-7 sm:py-7 lg:px-8 lg:py-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-amber-300/18 bg-amber-300/10 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-amber-100">
              Hook generator
            </span>
            <span className="rounded-full border border-sky-300/16 bg-sky-300/10 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-sky-100">
              Videos, posts, and campaigns
            </span>
          </div>

          <h1 className="mt-8 max-w-3xl font-serif text-[3rem] leading-[0.95] tracking-[-0.05em] text-zinc-50 sm:text-[4rem] lg:text-[4.8rem]">
            Generate stronger hooks from one topic
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
            HookSmith turns a topic into ten opening lines you can review, filter, and copy for
            your next video, post, script, or launch.
          </p>

          <form id="generator" onSubmit={handleSubmit} className="mt-8">
            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-3 shadow-[0_18px_36px_rgba(0,0,0,0.18)]">
              <label htmlFor="topic" className="block px-2 pb-2 text-sm font-medium text-zinc-400">
                Topic or idea
              </label>
              <div className="flex flex-col gap-3 md:flex-row">
                <input
                  id="topic"
                  type="text"
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  placeholder="Enter a topic to generate hooks"
                  className="app-input flex-1"
                />
                <button
                  type="submit"
                  disabled={!canGenerate}
                  className="primary-button w-full disabled:cursor-not-allowed disabled:opacity-55 md:w-auto"
                >
                  {isBusy ? "Forging hooks..." : "Generate hooks"}
                </button>
              </div>
              <div className="mt-3 flex flex-col gap-2 px-1 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Current focus: <span className="text-zinc-200">{currentTopicLabel}</span>
                </p>
                <p>
                  Shortcut: <span className="font-semibold text-zinc-200">Cmd/Ctrl + Enter</span>
                </p>
              </div>
            </div>
          </form>

          <div className="mt-6">
            <p className="mb-3 text-sm font-medium text-zinc-400">Quick topics</p>
            <div className="flex flex-wrap items-center gap-2">
              {SAMPLE_TOPICS.map((sampleTopic) => (
                <button
                  key={sampleTopic}
                  type="button"
                  onClick={() => {
                    setTopic(sampleTopic);
                    runGeneration(sampleTopic);
                  }}
                  className="chip-button"
                >
                  {sampleTopic}
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="surface-panel surface-panel--deep fade-rise rounded-[2rem] px-5 py-6 sm:px-6">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            How it works
          </p>
          <h2 className="mt-3 text-[1.65rem] font-semibold tracking-[-0.04em] text-zinc-50">
            One focused workspace for hook generation.
          </h2>
          <div className="mt-6 grid gap-3">
            {HERO_STATS.map((item) => (
              <article
                key={item.label}
                className="rounded-[1.35rem] border border-white/9 bg-white/[0.035] px-4 py-4"
              >
                <div className="flex items-end justify-between gap-3">
                  <p className="text-sm font-medium text-zinc-400">{item.label}</p>
                  <strong className="text-2xl font-semibold tracking-[-0.04em] text-zinc-50">
                    {item.value}
                  </strong>
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-500">{item.detail}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-[1.45rem] border border-white/8 bg-black/20 px-4 py-5">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Steps
            </p>
            <ul className="mt-4 space-y-3">
              {WORKFLOW_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm leading-6 text-zinc-300">
                  <span className="mt-2 h-2.5 w-2.5 rounded-full bg-amber-300" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>

      <section id="results" className="mt-6 surface-panel rounded-[2rem] px-5 py-6 sm:px-7 sm:py-7">
        <div className="flex flex-col gap-4 border-b border-white/8 pb-5 lg:flex-row lg:items-start lg:justify-between">
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

          <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                data-active={activeFilter === filter}
                className="filter-tab"
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
          <div className="mt-5 flex flex-col gap-3 rounded-[1.45rem] border border-white/8 bg-white/[0.025] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-300">Recent topics</p>
              <p className="mt-1 text-sm text-zinc-500">Saved on this device for quick reruns.</p>
            </div>
            <div className="flex flex-wrap gap-2">
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
                className="skeleton-shimmer rounded-[1.65rem] border border-white/8 bg-white/[0.03] p-5"
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
                  className="group rounded-[1.65rem] border border-white/8 bg-white/[0.03] p-5 shadow-[0_16px_38px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:border-amber-300/24 hover:bg-white/[0.05]"
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
        <section className="surface-panel rounded-[2rem] px-5 py-6 sm:px-7">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            Hook types
          </p>
          <h2 className="mt-3 text-[1.8rem] font-semibold tracking-[-0.045em] text-zinc-50">
            Each batch uses four simple hook categories.
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {(Object.keys(CATEGORY_SUMMARIES) as HookCategory[]).map((category) => (
              <article
                key={category}
                className="rounded-[1.45rem] border border-white/8 bg-white/[0.03] px-4 py-4"
              >
                <p className="text-sm font-semibold tracking-[-0.02em] text-zinc-100">{category}</p>
                <p className="mt-2 text-sm leading-7 text-zinc-500">
                  {CATEGORY_SUMMARIES[category]}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="surface-panel surface-panel--deep rounded-[2rem] px-5 py-6 sm:px-7">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            What you can do
          </p>
          <h2 className="mt-3 text-[1.8rem] font-semibold tracking-[-0.045em] text-zinc-50">
            The page stays focused on hook generation.
          </h2>
          <div className="mt-6 grid gap-3">
            <FeatureRow
              title="Generate"
              detail="Create ten hooks from one topic in a single run."
            />
            <FeatureRow
              title="Filter"
              detail="Switch between all hooks, curiosity, story, contrarian, and urgency."
            />
            <FeatureRow
              title="Copy"
              detail="Copy each hook individually when you find one you want to use."
            />
          </div>
        </section>
      </section>

      <footer className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="surface-panel rounded-[2rem] px-5 py-6 sm:px-7">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            About HookSmith
          </p>
          <h2 className="mt-3 text-[1.8rem] font-semibold tracking-[-0.045em] text-zinc-50">
            Hook generation for creators and marketing teams.
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
            HookSmith helps turn one topic into multiple opening lines for content, campaigns, and
            short-form ideas. The workflow is simple: enter a topic, review the batch, copy what
            fits, and generate again when you want more options.
          </p>
        </section>

        <section
          id="founder"
          className="surface-panel rounded-[2rem] px-5 py-6 sm:px-7"
        >
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            Founder
          </p>
          <div className="mt-4 overflow-hidden rounded-[1.45rem] border border-white/8 bg-white/[0.03]">
            <Image
              src={FOUNDER.image}
              alt={`Portrait of ${FOUNDER.name}`}
              width={774}
              height={1032}
              sizes="(min-width: 1024px) 320px, 100vw"
              className="h-[280px] w-full object-cover object-top"
              priority
            />
          </div>
          <h2 className="mt-3 text-[1.45rem] font-semibold tracking-[-0.035em] text-zinc-50">
            {FOUNDER.name}
          </h2>
          <p className="mt-2 text-sm font-medium text-zinc-300">{FOUNDER.title}</p>
          <div className="mt-4 rounded-[1.35rem] border border-white/8 bg-white/[0.03] px-4 py-4">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Company address
            </p>
            <address className="mt-2 not-italic text-sm leading-7 text-zinc-300">
              {FOUNDER.address}
            </address>
          </div>
          <p className="mt-4 text-sm leading-7 text-zinc-400">
            For partnerships, collaborations, and product inquiries, reach out through the founder&apos;s
            LinkedIn profile.
          </p>
          <a
            href={FOUNDER.linkedIn}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-zinc-100 transition hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.05]"
          >
            View LinkedIn
          </a>
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
    <article className="rounded-[1.35rem] border border-white/8 bg-white/[0.03] px-4 py-4">
      <p className="text-sm font-semibold text-zinc-100">{title}</p>
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

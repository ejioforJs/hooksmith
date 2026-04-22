export type HookCategory = "Curiosity" | "Story" | "Contrarian" | "Urgency";
export type HookFilter = "All" | HookCategory;

export type HookTemplate = {
  id: string;
  category: HookCategory;
  badge: string;
  template: string;
};

export type GeneratedHook = {
  id: string;
  category: HookCategory;
  badge: string;
  text: string;
};

export const FILTERS: HookFilter[] = ["All", "Curiosity", "Story", "Contrarian", "Urgency"];

export const SAMPLE_TOPICS = [
  "AI thumbnails",
  "personal finance for students",
  "email copywriting",
  "gym consistency",
  "remote team onboarding",
];

export const CATEGORY_SUMMARIES: Record<HookCategory, string> = {
  Curiosity: "Open loops, missing context, and sharp information gaps.",
  Story: "First-person frames and lived proof that feel more human.",
  Contrarian: "Clear pushback against the common advice people keep repeating.",
  Urgency: "Time pressure and consequences that pull attention forward fast.",
};

const HOOK_TEMPLATES: HookTemplate[] = [
  {
    id: "curiosity-1",
    category: "Curiosity",
    badge: "Gap opener",
    template: "Nobody tells you this about {topic}",
  },
  {
    id: "curiosity-2",
    category: "Curiosity",
    badge: "Missed angle",
    template: "The part of {topic} people ignore is the part that changes everything",
  },
  {
    id: "curiosity-3",
    category: "Curiosity",
    badge: "Behind the scenes",
    template: "What actually happens when you get serious about {topic}",
  },
  {
    id: "curiosity-4",
    category: "Curiosity",
    badge: "Hidden mistake",
    template: "Most people think they understand {topic} until they see this",
  },
  {
    id: "curiosity-5",
    category: "Curiosity",
    badge: "Unexpected truth",
    template: "The smartest thing you can do with {topic} is probably not what you think",
  },
  {
    id: "story-1",
    category: "Story",
    badge: "Personal proof",
    template: "I tried {topic} for 7 days...",
  },
  {
    id: "story-2",
    category: "Story",
    badge: "Before and after",
    template: "I changed one thing about {topic} and the result surprised me",
  },
  {
    id: "story-3",
    category: "Story",
    badge: "Field note",
    template: "What I learned after rebuilding my approach to {topic}",
  },
  {
    id: "story-4",
    category: "Story",
    badge: "Quiet turnaround",
    template: "I was getting nowhere with {topic} until I stopped doing this",
  },
  {
    id: "story-5",
    category: "Story",
    badge: "First person",
    template: "I did not expect {topic} to teach me this much",
  },
  {
    id: "contrarian-1",
    category: "Contrarian",
    badge: "Strong take",
    template: "You're doing {topic} wrong",
  },
  {
    id: "contrarian-2",
    category: "Contrarian",
    badge: "Problem frame",
    template: "This is why {topic} is failing",
  },
  {
    id: "contrarian-3",
    category: "Contrarian",
    badge: "Hard truth",
    template: "The usual advice about {topic} is keeping people stuck",
  },
  {
    id: "contrarian-4",
    category: "Contrarian",
    badge: "Pattern interrupt",
    template: "If {topic} feels harder than it should, this is probably why",
  },
  {
    id: "contrarian-5",
    category: "Contrarian",
    badge: "Direct challenge",
    template: "Stop copying the popular playbook for {topic}",
  },
  {
    id: "urgency-1",
    category: "Urgency",
    badge: "Read this now",
    template: "If you're struggling with {topic}, read this",
  },
  {
    id: "urgency-2",
    category: "Urgency",
    badge: "Prevent regret",
    template: "Before you spend another week on {topic}, fix this first",
  },
  {
    id: "urgency-3",
    category: "Urgency",
    badge: "Fast correction",
    template: "The next time you work on {topic}, do this instead",
  },
  {
    id: "urgency-4",
    category: "Urgency",
    badge: "Momentum saver",
    template: "You can make {topic} easier today by cutting this one habit",
  },
  {
    id: "urgency-5",
    category: "Urgency",
    badge: "Act before",
    template: "If {topic} still is not working, this is the reset you make now",
  },
];

export function generateHooks(topic: string, count = 10): GeneratedHook[] {
  const cleanedTopic = normalizeTopic(topic);
  const pool = shuffle([...HOOK_TEMPLATES]).slice(0, count);

  return pool.map((template, index) => ({
    id: `${template.id}-${slugify(cleanedTopic)}-${index}`,
    category: template.category,
    badge: template.badge,
    text: template.template.replaceAll("{topic}", cleanedTopic),
  }));
}

function normalizeTopic(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function shuffle<T>(items: T[]) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }

  return items;
}

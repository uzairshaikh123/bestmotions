import type { AssetDefinition, AssetField } from "./types";

const timingFields: AssetField[] = [
  { key: "startDelay", label: "Start delay (sec)", type: "number", hint: "Wait before the first animation", step: 0.01, min: 0 },
  { key: "stepDelay", label: "Step delay (sec)", type: "number", hint: "Pause between each beat", step: 0.01, min: 0 },
  { key: "connectDelay", label: "Connector delay (sec)", type: "number", hint: "Wait before secondary motion", step: 0.01, min: 0 },
  { key: "lineDuration", label: "Line draw time (sec)", type: "number", hint: "How long bars and rails take to draw", step: 0.01, min: 0.05 },
  { key: "revealDuration", label: "Reveal time (sec)", type: "number", hint: "How long cards and text take to pop in", step: 0.01, min: 0.08 },
  { key: "itemDelays", label: "Per-item extra delays", type: "text", hint: "Optional extra pauses, comma-separated seconds", placeholder: "0, 0.4, 0.1" },
  { key: "sound", label: "Sound", type: "select", options: [{ label: "On (CC0)", value: "on" }, { label: "Off", value: "off" }] },
];

const timingDefaults = {
  startDelay: 0,
  stepDelay: 0.12,
  connectDelay: 0.08,
  lineDuration: 0.55,
  revealDuration: 0.32,
  itemDelays: "",
  sound: "on",
};

const base = {
  fps: 30,
  width: 1280,
  height: 720,
  durationInFrames: 170,
};

function make(partial: {
  id: string;
  name: string;
  description: string;
  accent: string;
  template: string;
  fields: AssetField[];
  defaults: Record<string, string | number>;
  durationInFrames?: number;
}): AssetDefinition {
  return {
    ...base,
    durationInFrames: partial.durationInFrames ?? 170,
    id: partial.id,
    name: partial.name,
    description: partial.description,
    category: "social",
    accent: partial.accent,
    template: partial.template,
    fields: [...partial.fields, ...timingFields],
    defaults: { ...partial.defaults, ...timingDefaults },
  };
}

const colors = (accent = "#1d9bf0", bg = "#000000"): AssetField[] => [
  { key: "accent", label: "Accent", type: "color" },
  { key: "bg", label: "Background", type: "color" },
];

/** Social / viral documentary plates — X, Instagram, YouTube UI + reaction beats. */
export const SOCIAL_ASSETS: AssetDefinition[] = [
  // —— X (Twitter) ——
  make({
    id: "social-x-post",
    name: "X Post",
    description: "Real X/Twitter post UI — avatar, verified, body, replies/reposts/likes/views.",
    accent: "#e7e9ea",
    template: "social-x-post",
    fields: [
      { key: "name", label: "Display name", type: "text" },
      { key: "handle", label: "Handle", type: "text" },
      { key: "time", label: "Time", type: "text" },
      { key: "body", label: "Post text", type: "textarea" },
      { key: "replies", label: "Replies", type: "text" },
      { key: "reposts", label: "Reposts", type: "text" },
      { key: "likes", label: "Likes", type: "text" },
      { key: "views", label: "Views", type: "text" },
      ...colors("#e7e9ea", "#000000"),
    ],
    defaults: {
      name: "On the ground",
      handle: "@witness",
      time: "2h",
      body: "Nobody is talking about what happened after midnight.",
      replies: "1,204",
      reposts: "6,842",
      likes: "24.1K",
      views: "1.8M",
      accent: "#e7e9ea",
      bg: "#000000",
    },
  }),
  make({
    id: "social-tweet-reveal",
    name: "X / Tweet Reveal",
    description: "Same X post chrome — kept as Tweet Reveal for older saves.",
    accent: "#1d9bf0",
    template: "social-tweet-reveal",
    fields: [
      { key: "name", label: "Display name", type: "text" },
      { key: "handle", label: "Handle", type: "text" },
      { key: "time", label: "Time", type: "text" },
      { key: "body", label: "Post text", type: "textarea" },
      { key: "replies", label: "Replies", type: "text" },
      { key: "reposts", label: "Reposts", type: "text" },
      { key: "likes", label: "Likes", type: "text" },
      { key: "views", label: "Views", type: "text" },
      ...colors("#1d9bf0", "#000000"),
    ],
    defaults: {
      name: "On the ground",
      handle: "@witness",
      time: "2h",
      body: "Nobody is talking about what happened after midnight.",
      replies: "1,204",
      reposts: "6,842",
      likes: "24.1K",
      views: "1.8M",
      accent: "#1d9bf0",
      bg: "#000000",
    },
  }),
  make({
    id: "social-x-thread",
    name: "X Thread",
    description: "Vertical X thread — connected posts drop in one by one.",
    accent: "#1d9bf0",
    template: "social-x-thread",
    durationInFrames: 200,
    fields: [
      { key: "handle", label: "Handle", type: "text" },
      { key: "posts", label: "Thread posts (one per line)", type: "textarea" },
      ...colors("#1d9bf0", "#000000"),
    ],
    defaults: {
      handle: "@investigator",
      posts: "1/ The tip arrived at 9:14.\n2/ Cameras near the dock went dark.\n3/ By morning the story had flipped.",
      accent: "#1d9bf0",
      bg: "#000000",
    },
  }),

  // —— Instagram ——
  make({
    id: "social-instagram-post",
    name: "Instagram Post",
    description: "Phone Instagram UI — story ring, media, like/comment/share, caption.",
    accent: "#e1306c",
    template: "social-instagram-post",
    fields: [
      { key: "handle", label: "Handle", type: "text" },
      { key: "location", label: "Location", type: "text" },
      { key: "caption", label: "Caption", type: "textarea" },
      { key: "likes", label: "Likes", type: "text" },
      ...colors("#e1306c", "#000000"),
    ],
    defaults: {
      handle: "fieldnotes",
      location: "Downtown",
      caption: "The photo that changed the timeline.",
      likes: "184,902 likes",
      accent: "#e1306c",
      bg: "#000000",
    },
  }),
  make({
    id: "social-ig-story",
    name: "Instagram Story",
    description: "Vertical story frame with progress bars and gradient ring.",
    accent: "#e1306c",
    template: "social-ig-story",
    fields: [
      { key: "handle", label: "Handle", type: "text" },
      { key: "title", label: "Story text", type: "textarea" },
      ...colors("#e1306c", "#0a0608"),
    ],
    defaults: {
      handle: "fieldnotes",
      title: "The clip everyone shared",
      accent: "#e1306c",
      bg: "#0a0608",
    },
  }),

  // —— YouTube ——
  make({
    id: "social-yt-player",
    name: "YouTube Player",
    description: "Full YouTube player chrome — play button, scrubber, time, title meta.",
    accent: "#ff0000",
    template: "social-yt-player",
    fields: [
      { key: "title", label: "Video title", type: "textarea" },
      { key: "channel", label: "Channel", type: "text" },
      { key: "views", label: "Views", type: "text" },
      { key: "time", label: "Current time", type: "text" },
      { key: "duration", label: "Duration", type: "text" },
      ...colors("#ff0000", "#0f0f0f"),
    ],
    defaults: {
      title: "What really happened that night",
      channel: "Deep Cut Docs",
      views: "2.4M views",
      time: "0:42",
      duration: "12:08",
      accent: "#ff0000",
      bg: "#0f0f0f",
    },
  }),
  make({
    id: "social-yt-highlight",
    name: "YouTube Video Highlight",
    description: "YouTube player UI focused on the highlight moment.",
    accent: "#ff0000",
    template: "social-yt-highlight",
    fields: [
      { key: "title", label: "Video title", type: "textarea" },
      { key: "channel", label: "Channel", type: "text" },
      { key: "views", label: "Views", type: "text" },
      { key: "time", label: "Current time", type: "text" },
      { key: "duration", label: "Duration", type: "text" },
      ...colors("#ff0000", "#0f0f0f"),
    ],
    defaults: {
      title: "What really happened that night",
      channel: "Deep Cut Docs",
      views: "2.4M views",
      time: "0:42",
      duration: "12:08",
      accent: "#ff0000",
      bg: "#0f0f0f",
    },
  }),
  make({
    id: "social-yt-subscribe",
    name: "YouTube Subscribe",
    description: "Channel row with pulsing Subscribe button.",
    accent: "#ff0000",
    template: "social-yt-subscribe",
    fields: [
      { key: "channel", label: "Channel", type: "text" },
      { key: "subs", label: "Subscribers", type: "text" },
      ...colors("#ff0000", "#0f0f0f"),
    ],
    defaults: {
      channel: "Deep Cut Docs",
      subs: "1.28M subscribers",
      accent: "#ff0000",
      bg: "#0f0f0f",
    },
  }),

  // —— Viral / reaction ——
  make({
    id: "social-viral-post",
    name: "Viral Post",
    description: "Post card with a VIRAL badge slam.",
    accent: "#a855f7",
    template: "social-viral-post",
    fields: [
      { key: "badge", label: "Badge", type: "text" },
      { key: "title", label: "Headline", type: "textarea" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      ...colors("#a855f7", "#07060c"),
    ],
    defaults: {
      badge: "VIRAL",
      title: "The post that broke the internet",
      subtitle: "Shared 1.2M times in 6 hours",
      accent: "#a855f7",
      bg: "#07060c",
    },
  }),
  make({
    id: "social-comment-explosion",
    name: "Comment Explosion",
    description: "Stack of comments fly in from below.",
    accent: "#22c55e",
    template: "social-comment-explosion",
    durationInFrames: 190,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "comments", label: "Comments (one per line)", type: "textarea" },
      ...colors("#22c55e", "#05070b"),
    ],
    defaults: {
      title: "Comments",
      comments: "This can't be real\nWait… rewind that\nI've been saying this for years\nReceipts???",
      accent: "#22c55e",
      bg: "#05070b",
    },
  }),
  make({
    id: "social-trending",
    name: "Trending",
    description: "Trending tag with rising rank number.",
    accent: "#f59e0b",
    template: "social-trending",
    fields: [
      { key: "rank", label: "Rank", type: "text" },
      { key: "tag", label: "Trend tag", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      ...colors("#f59e0b", "#07090e"),
    ],
    defaults: {
      rank: "#1",
      tag: "Trending worldwide",
      subtitle: "124K posts in the last hour",
      accent: "#f59e0b",
      bg: "#07090e",
    },
  }),
  make({
    id: "social-reaction",
    name: "Social Media Reaction",
    description: "Reaction chips pop around a claim.",
    accent: "#fb7185",
    template: "social-reaction",
    fields: [
      { key: "title", label: "Claim", type: "textarea" },
      { key: "reactions", label: "Reactions (one per line)", type: "textarea" },
      ...colors("#fb7185", "#0a0608"),
    ],
    defaults: {
      title: "People lost it",
      reactions: "Shocked\nAngry\nConfused\nObsessed",
      accent: "#fb7185",
      bg: "#0a0608",
    },
  }),
  make({
    id: "social-internet-reacts",
    name: "Internet Reacts",
    description: "Giant INTERNET REACTS stamp over a quote.",
    accent: "#e63946",
    template: "social-internet-reacts",
    fields: [
      { key: "stamp", label: "Stamp", type: "text" },
      { key: "quote", label: "Quote", type: "textarea" },
      ...colors("#e63946", "#05070b"),
    ],
    defaults: {
      stamp: "INTERNET REACTS",
      quote: "“This changes everything.”",
      accent: "#e63946",
      bg: "#05070b",
    },
  }),
  make({
    id: "social-viral-moment",
    name: "The Viral Moment",
    description: "Timestamp + moment title for the clip that took off.",
    accent: "#a855f7",
    template: "social-viral-moment",
    fields: [
      { key: "time", label: "Timestamp", type: "text" },
      { key: "title", label: "Moment", type: "textarea" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      ...colors("#a855f7", "#07060c"),
    ],
    defaults: {
      time: "0:42",
      title: "The viral moment",
      subtitle: "Clipped. Shared. Everywhere.",
      accent: "#a855f7",
      bg: "#07060c",
    },
  }),
  make({
    id: "social-post-timeline",
    name: "Post Timeline",
    description: "Three posts land on a vertical timeline.",
    accent: "#1d9bf0",
    template: "social-post-timeline",
    durationInFrames: 190,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "posts", label: "Posts (time | text per line)", type: "textarea" },
      ...colors("#1d9bf0", "#05070b"),
    ],
    defaults: {
      title: "How it spread",
      posts: "9:14 PM | First post goes live\n9:41 PM | Screenshots circulate\n10:03 PM | Mainstream picks it up",
      accent: "#1d9bf0",
      bg: "#05070b",
    },
  }),
  make({
    id: "social-screenshot-reveal",
    name: "Screenshot Reveal",
    description: "Phone-frame screenshot plate peels into view.",
    accent: "#94a3b8",
    template: "social-screenshot-reveal",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "body", label: "Screenshot text", type: "textarea" },
      { key: "caption", label: "Caption", type: "text" },
      ...colors("#94a3b8", "#08090c"),
    ],
    defaults: {
      title: "Screenshot",
      body: "We need to talk about what was deleted.",
      caption: "Saved before it disappeared",
      accent: "#94a3b8",
      bg: "#08090c",
    },
  }),
  make({
    id: "social-comment-highlight",
    name: "Comment Highlight",
    description: "Single comment card highlighted with accent bar.",
    accent: "#22c55e",
    template: "social-comment-highlight",
    fields: [
      { key: "handle", label: "Handle", type: "text" },
      { key: "body", label: "Comment", type: "textarea" },
      { key: "meta", label: "Meta", type: "text" },
      ...colors("#22c55e", "#05070b"),
    ],
    defaults: {
      handle: "@topcomment",
      body: "This is the comment that said it first.",
      meta: "Pinned  ·  48K likes",
      accent: "#22c55e",
      bg: "#05070b",
    },
  }),
  make({
    id: "social-subscriber-growth",
    name: "Subscriber Growth",
    description: "Big number slam for follower / subscriber growth.",
    accent: "#ff0000",
    template: "social-subscriber-growth",
    fields: [
      { key: "value", label: "Number", type: "text" },
      { key: "suffix", label: "Suffix", type: "text" },
      { key: "label", label: "Label", type: "text" },
      { key: "caption", label: "Caption", type: "text" },
      ...colors("#ff0000", "#08080c"),
    ],
    defaults: {
      value: "1.2",
      suffix: "M",
      label: "Subscribers",
      caption: "In under 48 hours",
      accent: "#ff0000",
      bg: "#08080c",
    },
  }),
  make({
    id: "social-views-explosion",
    name: "Views Explosion",
    description: "Views counter pops with an explosion caption.",
    accent: "#f59e0b",
    template: "social-views-explosion",
    fields: [
      { key: "value", label: "Number", type: "text" },
      { key: "suffix", label: "Suffix", type: "text" },
      { key: "label", label: "Label", type: "text" },
      { key: "caption", label: "Caption", type: "text" },
      ...colors("#f59e0b", "#07090e"),
    ],
    defaults: {
      value: "18",
      suffix: "M",
      label: "Views",
      caption: "Overnight",
      accent: "#f59e0b",
      bg: "#07090e",
    },
  }),
  make({
    id: "social-trending-chart",
    name: "Trending Chart",
    description: "Simple rising bars for engagement / trend score.",
    accent: "#1d9bf0",
    template: "social-trending-chart",
    durationInFrames: 180,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "bars", label: "Bars (label | height 1-100)", type: "textarea" },
      ...colors("#1d9bf0", "#05070b"),
    ],
    defaults: {
      title: "Engagement spike",
      bars: "Mon|22\nTue|28\nWed|41\nThu|63\nFri|92",
      accent: "#1d9bf0",
      bg: "#05070b",
    },
  }),
  make({
    id: "social-hashtag-explosion",
    name: "Hashtag Explosion",
    description: "Hashtags burst onto screen around a center tag.",
    accent: "#a855f7",
    template: "social-hashtag-explosion",
    fields: [
      { key: "center", label: "Center tag", type: "text" },
      { key: "tags", label: "Tags (one per line)", type: "textarea" },
      ...colors("#a855f7", "#07060c"),
    ],
    defaults: {
      center: "#TheRealStory",
      tags: "#Breaking\n#Receipts\n#Viral\n#WatchThis\n#Thread",
      accent: "#a855f7",
      bg: "#07060c",
    },
  }),
];

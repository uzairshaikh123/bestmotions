import type { AssetCategory, AssetDefinition, AssetField } from "./types";

const base = {
  fps: 30,
  width: 1280,
  height: 720,
  durationInFrames: 160,
};

const timingFields: AssetField[] = [
  { key: "startDelay", label: "Start delay (sec)", type: "number", hint: "Wait before the first animation", step: 0.01, min: 0 },
  { key: "stepDelay", label: "Step delay (sec)", type: "number", hint: "Pause between each event, node, chip, or bar", step: 0.01, min: 0 },
  { key: "connectDelay", label: "Connector delay (sec)", type: "number", hint: "Wait before drawing the line or link to the next item", step: 0.01, min: 0 },
  { key: "lineDuration", label: "Line draw time (sec)", type: "number", hint: "How long connectors, rails, spokes, and wipes take to draw", step: 0.01, min: 0.05 },
  { key: "revealDuration", label: "Reveal time (sec)", type: "number", hint: "How long each node, card, chip, or label takes to pop in", step: 0.01, min: 0.08 },
  { key: "itemDelays", label: "Per-item extra delays", type: "text", hint: "Optional extra pause before each item, comma-separated seconds", placeholder: "0, 0.4, 0.1" },
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

const eventsField: AssetField = {
  key: "events",
  label: "Events",
  type: "textarea",
  hint: "One per line: Year|Title|Detail",
};

type Spec = {
  id: string;
  name: string;
  description: string;
  category: AssetCategory;
  template: string;
  accent: string;
  durationInFrames?: number;
  fields: AssetField[];
  defaults: Record<string, string | number>;
};

function asset(spec: Spec): AssetDefinition {
  return {
    ...base,
    durationInFrames: spec.durationInFrames ?? base.durationInFrames,
    id: spec.id,
    name: spec.name,
    description: spec.description,
    category: spec.category,
    accent: spec.accent,
    template: spec.template,
    fields: [...spec.fields, ...timingFields],
    defaults: { ...spec.defaults, ...timingDefaults },
  };
}

function eventTimeline(
  id: string,
  name: string,
  description: string,
  category: AssetCategory,
  _template: string,
  accent: string,
  events: string,
  title = name,
): AssetDefinition {
  return asset({
    id,
    name,
    description,
    category,
    template: id,
    accent,
    durationInFrames: 200,
    fields: [
      { key: "title", label: "Title", type: "text" },
      eventsField,
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" },
    ],
    defaults: { title, events, accent, bg: "#0a0c12" },
  });
}

function focusTimeline(
  id: string,
  name: string,
  description: string,
  category: AssetCategory,
  accent: string,
  events: string,
  focusIndex = 2,
): AssetDefinition {
  return asset({
    id,
    name,
    description,
    category,
    template: id,
    accent,
    durationInFrames: 180,
    fields: [
      { key: "title", label: "Eyebrow", type: "text" },
      eventsField,
      { key: "focusIndex", label: "Focus index (0-based)", type: "number" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" },
    ],
    defaults: { title: name, events, focusIndex, accent, bg: "#0a0e18" },
  });
}

function yearPunch(
  id: string,
  name: string,
  description: string,
  category: AssetCategory,
  year: number,
  subtitle: string,
  accent = "#e63946",
): AssetDefinition {
  return asset({
    id,
    name,
    description,
    category,
    template: id,
    accent,
    durationInFrames: 120,
    fields: [
      { key: "year", label: "Target year", type: "number" },
      { key: "label", label: "Label", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" },
    ],
    defaults: {
      year,
      label: name.toUpperCase(),
      subtitle,
      accent,
      bg: "#05070b",
    },
  });
}

function yearScrub(
  id: string,
  name: string,
  description: string,
  category: AssetCategory,
  startYear: number,
  endYear: number,
  markers: string,
  accent = "#ff6b4a",
): AssetDefinition {
  return asset({
    id,
    name,
    description,
    category,
    template: id,
    accent,
    durationInFrames: 150,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "startYear", label: "Start year", type: "number" },
      { key: "endYear", label: "End year", type: "number" },
      { key: "markerYears", label: "Marker years", type: "text" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" },
    ],
    defaults: {
      title: name,
      startYear,
      endYear,
      markerYears: markers,
      accent,
      bg: "#0b1020",
    },
  });
}

function yearsCount(
  id: string,
  name: string,
  description: string,
  category: AssetCategory,
  startYear: number,
  endYear: number,
  accent = "#c084fc",
): AssetDefinition {
  return asset({
    id,
    name,
    description,
    category,
    template: id,
    accent,
    durationInFrames: 170,
    fields: [
      { key: "label", label: "Label", type: "text" },
      { key: "startYear", label: "Start year", type: "number" },
      { key: "endYear", label: "End year", type: "number" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" },
    ],
    defaults: { label: name, startYear, endYear, accent, bg: "#0a0c12" },
  });
}

function eraStamp(
  id: string,
  name: string,
  description: string,
  category: AssetCategory,
  era: string,
  accent = "#38bdf8",
): AssetDefinition {
  return asset({
    id,
    name,
    description,
    category,
    template: id,
    accent,
    durationInFrames: 150,
    fields: [
      { key: "label", label: "Label", type: "text" },
      { key: "era", label: "Era text", type: "text" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" },
    ],
    defaults: {
      label: name.toUpperCase(),
      era,
      accent,
      bg: "#0a0c12",
    },
  });
}

function moneyRupee(
  id: string,
  name: string,
  description: string,
  value: number,
  suffix: string,
  caption: string,
  prefix = "₹",
): AssetDefinition {
  return asset({
    id,
    name,
    description,
    category: "money",
    template: id,
    accent: "#22c55e",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "prefix", label: "Prefix", type: "text" },
      { key: "value", label: "Number", type: "number", step: 0.1 },
      { key: "suffix", label: "Suffix", type: "text" },
      { key: "caption", label: "Caption", type: "text" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" },
    ],
    defaults: {
      title: name,
      prefix,
      value,
      suffix,
      caption,
      accent: "#22c55e",
      bg: "#07120c",
    },
  });
}

function moneyBomb(
  id: string,
  name: string,
  description: string,
  value: number,
  suffix: string,
  caption: string,
): AssetDefinition {
  return asset({
    id,
    name,
    description,
    category: "money",
    template: id,
    accent: "#eab308",
    durationInFrames: 120,
    fields: [
      { key: "value", label: "Number", type: "number" },
      { key: "suffix", label: "Suffix", type: "text" },
      { key: "label", label: "Label", type: "text" },
      { key: "caption", label: "Caption", type: "text" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" },
    ],
    defaults: {
      value,
      suffix,
      label: name,
      caption,
      accent: "#eab308",
      bg: "#0a0c12",
    },
  });
}

function moneyStat(
  id: string,
  name: string,
  description: string,
  value: number,
  suffix: string,
  note: string,
  highlight: string,
): AssetDefinition {
  return asset({
    id,
    name,
    description,
    category: "money",
    template: id,
    accent: "#22c55e",
    durationInFrames: 120,
    fields: [
      { key: "label", label: "Label", type: "text" },
      { key: "value", label: "Target number", type: "number" },
      { key: "suffix", label: "Suffix", type: "text" },
      { key: "note", label: "Note", type: "textarea" },
      { key: "highlight", label: "Highlight phrase", type: "text" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" },
    ],
    defaults: {
      label: name,
      value,
      suffix,
      note,
      highlight,
      accent: "#22c55e",
      bg: "#07080c",
    },
  });
}

function vs(
  id: string,
  name: string,
  description: string,
  leftTitle: string,
  leftText: string,
  rightTitle: string,
  rightText: string,
  category: AssetCategory = "comparison",
): AssetDefinition {
  return asset({
    id,
    name,
    description,
    category,
    template: id,
    accent: "#fb7185",
    fields: [
      { key: "leftTitle", label: "Left title", type: "text" },
      { key: "leftText", label: "Left text", type: "textarea" },
      { key: "rightTitle", label: "Right title", type: "text" },
      { key: "rightText", label: "Right text", type: "textarea" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" },
    ],
    defaults: {
      leftTitle,
      leftText,
      rightTitle,
      rightText,
      accent: "#fb7185",
      bg: "#07080c",
    },
  });
}

function slam(
  id: string,
  name: string,
  description: string,
  category: AssetCategory,
  claim: string,
  highlight: string,
  accent = "#f97316",
): AssetDefinition {
  return asset({
    id,
    name,
    description,
    category,
    template: id,
    accent,
    durationInFrames: 150,
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "claim", label: "Claim", type: "textarea" },
      { key: "highlight", label: "Highlight phrase", type: "text" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" },
    ],
    defaults: {
      eyebrow: category === "rise" ? "RISE & FALL" : "THE STORY",
      claim,
      highlight,
      accent,
      bg: "#0a0c12",
    },
  });
}

function clockRing(
  id: string,
  name: string,
  description: string,
  percent: number,
  label: string,
): AssetDefinition {
  return asset({
    id,
    name,
    description,
    category: "time",
    template: id,
    accent: "#38bdf8",
    durationInFrames: 150,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "label", label: "Label", type: "text" },
      { key: "percent", label: "Percent", type: "number" },
      { key: "accent", label: "Accent", type: "color" },
      { key: "bg", label: "Background", type: "color" },
    ],
    defaults: {
      title: name,
      label,
      percent,
      accent: "#38bdf8",
      bg: "#071018",
    },
  });
}

const RISE_EVENTS =
  "01|Spark|The climb begins\n02|Peak|Power and momentum\n03|Crack|Pressure builds\n04|Fall|The collapse\n05|After|What remains";

/** Documentary pack — gallery cards reuse existing Revideo templates. */
export const DOCUMENTARY_ASSETS: AssetDefinition[] = [
  // ——— 1. Timeline & History ———
  eventTimeline(
    "hist-year-era",
    "Year / Era",
    "Decade or era blocks for documentary chaptering.",
    "timeline",
    "timeline-eras",
    "#e8a54b",
    "1947–1964|Founding era|Nation building\n1965–1984|Trials|Conflict & change\n1991–2010|Opening|Reform age\n2014–now|Present|New mandate",
  ),
  focusTimeline(
    "hist-year-changed",
    "The Year That Changed Everything",
    "Spotlight one decisive year against a faded stack of history.",
    "timeline",
    "#5b8cff",
    "1984|Shock|A nation rattled\n1991|Reforms|Markets open\n2008|Crisis|Global collapse\n2016|Shock|Rules rewrite\n2020|Pause|The world stops",
    2,
  ),
  yearPunch(
    "hist-year-reveal",
    "Year Reveal",
    "Giant year slam — the classic documentary turning-point beat.",
    "timeline",
    1991,
    "Everything changed after this.",
  ),
  eventTimeline(
    "hist-history-timeline",
    "History Timeline",
    "Horizontal node timeline for documentary chronology.",
    "timeline",
    "timeline-nodes",
    "#3dd6c6",
    "1947|Independence|Freedom at midnight\n1950|Republic|Constitution adopted\n1991|Reforms|Liberalization begins\n2014|Mandate|New chapter\n2024|Present|A rising chapter",
  ),
  eventTimeline(
    "hist-the-rise",
    "The Rise",
    "Numbered journey steps showing ascent to power or success.",
    "timeline",
    "timeline-journey",
    "#22c55e",
    "01|Seed|Quiet beginnings\n02|Breakout|First real win\n03|Scale|Momentum compounds\n04|Peak|Unstoppable for a moment",
  ),
  eventTimeline(
    "hist-the-fall",
    "The Fall",
    "Milestone cards tracking the path into collapse.",
    "timeline",
    "timeline-milestones",
    "#ef4444",
    "2018|Crack|First warning signs\n2019|Spin|Denial and delay\n2020|Break|Trust collapses\n2021|Ruin|The fall completes",
  ),
  eventTimeline(
    "hist-era-transition",
    "Era Transition",
    "Chapter wipes marking the handoff from one era to the next.",
    "timeline",
    "timeline-chapters",
    "#ff6b4a",
    "1980|Old order|Rules everyone knew\n1991|Break|A new system arrives\n2000|Settle|The new normal\n2014|Shift|Another chapter begins",
  ),
  yearScrub(
    "hist-decades-passing",
    "Decades Passing",
    "Year rail scrub across decades in seconds.",
    "timeline",
    1950,
    2020,
    "1950, 1970, 1990, 2010, 2020",
  ),
  eventTimeline(
    "hist-from-then-to-now",
    "From Then to Now",
    "Vertical spine from a past milestone to the present.",
    "timeline",
    "timeline-vertical",
    "#d8a11a",
    "1991|Then|Closed and fragile\n2000|Shift|Growth takes root\n2014|Surge|A new mandate\n2026|Now|Looking ahead",
  ),
  focusTimeline(
    "hist-before-after-years",
    "Before & After Years",
    "Focus spotlight comparing the years before and after a rupture.",
    "timeline",
    "#5b8cff",
    "2015|Before|Business as usual\n2016|Shock|Overnight rewrite\n2017|After|A different country",
    1,
  ),
  yearsCount(
    "hist-year-counter",
    "Year Counter",
    "Count across years while a rail connects start to target.",
    "timeline",
    1947,
    2026,
  ),
  eventTimeline(
    "hist-timeline-explosion",
    "Timeline Explosion",
    "Dense milestone burst for a packed historical beat.",
    "timeline",
    "timeline-milestones",
    "#f472b6",
    "1991|Spark|Reform begins\n1998|Shock|Nuclear tests\n2008|Crash|Global crisis\n2014|Wave|Mandate shifts\n2020|Freeze|The world pauses",
  ),
  eventTimeline(
    "hist-historic-milestone",
    "Historic Milestone",
    "Single milestone cards for a defining historical beat.",
    "timeline",
    "timeline-milestones",
    "#7dd3a0",
    "1950|Republic|Constitution adopted\n1991|Reforms|Economy opens\n2014|Mandate|Voters redraw the map",
  ),
  eventTimeline(
    "hist-turning-point-tl",
    "The Turning Point",
    "Chapter wipe into the moment history pivots.",
    "timeline",
    "timeline-chapters",
    "#ff6b4a",
    "Before|Status quo|Everyone assumed continuity\n1991|Break|The rules rewrite overnight\nAfter|New world|Nothing feels the same",
  ),
  eventTimeline(
    "hist-new-era",
    "A New Era Begins",
    "Era bands announcing a clean break into a new chapter.",
    "timeline",
    "timeline-eras",
    "#e8a54b",
    "Old era|Closed|Familiar rules\nTransition|Shock|Nothing holds\nNew era|Open|A different game",
  ),
  eventTimeline(
    "hist-end-of-era",
    "End of an Era",
    "Chapter wipes closing a long chapter of history.",
    "timeline",
    "timeline-chapters",
    "#94a3b8",
    "Peak|Dominance|It looked permanent\nCrack|Doubt|The story softens\nEnd|Exit|The era closes",
  ),
  yearPunch(
    "hist-forgotten-year",
    "The Forgotten Year",
    "Year punch for the overlooked year that quietly mattered.",
    "timeline",
    2008,
    "Everyone remembers the crash. Few remember what came next.",
    "#a78bfa",
  ),
  eraStamp(
    "hist-one-year-later",
    "One Year Later",
    "Era stamp overlay for the anniversary beat.",
    "timeline",
    "2020 — 2021",
    "#c084fc",
  ),
  yearScrub(
    "hist-years-in-seconds",
    "Years in Seconds",
    "Scrub decades in a few seconds of screen time.",
    "timeline",
    1990,
    2025,
    "1990, 2000, 2010, 2020, 2025",
    "#38bdf8",
  ),
  eventTimeline(
    "hist-decade-comparison",
    "Decade Comparison",
    "Era blocks comparing one decade against another.",
    "timeline",
    "timeline-eras",
    "#e8a54b",
    "1990s|Opening|Reform and risk\n2000s|Boom|Growth and excess\n2010s|Reset|New power centers\n2020s|Shock|Volatility returns",
  ),
  focusTimeline(
    "hist-timeline-zoom",
    "Timeline Zoom",
    "Focus spotlight that zooms into one decisive event.",
    "timeline",
    "#5b8cff",
    "1947|Independence|Freedom at midnight\n1950|Republic|Constitution adopted\n1991|Reforms|Liberalization begins\n2014|Mandate|New chapter\n2024|Present|A rising chapter",
    2,
  ),
  eventTimeline(
    "hist-history-unfolds",
    "History Unfolds",
    "Vertical event timeline that reveals the story beat by beat.",
    "timeline",
    "timeline-vertical",
    "#d8a11a",
    "1947|Independence|Freedom at midnight\n1965|Conflict|A defining war\n1991|Reforms|Economy opens\n2014|Mandate|Voters redraw the map\n2024|Present|Looking ahead",
  ),

  // ——— 4. Money & Business ———
  moneyRupee("money-counter", "Money Counter", "Counting money total for documentary money beats.", 250, "Cr", "Cash on the move"),
  moneyRupee("money-revenue-growth", "Revenue Growth", "Revenue climbing across a growth story.", 48, "%", "Year-over-year", "+"),
  vs("money-profit-vs-loss", "Profit vs Loss", "Split frame for profit against loss.", "PROFIT", "₹420 Cr", "LOSS", "₹85 Cr", "money"),
  moneyBomb("money-company-valuation", "Company Valuation", "Giant valuation drop for startup and IPO stories.", 12, "B", "Latest round mark"),
  moneyBomb("money-market-cap-race", "Market Cap Race", "Market-cap race number for stock battles.", 3.2, "T", "Who is winning the race?"),
  moneyRupee("money-billion-dollar", "Billion Dollar Journey", "Zero to billion journey counter.", 1, "B", "From idea to unicorn", "$"),
  moneyStat("money-flow", "Money Flow", "Where capital is flowing this quarter.", 64, "%", "Share of capital moving into growth bets", "64%"),
  moneyStat("money-where-it-goes", "Where The Money Goes", "Breakdown bumper for spending destinations.", 41, "%", "Largest slice of the budget", "budget"),
  moneyStat("money-revenue-breakdown", "Revenue Breakdown", "Revenue mix as a single dominant share.", 58, "%", "Core product contribution", "Core"),
  moneyStat("money-cost-breakdown", "Cost Breakdown", "Cost structure highlight for business docs.", 33, "%", "Largest operating cost", "operating"),
  moneyBomb("money-price-tag", "The Price Tag", "Price reveal for products, deals, or bailouts.", 999, "", "What it really costs"),
  moneyRupee("money-zero-to-crore", "From ₹0 to ₹1 Crore", "Classic Indian business climb counter.", 1, "Cr", "The climb"),
  moneyRupee("money-net-worth", "Net Worth Counter", "Net-worth count-up for wealth stories.", 8.4, "B", "Estimated net worth", "$"),
  eventTimeline(
    "money-business-growth",
    "Business Growth Timeline",
    "Business milestones on a documentary timeline.",
    "money",
    "timeline-nodes",
    "#22c55e",
    "2015|Seed|First customers\n2018|Series A|Product-market fit\n2021|Scale|National footprint\n2024|IPO|Public markets",
  ),
  eventTimeline(
    "money-investment-flow",
    "Investment Flow",
    "Journey steps for capital moving through a deal.",
    "money",
    "timeline-journey",
    "#eab308",
    "01|Idea|Founders raise a thesis\n02|Seed|First believers write cheques\n03|Growth|Funds pile in\n04|Exit|Liquidity event",
  ),
  eventTimeline(
    "money-funding-journey",
    "Funding Journey",
    "Round-by-round funding timeline.",
    "money",
    "timeline-milestones",
    "#22c55e",
    "2016|Seed|₹2 Cr\n2018|Series A|₹40 Cr\n2021|Series B|₹320 Cr\n2024|Series C|₹1,100 Cr",
  ),
  eventTimeline(
    "money-ipo-journey",
    "IPO Journey",
    "Path from private company to listed stock.",
    "money",
    "timeline-chapters",
    "#eab308",
    "2022|DRHP|Paperwork begins\n2023|Roadshow|Investors courted\n2024|Listing|Bell rings\n2025|After|Public scrutiny",
  ),
  vs("money-market-share-battle", "Market Share Battle", "Two players fighting for share.", "PLAYER A", "38% share", "PLAYER B", "31% share", "money"),
  slam("money-business-model", "The Business Model", "How the company actually makes money.", "money", "They don't sell products.\nThey sell access.", "access", "#22c55e"),
  slam("money-money-machine", "Money Machine", "Engine that prints cash every quarter.", "money", "A Money Machine\nHidden in Plain Sight", "Money Machine", "#eab308"),
  slam("money-profit-engine", "Profit Engine", "The flywheel behind recurring profit.", "money", "This is the Profit Engine", "Profit Engine", "#22c55e"),
  moneyStat("money-cash-burn", "Cash Burn", "Burn rate highlight for startup docs.", 18, "Cr/mo", "Cash leaving the accounts every month", "burn"),
  moneyRupee("money-debt-counter", "Debt Counter", "Debt load counting up for crisis stories.", 4.7, "L Cr", "Total debt outstanding"),
  vs("money-rich-vs-poor", "Rich vs Poor Comparison", "Wealth gap comparison plate.", "RICH", "Top 1% owns 40%", "POOR", "Bottom 50% owns 3%", "money"),
  moneyBomb("money-economy-scale", "Economy Scale", "Scale of an economy or sector in one number.", 4.1, "T", "Economy at full scale"),

  // ——— 5. Comparison ———
  vs("cmp-vs-battle", "VS Battle", "Headliner versus plate for any rivalry.", "SIDE A", "Challenger", "SIDE B", "Champion"),
  vs("cmp-head-to-head", "Head to Head", "Direct matchup cards.", "LEFT", "Option one", "RIGHT", "Option two"),
  vs("cmp-before-vs-after", "Before vs After", "Classic before/after split.", "BEFORE", "Fragile and slow", "AFTER", "Scaled and fast"),
  vs("cmp-then-vs-now", "Then vs Now", "Then versus now documentary plate.", "THEN", "Fragile coalition", "NOW", "Full majority"),
  vs("cmp-old-vs-new", "Old vs New", "Old system against the new one.", "OLD", "Manual & opaque", "NEW", "Digital & tracked"),
  vs("cmp-a-vs-b", "A vs B", "Generic A versus B comparison.", "A", "First choice", "B", "Second choice"),
  vs("cmp-comparison-cards", "Comparison Cards", "Two cards for feature or claim contrast.", "CARD A", "Claim one", "CARD B", "Claim two"),
  vs("cmp-feature-comparison", "Feature Comparison", "Feature-by-feature duel.", "PRODUCT A", "Faster setup", "PRODUCT B", "Deeper tools"),
  vs("cmp-price-comparison", "Price Comparison", "Price duel for consumer or policy stories.", "BUDGET", "₹499", "PREMIUM", "₹2,999"),
  vs("cmp-growth-race", "Growth Race", "Who is growing faster.", "STARTUP A", "+84% YoY", "STARTUP B", "+41% YoY"),
  vs("cmp-market-share-race", "Market Share Race", "Share race between rivals.", "INCUMBENT", "52%", "CHALLENGER", "27%"),
  slam("cmp-who-wins", "Who Wins?", "Title slam asking who comes out on top.", "comparison", "Who Wins?", "Wins", "#fb7185"),
  slam("cmp-the-difference", "The Difference", "Underline the gap that matters.", "comparison", "This is The Difference", "Difference", "#fb7185"),
  vs("cmp-side-by-side", "Side by Side", "Side-by-side comparison layout.", "LEFT", "Scenario A", "RIGHT", "Scenario B"),
  vs("cmp-scale-comparison", "Scale Comparison", "Scale contrast in two numbers.", "SMALL", "10,000 users", "GIANT", "100 million users"),
  vs("cmp-size-comparison", "Size Comparison", "Physical or market size duel.", "LOCAL", "City network", "GLOBAL", "Worldwide reach"),
  vs("cmp-speed-comparison", "Speed Comparison", "Speed duel for tech or logistics.", "OLD", "14 days", "NEW", "14 minutes"),
  vs("cmp-country-vs-country", "Country vs Country", "Nation versus nation plate.", "INDIA", "Fastest growth", "CHINA", "Largest base"),
  vs("cmp-company-vs-company", "Company vs Company", "Corporate rivalry plate.", "COMPANY A", "Market leader", "COMPANY B", "Disruptor"),
  vs("cmp-rich-vs-rich", "Rich vs Rich", "Billionaire or elite duel.", "TYCOON A", "$120B", "TYCOON B", "$98B"),
  vs("cmp-data-face-off", "Data Face-Off", "Two data claims in direct conflict.", "CLAIM A", "42% growth", "CLAIM B", "11% growth"),

  // ——— 6. Rise & Fall ———
  eventTimeline("rise-the-rise", "The Rise", "Ascent story as numbered steps.", "rise", "timeline-journey", "#22c55e", "01|Seed|Quiet beginnings\n02|Breakout|First real win\n03|Scale|Momentum compounds\n04|Peak|Unstoppable for a moment"),
  eventTimeline("rise-the-fall", "The Fall", "Collapse told in milestone cards.", "rise", "timeline-milestones", "#ef4444", "2018|Crack|First warning signs\n2019|Spin|Denial and delay\n2020|Break|Trust collapses\n2021|Ruin|The fall completes"),
  eventTimeline("rise-rise-and-fall", "Rise and Fall", "Full arc from climb to crash.", "rise", "timeline-vertical", "#f97316", RISE_EVENTS),
  eventTimeline("rise-zero-to-hero", "From Zero to Hero", "Underdog climb to the top.", "rise", "timeline-journey", "#22c55e", "01|Zero|No one is watching\n02|Proof|First believers\n03|Surge|The world notices\n04|Hero|Unquestioned lead"),
  eventTimeline("rise-hero-to-zero", "From Hero to Zero", "Fall from peak to nothing.", "rise", "timeline-milestones", "#ef4444", "Peak|Hero|Untouchable\nCrack|Doubt|Questions start\nCrash|Fall|Trust evaporates\nZero|Gone|Nothing left"),
  slam("rise-the-collapse", "The Collapse", "Title slam for sudden systemic failure.", "rise", "The Collapse", "Collapse"),
  eventTimeline("rise-the-comeback", "The Comeback", "Recovery after a public fall.", "rise", "timeline-journey", "#22c55e", "01|Bottom|Everything is gone\n02|Rebuild|Quiet work returns\n03|Proof|Results reappear\n04|Return|The comeback lands"),
  slam("rise-the-decline", "The Decline", "Slow erosion before the crash.", "rise", "The Decline\nwas already underway", "Decline"),
  slam("rise-the-downfall", "The Downfall", "Public disgrace title beat.", "rise", "The Downfall", "Downfall"),
  slam("rise-the-explosion", "The Explosion", "Sudden blow-up moment.", "rise", "The Explosion", "Explosion", "#f43f5e"),
  slam("rise-the-crash", "The Crash", "Market or empire crash title.", "rise", "The Crash", "Crash", "#ef4444"),
  eventTimeline("rise-the-recovery", "The Recovery", "Steps out of crisis.", "rise", "timeline-journey", "#38bdf8", "01|Stabilize|Stop the bleeding\n02|Repair|Restore trust\n03|Grow|Find a new gear\n04|Lead|Stronger than before"),
  focusTimeline("rise-turning-point", "The Turning Point", "The exact beat where fortune flips.", "rise", "#f97316", "2018|Peak|It looked permanent\n2019|Turn|The first real crack\n2020|Fall|Everything reverses", 1),
  eventTimeline("rise-peak-collapse", "Peak and Collapse", "From all-time high to free fall.", "rise", "timeline-chapters", "#f97316", "Peak|All-time high|Confidence everywhere\nCrack|Warning|Ignored signals\nCollapse|Free fall|No floor left"),
  eventTimeline("rise-golden-age", "The Golden Age", "Era bands for a boom period.", "rise", "timeline-eras", "#e8a54b", "Dawn|Lift-off|Optimism\nPeak|Golden age|Abundance\nDusk|Cracks|Excess shows"),
  eventTimeline("rise-dark-age", "The Dark Age", "Era bands for a bleak chapter.", "rise", "timeline-eras", "#64748b", "Fall|Collapse|Systems fail\nDark|Scarcity|Trust is gone\nEmbers|Survive|Holding on"),
  slam("rise-beginning-of-end", "The Beginning of the End", "The first irreversible crack.", "rise", "The Beginning of the End", "End"),
  slam("rise-what-went-wrong", "What Went Wrong?", "Post-mortem title for failure docs.", "rise", "What Went Wrong?", "Wrong"),
  slam("rise-final-blow", "The Final Blow", "The strike that ends the story.", "rise", "The Final Blow", "Final Blow", "#ef4444"),
  eventTimeline("rise-back-from-dead", "Back From The Dead", "Impossible recovery arc.", "rise", "timeline-journey", "#22c55e", "01|Dead|Written off\n02|Spark|One last chance\n03|Fight|Against the odds\n04|Alive|Back from the dead"),

  // ——— 2. Time & Clock ———
  clockRing("time-race-against", "Race Against Time", "Progress ring for a race against the clock.", 82, "Time left"),
  clockRing("time-countdown-clock", "Countdown Clock", "Ring countdown toward zero hour.", 18, "Remaining"),
  slam("time-running-out", "Time Is Running Out", "Urgency title for deadline stories.", "time", "Time Is Running Out", "Running Out", "#38bdf8"),
  slam("time-clock-starts", "The Clock Starts", "The moment the timer begins.", "time", "The Clock Starts", "Clock", "#38bdf8"),
  eraStamp("time-24-hours", "24 Hours", "One day that changed everything.", "time", "00:00 — 24:00"),
  eraStamp("time-48-hours-later", "48 Hours Later", "Two-day jump stamp.", "time", "Day 0 — Day 2"),
  slam("time-final-hour", "The Final Hour", "Last hour before impact.", "time", "The Final Hour", "Final Hour", "#38bdf8"),
  slam("time-minutes-before", "Minutes Before Disaster", "Tight countdown title before disaster.", "time", "Minutes Before Disaster", "Disaster", "#f43f5e"),
  slam("time-seconds-before", "Seconds Before", "Last-second title beat.", "time", "Seconds Before", "Seconds", "#f43f5e"),
  clockRing("time-freeze", "Time Freeze", "Frozen clock ring at a critical percent.", 50, "Frozen"),
  yearScrub("time-clock-rewind", "Clock Rewind", "Years scrubbing back through history on a documentary rail.", "time", 1991, 2026, "1991, 2008, 2014, 2026", "#38bdf8"),
  yearScrub("time-travel", "Time Travel", "Jump across decades on a year rail.", "time", 1947, 2026, "1947, 1971, 1991, 2014, 2026"),
  yearScrub("time-fast-forward", "Fast Forward", "Years racing forward.", "time", 2000, 2026, "2000, 2010, 2020, 2026"),
  clockRing("time-slow-motion", "Slow Motion Time", "Slow-burn progress toward a deadline.", 35, "Slow motion"),
  slam("time-the-deadline", "The Deadline", "Hard deadline title plate.", "time", "The Deadline", "Deadline", "#38bdf8"),
  clockRing("time-ticking-clock", "Ticking Clock", "Ticking progress as pressure rises.", 67, "Ticking"),
  eraStamp("time-midnight", "Midnight", "Midnight stamp for crisis moments.", "time", "11:59 — 12:00"),
  slam("time-last-minute", "The Last Minute", "Last-minute decision beat.", "time", "The Last Minute", "Last Minute", "#38bdf8"),
  clockRing("time-hourglass", "Hourglass", "Sand-running progress metaphor.", 44, "Running out"),
  eraStamp("time-jump", "Time Jump", "Jump cut between two timestamps.", "time", "2019 → 2024"),
  yearsCount("time-timeline-clock", "Timeline Clock", "Years counting like a clock across a story.", "time", 1991, 2026, "#38bdf8"),
  yearsCount("time-day-counter", "Day Counter", "Days counting across an event.", "time", 1, 100, "#38bdf8"),
  yearsCount("time-days-since", "Days Since", "Days since a defining moment.", "time", 0, 365, "#38bdf8"),
  slam("time-countdown-begins", "The Countdown Begins", "Title slam when the timer starts.", "time", "The Countdown Begins", "Countdown", "#38bdf8"),
  clockRing("time-pressure", "Time Pressure", "Pressure building on the clock.", 91, "Under pressure"),
  eraStamp("time-24-7", "24/7 Timeline", "Always-on timeline stamp.", "time", "00:00 — 24:00 · EVERY DAY"),
  focusTimeline(
    "time-clock-timeline-morph",
    "Clock → Timeline Morph",
    "A clock beat that opens into a documentary timeline — ideal for “It all started in 1991…”.",
    "time",
    "#38bdf8",
    "1991|It begins|The clock becomes history\n2000|Build|Years compound\n2014|Shift|A new chapter\n2024|Now|The story continues",
    0,
  ),
];

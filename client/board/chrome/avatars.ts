function svgUrl(markup: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(markup)}`;
}

function figure(opts: {
  skin: string;
  hair: string;
  shirt: string;
  pants: string;
  shoes: string;
  hairPath: string;
  extras?: string;
}): string {
  const { skin, hair, shirt, pants, shoes, hairPath, extras = "" } = opts;
  return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 280" width="160" height="280">
    <ellipse cx="80" cy="268" rx="42" ry="8" fill="#000" opacity=".18"/>
    <path d="M58 168c-10 22-12 44-10 62h20l8-48 8 48h20c2-18 0-40-10-62z" fill="${pants}"/>
    <path d="M48 228h22l2 28h-16c-8 0-10-8-8-16z" fill="${shoes}"/>
    <path d="M90 228h22l8 12c2 8 0 16-8 16h-16z" fill="${shoes}"/>
    <path d="M46 96c-2 22 6 44 16 58h36c10-14 18-36 16-58-8-6-24-10-34-10s-26 4-34 10z" fill="${shirt}"/>
    <path d="M40 108c-8 18-14 18-18 14 6 22 18 36 28 42 2-16 4-34 6-48z" fill="${shirt}"/>
    <path d="M120 108c8 18 14 18 18 14-6 22-18 36-28 42-2-16-4-34-6-48z" fill="${shirt}"/>
    <circle cx="36" cy="118" r="8" fill="${skin}"/>
    <circle cx="124" cy="118" r="8" fill="${skin}"/>
    <circle cx="80" cy="58" r="28" fill="${skin}"/>
    <path d="${hairPath}" fill="${hair}"/>
    ${extras}
    <ellipse cx="70" cy="56" rx="3" ry="4" fill="#2a2438"/>
    <ellipse cx="90" cy="56" rx="3" ry="4" fill="#2a2438"/>
    <path d="M72 68c6 6 12 6 18 0" fill="none" stroke="#c45b6a" stroke-width="2" stroke-linecap="round"/>
  </svg>`);
}

export const FULL_BODY_AVATARS: { id: string; name: string; src: string }[] = [
  {
    id: "ava-maya",
    name: "Maya",
    src: figure({
      skin: "#f3c7a3",
      hair: "#f3c14a",
      shirt: "#7c5cfc",
      pants: "#2b2a4a",
      shoes: "#1a1433",
      hairPath: "M52 52c2-22 18-36 28-36 14 0 30 12 32 34 2 8-4 12-10 10-2-10-8-16-22-16-12 0-20 8-22 16-6 2-10-2-6-8z",
      extras: `<path d="M52 148h56l-6 20H58z" fill="#5b3fd6"/>`,
    }),
  },
  {
    id: "ava-leo",
    name: "Leo",
    src: figure({
      skin: "#d7a07a",
      hair: "#3b2a1a",
      shirt: "#2dd4bf",
      pants: "#1f2937",
      shoes: "#111827",
      hairPath: "M54 44c4-16 16-24 26-24s22 8 26 24c2 10-6 14-10 8-6-8-12-10-16-10s-12 2-18 10c-4 6-10 2-8-8z",
      extras: `<rect x="70" y="108" width="36" height="24" rx="3" fill="#0f172a"/><rect x="74" y="112" width="28" height="16" rx="2" fill="#67e8f9"/>`,
    }),
  },
  {
    id: "ava-aria",
    name: "Aria",
    src: figure({
      skin: "#e8b895",
      hair: "#9a3412",
      shirt: "#fb7185",
      pants: "#4c1d95",
      shoes: "#1e1b4b",
      hairPath: "M48 40c8-20 22-28 32-28 16 0 34 12 34 36 0 18-6 40-10 52h-12c2-16 4-34 2-46-2-8-8-12-16-12s-16 6-18 16c-2 12 0 30 2 42H50c-4-14-8-36-6-52 0-4 2-6 4-8z",
    }),
  },
  {
    id: "ava-noah",
    name: "Noah",
    src: figure({
      skin: "#c68642",
      hair: "#1c1917",
      shirt: "#38bdf8",
      pants: "#0f172a",
      shoes: "#020617",
      hairPath: "M52 48c2-18 16-28 28-28s26 10 28 28c0 8-8 10-12 6-4-6-10-10-16-10s-12 4-16 10c-4 4-12 2-12-6z",
      extras: `<path d="M64 74c4 10 12 14 16 14s12-4 16-14" fill="#5b3a24"/>`,
    }),
  },
  {
    id: "ava-zara",
    name: "Zara",
    src: figure({
      skin: "#8d5524",
      hair: "#111827",
      shirt: "#fbbf24",
      pants: "#1e3a5f",
      shoes: "#0b1220",
      hairPath: "M50 50c0-22 14-36 30-36 18 0 32 14 32 36 0 8-4 12-10 10-2-12-8-20-22-20s-20 8-22 20c-6 2-10-2-8-10z",
      extras: `<circle cx="80" cy="132" r="6" fill="#f59e0b"/>`,
    }),
  },
  {
    id: "ava-kenji",
    name: "Kenji",
    src: figure({
      skin: "#f6d0b1",
      hair: "#111827",
      shirt: "#34d399",
      pants: "#14532d",
      shoes: "#052e16",
      hairPath: "M54 42c6-14 16-20 26-20s20 6 26 20c4 8-2 12-8 8-6-6-12-8-18-8s-12 2-18 8c-6 4-12 0-8-8z",
      extras: `<path d="M60 86h40v8H60z" fill="#059669"/>`,
    }),
  },
];

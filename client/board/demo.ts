import {
  defaultElement,
  defaultScene,
  emptyBoardDocument,
  type BoardDocument,
} from "../../shared/board";

export function travelDemoBoard(): BoardDocument {
  const doc = emptyBoardDocument("Untitled Project");
  const india = defaultElement("rectangle", {
    id: "india_card",
    name: "India Card",
    x: 80,
    y: 180,
    width: 420,
    height: 320,
    fill: "#f3edff",
    stroke: "#7c5cfc",
    strokeWidth: 2,
    motion: { preset: "fadeIn", durationMs: 1200, delayMs: 0 },
  });
  const indiaFlag = defaultElement("text", {
    id: "india_flag",
    name: "India flag",
    parentId: "india_card",
    x: 24,
    y: 20,
    width: 80,
    height: 48,
    content: "🇮🇳",
    fontSize: 40,
    fill: "#1a1433",
  });
  const indiaTitle = defaultElement("text", {
    id: "india_title",
    parentId: "india_card",
    x: 24,
    y: 80,
    width: 360,
    height: 48,
    content: "India",
    fontSize: 40,
    fill: "#1a1433",
  });
  const indiaArt = defaultElement("text", {
    id: "india_art",
    parentId: "india_card",
    x: 24,
    y: 140,
    width: 360,
    height: 140,
    content: "🕌  Taj Mahal",
    fontSize: 28,
    fill: "#5b3fd6",
  });
  india.children = ["india_flag", "india_title", "india_art"];

  const usa = defaultElement("rectangle", {
    id: "usa_card",
    name: "USA Card",
    x: 760,
    y: 180,
    width: 420,
    height: 320,
    fill: "#eef2ff",
    stroke: "#7c5cfc",
    strokeWidth: 2,
    motion: { preset: "slideIn", durationMs: 1200, delayMs: 4200 },
  });
  const usaFlag = defaultElement("text", {
    id: "usa_flag",
    parentId: "usa_card",
    x: 24,
    y: 20,
    width: 80,
    height: 48,
    content: "🇺🇸",
    fontSize: 40,
    fill: "#1a1433",
  });
  const usaTitle = defaultElement("text", {
    id: "usa_title",
    parentId: "usa_card",
    x: 24,
    y: 80,
    width: 360,
    height: 48,
    content: "USA",
    fontSize: 40,
    fill: "#1a1433",
  });
  const usaArt = defaultElement("text", {
    id: "usa_art",
    parentId: "usa_card",
    x: 24,
    y: 140,
    width: 360,
    height: 140,
    content: "🗽  Liberty",
    fontSize: 28,
    fill: "#5b3fd6",
  });
  usa.children = ["usa_flag", "usa_title", "usa_art"];

  const arrow = defaultElement("arrow", {
    id: "path_arrow",
    name: "Arrow",
    x: 500,
    y: 320,
    width: 250,
    height: 0,
    stroke: "#7c5cfc",
    strokeWidth: 3,
    motion: { preset: "fadeIn", durationMs: 800, delayMs: 2800 },
  });

  doc.elements = {
    [india.id]: india,
    [indiaFlag.id]: indiaFlag,
    [indiaTitle.id]: indiaTitle,
    [indiaArt.id]: indiaArt,
    [usa.id]: usa,
    [usaFlag.id]: usaFlag,
    [usaTitle.id]: usaTitle,
    [usaArt.id]: usaArt,
    [arrow.id]: arrow,
  };
  doc.scenes = [
    defaultScene("india_card", "Zoom In", {
      durationMs: 3000,
      transitionIn: "zoom",
      transitionMs: 900,
    }),
    defaultScene("usa_card", "Pan Right", {
      durationMs: 4000,
      transitionIn: "pan",
      transitionMs: 1400,
    }),
  ];
  return doc;
}

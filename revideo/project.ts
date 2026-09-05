import { makeProject } from "@revideo/core";
import main from "./scenes/main";
import "./global.css";

export default makeProject({
  name: "bestmotions",
  scenes: [main],
  variables: {
    template: "cover-slam",
    title: "The Hidden Files",
    author: "A. RESEARCHER",
    subtitle: "What the records never said out loud",
    coverColor: "#1e3a5f",
    accent: "#e63946",
    bg: "#07090e",
  },
  settings: {
    shared: {
      background: "rgba(0,0,0,0)",
      size: { x: 1280, y: 720 },
    },
    preview: {
      fps: 30,
      resolutionScale: 1,
    },
    rendering: {
      exporter: {
        name: "@revideo/core/wasm",
      },
      fps: 30,
      resolutionScale: 1,
      colorSpace: "srgb",
    },
  },
});

import { makeProject } from "@revideo/core";
import main from "./scenes/board-main";
import "./global.css";

export default makeProject({
  name: "magic-board",
  scenes: [main],
  variables: {
    template: "magic-board",
    boardJson: "{}",
    sound: "off",
  },
  settings: {
    shared: {
      background: "#0c1f18",
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

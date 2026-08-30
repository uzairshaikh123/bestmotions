/** @jsxImportSource @revideo/2d/lib */
import { makeScene2D } from "@revideo/2d";
import { runMagicBoard } from "./packs/board";

/** Standalone MagicBoard scene — keeps the export bundle off maps/news/photos. */
export default makeScene2D("magic-board", function* (view) {
  yield* runMagicBoard(view);
});

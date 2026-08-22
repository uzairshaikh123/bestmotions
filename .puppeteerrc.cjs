const { join } = require("path");

/**
 * Keep Chrome inside the project so Render carries it from build → runtime.
 * Default ~/.cache/puppeteer is not reliably available on Render.
 */
module.exports = {
  cacheDirectory: join(__dirname, ".cache", "puppeteer"),
};

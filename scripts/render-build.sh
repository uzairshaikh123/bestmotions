#!/usr/bin/env bash
set -euo pipefail

npm install
npx puppeteer browsers install chrome
npm run build

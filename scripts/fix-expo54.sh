#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

RN_TARGET="${RN_TARGET:-~0.81.5}"

echo "👉 Aligning React Native dependencies with Expo SDK 54 (${RN_TARGET})..."
npx expo install "react-native@${RN_TARGET}" react-native-reanimated react-native-gesture-handler react-native-screens react-native-safe-area-context

echo "👉 Re-installing JavaScript dependencies..."
npm install

echo "👉 Regenerating native projects without running CocoaPods..."
npx expo prebuild --clean --no-install

echo "👉 Ensuring ios.buildReactNativeFromSource is set..."
node <<'NODE'
const fs = require('fs');
const path = require('path');
const file = path.join('ios', 'Podfile.properties.json');
const props = JSON.parse(fs.readFileSync(file, 'utf8'));
props["ios.buildReactNativeFromSource"] = "true";
fs.writeFileSync(file, JSON.stringify(props, null, 2) + '\n');
NODE

echo "👉 Installing CocoaPods..."
(cd ios && pod install)

echo "✅ Done. Run 'npx expo run:ios' (or :android) to rebuild."

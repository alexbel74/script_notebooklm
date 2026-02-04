#!/bin/bash

# Build script for NotebookLM Importer - Chrome & Firefox

echo "🔨 Building NotebookLM Importer extension..."
echo ""

# Clean previous builds
rm -rf build
mkdir -p build/chrome build/firefox

echo "📦 Copying files..."

# Copy common files to both builds
for dir in chrome firefox; do
  mkdir -p build/$dir/{popup,app,content,lib,icons,_locales/en,_locales/ru}
  
  cp -r popup/* build/$dir/popup/
  cp -r app/* build/$dir/app/ 2>/dev/null || echo "⚠️  app/ folder not complete yet"
  cp -r content/* build/$dir/content/
  cp -r lib/* build/$dir/lib/
  cp -r icons/* build/$dir/icons/ 2>/dev/null || echo "⚠️  icons/ folder not complete yet"
  cp -r _locales/en/* build/$dir/_locales/en/
  cp -r _locales/ru/* build/$dir/_locales/ru/
  cp background.js build/$dir/
  cp README.md build/$dir/
done

# Copy browser-specific manifests
echo "📋 Copying manifests..."
cp manifest.json build/chrome/
cp manifest-firefox.json build/firefox/manifest.json

# Create ZIP archives
echo "🗜️  Creating archives..."

cd build/chrome
zip -r -q ../notebooklm-importer-chrome.zip ./*
cd ../..

cd build/firefox
zip -r -q ../notebooklm-importer-firefox.zip ./*
cd ../..

echo ""
echo "✅ Build complete!"
echo ""
echo "📦 Chrome extension: build/notebooklm-importer-chrome.zip"
echo "📦 Firefox extension: build/notebooklm-importer-firefox.zip"
echo ""
echo "🚀 Next steps:"
echo "  - Chrome: Load unpacked from build/chrome/"
echo "  - Firefox: Install from build/notebooklm-importer-firefox.zip"

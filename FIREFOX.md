# 🦊 Firefox Installation Guide

## Quick Steps

1. **Download** this repository or use your existing folder
2. **Open Firefox** and navigate to: `about:debugging#/runtime/this-firefox`
3. Click **"Load Temporary Add-on..."**
4. Navigate to the extension folder
5. **IMPORTANT:** Select the file `manifest.v2.json` (NOT manifest.json or manifest-firefox.json)
6. Click **"Open"**

## Files to Use for Firefox

✅ **USE THIS FILE:** `manifest.v2.json`  
❌ **DON'T USE:** `manifest.json` (Chrome only)  
❌ **DON'T USE:** `manifest-firefox.json` (old version)

## Verification

After loading, you should see:
- ✅ "NotebookLM Importer" in the list of extensions
- ✅ Extension icon in Firefox toolbar
- ✅ No errors in the console

## Common Issues

### Error: "background.service_worker is currently disabled"
**Solution:** Make sure you selected `manifest.v2.json`, not `manifest.json`

### Error: "Could not load manifest"
**Solution:** Check that all files are present in the folder:
- background.js
- popup/popup.html, popup.js, popup.css
- content/notebooklm.js, notebooklm.css
- lib/i18n.js
- icons/icon16.png, icon32.png, icon48.png, icon128.png
- _locales/en/messages.json, _locales/ru/messages.json

### Extension loads but doesn't work
**Solution:** 
1. Visit https://notebooklm.google.com
2. Log in to your Google account
3. Open any notebook
4. Try clicking the extension icon

## Updating the Extension

After making changes to the code:
1. Go to `about:debugging#/runtime/this-firefox`
2. Find "NotebookLM Importer"
3. Click **"Reload"**

## Keyboard Shortcut

- **Windows/Linux:** Ctrl+Shift+N
- **Mac:** Cmd+Shift+N

---

**Need help?** Check the main [README.md](README.md) or open an issue on GitHub.

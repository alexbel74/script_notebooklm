# 🎯 Chrome Installation Guide

## ✅ **Quick Setup for Chrome**

This extension is fully compatible with **Google Chrome** using **Manifest V3**.

---

## 📥 **Installation Steps**

### **Method 1: Install from Chrome Web Store** (Coming soon)
- Extension will be published to Chrome Web Store
- One-click installation
- Automatic updates

### **Method 2: Load Unpacked (Developer Mode)**

1. **Download the extension**
   ```
   https://github.com/alexbel74/script_notebooklm
   Code → Download ZIP → Extract
   ```

2. **Open Chrome Extensions**
   ```
   chrome://extensions/
   ```
   Or: Menu (⋮) → Extensions → Manage Extensions

3. **Enable Developer Mode**
   - Toggle the **"Developer mode"** switch in the top-right corner

4. **Load the Extension**
   - Click **"Load unpacked"**
   - Navigate to the extracted folder
   - Select the **`chrome-build/`** folder
   - Or select the **root folder** (both work!)

5. **Verify Installation**
   - ✅ "NotebookLM Importer" appears in the list
   - ✅ Extension icon appears in toolbar
   - ✅ Version: 2.0.0

---

## 🚀 **Using the Extension**

### **Step 1: Log in to NotebookLM**
```
https://notebooklm.google.com
```
- Sign in with your Google account
- Create or open a notebook

### **Step 2: Import Content**

**YouTube Playlist:**
1. Open any YouTube playlist
2. Click the extension icon
3. Select notebook
4. Click **"📋 Import Playlist"**
5. Wait 30-60 seconds
6. Done! All videos added (up to 50)

**YouTube Channel:**
1. Open any YouTube channel
2. Click the extension icon
3. Select notebook
4. Click **"📺 Import Channel"**
5. Wait 30-90 seconds
6. Done! Latest 50 videos added

**Single Video:**
1. Open any YouTube video
2. Click the extension icon
3. Select notebook
4. Click **"🎬 Add Video"**
5. Done! Video added

**Web Page:**
1. Open any web page
2. Click the extension icon
3. Select notebook
4. Click **"Add to Notebook"**
5. Done! Page added

---

## ⌨️ **Keyboard Shortcut**

- **Windows/Linux:** `Ctrl+Shift+N`
- **Mac:** `Cmd+Shift+N`

Quick open the extension from any tab!

---

## 🎨 **Features**

✅ **Modern Glassmorphism UI**
- Aurora gradients (Purple → Blue → Cyan)
- Smooth animations
- Beautiful design

✅ **YouTube Import**
- Import playlists (up to 50 videos)
- Import channels (up to 50 videos)
- Add single videos

✅ **Auto-Detection**
- Automatically detects page type
- Shows appropriate button text
- Smart imports

✅ **Multi-Language**
- English (EN)
- Russian (RU)

---

## 🔧 **Technical Details**

- **Manifest:** V3 (latest)
- **Background:** Service Worker
- **Permissions:** tabs, storage, activeTab, scripting, contextMenus
- **Host Permissions:** notebooklm.google.com, youtube.com, accounts.google.com

---

## ⚠️ **Requirements**

- **Chrome:** Version 88 or higher
- **NotebookLM Account:** Free Google account
- **Internet Connection:** Required

---

## 📊 **What Gets Imported**

### **YouTube Playlist:**
- All videos from the playlist
- Maximum: 50 videos per import
- Direct links to NotebookLM

### **YouTube Channel:**
- Latest videos from channel
- Maximum: 50 videos per import
- Automatically parsed

### **Single Video:**
- One video link
- Instant import

### **Web Page:**
- Page URL
- Content will be analyzed by NotebookLM

---

## 🐛 **Troubleshooting**

### **Extension Not Loading**
- Make sure Developer Mode is enabled
- Check that all files are present in the folder
- Try reloading the extension

### **"Not authorized" Error**
- Open https://notebooklm.google.com
- Log in to your Google account
- Open any notebook
- Try again

### **Import Not Working**
- Check internet connection
- Verify you're logged in to NotebookLM
- Make sure notebook is open
- Check console for errors (F12)

### **Service Worker Error**
- This is normal in Chrome
- Service worker restarts automatically
- Extension still works correctly

---

## 🔄 **Updating the Extension**

1. Go to `chrome://extensions/`
2. Find "NotebookLM Importer"
3. Click **"Reload"** button (🔄)
4. Or click **"Update"** if available

---

## 📦 **Files Structure**

```
chrome-build/
├── manifest.json       ← Manifest V3
├── background.js       ← Service Worker
├── popup/
│   ├── popup.html     ← UI
│   ├── popup.css      ← Styles
│   └── popup.js       ← Logic
├── content/
│   ├── notebooklm.js  ← Content Script
│   └── notebooklm.css ← Styles
├── lib/
│   ├── browser-polyfill.js
│   └── i18n.js
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── _locales/
    ├── en/messages.json
    └── ru/messages.json
```

---

## 🎯 **What's Next**

- [ ] Publish to Chrome Web Store
- [ ] Add more import options
- [ ] Add comments parsing
- [ ] Add bulk delete feature

---

## 🔗 **Links**

- **GitHub:** https://github.com/alexbel74/script_notebooklm
- **NotebookLM:** https://notebooklm.google.com
- **Issues:** https://github.com/alexbel74/script_notebooklm/issues

---

## ✨ **Enjoy!**

The extension is ready to use! Import your YouTube playlists and channels into NotebookLM with ease! 🚀

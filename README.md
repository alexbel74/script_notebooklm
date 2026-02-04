# NotebookLM Importer 🎨

Beautiful Chrome & Firefox extension for importing content into Google NotebookLM with modern glassmorphism design and aurora effects.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Chrome](https://img.shields.io/badge/Chrome-Compatible-green)
![Firefox](https://img.shields.io/badge/Firefox-Compatible-orange)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

## ✨ Features

- 🎨 **Modern UI** - Beautiful glassmorphism design with aurora gradient effects
- 📺 **YouTube Support** - Import videos, playlists, and channel content
- 💬 **Comments Parser** - Extract and import YouTube comments
- 📑 **Bulk Import** - Add multiple links at once
- 🗂️ **Tab Import** - Import all open browser tabs
- 🗑️ **Bulk Delete** - Delete multiple sources from notebooks
- 🌍 **Multi-language** - English and Russian support
- 👥 **Multi-account** - Support for multiple Google accounts
- ⌨️ **Keyboard Shortcuts** - Quick add with `Ctrl+Shift+N`
- 🎭 **Theme Support** - Light and dark modes

## 📸 Screenshots

### Popup Interface
Modern glassmorphism design with smooth animations:
- Current page detection with badge (YouTube Video/Playlist/Channel)
- Notebook selector with search
- Quick actions for bulk import, tabs, and YouTube options
- Parse comments directly from YouTube videos

### Bulk Import & Tab Management
- Import multiple URLs at once
- Select and import from open browser tabs
- YouTube channel/playlist extraction
- Progress tracking with smooth shimmer effects

## 🚀 Installation

### Chrome

1. Download or clone this repository:
   ```bash
   git clone https://github.com/your-username/notebooklm-importer.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked**
5. Select the extension folder

### Firefox

**Option 1: From Source**
1. Clone the repository
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on**
4. Select `manifest-firefox.json` from the extension folder

**Option 2: Build Package**
1. Clone the repository
2. Run the build script:
   ```bash
   chmod +x build.sh
   ./build.sh
   ```
3. Open `about:addons`
4. Click the gear icon → **Install Add-on From File**
5. Select `build/notebooklm-importer-firefox.zip`

## 📖 Usage

### Basic Usage

1. **Login to NotebookLM** - Visit [notebooklm.google.com](https://notebooklm.google.com) and log in
2. **Click Extension Icon** - Open the popup interface
3. **Select Notebook** - Choose or create a notebook
4. **Add Current Page** - Click "Add to Notebook" button

### YouTube Features

**Single Video**: Adds the current video

**Playlist**: Automatically extracts and adds all videos (up to 50)

**Channel**: Adds visible videos from the channel page

**Comments Parser**:
- Opens on YouTube video pages
- Click "Parse Comments" to extract comments
- Configure mode (Top/Newest) and limits in YouTube Options
- Comments are formatted as Markdown and split into parts if needed

### Bulk Import

1. Navigate to app through Quick Actions or Extension menu
2. Select "Bulk Import"
3. Paste URLs (one per line)
4. Choose notebook and click "Import All"

### Tab Import

1. Open "From Tabs" page
2. Select tabs you want to import
3. Click "Import Selected"

### Keyboard Shortcut

Press `Ctrl+Shift+N` (`Cmd+Shift+N` on Mac) to quickly open the extension popup.

## 🛠️ Development

### Project Structure

```
notebooklm-importer/
├── manifest.json           # Chrome manifest (MV3)
├── manifest-firefox.json   # Firefox manifest (MV2)
├── background.js           # Service worker/background script
├── popup/                  # Extension popup
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── app/                    # Full-page app interface
│   ├── app.html
│   ├── app.css
│   └── app.js
├── content/                # Content scripts for NotebookLM
│   ├── notebooklm.js
│   └── notebooklm.css
├── lib/                    # Shared libraries
│   ├── browser-polyfill.js
│   └── i18n.js
├── icons/                  # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── _locales/              # Translations
│   ├── en/messages.json
│   └── ru/messages.json
├── build.sh               # Build script
└── README.md
```

### Building

```bash
# Make build script executable
chmod +x build.sh

# Build for both browsers
./build.sh
```

This creates:
- `build/notebooklm-importer-chrome.zip` - Chrome extension
- `build/notebooklm-importer-firefox.zip` - Firefox extension

### Tech Stack

- **Manifest V3** (Chrome) / **Manifest V2** (Firefox)
- **Vanilla JavaScript** - No frameworks for performance
- **Modern CSS** - Glassmorphism, Aurora effects, smooth animations
- **NotebookLM API** - Reverse-engineered API for notebook management
- **YouTube API** - Comment parsing and video extraction

## 🎨 Design System

### Colors

- **Primary Gradient**: Purple (`#8b5cf6`) → Blue (`#3b82f6`) → Cyan (`#06b6d4`)
- **Background**: Deep dark (`#0f0f1a`)
- **Cards**: Glass effect with backdrop blur
- **Text**: White with opacity variants

### Effects

- **Glassmorphism**: Semi-transparent cards with backdrop blur
- **Aurora**: Animated gradient blobs in background
- **Glow**: Soft glow effects on hover and active states
- **Shimmer**: Loading animation with gradient sweep

## 🌐 Localization

Currently supported languages:
- English (en)
- Russian (ru)

### Adding New Languages

1. Create `_locales/{lang}/messages.json`
2. Copy structure from `_locales/en/messages.json`
3. Translate all message values
4. Add language to `lib/i18n.js` languages object

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Guidelines

1. Follow existing code style
2. Test in both Chrome and Firefox
3. Update README if adding features
4. Add translations for new UI text

## 📝 License

MIT License - feel free to use, modify, and distribute.

## 🙏 Credits

- Original inspiration: [AndyShaman/add_to_NotebookLM](https://github.com/AndyShaman/add_to_NotebookLM)
- Modern redesign with glassmorphism and aurora effects
- Enhanced features and multi-browser support

## 🐛 Known Issues

- YouTube comment parsing may be rate-limited by YouTube
- Large playlists (>50 videos) are truncated for performance
- NotebookLM API is unofficial and may change

## 🔮 Roadmap

- [ ] Import from Twitter/X threads
- [ ] Import from Reddit posts
- [ ] Import from Pocket/Instapaper
- [ ] Dark/Light theme auto-detection
- [ ] Export notebook contents
- [ ] Sync settings across devices

## 📞 Support

For bugs, feature requests, or questions:
- Open an [Issue](https://github.com/your-username/notebooklm-importer/issues)
- Check existing issues first

## ⭐ Star History

If you find this extension useful, please consider giving it a star on GitHub!

---

Made with ❤️ for the NotebookLM community

# Icon Files Needed

This folder should contain the following icon files:

- **icon16.png** (16x16px) - Browser toolbar
- **icon32.png** (32x32px) - Extension management page
- **icon48.png** (48x48px) - Extension details
- **icon128.png** (128x128px) - Chrome Web Store

## Design Guidelines

### Style
- Modern glassmorphism look
- Gradient colors: Purple (#8b5cf6) → Blue (#3b82f6) → Cyan (#06b6d4)
- Document/notebook icon with layers
- Transparent background or subtle glow

### Recommended Design
1. Base shape: Rounded rectangle (notebook)
2. Add horizontal lines (representing text/content)
3. Apply gradient fill
4. Optional: Add subtle shadow or glow

## Creating Icons

You can create these icons using:

1. **Online Tools**:
   - [Figma](https://figma.com) - Free design tool
   - [Canva](https://canva.com) - Simple icon creator
   - [Photopea](https://photopea.com) - Online Photoshop alternative

2. **AI Tools**:
   - DALL-E or Midjourney for icon generation
   - Specify: "Modern app icon, notebook with gradient purple to cyan, glassmorphism style"

3. **Icon Libraries**:
   - Download from [Flaticon](https://flaticon.com) and modify
   - Use [Heroicons](https://heroicons.com) as base

## Quick Solution

For testing purposes, you can use the original extension's icons or create simple colored squares:

```bash
# Use ImageMagick to create placeholder icons
convert -size 16x16 gradient:'#8b5cf6-#06b6d4' icon16.png
convert -size 32x32 gradient:'#8b5cf6-#06b6d4' icon32.png
convert -size 48x48 gradient:'#8b5cf6-#06b6d4' icon48.png
convert -size 128x128 gradient:'#8b5cf6-#06b6d4' icon128.png
```

Or copy from the original extension:
```bash
wget https://raw.githubusercontent.com/AndyShaman/add_to_NotebookLM/main/icons/icon16.png
wget https://raw.githubusercontent.com/AndyShaman/add_to_NotebookLM/main/icons/icon32.png
wget https://raw.githubusercontent.com/AndyShaman/add_to_NotebookLM/main/icons/icon48.png
wget https://raw.githubusercontent.com/AndyShaman/add_to_NotebookLM/main/icons/icon128.png
```

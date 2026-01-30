# Electron App Icon Setup

The Electron build is currently working without an icon. To add a proper app icon:

## Creating the Icon

### Requirements
- **Format**: PNG with transparency
- **Size**: 512x512 pixels (recommended)
- **Quality**: High resolution, clear at small sizes

### Steps to Add Icon

1. **Create/Obtain Icon**
   - Design a 512x512 PNG icon
   - Or use an existing logo/image
   - Ensure it looks good at small sizes (16x16, 32x32)

2. **Save Icon File**
   ```bash
   # Create assets directory if it doesn't exist
   mkdir assets
   
   # Save your icon as assets/icon.png
   # Replace the current text file with actual PNG image
   ```

3. **Update Configuration**
   
   **In package.json**, add icon references back:
   ```json
   "mac": {
     "category": "public.app-category.productivity",
     "icon": "assets/icon.png",
     "target": [...]
   },
   "win": {
     "icon": "assets/icon.png", 
     "target": [...]
   },
   "linux": {
     "icon": "assets/icon.png",
     "category": "Office",
     "target": [...]
   }
   ```

   **In main.js**, add icon back to BrowserWindow:
   ```javascript
   icon: path.join(__dirname, "assets", "icon.png"),
   ```

   **In package.json files array**, add:
   ```json
   "files": [
     "main.js",
     "preload.js", 
     "electron.config.js",
     "assets/**/*",  // Add this back
     "package.json"
   ]
   ```

## Icon Tools & Resources

### Online Icon Generators
- [Favicon.io](https://favicon.io/) - Generate from text/image
- [RealFaviconGenerator](https://realfavicongenerator.net/) - Multi-platform icons
- [IconKitchen](https://icon.kitchen/) - Android/iOS style icons

### Design Tools
- **Figma** - Free, web-based design tool
- **Canva** - Easy icon creation with templates
- **GIMP** - Free image editor
- **Photoshop** - Professional image editor

### Icon Guidelines
- **Simple design** - Works well at small sizes
- **High contrast** - Visible on light and dark backgrounds  
- **No text** - Icons should be symbolic, not text-based
- **Square format** - Will be automatically rounded on some platforms

## Quick Test
After adding the icon:
```bash
npm run electron:pack
```

The build should complete without icon format errors.

## Current Status
✅ Electron build works without icon  
⏳ Icon setup pending - follow steps above to add  
✅ All other functionality working properly
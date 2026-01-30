# Electron Desktop App

This project includes an Electron desktop application wrapper for the Next.js web app.

## Architecture

The Electron app connects to different URLs based on the environment:
- **Development**: Connects to local Next.js dev server (`http://localhost:9002`)
- **Production**: Connects to Vercel deployment (`https://studio-six-mu-29.vercel.app`)

## Development

### Prerequisites
Install the additional dependencies:
```bash
npm install concurrently wait-on --save-dev
```

### Running in Development
```bash
# Start both Next.js dev server and Electron app
npm run electron:dev

# Or run separately:
npm run dev          # Start Next.js dev server (port 9002)
npm run electron     # Start Electron app (requires dev server running)
```

### Building for Production

Since the production app uses the Vercel deployment, no Next.js build is needed for Electron:

```bash
# Package the Electron app (no build step needed)
npm run electron:pack

# Create distributable packages
npm run electron:dist

# Build and distribute in one command
npm run electron:build
```

## How It Works

### Development Mode
- Next.js dev server runs on port 9002
- Electron connects to `http://localhost:9002`
- Hot reloading and DevTools available
- Full local development experience

### Production Mode
- Electron connects directly to `https://studio-six-mu-29.vercel.app`
- No local server needed
- Always uses the latest deployed version
- Requires internet connection

## Configuration

### URLs
- **Development**: `http://localhost:9002` (local dev server)
- **Production**: `https://studio-six-mu-29.vercel.app` (Vercel deployment)

### Environment Variables
Update `.env.electron` to change URLs:
```env
DEV_SERVER_URL=http://localhost:9002
PROD_SERVER_URL=https://studio-six-mu-29.vercel.app
```

## Configuration

### App Metadata
Update the following in `package.json`:
- `build.appId`: Your app's unique identifier
- `build.productName`: Display name for your app

### Icons
Replace `assets/icon.png` with your app icon:
- **Recommended size**: 512x512 pixels
- **Format**: PNG with transparency
- **Platforms**: The same icon will be used for all platforms

### Security Features
- **Context Isolation**: Enabled for security
- **Node Integration**: Disabled in renderer process
- **Preload Script**: Safe API exposure via `preload.js`
- **External Link Handling**: Opens in default browser

### Platform-Specific Builds
- **Windows**: Creates NSIS installer
- **macOS**: Creates DMG with universal binary (x64 + ARM64)
- **Linux**: Creates AppImage

## File Structure
```
├── main.js              # Electron main process
├── preload.js           # Secure preload script
├── assets/
│   └── icon.png         # App icon
├── out/                 # Next.js static export
└── dist/                # Electron build output
```

## Troubleshooting

### Common Issues
1. **Port conflicts**: Ensure port 9002 is available for Next.js dev server
2. **Build failures**: Check that `out/` directory exists after Next.js build
3. **Icon not showing**: Verify `assets/icon.png` exists and is valid

### Development Tips
- Use `Ctrl+Shift+I` (or `Cmd+Option+I` on macOS) to open DevTools
- The app automatically reloads when Next.js dev server restarts
- Check console for any preload script errors
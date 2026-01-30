# Electron Deployment Configuration

## URL Configuration

The Electron app is now configured to use different URLs based on environment:

### Development
- **URL**: `http://localhost:9002`
- **Usage**: Local Next.js development server
- **Features**: Hot reloading, DevTools, full development experience

### Production  
- **URL**: `https://studio-six-mu-29.vercel.app`
- **Usage**: Vercel deployment
- **Features**: Always latest version, no local server needed

## Quick Start

### Development
```bash
# Terminal 1: Start Next.js dev server
npm run dev

# Terminal 2: Start Electron app
npm run electron

# Or combined:
npm run electron:dev
```

### Production Build
```bash
# Create Electron distributables
npm run electron:dist

# The app will connect to Vercel deployment automatically
```

## Configuration Files

### `electron.config.js`
Central configuration for URLs, window settings, and app metadata:
```javascript
{
  urls: {
    development: "http://localhost:9002",
    production: "https://studio-six-mu-29.vercel.app"
  }
}
```

### Changing URLs
To update URLs, edit `electron.config.js`:
1. Update `urls.development` for local dev server
2. Update `urls.production` for deployed app
3. Rebuild Electron app: `npm run electron:dist`

## Benefits

✅ **No local server in production** - Uses Vercel deployment directly  
✅ **Always up-to-date** - Production app uses latest deployed version  
✅ **Simplified builds** - No need to bundle Next.js with Electron  
✅ **Easy configuration** - Change URLs in one place  
✅ **Cross-platform** - Works on Windows, macOS, and Linux
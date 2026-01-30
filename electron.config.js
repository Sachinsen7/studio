// Electron Configuration
module.exports = {
  // URL Configuration
  urls: {
    development: "http://localhost:9002",
    production: "https://studio-six-mu-29.vercel.app"
  },
  
  // Window Configuration
  window: {
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600
  },
  
  // App Configuration
  app: {
    name: "NextN",
    version: "0.1.0",
    description: "ADRS Studio Desktop Application"
  },
  
  // Development Settings
  development: {
    openDevTools: true,
    showConsole: true
  }
};
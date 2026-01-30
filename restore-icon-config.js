// Script to restore icon configuration after adding proper icon file
// Run with: node restore-icon-config.js

const fs = require('fs');
const path = require('path');

console.log('🔧 Restoring icon configuration...');

// Check if icon file exists
const iconPath = path.join(__dirname, 'assets', 'icon.png');
if (!fs.existsSync(iconPath)) {
  console.error('❌ Icon file not found at assets/icon.png');
  console.log('Please add a proper PNG icon file first, then run this script.');
  process.exit(1);
}

// Check if it's a real PNG file (not text)
const iconContent = fs.readFileSync(iconPath);
if (!iconContent.toString('hex').startsWith('89504e47')) {
  console.error('❌ assets/icon.png is not a valid PNG file');
  console.log('Please replace it with a proper PNG image file.');
  process.exit(1);
}

console.log('✅ Valid PNG icon found');

// Read package.json
const packagePath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Add icon references back to electron-builder config
packageJson.build.mac.icon = 'assets/icon.png';
packageJson.build.win.icon = 'assets/icon.png';
packageJson.build.linux.icon = 'assets/icon.png';

// Add assets back to files array
if (!packageJson.build.files.includes('assets/**/*')) {
  packageJson.build.files.push('assets/**/*');
}

// Restore extraResources
packageJson.build.extraResources = [
  {
    "from": "assets",
    "to": "assets"
  }
];

// Write updated package.json
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
console.log('✅ Updated package.json with icon configuration');

// Update main.js to include icon
const mainJsPath = path.join(__dirname, 'main.js');
let mainJsContent = fs.readFileSync(mainJsPath, 'utf8');

// Add icon line back if not present
if (!mainJsContent.includes('icon: path.join(__dirname, "assets", "icon.png")')) {
  mainJsContent = mainJsContent.replace(
    'preload: path.join(__dirname, "preload.js"),',
    'preload: path.join(__dirname, "preload.js"),\n    },\n    icon: path.join(__dirname, "assets", "icon.png"),'
  );
  
  fs.writeFileSync(mainJsPath, mainJsContent);
  console.log('✅ Updated main.js with icon reference');
}

console.log('🎉 Icon configuration restored!');
console.log('You can now run: npm run electron:pack');
const fs = require('fs');
const path = require('path');

const gradlePath = path.join(__dirname, 'android', 'app', 'build.gradle');

// Read version from package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const versionName = packageJson.version;

// Read file build.gradle
let gradleContent = fs.readFileSync(gradlePath, 'utf8');

// Read current version
const currentVersionCodeMatch = gradleContent.match(/versionCode\s+(\d+)/);
const currentVersionCode = parseInt(currentVersionCodeMatch[1], 10);
const newVersionCode = currentVersionCode + 1;

// Update build.gradle
gradleContent = gradleContent
  .replace(/versionCode\s+\d+/, `versionCode ${newVersionCode}`)
  .replace(/versionName\s+"[^"]+"/, `versionName "${versionName}"`);

// Write to file
fs.writeFileSync(gradlePath, gradleContent, 'utf8');

console.log(`Updated build.gradle to versionCode ${newVersionCode}, versionName ${versionName}`);
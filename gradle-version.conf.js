const fs = require('fs');
const path = require('path');

const gradlePath = path.join(__dirname, 'android', 'app', 'build.gradle');

// Read version from package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const newVersionName = packageJson.version;

// Read file build.gradle
let gradleContent = fs.readFileSync(gradlePath, 'utf8');

// Read current version
const currentVersionCodeMatch = gradleContent.match(/versionCode\s+(\d+)/);
const currentVersionNameMatch = gradleContent.match(/versionName\s+"([^"]+)"/);

const currentVersionCode = parseInt(currentVersionCodeMatch[1], 10);
const currentVersionName = currentVersionNameMatch[1];
const newVersionCode = currentVersionCode + 1;

if (currentVersionName == newVersionName) {
    console.log(`build.gradle not updated! Same version found: ${newVersionName}`);
} else {
    // Update build.gradle
    gradleContent = gradleContent
      .replace(/versionCode\s+\d+/, `versionCode ${newVersionCode}`)
      .replace(/versionName\s+"[^"]+"/, `versionName "${newVersionName}"`);
    
    // Write to file
    fs.writeFileSync(gradlePath, gradleContent, 'utf8');
    
    console.log(`Updated build.gradle to versionCode ${newVersionCode}, versionName ${newVersionName}`);
}
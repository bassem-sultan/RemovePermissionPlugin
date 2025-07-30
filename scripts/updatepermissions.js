const fs = require('fs');
const path = require('path');

const permissionsToRemove = ["RECORD_AUDIO", "MODIFY_AUDIO_SETTINGS"];
const manifestFile = "platforms/android/app/src/main/AndroidManifest.xml";

fs.readFile(manifestFile, "utf8", (err, data) => {
    if (err) return console.log(err);

    let result = data;
    permissionsToRemove.forEach(permission => {
        const regex = new RegExp(`<uses-permission android:name="android.permission.${permission}"\\s*/?>`, 'g');
        result = result.replace(regex, '');
    });

    fs.writeFile(manifestFile, result, "utf8", (err) => {
        if (err) return console.log(err);
    });
});




module.exports = function (context) {
    const platforms = context.opts.platforms;

    if (!platforms.includes('ios')) return;

    const iosPath = path.join(context.opts.projectRoot, 'platforms', 'ios');
    const xcodeProj = fs.readdirSync(iosPath).find(f => f.endsWith('.xcodeproj'));
    if (!xcodeProj) return;

    const appName = xcodeProj.replace('.xcodeproj', '');
    const plistPath = path.join(iosPath, appName, `${appName}-Info.plist`);

    if (!fs.existsSync(plistPath)) {
        console.warn('Info.plist not found:', plistPath);
        return;
    }

    let content = fs.readFileSync(plistPath, 'utf8');

    // Regex to remove the NSContactsUsageDescription key and its string value
    const regex = /<key>NSContactsUsageDescription<\/key>\s*<string>[^<]*<\/string>\s*/g;
    const newContent = content.replace(regex, '');

    if (newContent !== content) {
        fs.writeFileSync(plistPath, newContent, 'utf8');
        console.log('Removed NSContactsUsageDescription from Info.plist');
    } else {
        console.log('NSContactsUsageDescription not found in Info.plist');
    }
};

const fs = require('fs');
const path = require('path');
const plist = require('plist');

const rootdir = process.argv[2];

// === Android: Remove specific permissions from AndroidManifest.xml ===
const permissionsToRemove = ["RECORD_AUDIO", "MODIFY_AUDIO_SETTINGS"];
const manifestPath = path.join(rootdir, 'platforms/android/app/src/main/AndroidManifest.xml');

if (fs.existsSync(manifestPath)) {
    fs.readFile(manifestPath, 'utf8', (err, data) => {
        if (err) return console.error('Error reading AndroidManifest.xml:', err);

        let updated = data;
        for (const permission of permissionsToRemove) {
            const regex = new RegExp(`<uses-permission android:name="android.permission.${permission}"\\s*/?>`, 'g');
            updated = updated.replace(regex, '');
        }

        fs.writeFile(manifestPath, updated, 'utf8', (err) => {
            if (err) return console.error('Error writing AndroidManifest.xml:', err);
            console.log('✅ Android permissions removed.');
        });
    });
}

// === iOS: Remove NSContactsUsageDescription from Info.plist ===
const iosProjectName = getIosProjectName(rootdir);
if (iosProjectName) {
    const plistPath = path.join(rootdir, 'platforms/ios', iosProjectName, 'Info.plist');

    if (fs.existsSync(plistPath)) {
        fs.readFile(plistPath, 'utf8', (err, data) => {
            if (err) return console.error('Error reading Info.plist:', err);

            const plistObj = plist.parse(data);
            if (plistObj.NSContactsUsageDescription) {
                delete plistObj.NSContactsUsageDescription;

                const updatedPlist = plist.build(plistObj);
                fs.writeFile(plistPath, updatedPlist, 'utf8', (err) => {
                    if (err) return console.error('Error writing Info.plist:', err);
                    console.log('✅ NSContactsUsageDescription removed from Info.plist.');
                });
            } else {
                console.log('ℹ️ NSContactsUsageDescription not found in Info.plist.');
            }
        });
    }
}

// === Helper: Find iOS project name ===
function getIosProjectName(root) {
    const iosPath = path.join(root, 'platforms/ios');
    if (!fs.existsSync(iosPath)) return null;

    const files = fs.readdirSync(iosPath);
    for (const file of files) {
        if (file.endsWith('.xcodeproj')) {
            return file.replace('.xcodeproj', '');
        }
    }
    return null;
}

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



const iosPath = path.join(context.opts.projectRoot, 'platforms', 'ios');
    const plistFiles = [];

    // Recursively search for Info.plist files
    function findPlistFiles(dir) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                findPlistFiles(fullPath);
            } else if (file === 'Info.plist') {
                plistFiles.push(fullPath);
            }
        }
    }

    findPlistFiles(iosPath);

    if (plistFiles.length === 0) {
        console.warn('No Info.plist files found.');
        return;
    }

    plistFiles.forEach(plistPath => {
        let content = fs.readFileSync(plistPath, 'utf8');
        const regex = /<key>NSContactsUsageDescription<\/key>\s*<string>[^<]*<\/string>\s*/g;
        const newContent = content.replace(regex, '');

        if (newContent !== content) {
            fs.writeFileSync(plistPath, newContent, 'utf8');
            console.log(`Removed NSContactsUsageDescription from ${plistPath}`);
        } else {
            console.log(`NSContactsUsageDescription not found in ${plistPath}`);
        }
    });
};

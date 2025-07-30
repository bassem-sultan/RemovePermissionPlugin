const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const glob = require('glob');

const permissionsToRemove = ["RECORD_AUDIO", "MODIFY_AUDIO_SETTINGS"];

// === Android: Remove permissions from AndroidManifest.xml ===
const manifestFile = "platforms/android/app/src/main/AndroidManifest.xml";

fs.readFile(manifestFile, "utf8", (err, data) => {
    if (err) return console.log("AndroidManifest read error:", err);

    let result = data;
    for (const permission of permissionsToRemove) {
        const regex = new RegExp(`<uses-permission android:name="android.permission.${permission}"\\s*/?>`, 'g');
        result = result.replace(regex, '');
    }

    fs.writeFile(manifestFile, result, "utf8", (err) => {
        if (err) console.log("AndroidManifest write error:", err);
    });
});

// === iOS: Remove NSContactsUsageDescription from Info.plist ===
glob("platforms/ios/*/*-Info.plist", (err, files) => {
    if (err || files.length === 0) return console.log("Info.plist not found:", err);

    const plistPath = files[0];
    fs.readFile(plistPath, "utf8", (err, data) => {
        if (err) return console.log("Info.plist read error:", err);

        xml2js.parseString(data, (err, result) => {
            if (err) return console.log("Plist parse error:", err);

            const dict = result.plist.dict[0];
            const keys = dict.key;
            const values = dict.string;

            const index = keys.indexOf('NSContactsUsageDescription');
            if (index !== -1) {
                keys.splice(index, 1);
                values.splice(index, 1);
            }

            const builder = new xml2js.Builder();
            const xml = builder.buildObject(result);

            fs.writeFile(plistPath, xml, "utf8", (err) => {
                if (err) console.log("Info.plist write error:", err);
            });
        });
    });
});

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

const { execSync } = require('child_process');

try {
    execSync('npm install plist', { stdio: 'inherit' });
    console.log('plist installed');
} catch (err) {
    console.error('Failed to install plist:', err);
}

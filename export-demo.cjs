const fs = require('node:fs');
let html = fs.readFileSync('dist/index.html', 'utf8');
html = html.replace('<link rel="stylesheet" href="styles.css">', () => '<style>' + fs.readFileSync('dist/styles.css', 'utf8') + '</style>');
html = html.replace('<script src="app.js" defer></script>', '');
html = html.replace('</body>', () => '<script>' + fs.readFileSync('dist/app.js', 'utf8') + '</script></body>');
html = html.replace('href="assets/favicon.svg"', () => 'href="data:image/svg+xml;base64,' + fs.readFileSync('dist/assets/favicon.svg').toString('base64') + '"');
fs.writeFileSync('../deliverables/Amara-Estate-Demo.html', html);
console.log('Updated standalone demo.');

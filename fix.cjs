const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/"\.\/context\//g, '"./Context/');
    content = content.replace(/"\.\.\/context\//g, '"../Context/');

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log('Fixed imports in ' + filePath);
    }
}

function traverse(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory() && file !== 'node_modules' && file !== '.git' && file !== 'dist') {
            traverse(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            replaceInFile(fullPath);
        }
    });
}
traverse('./src');

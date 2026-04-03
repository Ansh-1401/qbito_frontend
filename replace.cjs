const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace straight string occurrences
    content = content.replace(/"http:\/\/localhost:8080\/api/g, '`${import.meta.env.VITE_API_URL}');
    content = content.replace(/'http:\/\/localhost:8080\/api/g, '`${import.meta.env.VITE_API_URL}');
    content = content.replace(/`http:\/\/localhost:8080\/api/g, '`${import.meta.env.VITE_API_URL}');
    
    // Close the backticks instead of strings
    // If it was "http://localhost:8080/api/auth/me", it's now `${import.meta.env.VITE_API_URL}/auth/me" -> needs to be `
    content = content.replace(/\$\{import\.meta\.env\.VITE_API_URL\}(.*?)"/g, '${import.meta.env.VITE_API_URL}$1`');
    content = content.replace(/\$\{import\.meta\.env\.VITE_API_URL\}(.*?)'/g, '${import.meta.env.VITE_API_URL}$1`');

    // WebSockets
    content = content.replace(/"http:\/\/localhost:8080\/ws"/g, 'import.meta.env.VITE_WS_URL');

    // Media
    content = content.replace(/"http:\/\/localhost:8080\/media/g, '`${import.meta.env.VITE_MEDIA_URL}');
    content = content.replace(/\$\{import\.meta\.env\.VITE_MEDIA_URL\}(.*?)"/g, '${import.meta.env.VITE_MEDIA_URL}$1`');

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log('Updated ' + filePath);
    }
}

function traverse(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            replaceInFile(fullPath);
        }
    });
}

traverse('./src');

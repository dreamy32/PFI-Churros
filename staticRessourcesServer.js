/////////////////////////////////////////////////////////////////////
// This module define a middleware that serve static ressources
/////////////////////////////////////////////////////////////////////
// Author : Nicolas Chourot
// Lionel-Groulx College
/////////////////////////////////////////////////////////////////////

const path = require('path');
const fs = require('fs');
const mimes = require('./mimes.json');
global.wwwroot = 'wwwroot';
let defaultRessource = 'index.html';

function isDirectory(url) {
    let extension = path.extname(url).replace('.', '');
    return extension == '';
}
function requestedStaticRessource(url) {
    let isDir = isDirectory(url);
    let ressourceName = isDir ? url + defaultRessource : url;
    let ressourcePath = path.join(process.cwd(), wwwroot, ressourceName);
    return ressourcePath;
}
function extToContentType(filePath) {
    let extension = path.extname(filePath).replace('.', '');
    let contentType = mimes[extension];
    if (contentType !== undefined)
        return contentType;
    return 'text/html';
}
exports.sendRequestedRessource = (HttpContext) => {
    return new Promise(async (resolve) => {
        let filePath = requestedStaticRessource(HttpContext.req.url);
        let contentType = extToContentType(filePath);
        try {
            let content = fs.readFileSync(filePath);
            HttpContext.response.content(contentType, content);
            resolve(true);
        } catch (error) {
            if (error.code === 'ENOENT') {
                resolve(false);
            } else {
                HttpContext.response.res.writeHead(500);
                HttpContext.response.end(`Server error: ${error.code}`);
                resolve(true);
            }
        }
    })
}
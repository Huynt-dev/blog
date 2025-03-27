const fs = require('fs');
const JavaScriptObfuscator = require('javascript-obfuscator');

const htmlContent = fs.readFileSync('index.html', 'utf8');

function obfuscateHTML(html) {
    html = html.replace(/\s+/g, ' ').trim();
    
    html = html.replace(/class="([^"]*)"/g, (match, p1) => {
        return `class="${obfuscateString(p1)}"`;
    });
    
    html = html.replace(/id="([^"]*)"/g, (match, p1) => {
        return `id="${obfuscateString(p1)}"`;
    });
    
    html = html.replace(/>([^<]+)</g, (match, p1) => {
        return `>${obfuscateString(p1)}<`;
    });
    
    return html;
}

function obfuscateString(str) {
    return str.split('').map(char => {
        return String.fromCharCode(char.charCodeAt(0) + 1);
    }).join('');
}

const scriptMatch = htmlContent.match(/<script>([\s\S]*?)<\/script>/);
let jsCode = '';
if (scriptMatch) {
    jsCode = scriptMatch[1];
}

const obfuscationResult = JavaScriptObfuscator.obfuscate(jsCode, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    debugProtection: true,
    debugProtectionInterval: 2000,
    disableConsoleOutput: true,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: true,
    renameGlobals: false,
    rotateStringArray: true,
    selfDefending: true,
    shuffleStringArray: true,
    splitStrings: true,
    splitStringsChunkLength: 10,
    stringArray: true,
    stringArrayEncoding: ['base64'],
    stringArrayThreshold: 0.75,
    transformObjectKeys: true,
    unicodeEscapeSequence: false
});

const obfuscatedHTML = obfuscateHTML(htmlContent);

const finalHTML = obfuscatedHTML.replace(
    /<script>[\s\S]*?<\/script>/,
    `<script>${obfuscationResult.getObfuscatedCode()}</script>`
);

fs.writeFileSync('index.min.html', finalHTML);

console.log('Done!');
console.log('New File: index.min.html'); 
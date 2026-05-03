const fs = require('fs');
const path = require('path');

const targetFile = 'c:/Users/张益达/Desktop/kf/xcx_release/utils/data_zhongyao.js';
let content = fs.readFileSync(targetFile, 'utf8');
let lines = content.split('\n');

let newLines = [];
let currentChapter = "";
let currentSection = "";

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let trimmed = line.trim();

    // 匹配章节注释 // --- 一、解表药 ---
    if (trimmed.startsWith('// ---')) {
        let match = trimmed.match(/\/\/\s*---\s*(.+?)\s*---/);
        if (match) {
            currentChapter = match[1].trim();
            currentSection = ""; // Reset section when chapter changes
        }
    }
    // 匹配小节注释 // (一) 发散风寒药 或者 //（一）发散风寒药
    else if (trimmed.startsWith('// (') || trimmed.startsWith('//（') || trimmed.startsWith('//(')) {
        currentSection = trimmed.replace(/^\/\/(?:\s+)?/, '').trim();
    }

    // Replace existing chapter/section if script is run multiple times
    if (trimmed.startsWith('chapter:') || trimmed.startsWith('section:')) {
        continue;
    }

    // Insert chapter and section right before the 'group:' field
    if (trimmed.startsWith('group:')) {
        let indent = line.match(/^\s*/)[0];
        if (currentChapter) {
            newLines.push(`${indent}chapter: "${currentChapter.replace(/"/g, '\\"')}",`);
        }
        if (currentSection) {
            newLines.push(`${indent}section: "${currentSection.replace(/"/g, '\\"')}",`);
        }
    }

    newLines.push(line);
}

fs.writeFileSync(targetFile, newLines.join('\n'), 'utf8');
console.log('Successfully updated data_zhongyao.js with chapter and section fields.');

const fs = require('fs');
const path = require('path');

const FILES = [
    'c:/Users/张益达/Desktop/kf/xcx/pages/study/study.wxss',
    'c:/Users/张益达/Desktop/kf/xcx/pages/profile/profile.wxss',
    'c:/Users/张益达/Desktop/kf/xcx/pages/invite/invite.wxss',
    'c:/Users/张益达/Desktop/kf/xcx/pages/index/index.wxss'
];

FILES.forEach(filePath => {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8').trim();

    // Remove existing patches if any
    const patchMarker = /\/\* === 3-Terminal Adaptation Patches === \*\//;
    if (patchMarker.test(content)) {
        content = content.split(patchMarker)[0].trim();
    }

    // Add clean modern patch
    let newPatch = `\n\n/* === 3-Terminal Adaptation Patches === */\n@media screen and (min-width: 500px) {\n`;

    // 1. 对于 page-container，使用 margin: auto 居中方案
    newPatch += `  page-container {\n`;
    newPatch += `    left: 0 !important; right: 0 !important; margin: auto !important;\n`;
    newPatch += `    width: var(--max-width) !important;\n`;
    newPatch += `    max-width: var(--max-width) !important;\n`;
    newPatch += `    background: transparent !important;\n`;
    newPatch += `  }\n\n`;

    // 2. 核心居中组件
    const centerClasses = [
        '.nav-bar',
        '.settings-modal-mask', '.settings-modal-panel',
        '.login-fullscreen', '.email-login-overlay', '.profile-setup-overlay',
        '.page-bg-global'
    ];

    newPatch += `  ${centerClasses.join(', ')} {\n`;
    newPatch += `    left: 0 !important; right: 0 !important; margin: auto !important;\n`;
    newPatch += `    width: var(--max-width) !important;\n`;
    newPatch += `    max-width: var(--max-width) !important;\n`;
    newPatch += `    transform: none !important;\n`;
    newPatch += `  }\n\n`;

    // 5. 特定页面修正 - 增加 safe-area 适配
    if (filePath.includes('study.wxss') || filePath.includes('shanghan.wxss') || filePath.includes('neijing.wxss') || filePath.includes('fangji.wxss')) {
        newPatch += `  .btn-back-top {\n`;
        newPatch += `    --right-offset: 16px;\n`;
        newPatch += `    right: calc(50% - (var(--max-width) / 2) + var(--right-offset)) !important;\n`;
        newPatch += `    bottom: calc(100px + env(safe-area-inset-bottom)) !important;\n`;
        newPatch += `  }\n`;
    } else if (filePath.includes('index.wxss')) {
        newPatch += `  .fab-settings {\n`;
        newPatch += `    --right-offset: 16px;\n`;
        newPatch += `    right: calc(50% - (var(--max-width) / 2) + var(--right-offset)) !important;\n`;
        newPatch += `    bottom: calc(100px + env(safe-area-inset-bottom)) !important;\n`;
        newPatch += `  }\n`;
    }

    newPatch += `}\n`;

    fs.writeFileSync(filePath, content + newPatch, 'utf8');
    console.log(`Updated patch: ${filePath}`);
});

const fs = require('fs');
const path = require('path');
const hex2rgb = require('hex2rgb')

const ignoreDir = ['node_modules', 'docs', 'dll', '.yarn', '.git', '.idea', '.vscode', '.DS_Store'];
const includeFilesSuffix = ['.vue', '.js', '.less', '.css', '.ts'];
const colorSet = new Set();

function getColor(text) {
    const colors = text.match(/(rgba\(\d{1,3},\s*\d{1,3},\s*\d{1,3},\s*\d*(?:\.\d+)?\))|(#([a-f0-9]{3}|[a-f0-9]{4}(?:[a-f0-9]{2}){0,2})\b)/ig)

    if (!colors) return

    colors.forEach(a => {
        // #ffffffff -> #ffffff
        if (a[0] === '#' && a.length > 7) {
            a = a.slice(0, 7)
        }

        const str = hex2rgb(a, {
            rgbStringDefault: a
        }).rgbString

        colorSet.add(str[3] === 'a' ? str : `${str.slice(0, 3)}a${str.slice(3, -1)}, 1)`)
    })
}

/*
* files
* */
function dg(root) {
    const files = fs.readdirSync(root);

    files.forEach(a => {
        const filePath = path.join(root, a);

        const fileInfo = fs.statSync(filePath);

        if(fileInfo.isDirectory()) {
            if(!ignoreDir.includes(a)) {
                dg(filePath);
            }

            return;
        }

        if(!includeFilesSuffix.some(suffix => a.includes(suffix))) return;

        const file = fs.readFileSync(filePath);

        getColor(file.toString());
    });
}

dg(path.join(__dirname, '../editor'));

fs.writeFileSync('./colors.txt', Array.from(colorSet).join('\n'))

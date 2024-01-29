import { readdir, readFile, writeFile } from 'node:fs/promises';
import { varNames } from './var-config.mjs';

const varLookup = new Set(varNames);
const writeMessage = (message,mode) => {
    switch(mode){
        case 'error': {
            console.log(`\x1B[31m\[byfo-themes\] ERROR\x1B[m: ${message}`);
            break;
        }
        case 'warn': {
            console.log(`\x1B[33m\[byfo-themes\] WARNING\x1B[m: ${message}`);
            break;
        }
        default: {
            console.log(`\x1B[32m\[byfo-themes\]\x1B[m: ${message}`);
        }
    }
}

const themes = {
}

writeMessage('Building theme object','good');
let defaultTheme = ''
try {
    const files = await readdir('./themes/');
    for(const file of files){
        const contents = await readFile(`./themes/${file}`, {encoding:'utf8'});
        const key = file.match(/^(.+)\.css$/)[1];

        const displayName = contents.match(/@display-name: ?"([^"]+)"/)?.[1];
        if(!displayName){
            writeMessage(`Display Name not set for theme ${key}. Using the key instead`,'warn');
        }
        const isDefault = /@default\b/.test(contents)
        if(isDefault){
            if(defaultTheme){
                writeMessage(`Trying to set ${key} as default when ${defaultTheme} is already set. This will cause style conflicts.`,'warn')
            } else {
                defaultTheme = key;
            }
        }
        const themeExtends = contents.match(/@extends: ?"([^"]+)"/)?.[1] || (isDefault ? undefined : 'light');

        let declarations = [...contents.matchAll(/\-\-[a-z\-]+:[^;]+;/g)].map(match => match[0]);
        declarations.forEach(d => {
            const varName = d.match(/^(.+):/)?.[1];
            if(!varLookup.has(varName)){
                writeMessage(`Theme ${key} is using an unknown variable ${varName}`,'warn');
            }
        });
        
        const themeObj = {
            key,
            displayName,
        }
        if(isDefault){
            const inherited = [];
            declarations = declarations.filter(dec => {
                if(/var\(/.test(dec)){
                    inherited.push(dec);
                    return false;
                }
                return true;
            });
            themeObj.css = `:root{${declarations.join('')}} .${key}{${inherited.join('')}}`

        } else {
            //Add body.[class] so that it's one step more specific than the default theme
            themeObj.css = `body.${key}{${declarations.join('')}}`;
        }
        

        
        if(themeExtends){
            themeObj.extends = themeExtends;
        }
        if(isDefault) {
            themeObj.default = true;
        }
        themes[key] = themeObj;
    }

    const writeObj = (obj,depth) => {
        let output = '{\n';
        for(const key in obj){
            let tabs = depth
            while(tabs > 0){
                output += '  ';
                tabs -= 1;
            }
            output += /-/.test(key) ? `"${key}"` : key;
            output += ': ';
            if(typeof obj[key] === 'object'){
                output += writeObj(obj[key],depth+1);
            } else if (typeof obj[key] === 'string') {
                output += `'${obj[key].replaceAll("'","\\'")}'`;
            } else {
                output += obj[key];
            }
            output += ',\n';
        }
        output = output.replace(/,\n$/,'\n');
        let tabs = depth - 1
        while(tabs > 0){
            output += '  ';
            tabs -= 1;
        }
        output += '}'
        return output;
    };

    writeMessage('Generating file contents');
    const output = `// This file is auto generated. Run 'pnpm build' to regenerate based on the themes in the folder
export const themes = ${writeObj(themes,1)}`;

    writeMessage('Writing File');
    writeFile('./src/themes.ts', output, {encoding:'utf8'});
    writeMessage('Succesfully built themes');
} catch (e) {
    writeMessage(e.message,'error');
}
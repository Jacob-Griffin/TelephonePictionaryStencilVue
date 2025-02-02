import { readdirSync, writeFileSync } from 'fs';
import { formatJson } from './script-utils.node.mjs';

const vIdx = process.argv.indexOf('-v')
if(vIdx === -1 || !process.argv[vIdx + 1]){
    console.error('No version specified. Use -v [version]');
    process.exit(1);
}

const newVersion = process.argv[vIdx + 1];

const bumpVersionJson = async (path) => {
    try {
        const module = await import(path, {with: {type: 'json'}});
        const pkg = module.default;
        pkg.version = newVersion;
        const newText = formatJson(pkg) + '\n';
        writeFileSync(path,newText);
    } catch {}
}

const apps = readdirSync('./apps');
for(const app of apps){
    await bumpVersionJson(`./apps/${app}/package.json`);
}

const packages = readdirSync('./packages');
for(const pkg of packages){
    await bumpVersionJson(`./packages/${pkg}/package.json`);
}

await bumpVersionJson('./package.json');
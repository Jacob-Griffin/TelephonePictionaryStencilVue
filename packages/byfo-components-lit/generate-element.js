import {execSync} from 'child_process';

const [_1,_2,cname,...args] = process.argv;
if(cname === undefined){
  console.error('Args Error: No component name is given');
  process.exit(1);
}
const componentName = {};
componentName.normalized = cname.replace(/^byfo-?/,'').replaceAll(/[A-Z]/g,match => `-${match.toLowerCase()}`);
componentName.class = 'Byfo'+componentName.normalized.replaceAll(/(?:^|-)([a-z])/g,(_,letter)=>letter.toUpperCase());
componentName.tagname = 'byfo-'+componentName.normalized;
componentName.file = `./src/${componentName.tagname}.ts`

const extendsIdx = args.indexOf('-e');
if(extendsIdx > -1 && extendsIdx + 1 < args.length){
  const pnormal = args[extendsIdx + 1].replace(/^byfo-?/,'').replace(/[A-Z]/,match => `-${match.toLowerCase()}`);
  componentName.parent = 'Byfo'+pnormal.replace(/(?:^|-)([a-z])/,(_,letter)=>letter.toUpperCase());
  componentName.parentFile = `./${'byfo-'+pnormal}`;
}

try {
  //Weird backwards try. If the file successfully reads, then we have a problem because the component already exists
  execSync(`cat ${componentName.file} 2>/dev/null`);
  console.error(`Error: ${componentName.tagname} already exists`);
  process.exit(1);
} catch (e) {
  //Success! There wasn't a file to read.
  //If the error was *not* file not found, then that'll show itself later
}

//Step 1: create the boilerplate string
const fileContents = `import { ${componentName.parent ? '' : 'LitElement, '}css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
${componentName.parent ? `import { ${componentName.parent} } from '${componentName.parentFile}'
` : ''}
/**
 * Description of your element here. Use @ property doc tags to describe props
 */
@customElement('${componentName.tagname}')
export class ${componentName.class} extends ${componentName.parent ?? 'LitElement'} {
  render() {
    return html\\\`\\\`;
  }
  static styles = css\\\`
    :host {
      display: block;
    }
  \\\`;
}

declare global {
  interface HTMLElementTagNameMap {
    '${componentName.tagname}': ${componentName.class};
  }
}`;

//Step 2: Write the file contents
execSync(`cat > ${componentName.file} <<< "${fileContents}"`);

if(args.indexOf('-i') > -1){
  //"Internal" flag, don't export
  process.exit(0);
}

//Step 3: Modify the package.json
const contents = execSync('cat ./package.json');
if(typeof contents.toString?.() !== 'string'){
  console.error('File error: cannot read package.json');
  process.exit(1);
}

let packageJson = JSON.parse(contents.toString());
packageJson.exports[`./${componentName.normalized}`] = componentName.file;

const formatJson = (json,depth = 1) => {
  let output = `{\n`;
  Object.keys(json).forEach(key => {
    output += '  '.repeat(depth);
    output += `\\"${key}\\": `;
    switch(typeof json[key]){
      case 'string':
        output += `\\"${json[key]}\\"`;
        break;
      case 'number':
        output += `${json[key]}`;
        break;
      case 'boolean':
        output += json[key] ? 'true' : 'false';
        break;
      case 'object':
        output += formatJson(json[key],depth+1);
        break;
    }
    output += ',\n';
  });
  if(depth > 1){
    output += '  '.repeat(depth - 1);
  }
  output += '}';
  output = output.replaceAll(/,(?=\s+})/g,'');
  return output;
}

const newContents = formatJson(packageJson);

//Step 4: Write the modified package json to file
execSync(`cat > ./package.json <<< "${newContents}"`)

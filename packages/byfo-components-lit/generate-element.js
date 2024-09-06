import { execSync } from 'child_process';

const [_1,_2,cname,...args] = process.argv;
if(cname === undefined){
  console.error('Args Error: No component name is given');
  process.exit(1);
}
const componentName = {};
componentName.normalized = cname.replace(/^byfo-?/,'').replaceAll(/[A-Z]/g,match => `-${match.toLowerCase()}`);
componentName.class = 'Byfo'+componentName.normalized.replaceAll(/(?:^|-)([a-z])/g,(_,letter)=>letter.toUpperCase());
componentName.tagname = 'byfo-'+componentName.normalized;
componentName.file = `./src/components/${componentName.tagname}.ts`

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
const fileContents = `import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
${componentName.parent ? `import { ${componentName.parent} } from '${componentName.parentFile}'
` : "import { LitElement } from 'lit'"}
/**
 * Description of your element here. Use @ property doc tags to describe props
 */
@customElement('${componentName.tagname}')
export class ${componentName.class} extends ${componentName.parent ?? 'LitElement'} {
  render() {
    return html\\\`\\\`;
  }
  static styles = css\\\`
    ${componentName.parent ? `\\\${${componentName.parent}.styles}` : `:host {
      display: block;
    }`}
  \\\`;
}

declare global {
  interface HTMLElementTagNameMap {
    '${componentName.tagname}': ${componentName.class};
  }
}`;

//Step 2: Write the file contents
execSync(`cat > ${componentName.file} <<< "${fileContents}"`);

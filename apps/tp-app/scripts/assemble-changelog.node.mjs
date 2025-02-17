import { execSync } from 'child_process';

const changesDir = '../../changes';

const changeItems = execSync(`ls ${changesDir}`).toString().split('\n');
let changeContents = '';
changeItems.forEach(filename => {
  if (filename.startsWith('[') || filename === 'example.md') {
    return;
  }
  if (!filename.endsWith('.md')) {
    return;
  }
  const contents = execSync(`cat ${changesDir}/${filename}`).toString();
  changeContents += `${contents}\n`;
});

execSync('touch ./public/changelog.md');
execSync(`echo "${changeContents}" > ./public/changelog.md`);

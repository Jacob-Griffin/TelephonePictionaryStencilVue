export function processArgs(argv, unaryArgs, binaryArgs) {
  const args = argv.splice(2);
  const argMap = new Map();
  for (let i = 0; i < args.length; i++) {
    const rawName = args[i].replace(/^-/, '');
    if (unaryArgs.includes(rawName)) {
      argMap.set(rawName, true);
    } else if (binaryArgs.includes(rawName)) {
      if (!args[i + 1] || args[i + 1].startsWith('-')) {
        throw new Error(`Args mismatch: Missing value for argument ${args[i]}`);
      } else {
        argMap.set(rawName, args[i + 1]);
        i += 1;
      }
    } else {
      throw new Error(`Args error: Invalid argument ${args[i]}`);
    }
  }
  return argMap;
}

export function formatJson(json, depth = 1) {
  const isArray = Array.isArray(json);
  let output = isArray ? '[\n' : '{\n';
  for (const key in json) {
    output += '  '.repeat(depth);
    if (!isArray) {
      output += `"${key}": `;
    }
    switch (typeof json[key]) {
      case 'string':
        output += `"${json[key].replaceAll('"', '\\"')}"`;
        break;
      case 'number':
        output += `${json[key]}`;
        break;
      case 'boolean':
        output += json[key] ? 'true' : 'false';
        break;
      case 'object':
        output += formatJson(json[key], depth + 1);
        break;
    }
    output += ',\n';
  }
  if (depth > 1) {
    output += '  '.repeat(depth - 1);
  }
  output += isArray ? ']' : '}';
  output = output.replaceAll(/,(?=\s+(}|]))/g, '');
  return output;
}

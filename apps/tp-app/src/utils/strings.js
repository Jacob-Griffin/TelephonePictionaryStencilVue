export function sortNames(names, key) {
  if (!key) {
    return names.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
  }
  return names.sort((a, b) => a[key] && b[key] && a[key].localeCompare(b[key], 'en', { sensitivity: 'base' }));
}

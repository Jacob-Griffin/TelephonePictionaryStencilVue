export function sortNames(names, key) {
  if (!key) {
    return names.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
  }
  return names.sort((a, b) => a[key] && b[key] && a[key].localeCompare(b[key], 'en', { sensitivity: 'base' }));
}

export function calculatePlayerNameWidth(players) {
  let max = 0;
  players.forEach(player => {
    if (player.name?.length > max) {
      max = player.name?.length;
    }
  });
  const value = 50 + (40 * max) / 32;
  return `${value}%`;
}

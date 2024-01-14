export default {
  maxPlayers: 20,
  maxRoundLength: 20, //Value in minutes
  textboxMaxCharacters: 280,
  usernameMaxCharacters: 32,
  addTimeIncrement: 30, //Value in seconds
};

export const themes: { [name: string]: { key: string; displayName: string; extends?: string; default?: boolean } } = {
  light: {
    key: 'light',
    displayName: 'Light',
    default: true,
  },
  dark: {
    key: 'dark',
    displayName: 'Dark',
  },
  classic: {
    key: 'classic',
    displayName: 'Classic',
    extends: 'light',
  },
  candy: {
    key: 'candy',
    displayName: 'Candy Vomit',
    extends: 'light',
  },
};

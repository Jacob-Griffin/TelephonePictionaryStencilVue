export default class TPStore {
  changeEvent = (setting, value) => new CustomEvent('tp-settings-changed', { detail: { setting, value } });

  //#region theme
  themes = [
    {
      name: 'light',
      icon: '🔆',
    },
    {
      name: 'dark',
      icon: '🌙',
    },
    {
      name: 'classic',
      icon: '🕒',
    },
    {
      name: 'candy',
      icon: '🍬',
    },
  ];
  themeExtends = {
    candy: 'light',
    classic: 'light',
  };

  theme = localStorage.getItem('theme') ?? 'classic';
  setTheme(v) {
    this.useTheme(v);
    localStorage.setItem('theme', v);
    this.theme = v;
  }

  useTheme = (theme = this.theme) => {
    document.body.setAttribute('class', '');
    document.body.classList.add(theme);
    if (this.themeExtends[theme]) {
      document.body.classList.add(this.themeExtends[theme]);
    }
  };
  //#endregion theme

  //#region alwaysShowAll
  alwaysShowAll = !!localStorage.getItem('alwaysShowAll');
  setShowAll(v) {
    localStorage.setItem('alwaysShowAll', !v ? '' : 'true');
    this.alwaysShowAll = !!v;
    const e = this.changeEvent('alwaysShowAll', !!v);
    document.dispatchEvent(e);
  }
  //#endregion
}

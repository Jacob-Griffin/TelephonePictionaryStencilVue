import { themes } from 'byfo-themes';
export class TPStore {
  changeEvent = (setting: string, value: string) => new CustomEvent('tp-settings-changed', { detail: { setting, value } });

  theme: string = localStorage.getItem('theme') ?? 'classic';
  setTheme = (v: string) => {
    this.useTheme(v);
    localStorage.setItem('theme', v);
    this.theme = v;
  };

  useTheme = (theme: string = this.theme) => {
    document.body.setAttribute('class', '');
    const visitedThemes = new Set();
    let currentTheme = theme;
    while (currentTheme && !visitedThemes.has(currentTheme)) {
      visitedThemes.add(currentTheme);
      document.body.classList.add(currentTheme);
      currentTheme = themes[currentTheme].extends;
    }
  };
  //#endregion theme

  alwaysShowAll = !!localStorage.getItem('alwaysShowAll');
  setShowAll = (v: boolean) => {
    localStorage.setItem('alwaysShowAll', !v ? '' : 'true');
    this.alwaysShowAll = !!v;
    const e = this.changeEvent('alwaysShowAll', `${!!v}`);
    document.dispatchEvent(e);
  };

  //#region gamedata
  username = localStorage.getItem('username');
  setUsername = (v: string) => {
    if (!v) {
      localStorage.removeItem('username');
      this.username = undefined;
      return;
    }
    localStorage.setItem('username', v);
    this.username = v;
  };

  gameid = localStorage.getItem('game-playing');
  setGameid = (v: string) => {
    if (!v) {
      localStorage.removeItem('game-playing');
      this.gameid = undefined;
      return;
    }
    localStorage.setItem('game-playing', v);
    this.gameid = v;
  };

  hosting = localStorage.getItem('hosting');
  setHosting = (v: string) => {
    if (!v) {
      localStorage.removeItem('hosting');
      this.hosting = undefined;
      return;
    }
    localStorage.setItem('hosting', v);
    this.hosting = v;
  };

  rejoinNumber = localStorage.getItem('rejoinNumber');
  setRejoinNumber = (v: string) => {
    if (!v) {
      localStorage.removeItem('rejoinNumber');
      this.rejoinNumber = undefined;
      return;
    }
    localStorage.setItem('rejoinNumber', v);
    this.rejoinNumber = v;
  };

  getRejoinData() {
    if (!this.gameid || !this.username) return null;
    return {
      gameid: this.gameid,
      name: this.username,
    };
  }

  clearGameData() {
    this.setUsername(undefined);
    this.setGameid(undefined);
    this.setHosting(undefined);
    this.setRejoinNumber(undefined);
  }
  //#endregion gamedata
}

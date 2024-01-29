"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TPStore = void 0;
const byfo_themes_1 = require("byfo-themes");
class TPStore {
    changeEvent = (setting, value) => new CustomEvent('tp-settings-changed', { detail: { setting, value } });
    theme = localStorage.getItem('theme') ?? 'classic';
    setTheme = (v) => {
        this.useTheme(v);
        localStorage.setItem('theme', v);
        this.theme = v;
    };
    useTheme = (theme = this.theme) => {
        document.body.setAttribute('class', '');
        const visitedThemes = new Set();
        let currentTheme = theme;
        while (currentTheme && !visitedThemes.has(currentTheme)) {
            visitedThemes.add(currentTheme);
            document.body.classList.add(currentTheme);
            currentTheme = byfo_themes_1.themes[currentTheme].extends;
        }
    };
    alwaysShowAll = !!localStorage.getItem('alwaysShowAll');
    setShowAll = (v) => {
        localStorage.setItem('alwaysShowAll', !v ? '' : 'true');
        this.alwaysShowAll = !!v;
        const e = this.changeEvent('alwaysShowAll', `${!!v}`);
        document.dispatchEvent(e);
    };
    username = localStorage.getItem('username');
    setUsername = (v) => {
        if (!v) {
            localStorage.removeItem('username');
            this.username = undefined;
            return;
        }
        localStorage.setItem('username', v);
        this.username = v;
    };
    gameid = localStorage.getItem('game-playing');
    setGameid = (v) => {
        if (!v) {
            localStorage.removeItem('game-playing');
            this.gameid = undefined;
            return;
        }
        localStorage.setItem('game-playing', v);
        this.gameid = v;
    };
    hosting = localStorage.getItem('hosting');
    setHosting = (v) => {
        if (!v) {
            localStorage.removeItem('hosting');
            this.hosting = undefined;
            return;
        }
        localStorage.setItem('hosting', v);
        this.hosting = v;
    };
    rejoinNumber = localStorage.getItem('rejoinNumber');
    setRejoinNumber = (v) => {
        if (!v) {
            localStorage.removeItem('rejoinNumber');
            this.rejoinNumber = undefined;
            return;
        }
        localStorage.setItem('rejoinNumber', v);
        this.rejoinNumber = v;
    };
    getRejoinData() {
        if (!this.rejoinNumber)
            return null;
        return {
            gameid: this.rejoinNumber,
            name: this.username,
        };
    }
    clearGameData() {
        this.setUsername(undefined);
        this.setGameid(undefined);
        this.setHosting(undefined);
        this.setRejoinNumber(undefined);
    }
}
exports.TPStore = TPStore;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RvcmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvU3RvcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkNBQXFDO0FBQ3JDLE1BQWEsT0FBTztJQUNsQixXQUFXLEdBQUcsQ0FBQyxPQUFlLEVBQUUsS0FBYSxFQUFFLEVBQUUsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxxQkFBcUIsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFekgsS0FBSyxHQUFXLFlBQVksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksU0FBUyxDQUFDO0lBQzNELFFBQVEsR0FBRyxDQUFDLENBQVMsRUFBRSxFQUFFO1FBQ3ZCLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakIsWUFBWSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7SUFDakIsQ0FBQyxDQUFDO0lBRUYsUUFBUSxHQUFHLENBQUMsUUFBZ0IsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFFO1FBQ3hDLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN4QyxNQUFNLGFBQWEsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2hDLElBQUksWUFBWSxHQUFHLEtBQUssQ0FBQztRQUN6QixPQUFPLFlBQVksSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQztZQUN4RCxhQUFhLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ2hDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUMxQyxZQUFZLEdBQUcsb0JBQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxP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
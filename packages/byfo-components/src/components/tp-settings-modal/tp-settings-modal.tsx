import { Component, Host, Prop, Element, h } from '@stencil/core';
import { themes } from 'byfo-themes';

@Component({
  tag: 'tp-settings-modal',
  styleUrl: 'tp-settings-modal.css',
  shadow: true,
})
export class TpSettingsModal {
  @Prop({ reflect: true, attribute: 'modal-enabled' }) enabled: boolean;
  @Prop() store;

  @Element() el;

  get root() {
    return this.el.shadowRoot;
  }

  changeTheme = e => {
    const name = e.target.value;
    this.store?.setTheme(name);
  };
  passClick = e => {
    const target = e.target?.id?.match(/^(.+)-toggle$/)?.[1];
    if (target) {
      this.root.getElementById(`${target}Input`).click();
    }
  };
  handleToggle = (prop, setter, e) => {
    const enabled = e.target.checked;
    setter(enabled);
    const div = this.root.getElementById(`${prop}-toggle`);
    if (enabled && !div.classList.contains('checked')) {
      div.classList.add('checked');
      return;
    }
    if (!enabled) {
      div.classList.remove('checked');
    }
  };
  renderSettings(): Element[] {
    const header = <h1>Settings</h1>;
    const body = (
      <section class="settings">
        <div>
          <h2 class="label">Theme</h2>
          <select onInput={this.changeTheme}>
            {Object.values(themes).map(theme => {
              return theme.key === this.store.theme ? (
                <option value={theme.key} selected>
                  {theme.displayName}
                </option>
              ) : (
                <option value={theme.key}>{theme.displayName}</option>
              );
            })}
          </select>
        </div>
        <div>
          <h2 class="label">
            Always "Show all" <tp-icon title="Applies to review page" icon="info"></tp-icon>
          </h2>
          <div id="showAll-toggle" class={`toggle-wrapper${this.store.alwaysShowAll ? ' checked' : ''}`} onClick={this.passClick}>
            <input type="checkbox" id="showAllInput" onInput={e => this.handleToggle('showAll', this.store.setShowAll, e)} checked={this.store.alwaysShowAll ? true : null} />
            <label htmlFor="showAllInput"></label>
          </div>
        </div>
      </section>
    );
    const info = (
      <h4>
        Looking for help? Check our <a href="https://github.com/Jacob-Griffin/TelephonePictionary2.0/wiki/Knowlege-Base">knowlege base</a>
      </h4>
    );
    return [header, body, info];
  }

  checkClose = (e: Event) => {
    const clicked = e.target as HTMLElement;
    if (clicked.classList.contains('background') || clicked.closest('.close')) {
      this.enabled = false;
    }
  };
  render() {
    if (!this.enabled) {
      return <Host></Host>;
    }
    return (
      <Host>
        <section class="background" onClick={this.checkClose}>
          <article>
            <button class="close" onClick={this.checkClose}>
              <tp-icon icon="x"></tp-icon>
            </button>
            {...this.renderSettings()}
          </article>
        </section>
      </Host>
    );
  }
}

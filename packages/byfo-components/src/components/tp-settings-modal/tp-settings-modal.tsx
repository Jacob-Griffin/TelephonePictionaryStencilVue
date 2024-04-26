import { Component, Prop, Element, h } from '@stencil/core';
import { themes } from 'byfo-themes';
import { renderModal } from '../../globals/modal';
import type { TPStore } from 'byfo-utils';

@Component({
  tag: 'tp-settings-modal',
  styleUrl: 'tp-settings-modal.css',
  shadow: true,
})
export class TpSettingsModal {
  @Prop({ reflect: true, attribute: 'modal-enabled' }) enabled: boolean;
  @Prop() store: TPStore;
  @Prop() buildDate: { year: string; full?: string; date?: Date };

  @Element() el;

  get root() {
    return this.el.shadowRoot;
  }

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

  resetBackground = () => {
    this.store.resetCustomStyles();
    Object.entries(this.store.customStyle).forEach(([prop,value])=>{
      const dashProp = prop.replace(/[A-Z]/,c=>`-${c.toLowerCase()}`);
      const input = this.root.getElementById(dashProp) as HTMLInputElement;
      if(!input) return;
      input.value = /px$/.test(value) ? `${parseInt(value)}` : value;
    })
  }

  renderBody(): Element[] {
    const header = <h2>Settings</h2>;
    const body = (
      <section class="settings">
        <div>
          <h2 class="label">Theme</h2>
          <select onInput={e => this.store.setTheme((e.target as HTMLSelectElement).value)}>
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
          <h2 class="label">Search As <tp-icon title='Required for search. Filters results to include games with this username' icon='info'></tp-icon></h2>
          <input type='text' value={this.store.searchAs} onInput={e => this.store.setSearchAs((e.target as HTMLInputElement).value)}/>
        </div>
        <div>
          <h2 class='label'>Background Customization:</h2>
          <button class='small' onClick={this.resetBackground}>Reset Background</button>
        </div>
        <div  class='indent-1'>
          <h2 class='label'>Background Brightness:</h2>
          <input type='range' min='0.4' max='1.3' step='0.05' id='background-brightness' value={this.store.customStyle.backgroundBrightness} onInput={e => this.store.setCustomStyle('backgroundBrightness',`${(e.target as HTMLInputElement).value}`)}/>
        </div>
        <div class='indent-1'>
          <h2 class='label'>Background Saturation:</h2>
          <input type='range' min='0.7' max='1.4' step='0.05' id='background-saturation' value={this.store.customStyle.backgroundSaturation} onInput={e => this.store.setCustomStyle('backgroundSaturation',`${(e.target as HTMLInputElement).value}`)}/>
        </div>
        <div class='indent-1'>
          <h2 class='label'>Background Blur:</h2>
          <input type='range' min='0' max='10' id='background-blur' value={this.store.customStyle.backgroundBlur.replace('px','')} onInput={e => this.store.setCustomStyle('backgroundBlur',`${(e.target as HTMLInputElement).value}px`)}/>
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
    const build = !!this.buildDate.full ? (
      <p>
        Built on {this.buildDate.full}
        <br>{this.buildDate.date.toString()}</br>
      </p>
    ) : null;
    return [header, body, info, build];
  }

  render() {
    return renderModal(this);
  }
}

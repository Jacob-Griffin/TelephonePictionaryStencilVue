import { Component, Prop, Element, h } from '@stencil/core';
import { themes } from 'byfo-themes';
import { renderModal } from '../../globals/modal';

@Component({
  tag: 'tp-settings-modal',
  styleUrl: 'tp-settings-modal.css',
  shadow: true,
})
export class TpSettingsModal {
  @Prop({ reflect: true, attribute: 'modal-enabled' }) enabled: boolean;
  @Prop() store;
  @Prop() buildDate: { year: string; full?: string; date?: Date };

  @Element() el;

  get root() {
    return this.el.shadowRoot;
  }

  changeTheme = e => {
    const name = e.target.value;
    this.store?.setTheme(name);
  };
  changeSearchAs = e => {
    const name = e.target.value;
    this.store?.setSearchAs(name);
    const event = new CustomEvent<string>('tp-setting-changed-searchAs',{detail:name});
    document.dispatchEvent(event);
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
  renderBody(): Element[] {
    const header = <h2>Settings</h2>;
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
          <h2 class="label">Search As <tp-icon title='Required for search. Filters results to include games with this username' icon='info'></tp-icon></h2>
          <input type='text' value={this.store.searchAs} onInput={this.changeSearchAs}/>
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

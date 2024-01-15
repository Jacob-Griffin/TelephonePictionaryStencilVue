import { Component, Host, Prop, h } from '@stencil/core';
import { themes } from 'byfo-themes';

@Component({
  tag: 'tp-modal',
  styleUrl: 'tp-modal.css',
  shadow: true,
})
export class TpModal {
  @Prop({reflect:true, attribute:'type'}) contentType:string;
  @Prop({reflect:true, attribute:'modal-enabled'}) enabled:boolean;
  @Prop() store;

  //# region Settings
  changeTheme = e => {
    const name = e.target.value;
    this.store?.setTheme(name);
  };
  passClick = e => {
    const target = e.target?.id?.match(/^(.+)-toggle$/)?.[1];
    if (target) {
      document.getElementById(`${target}Input`).click();
    }
  }
  handleToggle = (prop,setter,e) => {
    const enabled = e.target.checked;
    setter(enabled);
    const div = document.getElementById(`${prop}-toggle`);
    if (enabled && !div.classList.contains('checked')) {
      div.classList.add('checked');
      return;
    }
    if (!enabled) {
      div.classList.remove('checked');
    }
  }
  renderSettings():Element[]{
    const header = <h1>Settings</h1>;
    const body = <section class='settings'>
      <div>
        <h2 class='label'>Theme</h2>
        <select onInput={this.changeTheme}>
          {Object.values(themes).map(theme => { return theme.key === this.store.theme ?
            <option value={theme.key} selected>{theme.displayName}</option> :
            <option value={theme.key}>{theme.displayName}</option>})}
        </select>
      </div>
      <div>
          <h2 class="label">Always "Show all" <tp-icon title="Applies to review page" icon="info"></tp-icon></h2>
          <div id="showAll-toggle" class={`toggle-wrapper${this.store.alwaysShowAll ? ' checked' : ''}`} onClick={this.passClick} >
            <input type="checkbox" id="showAllInput" onInput={e => this.handleToggle('showAll', this.store.setShowAll, e)} checked={this.store.alwaysShowAll ? true : null}/>
            <label htmlFor="showAllInput"></label>
          </div>
        </div>
    </section>
    const info = <h4>Looking for help? Check our <a href="https://github.com/Jacob-Griffin/TelephonePictionary2.0/wiki/Knowlege-Base">knowlege base</a></h4>
    return [header,body,info];
  }
  //#endregion Settings

  //#region Join
  renderJoin():Element[]{
    return [];
  }
  //#endregion Join

  //#region Join
  renderHost():Element[]{
    return [];
  }
  //#endregion Join

  //#region Join
  renderResults():Element[]{
    return [];
  }
  //#endregion Join
  renderSection():Element[]{
    switch(this.contentType){
      case 'settings': {
        return this.renderSettings();
      }
      case 'join': {
        return this.renderJoin();
      }
      case 'host': {
        return this.renderHost();
      }
      case 'result': {
        return this.renderResults();
      }
    }
  }

  checkClose = (e:Event) => {
    const clicked = e.target as HTMLElement;
    if(clicked.classList.contains('background') || clicked.closest('.close')){
      this.enabled = false;
    }
  }
  render() {
    if(!this.enabled){
      return <Host></Host>
    }
    return (
      <Host>
        <section class='background' onClick={this.checkClose}>
          <article>
            <button class='close' onClick={this.checkClose}><tp-icon icon='x'></tp-icon></button>
            {...this.renderSection()}
          </article>
        </section>
      </Host>
    );
  }

}

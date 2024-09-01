import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { getChildById } from '../common';
import { inject } from '../dependencies';
import { ByfoModal } from './byfo-modal';
import { themes } from 'byfo-themes';
import { TPStore } from 'byfo-utils';
import { loadChildElements } from '../loader';

loadChildElements(['byfo-info-bubble', 'byfo-toggle']);

/**
 * A modal that contains various client-side settings
 */
@customElement('byfo-settings-modal')
export class ByfoSettingsModal extends ByfoModal {
  @inject store?: TPStore;

  /**
   * Used in beta builds to display the full date of the most recent build
   */
  @property() buildDate?: { year: string; full?: string; date?: Date };

  resetBackground() {
    this.store?.resetCustomStyles();
    Object.entries(this.store!.customStyle ?? {}).forEach(([prop, value]) => {
      const dashProp = prop.replace(/[A-Z]/, c => `-${c.toLowerCase()}`);
      const input = getChildById(dashProp, this) as HTMLInputElement;
      if (!input) return;
      input.value = /px$/.test(value) ? `${parseInt(value)}` : value;
    });
  }

  styleInput(prop: string, unit?: string) {
    return (e: TargetedInputEvent) => this.store!.setCustomStyle(prop, `${e.target.value}${unit ?? ''}`);
  }

  override renderBody() {
    return html`
      <h2>Settings</h2>
      <section class="settings">
        <div>
          <h2 class="label">Theme</h2>
          <select @input=${(e: InputEvent) => this.store!.setTheme((e.target as HTMLSelectElement).value)}>
            ${Object.values(themes).map(theme => {
              return theme.key === this.store?.theme
                ? html` <option value=${theme.key} selected>${theme.displayName}</option> `
                : html` <option value=${theme.key}>${theme.displayName}</option> `;
            })}
          </select>
        </div>
        <div>
          <h2 class="label">Search As <byfo-info-bubble content="Required for search. Filters results to include games with this username"></byfo-info-bubble></h2>
          <input type="text" value=${this.store!.searchAs} @input=${(e: TargetedInputEvent) => this.store!.setSearchAs(e.target.value)} />
        </div>
        <div>
          <h2 class="label">Background Customization:</h2>
          <button class="small" @click=${this.resetBackground}>Reset Background</button>
        </div>
        <div class="indent-1">
          <h2 class="label">Background Brightness:</h2>
          <input
            type="range"
            min="0.4"
            max="1.3"
            step="0.05"
            id="background-brightness"
            value=${this.store!.customStyle.backgroundBrightness}
            @input=${this.styleInput('backgroundBrightness')}
          />
        </div>
        <div class="indent-1">
          <h2 class="label">Background Saturation:</h2>
          <input
            type="range"
            min="0.7"
            max="1.4"
            step="0.05"
            id="background-saturation"
            value=${this.store!.customStyle.backgroundSaturation}
            @input=${this.styleInput('backgroundSaturation')}
          />
        </div>
        <div class="indent-1">
          <h2 class="label">Background Blur:</h2>
          <input
            type="range"
            min="0"
            max="10"
            id="background-blur"
            value=${this.store!.customStyle.backgroundBlur.replace('px', '')}
            @input=${this.styleInput('backgroundBlur', 'px')}
          />
        </div>
        <div>
          <h2 class="label">Always "Show all" <byfo-info-bubble content="Applies to review page"></byfo-info-bubble></h2>
          <byfo-toggle name="showAll" checked=${this.store!.alwaysShowAll || null} @byfo-toggled=${({ detail }: CustomEvent<boolean>) => this.store!.setShowAll?.(detail)} />
        </div>
      </section>
      <h4>Looking for help? Check our <a href="https://github.com/Jacob-Griffin/TelephonePictionary2.0/wiki/Knowlege-Base">knowlege base</a></h4>
      ${!!this.buildDate?.full
        ? html`
            <p>
              Built on ${this.buildDate.full}
              <br />${this.buildDate.date!.toString()}
            </p>
          `
        : null}
    `;
  }

  static styles = css`
    ${ByfoModal.styles}
    [icon='info'] {
      display: inline-block;
      position: relative;
      cursor: pointer;
      top: 0.15em;
      height: 1em;
      width: 1em;
    }

    .settings {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .settings > div {
      display: flex;
      justify-content: space-between;
      width: 100%;
      max-width: 500px;
      padding-block: 0.75rem;
      align-items: center;

      &.indent-1 {
        width: 95%;
        max-width: 475px;
        margin-inline-start: max(2.5%, 25px);
        font-size: 0.9em;
        padding-block: 0.4rem;
      }
    }

    .settings select {
      width: 20ch;
      height: 2rem;
      border-radius: 0.5rem;
      font-size: medium;
    }
  `;
  connectedCallback(): void {
    super.connectedCallback();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'byfo-settings-modal': ByfoSettingsModal;
  }
}

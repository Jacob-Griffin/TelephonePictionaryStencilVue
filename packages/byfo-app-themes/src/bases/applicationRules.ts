// css template tag is just to access syntax highlighting from the lit plugin.
// The functionality is the "Identity" function for tagged template literals, and we export a plain string
// See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#raw_strings
const css = (strings: TemplateStringsArray, ...values: unknown[]) => String.raw({ raw: strings }, ...values).trim();

const sheetText = css`
  :root {
    background-color: var(--byfo-color-background);
    background-image: var(--byfo-image-background);
    font-family:
      Inter,
      -apple-system,
      BlinkMacSystemFont,
      Segoe UI,
      Roboto,
      Oxygen,
      Ubuntu,
      Cantarell,
      Fira Sans,
      Droid Sans,
      Helvetica Neue,
      sans-serif;
    transition:
      color 0.5s,
      background-color 0.5s;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: var(--byfo-text-heading);
  }

  p {
    color: var(--byfo-text-main);
  }

  a {
    color: var(--byfo-text-link);
    &:hover {
      color: var(--byfo-hover-link);
    }
  }

  button {
    color: var(--byfo-text-button);
    background-color: var(--byfo-color-button);
    &:hover {
      background-color: var(--byfo-hover-button);
    }
  }

  button[active] {
    color: var(--byfo-text-active);
    background-color: var(--byfo-color-active);
    &:hover {
      background-color: var(--byfo-hover-active);
    }
  }

  button.important {
    color: var(--byfo-text-important);
    background-color: var(--byfo-color-important);
    &:hover {
      background-color: var(--byfo-hover-important);
    }
  }

  button[disabled] {
    background-color: var(--byfo-color-disabled);
  }

  header,
  footer {
    background-color: var(--byfo-color-brand);
    color: var(--byfo-text-brand);
  }

  ::-webkit-scrollbar {
    background: none;
  }

  ::-webkit-scrollbar-track {
    background: none;
  }

  ::-webkit-scrollbar-button {
    display: none;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 0.5rem;
    background-color: var(--scroll-color);
  }
`;

const sheet = new CSSStyleSheet();
sheet.replaceSync(sheetText);
export default sheet;

class BYFOContent extends HTMLElement {
  constructor() {
    super();
    this.#imgElement = document.createElement("img");
    this.#pElement = document.createElement("p");
    if (this.content) {
      this.#imgElement.src = this.content;
      this.#pElement.textContent = this.content;
    }
  }

  #imgElement;
  #pElement;

  get type() {
    return this.getAttribute("type");
  }
  set type(v) {
    this.setAttribute("type", v);
    if (v === "image") {
      this.#imgElement.src = this.content;
      this.replaceChildren(this.#imgElement);
    } else if (v === "text") {
      this.#pElement.textContent = this.content;
      this.replaceChildren(this.#pElement);
    } else {
      this.replaceChildren();
    }
  }

  get content() {
    return this.getAttribute("content");
  }
  set content(v) {
    this.setAttribute("content", v);
    if (this.type === "image") {
      this.#imgElement.src = v;
    } else if (this.type === "text") {
      this.#pElement.textContent = v;
    }
  }

  /*static get observedAttributes() {
    return ["content", "type"];
  }
  attributeChangedCallback(name, oldV, newV) {
    console.log(name, newV);
    if (oldV === newV) {
      return;
    }
    if (name === "content") {
      this.setContent(newV);
    } else if (name === "type") {
      this.setType(newV);
    }
  }*/
}

customElements.define("byfo-content", BYFOContent);

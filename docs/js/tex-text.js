// <tex-text text="Plain words and $math$ together"></tex-text>
// Renders the $...$ parts with KaTeX and leaves the rest as text.
if (!customElements.get('tex-text')) {
  customElements.define('tex-text', class extends HTMLElement {
    static get observedAttributes() { return ['text']; }
    connectedCallback() { this.r(); }
    attributeChangedCallback() { this.r(); }
    r() {
      const t = this.getAttribute('text') || '';
      if (!window.katex) {
        this.textContent = t;
        clearTimeout(this._t);
        this._t = setTimeout(() => this.r(), 80);
        return;
      }
      this.textContent = '';
      t.split(/(\$[^$]+\$)/g).forEach((p) => {
        if (p.length > 2 && p[0] === '$' && p.slice(-1) === '$') {
          const s = document.createElement('span');
          try { window.katex.render(p.slice(1, -1), s, { throwOnError: false }); } catch (e) { s.textContent = p; }
          this.appendChild(s);
        } else if (p) {
          this.appendChild(document.createTextNode(p));
        }
      });
    }
  });
}

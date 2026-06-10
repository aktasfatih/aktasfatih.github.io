// primitives.jsx — self-contained copies of the design-system primitives the
// website kit uses, exposed under the same namespace the screens expect.
//
// WHY: the compiled _ds_bundle.js is injected by the Design System tab but is
// NOT served to standalone pages, so a plain-opened kit needs its own copy.
// These are byte-for-byte the same implementations as components/core/*.jsx
// (same classNames, same token-driven CSS) — keep them in sync if those change.

function useScopedStyle(id, css) {
  React.useEffect(() => {
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id; el.textContent = css; document.head.appendChild(el);
  }, [id, css]);
}

/* ---------------- Button ---------------- */
const BTN_CSS = `
.fa-btn{ --_bg:var(--accent); --_fg:var(--text-on-accent); --_bd:transparent;
  appearance:none; -webkit-appearance:none;
  display:inline-flex; align-items:center; justify-content:center; gap:.5em;
  font-family:var(--font-ui); font-weight:var(--fw-semibold); line-height:1;
  border:var(--border-width) solid var(--_bd); border-radius:var(--radius-sm);
  background:var(--_bg); color:var(--_fg); cursor:pointer; letter-spacing:.005em;
  white-space:nowrap; text-decoration:none;
  transition:background var(--dur-fast) var(--ease-out),border-color var(--dur-fast) var(--ease-out),transform var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out); }
.fa-btn--md{ font-size:var(--text-base); padding:.625rem 1.1rem; }
.fa-btn--sm{ font-size:var(--text-sm); padding:.45rem .8rem; border-radius:var(--radius-xs); }
.fa-btn--lg{ font-size:var(--text-md); padding:.8rem 1.5rem; }
.fa-btn--primary{ --_bg:var(--accent); --_fg:var(--text-on-accent); box-shadow:var(--shadow-xs); }
.fa-btn--primary:hover{ --_bg:var(--accent-hover); }
.fa-btn--primary:active{ --_bg:var(--accent-press); transform:translateY(1px); }
.fa-btn--secondary{ --_bg:var(--surface-card); --_fg:var(--text-strong); --_bd:var(--border-strong); }
.fa-btn--secondary:hover{ --_bg:var(--bg-sunken); --_bd:var(--neutral-400); }
.fa-btn--secondary:active{ transform:translateY(1px); }
.fa-btn--ghost{ --_bg:transparent; --_fg:var(--text-strong); }
.fa-btn--ghost:hover{ --_bg:var(--accent-weak); --_fg:var(--accent); }
.fa-btn:focus-visible{ outline:none; box-shadow:var(--shadow-focus); }
.fa-btn[disabled]{ opacity:.5; cursor:not-allowed; transform:none; box-shadow:none; }
.fa-btn__spin{ width:1em;height:1em;border-radius:50%;border:2px solid currentColor;border-right-color:transparent;animation:fa-btn-spin .6s linear infinite; }
@keyframes fa-btn-spin{ to{ transform:rotate(360deg); } }`;
function Button({ children, variant="primary", size="md", iconLeft=null, iconRight=null, loading=false, disabled=false, as="button", ...rest }) {
  useScopedStyle("fa-btn-style", BTN_CSS);
  const T = as;
  return (
    <T className={`fa-btn fa-btn--${variant} fa-btn--${size}`} disabled={disabled||loading||undefined} {...rest}>
      {loading && <span className="fa-btn__spin" aria-hidden="true" />}
      {!loading && iconLeft}{children}{!loading && iconRight}
    </T>
  );
}

/* ---------------- IconButton ---------------- */
const IB_CSS = `
.fa-iconbtn{ display:inline-flex; align-items:center; justify-content:center;
  appearance:none; -webkit-appearance:none;
  border:var(--border-width) solid transparent; border-radius:var(--radius-sm);
  background:transparent; color:var(--text-muted); cursor:pointer; padding:0;
  transition:background var(--dur-fast) var(--ease-out),color var(--dur-fast) var(--ease-out),border-color var(--dur-fast) var(--ease-out); }
.fa-iconbtn svg{ width:1.15em; height:1.15em; display:block; }
.fa-iconbtn--md{ width:2.5rem; height:2.5rem; font-size:var(--text-md); }
.fa-iconbtn--sm{ width:2rem; height:2rem; font-size:var(--text-base); }
.fa-iconbtn--ghost:hover{ background:var(--accent-weak); color:var(--accent); }
.fa-iconbtn--outline{ border-color:var(--border-strong); color:var(--text-strong); background:var(--surface-card); }
.fa-iconbtn--outline:hover{ background:var(--bg-sunken); border-color:var(--neutral-400); }
.fa-iconbtn:focus-visible{ outline:none; box-shadow:var(--shadow-focus); }
.fa-iconbtn[disabled]{ opacity:.45; cursor:not-allowed; }`;
function IconButton({ children, label, variant="ghost", size="md", as="button", disabled=false, ...rest }) {
  useScopedStyle("fa-iconbtn-style", IB_CSS);
  const T = as;
  return <T className={`fa-iconbtn fa-iconbtn--${variant} fa-iconbtn--${size}`} aria-label={label} title={label} disabled={disabled||undefined} {...rest}>{children}</T>;
}

/* ---------------- Tag ---------------- */
const TAG_CSS = `
.fa-tag{ display:inline-flex; align-items:center; gap:.4em; font-family:var(--font-mono);
  font-size:var(--text-xs); letter-spacing:.04em; line-height:1; white-space:nowrap;
  padding:.4em .7em; border-radius:var(--radius-pill); border:var(--border-width) solid var(--border);
  background:var(--surface-inset); color:var(--text-muted); text-decoration:none; cursor:default;
  transition:all var(--dur-fast) var(--ease-out); }
.fa-tag--accent{ background:var(--accent-weak); border-color:transparent; color:var(--accent-press); }
.fa-tag--solid{ background:var(--accent); border-color:transparent; color:var(--text-on-accent); }
a.fa-tag:hover, button.fa-tag:hover{ border-color:var(--accent); color:var(--accent); cursor:pointer; }
button.fa-tag{ cursor:pointer; }
.fa-tag__hash{ opacity:.55; }`;
function Tag({ children, variant="default", hash=false, as="span", ...rest }) {
  useScopedStyle("fa-tag-style", TAG_CSS);
  const T = as;
  return <T className={`fa-tag fa-tag--${variant}`} {...rest}>{hash && <span className="fa-tag__hash">#</span>}{children}</T>;
}

/* ---------------- Badge ---------------- */
const BADGE_CSS = `
.fa-badge{ display:inline-flex; align-items:center; gap:.4em; font-family:var(--font-ui);
  font-weight:var(--fw-semibold); font-size:var(--text-xs); line-height:1; letter-spacing:.01em;
  padding:.35em .6em; border-radius:var(--radius-xs); background:var(--surface-inset); color:var(--text-body); }
.fa-badge__dot{ width:.5em; height:.5em; border-radius:50%; background:currentColor; }
.fa-badge--neutral{ color:var(--text-muted); }
.fa-badge--success{ color:var(--success); background:color-mix(in oklab,var(--success) 12%,transparent); }
.fa-badge--info{ color:var(--info); background:color-mix(in oklab,var(--info) 12%,transparent); }
.fa-badge--warning{ color:var(--warning); background:color-mix(in oklab,var(--warning) 14%,transparent); }
.fa-badge--danger{ color:var(--danger); background:color-mix(in oklab,var(--danger) 12%,transparent); }`;
function Badge({ children, tone="neutral", dot=false, ...rest }) {
  useScopedStyle("fa-badge-style", BADGE_CSS);
  return <span className={`fa-badge fa-badge--${tone}`} {...rest}>{dot && <span className="fa-badge__dot" />}{children}</span>;
}

/* ---------------- Avatar ---------------- */
const AV_CSS = `
.fa-avatar{ display:inline-flex; align-items:center; justify-content:center; overflow:hidden; flex:none;
  background:var(--accent); color:var(--text-on-accent); font-family:var(--font-display); font-weight:var(--fw-bold);
  line-height:1; border:2px solid var(--surface-card); box-shadow:var(--shadow-sm); }
.fa-avatar img{ width:100%; height:100%; object-fit:cover; display:block; }
.fa-avatar--circle{ border-radius:50%; }
.fa-avatar--rounded{ border-radius:var(--radius-md); }
.fa-avatar--xs{ width:1.75rem; height:1.75rem; font-size:.7rem; }
.fa-avatar--sm{ width:2.5rem; height:2.5rem; font-size:.95rem; }
.fa-avatar--md{ width:3.25rem; height:3.25rem; font-size:1.2rem; }
.fa-avatar--lg{ width:5rem; height:5rem; font-size:1.8rem; }
.fa-avatar--xl{ width:8rem; height:8rem; font-size:2.6rem; border-width:3px; }`;
function Avatar({ src=null, alt="", initials="", size="md", shape="circle", ...rest }) {
  useScopedStyle("fa-avatar-style", AV_CSS);
  return <span className={`fa-avatar fa-avatar--${shape} fa-avatar--${size}`} {...rest}>{src ? <img src={src} alt={alt} /> : initials}</span>;
}

/* ---------------- Card ---------------- */
const CARD_CSS = `
.fa-card{ background:var(--surface-card); border:var(--border-width) solid var(--border);
  border-radius:var(--radius-lg); color:var(--text-body);
  transition:transform var(--dur-base) var(--ease-out),box-shadow var(--dur-base) var(--ease-out),border-color var(--dur-base) var(--ease-out); }
.fa-card--pad-sm{ padding:var(--space-4); } .fa-card--pad-md{ padding:var(--space-5); }
.fa-card--pad-lg{ padding:var(--space-6); } .fa-card--pad-none{ padding:0; }
.fa-card--flat{ box-shadow:none; }
.fa-card--raised{ box-shadow:var(--shadow-sm); border-color:transparent; }
.fa-card--interactive{ cursor:pointer; }
.fa-card--interactive:hover{ transform:translateY(-3px); box-shadow:var(--shadow-md); border-color:var(--border-strong); }`;
function Card({ children, elevation="flat", padding="md", interactive=false, as="div", className="", ...rest }) {
  useScopedStyle("fa-card-style", CARD_CSS);
  const T = as;
  const cls = ["fa-card", `fa-card--${elevation}`, `fa-card--pad-${padding}`, interactive ? "fa-card--interactive" : "", className].join(" ").trim();
  return <T className={cls} {...rest}>{children}</T>;
}

/* ---------------- Input ---------------- */
const INP_CSS = `
.fa-field{ display:flex; flex-direction:column; gap:.4rem; font-family:var(--font-ui); }
.fa-field__label{ font-size:var(--text-sm); font-weight:var(--fw-semibold); color:var(--text-strong); }
.fa-field__req{ color:var(--accent); margin-left:.15em; }
.fa-field__wrap{ position:relative; display:flex; align-items:center; }
.fa-field__icon{ position:absolute; left:.7rem; display:flex; color:var(--text-faint); pointer-events:none; }
.fa-field__icon svg{ width:1.05em; height:1.05em; }
.fa-input{ width:100%; font-family:var(--font-ui); font-size:var(--text-base); color:var(--text-strong);
  appearance:none; -webkit-appearance:none;
  background:var(--surface-card); border:var(--border-width) solid var(--border-strong); border-radius:var(--radius-sm);
  padding:.6rem .75rem; transition:border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out); }
.fa-input--has-icon{ padding-left:2.2rem; }
.fa-input::placeholder{ color:var(--text-faint); }
.fa-input:hover{ border-color:var(--neutral-400); }
.fa-input:focus{ outline:none; border-color:var(--accent); box-shadow:var(--shadow-focus); }
.fa-input[disabled]{ opacity:.55; cursor:not-allowed; background:var(--bg-sunken); }
.fa-field--error .fa-input{ border-color:var(--danger); }
.fa-field__hint{ font-size:var(--text-xs); color:var(--text-muted); font-family:var(--font-mono); }
.fa-field__hint--error{ color:var(--danger); }`;
function Input({ label, hint, error, icon=null, required=false, id, className="", ...rest }) {
  useScopedStyle("fa-input-style", INP_CSS);
  const fid = id || `fa-input-${Math.random().toString(36).slice(2,8)}`;
  return (
    <div className={`fa-field ${error ? "fa-field--error" : ""} ${className}`}>
      {label && <label className="fa-field__label" htmlFor={fid}>{label}{required && <span className="fa-field__req">*</span>}</label>}
      <div className="fa-field__wrap">
        {icon && <span className="fa-field__icon">{icon}</span>}
        <input id={fid} className={`fa-input ${icon ? "fa-input--has-icon" : ""}`} aria-invalid={!!error} required={required} {...rest} />
      </div>
      {(error || hint) && <span className={`fa-field__hint ${error ? "fa-field__hint--error" : ""}`}>{error || hint}</span>}
    </div>
  );
}

/* ---------------- ThemeToggle ---------------- */
const TT_CSS = `
.fa-theme{ display:inline-flex; align-items:center; gap:.15rem; padding:.2rem;
  background:var(--surface-inset); border:var(--border-width) solid var(--border); border-radius:var(--radius-pill); }
.fa-theme__btn{ display:inline-flex; align-items:center; justify-content:center; width:1.9rem; height:1.9rem;
  appearance:none; -webkit-appearance:none;
  border:0; background:transparent; cursor:pointer; border-radius:var(--radius-pill); color:var(--text-muted);
  transition:background var(--dur-fast) var(--ease-out),color var(--dur-fast) var(--ease-out); }
.fa-theme__btn svg{ width:1.05em; height:1.05em; }
.fa-theme__btn[aria-pressed="true"]{ background:var(--surface-card); color:var(--accent); box-shadow:var(--shadow-xs); }
.fa-theme__btn:hover{ color:var(--text-strong); }`;
const _Sun = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>;
const _Moon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>;
function ThemeToggle({ value, onChange }) {
  useScopedStyle("fa-theme-style", TT_CSS);
  const [internal, setInternal] = React.useState("light");
  const theme = value ?? internal;
  const set = (next) => {
    if (onChange) onChange(next); else setInternal(next);
    document.documentElement.setAttribute("data-theme", next);
  };
  return (
    <div className="fa-theme" role="group" aria-label="Color theme">
      <button className="fa-theme__btn" aria-pressed={theme === "light"} aria-label="Light" onClick={() => set("light")}><_Sun /></button>
      <button className="fa-theme__btn" aria-pressed={theme === "dark"} aria-label="Dark" onClick={() => set("dark")}><_Moon /></button>
    </div>
  );
}

// Expose under the same namespace the screens read from.
window.FatihAktasDesignSystem_e4dcbf = { Button, IconButton, Tag, Badge, Avatar, Card, Input, ThemeToggle };

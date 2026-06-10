// app.jsx — assembles the single-page site: nav, hero (terminal + identity),
// sections, footer, theme handling, scroll-reveals, and the Tweaks panel.
const { Button, IconButton, Badge, ThemeToggle } = window.FatihAktasDesignSystem_e4dcbf;

const NAV_H = 66;
function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const y = el.getBoundingClientRect().top + window.scrollY - NAV_H + 1;
  window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
}

const ACCENTS = {
  teal:  { a: "#0e8a78", h: "#097263", p: "#06564a", aDark: "#1f9d8a", hDark: "#57bcab" },
  deep:  { a: "#06564a", h: "#06463c", p: "#053a32", aDark: "#1f9d8a", hDark: "#57bcab" },
  pine:  { a: "#3a6e5a", h: "#2f5b4a", p: "#224438", aDark: "#79a892", hDark: "#9cc3b2" },
};

function Nav({ theme, setTheme }) {
  const links = [
    ["work", "work"],
    ["about", "about"],
    ["contact", "contact"],
  ];
  return (
    <header className="nav">
      <div className="wrap nav__inner">
        <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Top">
          <span className="brand__tile">~</span>
          <span className="brand__name">aktasfatih<span className="dim">.com</span></span>
        </button>
        <nav className="nav__links">
          {links.map(([id, label]) => (
            <button key={id} className="nav__link" onClick={() => scrollToId(id)}>
              <span className="slash">/</span>{label}
            </button>
          ))}
        </nav>
        <div className="nav__tools">
          <ThemeToggle value={theme} onChange={setTheme} />
        </div>
      </div>
    </header>
  );
}

function Hero({ go, theme, setTheme, autorun }) {
  const I = window.SiteIcons;
  const S = window.SITE;
  const { Terminal } = window;
  return (
    <section className="hero" id="top">
      <div className="wrap hero__grid">
        <Terminal go={go} theme={theme} setTheme={setTheme} autorun={autorun} />
        <aside className="idcard reveal" data-d="1">
          <div className="idcard__portrait">
            <img src="assets/profile-pic.png" alt="Fatih Aktas at a Canadian mountain lake" />
            <span className="idcard__tag">~/lake-louise.jpg</span>
          </div>
          <div className="idcard__body">
            <h1 className="idcard__name">{S.name}</h1>
            <p className="idcard__role"><span className="ac">{S.role}</span> · {S.location}</p>
            <div className="idcard__status"><span className="idcard__dot" /> open to interesting work</div>
            <div className="idcard__socials">
              <IconButton label="GitHub" variant="outline" as="a" href={S.social.github} target="_blank"><I.Github size={18} /></IconButton>
              <IconButton label="X" variant="outline" as="a" href={S.social.x} target="_blank"><I.XCom size={17} /></IconButton>
              <IconButton label="LinkedIn" variant="outline" as="a" href={S.social.linkedin} target="_blank"><I.LinkedIn size={18} /></IconButton>
              <IconButton label="Email" variant="outline" as="a" href={"mailto:" + S.social.email}><I.Mail size={18} /></IconButton>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "teal",
  "autorun": true,
  "reveals": true,
  "density": "regular"
}/*EDITMODE-END*/;

function App() {
  const { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakToggle, TweakColor } = window;
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [theme, setThemeState] = React.useState("light");

  const setTheme = React.useCallback((next) => {
    setThemeState(next);
    document.documentElement.setAttribute("data-theme", next);
    document.body.setAttribute("data-theme", next);
  }, []);
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
  }, []);

  // accent override
  const acc = ACCENTS[t.accent] || ACCENTS.teal;
  const isDark = theme === "dark";
  const accentVars = {
    "--accent": isDark ? acc.aDark : acc.a,
    "--accent-hover": isDark ? acc.hDark : acc.h,
    "--accent-press": isDark ? acc.hDark : acc.p,
    "--link": isDark ? acc.aDark : acc.h,
  };

  // scroll reveals — progressive enhancement only. We ARM (hide-then-animate)
  // exclusively when the tab is actually visible AND motion is allowed, so a
  // hidden/throttled iframe (where animations freeze) just shows content.
  const checkReveals = React.useCallback(() => {
    const vh = window.innerHeight || document.documentElement.clientHeight || 800;
    document.querySelectorAll(".reveal").forEach((el) => {
      if (el.classList.contains("is-in")) return;
      if (el.getBoundingClientRect().top < vh * 0.92) el.classList.add("is-in");
    });
  }, []);

  // re-apply is-in before paint on every render so React can't wipe it
  React.useLayoutEffect(() => { if (document.body.classList.contains("reveals-on")) checkReveals(); });

  React.useEffect(() => {
    const motionOk = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
    const arm = () => {
      if (!t.reveals || !motionOk || document.visibilityState !== "visible") return false;
      document.body.classList.add("reveals-on");
      checkReveals();
      window.addEventListener("scroll", checkReveals, { passive: true });
      window.addEventListener("resize", checkReveals);
      return true;
    };
    if (!t.reveals) { document.body.classList.remove("reveals-on"); return; }
    let armed = arm();
    // if not visible yet (e.g. opened in a background tab), arm when it becomes visible
    const onVis = () => { if (!armed && document.visibilityState === "visible") armed = arm(); };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("scroll", checkReveals);
      window.removeEventListener("resize", checkReveals);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [t.reveals, checkReveals]);

  const go = React.useCallback((id) => scrollToId(id), []);
  const { Work, About, Contact, Footer } = window;

  return (
    <div className={"site density-" + t.density} style={accentVars} data-density={t.density}>
      <Nav theme={theme} setTheme={setTheme} />
      <Hero go={go} theme={theme} setTheme={setTheme} autorun={t.autorun} />
      <Work />
      <About />
      <Contact />
      <Footer />

      <TweaksPanel>
        <TweakSection label="Accent" />
        <TweakColor label="Brand accent" value={t.accent === "teal" ? "#0e8a78" : t.accent === "deep" ? "#06564a" : "#3a6e5a"}
          options={["#0e8a78", "#06564a", "#3a6e5a"]}
          onChange={(v) => setTweak("accent", v === "#0e8a78" ? "teal" : v === "#06564a" ? "deep" : "pine")} />
        <TweakSection label="Layout" />
        <TweakRadio label="Density" value={t.density} options={["compact", "regular", "comfy"]} onChange={(v) => setTweak("density", v)} />
        <TweakSection label="Motion" />
        <TweakToggle label="Terminal auto-runs whoami" value={t.autorun} onChange={(v) => setTweak("autorun", v)} />
        <TweakToggle label="Scroll reveal animations" value={t.reveals} onChange={(v) => setTweak("reveals", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

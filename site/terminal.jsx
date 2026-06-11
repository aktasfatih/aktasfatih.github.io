// terminal.jsx — the interactive hero terminal. Auto-runs `whoami` on load,
// then accepts real commands. Deeply on-brand: type as personality.
const { SiteIcons: TI } = window;

const PROMPT = (
  <span className="term__prompt"><span className="u">fatih</span><span className="g">@</span><span className="u">toronto</span><span className="g">:</span><span className="path">~</span><span className="g"> $ </span></span>
);

function NeoFetch() {
  const S = window.SITE;
  const logo =
`   .--.
  |o_o |
  |:_/ |
 //   \\ \\
(|     | )
/'\\_   _/'\\
\\___)=(___/`;
  const rows = [
    ["host", "fatih@toronto"],
    ["os", "Arch Linux x86_64"],
    ["kernel", "6.9.2-arch1-1"],
    ["shell", "zsh 5.9"],
    ["editor", "nvim + pgsql.vim"],
    ["role", S.role],
    ["uptime", "since 2016 — Iron Ring earned"],
    ["stack", "go · node.js · python · cloud"],
  ];
  return (
    <div className="neo">
      <div className="neo__logo">{logo}</div>
      <div className="neo__rows">
        {rows.map(([k, v]) => (
          <div key={k}><span className="k">{k}</span><span className="mut"> : </span><span className="v">{v}</span></div>
        ))}
        <div className="neo__bar" aria-hidden="true">
          <i style={{ background: "var(--ink)" }} /><i style={{ background: "var(--teal-700)" }} />
          <i style={{ background: "var(--teal-500)" }} /><i style={{ background: "var(--teal-300)" }} />
          <i style={{ background: "var(--pine-500)" }} /><i style={{ background: "var(--lake-500)" }} />
          <i style={{ background: "var(--amber-500)" }} /><i style={{ background: "#cfe9e2" }} />
        </div>
      </div>
    </div>
  );
}

// command registry — each returns { node?, action? }
function buildCommands({ go, setTheme }) {
  const S = window.SITE;
  const list = {
    help: {
      desc: "list available commands",
      run: () => ({ node: (
        <span className="term__out">
          <span className="hl">available commands</span>{"\n"}
          {[
            ["whoami", "who is this guy"],
            ["ls", "list the sections of this site"],
            ["work", "jump to a section  (also: about, contact)"],
            ["neofetch", "system info, the fun way"],
            ["social", "where to find me"],
            ["theme [dark|light]", "flip the lights"],
            ["clear", "wipe the screen"],
          ].map(([c, d]) => (
            <span key={c}>{"  "}<span className="ac">{c.padEnd(20)}</span><span className="mut">{d}</span>{"\n"}</span>
          ))}
          <span className="mut">{"  tip: ↑/↓ walk history · Tab autocompletes"}</span>
        </span>
      )})
    },
    whoami: {
      desc: "about me",
      run: () => ({ node: (
        <span className="term__out">
          <span className="hl">{S.name}</span> — <span className="ac">{S.role}</span>, {S.location}.{"\n\n"}
          {S.intro}{"\n\n"}
          <span className="mut">try </span><span className="ac">ls</span><span className="mut"> to look around, or </span><span className="ac">neofetch</span><span className="mut"> for the specs.</span>
        </span>
      )})
    },
    ls: {
      desc: "list sections",
      run: () => ({ node: (
        <span className="term__out">
          <span className="mut">drwxr-xr-x  3 fatih  staff</span>{"\n"}
          {[
            ["work/", "where I've been"],
            ["about/", "the longer story"],
            ["contact/", "say hi"],
          ].map(([n, d]) => (
            <span key={n}>{"  "}<span className="ac">{n.padEnd(12)}</span><span className="mut">{d}</span>{"\n"}</span>
          ))}
          <span className="mut">{"  → type the name (e.g. "}</span><span className="ac">work</span><span className="mut">{") to jump there."}</span>
        </span>
      )})
    },
    neofetch: { desc: "system info", run: () => ({ node: <NeoFetch /> }) },
    social: {
      desc: "links",
      run: () => ({ node: (
        <span className="term__out">
          {[
            ["github", S.social.github, "@aktasfatih"],
            ["x", S.social.x, "@moreincode"],
            ["linkedin", S.social.linkedin, "fatih-aktas"],
            ["email", "mailto:" + S.social.email, S.social.email],
          ].map(([k, href, label]) => (
            <span key={k}>{"  "}<span className="ac">{k.padEnd(10)}</span><a href={href} target="_blank" rel="noreferrer">{label}</a>{"\n"}</span>
          ))}
        </span>
      )})
    },
    date: { desc: "now", run: () => ({ node: <span className="term__out">{new Date().toString()}</span> }) },
    sudo: { desc: "", run: () => ({ node: <span className="term__out"><span className="am">fatih is not in the sudoers file. This incident will be reported.</span> 🙂</span> }) },
    exit: { desc: "", run: () => ({ node: <span className="term__out mut">there is no exit. just scroll. ↓</span> }) },
  };

  // navigation aliases
  const nav = { work: "work", about: "about", contact: "contact" };
  Object.entries(nav).forEach(([cmd, id]) => {
    list[cmd] = { desc: `go to ${id}`, run: () => ({ node: <span className="term__out mut">→ opening ./{id}…</span>, action: () => go(id) }) };
  });

  return list;
}

function Terminal({ go, theme, setTheme, autorun = true }) {
  const S = window.SITE;
  const [history, setHistory] = React.useState([]); // {cmd, node, err}
  const [input, setInput] = React.useState("");
  const [typing, setTyping] = React.useState(autorun);
  const [past, setPast] = React.useState([]); // command strings for ↑/↓
  const [hIdx, setHIdx] = React.useState(-1);
  const bodyRef = React.useRef(null);
  const inputRef = React.useRef(null);

  const commands = React.useMemo(() => buildCommands({ go, setTheme }), [go, setTheme]);

  const scrollDown = React.useCallback(() => {
    const el = bodyRef.current; if (el) el.scrollTop = el.scrollHeight;
  }, []);
  React.useEffect(scrollDown, [history, typing, scrollDown]);

  const exec = React.useCallback((raw) => {
    const line = raw.trim();
    setPast((p) => (line ? [...p, line] : p));
    setHIdx(-1);
    if (!line) { setHistory((h) => [...h, { cmd: "", node: null }]); return; }
    const [name, ...args] = line.split(/\s+/);
    const cmd = name.toLowerCase();

    if (cmd === "clear") { setHistory([]); return; }

    if (cmd === "theme") {
      const next = args[0] === "dark" ? "dark" : args[0] === "light" ? "light" : (theme === "dark" ? "light" : "dark");
      setTheme(next);
      setHistory((h) => [...h, { cmd: line, node: <span className="term__out mut">theme → <span className="ac">{next}</span>. {next === "dark" ? "glacial night." : "snow."}</span> }]);
      return;
    }
    const found = commands[cmd];
    if (found) {
      const { node, action } = found.run(args);
      setHistory((h) => [...h, { cmd: line, node }]);
      if (action) setTimeout(action, 360);
    } else {
      setHistory((h) => [...h, { cmd: line, node: <span className="term__err">command not found: {cmd}. type <span className="ac">help</span>.</span> }]);
    }
  }, [commands, theme, setTheme]);

  // auto-type `whoami` on mount — but only animate when the tab is actually
  // visible and motion is allowed; otherwise (hidden/throttled iframe, reduced
  // motion) just print the result so the terminal is never stuck mid-type.
  React.useEffect(() => {
    if (!autorun) { setTyping(false); return; }
    const canAnimate = document.visibilityState === "visible" &&
      window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
    if (!canAnimate) { setTyping(false); exec("whoami"); return; }
    let mounted = true;
    const word = "whoami";
    let i = 0;
    setInput("");
    const tick = () => {
      if (!mounted) return;
      i++;
      setInput(word.slice(0, i));
      if (i < word.length) { setTimeout(tick, 95 + Math.random() * 70); }
      else { setTimeout(() => { if (!mounted) return; setInput(""); setTyping(false); exec(word); inputRef.current && inputRef.current.focus(); }, 380); }
    };
    const start = setTimeout(tick, 650);
    return () => { mounted = false; clearTimeout(start); };
    // eslint-disable-next-line
  }, []);

  const onKey = (e) => {
    if (typing) { e.preventDefault(); return; }
    if (e.key === "Enter") { exec(input); setInput(""); }
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!past.length) return;
      const ni = hIdx < 0 ? past.length - 1 : Math.max(0, hIdx - 1);
      setHIdx(ni); setInput(past[ni]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (hIdx < 0) return;
      const ni = hIdx + 1;
      if (ni >= past.length) { setHIdx(-1); setInput(""); } else { setHIdx(ni); setInput(past[ni]); }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const all = [...Object.keys(commands), "clear", "theme"];
      const m = all.filter((c) => c.startsWith(input.toLowerCase()));
      if (m.length === 1) setInput(m[0]);
    } else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); setHistory([]); }
  };

  const hints = ["help", "ls", "work", "neofetch", "theme dark"];

  return (
    <div className="term" onClick={() => inputRef.current && inputRef.current.focus()}>
      <div className="term__bar">
        <div className="term__dots"><span className="term__dot term__dot--a" /><span className="term__dot" /><span className="term__dot" /></div>
        <div className="term__title">fatih@toronto: ~ — zsh</div>
        <div className="term__titlebtn">{S.location.split(",")[0].toLowerCase()}</div>
      </div>
      <div className="term__body" ref={bodyRef}>
        <div className="term__line"><span className="term__out mut">Last login: a good day to read about systems.{"\n"}type <span className="ac">help</span> for commands — or just start typing.</span></div>
        {history.map((h, i) => (
          <div className="term__line" key={i}>
            {h.cmd !== null && <div>{PROMPT}<span className="term__cmd">{h.cmd}</span></div>}
            {h.node}
          </div>
        ))}
        <label className="term__inputline">
          {PROMPT}
          <span className="term__typed">{input}</span>
          <span className="term__caret" />
          <input
            ref={inputRef}
            className="term__input term__input--hidden"
            value={input}
            onChange={(e) => !typing && setInput(e.target.value)}
            onKeyDown={onKey}
            spellCheck="false" autoComplete="off" autoCapitalize="off" aria-label="terminal input"
          />
        </label>
      </div>
      <div className="term__hints" onClick={(e) => e.stopPropagation()}>
        {hints.map((h) => (
          <button key={h} className="chip" onClick={() => { setTyping(false); exec(h); inputRef.current && inputRef.current.focus(); }}>
            <span className="k">$</span>{h}
          </button>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Terminal });

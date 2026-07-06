// game.jsx — the interactive chmod trainer. A faithful chmod engine runs in the
// browser: type any chmod argument (octal or symbolic) and watch it transform
// the file's mode for real. Each level hands you a start mode and a target; your
// argument passes when the result lands exactly on the target. There's usually
// more than one argument that gets there.
const { Button, Tag, ThemeToggle } = window.FatihAktasDesignSystem_e4dcbf;
const LEVELS = window.CHMOD_LEVELS;
const STORE_SOLVED = "chmod-trainer:solved";
const STORE_THEME = "chmod-trainer:theme";

// ---- chmod engine ------------------------------------------------------------
// Modes are integers 0..07777. Special nibble: setuid 04000, setgid 02000,
// sticky 01000. applyChmod runs the real semantics so any equivalent argument —
// absolute octal or relative symbolic — lands on the same mode.
const WHO_MASK = { u: 0o700, g: 0o070, o: 0o007, a: 0o777 };
const SPECIAL_OF = { u: 0o4000, g: 0o2000, o: 0o1000 };
const PERM_BIT = { r: 4, w: 2, x: 1 };
const SHIFT = { u: 6, g: 3, o: 0 };

function clauseBits(who, perms, mode, isDir) {
  let bits = 0;
  const whos = who === "a" || who === "" ? ["u", "g", "o"] : who.split("");
  for (const w of whos) {
    for (const p of perms) {
      if (p === "r" || p === "w" || p === "x") bits |= PERM_BIT[p] << SHIFT[w];
      else if (p === "X") { if (isDir || (mode & 0o111) !== 0) bits |= PERM_BIT.x << SHIFT[w]; }
      else if (p === "s") { if (w === "u") bits |= 0o4000; if (w === "g") bits |= 0o2000; }
      else if (p === "t") { if (w === "o") bits |= 0o1000; }
    }
  }
  return bits;
}

function applyChmod(mode, spec, isDir) {
  const s = String(spec).trim();
  if (s === "") throw new Error("type a chmod argument");
  if (/^[0-7]{3,4}$/.test(s)) return parseInt(s, 8) & 0o7777;
  let m = mode;
  for (const clause of s.split(",")) {
    const mm = clause.trim().match(/^([ugoa]*)([-+=])([rwxXst]*)$/);
    if (!mm) throw new Error(`can't parse "${clause.trim()}"`);
    const [, who, op, perms] = mm;
    const whos = who === "a" || who === "" ? ["u", "g", "o"] : who.split("");
    let clearMask = 0;
    for (const w of whos) {
      clearMask |= WHO_MASK[w];
      if (op === "=") { if (w === "u" || w === "g") clearMask |= SPECIAL_OF[w]; if (w === "o") clearMask |= SPECIAL_OF.o; }
    }
    const bits = clauseBits(who, perms, m, isDir);
    if (op === "+") m |= bits;
    else if (op === "-") m &= ~bits;
    else m = (m & ~clearMask) | (bits & clearMask);
  }
  return m & 0o7777;
}

function triadChars(bits, sBit, sChar) {
  const x = bits & 1;
  const xc = sBit ? (x ? sChar : sChar.toUpperCase()) : (x ? "x" : "-");
  return [bits & 4 ? "r" : "-", bits & 2 ? "w" : "-", xc];
}
function toTriads(mode) {
  return {
    u: triadChars((mode >> 6) & 7, mode & 0o4000, "s"),
    g: triadChars((mode >> 3) & 7, mode & 0o2000, "s"),
    o: triadChars(mode & 7, mode & 0o1000, "t"),
  };
}
const toSymbolic = (mode) => { const t = toTriads(mode); return [...t.u, ...t.g, ...t.o].join(""); };
const toOctal = (mode) => (mode & 0o7000 ? String((mode >> 9) & 7) : "") + [(mode >> 6) & 7, (mode >> 3) & 7, mode & 7].join("");

function runChmod(startOct, spec, isDir) {
  try {
    return { ok: true, mode: applyChmod(parseInt(startOct, 8), spec, isDir) };
  } catch (e) {
    return { ok: false, err: e && e.message ? e.message : String(e) };
  }
}

// render `backtick` spans in lesson text as inline <code>
function richText(str) {
  return String(str).split(/(`[^`]+`)/g).map((part, i) =>
    part.startsWith("`") && part.endsWith("`")
      ? <code key={i}>{part.slice(1, -1)}</code>
      : <React.Fragment key={i}>{part}</React.Fragment>
  );
}

// ---- small pieces ------------------------------------------------------------
function Panel({ title, tone, right, children, grow }) {
  return (
    <div className={"rx-panel" + (grow ? " rx-panel--grow" : "")} data-tone={tone || "dark"}>
      <div className="rx-panel__bar">
        <div className="rx-panel__dots"><i className="on" /><i /><i /></div>
        <span className="rx-panel__title">{title}</span>
        <span className="rx-panel__right">{right}</span>
      </div>
      <div className="rx-panel__body">{children}</div>
    </div>
  );
}

const clsFor = (ch) => ch === "-" ? "off" : ch === "r" ? "r" : ch === "w" ? "w" : ch === "x" ? "x" : "sp";

// Render a mode as three labelled triads; when `goalMode` is given, cells that
// differ from the goal get a diff ring so you can see exactly what's off.
function ModeView({ mode, goalMode, tone, big }) {
  const t = toTriads(mode);
  const gt = goalMode == null ? null : toTriads(goalMode);
  const groups = [["user", "u"], ["group", "g"], ["other", "o"]];
  return (
    <div className={"cm-mode" + (big ? " cm-mode--big" : "")}>
      <div className="cm-mode__octal">
        <span className={"cm-oct cm-oct--" + (tone || "wip")}>{toOctal(mode)}</span>
      </div>
      <div className="cm-triads">
        {groups.map(([label, key]) => (
          <div className="cm-triad" key={key}>
            <span className="cm-triad__label">{label}</span>
            <div className="cm-cells">
              {t[key].map((ch, i) => {
                const diff = gt && gt[key][i] !== ch;
                return <span key={i} className={"cm-cell cm-cell--" + clsFor(ch) + (diff ? " is-diff" : "")}>{ch}</span>;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressDots({ levels, solved, index, onJump }) {
  return (
    <div className="rx-dots" role="tablist" aria-label="Levels">
      {levels.map((lv, i) => {
        const state = solved.has(lv.id) ? "done" : i === index ? "current" : "todo";
        return (
          <button
            key={lv.id}
            className={"rx-dot rx-dot--" + state}
            aria-label={`Level ${i + 1}: ${lv.title}${state === "done" ? " (solved)" : ""}`}
            aria-current={i === index ? "true" : undefined}
            onClick={() => onJump(i)}
            title={`${i + 1}. ${lv.title}`}
          />
        );
      })}
    </div>
  );
}

function LevelRail({ levels, solved, index, onJump }) {
  const groups = [];
  levels.forEach((lv, i) => {
    const g = groups.find((x) => x.name === lv.group);
    (g || groups[groups.push({ name: lv.group, items: [] }) - 1]).items.push({ lv, i });
  });
  return (
    <nav className="rx-rail" aria-label="All levels">
      {groups.map((g) => (
        <div className="rx-rail__group" key={g.name}>
          <div className="rx-rail__label">{g.name}</div>
          <div className="rx-rail__items">
            {g.items.map(({ lv, i }) => (
              <button
                key={lv.id}
                className={"rx-rail__item" + (i === index ? " is-current" : "") + (solved.has(lv.id) ? " is-done" : "")}
                onClick={() => onJump(i)}
              >
                <span className="rx-rail__tick" aria-hidden="true">{solved.has(lv.id) ? "✓" : String(i + 1).padStart(2, "0")}</span>
                <span className="rx-rail__name">{lv.title}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

// ---- the app -----------------------------------------------------------------
function ChmodTrainer() {
  const [index, setIndex] = React.useState(0);
  const level = LEVELS[index];

  const [args, setArgs] = React.useState(() => Object.fromEntries(LEVELS.map((l) => [l.id, l.starter ?? ""])));
  const [showAnswer, setShowAnswer] = React.useState(false);
  const [showHint, setShowHint] = React.useState(false);

  const [solved, setSolved] = React.useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(STORE_SOLVED) || "[]")); } catch { return new Set(); }
  });
  const [theme, setThemeState] = React.useState(() => {
    try { const saved = localStorage.getItem(STORE_THEME); if (saved) return saved; } catch {}
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const inputRef = React.useRef(null);

  const setTheme = React.useCallback((next) => {
    setThemeState(next);
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem(STORE_THEME, next); } catch {}
  }, []);
  React.useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, []); // eslint-disable-line

  const arg = args[level.id] ?? "";
  const setArg = (val) => setArgs((p) => ({ ...p, [level.id]: val }));

  const markSolved = React.useCallback((id) => {
    setSolved((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev); next.add(id);
      try { localStorage.setItem(STORE_SOLVED, JSON.stringify([...next])); } catch {}
      return next;
    });
  }, []);

  const targetMode = React.useMemo(() => parseInt(level.target, 8), [level]);
  const startMode = React.useMemo(() => parseInt(level.start, 8), [level]);
  const result = React.useMemo(() => runChmod(level.start, arg, level.dir), [level, arg]);

  const passedNow = result.ok && result.mode === targetMode;

  React.useEffect(() => { if (passedNow) markSolved(level.id); }, [passedNow, level.id, markSolved]);
  React.useEffect(() => { setShowAnswer(false); setShowHint(false); }, [index]);

  const go = (i) => setIndex(Math.max(0, Math.min(LEVELS.length - 1, i)));
  const isSolved = solved.has(level.id);
  const tone = passedNow ? "ok" : "wip";
  const started = arg.trim() !== "";

  return (
    <div className="rx">
      <header className="rx-top">
        <div className="rx-top__wrap">
          <a className="rx-brand" href="../../" aria-label="Back to aktasfatih.com">
            <span className="rx-brand__tile">rwx</span>
            <span className="rx-brand__name">~/lab/<b>chmod</b></span>
          </a>
          <div className="rx-top__spacer" />
          <a className="rx-back" href="../../">← aktasfatih.com</a>
          <ThemeToggle value={theme} onChange={setTheme} />
        </div>
      </header>

      <main className="rx-main">
        <div className="rx-head">
          <div>
            <h1 className="rx-title">Learn <span className="ac">chmod</span> by doing</h1>
            <p className="rx-lede">
              Unix permissions look cryptic until they click. Each level hands you a file and a target mode;
              write one <code>chmod</code> argument to get there and watch the bits flip live — octal or
              symbolic, a real chmod engine decides. Reach the goal to clear each level.
            </p>
          </div>
          <div className="rx-head__meta">
            <div className="rx-count"><b>{solved.size}</b> / {LEVELS.length} solved</div>
            <ProgressDots levels={LEVELS} solved={solved} index={index} onJump={go} />
          </div>
        </div>

        <section className="rx-lesson">
          <div className="rx-lesson__head">
            <Tag variant="accent">{level.group}</Tag>
            <span className="rx-lesson__no">level {index + 1} of {LEVELS.length}</span>
            {isSolved && <span className="rx-solved">✓ solved</span>}
          </div>
          <h2 className="rx-lesson__title">{level.title}</h2>
          <p className="rx-lesson__teach">{richText(level.teach)}</p>
          <p className="rx-lesson__task"><span className="rx-lesson__taskk">your task</span> {richText(level.task)}</p>
        </section>

        {/* chmod bar */}
        <div className={"rx-filter cm-filter" + (passedNow ? " is-pass" : "") + (started && !result.ok ? " is-err" : "")}>
          <span className="cm-filter__cmd">chmod</span>
          <input
            ref={inputRef}
            className="rx-filter__input cm-input"
            value={arg}
            onChange={(e) => setArg(e.target.value)}
            spellCheck="false" autoComplete="off" autoCapitalize="off"
            aria-label="chmod argument"
            placeholder="e.g. u+x  or  644"
          />
          <span className="cm-filter__target">{level.dir ? "📁 " : ""}{level.name}</span>
          <span className="rx-filter__live" aria-hidden="true">live</span>
        </div>

        <div className="rx-work">
          <Panel
            title={"result" + (level.dir ? " (directory)" : "")}
            grow
            tone={started && !result.ok ? "err" : passedNow ? "ok" : "dark"}
            right={
              started && !result.ok ? <span className="rx-flag rx-flag--err">invalid</span>
              : passedNow ? <span className="rx-flag rx-flag--ok">✓ match</span>
              : !started ? <span className="rx-flag">awaiting</span>
              : <span className="rx-flag">not there yet</span>
            }
          >
            {started && !result.ok
              ? <pre className="rx-code rx-code--err">{result.err}</pre>
              : <ModeView mode={result.ok ? result.mode : startMode} goalMode={targetMode} tone={tone} big />}
          </Panel>
          <div className="rx-col">
            <Panel title="start" tone="dark">
              <ModeView mode={startMode} tone="goal" />
            </Panel>
            <Panel title="goal — reach this">
              <ModeView mode={targetMode} tone="goal" />
            </Panel>
          </div>
        </div>

        <div className="rx-controls">
          <div className="rx-controls__left">
            <Button variant="ghost" size="sm" onClick={() => setShowHint((v) => !v)}>💡 Hint</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowAnswer((v) => !v)}>{showAnswer ? "Hide answer" : "Show answer"}</Button>
            <Button variant="ghost" size="sm" onClick={() => { setArg(level.starter ?? ""); inputRef.current && inputRef.current.focus(); }}>Reset</Button>
          </div>
          <div className="rx-controls__right">
            <Button variant="secondary" size="sm" onClick={() => go(index - 1)} disabled={index === 0}>← Prev</Button>
            <Button variant="secondary" size="sm" onClick={() => go(index + 1)} disabled={index === LEVELS.length - 1}>Next →</Button>
          </div>
        </div>

        {(showHint || showAnswer) && (
          <div className="rx-reveal">
            {showHint && <p className="rx-reveal__hint"><b>Hint.</b> {richText(level.hint)}</p>}
            {showAnswer && (
              <p className="rx-reveal__answer">
                <b>One answer.</b>{" "}
                <code className="rx-inline">chmod {level.solution} {level.name}</code>{" "}
                <button className="rx-use" onClick={() => { setArg(level.solution); inputRef.current && inputRef.current.focus(); }}>use it →</button>
              </p>
            )}
          </div>
        )}

        <LevelRail levels={LEVELS} solved={solved} index={index} onJump={go} />

        <footer className="rx-foot">
          <span>a faithful chmod engine · octal and symbolic both accepted · progress saved in your browser</span>
          <button className="rx-reset-all" onClick={() => { setSolved(new Set()); try { localStorage.removeItem(STORE_SOLVED); } catch {} }}>reset progress</button>
        </footer>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<ChmodTrainer />);

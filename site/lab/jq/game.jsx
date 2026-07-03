// game.jsx — the interactive jq trainer. Real jq (compiled to WebAssembly) runs
// in the browser, so learners type ANY filter and see genuine output. Each level
// carries a reference solution; the goal output is produced by running that
// solution through the same engine, and your filter passes when its output
// matches. There's almost always more than one filter that gets there.
const { Button, Tag, ThemeToggle } = window.FatihAktasDesignSystem_e4dcbf;
const LEVELS = window.JQ_LEVELS;
const STORE_SOLVED = "jq-trainer:solved";
const STORE_THEME = "jq-trainer:theme";

// ---- jq engine wrapper -------------------------------------------------------
// window.jq (from jq.js) is a Promise resolving to { json, raw }. raw() takes a
// JSON string + filter and returns jq's stdout, pretty-printed. It throws on
// compile/runtime errors — we surface that as the output instead of crashing.
function runFilter(engine, inputValue, filter) {
  const src = JSON.stringify(inputValue);
  try {
    const out = engine.raw(src, filter);
    if (out === null || out === undefined) return { ok: false, err: "no output" };
    return { ok: true, out: String(out).replace(/\n+$/, "") };
  } catch (e) {
    let msg = (e && e.message) ? e.message : String(e);
    // Emscripten prefixes a "Non-zero exit code: N" line; the useful part is
    // jq's own compile/runtime error underneath. Keep the jq lines.
    const jqLines = msg.split("\n").filter((l) => /jq:|error|line \d/i.test(l));
    msg = (jqLines.length ? jqLines.join("\n") : msg).trim();
    return { ok: false, err: msg.replace(/^jq:\s*error(\s*\(.*?\))?:\s*/i, "") };
  }
}
const norm = (s) => (s == null ? "" : String(s).replace(/\s+$/, ""));

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
    <div className={"jq-panel" + (grow ? " jq-panel--grow" : "")} data-tone={tone || "dark"}>
      <div className="jq-panel__bar">
        <div className="jq-panel__dots"><i className="on" /><i /><i /></div>
        <span className="jq-panel__title">{title}</span>
        <span className="jq-panel__right">{right}</span>
      </div>
      <div className="jq-panel__body">{children}</div>
    </div>
  );
}

function ProgressDots({ levels, solved, index, onJump }) {
  return (
    <div className="jq-dots" role="tablist" aria-label="Levels">
      {levels.map((lv, i) => {
        const state = solved.has(lv.id) ? "done" : i === index ? "current" : "todo";
        return (
          <button
            key={lv.id}
            className={"jq-dot jq-dot--" + state}
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
    <nav className="jq-rail" aria-label="All levels">
      {groups.map((g) => (
        <div className="jq-rail__group" key={g.name}>
          <div className="jq-rail__label">{g.name}</div>
          <div className="jq-rail__items">
            {g.items.map(({ lv, i }) => (
              <button
                key={lv.id}
                className={"jq-rail__item" + (i === index ? " is-current" : "") + (solved.has(lv.id) ? " is-done" : "")}
                onClick={() => onJump(i)}
              >
                <span className="jq-rail__tick" aria-hidden="true">{solved.has(lv.id) ? "✓" : String(i + 1).padStart(2, "0")}</span>
                <span className="jq-rail__name">{lv.title}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

// ---- the app -----------------------------------------------------------------
function JqTrainer() {
  const [engine, setEngine] = React.useState(null);
  const [engineErr, setEngineErr] = React.useState(null);

  const [index, setIndex] = React.useState(0);
  const level = LEVELS[index];

  const [filters, setFilters] = React.useState(() => Object.fromEntries(LEVELS.map((l) => [l.id, l.starter ?? "."])));
  const [result, setResult] = React.useState(null);   // { ok, out|err }
  const [goal, setGoal] = React.useState(null);        // { ok, out|err }
  const [showAnswer, setShowAnswer] = React.useState(false);
  const [showHint, setShowHint] = React.useState(false);

  const [solved, setSolved] = React.useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(STORE_SOLVED) || "[]")); } catch { return new Set(); }
  });
  const [theme, setThemeState] = React.useState(() => {
    try {
      const saved = localStorage.getItem(STORE_THEME);
      if (saved) return saved;
    } catch {}
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const inputRef = React.useRef(null);

  const setTheme = React.useCallback((next) => {
    setThemeState(next);
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem(STORE_THEME, next); } catch {}
  }, []);
  React.useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, []); // eslint-disable-line

  // boot the wasm engine once
  React.useEffect(() => {
    let alive = true;
    Promise.resolve(window.jq)
      .then((mod) => { if (alive) setEngine(() => mod); })
      .catch((e) => { if (alive) setEngineErr(String(e && e.message ? e.message : e)); });
    return () => { alive = false; };
  }, []);

  const filter = filters[level.id] ?? ".";
  const setFilter = (val) => setFilters((f) => ({ ...f, [level.id]: val }));

  const markSolved = React.useCallback((id) => {
    setSolved((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev); next.add(id);
      try { localStorage.setItem(STORE_SOLVED, JSON.stringify([...next])); } catch {}
      return next;
    });
  }, []);

  const run = React.useCallback(() => {
    if (!engine) return;
    const r = runFilter(engine, level.input, filter);
    setResult(r);
    if (r.ok && goal && goal.ok && norm(r.out) === norm(goal.out)) markSolved(level.id);
  }, [engine, level, filter, goal, markSolved]);

  // when the engine is ready or the level changes: compute the goal output and
  // auto-run the current filter so no pane starts empty.
  React.useEffect(() => {
    if (!engine) return;
    const g = runFilter(engine, level.input, level.solution);
    setGoal(g);
    const r = runFilter(engine, level.input, filters[level.id] ?? ".");
    setResult(r);
    if (r.ok && g.ok && norm(r.out) === norm(g.out)) markSolved(level.id);
    setShowAnswer(false);
    setShowHint(false);
  }, [engine, index]); // eslint-disable-line

  const go = (i) => setIndex(Math.max(0, Math.min(LEVELS.length - 1, i)));
  const isSolved = solved.has(level.id);
  const passedNow = result && result.ok && goal && goal.ok && norm(result.out) === norm(goal.out);

  const onKey = (e) => {
    if (e.key === "Enter") { e.preventDefault(); run(); }
  };

  const inputJson = JSON.stringify(level.input, null, 2);
  const booting = !engine && !engineErr;

  return (
    <div className="jq">
      <header className="jq-top">
        <div className="jq-top__wrap">
          <a className="jq-brand" href="../../" aria-label="Back to aktasfatih.com">
            <span className="jq-brand__tile">‹›</span>
            <span className="jq-brand__name">~/lab/<b>jq</b></span>
          </a>
          <div className="jq-top__spacer" />
          <a className="jq-back" href="../../">← aktasfatih.com</a>
          <ThemeToggle value={theme} onChange={setTheme} />
        </div>
      </header>

      <main className="jq-main">
        {/* intro / progress */}
        <div className="jq-head">
          <div>
            <h1 className="jq-title">Learn <span className="ac">jq</span> by doing</h1>
            <p className="jq-lede">
              jq is a tiny language for slicing JSON. Type a filter, hit <kbd>Enter</kbd>, watch it run —
              this is the real jq compiled to WebAssembly, so anything goes. Match the goal to clear each level.
            </p>
          </div>
          <div className="jq-head__meta">
            <div className="jq-count"><b>{solved.size}</b> / {LEVELS.length} solved</div>
            <ProgressDots levels={LEVELS} solved={solved} index={index} onJump={go} />
          </div>
        </div>

        {/* lesson */}
        <section className="jq-lesson">
          <div className="jq-lesson__head">
            <Tag variant="accent">{level.group}</Tag>
            <span className="jq-lesson__no">level {index + 1} of {LEVELS.length}</span>
            {isSolved && <span className="jq-solved">✓ solved</span>}
          </div>
          <h2 className="jq-lesson__title">{level.title}</h2>
          <p className="jq-lesson__teach">{richText(level.teach)}</p>
          <p className="jq-lesson__task"><span className="jq-lesson__taskk">your task</span> {richText(level.task)}</p>
        </section>

        {/* filter bar */}
        <div className={"jq-filter" + (passedNow ? " is-pass" : "") + (result && !result.ok ? " is-err" : "")}>
          <span className="jq-filter__prefix">jq&nbsp;<span className="q">'</span></span>
          <input
            ref={inputRef}
            className="jq-filter__input"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            onKeyDown={onKey}
            spellCheck="false" autoComplete="off" autoCapitalize="off"
            aria-label="jq filter"
            placeholder="type a jq filter…"
          />
          <span className="jq-filter__suffix"><span className="q">'</span></span>
          <Button size="sm" onClick={run} disabled={booting} iconRight={<span aria-hidden="true">▸</span>}>
            {booting ? "booting…" : "Run"}
          </Button>
        </div>

        {/* workbench */}
        <div className="jq-work">
          <Panel title="input.json" grow>
            <pre className="jq-code">{inputJson}</pre>
          </Panel>
          <div className="jq-col">
            <Panel
              title="output"
              tone={result && !result.ok ? "err" : passedNow ? "ok" : "dark"}
              right={
                booting ? <span className="jq-flag">booting</span>
                : engineErr ? <span className="jq-flag jq-flag--err">engine failed</span>
                : passedNow ? <span className="jq-flag jq-flag--ok">✓ match</span>
                : result && !result.ok ? <span className="jq-flag jq-flag--err">error</span>
                : <span className="jq-flag">keep going</span>
              }
            >
              {engineErr
                ? <pre className="jq-code jq-code--err">Could not load the jq engine.{"\n"}{engineErr}</pre>
                : booting
                ? <pre className="jq-code jq-code--mut">booting jq (WebAssembly)…</pre>
                : result && result.ok
                ? <pre className="jq-code">{result.out === "" ? "(no output)" : result.out}</pre>
                : result
                ? <pre className="jq-code jq-code--err">{result.err}</pre>
                : <pre className="jq-code jq-code--mut">press Run</pre>}
            </Panel>
            <Panel title="goal — match this">
              {goal && goal.ok
                ? <pre className="jq-code jq-code--goal">{goal.out === "" ? "(no output)" : goal.out}</pre>
                : <pre className="jq-code jq-code--mut">…</pre>}
            </Panel>
          </div>
        </div>

        {/* controls */}
        <div className="jq-controls">
          <div className="jq-controls__left">
            <Button variant="ghost" size="sm" onClick={() => setShowHint((v) => !v)}>💡 Hint</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowAnswer((v) => !v)}>
              {showAnswer ? "Hide answer" : "Show answer"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setFilter(level.starter ?? "."); inputRef.current && inputRef.current.focus(); }}>Reset</Button>
          </div>
          <div className="jq-controls__right">
            <Button variant="secondary" size="sm" onClick={() => go(index - 1)} disabled={index === 0}>← Prev</Button>
            <Button variant="secondary" size="sm" onClick={() => go(index + 1)} disabled={index === LEVELS.length - 1}>Next →</Button>
          </div>
        </div>

        {(showHint || showAnswer) && (
          <div className="jq-reveal">
            {showHint && <p className="jq-reveal__hint"><b>Hint.</b> {richText(level.hint)}</p>}
            {showAnswer && (
              <p className="jq-reveal__answer">
                <b>One answer.</b>{" "}
                <code className="jq-inline">{level.solution}</code>{" "}
                <button className="jq-use" onClick={() => { setFilter(level.solution); inputRef.current && inputRef.current.focus(); }}>use it →</button>
              </p>
            )}
          </div>
        )}

        {/* full level list */}
        <LevelRail levels={LEVELS} solved={solved} index={index} onJump={go} />

        <footer className="jq-foot">
          <span>real jq via <a href="https://github.com/fiatjaf/jq-web" target="_blank" rel="noreferrer">jq-web</a> (WebAssembly) · progress saved in your browser</span>
          <button className="jq-reset-all" onClick={() => { setSolved(new Set()); try { localStorage.removeItem(STORE_SOLVED); } catch {} }}>reset progress</button>
        </footer>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<JqTrainer />);

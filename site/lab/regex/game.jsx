// game.jsx — the interactive regex trainer. The engine is the browser's own
// RegExp, so learners type ANY pattern and see it run live against the subject
// text: matches highlight as you type. Each level carries a reference solution;
// the goal is the set of matches that solution produces, and your pattern passes
// when your matches line up with it. There's almost always more than one pattern
// that gets there.
const { Button, Tag, ThemeToggle } = window.FatihAktasDesignSystem_e4dcbf;
const LEVELS = window.REGEX_LEVELS;
const STORE_SOLVED = "regex-trainer:solved";
const STORE_THEME = "regex-trainer:theme";

// ---- regex engine wrapper ----------------------------------------------------
// runRegex scans `text` for every match of `pattern`+`flags`. The global flag is
// forced on so we surface all matches, not just the first. Zero-width matches are
// advanced past so a pattern like `a*` can't spin forever. Invalid patterns throw
// at construction — we surface that as an error instead of crashing.
function runRegex(text, pattern, flags) {
  if (!pattern) return { ok: true, empty: true, matches: [] };
  let re;
  try {
    re = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
  } catch (e) {
    return { ok: false, err: (e && e.message ? e.message : String(e)).replace(/^.*?:\s*/, "") };
  }
  const matches = [];
  let m, guard = 0;
  while ((m = re.exec(text)) !== null) {
    matches.push({ start: m.index, end: m.index + m[0].length, text: m[0], groups: m.slice(1) });
    if (m.index === re.lastIndex) re.lastIndex++; // step past a zero-width hit
    if (++guard > 2000) break;
  }
  return { ok: true, matches };
}

// A stable fingerprint of a match list, so two patterns that land on the exact
// same spans (position, text, and captured groups) count as equal.
const fingerprint = (matches) =>
  JSON.stringify(matches.map((m) => [m.start, m.text, m.groups.map((g) => (g === undefined ? null : g))]));

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

// The subject text with matches marked. `tone` colours the <mark>s: green when
// the pattern already matches the goal, amber while it's a work in progress.
function Highlighted({ text, matches, tone }) {
  if (!matches || matches.length === 0) return <pre className="rx-code">{text}</pre>;
  const sorted = [...matches].sort((a, b) => a.start - b.start);
  const nodes = [];
  let cursor = 0;
  sorted.forEach((m, i) => {
    if (m.start > cursor) nodes.push(<React.Fragment key={"t" + i}>{text.slice(cursor, m.start)}</React.Fragment>);
    const body = m.end > m.start ? text.slice(m.start, m.end) : "​";
    nodes.push(
      <mark key={"m" + i} className={"rx-hl rx-hl--" + (tone || "wip") + (m.end === m.start ? " rx-hl--empty" : "")}>
        {body}
      </mark>
    );
    cursor = Math.max(cursor, m.end);
  });
  if (cursor < text.length) nodes.push(<React.Fragment key="tail">{text.slice(cursor)}</React.Fragment>);
  return <pre className="rx-code">{nodes}</pre>;
}

// A compact list of matched substrings; capture groups shown with an arrow.
function MatchList({ matches, tone }) {
  if (!matches || matches.length === 0) return <span className="rx-mlist__empty">no matches</span>;
  return (
    <div className="rx-mlist">
      {matches.map((m, i) => (
        <span key={i} className={"rx-chip rx-chip--" + (tone || "wip")}>
          <span className="rx-chip__pos">{m.start}</span>
          <span className="rx-chip__text">{m.text === "" ? "∅" : m.text}</span>
          {m.groups.length > 0 && (
            <span className="rx-chip__grp">→ {m.groups.map((g) => (g === undefined ? "∅" : g)).join(", ")}</span>
          )}
        </span>
      ))}
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
function RegexTrainer() {
  const [index, setIndex] = React.useState(0);
  const level = LEVELS[index];

  const [patterns, setPatterns] = React.useState(() => Object.fromEntries(LEVELS.map((l) => [l.id, l.starter ?? ""])));
  const [flagsMap, setFlagsMap] = React.useState(() => Object.fromEntries(LEVELS.map((l) => [l.id, ""])));
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

  const pattern = patterns[level.id] ?? "";
  const flags = flagsMap[level.id] ?? "";
  const setPattern = (val) => setPatterns((p) => ({ ...p, [level.id]: val }));
  const setFlags = (val) => setFlagsMap((f) => ({ ...f, [level.id]: val.replace(/[^gimsuy]/g, "") }));

  const markSolved = React.useCallback((id) => {
    setSolved((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev); next.add(id);
      try { localStorage.setItem(STORE_SOLVED, JSON.stringify([...next])); } catch {}
      return next;
    });
  }, []);

  // Live evaluation: recompute the user's matches and the goal whenever the
  // pattern, flags, or level change. Regex is instant, so there's no Run button.
  const goal = React.useMemo(() => runRegex(level.text, level.solution, level.flags ?? ""), [level]);
  const result = React.useMemo(() => runRegex(level.text, pattern, flags), [level, pattern, flags]);

  const passedNow =
    result.ok && !result.empty && goal.ok &&
    fingerprint(result.matches) === fingerprint(goal.matches);

  React.useEffect(() => {
    if (passedNow) markSolved(level.id);
  }, [passedNow, level.id, markSolved]);

  React.useEffect(() => { setShowAnswer(false); setShowHint(false); }, [index]);

  const go = (i) => setIndex(Math.max(0, Math.min(LEVELS.length - 1, i)));
  const isSolved = solved.has(level.id);
  const matchTone = passedNow ? "ok" : "wip";

  return (
    <div className="rx">
      <header className="rx-top">
        <div className="rx-top__wrap">
          <a className="rx-brand" href="../../" aria-label="Back to aktasfatih.com">
            <span className="rx-brand__tile">.*</span>
            <span className="rx-brand__name">~/lab/<b>regex</b></span>
          </a>
          <div className="rx-top__spacer" />
          <a className="rx-back" href="../../">← aktasfatih.com</a>
          <ThemeToggle value={theme} onChange={setTheme} />
        </div>
      </header>

      <main className="rx-main">
        {/* intro / progress */}
        <div className="rx-head">
          <div>
            <h1 className="rx-title">Learn <span className="ac">regex</span> by doing</h1>
            <p className="rx-lede">
              Regular expressions are a tiny language for finding patterns in text. Type a pattern and
              watch it match live — this is your browser's real regex engine, so anything goes. Line your
              matches up with the goal to clear each level.
            </p>
          </div>
          <div className="rx-head__meta">
            <div className="rx-count"><b>{solved.size}</b> / {LEVELS.length} solved</div>
            <ProgressDots levels={LEVELS} solved={solved} index={index} onJump={go} />
          </div>
        </div>

        {/* lesson */}
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

        {/* pattern bar */}
        <div className={"rx-filter" + (passedNow ? " is-pass" : "") + (!result.ok ? " is-err" : "")}>
          <span className="rx-filter__prefix"><span className="q">/</span></span>
          <input
            ref={inputRef}
            className="rx-filter__input"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            spellCheck="false" autoComplete="off" autoCapitalize="off"
            aria-label="regex pattern"
            placeholder="type a pattern…"
          />
          <span className="rx-filter__suffix"><span className="q">/</span></span>
          <input
            className="rx-filter__flags"
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            spellCheck="false" autoComplete="off" autoCapitalize="off"
            aria-label="regex flags"
            placeholder="flags"
            title="flags — e.g. i (ignore case), m (multiline), s (dotall)"
          />
          <span className="rx-filter__live" aria-hidden="true">live</span>
        </div>

        {/* workbench */}
        <div className="rx-work">
          <Panel
            title="subject.txt"
            grow
            tone={!result.ok ? "err" : passedNow ? "ok" : "dark"}
            right={
              !result.ok ? <span className="rx-flag rx-flag--err">invalid pattern</span>
              : result.empty ? <span className="rx-flag">awaiting pattern</span>
              : <span className="rx-flag">{result.matches.length} match{result.matches.length === 1 ? "" : "es"}</span>
            }
          >
            {!result.ok
              ? <pre className="rx-code rx-code--err">{result.err}</pre>
              : <Highlighted text={level.text} matches={result.empty ? [] : result.matches} tone={matchTone} />}
          </Panel>
          <div className="rx-col">
            <Panel
              title="your matches"
              tone={!result.ok ? "err" : passedNow ? "ok" : "dark"}
              right={
                !result.ok ? <span className="rx-flag rx-flag--err">error</span>
                : passedNow ? <span className="rx-flag rx-flag--ok">✓ match</span>
                : result.empty ? <span className="rx-flag">start typing</span>
                : <span className="rx-flag">keep going</span>
              }
            >
              {!result.ok
                ? <pre className="rx-code rx-code--err">{result.err}</pre>
                : result.empty
                ? <span className="rx-mlist__empty">type a pattern to see matches</span>
                : <MatchList matches={result.matches} tone={matchTone} />}
            </Panel>
            <Panel title="goal — match these">
              {goal.ok
                ? <MatchList matches={goal.matches} tone="goal" />
                : <span className="rx-mlist__empty">…</span>}
            </Panel>
          </div>
        </div>

        {/* controls */}
        <div className="rx-controls">
          <div className="rx-controls__left">
            <Button variant="ghost" size="sm" onClick={() => setShowHint((v) => !v)}>💡 Hint</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowAnswer((v) => !v)}>
              {showAnswer ? "Hide answer" : "Show answer"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setPattern(level.starter ?? ""); setFlags(""); inputRef.current && inputRef.current.focus(); }}>Reset</Button>
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
                <code className="rx-inline">/{level.solution}/{level.flags}</code>{" "}
                <button className="rx-use" onClick={() => { setPattern(level.solution); setFlags(level.flags ?? ""); inputRef.current && inputRef.current.focus(); }}>use it →</button>
              </p>
            )}
          </div>
        )}

        {/* full level list */}
        <LevelRail levels={LEVELS} solved={solved} index={index} onJump={go} />

        <footer className="rx-foot">
          <span>your browser's native <code>RegExp</code> · patterns run live · progress saved in your browser</span>
          <button className="rx-reset-all" onClick={() => { setSolved(new Set()); try { localStorage.removeItem(STORE_SOLVED); } catch {} }}>reset progress</button>
        </footer>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<RegexTrainer />);

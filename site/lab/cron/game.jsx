// game.jsx — the interactive cron trainer. A small cron parser + schedule
// engine runs in the browser, so learners type ANY 5-field expression and see
// the real upcoming fire times. Each level carries a reference solution; the
// goal is the schedule that solution produces, and your expression passes when
// it fires on the same times. There's usually more than one way to write it.
const { Button, Tag, ThemeToggle } = window.FatihAktasDesignSystem_e4dcbf;
const LEVELS = window.CRON_LEVELS;
const STORE_SOLVED = "cron-trainer:solved";
const STORE_THEME = "cron-trainer:theme";

// ---- cron engine -------------------------------------------------------------
// Fires are computed from a fixed anchor so the displayed schedule is stable and
// reproducible. Both the learner's expression and the reference solution run
// through the same engine, so any equivalent expression matches.
const CRON_ANCHOR = Date.UTC(2024, 0, 1, 0, 0, 0); // Mon 2024-01-01 00:00 UTC
const CRON_FIRES = 6;
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const DOWS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const FIELD_META = [
  { key: "minute", label: "minute", min: 0, max: 59 },
  { key: "hour", label: "hour", min: 0, max: 23 },
  { key: "dom", label: "day-of-month", min: 1, max: 31 },
  { key: "month", label: "month", min: 1, max: 12 },
  { key: "dow", label: "day-of-week", min: 0, max: 6 },
];

function parseField(raw, min, max, names) {
  const set = new Set();
  const add = (v) => { if (v < min || v > max) throw new Error(`${v} is outside ${min}–${max}`); set.add(v); };
  const lookup = (tok) => {
    if (/^\d+$/.test(tok)) return parseInt(tok, 10);
    if (names) { const i = names.indexOf(tok.toLowerCase()); if (i >= 0) return i + (names === MONTHS ? 1 : 0); }
    throw new Error(`don't understand "${tok}"`);
  };
  for (const part of String(raw).split(",")) {
    if (part === "") throw new Error("empty value");
    const [body, stepRaw] = part.split("/");
    const step = stepRaw === undefined ? 1 : parseInt(stepRaw, 10);
    if (!(step >= 1)) throw new Error("bad step");
    let lo, hi;
    if (body === "*") { lo = min; hi = max; }
    else if (body.includes("-")) { const [a, b] = body.split("-"); lo = lookup(a); hi = lookup(b); }
    else { lo = hi = lookup(body); if (stepRaw !== undefined) hi = max; }
    for (let v = lo; v <= hi; v += step) add(v);
  }
  return set;
}

function parseCron(expr) {
  const parts = String(expr).trim().split(/\s+/);
  if (parts.length !== 5) throw new Error(`need exactly 5 fields, got ${parts.length}`);
  const dow = parseField(parts[4], 0, 7, DOWS);
  if (dow.has(7)) { dow.add(0); dow.delete(7); }
  return {
    minute: parseField(parts[0], 0, 59, null),
    hour: parseField(parts[1], 0, 23, null),
    dom: parseField(parts[2], 1, 31, null),
    month: parseField(parts[3], 1, 12, MONTHS),
    dow,
    domStar: parts[2] === "*",
    dowStar: parts[4] === "*",
    parts,
  };
}

function nextFires(cron, count) {
  const out = [];
  const hours = [...cron.hour].sort((a, b) => a - b);
  const minutes = [...cron.minute].sort((a, b) => a - b);
  const startDay = Math.floor((CRON_ANCHOR - Date.UTC(1970, 0, 1)) / 86400000);
  for (let d = 0; d < 366 * 8 && out.length < count; d++) {
    const day = new Date((startDay + d) * 86400000);
    const mon = day.getUTCMonth() + 1, dom = day.getUTCDate(), dow = day.getUTCDay();
    if (!cron.month.has(mon)) continue;
    const domM = cron.dom.has(dom), dowM = cron.dow.has(dow);
    const dayMatch = cron.domStar && cron.dowStar ? true
      : cron.domStar ? dowM : cron.dowStar ? domM : (domM || dowM);
    if (!dayMatch) continue;
    for (const h of hours) {
      for (const m of minutes) {
        const t = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), dom, h, m);
        if (t >= CRON_ANCHOR) { out.push(t); if (out.length >= count) break; }
      }
      if (out.length >= count) break;
    }
  }
  return out;
}

function runCron(expr) {
  try {
    const cron = parseCron(expr);
    return { ok: true, cron, fires: nextFires(cron, CRON_FIRES) };
  } catch (e) {
    return { ok: false, err: e && e.message ? e.message : String(e) };
  }
}

const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pad = (n) => String(n).padStart(2, "0");
function fmtFire(t) {
  const d = new Date(t);
  return { day: `${WD[d.getUTCDay()]} ${MN[d.getUTCMonth()]} ${d.getUTCDate()}`, time: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}` };
}
const firesKey = (fires) => JSON.stringify(fires);

// summarize a parsed field into a compact, human phrase
function summarize(set, meta, isStar) {
  if (isStar) return "every value";
  const vals = [...set].sort((a, b) => a - b);
  const runs = [];
  for (const v of vals) {
    const last = runs[runs.length - 1];
    if (last && v === last[1] + 1) last[1] = v;
    else runs.push([v, v]);
  }
  const nameOf = (v) => meta.key === "dow" ? WD[v % 7] : meta.key === "month" ? MN[v - 1] : String(v);
  return runs.map(([a, b]) => (a === b ? nameOf(a) : `${nameOf(a)}–${nameOf(b)}`)).join(", ");
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

function FireList({ fires, tone }) {
  if (!fires || fires.length === 0) return <span className="rx-mlist__empty">no upcoming runs</span>;
  return (
    <div className="cr-fires">
      {fires.map((t, i) => {
        const f = fmtFire(t);
        return (
          <span key={i} className={"cr-fire cr-fire--" + (tone || "wip")}>
            <span className="cr-fire__day">{f.day}</span>
            <span className="cr-fire__time">{f.time}</span>
          </span>
        );
      })}
    </div>
  );
}

function Breakdown({ cron, tone }) {
  return (
    <div className="cr-break">
      {FIELD_META.map((meta) => {
        const isStar = meta.key === "dom" ? cron.domStar : meta.key === "dow" ? cron.dowStar : cron.parts[FIELD_META.indexOf(meta)] === "*";
        return (
          <div className="cr-break__row" key={meta.key}>
            <span className="cr-break__label">{meta.label}</span>
            <span className="cr-break__raw">{cron.parts[FIELD_META.indexOf(meta)]}</span>
            <span className={"cr-break__val cr-break__val--" + (tone || "wip")}>{summarize(cron[meta.key], meta, isStar)}</span>
          </div>
        );
      })}
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
function CronTrainer() {
  const [index, setIndex] = React.useState(0);
  const level = LEVELS[index];

  const [exprs, setExprs] = React.useState(() => Object.fromEntries(LEVELS.map((l) => [l.id, l.starter ?? "* * * * *"])));
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

  const expr = exprs[level.id] ?? "";
  const setExpr = (val) => setExprs((p) => ({ ...p, [level.id]: val }));

  const markSolved = React.useCallback((id) => {
    setSolved((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev); next.add(id);
      try { localStorage.setItem(STORE_SOLVED, JSON.stringify([...next])); } catch {}
      return next;
    });
  }, []);

  const goal = React.useMemo(() => runCron(level.solution), [level]);
  const result = React.useMemo(() => runCron(expr), [expr]);

  const passedNow = result.ok && goal.ok && firesKey(result.fires) === firesKey(goal.fires);

  React.useEffect(() => { if (passedNow) markSolved(level.id); }, [passedNow, level.id, markSolved]);
  React.useEffect(() => { setShowAnswer(false); setShowHint(false); }, [index]);

  const go = (i) => setIndex(Math.max(0, Math.min(LEVELS.length - 1, i)));
  const isSolved = solved.has(level.id);
  const tone = passedNow ? "ok" : "wip";

  return (
    <div className="rx">
      <header className="rx-top">
        <div className="rx-top__wrap">
          <a className="rx-brand" href="../../" aria-label="Back to aktasfatih.com">
            <span className="rx-brand__tile">* *</span>
            <span className="rx-brand__name">~/lab/<b>cron</b></span>
          </a>
          <div className="rx-top__spacer" />
          <a className="rx-back" href="../../">← aktasfatih.com</a>
          <ThemeToggle value={theme} onChange={setTheme} />
        </div>
      </header>

      <main className="rx-main">
        <div className="rx-head">
          <div>
            <h1 className="rx-title">Learn <span className="ac">cron</span> by doing</h1>
            <p className="rx-lede">
              Cron schedules jobs with five little fields. Type an expression and watch the real upcoming
              run times appear — a genuine cron parser, right in your browser. Line your schedule up with the
              goal to clear each level.
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

        {/* expression bar */}
        <div className={"rx-filter cr-filter" + (passedNow ? " is-pass" : "") + (!result.ok ? " is-err" : "")}>
          <div className="cr-fieldtags" aria-hidden="true">
            <span>minute</span><span>hour</span><span>day-of-month</span><span>month</span><span>day-of-week</span>
          </div>
          <div className="cr-inputrow">
            <input
              ref={inputRef}
              className="rx-filter__input cr-input"
              value={expr}
              onChange={(e) => setExpr(e.target.value)}
              spellCheck="false" autoComplete="off" autoCapitalize="off"
              aria-label="cron expression"
              placeholder="* * * * *"
            />
            <span className="rx-filter__live" aria-hidden="true">live</span>
          </div>
        </div>

        <div className="rx-work">
          <Panel
            title="field breakdown"
            grow
            tone={!result.ok ? "err" : passedNow ? "ok" : "dark"}
            right={!result.ok ? <span className="rx-flag rx-flag--err">invalid</span> : <span className="rx-flag">parsed</span>}
          >
            {result.ok
              ? <Breakdown cron={result.cron} tone={tone} />
              : <pre className="rx-code rx-code--err">{result.err}</pre>}
          </Panel>
          <div className="rx-col">
            <Panel
              title="your next 6 runs"
              tone={!result.ok ? "err" : passedNow ? "ok" : "dark"}
              right={
                !result.ok ? <span className="rx-flag rx-flag--err">error</span>
                : passedNow ? <span className="rx-flag rx-flag--ok">✓ match</span>
                : <span className="rx-flag">keep going</span>
              }
            >
              {result.ok
                ? <FireList fires={result.fires} tone={tone} />
                : <pre className="rx-code rx-code--err">{result.err}</pre>}
            </Panel>
            <Panel title="goal — this schedule">
              {goal.ok ? <FireList fires={goal.fires} tone="goal" /> : <span className="rx-mlist__empty">…</span>}
            </Panel>
          </div>
        </div>

        <div className="rx-controls">
          <div className="rx-controls__left">
            <Button variant="ghost" size="sm" onClick={() => setShowHint((v) => !v)}>💡 Hint</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowAnswer((v) => !v)}>{showAnswer ? "Hide answer" : "Show answer"}</Button>
            <Button variant="ghost" size="sm" onClick={() => { setExpr(level.starter ?? "* * * * *"); inputRef.current && inputRef.current.focus(); }}>Reset</Button>
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
                <code className="rx-inline">{level.solution}</code>{" "}
                <button className="rx-use" onClick={() => { setExpr(level.solution); inputRef.current && inputRef.current.focus(); }}>use it →</button>
              </p>
            )}
          </div>
        )}

        <LevelRail levels={LEVELS} solved={solved} index={index} onJump={go} />

        <footer className="rx-foot">
          <span>schedules computed from a fixed anchor (Mon 1 Jan 2024, UTC) · progress saved in your browser</span>
          <button className="rx-reset-all" onClick={() => { setSolved(new Set()); try { localStorage.removeItem(STORE_SOLVED); } catch {} }}>reset progress</button>
        </footer>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<CronTrainer />);

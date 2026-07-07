// game.jsx — the interactive gcloud trainer. A small Google Cloud simulator runs
// in the browser, so learners type REAL gcloud / gsutil commands and see genuine
// output as config, VMs, buckets, and APIs respond. Each level carries a
// reference solution; the goal is what that solution produces (its output for
// read commands, or the resulting state for mutations), and your command passes
// when it reaches the same place. There's usually more than one way.
const { Button, Tag, ThemeToggle } = window.FatihAktasDesignSystem_e4dcbf;
const LEVELS = window.GCLOUD_LEVELS;
const BASE_STATE = window.GCLOUD_STATE;
const STORE_SOLVED = "gcloud-trainer:solved";
const STORE_THEME = "gcloud-trainer:theme";

// ---- cloud engine ------------------------------------------------------------
// runGcloud(state, cmdline) interprets a curated subset of gcloud / gsutil
// against a (deep-cloned) copy of the state and returns { ok, stdout, state } —
// or { ok:false, err }. The input is never mutated, so the same fixture drives
// both the learner's command and the goal.
const clone = (s) => JSON.parse(JSON.stringify(s));
const DEFAULT_MACHINE = "e2-medium";

// --- flag / arg parsing ---
// Returns { positionals, flags } where --k=v and --k v both land in flags, and
// bare --flag becomes true.
const KNOWN_VALUE_FLAGS = new Set(["zone", "machine-type", "location", "project", "format", "l"]);
function parseArgs(tokens) {
  const positionals = [];
  const flags = {};
  for (let i = 0; i < tokens.length; i++) {
    let tok = tokens[i];
    if (tok[0] === "-") {
      const bare = tok.replace(/^--?/, "");
      const eq = bare.indexOf("=");
      if (eq >= 0) { flags[bare.slice(0, eq)] = bare.slice(eq + 1); }
      else if (KNOWN_VALUE_FLAGS.has(bare) && i + 1 < tokens.length && tokens[i + 1][0] !== "-") { flags[bare] = tokens[++i]; }
      else { flags[bare] = true; }
    } else positionals.push(tok);
  }
  return { positionals, flags };
}

// ---- table rendering ---------------------------------------------------------
function padCols(rows, gap) {
  if (rows.length === 0) return "";
  const w = rows[0].map((_, c) => Math.max(...rows.map((r) => String(r[c] ?? "").length)));
  const sep = " ".repeat(gap || 2);
  return rows.map((r) => r.map((cell, c) => String(cell ?? "").padEnd(c === r.length - 1 ? 0 : w[c])).join(sep)).join("\n");
}

// ---- config ------------------------------------------------------------------
const PROP_MAP = {
  "project": ["core", "project"], "core/project": ["core", "project"],
  "account": ["core", "account"], "core/account": ["core", "account"],
  "compute/zone": ["compute", "zone"], "compute/region": ["compute", "region"],
};
function configList(st) {
  const out = [];
  for (const section of Object.keys(st.config).sort()) {
    const keys = Object.keys(st.config[section]).filter((k) => st.config[section][k]).sort();
    if (keys.length === 0) continue;
    out.push(`[${section}]`);
    for (const k of keys) out.push(`${k} = ${st.config[section][k]}`);
  }
  out.push("");
  out.push("Your active configuration is: [default]");
  return out.join("\n");
}
function configSet(st, positionals) {
  const prop = positionals[0], value = positionals[1];
  if (!prop || value === undefined) throw new Error("expected a property and a value");
  const path = PROP_MAP[prop];
  if (!path) throw new Error(`Section [${prop.split("/")[0]}] has no property [${prop}] known to this trainer`);
  st.config[path[0]][path[1]] = value;
  return `Updated property [${prop}].`;
}
function configGet(st, positionals) {
  const prop = positionals[0];
  const path = PROP_MAP[prop];
  if (!path) throw new Error(`unknown property [${prop}]`);
  const v = st.config[path[0]][path[1]];
  return v || "(unset)";
}
function cmdConfig(st, tokens) {
  const sub = tokens[0];
  const { positionals } = parseArgs(tokens.slice(1));
  if (sub === "list") return configList(st);
  if (sub === "set") return configSet(st, positionals);
  if (sub === "get-value" || sub === "get") return configGet(st, positionals);
  throw new Error(`unknown config command "${sub || ""}" — this trainer knows list, set, get-value`);
}

// ---- projects & services -----------------------------------------------------
function projectsList(st) {
  const rows = [["PROJECT_ID", "NAME", "PROJECT_NUMBER"]];
  for (const p of st.projects) rows.push([p.projectId, p.name, p.projectNumber]);
  return padCols(rows, 2);
}
function cmdProjects(st, tokens) {
  if (tokens[0] === "list") return projectsList(st);
  throw new Error(`unknown projects command "${tokens[0] || ""}" — this trainer knows list`);
}
function servicesList(st, flags) {
  const wantAll = flags.available;
  const items = st.services.filter((s) => wantAll || s.enabled).slice().sort((a, b) => a.name.localeCompare(b.name));
  if (items.length === 0) return "Listed 0 items.";
  const rows = [["NAME", "TITLE"]];
  for (const s of items) rows.push([s.name, s.title]);
  return padCols(rows, 2);
}
function cmdServices(st, tokens) {
  const sub = tokens[0];
  const { positionals, flags } = parseArgs(tokens.slice(1));
  if (sub === "list") return servicesList(st, flags);
  if (sub === "enable") {
    const name = positionals[0];
    if (!name) throw new Error("expected an API name to enable");
    const svc = st.services.find((s) => s.name === name);
    if (!svc) throw new Error(`API [${name}] not recognized`);
    svc.enabled = true;
    return `Operation finished successfully.`;
  }
  if (sub === "disable") {
    const svc = st.services.find((s) => s.name === positionals[0]);
    if (!svc) throw new Error(`API [${positionals[0]}] not recognized`);
    svc.enabled = false;
    return `Operation finished successfully.`;
  }
  throw new Error(`unknown services command "${sub || ""}" — this trainer knows list, enable`);
}

// ---- compute instances -------------------------------------------------------
function resolveInstance(st, name, zoneFlag) {
  const zone = zoneFlag || null;
  const matches = st.instances.filter((i) => i.name === name && (!zone || i.zone === zone));
  if (matches.length === 0) throw new Error(zone ? `The resource 'projects/${st.config.core.project}/zones/${zone}/instances/${name}' was not found` : `No instance named '${name}' found`);
  if (matches.length > 1) throw new Error(`More than one instance named '${name}' — specify --zone`);
  return matches[0];
}
function instancesList(st) {
  const rows = [["NAME", "ZONE", "MACHINE_TYPE", "PREEMPTIBLE", "INTERNAL_IP", "EXTERNAL_IP", "STATUS"]];
  for (const i of st.instances) rows.push([i.name, i.zone, i.machineType, "", i.internalIP, i.externalIP, i.status]);
  return padCols(rows, 2);
}
function instancesDescribe(st, name, zoneFlag) {
  const i = resolveInstance(st, name, zoneFlag);
  const proj = st.config.core.project;
  const base = `https://www.googleapis.com/compute/v1/projects/${proj}`;
  const lines = [
    `machineType: ${base}/zones/${i.zone}/machineTypes/${i.machineType}`,
    `name: ${i.name}`,
    `networkInterfaces:`,
    `- networkIP: ${i.internalIP}`,
  ];
  if (i.externalIP) {
    lines.push(`  accessConfigs:`);
    lines.push(`  - natIP: ${i.externalIP}`);
    lines.push(`    type: ONE_TO_ONE_NAT`);
  }
  lines.push(`status: ${i.status}`);
  lines.push(`zone: ${base}/zones/${i.zone}`);
  return lines.join("\n");
}
function cmdComputeInstances(st, tokens) {
  const sub = tokens[0];
  const { positionals, flags } = parseArgs(tokens.slice(1));
  const name = positionals[0];
  if (sub === "list") return instancesList(st);
  if (sub === "describe") { if (!name) throw new Error("expected an instance name"); return instancesDescribe(st, name, flags.zone); }
  if (sub === "create") {
    if (!name) throw new Error("expected an instance name");
    const zone = flags.zone || st.config.compute.zone;
    if (!zone) throw new Error("a --zone is required (or set compute/zone)");
    if (st.instances.some((i) => i.name === name && i.zone === zone)) throw new Error(`instance '${name}' already exists in ${zone}`);
    const n = st.instances.length + 2;
    st.instances.push({
      name, zone, machineType: flags["machine-type"] || DEFAULT_MACHINE, status: "RUNNING",
      internalIP: `10.128.0.${n}`, externalIP: `34.72.10.${10 + n}`,
    });
    return `Created instance [${name}].`;
  }
  if (sub === "start") { const i = resolveInstance(st, name, flags.zone); i.status = "RUNNING"; if (!i.externalIP) i.externalIP = `34.72.10.${20 + st.instances.length}`; return `Started instance [${name}].`; }
  if (sub === "stop") { const i = resolveInstance(st, name, flags.zone); i.status = "TERMINATED"; i.externalIP = ""; return `Stopped instance [${name}].`; }
  if (sub === "delete") { const i = resolveInstance(st, name, flags.zone); st.instances = st.instances.filter((x) => x !== i); return `Deleted instance [${name}].`; }
  throw new Error(`unknown instances command "${sub || ""}" — this trainer knows list, describe, create, start, stop, delete`);
}
function cmdCompute(st, tokens) {
  if (tokens[0] === "instances") return cmdComputeInstances(st, tokens.slice(1));
  throw new Error(`unknown compute group "${tokens[0] || ""}" — this trainer knows instances`);
}

// ---- storage (gcloud storage + gsutil) ---------------------------------------
const bucketName = (arg) => String(arg).replace(/^gs:\/\//, "").replace(/\/$/, "");
function storageLs(st) {
  if (st.buckets.length === 0) return "";
  return st.buckets.slice().sort((a, b) => a.name.localeCompare(b.name)).map((b) => `gs://${b.name}/`).join("\n");
}
function bucketsCreate(st, arg, location) {
  const name = bucketName(arg);
  if (!name) throw new Error("expected a bucket name like gs://my-bucket");
  if (st.buckets.some((b) => b.name === name)) throw new Error(`bucket gs://${name} already exists`);
  st.buckets.push({ name, location: (location || "US").toUpperCase(), storageClass: "STANDARD" });
  return `Creating gs://${name}/...`;
}
function bucketsDelete(st, arg) {
  const name = bucketName(arg);
  if (!st.buckets.some((b) => b.name === name)) throw new Error(`bucket gs://${name} not found`);
  st.buckets = st.buckets.filter((b) => b.name !== name);
  return `Removing gs://${name}/...`;
}
function cmdStorage(st, tokens) {
  const sub = tokens[0];
  const { positionals, flags } = parseArgs(tokens.slice(1));
  if (sub === "ls") return storageLs(st);
  if (sub === "buckets") {
    const op = tokens[1];
    const { positionals: p2, flags: f2 } = parseArgs(tokens.slice(2));
    if (op === "list") return storageLs(st);
    if (op === "create") return bucketsCreate(st, p2[0], f2.location);
    if (op === "delete") return bucketsDelete(st, p2[0]);
    throw new Error(`unknown buckets command "${op || ""}"`);
  }
  if (sub === "rm") return bucketsDelete(st, positionals[0]);
  throw new Error(`unknown storage command "${sub || ""}" — this trainer knows ls, buckets create/delete/list`);
}
function cmdGsutil(st, tokens) {
  const sub = tokens[0];
  const { positionals, flags } = parseArgs(tokens.slice(1));
  if (sub === "ls") return storageLs(st);
  if (sub === "mb") return bucketsCreate(st, positionals[0], flags.l);
  if (sub === "rb") return bucketsDelete(st, positionals[0]);
  throw new Error(`unknown gsutil command "${sub || ""}" — this trainer knows ls, mb, rb`);
}

// ---- dispatch ----------------------------------------------------------------
function runGcloud(stateIn, cmdline) {
  const st = clone(stateIn);
  try {
    let tokens = String(cmdline).trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) throw new Error("type a gcloud command");
    const cmd = tokens[0];
    const rest = tokens.slice(1);
    if (cmd === "gsutil") return ok(cmdGsutil(st, rest), st);
    if (cmd !== "gcloud") throw new Error(`unknown command "${cmd}" — start with \`gcloud\` (or \`gsutil\`)`);
    const group = rest[0];
    const tail = rest.slice(1);
    if (group === "config") return ok(cmdConfig(st, tail), st);
    if (group === "projects") return ok(cmdProjects(st, tail), st);
    if (group === "services") return ok(cmdServices(st, tail), st);
    if (group === "compute") return ok(cmdCompute(st, tail), st);
    if (group === "storage") return ok(cmdStorage(st, tail), st);
    throw new Error(`unknown group "${group || ""}" — this trainer knows config, projects, services, compute, storage`);
  } catch (e) {
    return { ok: false, err: e && e.message ? e.message : String(e) };
  }
}
function ok(stdout, state) { return { ok: true, stdout: stdout == null ? "" : String(stdout), state }; }

// A structural, comparable view of the state — order-insensitive.
function stateKey(st) {
  return JSON.stringify({
    config: {
      project: st.config.core.project, account: st.config.core.account,
      zone: st.config.compute.zone, region: st.config.compute.region,
    },
    services: st.services.filter((s) => s.enabled).map((s) => s.name).sort(),
    instances: st.instances.map((i) => `${i.name}|${i.zone}|${i.machineType}|${i.status}`).sort(),
    buckets: st.buckets.map((b) => `${b.name}|${b.location}|${b.storageClass}`).sort(),
  });
}
const normOut = (s) => String(s == null ? "" : s).replace(/[ \t]+$/gm, "").replace(/\n+$/, "");

// A human-readable snapshot for the panels: config + VMs + buckets.
function stateView(st) {
  const cfg = runGcloud(st, "gcloud config list");
  const vms = runGcloud(st, "gcloud compute instances list");
  const bkt = runGcloud(st, "gcloud storage ls");
  return [
    `$ gcloud config list\n${cfg.stdout}`,
    `$ gcloud compute instances list\n${vms.stdout || "(no instances)"}`,
    `$ gcloud storage ls\n${bkt.stdout || "(no buckets)"}`,
  ].join("\n\n");
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

function Term({ text, tone }) {
  if (text == null || text === "") return <span className="rx-mlist__empty">(no output — command succeeded)</span>;
  return <pre className={"rx-code gc-term gc-term--" + (tone || "wip")}>{text}</pre>;
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
function GcloudTrainer() {
  const [index, setIndex] = React.useState(0);
  const level = LEVELS[index];

  const [cmds, setCmds] = React.useState(() => Object.fromEntries(LEVELS.map((l) => [l.id, l.starter ?? "gcloud config list"])));
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

  const cmd = cmds[level.id] ?? "";
  const setCmd = (val) => setCmds((p) => ({ ...p, [level.id]: val }));

  const markSolved = React.useCallback((id) => {
    setSolved((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev); next.add(id);
      try { localStorage.setItem(STORE_SOLVED, JSON.stringify([...next])); } catch {}
      return next;
    });
  }, []);

  const startState = level.state || BASE_STATE;
  const goal = React.useMemo(() => runGcloud(startState, level.solution), [level]);
  const result = React.useMemo(() => runGcloud(startState, cmd), [cmd, startState]);
  const isState = level.check === "state";

  const passedNow = result.ok && goal.ok && (
    isState ? stateKey(result.state) === stateKey(goal.state)
            : normOut(result.stdout) === normOut(goal.stdout)
  );

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
            <span className="rx-brand__tile">gcp</span>
            <span className="rx-brand__name">~/lab/<b>gcloud</b></span>
          </a>
          <div className="rx-top__spacer" />
          <a className="rx-back" href="../../">← aktasfatih.com</a>
          <ThemeToggle value={theme} onChange={setTheme} />
        </div>
      </header>

      <main className="rx-main">
        <div className="rx-head">
          <div>
            <h1 className="rx-title">Learn <span className="ac">gcloud</span> by doing</h1>
            <p className="rx-lede">
              gcloud is the command line for Google Cloud — you point it at a project, then spin up VMs,
              buckets, and services. Type a real <code>gcloud</code> or <code>gsutil</code> command and watch
              a simulated project respond, right in your browser. Match the goal to clear each level.
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

        {/* command bar */}
        <div className={"rx-filter gc-filter" + (passedNow ? " is-pass" : "") + (!result.ok ? " is-err" : "")}>
          <div className="gc-inputrow">
            <span className="gc-prompt" aria-hidden="true">$</span>
            <input
              ref={inputRef}
              className="rx-filter__input gc-input"
              value={cmd}
              onChange={(e) => setCmd(e.target.value)}
              spellCheck="false" autoComplete="off" autoCapitalize="off"
              aria-label="gcloud command"
              placeholder="gcloud config list"
            />
            <span className="rx-filter__live" aria-hidden="true">{isState ? "state" : "live"}</span>
          </div>
        </div>

        <div className="rx-work">
          <Panel
            title="output"
            grow
            tone={!result.ok ? "err" : passedNow ? "ok" : "dark"}
            right={
              !result.ok ? <span className="rx-flag rx-flag--err">error</span>
              : passedNow ? <span className="rx-flag rx-flag--ok">✓ match</span>
              : <span className="rx-flag">keep going</span>
            }
          >
            {result.ok
              ? <Term text={result.stdout} tone={tone} />
              : <pre className="rx-code rx-code--err">ERROR: {result.err}</pre>}
          </Panel>
          <div className="rx-col">
            <Panel title={isState ? "project (after your command)" : "project"}
              tone={isState && passedNow ? "ok" : "dark"}>
              {result.ok
                ? <Term text={stateView(result.state)} tone={isState ? tone : "wip"} />
                : <Term text={stateView(startState)} tone="wip" />}
            </Panel>
            <Panel title={isState ? "goal — project should look like" : "goal — expected output"}>
              {goal.ok
                ? <Term text={isState ? stateView(goal.state) : goal.stdout} tone="goal" />
                : <span className="rx-mlist__empty">…</span>}
            </Panel>
          </div>
        </div>

        <div className="rx-controls">
          <div className="rx-controls__left">
            <Button variant="ghost" size="sm" onClick={() => setShowHint((v) => !v)}>💡 Hint</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowAnswer((v) => !v)}>{showAnswer ? "Hide answer" : "Show answer"}</Button>
            <Button variant="ghost" size="sm" onClick={() => { setCmd(level.starter ?? "gcloud config list"); inputRef.current && inputRef.current.focus(); }}>Reset</Button>
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
                <button className="rx-use" onClick={() => { setCmd(level.solution); inputRef.current && inputRef.current.focus(); }}>use it →</button>
              </p>
            )}
          </div>
        )}

        <LevelRail levels={LEVELS} solved={solved} index={index} onJump={go} />

        <footer className="rx-foot">
          <span>a simulated project runs in your browser — no cloud bill · progress saved locally</span>
          <button className="rx-reset-all" onClick={() => { setSolved(new Set()); try { localStorage.removeItem(STORE_SOLVED); } catch {} }}>reset progress</button>
        </footer>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<GcloudTrainer />);

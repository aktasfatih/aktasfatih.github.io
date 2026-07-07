// game.jsx — the interactive ZFS trainer. A small storage simulator runs in the
// browser, so learners type REAL zpool / zfs commands and see genuine output as
// pools, vdevs, datasets, and snapshots respond. Each level carries a reference
// solution; the goal is what that solution produces (its output for read
// commands, or the resulting storage for mutations), and your command passes
// when it reaches the same place. There's usually more than one way.
const { Button, Tag, ThemeToggle } = window.FatihAktasDesignSystem_e4dcbf;
const LEVELS = window.ZFS_LEVELS;
const BASE_STORAGE = window.ZFS_STORAGE;
const STORE_SOLVED = "zfs-trainer:solved";
const STORE_THEME = "zfs-trainer:theme";

// ---- storage engine ----------------------------------------------------------
// runZfs(storage, cmdline) interprets a curated subset of zpool / zfs against a
// (deep-cloned) copy of the storage and returns { ok, stdout, storage } — or
// { ok:false, err } on a command it can't parse. The input is never mutated, so
// the same fixture drives both the learner's command and the goal.
const clone = (s) => JSON.parse(JSON.stringify(s));

const PROP_DEFAULTS = {
  compression: "off", atime: "on", quota: "none", recordsize: "128K",
  dedup: "off", readonly: "off", exec: "on", sharenfs: "off", canmount: "on",
};

// zpool list SIZE counts raw disks; a mirror shows one disk's worth, a raidz
// shows every disk. ~4.97G usable per 5G disk (matching the fixture).
const perDisk = 4.97;
const fmtG = (v) => (v < 10 ? v.toFixed(2) : v.toFixed(1)) + "G";
function rawDisks(vdevs) {
  return vdevs.reduce((n, v) => n + (v.type === "raidz" ? v.disks.length : 1), 0);
}
function usableDisks(vdevs) {
  return vdevs.reduce((n, v) => n + (v.type === "raidz" ? v.disks.length - 1 : 1), 0);
}

function parentOf(name) {
  const i = name.lastIndexOf("/");
  return i < 0 ? null : name.slice(0, i);
}
const findDataset = (st, name) => st.datasets.find((d) => d.name === name);
const findPool = (st, name) => st.pools.find((p) => p.name === name);

// walk ancestors to resolve a property and where it comes from
function effectiveProp(st, dsName, prop) {
  if (prop === "mountpoint") {
    const ds = findDataset(st, dsName);
    if (ds && ds.local.mountpoint) return { value: ds.local.mountpoint, source: "local" };
    return { value: (ds && ds.mountpoint) || "/" + dsName, source: "default" };
  }
  let node = dsName;
  while (node) {
    const ds = findDataset(st, node);
    if (ds && ds.local && ds.local[prop] !== undefined)
      return { value: ds.local[prop], source: node === dsName ? "local" : "inherited from " + node };
    node = parentOf(node);
  }
  if (PROP_DEFAULTS[prop] !== undefined) return { value: PROP_DEFAULTS[prop], source: "default" };
  return { value: "-", source: "-" };
}

// ---- vdev spec parsing (mirror sda sdb  |  raidz sdc sdd sde  |  bare disks) --
const REDUNDANCY = { mirror: "mirror", raidz: "raidz", raidz1: "raidz", raidz2: "raidz" };
function parseVdevs(tokens) {
  const vdevs = [];
  let i = 0;
  while (i < tokens.length) {
    const t = tokens[i];
    if (REDUNDANCY[t]) {
      const disks = [];
      i++;
      while (i < tokens.length && !REDUNDANCY[tokens[i]]) disks.push(tokens[i++]);
      if (disks.length < 2) throw new Error(`${t} requires at least 2 devices`);
      vdevs.push({ type: REDUNDANCY[t], disks, state: "ONLINE" });
    } else {
      vdevs.push({ type: "disk", disks: [t], state: "ONLINE" });
      i++;
    }
  }
  if (vdevs.length === 0) throw new Error("no vdevs specified");
  return vdevs;
}
function claimDisks(st, vdevs) {
  const want = [].concat(...vdevs.map((v) => v.disks));
  for (const d of want) {
    if (!st.freeDisks.includes(d)) throw new Error(`cannot open '${d}': no such unused device`);
  }
  st.freeDisks = st.freeDisks.filter((d) => !want.includes(d));
}

// ---- table rendering ---------------------------------------------------------
function padCols(rows, gap) {
  if (rows.length === 0) return "";
  const w = rows[0].map((_, c) => Math.max(...rows.map((r) => String(r[c] ?? "").length)));
  const sep = " ".repeat(gap || 2);
  return rows.map((r) => r.map((cell, c) => String(cell ?? "").padEnd(c === r.length - 1 ? 0 : w[c])).join(sep)).join("\n");
}

// ---- zpool -------------------------------------------------------------------
function zpoolList(st) {
  if (st.pools.length === 0) return "no pools available";
  const rows = [["NAME", "SIZE", "ALLOC", "FREE", "FRAG", "CAP", "DEDUP", "HEALTH", "ALTROOT"]];
  for (const p of st.pools) rows.push([p.name, p.size, p.alloc, p.free, p.frag, p.cap, p.dedup, p.health, "-"]);
  return padCols(rows, 2);
}

function zpoolStatus(st, name) {
  const pools = name ? st.pools.filter((p) => p.name === name) : st.pools;
  if (pools.length === 0) throw new Error(name ? `cannot open '${name}': no such pool` : "no pools available");
  return pools.map((p) => {
    // build the device rows, then align the NAME column
    const dev = [["NAME", "STATE", "READ", "WRITE", "CKSUM"]];
    dev.push([p.name, p.health, "0", "0", "0"]);
    const counter = { mirror: 0, raidz: 0 };
    for (const v of p.vdevs) {
      if (v.type === "disk") {
        dev.push(["  " + v.disks[0], v.state, "0", "0", "0"]);
      } else {
        const label = `${v.type === "raidz" ? "raidz1" : "mirror"}-${counter[v.type]++}`;
        dev.push(["  " + label, v.state, "0", "0", "0"]);
        for (const d of v.disks) dev.push(["    " + d, "ONLINE", "0", "0", "0"]);
      }
    }
    const w = Math.max(...dev.map((r) => r[0].length));
    const body = dev.map((r) =>
      `\t${r[0].padEnd(w)}  ${r[1].padEnd(8)}${r[2].padStart(4)}${r[3].padStart(6)}${r[4].padStart(6)}`
    ).join("\n");
    return [
      `  pool: ${p.name}`,
      ` state: ${p.health}`,
      `  scan: ${p.scan}`,
      `config:`,
      ``,
      body,
      ``,
      `errors: No known data errors`,
    ].join("\n");
  }).join("\n\n");
}

function zpoolCreate(st, tokens) {
  const name = tokens[0];
  if (!name) throw new Error("missing pool name");
  if (findPool(st, name)) throw new Error(`pool '${name}' already exists`);
  if (name.indexOf("/") >= 0) throw new Error(`invalid pool name '${name}'`);
  const vdevs = parseVdevs(tokens.slice(1));
  claimDisks(st, vdevs);
  const size = fmtG(rawDisks(vdevs) * perDisk);
  const avail = fmtG(usableDisks(vdevs) * perDisk);
  st.pools.push({ name, health: "ONLINE", scan: "none requested", size, alloc: "150K", free: size, frag: "0%", cap: "0%", dedup: "1.00x", vdevs });
  st.datasets.push({ name, type: "filesystem", used: "150K", avail, refer: "24K", mountpoint: "/" + name, local: {} });
  return ``; // zpool create is silent on success
}

function zpoolAdd(st, tokens) {
  const name = tokens[0];
  const pool = findPool(st, name);
  if (!pool) throw new Error(`cannot open '${name}': no such pool`);
  const vdevs = parseVdevs(tokens.slice(1));
  claimDisks(st, vdevs);
  pool.vdevs = pool.vdevs.concat(vdevs);
  const size = fmtG(rawDisks(pool.vdevs) * perDisk);
  pool.size = size; pool.free = size;
  return ``;
}

function zpoolDestroy(st, tokens) {
  const name = tokens[0];
  const pool = findPool(st, name);
  if (!pool) throw new Error(`cannot open '${name}': no such pool`);
  const disks = [].concat(...pool.vdevs.map((v) => v.disks));
  st.freeDisks = st.freeDisks.concat(disks).sort();
  st.pools = st.pools.filter((p) => p.name !== name);
  st.datasets = st.datasets.filter((d) => d.name !== name && parentChain(d.name).indexOf(name) < 0);
  st.snapshots = st.snapshots.filter((s) => s.name.split("@")[0] !== name && parentChain(s.name.split("@")[0]).indexOf(name) < 0);
  return ``;
}
const parentChain = (name) => { const out = []; let n = name; while (n) { out.push(n); n = parentOf(n); } return out; };

function cmdZpool(st, tokens) {
  const sub = tokens[0];
  const rest = tokens.slice(1).filter((t) => t[0] !== "-"); // ignore -H / -o for the trainer
  if (sub === "list") return zpoolList(st);
  if (sub === "status") return zpoolStatus(st, rest[0]);
  if (sub === "create") return zpoolCreate(st, rest);
  if (sub === "add") return zpoolAdd(st, rest);
  if (sub === "destroy") return zpoolDestroy(st, rest);
  throw new Error(`unknown zpool subcommand "${sub || ""}" — this trainer knows list, status, create, add, destroy`);
}

// ---- zfs ---------------------------------------------------------------------
function isDescendant(name, root) { return name === root || name.indexOf(root + "/") === 0; }

function zfsList(st, tokens) {
  let type = "filesystem", recursive = false, target = null;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === "-t") type = tokens[++i];
    else if (t.indexOf("-t=") === 0) type = t.slice(3);
    else if (t === "-r") recursive = true;
    else if (t === "-H") { /* scripting mode — ignored */ }
    else if (t[0] === "-") throw new Error(`invalid option '${t}'`);
    else target = t;
  }
  const wantFs = type === "filesystem" || type === "all" || type === "volume";
  const wantSnap = type === "snapshot" || type === "all";
  const rows = [["NAME", "USED", "AVAIL", "REFER", "MOUNTPOINT"]];
  if (wantFs) {
    let ds = st.datasets.slice();
    if (target) ds = ds.filter((d) => recursive ? isDescendant(d.name, target) : d.name === target);
    ds.sort((a, b) => a.name.localeCompare(b.name));
    for (const d of ds) rows.push([d.name, d.used, d.avail, d.refer, d.local.mountpoint || d.mountpoint]);
  }
  if (wantSnap) {
    let sn = st.snapshots.slice();
    if (target) sn = sn.filter((s) => isDescendant(s.name.split("@")[0], target));
    sn.sort((a, b) => a.name.localeCompare(b.name));
    for (const s of sn) rows.push([s.name, s.used, "-", s.refer, "-"]);
  }
  if (rows.length === 1) throw new Error("no datasets available");
  return padCols(rows, 2);
}

function zfsCreate(st, tokens) {
  const name = tokens.find((t) => t[0] !== "-");
  if (!name) throw new Error("missing dataset name");
  if (name.indexOf("/") < 0) throw new Error(`cannot create '${name}': use 'zpool create' to make a pool`);
  if (findDataset(st, name)) throw new Error(`cannot create '${name}': dataset already exists`);
  const parent = parentOf(name);
  if (!findDataset(st, parent)) throw new Error(`cannot create '${name}': parent does not exist`);
  const p = findDataset(st, parent);
  st.datasets.push({ name, type: "filesystem", used: "24K", avail: p.avail, refer: "24K", mountpoint: "/" + name, local: {} });
  return ``;
}

function zfsSet(st, tokens) {
  const args = tokens.filter((t) => t[0] !== "-");
  const pair = args[0] || "", name = args[1];
  const eq = pair.indexOf("=");
  if (eq < 0 || !name) throw new Error("expected <property>=<value> <dataset>");
  const prop = pair.slice(0, eq), value = pair.slice(eq + 1);
  const ds = findDataset(st, name);
  if (!ds) throw new Error(`cannot open '${name}': dataset does not exist`);
  ds.local[prop] = value;
  if (prop === "mountpoint") ds.mountpoint = value;
  return ``;
}

function zfsGet(st, tokens) {
  const args = tokens.filter((t) => t[0] !== "-");
  const prop = args[0], name = args[1];
  if (!prop || !name) throw new Error("expected <property> <dataset>");
  const ds = findDataset(st, name);
  if (!ds) throw new Error(`cannot open '${name}': dataset does not exist`);
  const props = prop === "all" ? Object.keys(PROP_DEFAULTS).sort() : [prop];
  const rows = [["NAME", "PROPERTY", "VALUE", "SOURCE"]];
  for (const pr of props) { const e = effectiveProp(st, name, pr); rows.push([name, pr, e.value, e.source]); }
  return padCols(rows, 2);
}

function zfsSnapshot(st, tokens) {
  const name = tokens.find((t) => t[0] !== "-");
  if (!name || name.indexOf("@") < 0) throw new Error("snapshot name must be <dataset>@<name>");
  const dsName = name.split("@")[0];
  const ds = findDataset(st, dsName);
  if (!ds) throw new Error(`cannot open '${dsName}': dataset does not exist`);
  if (st.snapshots.some((s) => s.name === name)) throw new Error(`snapshot '${name}' already exists`);
  st.snapshots.push({ name, used: "0B", refer: ds.refer });
  return ``;
}

function zfsDestroy(st, tokens) {
  const name = tokens.find((t) => t[0] !== "-");
  if (!name) throw new Error("missing dataset or snapshot name");
  if (name.indexOf("@") >= 0) {
    if (!st.snapshots.some((s) => s.name === name)) throw new Error(`could not find any snapshots to destroy; check snapshot names`);
    st.snapshots = st.snapshots.filter((s) => s.name !== name);
    return ``;
  }
  const ds = findDataset(st, name);
  if (!ds) throw new Error(`cannot open '${name}': dataset does not exist`);
  if (st.datasets.some((d) => d.name !== name && isDescendant(d.name, name)))
    throw new Error(`cannot destroy '${name}': filesystem has children\nuse '-r' to destroy the following datasets and snapshots`);
  st.datasets = st.datasets.filter((d) => d.name !== name);
  st.snapshots = st.snapshots.filter((s) => s.name.split("@")[0] !== name);
  return ``;
}

function cmdZfs(st, tokens) {
  const sub = tokens[0];
  const rest = tokens.slice(1);
  if (sub === "list") return zfsList(st, rest);
  if (sub === "create") return zfsCreate(st, rest);
  if (sub === "set") return zfsSet(st, rest);
  if (sub === "get") return zfsGet(st, rest);
  if (sub === "snapshot" || sub === "snap") return zfsSnapshot(st, rest);
  if (sub === "destroy") return zfsDestroy(st, rest);
  throw new Error(`unknown zfs subcommand "${sub || ""}" — this trainer knows list, create, set, get, snapshot, destroy`);
}

// ---- dispatch ----------------------------------------------------------------
function runZfs(storageIn, cmdline) {
  const st = clone(storageIn);
  try {
    let tokens = String(cmdline).trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) throw new Error("type a zpool or zfs command");
    if (tokens[0] === "sudo") tokens = tokens.slice(1);
    const cmd = tokens[0];
    const rest = tokens.slice(1);
    if (cmd === "zpool") return ok(cmdZpool(st, rest), st);
    if (cmd === "zfs") return ok(cmdZfs(st, rest), st);
    throw new Error(`unknown command "${cmd}" — start with \`zpool\` or \`zfs\``);
  } catch (e) {
    return { ok: false, err: e && e.message ? e.message : String(e) };
  }
}
function ok(stdout, storage) { return { ok: true, stdout: stdout == null ? "" : String(stdout), storage }; }

// A structural, comparable view of the storage — order-insensitive, and blind to
// the volatile size columns so state checks are about layout and properties.
function storageKey(st) {
  const pools = st.pools.map((p) => ({
    name: p.name, health: p.health,
    vdevs: p.vdevs.map((v) => ({ type: v.type, disks: v.disks.slice().sort() })).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
  })).sort((a, b) => a.name.localeCompare(b.name));
  const datasets = st.datasets.map((d) => ({
    name: d.name, mountpoint: d.local.mountpoint || d.mountpoint,
    local: Object.keys(d.local).sort().map((k) => k + "=" + d.local[k]),
  })).sort((a, b) => a.name.localeCompare(b.name));
  const snapshots = st.snapshots.map((s) => s.name).sort();
  const freeDisks = st.freeDisks.slice().sort();
  return JSON.stringify({ pools, datasets, snapshots, freeDisks });
}
const normOut = (s) => String(s == null ? "" : s).replace(/[ \t]+$/gm, "").replace(/\n+$/, "");

// A human-readable snapshot of the storage — pools over datasets, for the panels.
function storageView(st) {
  const pools = runZfs(st, "zpool list");
  const ds = runZfs(st, "zfs list -t all");
  return `# zpool list\n${pools.stdout}\n\n# zfs list -t all\n${ds.ok ? ds.stdout : "no datasets"}`;
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
  if (text == null || text === "") return <span className="rx-mlist__empty">(no output — command succeeded silently)</span>;
  return <pre className={"rx-code zf-term zf-term--" + (tone || "wip")}>{text}</pre>;
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
function ZfsTrainer() {
  const [index, setIndex] = React.useState(0);
  const level = LEVELS[index];

  const [cmds, setCmds] = React.useState(() => Object.fromEntries(LEVELS.map((l) => [l.id, l.starter ?? "zpool list"])));
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

  const startStorage = level.storage || BASE_STORAGE;
  const goal = React.useMemo(() => runZfs(startStorage, level.solution), [level]);
  const result = React.useMemo(() => runZfs(startStorage, cmd), [cmd, startStorage]);
  const isState = level.check === "state";

  const passedNow = result.ok && goal.ok && (
    isState ? storageKey(result.storage) === storageKey(goal.storage)
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
            <span className="rx-brand__tile">zfs</span>
            <span className="rx-brand__name">~/lab/<b>zfs</b></span>
          </a>
          <div className="rx-top__spacer" />
          <a className="rx-back" href="../../">← aktasfatih.com</a>
          <ThemeToggle value={theme} onChange={setTheme} />
        </div>
      </header>

      <main className="rx-main">
        <div className="rx-head">
          <div>
            <h1 className="rx-title">Learn <span className="ac">ZFS</span> by doing</h1>
            <p className="rx-lede">
              ZFS is a filesystem and volume manager in one — you build pools out of disks, then carve
              datasets and snapshots out of the pools. Type a real <code>zpool</code> or <code>zfs</code>{" "}
              command and watch a simulated storage system respond, right in your browser. Match the goal to
              clear each level.
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
        <div className={"rx-filter zf-filter" + (passedNow ? " is-pass" : "") + (!result.ok ? " is-err" : "")}>
          <div className="zf-inputrow">
            <span className="zf-prompt" aria-hidden="true">#</span>
            <input
              ref={inputRef}
              className="rx-filter__input zf-input"
              value={cmd}
              onChange={(e) => setCmd(e.target.value)}
              spellCheck="false" autoComplete="off" autoCapitalize="off"
              aria-label="zfs command"
              placeholder="zpool list"
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
              : <pre className="rx-code rx-code--err">{result.err}</pre>}
          </Panel>
          <div className="rx-col">
            <Panel title={isState ? "storage (after your command)" : "storage"}
              tone={isState && passedNow ? "ok" : "dark"}>
              {result.ok
                ? <Term text={storageView(result.storage)} tone={isState ? tone : "wip"} />
                : <Term text={storageView(startStorage)} tone="wip" />}
            </Panel>
            <Panel title={isState ? "goal — storage should look like" : "goal — expected output"}>
              {goal.ok
                ? <Term text={isState ? storageView(goal.storage) : goal.stdout} tone="goal" />
                : <span className="rx-mlist__empty">…</span>}
            </Panel>
          </div>
        </div>

        <div className="rx-controls">
          <div className="rx-controls__left">
            <Button variant="ghost" size="sm" onClick={() => setShowHint((v) => !v)}>💡 Hint</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowAnswer((v) => !v)}>{showAnswer ? "Hide answer" : "Show answer"}</Button>
            <Button variant="ghost" size="sm" onClick={() => { setCmd(level.starter ?? "zpool list"); inputRef.current && inputRef.current.focus(); }}>Reset</Button>
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
          <span>a simulated pool runs in your browser — no disks harmed · progress saved locally</span>
          <button className="rx-reset-all" onClick={() => { setSolved(new Set()); try { localStorage.removeItem(STORE_SOLVED); } catch {} }}>reset progress</button>
        </footer>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<ZfsTrainer />);

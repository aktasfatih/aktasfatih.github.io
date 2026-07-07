// game.jsx — the interactive kubectl trainer. A small Kubernetes cluster
// simulator runs in the browser, so learners type REAL kubectl commands and see
// genuine output as pods, deployments, and services respond. Each level carries
// a reference solution; the goal is what that solution produces (its output for
// read commands, or the resulting cluster for mutations), and your command
// passes when it reaches the same place. There's usually more than one way.
const { Button, Tag, ThemeToggle } = window.FatihAktasDesignSystem_e4dcbf;
const LEVELS = window.KUBECTL_LEVELS;
const BASE_CLUSTER = window.KUBECTL_CLUSTER;
const SUFFIXES = window.KUBECTL_SUFFIXES;
const STORE_SOLVED = "kubectl-trainer:solved";
const STORE_THEME = "kubectl-trainer:theme";

// ---- cluster engine ----------------------------------------------------------
// runKubectl(cluster, cmdline) interprets a curated subset of kubectl against a
// (deep-cloned) copy of the cluster and returns { ok, stdout, cluster } — or
// { ok:false, err } on a command it can't parse. The input cluster is never
// mutated, so the same fixture drives both the learner's command and the goal.
const clone = (c) => JSON.parse(JSON.stringify(c));

const TYPE_ALIASES = {
  po: "pods", pod: "pods", pods: "pods",
  deploy: "deployments", deployment: "deployments", deployments: "deployments",
  svc: "services", service: "services", services: "services",
  ns: "namespaces", namespace: "namespaces", namespaces: "namespaces",
  no: "nodes", node: "nodes", nodes: "nodes",
};
const TYPE_SINGULAR = { pods: "pod", deployments: "deployment", services: "service", namespaces: "namespace", nodes: "node" };
function normType(t) { return TYPE_ALIASES[t] || null; }

// Split a "deployment/web" style target into [type, name]; a bare word is a name.
function splitSlash(tok) {
  if (tok.indexOf("/") >= 0) { const [t, n] = tok.split("/"); return [t, n]; }
  return [null, tok];
}

// Pull flags out of a token list. Returns { positionals, flags }.
function parseArgs(tokens) {
  const positionals = [];
  const flags = { namespace: null, allNs: false, output: null, selector: null,
    showLabels: false, replicas: null, image: null, overwrite: false };
  for (let i = 0; i < tokens.length; i++) {
    let tok = tokens[i];
    const eat = () => tokens[++i]; // consume the next token as this flag's value
    const inline = (tok.indexOf("=") >= 0) ? tok.slice(tok.indexOf("=") + 1) : null;
    const bare = inline !== null ? tok.slice(0, tok.indexOf("=")) : tok;
    if (bare === "-n" || bare === "--namespace") { flags.namespace = inline !== null ? inline : eat(); }
    else if (bare === "-A" || bare === "--all-namespaces") { flags.allNs = true; }
    else if (bare === "-o" || bare === "--output") { flags.output = inline !== null ? inline : eat(); }
    else if (bare === "-l" || bare === "--selector") { flags.selector = inline !== null ? inline : eat(); }
    else if (bare === "--show-labels") { flags.showLabels = true; }
    else if (bare === "--replicas") { flags.replicas = inline !== null ? inline : eat(); }
    else if (bare === "--image") { flags.image = inline !== null ? inline : eat(); }
    else if (bare === "--overwrite") { flags.overwrite = true; }
    else if (tok[0] === "-") { throw new Error(`unknown flag "${tok}"`); }
    else { positionals.push(tok); }
  }
  return { positionals, flags };
}

// Parse a "app=web,tier=frontend" selector into an array of {k,v}.
function parseSelector(sel) {
  return sel.split(",").filter(Boolean).map((pair) => {
    const i = pair.indexOf("=");
    if (i < 0) throw new Error(`bad selector "${pair}"`);
    return { k: pair.slice(0, i), v: pair.slice(i + 1) };
  });
}
function matchesSelector(obj, sel) {
  return sel.every(({ k, v }) => (obj.labels || {})[k] === v);
}

// ---- table rendering ---------------------------------------------------------
function padCols(rows) {
  if (rows.length === 0) return "";
  const w = rows[0].map((_, c) => Math.max(...rows.map((r) => String(r[c] ?? "").length)));
  return rows.map((r) => r.map((cell, c) => String(cell ?? "").padEnd(c === r.length - 1 ? 0 : w[c])).join("   ")).join("\n");
}
const labelStr = (labels) => {
  const keys = Object.keys(labels || {});
  return keys.length ? keys.map((k) => `${k}=${labels[k]}`).join(",") : "<none>";
};

// ---- get ---------------------------------------------------------------------
function cmdGet(cluster, positionals, flags) {
  if (positionals.length === 0) throw new Error("you must specify the type of resource to get");
  const [slashType, name0] = splitSlash(positionals[0]);
  const type = normType(slashType || positionals[0]);
  if (!type) throw new Error(`the server doesn't have a resource type "${positionals[0]}"`);
  const name = slashType ? name0 : positionals[1] || null;

  let items = (cluster[type] || []).slice();
  // namespace scoping (nodes and namespaces are cluster-scoped)
  const scoped = type !== "nodes" && type !== "namespaces";
  if (scoped && !flags.allNs) {
    const ns = flags.namespace || cluster.currentNs;
    items = items.filter((o) => o.namespace === ns);
  }
  if (name) items = items.filter((o) => o.name === name);
  if (flags.selector) { const sel = parseSelector(flags.selector); items = items.filter((o) => matchesSelector(o, sel)); }

  if (flags.output === "name") {
    if (items.length === 0) return getEmpty(cluster, type, flags);
    return items.map((o) => `${TYPE_SINGULAR[type]}/${o.name}`).join("\n");
  }
  if (items.length === 0) return getEmpty(cluster, type, flags);

  const wide = flags.output === "wide";
  const nsCol = flags.allNs && scoped;
  let header, rowOf;
  if (type === "pods") {
    header = ["NAME", "READY", "STATUS", "RESTARTS", "AGE"];
    if (wide) header = header.concat(["IP", "NODE"]);
    rowOf = (p) => {
      let r = [p.name, p.ready ? "1/1" : "0/1", p.status, String(p.restarts), p.age];
      if (wide) r = r.concat([p.ip, p.node]);
      return r;
    };
  } else if (type === "deployments") {
    header = ["NAME", "READY", "UP-TO-DATE", "AVAILABLE", "AGE"];
    if (wide) header = header.concat(["CONTAINERS", "IMAGES", "SELECTOR"]);
    rowOf = (d) => {
      const ready = readyCount(cluster, d);
      let r = [d.name, `${ready}/${d.replicas}`, String(d.replicas), String(ready), d.age];
      if (wide) r = r.concat([d.container, d.image, labelStr(d.labels)]);
      return r;
    };
  } else if (type === "services") {
    header = ["NAME", "TYPE", "CLUSTER-IP", "EXTERNAL-IP", "PORT(S)", "AGE"];
    if (wide) header = header.concat(["SELECTOR"]);
    rowOf = (s) => {
      let r = [s.name, s.type, s.clusterIP, s.externalIP, s.ports, s.age];
      if (wide) r = r.concat([labelStr(s.selector)]);
      return r;
    };
  } else if (type === "nodes") {
    header = ["NAME", "STATUS", "ROLES", "AGE", "VERSION"];
    rowOf = (n) => [n.name, n.status, n.roles, n.age, n.version];
  } else { // namespaces
    header = ["NAME", "STATUS", "AGE"];
    rowOf = (n) => [n.name, n.status, n.age];
  }
  if (nsCol) header = ["NAMESPACE"].concat(header);
  if (flags.showLabels) header = header.concat(["LABELS"]);

  const rows = [header];
  for (const o of items) {
    let r = rowOf(o);
    if (nsCol) r = [o.namespace].concat(r);
    if (flags.showLabels) r = r.concat([labelStr(o.labels)]);
    rows.push(r);
  }
  return padCols(rows);
}
function getEmpty(cluster, type, flags) {
  if (flags.allNs || type === "nodes" || type === "namespaces") return `No resources found`;
  const ns = flags.namespace || cluster.currentNs;
  return `No resources found in ${ns} namespace.`;
}

// how many of a deployment's pods are Running & ready right now
function readyCount(cluster, dep) {
  return cluster.pods.filter((p) => p.namespace === dep.namespace && p.owner === dep.name && p.ready && p.status === "Running").length;
}

// ---- describe ----------------------------------------------------------------
function cmdDescribe(cluster, positionals, flags) {
  const [slashType, name0] = splitSlash(positionals[0] || "");
  const type = normType(slashType || positionals[0]);
  if (!type) throw new Error(`the server doesn't have a resource type "${positionals[0] || ""}"`);
  const name = slashType ? name0 : positionals[1];
  if (!name) throw new Error("you must specify a resource name");
  const ns = flags.namespace || cluster.currentNs;
  if (type === "pods") {
    const p = cluster.pods.find((o) => o.name === name && o.namespace === ns);
    if (!p) throw new Error(`pods "${name}" not found`);
    return [
      `Name:         ${p.name}`,
      `Namespace:    ${p.namespace}`,
      `Node:         ${p.node}`,
      `Labels:       ${labelStr(p.labels)}`,
      `Status:       ${p.status}`,
      `IP:           ${p.ip}`,
      `Controlled By: ${p.owner ? `Deployment/${p.owner}` : "<none>"}`,
      `Containers:`,
      `  ${p.owner || "main"}:`,
      `    Image:      ${p.image}`,
      `    Restarts:   ${p.restarts}`,
    ].join("\n");
  }
  if (type === "deployments") {
    const d = cluster.deployments.find((o) => o.name === name && o.namespace === ns);
    if (!d) throw new Error(`deployments.apps "${name}" not found`);
    const ready = readyCount(cluster, d);
    return [
      `Name:               ${d.name}`,
      `Namespace:          ${d.namespace}`,
      `Labels:             ${labelStr(d.labels)}`,
      `Selector:           ${labelStr(d.labels)}`,
      `Replicas:           ${d.replicas} desired | ${d.replicas} updated | ${d.replicas} total | ${ready} available`,
      `Pod Template:`,
      `  Labels:  ${labelStr(d.podLabels)}`,
      `  Containers:`,
      `   ${d.container}:`,
      `    Image:  ${d.image}`,
    ].join("\n");
  }
  throw new Error(`describe for "${type}" isn't supported in this trainer`);
}

// ---- mutations ---------------------------------------------------------------
function findDeploy(cluster, target) {
  const [, name] = splitSlash(target);
  const d = cluster.deployments.find((o) => o.name === name && o.namespace === cluster.currentNs);
  if (!d) throw new Error(`deployments.apps "${name}" not found`);
  return d;
}
function makePod(cluster, dep, index) {
  return {
    name: `${dep.name}-${dep.podHash}-${SUFFIXES[index] || "x" + index}`,
    namespace: dep.namespace, owner: dep.name, image: dep.image,
    status: "Running", ready: true, restarts: 0, age: "0s",
    node: cluster.nodes[index % cluster.nodes.length].name, ip: `10.244.${(index % 2) + 1}.${40 + index}`,
    labels: Object.assign({}, dep.podLabels),
  };
}
function ownedPods(cluster, dep) {
  return cluster.pods.filter((p) => p.namespace === dep.namespace && p.owner === dep.name);
}

function cmdScale(cluster, positionals, flags) {
  // forms: scale deployment web --replicas=N  |  scale deployment/web --replicas=N
  const target = positionals.find((t) => normType(splitSlash(t)[0]) === "deployments") || positionals[1];
  const dep = findDeploy(cluster, target);
  if (flags.replicas === null) throw new Error("you must specify --replicas");
  const n = parseInt(flags.replicas, 10);
  if (!(n >= 0)) throw new Error(`invalid replicas "${flags.replicas}"`);
  const owned = ownedPods(cluster, dep);
  if (owned.length < n) {
    for (let i = owned.length; i < n; i++) cluster.pods.push(makePod(cluster, dep, i));
  } else if (owned.length > n) {
    const remove = new Set(owned.slice(n));
    cluster.pods = cluster.pods.filter((p) => !remove.has(p));
  }
  dep.replicas = n;
  return `deployment.apps/${dep.name} scaled`;
}

function cmdSetImage(cluster, positionals, flags) {
  // set image deployment/web nginx=nginx:1.27
  if (positionals[0] !== "image") throw new Error(`unknown set subcommand "${positionals[0] || ""}"`);
  const dep = findDeploy(cluster, positionals[1]);
  const pair = positionals[2] || "";
  const eq = pair.indexOf("=");
  if (eq < 0) throw new Error("expected <container>=<image>");
  const container = pair.slice(0, eq), image = pair.slice(eq + 1);
  if (container !== dep.container) throw new Error(`deployment "${dep.name}" has no container "${container}"`);
  dep.image = image;
  ownedPods(cluster, dep).forEach((p) => { p.image = image; p.age = "0s"; p.restarts = 0; });
  return `deployment.apps/${dep.name} image updated`;
}

function cmdRollout(cluster, positionals, flags) {
  const sub = positionals[0];
  const dep = findDeploy(cluster, positionals[1]);
  if (sub === "restart") {
    ownedPods(cluster, dep).forEach((p) => { p.age = "0s"; p.restarts = 0; });
    return `deployment.apps/${dep.name} restarted`;
  }
  if (sub === "status") {
    return `deployment "${dep.name}" successfully rolled out`;
  }
  throw new Error(`unknown rollout subcommand "${sub || ""}"`);
}

function cmdLabel(cluster, positionals, flags) {
  const [slashType, name0] = splitSlash(positionals[0] || "");
  const type = normType(slashType || positionals[0]);
  if (!type) throw new Error(`the server doesn't have a resource type "${positionals[0] || ""}"`);
  const name = slashType ? name0 : positionals[1];
  const pairs = positionals.slice(slashType ? 1 : 2);
  if (!name || pairs.length === 0) throw new Error("you must provide a resource name and at least one label");
  const ns = flags.namespace || cluster.currentNs;
  const obj = (cluster[type] || []).find((o) => o.name === name && (type === "nodes" || type === "namespaces" || o.namespace === ns));
  if (!obj) throw new Error(`${type} "${name}" not found`);
  obj.labels = obj.labels || {};
  const changed = [];
  for (const pair of pairs) {
    const eq = pair.indexOf("=");
    if (eq < 0) throw new Error(`bad label "${pair}" — expected key=value`);
    const k = pair.slice(0, eq), v = pair.slice(eq + 1);
    if (obj.labels[k] !== undefined && obj.labels[k] !== v && !flags.overwrite)
      throw new Error(`'${k}' already has a value (${obj.labels[k]}), and --overwrite is false`);
    obj.labels[k] = v; changed.push(k);
  }
  return `${TYPE_SINGULAR[type]}/${name} labeled`;
}

function cmdRun(cluster, positionals, flags) {
  const name = positionals[0];
  if (!name) throw new Error("you must specify a name for the pod");
  if (!flags.image) throw new Error("you must specify --image");
  const ns = flags.namespace || cluster.currentNs;
  if (cluster.pods.some((p) => p.name === name && p.namespace === ns)) throw new Error(`pods "${name}" already exists`);
  cluster.pods.push({
    name, namespace: ns, owner: null, image: flags.image,
    status: "Running", ready: true, restarts: 0, age: "0s",
    node: cluster.nodes[0].name, ip: "10.244.1.99", labels: {},
  });
  return `pod/${name} created`;
}

function cmdDelete(cluster, positionals, flags) {
  const [slashType, name0] = splitSlash(positionals[0] || "");
  const type = normType(slashType || positionals[0]);
  if (!type) throw new Error(`the server doesn't have a resource type "${positionals[0] || ""}"`);
  const name = slashType ? name0 : positionals[1] || null;
  const ns = flags.namespace || cluster.currentNs;
  const scoped = type !== "nodes" && type !== "namespaces";
  const inNs = (o) => !scoped || o.namespace === ns;
  let victims;
  if (flags.selector) {
    const sel = parseSelector(flags.selector);
    victims = (cluster[type] || []).filter((o) => inNs(o) && matchesSelector(o, sel));
  } else {
    if (!name) throw new Error("you must specify a resource name or a --selector");
    victims = (cluster[type] || []).filter((o) => o.name === name && inNs(o));
    if (victims.length === 0) throw new Error(`${type} "${name}" not found`);
  }
  const set = new Set(victims);
  cluster[type] = (cluster[type] || []).filter((o) => !set.has(o));
  return victims.map((o) => `${TYPE_SINGULAR[type]} "${o.name}" deleted`).join("\n");
}

// ---- dispatch ----------------------------------------------------------------
const READ_VERBS = { get: cmdGet, describe: cmdDescribe };
const WRITE_VERBS = { scale: cmdScale, label: cmdLabel, run: cmdRun, delete: cmdDelete };

function runKubectl(clusterIn, cmdline) {
  const cluster = clone(clusterIn);
  try {
    let tokens = String(cmdline).trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) throw new Error("type a kubectl command");
    if (tokens[0] === "kubectl" || tokens[0] === "k") tokens = tokens.slice(1);
    if (tokens.length === 0) throw new Error("run kubectl with a verb, e.g. `kubectl get pods`");
    const verb = tokens[0];
    const rest = tokens.slice(1);

    // multi-word verbs: `set image ...`, `rollout restart ...`
    if (verb === "set") { const { positionals, flags } = parseArgs(rest); return ok(cmdSetImage(cluster, positionals, flags), cluster); }
    if (verb === "rollout") { const { positionals, flags } = parseArgs(rest); return ok(cmdRollout(cluster, positionals, flags), cluster); }

    const handler = READ_VERBS[verb] || WRITE_VERBS[verb];
    if (!handler) throw new Error(`unknown command "${verb}" — this trainer knows get, describe, scale, set image, rollout, label, run, delete`);
    const { positionals, flags } = parseArgs(rest);
    return ok(handler(cluster, positionals, flags), cluster);
  } catch (e) {
    return { ok: false, err: e && e.message ? e.message : String(e) };
  }
}
function ok(stdout, cluster) { return { ok: true, stdout: stdout == null ? "" : String(stdout), cluster }; }

// A stable, comparable view of the cluster (order-insensitive per resource list).
function clusterKey(cluster) {
  const norm = (arr) => (arr || []).map((o) => JSON.stringify(o, Object.keys(o).sort())).sort();
  return JSON.stringify({
    pods: norm(cluster.pods), deployments: norm(cluster.deployments),
    services: norm(cluster.services), namespaces: norm(cluster.namespaces), nodes: norm(cluster.nodes),
  });
}
const normOut = (s) => String(s == null ? "" : s).replace(/[ \t]+$/gm, "").replace(/\n+$/, "");

// A human-readable snapshot of the working namespace — pods over deployments,
// rendered with the same table engine as `kubectl get`, for the cluster panels.
function clusterView(cluster) {
  const pods = runKubectl(cluster, "kubectl get pods");
  const deploys = runKubectl(cluster, "kubectl get deployments");
  return `$ kubectl get pods\n${pods.stdout}\n\n$ kubectl get deployments\n${deploys.stdout}`;
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
  if (text == null || text === "") return <span className="rx-mlist__empty">no output</span>;
  return <pre className={"rx-code kb-term kb-term--" + (tone || "wip")}>{text}</pre>;
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
function KubectlTrainer() {
  const [index, setIndex] = React.useState(0);
  const level = LEVELS[index];

  const [cmds, setCmds] = React.useState(() => Object.fromEntries(LEVELS.map((l) => [l.id, l.starter ?? "kubectl get pods"])));
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

  const startCluster = level.cluster || BASE_CLUSTER;
  const goal = React.useMemo(() => runKubectl(startCluster, level.solution), [level]);
  const result = React.useMemo(() => runKubectl(startCluster, cmd), [cmd, startCluster]);
  const isState = level.check === "state";

  const passedNow = result.ok && goal.ok && (
    isState ? clusterKey(result.cluster) === clusterKey(goal.cluster)
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
            <span className="rx-brand__tile">k8s</span>
            <span className="rx-brand__name">~/lab/<b>kubectl</b></span>
          </a>
          <div className="rx-top__spacer" />
          <a className="rx-back" href="../../">← aktasfatih.com</a>
          <ThemeToggle value={theme} onChange={setTheme} />
        </div>
      </header>

      <main className="rx-main">
        <div className="rx-head">
          <div>
            <h1 className="rx-title">Learn <span className="ac">kubectl</span> by doing</h1>
            <p className="rx-lede">
              kubectl is how you talk to a Kubernetes cluster. Type a real command and watch a simulated
              cluster respond — pods, deployments, and services, right in your browser. Match the goal
              (the output, or the resulting cluster) to clear each level.
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
        <div className={"rx-filter kb-filter" + (passedNow ? " is-pass" : "") + (!result.ok ? " is-err" : "")}>
          <div className="kb-inputrow">
            <span className="kb-prompt" aria-hidden="true">$</span>
            <input
              ref={inputRef}
              className="rx-filter__input kb-input"
              value={cmd}
              onChange={(e) => setCmd(e.target.value)}
              spellCheck="false" autoComplete="off" autoCapitalize="off"
              aria-label="kubectl command"
              placeholder="kubectl get pods"
            />
            <span className="rx-filter__live" aria-hidden="true">{isState ? "state" : "live"}</span>
          </div>
        </div>

        <div className="rx-work">
          <Panel
            title="kubectl output"
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
              : <pre className="rx-code rx-code--err">error: {result.err}</pre>}
          </Panel>
          <div className="rx-col">
            <Panel title={isState ? "cluster · default (after your command)" : "cluster · default"}
              tone={isState && passedNow ? "ok" : "dark"}>
              {result.ok
                ? <Term text={clusterView(result.cluster)} tone={isState ? tone : "wip"} />
                : <Term text={clusterView(startCluster)} tone="wip" />}
            </Panel>
            <Panel title={isState ? "goal — cluster should look like" : "goal — expected output"}>
              {goal.ok
                ? <Term text={isState ? clusterView(goal.cluster) : goal.stdout} tone="goal" />
                : <span className="rx-mlist__empty">…</span>}
            </Panel>
          </div>
        </div>

        <div className="rx-controls">
          <div className="rx-controls__left">
            <Button variant="ghost" size="sm" onClick={() => setShowHint((v) => !v)}>💡 Hint</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowAnswer((v) => !v)}>{showAnswer ? "Hide answer" : "Show answer"}</Button>
            <Button variant="ghost" size="sm" onClick={() => { setCmd(level.starter ?? "kubectl get pods"); inputRef.current && inputRef.current.focus(); }}>Reset</Button>
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
          <span>a simulated cluster runs in your browser — no real Kubernetes needed · progress saved locally</span>
          <button className="rx-reset-all" onClick={() => { setSolved(new Set()); try { localStorage.removeItem(STORE_SOLVED); } catch {} }}>reset progress</button>
        </footer>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<KubectlTrainer />);

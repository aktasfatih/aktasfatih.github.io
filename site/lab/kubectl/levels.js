// levels.js — the kubectl trainer curriculum. A gentle ramp from `get pods` to
// scaling, labels, namespaces, and rollouts. Every command runs against a small
// simulated Kubernetes cluster that lives entirely in the browser (see the
// engine in game.jsx). Both your command and the reference solution run through
// that same engine, so ANY command that produces the same result counts.
//
// Each level is self-contained:
//   id       stable slug (also the localStorage key suffix)
//   group    section label for the level rail
//   title    short human name
//   teach    the concept, one or two sentences (backticks render as <code>)
//   task     the imperative goal for THIS level
//   check    "output" — compare the terminal text the command prints, or
//            "state"  — compare the cluster after the command runs
//   solution a reference kubectl command. The GOAL is what that command
//            produces (its output, or the resulting cluster), so any command
//            that gets to the same place counts as correct.
//   hint     a nudge that reveals the shape without giving the answer
//   starter  what to prefill the box with (defaults to "kubectl get pods")
//
// The shared starting cluster lives in window.KUBECTL_CLUSTER below; a level may
// carry its own `cluster` to start from a different state.

// Deterministic pod-name suffixes — a deployment's Nth pod always gets the Nth
// suffix, so scaling and restarts are reproducible (and both sides of the check
// line up exactly).
window.KUBECTL_SUFFIXES = ["2xk9d", "7hf4p", "q8m2n", "zj5rt", "w3n8c", "p6r2v", "t9y4b", "m3k7x"];

window.KUBECTL_CLUSTER = {
  currentNs: "default",
  namespaces: [
    { name: "default", status: "Active", age: "20d" },
    { name: "kube-system", status: "Active", age: "20d" },
  ],
  nodes: [
    { name: "node-1", status: "Ready", roles: "control-plane", age: "20d", version: "v1.29.2" },
    { name: "node-2", status: "Ready", roles: "<none>", age: "20d", version: "v1.29.2" },
  ],
  deployments: [
    {
      name: "web", namespace: "default", replicas: 2, image: "nginx:1.25",
      container: "nginx", podHash: "6d4f79b8", age: "5d",
      labels: { app: "web" }, podLabels: { app: "web", tier: "frontend" },
    },
    {
      name: "api", namespace: "default", replicas: 1, image: "fatih/api:1.4",
      container: "api", podHash: "5b7c88d9", age: "5d",
      labels: { app: "api" }, podLabels: { app: "api", tier: "backend" },
    },
  ],
  services: [
    {
      name: "kubernetes", namespace: "default", type: "ClusterIP",
      clusterIP: "10.96.0.1", externalIP: "<none>", ports: "443/TCP",
      age: "20d", selector: {},
    },
    {
      name: "web", namespace: "default", type: "ClusterIP",
      clusterIP: "10.96.120.45", externalIP: "<none>", ports: "80/TCP",
      age: "5d", selector: { app: "web" },
    },
  ],
  pods: [
    { name: "web-6d4f79b8-2xk9d", namespace: "default", owner: "web", image: "nginx:1.25",
      status: "Running", ready: true, restarts: 0, age: "5d", node: "node-1", ip: "10.244.1.20",
      labels: { app: "web", tier: "frontend" } },
    { name: "web-6d4f79b8-7hf4p", namespace: "default", owner: "web", image: "nginx:1.25",
      status: "Running", ready: true, restarts: 0, age: "5d", node: "node-2", ip: "10.244.2.21",
      labels: { app: "web", tier: "frontend" } },
    { name: "api-5b7c88d9-2xk9d", namespace: "default", owner: "api", image: "fatih/api:1.4",
      status: "Running", ready: true, restarts: 0, age: "5d", node: "node-1", ip: "10.244.1.22",
      labels: { app: "api", tier: "backend" } },
    { name: "cache-redis", namespace: "default", owner: null, image: "redis:7",
      status: "Running", ready: true, restarts: 1, age: "2d", node: "node-2", ip: "10.244.2.30",
      labels: { app: "cache" } },
    { name: "coredns-7db6-nn9c2", namespace: "kube-system", owner: "coredns", image: "coredns:1.11.1",
      status: "Running", ready: true, restarts: 0, age: "12d", node: "node-1", ip: "10.244.1.2",
      labels: { "k8s-app": "kube-dns" } },
    { name: "kube-proxy-xq4rt", namespace: "kube-system", owner: null, image: "kube-proxy:v1.29.2",
      status: "Running", ready: true, restarts: 0, age: "12d", node: "node-2", ip: "10.244.2.3",
      labels: { "k8s-app": "kube-proxy" } },
  ],
};

window.KUBECTL_LEVELS = [
  // ---- Reading the cluster ----
  {
    id: "get-pods",
    group: "Reading the cluster",
    check: "output",
    title: "List the pods",
    teach:
      "A pod is the smallest thing you run on Kubernetes — one or more containers sharing an address. `kubectl get pods` lists the pods in your current namespace, with how many are `READY`, their `STATUS`, restart count, and age.",
    task: "List every pod in the current (default) namespace.",
    solution: "kubectl get pods",
    hint: "The verb is `get`, the resource is `pods` (which you can shorten to `po`).",
    starter: "kubectl get pods",
  },
  {
    id: "get-deploy",
    group: "Reading the cluster",
    check: "output",
    title: "List the deployments",
    teach:
      "You rarely create pods by hand — a Deployment does it for you, keeping a set number of replicas alive. `kubectl get deployments` shows each one and its `READY` ratio (ready / desired).",
    task: "List the deployments in the default namespace.",
    solution: "kubectl get deployments",
    hint: "Same `get` verb, resource `deployments` — `deploy` is the accepted short form.",
    starter: "kubectl get pods",
  },
  {
    id: "get-svc",
    group: "Reading the cluster",
    check: "output",
    title: "List the services",
    teach:
      "A Service gives a stable name and IP to a changing set of pods. `kubectl get services` lists them with their `TYPE`, cluster IP, and the ports they expose.",
    task: "List the services in the default namespace.",
    solution: "kubectl get services",
    hint: "Resource `services`, or its short form `svc`.",
    starter: "kubectl get pods",
  },
  {
    id: "get-wide",
    group: "Reading the cluster",
    check: "output",
    title: "Wider output",
    teach:
      "`-o wide` adds columns. For pods it appends the pod `IP` and the `NODE` it landed on — handy when you're chasing where something actually runs.",
    task: "List the pods with the extra IP and NODE columns.",
    solution: "kubectl get pods -o wide",
    hint: "Take `get pods` and add the output flag `-o wide`.",
    starter: "kubectl get pods",
  },

  // ---- Namespaces ----
  {
    id: "get-ns-kube",
    group: "Namespaces",
    check: "output",
    title: "Another namespace",
    teach:
      "Namespaces partition a cluster. `get` only shows your current one (default) unless you say otherwise. `-n <name>` (or `--namespace`) points a command at a different namespace.",
    task: "List the pods running in the `kube-system` namespace.",
    solution: "kubectl get pods -n kube-system",
    hint: "Add `-n kube-system` to your `get pods`.",
    starter: "kubectl get pods",
  },
  {
    id: "get-all-ns",
    group: "Namespaces",
    check: "output",
    title: "Every namespace at once",
    teach:
      "`-A` (short for `--all-namespaces`) ignores the current namespace and lists the resource everywhere, adding a `NAMESPACE` column so you can tell them apart.",
    task: "List the pods across all namespaces at once.",
    solution: "kubectl get pods -A",
    hint: "Use the `-A` flag — no namespace name needed.",
    starter: "kubectl get pods",
  },

  // ---- Labels & selectors ----
  {
    id: "get-selector",
    group: "Labels & selectors",
    check: "output",
    title: "Filter by label",
    teach:
      "Labels are key=value tags on objects, and almost everything in Kubernetes selects by them. `-l app=web` (or `--selector`) narrows a `get` to just the objects carrying that label.",
    task: "List only the pods labelled `app=web`.",
    solution: "kubectl get pods -l app=web",
    hint: "Add the selector flag `-l app=web`.",
    starter: "kubectl get pods",
  },
  {
    id: "show-labels",
    group: "Labels & selectors",
    check: "output",
    title: "Show the labels",
    teach:
      "You can't select by a label you can't see. `--show-labels` appends a `LABELS` column listing every label on each object.",
    task: "List the pods with their labels shown.",
    solution: "kubectl get pods --show-labels",
    hint: "Append the `--show-labels` flag to `get pods`.",
    starter: "kubectl get pods",
  },
  {
    id: "label-pod",
    group: "Labels & selectors",
    check: "state",
    title: "Add a label",
    teach:
      "`kubectl label <type> <name> key=value` attaches a new label to an object. The `cache-redis` pod is only tagged `app=cache` — give it an environment.",
    task: "Add the label `env=prod` to the `cache-redis` pod.",
    solution: "kubectl label pod cache-redis env=prod",
    hint: "`kubectl label pod cache-redis` then the `env=prod` pair.",
    starter: "kubectl label pod cache-redis ",
  },

  // ---- Scaling & updates ----
  {
    id: "scale",
    group: "Scaling & updates",
    check: "state",
    title: "Scale a deployment",
    teach:
      "A Deployment's replica count is just a number you can change. `kubectl scale deployment <name> --replicas=N` adds or removes pods to reach N.",
    task: "Scale the `web` deployment up to 4 replicas.",
    solution: "kubectl scale deployment web --replicas=4",
    hint: "Set `--replicas=4` on `scale deployment web`.",
    starter: "kubectl scale deployment web --replicas=2",
  },
  {
    id: "set-image",
    group: "Scaling & updates",
    check: "state",
    title: "Roll out a new image",
    teach:
      "`kubectl set image deployment/<name> <container>=<image>` swaps the image on a deployment's container and rolls the pods to match. The `web` deployment's container is named `nginx`.",
    task: "Update the `web` deployment to run `nginx:1.27`.",
    solution: "kubectl set image deployment/web nginx=nginx:1.27",
    hint: "The pair is `<container>=<image>`, so `nginx=nginx:1.27`.",
    starter: "kubectl set image deployment/web nginx=nginx:1.25",
  },
  {
    id: "rollout-restart",
    group: "Scaling & updates",
    check: "state",
    title: "Restart a rollout",
    teach:
      "`kubectl rollout restart deployment/<name>` replaces a deployment's pods with fresh ones — no config change needed. A go-to for picking up a rotated secret or clearing a bad state.",
    task: "Restart the pods of the `api` deployment.",
    solution: "kubectl rollout restart deployment/api",
    hint: "The verb is `rollout restart`, targeting `deployment/api`.",
    starter: "kubectl rollout restart deployment/",
  },
  {
    id: "rollout-status",
    group: "Scaling & updates",
    check: "output",
    title: "Watch a rollout finish",
    teach:
      "After a change, `kubectl rollout status deployment/<name>` reports whether the new pods came up cleanly — it prints a line once the rollout has completed.",
    task: "Check the rollout status of the `web` deployment.",
    solution: "kubectl rollout status deployment/web",
    hint: "`rollout status` on `deployment/web`.",
    starter: "kubectl rollout status deployment/",
  },

  // ---- Lifecycle ----
  {
    id: "run-pod",
    group: "Lifecycle",
    check: "state",
    title: "Run a one-off pod",
    teach:
      "`kubectl run <name> --image=<image>` starts a single standalone pod — perfect for a throwaway debug shell.",
    task: "Launch a pod named `debug` from the `busybox` image.",
    solution: "kubectl run debug --image=busybox",
    hint: "`kubectl run debug` then `--image=busybox`.",
    starter: "kubectl run ",
  },
  {
    id: "delete-pod",
    group: "Lifecycle",
    check: "state",
    title: "Delete a pod",
    teach:
      "`kubectl delete <type> <name>` removes an object. The `cache-redis` pod stands on its own (no deployment behind it), so deleting it is final.",
    task: "Delete the `cache-redis` pod.",
    solution: "kubectl delete pod cache-redis",
    hint: "`kubectl delete pod` then the pod's name.",
    starter: "kubectl delete pod ",
  },
  {
    id: "describe-deploy",
    group: "Lifecycle",
    check: "output",
    title: "Describe a deployment",
    teach:
      "`kubectl describe <type> <name>` prints the full picture of one object — labels, replica status, the container and image, and its selector. Where `get` is a list, `describe` is the detail.",
    task: "Show the full description of the `web` deployment.",
    solution: "kubectl describe deployment web",
    hint: "`kubectl describe deployment web`.",
    starter: "kubectl describe deployment ",
  },
];

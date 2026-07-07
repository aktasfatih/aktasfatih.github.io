// levels.js — the gcloud trainer curriculum. A gentle ramp from `gcloud config
// list` to launching Compute Engine VMs and Cloud Storage buckets. Every command
// runs against a small simulated Google Cloud project that lives entirely in the
// browser (see the engine in game.jsx). Both your command and the reference
// solution run through that same engine, so ANY command that reaches the same
// place counts.
//
// Each level is self-contained:
//   id       stable slug (also the localStorage key suffix)
//   group    section label for the level rail
//   title    short human name
//   teach    the concept, one or two sentences (backticks render as <code>)
//   task     the imperative goal for THIS level
//   check    "output" — compare the terminal text the command prints, or
//            "state"  — compare the cloud project after the command runs
//   solution a reference command. The GOAL is what that command produces (its
//            output, or the resulting state), so any command that gets to the
//            same place counts as correct.
//   hint     a nudge that reveals the shape without giving the answer
//   starter  what to prefill the box with (defaults to "gcloud config list")
//
// The shared starting state lives in window.GCLOUD_STATE below; a level may
// carry its own `state` to start from a different place.

window.GCLOUD_STATE = {
  config: {
    core: { project: "fatih-dev", account: "fatih@example.com" },
    compute: { region: "us-central1", zone: "us-central1-a" },
  },
  projects: [
    { projectId: "fatih-dev", name: "Fatih Dev", projectNumber: "123456789012" },
    { projectId: "fatih-prod", name: "Fatih Prod", projectNumber: "210987654321" },
    { projectId: "fatih-sandbox", name: "Fatih Sandbox", projectNumber: "345678901234" },
  ],
  services: [
    { name: "compute.googleapis.com", title: "Compute Engine API", enabled: true },
    { name: "storage.googleapis.com", title: "Cloud Storage API", enabled: true },
    { name: "run.googleapis.com", title: "Cloud Run Admin API", enabled: false },
    { name: "container.googleapis.com", title: "Kubernetes Engine API", enabled: false },
  ],
  instances: [
    { name: "web-1", zone: "us-central1-a", machineType: "e2-medium", status: "RUNNING", internalIP: "10.128.0.2", externalIP: "34.72.10.5" },
    { name: "db-1", zone: "us-central1-b", machineType: "e2-small", status: "TERMINATED", internalIP: "10.128.0.3", externalIP: "" },
  ],
  buckets: [
    { name: "fatih-logs", location: "US", storageClass: "STANDARD" },
    { name: "fatih-media", location: "US", storageClass: "STANDARD" },
  ],
};

window.GCLOUD_LEVELS = [
  // ---- Configuring the CLI ----
  {
    id: "config-list",
    group: "Configuring the CLI",
    check: "output",
    title: "See your active config",
    teach:
      "`gcloud` keeps a local config — which project, account, and default zone every command uses. `gcloud config list` prints the active configuration so you know what you're pointed at.",
    task: "Show the active gcloud configuration.",
    solution: "gcloud config list",
    hint: "The group is `config`, the command is `list`.",
    starter: "gcloud config list",
  },
  {
    id: "set-project",
    group: "Configuring the CLI",
    check: "state",
    title: "Switch projects",
    teach:
      "Almost every command runs against your *active project*. `gcloud config set project <id>` points the whole CLI at a different one — no `--project` flag needed after that.",
    task: "Set the active project to `fatih-prod`.",
    solution: "gcloud config set project fatih-prod",
    hint: "`gcloud config set project` then the project id.",
    starter: "gcloud config set project ",
  },
  {
    id: "set-zone",
    group: "Configuring the CLI",
    check: "state",
    title: "Set a default zone",
    teach:
      "Compute Engine lives in zones. Set `compute/zone` and you can skip `--zone` on later commands. Properties in other sections are addressed as `section/name`.",
    task: "Set the default compute zone to `us-central1-b`.",
    solution: "gcloud config set compute/zone us-central1-b",
    hint: "The property is `compute/zone`, then the zone value.",
    starter: "gcloud config set compute/zone ",
  },
  {
    id: "get-value",
    group: "Configuring the CLI",
    check: "output",
    title: "Read one config value",
    teach:
      "Need just one setting for a script? `gcloud config get-value <property>` prints that value and nothing else.",
    task: "Print the active project id on its own.",
    solution: "gcloud config get-value project",
    hint: "`gcloud config get-value` then `project`.",
    starter: "gcloud config get-value ",
  },

  // ---- Projects & APIs ----
  {
    id: "projects-list",
    group: "Projects & APIs",
    check: "output",
    title: "List your projects",
    teach:
      "`gcloud projects list` shows every project you can reach, with its id, friendly name, and numeric project number.",
    task: "List the projects you have access to.",
    solution: "gcloud projects list",
    hint: "The group is `projects`, the command is `list`.",
    starter: "gcloud config list",
  },
  {
    id: "services-list",
    group: "Projects & APIs",
    check: "output",
    title: "See which APIs are on",
    teach:
      "A GCP API has to be *enabled* on a project before you can use it. `gcloud services list` shows the ones currently enabled.",
    task: "List the enabled services on the active project.",
    solution: "gcloud services list",
    hint: "The group is `services`, the command is `list`.",
    starter: "gcloud config list",
  },
  {
    id: "services-enable",
    group: "Projects & APIs",
    check: "state",
    title: "Enable an API",
    teach:
      "`gcloud services enable <api>` turns an API on so its commands start working. You'd do this before your first deploy to Cloud Run.",
    task: "Enable the Cloud Run API, `run.googleapis.com`.",
    solution: "gcloud services enable run.googleapis.com",
    hint: "`gcloud services enable` then the API's full name.",
    starter: "gcloud services enable ",
  },

  // ---- Compute Engine ----
  {
    id: "instances-list",
    group: "Compute Engine",
    check: "output",
    title: "List your VMs",
    teach:
      "`gcloud compute instances list` shows your Compute Engine VMs — the zone each runs in, its machine type, IPs, and whether it's `RUNNING` or `TERMINATED`.",
    task: "List the Compute Engine instances.",
    solution: "gcloud compute instances list",
    hint: "The path is `compute instances list`.",
    starter: "gcloud config list",
  },
  {
    id: "instances-create",
    group: "Compute Engine",
    check: "state",
    title: "Launch a VM",
    teach:
      "`gcloud compute instances create <name>` boots a new VM. Give it a `--zone` and `--machine-type`, or let it fall back to your configured defaults (zone `us-central1-a`, type `e2-medium`).",
    task: "Create a VM named `api-1` in `us-central1-a` with machine type `e2-medium`.",
    solution: "gcloud compute instances create api-1 --zone=us-central1-a --machine-type=e2-medium",
    hint: "`gcloud compute instances create api-1` with `--zone=` and `--machine-type=` (or rely on the defaults).",
    starter: "gcloud compute instances create ",
  },
  {
    id: "instances-describe",
    group: "Compute Engine",
    check: "output",
    title: "Inspect one VM",
    teach:
      "`gcloud compute instances describe <name>` dumps the full record of a single VM as YAML — machine type, status, zone, and network. gcloud finds the zone for you when the name is unique.",
    task: "Describe the `web-1` instance.",
    solution: "gcloud compute instances describe web-1",
    hint: "`gcloud compute instances describe` then `web-1`.",
    starter: "gcloud compute instances describe ",
  },
  {
    id: "instances-stop",
    group: "Compute Engine",
    check: "state",
    title: "Stop a VM",
    teach:
      "`gcloud compute instances stop <name>` shuts a VM down to `TERMINATED` — you stop paying for the CPU, but keep the disk. Restart it any time.",
    task: "Stop the `web-1` instance.",
    solution: "gcloud compute instances stop web-1",
    hint: "`gcloud compute instances stop web-1`.",
    starter: "gcloud compute instances stop ",
  },
  {
    id: "instances-start",
    group: "Compute Engine",
    check: "state",
    title: "Start a stopped VM",
    teach:
      "`gcloud compute instances start <name>` brings a `TERMINATED` VM back to `RUNNING`. `db-1` sits in `us-central1-b`, not your default zone — pass `--zone` when a VM lives elsewhere.",
    task: "Start the `db-1` instance (it's in `us-central1-b`).",
    solution: "gcloud compute instances start db-1 --zone=us-central1-b",
    hint: "`gcloud compute instances start db-1` with `--zone=us-central1-b`.",
    starter: "gcloud compute instances start db-1 ",
  },
  {
    id: "instances-delete",
    group: "Compute Engine",
    check: "state",
    title: "Delete a VM",
    teach:
      "`gcloud compute instances delete <name>` tears a VM down for good. `--quiet` skips the confirmation prompt — handy in scripts, dangerous by hand.",
    task: "Delete the `db-1` instance in `us-central1-b`.",
    solution: "gcloud compute instances delete db-1 --zone=us-central1-b --quiet",
    hint: "`gcloud compute instances delete db-1 --zone=us-central1-b` (add `--quiet` to skip the prompt).",
    starter: "gcloud compute instances delete db-1 --zone=us-central1-b ",
  },

  // ---- Cloud Storage ----
  {
    id: "storage-list",
    group: "Cloud Storage",
    check: "output",
    title: "List your buckets",
    teach:
      "Cloud Storage keeps objects in *buckets*, addressed as `gs://<name>`. `gcloud storage ls` (with no path) lists the buckets in your project.",
    task: "List the Cloud Storage buckets.",
    solution: "gcloud storage ls",
    hint: "The group is `storage`, the command is `ls`.",
    starter: "gcloud storage ls",
  },
  {
    id: "storage-create",
    group: "Cloud Storage",
    check: "state",
    title: "Create a bucket",
    teach:
      "`gcloud storage buckets create gs://<name> --location=<loc>` makes a new bucket. Bucket names are globally unique, and the location sets where the data lives.",
    task: "Create a bucket `gs://fatih-backups` in the `US` location.",
    solution: "gcloud storage buckets create gs://fatih-backups --location=US",
    hint: "`gcloud storage buckets create gs://fatih-backups` with `--location=US`.",
    starter: "gcloud storage buckets create gs://fatih-backups ",
  },
  {
    id: "storage-delete",
    group: "Cloud Storage",
    check: "state",
    title: "Delete a bucket",
    teach:
      "`gcloud storage buckets delete gs://<name>` removes an (empty) bucket. The `gsutil` classic `gsutil rb gs://<name>` does the same thing.",
    task: "Delete the `gs://fatih-media` bucket.",
    solution: "gcloud storage buckets delete gs://fatih-media",
    hint: "`gcloud storage buckets delete` then `gs://fatih-media`.",
    starter: "gcloud storage buckets delete ",
  },
];

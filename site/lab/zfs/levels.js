// levels.js — the ZFS trainer curriculum. A gentle ramp from `zpool list` to
// building mirrored and raidz pools, setting dataset properties, and taking
// snapshots. Every command runs against a small simulated storage system that
// lives entirely in the browser (see the engine in game.jsx). Both your command
// and the reference solution run through that same engine, so ANY command that
// reaches the same place counts.
//
// Each level is self-contained:
//   id       stable slug (also the localStorage key suffix)
//   group    section label for the level rail
//   title    short human name
//   teach    the concept, one or two sentences (backticks render as <code>)
//   task     the imperative goal for THIS level
//   check    "output" — compare the terminal text the command prints, or
//            "state"  — compare the pools/datasets after the command runs
//   solution a reference command. The GOAL is what that command produces (its
//            output, or the resulting storage), so any command that gets to the
//            same place counts as correct.
//   hint     a nudge that reveals the shape without giving the answer
//   starter  what to prefill the box with (defaults to "zpool list")
//
// The shared starting storage lives in window.ZFS_STORAGE below; a level may
// carry its own `storage` to start from a different state.

// A handful of spare disks not yet in any pool, ready for the "create" levels.
window.ZFS_FREE_DISKS = ["sdc", "sdd", "sde", "sdf"];

window.ZFS_STORAGE = {
  freeDisks: window.ZFS_FREE_DISKS.slice(),
  pools: [
    {
      name: "tank", health: "ONLINE", scan: "none requested",
      size: "4.97G", alloc: "1.20G", free: "3.77G", frag: "0%", cap: "24%", dedup: "1.00x",
      vdevs: [{ type: "mirror", disks: ["sda", "sdb"], state: "ONLINE" }],
    },
  ],
  datasets: [
    { name: "tank", type: "filesystem", used: "1.20G", avail: "3.77G", refer: "25K", mountpoint: "/tank", local: {} },
    { name: "tank/home", type: "filesystem", used: "820M", avail: "3.77G", refer: "26K", mountpoint: "/tank/home", local: {} },
    { name: "tank/home/fatih", type: "filesystem", used: "800M", avail: "3.77G", refer: "800M", mountpoint: "/tank/home/fatih", local: { compression: "lz4" } },
    { name: "tank/tmp", type: "filesystem", used: "18K", avail: "3.77G", refer: "18K", mountpoint: "/tank/tmp", local: {} },
  ],
  snapshots: [
    { name: "tank/home@daily", used: "0B", refer: "26K" },
    { name: "tank/home/fatih@monday", used: "12K", refer: "790M" },
  ],
};

window.ZFS_LEVELS = [
  // ---- Reading the storage ----
  {
    id: "zpool-list",
    group: "Reading the storage",
    check: "output",
    title: "List the pools",
    teach:
      "A ZFS *pool* (zpool) is the top-level chunk of storage, built out of physical disks. `zpool list` shows each pool with its total `SIZE`, how much is allocated, how much is `FREE`, and its `HEALTH`.",
    task: "List the storage pools on this machine.",
    solution: "zpool list",
    hint: "The command is `zpool` and the subcommand is `list`.",
    starter: "zpool list",
  },
  {
    id: "zpool-status",
    group: "Reading the storage",
    check: "output",
    title: "Inspect a pool's disks",
    teach:
      "`zpool status` draws the pool's *vdev tree* — the disks underneath it and how they're arranged (a mirror, raidz, or a lone disk) — plus each device's health and error counts.",
    task: "Show the status and device layout of the pools.",
    solution: "zpool status",
    hint: "Same `zpool` command, subcommand `status`.",
    starter: "zpool list",
  },
  {
    id: "zfs-list",
    group: "Reading the storage",
    check: "output",
    title: "List the datasets",
    teach:
      "Inside a pool you carve out *datasets* (ZFS filesystems). `zfs list` shows each one with how much it uses, how much is available, and where it's mounted.",
    task: "List the ZFS datasets.",
    solution: "zfs list",
    hint: "The command is `zfs`, the subcommand is `list`.",
    starter: "zpool list",
  },
  {
    id: "zfs-list-snap",
    group: "Reading the storage",
    check: "output",
    title: "List the snapshots",
    teach:
      "Snapshots don't show up in a plain `zfs list`. Ask for them with `-t snapshot` (the `-t` type filter also takes `filesystem`, `volume`, or `all`).",
    task: "List only the snapshots.",
    solution: "zfs list -t snapshot",
    hint: "Add the type filter `-t snapshot` to `zfs list`.",
    starter: "zfs list",
  },

  // ---- Building pools (zpool) ----
  {
    id: "create-pool",
    group: "Building pools (zpool)",
    check: "state",
    title: "Create a pool",
    teach:
      "`zpool create <name> <disk>` builds a new pool from one or more disks. The spare disks `sdc`, `sdd`, `sde`, `sdf` are unused and waiting.",
    task: "Create a pool named `backup` from the single disk `sdc`.",
    solution: "zpool create backup sdc",
    hint: "`zpool create backup` then the disk name `sdc`.",
    starter: "zpool create backup ",
  },
  {
    id: "create-mirror",
    group: "Building pools (zpool)",
    check: "state",
    title: "Mirror two disks",
    teach:
      "For redundancy, put the `mirror` keyword before the disks — every disk in a mirror holds a full copy, so the pool survives a disk dying.",
    task: "Create a pool named `backup` that mirrors `sdc` and `sdd`.",
    solution: "zpool create backup mirror sdc sdd",
    hint: "`zpool create backup mirror` then both disks.",
    starter: "zpool create backup ",
  },
  {
    id: "create-raidz",
    group: "Building pools (zpool)",
    check: "state",
    title: "Build a raidz",
    teach:
      "`raidz` (ZFS's RAID-5) spreads data plus one parity block across the disks, so it tolerates one failure while wasting far less space than a mirror.",
    task: "Create a pool named `data` as a `raidz` over `sdc`, `sdd`, and `sde`.",
    solution: "zpool create data raidz sdc sdd sde",
    hint: "`zpool create data raidz` then the three disks.",
    starter: "zpool create data ",
  },
  {
    id: "add-vdev",
    group: "Building pools (zpool)",
    check: "state",
    title: "Grow a pool",
    teach:
      "You grow a pool by adding another *vdev* with `zpool add`. `tank` is a single mirror today — bolt a second mirror on and the pool stripes across both.",
    task: "Add a `mirror` of `sde` and `sdf` to the `tank` pool.",
    solution: "zpool add tank mirror sde sdf",
    hint: "`zpool add tank mirror` then `sde sdf`.",
    starter: "zpool add tank ",
  },

  // ---- Datasets & properties (zfs) ----
  {
    id: "create-dataset",
    group: "Datasets & properties (zfs)",
    check: "state",
    title: "Create a dataset",
    teach:
      "`zfs create <pool>/<name>` carves a new filesystem out of a pool. It mounts itself automatically and shares the pool's free space with its siblings.",
    task: "Create a dataset `tank/projects`.",
    solution: "zfs create tank/projects",
    hint: "`zfs create` then the full path `tank/projects`.",
    starter: "zfs create ",
  },
  {
    id: "set-compression",
    group: "Datasets & properties (zfs)",
    check: "state",
    title: "Set a property",
    teach:
      "Datasets are tuned through *properties*. `zfs set <prop>=<value> <dataset>` changes one — turning on `lz4` compression is almost always a win.",
    task: "Enable `lz4` compression on `tank/home`.",
    solution: "zfs set compression=lz4 tank/home",
    hint: "The pair is `compression=lz4`, then the dataset `tank/home`.",
    starter: "zfs set compression=lz4 ",
  },
  {
    id: "get-property",
    group: "Datasets & properties (zfs)",
    check: "output",
    title: "Read a property (and its source)",
    teach:
      "`zfs get <prop> <dataset>` prints a value and its `SOURCE` — `local` if set on the dataset, `inherited` if it comes from a parent, or `default`. `tank/home/fatih` never sets compression itself.",
    task: "Show the `compression` property of `tank/home/fatih`.",
    solution: "zfs get compression tank/home/fatih",
    hint: "`zfs get compression` then the dataset path.",
    starter: "zfs get compression ",
  },
  {
    id: "set-quota",
    group: "Datasets & properties (zfs)",
    check: "state",
    title: "Put a cap on a dataset",
    teach:
      "A `quota` caps how much a dataset (and its children) can use. `zfs set quota=<size> <dataset>` stops a runaway from swallowing the whole pool.",
    task: "Set a `10G` quota on `tank/home`.",
    solution: "zfs set quota=10G tank/home",
    hint: "The pair is `quota=10G`, then `tank/home`.",
    starter: "zfs set quota=10G ",
  },

  // ---- Snapshots & cleanup ----
  {
    id: "snapshot",
    group: "Snapshots & cleanup",
    check: "state",
    title: "Take a snapshot",
    teach:
      "A snapshot is a read-only, near-free point-in-time copy. `zfs snapshot <dataset>@<name>` freezes the dataset as it is right now — the `@` separates dataset from snapshot name.",
    task: "Snapshot `tank/home` and call it `backup`.",
    solution: "zfs snapshot tank/home@backup",
    hint: "`zfs snapshot` then `tank/home@backup`.",
    starter: "zfs snapshot ",
  },
  {
    id: "destroy-snapshot",
    group: "Snapshots & cleanup",
    check: "state",
    title: "Delete a snapshot",
    teach:
      "`zfs destroy` removes a dataset *or* a snapshot — anything with an `@` in the name is a snapshot. It's irreversible, so aim carefully.",
    task: "Destroy the `tank/home@daily` snapshot.",
    solution: "zfs destroy tank/home@daily",
    hint: "`zfs destroy` then the snapshot name (with the `@`).",
    starter: "zfs destroy ",
  },
  {
    id: "destroy-dataset",
    group: "Snapshots & cleanup",
    check: "state",
    title: "Destroy a dataset",
    teach:
      "The same `zfs destroy` removes a whole dataset when you give it a name with no `@`. `tank/tmp` has served its purpose.",
    task: "Destroy the `tank/tmp` dataset.",
    solution: "zfs destroy tank/tmp",
    hint: "`zfs destroy tank/tmp` — no `@`, so it's the filesystem.",
    starter: "zfs destroy ",
  },
];

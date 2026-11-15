// Curated TCC roadmap outlines — skill batch 3.

export default {
  rust: {
    title: "Rust",
    phases: [
      ["Foundations", [
        ["Cargo", "Projects, Dependencies"],
        ["Ownership", "Borrowing, Lifetimes"],
        ["Types", "Structs, Enums"],
      ]],
      ["Core skills", [
        ["Pattern matching", "Option, Result"],
        ["Traits", "Generics, Bounds"],
        ["Error handling", "thiserror, anyhow"],
      ]],
      ["Build", [
        ["Collections", "Vec, HashMap"],
        ["Modules", "Crates, Visibility"],
        ["Testing", "Unit, Integration"],
      ]],
      ["Specialize", [
        ["Concurrency", "Threads, Channels"],
        ["Async", "Tokio, Futures"],
        ["Unsafe", "Pointers, FFI"],
      ]],
      ["Career", [
        ["Interviews", "Ownership, Borrowing"],
        ["Portfolio", "CLI, Service"],
        ["Open source", "Crates, Reviews"],
      ]],
    ],
  },

  golang: {
    title: "Go",
    phases: [
      ["Foundations", [
        ["Syntax", "Types, Control flow"],
        ["Packages", "Modules, Imports"],
        ["Tooling", "go test, go fmt"],
      ]],
      ["Core skills", [
        ["Structs and interfaces", "Methods, Embedding"],
        ["Errors", "Wrapping, Sentinel errors"],
        ["Concurrency", "Goroutines, Channels"],
      ]],
      ["Build", [
        ["HTTP services", "Handlers, Middleware"],
        ["Databases", "database/sql, Migrations"],
        ["Testing", "Table tests, Benchmarks"],
      ]],
      ["Specialize", [
        ["Performance", "pprof, Allocations"],
        ["Context", "Cancellation, Deadlines"],
        ["Deployment", "Static binaries, Containers"],
      ]],
      ["Career", [
        ["Interviews", "Concurrency, APIs"],
        ["Portfolio", "Service, CLI"],
        ["Open source", "Libraries, Contributions"],
      ]],
    ],
  },

  "ai-product-builder": {
    title: "AI Product Builder",
    phases: [
      ["Foundations", [
        ["Problem selection", "Users, Pain"],
        ["LLM capabilities", "Limits, Costs"],
        ["Prototyping", "Prompts, APIs"],
      ]],
      ["Core skills", [
        ["UX for AI", "Trust, Feedback"],
        ["RAG", "Sources, Citations"],
        ["Evaluation", "Quality, Latency"],
      ]],
      ["Build", [
        ["MVPs", "Scope, Instrumentation"],
        ["Pricing", "Usage, Margins"],
        ["Launch", "Waitlist, Feedback loops"],
      ]],
      ["Specialize", [
        ["Agents", "Tools, Guardrails"],
        ["Data moats", "Proprietary data, Flywheel"],
        ["Reliability", "Fallbacks, Monitoring"],
      ]],
      ["Career", [
        ["Portfolio", "Shipped product, Metrics"],
        ["Interviews", "Case, Demo"],
        ["Ethics", "Privacy, Disclosure"],
      ]],
    ],
  },

  "software-design-architecture": {
    title: "Software Design and Architecture",
    phases: [
      ["Foundations", [
        ["SOLID", "Cohesion, Coupling"],
        ["Design patterns", "Factory, Strategy"],
        ["UML and diagrams", "Class, Sequence"],
      ]],
      ["Core skills", [
        ["Domain-driven design", "Entities, Aggregates"],
        ["Boundaries", "Modules, Interfaces"],
        ["Persistence patterns", "Repository, Unit of work"],
      ]],
      ["Build", [
        ["Refactoring", "Smells, Steps"],
        ["Testing strategy", "Pyramid, Contracts"],
        ["Documentation", "ADRs, C4"],
      ]],
      ["Specialize", [
        ["Event-driven design", "Events, Sagas"],
        ["Microservices", "Decomposition, Choreography"],
        ["Legacy modernisation", "Strangler, Migration"],
      ]],
      ["Career", [
        ["Code review", "Feedback, Standards"],
        ["Interviews", "Design, Refactoring"],
        ["Leadership", "Mentoring, Decisions"],
      ]],
    ],
  },

  "react-native": {
    title: "React Native",
    phases: [
      ["Foundations", [
        ["React basics", "Components, State"],
        ["React Native setup", "Expo, CLI"],
        ["Core components", "View and Text, FlatList"],
      ]],
      ["Core skills", [
        ["Navigation", "Stacks, Tabs"],
        ["Styling", "Flexbox, Platform"],
        ["Networking", "Fetch, Caching"],
      ]],
      ["Build", [
        ["Persistence", "AsyncStorage, SQLite"],
        ["Device APIs", "Camera, Location"],
        ["Testing", "Jest, Detox"],
      ]],
      ["Specialize", [
        ["Performance", "Reanimated, Lists"],
        ["Native modules", "Bridges, TurboModules"],
        ["Release", "EAS, Stores"],
      ]],
      ["Career", [
        ["Portfolio", "Published app, Case study"],
        ["Interviews", "React, Mobile"],
        ["Open source", "Libraries, Contributions"],
      ]],
    ],
  },

  "design-system": {
    title: "Design System",
    phases: [
      ["Foundations", [
        ["Design tokens", "Colour, Spacing"],
        ["Component APIs", "Props, Variants"],
        ["Documentation", "Usage, Examples"],
      ]],
      ["Core skills", [
        ["Figma libraries", "Components, Styles"],
        ["Accessibility", "Contrast, Focus"],
        ["Theming", "Light, Dark"],
      ]],
      ["Build", [
        ["Component library", "Storybook, Tests"],
        ["Versioning", "Semver, Changelog"],
        ["Adoption", "Migration, Support"],
      ]],
      ["Specialize", [
        ["Governance", "Contribution model, Reviews"],
        ["Multi-brand", "Tokens, Overrides"],
        ["Metrics", "Coverage, Drift"],
      ]],
      ["Career", [
        ["Portfolio", "System, Case study"],
        ["Interviews", "Components, Collaboration"],
        ["Advocacy", "Workshops, Docs"],
      ]],
    ],
  },

  "prompt-engineering": {
    title: "Prompt Engineering",
    phases: [
      ["Foundations", [
        ["How LLMs respond", "Tokens, Temperature"],
        ["Instruction design", "Role, Constraints"],
        ["Examples", "Few-shot, Format"],
      ]],
      ["Core skills", [
        ["Structured output", "JSON, Schemas"],
        ["Reasoning patterns", "Steps, Self-check"],
        ["Evaluation", "Test sets, Rubrics"],
      ]],
      ["Build", [
        ["RAG prompts", "Citations, Grounding"],
        ["Agents", "Tools, Planning"],
        ["Guardrails", "Refusals, Injection"],
      ]],
      ["Specialize", [
        ["Prompt iteration", "Datasets, Feedback"],
        ["Multimodal", "Images, Audio"],
        ["Cost and latency", "Caching, Routing"],
      ]],
      ["Career", [
        ["Portfolio", "Prompt suite, Results"],
        ["Interviews", "Design, Debugging"],
        ["Governance", "Safety, Reviews"],
      ]],
    ],
  },

  mongodb: {
    title: "MongoDB",
    phases: [
      ["Foundations", [
        ["Documents", "BSON, Schema"],
        ["CRUD", "Insert, Update"],
        ["Queries", "Filters, Projection"],
      ]],
      ["Core skills", [
        ["Indexes", "Compound, Text"],
        ["Aggregation", "Pipeline, Lookup"],
        ["Data modelling", "Embedding, References"],
      ]],
      ["Build", [
        ["Transactions", "Sessions, Retries"],
        ["Replication", "Replica sets, Read preference"],
        ["Security", "Roles, Encryption"],
      ]],
      ["Specialize", [
        ["Sharding", "Keys, Balancing"],
        ["Performance", "Explain, Profiling"],
        ["Change streams", "Triggers, Events"],
      ]],
      ["Career", [
        ["Interviews", "Modelling, Indexes"],
        ["Portfolio", "API, Analytics"],
        ["Operations", "Backups, Monitoring"],
      ]],
    ],
  },

  linux: {
    title: "Linux",
    phases: [
      ["Foundations", [
        ["Filesystem", "Paths, Permissions"],
        ["Shell", "Pipes, Redirection"],
        ["Processes", "Signals, Jobs"],
      ]],
      ["Core skills", [
        ["Users and groups", "Sudo, Ownership"],
        ["Networking", "ip and ss, DNS"],
        ["Package management", "apt, dnf"],
      ]],
      ["Build", [
        ["Scripting", "Bash, Cron"],
        ["Services", "systemd, Logs"],
        ["Storage", "Disks, Mounts"],
      ]],
      ["Specialize", [
        ["Performance", "top, iostat"],
        ["Security", "SSH, Firewalls"],
        ["Containers", "Namespaces, cgroups"],
      ]],
      ["Career", [
        ["Troubleshooting", "Logs, Tracing"],
        ["Interviews", "Commands, Scenarios"],
        ["Automation", "Ansible, Playbooks"],
      ]],
    ],
  },

  kubernetes: {
    title: "Kubernetes",
    phases: [
      ["Foundations", [
        ["Architecture", "Control plane, Nodes"],
        ["Pods", "Containers, Probes"],
        ["Deployments", "Replicas, Rollouts"],
      ]],
      ["Core skills", [
        ["Services", "ClusterIP, Ingress"],
        ["Config", "ConfigMaps, Secrets"],
        ["Storage", "Volumes, PersistentVolumeClaims"],
      ]],
      ["Build", [
        ["Helm", "Charts, Values"],
        ["Autoscaling", "HPA, Cluster autoscaler"],
        ["Observability", "Metrics, Logs"],
      ]],
      ["Specialize", [
        ["Networking", "CNI, NetworkPolicy"],
        ["Security", "RBAC, Admission control"],
        ["Operators", "CRDs, Controllers"],
      ]],
      ["Career", [
        ["Troubleshooting", "Events, Logs"],
        ["Interviews", "Scenarios, Design"],
        ["Operations", "Upgrades, Runbooks"],
      ]],
    ],
  },
};

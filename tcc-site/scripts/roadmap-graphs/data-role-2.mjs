// Curated TCC roadmap outlines — role-based batch 2.

export default {
  "postgresql-dba": {
    title: "PostgreSQL DBA",
    phases: [
      ["Foundations", [
        ["SQL essentials", "Queries, Joins"],
        ["Postgres architecture", "Processes, WAL"],
        ["Installation", "Packages, Configuration"],
      ]],
      ["Core skills", [
        ["Indexing", "B-tree, Partial indexes"],
        ["Query planning", "EXPLAIN, Statistics"],
        ["Backup and restore", "pg_dump, Point-in-time recovery"],
      ]],
      ["Build", [
        ["Replication", "Streaming, Logical"],
        ["Partitioning", "Range, Maintenance"],
        ["Security", "Roles, Row-level security"],
      ]],
      ["Specialize", [
        ["Performance tuning", "Vacuum, Memory"],
        ["High availability", "Patroni, Failover"],
        ["Extensions", "pg_stat_statements, PostGIS"],
      ]],
      ["Career", [
        ["Upgrades", "Major versions, Rollback"],
        ["Interviews", "Troubleshooting, Design"],
        ["Operations", "Monitoring, Runbooks"],
      ]],
    ],
  },

  ios: {
    title: "iOS",
    phases: [
      ["Foundations", [
        ["Swift basics", "Optionals, Protocols"],
        ["Xcode", "Project setup, Simulator"],
        ["SwiftUI basics", "Views, Modifiers"],
      ]],
      ["Core skills", [
        ["State management", "Observable, Environment"],
        ["Navigation", "Stacks, Deep links"],
        ["Networking", "URLSession, Codable"],
      ]],
      ["Build", [
        ["Persistence", "SwiftData, UserDefaults"],
        ["Concurrency", "async/await, Actors"],
        ["Testing", "XCTest, UI tests"],
      ]],
      ["Specialize", [
        ["Performance", "Instruments, Memory"],
        ["Accessibility", "VoiceOver, Dynamic Type"],
        ["App Store", "Signing, Review"],
      ]],
      ["Career", [
        ["Portfolio", "Published app, Case study"],
        ["Interviews", "Swift, Architecture"],
        ["Open source", "Packages, Contributions"],
      ]],
    ],
  },

  blockchain: {
    title: "Blockchain",
    phases: [
      ["Foundations", [
        ["How blockchains work", "Blocks, Consensus"],
        ["Wallets and keys", "Keys, Signing"],
        ["Ethereum basics", "Accounts, Gas"],
      ]],
      ["Core skills", [
        ["Solidity", "Contracts, Events"],
        ["Smart contract security", "Reentrancy, Access control"],
        ["Testing", "Hardhat, Foundry"],
      ]],
      ["Build", [
        ["dApps", "Frontend, Wallet connect"],
        ["Tokens", "ERC-20, ERC-721"],
        ["Oracles", "Price feeds, External data"],
      ]],
      ["Specialize", [
        ["Layer 2", "Rollups, Bridges"],
        ["DeFi primitives", "AMMs, Lending"],
        ["Auditing", "Threat models, Reports"],
      ]],
      ["Career", [
        ["Portfolio", "Deployed contract, Audit"],
        ["Interviews", "Solidity, Security"],
        ["Ecosystem", "Grants, Communities"],
      ]],
    ],
  },

  qa: {
    title: "QA",
    phases: [
      ["Foundations", [
        ["Testing fundamentals", "Test levels, Oracles"],
        ["Test design", "Boundaries, Equivalence"],
        ["Bug reporting", "Reproduction steps, Severity"],
      ]],
      ["Core skills", [
        ["Manual testing", "Exploratory, Regression"],
        ["Automation basics", "Selectors, Assertions"],
        ["API testing", "Postman, Contract checks"],
      ]],
      ["Build", [
        ["Playwright", "Flows, Fixtures"],
        ["CI integration", "Headless runs, Reports"],
        ["Test data", "Fixtures, Seeding"],
      ]],
      ["Specialize", [
        ["Performance testing", "Load, Bottlenecks"],
        ["Security testing", "OWASP, Auth flows"],
        ["Mobile testing", "Devices, Networks"],
      ]],
      ["Career", [
        ["Quality strategy", "Risk, Coverage"],
        ["Interviews", "Test design, Automation"],
        ["Metrics", "Flakiness, Escaped defects"],
      ]],
    ],
  },

  "software-architect": {
    title: "Software Architect",
    phases: [
      ["Foundations", [
        ["Architecture styles", "Layered, Modular"],
        ["Requirements", "Constraints, Quality attributes"],
        ["Diagrams", "C4 model, Flows"],
      ]],
      ["Core skills", [
        ["Domain modelling", "Bounded contexts, Events"],
        ["API design", "Contracts, Versioning"],
        ["Data architecture", "Consistency, Storage choice"],
      ]],
      ["Build", [
        ["Trade-off analysis", "ATAM, ADRs"],
        ["Scalability", "Caching, Queues"],
        ["Reliability", "Failure modes, Retries"],
      ]],
      ["Specialize", [
        ["Distributed systems", "Consensus, Partitioning"],
        ["Security architecture", "Trust boundaries, Threats"],
        ["Cloud patterns", "Multi-region, Cost"],
      ]],
      ["Career", [
        ["Technical leadership", "Influence, Roadmaps"],
        ["Interviews", "Design, Case studies"],
        ["Documentation", "ADRs, Playbooks"],
      ]],
    ],
  },

  "api-design": {
    title: "API Design",
    phases: [
      ["Foundations", [
        ["HTTP semantics", "Methods, Status codes"],
        ["Resource modelling", "Nouns, Relationships"],
        ["Contracts", "OpenAPI, Schemas"],
      ]],
      ["Core skills", [
        ["REST patterns", "Pagination, Filtering"],
        ["Versioning", "URI, Headers"],
        ["Errors", "Problem details, Retries"],
      ]],
      ["Build", [
        ["Auth", "OAuth, API keys"],
        ["Rate limiting", "Quotas, Throttling"],
        ["Documentation", "Examples, SDKs"],
      ]],
      ["Specialize", [
        ["GraphQL", "Schemas, Resolvers"],
        ["gRPC", "Protobuf, Streaming"],
        ["Event APIs", "Webhooks, Idempotency"],
      ]],
      ["Career", [
        ["Design reviews", "Checklists, Feedback"],
        ["Interviews", "Design, Debugging"],
        ["Governance", "Standards, Deprecation"],
      ]],
    ],
  },

  "cyber-security": {
    title: "Cyber Security",
    phases: [
      ["Foundations", [
        ["Security fundamentals", "CIA triad, Risk"],
        ["Networking", "TCP/IP, TLS"],
        ["Linux", "Permissions, Logs"],
      ]],
      ["Core skills", [
        ["Web security", "OWASP, Injection"],
        ["Auth and identity", "MFA, Sessions"],
        ["Cryptography", "Hashing, Keys"],
      ]],
      ["Build", [
        ["Recon", "Scanning, Enumeration"],
        ["Exploitation labs", "Burp Suite, Metasploit"],
        ["Detection", "SIEM, Rules"],
      ]],
      ["Specialize", [
        ["Cloud security", "IAM, Misconfiguration"],
        ["Red teaming", "Pivoting, Payloads"],
        ["Forensics", "Artifacts, Timeline"],
      ]],
      ["Career", [
        ["Certifications", "Security+, OSCP"],
        ["Interviews", "Scenarios, Reports"],
        ["Blue team", "Incident response, Hardening"],
      ]],
    ],
  },

  "ux-design": {
    title: "UX Design",
    phases: [
      ["Foundations", [
        ["Design thinking", "Empathy, Iteration"],
        ["User research", "Interviews, Surveys"],
        ["Information architecture", "Navigation, Taxonomy"],
      ]],
      ["Core skills", [
        ["Wireframing", "Flows, Sketches"],
        ["Prototyping", "Figma, Interactions"],
        ["Usability testing", "Tasks, Findings"],
      ]],
      ["Build", [
        ["Design systems", "Components, Tokens"],
        ["Accessibility", "Contrast, Focus"],
        ["Handoff", "Specs, Developer collaboration"],
      ]],
      ["Specialize", [
        ["Product strategy", "Metrics, Positioning"],
        ["Interaction design", "Motion, States"],
        ["Research ops", "Recruiting, Synthesis"],
      ]],
      ["Career", [
        ["Portfolio", "Case studies, Process"],
        ["Interviews", "Whiteboard, Critique"],
        ["Collaboration", "Product, Engineering"],
      ]],
    ],
  },

  "technical-writer": {
    title: "Technical Writer",
    phases: [
      ["Foundations", [
        ["Writing clarity", "Structure, Plain language"],
        ["Audience", "Personas, Tasks"],
        ["Docs types", "Tutorials, Reference"],
      ]],
      ["Core skills", [
        ["Information architecture", "Navigation, Search"],
        ["Style guides", "Voice, Terminology"],
        ["Docs as code", "Git, Static sites"],
      ]],
      ["Build", [
        ["API docs", "OpenAPI, Examples"],
        ["Tutorials", "Learning path, Verification"],
        ["Visuals", "Screenshots, Alt text"],
      ]],
      ["Specialize", [
        ["Developer experience", "Onboarding, Feedback"],
        ["Localisation", "Glossaries, Translation"],
        ["Content strategy", "Lifecycle, Governance"],
      ]],
      ["Career", [
        ["Portfolio", "Guides, API docs"],
        ["Interviews", "Editing test, Portfolio review"],
        ["Collaboration", "Subject experts, Reviews"],
      ]],
    ],
  },

  "game-developer": {
    title: "Game Developer",
    phases: [
      ["Foundations", [
        ["Game loops", "Update, Render"],
        ["Math for games", "Vectors, Collisions"],
        ["Engine basics", "Unity, Godot"],
      ]],
      ["Core skills", [
        ["Gameplay scripting", "C#, Input"],
        ["Level design", "Pacing, Blockout"],
        ["Art pipeline", "Sprites, Materials"],
      ]],
      ["Build", [
        ["Physics", "Rigidbodies, Triggers"],
        ["UI and menus", "HUD, Settings"],
        ["Audio", "Events, Mixing"],
      ]],
      ["Specialize", [
        ["Shaders", "Lighting, Post-processing"],
        ["Multiplayer", "State sync, Latency"],
        ["Optimisation", "Draw calls, Memory"],
      ]],
      ["Career", [
        ["Portfolio", "Playable demo, Devlog"],
        ["Interviews", "Code, Design"],
        ["Publishing", "Builds, Store pages"],
      ]],
    ],
  },

  "server-side-game-developer": {
    title: "Server-Side Game Developer",
    phases: [
      ["Foundations", [
        ["Networking", "TCP and UDP, Serialisation"],
        ["Game server basics", "Tick rate, State"],
        ["Concurrency", "Threads, Actors"],
      ]],
      ["Core skills", [
        ["Authoritative servers", "Validation, Anti-cheat"],
        ["Matchmaking", "Queues, Regions"],
        ["Persistence", "Profiles, Inventories"],
      ]],
      ["Build", [
        ["Real-time sync", "Snapshots, Interpolation"],
        ["Scaling", "Sharding, Load tests"],
        ["Observability", "Metrics, Traces"],
      ]],
      ["Specialize", [
        ["Latency", "Lag compensation, Prediction"],
        ["Economy", "Ledgers, Idempotency"],
        ["Live ops", "Events, Rollbacks"],
      ]],
      ["Career", [
        ["Reliability", "SLOs, Incident response"],
        ["Interviews", "Systems, Networking"],
        ["Portfolio", "Server project, Postmortem"],
      ]],
    ],
  },
};

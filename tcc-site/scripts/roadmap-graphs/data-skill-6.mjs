// Curated TCC roadmap outlines — remaining skill and new roadmaps.

export default {
  "ruby-on-rails": {
    title: "Ruby on Rails",
    phases: [
      ["Foundations", [
        ["MVC", "Routes, Controllers"],
        ["ActiveRecord", "Models, Migrations"],
        ["Views", "ERB, Layouts"],
      ]],
      ["Core skills", [
        ["Associations", "Has many, Through"],
        ["Validations", "Callbacks, Errors"],
        ["Background jobs", "ActiveJob, Sidekiq"],
      ]],
      ["Build", [
        ["Authentication", "Devise, Sessions"],
        ["APIs", "JSON, Serializers"],
        ["Testing", "RSpec, System tests"],
      ]],
      ["Specialize", [
        ["Performance", "N+1 queries, Caching"],
        ["Security", "CSRF, Strong parameters"],
        ["Deployment", "Docker, Kamal"],
      ]],
      ["Career", [
        ["Interviews", "Rails, Ruby"],
        ["Portfolio", "App, Tests"],
        ["Open source", "Gems, Contributions"],
      ]],
    ],
  },

  scala: {
    title: "Scala",
    phases: [
      ["Foundations", [
        ["Syntax", "Values, Pattern matching"],
        ["Collections", "List, Map"],
        ["OOP", "Traits, Case classes"],
      ]],
      ["Core skills", [
        ["Functional programming", "Pure functions, Immutability"],
        ["Types", "Generics, Implicits"],
        ["Concurrency", "Futures, Akka"],
      ]],
      ["Build", [
        ["sbt", "Dependencies, Tasks"],
        ["Testing", "ScalaTest, Specs2"],
        ["HTTP", "http4s, Play"],
      ]],
      ["Specialize", [
        ["Big data", "Spark, Datasets"],
        ["Streaming", "Kafka, Flink"],
        ["Performance", "JVM, Profiling"],
      ]],
      ["Career", [
        ["Interviews", "Functional, Types"],
        ["Portfolio", "Service, Data job"],
        ["Open source", "Libraries, Contributions"],
      ]],
    ],
  },

  graphql: {
    title: "GraphQL",
    phases: [
      ["Foundations", [
        ["Schema", "Types, Fields"],
        ["Queries", "Arguments, Aliases"],
        ["Resolvers", "Context, Errors"],
      ]],
      ["Core skills", [
        ["Mutations", "Inputs, Payloads"],
        ["Fragments", "Reuse, Interfaces"],
        ["Pagination", "Cursors, Connections"],
      ]],
      ["Build", [
        ["Servers", "Apollo, GraphQL Yoga"],
        ["Clients", "Apollo Client, urql"],
        ["Caching", "Persisted queries, CDN"],
      ]],
      ["Specialize", [
        ["Performance", "DataLoader, Complexity"],
        ["Security", "Depth limits, Auth"],
        ["Federation", "Subgraphs, Gateway"],
      ]],
      ["Career", [
        ["Interviews", "Schema design, N+1"],
        ["Portfolio", "API, Client"],
        ["Tooling", "Code generation, Introspection"],
      ]],
    ],
  },

  "product-design": {
    title: "Product Design",
    phases: [
      ["Foundations", [
        ["Design process", "Discover, Define"],
        ["User research", "Interviews, Synthesis"],
        ["Sketching", "Flows, Wireframes"],
      ]],
      ["Core skills", [
        ["Interaction design", "States, Feedback"],
        ["Visual design", "Type, Colour"],
        ["Prototyping", "Figma, Variables"],
      ]],
      ["Build", [
        ["Design systems", "Components, Tokens"],
        ["Usability testing", "Tasks, Metrics"],
        ["Handoff", "Specs, Collaboration"],
      ]],
      ["Specialize", [
        ["Product strategy", "Vision, Metrics"],
        ["Accessibility", "Inclusive design, WCAG"],
        ["Design ops", "Process, Tooling"],
      ]],
      ["Career", [
        ["Portfolio", "Case studies, Outcomes"],
        ["Interviews", "Portfolio review, Whiteboard"],
        ["Collaboration", "Product, Engineering"],
      ]],
    ],
  },

  codex: {
    title: "Codex",
    phases: [
      ["Foundations", [
        ["What Codex is", "Capabilities, Limits"],
        ["Setup", "CLI, Editor"],
        ["Prompting", "Context, Constraints"],
      ]],
      ["Core skills", [
        ["Code generation", "Functions, Tests"],
        ["Refactoring", "Diffs, Reviews"],
        ["Debugging", "Errors, Reproduction"],
      ]],
      ["Build", [
        ["Repo workflows", "AGENTS.md, Conventions"],
        ["Automation", "Scripts, CI"],
        ["Reviews", "Safety, Quality"],
      ]],
      ["Specialize", [
        ["Large codebases", "Search, Context"],
        ["Custom instructions", "Rules, Examples"],
        ["Multi-file changes", "Planning, Verification"],
      ]],
      ["Career", [
        ["Portfolio", "Shipped change, Write-up"],
        ["Collaboration", "Reviews, Standards"],
        ["Responsible use", "Licences, Secrets"],
      ]],
    ],
  },

  "cloud-computing": {
    title: "Cloud Computing",
    phases: [
      ["Foundations", [
        ["Cloud models", "IaaS, PaaS"],
        ["Regions and zones", "Latency, Resilience"],
        ["Identity", "IAM, SSO"],
      ]],
      ["Core skills", [
        ["Compute", "Virtual machines, Containers"],
        ["Storage", "Object, Block"],
        ["Networking", "VPC, Load balancing"],
      ]],
      ["Build", [
        ["Managed databases", "Backups, Scaling"],
        ["Messaging", "Queues, Events"],
        ["Observability", "Logs, Metrics"],
      ]],
      ["Specialize", [
        ["Cost", "Right-sizing, Budgets"],
        ["Security", "Encryption, Posture"],
        ["Architecture", "Multi-region, Disaster recovery"],
      ]],
      ["Career", [
        ["Certifications", "Fundamentals, Associate"],
        ["Interviews", "Scenarios, Design"],
        ["Operations", "SLOs, Runbooks"],
      ]],
    ],
  },

  "claude-code": {
    title: "Claude Code",
    phases: [
      ["Foundations", [
        ["What Claude Code is", "Capabilities, Limits"],
        ["Setup", "CLI, Authentication"],
        ["Context", "Files, CLAUDE.md"],
      ]],
      ["Core skills", [
        ["Editing workflows", "Diffs, Approvals"],
        ["Search", "Grep, Glob"],
        ["Testing", "Commands, Verification"],
      ]],
      ["Build", [
        ["Multi-file changes", "Planning, Steps"],
        ["Git integration", "Commits, Pull requests"],
        ["Automation", "Hooks, Scripts"],
      ]],
      ["Specialize", [
        ["Large repos", "Navigation, Conventions"],
        ["MCP tools", "Servers, Permissions"],
        ["Safety", "Secrets, Reviews"],
      ]],
      ["Career", [
        ["Portfolio", "Shipped feature, Write-up"],
        ["Collaboration", "Reviews, Standards"],
        ["Responsible use", "Licences, Privacy"],
      ]],
    ],
  },

  "forward-deployed-engineer": {
    title: "Forward Deployed Engineer",
    phases: [
      ["Foundations", [
        ["Role basics", "Customer context, Delivery"],
        ["Discovery", "Requirements, Constraints"],
        ["Prototyping", "Scripts, Demos"],
      ]],
      ["Core skills", [
        ["Integration", "APIs, Data"],
        ["Deployment", "Environments, Rollout"],
        ["Debugging", "Logs, Reproduction"],
      ]],
      ["Build", [
        ["Customer solutions", "Scope, Acceptance"],
        ["Automation", "Pipelines, Tooling"],
        ["Documentation", "Runbooks, Handover"],
      ]],
      ["Specialize", [
        ["Data pipelines", "ETL, Quality"],
        ["Security", "Access, Compliance"],
        ["Scale", "Performance, Reliability"],
      ]],
      ["Career", [
        ["Stakeholders", "Communication, Expectations"],
        ["Interviews", "Case, Technical"],
        ["Onsite work", "Discovery, Support"],
      ]],
    ],
  },
};

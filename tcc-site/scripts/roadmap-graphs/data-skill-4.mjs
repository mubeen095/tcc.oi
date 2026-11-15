// Curated TCC roadmap outlines — skill batch 4.

export default {
  docker: {
    title: "Docker",
    phases: [
      ["Foundations", [
        ["Images", "Layers, Dockerfiles"],
        ["Containers", "Lifecycle, Ports"],
        ["Volumes", "Bind mounts, Named volumes"],
      ]],
      ["Core skills", [
        ["Compose", "Services, Networks"],
        ["Registries", "Push, Tags"],
        ["Networking", "Bridge, DNS"],
      ]],
      ["Build", [
        ["Multi-stage builds", "Caching, Size"],
        ["Environment config", "Secrets, Build args"],
        ["Health checks", "Probes, Restart policies"],
      ]],
      ["Specialize", [
        ["Security", "Non-root, Scanning"],
        ["BuildKit", "Cache mounts, Platforms"],
        ["Orchestration", "Swarm, Kubernetes basics"],
      ]],
      ["Career", [
        ["Troubleshooting", "Logs, Exec"],
        ["Interviews", "Layers, Networking"],
        ["CI", "Build pipelines, Registries"],
      ]],
    ],
  },

  aws: {
    title: "AWS",
    phases: [
      ["Foundations", [
        ["Cloud model", "Regions, Availability zones"],
        ["IAM", "Users, Roles"],
        ["Compute", "EC2, Lambda"],
      ]],
      ["Core skills", [
        ["Storage", "S3, EBS"],
        ["Databases", "RDS, DynamoDB"],
        ["Networking", "VPC, Security groups"],
      ]],
      ["Build", [
        ["Containers", "ECS, EKS"],
        ["Messaging", "SQS, SNS"],
        ["Monitoring", "CloudWatch, Alarms"],
      ]],
      ["Specialize", [
        ["Cost", "Budgets, Savings plans"],
        ["Security", "KMS, GuardDuty"],
        ["Architecture", "Multi-AZ, Disaster recovery"],
      ]],
      ["Career", [
        ["Certifications", "Solutions Architect, Developer"],
        ["Interviews", "Scenarios, Design"],
        ["Well-Architected", "Pillars, Reviews"],
      ]],
    ],
  },

  terraform: {
    title: "Terraform",
    phases: [
      ["Foundations", [
        ["HCL", "Resources, Variables"],
        ["State", "Local, Remote"],
        ["Providers", "AWS, Versioning"],
      ]],
      ["Core skills", [
        ["Modules", "Inputs, Outputs"],
        ["Workspaces", "Environments, Isolation"],
        ["Plan and apply", "Diffs, Approvals"],
      ]],
      ["Build", [
        ["Remote backends", "S3, Locking"],
        ["CI automation", "Plan, Apply"],
        ["Drift", "Detection, Reconciliation"],
      ]],
      ["Specialize", [
        ["Testing", "Terratest, Validation"],
        ["Policy", "OPA, Sentinel"],
        ["Multi-account", "Structure, Roles"],
      ]],
      ["Career", [
        ["Interviews", "State, Modules"],
        ["Portfolio", "Infrastructure repo, Diagram"],
        ["Operations", "Upgrades, Runbooks"],
      ]],
    ],
  },

  "datastructures-and-algorithms": {
    title: "Data Structures and Algorithms",
    phases: [
      ["Foundations", [
        ["Complexity", "Big O, Amortised"],
        ["Arrays", "Two pointers, Prefix sums"],
        ["Strings", "Hashing, Palindromes"],
      ]],
      ["Core skills", [
        ["Linked lists", "Operations, Cycles"],
        ["Stacks and queues", "Monotonic, Deque"],
        ["Trees", "Traversals, BST"],
      ]],
      ["Build", [
        ["Graphs", "BFS and DFS, Dijkstra"],
        ["Sorting", "Merge, Quick"],
        ["Recursion", "Backtracking, Memoisation"],
      ]],
      ["Specialize", [
        ["Dynamic programming", "Knapsack, Longest increasing subsequence"],
        ["Greedy", "Intervals, Scheduling"],
        ["Advanced", "Trie, Union-find"],
      ]],
      ["Career", [
        ["Interviews", "Patterns, Communication"],
        ["Practice", "Contests, Reviews"],
        ["Portfolio", "Library, Write-ups"],
      ]],
    ],
  },

  redis: {
    title: "Redis",
    phases: [
      ["Foundations", [
        ["Data types", "Strings, Hashes"],
        ["Keys and expiry", "TTL, Eviction"],
        ["CLI", "Commands, Monitoring"],
      ]],
      ["Core skills", [
        ["Lists and sets", "Queues, Unique counts"],
        ["Sorted sets", "Ranking, Range"],
        ["Pub/Sub", "Channels, Patterns"],
      ]],
      ["Build", [
        ["Caching", "Patterns, Stampede"],
        ["Sessions", "Storage, Rotation"],
        ["Rate limiting", "Counters, Windows"],
      ]],
      ["Specialize", [
        ["Persistence", "RDB, AOF"],
        ["Replication", "Replicas, Failover"],
        ["Cluster", "Sharding, Resharding"],
      ]],
      ["Career", [
        ["Interviews", "Data types, Caching"],
        ["Portfolio", "Cache layer, Metrics"],
        ["Operations", "Memory, Alerts"],
      ]],
    ],
  },

  "git-github": {
    title: "Git and GitHub",
    phases: [
      ["Foundations", [
        ["Commits", "Staging, History"],
        ["Branches", "Merge, Rebase"],
        ["Remotes", "Fetch, Push"],
      ]],
      ["Core skills", [
        ["Pull requests", "Review, Checks"],
        ["Conflicts", "Resolution, Strategy"],
        ["Tags and releases", "Semver, Release notes"],
      ]],
      ["Build", [
        ["GitHub Actions", "Workflows, Secrets"],
        ["Issues and projects", "Labels, Boards"],
        ["Protection", "Rules, CODEOWNERS"],
      ]],
      ["Specialize", [
        ["Monorepos", "Sparse checkout, Workspaces"],
        ["Advanced history", "Bisect, Reflog"],
        ["Security", "Signing, Scanning"],
      ]],
      ["Career", [
        ["Collaboration", "Reviews, Etiquette"],
        ["Interviews", "Workflows, Troubleshooting"],
        ["Open source", "Forks, Upstream"],
      ]],
    ],
  },

  php: {
    title: "PHP",
    phases: [
      ["Foundations", [
        ["Syntax", "Types, Control flow"],
        ["Functions", "Scope, Includes"],
        ["Arrays", "Indexed, Associative"],
      ]],
      ["Core skills", [
        ["OOP", "Classes, Interfaces"],
        ["Composer", "Packages, Autoload"],
        ["Errors", "Exceptions, Logging"],
      ]],
      ["Build", [
        ["Databases", "PDO, Prepared statements"],
        ["Sessions", "Cookies, Security"],
        ["Testing", "PHPUnit, Mocks"],
      ]],
      ["Specialize", [
        ["Laravel basics", "Routes, Eloquent"],
        ["Performance", "Opcache, Profiling"],
        ["Security", "XSS, CSRF"],
      ]],
      ["Career", [
        ["Interviews", "PHP internals, APIs"],
        ["Portfolio", "App, Tests"],
        ["Modernisation", "Types, Frameworks"],
      ]],
    ],
  },

  cloudflare: {
    title: "Cloudflare",
    phases: [
      ["Foundations", [
        ["Edge network", "Points of presence, Anycast"],
        ["DNS", "Records, Proxy"],
        ["Caching", "Rules, Purge"],
      ]],
      ["Core skills", [
        ["Workers", "Routes, KV"],
        ["R2", "Buckets, Signed URLs"],
        ["D1", "SQL, Migrations"],
      ]],
      ["Build", [
        ["WAF", "Rules, Rate limits"],
        ["Pages", "Builds, Preview"],
        ["Access", "SSO, Policies"],
      ]],
      ["Specialize", [
        ["Performance", "Tiered cache, Argo"],
        ["Security", "Bots, Turnstile"],
        ["Observability", "Logs, Analytics"],
      ]],
      ["Career", [
        ["Interviews", "Edge, DNS"],
        ["Portfolio", "Worker app, Config"],
        ["Operations", "Incidents, Runbooks"],
      ]],
    ],
  },

  "ai-agents": {
    title: "AI Agents",
    phases: [
      ["Foundations", [
        ["Agent loop", "Observe, Act"],
        ["Tool design", "Schemas, Errors"],
        ["Context", "Memory, Retrieval"],
      ]],
      ["Core skills", [
        ["Planning", "Decomposition, Replanning"],
        ["Multi-agent", "Roles, Handoffs"],
        ["Evaluation", "Tasks, Traces"],
      ]],
      ["Build", [
        ["RAG tools", "Search, Citations"],
        ["Code execution", "Sandbox, Limits"],
        ["Human in the loop", "Approvals, Escalation"],
      ]],
      ["Specialize", [
        ["Reliability", "Retries, Fallbacks"],
        ["Security", "Injection, Permissions"],
        ["Observability", "Tracing, Cost"],
      ]],
      ["Career", [
        ["Portfolio", "Agent, Write-up"],
        ["Interviews", "Design, Debugging"],
        ["Governance", "Policies, Audits"],
      ]],
    ],
  },

  nextjs: {
    title: "Next.js",
    phases: [
      ["Foundations", [
        ["App router", "Layouts, Pages"],
        ["Rendering", "SSR, SSG"],
        ["Routing", "Dynamic, Params"],
      ]],
      ["Core skills", [
        ["Data fetching", "Server components, Caching"],
        ["API routes", "Handlers, Validation"],
        ["Styling", "CSS, Tailwind"],
      ]],
      ["Build", [
        ["Auth", "Sessions, Middleware"],
        ["Forms", "Server actions, Validation"],
        ["Deployment", "Vercel, Environment variables"],
      ]],
      ["Specialize", [
        ["Performance", "Streaming, Images"],
        ["SEO", "Metadata, Sitemaps"],
        ["Testing", "Playwright, Unit"],
      ]],
      ["Career", [
        ["Portfolio", "Full app, Case study"],
        ["Interviews", "Rendering, Caching"],
        ["Open source", "Contributions, Plugins"],
      ]],
    ],
  },
};

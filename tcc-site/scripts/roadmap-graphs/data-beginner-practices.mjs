// Curated TCC roadmap outlines — beginner and best-practice roadmaps.

export default {
  "frontend-beginner": {
    title: "Frontend Beginner",
    phases: [
      ["Start here", [
        ["What frontend means", "Browsers, Pages"],
        ["First HTML page", "Tags, Structure"],
        ["Basic CSS", "Colour, Spacing"],
      ]],
      ["First steps", [
        ["Links and images", "Paths, Alt text"],
        ["Layout with flexbox", "Rows, Alignment"],
        ["Simple JavaScript", "Variables, Events"],
      ]],
      ["Practice", [
        ["Multi-page site", "Navigation, Shared styles"],
        ["Forms", "Inputs, Labels"],
        ["Publish", "Hosting, Domains"],
      ]],
      ["Confidence", [
        ["Responsive design", "Breakpoints, Mobile first"],
        ["Accessibility basics", "Contrast, Keyboard"],
        ["Developer tools", "Inspector, Console"],
      ]],
      ["What next", [
        ["Portfolio", "Three pages, Case notes"],
        ["Next steps", "JavaScript roadmap, Frontend roadmap"],
        ["Practice", "TCC Prep+, Small builds"],
      ]],
    ],
  },

  "backend-beginner": {
    title: "Backend Beginner",
    phases: [
      ["Start here", [
        ["What a backend does", "Requests, Data"],
        ["First server", "Routes, Responses"],
        ["HTTP basics", "Methods, Status codes"],
      ]],
      ["First steps", [
        ["JSON and APIs", "Objects, Endpoints"],
        ["Databases", "Tables, Queries"],
        ["Forms and validation", "Inputs, Errors"],
      ]],
      ["Practice", [
        ["CRUD app", "Create and read, Update and delete"],
        ["Auth basics", "Passwords, Sessions"],
        ["Deploy", "Hosting, Environment variables"],
      ]],
      ["Confidence", [
        ["Logging", "Errors, Debugging"],
        ["Security basics", "Injection, Secrets"],
        ["Testing", "Requests, Edge cases"],
      ]],
      ["What next", [
        ["Portfolio", "API project, README"],
        ["Next steps", "Backend roadmap, Databases"],
        ["Practice", "TCC Prep+, Mock APIs"],
      ]],
    ],
  },

  "devops-beginner": {
    title: "DevOps Beginner",
    phases: [
      ["Start here", [
        ["What DevOps means", "Delivery, Reliability"],
        ["Linux basics", "Files, Permissions"],
        ["Git basics", "Commits, Branches"],
      ]],
      ["First steps", [
        ["Build and run", "Scripts, Processes"],
        ["Containers", "Images, Ports"],
        ["CI basics", "Pipelines, Tests"],
      ]],
      ["Practice", [
        ["Deploy an app", "Server, DNS"],
        ["Logs and monitoring", "Logs, Alerts"],
        ["Backups", "Snapshots, Restore"],
      ]],
      ["Confidence", [
        ["Infrastructure as code", "Terraform basics, State"],
        ["Security", "SSH, Secrets"],
        ["Cloud basics", "Compute, Storage"],
      ]],
      ["What next", [
        ["Portfolio", "Deployed app, Runbook"],
        ["Next steps", "DevOps roadmap, Kubernetes"],
        ["Practice", "TCC Prep+, Labs"],
      ]],
    ],
  },

  "git-github-beginner": {
    title: "Git and GitHub Beginner",
    phases: [
      ["Start here", [
        ["What version control is", "History, Snapshots"],
        ["First repository", "init, status"],
        ["Commits", "Staging, Messages"],
      ]],
      ["First steps", [
        ["Branches", "Create, Switch"],
        ["Merging", "Fast-forward, Conflicts"],
        ["Remotes", "Clone, Push"],
      ]],
      ["Practice", [
        ["Pull requests", "Fork, Review"],
        ["Issues", "Reports, Labels"],
        ["GitHub Pages", "Publish, URL"],
      ]],
      ["Confidence", [
        ["Undo safely", "Restore, Revert"],
        ["Tags", "Releases, Semver"],
        ["Collaboration", "Reviews, Etiquette"],
      ]],
      ["What next", [
        ["Portfolio", "Profile README, Pinned repos"],
        ["Next steps", "Git roadmap, Open source"],
        ["Practice", "TCC Prep+, Daily commits"],
      ]],
    ],
  },

  "aws-best-practices": {
    title: "AWS Best Practices",
    phases: [
      ["Assess", [
        ["Account structure", "Organizations, Budgets"],
        ["IAM", "Roles, Least privilege"],
        ["Tagging", "Cost, Ownership"],
      ]],
      ["Adopt", [
        ["Networking", "VPC design, Security groups"],
        ["Compute", "Right-sizing, Auto scaling"],
        ["Storage", "Lifecycle, Encryption"],
      ]],
      ["Scale", [
        ["Observability", "CloudWatch, Alarms"],
        ["Backup", "Policies, Restore tests"],
        ["Deployment", "Infrastructure as code, Rollback"],
      ]],
      ["Harden", [
        ["Security", "GuardDuty, KMS"],
        ["Cost", "Savings plans, Waste"],
        ["Resilience", "Multi-AZ, Disaster recovery drills"],
      ]],
      ["Sustain", [
        ["Reviews", "Well-Architected, Findings"],
        ["Interviews", "Scenarios, Trade-offs"],
        ["Operations", "Runbooks, Incidents"],
      ]],
    ],
  },

  "api-security-best-practices": {
    title: "API Security Best Practices",
    phases: [
      ["Assess", [
        ["Threat model", "Assets, Actors"],
        ["Auth", "OAuth, Keys"],
        ["Transport", "TLS, Certificates"],
      ]],
      ["Adopt", [
        ["Input validation", "Schemas, Limits"],
        ["Authorization", "Scopes, RBAC"],
        ["Rate limiting", "Quotas, Burst"],
      ]],
      ["Scale", [
        ["Logging", "Audit trails, PII"],
        ["Secrets", "Rotation, Storage"],
        ["Dependency hygiene", "Scanning, Updates"],
      ]],
      ["Harden", [
        ["OWASP API Top 10", "BOLA, Injection"],
        ["Zero trust", "mTLS, Policy"],
        ["Incident response", "Revocation, Forensics"],
      ]],
      ["Sustain", [
        ["Reviews", "Checklists, Tests"],
        ["Interviews", "Scenarios, Design"],
        ["Compliance", "SOC 2, GDPR"],
      ]],
    ],
  },

  "backend-performance-best-practices": {
    title: "Backend Performance Best Practices",
    phases: [
      ["Assess", [
        ["Measure first", "Latency, Throughput"],
        ["Profiling", "CPU, Memory"],
        ["Load testing", "Requests per second, Percentiles"],
      ]],
      ["Adopt", [
        ["Database tuning", "Indexes, N+1 queries"],
        ["Caching", "Layers, Invalidation"],
        ["Async work", "Queues, Batching"],
      ]],
      ["Scale", [
        ["Connection pools", "Sizing, Timeouts"],
        ["Payloads", "Compression, Pagination"],
        ["CDN", "Static assets, Edge"],
      ]],
      ["Harden", [
        ["Capacity", "Scaling, Headroom"],
        ["Observability", "Traces, SLOs"],
        ["Cost", "Right-sizing, Efficiency"],
      ]],
      ["Sustain", [
        ["Reviews", "Benchmarks, Regressions"],
        ["Interviews", "Debugging, Trade-offs"],
        ["Operations", "Runbooks, Alerts"],
      ]],
    ],
  },

  "frontend-performance-best-practices": {
    title: "Frontend Performance Best Practices",
    phases: [
      ["Assess", [
        ["Core Web Vitals", "LCP, INP"],
        ["Measurement", "Lighthouse, Real user monitoring"],
        ["Critical path", "HTML, CSS"],
      ]],
      ["Adopt", [
        ["Images", "Formats, Sizing"],
        ["JavaScript", "Splitting, Defer"],
        ["Fonts", "Preload, Swap"],
      ]],
      ["Scale", [
        ["Caching", "Headers, Service workers"],
        ["Third parties", "Audit, Async"],
        ["Rendering", "SSR, Hydration"],
      ]],
      ["Harden", [
        ["Budgets", "Size, Requests"],
        ["Edge", "CDN, Streaming"],
        ["Monitoring", "Alerts, Regressions"],
      ]],
      ["Sustain", [
        ["Reviews", "Audits, Fixes"],
        ["Interviews", "Diagnosis, Trade-offs"],
        ["Culture", "Budgets, Tooling"],
      ]],
    ],
  },

  "code-review-best-practices": {
    title: "Code Review Best Practices",
    phases: [
      ["Assess", [
        ["Purpose", "Quality, Learning"],
        ["Small changes", "Scope, Size"],
        ["Context", "Description, Links"],
      ]],
      ["Adopt", [
        ["Readability", "Naming, Structure"],
        ["Correctness", "Tests, Edge cases"],
        ["Security", "Inputs, Secrets"],
      ]],
      ["Scale", [
        ["Feedback", "Specific, Kind"],
        ["Tooling", "Diffs, Checks"],
        ["Approvals", "Blocking, Nitpicks"],
      ]],
      ["Harden", [
        ["Architecture", "Boundaries, Debt"],
        ["Mentoring", "Questions, Growth"],
        ["Metrics", "Review time, Rework"],
      ]],
      ["Sustain", [
        ["Team norms", "SLA, Etiquette"],
        ["Interviews", "Review exercise, Communication"],
        ["Leadership", "Standards, Culture"],
      ]],
    ],
  },
};

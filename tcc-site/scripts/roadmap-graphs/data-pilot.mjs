// Curated TCC roadmap outlines — pilot batch.
// Every label and summary here is original TCC content.

export default {
  frontend: {
    title: "Frontend",
    phases: [
      {
        title: "Foundations",
        topics: [
          ["How the web works", ["HTTP and HTTPS", "DNS and hosting"]],
          ["HTML semantics", ["Landmarks and headings", "Forms and validation"]],
          ["CSS layout", ["Flexbox and grid", "Responsive breakpoints"]],
        ],
      },
      {
        title: "Core skills",
        topics: [
          ["JavaScript fundamentals", ["Types and scope", "DOM and events"]],
          ["TypeScript essentials", ["Types and interfaces", "Generics"]],
          ["Browser APIs", ["Fetch and storage", "History and routing"]],
        ],
      },
      {
        title: "Build",
        topics: [
          ["Component architecture", ["Composition", "State ownership"]],
          ["React fundamentals", ["Hooks", "Routing"]],
          ["Styling systems", ["Design tokens", "Utility and component CSS"]],
        ],
      },
      {
        title: "Specialize",
        topics: [
          ["Performance", ["Core Web Vitals", "Bundling and caching"]],
          ["Accessibility", ["ARIA and semantics", "Keyboard navigation"]],
          ["Testing", ["Unit and component tests", "End-to-end flows"]],
        ],
      },
      {
        title: "Career",
        topics: [
          ["Portfolio projects", ["Case studies", "Live demos"]],
          ["Frontend interviews", ["JavaScript rounds", "UI system design"]],
          ["Open source", ["Finding issues", "Code review etiquette"]],
        ],
      },
    ],
  },

  backend: {
    title: "Backend",
    phases: [
      {
        title: "Foundations",
        topics: [
          ["HTTP and APIs", ["REST conventions", "Status codes"]],
          ["Relational databases", ["Schema design", "Indexes"]],
          ["Language runtime", ["Async model", "Package management"]],
        ],
      },
      {
        title: "Core skills",
        topics: [
          ["Authentication", ["Sessions and cookies", "OAuth and JWT"]],
          ["Data modelling", ["Normalisation", "Migrations"]],
          ["Caching", ["Redis patterns", "CDN and HTTP cache"]],
        ],
      },
      {
        title: "Build",
        topics: [
          ["API design", ["Versioning", "Pagination and filtering"]],
          ["Background jobs", ["Queues", "Retries and dead letters"]],
          ["Observability", ["Structured logs", "Metrics and traces"]],
        ],
      },
      {
        title: "Specialize",
        topics: [
          ["Security", ["Input validation", "OWASP top ten"]],
          ["Testing", ["Integration tests", "Load testing"]],
          ["Containers", ["Dockerfiles", "Compose and registries"]],
        ],
      },
      {
        title: "Career",
        topics: [
          ["System design", ["Scaling reads and writes", "Trade-off analysis"]],
          ["Backend interviews", ["Coding rounds", "Design rounds"]],
          ["Production habits", ["Runbooks", "On-call and postmortems"]],
        ],
      },
    ],
  },

  devops: {
    title: "DevOps",
    phases: [
      {
        title: "Foundations",
        topics: [
          ["Linux basics", ["Shell and permissions", "Processes and signals"]],
          ["Networking", ["DNS and TLS", "Load balancing"]],
          ["Git workflows", ["Branching models", "Pull requests"]],
        ],
      },
      {
        title: "Core skills",
        topics: [
          ["CI pipelines", ["Build and test stages", "Artifacts and caching"]],
          ["Containers", ["Images and layers", "Registries"]],
          ["Kubernetes", ["Pods and deployments", "Services and ingress"]],
        ],
      },
      {
        title: "Build",
        topics: [
          ["Infrastructure as code", ["Terraform modules", "Remote state"]],
          ["Cloud fundamentals", ["Compute and storage", "IAM"]],
          ["Observability", ["Metrics and dashboards", "Distributed tracing"]],
        ],
      },
      {
        title: "Specialize",
        topics: [
          ["Security", ["Secrets management", "Least privilege"]],
          ["Deployment strategies", ["Blue-green", "Canary releases"]],
          ["Incident response", ["Triage", "Blameless postmortems"]],
        ],
      },
      {
        title: "Career",
        topics: [
          ["Reliability", ["SLOs and error budgets", "Capacity planning"]],
          ["Platform interviews", ["Troubleshooting", "System design"]],
          ["Automation", ["Scripting", "Self-service runbooks"]],
        ],
      },
    ],
  },

  python: {
    title: "Python",
    phases: [
      {
        title: "Foundations",
        topics: [
          ["Syntax and types", ["Variables and control flow", "Type hints"]],
          ["Data structures", ["Lists and tuples", "Dicts and sets"]],
          ["Functions and modules", ["Arguments and scope", "Imports and packages"]],
        ],
      },
      {
        title: "Core skills",
        topics: [
          ["Object-oriented Python", ["Classes", "Inheritance and composition"]],
          ["Standard library", ["pathlib and os", "datetime and json"]],
          ["Errors and logging", ["Exceptions", "Structured logging"]],
        ],
      },
      {
        title: "Build",
        topics: [
          ["Files and data", ["CSV and JSON", "Working with APIs"]],
          ["Testing", ["pytest", "Fixtures and mocks"]],
          ["Web APIs", ["FastAPI routes", "Validation and auth"]],
        ],
      },
      {
        title: "Specialize",
        topics: [
          ["Data analysis", ["pandas", "NumPy"]],
          ["Automation", ["Scripting tasks", "Scheduling"]],
          ["Packaging and performance", ["venv and pip", "Profiling and async"]],
        ],
      },
      {
        title: "Career",
        topics: [
          ["Python interviews", ["Language questions", "DSA in Python"]],
          ["Portfolio", ["CLI tool", "API project"]],
          ["Open source", ["Reading source", "First contribution"]],
        ],
      },
    ],
  },

  react: {
    title: "React",
    phases: [
      {
        title: "Foundations",
        topics: [
          ["JSX and rendering", ["Elements", "Props"]],
          ["Components", ["Composition", "Children"]],
          ["State", ["useState", "Reducers"]],
        ],
      },
      {
        title: "Core skills",
        topics: [
          ["Effects", ["useEffect", "Cleanup"]],
          ["Forms", ["Controlled inputs", "Validation"]],
          ["Data fetching", ["Loading states", "Caching"]],
        ],
      },
      {
        title: "Build",
        topics: [
          ["Routing", ["Routes", "Params and loaders"]],
          ["Context", ["Providers", "Consumers"]],
          ["Performance", ["Memoisation", "Code splitting"]],
        ],
      },
      {
        title: "Specialize",
        topics: [
          ["Testing", ["Testing Library", "Mocking network"]],
          ["Accessibility", ["Semantics", "Focus management"]],
          ["State libraries", ["Zustand", "TanStack Query"]],
        ],
      },
      {
        title: "Career",
        topics: [
          ["Next.js basics", ["Server rendering", "App router"]],
          ["React interviews", ["Component design", "Debugging"]],
          ["Portfolio", ["Dashboard build", "Open source"]],
        ],
      },
    ],
  },
};

// Curated TCC roadmap outlines — skill batch 2.

export default {
  nodejs: {
    title: "Node.js",
    phases: [
      ["Foundations", [
        ["Runtime and event loop", "Callbacks, Microtasks"],
        ["Modules", "CommonJS, ESM"],
        ["npm", "Scripts, Lockfiles"],
      ]],
      ["Core skills", [
        ["HTTP servers", "Routing, Middleware"],
        ["File system", "Streams, Paths"],
        ["Async patterns", "Promises, Worker threads"],
      ]],
      ["Build", [
        ["Databases", "Drivers, Pooling"],
        ["Auth", "Sessions, JWT"],
        ["Testing", "Node test runner, Supertest"],
      ]],
      ["Specialize", [
        ["Performance", "Profiling, Clustering"],
        ["Security", "Input validation, Dependencies"],
        ["Observability", "Logs, Metrics"],
      ]],
      ["Career", [
        ["Interviews", "Event loop, APIs"],
        ["Portfolio", "API service, CLI"],
        ["Production", "Deploys, Runbooks"],
      ]],
    ],
  },

  "system-design": {
    title: "System Design",
    phases: [
      ["Foundations", [
        ["Requirements", "Functional, Non-functional"],
        ["Scaling basics", "Vertical, Horizontal"],
        ["Networking", "DNS, Load balancers"],
      ]],
      ["Core skills", [
        ["Databases", "SQL versus NoSQL, Replication"],
        ["Caching", "Patterns, Invalidation"],
        ["Queues", "Delivery, Backpressure"],
      ]],
      ["Build", [
        ["API design", "REST, Pagination"],
        ["Consistency", "CAP, Transactions"],
        ["Storage", "Blob, Search"],
      ]],
      ["Specialize", [
        ["Distributed systems", "Consensus, Sharding"],
        ["Reliability", "Retries, Circuit breakers"],
        ["Observability", "Tracing, SLOs"],
      ]],
      ["Career", [
        ["Interviews", "Design rounds, Trade-offs"],
        ["Case studies", "URL shortener, Feed"],
        ["Communication", "Diagrams, Estimates"],
      ]],
    ],
  },

  leetcode: {
    title: "LeetCode",
    phases: [
      ["Foundations", [
        ["Complexity", "Big O, Space"],
        ["Arrays and strings", "Two pointers, Sliding window"],
        ["Hash maps", "Counting, Lookup"],
      ]],
      ["Core skills", [
        ["Linked lists", "Reversal, Cycles"],
        ["Stacks and queues", "Monotonic, BFS"],
        ["Trees", "Traversal, BST"],
      ]],
      ["Build", [
        ["Graphs", "DFS, Dijkstra"],
        ["Dynamic programming", "States, Transitions"],
        ["Backtracking", "Pruning, Permutations"],
      ]],
      ["Specialize", [
        ["Advanced patterns", "Union-find, Trie"],
        ["Greedy", "Proofs, Intervals"],
        ["Math", "Number theory, Bits"],
      ]],
      ["Career", [
        ["Interview strategy", "Patterns, Timing"],
        ["Mock rounds", "Communication, Edge cases"],
        ["Review", "Mistakes, Spaced repetition"],
      ]],
    ],
  },

  java: {
    title: "Java",
    phases: [
      ["Foundations", [
        ["Syntax", "Types, Control flow"],
        ["OOP", "Classes, Interfaces"],
        ["Collections", "List, Map"],
      ]],
      ["Core skills", [
        ["Generics", "Bounds, Wildcards"],
        ["Exceptions", "Checked, Runtime"],
        ["Streams", "map, reduce"],
      ]],
      ["Build", [
        ["Concurrency", "Threads, Executors"],
        ["JVM", "Memory, Garbage collection"],
        ["Testing", "JUnit, Mockito"],
      ]],
      ["Specialize", [
        ["Spring Boot", "REST, Dependency injection"],
        ["Persistence", "JPA, Transactions"],
        ["Performance", "Profiling, Tuning"],
      ]],
      ["Career", [
        ["Interviews", "Core Java, DSA"],
        ["Portfolio", "Service, Tests"],
        ["Open source", "Libraries, Contributions"],
      ]],
    ],
  },

  "aspnet-core": {
    title: "ASP.NET Core",
    phases: [
      ["Foundations", [
        ["C# basics", "Types, LINQ"],
        ["Project structure", "Program.cs, Middleware"],
        ["Routing", "Controllers, Minimal APIs"],
      ]],
      ["Core skills", [
        ["Dependency injection", "Scopes, Lifetimes"],
        ["EF Core", "Migrations, Queries"],
        ["Validation", "Attributes, Problem details"],
      ]],
      ["Build", [
        ["Auth", "Identity, JWT"],
        ["Testing", "xUnit, WebApplicationFactory"],
        ["Logging", "Serilog, Correlation"],
      ]],
      ["Specialize", [
        ["Performance", "Caching, Async"],
        ["Background services", "Queues, Hosted services"],
        ["Deployment", "Containers, IIS"],
      ]],
      ["Career", [
        ["Interviews", "C#, APIs"],
        ["Portfolio", "API, Dashboard"],
        ["Architecture", "Layers, Boundaries"],
      ]],
    ],
  },

  "power-bi": {
    title: "Power BI",
    phases: [
      ["Foundations", [
        ["Data import", "Sources, Transform"],
        ["Data model", "Tables, Relationships"],
        ["DAX basics", "Measures, CALCULATE"],
      ]],
      ["Core skills", [
        ["Visuals", "Charts, Slicers"],
        ["Star schema", "Facts, Dimensions"],
        ["Time intelligence", "YTD, YoY"],
      ]],
      ["Build", [
        ["Dashboards", "Layout, Drillthrough"],
        ["Power Query", "Steps, Parameters"],
        ["Row-level security", "Roles, Filters"],
      ]],
      ["Specialize", [
        ["Performance", "Model size, Aggregations"],
        ["Deployment", "Pipelines, Gateways"],
        ["Advanced DAX", "Context, Variables"],
      ]],
      ["Career", [
        ["Portfolio", "Dashboard, Case study"],
        ["Interviews", "DAX, Modelling"],
        ["Stakeholders", "Requirements, Storytelling"],
      ]],
    ],
  },

  "spring-boot": {
    title: "Spring Boot",
    phases: [
      ["Foundations", [
        ["Java and Spring", "Beans, Dependency injection"],
        ["Project setup", "Starters, Configuration"],
        ["REST controllers", "Mapping, JSON"],
      ]],
      ["Core skills", [
        ["Data access", "JPA, Repositories"],
        ["Validation", "DTOs, Errors"],
        ["Security", "Filters, JWT"],
      ]],
      ["Build", [
        ["Testing", "MockMvc, Testcontainers"],
        ["Actuator", "Health, Metrics"],
        ["Caching", "Redis, Eviction"],
      ]],
      ["Specialize", [
        ["Messaging", "Kafka, Events"],
        ["Microservices", "Config, Discovery"],
        ["Performance", "Pooling, Profiling"],
      ]],
      ["Career", [
        ["Interviews", "Spring internals, APIs"],
        ["Portfolio", "Service, Tests"],
        ["Production", "Deploys, Runbooks"],
      ]],
    ],
  },

  flutter: {
    title: "Flutter",
    phases: [
      ["Foundations", [
        ["Dart", "Types, Async"],
        ["Widgets", "Stateless, Stateful"],
        ["Layout", "Rows, Constraints"],
      ]],
      ["Core skills", [
        ["Navigation", "Routes, Deep links"],
        ["State", "Provider, Riverpod"],
        ["Networking", "HTTP, JSON"],
      ]],
      ["Build", [
        ["Persistence", "SQLite, Preferences"],
        ["Animations", "Transitions, Controllers"],
        ["Testing", "Widget, Integration"],
      ]],
      ["Specialize", [
        ["Platform channels", "Native, Plugins"],
        ["Performance", "Rebuilds, DevTools"],
        ["Release", "Signing, Stores"],
      ]],
      ["Career", [
        ["Portfolio", "Published app, Case study"],
        ["Interviews", "Dart, Widgets"],
        ["Open source", "Packages, Contributions"],
      ]],
    ],
  },

  c: {
    title: "C",
    phases: [
      ["Foundations", [
        ["Syntax", "Types, Operators"],
        ["Control flow", "Loops, Switch"],
        ["Functions", "Prototypes, Scope"],
      ]],
      ["Core skills", [
        ["Pointers", "Arithmetic, Arrays"],
        ["Memory", "malloc, free"],
        ["Structs", "Layout, Unions"],
      ]],
      ["Build", [
        ["File I/O", "Streams, Buffers"],
        ["Build tools", "Make, Compilers"],
        ["Debugging", "gdb, Valgrind"],
      ]],
      ["Specialize", [
        ["Data structures", "Lists, Trees"],
        ["Systems programming", "Syscalls, Threads"],
        ["Performance", "Cache, Optimisation"],
      ]],
      ["Career", [
        ["Interviews", "Pointers, Memory"],
        ["Portfolio", "CLI tool, Library"],
        ["Embedded", "Registers, Interrupts"],
      ]],
    ],
  },

  cpp: {
    title: "C++",
    phases: [
      ["Foundations", [
        ["Syntax", "Types, References"],
        ["Classes", "Constructors, RAII"],
        ["STL", "vector, map"],
      ]],
      ["Core skills", [
        ["Templates", "Functions, Classes"],
        ["Smart pointers", "unique_ptr, shared_ptr"],
        ["Move semantics", "Rvalues, Perfect forwarding"],
      ]],
      ["Build", [
        ["Build systems", "CMake, Packages"],
        ["Testing", "Catch2, GoogleTest"],
        ["Debugging", "Sanitizers, gdb"],
      ]],
      ["Specialize", [
        ["Concurrency", "Threads, Atomics"],
        ["Performance", "Profiling, Cache"],
        ["Systems", "Networking, Memory"],
      ]],
      ["Career", [
        ["Interviews", "C++ semantics, DSA"],
        ["Portfolio", "Engine, Library"],
        ["Domains", "Games, Low latency"],
      ]],
    ],
  },
};

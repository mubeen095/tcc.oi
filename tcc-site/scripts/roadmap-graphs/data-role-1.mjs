// Curated TCC roadmap outlines — role-based batch 1.

export default {
  "full-stack": {
    title: "Full Stack",
    phases: [
      ["Foundations", [
        ["HTML and CSS", "Semantic markup, Responsive layout"],
        ["JavaScript", "DOM and events, Fetch and APIs"],
        ["Git and GitHub", "Branching, Pull requests"],
      ]],
      ["Core skills", [
        ["Frontend framework", "Components, Routing"],
        ["Backend runtime", "Routes and middleware, Validation"],
        ["Databases", "SQL queries, Schema design"],
      ]],
      ["Build", [
        ["Auth and sessions", "Cookies, JWT"],
        ["API integration", "REST calls, Error handling"],
        ["Deployment", "Environment variables, Hosting"],
      ]],
      ["Specialize", [
        ["Testing", "Unit tests, End-to-end flows"],
        ["Performance", "Caching, Bundle size"],
        ["Security", "Input validation, CORS and CSRF"],
      ]],
      ["Career", [
        ["Portfolio", "Full-stack app, Case study"],
        ["Interviews", "Coding rounds, System design"],
        ["Collaboration", "Code review, Agile delivery"],
      ]],
    ],
  },

  android: {
    title: "Android",
    phases: [
      ["Foundations", [
        ["Kotlin basics", "Syntax, Null safety"],
        ["Android Studio", "Project setup, Emulator"],
        ["Layouts", "XML layouts, ConstraintLayout"],
      ]],
      ["Core skills", [
        ["Activities and fragments", "Lifecycle, Navigation"],
        ["State and data", "ViewModel, StateFlow"],
        ["Networking", "Retrofit, JSON parsing"],
      ]],
      ["Build", [
        ["Room database", "Entities, DAOs"],
        ["Background work", "WorkManager, Coroutines"],
        ["Permissions", "Runtime permissions, Scoped storage"],
      ]],
      ["Specialize", [
        ["Jetpack Compose", "Composables, State"],
        ["Testing", "Unit tests, UI tests"],
        ["Performance", "Profiling, Memory"],
      ]],
      ["Career", [
        ["Play Store release", "Signing, Store listing"],
        ["Interviews", "Kotlin, Architecture"],
        ["Portfolio", "Published app, Open source"],
      ]],
    ],
  },

  devsecops: {
    title: "DevSecOps",
    phases: [
      ["Foundations", [
        ["Linux and shell", "Permissions, Processes"],
        ["Networking", "TLS, DNS"],
        ["Git workflows", "Branching, Reviews"],
      ]],
      ["Core skills", [
        ["CI pipelines", "Build stages, Tests"],
        ["Containers", "Images, Image scanning"],
        ["Infrastructure as code", "Terraform, Policy as code"],
      ]],
      ["Build", [
        ["Secrets management", "Vault, Rotation"],
        ["Vulnerability scanning", "SAST, Dependencies"],
        ["Cloud IAM", "Roles, Least privilege"],
      ]],
      ["Specialize", [
        ["Threat modelling", "STRIDE, Attack paths"],
        ["Runtime security", "Admission control, eBPF"],
        ["Incident response", "Triage, Forensics"],
      ]],
      ["Career", [
        ["Compliance", "SOC 2, Audit evidence"],
        ["Interviews", "Security design, Troubleshooting"],
        ["Automation", "Guardrails, Runbooks"],
      ]],
    ],
  },

  "data-analyst": {
    title: "Data Analyst",
    phases: [
      ["Foundations", [
        ["Spreadsheets", "Formulas, Pivot tables"],
        ["SQL basics", "SELECT, JOIN"],
        ["Data literacy", "Metrics, Distributions"],
      ]],
      ["Core skills", [
        ["Advanced SQL", "Window functions, CTEs"],
        ["Python for data", "pandas, Cleaning"],
        ["Visualisation", "Chart choice, Dashboards"],
      ]],
      ["Build", [
        ["BI tools", "Power BI, Looker"],
        ["Reporting", "KPI trees, Stakeholders"],
        ["Experimentation", "A/B tests, Significance"],
      ]],
      ["Specialize", [
        ["Statistics", "Regression, Confidence"],
        ["Data modelling", "Star schema, Metrics layer"],
        ["Storytelling", "Narrative, Executive summaries"],
      ]],
      ["Career", [
        ["Portfolio", "Dashboard, Case study"],
        ["Interviews", "SQL rounds, Case rounds"],
        ["Domain depth", "Product, Marketing"],
      ]],
    ],
  },

  seo: {
    title: "SEO",
    phases: [
      ["Foundations", [
        ["How search works", "Crawling, Indexing"],
        ["Keyword research", "Intent, Difficulty"],
        ["Site architecture", "URLs, Internal links"],
      ]],
      ["Core skills", [
        ["On-page SEO", "Titles, Schema markup"],
        ["Technical SEO", "Core Web Vitals, Canonicals"],
        ["Content strategy", "Topic clusters, Briefs"],
      ]],
      ["Build", [
        ["Analytics", "GA4, Search Console"],
        ["Link building", "Outreach, Digital PR"],
        ["Local SEO", "Listings, Reviews"],
      ]],
      ["Specialize", [
        ["International SEO", "hreflang, Localisation"],
        ["E-commerce SEO", "Facets, Product schema"],
        ["AI search", "Entities, Citations"],
      ]],
      ["Career", [
        ["Audits", "Crawl reports, Prioritisation"],
        ["Interviews", "Case studies, Metrics"],
        ["Reporting", "Dashboards, Forecasts"],
      ]],
    ],
  },

  "inference-engineering": {
    title: "Inference Engineering",
    phases: [
      ["Foundations", [
        ["Model serving basics", "Latency, Throughput"],
        ["Model formats", "ONNX, Safetensors"],
        ["GPU basics", "Memory, Batching"],
      ]],
      ["Core skills", [
        ["Serving stacks", "vLLM, Triton"],
        ["Quantisation", "INT8, KV cache"],
        ["Autoscaling", "Cold start, Concurrency"],
      ]],
      ["Build", [
        ["Observability", "Tokens per second, Queue depth"],
        ["Cost control", "Batching, Spot GPUs"],
        ["Evaluation", "Quality, Regression suites"],
      ]],
      ["Specialize", [
        ["Distributed inference", "Sharding, Tensor parallel"],
        ["Optimisation", "Speculative decoding, Caching"],
        ["Reliability", "Failover, Rate limits"],
      ]],
      ["Career", [
        ["Capacity planning", "SLOs, Forecasting"],
        ["Interviews", "Systems, Debugging"],
        ["Production", "Runbooks, Incident reviews"],
      ]],
    ],
  },

  "ai-engineer": {
    title: "AI Engineer",
    phases: [
      ["Foundations", [
        ["Python for AI", "Async, Packaging"],
        ["LLM basics", "Tokens, Context windows"],
        ["Prompting", "Instructions, Examples"],
      ]],
      ["Core skills", [
        ["Embeddings and RAG", "Chunking, Retrieval"],
        ["Vector databases", "Indexes, Hybrid search"],
        ["Tool calling", "Schemas, Validation"],
      ]],
      ["Build", [
        ["Agents", "Planning, Memory"],
        ["Evaluation", "Golden sets, LLM judges"],
        ["Guardrails", "PII, Prompt injection"],
      ]],
      ["Specialize", [
        ["Fine-tuning", "LoRA, Datasets"],
        ["Multimodal", "Vision, Speech"],
        ["Serving", "Caching, Cost"],
      ]],
      ["Career", [
        ["AI product sense", "Use cases, UX"],
        ["Interviews", "System design, Debugging"],
        ["Safety", "Red teaming, Monitoring"],
      ]],
    ],
  },

  "ai-data-scientist": {
    title: "AI Data Scientist",
    phases: [
      ["Foundations", [
        ["Python and pandas", "Cleaning, Joins"],
        ["Statistics", "Distributions, Hypothesis tests"],
        ["SQL", "Aggregations, Window functions"],
      ]],
      ["Core skills", [
        ["Feature engineering", "Encoding, Leakage"],
        ["Classical ML", "Regression, Trees"],
        ["Evaluation", "Cross-validation, Metrics"],
      ]],
      ["Build", [
        ["Experimentation", "A/B tests, Power"],
        ["Model serving", "Batch, API"],
        ["Dashboards", "Metrics, Communication"],
      ]],
      ["Specialize", [
        ["Deep learning", "PyTorch, Training"],
        ["NLP", "Embeddings, Transformers"],
        ["MLOps", "Tracking, Monitoring"],
      ]],
      ["Career", [
        ["Portfolio", "End-to-end project, Write-up"],
        ["Interviews", "Case rounds, ML design"],
        ["Stakeholders", "Framing, Trade-offs"],
      ]],
    ],
  },

  "data-engineer": {
    title: "Data Engineer",
    phases: [
      ["Foundations", [
        ["SQL and modelling", "Normalisation, Star schema"],
        ["Python", "Files, APIs"],
        ["Linux and Git", "Shell, CI"],
      ]],
      ["Core skills", [
        ["ETL versus ELT", "Batch, Incremental loads"],
        ["Orchestration", "Airflow, DAG design"],
        ["Warehouses", "Snowflake, BigQuery"],
      ]],
      ["Build", [
        ["Streaming", "Kafka, Exactly-once"],
        ["Data quality", "Tests, Contracts"],
        ["Storage formats", "Parquet, Partitioning"],
      ]],
      ["Specialize", [
        ["Lakehouse", "Iceberg, Catalogs"],
        ["Performance", "Partition pruning, Joins"],
        ["Governance", "Lineage, PII"],
      ]],
      ["Career", [
        ["Pipelines at scale", "SLOs, Backfills"],
        ["Interviews", "SQL rounds, Design"],
        ["Reliability", "Monitoring, Runbooks"],
      ]],
    ],
  },

  "machine-learning": {
    title: "Machine Learning",
    phases: [
      ["Foundations", [
        ["Linear algebra", "Vectors, Matrices"],
        ["Probability", "Bayes, Distributions"],
        ["Python and NumPy", "Arrays, Vectorisation"],
      ]],
      ["Core skills", [
        ["Supervised learning", "Regression, Classification"],
        ["Model evaluation", "Bias and variance, ROC"],
        ["Feature pipelines", "Scaling, Encoding"],
      ]],
      ["Build", [
        ["scikit-learn", "Pipelines, Grid search"],
        ["Deep learning", "PyTorch, Training loops"],
        ["Experiment tracking", "MLflow, Artifacts"],
      ]],
      ["Specialize", [
        ["NLP", "Tokenisation, Transformers"],
        ["Computer vision", "CNNs, Augmentation"],
        ["Recommenders", "Collaborative, Ranking"],
      ]],
      ["Career", [
        ["MLOps", "Deployment, Monitoring"],
        ["Interviews", "Math, ML design"],
        ["Portfolio", "Paper reproduction, Project"],
      ]],
    ],
  },
};

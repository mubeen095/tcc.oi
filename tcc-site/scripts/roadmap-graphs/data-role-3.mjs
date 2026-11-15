// Curated TCC roadmap outlines — role-based batch 3.

export default {
  mlops: {
    title: "MLOps",
    phases: [
      ["Foundations", [
        ["ML lifecycle", "Training, Deployment"],
        ["Python and Docker", "Packaging, Images"],
        ["Cloud basics", "Storage, Compute"],
      ]],
      ["Core skills", [
        ["Experiment tracking", "MLflow, Artifacts"],
        ["Pipelines", "Prefect, Kubeflow"],
        ["Model registry", "Versions, Promotion"],
      ]],
      ["Build", [
        ["Serving", "FastAPI, Batch jobs"],
        ["Monitoring", "Drift, Latency"],
        ["CI/CD for models", "Tests, Rollback"],
      ]],
      ["Specialize", [
        ["Feature stores", "Online, Offline"],
        ["Governance", "Lineage, Approvals"],
        ["Cost control", "GPU usage, Autoscaling"],
      ]],
      ["Career", [
        ["Reliability", "SLOs, Incident response"],
        ["Interviews", "Design, Debugging"],
        ["Platform", "Self-service, Documentation"],
      ]],
    ],
  },

  "product-manager": {
    title: "Product Manager",
    phases: [
      ["Foundations", [
        ["Product discovery", "Problems, Users"],
        ["Metrics", "North star, Funnels"],
        ["Roadmaps", "Prioritisation, Outcomes"],
      ]],
      ["Core skills", [
        ["User research", "Interviews, Synthesis"],
        ["Requirements", "PRDs, Acceptance criteria"],
        ["Prioritisation", "RICE, Trade-offs"],
      ]],
      ["Build", [
        ["Delivery", "Sprints, Dependencies"],
        ["Analytics", "Events, Experiments"],
        ["Launch", "Go-to-market, Rollback"],
      ]],
      ["Specialize", [
        ["Strategy", "Positioning, Moats"],
        ["Pricing", "Packaging, Willingness to pay"],
        ["Platform products", "APIs, Ecosystem"],
      ]],
      ["Career", [
        ["Stakeholders", "Alignment, Communication"],
        ["Interviews", "Case rounds, Product sense"],
        ["Portfolio", "Case studies, Outcomes"],
      ]],
    ],
  },

  "engineering-manager": {
    title: "Engineering Manager",
    phases: [
      ["Foundations", [
        ["From IC to manager", "Delegation, Feedback"],
        ["Team health", "Trust, Clarity"],
        ["Delivery basics", "Planning, Risks"],
      ]],
      ["Core skills", [
        ["One-on-ones", "Coaching, Growth"],
        ["Hiring", "Scorecards, Interviews"],
        ["Performance", "Goals, Reviews"],
      ]],
      ["Build", [
        ["Roadmaps", "Capacity, Milestones"],
        ["Cross-team work", "Dependencies, Alignment"],
        ["Incident leadership", "Comms, Postmortems"],
      ]],
      ["Specialize", [
        ["Org design", "Teams, Interfaces"],
        ["Budget", "Headcount, Vendors"],
        ["Culture", "Values, Recognition"],
      ]],
      ["Career", [
        ["Stakeholder management", "Exec, Product"],
        ["Interviews", "Scenarios, Values"],
        ["Coaching", "Mentoring, Succession"],
      ]],
    ],
  },

  devrel: {
    title: "DevRel",
    phases: [
      ["Foundations", [
        ["Developer audiences", "Personas, Journeys"],
        ["Content formats", "Talks, Tutorials"],
        ["Community basics", "Discord, Forums"],
      ]],
      ["Core skills", [
        ["Technical writing", "Guides, Examples"],
        ["Public speaking", "Demos, Storytelling"],
        ["Sample apps", "APIs, SDKs"],
      ]],
      ["Build", [
        ["Workshops", "Labs, Feedback"],
        ["Advocacy programs", "Champions, Rewards"],
        ["Metrics", "Reach, Activation"],
      ]],
      ["Specialize", [
        ["Open source strategy", "Governance, Contributions"],
        ["Ecosystem", "Partners, Integrations"],
        ["Product feedback", "Signals, Loops"],
      ]],
      ["Career", [
        ["Personal brand", "Blog, Talks"],
        ["Interviews", "Demo, Strategy"],
        ["Events", "Conferences, Meetups"],
      ]],
    ],
  },

  "bi-analyst": {
    title: "BI Analyst",
    phases: [
      ["Foundations", [
        ["SQL", "Joins, Aggregations"],
        ["Data modelling", "Star schema, Grain"],
        ["Visual design", "Charts, Layout"],
      ]],
      ["Core skills", [
        ["Power BI", "Measures, Relationships"],
        ["Tableau", "Calculations, Dashboards"],
        ["Semantic layers", "Metrics, Definitions"],
      ]],
      ["Build", [
        ["Dashboards", "KPIs, Drilldowns"],
        ["Data quality", "Validation, Reconciliation"],
        ["Stakeholder discovery", "Questions, Scope"],
      ]],
      ["Specialize", [
        ["Performance", "Model size, Query folding"],
        ["Governance", "Certified data, Access"],
        ["Advanced analytics", "Forecasting, Cohorts"],
      ]],
      ["Career", [
        ["Portfolio", "Dashboard, Case study"],
        ["Interviews", "SQL, Dashboard critique"],
        ["Storytelling", "Narrative, Recommendations"],
      ]],
    ],
  },

  "ai-red-teaming": {
    title: "AI Red Teaming",
    phases: [
      ["Foundations", [
        ["LLM behaviour", "Tokens, Failure modes"],
        ["Threat modelling", "Assets, Attack surfaces"],
        ["Safety policy", "Harm categories, Rules"],
      ]],
      ["Core skills", [
        ["Prompt injection", "Direct, Indirect"],
        ["Jailbreak testing", "Templates, Mutations"],
        ["Data exfiltration", "Leakage, Canaries"],
      ]],
      ["Build", [
        ["Test harnesses", "Automation, Suites"],
        ["Evaluation", "Severity, Coverage"],
        ["Reporting", "Reproduction, Remediation"],
      ]],
      ["Specialize", [
        ["Agent risks", "Tool abuse, Memory"],
        ["Multimodal", "Images, Audio"],
        ["Model extraction", "Queries, Defences"],
      ]],
      ["Career", [
        ["Responsible disclosure", "Process, Ethics"],
        ["Interviews", "Scenarios, Write-ups"],
        ["Governance", "Reviews, Monitoring"],
      ]],
    ],
  },

  "network-engineer": {
    title: "Network Engineer",
    phases: [
      ["Foundations", [
        ["OSI and TCP/IP", "Layers, Encapsulation"],
        ["IP addressing", "Subnets, CIDR"],
        ["Routing basics", "Static, OSPF"],
      ]],
      ["Core skills", [
        ["Switching", "VLANs, Spanning tree"],
        ["Firewalls", "ACLs, NAT"],
        ["DNS and DHCP", "Records, Leases"],
      ]],
      ["Build", [
        ["WAN and VPN", "IPsec, Tunnels"],
        ["Load balancing", "Health checks, TLS"],
        ["Monitoring", "SNMP, NetFlow"],
      ]],
      ["Specialize", [
        ["Cloud networking", "VPCs, Peering"],
        ["Automation", "Ansible, Python"],
        ["Security", "Segmentation, Zero trust"],
      ]],
      ["Career", [
        ["Troubleshooting", "Packet capture, Path analysis"],
        ["Interviews", "Scenarios, Design"],
        ["Certifications", "CCNA, CCNP"],
      ]],
    ],
  },
};

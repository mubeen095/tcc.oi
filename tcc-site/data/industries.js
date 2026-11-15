/* ============================================================================
 * TCC CERT+ role catalogue — SOURCE OF TRUTH.
 * 32 industries / 262 roles. Each role is [title, base cert name, default tier].
 * scripts/build-certs.js expands this into the 4-tier CERT+ catalog
 * (262 roles x 4 tiers = 1,048 certifications) at public/certs-data.js
 * ==========================================================================*/
module.exports = [
        { id: "foundation", name: "Foundation", roles: [
          ["Any Professional", "CERT+ AI Foundation", "Foundation"],
          ["Everyone", "CERT+ AI for Everyone", "Foundation"],
          ["Any Role", "CERT+ Prompting Fundamentals", "Foundation"],
          ["Office Professional", "CERT+ AI Productivity", "Foundation"],
          ["All Staff", "CERT+ AI Ethics & Responsible Use", "Foundation"],
          ["Managers", "CERT+ AI Literacy for Managers", "Foundation"]
        ]},
        { id: "software", name: "Software & IT", roles: [
          ["Software Engineer", "CERT+ AI Software Engineer", "Practitioner"],
          ["Full-Stack Developer", "CERT+ AI Full-Stack Developer", "Practitioner"],
          ["Frontend Developer", "CERT+ AI Frontend Developer", "Practitioner"],
          ["Backend Developer", "CERT+ AI Backend Developer", "Practitioner"],
          ["Mobile Developer", "CERT+ AI Mobile Developer", "Practitioner"],
          ["AI Engineer", "CERT+ AI Engineer", "Practitioner"],
          ["Vibe Coder", "CERT+ Vibe Coder", "Practitioner"],
          ["Prompt Engineer", "CERT+ Prompt Engineer", "Practitioner"],
          ["Context Engineer", "CERT+ Context Engineer", "Strategist"],
          ["RAG Engineer", "CERT+ RAG Engineer", "Strategist"],
          ["DevOps / SRE", "CERT+ AI DevOps Engineer", "Practitioner"],
          ["Cloud Architect", "CERT+ AI Cloud Architect", "Strategist"],
          ["QA / Test Engineer", "CERT+ AI QA Engineer", "Practitioner"],
          ["Solutions Architect", "CERT+ AI Solutions Architect", "Strategist"],
          ["Systems Administrator", "CERT+ AI Systems Administrator", "Practitioner"],
          ["Database Administrator", "CERT+ AI Database Engineer", "Practitioner"],
          ["Technical Writer", "CERT+ AI Technical Writer", "Practitioner"],
          ["Scrum Master", "CERT+ AI Scrum Master", "Practitioner"],
          ["Product Manager", "CERT+ AI Product Manager", "Practitioner"],
          ["Engineering Manager", "CERT+ AI Engineering Manager", "Strategist"],
          ["CTO", "CERT+ AI CTO", "Executive"]
        ]},
        { id: "data", name: "AI, Data & Emerging Tech", roles: [
          ["Data Scientist", "CERT+ AI Data Scientist", "Practitioner"],
          ["Data Analyst", "CERT+ AI Data Analyst", "Practitioner"],
          ["BI Analyst", "CERT+ AI Business Intelligence Analyst", "Practitioner"],
          ["Data Engineer", "CERT+ AI Data Engineer", "Practitioner"],
          ["ML Engineer", "CERT+ ML Engineer", "Strategist"],
          ["MLOps Engineer", "CERT+ MLOps Engineer", "Strategist"],
          ["AI Researcher", "CERT+ AI Researcher", "Strategist"],
          ["Computer Vision Engineer", "CERT+ Computer Vision Engineer", "Strategist"],
          ["NLP Engineer", "CERT+ NLP Engineer", "Strategist"],
          ["AI Agent Developer", "CERT+ AI Agent Developer", "Strategist"],
          ["Robotics Engineer", "CERT+ AI Robotics Engineer", "Strategist"],
          ["Quantum Computing Specialist", "CERT+ Quantum Computing", "Strategist"],
          ["AI Ethicist", "CERT+ AI Ethics Officer", "Strategist"],
          ["AI Auditor", "CERT+ AI Auditor", "Strategist"]
        ]},
        { id: "security", name: "Cybersecurity", roles: [
          ["Security Analyst", "CERT+ AI Security Analyst", "Practitioner"],
          ["Ethical Hacker", "CERT+ AI Ethical Hacker", "Strategist"],
          ["Security Architect", "CERT+ AI Security Architect", "Strategist"],
          ["SOC Analyst", "CERT+ AI SOC Analyst", "Practitioner"],
          ["GRC / Compliance", "CERT+ AI Compliance Practitioner", "Practitioner"],
          ["Network Engineer", "CERT+ AI Network Engineer", "Practitioner"],
          ["Incident Responder", "CERT+ AI Incident Responder", "Strategist"],
          ["Digital Forensics", "CERT+ AI Forensics Analyst", "Strategist"],
          ["CISO", "CERT+ AI CISO", "Executive"]
        ]},
        { id: "healthcare", name: "Healthcare", roles: [
          ["Doctor", "CERT+ AI Doctor", "Practitioner"],
          ["Nurse", "CERT+ AI Nurse", "Practitioner"],
          ["Pharmacist", "CERT+ AI Pharmacist", "Practitioner"],
          ["Medical Assistant", "CERT+ AI Medical Assistant", "Practitioner"],
          ["Healthcare Administrator", "CERT+ AI Healthcare Administrator", "Practitioner"],
          ["Radiologist", "CERT+ AI Radiology", "Strategist"],
          ["Dentist", "CERT+ AI Dentist", "Practitioner"],
          ["Surgeon", "CERT+ AI Surgery", "Strategist"],
          ["Physiotherapist", "CERT+ AI Physiotherapist", "Practitioner"],
          ["Mental Health Counselor", "CERT+ AI Mental Health Practitioner", "Practitioner"],
          ["Public Health Officer", "CERT+ AI Public Health", "Strategist"],
          ["Clinical Researcher", "CERT+ AI Clinical Research", "Strategist"],
          ["Hospital Operations", "CERT+ AI Hospital Operations", "Strategist"]
        ]},
        { id: "pharma", name: "Pharma & Biotech", roles: [
          ["Pharma Researcher", "CERT+ AI Pharma Researcher", "Strategist"],
          ["Clinical Trials Manager", "CERT+ AI Clinical Trials", "Strategist"],
          ["Biotech Engineer", "CERT+ AI Biotech Engineer", "Strategist"],
          ["Regulatory Affairs", "CERT+ AI Regulatory Affairs", "Strategist"],
          ["Drug Safety", "CERT+ AI Drug Safety", "Practitioner"],
          ["Genomics Specialist", "CERT+ AI Genomics", "Strategist"]
        ]},
        { id: "finance", name: "Finance & Banking", roles: [
          ["Financial Analyst", "CERT+ AI Financial Analyst", "Practitioner"],
          ["Accountant", "CERT+ AI Accountant", "Practitioner"],
          ["Auditor", "CERT+ AI Auditor", "Practitioner"],
          ["Risk Manager", "CERT+ AI Risk Manager", "Strategist"],
          ["Investment Banker", "CERT+ AI Investment Banker", "Strategist"],
          ["Wealth Advisor", "CERT+ AI Wealth Advisor", "Practitioner"],
          ["Quant / Trader", "CERT+ AI Quant Analyst", "Strategist"],
          ["Actuary", "CERT+ AI Actuary", "Strategist"],
          ["Loan Officer", "CERT+ AI Loan Officer", "Practitioner"],
          ["Fintech / Payments", "CERT+ AI Fintech Practitioner", "Strategist"],
          ["Compliance Officer", "CERT+ AI Compliance Officer", "Strategist"]
        ]},
        { id: "insurance", name: "Insurance & Risk", roles: [
          ["Underwriter", "CERT+ AI Underwriter", "Practitioner"],
          ["Claims Adjuster", "CERT+ AI Claims Adjuster", "Practitioner"],
          ["Risk Analyst", "CERT+ AI Risk Analyst", "Practitioner"],
          ["Fraud Investigator", "CERT+ AI Fraud Investigator", "Strategist"],
          ["Insurance Broker", "CERT+ AI Insurance Broker", "Practitioner"]
        ]},
        { id: "legal", name: "Legal", roles: [
          ["Lawyer", "CERT+ AI Lawyer", "Practitioner"],
          ["Paralegal", "CERT+ AI Paralegal", "Practitioner"],
          ["Legal Ops", "CERT+ AI Legal Operations", "Practitioner"],
          ["Contract Manager", "CERT+ AI Contract Manager", "Practitioner"],
          ["IP Specialist", "CERT+ AI IP Specialist", "Strategist"],
          ["Policy Maker", "CERT+ AI Policy Maker", "Strategist"],
          ["Legal Researcher", "CERT+ AI Legal Researcher", "Practitioner"],
          ["Court Administrator", "CERT+ AI Court Administrator", "Practitioner"]
        ]},
        { id: "government", name: "Government & Public Sector", roles: [
          ["Civil Servant", "CERT+ AI Civil Servant", "Practitioner"],
          ["Public Administrator", "CERT+ AI Public Administrator", "Strategist"],
          ["Intelligence Analyst", "CERT+ AI Intelligence Analyst", "Strategist"],
          ["Urban Planner", "CERT+ AI Urban Planner", "Strategist"],
          ["Municipal Officer", "CERT+ AI Municipal Officer", "Practitioner"],
          ["Election Official", "CERT+ AI Election Official", "Foundation"],
          ["Diplomat", "CERT+ AI Diplomat", "Strategist"]
        ]},
        { id: "defence", name: "Defence & Military", roles: [
          ["Military Officer", "CERT+ AI Military Officer", "Strategist"],
          ["Defence Analyst", "CERT+ AI Defence Analyst", "Strategist"],
          ["Cyber Warfare", "CERT+ AI Cyber Warfare", "Strategist"],
          ["Logistics Officer", "CERT+ AI Defence Logistics", "Practitioner"],
          ["Intelligence Officer", "CERT+ AI Intelligence Officer", "Strategist"],
          ["Veteran (career transition)", "CERT+ AI Career Transition", "Foundation"]
        ]},
        { id: "education", name: "Education & Academia", roles: [
          ["Teacher", "CERT+ AI Educator", "Practitioner"],
          ["Professor", "CERT+ AI Professor", "Strategist"],
          ["L&D Specialist", "CERT+ AI Learning & Development", "Practitioner"],
          ["Instructional Designer", "CERT+ AI Instructional Designer", "Practitioner"],
          ["School Administrator", "CERT+ AI School Administrator", "Practitioner"],
          ["EdTech Specialist", "CERT+ AI EdTech Specialist", "Practitioner"],
          ["Career Counselor", "CERT+ AI Career Counselor", "Practitioner"],
          ["Librarian", "CERT+ AI Librarian", "Foundation"],
          ["Admissions Officer", "CERT+ AI Admissions Officer", "Practitioner"]
        ]},
        { id: "marketing", name: "Marketing & PR", roles: [
          ["Marketing Manager", "CERT+ AI Marketing Manager", "Practitioner"],
          ["Digital Marketer", "CERT+ AI Digital Marketer", "Practitioner"],
          ["SEO Specialist", "CERT+ AI SEO Specialist", "Practitioner"],
          ["Content Writer", "CERT+ AI Content Writer", "Practitioner"],
          ["Copywriter", "CERT+ AI Copywriter", "Practitioner"],
          ["Brand Manager", "CERT+ AI Brand Manager", "Practitioner"],
          ["Social Media Manager", "CERT+ AI Social Media Manager", "Practitioner"],
          ["PR Specialist", "CERT+ AI PR Specialist", "Practitioner"],
          ["Growth Marketer", "CERT+ AI Growth Marketer", "Strategist"],
          ["Media Buyer", "CERT+ AI Media Buyer", "Practitioner"],
          ["Market Researcher", "CERT+ AI Market Researcher", "Practitioner"]
        ]},
        { id: "sales", name: "Sales & Customer Success", roles: [
          ["Sales Representative", "CERT+ AI Sales Rep", "Practitioner"],
          ["Account Executive", "CERT+ AI Account Executive", "Practitioner"],
          ["Sales Manager", "CERT+ AI Sales Manager", "Strategist"],
          ["Business Development", "CERT+ AI Business Development", "Practitioner"],
          ["Customer Success", "CERT+ AI Customer Success", "Practitioner"],
          ["Customer Support", "CERT+ AI Customer Support", "Foundation"],
          ["Account Manager", "CERT+ AI Account Manager", "Practitioner"],
          ["Revenue Ops", "CERT+ AI Revenue Operations", "Strategist"]
        ]},
        { id: "hr", name: "HR & Recruiting", roles: [
          ["HR Generalist", "CERT+ AI HR Practitioner", "Practitioner"],
          ["Recruiter", "CERT+ AI Talent Acquisition", "Practitioner"],
          ["HR Business Partner", "CERT+ AI HRBP", "Strategist"],
          ["L&D Manager", "CERT+ AI L&D Manager", "Practitioner"],
          ["Compensation Analyst", "CERT+ AI Compensation Analyst", "Practitioner"],
          ["People Ops", "CERT+ AI People Operations", "Practitioner"],
          ["DEI Specialist", "CERT+ AI DEI Specialist", "Foundation"]
        ]},
        { id: "design", name: "Design & Creative", roles: [
          ["Graphic Designer", "CERT+ AI Graphic Designer", "Practitioner"],
          ["UX / UI Designer", "CERT+ AI UX Designer", "Practitioner"],
          ["Product Designer", "CERT+ AI Product Designer", "Practitioner"],
          ["Motion Designer", "CERT+ AI Motion Designer", "Practitioner"],
          ["Illustrator", "CERT+ AI Illustrator", "Practitioner"],
          ["Brand Designer", "CERT+ AI Brand Designer", "Practitioner"],
          ["3D Artist", "CERT+ AI 3D Artist", "Practitioner"],
          ["Art Director", "CERT+ AI Art Director", "Strategist"],
          ["Creative Director", "CERT+ AI Creative Director", "Executive"]
        ]},
        { id: "media", name: "Media & Journalism", roles: [
          ["Journalist", "CERT+ AI Journalist", "Practitioner"],
          ["Editor", "CERT+ AI Editor", "Practitioner"],
          ["Content Producer", "CERT+ AI Content Producer", "Practitioner"],
          ["Video Editor", "CERT+ AI Video Editor", "Practitioner"],
          ["Filmmaker", "CERT+ AI Filmmaker", "Strategist"],
          ["Audio Engineer", "CERT+ AI Audio Engineer", "Practitioner"],
          ["Podcaster", "CERT+ AI Podcaster", "Foundation"],
          ["Music Producer", "CERT+ AI Music Producer", "Practitioner"],
          ["Animator", "CERT+ AI Animator", "Practitioner"],
          ["Screenwriter", "CERT+ AI Screenwriter", "Practitioner"],
          ["Creator / Streamer", "CERT+ AI Creator", "Foundation"]
        ]},
        { id: "gaming", name: "Gaming & Esports", roles: [
          ["Game Designer", "CERT+ AI Game Designer", "Practitioner"],
          ["Game Developer", "CERT+ AI Game Developer", "Practitioner"],
          ["Game Artist", "CERT+ AI Game Artist", "Practitioner"],
          ["Level Designer", "CERT+ AI Level Designer", "Practitioner"],
          ["Esports Manager", "CERT+ AI Esports Manager", "Practitioner"],
          ["QA Tester", "CERT+ AI Game QA Tester", "Foundation"]
        ]},
        { id: "manufacturing", name: "Manufacturing", roles: [
          ["Manufacturing Engineer", "CERT+ AI Manufacturing Engineer", "Practitioner"],
          ["Production Manager", "CERT+ AI Production Manager", "Strategist"],
          ["Quality Engineer", "CERT+ AI Quality Engineer", "Practitioner"],
          ["Process Engineer", "CERT+ AI Process Engineer", "Strategist"],
          ["Automation / Robotics", "CERT+ AI Automation Engineer", "Strategist"],
          ["Maintenance Technician", "CERT+ AI Maintenance Technician", "Foundation"],
          ["Lean / Six Sigma", "CERT+ AI Lean Practitioner", "Practitioner"],
          ["R&D Engineer", "CERT+ AI R&D Engineer", "Strategist"]
        ]},
        { id: "construction", name: "Construction & Real Estate", roles: [
          ["Architect", "CERT+ AI Architect", "Practitioner"],
          ["Civil Engineer", "CERT+ AI Civil Engineer", "Practitioner"],
          ["Construction PM", "CERT+ AI Construction Manager", "Strategist"],
          ["Site Engineer", "CERT+ AI Site Engineer", "Practitioner"],
          ["Structural Engineer", "CERT+ AI Structural Engineer", "Strategist"],
          ["Interior Designer", "CERT+ AI Interior Designer", "Practitioner"],
          ["Surveyor", "CERT+ AI Surveyor", "Practitioner"],
          ["Real Estate Agent", "CERT+ AI Real Estate Agent", "Practitioner"],
          ["Property Manager", "CERT+ AI Property Manager", "Practitioner"]
        ]},
        { id: "retail", name: "Retail & E-commerce", roles: [
          ["Retail Manager", "CERT+ AI Retail Manager", "Practitioner"],
          ["Merchandiser", "CERT+ AI Merchandiser", "Practitioner"],
          ["Category Manager", "CERT+ AI Category Manager", "Strategist"],
          ["E-commerce Specialist", "CERT+ AI E-commerce Specialist", "Practitioner"],
          ["Buyer", "CERT+ AI Retail Buyer", "Practitioner"],
          ["Store Operations", "CERT+ AI Store Operations", "Foundation"],
          ["Retail CX", "CERT+ AI Retail CX", "Practitioner"]
        ]},
        { id: "supplychain", name: "Supply Chain & Logistics", roles: [
          ["Supply Chain Manager", "CERT+ AI Supply Chain Manager", "Strategist"],
          ["Logistics Coordinator", "CERT+ AI Logistics Coordinator", "Foundation"],
          ["Procurement Specialist", "CERT+ AI Procurement", "Practitioner"],
          ["Warehouse Manager", "CERT+ AI Warehouse Manager", "Practitioner"],
          ["Fleet Manager", "CERT+ AI Fleet Manager", "Practitioner"],
          ["Demand Planner", "CERT+ AI Demand Planner", "Strategist"],
          ["Customs / Trade", "CERT+ AI Trade Compliance", "Practitioner"]
        ]},
        { id: "agriculture", name: "Agriculture & Food", roles: [
          ["Agronomist", "CERT+ AI Agronomist", "Practitioner"],
          ["Agri-Tech Specialist", "CERT+ AI Agri-Tech", "Strategist"],
          ["Food Scientist", "CERT+ AI Food Scientist", "Practitioner"],
          ["Agri-Engineer", "CERT+ AI Agri-Engineer", "Practitioner"],
          ["Livestock Manager", "CERT+ AI Livestock Manager", "Foundation"],
          ["Food Safety Officer", "CERT+ AI Food Safety", "Practitioner"]
        ]},
        { id: "energy", name: "Energy & Sustainability", roles: [
          ["Energy Analyst", "CERT+ AI Energy Analyst", "Practitioner"],
          ["Oil & Gas Engineer", "CERT+ AI Oil & Gas Engineer", "Practitioner"],
          ["Renewable Energy Engineer", "CERT+ AI Renewable Energy Engineer", "Strategist"],
          ["ESG / Sustainability Officer", "CERT+ AI Sustainability Officer", "Strategist"],
          ["Grid / Utility Engineer", "CERT+ AI Utility Engineer", "Strategist"],
          ["Environmental Scientist", "CERT+ AI Environmental Scientist", "Practitioner"]
        ]},
        { id: "telecom", name: "Telecom & Networking", roles: [
          ["Telecom Engineer", "CERT+ AI Telecom Engineer", "Practitioner"],
          ["Network Architect", "CERT+ AI Network Architect", "Strategist"],
          ["RF Engineer", "CERT+ AI RF Engineer", "Practitioner"],
          ["5G Specialist", "CERT+ AI 5G Specialist", "Strategist"],
          ["Field Technician", "CERT+ AI Field Technician", "Foundation"],
          ["Network Operations", "CERT+ AI Network Operations", "Practitioner"]
        ]},
        { id: "transport", name: "Transport & Aviation", roles: [
          ["Automotive Engineer", "CERT+ AI Automotive Engineer", "Practitioner"],
          ["EV Specialist", "CERT+ AI EV Specialist", "Strategist"],
          ["Autonomous Systems", "CERT+ AI Autonomous Systems Engineer", "Strategist"],
          ["Pilot", "CERT+ AI Pilot", "Practitioner"],
          ["Aviation Operations", "CERT+ AI Aviation Operations", "Practitioner"],
          ["Air Traffic Controller", "CERT+ AI Air Traffic", "Strategist"],
          ["Railway Professional", "CERT+ AI Railway Operations", "Foundation"],
          ["Marine Professional", "CERT+ AI Marine Operations", "Foundation"]
        ]},
        { id: "hospitality", name: "Hospitality & Travel", roles: [
          ["Hotel Manager", "CERT+ AI Hotel Manager", "Practitioner"],
          ["Travel Consultant", "CERT+ AI Travel Consultant", "Practitioner"],
          ["Chef / Culinary", "CERT+ AI Culinary", "Foundation"],
          ["Event Manager", "CERT+ AI Event Manager", "Practitioner"],
          ["Tourism Officer", "CERT+ AI Tourism Officer", "Practitioner"],
          ["Guest Experience Manager", "CERT+ AI Guest Experience", "Practitioner"]
        ]},
        { id: "mining", name: "Mining & Resources", roles: [
          ["Mining Engineer", "CERT+ AI Mining Engineer", "Strategist"],
          ["Geologist", "CERT+ AI Geologist", "Practitioner"],
          ["Metallurgist", "CERT+ AI Metallurgist", "Practitioner"],
          ["HSE Officer", "CERT+ AI HSE Officer", "Practitioner"],
          ["Exploration Analyst", "CERT+ AI Exploration Analyst", "Strategist"]
        ]},
        { id: "consulting", name: "Consulting & Strategy", roles: [
          ["Management Consultant", "CERT+ AI Management Consultant", "Strategist"],
          ["Strategy Analyst", "CERT+ AI Strategy Analyst", "Strategist"],
          ["Business Analyst", "CERT+ AI Business Analyst", "Practitioner"],
          ["Transformation Lead", "CERT+ AI Transformation Lead", "Executive"],
          ["Change Manager", "CERT+ AI Change Manager", "Strategist"],
          ["ESG Consultant", "CERT+ AI ESG Consultant", "Strategist"]
        ]},
        { id: "blockchain", name: "Blockchain & Web3", roles: [
          ["Blockchain Developer", "CERT+ Blockchain Developer", "Practitioner"],
          ["Smart Contract Auditor", "CERT+ AI Smart Contract Auditor", "Strategist"],
          ["Crypto Analyst", "CERT+ AI Crypto Analyst", "Practitioner"],
          ["Web3 Product Manager", "CERT+ Web3 Product Manager", "Strategist"],
          ["DeFi Analyst", "CERT+ AI DeFi Analyst", "Strategist"]
        ]},
        { id: "nonprofit", name: "Non-Profit, Sports & Service", roles: [
          ["Non-Profit Manager", "CERT+ AI Non-Profit Manager", "Practitioner"],
          ["Fundraiser", "CERT+ AI Fundraising", "Practitioner"],
          ["Sports Analyst", "CERT+ AI Sports Analyst", "Practitioner"],
          ["Coach", "CERT+ AI Coach", "Practitioner"],
          ["Social Worker", "CERT+ AI Social Worker", "Foundation"],
          ["Community Manager", "CERT+ AI Community Manager", "Foundation"]
        ]},
        { id: "executive", name: "Executive & Leadership", roles: [
          ["CEO", "CERT+ AI CEO", "Executive"],
          ["COO", "CERT+ AI COO", "Executive"],
          ["CFO", "CERT+ AI CFO", "Executive"],
          ["CTO", "CERT+ AI CTO", "Executive"],
          ["CISO", "CERT+ AI CISO", "Executive"],
          ["CHRO", "CERT+ AI CHRO", "Executive"],
          ["CMO", "CERT+ AI CMO", "Executive"],
          ["Chief AI Officer", "CERT+ Chief AI Officer", "Executive"],
          ["Founder / Entrepreneur", "CERT+ AI Founder", "Executive"],
          ["Board Director", "CERT+ AI Board Director", "Executive"]
        ]}
      ];

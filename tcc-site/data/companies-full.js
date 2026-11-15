'use strict';
const COMPANIES = [
  {
    "id": "tcs",
    "name": "TCS",
    "sector": "IT Services",
    "tint": "#7b1fa2",
    "mark": "TCS",
    "rounds": [
      "Aptitude",
      "Verbal",
      "Reasoning",
      "Programming Logic",
      "Coding (1–2 problems)"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the TCS NQT National Qualifier Test",
    "focus": "Aptitude speed is the differentiator. The numerical and reasoning sections are large and tightly timed, so accuracy under pressure matters more than depth.",
    "topics": [
      "Percentages",
      "Time and Work",
      "Time, Speed and Distance",
      "Number System",
      "Logical Reasoning",
      "Data Interpretation"
    ],
    "tip": "Practise full-length timed papers. Most candidates run out of time rather than out of knowledge.",
    "eligibility": "Typically 60%+ throughout academics; no active backlogs at the time of the test",
    "logoFile": "assets/img/company/tcs.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "infosys",
    "name": "Infosys",
    "sector": "IT Services",
    "tint": "#007cc3",
    "mark": "INFY",
    "rounds": [
      "Online aptitude test",
      "Technical interview",
      "HR interview"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Infosys online aptitude and coding assessment",
    "focus": "The aptitude section rewards clean arithmetic and pattern spotting. Coding rewards a correct brute-force solution over an elegant incomplete one.",
    "topics": [
      "Percentages",
      "Profit and Loss",
      "Puzzles",
      "Series",
      "Programming Logic",
      "Verbal Ability"
    ],
    "tip": "Get the first coding problem fully passing before optimising. A working solution beats a clever one that fails hidden tests.",
    "eligibility": "Typically 60%+ in Class 10, 12 and graduation; no active backlogs",
    "logoFile": "assets/img/company/infosys.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "wipro",
    "name": "Wipro",
    "sector": "IT Services",
    "tint": "#5a2d82",
    "mark": "WIPRO",
    "rounds": [
      "NLTH aptitude",
      "Coding",
      "Technical interview",
      "HR interview"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Wipro NLTH / Elite assessment",
    "focus": "The NLTH combines a broad aptitude round with a written coding section. Breadth of accuracy across topics beats specialising in one.",
    "topics": [
      "Percentages",
      "Ratios",
      "Series",
      "Logical Reasoning",
      "Programming Logic",
      "Verbal Ability"
    ],
    "tip": "Attempt every aptitude question — there is no negative marking in most NLTH rounds.",
    "eligibility": "Typically 60%+ throughout academics; open to 2025 and 2026 graduates in most cycles",
    "logoFile": "assets/img/company/wipro.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "ibm",
    "name": "IBM",
    "sector": "IT Services",
    "tint": "#0f62fe",
    "mark": "IBM",
    "rounds": [
      "Cognitive aptitude",
      "Technical MCQ",
      "Coding",
      "Technical interview"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the IBM cognitive and coding assessment",
    "focus": "A cognitive opener with quantitative, reasoning and verbal sections, then a technical block and a coding problem. Broad fundamentals matter more than one strong area.",
    "topics": [
      "Percentages",
      "Logical Reasoning",
      "Verbal Ability",
      "DBMS",
      "Programming Logic",
      "Arrays"
    ],
    "tip": "Do not specialise — IBM weights the cognitive sections heavily, so a weak opener ends the process early.",
    "eligibility": "Typically 60%+ throughout academics; no active backlogs",
    "logoFile": "assets/img/company/ibm.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "hcl",
    "name": "HCLTech",
    "sector": "IT Services",
    "tint": "#0b5cab",
    "mark": "HCL",
    "rounds": [
      "Aptitude",
      "Technical MCQ",
      "Coding",
      "Technical interview"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the HCLTech online assessment",
    "focus": "A balanced paper: quantitative, reasoning and a technical MCQ block. Clean fundamentals across the board carry the paper.",
    "topics": [
      "Percentages",
      "Time and Work",
      "Logical Reasoning",
      "DBMS",
      "Operating Systems",
      "Programming Logic"
    ],
    "tip": "Do not neglect the technical MCQ block — it is where otherwise-strong candidates quietly lose marks.",
    "eligibility": "Typically 60%+ throughout academics; no active backlogs",
    "logoFile": "assets/img/company/hcl.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "techmahindra",
    "name": "Tech Mahindra",
    "sector": "IT Services",
    "tint": "#c8102e",
    "mark": "TECHM",
    "rounds": [
      "Aptitude",
      "English",
      "Technical MCQ",
      "Coding"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Tech Mahindra online assessment",
    "focus": "English carries more weight here than at most IT-services employers, alongside a standard quantitative and reasoning block.",
    "topics": [
      "Verbal Ability",
      "Percentages",
      "Logical Reasoning",
      "Programming Logic",
      "DBMS"
    ],
    "tip": "Give the English section real preparation time. It is a differentiator, not a formality.",
    "eligibility": "Typically 60%+ throughout academics; no active backlogs",
    "logoFile": "assets/img/company/techmahindra.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "ltimindtree",
    "name": "LTIMindtree",
    "sector": "IT Services",
    "tint": "#e4002b",
    "mark": "LTIM",
    "rounds": [
      "Aptitude",
      "Technical MCQ",
      "Coding",
      "Technical interview"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the LTIMindtree online assessment",
    "focus": "A tightly timed aptitude block plus a technical section. Consistency across sections is what clears the cut.",
    "topics": [
      "Percentages",
      "Time, Speed and Distance",
      "Logical Reasoning",
      "DBMS",
      "Programming Logic"
    ],
    "tip": "Time yourself on every practice set. The real paper is unforgiving on pace.",
    "eligibility": "Typically 60%+ throughout academics; no active backlogs",
    "logoFile": "assets/img/company/ltimindtree.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "mphasis",
    "name": "Mphasis",
    "sector": "IT Services",
    "tint": "#0091da",
    "mark": "MPHS",
    "rounds": [
      "Aptitude",
      "Technical MCQ",
      "Coding"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ]
    },
    "gate": "the Mphasis online assessment",
    "focus": "A compact aptitude round followed by a technical MCQ block. Fundamentals in both decide the outcome.",
    "topics": [
      "Percentages",
      "Logical Reasoning",
      "DBMS",
      "Operating Systems",
      "Programming Logic"
    ],
    "tip": "Revise core CS one-liners — many technical MCQs test recall, not deep reasoning.",
    "eligibility": "Typically 60%+ throughout academics",
    "logoFile": "assets/img/company/mphasis.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "persistent",
    "name": "Persistent Systems",
    "sector": "IT Services",
    "tint": "#e21b2d",
    "mark": "PSYS",
    "rounds": [
      "Aptitude",
      "Technical MCQ",
      "Coding",
      "Technical interview"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Persistent Systems online assessment",
    "focus": "Stronger on technical depth than a pure aptitude paper. Expect programming-logic and CS-fundamentals questions to carry weight.",
    "topics": [
      "Programming Logic",
      "DBMS",
      "Operating Systems",
      "Logical Reasoning",
      "Percentages"
    ],
    "tip": "For a product-leaning services firm, coding clarity matters more than aptitude volume.",
    "eligibility": "Typically 60%+ throughout academics; strong programming fundamentals expected",
    "logoFile": "assets/img/company/persistent.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "coforge",
    "name": "Coforge",
    "sector": "IT Services",
    "tint": "#7b2d8e",
    "mark": "CFRG",
    "rounds": [
      "Aptitude",
      "Technical MCQ",
      "Coding"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Coforge online assessment",
    "focus": "Standard services-firm paper: quantitative and reasoning with a technical and coding tail.",
    "topics": [
      "Percentages",
      "Ratios",
      "Logical Reasoning",
      "DBMS",
      "Programming Logic"
    ],
    "tip": "Bank your aptitude marks early; the coding section is where tie-breaks happen.",
    "eligibility": "Typically 60%+ throughout academics; no active backlogs",
    "logoFile": "assets/img/company/coforge.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "capgemini",
    "name": "Capgemini",
    "sector": "IT Services",
    "tint": "#0070ad",
    "mark": "CAPG",
    "rounds": [
      "Cognitive aptitude",
      "English",
      "Technical MCQ",
      "Coding"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Capgemini cognitive and technical assessment",
    "focus": "The cognitive round is a mix of numerical, logical and English with a technical and coding section. Balanced papers suit candidates with broad fundamentals.",
    "topics": [
      "Percentages",
      "Logical Reasoning",
      "Verbal Ability",
      "DBMS",
      "Programming Logic"
    ],
    "tip": "Watch the pseudo-code questions — they reward careful hand-tracing, not guessing.",
    "eligibility": "Typically 60%+ throughout academics; no active backlogs",
    "logoFile": "assets/img/company/capgemini.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "cognizant",
    "name": "Cognizant",
    "sector": "IT Services",
    "tint": "#1667c1",
    "mark": "CTS",
    "rounds": [
      "GenC aptitude",
      "Technical MCQ",
      "Coding",
      "Technical interview"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Cognizant GenC assessment",
    "focus": "GenC runs a quantitative-and-reasoning opener with a technical section and a coding problem. Clean arithmetic plus one solid solution is usually enough.",
    "topics": [
      "Percentages",
      "Profit and Loss",
      "Logical Reasoning",
      "Programming Logic",
      "DBMS"
    ],
    "tip": "For GenC, getting the coding problem to pass every test case matters more than solving it fast.",
    "eligibility": "Typically 60%+ throughout academics; no active backlogs",
    "logoFile": "assets/img/company/cognizant.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "genpact",
    "name": "Genpact",
    "sector": "IT Services",
    "tint": "#f47920",
    "mark": "GNP",
    "rounds": [
      "Aptitude",
      "English",
      "Technical MCQ"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ]
    },
    "gate": "the Genpact online assessment",
    "focus": "Aptitude and English carry the paper, with a lighter technical block. Communication-heavy roles weight verbal ability more.",
    "topics": [
      "Verbal Ability",
      "Percentages",
      "Logical Reasoning",
      "DBMS"
    ],
    "tip": "For BPM and consulting-track roles, treat the English section as a core section, not a filler.",
    "eligibility": "Typically 60%+ throughout academics; good written English expected",
    "logoFile": "assets/img/company/genpact.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "virtusa",
    "name": "Virtusa",
    "sector": "IT Services",
    "tint": "#00a0df",
    "mark": "VRTS",
    "rounds": [
      "Aptitude",
      "Technical MCQ",
      "Coding"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Virtusa online assessment",
    "focus": "A coding-forward services paper. Programming logic and one solved problem weigh heavily.",
    "topics": [
      "Programming Logic",
      "DBMS",
      "Percentages",
      "Logical Reasoning"
    ],
    "tip": "Practise at least one clean coding solution every day in the run-up. Speed in code matters here.",
    "eligibility": "Typically 60%+ throughout academics",
    "logoFile": "assets/img/company/virtusa.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "zensar",
    "name": "Zensar",
    "sector": "IT Services",
    "tint": "#e31837",
    "mark": "ZNSR",
    "rounds": [
      "Aptitude",
      "Technical MCQ",
      "Coding"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ]
    },
    "gate": "the Zensar online assessment",
    "focus": "Balanced aptitude and technical MCQ paper. Fundamentals in both sections decide the cut.",
    "topics": [
      "Percentages",
      "Logical Reasoning",
      "DBMS",
      "Operating Systems"
    ],
    "tip": "Do not skip revision of core CS topics you studied early in your degree.",
    "eligibility": "Typically 60%+ throughout academics",
    "logoFile": "assets/img/company/zensar.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "birlasoft",
    "name": "Birlasoft",
    "sector": "IT Services",
    "tint": "#0072ce",
    "mark": "BSFT",
    "rounds": [
      "Aptitude",
      "Technical MCQ",
      "Coding"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ]
    },
    "gate": "the Birlasoft online assessment",
    "focus": "A standard services-firm paper: quantitative, reasoning and a technical MCQ block.",
    "topics": [
      "Percentages",
      "Ratios",
      "Logical Reasoning",
      "DBMS",
      "Programming Logic"
    ],
    "tip": "Consistency beats brilliance — clear every section rather than maxing one.",
    "eligibility": "Typically 60%+ throughout academics",
    "logoFile": "assets/img/company/birlasoft.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "google",
    "name": "Google",
    "sector": "Product & GCC",
    "tint": "#4285f4",
    "mark": "GOOG",
    "rounds": [
      "Online assessment (2 coding problems)",
      "Technical interviews",
      "System design"
    ],
    "plan": {
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Google online assessment and coding interviews",
    "focus": "Data-structures-and-algorithms depth, not aptitude breadth. Two problems in about 60–90 minutes, judged on optimal complexity and clean code.",
    "topics": [
      "Arrays",
      "Hashing",
      "Trees",
      "Graphs",
      "Dynamic Programming",
      "Complexity Analysis"
    ],
    "tip": "State your approach and complexity before writing code. Correct but O(n²) where O(n) exists loses the round.",
    "eligibility": "Strong DSA fundamentals; a portfolio of solved problems matters more than marks",
    "logoFile": "assets/img/company/google.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "microsoft",
    "name": "Microsoft",
    "sector": "Product & GCC",
    "tint": "#00a4ef",
    "mark": "MSFT",
    "rounds": [
      "Online assessment (coding)",
      "Technical interviews",
      "Design"
    ],
    "plan": {
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Microsoft online coding assessment",
    "focus": "Coding-first. Expect array, string and tree problems with follow-ups on optimisation and edge cases.",
    "topics": [
      "Arrays",
      "Strings",
      "Trees",
      "Hashing",
      "Complexity Analysis"
    ],
    "tip": "Handle edge cases explicitly — empty input, single element, duplicates. Interviewers look for that.",
    "eligibility": "Strong DSA fundamentals; one or more solid projects expected",
    "logoFile": "assets/img/company/microsoft.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "amazon",
    "name": "Amazon",
    "sector": "Product & GCC",
    "tint": "#ff9900",
    "mark": "AMZN",
    "rounds": [
      "Online assessment (aptitude + 2 coding)",
      "Technical interviews",
      "Bar Raiser"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning"
      ],
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Amazon online assessment",
    "focus": "A short aptitude-and-logic opener, then two coding problems judged on optimality, plus Leadership-Principle-based behavioural rounds.",
    "topics": [
      "Arrays",
      "Hashing",
      "Graphs",
      "Dynamic Programming",
      "Complexity Analysis",
      "Behavioural (STAR)"
    ],
    "tip": "Prepare Leadership Principle stories with real, specific outcomes. The Bar Raiser round is behavioural as much as technical.",
    "eligibility": "Strong DSA fundamentals; the online assessment is the main filter",
    "logoFile": "assets/img/company/amazon.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "meta",
    "name": "Meta",
    "sector": "Product & GCC",
    "tint": "#0866ff",
    "mark": "META",
    "rounds": [
      "Online coding screen",
      "Technical interviews",
      "Design"
    ],
    "plan": {
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Meta coding screen",
    "focus": "Pure DSA. Typically two problems solved to optimum within about 45 minutes with clean, bug-free code.",
    "topics": [
      "Arrays",
      "Strings",
      "Hashing",
      "Trees",
      "Graphs",
      "Dynamic Programming"
    ],
    "tip": "Practise writing code you would be happy to have reviewed. Style counts at this tier.",
    "eligibility": "Strong DSA fundamentals; interviews are coding-first",
    "logoFile": "assets/img/company/meta.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "apple",
    "name": "Apple",
    "sector": "Product & GCC",
    "tint": "#333333",
    "mark": "AAPL",
    "rounds": [
      "Online assessment",
      "Technical interviews",
      "Team fit"
    ],
    "plan": {
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Apple online assessment",
    "focus": "Coding plus systems fundamentals. Depth in one area (systems, ML, or embedded) often matters more than broad trivia.",
    "topics": [
      "Arrays",
      "Operating Systems",
      "Complexity Analysis",
      "Programming Logic"
    ],
    "tip": "For Apple, depth in an area you can defend beats shallow coverage of everything.",
    "eligibility": "Strong CS fundamentals; specialisation is an advantage",
    "logoFile": "assets/img/company/apple.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "adobe",
    "name": "Adobe",
    "sector": "Product & GCC",
    "tint": "#fa0f00",
    "mark": "ADBE",
    "rounds": [
      "Online coding round",
      "Technical interviews",
      "Design"
    ],
    "plan": {
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Adobe coding round",
    "focus": "DSA-heavy with an emphasis on clean implementation. Expect medium-to-hard problems with optimisation follow-ups.",
    "topics": [
      "Arrays",
      "Strings",
      "Trees",
      "Dynamic Programming",
      "Complexity Analysis"
    ],
    "tip": "Optimise from a clear baseline — get the brute force right, then improve it visibly.",
    "eligibility": "Strong DSA fundamentals; problem-solving depth expected",
    "logoFile": "assets/img/company/adobe.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "nvidia",
    "name": "Nvidia",
    "sector": "Product & GCC",
    "tint": "#76b900",
    "mark": "NVDA",
    "rounds": [
      "Online assessment",
      "Technical interviews",
      "Systems / ML depth"
    ],
    "plan": {
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Nvidia technical assessment",
    "focus": "Strong on low-level and parallel-computing fundamentals alongside standard DSA. C/C++ depth is an advantage.",
    "topics": [
      "Arrays",
      "Operating Systems",
      "Memory and Pointers",
      "Complexity Analysis",
      "Programming Logic"
    ],
    "tip": "Revise memory models, pointers and concurrency basics — they surface often.",
    "eligibility": "Strong systems and DSA fundamentals; C/C++ depth valued",
    "logoFile": "assets/img/company/nvidia.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "intel",
    "name": "Intel",
    "sector": "Product & GCC",
    "tint": "#0068b5",
    "mark": "INTC",
    "rounds": [
      "Online assessment",
      "Technical interviews",
      "Systems depth"
    ],
    "plan": {
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Intel technical assessment",
    "focus": "Hardware and systems fundamentals plus standard coding. Digital logic and architecture questions appear.",
    "topics": [
      "Operating Systems",
      "Memory and Pointers",
      "Programming Logic",
      "Complexity Analysis"
    ],
    "tip": "For hardware-adjacent roles, revise digital logic and computer architecture alongside DSA.",
    "eligibility": "Strong CS/ECE fundamentals; systems depth valued",
    "logoFile": "assets/img/company/intel.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "qualcomm",
    "name": "Qualcomm",
    "sector": "Product & GCC",
    "tint": "#3253dc",
    "mark": "QCOM",
    "rounds": [
      "Online assessment",
      "Technical interviews",
      "Systems / embedded depth"
    ],
    "plan": {
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Qualcomm technical assessment",
    "focus": "Embedded and systems fundamentals with standard coding. Pointers, memory and OS concepts carry weight.",
    "topics": [
      "Memory and Pointers",
      "Operating Systems",
      "Programming Logic",
      "Complexity Analysis"
    ],
    "tip": "Revise the C memory model and caching basics — they recur in embedded rounds.",
    "eligibility": "Strong CS/ECE fundamentals; embedded interest valued",
    "logoFile": "assets/img/company/qualcomm.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "salesforce",
    "name": "Salesforce",
    "sector": "Product & GCC",
    "tint": "#00a1e0",
    "mark": "SFDC",
    "rounds": [
      "Online assessment",
      "Technical interviews",
      "Design"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Salesforce online assessment",
    "focus": "A balanced paper: aptitude, technical fundamentals and coding, with a platform knowledge edge for Salesforce-specific roles.",
    "topics": [
      "Programming Logic",
      "DBMS",
      "Logical Reasoning",
      "Percentages",
      "Arrays"
    ],
    "tip": "For platform roles, know the core CRM and Apex concepts alongside DSA.",
    "eligibility": "Strong CS fundamentals; platform interest valued",
    "logoFile": "assets/img/company/salesforce.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "oracle",
    "name": "Oracle",
    "sector": "Product & GCC",
    "tint": "#c74634",
    "mark": "ORCL",
    "rounds": [
      "Online assessment",
      "Technical interviews",
      "Design"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Oracle online assessment",
    "focus": "Aptitude plus strong database and systems fundamentals. SQL and DBMS depth is a clear advantage.",
    "topics": [
      "DBMS",
      "SQL",
      "Operating Systems",
      "Programming Logic",
      "Arrays"
    ],
    "tip": "Know joins, indexes and normalisation cold — Oracle rounds lean on databases.",
    "eligibility": "Strong CS fundamentals; DBMS depth valued",
    "logoFile": "assets/img/company/oracle.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "sap",
    "name": "SAP",
    "sector": "Product & GCC",
    "tint": "#0faaff",
    "mark": "SAP",
    "rounds": [
      "Online assessment",
      "Technical interviews"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the SAP online assessment",
    "focus": "Aptitude, technical fundamentals and coding with an enterprise-software flavour.",
    "topics": [
      "DBMS",
      "Programming Logic",
      "Logical Reasoning",
      "Percentages",
      "Arrays"
    ],
    "tip": "Get comfortable with enterprise data concepts — tables, transactions, integrations.",
    "eligibility": "Strong CS fundamentals; enterprise-software interest valued",
    "logoFile": "assets/img/company/sap.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "servicenow",
    "name": "ServiceNow",
    "sector": "Product & GCC",
    "tint": "#62d84e",
    "mark": "NOW",
    "rounds": [
      "Online assessment",
      "Technical interviews",
      "Design"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the ServiceNow online assessment",
    "focus": "Aptitude plus technical and coding, with workflow and platform concepts for platform roles.",
    "topics": [
      "Programming Logic",
      "DBMS",
      "Arrays",
      "Logical Reasoning"
    ],
    "tip": "Understand workflow and process-automation basics if you are targeting platform roles.",
    "eligibility": "Strong CS fundamentals; platform interest valued",
    "logoFile": "assets/img/company/servicenow.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "atlassian",
    "name": "Atlassian",
    "sector": "Product & GCC",
    "tint": "#0052cc",
    "mark": "ATLS",
    "rounds": [
      "Coding assessment",
      "Technical interviews",
      "Values interview"
    ],
    "plan": {
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Atlassian coding assessment",
    "focus": "Coding-first with an emphasis on clean, tested code and collaborative problem-solving.",
    "topics": [
      "Arrays",
      "Strings",
      "Hashing",
      "Trees",
      "Complexity Analysis"
    ],
    "tip": "Talk through trade-offs — Atlassian rounds value reasoning as much as the final answer.",
    "eligibility": "Strong DSA fundamentals; collaboration emphasised",
    "logoFile": "assets/img/company/atlassian.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "uber",
    "name": "Uber",
    "sector": "Product & GCC",
    "tint": "#000000",
    "mark": "UBER",
    "rounds": [
      "Online coding round",
      "Technical interviews",
      "Design"
    ],
    "plan": {
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Uber coding round",
    "focus": "DSA-heavy with design follow-ups. Graphs and large-scale reasoning appear often.",
    "topics": [
      "Graphs",
      "Arrays",
      "Hashing",
      "Dynamic Programming",
      "Complexity Analysis"
    ],
    "tip": "Practise graph problems — shortest path, traversal and scheduling variants recur.",
    "eligibility": "Strong DSA fundamentals; systems thinking valued",
    "logoFile": "assets/img/company/uber.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "stripe",
    "name": "Stripe",
    "sector": "Product & GCC",
    "tint": "#635bff",
    "mark": "STRP",
    "rounds": [
      "Online coding round",
      "Technical interviews"
    ],
    "plan": {
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Stripe coding round",
    "focus": "Coding-first with attention to correctness on edge cases and clean API design.",
    "topics": [
      "Arrays",
      "Strings",
      "Hashing",
      "Complexity Analysis"
    ],
    "tip": "Write code that handles malformed input gracefully — it mirrors real payment systems.",
    "eligibility": "Strong DSA fundamentals; attention to detail valued",
    "logoFile": "assets/img/company/stripe.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "paypal",
    "name": "PayPal",
    "sector": "Product & GCC",
    "tint": "#003087",
    "mark": "PYPL",
    "rounds": [
      "Online assessment",
      "Technical interviews"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the PayPal online assessment",
    "focus": "Aptitude plus technical and coding, with a payments-domain flavour in later rounds.",
    "topics": [
      "Programming Logic",
      "DBMS",
      "Arrays",
      "Logical Reasoning",
      "Percentages"
    ],
    "tip": "Know the basics of transactions and idempotency if you target payments roles.",
    "eligibility": "Strong CS fundamentals; fintech interest valued",
    "logoFile": "assets/img/company/paypal.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "cisco",
    "name": "Cisco",
    "sector": "Product & GCC",
    "tint": "#1ba0d7",
    "mark": "CSCO",
    "rounds": [
      "Online assessment",
      "Technical interviews"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ]
    },
    "gate": "the Cisco online assessment",
    "focus": "Networking and systems fundamentals dominate the technical block, alongside standard aptitude.",
    "topics": [
      "Networking",
      "Operating Systems",
      "Programming Logic",
      "Logical Reasoning"
    ],
    "tip": "Revise the OSI model, TCP/IP and routing basics — they are the heart of Cisco rounds.",
    "eligibility": "Strong CS/ECE fundamentals; networking depth valued",
    "logoFile": "assets/img/company/cisco.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "vmware",
    "name": "VMware",
    "sector": "Product & GCC",
    "tint": "#607078",
    "mark": "VMW",
    "rounds": [
      "Online assessment",
      "Technical interviews"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ]
    },
    "gate": "the VMware online assessment",
    "focus": "Systems and virtualisation fundamentals with standard aptitude and technical sections.",
    "topics": [
      "Operating Systems",
      "Networking",
      "Programming Logic",
      "Logical Reasoning"
    ],
    "tip": "Understand virtualisation and memory-management basics — they recur.",
    "eligibility": "Strong systems fundamentals",
    "logoFile": "assets/img/company/vmware.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "dell",
    "name": "Dell",
    "sector": "Product & GCC",
    "tint": "#007db8",
    "mark": "DELL",
    "rounds": [
      "Online assessment",
      "Technical interviews"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ]
    },
    "gate": "the Dell online assessment",
    "focus": "Aptitude with systems and hardware fundamentals in the technical block.",
    "topics": [
      "Operating Systems",
      "Programming Logic",
      "Logical Reasoning",
      "Percentages"
    ],
    "tip": "Revise storage and memory concepts for hardware-adjacent roles.",
    "eligibility": "Strong CS/ECE fundamentals",
    "logoFile": "assets/img/company/dell.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "hp",
    "name": "HP",
    "sector": "Product & GCC",
    "tint": "#0096d6",
    "mark": "HP",
    "rounds": [
      "Online assessment",
      "Technical interviews"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ]
    },
    "gate": "the HP online assessment",
    "focus": "Aptitude plus technical fundamentals across systems and software.",
    "topics": [
      "Operating Systems",
      "Programming Logic",
      "DBMS",
      "Logical Reasoning"
    ],
    "tip": "Balance aptitude and technical prep — the paper weights both evenly.",
    "eligibility": "Strong CS/ECE fundamentals",
    "logoFile": "assets/img/company/hp.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "samsung",
    "name": "Samsung",
    "sector": "Product & GCC",
    "tint": "#1428a0",
    "mark": "SAMS",
    "rounds": [
      "Online assessment",
      "Technical interviews",
      "Systems depth"
    ],
    "plan": {
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Samsung online assessment",
    "focus": "Heavy on systems, memory and one or more challenging coding problems.",
    "topics": [
      "Memory and Pointers",
      "Operating Systems",
      "Arrays",
      "Complexity Analysis"
    ],
    "tip": "The Samsung coding round is genuinely hard — practise problems above your usual level.",
    "eligibility": "Strong CS/ECE fundamentals; high coding bar",
    "logoFile": "assets/img/company/samsung.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "bosch",
    "name": "Bosch",
    "sector": "Product & GCC",
    "tint": "#ea0016",
    "mark": "BOSCH",
    "rounds": [
      "Aptitude",
      "Technical MCQ",
      "Technical interview"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ]
    },
    "gate": "the Bosch online assessment",
    "focus": "Aptitude with strong embedded and hardware fundamentals.",
    "topics": [
      "Programming Logic",
      "Operating Systems",
      "Memory and Pointers",
      "Logical Reasoning"
    ],
    "tip": "For embedded roles, revise microcontrollers and C memory models.",
    "eligibility": "Strong CS/ECE fundamentals; embedded interest valued",
    "logoFile": "assets/img/company/bosch.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "siemens",
    "name": "Siemens",
    "sector": "Product & GCC",
    "tint": "#009999",
    "mark": "SIE",
    "rounds": [
      "Aptitude",
      "Technical MCQ",
      "Technical interview"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ]
    },
    "gate": "the Siemens online assessment",
    "focus": "Aptitude with systems, automation and hardware fundamentals.",
    "topics": [
      "Programming Logic",
      "Operating Systems",
      "DBMS",
      "Logical Reasoning"
    ],
    "tip": "Understand control-systems and automation basics for hardware-adjacent roles.",
    "eligibility": "Strong CS/ECE fundamentals",
    "logoFile": "assets/img/company/siemens.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "zoho",
    "name": "Zoho",
    "sector": "Indian Product",
    "tint": "#e42527",
    "mark": "ZOHO",
    "rounds": [
      "Written programming test",
      "Advanced programming",
      "Technical interview"
    ],
    "plan": {
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Zoho programming rounds",
    "focus": "Almost entirely coding. Expect to write real programs by hand and then extend them under questioning.",
    "topics": [
      "Programming Logic",
      "Arrays",
      "Strings",
      "Complexity Analysis",
      "Programming Logic"
    ],
    "tip": "Zoho cares about how you think in code. Practise writing complete programs, not fragments.",
    "eligibility": "Strong programming ability; a portfolio of written code helps",
    "logoFile": "assets/img/company/zoho.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "freshworks",
    "name": "Freshworks",
    "sector": "Indian Product",
    "tint": "#1b7ced",
    "mark": "FRSH",
    "rounds": [
      "Coding assessment",
      "Technical interviews",
      "Design"
    ],
    "plan": {
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Freshworks coding assessment",
    "focus": "Coding-first with product-sense follow-ups. Clean problem-solving and communication matter.",
    "topics": [
      "Arrays",
      "Strings",
      "Hashing",
      "Trees",
      "Complexity Analysis"
    ],
    "tip": "Explain your reasoning as you code — Freshworks rounds are conversational.",
    "eligibility": "Strong DSA fundamentals; product sense valued",
    "logoFile": "assets/img/company/freshworks.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "flipkart",
    "name": "Flipkart",
    "sector": "Indian Product",
    "tint": "#2874f0",
    "mark": "FKRT",
    "rounds": [
      "Online coding round",
      "Technical interviews",
      "Design"
    ],
    "plan": {
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Flipkart online coding round",
    "focus": "DSA-heavy with large-scale design follow-ups. Graphs, DP and system reasoning appear.",
    "topics": [
      "Graphs",
      "Dynamic Programming",
      "Arrays",
      "Hashing",
      "Complexity Analysis"
    ],
    "tip": "Practise problems with a scale angle — Flipkart asks how your solution behaves at millions of requests.",
    "eligibility": "Strong DSA fundamentals; scale thinking valued",
    "logoFile": "assets/img/company/flipkart.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "swiggy",
    "name": "Swiggy",
    "sector": "Indian Product",
    "tint": "#fc8019",
    "mark": "SWGY",
    "rounds": [
      "Online coding round",
      "Technical interviews"
    ],
    "plan": {
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Swiggy coding round",
    "focus": "Coding-first with a strong problem-solving component and follow-up optimisation.",
    "topics": [
      "Arrays",
      "Hashing",
      "Graphs",
      "Dynamic Programming",
      "Complexity Analysis"
    ],
    "tip": "Graph and scheduling problems recur — delivery routing is the domain.",
    "eligibility": "Strong DSA fundamentals",
    "logoFile": "assets/img/company/swiggy.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "zomato",
    "name": "Zomato",
    "sector": "Indian Product",
    "tint": "#e23744",
    "mark": "ZMT",
    "rounds": [
      "Online coding round",
      "Technical interviews"
    ],
    "plan": {
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Zomato coding round",
    "focus": "Coding-first with practical, product-flavoured problems and optimisation follow-ups.",
    "topics": [
      "Arrays",
      "Hashing",
      "Strings",
      "Complexity Analysis"
    ],
    "tip": "Expect practical, product-driven framing rather than abstract puzzles.",
    "eligibility": "Strong DSA fundamentals",
    "logoFile": "assets/img/company/zomato.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "razorpay",
    "name": "Razorpay",
    "sector": "Indian Product",
    "tint": "#0c2451",
    "mark": "RZP",
    "rounds": [
      "Online coding round",
      "Technical interviews"
    ],
    "plan": {
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Razorpay coding round",
    "focus": "Coding-first with correctness on edge cases and clean design, in a payments context.",
    "topics": [
      "Arrays",
      "Strings",
      "Hashing",
      "Complexity Analysis"
    ],
    "tip": "Handle edge cases carefully — payments systems punish sloppiness, and so do Razorpay rounds.",
    "eligibility": "Strong DSA fundamentals; attention to detail valued",
    "logoFile": "assets/img/company/razorpay.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "phonepe",
    "name": "PhonePe",
    "sector": "Indian Product",
    "tint": "#5f259f",
    "mark": "PEPE",
    "rounds": [
      "Online coding round",
      "Technical interviews",
      "Design"
    ],
    "plan": {
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the PhonePe coding round",
    "focus": "Coding-heavy with scale and concurrency follow-ups.",
    "topics": [
      "Arrays",
      "Hashing",
      "Graphs",
      "Complexity Analysis"
    ],
    "tip": "Understand basic concurrency and idempotency for payments-scale questions.",
    "eligibility": "Strong DSA fundamentals; scale thinking valued",
    "logoFile": "assets/img/company/phonepe.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "paytm",
    "name": "Paytm",
    "sector": "Indian Product",
    "tint": "#00b9f1",
    "mark": "PAYT",
    "rounds": [
      "Online assessment",
      "Technical interviews"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Paytm online assessment",
    "focus": "Aptitude plus coding and technical fundamentals with a fintech flavour.",
    "topics": [
      "Programming Logic",
      "Arrays",
      "DBMS",
      "Logical Reasoning",
      "Percentages"
    ],
    "tip": "Balance aptitude and coding — the paper weights both.",
    "eligibility": "Strong CS fundamentals",
    "logoFile": "assets/img/company/paytm.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "meesho",
    "name": "Meesho",
    "sector": "Indian Product",
    "tint": "#9f2089",
    "mark": "MEES",
    "rounds": [
      "Online coding round",
      "Technical interviews"
    ],
    "plan": {
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Meesho coding round",
    "focus": "Coding-first with practical problems and optimisation follow-ups.",
    "topics": [
      "Arrays",
      "Hashing",
      "Graphs",
      "Dynamic Programming",
      "Complexity Analysis"
    ],
    "tip": "Practise under time pressure — the assessment is short for the difficulty.",
    "eligibility": "Strong DSA fundamentals",
    "logoFile": "assets/img/company/meesho.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "cred",
    "name": "CRED",
    "sector": "Indian Product",
    "tint": "#0a0a0a",
    "mark": "CRED",
    "rounds": [
      "Online coding round",
      "Technical interviews"
    ],
    "plan": {
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the CRED coding round",
    "focus": "Coding-first with a high bar on code quality and elegant solutions.",
    "topics": [
      "Arrays",
      "Strings",
      "Hashing",
      "Complexity Analysis"
    ],
    "tip": "Code quality matters here as much as correctness — write cleanly.",
    "eligibility": "Strong DSA fundamentals; code craft valued",
    "logoFile": "assets/img/company/cred.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "dream11",
    "name": "Dream11",
    "sector": "Indian Product",
    "tint": "#e6003c",
    "mark": "D11",
    "rounds": [
      "Online coding round",
      "Technical interviews"
    ],
    "plan": {
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Dream11 coding round",
    "focus": "Coding-first with an emphasis on optimality and large-scale reasoning.",
    "topics": [
      "Arrays",
      "Hashing",
      "Dynamic Programming",
      "Graphs",
      "Complexity Analysis"
    ],
    "tip": "Optimise aggressively — Dream11 problems often have tight time limits.",
    "eligibility": "Strong DSA fundamentals",
    "logoFile": "assets/img/company/dream11.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "zerodha",
    "name": "Zerodha",
    "sector": "Indian Product",
    "tint": "#387ed1",
    "mark": "ZERO",
    "rounds": [
      "Practical coding task",
      "Technical interview"
    ],
    "plan": {
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Zerodha practical coding round",
    "focus": "A practical, build-oriented coding task rather than abstract puzzle-solving.",
    "topics": [
      "Programming Logic",
      "Arrays",
      "Strings",
      "Design Basics"
    ],
    "tip": "Expect a small real build — practise shipping working code, not just solving puzzles.",
    "eligibility": "Strong practical programming ability",
    "logoFile": "assets/img/company/zerodha.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "groww",
    "name": "Groww",
    "sector": "Indian Product",
    "tint": "#00d09c",
    "mark": "GRWW",
    "rounds": [
      "Online coding round",
      "Technical interviews"
    ],
    "plan": {
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Groww coding round",
    "focus": "Coding-first with practical, product-flavoured problems.",
    "topics": [
      "Arrays",
      "Hashing",
      "Strings",
      "Complexity Analysis"
    ],
    "tip": "Practise clean, complete solutions under a time limit.",
    "eligibility": "Strong DSA fundamentals",
    "logoFile": "assets/img/company/groww.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "ola",
    "name": "Ola",
    "sector": "Indian Product",
    "tint": "#1c8f4e",
    "mark": "OLA",
    "rounds": [
      "Online coding round",
      "Technical interviews"
    ],
    "plan": {
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Ola coding round",
    "focus": "Coding-first with graph and scheduling-flavoured problems.",
    "topics": [
      "Graphs",
      "Arrays",
      "Hashing",
      "Complexity Analysis"
    ],
    "tip": "Revise shortest-path and scheduling patterns for mobility-domain problems.",
    "eligibility": "Strong DSA fundamentals",
    "logoFile": "assets/img/company/ola.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "nykaa",
    "name": "Nykaa",
    "sector": "Indian Product",
    "tint": "#fc2779",
    "mark": "NYKA",
    "rounds": [
      "Online assessment",
      "Technical interviews"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Nykaa online assessment",
    "focus": "Aptitude plus coding and technical fundamentals for a consumer-tech product.",
    "topics": [
      "Programming Logic",
      "Arrays",
      "Logical Reasoning",
      "Percentages"
    ],
    "tip": "Balance quantitative and coding prep — the paper weights both.",
    "eligibility": "Strong CS fundamentals",
    "logoFile": "assets/img/company/nykaa.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "myntra",
    "name": "Myntra",
    "sector": "Indian Product",
    "tint": "#ff3f6c",
    "mark": "MYNT",
    "rounds": [
      "Online coding round",
      "Technical interviews"
    ],
    "plan": {
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Myntra coding round",
    "focus": "Coding-first with practical e-commerce-flavoured problems.",
    "topics": [
      "Arrays",
      "Hashing",
      "Strings",
      "Complexity Analysis"
    ],
    "tip": "Expect practical problem framing over abstract puzzles.",
    "eligibility": "Strong DSA fundamentals",
    "logoFile": "assets/img/company/myntra.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "inmobi",
    "name": "InMobi",
    "sector": "Indian Product",
    "tint": "#1a73e8",
    "mark": "INMB",
    "rounds": [
      "Online coding round",
      "Technical interviews"
    ],
    "plan": {
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the InMobi coding round",
    "focus": "Coding-heavy with large-scale and data-processing angles.",
    "topics": [
      "Arrays",
      "Hashing",
      "Graphs",
      "Dynamic Programming",
      "Complexity Analysis"
    ],
    "tip": "Practise data-stream and aggregation problems — adtech is the domain.",
    "eligibility": "Strong DSA fundamentals; scale thinking valued",
    "logoFile": "assets/img/company/inmobi.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "postman",
    "name": "Postman",
    "sector": "Indian Product",
    "tint": "#ff6c37",
    "mark": "PSTM",
    "rounds": [
      "Online coding round",
      "Technical interviews"
    ],
    "plan": {
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Postman coding round",
    "focus": "Coding-first with API-sense and clean-design follow-ups.",
    "topics": [
      "Arrays",
      "Strings",
      "Hashing",
      "Complexity Analysis"
    ],
    "tip": "Understand HTTP and REST basics — Postman rounds lean on API reasoning.",
    "eligibility": "Strong DSA fundamentals; API knowledge valued",
    "logoFile": "assets/img/company/postman.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "browserstack",
    "name": "BrowserStack",
    "sector": "Indian Product",
    "tint": "#f4b400",
    "mark": "BRWS",
    "rounds": [
      "Online coding round",
      "Technical interviews"
    ],
    "plan": {
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the BrowserStack coding round",
    "focus": "Coding-first with testing and platform-sense follow-ups.",
    "topics": [
      "Arrays",
      "Strings",
      "Hashing",
      "Complexity Analysis"
    ],
    "tip": "Think about testability and edge cases — it is a testing platform.",
    "eligibility": "Strong DSA fundamentals; quality mindset valued",
    "logoFile": "assets/img/company/browserstack.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "chargebee",
    "name": "Chargebee",
    "sector": "Indian Product",
    "tint": "#ff7846",
    "mark": "CHGB",
    "rounds": [
      "Online coding round",
      "Technical interviews"
    ],
    "plan": {
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Chargebee coding round",
    "focus": "Coding-first with billing-logic and edge-case correctness.",
    "topics": [
      "Arrays",
      "Strings",
      "Hashing",
      "Complexity Analysis"
    ],
    "tip": "Handle malformed and boundary inputs carefully — billing punishes errors.",
    "eligibility": "Strong DSA fundamentals; attention to detail valued",
    "logoFile": "assets/img/company/chargebee.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "deloitte",
    "name": "Deloitte",
    "sector": "Consulting",
    "tint": "#86bc25",
    "mark": "D",
    "rounds": [
      "Aptitude",
      "English",
      "Technical / case",
      "Interview"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ]
    },
    "gate": "the Deloitte aptitude and case assessment",
    "focus": "A balanced aptitude-and-English paper with a case-style component. Structured thinking is rewarded.",
    "topics": [
      "Percentages",
      "Data Interpretation",
      "Verbal Ability",
      "Logical Reasoning",
      "DBMS"
    ],
    "tip": "For consulting-track roles, practise structuring an answer out loud, not just solving it.",
    "eligibility": "Typically 60%+ throughout academics; strong communication expected",
    "logoFile": "assets/img/company/deloitte.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "ey",
    "name": "EY",
    "sector": "Consulting",
    "tint": "#ffe600",
    "mark": "EY",
    "rounds": [
      "Aptitude",
      "English",
      "Case / technical",
      "Interview"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ]
    },
    "gate": "the EY aptitude and case assessment",
    "focus": "Aptitude and English with a case-style round. Clear reasoning matters as much as the answer.",
    "topics": [
      "Data Interpretation",
      "Verbal Ability",
      "Logical Reasoning",
      "Percentages",
      "DBMS"
    ],
    "tip": "Structure every case answer: situation, analysis, recommendation. EY scores the structure.",
    "eligibility": "Typically 60%+ throughout academics; strong communication expected",
    "logoFile": "assets/img/company/ey.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "pwc",
    "name": "PwC",
    "sector": "Consulting",
    "tint": "#d04a02",
    "mark": "PWC",
    "rounds": [
      "Aptitude",
      "English",
      "Case / technical",
      "Interview"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ]
    },
    "gate": "the PwC aptitude and case assessment",
    "focus": "Aptitude and English with a case-style component and technical fundamentals.",
    "topics": [
      "Data Interpretation",
      "Verbal Ability",
      "Logical Reasoning",
      "Percentages",
      "DBMS"
    ],
    "tip": "Practise data interpretation heavily — consulting papers lean on it.",
    "eligibility": "Typically 60%+ throughout academics; strong communication expected",
    "logoFile": "assets/img/company/pwc.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "kpmg",
    "name": "KPMG",
    "sector": "Consulting",
    "tint": "#00338d",
    "mark": "KPMG",
    "rounds": [
      "Aptitude",
      "English",
      "Case / technical",
      "Interview"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ]
    },
    "gate": "the KPMG aptitude and case assessment",
    "focus": "Aptitude, English and a case component with technical fundamentals.",
    "topics": [
      "Data Interpretation",
      "Verbal Ability",
      "Logical Reasoning",
      "Percentages",
      "DBMS"
    ],
    "tip": "Work on quick, defensible estimates — consulting rounds test structured judgement.",
    "eligibility": "Typically 60%+ throughout academics; strong communication expected",
    "logoFile": "assets/img/company/kpmg.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "accenture",
    "name": "Accenture",
    "sector": "Consulting",
    "tint": "#a100ff",
    "mark": "ACN",
    "rounds": [
      "Cognitive aptitude",
      "Coding",
      "Communication",
      "Interview"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Accenture cognitive and coding assessment",
    "focus": "A cognitive round (numerical, reasoning, verbal) plus a coding and communication section. Broad fundamentals suit this paper.",
    "topics": [
      "Percentages",
      "Logical Reasoning",
      "Verbal Ability",
      "Programming Logic",
      "DBMS"
    ],
    "tip": "Do not neglect the communication round — it is scored, not a formality.",
    "eligibility": "Typically 60%+ throughout academics; no active backlogs",
    "logoFile": "assets/img/company/accenture.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "goldmansachs",
    "name": "Goldman Sachs",
    "sector": "Finance Tech",
    "tint": "#7399c6",
    "mark": "GS",
    "rounds": [
      "Online coding round",
      "Technical interviews",
      "Maths / probability"
    ],
    "plan": {
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Goldman Sachs online assessment",
    "focus": "Coding plus quantitative and probability reasoning. Maths fluency is a real differentiator.",
    "topics": [
      "Arrays",
      "Hashing",
      "Dynamic Programming",
      "Probability",
      "Complexity Analysis"
    ],
    "tip": "Revise probability and expected-value reasoning — it appears in engineering finance rounds.",
    "eligibility": "Strong DSA and quantitative fundamentals",
    "logoFile": "assets/img/company/goldmansachs.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "jpmorgan",
    "name": "JPMorgan Chase",
    "sector": "Finance Tech",
    "tint": "#5a3d2b",
    "mark": "JPMC",
    "rounds": [
      "Online coding round",
      "Technical interviews"
    ],
    "plan": {
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the JPMorgan coding assessment",
    "focus": "Coding-first with strong data-structures fundamentals and clean implementation.",
    "topics": [
      "Arrays",
      "Hashing",
      "Strings",
      "Complexity Analysis"
    ],
    "tip": "Write clean, well-tested code — finance-tech rounds value reliability.",
    "eligibility": "Strong DSA fundamentals",
    "logoFile": "assets/img/company/jpmorgan.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "morganstanley",
    "name": "Morgan Stanley",
    "sector": "Finance Tech",
    "tint": "#0b2f6b",
    "mark": "MS",
    "rounds": [
      "Online coding round",
      "Technical interviews",
      "Maths"
    ],
    "plan": {
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Morgan Stanley online assessment",
    "focus": "Coding with quantitative and analytical reasoning. Maths depth helps.",
    "topics": [
      "Arrays",
      "Hashing",
      "Dynamic Programming",
      "Probability",
      "Complexity Analysis"
    ],
    "tip": "Revise probability and combinatorics alongside DSA.",
    "eligibility": "Strong DSA and quantitative fundamentals",
    "logoFile": "assets/img/company/morganstanley.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "barclays",
    "name": "Barclays",
    "sector": "Finance Tech",
    "tint": "#00aeef",
    "mark": "BARC",
    "rounds": [
      "Online assessment",
      "Technical interviews"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Barclays online assessment",
    "focus": "Aptitude plus coding and technical fundamentals in a banking context.",
    "topics": [
      "Programming Logic",
      "Arrays",
      "Logical Reasoning",
      "Percentages",
      "DBMS"
    ],
    "tip": "Balance aptitude and coding prep — the assessment weights both.",
    "eligibility": "Strong CS fundamentals",
    "logoFile": "assets/img/company/barclays.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "deutschebank",
    "name": "Deutsche Bank",
    "sector": "Finance Tech",
    "tint": "#0018a8",
    "mark": "DB",
    "rounds": [
      "Online assessment",
      "Technical interviews"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Deutsche Bank online assessment",
    "focus": "Aptitude, coding and technical fundamentals with quantitative reasoning.",
    "topics": [
      "Programming Logic",
      "Arrays",
      "Logical Reasoning",
      "Percentages",
      "DBMS"
    ],
    "tip": "Practise quantitative reasoning — it is weighted heavier here than in pure-tech papers.",
    "eligibility": "Strong CS and quantitative fundamentals",
    "logoFile": "assets/img/company/deutschebank.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  },
  {
    "id": "wellsfargo",
    "name": "Wells Fargo",
    "sector": "Finance Tech",
    "tint": "#d71e28",
    "mark": "WFC",
    "rounds": [
      "Online assessment",
      "Technical interviews"
    ],
    "plan": {
      "apt": [
        "numerical",
        "reasoning",
        "verbal"
      ],
      "tech": [
        "cs"
      ],
      "code": 1
    },
    "gate": "the Wells Fargo online assessment",
    "focus": "Aptitude plus coding and technical fundamentals for a banking-technology role.",
    "topics": [
      "Programming Logic",
      "Arrays",
      "Logical Reasoning",
      "DBMS"
    ],
    "tip": "Balance sections — the paper rewards all-rounders over specialists.",
    "eligibility": "Strong CS fundamentals",
    "logoFile": "assets/img/company/wellsfargo.png",
    "logoPermissionStatus": "approved",
    "logoNotes": null
  }
];
module.exports = { COMPANIES };

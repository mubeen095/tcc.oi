#!/usr/bin/env node
/* ==========================================================================
   WorkSim catalogue builder
   Reads the CERT+ role inventory, generates one Beginner shift per role,
   and writes the catalogue + packs into data/worksim/ (server-side only).

   Run:  node scripts/build-worksim.js
   Nothing here ships to the public site. The API serves it.
   ========================================================================== */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const SITE = path.join(ROOT, 'public');
const OUT = path.join(ROOT, 'data', 'worksim');

const slug = (s) =>
  String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/* ---------- role inventory ---------- */

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(SITE, 'certs-data.js'), 'utf8'), sandbox);
const INDUSTRIES = sandbox.INDUSTRIES;

/* ---------- industry tokens ---------- */

const TOKENS = {
  foundation: { org: 'a mid-sized company', artifact: "the team's weekly report", metric: 'time lost to rework', stakeholder: 'your manager', tool: 'the shared workspace', risk: 'an error reaching a client', customer: 'a colleague', domain: 'the working week' },
  software: { org: 'a 200-person SaaS company', artifact: 'the checkout flow', metric: 'error rate', stakeholder: 'the engineering lead', tool: 'the issue tracker', risk: 'a production outage', customer: 'a customer', domain: 'the product' },
  data: { org: 'a data-driven scale-up', artifact: 'the revenue dashboard', metric: 'forecast accuracy', stakeholder: 'the head of analytics', tool: 'the warehouse', risk: 'a wrong number reaching the board', customer: 'an internal team', domain: 'the data platform' },
  security: { org: 'a regulated enterprise', artifact: 'the access review', metric: 'mean time to detect', stakeholder: 'the CISO', tool: 'the SIEM', risk: 'a breach', customer: 'an internal business unit', domain: 'the security posture' },
  healthcare: { org: 'a 300-bed hospital', artifact: 'the discharge summary', metric: 'readmission rate', stakeholder: 'the ward matron', tool: 'the patient record system', risk: 'a patient safety incident', customer: 'a patient', domain: 'patient care' },
  pharma: { org: 'a mid-size pharma company', artifact: 'the trial protocol', metric: 'enrolment rate', stakeholder: 'the principal investigator', tool: 'the trial management system', risk: 'a regulatory finding', customer: 'a trial site', domain: 'drug development' },
  finance: { org: 'a mid-market bank', artifact: 'the monthly close', metric: 'forecast variance', stakeholder: 'the CFO', tool: 'the reporting model', risk: 'a regulatory breach', customer: 'a corporate client', domain: 'the books' },
  insurance: { org: 'a general insurer', artifact: 'the claims queue', metric: 'loss ratio', stakeholder: 'the underwriting head', tool: 'the claims system', risk: 'a fraudulent payout', customer: 'a policyholder', domain: 'risk' },
  legal: { org: 'a 40-lawyer firm', artifact: 'the client contract', metric: 'matter turnaround', stakeholder: 'the partner', tool: 'the matter file', risk: 'a missed deadline', customer: 'a client', domain: 'the matter' },
  government: { org: 'a state department', artifact: 'the citizen service form', metric: 'processing time', stakeholder: 'the joint secretary', tool: 'the service portal', risk: 'a public backlash', customer: 'a citizen', domain: 'public service' },
  defence: { org: 'a defence programme office', artifact: 'the mission plan', metric: 'readiness', stakeholder: 'the commanding officer', tool: 'the operations room', risk: 'an operational failure', customer: 'the unit', domain: 'the mission' },
  education: { org: 'a large university', artifact: 'the course assessment', metric: 'student pass rate', stakeholder: 'the department head', tool: 'the learning platform', risk: 'a student grievance', customer: 'a student', domain: 'teaching' },
  marketing: { org: 'a consumer brand', artifact: 'the launch campaign', metric: 'cost per acquisition', stakeholder: 'the brand director', tool: 'the ad platform', risk: 'a brand backlash', customer: 'a shopper', domain: 'the campaign' },
  sales: { org: 'a B2B software company', artifact: 'the pipeline', metric: 'win rate', stakeholder: 'the sales director', tool: 'the CRM', risk: 'a lost quarter', customer: 'a prospect', domain: 'the deal' },
  hr: { org: 'a 500-person company', artifact: 'the hiring pipeline', metric: 'time to hire', stakeholder: 'the department head', tool: 'the applicant tracker', risk: 'a bad hire', customer: 'a candidate', domain: 'hiring' },
  design: { org: 'a product studio', artifact: 'the onboarding flow', metric: 'task completion rate', stakeholder: 'the product lead', tool: 'the design file', risk: 'a confusing release', customer: 'a user', domain: 'the experience' },
  media: { org: 'a newsroom', artifact: 'the evening story', metric: 'read-through', stakeholder: 'the editor', tool: 'the publishing system', risk: 'a correction', customer: 'a reader', domain: 'the story' },
  gaming: { org: 'a game studio', artifact: 'the launch build', metric: 'day-one retention', stakeholder: 'the game director', tool: 'the build pipeline', risk: 'a broken launch', customer: 'a player', domain: 'the game' },
  manufacturing: { org: 'a factory', artifact: 'the production line', metric: 'yield', stakeholder: 'the plant manager', tool: 'the MES', risk: 'a safety incident', customer: 'a buyer', domain: 'production' },
  construction: { org: 'a construction contractor', artifact: 'the site schedule', metric: 'cost overrun', stakeholder: 'the project director', tool: 'the site plan', risk: 'a safety incident', customer: 'the client', domain: 'the site' },
  retail: { org: 'a retail chain', artifact: 'the store layout', metric: 'basket size', stakeholder: 'the category manager', tool: 'the POS data', risk: 'a stockout', customer: 'a shopper', domain: 'the store' },
  supplychain: { org: 'a logistics operator', artifact: 'the delivery schedule', metric: 'on-time delivery', stakeholder: 'the ops head', tool: 'the routing system', risk: 'a missed SLA', customer: 'a client', domain: 'the network' },
  agriculture: { org: 'an agri-business', artifact: 'the harvest plan', metric: 'yield per acre', stakeholder: 'the farm manager', tool: 'the field records', risk: 'a crop loss', customer: 'a buyer', domain: 'the farm' },
  energy: { org: 'an energy utility', artifact: 'the outage plan', metric: 'uptime', stakeholder: 'the grid manager', tool: 'the control feed', risk: 'a blackout', customer: 'a household', domain: 'the grid' },
  telecom: { org: 'a telecom operator', artifact: 'the network rollout', metric: 'churn', stakeholder: 'the network head', tool: 'the coverage map', risk: 'an outage', customer: 'a subscriber', domain: 'the network' },
  transport: { org: 'an airline', artifact: 'the turnaround schedule', metric: 'on-time performance', stakeholder: 'the station manager', tool: 'the ops board', risk: 'a delay cascade', customer: 'a passenger', domain: 'the operation' },
  hospitality: { org: 'a hotel group', artifact: 'the guest itinerary', metric: 'guest satisfaction', stakeholder: 'the general manager', tool: 'the booking system', risk: 'a bad review', customer: 'a guest', domain: 'the stay' },
  mining: { org: 'a mining operation', artifact: 'the extraction plan', metric: 'output per shift', stakeholder: 'the site manager', tool: 'the control room', risk: 'a safety incident', customer: 'a buyer', domain: 'the site' },
  consulting: { org: 'a strategy consultancy', artifact: 'the client diagnosis', metric: 'client margin', stakeholder: 'the engagement partner', tool: 'the interview notes', risk: 'a lost engagement', customer: 'a client', domain: 'the engagement' },
  blockchain: { org: 'a web3 startup', artifact: 'the smart contract', metric: 'gas cost', stakeholder: 'the protocol lead', tool: 'the testnet', risk: 'an exploit', customer: 'a user', domain: 'the protocol' },
  nonprofit: { org: 'a nonprofit', artifact: 'the programme plan', metric: 'beneficiaries reached', stakeholder: 'the programme director', tool: 'the field survey', risk: 'a funding gap', customer: 'a beneficiary', domain: 'the programme' },
  executive: { org: 'a growth-stage company', artifact: 'the operating plan', metric: 'burn multiple', stakeholder: 'the board', tool: 'the leadership dashboard', risk: 'a missed quarter', customer: 'the company', domain: 'the company' },
};

/* ---------- role-level hints (applied over industry tokens) ---------- */

const HINTS = [
  [/frontend|front-end/i, { artifact: 'the checkout page', metric: 'page load time', tool: 'the browser profiler' }],
  [/backend|back-end/i, { artifact: 'the payments service', metric: 'error rate', tool: 'the service logs' }],
  [/full-?stack/i, { artifact: 'the onboarding flow', metric: 'error rate', tool: 'the issue tracker' }],
  [/mobile/i, { artifact: "the app's login flow", metric: 'crash rate', tool: 'the crash reports' }],
  [/devops|sre|site reliability/i, { artifact: 'the deploy pipeline', metric: 'mean time to recover', tool: 'the monitoring dashboard' }],
  [/qa|test engineer/i, { artifact: 'the release candidate', metric: 'escaped defects', tool: 'the test suite' }],
  [/cloud architect|solutions architect/i, { artifact: 'the migration plan', metric: 'cloud spend', tool: 'the architecture diagram' }],
  [/database/i, { artifact: 'the primary database', metric: 'query latency', tool: 'the slow query log' }],
  [/security|soc analyst|ethical hacker/i, { artifact: 'the incident alert', metric: 'time to contain', tool: 'the SIEM' }],
  [/data scientist/i, { artifact: 'the churn model', metric: 'model accuracy', tool: 'the notebook' }],
  [/data analyst|bi analyst|business intelligence/i, { artifact: 'the revenue dashboard', metric: 'report accuracy', tool: 'the warehouse' }],
  [/data engineer/i, { artifact: 'the ingestion pipeline', metric: 'data freshness', tool: 'the scheduler' }],
  [/ml engineer|mlops|machine learning/i, { artifact: 'the recommendation model', metric: 'model drift', tool: 'the training pipeline' }],
  [/nurse|clinical/i, { artifact: "the patient's care plan", metric: 'readmission rate', tool: 'the patient record' }],
  [/doctor|physician|surgeon/i, { artifact: 'the treatment plan', metric: 'complication rate', tool: 'the patient record' }],
  [/pharmac/i, { artifact: 'the medication list', metric: 'dispensing errors', tool: 'the pharmacy system' }],
  [/teacher|professor|lecturer|tutor/i, { artifact: 'the course assessment', metric: 'pass rate', tool: 'the learning platform' }],
  [/lawyer|legal|counsel/i, { artifact: 'the client contract', metric: 'matter turnaround', tool: 'the matter file' }],
  [/accountant|auditor|finance|financial/i, { artifact: 'the monthly close', metric: 'forecast variance', tool: 'the reporting model' }],
  [/recruit|talent/i, { artifact: 'the hiring pipeline', metric: 'time to hire', tool: 'the applicant tracker' }],
  [/ux|ui|product designer|graphic|brand designer|motion|illustrator|3d artist/i, { artifact: 'the onboarding flow', metric: 'task completion rate', tool: 'the design file' }],
  [/marketing|growth|seo|content strateg/i, { artifact: 'the launch campaign', metric: 'cost per acquisition', tool: 'the ad platform' }],
  [/sales|account executive|business development|account manager/i, { artifact: 'the pipeline', metric: 'win rate', tool: 'the CRM' }],
  [/customer success|customer support|support/i, { artifact: 'the support queue', metric: 'first response time', tool: 'the helpdesk' }],
  [/product manager/i, { artifact: 'the roadmap', metric: 'activation rate', tool: 'the product analytics' }],
  [/project|scrum|program/i, { artifact: 'the delivery plan', metric: 'slip rate', tool: 'the planning board' }],
  [/hr|people/i, { artifact: 'the engagement survey', metric: 'attrition', tool: 'the HR system' }],
  [/operations|supply|logistics/i, { artifact: 'the delivery schedule', metric: 'on-time delivery', tool: 'the routing system' }],
  [/mechanical|civil|electrical|engineer/i, { artifact: 'the design review', metric: 'rework rate', tool: 'the CAD file' }],
  [/research|scientist/i, { artifact: 'the experiment', metric: 'reproducibility', tool: 'the lab notebook' }],
  [/journal|editor|reporter/i, { artifact: 'the story', metric: 'corrections', tool: 'the publishing system' }],
  [/artist|animator|3d/i, { artifact: 'the shot', metric: 'render time', tool: 'the asset pipeline' }],
  [/chief|cto|ceo|cfo|coo|director|head of|vp/i, { artifact: 'the operating plan', metric: 'burn multiple', tool: 'the leadership dashboard' }],
];

/* ---------- families ---------- */

const FAMILIES = [
  {
    id: 'sell',
    match: /customer success|customer support|helpdesk|account manager|sales|business development|account executive|revenue|retail|e-?commerce/i,
    title: 'The deal that went quiet',
    skills: ['Discovery', 'Objection handling', 'Closing'],
    blurb: 'A live deal, a silent inbox, and a date you cannot promise. Work the judgement, not the script.',
    best: [
      'Ask what changed for them since the last conversation.',
      'Check the account history before quoting anything.',
      'Surface the bigger problem and size it with them.',
      'Qualify which deal is real and which is noise.',
      'Tell the customer what changes and why.',
      'Give the date delivery can actually meet.',
      'Call the customer first, then fix it.',
      'Agree on the part that is right and show the evidence.',
      'Put the tradeoff in the proposal.',
      "Ask what would make tomorrow's ask worth it.",
    ],
    okay: [
      'Pitch the standard offer and adjust.',
      'Trust the CRM note.',
      'Log the bigger issue for the next call.',
      'Work the deal that feels warmest.',
      'Ship it and call if they complain.',
      'Promise the date and manage expectations later.',
      'Fix it and offer a discount.',
      'Apologise and move the meeting on.',
      'Mention the tradeoff in the email.',
      'Say yes and stay late.',
    ],
    poor: [
      'Send the deck and hope they reply.',
      'Quote from memory.',
      'Stay on script.',
      'Chase both and close neither.',
      'Ship it and avoid the call.',
      'Promise the date to win the deal.',
      'Blame operations.',
      'Argue the price.',
      'Leave the tradeoff out.',
      'Say no and stop replying.',
    ],
  },
  {
    id: 'care',
    match: /nurse|doctor|physician|pharmac|therap|clinician|surgeon|dentist|veterinar|teacher|professor|lecturer|tutor|educat|trainer|instructor|social worker|counsel|nutrition|care/i,
    title: 'The person in front of you',
    skills: ['Judgement', 'Communication', 'Escalation'],
    blurb: 'A full day, limited time, and someone who needs more than the process allows.',
    best: [
      'Ask what the person in front of you actually needs.',
      'Check the record and the source before acting.',
      'Escalate the bigger issue through the right channel.',
      'Agree who is responsible for what, in writing.',
      'Explain the change to the person it affects.',
      'Give the honest timeline, not the reassuring one.',
      'Disclose it, contain it, and tell the right person.',
      'Acknowledge what is right and correct the rest calmly.',
      'Make the tradeoff visible to the people carrying it.',
      'Ask whether it can wait until morning.',
    ],
    okay: [
      'Follow the standard process for this request.',
      'Trust the last note in the record.',
      'Mention the bigger issue at handover.',
      'Take the most urgent case first.',
      'Make the change and explain it later.',
      'Give a safe date and monitor.',
      'Correct it and log the incident.',
      'Defer to the senior person.',
      'Record the tradeoff in the notes.',
      'Say yes and stay back.',
    ],
    poor: [
      'Do what the last person did.',
      'Skip the check; it is probably fine.',
      'Stay in your lane.',
      'Try to cover both alone.',
      'Change it and say nothing.',
      'Promise the date they want.',
      'Hide it and hope it settles.',
      'Argue in front of them.',
      'Leave the tradeoff out.',
      'Say no and leave.',
    ],
  },
  {
    id: 'guard',
    match: /security|soc analyst|hacker|compliance|legal|lawyer|counsel|defence|military|police|intelligence|grc|auditor|risk/i,
    title: 'The risk you cannot ignore',
    skills: ['Risk', 'Evidence', 'Escalation'],
    blurb: 'A risk lands on your desk with a deadline attached and no clean answer.',
    best: [
      'Ask what decision this has to support and who signs it.',
      'Verify against the primary record, not the summary.',
      'Contain the bigger risk and document the chain.',
      'Agree the order with the accountable owner.',
      'Disclose the impact to the affected party.',
      'Give the date the review can defensibly meet.',
      'Preserve evidence, contain it, and notify.',
      'Separate the policy from the person, then correct.',
      'Record the tradeoff and who accepted it.',
      "Ask whether it changes tomorrow's exposure.",
    ],
    okay: [
      'Start from the standard checklist.',
      'Trust the summary and flag the gap.',
      'Note the bigger risk and finish the review.',
      'Take the request from the most senior owner.',
      'Proceed and notify afterwards.',
      'Give a safe date and keep the buffer.',
      'Fix it and file the report.',
      'Defer and escalate later.',
      'Note the tradeoff in the file.',
      'Say yes and stay late.',
    ],
    poor: [
      "Use last year's template.",
      'Take the summary at face value.',
      'Stay within the request.',
      'Ask both to decide and wait.',
      'Proceed quietly.',
      'Promise the date to keep everyone happy.',
      'Delete it and say nothing.',
      'Argue the rule in the meeting.',
      'Leave the tradeoff out.',
      'Say no and close the file.',
    ],
  },
  {
    id: 'analyze',
    match: /data|analyst|scientist|machine learning|ml engineer|ai |artificial intelligence|research|quantum|actuar|audit|consult|strateg|econom|bi /i,
    title: 'The number nobody trusts',
    skills: ['Data quality', 'Analysis', 'Communication'],
    blurb: 'Two numbers disagree. Find out which one is wrong before {stakeholder} repeats it upward.',
    best: [
      'Ask what decision the analysis has to change.',
      'Recompute from source and reconcile the gap.',
      'Quantify the bigger issue before widening scope.',
      'Agree the question first, then the model.',
      'Show the assumption to the people it affects.',
      'Give the date the data supports.',
      'Pull the number, correct it publicly, and trace the cause.',
      'Show the calculation and invite the correction.',
      'State the tradeoff next to the recommendation.',
      'Ask whether the extra cut changes the decision.',
    ],
    okay: [
      'Start from the template and refine later.',
      'Use the more recent extract.',
      'Note it in the caveats and keep the scope.',
      'Build both views and let them choose.',
      'Add a footnote and publish.',
      'Promise a date and work back from it.',
      'Fix the number and move on.',
      'Defer to seniority and revisit later.',
      'Put the tradeoff in the appendix.',
      'Say yes and stay late.',
    ],
    poor: [
      "Reuse last quarter's structure.",
      'Pick the number that fits the story.',
      'Ignore it; it is out of scope.',
      'Ask them to decide and wait.',
      'Publish and handle questions later.',
      'Promise the date they want.',
      'Blame the source system.',
      'Argue the point in the meeting.',
      'Leave the tradeoff out.',
      'Say no and send the file.',
    ],
  },
  {
    id: 'create',
    match: /design|artist|illustrat|animat|writer|editor|content|brand|creative|journal|producer|3d|art director/i,
    title: 'The brief that was not a brief',
    skills: ['Briefing', 'Craft', 'Feedback'],
    blurb: 'A launch is two days out and the brief keeps changing. Protect the work without losing the room.',
    best: [
      'Ask what the audience should do after seeing it.',
      'Go back to the source material before judging the draft.',
      'Show the bigger problem with two quick options.',
      'Agree one direction and one decision-maker.',
      'Test it with five real people first.',
      'Give the date the review cycle needs.',
      'Pull it, say what happened, and republish corrected.',
      "Take the note that is right, explain the one that is not.",
      'Show the tradeoff between speed and craft.',
      "Ask whether it changes tomorrow's launch.",
    ],
    okay: [
      'Start from the brief as written.',
      'Trust the draft and tighten the copy.',
      'Note the bigger issue and finish the asset.',
      'Do the version the loudest person wants.',
      'Ship it and watch the response.',
      'Promise the date and compress review.',
      'Edit quietly and hope nobody saved it.',
      'Redo it their way.',
      'Mention the tradeoff in the handoff.',
      'Say yes and rush it.',
    ],
    poor: [
      'Open the tool and see what happens.',
      'Use the draft as-is.',
      'Stay inside the brief.',
      'Make both versions badly.',
      'Publish and deal with the comments.',
      'Say yes and skip the review.',
      'Delete the post and stay quiet.',
      'Defend the work in the thread.',
      'Leave the tradeoff out.',
      'Say no and close the laptop.',
    ],
  },
  {
    id: 'people',
    match: /recruit|talent|people|hr |human resource|learning|training/i,
    title: 'The hire that has to be right',
    skills: ['Screening', 'Judgement', 'Communication'],
    blurb: 'A role is open, the manager is impatient, and the best candidate has a competing offer.',
    best: [
      'Ask what the role has to change in six months.',
      'Check the evidence in the work sample, not the CV.',
      'Surface the bigger team problem before filling the seat.',
      'Agree the must-haves and drop the rest.',
      'Tell the candidate the real timeline.',
      'Give the date the process can actually meet.',
      'Call the candidate first, then fix the process.',
      'Separate the signal from the interviewer bias.',
      'Put the tradeoff in the offer discussion.',
      "Ask whether waiting a week changes the hire.",
    ],
    okay: [
      'Start from the standard scorecard.',
      "Trust the first interviewer's note.",
      'Note the team issue for later.',
      'Move the candidate the manager likes.',
      'Proceed and update the candidate later.',
      'Promise the date and chase approvals.',
      'Fix it and offer a faster start.',
      'Apologise and move on.',
      'Mention the tradeoff in the debrief.',
      'Say yes and stay late.',
    ],
    poor: [
      'Post the role and wait.',
      'Screen on keywords.',
      'Fill the seat and worry later.',
      'Interview everyone and decide nothing.',
      'Go quiet and hope they wait.',
      'Promise the date to keep them warm.',
      'Blame the panel.',
      'Argue about the candidate in the debrief.',
      'Leave the tradeoff out.',
      'Say no and stop replying.',
    ],
  },
  {
    id: 'lead',
    match: /chief|cto|ceo|cfo|coo|director|head|manager|vp|founder|president|product|project|scrum|program/i,
    title: 'The decision only you can make',
    skills: ['Prioritisation', 'Communication', 'Decision-making'],
    blurb: 'The team is moving, the board is asking, and the tradeoff is yours to name.',
    best: [
      'Ask what outcome the team is being measured on.',
      'Check the source before repeating the number upward.',
      'Name the bigger risk and who owns it.',
      'Set one priority and say what stops.',
      'Tell the people affected before the announcement.',
      'Give the date the team can defend.',
      'Own it publicly, contain it, and fix the cause.',
      "Take the part that is right and correct the rest.",
      'Make the tradeoff explicit in the decision log.',
      "Ask what it is worth delaying tomorrow's plan for.",
    ],
    okay: [
      'Start from the plan and adjust.',
      'Use the dashboard and caveat it.',
      'Note the risk in the update.',
      'Let the team sort the order.',
      'Announce and manage the reaction.',
      'Promise the date and push the team.',
      'Fix it and brief the inner circle.',
      'Agree and revisit privately.',
      'Mention the tradeoff in the update.',
      'Say yes and ask for a push.',
    ],
    poor: [
      'Delegate it without context.',
      'Repeat the number that sounds right.',
      'Keep it off the radar.',
      'Declare everything a priority.',
      'Ship it and handle the fallout.',
      'Commit publicly to the date.',
      'Blame the team.',
      'Overrule them in the meeting.',
      'Leave the tradeoff out.',
      'Say no and leave.',
    ],
  },
  {
    id: 'build',
    match: /engineer|developer|devops|sre|qa|test|cloud|architect|database|robot|sysadmin|systems admin/i,
    title: 'Ship it without breaking it',
    skills: ['Debugging', 'Prioritisation', 'Communication'],
    blurb: 'One production issue, one deadline, and a fix that touches something {customer} depends on.',
    best: [
      'Ask what outcome the change has to produce before opening the editor.',
      'Reproduce it locally before trusting any number.',
      'Reproduce the bigger failure and write it down.',
      'Agree one owner and split by dependency, not opinion.',
      'Add a flag and roll it out behind a guard.',
      'Give the date the tests support, not the date they want.',
      'Roll back first, then find the cause.',
      'Show the evidence and separate fact from preference.',
      'Put the tradeoff in the pull request and the release note.',
      "Ask whether it blocks tomorrow's release.",
    ],
    okay: [
      'Start with the obvious implementation and adjust.',
      'Trust the dashboard and note the discrepancy.',
      'Log the bigger issue and finish the ticket.',
      'Take the ticket that unblocks the most people.',
      'Ship it and watch the error rate.',
      'Promise the date and add buffer quietly.',
      'Patch forward and keep monitoring.',
      'Agree publicly and raise it privately later.',
      'Mention the tradeoff in standup.',
      'Do it and skip the test.',
    ],
    poor: [
      'Build the first interpretation that compiles.',
      'Assume the dashboard is right.',
      'Close the ticket and move on.',
      'Work on both and finish neither.',
      'Ship it and hope nobody depends on it.',
      'Say yes and let the team absorb it.',
      'Restart it and hope it stays up.',
      'Argue until they give in.',
      'Leave it out; the code speaks for itself.',
      'Say no and log off.',
    ],
  },
  {
    id: 'operate',
    match: /operations|supply|logistics|production|manufactur|transport|aviation|hospitality|facilit|energy|telecom|construction|mining|agri|maintenance|warehouse|quality/i,
    title: 'The line that cannot stop',
    skills: ['Triage', 'Coordination', 'Safety'],
    blurb: 'Something underneath {domain} is failing, and it has to keep moving.',
    best: [
      'Ask what the output has to be and by when.',
      'Check the actual line, not the dashboard.',
      'Stop and contain the bigger issue first.',
      'Agree the sequence with the people who run it.',
      'Tell the affected party before it lands.',
      'Give the date the capacity supports.',
      'Make it safe, then find the cause.',
      'Show the data and agree the correction.',
      'Put the tradeoff in the handover.',
      'Ask whether it can run tomorrow.',
    ],
    okay: [
      'Start with the standard run and adjust.',
      "Trust the last shift's report.",
      'Log the issue and keep the line moving.',
      'Prioritise the loudest constraint.',
      'Push it through and warn after.',
      'Promise the date and add overtime.',
      'Patch it and keep watching.',
      'Agree and raise it later.',
      'Note the tradeoff in the log.',
      'Say yes and run extra.',
    ],
    poor: [
      "Run it the way it is always run.",
      'Assume the dashboard is current.',
      "Ignore it; it is not today's problem.",
      'Do both and risk both.',
      'Push it and deal with it later.',
      'Say yes and hope capacity appears.',
      'Restart and hope it holds.',
      'Argue on the floor.',
      'Leave the tradeoff out.',
      'Say no and shut down.',
    ],
  },
  {
    id: 'work',
    match: /.*/,
    title: 'The week that would not prioritise',
    skills: ['Prioritisation', 'Communication', 'Judgement'],
    blurb: 'A normal week on the job — until three people need different things by Friday.',
    best: [
      'Ask what decision the request feeds and who else needs it.',
      'Recheck the source before repeating the number.',
      "Scope the bigger issue, then agree what is in this pass.",
      'Get both people in one room and agree the order.',
      'Flag the dependency and offer a safe way to ship.',
      'Give the real date, with what it protects.',
      'Say it early, contain it, and tell who needs to know.',
      "Separate the part that is right from the part that is not.",
      'Put the tradeoff in one line at the top.',
      'Ask what it is for and whether tomorrow can take it.',
    ],
    okay: [
      'Start on the obvious version and check in later.',
      'Note the mismatch and carry on with a caveat.',
      'Fix the request and log the bigger issue for later.',
      'Do the smaller ask first and hope the other slips.',
      'Ship it and warn the customer afterwards.',
      'Give a safe date and keep the real one private.',
      'Quietly fix it and hope nobody noticed.',
      'Concede the point to keep the meeting calm.',
      'Add the tradeoff in an appendix.',
      'Say yes and stay late.',
    ],
    poor: [
      'Guess what they mean and start building.',
      'Use the number that looks more credible.',
      'Stick to the original request.',
      'Escalate both asks and let someone else choose.',
      'Ship it and deal with the fallout.',
      'Promise the date and hope the team catches up.',
      'Blame the data and move on.',
      'Argue back in the meeting.',
      'Leave the tradeoff out.',
      'Say no without offering anything.',
    ],
  },
];

/* ---------- shared situation arc ---------- */

const SITUATIONS = [
  { skill: 'Clarify', text: 'It is 9:40am. {stakeholder} drops a vague request about {artifact} on you and calls it urgent.' },
  { skill: 'Verify', text: 'You open {tool} and the numbers do not match what {stakeholder} quoted in the meeting.' },
  { skill: 'Prioritise', text: 'You find the real problem — and it is bigger than the request.' },
  { skill: 'Decide', text: 'Two people want different things from {artifact} by Friday, and both say theirs is the priority.' },
  { skill: 'Communicate', text: 'You have a fix, but it changes something {customer} depends on.' },
  { skill: 'Pressure', text: '{stakeholder} asks for a date you already know you cannot hit.' },
  { skill: 'Recover', text: 'You make the call. By afternoon it is clear it was wrong, and {risk} is now on the table.' },
  { skill: 'Challenge', text: 'Someone senior contradicts you in front of the team. They are partly right, partly not.' },
  { skill: 'Tradeoff', text: 'The work is done, but the tradeoff you made is invisible in the report going upward.' },
  { skill: 'Close', text: 'It is 6pm. {stakeholder} asks for one more thing before tomorrow.' },
];

const FEEDBACK = {
  best: [
    'Strong. You treated the cause, not the symptom.',
    'Good call. You kept the decision traceable and the risk visible.',
    'That is the professional move: slow enough to be right, fast enough to matter.',
    'Excellent. You protected the relationship and the outcome at the same time.',
  ],
  okay: [
    'Reasonable, but the underlying issue is still there.',
    'Defensible, though you left the hard part for later.',
    'It buys time, but someone downstream pays for it.',
    'Not wrong, not finished. The real question is still open.',
  ],
  poor: [
    'This buys time and spends trust.',
    'You moved the problem, not the outcome.',
    'Fast, but you will be back here tomorrow.',
    'The shortcut is now someone else\'s incident.',
  ],
};

/* ---------- build ---------- */

function familyFor(role) {
  return FAMILIES.find((f) => f.match.test(role)) || FAMILIES[FAMILIES.length - 1];
}

function tokensFor(role, industry) {
  const base = TOKENS[industry.id] || TOKENS.foundation;
  const t = { ...base, role };
  for (const [re, patch] of HINTS) {
    if (re.test(role)) Object.assign(t, patch);
  }
  return t;
}

const fill = (str, t) =>
  String(str).replace(/\{(\w+)\}/g, (_, key) => (t[key] !== undefined ? t[key] : `{${key}}`));

const hash = (s) => {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

function buildPack(role, industry) {
  const family = familyFor(role);
  const t = tokensFor(role, industry);
  const seed = hash(role + industry.id);

  const moments = SITUATIONS.map((s, i) => ({
    skill: s.skill,
    text: fill(s.text, t),
    options: [
      {
        text: fill(family.best[i], t),
        points: 10,
        feedback: FEEDBACK.best[(seed + i) % FEEDBACK.best.length],
      },
      {
        text: fill(family.okay[i], t),
        points: 5,
        feedback: FEEDBACK.okay[(seed + i) % FEEDBACK.okay.length],
      },
      {
        text: fill(family.poor[i], t),
        points: 1,
        feedback: FEEDBACK.poor[(seed + i) % FEEDBACK.poor.length],
      },
    ],
  }));

  return {
    id: '',
    role,
    level: 'Beginner',
    tier: industry.tier,
    industry: industry.name,
    title: family.title,
    length: 10,
    pointsPerMoment: 10,
    generated: true,
    blurb: fill(family.blurb, t),
    skills: family.skills,
    moments,
  };
}

const used = new Map();
const catalogShifts = [];
const packs = {};

for (const industry of INDUSTRIES) {
  for (const [role, , tier] of industry.roles) {
    const family = familyFor(role);
    const t = tokensFor(role, industry);
    let id = slug(role);
    if (used.has(id)) id = `${id}-${slug(industry.id)}`;
    used.set(id, true);

    const pack = buildPack(role, { ...industry, tier });
    pack.id = id;
    packs[id] = pack;

    catalogShifts.push({
      id,
      role,
      roleId: slug(role),
      level: 'Beginner',
      tier,
      industry: industry.name,
      industryId: industry.id,
      title: pack.title,
      blurb: pack.blurb,
      pack: null,
      api: true,
      minutes: 10,
      skills: pack.skills,
      available: true,
      featured: false,
      generated: true,
    });
  }
}

/* featured, hand-authored shift comes from the static site */
const featured = {
  id: 'sdr-beginner',
  role: 'Sales Development Representative',
  roleId: 'sdr',
  level: 'Beginner',
  tier: 'Practitioner',
  industry: 'Sales',
  industryId: 'sales',
  title: 'First call of the day',
  blurb: 'A 40-truck logistics firm picks up. Qualify the pain, survive the objections, and try to book the meeting.',
  pack: 'packs/sdr/beginner.json',
  api: false,
  minutes: 12,
  skills: ['Discovery', 'Objection handling', 'Closing'],
  available: true,
  featured: true,
  generated: false,
};

const catalog = {
  version: 1,
  updated: new Date().toISOString().slice(0, 10),
  source: 'generated',
  featured: 'sdr-beginner',
  shifts: [featured, ...catalogShifts],
};

/* ---------- self-check ---------- */

let problems = 0;
for (const [id, pack] of Object.entries(packs)) {
  if (pack.moments.length !== pack.length) {
    console.error(`FAIL ${id}: ${pack.moments.length} moments, expected ${pack.length}`);
    problems += 1;
  }
  for (const m of pack.moments) {
    if (m.options.length !== 3) {
      console.error(`FAIL ${id}: moment has ${m.options.length} options`);
      problems += 1;
    }
    for (const o of m.options) {
      if (!Number.isFinite(o.points) || o.points < 0 || o.points > 10) {
        console.error(`FAIL ${id}: bad points ${o.points}`);
        problems += 1;
      }
    }
  }
  const max = pack.moments.reduce((s, m) => s + Math.max(...m.options.map((o) => o.points)), 0);
  if (max !== 100) {
    console.error(`FAIL ${id}: max score ${max}`);
    problems += 1;
  }
  if (/\{\w+\}/.test(JSON.stringify(pack))) {
    console.error(`FAIL ${id}: unresolved token`);
    problems += 1;
  }
}
if (problems) process.exit(1);

/* ---------- write ---------- */

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'catalog.json'), JSON.stringify(catalog, null, 2) + '\n');
fs.writeFileSync(path.join(OUT, 'packs.json'), JSON.stringify(packs) + '\n');

const bytes = fs.statSync(path.join(OUT, 'packs.json')).size;
console.log(`roles: ${catalogShifts.length} generated + 1 featured = ${catalog.shifts.length}`);
console.log(`packs: ${Object.keys(packs).length} · ${(bytes / 1024).toFixed(0)} KB`);
console.log(`industries: ${INDUSTRIES.length} · families: ${FAMILIES.length - 1} + generic`);
console.log(`wrote ${path.relative(ROOT, OUT)}/{catalog,packs}.json`);

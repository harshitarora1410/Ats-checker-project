// Data generators for the optional mock service (VITE_USE_MOCK=true).
// Everything is deterministic from a seed so a candidate looks the same on every page.

import { SECTION_KEYS } from "../lib/constants";
import { verdictFromScore } from "../lib/format";

// ── seeded random ───────────────────────────────────────────
export const hashString = (s = "") => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

// mulberry32
export const seededRandom = (seed) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const pick = (r, list) => list[Math.floor(r() * list.length)];
const shuffle = (r, list) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const jitter = (r, amount) => Math.round((r() * 2 - 1) * amount);

// ── vocab ───────────────────────────────────────────────────
export const SKILLS = [
  ["React", /\breact(\.js|js)?\b/i],
  ["TypeScript", /\btypescript\b/i],
  ["JavaScript", /\bjavascript\b/i],
  ["Redux", /\bredux\b/i],
  ["Next.js", /\bnext\.?js\b/i],
  ["GraphQL", /\bgraphql\b/i],
  ["REST APIs", /\brest(ful)?\b/i],
  ["Node.js", /\bnode(\.js|js)?\b/i],
  ["Python", /\bpython\b/i],
  ["FastAPI", /\bfastapi\b/i],
  ["Django", /\bdjango\b/i],
  ["PostgreSQL", /\bpostgres(ql)?\b/i],
  ["MySQL", /\bmysql\b/i],
  ["MongoDB", /\bmongo(db)?\b/i],
  ["AWS", /\baws\b/i],
  ["Docker", /\bdocker\b/i],
  ["Kubernetes", /\b(kubernetes|k8s)\b/i],
  ["Jest", /\bjest\b/i],
  ["Playwright", /\bplaywright\b/i],
  ["Tailwind CSS", /\btailwind\b/i],
  ["HTML/CSS", /\b(html5?|css3?)\b/i],
  ["Vue", /\bvue(\.js)?\b/i],
  ["Angular", /\bangular\b/i],
  ["Java", /\bjava\b/i],
  ["Spring Boot", /\bspring\b/i],
  ["Figma", /\bfigma\b/i],
  ["SQL", /\bsql\b/i],
  ["Excel", /\bexcel\b/i],
  ["Power BI", /\bpower\s?bi\b/i],
  ["Tableau", /\btableau\b/i],
  ["Machine Learning", /\b(machine learning|ml)\b/i],
  ["CI/CD", /\b(ci\/cd|continuous integration)\b/i],
  ["Git", /\bgit\b/i],
  ["Terraform", /\bterraform\b/i],
  ["Redis", /\bredis\b/i],
  ["Microservices", /\bmicroservices?\b/i],
  ["Selenium", /\bselenium\b/i],
  ["Linux", /\blinux\b/i],
  ["Salesforce", /\bsalesforce\b/i],
];

export const ROLE_TEMPLATES = [
  { title: "Senior Frontend Engineer", skills: ["React", "TypeScript", "Redux", "GraphQL", "Jest", "Playwright", "AWS"], years: 5, degree: "Bachelor's in Computer Science", cert: "AWS Certification" },
  { title: "Backend Python Engineer", skills: ["Python", "FastAPI", "PostgreSQL", "Docker", "REST APIs", "AWS", "Redis"], years: 3, degree: "B.Tech in Computer Science", cert: null },
  { title: "Data Analyst", skills: ["SQL", "Python", "Excel", "Power BI", "Tableau"], years: 2, degree: "Bachelor's in Statistics or related", cert: "Google Data Analytics Certificate" },
  { title: "DevOps Engineer", skills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "Linux"], years: 4, degree: "Bachelor's in Computer Science", cert: "AWS Solutions Architect" },
  { title: "Product Designer", skills: ["Figma", "Prototyping", "User Research", "Design Systems", "HTML/CSS"], years: 3, degree: "Bachelor's in Design", cert: null },
  { title: "Full Stack Developer", skills: ["React", "Node.js", "MongoDB", "TypeScript", "Docker", "REST APIs"], years: 3, degree: "B.Tech in Computer Science", cert: null },
  { title: "QA Automation Engineer", skills: ["Selenium", "Playwright", "Java", "CI/CD", "Jest"], years: 2, degree: "Bachelor's in Computer Science", cert: "ISTQB Certification" },
  { title: "HR Business Partner", skills: ["Recruiting", "Employee Relations", "HRIS", "Excel", "Onboarding"], years: 5, degree: "MBA in Human Resources", cert: "SHRM-CP" },
];

export const NAMES = [
  "Aarav Mehta", "Sofia Martinez", "Daniel Kim", "Emily Chen", "Marcus Johnson", "Priyanka Rao",
  "Noah Williams", "Olivia Brown", "Ethan Davis", "Ava Thompson", "Lucas Garcia", "Mia Robinson",
  "Rohan Gupta", "Ananya Iyer", "Kabir Singh", "Neha Kapoor", "Arjun Nair", "Isha Verma",
  "Vikram Joshi", "Sara Khan", "Zoe Patel", "Aditya Menon", "Meera Pillai", "Karan Malhotra",
];

const COMPANIES = ["Cartly", "Zentro SaaS", "Bluepeak Systems", "Finlo", "Kestrel Health", "Orbital Retail", "Quanta Logistics", "Northwind Labs"];
const UNIVERSITIES = ["VIT University", "IIT Delhi", "BITS Pilani", "Manipal Institute of Technology", "NIT Trichy", "Delhi University", "Pune University"];
const CITIES = ["Bengaluru, India", "Pune, India", "Hyderabad, India", "Noida, India", "Mumbai, India", "Chennai, India", "Austin, USA"];

// ── JD profile ──────────────────────────────────────────────
const GENERIC_WORDS = new Set(["senior", "junior", "lead", "engineer", "developer", "manager", "partner", "full"]);

const templateFor = (title = "", seed = 0) => {
  const t = title.toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const tpl of ROLE_TEMPLATES) {
    const words = tpl.title.toLowerCase().split(" ").filter((w) => !GENERIC_WORDS.has(w));
    const score = words.filter((w) => t.includes(w)).length;
    if (score > bestScore) {
      best = tpl;
      bestScore = score;
    }
  }
  return best || ROLE_TEMPLATES[seed % ROLE_TEMPLATES.length];
};

export const buildJdProfile = (jdText = "", title = "") => {
  const tpl = templateFor(title, hashString(jdText + title));
  const found = SKILLS.filter(([, re]) => re.test(jdText)).map(([name]) => name);
  const skills = found.length >= 3 ? found.slice(0, 10) : tpl.skills;

  const yearsMatch = jdText.match(/(\d{1,2})\s*\+?\s*(?:(?:-|to|–)\s*\d{1,2}\s*)?(?:years|yrs)/i);
  const years = yearsMatch ? Number(yearsMatch[1]) : tpl.years;

  let degree = tpl.degree;
  if (/computer science|\bcs\b|b\.?tech/i.test(jdText)) degree = "Bachelor's in Computer Science";
  else if (/bachelor|degree/i.test(jdText)) degree = "Bachelor's degree";

  let cert = tpl.cert;
  if (jdText.trim()) {
    if (/certif/i.test(jdText)) cert = /aws/i.test(jdText) ? "AWS Certification" : tpl.cert || "Relevant certification";
    else cert = null;
  }
  return { title: title || tpl.title, skills, years, degree, cert };
};

// ── candidate ───────────────────────────────────────────────
const containsSkill = (text, skill) => {
  const entry = SKILLS.find(([name]) => name === skill);
  return entry ? entry[1].test(text) : text.toLowerCase().includes(skill.toLowerCase());
};

const readSignals = (text, profile) => {
  const matched = profile.skills.filter((s) => containsSkill(text, s));
  const yearNums = [...text.matchAll(/(\d{1,2}(?:\.\d)?)\s*\+?\s*(?:years|yrs)/gi)].map((m) => Number(m[1]));
  const years = yearNums.length ? Math.max(...yearNums) : 1;
  const hasDegree = /(b\.?\s?tech|bachelor|b\.?sc|b\.?e\b|degree|master|m\.?tech|mba)/i.test(text);
  const hasCert = profile.cert ? /certif/i.test(text) : false;
  return { matched, years, hasDegree, hasCert };
};

const simulateSignals = (r, profile) => {
  const roll = r();
  const quality = roll < 0.35 ? 0.78 + r() * 0.2 : roll < 0.7 ? 0.5 + r() * 0.25 : 0.15 + r() * 0.3;
  const count = clamp(Math.round(profile.skills.length * quality + jitter(r, 1)), 1, profile.skills.length);
  const matched = shuffle(r, profile.skills).slice(0, count);
  const years = Math.max(1, Math.round(profile.years * (0.35 + quality * 1.05) * 2) / 2);
  return { matched, years, hasDegree: r() < 0.35 + quality * 0.65, hasCert: r() < quality, quality };
};

const buildResumeText = ({ name, city, email, profile, signals, r }) => {
  const [c1, c2] = shuffle(r, COMPANIES);
  const uni = pick(r, UNIVERSITIES);
  const skills = signals.matched.length ? signals.matched : profile.skills.slice(0, 2);
  const lead = Math.floor(r() * 3) + 3;
  const lines = [
    name.toUpperCase(),
    `${profile.title} · ${city} · ${email}`,
    "",
    "SUMMARY",
    `${profile.title.replace(/^Senior /, "")} with ${signals.years} years of experience building products with ${skills.slice(0, 3).join(", ")}.`,
    "",
    "EXPERIENCE",
    `${profile.title} — ${c1} (${2025 - Math.ceil(signals.years / 2)} – Present)`,
    `• Led a team of ${lead} engineers delivering features with ${skills[0]}${skills[1] ? ` and ${skills[1]}` : ""}.`,
    `• Built and maintained services used by ${Math.floor(r() * 40) + 10}k monthly users.`,
    skills[2] ? `• Introduced ${skills[2]} across the codebase and improved release speed by ${Math.floor(r() * 30) + 20}%.` : "• Improved release speed through better tooling.",
    "",
    `${profile.title.replace(/^Senior /, "")} — ${c2} (${2025 - Math.ceil(signals.years)} – ${2025 - Math.ceil(signals.years / 2)})`,
    `• Shipped customer-facing features${skills[3] ? ` using ${skills[3]}` : ""}.`,
    `• Raised unit test coverage to ${Math.floor(r() * 25) + 65}%.`,
    "",
    "EDUCATION",
    signals.hasDegree ? `${profile.degree} — ${uni}, ${2025 - Math.ceil(signals.years) - 1}` : `Diploma — ${uni}`,
  ];
  if (signals.hasCert && profile.cert) lines.push("", "CERTIFICATIONS", `• ${profile.cert} (${2023 + Math.floor(r() * 3)})`);
  lines.push("", "SKILLS", skills.join(", "));
  return lines.join("\n");
};

const verdictWord = { strong: "strong", moderate: "moderate", weak: "weak" };

/**
 * Builds a fully scored candidate. `text` is the real resume text when we have it
 * (.txt uploads); otherwise the signals and resume text are simulated.
 */
export const scoreCandidate = ({ name, seed, text, profile, weights }) => {
  const r = seededRandom(seed);
  const signals = text ? readSignals(text, profile) : simulateSignals(r, profile);
  const [first, last = "candidate"] = name.toLowerCase().split(" ");
  const email = text?.match(/[\w.+-]+@[\w-]+\.[\w.]+/)?.[0] || `${first}.${last}@mail.com`;
  const city = pick(r, CITIES);
  const req = profile.years;

  // Skills
  const missingSkills = profile.skills.filter((s) => !signals.matched.includes(s));
  const skillRatio = signals.matched.length / profile.skills.length;
  const skills = {
    score: clamp(Math.round(skillRatio * 100 + jitter(r, 4)), 8, 100),
    matched: signals.matched,
    missing: missingSkills,
    reasoning: `Covers ${signals.matched.length} of ${profile.skills.length} required skills${
      missingSkills.length ? `; ${missingSkills.slice(0, 2).join(" and ")} ${missingSkills.length > 1 ? "are" : "is"} not mentioned` : " with hands-on project evidence"
    }.`,
  };

  // Experience
  const expRatio = Math.min(signals.years / req, 1.4);
  const experience = {
    score: clamp(Math.round(expRatio >= 1 ? 82 + (expRatio - 1) * 40 + jitter(r, 3) : 25 + expRatio * 52 + jitter(r, 4)), 10, 100),
    matched: [`${signals.years} yrs experience`, ...(expRatio >= 1 ? [`Led team of ${Math.floor(r() * 3) + 3}`] : [])],
    missing: signals.years < req ? [`${req}+ yrs experience`] : [],
    reasoning:
      signals.years >= req
        ? `Meets the ${req}+ year requirement with ${signals.years} years of relevant work.`
        : `Has ${signals.years} years of experience against the ${req}+ years asked for.`,
  };

  // Education
  const education = signals.hasDegree
    ? { score: clamp(88 + jitter(r, 10), 80, 100), matched: [profile.degree], missing: [], reasoning: `Meets the ${profile.degree} requirement.` }
    : { score: clamp(50 + jitter(r, 8), 40, 62), matched: [], missing: [profile.degree], reasoning: `No ${profile.degree} found in the resume.` };

  // Certifications
  let certifications;
  if (!profile.cert) certifications = { score: 100, matched: [], missing: [], reasoning: "Not required by the job description." };
  else if (signals.hasCert) certifications = { score: clamp(88 + jitter(r, 8), 80, 100), matched: [profile.cert], missing: [], reasoning: `Holds the ${profile.cert} preferred in the JD.` };
  else certifications = { score: clamp(28 + jitter(r, 10), 10, 45), matched: [], missing: [profile.cert], reasoning: `No ${profile.cert} listed; the JD prefers it.` };

  const raw = { skills, experience, education, certifications };
  const sections = {};
  let overall = 0;
  for (const key of SECTION_KEYS) {
    const weight = Number(weights[key]) || 0;
    const weighted = Math.round(raw[key].score * weight) / 100;
    overall += weighted;
    sections[key] = { ...raw[key], weight, weighted_points: Math.round(weighted * 100) / 100 };
  }
  overall = Math.round(overall * 100) / 100;
  const verdict = verdictFromScore(overall);

  const strengths = [
    signals.matched.length ? `Hands-on ${signals.matched.slice(0, 3).join(", ")} experience` : null,
    signals.years >= req ? `${signals.years} years of relevant experience` : null,
    signals.hasDegree ? `Holds ${profile.degree}` : null,
    signals.hasCert && profile.cert ? `Has ${profile.cert}` : null,
  ].filter(Boolean);

  const gapList = [...missingSkills.slice(0, 2), ...experience.missing, ...education.missing, ...certifications.missing];
  const gaps = gapList.slice(0, 4).map((g) => `No ${g} mentioned`);

  const recommendations =
    verdict === "strong"
      ? ["Advance to technical interview", gapList[0] ? `Probe ${gapList[0]} during the interview.` : "Strong overall fit across every section."]
      : verdict === "moderate"
        ? ["Shortlist for a screening call", gapList[0] ? `Check depth of ${gapList[0]} before moving ahead.` : "Confirm role expectations in the screening call."]
        : ["Not a fit for this role right now", "Keep on file for more junior openings."];

  const summary = `${name} is a ${verdictWord[verdict]} match for the ${profile.title} role${
    signals.matched.length ? `, with ${signals.matched.slice(0, 3).join(", ")} experience` : ""
  }${gapList.length ? `. Gaps: ${gapList.slice(0, 2).join(", ")}.` : "."}`;

  const extracted_text = text || buildResumeText({ name, city, email, profile, signals, r });

  const report_text = [
    `Candidate: ${name}`,
    `Overall: ${overall}/100 (${verdict})`,
    ...SECTION_KEYS.map((k) => `${k}: ${sections[k].score} (weight ${sections[k].weight}%)`),
    `Summary: ${summary}`,
  ].join("\n");

  return { overall_score: overall, verdict, sections, summary, strengths, gaps, recommendations, extracted_text, report_text };
};

// JD text for seeded history jobs
export const buildJdText = (tpl) =>
  [
    `${tpl.title}`,
    "",
    `We're hiring a ${tpl.title} with ${tpl.years}+ years of experience.`,
    "",
    "Requirements:",
    ...tpl.skills.map((s) => `• ${s}`),
    `• ${tpl.degree}`,
    ...(tpl.cert ? [`• ${tpl.cert} preferred`] : []),
  ].join("\n");

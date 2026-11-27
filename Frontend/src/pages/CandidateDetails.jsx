
import { useState } from "react";

import CandidateHeader from "../components/CandidateHeader";
import ScoreBreakdown from "../components/ScoreBreakdown";
import AISummary from "../components/AISummary";
import ResumePreview from "../components/ResumePreview";

function CandidateDetails({ onDownloadReport }) {
  const [candidateData, setCandidateData] = useState({
    candidate: {
      name: "Aarav Mehta",
      score: 92,
      rank: 1,
      totalCandidates: 12,
      fit: "Strong fit",
      aiModel: "Claude",
      jobTitle: "Senior Frontend Engineer",
      location: "Bengaluru, India",
      resumeName: "Aarav_Mehta_Resume.pdf",
      email: "aarav.mehta@mail.com",
    },

    sections: [
      {
        title: "Skills",
        score: 96,
        weight: "35%",
        weighted: "33.6",
        icon: "skills",
        matched: [
          "React 18",
          "TypeScript",
          "GraphQL / Apollo",
          "Redux Toolkit",
          "Jest",
        ],
        missing: ["Playwright"],
        explanation:
          "Covers 9 of 10 required skills with recent, hands-on project evidence. Only end-to-end testing with Playwright is not mentioned.",
      },
      {
        title: "Experience",
        score: 93,
        weight: "35%",
        weighted: "32.6",
        icon: "experience",
        matched: [
          "6 yrs frontend",
          "Led team of 4",
          "SaaS product scale",
          "Design systems",
        ],
        missing: ["Fintech domain"],
        explanation:
          "Exceeds the 5+ year requirement with progressive seniority and leadership. Domain experience is in e-commerce rather than fintech.",
      },
      {
        title: "Education",
        score: 88,
        weight: "15%",
        weighted: "13.2",
        icon: "education",
        matched: [
          "B.Tech Computer Science",
          "Accredited university",
        ],
        missing: ["Master's (preferred)"],
        explanation:
          "Meets the required CS degree. The optional master's degree listed as nice to have is not present.",
      },
      {
        title: "Certifications",
        score: 86,
        weight: "15%",
        weighted: "12.9",
        icon: "certifications",
        matched: [
          "AWS Developer Associate",
          "Meta Frontend Cert.",
        ],
        missing: ["AWS Solutions Architect"],
        explanation:
          "Holds a current AWS certification as preferred in the JD. A higher-tier architect certification would score full marks.",
      },
    ],

    resume: {
      name: "AARAV MEHTA",
      title: "Senior Frontend Engineer",
      location: "Bengaluru",
      email: "aarav.mehta@mail.com",
      summary:
        "Frontend engineer with 6 years of experience building scalable SaaS products using React and TypeScript. Passionate about design systems and performance.",
      experience: [
        {
          role: "Lead Frontend Engineer — Cartly",
          period: "2022 – Present",
          points: [
            "Led a team of 4 engineers rebuilding checkout in React 18.",
            "Built a shared design system used by 6 product teams.",
            "Migrated REST endpoints to GraphQL with Apollo.",
          ],
        },
        {
          role: "Frontend Engineer — Zentro SaaS",
          period: "2019 – 2022",
          points: [
            "Shipped analytics dashboards with Redux Toolkit.",
            "Raised unit coverage to 85% with Jest.",
            "Deployed static assets via AWS S3 + CloudFront.",
          ],
        },
      ],
      education: "B.Tech, Computer Science — VIT University, 2019",
      certifications: [
        "AWS Certified Developer – Associate (2023)",
        "Meta Front-End Developer Certificate (2021)",
      ],
      skills:
        "React, TypeScript, Next.js, GraphQL, Redux, Jest, Storybook, Tailwind, Node.js, AWS",
    },

    summary: {
      strengths: [
        "Deep React + TypeScript expertise across 3 production SaaS apps",
        "Proven team leadership and mentoring",
        "AWS certified with CloudFront / Lambda experience",
      ],
      gaps: [
        "No Playwright / E2E testing mentioned",
        "No fintech or regulated-domain experience",
      ],
      recommendation: "Advance to technical interview",
      recommendationNote:
        "Strong overall fit. Probe E2E testing practices and interest in the fintech domain during the interview.",
    },
  });

  return (
    <div className="min-h-screen w-full bg-slate-100 p-6">
      <div className="max-w-[1600px] mx-auto">

        <CandidateHeader
          candidate={candidateData.candidate}
          onDownloadReport={onDownloadReport}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5">

          <div className="lg:col-span-8 flex flex-col gap-5 min-w-0">
            <ScoreBreakdown sections={candidateData.sections} />
            <AISummary summary={candidateData.summary} />
          </div>

          <div className="lg:col-span-4 min-w-0">
            <ResumePreview resume={candidateData.resume} />
          </div>

        </div>
      </div>
    </div>
  );
}

export default CandidateDetails;

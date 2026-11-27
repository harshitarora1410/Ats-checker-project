
import { useState } from "react";

import ReportHeader from "../components/ReportHeader";
import CandidateOverview from "../components/CandidateOverview";
import SectionScores from "../components/SectionScores";
import MatchDetails from "../components/MatchDetails";
import ReportSummary from "../components/ReportSummary";
import ReportFooter from "../components/ReportFooter";

function CandidatePDFReport() {
  const [reportData, setReportData] = useState({
    header: {
      jobTitle: "Senior Frontend Engineer",
      company: "Northwind Labs",
      reportNumber: "ATS-2025-0412",
    },

    candidate: {
      name: "Aarav Mehta",
      score: 92,
      resumeName: "Aarav_Mehta_Resume.pdf",
      email: "aarav.mehta@mail.com",
      fit: "Strong fit",
      rank: 1,
      totalCandidates: 12,
      aiModel: "Claude",
    },

    sections: [
      {
        title: "Skills",
        weight: "35%",
        score: 96,
        weighted: "33.6",
      },
      {
        title: "Experience",
        weight: "35%",
        score: 93,
        weighted: "32.6",
      },
      {
        title: "Education",
        weight: "15%",
        score: 88,
        weighted: "13.2",
      },
      {
        title: "Certifications",
        weight: "15%",
        score: 86,
        weighted: "12.9",
      },
    ],

    matchDetails: [
      {
        title: "Skills",
        matched: [
          "React 18",
          "TypeScript",
          "GraphQL",
          "Redux Toolkit",
          "Jest",
        ],
        missing: ["Playwright"],
      },
      {
        title: "Experience",
        matched: [
          "6 yrs frontend",
          "Led team of 4",
          "SaaS scale",
          "Design systems",
        ],
        missing: ["Fintech domain"],
      },
      {
        title: "Education",
        matched: ["B.Tech Computer Science"],
        missing: ["Master's (preferred)"],
      },
      {
        title: "Certifications",
        matched: [
          "AWS Developer Associate",
          "Meta Frontend",
        ],
        missing: ["AWS Solutions Architect"],
      },
    ],

    summary: {
      description:
        "Aarav is a strong match for the Senior Frontend Engineer role, with deep React and TypeScript expertise, proven leadership and a current AWS certification. Minor gaps exist in E2E testing and fintech domain exposure.",

      strengths: [
        "Production React/TS across 3 SaaS apps",
        "Team leadership & mentoring",
        "AWS certified",
      ],

      gaps: [
        "No Playwright / E2E testing",
        "No fintech experience",
      ],

      recommendation: "Advance to technical interview",
    },

    generatedAt: "14 May 2025, 10:48 AM",
  });

  
  return (
    <main className="report-page mx-auto bg-white">
      <ReportHeader header={reportData.header} />

      <div className="report-content">
        <CandidateOverview candidate={reportData.candidate} />

        <SectionScores
          sections={reportData.sections}
          overallScore={reportData.candidate.score}
        />

        <MatchDetails details={reportData.matchDetails} />

        <ReportSummary summary={reportData.summary} />
      </div>

      <ReportFooter generatedAt={reportData.generatedAt} />
    </main>
  );
}

export default CandidatePDFReport;

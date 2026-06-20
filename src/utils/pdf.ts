import { jsPDF } from "jspdf";
import { AnalysisResponse } from "../types";

/**
 * Generates and downloads a beautifully formatted, high-prestige executive PDF report
 * containing the full scan metrics, ATS recommendations, and strategic advice.
 */
export const downloadReportPDF = (result: AnalysisResponse) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 15;
  const contentWidth = pageWidth - marginX * 2;
  let currentY = 20;

  // Header and background wrapper for new pages
  const addNewPage = () => {
    doc.addPage();
    // Fill page background
    doc.setFillColor(252, 250, 246);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // Top horizontal header line
    doc.setDrawColor(220, 215, 210); // stone-200
    doc.setLineWidth(0.35);
    doc.line(marginX, 15, marginX + contentWidth, 15);

    // Top micro labels
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 113, 108); // stone-500
    doc.text("RESUME ROASTER & OPTIMIZER REPORT", marginX, 11);

    currentY = 24; // Start content lower
  };

  // Automated page overflow check
  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 20) {
      addNewPage();
    }
  };

  // page 1 background initialisation
  doc.setFillColor(252, 250, 246);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Title Block Title Banner
  doc.setFillColor(12, 10, 9); // stone-950
  doc.rect(marginX, currentY, contentWidth, 24, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(13);
  doc.text("RESUME ROASTER & OPTIMIZATION REPORT", marginX + 8, currentY + 10);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(196, 190, 186); // stone-300
  doc.text(`Report Log: ${new Date().toLocaleDateString()} | Confidential Executive ATS Scan Output`, marginX + 8, currentY + 17);

  currentY += 32;

  // Section 1: ATS Compliance Scorecard
  const score = result.atsScore || 0;
  let scoreColor = [239, 68, 68]; // Red
  let scoreText = "CRITICAL PATH FAILURE";
  if (score > 75) {
    scoreColor = [16, 185, 129]; // Emerald
    scoreText = "ATS SECURE & PARSE READY";
  } else if (score > 45) {
    scoreColor = [249, 115, 22]; // Orange
    scoreText = "WARNING: MEDIUM OPTIMIZATION RISK";
  }

  const summaryExplanation = score > 75
    ? "ATS Safe: The parsing pipeline matched target keyword dimensions effectively. Structure meets top criteria."
    : score > 45
    ? "Partially Optimized: Lacks action verbs and precision operational metrics. Vulnerable to partial keyword truncation."
    : "Critical Rejection Profile: The current wordings and lack of KPIs will trigger automatic semantic disqualification.";

  // Wrap evaluation description
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8.5);
  const summaryWraps: string[] = doc.splitTextToSize(summaryExplanation, contentWidth - 12);

  // Height dynamic calculation
  const scoreCardHeight = 7 + 5 + 12 + 6 + (summaryWraps.length * 4.5) + 6;

  checkPageBreak(scoreCardHeight + 10);

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(220, 215, 210);
  doc.rect(marginX, currentY, contentWidth, scoreCardHeight, "F");
  doc.rect(marginX, currentY, contentWidth, scoreCardHeight, "D");

  doc.setTextColor(12, 10, 9);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("1. ATS PARSING SUITE STATISTICS", marginX + 6, currentY + 7);

  doc.setFontSize(24);
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.text(`${score}%`, marginX + 6, currentY + 18);

  doc.setFontSize(8);
  doc.setFont("Helvetica", "bold");
  doc.text(scoreText, marginX + 6, currentY + 24);

  doc.setFont("Helvetica", "normal");
  doc.setTextColor(120, 113, 108); // stone-500
  doc.setFontSize(8.5);
  let textY = currentY + 29;
  for (const line of summaryWraps) {
    doc.text(line, marginX + 6, textY);
    textY += 4.5;
  }

  currentY += scoreCardHeight + 8;

  // Section 2: Executive Recruiter Narrative Critique
  const reactionText = `"${result.reaction}"`;
  doc.setFont("Helvetica", "italic");
  doc.setFontSize(8.5);
  const reactionLines: string[] = doc.splitTextToSize(reactionText, contentWidth - 12);

  // Height calculation for Critique card
  const critiqueCardHeight = 7 + 5 + (reactionLines.length * 4.5) + 6 + 6;

  checkPageBreak(critiqueCardHeight + 10);

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(220, 215, 210);
  doc.rect(marginX, currentY, contentWidth, critiqueCardHeight, "F");
  doc.rect(marginX, currentY, contentWidth, critiqueCardHeight, "D");

  doc.setFont("Helvetica", "bold");
  doc.setTextColor(12, 10, 9);
  doc.setFontSize(9.5);
  doc.text("2. EXECUTIVE RECRUITER NARRATIVE CRITIQUE", marginX + 6, currentY + 7);

  doc.setFont("Helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(68, 64, 60); // stone-700
  let critiqueTextY = currentY + 13;
  for (const line of reactionLines) {
    doc.text(line, marginX + 6, critiqueTextY);
    critiqueTextY += 4.5;
  }

  // Draw category stamp badge line
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(120, 113, 108); // stone-500
  doc.text("SEVERITY CRITERIA: ", marginX + 6, critiqueTextY + 2);
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.text(result.reactionCategory || "EVALUATED", marginX + 37, critiqueTextY + 2);

  currentY += critiqueCardHeight + 8;

  // Section 3: Dual Column - Buzzwords vs Missing Metrics
  const colWidth = (contentWidth - 6) / 2;

  // Prep Buzzwords
  const buzzItems: string[][] = [];
  if (result.buzzwords && result.buzzwords.length > 0) {
    result.buzzwords.slice(0, 5).forEach((item) => {
      const wrapped = doc.splitTextToSize(`• ${item}`, colWidth - 10);
      buzzItems.push(wrapped);
    });
    if (result.buzzwords.length > 5) {
      buzzItems.push(doc.splitTextToSize(`• And ${result.buzzwords.length - 5} other elements`, colWidth - 10));
    }
  } else {
    buzzItems.push(doc.splitTextToSize("No highly egregious buzzwords found.", colWidth - 10));
  }

  // Prep Missing Metrics
  const metricItems: string[][] = [];
  if (result.missingMetrics && result.missingMetrics.length > 0) {
    result.missingMetrics.slice(0, 5).forEach((item) => {
      const wrapped = doc.splitTextToSize(`• ${item}`, colWidth - 10);
      metricItems.push(wrapped);
    });
    if (result.missingMetrics.length > 5) {
      metricItems.push(doc.splitTextToSize(`• And ${result.missingMetrics.length - 5} other diagnostic gaps`, colWidth - 10));
    }
  } else {
    metricItems.push(doc.splitTextToSize("Quantifiable strategic metrics balanced properly.", colWidth - 10));
  }

  // Compute column list heights
  let totalBuzzH = 10;
  buzzItems.forEach(wrappedLines => {
    totalBuzzH += (wrappedLines.length * 4.5) + 1.2;
  });
  totalBuzzH += 5;

  let totalMetricH = 10;
  metricItems.forEach(wrappedLines => {
    totalMetricH += (wrappedLines.length * 4.5) + 1.2;
  });
  totalMetricH += 5;

  // Match column box heights exactly for symmetry
  const uniformColHeight = Math.max(totalBuzzH, totalMetricH, 44);

  checkPageBreak(uniformColHeight + 10);

  // Render Left Column
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(220, 215, 210);
  doc.rect(marginX, currentY, colWidth, uniformColHeight, "F");
  doc.rect(marginX, currentY, colWidth, uniformColHeight, "D");

  doc.setFont("Helvetica", "bold");
  doc.setTextColor(239, 68, 68); // Red-500
  doc.setFontSize(8.5);
  doc.text("HIGH RISK BUZZWORDS FLAGGED", marginX + 5, currentY + 6);

  doc.setFont("Helvetica", "normal");
  doc.setTextColor(41, 37, 36);
  doc.setFontSize(8);
  let buzzY = currentY + 12;
  buzzItems.forEach((wrappedLines) => {
    wrappedLines.forEach((line, index) => {
      doc.text(line, marginX + (index === 0 ? 5 : 8), buzzY);
      buzzY += 4.2;
    });
    buzzY += 1;
  });

  // Render Right Column
  doc.setFillColor(255, 255, 255);
  doc.rect(marginX + colWidth + 6, currentY, colWidth, uniformColHeight, "F");
  doc.rect(marginX + colWidth + 6, currentY, colWidth, uniformColHeight, "D");

  doc.setFont("Helvetica", "bold");
  doc.setTextColor(249, 115, 22); // Orange-500
  doc.setFontSize(8.5);
  doc.text("CRITICAL MISSING METRICS / KPIs", marginX + colWidth + 11, currentY + 6);

  doc.setFont("Helvetica", "normal");
  doc.setTextColor(41, 37, 36);
  let metricY = currentY + 12;
  metricItems.forEach((wrappedLines) => {
    wrappedLines.forEach((line, index) => {
      doc.text(line, marginX + colWidth + (index === 0 ? 11 : 14), metricY);
      metricY += 4.2;
    });
    metricY += 1;
  });

  currentY += uniformColHeight + 8;

  // Section 4: Suggestion Bullets Refactoring Comparative
  if (result.suggestedFormatAfter) {
    const beforeText = result.suggestedFormatBefore || "No original sample loaded";
    const afterText = result.suggestedFormatAfter || "No recommended template loaded";
    const whyText = result.suggestedFormatWhy || "Analyzed impact parameters reconstructed correctly according to industry levels.";

    const beforeLines = doc.splitTextToSize(beforeText, contentWidth - 18);
    const afterLines = doc.splitTextToSize(afterText, contentWidth - 18);
    const whyLines = doc.splitTextToSize(whyText, contentWidth - 12);

    const beforeBoxHeight = 5 + (beforeLines.length * 4.5) + 4;
    const afterBoxHeight = 5 + (afterLines.length * 4.5) + 4;
    const whyHeight = whyLines.length * 4.5;

    // Outer card borders padding
    const totalRewriteCardHeight = 7 + 5 + 3 + beforeBoxHeight + 4 + afterBoxHeight + 6 + whyHeight + 6;

    checkPageBreak(totalRewriteCardHeight + 10);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220, 215, 210);
    doc.rect(marginX, currentY, contentWidth, totalRewriteCardHeight, "F");
    doc.rect(marginX, currentY, contentWidth, totalRewriteCardHeight, "D");

    doc.setFont("Helvetica", "bold");
    doc.setTextColor(16, 185, 129); // Emerald-500
    doc.setFontSize(9.5);
    doc.text("3. STRATEGIC BULLET REFACTORING COMPARATIVE", marginX + 6, currentY + 7);

    // Red before box
    let boxBeforeY = currentY + 12;
    doc.setFillColor(254, 242, 242); // Red-50
    doc.rect(marginX + 6, boxBeforeY, contentWidth - 12, beforeBoxHeight, "F");

    doc.setFont("Helvetica", "bold");
    doc.setTextColor(220, 38, 38); // Red-600
    doc.setFontSize(7.5);
    doc.text("ORIGINAL COMPOSITION:", marginX + 9, boxBeforeY + 4.5);

    doc.setFont("Helvetica", "normal");
    doc.setTextColor(68, 64, 60);
    doc.setFontSize(8);
    let beforeTextY = boxBeforeY + 9;
    beforeLines.forEach((line) => {
      doc.text(line, marginX + 9, beforeTextY);
      beforeTextY += 4.5;
    });

    // Green after box
    let boxAfterY = boxBeforeY + beforeBoxHeight + 4;
    doc.setFillColor(236, 253, 245); // Emerald-50
    doc.rect(marginX + 6, boxAfterY, contentWidth - 12, afterBoxHeight, "F");

    doc.setFont("Helvetica", "bold");
    doc.setTextColor(5, 150, 105); // Emerald-600
    doc.setFontSize(7.5);
    doc.text("PROPOSED PROFESSIONAL REWRITE:", marginX + 9, boxAfterY + 4.5);

    doc.setFont("Helvetica", "normal");
    doc.setTextColor(28, 25, 23);
    doc.setFontSize(8);
    let afterTextY = boxAfterY + 9;
    afterLines.forEach((line) => {
      doc.text(line, marginX + 9, afterTextY);
      afterTextY += 4.5;
    });

    // Rationale description label
    let rationaleY = boxAfterY + afterBoxHeight + 6;
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(12, 10, 9);
    doc.setFontSize(7.5);
    doc.text("REFACTORING RATIONALE & METRICS STRATEGY COMPLIANCE:", marginX + 6, rationaleY);

    doc.setFont("Helvetica", "normal");
    doc.setTextColor(115, 115, 115);
    doc.setFontSize(8);
    let rationaleTextY = rationaleY + 4.5;
    whyLines.forEach((line) => {
      doc.text(line, marginX + 6, rationaleTextY);
      rationaleTextY += 4.5;
    });

    currentY += totalRewriteCardHeight + 8;
  }

  // Section 5: Detailed Recommendation Roadmaps (Markdown content)
  if (result.contentMarkdown) {
    addNewPage();

    doc.setFont("Helvetica", "bold");
    doc.setTextColor(12, 10, 9);
    doc.setFontSize(11);
    doc.text("4. DETAILED RECOMMENDATION ROADMAP & ADMONITIONS", marginX, currentY);

    doc.setDrawColor(220, 215, 210);
    doc.setLineWidth(0.35);
    doc.line(marginX, currentY + 3, marginX + contentWidth, currentY + 3);
    currentY += 10;

    const paragraphs = result.contentMarkdown.split("\n");
    for (let i = 0; i < paragraphs.length; i++) {
      let rawText = paragraphs[i].trim();
      if (!rawText) {
        currentY += 3;
        continue;
      }

      let fontSize = 8.5;
      let fontStyle = "normal";
      let headingColor = [68, 64, 60]; // stone-700
      let leftPadding = 0;

      if (rawText.startsWith("###")) {
        fontSize = 9.5;
        fontStyle = "bold";
        headingColor = [12, 10, 9];
        rawText = rawText.replace(/^###\s*/, "").toUpperCase();
        currentY += 4;
      } else if (rawText.startsWith("##")) {
        fontSize = 10;
        fontStyle = "bold";
        headingColor = [12, 10, 9];
        rawText = rawText.replace(/^##\s*/, "").toUpperCase();
        currentY += 5;
      } else if (rawText.startsWith("#")) {
        fontSize = 10.5;
        fontStyle = "bold";
        headingColor = [12, 10, 9];
        rawText = rawText.replace(/^#\s*/, "").toUpperCase();
        currentY += 6;
      } else if (rawText.startsWith("-") || rawText.startsWith("*")) {
        headingColor = [41, 37, 36];
        rawText = "• " + rawText.replace(/^[-*]\s*/, "");
        leftPadding = 3.5;
      }

      doc.setFont("Helvetica", fontStyle);
      doc.setFontSize(fontSize);
      doc.setTextColor(headingColor[0], headingColor[1], headingColor[2]);

      const lines = doc.splitTextToSize(rawText, contentWidth - leftPadding);
      checkPageBreak(lines.length * 4.5 + 3);

      for (const line of lines) {
        doc.text(line, marginX + leftPadding, currentY);
        currentY += 4.5;
      }
      currentY += 1;
    }
  }

  // Bottom confidentiality watermark footer on the last active page
  const totalPages = doc.getNumberOfPages();
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    doc.setPage(pageNum);
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(168, 162, 158); // stone-400
    doc.text(`Page ${pageNum} of ${totalPages} | Prepared dynamically via AES-Parsing System v1.4`, marginX, pageHeight - 10);
  }

  doc.save(`Resume_Optimization_Report_Score_${score}.pdf`);
};

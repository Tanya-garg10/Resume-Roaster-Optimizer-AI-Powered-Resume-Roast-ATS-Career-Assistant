import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit for larger attachments like PDFs in base64
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Initialize Google Gen AI client with developer key and telemetry Agent header
const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper to perform automated retry with exponential backoff and model fallbacks
async function generateContentWithRetry(aiClient: any, params: any) {
  // Support three levels of models: primary gemini-3.5-flash, standard gemini-flash-latest, and lightweight gemini-3.1-flash-lite
  const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    // Primary model gets 2 attempts, fallbacks get 1 attempt to stay responsive and avoid timeout
    const maxTriesForModel = modelName === "gemini-3.5-flash" ? 2 : 1;
    let delay = 1000;
    
    for (let attempt = 1; attempt <= maxTriesForModel; attempt++) {
      try {
        console.log(`[Gemini API] Requesting ${modelName} (Attempt ${attempt}/${maxTriesForModel})`);
        
        const currentParams = {
          ...params,
          model: modelName,
        };

        const response = await aiClient.models.generateContent(currentParams);
        return response;
      } catch (error: any) {
        lastError = error;
        
        // Robustly parse the error to ensure we capture messages/statuses/codes even inside serialized error objects
        let errorMsg = String(error?.message || "");
        try {
          if (error && typeof error === "object") {
            errorMsg += " " + (error.status || error.code || "");
            errorMsg += " " + JSON.stringify(error);
          }
        } catch (e) {
          // ignore serialization failures
        }
        if (!errorMsg.trim()) {
          errorMsg = String(error);
        }

        console.warn(`[Gemini API] Error on ${modelName} (Attempt ${attempt}):`, errorMsg);

        // Retriable codes (503 Service Unavailable, 429 Rate Limit, status/message errors)
        const isRetriable = 
          errorMsg.includes("503") || 
          errorMsg.includes("429") || 
          errorMsg.includes("UNAVAILABLE") || 
          errorMsg.includes("RESOURCE_EXHAUSTED") ||
          errorMsg.toLowerCase().includes("high demand") ||
          errorMsg.toLowerCase().includes("temporary") ||
          errorMsg.toLowerCase().includes("spike");

        if (attempt < maxTriesForModel && isRetriable) {
          console.log(`[Gemini API] Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 1.5;
        } else {
          break;
        }
      }
    }
  }

  throw lastError || new Error("Failed to produce AI response with any models or retries.");
}

// Full-stack API Endpoints
app.post("/api/analyze", async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const { mode, resumeText, fileBase64, fileName, industry, roastLevel, roastPersona, optimizationDirective } = req.body;

    if (!resumeText && !fileBase64) {
      return res.status(400).json({ error: "No resume data or text provided." });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured. Please add it to your secrets panel.",
      });
    }

    // Prepare system instructions and inputs
    let systemInstruction = "";
    if (mode === "roast") {
      const levelDesc = roastLevel === "nuclear" ? "Absolute savage & nuclear annihilation (extremely funny, high-octane banter)" : roastLevel === "mild" ? "Gentle sarcasm & mild teasing" : "Brutal honesty & professional dry humor";
      const personaDesc = roastPersona === "vc" ? "An arrogant Silicon Valley Venture Capitalist looking for '10x founders'" : roastPersona === "hr" ? "A passive-aggressive, corporate HR Lead who has filtered 500,000 dull CVs" : "A witty, sarcastic tech lead recruiter";

      systemInstruction = `You are a hilariously witty resume roaster. Your persona is: ${personaDesc}.
The candidate requested the following severity: ${levelDesc}.
Roast the candidate's resume brutally for laughs, but make it constructive and never personally abusive or hateful.
Analyze the provided resume context (which is for the "${industry || "General"}" industry).
Focus on:
1. Identifying generic and boring buzzwords (e.g., 'synergy', 'go-getter', 'passionate team player').
2. Pointing out vague bullets that lack quantitative achievements or metrics.
3. Critiquing boring action verbs or passive sentences.

In your JSON response, follow these strict directives:
- 'atsScore': Award a highly realistic (likely low or average, e.g. 10-60%) ATS compatibility score. Be brutally honest based on the metrics!
- 'reaction': Provide an emoji-centric, dramatic internal thought representing your persona (e.g. "*Heavy sighing noises while looking for the delete key* 🗑️"). Max 15 words.
- 'reactionCategory': Classify the reaction strictly as 'CRITICAL' (for poor sections), 'MILD_ANNOYANCE' (mostly fluff), 'IMPRESSED' (actually decent), or 'READY_TO_OFFER' (rare perfection).
- 'buzzwords': Provide a clean string array of up to 5 obnoxious fluff words found.
- 'missingMetrics': Provide a string array of bullet points or segments where a clear numeric outcome was missing.
- 'contentMarkdown': Provide a magnificent, structured, brutal-yet-constructive markdown roast. Use formatting like bold, bullet lists, blockquotes, and headings. At the very end of your roast, write a playful "Professional Translation" section translating their fluff bullets into what they actually mean.`;
    } else {
      const optDirectiveDesc = optimizationDirective === "metrics" ? "Focus heavily on quantifying achievements and missing statistical data" : optimizationDirective === "verbs" ? "Prioritize replacement of weak passive verbs with strong Fortune 500 power verbs" : optimizationDirective === "keywords" ? "Tailor output specifically to bypass modern ATS keyword screening tools" : "General comprehensive layout and structure optimization with metrics & keywords";

      systemInstruction = `You are an elite, high-performing recruitment consultant and ATS (Applicant Tracking System) optimization guru. 
Optimize the provided resume text/file tailored specifically for the "${industry || "General"}" industry.
Your main focus area should be: ${optDirectiveDesc}.

Directives:
1. Provide a comprehensive critique and rewritten version of the resume bullets.
2. Structure your recommendations so they use powerful action verbs, align with industry standards, and maximize ATS scanning compatibility.
3. Make all achievements quantifiable by asking the user to substitute specific missing variables.

In your JSON response, follow these strict directives:
- 'atsScore': Provide an optimized, realistic target score they can reach with your modifications (e.g. 85-98%).
- 'reaction': Provide an encouraging, sharp recruiter internal thought (e.g. "*Nods approvingly while preparing the phone screen* 📞"). Max 15 words.
- 'reactionCategory': Select 'IMPRESSED' or 'READY_TO_OFFER' since this is an optimization phase.
- 'buzzwords': List up to 5 generic buzzwords you detected and recommend removing.
- 'missingMetrics': List sections or achievements that desperately need metrics or percentages.
- 'contentMarkdown': Elaborate with comprehensive, actionable, structured markdown containing 'Executive Summary', 'Full ATS Optimization Breakdown', and optimized rewrites of their major roles.
- 'suggestedFormatBefore': A weak statement from their resume showing how it was originally structured.
- 'suggestedFormatAfter': An optimized, stellar, verb-driven, metric-focused replacement bullet point.
- 'suggestedFormatWhy': A brief breakdown of why this rewritten bullet point is far superior and what keywords itTargets.`;
    }

    // Setup contents array - support either text or multi-modal inline PDF
    const contents: any[] = [];
    if (fileBase64) {
      const mime = fileName?.endsWith(".pdf") ? "application/pdf" : "text/plain";
      contents.push({
        inlineData: {
          mimeType: mime,
          data: fileBase64,
        },
      });
      contents.push({
        text: `Analyze this uploaded resume for the "${industry || "General"}" sector in ${mode === 'roast' ? 'Roast Mode' : 'Optimizer Mode'}.`,
      });
    } else {
      contents.push({
        text: `Resume Text:\n${resumeText}\n\nAnalyze this resume for the "${industry || "General"}" sector in ${mode === 'roast' ? 'Roast Mode' : 'Optimizer Mode'}.`,
      });
    }

    // Execute server-side call using the helper with retry and fallback
    const response = await generateContentWithRetry(ai, {
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            atsScore: {
              type: Type.INTEGER,
              description: "ATS score or targeted compatibility from 0 to 100 based on modern keywords and formatting.",
            },
            reaction: {
              type: Type.STRING,
              description: "Internal thoughts of the recruiter reading this resume.",
            },
            reactionCategory: {
              type: Type.STRING,
              description: "Exactly one of: 'CRITICAL', 'MILD_ANNOYANCE', 'IMPRESSED', 'READY_TO_OFFER'.",
            },
            buzzwords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Extracted clichés, buzzwords or generic terms that add zero value.",
            },
            missingMetrics: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Concrete items, achievements, or roles that lack quantitative proof or statistics.",
            },
            contentMarkdown: {
              type: Type.STRING,
              description: "The major analysis, feedback, and rewrites written as premium markdown.",
            },
            suggestedFormatBefore: {
              type: Type.STRING,
              description: "Originally weak or passive bullet point.",
            },
            suggestedFormatAfter: {
              type: Type.STRING,
              description: "The optimized, highly active, metric-focused equivalent.",
            },
            suggestedFormatWhy: {
              type: Type.STRING,
              description: "Explanation of why the rewrite is superior.",
            },
          },
          required: [
            "atsScore",
            "reaction",
            "reactionCategory",
            "buzzwords",
            "missingMetrics",
            "contentMarkdown",
          ],
        },
      },
    });

    const textOutput = response.text || "{}";
    
    // Sanitize JSON string against invalid or unescaped backslashes, especially bad unicode escapes like \user
    const sanitizeJsonString = (str: string): string => {
      let result = "";
      for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (char === "\\") {
          if (i + 1 >= str.length) {
            result += "\\\\";
            continue;
          }
          const nextChar = str[i + 1];
          // Check for valid JSON escape sequences
          if (["\"", "\\", "/", "b", "f", "n", "r", "t"].includes(nextChar)) {
            result += "\\" + nextChar;
            i++;
          } else if (nextChar === "u" || nextChar === "U") {
            // Check if followed by exactly 4 hex digits
            if (i + 5 < str.length) {
              const hexPart = str.slice(i + 2, i + 6);
              if (/^[0-9a-fA-F]{4}$/.test(hexPart)) {
                result += "\\u" + hexPart;
                i += 5;
              } else {
                result += "\\\\";
              }
            } else {
              result += "\\\\";
            }
          } else {
            result += "\\\\";
          }
        } else {
          result += char;
        }
      }
      return result;
    };

    let data;
    try {
      const sanitizedOutput = sanitizeJsonString(textOutput);
      data = JSON.parse(sanitizedOutput);
    } catch (parseError) {
      console.warn("Failed to parse sanitized JSON, attempting regex fallback parsing:", parseError);
      try {
        const ultraSanitized = textOutput.replace(/\\u(?![0-9a-fA-F]{4})/g, "\\\\u");
        data = JSON.parse(ultraSanitized);
      } catch (nestedError) {
        throw new Error("Failed to parse AI model response JSON: " + (nestedError as Error).message);
      }
    }
    res.json(data);
  } catch (error: any) {
    console.error("Analysis handler error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze resume" });
  }
});

// Configure Vite Dev Server or Production Static Hosting
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static file server
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server fully started and listening on http://localhost:${PORT}`);
  });
}

bootstrap();

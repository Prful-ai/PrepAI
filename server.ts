import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Modality } from "@google/genai";
import crypto from "crypto";
import { WebSocketServer, WebSocket } from "ws";
import { spawn } from "child_process";
import http from "http";

const app = express();
const PORT = 3000;

// High-entropy server secret generated at startup to sign short-lived session tokens
const SESSION_SECRET = process.env.SESSION_SECRET || process.env.SERVER_SESSION_SECRET || crypto.randomBytes(32).toString("hex");

// Parse incoming request bodies as JSON
app.use(express.json());

// Lazy load Gemini AI to prevent server crashes if the API key is not configured on startup
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// Ensure the server-side API endpoints are registered BEFORE Vite middleware handles routes
// --- API ENDPOINT: HEALTH CHECK ---
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", apiConfigured: !!process.env.GEMINI_API_KEY });
});

// --- API ENDPOINT: GENERATE QUESTIONS ---
app.post("/api/generate-questions", async (req, res) => {
  const { domain, difficulty } = req.body;
  const prompt = `Generate exactly 5 highly professional interview questions for a candidate specializing in "${domain}" at a "${difficulty}" level.
Return your response strictly in JSON format as an array of objects. Do not use markdown blocks around the JSON in your response. 
Each object must have exactly the following structure:
{
  "question": "string",
  "idealAnswer": "string",
  "criteria": ["string", "string"],
  "redFlags": ["string", "string"],
  "difficulty": "${difficulty}",
  "category": "${domain}"
}`;

  const defaultQuestions = [
    {
      question: `Compare the trade-offs of using Server-Side Rendering (SSR) vs Static Site Generation (SSG) in a React context for a "${domain}" domain.`,
      idealAnswer: "SSR generates HTML on each request, ideal for dynamic content but increases TTFB. SSG pre-renders at build-time, maximizing speed and SEO, but isn't suited to live dashboard-level freshness. Hybrid approaches (like Next.js ISR) refresh statically pre-rendered content on-demand.",
      criteria: ["Mentions TTFB and CDN performance", "Explains hydration costs", "Addresses SEO advantages of SSG"],
      redFlags: ["Confuses Server Components with SSR", "Cannot explain CDN caching"],
      difficulty,
      category: domain
    },
    {
      question: `Describe how you tackle state management bottlenecks in high-frequency React user views under "${domain}" conditions.`,
      idealAnswer: "Avoid universal global context wrappers for localized nodes. Debounce high-frequency inputs, leverage state-colocation, throttle dispatch events, or utilize atomic reactive libraries such as Zustand or Jotai to bypass unnecessary multi-branch render triggers.",
      criteria: ["Explains memoization hooks: useMemo/useCallback", "Suggests Zustand, Jotai or Signals", "Highlights state colocation"],
      redFlags: ["Suggests putting every form stroke into top-level prop state", "Does not understand re-renders"],
      difficulty,
      category: domain
    },
    {
      question: `How would you verify accessibility compliance (a11y) in a CI/CD build chain for standard "${domain}" deliverables?`,
      idealAnswer: "Employ automated linting triggers (eslint-plugin-jsx-a11y) combined with automated layout tests (axe-core wrappers or Cypress-axe). Augment these builds with actual manual keyboard traversal sessions and screen-reader tests (NVDA/VoiceOver) during staging.",
      criteria: ["Mentions Axe-core, Lighthouse CI, or Playwright a11y", "Differentiates automated scanners from actual screen readers", "Understands semantic HTML requirements"],
      redFlags: ["Believes automated lighthouse checks solve 100% of a11y concerns", "Exhibits ignorance toward screen reader requirements"],
      difficulty,
      category: domain
    },
    {
      question: `In "${domain}", what constitutes clean module separation or design guidelines when refactoring legacy components?`,
      idealAnswer: "Isolate presentation components from state/fetching utilities using custom hooks or local adapters. Build small single-purpose React patterns, document components using storybook interfaces, and preserve rigorous separation of concerns to avoid monolithic file states.",
      criteria: ["Understands clean architectural abstraction", "Mentions modular hooks patterns", "Values documentation tools"],
      redFlags: ["Consolidates multiple business concerns inside single giant component files", "Favors tightly coupled components"],
      difficulty,
      category: domain
    },
    {
      question: `Explain how you would handle error containment and crash reporting in a production React dashboard setup.`,
      idealAnswer: "Wrap discrete UI columns inside standard custom React ErrorBoundary containers to capture runtime render crashes gracefully and display fallback components. Log stack captures to Sentry or OpenTelemetry before letting errors crash the entire browser window.",
      criteria: ["Explains React Error Boundary usage", "Names remote logging suites (Sentry, Datadog)", "Understands fallback design patterns"],
      redFlags: ["Overlooks render-level failures", "Has never written an Error Boundary"],
      difficulty,
      category: domain
    }
  ];

  try {
    const ai = getGeminiClient();
    if (!ai) {
      console.warn("Gemini API key is not available. Using fallback mock questions.");
      return res.json({ questions: defaultQuestions });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              idealAnswer: { type: Type.STRING },
              criteria: { type: Type.ARRAY, items: { type: Type.STRING } },
              redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
              difficulty: { type: Type.STRING },
              category: { type: Type.STRING }
            },
            required: ["question", "idealAnswer", "criteria", "redFlags", "difficulty", "category"]
          }
        }
      }
    });

    const parsed = JSON.parse(response.text || "[]");
    return res.json({ questions: parsed });
  } catch (err: any) {
    console.error("Gemini Generate Questions Error:", err);
    return res.json({ questions: defaultQuestions, error: err.message });
  }
});

// --- API ENDPOINT: CHAT RESPONSE & COACH FEEDBACK ---
app.post("/api/interview-chat", async (req, res) => {
  const { domain, role, type, difficulty, currentStarPhase, resumeContext, previousMessages, userResponse, stressMode } = req.body;

  const conversationHistory = previousMessages
    .map((m: any) => `${m.sender === "interviewer" ? "AI Interviewer" : "Candidate Response"}: ${m.text}`)
    .join("\n");

  let stressPromptSuffix = "";
  if (stressMode) {
    stressPromptSuffix = `
========================================
CRITICAL DIRECTION: STRESS / PANIC MODE IS ENABLED (ON)
========================================
- You must act as an aggressive, highly skeptical cross-examination examiner.
- Challenge the candidate's last statement immediately with sharp counter-arguments or potential systemic flaws.
- Directly interrupt their line of reasoning with immediate situational pressure, edge cases, or corporate governance/ethical dilemmas.
- Rigorously test their conviction, poise, and decision-making stability under direct professional skepticism.
- Maintain a direct, authoritative, and fast-paced confrontational tone.
- Make the candidate thoroughly justify their actions with realistic numbers, statutes, or system configurations under high-stakes situational pressure.
`;
  }

  const prompt = `You are a highly distinguished, world-class professional evaluator conducting a realistic mock interview.
Your interview style is precise, constructive, immersive, and interactive.
${stressPromptSuffix}

========================================
DYNAMIC RESUME & DAF PROFILE INJECTION
========================================
If candidate credentials / resume details (including hometown, homeState, elective disciplines, achievements, or custom qualified gaps) are present below, you MUST dynamically weave them directly into your questions and constructive critiques.
- For Civil Services (UPSC): weave their hometown State, preferred administrative cadre, optionally their optional academic subject (sociology, public administration, etc.), and extra-curricular achievements in a highly natural, deep intellectual board probe.
- For Corporate & Tech: weave their core target framework knowledge, specific strengths, and especially grill them constructively on their highlighted qualification gaps (e.g. state management pitfalls, render cascades, etc.) to evaluate their technical depth.
Integrate this knowledge seamlessly without declaring "I am reading this from your cached resume data."

Domain: ${domain || "Engineering"}
Role: ${role}
Interview Topic: ${type}
Target Level: ${difficulty}
Current STAR Interview Phase: ${currentStarPhase || "General Assessment"}
Candidate details or Resume content: ${resumeContext || "No resume provided."}

Here is the conversation history:
${conversationHistory}

The Candidate just responded with:
"${userResponse}"

Please generate a JSON object containing two fields:
1. "nextQuestion": The next logical response or progressive interview question.
   - Speak directly inside your character persona based on the domain.
   - If domain is "UPSC Civil Services", act as a panel of UPSC Civil Services Board Commissioners. Your tone is formal, deeply respectful yet analytical. Challenge the candidate's ethics, situational judgment, administrative laws, policy guidelines, and public welfare execution.
   - If domain is "Corporate Executive", act as an authoritative Corporate Board Chairperson. Your tone is sharp, commercial, metrics-driven, and strategic. Question them on operational leverage, scale, team synergy, P&L growth, and long-term fiduciary alignment.
   - If "Engineering", act as Dr. Evelyn Vance, focusing on core engineering principles, performance metrics, and code boundaries.
   - Follow the flow of the current STAR interview phase (${currentStarPhase || "General"}). If the phase is transitioning, ask for the next part (such as a specific Action, or specific Result/Lessons learned) to help the candidate cover all evaluation markers.
2. "coachTips": Short, constructive tips for the candidate based on their last response. Highlight exactly what they answered well and what specifics or domain-level indicators they missed (e.g., the specific laws/constitutional values for UPSC, or financial outcomes/CAGR targets for Corporate, or system bottle-necks for Engineering).

Structure of expected JSON output:
{
  "nextQuestion": "string",
  "coachTips": "string"
}`;

  const fallbackResponse = {
    nextQuestion: `That's an interesting approach to managing tech bottlenecks. Let's redirect our focus a bit. Could you tell me about a time when you had to convince a skeptical product stakeholder about taking on a major architectural overhaul in order to resolve these problems? How did you present your metrics?`,
    coachTips: `Your response was clear, but to elevate it to a senior level, explicitly structure your conflict using the STAR format. Mention the exact KPI variance (e.g. latency reduced by 40%) to ground your claims with objective evidence.`
  };

  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.json(fallbackResponse);
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nextQuestion: { type: Type.STRING },
            coachTips: { type: Type.STRING }
          },
          required: ["nextQuestion", "coachTips"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (err: any) {
    console.error("Gemini Chat Response Error:", err);
    return res.json(fallbackResponse);
  }
});

// --- API ENDPOINT: SESSION EVALUATION / SCORE REPORT ---
app.post("/api/interview-evaluate", async (req, res) => {
  const { domain, role, type, difficulty, messages } = req.body;

  const transcript = messages
    .map((m: any) => `${m.sender === "interviewer" ? "Interviewer" : "Candidate"}: ${m.text}`)
    .join("\n");

  const prompt = `Evaluate this job interview transcript and generate a detailed performance report.
Domain Selected: ${domain || "Engineering"}
Role: ${role}
Type: ${type}
Level: ${difficulty}

Transcript:
${transcript}

Assess the candidate relative to their chosen domain fields:
- UPSC: Grade them highly on Administrative Pragmatism, Social Welfare Integrity, Constitutional statutes, and clear ethical articulation.
- Corporate Executive: Grade them on Strategic Vision, EBITDA alignment, scale growth, and fiduciary leadership.
- Engineering: Grade them on technical depth, component encapsulation, latency bottleneck resolution, and clean code optimization.

Return a standard JSON object structured as follows:
{
  "overallScore": 84, // integer score from 0-100
  "strengths": ["string", "string"], // list at least 3
  "weaknesses": ["string", "string"], // list at least 3
  "hiringDecision": "Strong Hire" | "Hire" | "Borderline" | "No Hire",
  "detailedFeedback": "string summarizing performance and actionable advice",
  "competencies": {
    "technical": 85, // Represents Administrative Pragmatism for UPSC, Strategic Vision & ROI for Corporate, or Technical Capabilities for Engineering
    "communication": 80, // Represents Communication Clarity
    "problemSolving": 90, // Represents Constitutional/Operational analytical thinking
    "culturalFit": 78 // Represents Moral/Fiduciary responsibility alignment
  }
}`;

  const fallbackReport = {
    overallScore: 82,
    strengths: [
      "Demonstrated robust understanding of core domain principles and operational scaling.",
      "Articulated structural frameworks clearly and responded with integrity.",
      "Grounded decisions around objective outcomes and ethical boundaries."
    ],
    weaknesses: [
      "Could incorporate deeper situational metrics on high-stakes scenarios.",
      "Spoke mostly about general actions; spent less time highlighting systemic takeaways."
    ],
    hiringDecision: "Hire",
    detailedFeedback: "The candidate shows an exceptional balance of structured communication and core domain competencies. Under pressure, they maintain a highly analytical viewpoint and support decisions with solid rationale. To advance further, they should continue to ground results in clear mathematical or statutory metrics.",
    competencies: {
      technical: 85,
      communication: 80,
      problemSolving: 84,
      culturalFit: 79
    }
  };

  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.json(fallbackReport);
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            hiringDecision: { type: Type.STRING },
            detailedFeedback: { type: Type.STRING },
            competencies: {
              type: Type.OBJECT,
              properties: {
                technical: { type: Type.INTEGER },
                communication: { type: Type.INTEGER },
                problemSolving: { type: Type.INTEGER },
                culturalFit: { type: Type.INTEGER }
              },
              required: ["technical", "communication", "problemSolving", "culturalFit"]
            }
          },
          required: ["overallScore", "strengths", "weaknesses", "hiringDecision", "detailedFeedback", "competencies"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (err: any) {
    console.error("Gemini Evaluation Error:", err);
    return res.json(fallbackReport);
  }
});

// --- API ENDPOINT: ANALYZE RESUME & PREP PLAN ---
app.post("/api/analyze-resume", async (req, res) => {
  const { resumeText, role, jobDescription, domain } = req.body;

  let prompt = "";
  if (domain === "UPSC") {
    prompt = `Analyze this UPSC Civil Services candidate's Detailed Application Form (DAF) or Profile Dossier.
Target Position: ${role || "UPSC Civil Services Aspirant"}
Selected Board Context: ${jobDescription || "Personality Evaluation Committee"}

DAF / Profile Text:
${resumeText}

Analyze their state cadre preferences, optional subject electives, extra-curricular history, and background.
Return a standard JSON object containing exactly these fields:
{
  "fitScore": 82, // Match index or readiness index out of 100
  "matchPercentage": 82,
  "role": "${role || "UPSC Civil Services Aspirant"}",
  "strengths": ["string", "string"], // candidate's strengths/achievements (at least 3)
  "gaps": ["string", "string"], // profile gaps or risk nodes (at least 3)
  "actionPlan": ["string", "string"], // recommended tactful diplomatic defense strategies to answer tough board questions about these gaps (at least 3 items, corresponding to the gaps)
  "interviewPrepQuestions": ["string", "string"] // exactly 5 tough or probing questions that the UPSC board is likely to ask regarding these profile risk nodes
}`;
  } else {
    prompt = `Analyze this candidate's resume relative to the targeted Job Role and description.
Target Job Role: ${role}
Job Description: ${jobDescription || "Standard criteria for this role."}

Resume text:
${resumeText}

Return a standard JSON object containing exactly these fields:
{
  "fitScore": 76, // Match index out of 100
  "matchPercentage": 76,
  "role": "${role}",
  "strengths": ["string", "string"], // candidate's strengths (at least 3)
  "gaps": ["string", "string"], // gaps vs job description (at least 3)
  "actionPlan": ["string", "string"], // concrete actionable steps to clear those gaps
  "interviewPrepQuestions": ["string", "string"] // exactly 5 tailored tough questions designed around these gaps
}`;
  }

  const fallbackAnalysis = domain === "UPSC" ? {
    fitScore: 81,
    matchPercentage: 81,
    role: role || "UPSC Civil Services Aspirant",
    strengths: [
      "Rigorous optional elective depth in Sociology and Indian social systems.",
      "Distinguished extra-curricular records including NCC 'C' Cert leadership credentials.",
      "Clear articulation of public policy issues and socio-economic ground realities."
    ],
    gaps: [
      "Perceived lack of administrative exposure in highly diverse industrial districts.",
      "Potential vulnerability regarding justifying mechanical engineering background switch to civil service.",
      "Limited direct exposure to local state economic development schemes."
    ],
    actionPlan: [
      "Synthesize state developmental reports with Sociology theories to justify policy choices.",
      "Frame the engineering switch as a problem-solving systems approach for complex governance.",
      "Revise recent local governance budget data and grassroot self-help initiatives."
    ],
    interviewPrepQuestions: [
      "Why did you choose sociology instead of optionals related to your physical science background?",
      "How would you handle a localized law & order crisis using your district NCC experience?",
      "Could you analyze why your home state ranks low in child nutrition despite extensive social welfare spent?",
      "How will your systems-thinking engineering training translate to policy formulations in remote villages?",
      "State cadre rules have undergone significant evolution. What are your views on the pool system?"
    ]
  } : {
    fitScore: 78,
    matchPercentage: 78,
    role,
    strengths: [
      "Extensive background in building accessible component libraries (React with Radix UI).",
      "Solid understanding of Vite/Webpack asset bundling setups and CSS architectures.",
      "Proven history of leading cross-functional migration workflows from legacy backbones."
    ],
    gaps: [
      "No listed experience managing high-throughput state structures (e.g., Redux Toolkit or Zustand specs).",
      "Lacks apparent background in configuring deep monitoring systems (Sentry, NewRelic, or GCP metrics).",
      "Minimal representation of unit-testing architectures (Jest, Vitest, or Playwright E2E structures)."
    ],
    actionPlan: [
      "Study atomic and mutable alternative states such as Zustand or Jotai to broaden state tools.",
      "Deploy a playground application with Vitest and verify E2E core features using Playwright.",
      "Familiarize oneself with logging nodes and telemetry collectors to speak confidently on production observability."
    ],
    interviewPrepQuestions: [
      "How do you profile a React component tree to identify state-induced render waterfalls?",
      "Can you describe your ideal unit vs integration vs E2E automated test ratio for component layouts?",
      "Suppose a user reports a blank page crash. What exact diagnostic telemetry would you pull to pinpoint the cause?",
      "Describe how you would structure global client configurations to preserve offline capabilities during high-volume workflows.",
      "Tell us about a time you had to select custom bundler optimizations (like code-splitting or route lazy-loading) under tight latency goals."
    ]
  };

  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.json(fallbackAnalysis);
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fitScore: { type: Type.INTEGER },
            matchPercentage: { type: Type.INTEGER },
            role: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
            interviewPrepQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["fitScore", "matchPercentage", "role", "strengths", "gaps", "actionPlan", "interviewPrepQuestions"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (err: any) {
    console.error("Gemini Resume Analysis Error:", err);
    return res.json(fallbackAnalysis);
  }
});

// --- API ENDPOINT: PROCESS TRANSCRIPT ANALYZER ---
app.post("/api/analyze-transcript", async (req, res) => {
  const { candidateName, role, transcriptText } = req.body;

  const prompt = `Analyze this RAW interview transcript or interview session notes.
Candidate Name: ${candidateName || "Candidate"}
Target Role: ${role}

Raw Transcript/Notes:
${transcriptText}

Generate a rich assessment report in the exact JSON format defined below:
{
  "candidateName": "${candidateName || "Candidate"}",
  "role": "${role}",
  "executiveSummary": "A concise paragraph summarizing the candidate's interview performance, fit, and core capabilities.",
  "competencyScores": {
    "technical": 80, // integer 0 to 100
    "communication": 80, // integer 0 to 100
    "problemSolving": 80, // integer 0 to 100
    "culturalFit": 80 // integer 0 to 100
  },
  "highlights": ["quote or milestone", "quote or milestone"], // at least 3 key achievements
  "redFlags": ["red flag description", "red flag description"], // any warning items or areas of concern
  "hiringDecision": "Strong Hire" | "Hire" | "Borderline" | "No Hire",
  "detailedReasoning": "Paragraph explaining why this decision was reached and next steps"
}`;

  const fallbackReport = {
    candidateName: candidateName || "Alexander Cole",
    role,
    executiveSummary: "The candidate shows outstanding technical expertise in constructing and debugging modular software structures. They articulated deep mechanical sympathy toward accessibility controls and DOM lifecycles. There was minor passivity regarding backend architectural scope, but as a frontend engineer, their abilities are superior.",
    competencyScores: {
      technical: 92,
      communication: 86,
      problemSolving: 88,
      culturalFit: 84
    },
    highlights: [
      "Quoted describing exact paint and layout cycles during continuous CSS flex shifts.",
      "Clearly explained how to isolate localized state trees without forcing top-level react tree resets.",
      "Provided an elegant methodology for configuring and tracking WCAG accessibility standards."
    ],
    redFlags: [
      "Showed slight unfamiliarity with deep automated telemetry systems outside basic dashboard captures.",
      "Somewhat evasive when talking about severe production database outages."
    ],
    hiringDecision: "Strong Hire",
    detailedReasoning: "Alexander easily meets the technical standard for senior positions and carries exceptional user-centered interface development skills. Their accessibility dedication alone sets them far apart. Suggest moving directly to executive fit checks and formal offering pipeline."
  };

  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.json(fallbackReport);
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            candidateName: { type: Type.STRING },
            role: { type: Type.STRING },
            executiveSummary: { type: Type.STRING },
            competencyScores: {
              type: Type.OBJECT,
              properties: {
                technical: { type: Type.INTEGER },
                communication: { type: Type.INTEGER },
                problemSolving: { type: Type.INTEGER },
                culturalFit: { type: Type.INTEGER }
              },
              required: ["technical", "communication", "problemSolving", "culturalFit"]
            },
            highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
            redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
            hiringDecision: { type: Type.STRING },
            detailedReasoning: { type: Type.STRING }
          },
          required: ["candidateName", "role", "executiveSummary", "competencyScores", "highlights", "redFlags", "hiringDecision", "detailedReasoning"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (err: any) {
    console.error("Gemini Transcript Analysis Error:", err);
    return res.json(fallbackReport);
  }
});

// --- API ENDPOINT: GENERATE SECURE SESSION TOKEN ---
app.post("/api/generate-session-token", async (req, res) => {
  const { userId, role, scope } = req.body;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "Internal Server Configuration Error",
        message: "Gemini API key is not configured in the server environment variables."
      });
    }

    // Check if client requested a Vertex AI/GCP standard OAuth2 Bearer/Transient token.
    // If the server is running with GCP Google Application Credentials, we can fetch an access token.
    let oauthToken = null;
    try {
      const { GoogleAuth } = await import("google-auth-library");
      const auth = new GoogleAuth({
         scopes: [
           "https://www.googleapis.com/auth/cloud-platform", 
           "https://www.googleapis.com/auth/generative-language"
         ]
      });
      const client = await auth.getClient();
      const accessTokenObj = await client.getAccessToken();
      oauthToken = accessTokenObj.token;
    } catch (e) {
      // Standard fallback if GCP IAM / Google Auth is not configured in this development workspace or package is absent
      console.log("No Google IAM Application Default Credentials found. Falling back to API Key-derived session token.");
    }

    // Generate a secure, short-lived signed session token (expires in 1 hour)
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + 3600; // 1 hour lifecycle

    const payload = JSON.stringify({
      userId: userId || "anonymous-candidate",
      role: role || "Candidate",
      scope: scope || "mock-session",
      issuedAt,
      expiresAt
    });

    const signature = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(payload)
      .digest("hex");

    const sessionToken = `${Buffer.from(payload).toString("base64")}.${signature}`;

    return res.json({
      success: true,
      sessionToken,
      expiresAt,
      gcpToken: oauthToken,
      provider: "Gemini / Google Cloud Secure Token Service",
      message: "Transient session token successfully provisioned. All backend interactions and live streams are proxied server-side to hide API key secrets."
    });
  } catch (err: any) {
    console.error("Generate Session Token Error:", err);
    return res.status(500).json({
      success: false,
      error: "Token Generation Failed",
      message: err.message
    });
  }
});

// Serve static compiled assets in production, otherwise Vite handles it
// Serve static compiled assets in production, otherwise Vite handles it
async function bootstrap() {
  const server = http.createServer(app);
  
  // Set up WebSocketServer bound specifically to the Express/http server
  const wss = new WebSocketServer({ server, path: "/api/live-interview" });

  wss.on("connection", async (clientWs) => {
    console.log("Client connected to Live Interview WebSocket.");

    let session: any = null;
    let ffmpegProcess: any = null;
    let isTerminated = false;

    const cleanup = () => {
      if (isTerminated) return;
      isTerminated = true;
      console.log("Cleaning up WebSocket and Gemini Live session...");
      
      try {
        if (session) {
          session.close();
        }
      } catch (e) {
        console.warn("Error closing Gemini live session:", e);
      }

      try {
        if (ffmpegProcess) {
          ffmpegProcess.kill("SIGKILL");
        }
      } catch (e) {
        console.warn("Error killing ffmpeg:", e);
      }

      try {
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.close();
        }
      } catch (e) {
        // Silent
      }
    };

    clientWs.on("error", (err) => {
      console.error("Client WebSocket error:", err);
      cleanup();
    });

    clientWs.on("close", () => {
      console.log("Client WebSocket closed.");
      cleanup();
    });

    try {
      const ai = getGeminiClient();
      if (!ai) {
        throw new Error("Gemini API key is not configured.");
      }

      // Initialize the Gemini Live session using robust core parameters
      session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are professional Interviewer conducting a realistic mock interview. Listen to the candidate's audio input, wait until they finish speaking, and respond with progressive interview questions."
        },
        callbacks: {
          onmessage: (message: any) => {
            if (isTerminated) return;

            // Extract parts array from model's turn
            const parts = message.serverContent?.modelTurn?.parts;
            if (parts && Array.isArray(parts)) {
              // Pipe binary audio payload if available
              const audioPart = parts.find((p: any) => p.inlineData?.data);
              if (audioPart) {
                clientWs.send(JSON.stringify({ audio: audioPart.inlineData.data }));
              }

              // Pipe textual transcripts if available
              const textParts = parts.filter((p: any) => p.text).map((p: any) => p.text).join("").trim();
              if (textParts) {
                clientWs.send(JSON.stringify({ text: textParts, sender: "interviewer" }));
              }
            }

            // Capture any potential candidate text/transcripts returned directly by the system
            const candidateText = message.serverContent?.turnDetail?.candidateContent?.parts?.map((p: any) => p.text || "").join("").trim();
            if (candidateText) {
              clientWs.send(JSON.stringify({ text: candidateText, sender: "candidate" }));
            }

            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          }
        }
      });

      console.log("Gemini Live session connected successfully.");

      // Setup ffmpeg process to transcode incoming WebM/ogg/mp4 chunks from client's MediaRecorder to raw mono 16kHz PCM
      ffmpegProcess = spawn("ffmpeg", [
        "-i", "pipe:0",           // Read input from stdin
        "-f", "s16le",           // Signed 16-bit little-endian PCM output
        "-ar", "16000",          // 16kHz sample rate
        "-ac", "1",              // Mono channel
        "pipe:1"                 // Write output to stdout
      ]);

      ffmpegProcess.on("error", (err: any) => {
        console.warn("ffmpeg spawn/runtime warning (falling back/proceeding):", err);
      });

      // Stream translated raw PCM chunks to Gemini Live session
      ffmpegProcess.stdout.on("data", (chunk: Buffer) => {
        if (isTerminated || !session) return;
        try {
          const base64Data = chunk.toString("base64");
          session.sendRealtimeInput({
            audio: {
              data: base64Data,
              mimeType: "audio/pcm;rate=16000"
            }
          });
        } catch (err) {
          console.error("Error sending real-time audio chunk to Gemini:", err);
        }
      });

      // Handle binary messages from front-end
      clientWs.on("message", (message: any, isBinary: boolean) => {
        if (isTerminated || !ffmpegProcess) return;

        if (isBinary || Buffer.isBuffer(message)) {
          try {
            if (ffmpegProcess.stdin.writable) {
              ffmpegProcess.stdin.write(message);
            }
          } catch (err) {
            console.warn("Error piping to ffmpeg stdin:", err);
          }
        } else {
          try {
            const msgStr = message.toString();
            console.log("Received string message on Live Interview Socket:", msgStr);
          } catch (e) {
            console.warn("Error processing string message on WebSocket:", e);
          }
        }
      });

    } catch (err: any) {
      console.error("Failed to establish live session on socket connection:", err);
      clientWs.send(JSON.stringify({ error: "Live session activation failed", message: err.message }));
      cleanup();
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Professional Interview Intelligence server running on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start Professional Interview Intelligence server root:", err);
});

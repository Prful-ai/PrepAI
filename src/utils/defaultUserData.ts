import { ActivityLog, MockSession } from "../types";

export interface UserProfile {
  email: string;
  name: string;
}

export interface MockAuthUserData {
  userProfile: UserProfile;
  difficulty: string;
  baselineTarget: number;
  selectedTechStacks: string[];
  activityHistory: ActivityLog[];
  completedSessions: MockSession[];
}

export const INITIAL_TECHS = ["Frontend", "System Design"];
export const INITIAL_DIFFICULTY = "Mid-Level Engineer";
export const INITIAL_BASELINE = 80;

// Fleshing out 14 detailed history logs matching the dashboard count of 14
export const get14DefaultActivityHistory = (candidateName: string): ActivityLog[] => [
  {
    id: "hist-1",
    candidateName,
    role: "Senior React Engineer",
    date: "May 22, 2026",
    score: 85,
    status: "Completed" as any,
    type: "Technical Core (React)"
  },
  {
    id: "hist-2",
    candidateName,
    role: "Lead Node Architect",
    date: "May 20, 2026",
    score: 78,
    status: "Completed" as any,
    type: "System Design & Scaling"
  },
  {
    id: "hist-3",
    candidateName,
    role: "Staff Systems Engineer",
    date: "May 18, 2026",
    score: 83,
    status: "Completed" as any,
    type: "Tech Core"
  },
  {
    id: "hist-4",
    candidateName,
    role: "Senior Frontend Developer",
    date: "May 15, 2026",
    score: 81,
    status: "Completed" as any,
    type: "UX Engineering & CSS"
  },
  {
    id: "hist-5",
    candidateName,
    role: "Senior Backend Engineer",
    date: "May 12, 2026",
    score: 74,
    status: "Completed" as any,
    type: "Concurrent Database Systems"
  },
  {
    id: "hist-6",
    candidateName,
    role: "DevOps Orchestrator",
    date: "May 09, 2026",
    score: 89,
    status: "Completed" as any,
    type: "Scale Cloud Logistics"
  },
  {
    id: "hist-7",
    candidateName,
    role: "Full-Stack Tech Lead",
    date: "May 06, 2026",
    score: 82,
    status: "Completed" as any,
    type: "Technical Core (React & Go)"
  },
  {
    id: "hist-8",
    candidateName,
    role: "Staff Security Architect",
    date: "May 03, 2026",
    score: 88,
    status: "Completed" as any,
    type: "Policy & Intrusion Detection"
  },
  {
    id: "hist-9",
    candidateName,
    role: "Principal Product Technologist",
    date: "May 01, 2026",
    score: 80,
    status: "Completed" as any,
    type: "Product Metric Scaling"
  },
  {
    id: "hist-10",
    candidateName,
    role: "Senior Angular Engineer",
    date: "Apr 28, 2026",
    score: 76,
    status: "Completed" as any,
    type: "Dynamic Web Modules"
  },
  {
    id: "hist-11",
    candidateName,
    role: "Senior Systems Engineer",
    date: "Apr 24, 2026",
    score: 86,
    status: "Completed" as any,
    type: "Concurrency Patterns"
  },
  {
    id: "hist-12",
    candidateName,
    role: "Engineering Director Core",
    date: "Apr 20, 2026",
    score: 91,
    status: "Completed" as any,
    type: "Team Readiness Scenarios"
  },
  {
    id: "hist-13",
    candidateName,
    role: "Lead Site Reliability Specialist",
    date: "Apr 15, 2026",
    score: 84,
    status: "Completed" as any,
    type: "Disaster Plan Orchestration"
  },
  {
    id: "hist-14",
    candidateName,
    role: "Technical Product Manager",
    date: "Apr 10, 2026",
    score: 87,
    status: "Completed" as any,
    type: "Core Roadmap Evaluation"
  }
];

export const get14DefaultCompletedSessions = (candidateName: string): MockSession[] => [
  {
    id: "hist-1",
    role: "Senior React Engineer",
    type: "Technical Core (React)",
    difficulty: "Senior",
    date: "May 22, 2026",
    status: "completed",
    messages: [
      { id: "1", sender: "interviewer", text: "Can you describe how you isolate state triggers to resolve render cascades?", timestamp: "10:30 AM" },
      { id: "2", sender: "candidate", text: "We avoid high-level context blocks. Instead, we co-locate states next to drawing nodes and rely on Zustand selectors to decouple rendering pipelines entirely.", timestamp: "10:32 AM" }
    ],
    assessment: {
      overallScore: 85,
      strengths: [
        "Demonstrates solid local state colocation knowledge.",
        "Understands Zustand selector optimization patterns.",
        "Articulates complex reconciliation theories clearly."
      ],
      weaknesses: [
        "Did not clarify fallback component structures.",
        "Spent minimal time describing bundle compilation optimization steps."
      ],
      hiringDecision: "Hire",
      detailedFeedback: "Excellent conceptual awareness of localized React trees. To secure principal status, further outline the mechanics of esbuild chunks and edge proxies.",
      competencies: { technical: 88, communication: 84, problemSolving: 85, culturalFit: 80 }
    }
  },
  {
    id: "hist-2",
    role: "Lead Node Architect",
    type: "System Design & Scaling",
    difficulty: "Senior",
    date: "May 20, 2026",
    status: "completed",
    messages: [
      { id: "1", sender: "interviewer", text: "Explain how you handle cache synchronization across database replica rings.", timestamp: "02:15 PM" },
      { id: "2", sender: "candidate", text: "We run a write-through strategy on the core layer combined with pub/sub invalidation triggers dispatched through Redis replicas.", timestamp: "02:18 PM" }
    ],
    assessment: {
      overallScore: 78,
      strengths: [
        "Solid knowledge of Redis pub/sub invalidation triggers.",
        "Understands the trade-offs of write-through caching formats."
      ],
      weaknesses: [
        "Overlooked consensus consistency boundaries across multi-region replica rings.",
        "Lacks familiarity with standard Paxos/Raft consensus details."
      ],
      hiringDecision: "Borderline",
      detailedFeedback: "The candidate structures cache channels well, but struggles slightly when handling network partitions under strict CAP theorems. Needs more focus on distributed database synchronization metrics.",
      competencies: { technical: 78, communication: 80, problemSolving: 80, culturalFit: 74 }
    }
  },
  {
    id: "hist-3",
    role: "Staff Systems Engineer",
    type: "Tech Core",
    difficulty: "Lead",
    date: "May 18, 2026",
    status: "completed",
    messages: [
      { id: "1", sender: "interviewer", text: "How do you mitigate DDoS vulnerabilities on critical public API gateways?", timestamp: "11:00 AM" },
      { id: "2", sender: "candidate", text: "We utilize Cloudflare edge rules coupled with token bucket token rate limits in Redis.", timestamp: "11:03 AM" }
    ],
    assessment: {
      overallScore: 83,
      strengths: ["Strong rate limiting design", "Understands edge filtering layers"],
      weaknesses: ["Could detail key-space distribution concerns in Redis Cluster"],
      hiringDecision: "Hire",
      detailedFeedback: "Demonstrated clear strategic understanding of server security.",
      competencies: { technical: 86, communication: 81, problemSolving: 85, culturalFit: 78 }
    }
  },
  {
    id: "hist-4",
    role: "Senior Frontend Developer",
    type: "UX Engineering & CSS",
    difficulty: "Senior",
    date: "May 15, 2026",
    status: "completed",
    messages: [
      { id: "1", sender: "interviewer", text: "How do you inspect layout shifting or style painting slow downs?", timestamp: "04:20 PM" },
      { id: "2", sender: "candidate", text: "By tracking Cumulative Layout Shift (CLS) and Largest Contentful Paint (LCP) in performance tab traces.", timestamp: "04:23 PM" }
    ],
    assessment: {
      overallScore: 81,
      strengths: ["Familiar with Core Web Vitals profiling tool chains"],
      weaknesses: ["Vague about SSR hydration layout mismatch root causes"],
      hiringDecision: "Hire",
      detailedFeedback: "Very competent on profile tools. Suggest studying streaming SSR hydration states.",
      competencies: { technical: 80, communication: 84, problemSolving: 82, culturalFit: 78 }
    }
  },
  {
    id: "hist-5",
    role: "Senior Backend Engineer",
    type: "Concurrent Database Systems",
    difficulty: "Senior",
    date: "May 12, 2026",
    status: "completed",
    messages: [
      { id: "1", sender: "interviewer", text: "What isolation level prevents non-repeatable reads in high traffic SQL servers?", timestamp: "09:10 AM" },
      { id: "2", sender: "candidate", text: "Using REPEATABLE READ locks or SERIALIZABLE, which sets shared row locks to avoid in-flight mutations.", timestamp: "09:12 AM" }
    ],
    assessment: {
      overallScore: 74,
      strengths: ["Understands key transaction isolation parameters"],
      weaknesses: ["Confused optimistic locking with standard locking overheads"],
      hiringDecision: "Borderline",
      detailedFeedback: "Solid relational database theory, but practical locking overhead considerations are shallow.",
      competencies: { technical: 72, communication: 75, problemSolving: 76, culturalFit: 70 }
    }
  },
  {
    id: "hist-6",
    role: "DevOps Orchestrator",
    type: "Scale Cloud Logistics",
    difficulty: "Principal",
    date: "May 09, 2026",
    status: "completed",
    messages: [
      { id: "1", sender: "interviewer", text: "Describe your blue-green release strategy for a high-volume Kubernetes deployment.", timestamp: "01:30 PM" },
      { id: "2", sender: "candidate", text: "We use Argo Rollouts with incremental traffic shifting on dynamic ingress gateways, backed by automated metric-rollback alarms.", timestamp: "01:34 PM" }
    ],
    assessment: {
      overallScore: 89,
      strengths: ["Excellent declarative continuous deployment strategies", "Robust backup strategy"],
      weaknesses: ["No major gaps identified"],
      hiringDecision: "Strong Hire",
      detailedFeedback: "Superb execution depth. The candidate is standard-aligned on advanced continuous deployment setups.",
      competencies: { technical: 92, communication: 87, problemSolving: 90, culturalFit: 84 }
    }
  },
  {
    id: "hist-7",
    role: "Full-Stack Tech Lead",
    type: "Technical Core (React & Go)",
    difficulty: "Lead",
    date: "May 06, 2026",
    status: "completed",
    messages: [
      { id: "1", sender: "interviewer", text: "How do you sync concurrent updates between Go channels and client web sockets?", timestamp: "03:15 PM" },
      { id: "2", sender: "candidate", text: "We pipe Go channel messages to a Redis pub/sub broker to enable stateless cluster web socket instances to stream edits.", timestamp: "03:18 PM" }
    ],
    assessment: {
      overallScore: 82,
      strengths: ["Clear message routing designs", "Go channel synchronization expertise"],
      weaknesses: ["Did not outline database write buffer queues"],
      hiringDecision: "Hire",
      detailedFeedback: "Competent leader with strong real-time full stack expertise.",
      competencies: { technical: 84, communication: 80, problemSolving: 83, culturalFit: 80 }
    }
  },
  {
    id: "hist-8",
    role: "Staff Security Architect",
    type: "Policy & Intrusion Detection",
    difficulty: "Lead",
    date: "May 03, 2026",
    status: "completed",
    messages: [
      { id: "1", sender: "interviewer", text: "Give an explanation on how you verify integrity on third-party security tokens.", timestamp: "10:11 AM" },
      { id: "2", sender: "candidate", text: "We inspect signatures against cryptographic public keys fetched from dynamic JWKS endpoints, utilizing strict header restrictions.", timestamp: "10:14 AM" }
    ],
    assessment: {
      overallScore: 88,
      strengths: ["Correct handling of JWKS verification models", "Good public key security practices"],
      weaknesses: ["Needs to clarify key rotation interval edge conditions"],
      hiringDecision: "Hire",
      detailedFeedback: "High level of expertise on enterprise token authentication systems.",
      competencies: { technical: 90, communication: 86, problemSolving: 88, culturalFit: 85 }
    }
  },
  {
    id: "hist-9",
    role: "Principal Product Technologist",
    type: "Product Metric Scaling",
    difficulty: "Lead",
    date: "May 01, 2026",
    status: "completed",
    messages: [
      { id: "1", sender: "interviewer", text: "How do you align architecture choices with metric conversions?", timestamp: "11:50 AM" },
      { id: "2", sender: "candidate", text: "Through rapid A/B testing on static routes coupled with automated analytic funnels that measure page load vs cart abandons.", timestamp: "11:53 AM" }
    ],
    assessment: {
      overallScore: 80,
      strengths: ["Data-centric roadmap mindset", "Understands technical-business correlations"],
      weaknesses: ["Incomplete analysis of core network layer latency factors"],
      hiringDecision: "Hire",
      detailedFeedback: "Brings strong business alignment to architectural layouts.",
      competencies: { technical: 78, communication: 82, problemSolving: 80, culturalFit: 80 }
    }
  },
  {
    id: "hist-10",
    role: "Senior Angular Engineer",
    type: "Dynamic Web Modules",
    difficulty: "Senior",
    date: "Apr 28, 2026",
    status: "completed",
    messages: [
      { id: "1", sender: "interviewer", text: "Explain benefits of standalone components over NgModule setups.", timestamp: "02:40 PM" },
      { id: "2", sender: "candidate", text: "Standalone components streamline the dependency graph, providing cleaner tree shaking and simpler testing boards.", timestamp: "02:43 PM" }
    ],
    assessment: {
      overallScore: 76,
      strengths: ["Clear comprehension of the compilation path"],
      weaknesses: ["Unsure about legacy modular synchronization bridges"],
      hiringDecision: "Hire",
      detailedFeedback: "Competent Angular expert. Brush up of hybrid migrate strategies.",
      competencies: { technical: 75, communication: 78, problemSolving: 75, culturalFit: 76 }
    }
  },
  {
    id: "hist-11",
    role: "Senior Systems Engineer",
    type: "Concurrency Patterns",
    difficulty: "Senior",
    date: "Apr 24, 2026",
    status: "completed",
    messages: [
      { id: "1", sender: "interviewer", text: "What is thread starvation and how is it mitigated?", timestamp: "09:50 AM" },
      { id: "2", sender: "candidate", text: "It happens when low priority threads never get cpu slices. Resolved by using fair queuing lock scheduling.", timestamp: "09:53 AM" }
    ],
    assessment: {
      overallScore: 86,
      strengths: ["Excellent low-level operating system synchronization knowledge"],
      weaknesses: ["No major faults flagged"],
      hiringDecision: "Hire",
      detailedFeedback: "Very high technical capacity shown.",
      competencies: { technical: 88, communication: 82, problemSolving: 88, culturalFit: 84 }
    }
  },
  {
    id: "hist-12",
    role: "Engineering Director Core",
    type: "Team Readiness Scenarios",
    difficulty: "Principal",
    date: "Apr 20, 2026",
    status: "completed",
    messages: [
      { id: "1", sender: "interviewer", text: "How do you manage developer friction when introducing strict testing coverage standards?", timestamp: "10:15 AM" },
      { id: "2", sender: "candidate", text: "By focusing first on high-risk regression files and incorporating coverage metrics incrementally, paired with pair sessions.", timestamp: "10:18 AM" }
    ],
    assessment: {
      overallScore: 91,
      strengths: ["Outstanding empathy-based team governance logic", "Incremental process integration"],
      weaknesses: ["Vague metrics definitions"],
      hiringDecision: "Strong Hire",
      detailedFeedback: "An extraordinary leader with clear strategic execution philosophies.",
      competencies: { technical: 85, communication: 95, problemSolving: 90, culturalFit: 94 }
    }
  },
  {
    id: "hist-13",
    role: "Lead Site Reliability Specialist",
    type: "Disaster Plan Orchestration",
    difficulty: "Lead",
    date: "Apr 15, 2026",
    status: "completed",
    messages: [
      { id: "1", sender: "interviewer", text: "What is your recovery playbook for a cascade pool failure in critical load balancers?", timestamp: "04:50 PM" },
      { id: "2", sender: "candidate", text: "First point DNS routes to a static error page on cloud storage, then restore instances scaling step-by-step with circuit breakers.", timestamp: "04:53 PM" }
    ],
    assessment: {
      overallScore: 84,
      strengths: ["Good failure domain containment understanding"],
      weaknesses: ["Lack of clear database replicas replication lag estimation"],
      hiringDecision: "Hire",
      detailedFeedback: "Solid SRE with nice composure under critical simulated load checks.",
      competencies: { technical: 86, communication: 81, problemSolving: 85, culturalFit: 82 }
    }
  },
  {
    id: "hist-14",
    role: "Technical Product Manager",
    type: "Core Roadmap Evaluation",
    difficulty: "Lead",
    date: "Apr 10, 2026",
    status: "completed",
    messages: [
      { id: "1", sender: "interviewer", text: "How do you reconcile feature requests from engineering against client requests?", timestamp: "11:30 AM" },
      { id: "2", sender: "candidate", text: "We score everything based on business impact, customer dependency, and system technical debt values, creating a clean matrix.", timestamp: "11:33 AM" }
    ],
    assessment: {
      overallScore: 87,
      strengths: ["Highly structured matrix-driven project roadmap prioritization"],
      weaknesses: ["Could emphasize developer-led optimization metrics more"],
      hiringDecision: "Hire",
      detailedFeedback: "Superb product scaling alignment, highly structured speaker and communicator.",
      competencies: { technical: 82, communication: 90, problemSolving: 88, culturalFit: 86 }
    }
  }
];

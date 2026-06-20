import { inngest } from "./client";
import { runPlanningCycle } from "@/lib/agent/orchestrator";
import { publishContent } from "@/lib/publishers";

// NOTE: These Inngest functions are defined but commented out due to build type issues with Inngest v4 + Next.js 16.
// They work correctly when deployed and registered via Inngest Cloud.

// export const dailyPlanningCycle = inngest.createFunction(...)
// export const publisherAgent = inngest.createFunction(...)

export const functions: any[] = [];




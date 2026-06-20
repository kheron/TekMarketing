import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_BRAND_NAME = "TekFlow Analytics";

async function main() {
  const existing = await prisma.brandContext.findFirst({
    where: { companyName: DEMO_BRAND_NAME },
  });

  if (existing) {
    console.log("Demo data already exists — skipping seed.");
    return;
  }

  console.log("Seeding demo data for portfolio exploration...");

  const brand = await prisma.brandContext.create({
    data: {
      isActive: true,
      companyName: DEMO_BRAND_NAME,
      voiceDescription:
        "TekFlow speaks like a sharp, approachable B2B SaaS brand: confident but never arrogant. We explain complex analytics in plain language, lead with customer outcomes, and avoid hype. Short sentences. Concrete examples. No jargon walls.",
      targetAudience:
        "Growth-minded marketing leaders and RevOps managers at mid-market B2B SaaS companies (50–500 employees) who need clearer attribution without hiring a data team.",
      productsServices:
        "Marketing attribution dashboard, pipeline influence reporting, campaign ROI snapshots, weekly executive digests",
      keyDifferentiators:
        "Setup in under a day, no data engineering required, opinions built in (not just charts)",
      primaryGoals:
        "Build thought leadership on LinkedIn and X, drive demo requests from marketing leaders, nurture existing trial users with educational content",
      contentPillars:
        "Attribution myths, pipeline truth-telling, marketing ops efficiency, customer proof points",
      preferredPlatforms: "X,LinkedIn,Instagram,Email",
      toneKeywords: "clear, pragmatic, helpful, credible, slightly witty",
      doNotSay: "revolutionary, game-changing, crush it, 10x overnight, guaranteed ROI",
      industry: "B2B SaaS / Marketing Analytics",
      website: "https://tekflow.example.com",
    },
  });

  const agentRun = await prisma.agentRun.create({
    data: {
      trigger: "manual",
      status: "completed",
      completedAt: new Date(),
      summary:
        "Focused this cycle on attribution clarity for Q3 planning season. Proposed two LinkedIn thought-leadership posts and two X threads targeting marketing leaders skeptical of last-touch reporting.",
      contextSnapshot: {
        brandId: brand.id,
        recentActivityCount: 3,
        recentContentCount: 2,
      },
      proposals: { count: 4 },
    },
  });

  const proposals = [
    {
      platform: "LINKEDIN",
      format: "POST",
      title: "Your board deck is lying about marketing (politely)",
      body: "Last-touch attribution feels clean in a slide deck.\n\nIt is also the fastest way to underfund the channels that actually create pipeline.\n\nThree questions we ask every marketing leader before Q3 planning:\n\n1. Which campaigns show up in CRM *before* the opportunity — not just at close?\n2. Where are you counting \"influenced\" vs. \"sourced\" — and does sales agree?\n3. What decision would change if you trusted multi-touch for 30 days?\n\nYou do not need a data team to start. You need a shared definition of \"influence.\"\n\nWe built TekFlow for teams tired of arguing about spreadsheets instead of strategy.",
      agentReasoning:
        "LinkedIn post targets marketing leaders during planning season. Challenges last-touch bias with actionable questions — aligns with TekFlow positioning without being preachy.",
      confidence: 0.82,
      status: "PENDING_APPROVAL",
    },
    {
      platform: "X",
      format: "THREAD",
      title: null,
      body: "Thread: 5 attribution myths that survive because they are convenient 🧵\n\n1/ \"Direct traffic is always brand.\"\nOften it is dark social + untagged email. Track referrers before you reallocate budget.\n\n2/ \"MQL volume = marketing health.\"\nVolume without pipeline influence is a vanity parade.\n\n3/ \"Sales says marketing leads are bad.\"\nUsually a definition problem, not a quality problem. Fix the handoff language first.\n\n4/ \"Multi-touch is too complex.\"\nSimpler than rebuilding a funnel every quarter because nobody trusts the numbers.\n\n5/ \"We will fix attribution after we scale.\"\nScale magnifies bad decisions. Fix the model while spend is still legible.",
      agentReasoning:
        "X thread format performs well for myth-busting content. Each point is standalone-shareable; thread drives profile visits from marketing ops audience.",
      confidence: 0.78,
      status: "PENDING_APPROVAL",
    },
    {
      platform: "LINKEDIN",
      format: "POST",
      title: "The 20-minute weekly marketing review",
      body: "You do not need a 2-hour attribution meeting every week.\n\nTry this 20-minute ritual:\n\n• 5 min — Pipeline created by channel (same definition every week)\n• 5 min — One campaign that over- or under-performed vs. hypothesis\n• 5 min — Single action for next week (kill, scale, or test)\n• 5 min — Log the decision so you remember why in 90 days\n\nConsistency beats complexity. TekFlow's weekly digest exists to make this ritual boring — in a good way.",
      agentReasoning:
        "Practical playbook content builds trust with ops-minded marketers. Low controversy, high save rate potential on LinkedIn.",
      confidence: 0.75,
      status: "APPROVED",
      approvedBy: "demo-reviewer",
      approvedAt: new Date(),
    },
    {
      platform: "X",
      format: "POST",
      title: null,
      body: "Hot take: most \"attribution projects\" fail because they start with tools instead of definitions.\n\nAgree on sourced vs. influenced with sales first. The dashboard is the easy part.",
      agentReasoning:
        "Short contrarian post to maintain X presence between threads. Reinforces TekFlow's definitions-first positioning.",
      confidence: 0.71,
      status: "SCHEDULED",
      scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
    },
  ];

  for (const proposal of proposals) {
    const item = await prisma.contentItem.create({
      data: {
        platform: proposal.platform,
        format: proposal.format,
        title: proposal.title,
        body: proposal.body,
        agentReasoning: proposal.agentReasoning,
        confidence: proposal.confidence,
        status: proposal.status,
        scheduledFor: proposal.scheduledFor ?? null,
        approvedBy: proposal.approvedBy ?? null,
        approvedAt: proposal.approvedAt ?? null,
        createdBy: "agent",
      },
    });

    await prisma.activityLog.create({
      data: {
        type: "CONTENT_GENERATED",
        summary: `Agent proposed ${proposal.platform} ${proposal.format}`,
        details: {
          reasoning: proposal.agentReasoning,
          confidence: proposal.confidence,
        },
        contentItemId: item.id,
        agentRunId: agentRun.id,
      },
    });
  }

  await prisma.activityLog.createMany({
    data: [
      {
        type: "AGENT_PLANNING_STARTED",
        summary: "Planning cycle started (demo seed)",
        details: { trigger: "manual", brandId: brand.id },
        agentRunId: agentRun.id,
      },
      {
        type: "AGENT_PLANNING_COMPLETED",
        summary: "Planning cycle completed — 4 proposals created",
        details: {
          proposalsCreated: 4,
          strategyNote: agentRun.summary,
        },
        agentRunId: agentRun.id,
      },
      {
        type: "BRAND_UPDATED",
        summary: `Brand profile created: ${DEMO_BRAND_NAME}`,
        details: { companyName: DEMO_BRAND_NAME, source: "seed" },
      },
    ],
  });

  await prisma.contentPackage.create({
    data: {
      brandContextId: brand.id,
      topic: "Why last-touch attribution breaks B2B funnels",
      provider: "xai",
      platforms: ["linkedin", "x", "youtube_short"],
      strategyNote:
        "Lead with the pain (board-ready numbers that mislead), then offer a lightweight weekly ritual as the fix.",
      agentReasoning:
        "Cross-platform package adapts one insight for LinkedIn long-form, X thread, and YouTube Short hook — consistent narrative, format-native delivery.",
      content: {
        linkedin: {
          post:
            "Last-touch attribution is seductive because it is simple. It is also why marketing gets under-credited for pipeline that takes 6–8 weeks to mature...",
        },
        x: {
          thread: [
            "Your CRM says marketing sourced 12% of pipeline.",
            "Your marketing team remembers 40 touches that never got credit.",
            "Both teams are right — and wrong — because the model is wrong.",
          ],
        },
        youtube_short: {
          hook: "Stop reporting marketing with last-touch. Here is what to do instead.",
          script: "If your attribution model only credits the last click, you are optimizing for closers — not creators...",
        },
      },
    },
  });

  console.log("Demo seed complete.");
  console.log("  Brand:     TekFlow Analytics (active)");
  console.log("  Proposals: 4 content items (2 pending approval)");
  console.log("  Package:   1 saved content package");
  console.log("");
  console.log("Explore: http://localhost:3000");
  console.log("  Dashboard:  /");
  console.log("  Approvals:  /content-studio/approvals");
  console.log("  Packages:   /content-studio/packages");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
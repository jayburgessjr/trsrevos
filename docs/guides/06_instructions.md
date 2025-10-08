# Detailed Instructions Guide

## Purpose
This guide explains **exactly how to use the AI Coding Control Pack** with Lovable, Codex, Cursor, or any LLM-powered coding tool. Follow these steps in order every time you start a new feature or app.

---

## Step 1: Start with Research
1. Open `01_research.md`.  
2. Take screenshots of the part of your app you want to change.  
   - Example: “Video list needs weekly summary totals.”  
3. Annotate screenshots with arrows or notes (use a simple tool like Preview, Figma, or even PowerPoint).  
4. Fill out the Observations + Quick Notes sections in `01_research.md`.  
5. Save this doc + screenshot(s) in your project folder.  

**Tip:** AI understands screenshots better than vague descriptions. Always include at least one.  

---

## Step 2: Attach the Architecture Guide
1. Review `02_architecture.md`.  
2. If this is your first project → keep as is.  
3. If the project has unique rules (e.g., must use PostgreSQL, or no Tailwind), update the file with those constraints.  
4. Save it and upload it into **Lovable → Knowledge** or keep handy for Codex prompts.  

**Tip:** This file acts like your “guardrails.” Once written, you can reuse it in multiple projects.  

---

## Step 3: Write a Bite-Sized PRD
1. Open `03_prd.md`.  
2. Fill in:
   - **Feature Title** → short and descriptive.  
   - **Purpose** → why this matters.  
   - **Scope** → what’s included / excluded.  
   - **User Story** → describe feature from a user’s perspective.  
   - **Acceptance Criteria** → the “checklist” for success.  
   - **Resources** → link to your Research Doc + Architecture Guide.  
3. Keep PRDs small (1 feature at a time).  

**Tip:** Don’t say “Build me a whole app.” Instead, say:  
- PRD 1: Create 3D environment.  
- PRD 2: Add a scoreboard.  
- PRD 3: Add pinball physics.  

---

## Step 4: Generate a Plan with AI
1. Open your coding agent (Lovable or Codex).  
2. Upload/attach:
   - Screenshot(s)  
   - Research Doc  
   - Architecture Guide  
   - PRD  
3. Ask:  
   > “Read the PRD, screenshot, and architecture doc. Create a step-by-step plan to implement these requirements in the existing codebase. Do not code yet.”  
4. Review the plan.  
   - If unclear → ask AI to clarify.  
   - If too broad → split into multiple PRDs.  

**Tip:** This step is where most people fail. Don’t skip reading the plan. If the plan is wrong, the code will be wrong.  

---

## Step 5: Let AI Code (Step-by-Step)
1. Once plan is approved → ask AI:  
   > “Now implement step 1 from the plan.”  
2. Test results after each step.  
3. Continue step-by-step until feature is complete.  

**Tip:** Never ask AI to “do the whole plan at once.” Break it into chunks.  

---

## Step 6: Review & Test
1. Compare delivered code to PRD acceptance criteria.  
2. Run unit tests / integration tests.  
3. Verify code follows Architecture Guide.  
4. If adjustments needed → write a **mini-PRD** and repeat the process.  

---

## Step 7: Deploy & Document
1. Once tests pass → merge and deploy.  
2. Update your PRD library and architecture guide if new patterns emerged.  
3. Archive Research Doc + Screenshots for reference.  

---

## Example Workflow
**Scenario:** Add weekly summary rows in a video list.  
- **Research Doc:** Screenshot of video list with red box showing “Add totals here.”  
- **Architecture Guide:** Already states “use React functional components + Tailwind.”  
- **PRD:** “Add weekly summary rows to list with totals of views/likes.”  
- **Plan:** AI generates a list of changes (modify list component, create summary component, adjust rendering).  
- **Code:** Approve plan, then implement step by step.  
- **Review:** Test weekly totals display correctly.  

✅ Done — feature is live, predictable, and aligned with your standards.  

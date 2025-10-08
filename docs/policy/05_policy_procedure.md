# AI Coding Policy & Procedure

## Policy Statement
AI coding assistants (Lovable, Codex, Cursor, Claude Code, etc.) are powerful accelerators but **not complete replacements for human software roles**.  
To ensure reliable outcomes, all AI-generated code must follow structured inputs (research, architecture, PRD, planning) and pass through human review checkpoints before implementation.  

**Key Principles:**
- AI is a **collaborator**, not an all-in-one developer.  
- **No single prompt** should be expected to produce production-ready software.  
- **Smaller, scoped PRDs** are safer and yield better results than big, vague asks.  
- **Human checkpoints** (reviewing plans, PRDs, test outputs) are mandatory.  

---

## Procedure

### Phase 1: Research
1. Take annotated screenshots of UI or flow.  
2. Write **Research Notes**: what’s missing, what’s needed, why it matters.  
3. Store screenshots + notes in project repo / Lovable Knowledge.  

### Phase 2: Architecture
1. Maintain a **reusable Architecture Guide** (DRY, separation of concerns, React + TypeScript, Tailwind).  
2. Update only when a new pattern emerges (e.g., different DB strategy).  
3. Attach this doc to AI coding sessions (Lovable "Knowledge" → Docs).  

### Phase 3: PRD Creation
1. Draft a **bite-sized PRD** (1 feature at a time).  
2. Include: Purpose, Scope, User Story, Acceptance Criteria, Resources.  
3. Store PRDs in `docs/prd/` in repo.  

### Phase 4: Planning
1. Give AI (Lovable/Codex) the **Research + PRD + Architecture Guide**.  
2. Ask explicitly:  
   > “Read the PRD, screenshot, and architecture doc. Create a step-by-step implementation plan before coding.”  
3. Review plan: approve/edit, break down if needed.  

### Phase 5: Coding
1. After approving plan, ask AI to **implement step-by-step**.  
2. Test immediately (don’t let AI overrun multiple features).  
3. Review generated code against architecture + PRD acceptance criteria.  
4. If issues → create a new **mini-PRD** (don’t jam fixes into vague prompts).  

### Phase 6: Review & Deploy
1. Human reviews PRD vs. delivered code.  
2. Run local/unit tests.  
3. Deploy only after code passes review.  
4. Update docs (Research Notes, Architecture Guide, PRD library).  

---

## Checklist
- [ ] Research doc created (screenshots + notes)  
- [ ] Architecture guide attached  
- [ ] PRD drafted  
- [ ] AI-generated **Plan reviewed** (before coding)  
- [ ] Code tested against PRD acceptance criteria  
- [ ] Docs updated  

✅ **Result:** Instead of AI “winging it,” you now have a repeatable operating system for coding projects.

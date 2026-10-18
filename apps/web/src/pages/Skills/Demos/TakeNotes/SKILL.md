---
name: take-notes
description: Use this skill when the user asks to organize detailed knowledge-point notes, study notes, technical notes, or a specific section of an existing document, such as "整理 xxx 知识点", "整理 xxx 笔记", "帮我补充文档里的 xxx 部分", or similar. If the user provides a Notion link, the notes must be read and written only through Notion MCP tools; never use a browser, export, local substitute, or chat-only workaround. If Notion MCP is unavailable or unauthorized, connect or authorize Notion MCP before drafting. If another document link cannot be edited, ask the user to resolve access and do not produce standalone notes. If no link is provided, answer directly in chat. After the notes are written, automatically run the review-note skill on them to find and fix knowledge gaps (default on; capped at 2 review rounds and 2 fixes). Skip only when the user explicitly asks not to review.
---

# Take Notes

## Overview

Create comprehensive, teachable notes for a requested topic or document section. The output should be detailed enough for a learner to study from directly, with definitions, examples, demos, results, and careful treatment of every newly introduced technical term.

## Workflow

1. Identify the requested topic, target location, and scope.
   - If the user provides a Notion link, this skill is in Notion-only mode. You must use Notion MCP tools exclusively for every read, permission check, page/database fetch, block inspection, and write. Browser automation, generic web browsing, app.notion.com page visits, exports, screenshots, clipboard-based editing, local files, or chat-only drafts are forbidden.
   - If Notion MCP tools are not currently available, discover or connect the Notion MCP first. If the MCP server is present but not authorized, perform the Notion MCP authorization/login flow or ask the user to approve/complete it. If Notion MCP still cannot be connected, stop and report that Notion MCP access is blocked; do not use any alternate method.
   - If the user provides a document link, inspect the link and update that document. This is mandatory: linked-document requests must not be fulfilled by chat-only notes or a separate ready-to-paste artifact.
   - If the user names a section or says to organize only part of a document, update only that section.
   - If there is no link, produce the notes directly in the conversation.
   - If the requested topic depends on current facts, versions, laws, pricing, product behavior, or other time-sensitive details, verify with appropriate current sources before writing.

2. Gather enough source context.
   - For Notion links, fetch the page or database through Notion MCP before drafting. If the link points to a database page, fetch the database schema and the page properties through Notion MCP. If any Notion MCP read fails because authorization, integration access, sharing, or edit permission is missing, perform the required Notion MCP authorization flow when possible; otherwise ask the user for the exact missing access action. Stop before drafting until Notion MCP can read the target.
   - For a linked document, read the existing content first and preserve unrelated content.
   - If the linked document cannot be read or edited because login, authorization, sharing, integration access, edit permission, or supported tooling is missing, stop before drafting the notes. Tell the user exactly what is blocking the write and what action is needed, such as logging in, granting edit access, sharing the document with the integration, or allowing you to complete the login/authorization flow.
   - For a requested section, locate the exact heading or content range before editing.
   - For a broad topic, structure the notes from fundamentals to advanced details.
   - Track every external source consulted while researching, including title or short label and URL.
   - If source material is missing or ambiguous, make a reasonable scope choice and state it briefly.

3. Confirm the edit scope and plan before modifying documents.
   - Before changing any linked or editable document, summarize the exact target document, section or range, intended operation (replace, append, restructure, or create), and the main content plan.
   - Ask the user to confirm this scope and plan, then wait for their approval before using document update tools or editing local document files. For Notion links, this confirmation must happen after the page/database has been fetched through Notion MCP and before any Notion MCP write/update call.
   - If the user requested chat-only notes with no document update, no confirmation step is required.
   - If a linked document is present but cannot currently be updated, do not ask for approval of a hypothetical note draft. Ask only for the concrete access/editing action needed to make the document writable.

4. Write exhaustive notes with learning scaffolding.
   - Explain concepts from first principles before advanced usage.
   - Include concrete demos, input data or code where relevant, and the resulting output.
   - For each new professional or technical term introduced in the notes, add a short explanation and a small demo or example.
   - Choose the clearest representation for each demo. Prefer compact tables for comparisons, concurrent execution order, state transitions, truth tables, command/result pairs, and before/after behavior; retain code blocks for commands readers must run or copy.
   - For a multi-step or multi-session demo, show the starting data, the ordered actions and their observed results in one scannable view. Label session/actor, transaction boundaries, and the point at which a snapshot, commit, rollback, or error occurs. Do not make readers reconstruct the timeline from separate code blocks.
   - Explain the decisive row or state change after the table. Avoid duplicating the same full demo in prose, a table, and code unless the code is needed to reproduce it.
   - Include common mistakes, edge cases, and mental models when they help understanding.
   - For technical study topics, follow the Learning-Oriented Requirements so the notes train active practice rather than passive reading.
   - For a topic covering several named tools, libraries, or approaches, decide whether the requested result is a selection overview or a study guide. A study guide must teach each principal item to a comparable, usable depth; do not let one full lab stand in for the other items. An overview may be shorter, but label its scope and do not imply that every item has been taught.
   - When writing into a linked document, follow the linked document structure rules below.
   - When writing into a linked document, append the consulted source links at the end of the inserted or updated notes.

5. Apply the update safely.
   - Before writing, compare the title, outline, and selection tables with the actual sections: every principal item promised by a study guide must have its own usage path. Verify code and expected results where tooling permits; otherwise label unverified examples and avoid exact error text that has not been observed.
   - For Notion links, apply the update only with Notion MCP write/update tools. Never use browser editing, browser automation, screenshots, exports, clipboard paste into Notion, local replacement documents, or a ready-to-paste chat answer as a substitute.
   - For linked documents, edit the target document instead of summarizing in chat, generating a local substitute, or providing paste-ready notes.
   - When only one section is requested, replace or append within that section only.
   - Keep the document's existing style and heading hierarchy where practical.
   - Do not delete unrelated sections, child pages, databases, or existing examples.
   - After a multi-section update, read the target again and check the intended sections, heading order, code blocks, source links, and preservation of unrelated content.

6. Auto-review and refine the finished notes (default on, capped at 2 rounds).
   - Default behavior: after the notes are written (in chat or into the linked document), automatically run the review-note skill on them to surface knowledge gaps. Do not ask for permission first; this is the default and expected behavior.
   - Per round: review the notes as written → fix every gap found (P0/P1/P2) by editing the notes in place (revise the relevant section or append the fix; do not restructure unrelated content).
   - Cap: at most 2 review rounds and at most 2 corresponding fixes. Sequence: review #1 → fix #1 → review #2 → fix #2, then stop. If a review round finds no gaps, stop early; do not force another round.
   - Respect the notes' location and mode: for Notion, both review and fix must go through Notion MCP only; for a linked document, edit that document; for chat-only notes, refine the chat output.
   - Skip the auto-review only when the user explicitly asks to skip it (e.g., "不用评审" / "简单记一下"). Leave the notes unchanged in that case.
   - After the final round, briefly state what the review found and what was fixed; if gaps remain because the 2-round cap was reached, say so explicitly instead of silently leaving them.

7. Report the result concisely.
   - If a document was updated, mention the document and section updated.
   - If content was returned in chat, provide the complete notes.
   - If a linked document could not be updated, do not include the notes content. State the blocker, the attempted access/update path, and the next user action needed.
   - Mention any important assumptions, unavailable sources, or verification gaps.

## Note Structure

Use this structure unless the user's requested format or the target document clearly suggests another:

1. Topic overview: what it is, why it exists, and when to use it.
2. Core terms: every important term with explanation and a minimal demo.
3. Step-by-step mechanics: how the concept works internally or operationally.
4. Demo and result: realistic example, expected output, and line-by-line or row-by-row explanation.
5. Common patterns: practical usage patterns and when each applies.
6. Edge cases: traps, gotchas, limitations, and debugging clues.
7. Summary: compact takeaways and review checklist.

## Learning-Oriented Requirements

When creating technical study notes, optimize for active learning rather than passive reading.

- Include runnable labs for important concepts:
  - File structure or setup.
  - Complete code.
  - Command to run.
  - Expected output.
  - Explanation of why that output happens.
- For each principal library or workflow in a multi-item study guide, cover its input boundary, minimum setup, a complete example, how to run or invoke it, observable success and failure results, and the reason for each result. A shared setup or lab may serve several items only when each item's behavior is exercised and explained explicitly. Keep incidental alternatives in a comparison table rather than expanding every mention into a full lab.
- Before showing the explanation for a demo, include a short "Predict first" prompt that asks the learner to guess the result.
- Check each demo's presentation: can a reader see the initial state, execution order, intermediate observation, and final state without mentally interleaving paragraphs? If not, add a small table or restructure it. Keep tables short and use code blocks alongside them when exact runnable syntax matters.
- Include mistake-driven examples:
  - Broken code or wrong assumption.
  - Actual error message or observable failure.
  - Root cause.
  - Corrected version.
- End each major topic with practice tasks:
  - 2-5 exercises.
  - Clear acceptance criteria.
  - Hints before full solutions when appropriate.
- For technical tools, APIs, runtimes, and frameworks, prefer official documentation as the primary source and mention the version or date context when behavior may vary.
- Avoid overwhelming the learner with exhaustive API lists too early. Prefer a progressive path from core usage to edge cases.

## Term Coverage Rules

- Treat a term as "new" if it appears for the first time in the generated notes and a learner may not already know it.
- Explain the term near its first meaningful use or in a "Core terms" section.
- Each term explanation should include:
  - Definition: plain-language meaning.
  - Why it matters: what problem it helps solve.
  - Demo: a small example, command, code snippet, query, table, or scenario.
  - Result: the observable output or conclusion from the demo.
- Do not create infinite recursive definitions for ordinary words inside explanations. Focus on professional, technical, domain-specific, or tool-specific vocabulary.

## Linked Documents

When a link is provided:

- A linked document means the final notes must land in that document.
- For Notion links, use Notion MCP only. First fetch the page or database through Notion MCP, then use the appropriate Notion MCP update tool. Do not open the Notion URL in a browser, use browser automation, use generic web tools, export/import content, create a local substitute, or provide a ready-to-paste answer.
- If Notion MCP is unavailable, search for or connect the Notion MCP server. If it is present but unauthorized, run the Notion MCP authorization/login flow or ask the user to approve/complete that flow. If the page requires integration sharing or edit permission after MCP authorization succeeds, ask the user to share the page/database with the integration or grant edit access. Stop before drafting until Notion MCP can read and eventually update the target.
- If editing a Notion database page, rely only on Notion MCP-fetched property names and schema.
- For other editable document types, use the best available document tooling in the environment. If tooling exists but needs authentication or permission, ask the user to provide or approve that access before drafting.
- Before applying any document edit, tell the user what will be changed and how, then wait for explicit confirmation.
- If the link is view-only, unsupported, inaccessible, or otherwise not writable, explain the limitation and stop. Do not generate standalone notes, local substitute files, or ready-to-insert text unless the user explicitly withdraws the document-link requirement or asks for chat-only notes in a later message.

## Linked Document Structure

When organizing notes into a specified linked document, use a navigable, numbered structure unless the user explicitly asks for a different format.

- Put a content navigation block near the top of the inserted or replaced notes, before the first numbered heading. For Notion pages, prefer the native table of contents block (`<table_of_contents/>`) after any short context note or callout.
- Number headings and subheadings hierarchically in the visible heading text:
  - Main sections: `# 1. ...`, `# 2. ...`, `# 3. ...`
  - Subsections: `## 1.1 ...`, `## 1.2 ...`, `## 2.1 ...`
  - Deep sections: `### 2.1.1 ...`, `### 2.1.2 ...`
- Keep numbering sequential and gap-free within the edited scope. If updating a section inside a larger document, continue or preserve the surrounding numbering instead of restarting in a way that conflicts with adjacent content.
- Apply numbering to substantive note content, including summary, review, pitfalls, examples, and source sections when they are part of the inserted notes.
- Do not number the table of contents block itself.
- End the inserted or updated document notes with a `资料链接` or `Sources` section that lists all consulted external source links. Include the source title or a short descriptive label plus the URL.
- If the target document format does not support a dynamic table of contents, add a short `内容导航` section with a manual numbered outline that mirrors the headings.

When updating an existing document section:

- Fetch/read the document before editing.
- Match the section by heading text or the user's described content.
- Replace only the relevant section content, or insert inside that section if the user asks to supplement rather than replace.
- Preserve unrelated content, comments, child pages, databases, and formatting conventions.

## Quality Bar

- Be much more detailed than a summary.
- Use demos with explicit results, not examples that stop before the outcome.
- Favor concrete artifacts over abstract prose: code plus output, table plus result rows, command plus response, or scenario plus conclusion.
- For concurrency and transaction examples, prefer a timeline table with explicit session columns and a result column; for rollback and mutation examples, prefer a before/after state table. Use only columns that materially clarify the outcome.
- Keep the notes organized enough to scan, even when exhaustive.
- If the target page is long, avoid rewriting unrelated areas.

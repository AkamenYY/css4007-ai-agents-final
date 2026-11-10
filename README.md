# ShortsPilot — AI agent for YouTube Shorts creators

**Student project for CSS 4007 · Level C (tool-using agent) · Author: Madiyar Tokbergen**

ShortsPilot answers a Shorts creator's questions about their videos and checks titles for spam patterns. It has two tools: `get_video_stats` reads video data from `data/videos.json`, and `check_title` checks a title with fixed rules. The LLM chooses which tool a request needs, or answers directly when no tool is needed. See [reports/proposal.md](reports/proposal.md) for the full design.

### Status

| Week | Done |
|---|---|
| 10 | Proposal |
| 11 | OpenAI adapter with retries/timeouts, CLI with first working request, adapter tests |

Tools (`get_video_stats`, `check_title`) arrive in weeks 12–14. No YouTube API key is needed.

### Setup

Requirements: Node.js 22+, an OpenAI API key. No npm packages are needed.

```bash
git clone https://github.com/AkamenYY/css4007-ai-agents-final.git
cd css4007-ai-agents-final
cp .env.example .env        # then put your key and model into .env
npm start -- "Give me 3 title ideas for a Roblox Short where a boss can't find his egg"
npm test                    # runs without an API key (the model is mocked)
```

`.env` example:

```text
LLM_API_KEY=sk-...
LLM_MODEL=gpt-5-mini
```

### Project files

| File | What it does |
|---|---|
| `src/model-client.mjs` | OpenAI Chat Completions adapter → `{text, toolCalls}`; retries on 429/5xx/timeouts (max 2), clear errors, never logs the key |
| `src/assistant.mjs` | System prompt, input validation, first request |
| `src/cli.mjs` | Command-line entry point, loads `.env` |
| `tests/model-client.test.mjs` | Project tests with a mocked API |

### AI assistance statement

Claude (Anthropic) was used to help draft the proposal and generate the initial adapter, CLI and tests. I review, run and test all code, and I am responsible for understanding it.

---

*The course instructions from the instructor repository follow below.*

# AI Agents — Final Project

**CSS 4007 — Artificial Intelligence · Individual project · Your choice of topic**

**Start: 2 November 2026. Final deadline: 22 December 2026, 23:59 (Asia/Oral, UTC+05:00).**

Design, implement, test, and demonstrate an application powered by an LLM. You may choose any language, model provider, local model, or agent framework. You must understand and be able to explain your implementation. AI coding assistants are allowed; disclose their use.

## Choose a level

| Level | What you build | Main requirements | Detailed instructions |
|---|---|---|---|
| **D — Foundation** | A useful LLM-powered application | Real LLM integration, prompts, output validation, error handling, and at least **5 tests** | [D level](D.md) |
| **C — Intermediate** | An agent that chooses and uses tools | D foundations; at least **2 meaningful tools**, selected by the LLM; validated arguments, tool-grounded answers, logs, and at least **8 tests** | [C level](C.md) |
| **A — Advanced** | An autonomous agent that completes multi-step goals | D/C foundations; at least **3 tools**, state, planning and adaptation, bounded execution, guardrails, at least **12 tests** including 4 guardrail scenarios, and a recent research paper presentation | [A level](A.md) |

The diagnostic recommends a level; students may choose any level. The professor assesses the highest level actually demonstrated. A single agent can meet A-level requirements; a framework or multiple agents alone does not establish that level.

## Start here

1. **Fork** [the instructor repository](https://github.com/ardakshalkar/css4007-ai-agents-final/fork) into your own account. Use a fork so the submission retains its relationship to the instructor repository.
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/css4007-ai-agents-final.git`.
3. Read this README and your chosen [A](A.md), [C](C.md), or [D](D.md) level document.
4. Complete [reports/proposal.md](reports/proposal.md) in semester Week 10.
5. Develop regularly and complete reports/week-10.md through reports/week-17.md.
6. Complete [reports/final-report.md](reports/final-report.md), submit the fork URL and final commit hash, and demonstrate your application.

All shared instructions are below. The three level documents contain detailed technical requirements; A.md also contains the A-level guardrail and research paper requirements. Templates and report files are working forms to complete.


## Project calendar

Start: **2 November 2026**. Final deadline: **22 December 2026, 23:59 (Asia/Oral, UTC+05:00)**.

Semester weeks are counted from the course’s recorded start, 31 August 2026.

| Semester week | Dates (inclusive) | Milestone |
|---|---|---|
| 10 | 2026-11-02–2026-11-08 | Proposal and planning |
| 11 | 2026-11-09–2026-11-15 | Initial LLM integration |
| 12 | 2026-11-16–2026-11-22 | Core functionality |
| 13 | 2026-11-23–2026-11-29 | Tool integration |
| 14 | 2026-11-30–2026-12-06 | Agent workflow and A-level paper selection |
| 15 | 2026-12-07–2026-12-13 | Reliability and guardrails |
| 16 | 2026-12-14–2026-12-20 | Evaluation and improvement |
| 17 | 2026-12-21–2026-12-22 | Final submission and defense |

The final window has only two days. Complete core development before it. The supplied coefficient table applies to these eight reporting windows; the professor verifies meaningful progress.


## GitHub Repository Requirements

Every student must fork the instructor's repository.

Students must develop their project within their fork.

A separate repository does not replace the required fork unless explicitly approved by the instructor.

## Workflow

1. Fork the instructor's repository.
2. Clone the fork.
3. Complete the project proposal.
4. Commit and push changes regularly.
5. Submit weekly progress reports.
6. Keep source code and tests in the repository.
7. Submit the final commit hash and repository link.

## Repository Structure

Suggested student repository:

```text
css4007-ai-agents-final/
├── README.md                 shared project instructions
├── A.md                      advanced level requirements
├── C.md                      intermediate level requirements
├── D.md                      foundation level requirements
├── templates/                proposal, reports, evaluation, paper selection
├── diagnostic/               independent D/C/A diagnostic exercises
├── src/                      your application
├── tests/                    your tests
├── examples/                 guardrail utilities
├── reports/
│   ├── proposal.md
│   ├── week-10.md … week-17.md
│   ├── paper-selection.md     A level
│   └── final-report.md
├── scripts/                  objective repository checks
├── .github/workflows/        GitHub Actions
└── project.config.json       dated reporting windows
```

Students may modify the application structure but must preserve required report locations.

## Meaningful Commits

A meaningful contribution may include:

- Implementing a feature.
- Fixing a bug.
- Adding or improving tests.
- Integrating an API.
- Improving tool execution.
- Implementing guardrails.
- Refactoring significant logic.
- Documenting technical decisions.
- Conducting and recording an experiment.

The following do not count by themselves:

- Empty commits.
- Purely cosmetic changes.
- Artificially splitting one trivial change into many commits.
- Renaming files without meaningful changes.
- Repeatedly modifying insignificant text.
- Updating timestamps without actual progress.

The instructor evaluates meaningful progress, not only commit quantity.

Approximately 2–4 substantive commits per week are recommended, but no fixed commit count guarantees credit.

---

## Week 10 Project Proposal

Week 10 is mandatory for every student.

Students must complete:

`reports/proposal.md`

## Required Fields

### Project Title

Name of the proposed application.

### Problem Description

What problem does the application solve?

Why is this problem important?

### Target Users

Who will use the application?

### Selected Difficulty

D, C, or A.

### Expected Functionality

List the application's main features.

### Proposed Functions

Students must provide a preliminary function specification.

Example:

```python
def search_papers(query: str) -> list:
    """
    Searches for scientific papers.
    """
```

For each function describe:

- Name.
- Purpose.
- Input.
- Expected output.
- Dependencies.

### Proposed Agent Tools

For C and A levels, identify which functions will be exposed as LLM-callable tools.

Explain why the agent needs each tool.

### Model Selection

Specify the proposed model and API or local inference approach.

### Architecture

Provide a basic architecture diagram or workflow.

### Example Requests

Give at least three examples of tasks the application should perform.

### Evaluation Plan

Describe how the student will test whether the system works correctly.

### Weekly Milestones

Explain what the student plans to complete during each week.

## Instructor Review

The professor may:

- Approve the proposal.
- Request modifications.
- Recommend a different project scope.
- Recommend a different difficulty level.
- Request clarification of functions or architecture.

Students may revise their project during development, but significant changes must be documented.

---

## Development Schedule — Semester Weeks 10–17

## Week 10 — Proposal and Planning

Mandatory:

- Fork repository.
- Define project topic.
- Choose difficulty level.
- Write problem statement.
- Propose functions and tools.
- Create architecture diagram.
- Describe expected results.
- Submit evaluation plan.
- Submit milestones for semester Weeks 10–17.

Deliverable:

`reports/proposal.md`

## Week 11 — Initial LLM Integration

Mandatory:

- Set up development environment.
- Integrate LLM API or local model.
- Implement the first working request.
- Add basic documentation.
- Commit working code.

Deliverable:

Initial LLM-powered prototype.

## Week 12 — Core Functionality

Mandatory:

- Implement main project functions.
- Introduce structured outputs where relevant.
- Validate inputs and outputs.
- Add initial tests.
- Demonstrate useful functionality.

Deliverable:

Working core application.

## Week 13 — Tool Integration

D level:

- Improve application functionality.
- Improve validation.
- Add test coverage.

C level:

- Implement at least two tools.
- Implement LLM tool selection.
- Demonstrate actual tool execution.

A level:

- Implement at least three tools.
- Start multi-step orchestration.
- Define tool permission policies.

Deliverable:

Integrated functional prototype.

## Week 14 — Agent Workflow

D level:

- Complete application workflow.
- Improve usability and reliability.

C level:

- Complete tool-calling workflow.
- Implement tool error handling.

A level:

- Implement multi-step execution.
- Add execution state.
- Implement planning or conditional decisions.
- Define stopping conditions.
- Submit selected recent research paper.

Deliverable:

End-to-end workflow demonstration.

## Week 15 — Reliability and Guardrails

All levels:

- Add failure handling.
- Improve validation.
- Expand test coverage.

A level additionally:

- Implement guardrails.
- Add execution limits.
- Add action approval where applicable.
- Test unauthorized actions.
- Test recovery and stopping behavior.
- Add execution tracing.

Deliverable:

Reliability and guardrail test results.

## Week 16 — Evaluation and Improvement

Mandatory:

- Execute project test suite.
- Record test results.
- Analyze failures.
- Improve implementation.
- Update documentation.

A level:

- Complete all mandatory guardrail tests.
- Prepare research paper presentation.

Deliverable:

`reports/week-16.md` and evaluation results.

## Week 17 — Final Submission and Defense

Mandatory:

- Final source code.
- Final README.
- Complete test results.
- Final repository link.
- Final commit hash.
- Working demonstration.
- Technical defense.

A level additionally:

- Research paper presentation.
- Autonomous workflow demonstration.
- Guardrail challenge.

Deliverable:

Complete final project.

---

## Weekly Progress Reporting

Students submit a short weekly report.

File format:

`reports/week-NN.md`

## Template

```markdown
## Week N Progress Report

## Completed Work

Describe the work completed this week.

## Important Commits

- Commit hash:
- Description:
- Link:

## Current Functionality

What can the application do now?

## Problems Encountered

What failed or was difficult?

## Solutions

How were problems solved?

## What I Learned

Explain the technical concepts you learned this week.

## Next Week

What will you implement next?
```

Weekly reports must match actual repository activity.

A report without meaningful development does not automatically qualify the week as active.

---

## Development Consistency Coefficient

The project is intended to be developed continuously across semester Weeks 10–17, from 2 November through 22 December 2026. Week 17 is a shortened final reporting window.

A student who completes almost everything in a single week receives a lower development consistency coefficient.

## Coefficient Table

| Meaningful Active Weeks | Coefficient K |
|---|---|
| 8 | 1.00 |
| 7 | 0.95 |
| 6 | 0.90 |
| 5 | 0.85 |
| 4 | 0.80 |
| 3 | 0.70 |
| 2 | 0.60 |
| 1 | 0.50 |
| 0 | 0.50 |

## Definition of an Active Week

An active week requires evidence of meaningful technical progress.

Evidence may include:

- Meaningful code changes.
- New working functionality.
- Tests.
- Bug fixes.
- Significant architecture improvements.
- Technical experiments.
- Documented engineering decisions.

Weekly reports support this evidence.

The professor may reject superficial or artificial commits.

Commit frequency alone is not sufficient.

## Late or Bulk Commits

A student who uploads an entire completed project in the final week may receive a coefficient of 0.50.

Artificially backdated commits do not establish legitimate weekly progress.

The instructor may account for approved absences, infrastructure outages, or other documented exceptional circumstances.

## Formula

```text
Adjusted Project Score = Raw Project Score × K
```

Example:

```text
Raw score = 90
Active weeks = 1
K = 0.50

Adjusted score = 45
```

The professor determines active weeks based on meaningful progress evidence.

---

## Optional Understanding Assessments

Weekly oral assessments are not mandatory for every student.

The professor may request an understanding assessment at any stage.

These checks verify that students understand the code, architecture, and technical decisions in their repositories.

## Triggers for Assessment

The professor may initiate a check when:

- A large quantity of code appears suddenly.
- A student cannot explain their implementation.
- The project changes dramatically without clear documentation.
- There is uncertainty about the student's contribution.
- The code appears inconsistent with the student's demonstrated knowledge.
- The professor wants to verify a difficult implementation.
- A student is randomly selected for verification.

## Initial Check

Typical duration: 3–5 minutes.

Example questions:

1. What does this function do?
2. Why did you implement it this way?
3. What happens when the API fails?
4. How is this tool selected?
5. What data does the agent store?
6. How does the agent know when to stop?
7. What part of the implementation was most difficult?

## Escalated Assessment

If understanding remains unclear, the professor may require a deeper assessment.

Possible tasks:

- Explain a specific code section.
- Trace data through the application.
- Debug a small problem.
- Modify a function.
- Add a simple feature.
- Explain an error log.
- Demonstrate a failed test and its correction.

## Assessment Outcomes

Possible outcomes:

- Understanding demonstrated.
- Further explanation required.
- Follow-up demonstration required.
- Relevant technical contribution requires reassessment.

There is no automatic grade penalty for being selected.

An unsuccessful check may affect the evaluation of the relevant technical contribution, according to the published rubric.

The professor records the reason and result of escalated assessments.

---

## Final Grading

Project grades depend on demonstrated functionality, architecture, testing, and technical understanding.

The development consistency coefficient is applied to the project score.

## D-Level Rubric

| Component | Weight |
|---|---|
| Working functionality | 40% |
| LLM integration and architecture | 20% |
| Testing and reliability | 20% |
| Documentation and final defense | 20% |
| **Total** | **100%** |

## C-Level Rubric

| Component | Weight |
|---|---|
| Working functionality | 35% |
| Tool-calling architecture | 25% |
| Testing and reliability | 20% |
| Documentation and final defense | 20% |
| **Total** | **100%** |

## A-Level Rubric

| Component | Weight |
|---|---|
| Working functionality | 30% |
| Autonomous architecture and guardrails | 25% |
| Testing and reliability | 20% |
| Documentation and final defense | 15% |
| Recent research paper presentation | 10% |
| **Total** | **100%** |

## Final Grade Formula

```text
Final Project Score = Rubric Score × K
```

Where:

- Rubric Score is between 0 and 100.
- K is the development consistency coefficient.

Example:

```text
A-level project

Functionality: 27/30
Architecture: 23/25
Testing: 17/20
Defense: 13/15
Paper: 9/10

Raw score = 89

Active weeks = 7
K = 0.95

Final score = 84.55
```

## Level Eligibility

The instructor determines the highest level demonstrated by the submitted implementation.

If a student selects A level but does not demonstrate its mandatory capabilities, the instructor may reassess the project against C-level criteria.

Similarly, a project missing essential C-level requirements may be evaluated as D level.

A student's declared level does not guarantee that level's recognition.

If the institution requires different maximum grades for different difficulty levels, those limits must be published before students select their projects.

No additional level-based grade ceiling is assumed in this specification.

---

## Final Demonstration

Every student must demonstrate their project.

Suggested duration: 10 minutes per student.

| Activity | Duration |
|---|---|
| Working demonstration | 3 minutes |
| Architecture explanation | 2 minutes |
| Unseen test | 3 minutes |
| Questions | 2 minutes |

A-level research paper presentations require an additional 5–7 minutes.

## Unseen Tests

The professor may provide a new request that was not included in the student's prepared demonstration.

### D Level

Example:

- Unexpected input.
- Invalid output.
- API failure.

### C Level

Example:

- Request requiring a different tool.
- Invalid tool arguments.
- Missing external information.

### A Level

Example:

- Multi-step task with missing information.
- Failed intermediate tool call.
- Unauthorized action attempt.
- Prompt injection.
- Execution limit challenge.

Students must explain their agent's behavior.

A recorded video alone is not sufficient evidence of full functionality.

---

## Submission Requirements

Every student must submit:

1. GitHub repository fork link.
2. Final commit hash.
3. Source code.
4. Setup and execution instructions.
5. Required weekly progress reports.
6. Test cases.
7. Test results.
8. Architecture explanation.
9. Final demonstration.
10. Statement describing the use of AI coding assistants.

C-level students additionally submit:

- Tool definitions.
- Tool execution examples.
- Tool selection evidence.

A-level students additionally submit:

- Agent state and execution design.
- Complete multi-step execution trace.
- Guardrail implementation.
- Guardrail test results.
- Recent scientific paper link.
- Paper presentation.

## Security Requirements

Students must not commit:

- API keys.
- Passwords.
- Access tokens.
- Private credentials.
- Personal data without authorization.

Use environment variables and example configuration files.

Include `.env` in `.gitignore`.

Students are responsible for controlling any external actions performed by their agents.

---

## AI Coding Assistant Policy

Students may use AI coding assistants, including:

- ChatGPT
- Codex
- Claude Code
- GitHub Copilot
- Other equivalent tools

Using AI coding tools is allowed and encouraged.

However, students are responsible for:

1. Understanding their implementation.
2. Testing generated code.
3. Correcting errors.
4. Explaining technical decisions.
5. Demonstrating actual functionality.
6. Following security requirements.

Students must disclose how they used AI assistance.

The professor may request additional explanations or modifications to verify understanding.

Code generation alone is not sufficient evidence of mastery.

---

## Repository automation

Node.js 22 or later is required for these checks. Your application may use any language, framework, or model provider. No external npm dependencies are needed.

- `npm test`: exercise the starter utilities. Add tests for your actual project separately.
- `npm run validate`: check submitted and past-due reports. The unchanged instructor repository keeps its blank templates. Student forks must complete reports after their dated windows. This is a completeness check, not a grade.
- `npm run proposal`: require all proposal sections and a D/C/A level.
- `npm run report -- 10`: require all sections in the semester Week 10 report (use 10–17).
- `npm run activity`: print commit evidence grouped by semester week. Inherited commits, backdated timestamps, or trivial changes do not establish meaningful work. The professor verifies active weeks.

The workflow can also be run manually with a required semester week, requiring reports through that week. It uses read-only repository permissions and needs no API keys. Submitted reports should replace every TODO; blank future templates are expected.

## Grade preview

`npm run grade -- /absolute/path/to/private-input.json` previews the published formula. Keep grade inputs and outputs outside the repository.

Anonymous example input:

```json
{"level":"A","scores":{"functionality":27,"architecture":23,"testing":17,"defense":13,"paper":9},"verifiedActiveWeeks":7}
```

The component values are earned marks, not percentages. Maximum marks are D: 40/20/20/20; C: 35/25/20/20; A: 30/25/20/15/10. The example returns raw 89, coefficient 0.95, adjusted 84.55. The project's recorded 40% course weight is separate.

The professor determines the demonstrated level and meaningful weeks. A documented exception can be previewed by adding `"override":{"coefficient":1,"reason":"Instructor-reviewed documented exception"}`. The calculator preserves the stated reason; it does not approve it, record a grade, or publish anything.


## Diagnostic exercises


60 minutes, 30 points: D, C, A each 20 minutes and 10 points. Each exercise has its own run(input, dependencies) function and can be attempted independently. The diagnostic tasks and scoring follow below.

The instructor supplies a configured model adapter or injected mock client; the data and dispatcher are already provided. Do not spend examination time obtaining credentials. Example invocation after implementation: `node --input-type=module -e "import('./diagnostic/d-level.mjs').then(async m => console.log(await m.run()))"`. The deliberately incomplete exercises are excluded from starter CI.

The course dates and S001 identifier here are synthetic diagnostic fixtures, not real student records or the course calendar. Model selection of tools must be genuine; hard-coded routing does not satisfy the requirement. No solutions are distributed.


## Diagnostic Examination

## Purpose

The diagnostic examination determines which difficulty level is appropriate for each student.

It evaluates practical programming and AI engineering skills.

The examination does not restrict students from choosing a more difficult project.

## Format

**Duration:** 60 minutes  
**Maximum score:** 30 points

| Section | Duration | Points |
|---|---|---|
| D-level tasks | 20 minutes | 10 |
| C-level tasks | 20 minutes | 10 |
| A-level tasks | 20 minutes | 10 |

Each section should be independently executable using prepared starter code.

Students may use provided documentation and API references.

The instructor should use mock tools and prepared datasets to make assessment reproducible.

## D-Level Diagnostic Task

### Task: Structured Quiz Generator

Implement an LLM-powered quiz generator.

Input:

```json
{
  "topic": "Machine Learning",
  "difficulty": "medium",
  "question_count": 3
}
```

Expected output:

```json
{
  "topic": "Machine Learning",
  "questions": [
    {
      "question": "What is overfitting?",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correct_index": 1,
      "explanation": "Explanation"
    }
  ]
}
```

### Requirements

1. Call an LLM using an API.
2. Construct an appropriate prompt.
3. Request structured JSON output.
4. Validate the result.
5. Handle invalid or missing output.

### Grading

| Criterion | Points |
|---|---|
| LLM API integration | 2 |
| Prompt and schema | 3 |
| JSON parsing and validation | 3 |
| Error handling | 2 |
| **Total** | **10** |

## C-Level Diagnostic Task

### Task: Course Information Agent

Students receive a predefined tool:

```python
COURSES = {
    "AI101": {
        "title": "Artificial Intelligence",
        "credits": 5,
        "exam_date": "2026-12-15"
    },
    "ML201": {
        "title": "Machine Learning",
        "credits": 6,
        "exam_date": "2026-12-18"
    }
}

def get_course_info(course_id):
    return COURSES.get(
        course_id,
        {"error": "Course not found"}
    )
```

Build an LLM application that decides when to call this function.

Example requests:

- When is the AI101 exam?
- How many credits does ML201 have?
- What is the exam date for CS999?

### Requirements

1. Register the function as an LLM tool.
2. Allow the LLM to select the function.
3. Execute the requested function.
4. Return the tool result to the LLM.
5. Generate a correct answer.
6. Handle invalid course identifiers.

Hard-coded text matching does not satisfy the tool-selection requirement.

### Grading

| Criterion | Points |
|---|---|
| Tool schema | 3 |
| Tool execution | 3 |
| Correct use of results | 2 |
| Error handling | 2 |
| **Total** | **10** |

## A-Level Diagnostic Task

### Task: Multi-Step Academic Agent

Students receive these mock tools:

```python
def get_student_courses(student_id):
    return ["AI101", "ML201"]

def get_course_deadlines(course_id):
    deadlines = {
        "AI101": ["2026-12-10", "2026-12-15"],
        "ML201": ["2026-12-12", "2026-12-18"]
    }
    return deadlines.get(course_id, [])
```

Build an agent that responds to:

> Find all deadlines for student S001 and generate a chronological study plan.

### Requirements

1. Retrieve the student's courses.
2. Retrieve deadlines for each course.
3. Combine the results.
4. Sort deadlines chronologically.
5. Generate a study plan.
6. Handle tool failures.
7. Stop execution when the goal is completed or cannot be completed.

The instructor provides a scaffold containing the LLM client and tool dispatcher.

### Grading

| Criterion | Points |
|---|---|
| Dependent tool coordination | 3 |
| Intermediate result handling | 2 |
| Correct result aggregation | 2 |
| Failure handling | 2 |
| Stop condition | 1 |
| **Total** | **10** |

## Recommended Placement

| Diagnostic result | Recommended level |
|---|---|
| D ≥ 6, C ≥ 7, A ≥ 7 | A |
| D ≥ 6, C ≥ 6 | C |
| Otherwise | D |

These are preliminary thresholds and may be adjusted after reviewing results.

Students choose their final project level independently.

---

## Starter examples


The utilities in guardrails.mjs illustrate checks outside the LLM. They are not a complete agent, provider adapter, or diagnostic solution. Adapt them to your own domain and add application tests. Trace only observable actions and concise summaries; never log secrets or private reasoning. Do not execute model-supplied arbitrary code.

The example tests exercise starter utilities; they do **not** count as your project’s required 5/8/12 test cases. Implement your own provider adapter and application tests. The diagnostic exercises intentionally contain TODOs and are excluded from CI.

## Assessment principles


The course evaluates five main outcomes:

1. **Implementation:** Can the student build a functional LLM application or agent?
2. **Engineering:** Can the student design appropriate tools, workflows, and architecture?
3. **Reliability:** Can the system handle unexpected inputs and failures?
4. **Understanding:** Can the student explain and modify their implementation?
5. **Consistency:** Has the student demonstrated meaningful development over time?

A-level projects add two further expectations:

6. **Controlled autonomy:** Can the agent pursue goals safely within explicit permissions and limits?
7. **Research literacy:** Can the student understand and explain a recent scientific contribution to LLMs or AI agents?

The objective is not to reward the largest application or the most complicated framework.

The objective is to develop students who can design, implement, evaluate, and understand useful AI systems.

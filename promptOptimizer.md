# Prompt Optimizer for "Actionable Insights"

To generate high-quality "Actionable Insights" from an LLM (like Gemini or GPT-4), we need to feed it the structured context of the `StudyPlanner` output.

## The Strategy
We will use a **Few-Shot Chain-of-Thought** prompting strategy. 
1.  **Role Definition**: Expert Academic Mentor.
2.  **Context Injection**: Provide the calculated "Weak Areas" and the "Constraint Bottlenecks" (e.g., prerequisites).
3.  **Output Constraint**: Strict strict JSON or bullet points.

## The Prompt Template

```markdown
You are an expert Engineering Logic Architect and Academic Mentor.
Your goal is to analyze a student's study schedule and provide 3 ultra-specific, non-generic actionable next steps.

### Student Context:
- **Weakest Topics**: {{WeakTopicsList}} (Confidence < 3)
- **Upcoming Critical Prerequisites**: {{PrerequisiteChains}}
- **Sprint Goal**: Complete {{TotalHours}} hours of study.

### Verification Criteria:
1. Insights must be actionable (start with a verb: "Solve", "Draw", "Debug").
2. Insights must bridge gaps (e.g., "Fix X to understand Y").
3. Insights must be time-bound relative to the schedule.

### Example Output:
1. "Your confidence in 'Trees' is low (2/5). Spend the first hour of Monday drawing B-Tree insertion steps before starting the 'Graphs' module on Tuesday."
2. "Since 'Dynamic Programming' is scheduled for Saturday (High Focus), review 'Recursion' concepts on Thursday evening to reduce cognitive load."
3. "Complete 2 specific practice problems on 'Process Scheduing' to validate your understanding before the weekend sprint."

### Current Student Data:
{{JSON_SCHEDULE_SUMMARY}}

### Generate 3 Actionable Insights:
```

## Integration Logic
When calling the LLM API:
1.  Filter the `allTopics` array from `StudyPlanner` for items with `confidence <= 2`.
2.  Pass that list as `{{WeakTopicsList}}`.
3.  Identify dependencies (Topic B depends on Topic A) and pass as `{{PrerequisiteChains}}`.
4.  Inject the generated JSON schedule as `{{JSON_SCHEDULE_SUMMARY}}`.
```

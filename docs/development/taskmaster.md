# Taskmaster Tool & Command Reference

This document provides a detailed reference for interacting with Taskmaster, covering both the recommended MCP tools, suitable for integrations like Cursor, and the corresponding `task-master` CLI commands, designed for direct user interaction or fallback.

## Overview

Task Master is a task management system designed for efficient project management with AI-powered features for generating, organizing, and tracking development tasks. This document covers both methods of interacting with Task Master:

- **MCP tools**: Programmatic interface for AI tools and integrated environments like Cursor (recommended)
- **CLI commands**: User-friendly terminal-based interface for direct interaction

## Initialization & Setup

### Initialize Project

- **MCP Tool:** `initialize_project`
- **CLI Command:** `task-master init [options]`
- **Description:** Set up the basic Taskmaster file structure and configuration in the current directory for a new project.
- **Key Options:**
  - `--name <name>`: Set the name for your project.
  - `--description <text>`: Provide a brief description for your project.
  - `--version <version>`: Set the initial version for your project, e.g., '0.1.0'.
  - `-y, --yes`: Initialize Taskmaster quickly using default settings without interactive prompts.
- **Important:** Once complete, you must parse a PRD to generate tasks. There will be no task files until then.

### Parse PRD

- **MCP Tool:** `parse_prd`
- **CLI Command:** `task-master parse-prd [file] [options]`
- **Description:** Parse a Product Requirements Document (PRD) to automatically generate an initial set of tasks.
- **Key Options:**
  - `[file]` or `-i, --input <file>`: Path to your PRD file.
  - `-o, --output <file>`: Specify where to save the generated 'tasks.json' file.
  - `-n, --num-tasks <number>`: Approximate number of top-level tasks to generate.
  - `-f, --force`: Overwrite an existing 'tasks.json' without asking for confirmation.

## AI Model Configuration

### Manage Models

- **MCP Tool:** `models`
- **CLI Command:** `task-master models [options]`
- **Description:** View current AI model configuration or set specific models for different roles.
- **Key Options:**
  - `--set-main <model_id>`: Set the primary model for task generation/updates.
  - `--set-research <model_id>`: Set the model for research-backed operations.
  - `--set-fallback <model_id>`: Set the model to use if the primary fails.
  - `--ollama`: Specify that the provided model ID is for Ollama.
  - `--openrouter`: Specify that the provided model ID is for OpenRouter.
  - `--setup`: Run interactive setup to configure models (CLI only).

## Task Listing & Viewing

### Get Tasks

- **MCP Tool:** `get_tasks`
- **CLI Command:** `task-master list [options]`
- **Description:** List your tasks, optionally filtering by status and showing subtasks.
- **Key Options:**
  - `-s, --status <status>`: Show only tasks matching this status, e.g., 'pending' or 'done'.
  - `--with-subtasks`: Include subtasks indented under their parent tasks.
  - `-f, --file <file>`: Path to your 'tasks.json' file.

### Get Next Task

- **MCP Tool:** `next_task`
- **CLI Command:** `task-master next [options]`
- **Description:** Show the next available task you can work on, based on status and completed dependencies.
- **Key Options:**
  - `-f, --file <file>`: Path to your 'tasks.json' file.

### Get Task Details

- **MCP Tool:** `get_task`
- **CLI Command:** `task-master show [id] [options]`
- **Description:** Display detailed information for a specific task or subtask by its ID.
- **Key Options:**
  - `[id]` or `-i, --id <id>`: The ID of the task or subtask to view.
  - `-f, --file <file>`: Path to your 'tasks.json' file.

## Task Creation & Modification

### Add Task

- **MCP Tool:** `add_task`
- **CLI Command:** `task-master add-task [options]`
- **Description:** Add a new task by describing it; AI will structure it.
- **Key Options:**
  - `-p, --prompt <text>`: Describe the new task you want to create.
  - `-d, --dependencies <ids>`: Specify IDs of tasks that must be completed before this one.
  - `--priority <priority>`: Set the priority (high, medium, low).
  - `-r, --research`: Enable research role for more informed task creation.

### Add Subtask

- **MCP Tool:** `add_subtask`
- **CLI Command:** `task-master add-subtask [options]`
- **Description:** Add a new subtask to a parent task, or convert an existing task into a subtask.
- **Key Options:**
  - `-p, --parent <id>`: The ID of the task that will be the parent.
  - `-i, --task-id <id>`: Use to convert an existing top-level task into a subtask.
  - `-t, --title <title>`: The title for the new subtask (required if not using task-id).
  - `-d, --description <text>`: A brief description for the new subtask.

### Update Tasks

- **MCP Tool:** `update`
- **CLI Command:** `task-master update [options]`
- **Description:** Update multiple upcoming tasks based on new context or changes.
- **Key Options:**
  - `--from <id>`: The ID of the first task to update.
  - `-p, --prompt <text>`: Explain the change or new context to apply to the tasks.
  - `-r, --research`: Enable research role for more informed updates.

### Update Task

- **MCP Tool:** `update_task`
- **CLI Command:** `task-master update-task [options]`
- **Description:** Modify a specific task by incorporating new information or changes.
- **Key Options:**
  - `-i, --id <id>`: The ID of the task to update.
  - `-p, --prompt <text>`: Explain the specific changes to incorporate.
  - `-r, --research`: Enable research role for more informed updates.

### Update Subtask

- **MCP Tool:** `update_subtask`
- **CLI Command:** `task-master update-subtask [options]`
- **Description:** Append timestamped notes or details to a specific subtask without overwriting existing content.
- **Key Options:**
  - `-i, --id <id>`: The ID of the subtask to add information to.
  - `-p, --prompt <text>`: Provide the information to append to the subtask's details.
  - `-r, --research`: Enable research role for more informed updates.

### Set Task Status

- **MCP Tool:** `set_task_status`
- **CLI Command:** `task-master set-status [options]`
- **Description:** Update the status of one or more tasks or subtasks.
- **Key Options:**
  - `-i, --id <id>`: The ID(s) of the task(s) or subtask(s) to update.
  - `-s, --status <status>`: The new status to set (e.g., 'done', 'pending', 'in-progress').

### Remove Task

- **MCP Tool:** `remove_task`
- **CLI Command:** `task-master remove-task [options]`
- **Description:** Permanently remove a task or subtask from the tasks list.
- **Key Options:**
  - `-i, --id <id>`: The ID of the task or subtask to remove.
  - `-y, --yes`: Skip the confirmation prompt and immediately delete the task.

## Task Structure & Breakdown

### Expand Task

- **MCP Tool:** `expand_task`
- **CLI Command:** `task-master expand [options]`
- **Description:** Break down a complex task into smaller, manageable subtasks.
- **Key Options:**
  - `-i, --id <id>`: The ID of the task to break down.
  - `-n, --num <number>`: How many subtasks to create.
  - `-r, --research`: Enable research role for more informed subtask generation.
  - `-p, --prompt <text>`: Provide extra context for generating subtasks.
  - `--force`: Clear existing subtasks before generating new ones.

### Expand All Tasks

- **MCP Tool:** `expand_all`
- **CLI Command:** `task-master expand --all [options]`
- **Description:** Automatically expand all eligible pending/in-progress tasks.
- **Key Options:**
  - `-n, --num <number>`: How many subtasks to create per task.
  - `-r, --research`: Enable research role for more informed subtask generation.
  - `-p, --prompt <text>`: Provide extra context for generating subtasks.
  - `--force`: Clear existing subtasks before generating new ones.

### Clear Subtasks

- **MCP Tool:** `clear_subtasks`
- **CLI Command:** `task-master clear-subtasks [options]`
- **Description:** Remove all subtasks from one or more specified parent tasks.
- **Key Options:**
  - `-i, --id <ids>`: The ID(s) of the parent task(s) whose subtasks to remove.
  - `--all`: Remove subtasks from all parent tasks.

### Remove Subtask

- **MCP Tool:** `remove_subtask`
- **CLI Command:** `task-master remove-subtask [options]`
- **Description:** Remove a subtask from its parent, optionally converting it into a standalone task.
- **Key Options:**
  - `-i, --id <id>`: The ID of the subtask to remove.
  - `-c, --convert`: Turn the subtask into a regular top-level task instead of deleting it.

## Dependency Management

### Add Dependency

- **MCP Tool:** `add_dependency`
- **CLI Command:** `task-master add-dependency [options]`
- **Description:** Define a dependency, making one task a prerequisite for another.
- **Key Options:**
  - `-i, --id <id>`: The ID of the task that will depend on another.
  - `-d, --depends-on <id>`: The ID of the task that must be completed first.

### Remove Dependency

- **MCP Tool:** `remove_dependency`
- **CLI Command:** `task-master remove-dependency [options]`
- **Description:** Remove a dependency relationship between two tasks.
- **Key Options:**
  - `-i, --id <id>`: The ID of the task to remove a prerequisite from.
  - `-d, --depends-on <id>`: The ID of the task that should no longer be a prerequisite.

### Validate Dependencies

- **MCP Tool:** `validate_dependencies`
- **CLI Command:** `task-master validate-dependencies [options]`
- **Description:** Check tasks for dependency issues without making changes.
- **Key Options:**
  - `-f, --file <file>`: Path to your 'tasks.json' file.

### Fix Dependencies

- **MCP Tool:** `fix_dependencies`
- **CLI Command:** `task-master fix-dependencies [options]`
- **Description:** Automatically fix dependency issues in your tasks.
- **Key Options:**
  - `-f, --file <file>`: Path to your 'tasks.json' file.

## Analysis & Reporting

### Analyze Project Complexity

- **MCP Tool:** `analyze_project_complexity`
- **CLI Command:** `task-master analyze-complexity [options]`
- **Description:** Analyze your tasks to determine their complexity and suggest which ones need to be broken down.
- **Key Options:**
  - `-o, --output <file>`: Where to save the complexity analysis report.
  - `-t, --threshold <number>`: The minimum complexity score that should trigger a recommendation to expand a task.
  - `-r, --research`: Enable research role for more accurate complexity analysis.

### View Complexity Report

- **MCP Tool:** `complexity_report`
- **CLI Command:** `task-master complexity-report [options]`
- **Description:** Display the task complexity analysis report in a readable format.
- **Key Options:**
  - `-f, --file <file>`: Path to the complexity report.

## File Management

### Generate Task Files

- **MCP Tool:** `generate`
- **CLI Command:** `task-master generate [options]`
- **Description:** Create or update individual Markdown files for each task.
- **Key Options:**
  - `-o, --output <directory>`: The directory where to save the task files.
  - `-f, --file <file>`: Path to your 'tasks.json' file.

## Environment Variables Configuration

Taskmaster primarily uses the `.taskmasterconfig` file (in project root) for configuration, managed via `task-master models --setup`.

Environment variables are used only for sensitive API keys related to AI providers:

- **API Keys (Required for corresponding provider):**
  - `ANTHROPIC_API_KEY`
  - `PERPLEXITY_API_KEY`
  - `OPENAI_API_KEY`
  - `GOOGLE_API_KEY`
  - `MISTRAL_API_KEY`
  - `AZURE_OPENAI_API_KEY` (Requires `AZURE_OPENAI_ENDPOINT` too)
  - `OPENROUTER_API_KEY`
  - `XAI_API_KEY`
  - `OLLANA_API_KEY` (Requires `OLLAMA_BASE_URL` too)

- **Endpoints (Optional/Provider Specific):**
  - `AZURE_OPENAI_ENDPOINT`
  - `OLLAMA_BASE_URL` (Default: `http://localhost:11434/api`)

Set API keys in your `.env` file (for CLI use) or within the `env` section of your `.cursor/mcp.json` file (for MCP/Cursor integration). All other settings (model choice, max tokens, temperature, log level) are managed in `.taskmasterconfig`.

## Task Structure Fields

Task objects contain these key fields:

- **id**: Unique identifier (e.g., `1`, `1.1`)
- **title**: Brief, descriptive title
- **description**: Concise summary of the task
- **status**: Current state ('pending', 'done', etc.)
- **dependencies**: IDs of prerequisite tasks
- **priority**: Importance level ('high', 'medium', 'low')
- **details**: In-depth implementation instructions
- **testStrategy**: Verification approach
- **subtasks**: List of smaller, more specific tasks

## Workflow Integration

For a detailed guide on incorporating Task Master into your development workflow, see [Development Workflow](workflow.md) which covers:

- Choosing between MCP tools and CLI commands
- Standard development process
- Task complexity analysis
- Task breakdown approach
- Implementation drift handling
- Task status management
- Best practices for efficient collaboration 
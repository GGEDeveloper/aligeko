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
- **Description:** Sets up the basic Taskmaster file structure and configuration in the current directory for a new project.
- **Key Options:**
  - Project name/description/version
  - Skip installation flag
  - Add shell aliases
  - Use default settings without prompts
- **Usage:** Run once at the beginning of a new project to create the Task Master directory structure and configuration files.
- **Important:** After initialization, you must parse a PRD to generate tasks.

### Parse PRD

- **MCP Tool:** `parse_prd`
- **CLI Command:** `task-master parse-prd [file] [options]`
- **Description:** Parses a Product Requirements Document or text file to automatically generate an initial set of tasks.
- **Key Options:**
  - Input file path
  - Output file location
  - Number of top-level tasks to generate
  - Force overwrite of existing tasks
- **Usage:** Bootstraps a project from an existing requirements document, generating structured tasks from text.
- **Notes:** Task Master adheres to specified requirements in the PRD while filling gaps where the PRD isn't fully detailed.

## AI Model Configuration

### Manage Models

- **MCP Tool:** `models`
- **CLI Command:** `task-master models [options]`
- **Description:** View or configure AI model settings for different roles (main, research, fallback).
- **Key Options:**
  - Set specific models for different roles
  - Configure custom Ollama or OpenRouter models
  - List available models
- **Usage:** Run without parameters to view current configuration or with parameters to update settings.
- **Notes:** Configuration is stored in `.taskmasterconfig` in the project root. API keys should be set in `.env` or `.cursor/mcp.json`.

## Task Listing & Viewing

### Get Tasks

- **MCP Tool:** `get_tasks`
- **CLI Command:** `task-master list [options]`
- **Description:** Lists all tasks, optionally filtering by status and showing subtasks.
- **Key Options:**
  - Status filter (e.g., 'pending', 'done')
  - Include subtasks flag
  - Custom tasks file path
- **Usage:** Get an overview of project status, often used at the start of a work session.

### Get Next Task

- **MCP Tool:** `next_task`
- **CLI Command:** `task-master next [options]`
- **Description:** Shows the next available task to work on, based on status and completed dependencies.
- **Key Options:**
  - Custom tasks file path
- **Usage:** Identify what to work on next according to the project plan and dependencies.

### Get Task Details

- **MCP Tool:** `get_task`
- **CLI Command:** `task-master show [id] [options]`
- **Description:** Displays detailed information for a specific task or subtask by ID.
- **Key Options:**
  - Task/subtask ID (e.g., '15' or '15.2')
  - Custom tasks file path
- **Usage:** Understand the full details, implementation notes, and test strategy for a specific task before starting work.

## Task Creation & Modification

### Add Task

- **MCP Tool:** `add_task`
- **CLI Command:** `task-master add-task [options]`
- **Description:** Adds a new task to the project by describing it; AI structures it appropriately.
- **Key Options:**
  - Task description prompt
  - Dependencies
  - Priority level
  - Research flag for more informed task creation
- **Usage:** Quickly add newly identified tasks during development with AI-enhanced details.
- **Important:** Makes AI calls and can take up to a minute to complete.

### Add Subtask

- **MCP Tool:** `add_subtask`
- **CLI Command:** `task-master add-subtask [options]`
- **Description:** Adds a new subtask to a parent task, or converts an existing task into a subtask.
- **Key Options:**
  - Parent task ID
  - Existing task ID (for conversion)
  - Subtask title/description/details
  - Dependencies
  - Status
- **Usage:** Break down tasks manually or reorganize existing tasks into hierarchical structures.

### Update Tasks

- **MCP Tool:** `update`
- **CLI Command:** `task-master update [options]`
- **Description:** Updates multiple upcoming tasks based on new context or changes, starting from a specific task ID.
- **Key Options:**
  - Starting task ID
  - Update description prompt
  - Research flag for more informed updates
- **Usage:** Handle significant implementation changes or pivots that affect multiple future tasks.
- **Important:** Makes AI calls and can take up to a minute to complete.

### Update Task

- **MCP Tool:** `update_task`
- **CLI Command:** `task-master update-task [options]`
- **Description:** Modifies a specific task or subtask, incorporating new information or changes.
- **Key Options:**
  - Task/subtask ID
  - Update description prompt
  - Research flag
- **Usage:** Refine a specific task based on new understanding or feedback.
- **Important:** Makes AI calls and can take up to a minute to complete.

### Update Subtask

- **MCP Tool:** `update_subtask`
- **CLI Command:** `task-master update-subtask [options]`
- **Description:** Appends timestamped notes or details to a specific subtask without overwriting existing content.
- **Key Options:**
  - Subtask ID
  - Information to append
  - Research flag
- **Usage:** Add implementation notes, code snippets, or clarifications to a subtask during development.
- **Important:** Before adding, review existing details to avoid redundancy. Makes AI calls and can take up to a minute to complete.

### Set Task Status

- **MCP Tool:** `set_task_status`
- **CLI Command:** `task-master set-status [options]`
- **Description:** Updates the status of one or more tasks or subtasks.
- **Key Options:**
  - Task/subtask ID(s)
  - New status (e.g., 'done', 'pending', 'in-progress')
- **Usage:** Mark progress as tasks move through the development cycle.

### Remove Task

- **MCP Tool:** `remove_task`
- **CLI Command:** `task-master remove-task [options]`
- **Description:** Permanently removes a task or subtask from the tasks list.
- **Key Options:**
  - Task/subtask ID
  - Skip confirmation flag
- **Usage:** Delete tasks that are no longer needed in the project.
- **Notes:** Use with caution as this operation cannot be undone. Consider using status changes instead of deletion.

## Task Structure & Breakdown

### Expand Task

- **MCP Tool:** `expand_task`
- **CLI Command:** `task-master expand [options]`
- **Description:** Breaks down a complex task into smaller, manageable subtasks using AI.
- **Key Options:**
  - Task ID
  - Number of subtasks to create
  - Research flag for more informed generation
  - Additional context
  - Force replacement of existing subtasks
- **Usage:** Generate a detailed implementation plan for a complex task before starting coding.
- **Important:** Makes AI calls and can take up to a minute to complete.

### Expand All Tasks

- **MCP Tool:** `expand_all`
- **CLI Command:** `task-master expand --all [options]`
- **Description:** Expands all eligible pending/in-progress tasks based on complexity analysis or defaults.
- **Key Options:**
  - Number of subtasks per task
  - Research flag
  - Additional context
  - Force replacement of existing subtasks
- **Usage:** Break down multiple tasks at once after initial task generation or complexity analysis.
- **Important:** Makes AI calls and can take up to a minute to complete.

### Clear Subtasks

- **MCP Tool:** `clear_subtasks`
- **CLI Command:** `task-master clear-subtasks [options]`
- **Description:** Removes all subtasks from specified parent tasks.
- **Key Options:**
  - Parent task ID(s)
  - All tasks flag
- **Usage:** Clear subtasks before regenerating with expand_task if a complete replacement is needed.

### Remove Subtask

- **MCP Tool:** `remove_subtask`
- **CLI Command:** `task-master remove-subtask [options]`
- **Description:** Removes a subtask from its parent, optionally converting it to a standalone task.
- **Key Options:**
  - Subtask ID
  - Convert to standalone task flag
  - Skip file regeneration flag
- **Usage:** Delete unnecessary subtasks or promote a subtask to a top-level task.

## Dependency Management

### Add Dependency

- **MCP Tool:** `add_dependency`
- **CLI Command:** `task-master add-dependency [options]`
- **Description:** Defines a dependency, making one task a prerequisite for another.
- **Key Options:**
  - Task ID
  - Dependency task ID
- **Usage:** Establish the correct order of execution between tasks.

### Remove Dependency

- **MCP Tool:** `remove_dependency`
- **CLI Command:** `task-master remove-dependency [options]`
- **Description:** Removes a dependency relationship between two tasks.
- **Key Options:**
  - Task ID
  - Dependency task ID
- **Usage:** Update task relationships when the order of execution changes.

### Validate Dependencies

- **MCP Tool:** `validate_dependencies`
- **CLI Command:** `task-master validate-dependencies [options]`
- **Description:** Checks tasks for dependency issues (like circular references) without making changes.
- **Key Options:**
  - Tasks file path
- **Usage:** Audit the integrity of task dependencies.

### Fix Dependencies

- **MCP Tool:** `fix_dependencies`
- **CLI Command:** `task-master fix-dependencies [options]`
- **Description:** Automatically fixes dependency issues in tasks.
- **Key Options:**
  - Tasks file path
- **Usage:** Clean up dependency errors automatically.

## Analysis & Reporting

### Analyze Project Complexity

- **MCP Tool:** `analyze_project_complexity`
- **CLI Command:** `task-master analyze-complexity [options]`
- **Description:** Analyzes tasks to determine their complexity and suggest breakdown needs.
- **Key Options:**
  - Output file path
  - Complexity threshold
  - Research flag
- **Usage:** Run before breaking down tasks to identify which ones need the most attention.
- **Important:** Makes AI calls and can take up to a minute to complete.

### View Complexity Report

- **MCP Tool:** `complexity_report`
- **CLI Command:** `task-master complexity-report [options]`
- **Description:** Displays the task complexity analysis report in a readable format.
- **Key Options:**
  - Report file path
- **Usage:** Review complexity analysis results after running analyze-complexity.

## File Management

### Generate Task Files

- **MCP Tool:** `generate`
- **CLI Command:** `task-master generate [options]`
- **Description:** Creates or updates individual Markdown files for each task based on tasks.json.
- **Key Options:**
  - Output directory
  - Tasks file path
- **Usage:** Run after making changes to tasks.json to keep individual task files up to date.

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

## Environment Variables Configuration

Taskmaster uses two main configuration mechanisms:

1. **`.taskmasterconfig` File**:
   - Stores most configuration settings (models, parameters, logging level, etc.)
   - Managed via `task-master models` command
   - Located in project root directory

2. **Environment Variables**:
   - Only for sensitive API keys and specific endpoints
   - In `.env` file (for CLI) or `.cursor/mcp.json` (for MCP)
   - Examples: `ANTHROPIC_API_KEY`, `PERPLEXITY_API_KEY`, etc.

## Workflow Integration

For a detailed guide on incorporating Task Master into your development workflow, see [Development Workflow](workflow.md) which covers:

- Choosing between MCP tools and CLI commands
- Standard development process
- Task complexity analysis
- Task breakdown approach
- Implementation drift handling
- Task status management
- Best practices for efficient collaboration 
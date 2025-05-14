# Task Master Development Workflow

This guide outlines the standard process for using Task Master to manage software development projects in the AliTools B2B E-commerce platform.

## Primary Interaction Methods

Task Master offers two primary ways to interact:

1. **MCP Server (Recommended for Integrated Tools)**:
   - For AI agents and integrated development environments (like Cursor), the **MCP server is the preferred method**.
   - Offers better performance, structured data exchange, and richer error handling.
   - Exposes Task Master functionality through a set of tools (e.g., `get_tasks`, `add_subtask`).
   - **Restart the MCP server** if core logic in `scripts/modules` or MCP tool definitions change.

2. **`task-master` CLI (For Users & Fallback)**:
   - Provides a user-friendly interface for direct terminal interaction.
   - Serves as a fallback if the MCP server is inaccessible.
   - Install globally with `npm install -g task-master-ai` or use locally via `npx task-master-ai ...`.
   - CLI commands often mirror the MCP tools (e.g., `task-master list` corresponds to `get_tasks`).

## Standard Development Workflow

1. **Project Initialization**:
   - Start new projects with `initialize_project` tool / `task-master init`
   - Or generate tasks from requirements with `parse_prd` / `task-master parse-prd --input='<prd-file.txt>'`

2. **Task Overview & Selection**:
   - Begin coding sessions with `get_tasks` / `task-master list` to see current tasks
   - Determine the next task with `next_task` / `task-master next`
   - Select tasks based on dependencies, priority level, and ID order

3. **Task Complexity Analysis**:
   - Analyze task complexity with `analyze_project_complexity` / `task-master analyze-complexity --research`
   - Review complexity report using `complexity_report` / `task-master complexity-report`
   - Focus on tasks with highest complexity scores (8-10) for detailed breakdown

4. **Task Breakdown**:
   - Break down complex tasks using `expand_task` / `task-master expand --id=<id> --force --research`
   - Use `--force` to replace existing subtasks, `--research` for better subtask generation
   - Clear existing subtasks if needed using `clear_subtasks` / `task-master clear-subtasks --id=<id>`

5. **Implementation**:
   - View specific task details using `get_task` / `task-master show <id>`
   - Implement code following task details, dependencies, and project standards
   - Verify tasks according to test strategies before marking as complete

6. **Status Management**:
   - Mark completed tasks with `set_task_status` / `task-master set-status --id=<id> --status=done`
   - Use 'pending' for tasks ready to be worked on
   - Use 'done' for completed and verified tasks
   - Use 'deferred' for postponed tasks
   - Add custom status values as needed

7. **Task Updates**:
   - Update dependent tasks when implementation differs using `update` / `task-master update --from=<id> --prompt="..."`
   - Update a single task with `update_task` / `task-master update-task --id=<id> --prompt="..."`
   - Add new tasks discovered during implementation using `add_task` / `task-master add-task --prompt="..." --research`
   - Add new subtasks with `add_subtask` / `task-master add-subtask --parent=<id> --title="..."`
   - Append notes to subtasks using `update_subtask` / `task-master update-subtask --id=<subtaskId> --prompt='....'`

8. **Dependency Management**:
   - Add dependencies with `add_dependency` / `task-master add-dependency --id=<id> --depends-on=<id>`
   - Remove dependencies with `remove_dependency` / `task-master remove-dependency --id=<id> --depends-on=<id>`
   - Check for dependency issues with `validate_dependencies` / `task-master validate-dependencies`
   - Fix dependency problems with `fix_dependencies` / `task-master fix-dependencies`

9. **File Management**:
   - Generate task files with `generate` / `task-master generate` after updating tasks.json

## Iterative Subtask Implementation

Once a task has been broken down into subtasks, follow this iterative process:

1. **Understand the Goal**:
   - Use `get_task` / `task-master show <subtaskId>` to understand requirements

2. **Initial Exploration & Planning**:
   - Explore the codebase to identify files, functions, and lines of code needing modification
   - Determine intended code changes and their locations
   - Gather all relevant details from this exploration phase

3. **Log the Plan**:
   - Run `update_subtask` / `task-master update-subtask --id=<subtaskId> --prompt='<detailed plan>'`
   - Include complete findings: file paths, line numbers, proposed diffs, reasoning, and challenges
   - Create a rich, timestamped log within the subtask's `details`

4. **Verify the Plan**:
   - Run `get_task` / `task-master show <subtaskId>` to confirm the update

5. **Begin Implementation**:
   - Set status to in-progress: `set_task_status` / `task-master set-status --id=<subtaskId> --status=in-progress`
   - Start coding based on the logged plan

6. **Refine and Log Progress**:
   - Review existing details before adding new information
   - Regularly update using `update_subtask` / `task-master update-subtask --id=<subtaskId> --prompt='<update details>'`
   - Log what worked, what didn't, specific code snippets, decisions, and deviations from the plan
   - Continuously enrich the subtask's details to create a log of the implementation journey

7. **Review & Update Rules**:
   - Review code changes and relevant chat history
   - Identify new patterns, conventions, or best practices
   - Create or update rules following internal guidelines

8. **Mark Task Complete**:
   - Verify implementation and update necessary rules
   - `set_task_status` / `task-master set-status --id=<subtaskId> --status=done`

9. **Commit Changes**:
   - Stage code changes and updated/new rule files
   - Craft a comprehensive commit message
   - Consider if a Changeset is needed according to versioning guidelines

10. **Proceed to Next Subtask**:
    - Identify the next subtask using `next_task` / `task-master next`

## Configuration Management

Taskmaster configuration is managed through:

1. **`.taskmasterconfig` File (Primary)**:
   - Located in the project root directory
   - Stores most configuration settings: AI models, parameters, logging level, etc.
   - Managed via `task-master models --setup` command
   - View/set specific models via `task-master models` or `models` MCP tool

2. **Environment Variables**:
   - Used **only** for sensitive API keys and specific endpoint URLs
   - Place API keys in `.env` file for CLI usage
   - For MCP/Cursor integration, configure keys in `.cursor/mcp.json`

**Important Notes**:
- Non-API key settings are configured via `.taskmasterconfig`, not environment variables
- If AI commands fail in MCP, verify API keys in `.cursor/mcp.json`
- If AI commands fail in CLI, verify API keys in `.env` file

## Determining the Next Task

The `next_task` / `task-master next` command:
- Identifies tasks with all dependencies satisfied
- Prioritizes by priority level, dependency count, and ID
- Shows comprehensive task information
- Respects your project's dependency structure
- Ensures tasks are completed in the appropriate sequence
- Provides ready-to-use commands for common task actions

## Best Practices

- Start sessions with `get_tasks` and `next_task` to understand status
- Use `analyze_project_complexity` for larger tasks before breaking them down
- Always update task status as you work
- Add detailed notes via `update_subtask` during implementation
- Respect dependency chains and task priorities
- Use research flag for AI-powered commands when insights are needed
- Generate task files after significant changes to tasks.json
- Review complexity reports before expanding multiple tasks
- Document implementation decisions in subtask details

This workflow provides a general guideline. Adapt it based on specific project needs and team practices.

## Development Environment Setup

Before starting development, ensure your development environment is properly set up:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-org/alitools-b2b.git
   cd alitools-b2b
   ```

2. **Install Dependencies**
   ```bash
   npm install
   cd client
   npm install
   cd ..
   cd server
   npm install
   cd ..
   ```

3. **Set Up Environment Variables**
   - Copy `.env.example` to `.env` in the root directory
   - Update the values according to your local environment
   - Ensure database connection details are correct

4. **Initialize Database**
   ```bash
   cd server
   npm run db:migrate
   npm run db:seed
   cd ..
   ```

## Development Workflow

### 1. Task Management

We use TaskMaster for managing tasks. Before starting work:

1. **View Available Tasks**
   ```bash
   npx task-master list
   ```

2. **Determine Next Task**
   ```bash
   npx task-master next
   ```

3. **Start a Task**
   ```bash
   npx task-master set-status --id=<task_id> --status=in-progress
   ```

### 2. Branching Strategy

Follow these branching conventions:

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/<task-id>-short-description
   ```

2. **Create a Bugfix Branch**
   ```bash
   git checkout -b bugfix/<issue-id>-short-description
   ```

3. **Create a Hotfix Branch**
   ```bash
   git checkout -b hotfix/<issue-id>-short-description
   ```

### 3. Development Cycle

1. **Start the Development Server**
   ```bash
   # Start both client and server
   npm run dev
   
   # Or start individually
   npm run dev:client
   npm run dev:server
   ```

2. **Make Changes**
   - Follow the code standards in [docs/development/standards.md](./standards.md)
   - Ensure proper test coverage

3. **Run Tests**
   ```bash
   # Run all tests
   npm test
   
   # Run specific tests
   npm test -- --testPathPattern=path/to/test
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat(scope): Brief description of change"
   ```
   
   Follow conventional commit format:
   - `feat`: New feature
   - `fix`: Bug fix
   - `docs`: Documentation changes
   - `style`: Formatting changes
   - `refactor`: Code refactoring
   - `test`: Adding or fixing tests
   - `chore`: Maintenance tasks

5. **Push Changes**
   ```bash
   git push origin <branch-name>
   ```

### 4. Code Review Process

1. **Create a Pull Request**
   - Create a pull request on GitHub
   - Reference the task/issue in the description
   - Fill out the PR template

2. **Code Review**
   - At least one team member must review and approve
   - Address all comments and suggestions
   - Ensure CI checks pass

3. **Merge**
   - Merge using squash and merge
   - Delete the branch after merging

### 5. Deployment

1. **Development Environment**
   - Automatic deployment on merge to `develop` branch

2. **Staging Environment**
   - Manual deployment from `staging` branch
   - Verify all features work as expected

3. **Production Environment**
   - Manual deployment from `main` branch
   - Requires approval from project manager

## Debugging

For debugging tips and tools, see [docs/development/debugging.md](./debugging.md).

## Performance Considerations

- Review [docs/development/performance.md](./performance.md) for performance best practices
- Use React DevTools for component profiling
- Consider network performance when making API calls

## Additional Resources

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Express Documentation](https://expressjs.com/)
- [Sequelize Documentation](https://sequelize.org/master/) 
# Linear MCP Server

Agent-first MCP server for Linear API with human-friendly features.

## Setup

```bash
npm install
```

## Configuration

Set environment variable:
```bash
export LINEAR_API_KEY="your-linear-api-key"
```

Get your API key from: https://linear.app/settings/api

## Run

```bash
npm run dev
```

## MCP Config

Add to your MCP config (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "linear": {
      "command": "node",
      "args": ["/Users/Shared/Mantaray/projects/launch-tracker/mcp/dist/index.js"],
      "env": {
        "LINEAR_API_KEY": "your-key-here"
      }
    }
  }
}
```

## Tools

### Team & People
- `linear_get_team_status` - Overview of all team members and their workloads
- `linear_get_member_workload` - Detailed workload for a specific member

### Issues
- `linear_list_issues` - List issues with filters
- `linear_get_issue` - Get full issue details
- `linear_create_issue` - Create a new issue
- `linear_update_issue` - Update an issue

### Projects
- `linear_list_projects` - List all projects with progress
- `linear_get_project_health` - Get project health metrics

### Human-Friendly Features
- `linear_daily_standup` - Generate standup report for a member
- `linear_weekly_summary` - Weekly summary of activity
- `linear_find_blockers` - Find all blocking issues
- `linear_suggest_assignee` - Suggest best assignee based on workload

## Resources

- `linear://projects` - All projects
- `linear://users` - All users
- `linear://project/{id}` - Specific project
- `linear://user/{id}` - Specific user

## Example Usage

Ask your AI agent:
- "What's the team status?"
- "Generate a daily standup for Kareem"
- "Find all blockers in the Plato project"
- "Suggest an assignee for a high-priority bug"
- "What's the health of the ERP project?"

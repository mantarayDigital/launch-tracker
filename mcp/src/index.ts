import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { LinearClient } from '@linear/sdk';
import { format, subDays } from 'date-fns';

const linear = new LinearClient({
  apiKey: process.env.LINEAR_API_KEY || '',
});

const server = new Server(
  { name: 'linear-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

const tools = [
  { name: 'linear_list_teams', description: 'List all teams', inputSchema: { type: 'object', properties: {} } },
  { name: 'linear_list_projects', description: 'List all projects', inputSchema: { type: 'object', properties: {} } },
  { name: 'linear_list_users', description: 'List all users', inputSchema: { type: 'object', properties: {} } },
  { name: 'linear_list_issues', description: 'List issues (optional filters: teamId, projectId, assigneeId, status)', inputSchema: { type: 'object', properties: { teamId: { type: 'string' }, projectId: { type: 'string' }, assigneeId: { type: 'string' }, limit: { type: 'number' } } } },
  { name: 'linear_get_issue', description: 'Get issue details by ID', inputSchema: { type: 'object', properties: { issueId: { type: 'string' } }, required: ['issueId'] } },
  { name: 'linear_create_issue', description: 'Create an issue', inputSchema: { type: 'object', properties: { title: { type: 'string' }, teamId: { type: 'string' }, description: { type: 'string' }, projectId: { type: 'string' }, assigneeId: { type: 'string' }, priority: { type: 'number' } }, required: ['title', 'teamId'] } },
  { name: 'linear_update_issue_status', description: 'Update issue status', inputSchema: { type: 'object', properties: { issueId: { type: 'string' }, statusName: { type: 'string' } }, required: ['issueId', 'statusName'] } },
  { name: 'linear_daily_standup', description: 'Generate daily standup for a user', inputSchema: { type: 'object', properties: { userId: { type: 'string' } }, required: ['userId'] } },
  { name: 'linear_find_blockers', description: 'Find blocked issues', inputSchema: { type: 'object', properties: { projectId: { type: 'string' } } } },
  { name: 'linear_project_health', description: 'Get project health metrics', inputSchema: { type: 'object', properties: { projectId: { type: 'string' } }, required: ['projectId'] } },
];

async function handleToolCall(name: string, args: Record<string, any>): Promise<string> {
  try {
    switch (name) {
      case 'linear_list_teams': {
        const teams = await linear.teams();
        let result = '# Teams\n\n';
        for (const team of teams.nodes) {
          result += `- **${team.name}** (${team.id})\n`;
        }
        return result;
      }

      case 'linear_list_projects': {
        const projects = await linear.projects();
        let result = '# Projects\n\n';
        for (const project of projects.nodes) {
          result += `- **${project.name}** (${project.id})\n`;
          result += `  Status: ${project.status || 'Active'}\n`;
        }
        return result;
      }

      case 'linear_list_users': {
        const users = await linear.users();
        let result = '# Users\n\n';
        for (const user of users.nodes) {
          result += `- **${user.displayName || user.name}** (${user.id})\n`;
        }
        return result;
      }

      case 'linear_list_issues': {
        const { teamId, projectId, assigneeId, limit = 20 } = args;
        const filter: any = {};
        if (teamId) filter.team = { id: { eq: teamId } };
        if (projectId) filter.project = { id: { eq: projectId } };
        if (assigneeId) filter.assignee = { id: { eq: assigneeId } };

        const issues = await linear.issues({ filter, first: limit });
        let result = `# Issues (${issues.nodes.length})\n\n`;
        
        for (const issue of issues.nodes) {
          const state = await issue.state;
          const assignee = await issue.assignee;
          result += `- **${issue.identifier}**: ${issue.title}\n`;
          result += `  Status: ${state?.name || 'Unknown'}\n`;
          result += `  Assignee: ${assignee?.displayName || assignee?.name || 'Unassigned'}\n`;
          result += `  Priority: ${issue.priority || 'None'}\n\n`;
        }
        return result;
      }

      case 'linear_get_issue': {
        const { issueId } = args;
        const issue = await linear.issue(issueId);
        if (!issue) return `Issue ${issueId} not found`;

        const state = await issue.state;
        const assignee = await issue.assignee;
        const project = await issue.project;
        const labels = await issue.labels();

        let result = `# ${issue.identifier}: ${issue.title}\n\n`;
        result += `- **Status**: ${state?.name}\n`;
        result += `- **Priority**: ${issue.priority}\n`;
        result += `- **Assignee**: ${assignee?.displayName || assignee?.name || 'Unassigned'}\n`;
        result += `- **Project**: ${project?.name || 'None'}\n`;
        result += `- **Labels**: ${labels.nodes.map(l => l.name).join(', ') || 'None'}\n\n`;
        result += `## Description\n${issue.description || 'No description'}\n`;
        return result;
      }

      case 'linear_create_issue': {
        const { title, teamId, description, projectId, assigneeId, priority } = args;
        const issue = await linear.createIssue({
          title,
          teamId,
          description: description || '',
          projectId,
          assigneeId,
          priority,
        });
        const created = await issue.issue;
        return `Created issue ${created?.identifier}: ${created?.title}`;
      }

      case 'linear_update_issue_status': {
        const { issueId, statusName } = args;
        const issue = await linear.issue(issueId);
        if (!issue) return `Issue ${issueId} not found`;

        const team = await issue.team;
        const states = await linear.workflowStates({ filter: { team: { id: { eq: team?.id } } } });
        const state = states.nodes.find(s => s.name.toLowerCase() === statusName.toLowerCase());
        
        if (!state) return `Status "${statusName}" not found`;
        
        await linear.updateIssue(issue.id, { stateId: state.id });
        return `Updated ${issueId} to ${statusName}`;
      }

      case 'linear_daily_standup': {
        const { userId } = args;
        const user = await linear.user(userId);
        
        const completed = await linear.issues({
          filter: {
            assignee: { id: { eq: userId } },
            completedAt: { gte: subDays(new Date(), 1).toISOString() },
          },
        });

        const inProgress = await linear.issues({
          filter: {
            assignee: { id: { eq: userId } },
            state: { name: { eq: 'In Progress' } },
          },
        });

        let result = `# Daily Standup: ${user?.displayName || user?.name}\n\n`;
        result += `## Completed Yesterday (${completed.nodes.length})\n`;
        for (const i of completed.nodes) {
          result += `- ${i.identifier}: ${i.title}\n`;
        }
        result += `\n## Working On (${inProgress.nodes.length})\n`;
        for (const i of inProgress.nodes) {
          result += `- ${i.identifier}: ${i.title}\n`;
        }
        return result;
      }

      case 'linear_find_blockers': {
        const { projectId } = args;
        const filter: any = {
          labels: { some: { name: { eq: 'Blocked' } } },
        };
        if (projectId) filter.project = { id: { eq: projectId } };

        const blockers = await linear.issues({ filter });
        let result = `# Blockers (${blockers.nodes.length})\n\n`;
        for (const b of blockers.nodes) {
          result += `- **${b.identifier}**: ${b.title}\n`;
        }
        return result;
      }

      case 'linear_project_health': {
        const { projectId } = args;
        const project = await linear.project(projectId);
        if (!project) return `Project ${projectId} not found`;

        const issues = await linear.issues({ filter: { project: { id: { eq: projectId } } } });
        const total = issues.nodes.length;
        const done = issues.nodes.filter(i => i.completedAt).length;
        
        let result = `# Project Health: ${project.name}\n\n`;
        result += `- **Total Issues**: ${total}\n`;
        result += `- **Completed**: ${done}\n`;
        result += `- **Progress**: ${total > 0 ? Math.round((done / total) * 100) : 0}%\n`;
        return result;
      }

      default:
        return `Unknown tool: ${name}`;
    }
  } catch (error: any) {
    return `Error: ${error.message}`;
  }
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const result = await handleToolCall(name, args || {});
  return { content: [{ type: 'text', text: result }] };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Linear MCP server running');
}

main().catch(console.error);

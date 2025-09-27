/**
 * @file mcpServer.js
 * @description A minimal MCP-compatible control server for DigitalOcean MCP workflows.
 * This server provides lightweight endpoints used by `@digitalocean/mcp` or other automation tools.
 * It is designed with a security-first principle, defaulting to a "simulate" mode where it
 * reports the command that would be run without actually executing it.
 * Real execution must be explicitly enabled via an environment variable.
 */

const express = require('express');
const { exec } = require('child_process');

const router = express.Router();

// --- Configuration from Environment Variables ---
/**
 * @description The secret token used to authenticate incoming MCP requests.
 * Can be sourced from `DIGITALOCEAN_API_TOKEN` for compatibility or `MCP_SECRET`.
 * @type {string|null}
 */
const DO_TOKEN = process.env.DIGITALOCEAN_API_TOKEN || process.env.MCP_SECRET || null;
/**
 * @description Security flag to enable real command execution.
 * Must be set to 'true' to allow the server to execute system commands.
 * @type {boolean}
 */
const ALLOW_EXEC = process.env.MCP_ALLOW_EXEC === 'true';
/**
 * @description Security flag to disable authentication, useful for local development.
 * @type {boolean}
 */
const ALLOW_UNAUTH = process.env.MCP_ALLOW_UNAUTH === 'true';

/**
 * Middleware to authenticate requests from an MCP client.
 * It checks for a Bearer token in the 'Authorization' header or a token in the 'x-mcp-token' header.
 * Authentication is skipped if `ALLOW_UNAUTH` is true or if no `DO_TOKEN` is configured.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 */
function authenticateMCP(req, res, next) {
  // Prefer Authorization: Bearer <token>
  const auth = req.headers['authorization'];
  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    const token = auth.slice(7).trim();
    if (DO_TOKEN && token === DO_TOKEN) return next();
  }

  // Also allow header x-mcp-token for convenience
  const headerToken = req.headers['x-mcp-token'];
  if (headerToken && DO_TOKEN && headerToken === DO_TOKEN) return next();

  // For local development or if no token is set, allow unauthenticated access
  if (ALLOW_UNAUTH || !DO_TOKEN) {
    console.warn('[MCP] Unauthenticated request allowed (development mode)');
    return next();
  }

  res.status(401).json({ error: 'Unauthorized: missing or invalid MCP token' });
}

/**
 * @route GET /health
 * @description A simple health check endpoint to verify that the service is running.
 * Useful for load balancers or uptime monitoring.
 * @returns {object} 200 - A JSON object with the service status and timestamp.
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'mcp', timestamp: Date.now() });
});

/**
 * @route GET /services
 * @description Lists the services supported by this MCP server.
 * This implementation supports a minimal 'apps' service for DigitalOcean App Platform commands.
 * @returns {object} 200 - A JSON object containing an array of supported service names.
 */
router.get('/services', authenticateMCP, (req, res) => {
  res.json({ services: ['apps'] });
});

/**
 * @route POST /execute
 * @description The main endpoint for executing MCP commands. It parses the request body,
 * constructs the appropriate `doctl` command, and either simulates or executes it based on the `ALLOW_EXEC` flag.
 * @param {object} req.body - The request body.
 * @param {string} req.body.service - The service to target (e.g., 'apps').
 * @param {string} req.body.command - The command to execute (e.g., 'create', 'deploy').
 * @param {object} [req.body.args] - Optional arguments for the command.
 * @returns {object} 200 - A JSON object with the result of the command (simulated or executed).
 * @returns {object} 400 - If required fields are missing or the command is unsupported.
 * @returns {object} 500 - If an internal server error occurs during command execution.
 */
router.post('/execute', authenticateMCP, async (req, res) => {
  try {
    const { service, command, args } = req.body || {};

    if (!service || !command) {
      return res.status(400).json({ error: 'Missing required fields: service and command' });
    }

    // This variable will hold the command string to be executed or simulated.
    let cmd = null;

    // --- Command Builder Logic ---
    if (service === 'apps') {
      // Supports 'create', 'deploy', and 'list' commands for the 'apps' service.
      if (command === 'create') {
        const spec = args && args.specPath ? args.specPath : 'digitalocean.app.yaml';
        cmd = `doctl apps create --spec ${spec}`;
      } else if (command === 'deploy') {
        // 'deploy' can be an update to an existing app or a creation from a spec.
        if (args && args.appId) {
          const spec = args.specPath ? `--spec ${args.specPath}` : '';
          cmd = `doctl apps update ${args.appId} ${spec}`;
        } else if (args && args.specPath) {
          cmd = `doctl apps create --spec ${args.specPath}`;
        } else {
          return res.status(400).json({ error: 'deploy requires args.appId or args.specPath' });
        }
      } else if (command === 'list') {
        cmd = `doctl apps list`;
      } else {
        return res.status(400).json({ error: `Unsupported apps command: ${command}` });
      }
    } else {
      return res.status(400).json({ error: `Unsupported service: ${service}` });
    }

    // If execution is disabled, return a simulation of the command.
    if (!ALLOW_EXEC) {
      return res.json({ simulated: true, cmd });
    }

    // If execution is enabled, run the command and stream the output.
    exec(cmd, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        console.error('[MCP] Command execution error:', err);
        return res.status(500).json({ executed: true, cmd, error: err.message, stderr });
      }
      res.json({ executed: true, cmd, stdout, stderr });
    });
  } catch (error) {
    console.error('[MCP] /execute error:', error);
    res.status(500).json({ error: 'Internal MCP server error' });
  }
});

module.exports = router;

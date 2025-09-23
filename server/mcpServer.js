// Minimal MCP-compatible control server for DigitalOcean MCP workflows
// This provides lightweight endpoints used by `@digitalocean/mcp` or other automation
// It intentionally defaults to "simulate" mode; set MCP_ALLOW_EXEC=true to permit real commands.

const express = require('express');
const { exec } = require('child_process');

const router = express.Router();

// Configuration via environment variables:
// - DIGITALOCEAN_API_TOKEN: (optional) the DO token used by the MCP client; should NOT be committed
// - MCP_SECRET: (optional) a secret token to authenticate incoming MCP requests
// - MCP_ALLOW_EXEC: set to 'true' to allow execution of system commands (dangerous, use with care)
// - MCP_ALLOW_UNAUTH: set to 'true' to allow unauthenticated access for local development

const DO_TOKEN = process.env.DIGITALOCEAN_API_TOKEN || process.env.MCP_SECRET || null;
const ALLOW_EXEC = process.env.MCP_ALLOW_EXEC === 'true';
const ALLOW_UNAUTH = process.env.MCP_ALLOW_UNAUTH === 'true';

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

  if (ALLOW_UNAUTH || !DO_TOKEN) {
    console.warn('[MCP] Unauthenticated request allowed (development mode)');
    return next();
  }

  res.status(401).json({ error: 'Unauthorized: missing or invalid MCP token' });
}

// Simple health endpoint for load checks
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'mcp', timestamp: Date.now() });
});

// List supported services (this server currently supports a minimal 'apps' service)
router.get('/services', authenticateMCP, (req, res) => {
  res.json({ services: ['apps'] });
});

// Execute a MCP command. Body should include: { service: string, command: string, args?: object }
router.post('/execute', authenticateMCP, async (req, res) => {
  try {
    const { service, command, args } = req.body || {};

    if (!service || !command) {
      return res.status(400).json({ error: 'Missing required fields: service and command' });
    }

    // Build a simulated command string so we can show what would be executed
    let cmd = null;

    if (service === 'apps') {
      // Support two example commands: 'create' and 'deploy'
      if (command === 'create') {
        const spec = args && args.specPath ? args.specPath : 'digitalocean.app.yaml';
        cmd = `doctl apps create --spec ${spec}`;
      } else if (command === 'deploy') {
        // For deploy we accept either an app id or a spec path
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

    // If execution is not allowed, return a simulated result and the command string
    if (!ALLOW_EXEC) {
      return res.json({ simulated: true, cmd });
    }

    // Run the command and stream the output
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

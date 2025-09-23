# Model Context Protocol (MCP) integration for Apophenia

This document describes the minimal MCP-compatible control endpoints added to Apophenia and how to use them during development and deployment.

## Overview

The project includes a lightweight MCP server implementation at `server/mcpServer.js`. It provides a minimal set of endpoints to support control workflows from `@digitalocean/mcp` or local automation scripts.

## Endpoints

- GET /mcp/health
  - Returns a simple health JSON: { status: 'ok', service: 'mcp', timestamp }
- GET /mcp/services
  - Returns supported services. Currently: { services: ['apps'] }
- POST /mcp/execute
  - Body: { service: string, command: string, args?: object }
  - Supported commands for service='apps': 'create', 'deploy', 'list'
  - By default, execution is simulated and returns the command string. Enable real execution by setting MCP_ALLOW_EXEC=true (use with caution).

## Security

- The server supports simple bearer token authentication via `Authorization: Bearer <token>` or `x-mcp-token` header.
- Set token via `DIGITALOCEAN_API_TOKEN` environment variable or `MCP_SECRET`.
- For local development, set `MCP_ALLOW_UNAUTH=true` to allow unauthenticated requests.

## Usage Examples

Simulate a deployment using the spec file:

curl -X POST http://localhost:3001/mcp/execute \
  -H 'Content-Type: application/json' \
  -d '{"service":"apps","command":"deploy","args":{"specPath":"digitalocean.app.yaml"}}'

Enable real execution (careful):

export MCP_ALLOW_EXEC=true
export DIGITALOCEAN_API_TOKEN=your_token

curl -X POST http://localhost:3001/mcp/execute \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $DIGITALOCEAN_API_TOKEN" \
  -d '{"service":"apps","command":"deploy","args":{"specPath":"digitalocean.app.yaml"}}'

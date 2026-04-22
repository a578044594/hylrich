import * as http from 'http';
import { HylrichCore } from '../core/HylrichCore';

function main() {
  const core = new HylrichCore();
  const port = 8090;
  const host = '0.0.0.0';

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    
    if (req.method === 'GET' && url.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
      return;
    }

    if (req.method === 'GET' && url.pathname === '/status') {
      try {
        const status = core.getStatus();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(status));
      } catch (err: any) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', error: err.message }));
      }
      return;
    }

    if (req.method === 'GET' && url.pathname === '/agents') {
      try {
        const agents = core.listAgents();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(agents));
      } catch (err: any) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', error: err.message }));
      }
      return;
    }

    if (req.method === 'POST' && url.pathname === '/agents') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const config = JSON.parse(body);
          if (!config.name) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Agent name required' }));
            return;
          }
          const agent = await core.createAgent(config);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(agent));
        } catch (err: any) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/tool') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const { tool, input } = JSON.parse(body);
          if (!tool) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Missing tool name' }));
            return;
          }
          const result = await core.executeTool(tool, input);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        } catch (err: any) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/chat') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const { agentId, message, sessionId } = JSON.parse(body);
          if (!agentId || !message) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'agentId and message required' }));
            return;
          }
          const result = await core.chat(agentId, message, sessionId);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        } catch (err: any) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  });

  server.listen(port, host, () => {
    console.log(`🚀 Hylrich Server listening on http://${host}:${port}`);
    console.log(`Health: http://localhost:${port}/health`);
    console.log(`Status: http://localhost:${port}/status`);
    console.log(`Agents: GET/POST /agents`);
    console.log(`Chat: POST /chat`);
    console.log(`Tool: POST /tool`);
  });
}

main();

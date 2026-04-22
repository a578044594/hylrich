"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const http = __importStar(require("http"));
const HylrichCore_1 = require("../core/HylrichCore");
function main() {
    const core = new HylrichCore_1.HylrichCore();
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
            }
            catch (err) {
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
            }
            catch (err) {
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
                }
                catch (err) {
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
                }
                catch (err) {
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
                }
                catch (err) {
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
//# sourceMappingURL=server.js.map
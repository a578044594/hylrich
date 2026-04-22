import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { WebSocket, WebSocketServer } from 'ws';
import { AgentSystem } from '../services/AgentSystem';
import { HylrichCore } from '../core/HylrichCore';

const app = express();
const HTTP_PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;
const WS_PORT = process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 8082; // 改为8082

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

let agentSystem: AgentSystem | null = null;
let httpServer: any = null;
let wss: WebSocketServer | null = null;

async function startServer() {
  console.log("🔍 环境变量检查:");
  console.log("  OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "SET" : "NOT SET");
  console.log("  OPENAI_BASE_URL:", process.env.OPENAI_BASE_URL || "default");
  console.log("  LLM_MODEL:", process.env.LLM_MODEL || "default");
  try {
    console.log('🚀 启动Agent系统...');
    
    agentSystem = new AgentSystem();
    
    // 启动Agent系统（内部会启动gRPC和WebSocket总线）
    try {
      await agentSystem.start();
    } catch (err) {
      console.warn('⚠️ AgentSystem部分组件启动失败，系统将继续以有限功能运行:', err);
    }
    
    console.log('✅ Agent系统启动完成');

    // HTTP 服务
    app.get('/health', (req: Request, res: Response) => {
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        agentSystem: agentSystem ? 'running' : 'stopped'
      });
    });

    app.get('/status', (req: Request, res: Response) => {
      const status = agentSystem?.getStatus() || { error: 'AgentSystem未启动' };
      res.json({
        ...status,
        uptime: process.uptime(),
        httpPort: HTTP_PORT,
        wsPort: WS_PORT
      });
    });

    app.post('/chat', async (req: Request, res: Response) => {
      const { prompt, message } = req.body;
      const text = prompt || message;
      if (!text) {
        res.status(400).json({ error: 'message required' });
        return;
      }

      try {
        const core = new HylrichCore();
        const result = await core.processMessage(text);
        res.json(result);
      } catch (error: any) {
        console.error('Chat error:', error);
        res.status(500).json({ error: error.message });
      }
    });

    app.post('/tool', async (req: Request, res: Response) => {
      const { toolName, input } = req.body;
      if (!toolName) {
        res.status(400).json({ error: 'toolName required' });
        return;
      }

      try {
        if (!agentSystem) {
          res.status(503).json({ error: 'AgentSystem未启动' });
          return;
        }
        const result = await agentSystem.executeTool(toolName, input);
        res.json({ result });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    httpServer = app.listen(HTTP_PORT, () => {
      console.log(`🚀 Hylrich Server listening on port ${HTTP_PORT}`);
    });

    // 独立的WebSocket服务（与AgentSystem内部的WebSocket总线分开）
    const wssServer = new WebSocketServer({ 
      server: httpServer, 
      path: '/ws' 
    });
    
    wss = wssServer;
    wssServer.on('connection', (ws: WebSocket) => {
      console.log('🔌 WebSocket client connected');
      ws.on('message', async (data: string) => {
        try {
          const msg = JSON.parse(data.toString());
          const text = msg.prompt || msg.message;
          if (text) {
            const core = new HylrichCore();
            const result = await core.processMessage(text);
            ws.send(JSON.stringify(result));
          } else {
            ws.send(JSON.stringify({ error: 'message required' }));
          }
        } catch (err) {
          ws.send(JSON.stringify({ error: 'invalid request' }));
        }
      });
      ws.on('close', () => {
        console.log('🔌 WebSocket client disconnected');
      });
    });

    console.log('✅ HTTP + WebSocket service ready');
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

async function shutdown() {
  console.log('🛑 Shutting down...');
  
  if (wss) {
    wss.close();
    console.log('🛑 WebSocket server stopped');
  }
  
  if (httpServer) {
    await new Promise(resolve => httpServer.close(resolve));
    console.log('🛑 HTTP server stopped');
  }
  
  if (agentSystem) {
    await agentSystem.stop();
    console.log('🛑 AgentSystem stopped');
  }
  
  console.log('✅ Shutdown complete');
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

startServer();

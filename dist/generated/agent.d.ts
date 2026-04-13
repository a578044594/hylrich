export interface IAgentService {
    executeTool: (call: any, callback: any) => void;
    healthCheck: (call: any, callback: any) => void;
    getMetrics: (call: any, callback: any) => void;
    getSystemStats: (call: any, callback: any) => void;
}

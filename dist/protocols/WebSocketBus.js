"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketBus = void 0;
const ws_1 = __importDefault(require("ws"));
class WebSocketBus {
    constructor(config) {
        this.config = config;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.messageQueue = [];
        this.isConnected = false;
        this.config = {
            reconnectInterval: 5000,
            maxReconnectAttempts: 10,
            heartbeatInterval: 30000,
            ...config
        };
    }
    async connect() {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new ws_1.default(this.config.url);
                this.ws.on("open", () => {
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    this.processMessageQueue();
                    this.startHeartbeat();
                    resolve();
                });
                this.ws.on("close", () => {
                    this.isConnected = false;
                    this.handleReconnect();
                });
                this.ws.on("error", (error) => {
                    reject(error);
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
    send(message) {
        if (this.isConnected && this.ws) {
            this.ws.send(JSON.stringify(message));
        }
        else {
            this.messageQueue.push(message);
        }
    }
    processMessageQueue() {
        while (this.messageQueue.length > 0 && this.isConnected) {
            const message = this.messageQueue.shift();
            this.send(message);
        }
    }
    handleReconnect() {
        if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
            setTimeout(() => {
                this.reconnectAttempts++;
                this.connect().catch(console.error);
            }, this.config.reconnectInterval);
        }
    }
    startHeartbeat() {
        setInterval(() => {
            if (this.isConnected) {
                this.send({ type: "heartbeat", timestamp: Date.now() });
            }
        }, this.config.heartbeatInterval);
    }
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.isConnected = false;
        }
        // 清空消息队列
        this.messageQueue = [];
    }
}
exports.WebSocketBus = WebSocketBus;
//# sourceMappingURL=WebSocketBus.js.map
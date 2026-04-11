"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketBus = void 0;
const EventEmitter_1 = require("../core/EventEmitter");
class WebSocketBus extends EventEmitter_1.EventEmitter {
    constructor(config) {
        super();
        this.ws = null;
        this.reconnectAttempts = 0;
        this.messageQueue = [];
        this.isConnected = false;
        this.config = {
            reconnectInterval: 5000,
            maxReconnectAttempts: 10,
            ...config
        };
    }
    connect() {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.config.url);
                this.ws.onopen = () => {
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    this.processMessageQueue();
                    this.emit('connected');
                    resolve();
                };
                this.ws.onmessage = (event) => {
                    const message = JSON.parse(event.data);
                    this.emit('message', message);
                };
                this.ws.onclose = () => {
                    this.isConnected = false;
                    this.emit('disconnected');
                    this.handleReconnect();
                };
                this.ws.onerror = (error) => {
                    this.emit('error', error);
                    reject(error);
                };
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
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.isConnected = false;
        this.messageQueue = [];
    }
    getConnectionStatus() {
        return {
            connected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts
        };
    }
}
exports.WebSocketBus = WebSocketBus;
//# sourceMappingURL=WebSocketBus.js.map
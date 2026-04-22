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
exports.FileReadTool = exports.FileWriteTool = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
exports.FileWriteTool = {
    definition: {
        name: 'file_write',
        description: 'Write string content to a file',
        version: '1.0.0',
        parameters: [
            { name: 'path', type: 'string', description: 'File path', required: true },
            { name: 'content', type: 'string', description: 'Content to write', required: true }
        ]
    },
    async execute(input, context) {
        try {
            const p = input.path;
            if (!p)
                throw new Error('path is required');
            const content = input.content ?? '';
            const dir = path.dirname(p);
            if (dir && !fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(p, content, 'utf8');
            return { status: 'success', data: { path: p, bytes: Buffer.byteLength(content) } };
        }
        catch (err) {
            return { status: 'error', error: err.message };
        }
    }
};
exports.FileReadTool = {
    definition: {
        name: 'file_read',
        description: 'Read file content',
        version: '1.0.0',
        parameters: [
            { name: 'path', type: 'string', description: 'File path', required: true }
        ]
    },
    async execute(input, context) {
        try {
            const p = input.path;
            if (!p)
                throw new Error('path is required');
            if (!fs.existsSync(p))
                throw new Error(`File not found: ${p}`);
            const content = fs.readFileSync(p, 'utf8');
            return { status: 'success', data: { path: p, content, size: content.length } };
        }
        catch (err) {
            return { status: 'error', error: err.message };
        }
    }
};
//# sourceMappingURL=FileTools.js.map
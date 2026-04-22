"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileWriteTool = void 0;
const Tool_1 = require("../core/Tool");
const fs_1 = require("fs");
class FileWriteTool extends Tool_1.Tool {
    constructor() {
        super(...arguments);
        this.name = 'file_write';
        this.description = '写入文件内容';
        this.parameters = {
            type: 'object',
            properties: {
                path: { type: 'string', description: '文件路径' },
                content: { type: 'string', description: '文件内容' }
            },
            required: ['path', 'content']
        };
    }
    async performExecution(input) {
        try {
            await fs_1.promises.writeFile(input.path, input.content, 'utf-8');
        }
        catch (error) {
            throw new Error(`写入文件失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.FileWriteTool = FileWriteTool;
//# sourceMappingURL=FileWriteTool.js.map
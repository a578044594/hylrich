"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileReadTool = void 0;
const Tool_1 = require("../core/Tool");
const fs_1 = require("fs");
class FileReadTool extends Tool_1.Tool {
    constructor() {
        super(...arguments);
        this.name = 'file_read';
        this.description = '读取文件内容';
        this.parameters = {
            type: 'object',
            properties: {
                path: { type: 'string', description: '文件路径' }
            },
            required: ['path']
        };
    }
    async performExecution(input) {
        try {
            const content = await fs_1.promises.readFile(input.path, 'utf-8');
            return content;
        }
        catch (error) {
            throw new Error(`读取文件失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.FileReadTool = FileReadTool;
//# sourceMappingURL=FileReadTool.js.map
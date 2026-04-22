"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HylrichCore = void 0;
exports.start = start;
const HylrichCore_1 = require("./core/HylrichCore");
Object.defineProperty(exports, "HylrichCore", { enumerable: true, get: function () { return HylrichCore_1.HylrichCore; } });
// 启动系统
// AgentSystem and related protocols have been removed from this build
// Use HylrichCore directly for message processing
function start() {
    console.log('HylrichCore is available for direct use');
}
//# sourceMappingURL=index.js.map
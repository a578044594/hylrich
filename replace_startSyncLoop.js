const fs = require('fs');

const filePath = 'src/services/state/StateSyncService.ts';

// Read the file
const content = fs.readFileSync(filePath, 'utf8');

// The new implementation
const newImplementation = `private startSyncLoop(): void {
  // 定期同步本地状态到其他节点
  setInterval(async () => {
    const states = Array.from(this.stateManager.states.entries());
    console.log(\`同步 \${states.length} 个状态到其他节点...\`);
    for (const [key, state] of states) {
      try {
        await this.grpcClient.call('syncState', {
          nodeId: this.config.nodeId,
          state: {
            key,
            value: state.value,
            version: state.version,
            timestamp: state.timestamp
          }
        });
      } catch (error) {
        console.error(\`同步状态 \${key} 失败:\`, error);
      }
    }
  }, this.config.syncInterval || 3000);

  // 定期从其他节点获取状态更新
  setInterval(async () => {
    console.log(\`从其他节点获取状态更新...\`);
    const nodes = this.stateManager.listNodes();
    for (const node of nodes) {
      if (node.id !== this.config.nodeId) {
        try {
          const remoteStates = await this.grpcClient.call('getStates', {
            nodeId: this.config.nodeId
          });
          if (remoteStates && remoteStates.length > 0) {
            for (const remoteState of remoteStates) {
              const localState = this.stateManager.getState(remoteState.key);
              if (!localState || remoteState.version > localState.version) {
                this.stateManager.processStateUpdate(remoteState);
              }
            }
          }
        } catch (极光视频生成中，请稍候...)

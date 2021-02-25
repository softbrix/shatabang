const ArrayCache = require('idre-array-cache');
const path = require('path');

let lastTimestamp = Date.now();
class WorkLog {
    constructor(cacheDir) {
        var importLogPath = path.join(cacheDir, 'workLog');
        this._log = new ArrayCache();
        // The open call is async but this should be fine and the ArrayCache is self healing
        this._log.open(importLogPath); // Delay option is default 200ms
    }
    push(logPost) {
        this._log.push(logPost);
        lastTimestamp = Date.now();
    }
    async clear() {
        await this._log.clear();
    }
    async close() {
        await this._log.close();
    }
    slice(start, end) {
        return this._log.slice(start, end);
    }
    tail(index) {
        return this._log.slice(index);
    }
    lastTimestamp() {
        return lastTimestamp;
    }
}

module.exports = WorkLog;

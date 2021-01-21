const ArrayCache = require('idre-array-cache');
const path = require('path');

class ImportLog {
    constructor(cacheDir) {
        var importLogPath = path.join(cacheDir, 'importlog');
        this._log = new ArrayCache();
        // The open call is async but this should be fine and the ArrayCache is self healing
        this._log.open(importLogPath); // Delay option is default 200ms
    }
    push(id) {
        if (!Number.isInteger(id)) {
            throw new Error('Expected {id} to be numeric, was: ' + typeof id + '/' + id);
        }
        this._log.push(id);
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
        return  (this._log.slice(-1)[0] || '').split('*')[1];
    }
}

module.exports = ImportLog;

const ArrayCache = require('idre-array-cache');
const path = require('path');

function current_timestamp() {
    return new Date().getTime();
}

class ImportLog {
    constructor(cacheDir) {
        var importLogPath = path.join(cacheDir, 'importlog');
        this._log = new ArrayCache();
        return this._log.open(importLogPath); // Delay option is default 200ms
    }
    push(relativeFilePath) {
        this._log.push(relativeFilePath + '*' + current_timestamp());
    }
    close() {
        this._log.close();
    }
    slice(start, end) {
        this._log.slice(start, end);
    }
    tail(index) {
        this._log.slice(index);
    }
}





module.exports = ImportLog;

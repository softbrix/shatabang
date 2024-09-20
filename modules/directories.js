const path = require('path');
const shFiles = require('./shatabang_files');

module.exports = {
    populatesDirectories: function(config) {
        const filteredDir = path.join(config.storageDir, 'filtered');
        config.deletedDir = path.join(filteredDir, 'deleted');
        config.uploadDir = path.join(config.storageDir, 'upload');
        config.importDir = path.join(config.storageDir, 'import');

        config.dirs = {
            storage: config.storageDir,
            import: config.importDir,
            upload: config.uploadDir,
            cache: config.cacheDir,
            filtered: filteredDir,
            info: path.join(config.cacheDir, 'info'),
            deleted: config.deletedDir,
            duplicates: path.join(filteredDir, 'duplicates'),
            unknown: path.join(filteredDir, 'unknown')
        };
    },
    checkDirectories: function(config) {
        // Check that directories exists
        Object.values(config.dirs).forEach(function(directory) {
            if(!shFiles.exists(directory)) {
            console.log("Directory dir does not exists. Trying to create it.", directory);
            shFiles.mkdirsSync(directory);
            }
        })
    }
};
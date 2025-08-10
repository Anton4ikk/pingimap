"use strict";
console.log('PingIMap Agent starting...');
const start = async () => {
    try {
        console.log('Agent initialized');
    }
    catch (error) {
        console.error('Failed to start agent:', error);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=index.js.map
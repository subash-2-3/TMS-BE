const fs = require('fs');

try {
    fs.writeFileSync('d:\\subash\\projects\\git\\node\\TMS-BE\\simple_test.txt', 'Hello from node');
    console.log('File written');
} catch (e) {
    console.error(e);
}

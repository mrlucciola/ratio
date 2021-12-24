const fs = require("fs");

const basePath = './target/idl';

const idl_files = fs.readdirSync(basePath);

idl_files.forEach(filename => {
  const origFilePath = `${basePath}/${filename}`;
  const fileNoExtn = filename.split('.json')[0];
  
  const destFilePath = `./app/src/${fileNoExtn}_idl.json`;
  const outputFile = JSON.stringify(require(origFilePath), null, 2);
  fs.writeFileSync(destFilePath, outputFile);
});

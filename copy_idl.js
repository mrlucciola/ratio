
const fs = require("fs");
const ratio_idl = require("./target/idl/ratio.json");

fs.writeFileSync("./app/src/idl.json", JSON.stringify(ratio_idl, null, 2));
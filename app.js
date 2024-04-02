const fs = require("node:fs");
const { Buffer } = require("node:buffer");
function readInput() {
  binary = fs.readFileSync("./txnlog.dat");
  //   process.stdout.write(binary.slice(0, 4));
  //   const buffer = binary;
  var buff = Buffer.alloc(300, binary, "utf8");
  console.log(buff.toLocaleString());
  //   console.log(binary.slice(0, 4).toString());
  //   console.log(binary.slice(4, 12).toString());
  //   console.log(binary.slice(12, 24).toString("utf8"));
}
readInput();

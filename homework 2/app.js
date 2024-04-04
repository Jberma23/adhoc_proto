// SETUP: Run npm install int64-buffer then run node app.js
const fs = require("fs");
const Uint64BE = require("int64-buffer").Uint64BE;

/* 
Info: the nessicary info in the readme is printed out to the console and the decrypted values are stored in answerLog.txt
*/

let offset = 0;
let credit = 0;
let debit = 0;
let autopayStarted = 0;
let autopayEnded = 0;
let balanceForUser = new Float32Array(0);
let results = [];

const RecordType = Object.freeze({
  "00": "Debit",
  "01": "Credit",
  "02": "StartAutopay",
  "03": "EndAutopay",
});

fs.readFile("txnlog.dat", function (err, data) {
  buff = Buffer.from(data);
  //remove header, version, and numRecords from the buff
  const header = buff.subarray(offset, (offset += 4)).toString("utf8");
  const version = buff.subarray(offset, (offset += 1)).toString("hex");
  const numberOfRecords = parseInt(
    buff.subarray(offset, (offset += 4)).toString("hex"),
    16
  ).toString(10);

  while (offset < Buffer.byteLength(buff)) {
    getRecord();
  }
  fs.writeFile(
    "answerLog.txt",
    JSON.stringify(results, null, 2),
    {
      encoding: "utf8",
    },
    (err) => {
      if (err) console.log(err);
    }
  );

  //remove getRoundedNumber function call and replace it with credit if non-rounded numbers are preferred
  console.log(`total credit amount=${getRoundedNumber(credit)} \n`);
  console.log(`total debit amount=${getRoundedNumber(debit)} \n`);
  console.log(`autopays started=${autopayStarted} \n`);
  console.log(`autopays ended=${autopayEnded} \n`);
  console.log(`balance for user 2456938384156277127=${balanceForUser} \n`);
});

function getRecord() {
  let recordType = getRecordType();
  let unixTimestamp = getTimeStamp();
  let userID = getUserID();
  let dollarAmt = getDollarAmount(recordType);
  if (recordType == "Credit") {
    credit += parseFloat(dollarAmt);
  }
  if (recordType == "Debit") {
    debit += parseFloat(dollarAmt);
  }
  if (recordType == "StartAutopay") {
    autopayStarted = autopayStarted + 1;
  }
  if (recordType == "EndAutopay") {
    autopayEnded = autopayEnded + 1;
  }
  if (userID === "2456938384156277127") {
    if (recordType == "Credit") {
      balanceForUser -= parseFloat(dollarAmt);
    }
    if (recordType == "Debit") {
      balanceForUser += parseFloat(dollarAmt);
    }
  }
  if (recordType == "Credit" || recordType == "Debit") {
    results.push(
      `${recordType} | ${new Date(
        unixTimestamp * 1000
      )} | ${userID} | ${dollarAmt}`
    );
  } else {
    results.push(
      `${recordType} | ${new Date(unixTimestamp * 1000)} | ${userID}`
    );
  }
}
function getRecordType() {
  recordType = buff.subarray(offset, (offset += 1)).toString("hex");
  return RecordType[`${recordType}`];
}
function getTimeStamp() {
  let unixTimestamp = parseInt(
    buff.subarray(offset, (offset += 4)).toString("hex"),
    16
  ).toString(10);
  return unixTimestamp;
}
function getUserID() {
  let userID = new Uint64BE(buff.subarray(offset, (offset += 8))).toString(10);
  return userID;
}
function getDollarAmount(recordType) {
  let dollarAmt;
  if (recordType == "Credit" || recordType == "Debit") {
    dollarAmt = buff
      .subarray(offset, (offset += 8))
      .readDoubleBE()
      .toFixed(4);
  } else {
    dollarAmt = "";
  }
  return dollarAmt;
}
function getRoundedNumber(num) {
  return Math.round((parseFloat(num) + Number.EPSILON) * 100) / 100;
}

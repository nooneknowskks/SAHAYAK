const XLSX = require("xlsx");

// read file
const workbook = XLSX.readFile("./data/schemes.xlsx");

// get first sheet
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// convert to JSON
const data = XLSX.utils.sheet_to_json(sheet);

console.log("Total Schemes:", data.length);
console.log(data[0]);
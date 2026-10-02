const fs = require("fs");
const csv = require("csv-parser");

let results = [];

fs.createReadStream("./data/schemes_data.csv")
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
        console.log("Total Schemes:", results.length);
        console.log(results[0]);
    });
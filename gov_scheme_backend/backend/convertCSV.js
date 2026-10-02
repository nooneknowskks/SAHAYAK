const fs = require("fs");
const csv = require("csv-parser");

let results = [];

fs.createReadStream("./data/schemes_data.csv")
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {

        fs.writeFileSync("./data/schemes.json", JSON.stringify(results, null, 2));

        console.log("JSON file created!");
    });
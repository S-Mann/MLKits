import "@tensorflow/tfjs-node";
import "@tensorflow/tfjs";
const loadCSV = require("./load-csv");

let { features, labels, testFeatures, testLabels } = loadCSV("./cars.csv", {
  shuffle: true,
  splitTest: 50,
  dataColumns: ["horsepower"],
  labelColumns: ["mpg"]
});

console.log(features, labels);

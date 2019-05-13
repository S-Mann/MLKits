"use strict";

require("@tensorflow/tfjs-node");

var _tfjs = require("@tensorflow/tfjs");

var _loadCsv = require("./load-csv");

var _loadCsv2 = _interopRequireDefault(_loadCsv);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _loadCSV = (0, _loadCsv2.default)("kc_house_data.csv", {
  shuffle: true,
  splitTest: 10,
  dataColumns: ["lat", "long", "sqft_lot", "sqft_living"],
  labelColumns: ["price"]
}),
    features = _loadCSV.features,
    labels = _loadCSV.labels,
    testFeatures = _loadCSV.testFeatures,
    testLabels = _loadCSV.testLabels;

features = (0, _tfjs.tensor2d)(features, [features.length, 4], "float32");
labels = (0, _tfjs.tensor2d)(labels, [labels.length, 1], "float32");
var k = 10;

var _moments = (0, _tfjs.moments)(features, 0),
    mean = _moments.mean,
    variance = _moments.variance;

testFeatures.forEach(function (element, i) {
  var result = knn(features, labels, (0, _tfjs.tensor2d)(element, [1, 4], "float32"), k);
  var error_rate = (testLabels[i][0] - result) / testLabels[i][0];
  console.log("The error rate is:", error_rate * 100);
});

function knn(features, labels, predictionPoint, k) {
  predictionPoint = predictionPoint.sub(mean).div(variance.pow(0.5));
  return features.sub(mean).div(variance.pow(0.5)).sub(predictionPoint).pow(2).sum(1).pow(0.5).expandDims(1).concat(labels, 1).unstack().sort(function (a, b) {
    return a.get(0) > b.get(0) ? 1 : -1;
  }).slice(0, k).reduce(function (acc, pair) {
    return acc + pair.get(1);
  }, 0) / k;
}
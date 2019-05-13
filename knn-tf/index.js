import "@tensorflow/tfjs-node";
import { tensor2d, moments } from "@tensorflow/tfjs";
import loadCSV from "./load-csv";

let { features, labels, testFeatures, testLabels } = loadCSV(
  "kc_house_data.csv",
  {
    shuffle: true,
    splitTest: 10,
    dataColumns: ["lat", "long", "sqft_lot", "sqft_living"],
    labelColumns: ["price"]
  }
);

features = tensor2d(features, [features.length, 4], "float32");
labels = tensor2d(labels, [labels.length, 1], "float32");
const k = 10;
const { mean, variance } = moments(features, 0);

testFeatures.forEach((element, i) => {
  const result = knn(features, labels, tensor2d(element, [1, 4], "float32"), k);
  const error_rate = (testLabels[i][0] - result) / testLabels[i][0];
  console.log("The error rate is:", error_rate * 100);
});

function knn(features, labels, predictionPoint, k) {
  predictionPoint = predictionPoint.sub(mean).div(variance.pow(0.5));
  return (
    features
      .sub(mean)
      .div(variance.pow(0.5))
      .sub(predictionPoint)
      .pow(2)
      .sum(1)
      .pow(0.5)
      .expandDims(1)
      .concat(labels, 1)
      .unstack()
      .sort((a, b) => (a.get(0) > b.get(0) ? 1 : -1))
      .slice(0, k)
      .reduce((acc, pair) => acc + pair.get(1), 0) / k
  );
}

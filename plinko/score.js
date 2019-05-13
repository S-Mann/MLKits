const outputs = [];

function onScoreUpdate(dropPosition, bounciness, size, bucketLabel) {
  outputs.push([dropPosition, bounciness, size, bucketLabel])
}

function runAnalysis() {
  const testSetSize = 100;
  const k = 10;

  _.range(0, 3).forEach(feature => {
    const data = _.map(outputs, row => [row[feature], _.last(row)]);
    const [testSet, trainingSet] = splitDataset(scale(data, 1), testSetSize);
    const accuracy = _.chain(testSet)
      .filter(testPoint => {
        return knn(trainingSet, _.initial(testPoint), k) === _.last(testPoint)
      })
      .size()
      .divide(testSetSize)
      .value();
    console.log('Accuracy', accuracy, '| feature', feature)
  });
}

function knn(data, arr, k) {
  return _.chain(data)
    .map(row => {
      return [distance(_.initial(row), arr),
      _.last(row)]
    })
    .sortBy(row => row[0])
    .slice(0, k)
    .countBy(row => row[1])
    .toPairs()
    .sortBy(row => row[1])
    .last()
    .first()
    .parseInt()
    .value()
}

function distance(pointA, pointB) {
  return _.chain(pointA)
    .zip(pointB)
    .map(([a, b]) => (a - b) ** 2)
    .sum()
    .value() ** 0.5
}

function scale(data, columnCount) {
  const clonedData = _.cloneDeep(data);

  for (let i = 0; i < columnCount; i++) {
    const column = clonedData.map(row => row[i])

    const min = _.min(column);
    const max = _.max(column);

    for (let j = 0; j < column.length; j++) {
      clonedData[j][i] = (clonedData[j][i] - min) / (max - min);
    }
  }

  return clonedData;
}

function splitDataset(data, count) {
  const shuffled = _.shuffle(data);
  const testSet = _.slice(shuffled, 0, count);
  const trainingSet = _.slice(shuffled, count);
  return [testSet, trainingSet];
}
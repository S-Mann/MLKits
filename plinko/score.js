const outputs = [];

function onScoreUpdate(dropPosition, bounciness, size, bucketLabel) {
  outputs.push([dropPosition, bounciness, size, bucketLabel])
}

function runAnalysis() {
  let testSetSize = 100
  const [testSet, trainingSet] = splitDataset(outputs, testSetSize)

  _.range(1, 20).forEach(k => {
    const accuracy = _.chain(testSet)
      .filter(testPoint => {
        return knn(trainingSet, _.initial(testPoint), k) === testPoint[3]
      })
      .size()
      .divide(testSetSize)
      .value();
    console.log('Accuracy', accuracy, '| k', k)
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
}

function splitDataset(data, count) {
  const shuffled = _.shuffle(data);
  const testSet = _.slice(shuffled, 0, count);
  const trainingSet = _.slice(shuffled, count);
  return [testSet, trainingSet];
}
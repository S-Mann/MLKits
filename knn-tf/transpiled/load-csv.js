'use strict';

var fs = require('fs');
var _ = require('lodash');
var shuffleSeed = require('shuffle-seed');

function extractColumns(data, columnNames) {
  var headers = _.first(data);

  var indexes = _.map(columnNames, function (column) {
    return headers.indexOf(column);
  });
  var extracted = _.map(data, function (row) {
    return _.pullAt(row, indexes);
  });

  return extracted;
}

module.exports = function loadCSV(filename, _ref) {
  var _ref$dataColumns = _ref.dataColumns,
      dataColumns = _ref$dataColumns === undefined ? [] : _ref$dataColumns,
      _ref$labelColumns = _ref.labelColumns,
      labelColumns = _ref$labelColumns === undefined ? [] : _ref$labelColumns,
      _ref$converters = _ref.converters,
      converters = _ref$converters === undefined ? {} : _ref$converters,
      _ref$shuffle = _ref.shuffle,
      shuffle = _ref$shuffle === undefined ? false : _ref$shuffle,
      _ref$splitTest = _ref.splitTest,
      splitTest = _ref$splitTest === undefined ? false : _ref$splitTest;

  var data = fs.readFileSync(filename, { encoding: 'utf-8' });
  data = _.map(data.split('\n'), function (d) {
    return d.split(',');
  });
  data = _.dropRightWhile(data, function (val) {
    return _.isEqual(val, ['']);
  });
  var headers = _.first(data);

  data = _.map(data, function (row, index) {
    if (index === 0) {
      return row;
    }
    return _.map(row, function (element, index) {
      if (converters[headers[index]]) {
        var converted = converters[headers[index]](element);
        return _.isNaN(converted) ? element : converted;
      }

      var result = parseFloat(element.replace('"', ''));
      return _.isNaN(result) ? element : result;
    });
  });

  var labels = extractColumns(data, labelColumns);
  data = extractColumns(data, dataColumns);

  data.shift();
  labels.shift();

  if (shuffle) {
    data = shuffleSeed.shuffle(data, 'phrase');
    labels = shuffleSeed.shuffle(labels, 'phrase');
  }

  if (splitTest) {
    var trainSize = _.isNumber(splitTest) ? splitTest : Math.floor(data.length / 2);

    return {
      features: data.slice(trainSize),
      labels: labels.slice(trainSize),
      testFeatures: data.slice(0, trainSize),
      testLabels: labels.slice(0, trainSize)
    };
  } else {
    return { features: data, labels: labels };
  }
};
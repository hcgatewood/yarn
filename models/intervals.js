var _ = require('underscore');

var IdToInterval = module.exports = {
  intervals: {},
  update: function (id, length, roomModel) {
    clearInterval(IdToInterval.intervals[id]);
    IdToInterval.intervals[id] = setInterval(function () {
      roomModel.changeWriterTurns(id);
    }, length);
    console.log('new interval');
  },
  remove: function (id) {
    clearInterval(IdToInterval.intervals[id]);
    IdToInterval.intervals = _.without(IdToInterval, id);
  },
  hasInterval: function (id) {
    return _.has(IdToInterval.intervals, id);
  }
}

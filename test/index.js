require('should');
var suite = require('./suite');

var connectionOpts = {
  host: 'localhost',
  port: 28015,
  db: 'rethinkdb_init_test'
};

describe('Driver - rethinkdb', function () {
  suite(require('rethinkdb'), connectionOpts);
});

describe('Driver - rethinkdbdash', function () {
  suite(require('rethinkdbdash')({ pool: false }), connectionOpts);
});

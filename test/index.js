/*global describe:true */
'use strict'
require('should')
var NODE_VERSION = process.env.TRAVIS_NODE_VERSION || false
var suite = require('./suite')

var connectionOpts = {
  host: 'localhost',
  port: 28015,
  db: 'rethinkdb_init_test'
}

describe('Driver - rethinkdb', function () {
  suite(require('rethinkdb'), connectionOpts)
})

if (NODE_VERSION && NODE_VERSION[0] !== '0') { // 0.10.38 - 0.12.*
  describe('Driver - rethinkdbdash', function () {
    suite(require('rethinkdbdash')({ pool: false }), connectionOpts)
  })
}

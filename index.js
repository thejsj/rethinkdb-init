'use strict'
var q = require('q')
var _ = require('lodash')

var rethinkdbInit = function (r) {
  // Is there a sane way of checking that this is a RethinkDB instance without importing the module?
  if (typeof r !== 'function') throw new TypeError('r must be a RethinkDB instance. Passed instances is a `' + (typeof r) + '`')

  /**
   * Returns true only if object is not `null` and is not an array
   *
   * @param {Any}
   * @return {Boolean}
   */
  var isRealObject = function (value) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) return true
    return false
  }

  /**
   * Throws an error if the error given is not an `already exists` error
   *
   * @param <Error>
   */
  var existsHandler = function (err) {
    if (err.name === 'ReqlOpFailedError' && (err.msg || err.message).indexOf('already exists')) return
    if (err.name === 'RqlRuntimeError' && (err.msg || err.message).indexOf('already exists')) return
    throw err
  }

  /**
   * Maps a table object to an array of promises to create indexes for that table
   *
   * @param {Object}        table                - Table object
   * @param {Object}        table.name           - Name of table
   * @param {Array<String|Object>} table.indexes - Array of index
   * @param {Array<String>} table.indexes        - Array of strings with index names
   * @param {Array<Object>} table.indexes        - Array of objects with index `name`, `indexFunction`, `mutli`, `geo`
   * @param {String}        db                   - Database name
   * @param {Object}        conn                 - RethinkDB connection
   * @return {Array}
   */
  var mapIndexes = function (table, db, conn) {
    return table.indexes.map(function (index) {
      if (typeof index !== 'object' && typeof index !== 'string') throw new TypeError('index entry in table entry must be `Object` or `String`')
      if (typeof index === 'string') return r.db(db).table(table.name).indexCreate(index).run(conn).catch(existsHandler)
      if (index.name === undefined) throw new TypeError('index entry object in table schema must have a `name` property')
      var opts = []
      if (index.indexFunction) opts.push(index.indexFunction)
      if (index.multi || index.geo) opts.push(_.pick(index, ['multi', 'geo']))

      return r.db(db).table(table.name)
        .indexCreate(index.name, opts[0], opts[1])
        .run(conn)
        .catch(existsHandler)
    })
  }

  /**
   * Maps a schema object to an array of promises to create tables
   *
   * @param {Object}                schema               - Schema for table creation
   * @param {String}                schema.table         - Name of the table
   * @param {Object}                schema.table         - Object describing table
   * @param {String}                schema.table.name    - Name of the table
   * @param {Array<String|Object>}  schema.table.indexes - Array of indexes
   * @param {String}                db                   - Database name
   * @param {Object}                conn                 - Database connection
   * @return {Array}
   */
  var mapTables = function (schema, db, conn) {
    return schema.map(function (table) {
      if (!isRealObject(table) && typeof table !== 'string') {
        throw new TypeError('table entry in schema must be `Object` or `String`')
      }
      if (typeof table === 'string') {
        return r.db(db).tableCreate(table).run(conn).catch(existsHandler)
      }
      if (table.name === undefined) throw new TypeError('table entry object in schema must have a `name` property')
      var options = _.pick(table, ['primaryKey', 'durability', 'shards', 'replicas', 'primaryReplicaTag'])
      return r.db(db).tableCreate(table.name, options).run(conn)
        .catch(existsHandler)
        .then(function () {
          // Create indexes
          if (table.indexes === undefined) return true
          if (!Array.isArray(table.indexes)) throw new TypeError('Table indexes attribute should be an Array.')
          return q.all(mapIndexes(table, db, conn))
        })
        .then(function () {
          return r.db(db).table(table.name).indexWait().run(conn)
        })
    })
  }

  /**
   * Create databases, tables, and indexes as defined by the schema
   *
   * @param {Object}                connection           - Connection details for database (See: https://rethinkdb.com/api/javascript/connect/)
   * @param {String}                connection.db        - Database name
   * @param {String}                connection.host      - Database host
   * @param {String}                connection.port      - Database port
   * @param {Object}                schema               - Schema for table creation
   * @param {String}                schema.table         - Name of the table
   * @param {Object}                schema.table         - Object describing table
   * @param {String}                schema.table.name    - Name of the table
   * @param {Array<String|Object>}  schema.table.indexes - Array of indexes
   * @return {Promise}
   */
  var init = function (connection, schema) {
    // Connection must be an object and have a db, host, and port
    return q().then(function () {
      if (!isRealObject(connection)) throw new TypeError('Connection object must be an object.')
      if (typeof connection.db !== 'string') throw new TypeError('Connection object must have a db property. rethinkdb-init won\'t add tables to the `test` database unless explicitly declared')
      if (!Array.isArray(schema)) throw new TypeError('Schema argument must be an array.')
      var db = connection.db
      return r.connect(connection)
       .then(function (conn) {
         return r.dbCreate(db).run(conn)
           .catch(existsHandler)
           .then(function () {
             // Take an array of tables and create all tables
             // Create all indexes
             return q.all(mapTables(schema, db, conn))
           })
           .return(conn)
       })
    })
  }

  // Attach `init` function to RethinkDB instance
  r.init = init
  // Return init function
  return init
}

module.exports = rethinkdbInit

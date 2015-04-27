var q = require('q');
var _ = require('lodash');

var existsHandler = function (err) {
  if (err.name === 'RqlRuntimeError' && err.msg.indexOf('already exists')) return;
  throw err;
};

var rethinkdbInit = function (r) {
  // Is there a sane way of checking that this is a RethinkDB instance without importing the module?
  if (typeof r !== 'function') throw new TypeError('r must be a RethinkDB instance. Passed instances is a `' + (typeof r) + '`');
  var init = function (connection, schema) {
    // Connection must be an object and have a db, host, and port
    if (typeof connection !== 'object') throw new TypeError('Connection object must by an object.');
    if (typeof connection.db !== 'string') throw new TypeError('Connection object must have a db property. rethinkdb-init won\'t add tables to the `test` database unless explicitly declared');
    if (!Array.isArray(schema)) throw new TypeError('Schema argument must be an array.');
    var db = connection.db;
    return r.connect(connection)
     .then(function (conn) {
       return r.dbCreate(db).run(conn)
         .catch(existsHandler)
         .then(function () {
           return conn;
         });
     })
     .then(function (conn) {
       // Take an array of tables and create all tables
       // Create all indexes
       return q.all(function () {
         return schema.map(function (table) {
           if (typeof table !== 'object' && typeof table !== 'string') throw new TypeError('table entry in schema must be `Object` or `String`');
           if (typeof table === 'string') return r.db(db).tableCreate(table).run(conn).catch(existsHandler);
           if (table.name === undefined) throw new TypeError('table entry object in schema must have a `name` property');
           var options = _.pick(table, ['primaryKey', 'durability', 'shards', 'replicas', 'primaryReplicaTag']);
           return r.db(db).tableCreate(table.name, options).run(conn)
             .catch(existsHandler)
             .then(function () {
               // Create indexes
               if (table.indexes === undefined) return true;
               if (!Array.isArray(table.indexes)) throw new TypeError('Table indexes attribute should be an Array.');
               return q.all(table.indexes.map(function (index) {
                 if (typeof index !== 'object' && typeof index !== 'string') throw new TypeError('index entry in table entry must be `Object` or `String`');
                 if (typeof index === 'string') return r.db(db).table(table.name).indexCreate(index).run(conn).catch(existsHandler);
                 if (index.name === undefined) throw new TypeError('index entry object in table schema must have a `name` property');
                 var opts = _.pick(index, ['multi', 'geo']);
                 return r.db(db).table(table.name)
                   .indexCreate(table.name, table.indesFunction, opts)
                   .run(conn);
               }));
             });
         });
       }())
         .then(function () {
           return conn;
         });
     });
  };
  // Attach `init` function to RethinkDB instance
  r.init = init;
  // Return init function
  return init;
};

module.exports = rethinkdbInit;

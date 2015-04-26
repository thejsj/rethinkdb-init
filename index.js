var q = require('q');
var _ = require('lodash');

var rethinkdbInit = function (r) {
  // Is there a sane way of checking that this is a RethinkDB instance without importing the module?
  if (typeof r !== 'object') throw new TypeError('r must be a RethinkDB instance');
  var init = function (connection, schema) {
    // Connection must be an object and have a db, host, and port
    if (typeof connection !== 'object') throw new TypeError('Connection object must by an object.');
    if (typeof connection.db !== 'string') throw new TypeError('Connection object must have a db property. rethinkdb-init won\'t add tables to the `test` database unless explicitly declared');
    if (!Array.isArray(schema)) throw new TypeError('Schema argument must be an array.');
    var db = connection.db;
    return r.connect(connection)
     .then(function (conn) {
       // Take an array of tables and create all tables
       // Create all indexes
       return Q.allSettled(function () {
         return schema.map(function (table) {
           if (typeof table !== 'object' && typeof table !== 'string') throw new TypeError('table entry in schema must be `Object` or `String`');
           if (typeof table === 'string') return r.db(db).tableCreate(table).run(conn);
           if (table.name === undefined) throw new TypeError('table entry object in schema must have a `name` property');
           var options = _.pluck(table, 'primaryKey', 'durability', 'shards', 'replicas', 'primaryReplicaTag');
           return r.db(db).tableCreate(table.name, options).run(conn)
             .then(function () {
               // Create indexes

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

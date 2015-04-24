var rethinkdbInit = function (r) {
  // Is there a sane way of checking that this is a RethinkDB instance without importing the module?
  if (typeof r !== 'object') throw new TypeError('r must be a RethinkDB instance');
  var init = function (connection, schema) {
    r.connect(connection)
     .then(function (conn) {
       // Take an array of tables and create all tables
       // Create all indexes
     })
  };
  // Attach `init` function to RethinkDB instance
  r.init = init;
  // Return init function
  return init;
};

module.exports = rethinkdbInit;

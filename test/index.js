require('should');
var r = require('rethinkdb');
var init = require('../')(r);
var log = require('protolog')();

var connectionOpts = {
  host: 'localhost',
  port: 28015,
  db: 'rethinkdb_init_test'
};

var dropDatabase = function (done) {
  r.connect(connectionOpts)
   .then(function (conn) {
    r.dbDrop(connectionOpts.db).run(conn)
      .catch(function () { })
      .then(done.bind(null, null));
   });
};

describe('Property', function () {

  it('should return a function', function () {
    init.should.be.a.Function;
  });

  it('should have an init property', function () {
    r.should.have.property('init');
  });

});

describe('Create Database', function () {

  before(dropDatabase);

  it('should create a database when the database doesn\'t exist and is passed into a connection', function (done) {
    r.init(connectionOpts, [])
      .then(function (conn) {
        r
          .db('rethinkdb')
          .table('db_config')
          .filter({ name: 'rethinkdb_init_test' })
          .count()
          .run(conn)
          .then(function (result) {
            result.should.equal(1);
            done();
          });
      })
      .catch(done);
  });

  it('should not throw an error when a database has already been created and is connected to it', function (done) {
    r.init(connectionOpts, [])
      .then(function (conn) {
        done();
      })
      .catch(done);

  });
});

describe('Create Tables', function () {

  var tables = ['table_1', 'table_2', 'table_3'];
  describe('Basic', function () {

    beforeEach(dropDatabase);

    it('should throw an error if something other than an object is passed as the first argument', function (done) {
      r.init('not-an-object', ['table1'])
        .then(done)
        .catch(function (err) {
          err.name.should.equal('TypeError');
          err.message.indexOf('object').should.not.equal(-1);
          done();
        });
    });

    it('should throw an error if something other than an array is passes as the second argument', function (done) {
      r.init(connectionOpts, 'table1')
        .then(done)
        .catch(function (err) {
          err.name.should.equal('TypeError');
          err.message.indexOf('array').should.not.equal(-1);
          done();
        });
    });

    it('should throw an error if something other than an a string or object is append to the tables array', function (done) {
      r.init(connectionOpts, [null, 1, 3])
        .then(done)
        .catch(function (err) {
          err.name.should.equal('TypeError');
          err.message.toLowerCase().indexOf('string').should.not.equal(-1);
        })
        .then(function () {
          // Test numbers
          return r.init(connectionOpts, [3])
            .then(done)
            .catch(function (err) {
              err.name.should.equal('TypeError');
              err.message.toLowerCase().indexOf('object').should.not.equal(-1);
              done();
            });
        });
    });

    it('should create tables with passed as strings to the init function', function (done) {
      r.init(connectionOpts, tables)
        .then(function (conn) {
          r
            .db(connectionOpts.db)
            .tableList()
            .run(conn)
            .then(function (result) {
              result.should.eql(tables);
              done();
            });
        })
        .catch(done);
    });

    it('should create tables passed as strings or objects to the init function', function (done) {
      var tablesWithObjects = ['table_1', { name: 'table_2' }, { name: 'table_3' }];
      r.init(connectionOpts, tablesWithObjects)
        .then(function (conn) {
          r
            .db(connectionOpts.db)
            .tableList()
            .run(conn)
            .then(function (result) {
              result.should.eql(tables);
              done();
            });
        })
        .catch(done);
    });

    it('should create tables passed as strings or objects to the init function with table options', function (done) {
      var tablesWithObjects = ['table_1', { name: 'table_2', primaryKey: 'location', durability: 'soft' }, { name: 'table_3', durability: 'soft' }];
      r.init(connectionOpts, tablesWithObjects)
        .then(function (conn) {
          r
            .db(connectionOpts.db)
            .tableList()
            .run(conn)
            .then(function (result) {
              result.should.eql(tables);
              return r
                 .db('rethinkdb')
                 .table('table_config')
                .filter({ name: 'table_2', db: connectionOpts.db })
                .coerceTo('array').nth(0)
                .run(conn);
            })
            .then(function (table2Result)  {
              table2Result.primary_key.should.equal('location');
              table2Result.durability.should.equal('soft');
              return r
                 .db('rethinkdb')
                 .table('table_config')
                .filter({ name: 'table_3', db: connectionOpts.db })
                .coerceTo('array').nth(0)
                .run(conn);
            })
            .then(function (table3Result) {
              table3Result.durability.should.equal('soft');
              done();
            });
        })
        .catch(done);
    });
  });

  describe('Error Handling', function () {

    it('should not throw an error when a table that is not already created is passed again', function (done) {
      r.init(connectionOpts, ['table_2'])
       .then(function (conn) {
         r
          .db(connectionOpts.db)
          .tableList()
          .run(conn)
          .then(function (result) {
            result.should.eql(tables);
            done();
          });
       })
       .catch(done);
    });

  });

});

describe('Create Tables with Indexes', function () {

  describe('Basic', function () {

    beforeEach(dropDatabase);

    it('should throw an error if something other than an array is passes to the `indexes` property', function (done) {
      var tablesWithObjects = { name: 'table_2', indexes: 'not-an-array'};
      r.init(connectionOpts, tablesWithObjects)
        .then(done)
        .catch(function (err) {
          err.name.should.equal('TypeError');
          err.message.toLowerCase().indexOf('array').should.not.equal(-1);
          done();
        });
    });

    it('should throw an error if something other than a string or object is appended to the `indexes` property array', function (done) {
      var tablesWithObjects = [{ name: 'table_2', indexes: 'not-an-array'}];
      r.init(connectionOpts, tablesWithObjects)
        .then(done)
        .catch(function (err) {
          err.name.should.equal('TypeError');
          err.message.toLowerCase().indexOf('array').should.not.equal(-1);
          done();
        });
    });

    it('should create indexes passed as strings', function (done) {
      this.timeout(15000);
      var indexes = [ 'index1', 'index2' ];
      var tablesWithObjects = [{ name: 'table_2', indexes: indexes  }];
      r.init(connectionOpts, tablesWithObjects)
        .then(function (conn) {
          r
            .db(connectionOpts.db)
            .table('table_2')
            .indexList()
            .run(conn)
            .then(function (indexesResult) {
              indexes.should.eql(indexesResult);
              done();
            })
            .catch(done);
        });
    });

    it('should create indexes passed as strings or objects', function (done) {
      this.timeout(15000);
      var indexes = [ { name: 'index3' }, { name: 'index4' }];
      var tablesWithObjects = [{ name: 'table_2', indexes: indexes  }];
      r.init(connectionOpts, tablesWithObjects)
        .then(function (conn) {
          r
            .db(connectionOpts.db)
            .table('table_2')
            .indexList()
            .run(conn)
            .then(function (indexesResult) {
              indexesResult.should.eql([ 'index3', 'index4']);
              done();
            })
            .catch(done);
        });
    });

    xit('should create geo indexes', function () {

    });

    it('should create multi indexes', function (done) {
      this.timeout(15000);
      var indexes = [ { name: 'index5', multi: true }];
      var tablesWithObjects = [{ name: 'table_2', indexes: indexes  }];
      r.init(connectionOpts, tablesWithObjects)
        .then(function (conn) {
          r
            .db(connectionOpts.db)
            .table('table_2')
            .indexList()
            .run(conn)
            .then(function (indexesResult) {
              indexesResult.should.eql(['index5'])
              done();
            })
            .catch(done);
        });

    });

    it('should create function indexes', function (done) {
      this.timeout(15000);
      var indexes = [ { name: 'index5', indexFunction: function(){return true} }];
      var tablesWithObjects = [{ name: 'table_2', indexes: indexes  }];
      r.init(connectionOpts, tablesWithObjects)
        .then(function (conn) {
          r
            .db(connectionOpts.db)
            .table('table_2')
            .indexList()
            .run(conn)
            .then(function (indexesResult) {
              indexesResult.should.eql(['index5'])
              done();
            })
            .catch(done);
        });
    });

  });

});

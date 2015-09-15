# RethinkDB Init

Create all RethinkDB databases, tables and indexes automatically through a schema object.

Often times, application code that uses RethinkDB has a significant portion of code meant for creating the database, tables and indexes [example](https://github.com/thejsj/image-pin/blob/master/server/db/index.js). This module is meant so that you can pass an object with the required initial state of your database and get a promise/callback for when all the necesary componentes have been added to the database. This removes a lot of boilerplate code from your application code and makes it easier to understand what is needed in the database to run the application.

## Examples

### Instantiating database with a table and an index

The first argument is a connection object with `host`, `port`, and `db`. If the `db` doesn’t exist, it will be created automatically.

The second argument is an array of tables. Each table can either be a string or an object. If the entry is an object, it must have a `name` property.

```javascript
var r = require('rethinkdb');
require('rethinkdb-init')(r);

r.init({
    host: 'localhost',
    port: 28015,
    db: 'superDatabase'
  }, [
    {
      name: 'person',
      indexes: ['firstName', 'lastName']
    },
    'address'
  ]
})
.then(function (conn) {
  // All tables and indexes have been created
});
```

### Instantiating a database with 4 tables with no indexes

When the array contains a string, a table will be added with that name.

```javascript
var r = require('rethinkdb');
require('rethinkdb-init')(r);

r.init({
    host: 'localhost',
    port: 28015,
    db: 'helloDatabase'
  },
  [
    'hello_table',
    'another_table',
    'yet_another_table',
    'one_last_table',
  ]
})
.then(function (conn) {
  // All tables and indexes have been created
});
```

### Instantiating a database with 2 tables and 2 indexes on one of the tables

Table objects can contain indexes (which can also be strings or objects).

```javascript
var r = require('rethinkdb');
require('rethinkdb-init')(r);

r.init({
    host: 'localhost',
    port: 28015,
    db: 'helloDatabase'
  },
  [
    {
      name: 'helloTable',
      indexes: ['superIndex', 'superDuperIndex']
    },
    'anotherTable'
  ]
})
.then(function (conn) {
  // All tables and indexes have been created
});
```

### Instantiating a database with 1 tables and 1 geo index

You can add a `geo` or `multi` attribute along with an index and it will be passed along to the [`indexCreate`](http://rethinkdb.com/api/javascript/index_create/) function.

```javascript
var r = require('rethinkdb');
require('rethinkdb-init')(r);

r.init({
    host: 'localhost',
    port: 28015,
    db: 'helloDatabase'
  },
  [
    {
      name: 'helloTable',
      indexes: [{
        name: 'location',
        geo: true,
      }]
    },
  ]
})
.then(function (conn) {
  // All tables and indexes have been created
});
```

### Instantiating a database with 1 tables and 1 multi+geo index

```javascript
var r = require('rethinkdb');
require('rethinkdb-init')(r);

r.init({
    host: 'localhost',
    port: 28015,
    db: 'helloDatabase'
  },
  [
    {
      name: 'helloTable',
      indexes: [{
        name: 'location',
        geo: true,
        multi: true,
      }]
    },
  ]
})
.then(function (conn) {
  // All tables and indexes have been created
});
```

### Instantiating a database with 1 table and 1 index with an indexFunction

You can add a `indexFunction` attribute along with an index and it will be passed along to the [`indexCreate`](http://rethinkdb.com/api/javascript/index_create/) function.

```javascript
var r = require('rethinkdb');
require('rethinkdb-init')(r);

r.init({
    host: 'localhost',
    port: 28015,
    db: 'helloDatabase'
  },
  [
    {
      name: 'helloTable',
      indexes: [{
        name: 'has_location',
        indexFunction: function (row) {
          return row.hasFields('location');
        },
      }]
    },
  ]
})
.then(function (conn) {
  // All tables and indexes have been created
});
```
### Instantiating  a database with 1 table with a different primaryKey, soft durability, 2 replicas, and 2 shards

You can pass a `primaryKey`, `durability`, `replicas`, or `shards` attribute to a table and it will be passed along to the [`tableCreate`](http://rethinkdb.com/api/javascript/table_create/) function.


```javascript
var r = require('rethinkdb');
require('rethinkdb-init')(r);

r.init({
    host: 'localhost',
    port: 28015,
    db: 'helloDatabase'
  },
  [
    {
      name: 'helloTable',
      primaryKey: 'location',
      durability: 'soft'
      replicas: 2,
      shards: 2
    },
  ]
})
.then(function (conn) {
  // All tables and indexes have been created
});
```

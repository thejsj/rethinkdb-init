# RethinkDB Init

A RethinkDB driver plugin to bootstrap all databases, tables and indexes on init.

Often times, application code that uses RethinkDB has a significant portion of code meant for creating the database, tables and indexes ([example]()https://github.com/thejsj/image-pin/blob/master/server/db/index.js). This module is meant so that you can pass an object with the required initial state of your database and get a promise/callback for when all the necesary componentes have been added to the database. This removes a lot of boilerplate code from your application code and makes it easier to understand what is needed in the database to run the application.

## Examples

### Bootstraping a database with a table and an index

```javascript
var r = require(‘rethinkdb’);
require(‘rethinkdb-init’)(r);

r.init({
    host: ‘localhost’,
    port: 28015,
    db: ‘helloDatabase’
  }, [{
    name: ‘helloTable’,
    indexes: [‘superIndex’]
  }]
});
```

### Bootstraping a database with 2 tables and 2 indexes on one of the tables

```javascript
var r = require(‘rethinkdb’);
require(‘rethinkdb-init’)(r);

r.init({
    host: ‘localhost’,
    port: 28015,
    db: ‘helloDatabase’
  },
  [
    {
      name: ‘helloTable’,
      indexes: [‘superIndex’, ‘superDuperIndex’]
    },
    ‘anotherTable’
  ]
});
```

### Bootstraping a database with 4 tables with no indexes

```javascript
var r = require(‘rethinkdb’);
require(‘rethinkdb-init’)(r);

r.init({
    host: ‘localhost’,
    port: 28015,
    db: ‘helloDatabase’
  },
  [
    ‘hello_table’,
    ‘another_table’,
    ‘yet_another_table’,
    ‘one_last_table’,
  ]
});
```

### Bootstraping a database with 1 tables and 1 geo index

```javascript
var r = require(‘rethinkdb’);
require(‘rethinkdb-init’)(r);

r.init({
    host: ‘localhost’,
    port: 28015,
    db: ‘helloDatabase’
  },
  [
    {
      name: ‘helloTable’,
      indexes: {
        name: ‘location’,
        geo: true,
      }
    },
  ]
});
```

### Bootstraping a database with 1 tables and 1 multi+geo index

```javascript
var r = require(‘rethinkdb’);
require(‘rethinkdb-init’)(r);

r.init({
    host: ‘localhost’,
    port: 28015,
    db: ‘helloDatabase’
  },
  [
    {
      name: ‘helloTable’,
      indexes: {
        name: ‘location’,
        geo: true,
        multi: true,
      }
    },
  ]
});
```

### Bootstraping a database with 1 table and 1 index with an indexFunction

```javascript
var r = require(‘rethinkdb’);
require(‘rethinkdb-init’)(r);

r.init({
    host: ‘localhost’,
    port: 28015,
    db: ‘helloDatabase’
  },
  [
    {
      name: ‘helloTable’,
      indexes: {
        name: ‘has_location’,
        indexFunction: function (row) {
          return row.hasFields(‘location’);
        },
      }
    },
  ]
});
```
### Bootstraping a database with 1 table with a different primaryKey, soft durability, 2 replicas, and 2 shards

```javascript
var r = require(‘rethinkdb’);
require(‘rethinkdb-init’)(r);

r.init({
    host: ‘localhost’,
    port: 28015,
    db: ‘helloDatabase’
  },
  [
    {
      name: ‘helloTable’,
      primaryKey: ‘location’,
      durability: ‘soft’
      replicas: 2,
      shards: 2
    },
  ]
});
```


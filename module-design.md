# RethinkDB Init

A RethinkDB driver plugin to bootstrap all databases, tables and indexes on init.

## Basic Idea

```javascript
var r = require(‘rethinkdb-init’)(require(‘rethinkdb’));

r.init({
  host: ‘localhost’,
  port: 28015,
  db: ‘helloDatabase’
},  [{
      name: ‘helloTable’,
      indexes: [‘superIndex’]
    }]
});
```

## Questions?

1. `rethinkdb-init` or `rethinkdb-bootstrap`?
2. Append to prototype or provide a function?
3. Take in a two arguments (a connection and a schema) or one big object?
4. What should be the right name for what you’re passing? It’s not really a schema?
5. What should the callback/promise return? should it return a connection?
6. Should it add the promises to the object? I don’t think so!
7. Add seed data variables so that it adds data automatically!

## Question #1

```javascript
require(‘rethinkdb-init’);
```
or

```javascript
require(‘rethinkdb-bootstrap’);
```

```javascript
require('rethinkdb-seed');
```

```
require('rethinkdb-quickstart');
```

## Question #2 (Resolved #4)

Provide a function
```javascript
// #1
var r = require(‘rethinkdb’);
var rInit = require(‘rethinkdb-init’);
```
or 
Decorator that returns nothing
```javascript
// #2
var r = require(‘rethinkdb’);
require(‘rethinkdb-init’)(r);
```
or 
Decorator that returns r instance
```javascript
// #3
var r = require(‘rethinkdb’);
var r = require(‘rethinkdb-init’)(r);
```
or 
Decorator that returns r function
```javascript
// #4
var r = require(‘rethinkdb’);
var rInit = require(‘rethinkdb-init’)(r);

r.init()
```

## Question #3 (Resolved #1)

Should it take one argument for the connection and another for the schema?

```
// #1
r.init({
  host: ‘localhost’,
  port: 28015,
  db: ‘sharejs’
}, [{
    name: ‘helloDatabase’,
    tables: [‘helloTable’]
  }]
  );
```
or
```
// #2
r.init({
  conneciton: {
    host: ‘localhost’,
    port: 28015,
    db: ‘sharejs’
  },
  databases: [{
    name: ‘helloDatabase’,
    tables: [‘helloTable’]
  }]
});
```
## Question #4

1. schema
2. blueprint
3. seed

## Question #5 (Resolved #1)

What should the init promise return?

```
// #1
r.init({
    host: ‘localhost’,
    port: 28015,
    db: ‘sharejs’
  }, [{
    name: ‘helloDatabase’,
    tables: [‘helloTable’]
  }]
}).then(function (conn) {
  // Store it for later
  r.conn = conn;
});
```
## Question #6 (Resolved #1)

```
// #1
var promise = r.init(config, { });

promise.then(function (conn) {
  // Do something
});
```
or
```
// #2
r.init(config, { });

// Automatically add promise
r.ready.then(function (conn) {
// Do Something
});
```

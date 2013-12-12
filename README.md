# grunt-couch [![Build Status](https://secure.travis-ci.org/jo/grunt-couch.png?branch=master)](http://travis-ci.org/jo/grunt-couch)

Compile CouchDB design documents from Couchapp like directory tree.


## Getting Started

This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before,
be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide,
as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins.
Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-couch --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-couch');
```

## The "couch-compile" task

### Overview

In your project's Gruntfile, add a section named `couch-compile` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  'couch-compile': {
    app: {
      files: {
        'tmp/app.json': 'couch/*'
      }
    }
  }
})
```

This will load the directory tree from `app` and creates an `app.json` JSON file.

See [Configuring tasks: Files](http://gruntjs.com/configuring-tasks#files) for more information
about possible source and target configurations.

### Options

#### options.merge

Your can specify a directory which will be merged into all docs.
This is useful to provide defaults like templates and libs which are used in all ddocs.

Eg:

```js
grunt.initConfig({
  'couch-compile': {
    app: {
      config: {
        merge: 'couch/shared'
      },
      files: {
        'tmp/app.json': 'couch/*'
      }
    }
  }
})
```


### The Couch Directory Tree

is quite self-explanatory. For example:

```shell
app
├── _attachments
│   ├── a
│   │   └── nested
│   │       └── file.txt
│   └── index.html
├── _id
├── language
├── lists
│   └── docs.js
├── rewrites.json
├── shows
│   ├── doc.js
│   └── hello.js
├── validate_doc_update.js
└── views
    ├── names
    │   └── map.js
    └── numbers
        ├── map.js
        └── reduce
```

`grunt-couch` uses the same filesystem mapping like [Couchapp python tool](http://couchapp.org/page/couchapp-python)
and [Erika](https://github.com/benoitc/erica):

[The Couchapp Filesystem Mapping](http://couchapp.org/page/filesystem-mapping).

For the property name the file extension will be stripped:

```js
{
  "validate_doc_update": "content of validate_doc_update.js",
}
```

Files inside the `\_attachments` directory are handled special:
They become attachment entries of the form

```js
{
  "a/nested/file.txt": {
    "data": "SGVsbG8gV29ybGQhCg==",
    "content_type": "text/plain"
  }
}
```

The `content\_type` is quessed using [mime](https://github.com/broofa/node-mime).
`data` is the base64 encoded value of the file.

Read more about the so called [Inline Attachments](http://wiki.apache.org/couchdb/HTTP_Document_API#Inline_Attachments).

### Output JSON

The output JSON follows the [Bulk Document API](http://wiki.apache.org/couchdb/HTTP_Bulk_Document_API):

```js
{
  "docs": [
    { "_id": "adoc" },
    { "_id": "anotherdoc" }
  ]
}
```

## The "couch-push" task

With the `couch-push` task you deploy your documents to CouchDB.

The database is created if not already present.

### Overview

In your project's Gruntfile, add a section named `couch-push` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  'couch-push': {
    options: {
      user: 'karin',
      pass: 'secure'
    },
    localhost: {
      files: {
        'http://localhost:5984/myapp': 'tmp/app.json'
      }
    }
  }
})
```

### Options

You may also pass in all the options as command line arguments
and avoid storing the auth credentials in your gruntfile.

#### options.user

Your username.

#### options.pass

Your password.


## The "couch" task

This is an [Alias task](http://www.google.com/intl/de/landing/nose/help.html) for
`couch-compile` and `couch-push`.
It first compiles and then pushs the documents.


## The "couch-configure" task

You can write [CouchDB configuration](http://wiki.apache.org/couchdb/Complete_HTTP_API_Reference#configuration)
from project files with `couch-configure`.

This comes in handy when you are using [Virtual Hosts](http://wiki.apache.org/couchdb/Virtual_Hosts)
or when your app requires custom configuration options in order to work.

### Overview

In your project's Gruntfile, add a section named `couch-configure` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  'couch-configure': {
    options: {
      user: 'karin',
      pass: 'secure'
    },
    localhost: {
      files: {
        'http://localhost:5984': 'config'
      }
    }
  }
})
```

Now write your configuration options in plain files, eg:

```shell
config/
└── vhosts
    └── myapp.localhost
```

### Options

You may also pass in all the options as command line arguments
and avoid storing the auth credentials in your gruntfile.

#### options.user

Your username.

#### options.pass

Your password.


## The "couch-security" task

You can write [CouchDB _security Objects](http://couchdb.readthedocs.org/en/latest/json-structure.html#security-object)
from project files with `couch-security`.

### Overview

In your project's Gruntfile, add a section named `couch-security` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  'couch-security': {
    options: {
      user: 'karin',
      pass: 'secure'
    },
    localhost: {
      files: {
        'http://localhost:5984/mydb': 'couch/mydb/security.json'
      }
    }
  }
})
```

### Options

You may also pass in all the options as command line arguments
and avoid storing the auth credentials in your gruntfile.

#### options.user

Your username.

#### options.pass

Your password.


## The "couch-replication" task

You can write [CouchDB _replicator Documents](http://couchdb.readthedocs.org/en/latest/replication.html)
from project files with `couch-replication`.

If there is already a replication document, it will gets deleted and recreated,
which causes the replication to restart.

### Overview

In your project's Gruntfile, add a section named `couch-replication` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  'couch-replication': {
    options: {
      user: 'karin',
      pass: 'secure'
    },
    localhost: {
      files: {
        'http://localhost:5984': 'couch/replications/*.json'
      }
    }
  }
})
```

### Options

You may also pass in all the options as command line arguments
and avoid storing the auth credentials in your gruntfile.

#### options.user

Your username.

#### options.pass

Your password.


## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality.
Lint and test your code using [Grunt](http://gruntjs.com/).

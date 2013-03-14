grunt-couch
================

Compile CouchDB design documents from Couchapp like directory tree.


Getting Started
---------------

This plugin requires Grunt `~0.4.0`

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

The "couch" task
---------------

### Overview

In your project's Gruntfile, add a section named `couch` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  couch: {
    app: {
      files: 'app.json': 'app'
    }
  }
})
```

This will load the directory tree from `app` and creates an `app.json` JSON file.

See [Configuring tasks: Files](http://gruntjs.com/configuring-tasks#files) for more information
about possible source and target configurations.

### The Couch Directory Tree

is quiet self-explanatory. For example:

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

The "push" task
---------------

### Overview

In your project's Gruntfile, add a section named `push` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  push: {
    options: {
      user: 'karin',
      pass: 'secure'
    },
    app: {
      files: 'http://localhost:5984/myapp': 'app.json'
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


Contributing
------------

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality.
Lint and test your code using [Grunt](http://gruntjs.com/).


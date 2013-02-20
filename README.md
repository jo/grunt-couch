# grunt-couch

> Build and publish Couchapps and CouchDB design documents with grunt. Simple.

## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-couch --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-couch');
```

## The "couch" task

### Overview
In your project's Gruntfile, add a section named `couch` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  couch: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    }
  }
})
```

### Options

#### options.server
Type: `String`
Default value: `'http://127.0.0.1'`

The server url.

#### options.db
Type: `String`
Default value: `''`

The database name.

#### options.user
Type: `String`
Default value: `''`

Your username.

#### options.pass
Type: `String`
Default value: `''`

Your password.

### Usage Examples

#### Default Options

Publish to `http://127.0.0.1:5984/mydb` and authenticate with `bernd:secure`

```js
grunt.initConfig({
  couch: {
    options: {
      db: 'mydb',
      user: 'bernd',
      pass: 'secure'
    }
  }
})
```

#### Custom Options

Publish to two servers with different auth:

```js
grunt.initConfig({
  couch: {
    options: {
      db: 'mydb',
      user: 'bernd',
      pass: 'secure'
    },
    development: {
      options: {
        user: 'bernd',
        pass: 'secure'
      }
    },
    production: {
      options: {
        user: 'admin',
        pass: 'supersecure'
      }
    }
  }
})
```

#### Commandline Options

You may also pass in all the options as command line arguments and avoid storing the auth credentials in your gruntfile.


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

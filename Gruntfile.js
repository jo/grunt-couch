/*
 * grunt-couch
 * https://github.com/jo/grunt-couch
 *
 * Copyright (c) 2013 Johannes J. Schmidt, TF
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: 'tmp',
    },

    // Configuration to be run (and then tested).
    'couch-compile': {
      simple: {
        files: {
          'tmp/simple.json': 'test/fixtures/simple'
        }
      },
      full: {
        files: {
          'tmp/full.json': 'test/fixtures/full'
        }
      },
      advanced: {
        files: {
          'tmp/advanced.json': 'test/fixtures/advanced/*'
        }
      },
      merge: {
        options: {
          merge: 'test/fixtures/merge/shared'
        },
        files: {
          'tmp/merge.json': 'test/fixtures/merge/*'
        }
      },
      jsonfile: {
        files: {
          'tmp/jsonfile.json': 'test/fixtures/jsonfile/app.json'
        }
      },
      jsfile: {
        files: {
          'tmp/jsfile.json': 'test/fixtures/jsfile/app.js'
        }
      }
    },

    // Unit tests.
    nodeunit: {
      tests: 'test/*_test.js'
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'couch-compile', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);
};

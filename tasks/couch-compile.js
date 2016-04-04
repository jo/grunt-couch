/*
 * grunt-couch
 * https://github.com/jo/grunt-couch
 *
 * Copyright (c) 2013 Johannes J. Schmidt, TF
 * Licensed under the MIT license.
 */

'use strict';
var _ = require('lodash');
var async = require('async');
var compile = require('couchdb-compile');

module.exports = function(grunt) {
  grunt.registerMultiTask('couch-compile', 'Compile documents from directories, JSON files or modules.', function() {
    var options = this.options();
    var files = this.files;
    var sharedDirs = options.merge ? grunt.file.expand(options.merge) : [];
    var shared = {};
    var done = this.async();

    function processShared(dir, next) {
      compile(dir, options, function(err, doc) {
        if (err) {
          return next(err);
        }

        _.merge(shared, doc);
        
        // Don't clobber _id attributes with a shared _id
        delete shared._id;

        grunt.log.write('Compiling shared ' + dir + '...').ok();
        next(null, doc);
      });
    }

    function processSource(source, next) {
      compile(source, options, function(err, doc) {
        if (err) {
          return next(err);
        }

        _.merge(doc, shared);
        
        grunt.log.write('Compiling ' + source + '...').ok();
        next(null, doc);
      });
    }

    function processFile(file, next) {
      // do not process shared directories
      var sources = file.src.filter(function(source) {
        return sharedDirs.indexOf(source) === -1;
      });

      async.map(sources, processSource, function(err, docs) {
        if (err) {
          return next(err);
        }

        grunt.log.write('Writing ' + file.dest + '...');
        grunt.file.write(file.dest, JSON.stringify({ docs: docs }, '\n', '  '));
        grunt.log.ok();
        grunt.log.ok(file.src.length + ' ' + grunt.util.pluralize(file.src.length, 'doc/docs') + ' compiled');

        next();
      });
    }

    async.each(sharedDirs, processShared, function(err) {
      if (err) {
        grunt.log.error(err);
        return done(false);
      }

      async.each(files, processFile, function(err) {
        if (err) {
          grunt.log.error(err);
          return done(false);
        }

        done();
      });
    });
  });
};

/*
 * grunt-couch
 * https://github.com/jo/grunt-couch
 *
 * Copyright (c) 2013 Johannes J. Schmidt, TF
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  var path = require('path');
  var mime = require('mime');

  function readFile(filename) {
    if (filename.match(/\.json$/)) {
      return grunt.file.readJSON(filename);
    }
    return grunt.file.read(filename).trim();
  }

  function compileDocs(dirs) {
    return {
      docs: dirs.map(compile)
    };
  }

  function compile(dir) {
    var doc = {};

    grunt.log.write('Compiling ' + dir + '...');

    [
      '_id',
      'language',
      'views',
      'shows',
      'lists',
      'rewrites.json',
      'validate_doc_update.js'
    ].forEach(function(file) {
      var filename = path.join(dir, file);

      if (!grunt.file.exists(filename)) {
        return;
      }

      if (grunt.file.isFile(filename)) {
        var name = file.replace(/\.[^\.]*$/, '');
        doc[name] = readFile(filename);
      } else {
        grunt.file.recurse(filename, function(abspath, rootdir, subdir, f) {
          if (!grunt.file.isFile(abspath)) {
            return;
          }

          var parts = path.relative(dir, abspath).split('/');
          parts.pop();
          var part = parts.reduce(function(result, key) {
            result[key] = result[key] || {};
            return result[key];
          }, doc);

          var name = f.replace(/\.[^\.]*$/, '');
          part[name] = readFile(abspath); 
        });
      }
    });
    
    // attachments
    var dirname = path.join(dir, '_attachments');
    if (grunt.file.exists(dirname)) {
      doc._attachments = {};
      grunt.file.recurse(dirname, function(abspath, rootdir, subdir, file) {
        if (!grunt.file.isFile(abspath)) {
          return;
        }

        var name = path.relative(dirname, abspath);
        doc._attachments[name] = {
          data: grunt.file.read(abspath, { encoding: null }).toString('base64'),
          content_type: mime.lookup(abspath)
        };
      });
    }

    grunt.log.ok();
    
    return doc;
  }

  grunt.registerMultiTask('ddoc', 'Compile CouchDB design documents from Couchapp like directory tree.', function() {
    this.files.forEach(function(file) {
      var docs = compileDocs(file.src);

      grunt.log.write('Writing ' + file.dest + '...');
      grunt.file.write(file.dest, JSON.stringify(docs, '\n', '  '));
      grunt.log.ok();
    });
  });

};

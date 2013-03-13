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

  function compileDocs(dirs) {
    return {
      docs: dirs.map(compile)
    };
  }

  function compile(dir) {
    var doc = {};

    grunt.log.write('Compiling ' + dir + '...');

    var files = grunt.file.expand({
      filter: 'isFile',
      matchBase: true,
      cwd: dir
    }, '*');

    files.forEach(function(filename) {
      var name;
      var parts = filename.split('/');
      var abspath = path.join(dir, filename);

      if (parts[0] === '_attachments') {
        parts.shift();
        name = parts.join('/');
        doc._attachments = doc._attachments || {};
        doc._attachments[name] = {
          data: grunt.file.read(abspath, { encoding: null }).toString('base64'),
          content_type: mime.lookup(abspath)
        };
      } else {
        name = parts.pop().replace(/\.[^\.]*$/, '');
        var part = parts.reduce(function(result, key) {
          result[key] = result[key] || {};
          return result[key];
        }, doc);

        if (filename.match(/\.json$/)) {
          part[name] = grunt.file.readJSON(abspath);
        } else {
          part[name] = grunt.file.read(abspath).trim();
        }
      }
    });

    grunt.log.ok();
    
    return doc;
  }

  grunt.registerMultiTask('couch', 'Compile CouchDB JSON documents from directory tree.', function() {
    this.files.forEach(function(file) {
      var docs = compileDocs(file.src);

      grunt.log.write('Writing ' + file.dest + '...');
      grunt.file.write(file.dest, JSON.stringify(docs, '\n', '  '));
      grunt.log.ok();
    });
  });

};

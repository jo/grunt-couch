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

  /*
   * Recursively transform an object into a JSON compatible representation
   * and preserve methods by calling toString() on the function objects.
   */
  function objToJson(obj) {
    return grunt.util._.object(
      grunt.util._.map(obj, function(value, key) {
        if (typeof value === 'function') {
          return [key, value.toString()];
        } else if (typeof value === 'object') {
          return [key, objToJson(value)];
        } else {
          return [key, value];
        }
      })
    );
  }

  function compileFromPath(filepath, shared, options) {
    if (grunt.file.isDir(filepath)) {
      return grunt.util._.merge({}, shared, compile(filepath, options));
    } else if (grunt.util._.endsWith(filepath, '.js')) {
      var fullpath = path.join(process.cwd(), path.normalize(filepath));
      return objToJson(require(fullpath));
    } else {
      return grunt.file.readJSON(filepath);
    }
  }

  function compileDocs(dirs, options) {
    var shared = {};

    if (options.merge) {
      grunt.log.write('Compiling shared ' + options.merge + '...');
      shared = compile(options.merge, options);
      grunt.log.ok();
    }

    return {
      docs: grunt.util._.compact(dirs.map(function(dir) {
        if (options.merge && dir === options.merge) {
          return null;
        }

        grunt.log.write('Compiling ' + dir + '...');
        var doc = compileFromPath(dir, shared, options);
        grunt.log.ok();

        return doc;
      }))
    };
  }

  function compile(dir, options) {
    var doc = {};

    var files = grunt.file.expand({
      filter: 'isFile',
      matchBase: true,
      cwd: dir
    }, options.pattern);

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

        if (grunt.util._.endsWith(filename, '.json')) {
          part[name] = grunt.file.readJSON(abspath);
        } else {
          part[name] = grunt.file.read(abspath).trim();
        }
      }
    });
    
    return doc;
  }

  grunt.registerMultiTask('couch-compile', 'Compile CouchDB JSON documents from directory tree.', function() {
    var options = this.options({
      pattern: '*'
    });

    this.files.forEach(function(file) {
      var docs = compileDocs(file.src, options);

      grunt.log.write('Writing ' + file.dest + '...');
      grunt.file.write(file.dest, JSON.stringify(docs, '\n', '  '));
      grunt.log.ok();
      grunt.log.ok(file.src.length + ' ' + grunt.util.pluralize(file.src.length, 'doc/docs') + ' compiled');
    });
  });
};

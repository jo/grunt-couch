/*
 * grunt-couch
 * https://github.com/null2/grunt-couch
 *
 * Copyright (c) 2013 Johannes J. Schmidt, null2 GmbH
 * Licensed under the MIT license.
 */

'use strict';

var request = require('request');

module.exports = function(grunt) {

  grunt.registerMultiTask('couch', 'Build and publish Couchapps and CouchDB design documents with grunt.', function() {
    function readFile(filename) {
      if (filename.match(/\.json$/)) {
        return grunt.file.readJSON(filename);
      }
      return grunt.file.read(filename).trim();
    }

    // Merge task-specific and/or target-specific options with command line options and these defaults.
    var options = this.options({
          server: 'http://127.0.0.1:5984'
        }),
        server = grunt.option('server') || options.server,
        db = grunt.option('db') || options.db,
        auth = {
          user: grunt.option('user') || options.user,
          pass: grunt.option('pass') || options.pass
        };

    if (!db) {
      grunt.log.error('I need a db!');
      return;
    }

    var doc = {};

    grunt.log.write('Building ddoc...');
    [
      '_id',
      'views',
      'shows',
      'lists',
      'rewrites.json',
      'validate_doc_update.js'
    ].forEach(function(file) {
      if (!grunt.file.exists(file)) {
        return;
      }

      if (grunt.file.isFile(file)) {
        var name = file.replace(/\..*$/, '');
        doc[name] = readFile(file);
      } else {
        grunt.file.recurse(file, function(abspath, rootdir, subdir, view) {
          if (!grunt.file.isFile(abspath)) {
            return;
          }

          var parts = abspath.split('/');
          var part = parts.reduce(function(result, key) {
            result[key] || (result[key] = {});
            return result[key];
          }, doc);

          var name = parts.pop().replace(/\..*$/, '');
          part[name] = readFile(abspath); 
        });
      }
    });
    if (grunt.file.exists('_attachments')) {
      doc._attachments = {};
      grunt.file.recurse('_attachments', function(abspath, rootdir, subdir, file) {
        if (!grunt.file.isFile(abspath)) {
          return;
        }

        var name = abspath.replace(/^_attachments\//, '');
        doc._attachments[name] = {
          data: grunt.file.read(abspath, { encoding: null }).toString('base64'),
          content_type: 'text/plain'
        };
      });
    }
    grunt.log.ok();

    var defaults = {
          json: true
        },
        url = server + '/' + encodeURIComponent(db) + '/' + encodeURIComponent(doc._id);

    if (auth.user && auth.pass) {
      defaults.auth = auth;
    }
    var req = request.defaults(defaults),
        done = this.async();
    req(url, function(err, resp, data) {
      if (data) {
        doc._rev = data._rev;
      }
      // grunt.log.write(JSON.stringify(doc, null, '  '));
      // grunt.log.write('\n');
      grunt.log.write('Pushing to ' + url + '...');
      req(url, { method: 'PUT', body: doc }, function(err, resp) {
        var ok = resp.statusCode === 201;

        ok ? grunt.log.ok() : grunt.log.error(resp.statusCode);

        done(ok);
      });
    });
  });

};

/*
 * grunt-couch
 * https://github.com/jo/grunt-couch
 *
 * Copyright (c) 2013 Johannes J. Schmidt, TF
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
  var request = require('request');

  function push(doc, url, auth, done) {
    var defaults = {
      json: true,
      method: 'POST'
    };

    if (auth && auth.user && auth.pass) {
      defaults.auth = auth;
    }
    
    var keys = {
      keys: doc.docs.map(function(d) { return d._id; })
    };

    var req = request.defaults(defaults);
    req(url + '/_all_docs', { body: keys }, function(err, resp, data) {
      if (data && data.rows) {
        for (var i = 0; i < data.rows.length; i++) {
          if (data.rows[i].value) {
            doc.docs[i]._rev = data.rows[i].value.rev;
          }
        }
      }
      req(url + '/_bulk_docs', { body: doc }, function(err, resp, data) {
        var ok = resp.statusCode === 201;

        grunt.log.write('Pushing ' + url + '...');
        if (ok) {
         grunt.log.ok();
        } else {
         grunt.log.error(resp.statusCode);
        }

        done(ok);
      });
    });
  }

  grunt.registerMultiTask('push', 'Push CouchDB design documents.', function() {
    // Merge task-specific and/or target-specific options with command line options and these defaults.
    var auth = {
      user: grunt.option('user') || this.options.user,
      pass: grunt.option('pass') || this.options.pass
    };

    var done = this.async();
    var count = this.files.reduce(function(sum, file) { return sum + file.src.length; }, 0);
    var errors = 0;
    this.files.forEach(function(file) {
      file.src.forEach(function(src) {
        var doc = grunt.file.readJSON(src);
        push(doc, file.dest, auth, function(success) {
          if (!success) {
            errors++;
          }
          count--;
          if (!count) {
            done(!errors);
          }
        });
      });
    });
  });
};

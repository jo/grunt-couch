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

  function bulkDocs(msg, req, url, doc, done) {
    req(url + '/_replicator/_bulk_docs', { body: doc }, function(err, resp, data) {
      grunt.log.write(msg + ' ' + url + '...');

      if (err) {
        grunt.log.error(err);
        done(false);
        return;
      }

      var ok = (resp.statusCode === 201 || resp.statusCode === 202) &&
        grunt.util._.every(data, function(d) { return !d.error; });

      if (ok) {
        grunt.log.ok();
      } else {
        grunt.log.error(resp.statusCode, data);
      }

      done(ok);
    });
  }

  function cancelReplications(req, url, doc, done) {
    bulkDocs('Cancelling replications', req, url, doc, done);
  }
  
  function startReplications(req, url, doc, done) {
    bulkDocs('Starting replications', req, url, doc, done);
  }
  
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
    req(url + '/_replicator/_all_docs', { body: keys }, function(err, resp, data) {
      if (err) {
        grunt.log.error(err);
        done(false);
        return;
      }

      if (resp.statusCode === 200) {
        if (data && data.rows) {
          // delete current replication docs
          var docs = grunt.util._.compact(data.rows.map(function(row) {
            if (!row.value) {
              return null;
            }
            return {
              _id: row.id,
              _rev: row.value.rev,
              _deleted: true
            };
          }));
          return cancelReplications(req, url, { docs: docs }, function(ok) {
            if (!ok) {
              return done(false);
            }

            startReplications(req, url, doc, done);
          });
        }

        return startReplications(req, url, doc, done);
      }

      grunt.log.error(resp.statusCode, data);
      done(false);
    });
  }

  grunt.registerMultiTask('couch-replication', 'Push CouchDB replication documents.', function() {
    var options = this.options();

    // Merge task-specific and/or target-specific options with command line options and these defaults.
    var auth = {
      user: grunt.option('user') || options.user,
      pass: grunt.option('pass') || options.pass
    };

    var done = this.async();
    var count = this.files.length;
    var urls = this.files.length;
    var errors = 0;
    this.files.forEach(function(file) {
      var doc = {
        docs: file.src.map(function(src) {
          return grunt.file.readJSON(src);
        })
      };
      push(doc, file.dest, auth, function(success) {
        if (!success) {
          errors++;
        }
        count--;
        if (!count) {
          if (!errors) {
            grunt.log.ok(urls + ' ' + grunt.util.pluralize(urls, 'database/databases') + ' deployed');
          }
          done(!errors);
        }
      });
    });
  });
};

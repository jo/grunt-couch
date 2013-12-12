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

  function createDatabase(auth, url, done) {
    request.put(url, { json: true, auth: auth }, function(err, resp, data) {
      grunt.log.write('Creating database ' + url + '...');
      if (err) {
        grunt.log.error(err);
      } else {
        grunt.log.ok();
      }

      done(err);
    });
  }
  
  function pushDocs(auth, url, doc, done) {
    request.post(url + '/_bulk_docs', { body: doc, json: true, auth: auth }, function(err, resp, data) {
      grunt.log.write('Pushing ' + url + '...');

      if (err) {
        grunt.log.error(err);
        done(err);
        return;
      }

      var ok = (resp.statusCode === 201 || resp.statusCode === 202) &&
        grunt.util._.all(data, function(d) { return !d.error; });

      if (ok) {
        grunt.log.ok();
      } else {
        grunt.log.error(resp.statusCode, data);
      }
      
      done(ok ? null : data);
    });
  }
  
  function push(doc, url, auth, done) {
    var keys = {
      keys: doc.docs.map(function(d) { return d._id; })
    };

    request.post(url + '/_all_docs', { body: keys, json: true, auth: auth }, function(err, resp, data) {
      if (err) {
        grunt.log.error(err);
        done(err);
        return;
      }

      grunt.log.write('Get revisions ' + url + '...');
      if (resp.statusCode === 200) {
        grunt.log.ok();
        if (data && data.rows) {
          for (var i = 0; i < data.rows.length; i++) {
            if (data.rows[i].value) {
              doc.docs[i]._rev = data.rows[i].value.rev;
            }
          }
        }
        return pushDocs(auth, url, doc, done);
      }

      if (resp.statusCode === 404) {
        grunt.log.ok('database does not exist');
        return createDatabase(auth, url, function(success) {
          pushDocs(auth, url, doc, done);
        });
      }

      grunt.log.error(resp.statusCode, data);
      done(data);
    });
  }

  var async = require('async');
  grunt.registerMultiTask('couch-push', 'Push CouchDB design documents.', function() {
    var options = this.options();

    // Merge task-specific and/or target-specific options with command line options and these defaults.
    var user = grunt.option('user') || options.user;
    var pass = grunt.option('pass') || options.pass;
    var auth = user && pass ? { user: user, pass: pass } : null;

    var done = this.async();
    var files = this.files;

    // FIXME: Initiating parallel requests results in
    // EPIPE or ECONNRESET errors when the database does not exist.

    async.eachSeries(files, function(file, next) {
        if (file.src.length === 0) {
          grunt.log.error("Could not find files: \"" + file.orig.src + "\"");        
        } else {
          async.each(file.src, function(src, nextSrc) {
            push(grunt.file.readJSON(src), file.dest, auth, nextSrc);
          }, next);
        }
    }, function(err) {
      if (err) {
        grunt.log.error(err);
        return done(false);
      }
            
      grunt.log.ok(files.length + ' ' + grunt.util.pluralize(files.length, 'database/databases') + ' deployed');
      done(true);
    });
  });
};

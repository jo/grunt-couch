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

  function createDatabase(req, url, done) {
    req(url, { method: 'PUT' }, function(err, resp, data) {
      if (err) {
        grunt.log.error(err);
        done(err);
        return;
      }

      var ok = resp.statusCode === 201;
      grunt.log.write('Creating database ' + url + '...');
      if (ok) {
        grunt.log.ok();
      } else {
        grunt.log.error(resp.statusCode, data);
      }
      done(null);
    });
  }
  
  function pushDocs(req, url, doc, done) {
    req(url + '/_bulk_docs', { body: doc }, function(err, resp, data) {
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

      done(null);
    });
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
    req(url + '/_all_docs', { body: keys }, function(err, resp, data) {
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
        return pushDocs(req, url, doc, done);
      }

      if (resp.statusCode === 404) {
        grunt.log.ok('database does not exist');
        return createDatabase(req, url, function(success) {
          pushDocs(req, url, doc, done);
        });
      }

      grunt.log.error(resp.statusCode, data);
      done(data);
    });
  }

  grunt.registerMultiTask('couch-push', 'Push CouchDB design documents.', function() {
    var options = this.options();

    // Merge task-specific and/or target-specific options with command line options and these defaults.
    var auth = {
      user: grunt.option('user') || options.user,
      pass: grunt.option('pass') || options.pass
    };

    var done = this.async();
    var files = this.files;
    grunt.util.async.map(files, function(file, done) {
      grunt.util.async.map(file.src, function(src, next) {
        push(grunt.file.readJSON(src), file.dest, auth, next);
      }, done);
    }, function(err) {
      if (err) {
        grunt.log.error(err);
        done(false);
        return;
      }
            
      grunt.log.ok(files.length + ' ' + grunt.util.pluralize(files.length, 'database/databases') + ' deployed');
      done(true);
    });

    this.files.forEach(function(file, i, files) {
    });
  });
};

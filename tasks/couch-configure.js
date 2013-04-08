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
  var path = require('path');

  function readConfig(dir, options) {
    var files = grunt.file.expand({
      filter: 'isFile',
      matchBase: true,
      cwd: dir
    }, options.pattern);

    return files.map(function(filename) {
      return {
        key: filename,
        value: grunt.file.read(path.join(dir, filename)).trim()
      };
    });
  }

  function configure(config, url, auth, done) {
    var defaults = {
      json: true,
      method: 'PUT'
    };

    if (auth && auth.user && auth.pass) {
      defaults.auth = auth;
    }

    grunt.log.write('Writing ' + config.key + '=' + config.value + '...');

    var req = request.defaults(defaults);
    req(url + '/_config/' + config.key, { body: JSON.stringify(config.value) }, function(err, resp, data) {
      if (err) {
        grunt.log.error(err);
        done(false);
        return;
      }

      if (resp.statusCode !== 200) {
        grunt.log.error(resp.statusCode, data);
      } else {
        grunt.log.ok();
      }

      done(resp.statusCode === 200);
    });
  }

  grunt.registerMultiTask('couch-configure', 'Configure CouchDB.', function() {
    // Merge task-specific and/or target-specific options with command line options and these defaults.
    var options = this.options({
      pattern: '*'
    });

    var auth = {
      user: grunt.option('user') || options.user,
      pass: grunt.option('pass') || options.pass
    };

    var done = this.async();
    var count = this.files.reduce(function(sum, file) { return sum + file.src.length; }, 0);
    var urls = this.files.length;
    var errors = 0;
    this.files.forEach(function(file) {
      file.src.forEach(function(src) {
        var config = readConfig(src, options);

        config.forEach(function(config) {
          configure(config, file.dest, auth, function(success) {
            if (!success) {
              errors++;
            }
            count--;
            if (!count) {
              if (!errors) {
                grunt.log.ok(urls + ' CouchDB ' + grunt.util.pluralize(urls, 'server/servers') + ' configured');
              }
              done(!errors);
            }
          });
        });
      });
    });
  });
};

'use strict';

var grunt = require('grunt');

exports.couch = ['simple', 'full', 'advanced', 'merge', 'jsonfile', 'jsfile'].reduce(function(tests, name) {
  tests[name]= function(test) {
    test.expect(1);

    var actual = grunt.file.readJSON('tmp/' + name + '.json');
    var expected = grunt.file.readJSON('test/expected/' + name + '.json');
    test.deepEqual(actual, expected, 'should have compiled doc.');

    test.done();
  };

  return tests;
}, {});

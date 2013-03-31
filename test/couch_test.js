'use strict';

var grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.couch = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  simple: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/simple.json');
    var expected = grunt.file.read('test/expected/simple.json');
    test.equal(actual, expected, 'should compile a simple doc.');

    test.done();
  },
  full: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/full.json');
    var expected = grunt.file.read('test/expected/full.json');
    test.equal(actual, expected, 'should compile a full featured doc.');

    test.done();
  },
  advanced: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/advanced.json');
    var expected = grunt.file.read('test/expected/advanced.json');
    test.equal(actual, expected, 'should compile multiple docs.');

    test.done();
  },
  merge: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/merge.json');
    var expected = grunt.file.read('test/expected/merge.json');
    test.equal(actual, expected, 'should merge properties from shared doc.');

    test.done();
  }
};

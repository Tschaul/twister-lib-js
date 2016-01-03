/* global describe, it */

var assert = require('assert')
var reverse = require('../')
var reverseInplace = require('../inplace')
var fixtures = require('./fixtures')

describe('reverse', function () {
  fixtures.forEach(function (f) {
    it('returns ' + f.expected + ' for ' + f.a, function () {
      var a = new Buffer(f.a, 'hex')
      var actual = reverse(a)

      assert.equal(actual.toString('hex'), f.expected)

      // input unchanged
      assert.equal(a.toString('hex'), f.a)
    })
  })
})

describe('reverse/inplace', function () {
  fixtures.forEach(function (f) {
    it('returns ' + f.expected + ' for ' + f.a, function () {
      var a = new Buffer(f.a, 'hex')
      var actual = reverseInplace(a)

      assert.equal(actual.toString('hex'), f.expected)

      // input mutated
      assert.equal(a.toString('hex'), f.expected)
    })
  })
})

module.exports = function reverse (a) {
  var length = a.length
  var buffer = new Buffer(length)

  for (var i = 0, j = length - 1; i < length; ++i, --j) {
    buffer[i] = a[j]
  }

  return buffer
}

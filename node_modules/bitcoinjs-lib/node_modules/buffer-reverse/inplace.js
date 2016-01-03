module.exports = function reverseInplace (a) {
  var length = a.length

  for (var i = 0, j = length - 1; i < length / 2; ++i, --j) {
    var t = a[j]

    a[j] = a[i]
    a[i] = t
  }

  return a
}

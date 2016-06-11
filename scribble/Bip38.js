var Bip38 = require('bip38')
 
var privateKeyWif = '5KN7MzqK5wt2TP1fQCYyHBtDrXdJuXbUzm4A9rKAteGu3Qi5CVR'
 
var bip38 = new Bip38()
var encrypted = bip38.encrypt(privateKeyWif, 'TestingOneTwoThree', "1Jq6MksXQVWzrznvZzxkV6oY57oWXD9TXB", function (status) {
    console.log(status.percent) // Will print the precent every time current increases by 1000 
})
console.log(encrypted) 
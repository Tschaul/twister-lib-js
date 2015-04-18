
Twister = require("../src/Twister.js");

Twister.init({
    host: 'http://user:pwd@127.0.0.1:28332',
});

Twister.RPC("listwalletusers", [], function(res){
	
	console.log(res);

},  function(res){
	
	console.log(res);

});
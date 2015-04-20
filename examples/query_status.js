// For this to work twisterd must be running at localhost

Twister = require("../src/Twister.js")

Twister.init({
    host: 'http://user:pwd@127.0.0.1:28332'
});

Twister.getUser("tschaul").doStatus(function(post){
    
	console.log(post._data)
});
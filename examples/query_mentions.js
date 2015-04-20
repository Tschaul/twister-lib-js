
Twister = require("../src/Twister.js");

Twister.init({
    host: 'http://user:pwd@127.0.0.1:28332',
});

Twister.getUser("mfreitas").doMentions(function(mentions){
	for(var i in mentions){
    	console.log(mentions[i].getTimestamp()+": "+mentions[i].getUsername()+": "+mentions[i].getContent());
	}
});
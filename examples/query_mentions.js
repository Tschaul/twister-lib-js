
Twister = require("../src/Twister.js");

Twister.getUser("mfreitas").doMentions(function(mentions){
	for(var i in mentions){
    	console.log(mentions[i].getTimestamp()+": "+mentions[i].getUsername()+": "+mentions[i].getContent());
	}
});
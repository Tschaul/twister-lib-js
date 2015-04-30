// For this to work twisterd must be running at localhost

Twister = require("../src/Twister.js")

var tschaul = Twister.getUser("tschaul");

tschaul.doFollowings(function(followings){
    
	for(var i in followings) {
	
		outdatedTimestamp = Date.now()/1000 - 24*60*60;

		Twister.getUser(followings[i].getUsername()).doLatestPostsUntil(function(post){

			if (post.getTimestamp()>outdatedTimestamp) {
				console.log(post.getContent());
			} else {
				return false;
			}

		});
		
	}

});
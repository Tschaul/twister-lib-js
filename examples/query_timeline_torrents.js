// For this to work twisterd must be running at localhost

Twister = require("../src/Twister.js")

Twister.init({
    host: 'http://user:pwd@127.0.0.1:28332',
	verifySignatures: false
});


Twister.loadServerAccounts(function(){

	//console.log(Twister._wallet)
	
	Twister.getAccount("tschaul").activateTorrents(function(){
	
		Twister.getUser("tschaul").doFollowings(function(followings){

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
		
	});
	
});
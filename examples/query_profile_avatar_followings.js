// For this to work twisterd must be running at localhost

Twister = require("../src/Twister.js")

Twister.init({
    
    host: 'http://user:pwd@127.0.0.1:28332',
    
});

//var tschaul = Twister.getUser("tschaul");

Twister.getUser("tschaul").doProfile(function(profile){
    
    console.log(profile.getAllFields());

});

Twister.getUser("tschaul").doAvatar(function(avatar){
    
    console.log(avatar.getUrl());

});

Twister.getUser("tschaul").doFollowings(function(followings){
    
	for(var i in followings) {
    	console.log(followings[i].getUsername());
	}

});
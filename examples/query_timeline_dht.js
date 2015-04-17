// For this to work twisterd must be running at localhost

Twisterblub = require("../src/Twister.js")

var tschaul = Twisterblub.getUser("tschaul");

Twisterblub.init({
    host: 'http://user:pwd@127.0.0.1:28332',
});

tschaul.doFollowings(function(following){
    
    Twisterblub.getUser(following.getUsername()).doPostsSince(Date.now()/1000 - 24*60*60,function(post){
        
        console.log(post.getContent());
        
    });

});
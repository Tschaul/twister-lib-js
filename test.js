Twisterblub = require("./Twister.js")

var tschaul = Twisterblub.getUser("tschaul");

Twisterblub.init({
    host: 'http://twister-proxy.tschaul.com:80',
});



tschaul.doFollowings(function(following){
    
    Twisterblub.getUser(following).doPostsSince(Date.now()/1000 - 24*60*60,function(post){
        
        console.log(post.getContent());
        
    });

});
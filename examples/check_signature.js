// For this to work twisterd must be running at localhost

Twister = require("../Twister.js")

Twister.init({
    host: 'http://user:pwd@127.0.0.1:28332',
});

//var tschaul = Twister.getUser("tschaul");
/*
var payload1 = JSON.parse(' {"sig_userpost":"1fd6d2b6f87d247f84dd18dae0fda5cdd867bba9d16a564222bf9d3e7fbc2c761cc828c3e0667284b265cb1ea19c82ef6b96517b5b39989184861c8f32897e6cfa","userpost":{"height":81729,"k":38,"lastk":35,"msg":"@arco That looks really nice!","n":"tschaul","reply":{"k":37,"n":"arco"},"time":1428653527}}');

Twister.getUser("tschaul")._verifyAndCachePost(payload1,function(post){
    
    console.log("verified message: "+post.getContent());

});
*/


Twister.getUser("tschaul").doPost(33,function(post){
    
    //post.doRetwistedPost(function(post){
    
        console.log("verified retwisting post: "+post.getRetwistedContent());
        
    //});

});

Twister.getUser("tschaul").doPost(3,function(post){
    
    //post.doRetwistedPost(function(post){
    
        console.log("verified normal post: "+post.getContent());
        
    //});

});
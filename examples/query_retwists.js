
Twister = require("../src/Twister.js");

Twister.getUser("hn").doPost(13670,function(post){
    
    post.doRetwistingPosts(function(retwists){
    
        for (var i in retwists) {
      
          console.log(retwists[i].getTimestamp()+": "+retwists[i].getUsername());
          
        }
      
    });

});
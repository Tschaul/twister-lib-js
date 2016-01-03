 /*
 * Similarly to posts (see previous example), we can query other user based 
 * resources such as the profile ...
 */

Twister = require("../src/Twister.js")

Twister.getUser("tschaul").doProfile().then(function(profile){
    
  console.log("tschaul's full name is "+profile.getField("fullname"));

}).catch(function(error){console.log(error)});

Twister.getUser("tschaul").doPost(34).then(function(post){
    
	if (post.isRetwist()) {
      console.log("retwist:"+post.getRetwistedContent())
    } else {
      console.log("normal post:"+post.getContent())
    }
      
});
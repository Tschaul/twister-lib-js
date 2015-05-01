 /*
 * First we need to instantiate the Twister object from the library using require. If you use 
 * the browserified version ("twister-lib.js" file from the main directoy), this is already 
 * done for you. By default the api endpoint is setup as http://user:pwd@127.0.0.1:28332 . 
 * So make sure twisterd is running localy. Alternatively you can setup a different 
 * host-address by calling Twister.setup({host:"address"}). 
 * 
 * In the first example The status (latest post) of a user is queried. Because we have not 
 * activated any torrents, it will perform the query on the DHT. More about torrents later.
 * In order to get to the post we first have to get to the corresponding user object by calling
 * Twister.getUser(...). From the result we can call the doStatus(...) method. This method, as 
 * all methods in twister-lib-js that start with "do", takes a callback function that is run
 * with the result of the query as argument after the query is completed. So "get" functions
 * return the result and "do" function call a callback with the result.
 * 
 * In this particular example, we test weither the post is a retwist and print out the content 
 * of the post or the content of the retwisted post respectively. 
 * 
 * Other methods of the post object are: getUsername(), getTimestamp(), isReply(), 
 * getReplyId(), getReplyUsername(), getRetwistedUsername(), getId(), getLastId(). 
 * Add some of them to the print commands. 
 */

Twister = require("../src/Twister.js")

Twister.getUser("tschaul").doStatus(function(post){
  
  if (post.isRetwist()) {
    console.log("retwist:"+post.getRetwistedContent())
  } else {
    console.log("normal post:"+post.getContent())
  }
      
});


/*
 * Querying not the latest but any post of a given user by its id this can be done using the 
 * doPost(...) function of the user:
 */

Twister.getUser("tschaul").doPost(34,function(post){
    
	if (post.isRetwist()) {
      console.log("retwist:"+post.getRetwistedContent())
    } else {
      console.log("normal post:"+post.getContent())
    }
      
});
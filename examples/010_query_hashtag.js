/*
 * Hashtag resources are not assigned to a user. Therefore they are queried directly from 
 * the Twister object.
 */

Twister = require("../src/Twister.js");

Twister.doHashtagPosts("news",function(posts){
  
  for (var i in posts) {
  
    console.log(posts[i].getUsername()+": "+posts[i].getContent());
    
  }
  
});

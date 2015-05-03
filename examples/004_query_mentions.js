/*
 * ... the mentions (here, the callback argument is an array of post objects) ...
 */

Twister = require("../src/Twister.js")

Twister.getUser("mfreitas").doMentions(function(mentions){
  
  for(var i in mentions){

    console.log(mentions[i].getUsername()+": "+mentions[i].getContent());

  }
  
});
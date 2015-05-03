/*
 * ... the avatar ...
 */

Twister = require("../src/Twister.js")

Twister.getUser("tschaul").doAvatar(function(avatar){
    
  console.log("tschauls avatar url starts with: "+avatar.getUrl().substr(0, 30)+"...");

});
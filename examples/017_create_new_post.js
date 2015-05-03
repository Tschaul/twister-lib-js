/* 
 * Creating new posts requires an active torrent to obtain the current revision number 
 * including the direct messages.
 */


Twister = require("../src/Twister.js");

Twister.loadServerAccounts(function(){
	
	Twister.getAccount("timbuktu").activateTorrents(function(){
      
      Twister.getAccount("timbuktu").post(
        "test post from node using twister-lib-js",function(post){

          Twister.getUser("timbuktu").doStatus(function(){
            console.log(post.getContent())
          });

      });
      
      Twister.getAccount("timbuktu").reply("tschaul",34,
        "test reply from node using twister-lib-js",function(post){
        
          Twister.getUser("timbuktu").doStatus(function(){
            console.log(post.getContent())
          });

      });
      
      Twister.getAccount("timbuktu").retwist("tschaul",34,function(post){
        
          Twister.getUser("timbuktu").doStatus(function(){
            
            console.log(post.getRetwistedContent())
            
          });

      });
      
    });

});

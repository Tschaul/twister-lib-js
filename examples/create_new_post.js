
Twister = require("../src/Twister.js");

Twister.loadServerAccounts(function(){
	
	Twister.getAccount("timbuktu").activateTorrents(function(){
      Twister.getAccount("timbuktu").post(
        "test message from node using twister-lib-js",function(post){

          Twister.getUser("timbuktu").doStatus(function(){
            console.log(post.getContent())
          });

      });
    });

});


/*
Twister.loadServerAccounts(function(){
	
	Twister.getAccount("timbuktutimbuktu").activateTorrents(function(){
      Twister.getAccount("timbuktu").reply("tschaul",34,
        "test message from node using twister-lib-js",function(post){
        
          Twister.getUser("timbuktu").doStatus(function(){
            console.log(post.getContent())
          });

      });
    });

});


Twister.loadServerAccounts(function(){
	
	Twister.getAccount("timbuktu").activateTorrents(function(){
      
      Twister.getAccount("timbuktu").retwist("tschaul",34,function(post){
        
          Twister.getUser("timbuktu").doStatus(function(){
            
            console.log(post.getRetwistedContent())
            
          });

      });
      
    });

});

*/
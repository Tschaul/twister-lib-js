
Twister = require("../src/Twister.js");

//Twister.setup({logfunc: function(l){console.log(l)}})

Twister.importClientSideAccount("pampalulu","L12kz6tabDN6VmPes1rfEpiznztPF6vgkHp8UZVBgZadxzebHhAp",function(){
	
    console.log("blub")
    
	Twister.getAccount("pampalulu").activateTorrents(function(){
      
      console.log(Twister.getAccount("pampalulu")._torrents["pampalulu"]._active)
      
      /*Twister.getAccount("pampalulu").updateProfileFields({location:"fance new location"},function(){
        console.log("yay");
      })*/
      
      Twister.getAccount("pampalulu").post(
        "another test with a mention @tschaul and hashtag #blub",function(post){

          //Twister.getUser("pampalulu").doStatus(function(post){
            console.log(post.getContent())
          //});

      });
      
      
      /*var post = {
        msg: "test"
      };
      
      Twister.getAccount("pampalulu")._signAndAddToTorrent(post,function(){
        console.log("yay");
      })*/
      
      /*Twister.getAccount("timbuktu").reply("tschaul",34,
        "test reply from node using twister-lib-js",function(post){
        
          Twister.getUser("timbuktu").doStatus(function(){
            console.log(post.getContent())
          });

      });
      
      Twister.getAccount("timbuktu").retwist("tschaul",34,function(post){
        
          Twister.getUser("timbuktu").doStatus(function(){
            
            console.log(post.getRetwistedContent())
            
          });

      });*/
      
    });

});

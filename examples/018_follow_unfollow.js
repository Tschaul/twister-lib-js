/* 
 * Following and unfollowing is also done through the account object.
 */

Twister = require("../src/Twister.js");

Twister.loadServerAccounts(function(){
	
  Twister.getAccount("pampalulu").activateTorrents(function(){

    Twister.getAccount("pampalulu").follow("bbc_world",function(newfollowings){

      console.log("following bbc_world: ");
      newfollowings.map(function(fol){
        console.log(fol.getUsername())
      });

      Twister.getAccount("pampalulu").unfollow("bbc_world",function(newfollowings){

        console.log("not following bbc_world: ");
        newfollowings.map(function(fol){
          console.log(fol.getUsername())
        });

      });

    });

  });

});


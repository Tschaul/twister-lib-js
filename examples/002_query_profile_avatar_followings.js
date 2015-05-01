 /*
 * Similarly to posts (see previous example), we can query other user based 
 * resources such as the profile ...
 */

Twister = require("../src/Twister.js")

Twister.getUser("tschaul").doProfile(function(profile){
    
  console.log("tschaul's full name is "+profile.getField("fullname"));

});

 /*
 * ... the avatar ...
 */

Twister.getUser("tschaul").doAvatar(function(avatar){
    
  console.log("tschauls avatar url starts with: "+avatar.getUrl().substr(0, 30)+"...");

});


 /*
 * ... or the followings of a user. The callback argument of the doFollowings(...) 
 * function is an array of user objects. Therefore we can use those to query their 
 * full names again. For users who's profile is not available on the DHT twister-lib-js
 * will run the internal error function which defaults to console logging. More about 
 * error handling in the next example.
 */

Twister.getUser("tschaul").doFollowings(function(followings){
    
  console.log("the full names of tschauls followings are:");
  
  for(var i in followings) {

    followings[i].doProfile(function(profile){

      if (profile.getField("fullname")) {
      
        console.log("fullname: "+profile.getField("fullname"));
      
      } else {

        console.log("no fullname available for "+profile.getUsername());

      }

    });

  }

});
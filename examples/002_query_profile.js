 /*
 * Similarly to posts (see previous example), we can query other user based 
 * resources such as the profile ...
 */

Twister = require("../src/Twister.js")

Twister.getUser("tschaul").doProfile(function(profile){
    
  console.log("tschaul's full name is "+profile.getField("fullname"));

});
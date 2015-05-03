/* 
 * All queries until now were done over the distributed hash table (DHT)
 * except for the promoted posts which are saved in the blockchain. In 
 * the following we will use the torrents of the users to query the merged
 * timeline of the followings of that user (what a client would display 
 * under "home") every 15s. For that we first have to load the accounts that 
 * are present on the server into twister-lib-js. After that the torrents of 
 * the followings of a particular account are activated. This defines the 
 * active user for these torrents. All torrents that have the same active
 * user are then updated and queried simultanously using the "getlasthave"
 * and "getposts" JSON-RPC methods. Initiating the queryies is then done 
 * with the same functions as used in the previous examples. Here, the 
 * doLatestPostUntil function is used to display the posts from the last 
 * 24h of all followings of the user tschaul.
 * 
 * Note that as twister-lib-js starts with an empty cache it will first 
 * query the latest posts of all torrents whether or not they posted in 
 * the last 24h. This is done so that if the query is done repeatedly 
 * (like here) it can look for updates using a single "getlasthave" request 
 * and issue more requests only if needed.
 */

Twister = require("../src/Twister.js")

Twister.loadServerAccounts(function(){
	
  Twister.getAccount("tschaul").activateTorrents(function(){

    setInterval(queryHome,15000);

  });
	
});


queryHome = function(){

  console.log("::::::: Timeline of user tschaul ::::::::");

  var outdatedTimestamp = Date.now()/1000 - 24*60*60;
  
  Twister.getUser("tschaul").doFollowings(function(followings){

    for(var i in followings) {

      followings[i].doLatestPostsUntil(function(post){

        if (post.getTimestamp()>outdatedTimestamp) {
          console.log(post.getContent());
        } else {
          return false;
        }

      });

    }

  });

}
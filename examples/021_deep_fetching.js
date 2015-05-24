 /*
  * In the example 005_query_followings a nested/deep query is performed. First the followings 
  * are queried and then the fullnames of all these users. All the queries for the fullnames 
  * are asyncronous, so it is unpredictable in which order they finish. Therefore it is tricky 
  * to find out when all queries that were issued are complete. Using the "queryId" setting you
  * can mark multiple queries with a common id. With the onQueryComplete function you can
  * register a handler that is triggered when the last query is completed.
  * 
  */

Twister = require("../src/Twister.js")

var qid = Math.random();

Twister.onQueryComplete(qid,function(){console.log("all queries are complete")});

Twister.getUser("tschaul").doFollowings(function(followings){
    
  console.log("the full names of tschauls followings are:");
  
  for(var i in followings) {

    followings[i].doProfile(function(profile){

      if (profile.getField("fullname")) {
      
        console.log("fullname: "+profile.getField("fullname"));
      
      } else {

        console.log("no fullname available for "+profile.getUsername());

      }

    },{queryId:qid});

  }

},{queryId:qid});
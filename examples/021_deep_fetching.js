 /*
  * In the example 005_query_followings a nested/deep query is performed. First the followings 
  * are queried and then the fullnames of all these users. All the queries for the fullnames 
  * are asyncronous, so it is unpredictable in which order they finish. Therefore it is tricky 
  * to find out when all queries that were issued are complete. Using the "queryId" setting you
  * can mark multiple queries with a common id. With the onQueryComplete function you can
  * register a handler that is triggered when the last query is completed. In the following we 
  * push all usernames to a single array and log it to console only once after all queries are
  * finished.
  * 
  */

Twister = require("../src/Twister.js")

var qid = Math.random();

var allResults = [];

Twister.onQueryComplete(qid,function(){console.log("all results: ",allResults)});

Twister.getUser("tschaul").doFollowings(function(followings){
  
  for(var i in followings) {

    followings[i].doProfile(function(profile){

      if (profile.getField("fullname")) {
      
        allResults.push(profile.getField("fullname"));
      
      } else {

        allResults.push(profile.getUsername());

      }

    },{queryId:qid});

  }

},{queryId:qid});
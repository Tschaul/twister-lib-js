/* 
 * Another important feature of twister-lib-js is the cache. The cache is used extensively 
 * by twister-lib-js to minimize the number of JSON-RPC requests. The Twister object provides 
 * methods that can be used to save the cache (e.g. on hard disk or in the browser's local 
 * storage) and to restore it. In this example we query a post and save the cache to a string. 
 * For that we have set the signature verification mode to instant because unverified posts 
 * are not restored.
 */

Twister = require("../src/Twister.js")

Twister.setup({signatureVerification:"instant"})

var cacheStore = "";

Twister.getUser("tschaul").doPost(34,function(post){
    
  console.log("got post. storing cache.")

  cacheStore = JSON.stringify(Twister.serializeCache());
 
});

/* 
 * After a short time (so we can be sure the query went through) we clear the cache, which 
 * we do manually here. To try to extract the post from the cache we use the getPost method, which 
 * only works if the post is in cache. If a post is not in cache the getPost method will 
 * return null and will not issue a query for that post.
 */

setTimeout(function(){

  Twister._userCache = {};
  
  if (Twister.getUser("tschaul").getPost(34)==null) {

    console.log("post is gone. cache is empty.")

  }
  
},2000);


/*
 * After another short time we restore the cache and find that the post is back.
 */

setTimeout(function(){

  Twister.deserializeCache(JSON.parse(cacheStore));

  var post = Twister.getUser("tschaul").getPost(34);
  
  if (post) {

    console.log("post is back: "+post.getContent())

  }
  
},3000);

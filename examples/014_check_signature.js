/*
 * The following example demonstrates how twister-lib-js internally verifies signatures. 
 * If signature verification is activated (set to either "background" or "instant") 
 * twister-lib-js will try to verify the signatures of all resources queried through 
 * the JSON-RPC. In "background" mode the callback of the query will be run before 
 * the signature is verified to maintain responsiveness. In "instant" mode the callback 
 * of the query is only run after a sucessfull signature verification. In both cases an 
 * unsucesfull signature verification will call errorfunc. Try messing with the signature 
 * and changing the signature verification mode.
 *
 */

Twister = require("../src/Twister.js")

Twister.setup({signatureVerification: "instant"});

var tschaul = Twister.getUser("tschaul");

var payload = JSON.parse(' {"sig_userpost":"1fd6d2b6f87d247f84dd18dae0fda5cdd867bba9d16a564222bf9d3e7fbc2c761cc828c3e0667284b265cb1ea19c82ef6b96517b5b39989184861c8f32897e6cfa","userpost":{"height":81729,"k":38,"lastk":35,"msg":"@arco That looks really nice!","n":"tschaul","reply":{"k":37,"n":"arco"},"time":1428653527}}');

Twister.getUser("tschaul")._stream._verifyAndCachePost(payload,function(post){
    
    console.log("callback function: "+post.getContent());

});


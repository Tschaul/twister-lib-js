
Twister = require("../src/Twister.js");

Twister.doHashtagPosts("news",function(post){
    console.log(post.getTimestamp()+": "+post.getUsername()+": "+post.getContent());
});

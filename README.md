# LibTwister
A [Twister](http://twister.net.co) Library in JavaScript

## Scope of this Project
*Disclaimer: None of the following functions are implemented at the moment.*

LibTwister handles all querying and manipulation of the Twister P2P network, given the availability of a (public) twisterd service API endpoint. This includes managing the network resource, by bundleing queries in batches and also by caching. This also includes the ability to encrypt and decrypt direct messages locally.

LibTwister should be compilable for as many platforms as possible including:
- All popular Browsers (for web apps as well as firefoxOS)
- node-js (for server-side functionality)
- The iOS Javascript VM (for building native iOS apps)
- The Android Javascript VM (for building native android apps)

A techdemo of LibTwister combined with react-js can be found at [http://github.com/Tschaul/twister-react]

## Example code

Display the content of the latest post of user tschaul:
```
Twister.getUser("tschaul").doStatus(function(post){
  console.log(post.getContent());  
});
```

Display timestamp and content of the 10 latest posts of user tschaul:
```
Twister.getUser("tschaul").doLatestPosts(10,function(post){
  console.log(post.getTimestamp()+": "+post.getContent());  
});
```

Display timestamp and content of all replies to the post with id 877 of user rysiek:
```
Twister.getUser("rysiek").doPost(877,function(post){
  post.doReplies(function(post){
    console.log(post.getTimestamp()+": "+post.getContent());  
  });
});
```

Serialize the cache to a string
```
var string = JSON.stringify(Twister.serializeCache());
```


Deserialize the cache from a string
```
Twister.serializeCache(JSON.parse(string));
```

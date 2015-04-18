# twister-lib-js
A [Twister](http://twister.net.co) Library in JavaScript

## Scope of this Project

twister-lib-js handles all querying and manipulation of the Twister P2P network, given the availability of a (remote or local) twisterd service API endpoint. This includes managing the network resource, by bundleing queries and by caching. This also includes the ability sign posts and to encrypt and decrypt direct messages locally.

twister-lib-js should be compilable for as many platforms as possible including:
- All popular Browsers (for web apps as well as firefoxOS)
- node-js (for server-side functionality)
- The iOS Javascript VM (for building native iOS apps)
- The Android Javascript VM (for building native android apps)

A techdemo of twister-lib-js combined with react-js can be found at http://github.com/Tschaul/twister-react

## Implementation Status

| Resource    	| query | signature verification    | post (client side wallet) | post (server side wallet) |
|-|-|-|-|-|
| Posts     	| ✓     | *hit and miss*            |                           |							|
| Replies     	| ✓     | *hit and miss*            |                           |							|
| Retwists     	| ✓     | *hit and miss*            |                           |							|
| Profile     	| ✓     | *hit and miss*            |                           |	✓						|
| Avatar     	| ✓     | *hit and miss*            |                           |	✓						|
| Mentions     	| ✓     | *hit and miss*            |                           |							|
| Hashtags     	| ✓     | *hit and miss*            |                           |							|
| Promoted Posts|  ✓    | *hit and miss*            |                           |							|
| Direct Messages| server side wallet    |                           |                           |							|| 


## Code Examples

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
Twister.deserializeCache(JSON.parse(string));
```

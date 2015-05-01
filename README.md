# twister-lib-js
A [Twister](http://twister.net.co) Library in JavaScript

## Scope of this Project

twister-lib-js handles all querying and manipulation of the Twister P2P network, given the availability of a (remote or local) twisterd JSON-RPC endpoint. This includes managing the network resource, by bundleing queries and by caching. This also includes the ability sign posts and to encrypt and decrypt direct messages locally.

twister-lib-js should be compilable for as many platforms as possible including:
- All popular Browsers (for web apps as well as firefoxOS)
- node-js (for server-side functionality)
- The iOS Javascript VM (for building native iOS apps)
- The Android Javascript VM (for building native android apps)

A techdemo of twister-lib-js combined with react-js can be found at http://github.com/Tschaul/twister-react

## Implementation Status

| Resource    	| query |  manipulate (client side wallet) | manipulate (server side wallet) |
|-|-|-|-|
| Posts     	| ✓     |                            |	✓						|
| Replies     	| ✓     |                            |	✓						|
| Retwists     	| ✓     |                            |	✓						|
| Profile     	| ✓     |                            |	✓						|
| Avatar     	| ✓     |                            |	✓						|
| Followings   	| ✓     |                            |	✓						|
| Mentions     	| ✓     |                            |	-						|
| Hashtags     	| ✓     |                            |	-						|
| Promoted Posts|  ✓    |  -                         |	-						|
| Direct Messages| -    |                            |	✓						|| 


## Code Examples

Display the content of the latest post of user tschaul:

```
Twister.getUser("tschaul").doStatus(function(post){
  console.log(post.getContent());  
});
```

For more code examples see /examples

## Error Codes

twister-lib-js passes through all JSON-RPC errors. Internal errors are thrown in the same format with codes ranging between 32050 and 32099:

* 32050: DHT resource signature could not be verified.
* 32051: Unknown query setting was requested.
* 32052: DHT resource is empty. (Only thrown for status profile and avatar resources.)
* 32060: Post signature could not be verified.
* 32061: Public key not available on server.
* 32062: Signatureof retwisted post could not be verified.
* 32080: Unsupported wallet type.
* 32081: No wallet users found on the server.
* 32082: Torrent inactive. Activate torrent first!

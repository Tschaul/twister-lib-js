# LibTwister
A Twister Library in JS

## Scope of this Project
*Disclaimer: None of the following functions are implemented at the moment.*

LibTwister handles all querying and manipulation of the Twister P2P network, given the availability of a (public) twisterd service API endpoint. This includes managing the network resource, by bundleing queries in batches and also by caching. This also includes the ability to encrypt and decrypt direct messages locally.

LibTwister should be compilable for as many platforms as possible including:
- All popular Browsers (for web apps as well as firefoxOS)
- node-js (for server-side functionality)
- The iOS Javascript VM (for builing native iOS apps)
- The Android Javascript VM (for builing native android apps)

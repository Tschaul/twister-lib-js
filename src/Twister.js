'use strict';

var Twister = {};

Twister._cache = {};
Twister._hashtags = {};

Twister._activeDHTQueries = 0;
Twister._maxDHTQueries = 5;

Twister._verifySignatures = true;
Twister._averageSignatureCompTime = 200;
Twister._signatureVerificationsInProgress = 0;


//default query settings:
Twister._outdatedLimit = 90;
Twister._querySettingsByType = {
    
    outdatedLimit: {
        pubkey: 60*60,
        profile: 60*60,
        avatar: 60*60,
        torrent: 60*60,
    }
    
};
Twister._host = "";
Twister._timeout = 20000;
Twister._errorFunc = function(error){console.log("Twister error: "+error.message);};

var TwisterTrendingHashtags = require("./TwisterTrendingHashtags.js");
Twister._trendingHashtags = new TwisterTrendingHashtags(10,Twister);

Twister.init = function (options) {
    
    Twister._host = options.host;

}

Twister.getUser = function (initval) {
    
    if (Twister._cache[initval] === undefined) {
    
        var TwisterUser = require('./TwisterUser.js');
        
        Twister._cache[initval] = new TwisterUser(initval,Twister);

    }
    
    return Twister._cache[initval];

}

Twister.getHashtag = function (tag) {

    if (Twister._hashtags[tag] === undefined) {
    
        var TwisterHashtag = require('./TwisterHashtag.js');
        
        Twister._hashtags[tag] = new TwisterHashtag(tag,Twister);

    }
    
    return Twister._hashtags[tag];
    
}

Twister.doHashtagPosts = function (tag,cbfunc,outdatedLimit) {
    Twister.getHashtag(tag)._checkQueryAndDo(cbfunc,outdatedLimit);
}

Twister.doTrendingHashtags = function (count,cbfunc) {

    if (Twister._trendingHashtags._count!=count) {
        Twister._trendingHashtags.setCount(count);
    }
    
    Twister._trendingHashtags._checkQueryAndDo(cbfunc);
    
}

Twister.serializeCache = function () {

    var retUser = [];
    
    for (var username in this._cache){
        retUser.push(this._cache[username].flatten());
    }
    
    var hashs = [];
    
    for (var tag in this._hashtags){
        hashs.push(this._hashtags[tag].flatten());
    }
    
    return {
        users: retUser,
        hashtags: hashs,
        trendinghashtags: this._trendingHashtags.flatten()
           };
}

Twister.deserializeCache = function (flatData) {

    if (flatData) {

        var TwisterUser = require('./TwisterUser.js');

        for(var i = 0; i < flatData.users.length; i++){

            var newuser = new TwisterUser(flatData.users[i].name,Twister);
            newuser.inflate(flatData.users[i]);
            this._cache[flatData.users[i].name]=newuser;

        }

        var TwisterHashtag = require('./TwisterHashtag.js');

        for(var i = 0; i < flatData.hashtags.length; i++){

            var newhashtag = new TwisterHashtag(flatData.hashtags[i].name,Twister);
            newhashtag.inflate(flatData.users[i]);
            this._hashtags[flatData.hashtags[i].name]=newhashtag;

        }
        
        var TwisterTrendingHashtags = require('./TwisterTrendingHashtags.js');
        this._trendingHashtags = new TwisterTrendingHashtags(10,Twister);
        this._trendingHashtags.inflate(flatData.trendinghashtags);

    }
    
}

module.exports = Twister;

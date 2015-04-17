'use strict';

var TwisterProfile = require('./TwisterProfile.js');
var TwisterAvatar = require('./TwisterAvatar.js');
var TwisterFollowings = require('./TwisterFollowings.js');
var TwisterPubKey = require('./TwisterPubKey.js');
var TwisterStream = require('./TwisterStream.js');
var TwisterMentions = require('./TwisterMentions.js');

function TwisterUser(name,scope) {
    
    this._name = name;
    this._scope = scope;
    
    this._type = "user";
    this._querySettings = {};

    this._profile = new TwisterProfile(name,scope);
    this._avatar = new TwisterAvatar(name,scope);
    this._followings = new TwisterFollowings(name,scope);
    this._pubkey = new TwisterPubKey(name,scope);
    this._stream = new TwisterStream(name,scope);
    this._mentions = new TwisterMentions(name,scope);

    
}

module.exports = TwisterUser;

TwisterUser.prototype.flatten = function () {

    return {
        
        name: this._name,
        querySettings: this._querySettings,
        
        profile: this._profile.flatten(),
        avatar: this._avatar.flatten(),
        followings: this._followings.flatten(),
        pubkey: this._pubkey.flatten(),
        stream: this._stream.flatten(),
        mentions: this._mentions.flatten()
        
    };


}

TwisterUser.prototype.inflate = function (flatData) {
    
    this._querySettings = flatData.querySettings;
    
    this._profile.inflate(flatData.profile);
    this._avatar.inflate(flatData.avatar);
    this._followings.inflate(flatData.followings);
    this._pubkey.inflate(flatData.pubkey);
    this._stream.inflate(flatData.stream);
    this._mentions.inflate(flatData.mentions);

}

TwisterUser.prototype.getUsername = function () {
    return this._name;
}

TwisterUser.prototype.getLatestId = function() {
    return this._stream._latestId;
}

TwisterUser.prototype.getTorrent = function () {
    return this._stream._torrent;
}

TwisterUser.prototype._doPubKey = function (cbfunc, outdatedLimit) {
    this._pubkey._checkQueryAndDo(cbfunc,outdatedLimit);
}

TwisterUser.prototype.doProfile = function (cbfunc, outdatedLimit) {
    this._profile._checkQueryAndDo(cbfunc,outdatedLimit);
};

TwisterUser.prototype.doAvatar = function (cbfunc, outdatedLimit) {
    this._avatar._checkQueryAndDo(cbfunc,outdatedLimit);
};

TwisterUser.prototype.doFollowings = function (cbfunc, outdatedLimit) {
    this._followings._checkQueryAndDo(cbfunc, outdatedLimit);
};

TwisterUser.prototype.doStatus = function (cbfunc, outdatedLimit) {
    this._stream._checkQueryAndDo(cbfunc, outdatedLimit);
};

TwisterUser.prototype.doPost = function (id, cbfunc) {
    this._stream._doPost(id, cbfunc);
}

TwisterUser.prototype.doPostsSince = function (timestamp, cbfunc, outdatedLimit) {
    
    var thisUser = this;
    
    if (timestamp <= 0) { timestamp = timestamp + Date.now()/1000; }
    
    var doPostTilTimestamp = function (post) {
        
        if (post!==null && ( post.getTimestamp() > timestamp ) ) {
            
            cbfunc(post);
            thisUser.doPost(post.getlastId(), doPostTilTimestamp);
            
        }
        
    };
        
    this.doStatus(doPostTilTimestamp, outdatedLimit);
    
};

TwisterUser.prototype.doLatestPosts = function (count, cbfunc, outdatedLimit) {
    
    var thisUser = this;
    
    var countSoFar = 0;
    
    var doPostTilCount = function (post) {
        
        if (countSoFar < count) {
            
            cbfunc(post);
            countSoFar=countSoFar+1;
            thisUser.doPost(post.getlastId(), doPostTilCount);
            
        }
        
    };
      
    var outdatedTimestamp = 0;
    
    this.doStatus(doPostTilCount, outdatedLimit);
    
};

TwisterUser.prototype.doMentions = function (cbfunc) {

    this._mentions._checkQueryAndDo(cbfunc);

}
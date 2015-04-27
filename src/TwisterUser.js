'use strict';

var TwisterProfile = require('./TwisterProfile.js');
var TwisterAvatar = require('./TwisterAvatar.js');
var TwisterFollowings = require('./TwisterFollowings.js');
var TwisterPubKey = require('./TwisterPubKey.js');
var TwisterStream = require('./TwisterStream.js');
var TwisterMentions = require('./TwisterMentions.js');

/**
 * Describes a user in {@ Twister}. Allows for accessing all public onformation about this user.
 * @class
 */
function TwisterUser(name,scope) {
    
    this._name = name;
    this._scope = scope;
    
    this._type = "user";
    this._querySettings = {};
	this._hasParentUser = false;

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

TwisterUser.prototype._doPubKey = function (cbfunc, querySettings) {
    this._pubkey._checkQueryAndDo(cbfunc, querySettings);
}

TwisterUser.prototype.doProfile = function (cbfunc, querySettings) {
    this._profile._checkQueryAndDo(cbfunc, querySettings);
};

TwisterUser.prototype.doAvatar = function (cbfunc, querySettings) {
    this._avatar._checkQueryAndDo(cbfunc, querySettings);
};

TwisterUser.prototype.doFollowings = function (cbfunc, querySettings) {
    this._followings._checkQueryAndDo(cbfunc, querySettings);
};

TwisterUser.prototype.doStatus = function (cbfunc, querySettings) {
    this._stream._checkQueryAndDo(cbfunc, querySettings);
};

TwisterUser.prototype.doPost = function (id, cbfunc) {
    this._stream._doPost(id, cbfunc);
}

TwisterUser.prototype.getPost = function (id) {
    if (id in this._stream._posts) {
		return this._stream._posts[id];
	} else {
		return null;	
	}
}

TwisterUser.prototype.doMentions = function (cbfunc, querySettings) {

    this._mentions._checkQueryAndDo(cbfunc);

}

TwisterUser.prototype.doLatestPostsUntil = function (cbfunc, querySettings) {

    this._stream._doUntil(cbfunc, querySettings);

}
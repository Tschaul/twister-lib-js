'use strict';

var TwisterProfile = require('./TwisterProfile.js');
var TwisterAvatar = require('./TwisterAvatar.js');
var TwisterFollowings = require('./TwisterFollowings.js');
var TwisterPubKey = require('./TwisterPubKey.js');
var TwisterStream = require('./TwisterStream.js');
var TwisterMentions = require('./TwisterMentions.js');
var TwisterResource = require('./TwisterResource.js');
var inherits = require('inherits');

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

inherits(TwisterUser,TwisterResource);

module.exports = TwisterUser;

TwisterUser.prototype.trim = function () {
  
  delete Twister._userCache[this._name];
  
}

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

TwisterUser.prototype.trim = function (timestamp) {

  var keepUser = false;
  
  this._profile.trim(timestamp);
  keepUser = keepUser || this._profile.inCache();
  
  this._avatar.trim(timestamp);
  keepUser = keepUser || this._avatar.inCache();
  
  this._followings.trim(timestamp);
  keepUser = keepUser || this._followings.inCache();
  
  this._mentions.trim(timestamp);
  keepUser = keepUser || this._mentions.inCache();
  
  this._stream.trim(timestamp);
  keepUser = keepUser || this._stream.inCache();
  
  this._pubkey.trim(timestamp);
  keepUser = keepUser || this._pubkey.inCache();

  if ( !keepUser ) {
    delete this._scope._userCache[this._name];
  }
  
}

TwisterUser.prototype.getUsername = function () {
    return this._name;
}

TwisterUser.prototype._doPubKey = function (cbfunc, querySettings) {
    this._pubkey._checkQueryAndDo(cbfunc, querySettings);
}

TwisterUser.prototype.doProfile = function (cbfunc, querySettings) {
    return this._wrapPromise(
      this._profile,
      this._profile._checkQueryAndDo,
      cbfunc,
      querySettings);
};

TwisterUser.prototype.getProfile = function () {
    return this._profile;
};

TwisterUser.prototype.doAvatar = function (cbfunc, querySettings) {
    return this._wrapPromise(
      this._avatar,
      this._avatar._checkQueryAndDo,
      cbfunc, 
      querySettings);
};

TwisterUser.prototype.getAvatar = function () {
    return this._avatar;
};

TwisterUser.prototype.doFollowings = function (cbfunc, querySettings) {
    return this._wrapPromise(
      this._followings,
      this._followings._checkQueryAndDo,
      cbfunc, 
      querySettings);
};

TwisterUser.prototype.getFollowings = function () {
    return this._followings;
};

TwisterUser.prototype.doStatus = function (cbfunc, querySettings) {
    return this._wrapPromise(
      this._stream,
      this._stream._checkQueryAndDo,
      cbfunc, 
      querySettings);
};

TwisterUser.prototype.doPost = function (id, cbfunc, querySettings) {
  
  var thisStream = this._stream;
  
  return this._wrapPromise(
    thisStream,
    function(cb,qs){
      thisStream._doPost(id, cb, qs);
    },
    cbfunc,
    querySettings);
  
}


TwisterUser.prototype.getPost = function (id) {
    if (id in this._stream._posts) {
		return this._stream._posts[id];
	} else {
		return null;	
	}
}

TwisterUser.prototype.doMentions = function (cbfunc, querySettings) {

    return this._wrapPromise(
      this._mentions,
      this._mentions._checkQueryAndDo,
      cbfunc,
      querySettings);

}

TwisterUser.prototype.getMentions = function () {
    return this._mentions;
}

TwisterUser.prototype.doLatestPostsUntil = function (cbfunc, querySettings) {

    this._stream._doUntil(cbfunc, querySettings);

}
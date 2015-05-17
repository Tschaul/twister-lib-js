"use strict";

var inherits = require('inherits');
var TwisterResource = require('./TwisterResource.js');
var TwisterReplies = require('./TwisterReplies.js');
var TwisterRetwists = require('./TwisterRetwists.js');

/**
 * Describes a single post of a {@link TwisterUser}.
 * @module
 */
function TwisterPost(data,signature,scope) {
    
    var name = data.n;
    var id = data.k;
    
    TwisterResource.call(this,name,scope);
    
    this._type = "post";
    this._data = data;
    this._signature = signature;
	this._isPromotedPost = false;
    this._replies = new TwisterReplies(name,id,scope);
    this._retwists = new TwisterRetwists(name,id,scope);
    
}

inherits(TwisterPost,TwisterResource);

module.exports = TwisterPost;

TwisterPost.prototype.flatten = function () {

    var flatData = TwisterResource.prototype.flatten.call(this);
    
    flatData.retwists = this._retwists.flatten();
    flatData.replies = this._replies.flatten();
  
    flatData.isPromotedPost = this._isPromotedPost;
    flatData.signature = this._signature;
        
    return flatData;

}

TwisterPost.prototype.inflate = function (flatData) {
    
    TwisterResource.prototype.inflate.call(this,flatData);
    
    this._replies.inflate(flatData.replies);
    this._retwists.inflate(flatData.retwists);

    this._signature = flatData.signature;
    this._isPromotedPost = flatData.isPromotedPost;
  
}

TwisterPost.prototype.trim = function (timestamp) {

  var keepPost = false;
  
  this._replies.trim(timestamp);
  keepPost = keepPost || this._replies.inCache();

  this._retwists.trim(timestamp);
  keepPost = keepPost || this._retwists.inCache();

  if ( !keepPost && ( !timestamp || timestamp > this.getTimestamp() ) ){

    if (this._isPromotedPost) {
      var thisStream = this._scope._promotedPosts;
    } else {
      var thisStream = this._scope.getUser(this._name)._stream;
    }

    delete thisStream._posts[this.getId()];

    thisStream._latestId = Math.max.apply(Math,Object.keys(thisStream._posts));

  }

}

TwisterPost.prototype._do = function (cbfunc) {
    cbfunc(this);
}

TwisterPost.prototype._checkQueryAndDo = function (cbfunc) {
    cbfunc(this);
}

TwisterPost.prototype._queryAndDo = function (cbfunc) {
    cbfunc(this);
}

/** @function
 * @name getId 
 * @description returns the post id.
 */
TwisterPost.prototype.getId = function () {
    return this._data.k;
}

/** @function
 * @name getId 
 * @description returns the post id of the last post.
 */
TwisterPost.prototype.getLastId = function () {
	if (!this._isPromotedPost) {
		return this._data.lastk;
	} else {
		return this._data.k-1;
	}
}


/** @function
 * @name doPreviousPost 
 * @description calls cbfunc with the previous post as argument. Queries the post if not in cache.
 * @param cbfunc {function} 
 * @param querySettings {Object} 
 */
TwisterPost.prototype.doPreviousPost = function (cbfunc,querySettings) {
	
	if (!this._isPromotedPost) {
		this._scope.getUser(this.getUsername()).doPost(this.getLastId(),cbfunc,querySettings);
	} else {
      //console.log(this)
		this._scope.getPromotedPosts()._doPost(this.getLastId(),cbfunc,querySettings);
	}
	
}

/** @function
 * @name getTimestamp 
 * @description returns the timestamp of the post.
 */
TwisterPost.prototype.getTimestamp = function () {
    return this._data.time;
}


/** @function
 * @name getContent 
 * @description returns the content of the post.
 */
TwisterPost.prototype.getContent = function () {
    return this._data.msg;
}


/** @function
 * @name getUsername 
 * @description returns the user that posted the post.
 */
TwisterPost.prototype.getUsername = function () {
    return this._data.n;
}

/** @function
 * @name getUsername 
 * @description returns the {@link TwisterUser} object of the user that posted the post.
 */
TwisterPost.prototype.getUser = function () {
    return this._scope.getUser(this._data.n);
}


/** @function
 * @name isReply 
 * @description returns true if the postis an reply.
 */
TwisterPost.prototype.isReply = function () {
    return ("reply" in this._data);
}


/** @function
 * @name getReplyUsername 
 * @description returns the username of the user to which this post is a reply.
 */
TwisterPost.prototype.getReplyUsername = function () {
    return this._data.reply.n;
}


/** @function
 * @name getReplyId 
 * @description returns the id of the post that this post is replying to.
 */
TwisterPost.prototype.getReplyId = function () {
    return this._data.reply.k;
}


/** @function
 * @name doReplies 
 * @description calls cbfunc for every post that is a reply to this post.
 * @param cbfunc {function} 
 * @param querySettings {Object} 
 */
TwisterPost.prototype.doReplies = function (cbfunc,querySettings) {
    this._replies._checkQueryAndDo(cbfunc,querySettings);  
}

/** @function
 * @name doPostRepliedTo 
 * @description calls cbfunc with the post that this post is replying to.
 * @param cbfunc {function} 
 * @param querySettings {Object} 
 */
TwisterPost.prototype.doPostRepliedTo = function (cbfunc,querySettings) {
    this._scope.getUser(this.getReplyUsername()).doPost(this.getReplyId(),cbfunc,querySettings);
}

/** @function
 * @name isRetwist 
 * @description returns true if the postis an rewtist.
 */
TwisterPost.prototype.isRetwist = function () {
    return ("rt" in this._data);
}


/** @function
 * @name getRetwistedId 
 * @description returns the id of the retwisted post.
 */
TwisterPost.prototype.getRetwistedId = function () {
    return this._data.rt.k;
}

/** @function
 * @name getRetwistedlastId 
 * @description returns the last id of the rewisted post.
 */
TwisterPost.prototype.getRetwistedlastId = function () {
    return this._data.rt.lastk;
}

/** @function
 * @name getRetwistedTimestamp 
 * @description returns the timestamp of the retwisted post
 */
TwisterPost.prototype.getRetwistedTimestamp = function () {
    return this._data.rt.time;
}

/** @function
 * @name getRetwistedContent 
 * @description returns content of the rwteisted post
 */
TwisterPost.prototype.getRetwistedContent = function () {
    return this._data.rt.msg;
}

/** @function
 * @name getRetwistedUser 
 * @description returns the username of the retwisted post.
 */
TwisterPost.prototype.getRetwistedUsername = function () {
    return this._data.rt.n;
}

/** @function
 * @name doRetwistingPosts 
 * @description calls cbfunc with an array of the post that are retwisting this post.
 * @param cbfunc {function} 
 * @param querySettings {Object} 
 */
TwisterPost.prototype.doRetwistingPosts = function (cbfunc,querySettings) {
    this._retwists._checkQueryAndDo(cbfunc,querySettings);
}


/** @function
 * @name getRetwistedPost 
 * @description return an uncached and unverified {@link TwisterPost} object of the retwisted post.
 * @param cbfunc {function} 
 */
TwisterPost.prototype.getRetwistedPost = function (cbfunc) {
    
    return new TwisterPost(this._data.rt,this._data.sig_rt,this._scope);
    
}

/** @function
 * @name doRetwistedPost 
 * @description Verifies and caches the retwisted post and calls cbfunc with it.
 * @param cbfunc {function} 
 */
TwisterPost.prototype.doRetwistedPost = function (cbfunc) {
    
    var Twister = this._scope;
    
    var id = this._data.rt.k;
    
    if (!Twister.getUser(this._data.rt.n)._posts[id]) {
        
        var payload= {
            userpost: this._data.rt,
            sig_userpost: this._data.sig_rt
        };
        
        Twister.getUser(this._data.rt.n)._verifyAndCachePost(payload,cbfunc);
        
    } else {

        cbfunc(Twister.getUser(this._data.rt.n)._posts[id]);
        
    }
    
}

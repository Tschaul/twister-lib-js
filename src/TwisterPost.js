"use strict";

var inherits = require('inherits');
var TwisterResource = require('./TwisterResource.js');
var TwisterReplies = require('./TwisterReplies.js');
var TwisterRetwists = require('./TwisterRetwists.js');

function TwisterPost(data,signature,scope) {
    
    var name = data.n;
    var id = data.k;
    
    TwisterResource.call(this,name,scope);
    
    this._type = "post";
    this._data = data;
    this._replies = new TwisterReplies(name,id,scope);
    this._retwists = new TwisterRetwists(name,id,scope);
    
}

inherits(TwisterPost,TwisterResource);

module.exports = TwisterPost;

TwisterPost.prototype.flatten = function () {

    var flatData = TwisterResource.prototype.flatten.call(this);
    
    flatData.retwists = this._retwists.flatten();
    flatData.replies = this._replies.flatten();
        
    return flatData;

}

TwisterPost.prototype.inflate = function (flatData) {
    
    TwisterResource.prototype.inflate.call(this,flatData);
    
    this._replies.inflate(flatData.replies);
    this._retwists.inflate(flatData.retwists);

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

TwisterPost.prototype.getId = function () {
    return this._data.k;
}

TwisterPost.prototype.getlastId = function () {
    if (this._data.lastk) {
		return this._data.lastk;
	} else if (this._data.k>0) {
		return this._data.k-1;
	} else {
		return -1;
	}
}

TwisterPost.prototype.getTimestamp = function () {
    return this._data.time;
}

TwisterPost.prototype.getContent = function () {
    return this._data.msg;
}

TwisterPost.prototype.getUsername = function () {
    return this._data.n;
}

TwisterPost.prototype.isReply = function () {
    return ("reply" in this._data);
}

TwisterPost.prototype.getReplyUser = function () {
    return this._data.reply.n;
}

TwisterPost.prototype.getReplyId = function () {
    return this._data.reply.k;
}

TwisterPost.prototype.doReplies = function (cbfunc) {
    this._replies._checkQueryAndDo(cbfunc);  
}

TwisterPost.prototype.doPostRepliedTo = function (cbfunc) {
    this._scope.getUser(this.getReplyUser()).doPost(this.getReplyId(),cbfunc);
}

TwisterPost.prototype.isRetwist = function () {
    return ("rt" in this._data);
}

TwisterPost.prototype.getRetwistedId = function () {
    return this._data.rt.k;
}

TwisterPost.prototype.getRetwistedlastId = function () {
    return this._data.rt.lastk;
}

TwisterPost.prototype.getRetwistedTimestamp = function () {
    return this._data.rt.time;
}

TwisterPost.prototype.getRetwistedContent = function () {
    return this._data.rt.msg;
}

TwisterPost.prototype.getRetwistedUser = function () {
    return this._data.rt.n;
}

TwisterPost.prototype.doRetwistingPosts = function (cbfunc) {
    this._retwists._checkQueryAndDo(cbfunc);
}

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

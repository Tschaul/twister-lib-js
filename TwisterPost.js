function TwisterPost(data) {
    this._data = data;
    this._retwists = {};
    this._lastRetwistUpdate = -1;
    this._replies = {};
    this._lastReplyUpdate = -1;
}

TwisterPost.prototype.flatten = function () {

    return {
        data: this._data,
        retwists: this._retwists,
        lastRetwistUpdate: this._lastRetwistUpdate,
        replies: this._replies,
        lastReplyUpdate: this._lastReplyUpdate
    };

}

TwisterPost.prototype.inflate = function (flatData) {
    
    this._replies=flatData.replies;
    this._lastReplyUpdate=flatData.lastReplyUpdate;
    this._retwists=flatData.retwists;
    this._lastRetwistUpdate=flatData.lastRetwistUpdate;

}

TwisterPost.prototype.getId = function () {
    return this._data.k;
}

TwisterPost.prototype.getlastId = function () {
    return this._data.lastk;
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

    
    var thisPost = this;
    Twister.dhtget([thisPost.getUsername(), "replies"+thisPost.getId(), "m"],
        function (result) {

            for (i=0; i<result.length; i++) {
        
                var username = result[i].p.v.userpost.n;
                var id = result[i].p.v.userpost.k;
                
                thisPost._replies[username+":post"+id]=true;
                
                var newpost = new TwisterPost(result[i].p.v.userpost);
                Twister.getUser(username)._posts[id]=newpost;
                
            }
        
            for (var key in thisPost._replies) {
                
                var nandk = key.split(":post");
                var username = nandk[0];
                var id = parseInt(nandk[1]);
                Twister.getUser(username).doPost(id,cbfunc);
            
            }

        }
    );   
    
    
}

TwisterPost.prototype.doHeadOfConversation = function (cbfunc) {

    var goUpConversation = function (post) {
        if (post.isReply()) {
            Twister.getUser(post.getReplyUser()).doPost(post.getReplyId(),goUpConversation);            
        } else {
            cbfunc(post);
        }
    }
    
    goUpConversation(this);

}

TwisterPost.prototype.doConversation = function (cbfunc) {
    
    
    var doReplyRecursive = function (post) {
        
        cbfunc(post);
        post.doReplies(doReplyRecursive);
    
    }
    
    this.doHeadOfConversation(function(post){
        
        cbfunc(post);
        post.doReplies(doReplyRecursive);
        
    });

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

TwisterPost.prototype.doRetwistedPost = function (cbfunc) {
    
    var id = this._data.rt.k;
    if (!Twister.getUser(this._data.rt.n)._posts[id]) {
        var newpost = new TwisterPost(this._data.rt);
        Twister.getUser(this._data.rt.n)._posts[id]=newpost;
    }

    cbfunc(Twister.getUser(this._data.rt.n)._posts[id]);
}
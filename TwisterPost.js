function TwisterPost(data) {
    this._data = data;
    this._retwists = {};
    this._replies = {};
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

TwisterPost.prototype.getUser = function () {
    return this._data.n;
}

TwisterPost.prototype.getReplyInfo = function () {
    return this._data.reply;
}

TwisterPost.prototype.doReplies = function (cbfunc) {

    
    var thisPost = this;
    Twister.RPC("dhtget", [thisPost.getUser(), "replies"+thisPost.getId(), "m"],
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

        },
        function(ret) {console.log(ret);}
    );   
    
    
}

TwisterPost.prototype.doHeadOfConversation = function (cbfunc) {

    var goUpConversation = function (post) {
        if (post.getReplyInfo()) {
            var rpinfo = post.getReplyInfo();
            Twister.getUser(rpinfo.n).doPost(rpinfo.k,goUpConversation);            
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
'use strict';

function TwisterUser(name) {
    
    this._name = name;
    this._posts = {};
    this._profile = null;
    this._avatar = null;
    this._followings = null;
    this._lastStatusUpdate = -1;
    this._lastProfileUpdate = -1;
    this._lastAvatarUpdate = -1;
    this._lastFollowingsUpdate = -1;
    this._latestId = -1;
    this._latestTimestamp = -1;
    
}

TwisterUser.prototype.flatten = function () {

    
    var retPosts = [];
    
    for (var id in this._posts){
        retPosts.push(this._posts[id].flatten());
    }
    
    return {
        posts: retPosts,
        name: this._name,
        profile: this._profile,
        avatar: this._avatar,
        followings: this._followings,
        lastStatusUpdate: this._lastStatusUpdate,
        lastProfileUpdate: this._lastProfileUpdate,
        lastAvatarUpdate: this._lastAvatarUpdate,
        lastFollowingsUpdate: this._lastFollowingsUpdate,
        latestId: this._latestId,
        latestTimestamp: this._latestTimestamp,
    
    };


}

TwisterUser.prototype.inflate = function (flatData) {
    
    this._profile = flatData.profile;
    this._avatar = flatData.avatar;
    this._followings = flatData.followings;
    this._lastStatusUpdate = flatData.lastStatusUpdate;
    this._lastProfileUpdate = flatData.lastProfileUpdate;
    this._lastAvatarUpdate = flatData.lastAvatarUpdate;
    this._lastFollowingsUpdate = flatData.lastFollowingsUpdate;
    this._latestId = flatData.latestId;
    this._latestTimestamp = flatData.latestTimestamp;
    
    for(var i = 0; i < flatData.posts.length; i++){
        
        var newpost = new TwisterPost(flatData.posts[i].data);
        newpost.inflate(flatData.posts[i]);
        this._posts[newpost.getId()]=newpost;
    
    }

}

TwisterUser.prototype.getUsername = function () {

    return this._name;

}

TwisterUser.prototype.doStatus = function (cbfunc, outdatedLimit) {

    var outdatedTimestamp = 0;
        
    if (outdatedLimit !== undefined) {
        
        outdatedTimestamp = Date.now()/1000 - outdatedLimit;
        
    }
    
    if ( (outdatedLimit !== undefined) && (this._lastStatusUpdate > outdatedTimestamp) ){
        
        thisUser.doPost(thisUser._latestId,cbfunc);

    } else {
        
        var thisUser = this;
        
        Twister.dhtget([thisUser._name, "status", "s"],
            function (result) {

                if (result[0]) {

                    var newpost = new TwisterPost(result[0].p.v.userpost);
                    thisUser._latestId = newpost.getId();
                    thisUser._latestTimestamp = newpost.getTimestamp();
                    thisUser._posts[thisUser._latestId] = newpost;

                    thisUser._lastStatusUpdate = Date.now()/1000;

                    if (cbfunc) {
                        cbfunc(newpost);
                    }
                } else { cbfunc(null) }

            }
        );
        
    }

};

TwisterUser.prototype.doPostsSince = function (timestamp, cbfunc) {
    
    var thisUser = this;
    
    if (timestamp <= 0) { timestamp = timestamp + Date.now()/1000; }
    
    var doPostTilTimestamp = function (post) {
        
        
        
        if (post!==null && ( post.getTimestamp() > timestamp ) ) {
            cbfunc(post);
            thisUser.doPost(post.getlastId(), doPostTilTimestamp);
        }
    };
        
    this.doStatus(doPostTilTimestamp);
    
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

TwisterUser.prototype.doPost = function (id,cbfunc) {

    if (id) {

        if (id in this._posts){
            cbfunc(this._posts[id])
        } else {
            var thisUser = this;
            Twister.dhtget([thisUser._name, "post"+id, "s"],
                function (result) {
                    
                    if (result[0]) {

                        var id = result[0].p.v.userpost.k;
                        var newpost = new TwisterPost(result[0].p.v.userpost);
                        thisUser._posts[id]=newpost;

                        cbfunc(newpost);
                    }

                }
            );   
        }
    }
    
};

TwisterUser.prototype.doProfile = function (cbfunc,outdatedLimit) {

    var outdatedTimestamp = 0;
    
    if (outdatedLimit) {
        outdatedTimestamp = Date.now()/1000 - outdatedLimit;
    }
    
    if (this._lastProfileUpdate > outdatedTimestamp){
        //console.log("fast lane");
        cbfunc(this._profile)
    } else {
        //console.log("slow lane");
        var thisUser = this;
        Twister.dhtget([thisUser._name, "profile", "s"],
            function (result) {

                if (result[0]) {

                    thisUser._profile=result[0].p.v;
                    thisUser._lastProfileUpdate=Date.now()/1000;
                    cbfunc(thisUser._profile);
                    
                }

            }
                       
        );   
        
    }

    
};

TwisterUser.prototype.doAvatar = function (cbfunc,outdatedLimit) {

    var outdatedTimestamp = 0;
    
    if (outdatedLimit) {
        outdatedTimestamp = Date.now()/1000 - outdatedLimit;
    }
    
    if (this._lastAvatarUpdate > outdatedTimestamp){
        cbfunc(this._avatar)
    } else {
        var thisUser = this;
        Twister.dhtget([thisUser._name, "avatar", "s"],
            function (result) {

                if (result[0]) {

                    thisUser._avatar=result[0].p.v;
                    thisUser._lastAvatarUpdate=Date.now()/1000;
                    cbfunc(thisUser._avatar);
                    
                }

            }
                       
        );   
        
    }

    
};

TwisterUser.prototype.doFollowings = function (cbfunc,outdatedLimit ) {

    var outdatedTimestamp = 0;
    
    if (outdatedLimit) {
        outdatedTimestamp = Date.now()/1000 - outdatedLimit;
    }
    
    if (this._lastFollowingUpdate > outdatedTimestamp){
        
        for (var i = 0; i<this._followings; i++) {
            
            cbfunc(this._followings[i])
            
        }
        
    } else {
        
        
        var currentCounter = 1;
        
        var thisUser = this;
        
        thisUser._followings = [];
        
        thisUser._lastFollowingUpdate=Date.now()/1000;
        
        var requestTilEmpty = function (cbfunc) {
        
            Twister.dhtget([thisUser._name, "following"+currentCounter, "s"],
                function (result) {

                    if (result[0] && result[0].p.v[0]) {

                        for (var i = 0; i<result[0].p.v.length; i++) {

                            thisUser._followings.push(result[0].p.v[i]);
                            cbfunc(result[0].p.v[i]);

                        }

                        currentCounter++;
                        requestTilEmpty(cbfunc)

                    }

                }


            ); 
            
        };
        
        requestTilEmpty(cbfunc);
        
    }

}

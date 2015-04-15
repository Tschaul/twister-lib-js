'use strict';

function TwisterUser(name,scope) {
    
    //cached fields
    this._name = name;
    this._posts = {};
    this._profile = null;
    this._avatar = null;
    this._followings = null;
    this._pubKey = null;
    this._pubKeyRequestInProgress = false;
    this._lastPubKeyUpdate = -1;
    this._lastStatusUpdate = -1;
    this._lastProfileUpdate = -1;
    this._lastAvatarUpdate = -1;
    this._lastFollowingsUpdate = -1;
    this._latestId = -1;
    this._latestTimestamp = -1;
    
    this._scope = scope;
    
    //uncached fields
    this._torrent = null;
    
}

module.exports = TwisterUser;

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
        
        var newpost = new TwisterPost(flatData.posts[i].data,this._scope);
        newpost.inflate(flatData.posts[i]);
        this._posts[newpost.getId()]=newpost;
    
    }

}

TwisterUser.prototype.getUsername = function () {

    return this._name;

}

TwisterUser.prototype.getTorrent = function () {

    if (this._torrent==null) {
    
        var TwisterTorrent = require('./TwisterTorrent.js');
        
        var newtorrent = new TwisterTorrent(this._name,this._scope);
        this._torrent = newtorrent;
        
    }

    return this._torrent;

}

TwisterUser.prototype._doPubKey = function (cbfunc,forceRequest) {
    
    var Twister = this._scope;

    var thisUser = this;
    
    if (!thisUser._pubKeyRequestInProgress) {

        //console.log(thisUser._pubKey);

        if (thisUser._pubKey) {

            cbfunc(thisUser._pubKey)

        } else {

            thisUser._pubKeyRequestInProgress = true;
            
            Twister.RPC("dumppubkey", [ thisUser._name ], function(res) {

                var TwisterCrypto = require('./TwisterCrypto.js');

                //console.log(res);

                thisUser._pubKey = TwisterCrypto.PubKey.fromHex(res);

                if (cbfunc) {

                    cbfunc(thisUser._pubKey);

                }
                
                thisUser._pubKeyRequestInProgress = false;

            }, function(ret) {

                thisUser._pubKeyRequestInProgress = false;
                console.log(ret);

            });   

        }

    } else {
    
        setTimeout(function(){
        
            thisUser._doPubKey(cbfunc);
            
        },200);
        
    }
}

TwisterUser.prototype._verifyAndCachePost =  function (payload,cbfunc) {
    
    var Twister = this._scope;
        
    var thisUser = this;
    
    var newid = payload.userpost.k;
    var payloadUser = payload.userpost.n;

    //console.log(payloadUser+":post"+newid);
    
    if( payloadUser==thisUser.getUsername() && !( newid in thisUser._posts) ) {

        var TwisterPost = require('./TwisterPost.js');

        var newpost = new TwisterPost(payload.userpost,payload.sig_userpost,thisUser._scope);

        thisUser._posts[newpost.getId()] = newpost;
        
        if (cbfunc) {

            cbfunc(newpost);

        }
        
        thisUser._doPubKey(function(pubkey){
                    
            pubkey.messageVerify(payload.userpost,payload.sig_userpost,function(verified){


                if (verified) {


                    //console.log("post signature successfully verifeid")


                } else {

                    //console.log(newpost);
                    //console.log("WARNING: post signature could not be verified!")

                }
            });

        });
        

    }

}

TwisterUser.prototype.doStatus = function (cbfunc, outdatedLimit) {
    
    var Twister = this._scope;
    
    var outdatedTimestamp = 0;
        
    if (outdatedLimit !== undefined) {
        
        outdatedTimestamp = Date.now()/1000 - outdatedLimit;
        
    }
    
    if ( (outdatedLimit !== undefined) && (this._lastStatusUpdate > outdatedTimestamp) && (thisUser._latestId>0) ){
        
        thisUser.doPost(thisUser._latestId,cbfunc);

    } else {
        
        var thisUser = this;
        
        thisUser.getTorrent().updateCache(function(success){
        
            if (success) {
                
                thisUser.doPost(thisUser._latestId,cbfunc);
                
            } else {
                
                Twister.dhtget([thisUser._name, "status", "s"], function (result) {
                    
                        if (result[0]) {
                            
                            thisUser._verifyAndCachePost(result[0].p.v, function(newpost) {
            
                                thisUser._latestId = newpost.getId();
                                thisUser._latestTimestamp = newpost.getTimestamp();
                                thisUser._lastStatusUpdate = Date.now()/1000;
                                
                                cbfunc(newpost);
                                
                            });
                            
                            
                        } else { cbfunc(null) }

                    }
                               
                );
                
            }
            
        });
        
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

    var Twister = this._scope;
    
    if (id) {

        if (id in this._posts){
            
            cbfunc(this._posts[id])
            
        } else {
            
            var thisUser = this;
            
            thisUser.getTorrent().updateCache(function(success){
        
                if (success) {

                    thisUser.doPost(thisUser._latestId,cbfunc);

                } else {

                    Twister.dhtget([thisUser._name, "post"+id, "s"],
                                   
                        function (result) {

                            if (result[0]) {

                                thisUser._verifyAndCachePost(result[0].p.v,cbfunc);
                                
                            } else {
                            
                                cbfunc(null);
                            
                            }

                        }
                                   
                    ); 
                    
                }
                 
            });
            
        }
        
    }
    
};

TwisterUser.prototype.doProfile = function (cbfunc,outdatedLimit) {

    var Twister = this._scope;
    
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

    var Twister = this._scope;
    
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

    var Twister = this._scope;
    
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

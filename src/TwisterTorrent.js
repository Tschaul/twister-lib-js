'use strict';

var inherits = require('inherits');
var TwisterResource = require('./TwisterResource.js');

function TwisterTorrent(name,scope) {
    
    TwisterResource.call(this,name,scope);
    
    this._active = false;
    this._type = "torrent";
    this._followingName = null;

    
}

inherits(TwisterTorrent,TwisterResource);

module.exports = TwisterTorrent;

TwisterTorrent.prototype.flatten = function () {

    var flatData = TwisterResource.prototype.flatten.call(this);
    
    flatData.active = this._active;
    flatData.followingName = this._followingName;

    return flatData;
    
}

TwisterTorrent.prototype.inflate = function (flatData) {

    TwisterResource.prototype.inflate.call(this,flatData);
    
    this._active = flatData.active;
    this._followingName = flatData.followingName;

}

TwisterTorrent.prototype._do = function (cbfunc) {
        cbfunc(this._active);
}

TwisterTorrent.prototype.activate =  function (followingName,cbfunc) {

    if (this._followingName && this._followingName!=followingName) {
    
        this.deactivate(function(){
        
            this.activate(followingName,cbfunc);
        
        });
    
    } else {
        
        this._followingName=followingName;
    
        var Twister = this._scope;

        var thisTorrent = this;

        if (!thisTorrent._active) {

            thisTorrent.RPC("follow", [ thisTorrent._followingName, [thisTorrent._name] ], function(res) {

                thisTorrent._active = true ;

                if (cbfunc) {
                    cbfunc(res);        
                }

            }, function(ret) {

                console.log(ret);

            });

        } else {

            if (cbfunc) {
                cbfunc();        
            }

        }
        
    }

}

TwisterTorrent.prototype.deactivate =  function (cbfunc) {

    var Twister = this._scope;
    
    var thisTorrent = this;
    
    thisTorrent.RPC("unfollow", [ thisTorrent._followingName ,[this._name] ], function(res) {
        
        thisTorrent._active = false ;
        
        if (cbfunc) {
            cbfunc(res);        
        }
        
    }, function(ret) {
        
        console.log(ret);
        
    });

}

TwisterTorrent.prototype._queryAndDo = function (cbfunc,outdatedLimit) {

    var Twister = this._scope;
    
    var thisTorrent = this;

    thisTorrent.RPC("getfollowing", [ this._followingName ], function(res) {
        
        if (thisTorrent._name in res) { 
            
            thisTorrent._active = true ;
            
        } else {
            
            thisTorrent._active = false ;
            
        }
        
        if (cbfunc) {
            
            thisTorrent._do(cbfunc);
            
        }
        
        thisTorrent._lastUpdate = Date.now()/1000;
        
    }, function(ret) {
        
        console.log(ret);
        
    });

}

TwisterTorrent.prototype._fillCacheUsingGetposts = function (count,usernames,maxId,sinceId,cbfunc) {

    var Twister = this._scope;
    
    var thisTorrent = this;
    var thisStream = Twister.getUser(this._name)._stream;
    
    if (thisTorrent._active) {
    
        var requests = [];
        
        for (var i = 0; i<usernames.length; i++){
        
            var request = {username: usernames[i]};
            if (maxId>-1) { request["maxId"]=maxId; }
            if (sinceId>-1) { request["sinceId"]=sinceId; }
            requests.push(request);
            
        }
        
        thisStream.RPC("getposts", [ count , requests ], function(res) {
            
            if (res.length>0) {

                for (var i = 0; i<res.length; i++) {

                    thisStream = Twister.getUser(res[i].userpost.n)._stream;
                    
                    thisStream._verifyAndCachePost(res[i],function(newpost){
                    
                        if ( newpost.getId() > thisStream._latestId ) {

                            thisStream._latestId = newpost.getId();
                            thisStream._latestTimestamp = newpost.getTimestamp();
                            thisStream._lastUpdate = Date.now()/1000;

                        }

                    });
                        
                }
                
                if ( !maxId || maxId==-1 ) {
                
                    for (var i = 0; i<usernames.length; i++){

                        Twister.getUser(usernames[i])._stream._lastUpdate = Date.now()/1000;

                    }
                    
                }

                cbfunc(true);

            } else {

                thisTorrent._checkQueryAndDo(function(active){
                    
                    if (active) {
                    
                        thisStream._lastUpdate = Date.now()/1000;
                    
                    }
                    
                });

            }

        }, function(ret) {
        
            thisStream._handleError(ret);

        });
    
    } else {

        cbfunc(false);

    }
    
}

TwisterTorrent.prototype._checkForUpdatesUsingGetLastHave = function (cbfunc) {

    var Twister = this._scope;
    
    var thisTorrent = this;
    var thisStream = Twister.getUser(this._name)._stream;
    
    if (thisTorrent._active) {
        
            
        for (var username in Twister._cache){
            if (Twister._cache[username]._stream._torrent._followingName == thisTorrent._followingName) {
                Twister._cache[username]._stream._updateInProgress = true;
            }
        }
        
        
        thisStream.RPC("getlasthave", [ thisTorrent._followingName ], function(res) {

            if (res) {
                
                var thisUserIsUpToDate = false;
                
                var outdatedUsers =[];
                

                for (var username in res) {

                    
                    if (username==thisTorrent._name && res[username]==thisStream._latestId) {
                                                
                        thisUserIsUpToDate = true;
                    
                    }
                    
                    if (res[username]==Twister.getUser(username).getLatestId()) {
                      
                        Twister.getUser(username)._stream._lastUpdate=Date.now()/1000;
                        
                    } else {
                        
                        outdatedUsers.push(username);
                        
                    }
                    
                        
                }
                
                thisTorrent._fillCacheUsingGetposts(30,outdatedUsers,-1,-1,function(){
                
                    cbfunc(true);
                    
                    for (var username in Twister._cache){
                        if (Twister._cache[username]._stream._torrent._followingName == thisTorrent._followingName) {
                            Twister._cache[username]._stream._updateInProgress = false;
                        }
                    }
                
                });

            } else {
            
                cbfunc(false);
                
            }
            
            for (var username in Twister._cache){
                if (Twister._cache[username]._stream._torrent._followingName == thisTorrent._followingName) {
                    Twister._cache[username]._stream._updateInProgress = false;
                }
            }

        }, function(ret) {
        
            thisStream._handleError(ret);
            
            cbfunc(false);

        });
    
    } else {

        cbfunc(false);

    }
    
}

TwisterTorrent.prototype.updateCache = function (cbfunc) {
    
    var Twister = this._scope;
    
    var thisTorrent = this;
    var thisStream = Twister.getUser(this._name)._stream;
    
    thisTorrent._checkForUpdatesUsingGetLastHave(function(uptodate){
    
        if (uptodate) {
            
            cbfunc(true);
            
        } else {
            
            thisTorrent._fillCacheUsingGetposts(30,[thisTorrent._name],-1,-1,cbfunc);
            
        }
        
    });
        

}

TwisterTorrent.prototype.fillCache = function (id,cbfunc) {

    var Twister = this._scope;
    
    var thisTorrent = this;
    var thisUser = Twister.getUser(this._name);
    
    thisTorrent._fillCacheUsingGetposts(30,[thisTorrent._name],id,-1,cbfunc);

}
//'use strict';

var inherits = require('inherits');
var TwisterResource = require('../TwisterResource.js');

/**
 * Describes the torrent of the {@link TwisterPosts} of a {@link TwisterUser} when available on the host. The torrent significantly speeds up post querying time. It is implemented as a look-ahead that is queryied when accessing a post that is not already in cache.
 * @class
 */
TwisterTorrent = function (walletusername,name,scope) {
    
  this._hasParentUser = true;

  this._walletusername = walletusername;

  TwisterResource.call(this,name,scope);

  this._latestId = -1;
  this._messages = {};
    
  
  this._active = false;
  this._type = "torrent";

}

inherits(TwisterTorrent,TwisterResource);

module.exports = TwisterTorrent;

TwisterTorrent.prototype.flatten = function () {

  var flatData = TwisterResource.prototype.flatten.call(this);

  flatData.active = this._active;

  return flatData;
    
}

TwisterTorrent.prototype.inflate = function (flatData) {

  TwisterResource.prototype.inflate.call(this,flatData);

  this._active = flatData.active;

}

TwisterTorrent.prototype.activate = function () {
  
  this._active = true;
  var thisStream = Twister.getUser(this._name)._stream;
  thisStream._activeTorrentUser = this._walletusername;

}

TwisterTorrent.prototype.deactivate = function () {
  
  this._active = false;
  
  var foundReplacement = false;
  
  for (var username in Twister._wallet){

    if (this._name in Twister._wallet[username]._torrents) {
      if (Twister._wallet[username]._torrents[this._name]._active) {
        Twister.getUser(this._name)._stream._activeTorrentUser=username;
        foundReplacement = true;
      }
    }
  }
  
  if (!foundReplacement) {
    var thisStream = Twister.getUser(this._name)._stream;
    thisStream._activeTorrentUser = null;
  }

}

TwisterTorrent.prototype.getQuerySetting = function (setting) {

  //console.log(this._name);

  var Twister = this._scope;

  if (setting in this._activeQuerySettings) {
    return this._activeQuerySettings[setting];
  }

  if (setting in this._querySettings) {
    return this._querySettings[setting];
  }

  if (setting in Twister.getAccount(this._walletusername)._querySettings) {
    return Twister.getAccount(this._walletusername)._querySettings[setting];
  }

  if (setting in Twister.getUser(this._name)._stream._activeQuerySettings) {
    return Twister.getUser(this._name)._stream._activeQuerySettings[setting];
  }

  if (setting in Twister.getUser(this._name)._stream._querySettings) {
    return Twister.getUser(this._name)._stream._querySettings[setting];
  }

  return TwisterResource.prototype.getQuerySetting.call(this,setting);

}

TwisterTorrent.prototype._queryAndDo = function (cbfunc) {

  var Twister = this._scope;

  var thisTorrent = this;
  
  var thisAccount = Twister.getAccount(this._walletusername);
  
  if (thisTorrent._active) {
    
    thisTorrent._log("locking torrents of same account")
    
    for (var username in thisAccount._torrents){

      if (thisAccount._torrents[username]._active) {              
          thisAccount._torrents[username]._updateInProgress = true;
      }
    }

    thisTorrent.RPC("getlasthave", [ this._walletusername ], function(res) {

      if (thisTorrent._name in res) { 

        thisTorrent._active = true ;
        
        thisTorrent._log("updating other torrents based on getlasthave result")
        
        for (var username in res) {
          
          if (username in thisAccount._torrents) {

            var resTorrent = thisAccount._torrents[username];

            if (resTorrent._active) {

              resTorrent._latestId = res[username];       
              resTorrent._lastUpdate = Date.now()/1000;  
              resTorrent._updateInProgress = false;

            }
          }
          
        }
        

      } else {

        thisTorrent._active = false ;
        thisTorrent._followingName = null ;
        thisTorrent._handleError({mesage:"Torrent not active on server"});

      }
      
      thisTorrent._log("unlocking torrents with same following name")
      
      for (var username in thisAccount._torrents){

      if (thisAccount._torrents[username]._active) {              
          thisAccount._torrents[username]._updateInProgress = false;
      }
    }

      if (cbfunc) {

        thisTorrent._do(cbfunc);

      }

    }, function(ret) {

      thisTorrent._handleError(ret);

    });
    
  } else {
     
    thisTorrent._handleError({
      message: "Torrent inactive. Activate torrent first!",
      code: 32082
    });
    
  }

}

TwisterTorrent.prototype._fillCacheUsingGetposts = function (count,requests,cbfunc) {

  var Twister = this._scope;

  var thisTorrent = this;
  var thisStream = Twister.getUser(this._name)._stream;

  if (thisTorrent._active) {

    thisStream._log("querying getposts for "+requests.length+" users")

    for (var i in requests){
      Twister.getUser(requests[i].username)._stream._updateInProgress = true;    
    }

    thisTorrent.RPC("getposts", [ count , requests ], function(res) {

      var minIds = {};

      if (res.length>0) {

        for (var i in res) {

          var resUsername = res[i].userpost.n;
          var resId = res[i].userpost.k;

          if (resUsername in minIds) {
            minIds[resUsername]=Math.min(resId,minIds[resUsername]);
          } else {
            minIds[resUsername]=resId;
          }

          var resStream = Twister.getUser(res[i].userpost.n)._stream;

          resStream._verifyAndCachePost(res[i]);

        }

        if (res.length<count) {

          thisStream._log("got all posts, no need to requery");

          for (var i in requests){
            if ( !requests.max_id || requests.max_id==-1 ) {
              Twister.getUser(requests[i].username)._stream._lastUpdate = Date.now()/1000;
              Twister.getUser(requests[i].username)._stream._updateInProgress = false;
            }
          }

          cbfunc(true);

        } else {

          var newrequests = [];

          for (var i in requests){

            if (!(requests[i].username in minIds)) {
              newrequests.push(requests[i]);
            } else {
              Twister.getUser(requests[i].username)._stream._lastUpdate = Date.now()/1000;
              Twister.getUser(requests[i].username)._stream._updateInProgress = false;
            }


            if ( !requests.max_id || requests.max_id==-1 ) {
              Twister.getUser(requests[i].username)._stream._lastUpdate = Date.now()/1000;
              Twister.getUser(requests[i].username)._stream._updateInProgress = false;
            }


          }

          if (newrequests.length) {

            thisStream._log("incomplete result. requerying");

            setTimeout(function(){
              thisTorrent._fillCacheUsingGetposts(count,newrequests,cbfunc);
            },200);

          } else {

            thisStream._log("count full but ok");

            cbfunc(true);

          }

        }

      } else {

        thisStream._log("getposts gave an empty result")

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
  var thisAccount = Twister.getAccount(this._walletusername);
    
  
  for (var username in thisAccount._torrents){

    if (thisAccount._torrents[username]._active) {              
        Twister.getUser(username)._stream._updateInProgress = true;
    }
  }
  
  thisTorrent._checkQueryAndDo( function() {

    if (thisTorrent._active) {

      var outdatedUsers =[];

      for (var username in thisAccount._torrents) {

        var resTorrent = thisAccount._torrents[username];

        if (resTorrent._active) {

          resTorrent._latestId = resTorrent._latestId;       
          resTorrent._lastUpdate = Date.now()/1000;  
          resTorrent._updateInProgress = false;

        }

        if (resTorrent._latestId==Twister.getUser(username)._stream._latestId) {

          Twister.getUser(username)._stream._lastUpdate=Date.now()/1000;
          Twister.getUser(username)._stream._updateInProgress=false;

        } else {

          outdatedUsers.push({username:username});

        }

      }

      thisTorrent._fillCacheUsingGetposts(30,outdatedUsers,function(){

          cbfunc(true);

          for (var username in thisAccount._torrents){

            if (thisAccount._torrents[username]._active) {              
                Twister.getUser(username)._stream._updateInProgress = false;
            }
          }

      });

    } else {

      cbfunc(false);

    }

    for (var username in thisAccount._torrents){

      if (thisAccount._torrents[username]._active) {              
          Twister.getUser(username)._stream._updateInProgress = false;
      }
    }

  });
    
}

TwisterTorrent.prototype.updatePostsCache = function (cbfunc) {
    
  var Twister = this._scope;

  var thisTorrent = this;
  var thisStream = Twister.getUser(this._name)._stream;

  thisStream._log("update posts cache "+thisStream._name)  

  thisTorrent._checkForUpdatesUsingGetLastHave(function(uptodate){

    if (uptodate) {
    thisStream._log("lasthaves "+thisTorrent._name+" worked") 

      cbfunc(true);

    } else {
    thisStream._log("lasthaves "+thisTorrent._name+" failed") 

      thisTorrent._fillCacheUsingGetposts(30,[{username:thisTorrent._name}],cbfunc);

    }

  });
    
}

TwisterTorrent.prototype.fillPostsCache = function (id,cbfunc) {

  var Twister = this._scope;

  var thisTorrent = this;
  var thisUser = Twister.getUser(this._name);
  var thisStream = Twister.getUser(this._name)._stream;

  thisStream._log("fill cache "+thisTorrent._name+" id "+id)  

  thisTorrent._fillCacheUsingGetposts(30,[{username:thisTorrent._name,max_id:id}],cbfunc);

}
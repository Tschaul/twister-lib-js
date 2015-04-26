'use strict';

var inherits = require('inherits');
var TwisterResource = require('./TwisterResource.js');

/**
 * Describes the torrent of the {@link TwisterPosts} of a {@link TwisterUser} when available on the host. The torrent significantly speeds up post querying time. It is implemented as a look-ahead that is queryied when accessing a post that is not already in cache.
 * @class
 */
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

TwisterTorrent.prototype.activate =  function (followingName,cbfunc) {

  var Twister = this._scope;

  var thisTorrent = this;

  if (this._followingName && this._followingName!=followingName) {

    this.deactivate(function(){

      thisTorrent.activate(followingName,cbfunc);

    });

  } else {

    this._followingName=followingName;

    if (!thisTorrent._active) {

      thisTorrent.RPC("follow", [ followingName, [thisTorrent._name] ], function(res) {

        thisTorrent._active = true ;

        if (cbfunc) {
          cbfunc(res);        
        }

      }, function(ret) {

        thisTorrent._handleError(ret);

      });

    } else {

      if (cbfunc) {
        cbfunc();        
      }

    }

  }

}

TwisterTorrent.prototype.deactivate =  function (cbfunc) {

  this._active = false;
  this._followingName = null;

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

  if (setting in Twister.getAccount(this._followingName)._querySettings) {
    return Twister.getAccount(this._followingName)._querySettings[setting];
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
  
  
  if (thisTorrent._active) {
    
    thisTorrent._log("locking torrents with same following name")
    
    for (var username in Twister._userCache){

      if (Twister._userCache[username]._stream._torrent._followingName == thisTorrent._followingName) {              
          Twister._userCache[username]._stream._updateInProgress = true;
      }
    }

    thisTorrent.RPC("getlasthave", [ this._followingName ], function(res) {

      if (thisTorrent._name in res) { 

        thisTorrent._active = true ;
        
        var resTorrent = Twister.getUser(username)._stream._torrent;

        thisTorrent._log("updating other torrents based on getlasthave result")
        
        for (var username in res) {

          var resTorrent = Twister.getUser(username)._stream._torrent;

          if (resTorrent._active) {

            resTorrent._latestId = res[username];       
            resTorrent._lastUpdate = Date.now()/1000;  
            resTorrent._updateInProgress = false;

          }
          
        }
        

      } else {

        thisTorrent._active = false ;
        thisTorrent._followingName = null ;
        thisTorrent._handleError({mesage:"Torrent not active on server"});

      }
      
      thisTorrent._log("unlocking torrents with same following name")
      
      for (var username in Twister._userCache){

        if (Twister._userCache[username]._stream._torrent._followingName == thisTorrent._followingName) {              
            Twister._userCache[username]._stream._updateInProgress = false;
        }
      }

      if (cbfunc) {

        thisTorrent._do(cbfunc);

      }

    }, function(ret) {

      thisTorrent._handleError(ret);

    });
    
  } else {
     
    thisTorrent._handleError({message: "Activate torrent first"});
    
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

          resStream._verifyAndCachePost(res[i],function(newpost){

            if ( newpost.getId() > resStream._latestId ) {

              resStream._latestId = newpost.getId();

            }

          });

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
    
  
  if (thisTorrent._active) {


    for (var username in Twister._userCache){

        if (Twister._userCache[username]._stream._torrent._followingName == thisTorrent._followingName) {              
            Twister._userCache[username]._stream._updateInProgress = true;
        }
    }


    thisTorrent.RPC("getlasthave", [ thisTorrent._followingName ], function(res) {

        if (res) {

          var thisUserIsUpToDate = false;

          var outdatedUsers =[];

          for (var username in res) {

            var resTorrent = Twister.getUser(username)._stream._torrent;

            if (resTorrent._active) {

              resTorrent._latestId = res[username];       
              resTorrent._lastUpdate = Date.now()/1000;  
              resTorrent._updateInProgress = false;

            }


            if (username==thisTorrent._name && res[username]==thisStream._latestId) {

              thisUserIsUpToDate = true;

            }

            if (res[username]==Twister.getUser(username)._stream._latestId) {

              Twister.getUser(username)._stream._lastUpdate=Date.now()/1000;
              Twister.getUser(username)._stream._updateInProgress=false;

            } else {

              outdatedUsers.push({username:username});

            }

          }

          thisTorrent._fillCacheUsingGetposts(30,outdatedUsers,function(){

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

  thisStream._log("update cache "+thisStream._name)  

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

TwisterTorrent.prototype.fillCache = function (id,cbfunc) {

  var Twister = this._scope;

  var thisTorrent = this;
  var thisUser = Twister.getUser(this._name);
  var thisStream = Twister.getUser(this._name)._stream;

  thisStream._log("fill cache "+thisTorrent._name+" id "+id)  

  thisTorrent._fillCacheUsingGetposts(30,[{username:thisTorrent._name,max_id:id}],cbfunc);

}
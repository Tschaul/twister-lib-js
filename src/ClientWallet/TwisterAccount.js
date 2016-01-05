var inherits = require('inherits');

var TwisterResource = require('../TwisterResource.js');
var TwisterPrivKey = require('./TwisterPrivKey.js');
var TwisterContentParser = require('./TwisterContentParser.js');

var bencode = require('bencode');


/**
 * Describes a user account in Twister. Allows for the private information about that user as well as for posting new messages.
 * @class ServerWallet_TwisterAccount
 */
function TwisterAccount(name,scope) {
    
	TwisterResource.call(this,name,scope);
	
    this._name = name;
    this._scope = scope;
	
    this._type = "account";
	this._hasParentUser = false;
    
	this._wallettype = "client";
	
	this._directmessages = {};
  
    this._torrents = {};
  
    this._privkey = new TwisterPrivKey(name,scope);

}

module.exports = TwisterAccount;

inherits(TwisterAccount,TwisterResource);

TwisterAccount.prototype.flatten = function () {
    
    var flatData = TwisterResource.prototype.flatten.call(this);

    flatData.wallettype = this._wallettype;
    
    flatData.directmessages = [];
    
    for (var username in this._directmessages){
        flatData.directmessages.push(this._directmessages[username].flatten());
    }
  
    flatData.torrents = [];
    
    for (var username in this._torrents){
        flatData.torrents.push(this._torrents[username].flatten());
    }
    
    flatData.privkey = this._privkey.flatten();
  
    return flatData;


}

TwisterAccount.prototype.inflate = function (flatData) {
    
    TwisterResource.prototype.inflate.call(this,flatData);
    
    this._wallettype = flatData.wallettype;
    this._privateFollowings = flatData.privateFollowings;

    var TwisterDirectMessages = require('./TwisterDirectMessages.js');
    var TwisterTorrent = require('./TwisterTorrent.js');

    for(var i in flatData.directmessages){

        var newuser = new TwisterDirectMessages(this._name,flatData.directmessages[i].name,Twister);
        newuser.inflate(flatData.directmessages[i]);
        this._directmessages[flatData.directmessages[i].name]=newuser;

    }

    for(var i in flatData.torrents){

        var newuser = new TwisterTorrent(this._name,flatData.torrents[i].name,Twister);
        newuser.inflate(flatData.torrents[i]);
        this._torrents[flatData.torrents[i].name]=newuser;

    }
  
    this._privkey.inflate(flatData.privkey);

}

TwisterAccount.prototype.trim = function (timestamp) {

  for (var username in this._directmessages){
    this._directmessages[username].trim(timestamp);
  }

  for (var username in this._torrents){
    this._torrents[username].trim(timestamp);
  }
  
}

TwisterAccount.prototype.getUsername = function () {return this._name}

TwisterAccount.prototype.activateTorrents = function (cbfunc,querySettings) {

	var Twister = this._scope;
    
    var thisAccount = this;

    //thisAccount.RPC("getlasthave", [ this._name ], function(res) {
        
    Twister.getUser(this._name).doFollowings(function(followings){
  
        var usernames = followings.map(function(fol){
          return fol.getUsername();
        })
      
        usernames.push(thisAccount._name);
              
        thisAccount.RPC("follow", [ "guest", usernames ], function(res) {
        
          for (var k in usernames) {

            var username = usernames[k];
            
            var resTorrent = thisAccount.getTorrent(username);

            resTorrent.activate();

            thisAccount._log("torrent for "+username+" activated");

          }

          cbfunc();
          
        }, function(ret) {
        
            thisAccount._handleError(ret);

        })
        
    });

}

TwisterAccount.prototype.activateTorrent = function (username,cbfunc,querySettings) {

	var Twister = this._scope;
    
    var thisAccount = this;

    thisAccount.RPC("follow", [ "guest", [username] ], function(res) {

      var resTorrent = thisAccount.getTorrent(username);

      resTorrent.activate();

      thisAccount._log("torrent for "+username+" activated");

      if(cbfunc) cbfunc();

    }, function(ret) {

        thisAccount._handleError(ret);

    })
        

}

TwisterAccount.prototype.unfollow = function (username,cbfunc) {
  
  var thisAccount = this;
    
  var Twister = this._scope;

  Twister.getUser(this._name).doFollowings(function(fols){
    
    var newfollowings = fols.map(function(fol){
      return fol.getUsername();
    }).filter(function(name){
      return name!=username;
    })
    
    var oldRevisionNumers = Twister.getUser(thisAccount._name)._followings._revisionNumber;
    
    thisAccount.updateFollowing(newfollowings,oldRevisionNumers,cbfunc)
    
  },{outdatedLimit: 0})

}

TwisterAccount.prototype.follow = function (username,cbfunc) {
  
  var thisAccount = this;
    
  var Twister = this._scope;

  Twister.getUser(this._name).doFollowings(function(fols){
    
    var newfollowings = fols.map(function(fol){
      return fol.getUsername();
    });
        
    if(newfollowings.indexOf(username)<0){
      newfollowings.push(username);
    }
    
    //console.log(newfollowings);
    
    var oldRevisionNumers = Twister.getUser(thisAccount._name)._followings._revisionNumber;
    
    console.log("oldrev:",oldRevisionNumers)
    
    thisAccount.updateFollowing(newfollowings,oldRevisionNumers,cbfunc)
    
  },{outdatedLimit: 0})

}

TwisterAccount.prototype.updateFollowing = function (newfollowings,oldRevsionNumbers,cbfunc) {
  
  var newfollowings = JSON.parse(JSON.stringify(newfollowings));
  var newfollowings_ori = JSON.parse(JSON.stringify(newfollowings));
  var oldRevsionNumbers = JSON.parse(JSON.stringify(oldRevsionNumbers));
  
  var thisAccount = this;
  
  var Twister = this._scope;
  
  var currentCounter = 1;

  var newRevNumbers = {};
  
  var putTilEmpty = function (cbfunc) {

      thisAccount.dhtget([thisAccount._name, "following"+currentCounter, "s"],

          function (result) {

              if ((result[0] && result[0].p.v[0])||newfollowings.length) {

                var charcount = 0;
                
                var folsforthisresource = [];
                
                while(newfollowings.length && charcount<4000){
                  
                  var nextfol = newfollowings.shift();
                  
                  charcount += nextfol.length + 3;
                  
                  folsforthisresource.push(nextfol);
                  
                }
                
                var seq = oldRevsionNumbers[currentCounter] ? oldRevsionNumbers[currentCounter]+1 : 1 ;
                
                thisAccount._dhtput(
                  thisAccount._name,
                  "following"+currentCounter,
                  "s",
                  folsforthisresource,
                  seq,
                  function(result){

                    newRevNumbers[currentCounter]=seq;
                    currentCounter++;
                    putTilEmpty(cbfunc)

                },function(error){
                  thisAccount._handleError(error);
                });
                  
              } else {

                  Twister.getUser(thisAccount._name)._followings._data = newfollowings_ori;
                  Twister.getUser(thisAccount._name)._followings._revisionNumber = newRevNumbers;
                  Twister.getUser(thisAccount._name)._followings._do(cbfunc);

              }

          }

      ); 

  };  

  putTilEmpty(cbfunc);
  
  
}

TwisterAccount.prototype.updateProfile = function (newdata,cbfunc) {

	var thisAccount = this;
    
    var Twister = this._scope;
    var thisUser = Twister.getUser(this._name);
    
    thisUser.doProfile(function(profile){
	
      thisAccount._dhtput(
        thisAccount._name,
        "profile",
        "s",
        newdata,
        profile._revisionNumber+1,
        function(result){

        var TwisterProfile = require("../TwisterProfile.js");

        var newprofile = new TwisterProfile(thisAccount._name,Twister);
        newprofile._data = newdata;
        if(cbfunc) cbfunc(newprofile);

      },function(error){
        thisAccount._handleError(error);
      });
	
	},{errorfunc:function(error){
    
      if (error.code==32052) {
       
        Twister.getUser(this._name)._profile._lastUpdate = Date.now()/1000;
        Twister.getUser(this._name)._profile._revisionNumber = 0;
        Twister.getUser(this._name)._profile._updateInProgress = false;
        
        thisAccount.updateProfileFields(newdata,cbfunc);
        
      }
      
    }})

}

TwisterAccount.prototype.updateProfileFields = function (newdata,cbfunc) {

	var thisAccount = this;
    
    var Twister = this._scope;
    var thisUser = Twister.getUser(this._name);
  
    thisUser.doProfile(function(profile){
      
      var olddata = JSON.parse(JSON.stringify(profile._data));
      
      for (var key in newdata) {

          olddata[key] = newdata[key];

      }
      
      thisAccount._dhtput(
          thisAccount._name,
          "profile",
          "s",
          olddata,
          profile._revisionNumber+1,
          function(result){
          
          var TwisterProfile = require("../TwisterProfile.js");
          
          var newprofile = new TwisterProfile(thisAccount._name,Twister);
          newprofile._data = olddata;
          if(cbfunc) cbfunc(newprofile);
        
        },function(error){
          thisAccount._handleError(error);
      });
	
    },{errorfunc:function(error){
    
      if (error.code==32052) {
       
        Twister.getUser(this._name)._profile._lastUpdate = Date.now()/1000;
        Twister.getUser(this._name)._profile._revisionNumber = 0;
        Twister.getUser(this._name)._profile._updateInProgress = false;
        
        thisAccount.updateProfileFields(newdata,cbfunc);
        
      }
      
    }})

}

TwisterAccount.prototype.updateAvatar = function (newdata,cbfunc) {

	var thisAccount = this;
    
    var Twister = this._scope;
    
    Twister.getUser(this._name).doAvatar(function(avatar){
	
		thisAccount._dhtput(
          thisAccount._name,
          "avatar",
          "s",
          newdata,
          avatar._revisionNumber+1,
          function(result){
          
          var TwisterAvatar = require("../TwisterAvatar.js");
          
          var newprofile = new TwisterAvatar(thisAccount._name,Twister);
          newprofile._data = newdata;
          if(cbfunc) cbfunc(newprofile);
		
		},function(error){
          thisAccount._handleError(error);
		});
	
	},{errorfunc:function(error){
    
      if (error.code==32052) {
       
        Twister.getUser(this._name)._avatar._lastUpdate = Date.now()/1000;
        Twister.getUser(this._name)._avatar._revisionNumber = 0;
        Twister.getUser(this._name)._avatar._updateInProgress = false;
        
        thisAccount.updateAvatar(newdata,cbfunc);
        
      }
      
    }})

}

TwisterAccount.prototype.post = function (msg,cbfunc) {
  
  var post = {msg:msg};
    
  this._signAndPublish(post,cbfunc);

}

TwisterAccount.prototype.reply = function (replyusername,replyid,msg,cbfunc) {
  
  var thisAccount = this;
  
  var post = {
    msg:msg,
    reply:{
      k: replyid,
      n: replyusername      
    }
  };
  
  this._signAndPublish(post,function(newpost){
    
    var v = {
      rt: newpost._data,
      sig_rt: newpost._signature
    }
    
    thisAccount._dhtput(
      replyusername,
      "replies"+replyid,
      "m",
      v,
      0,
      function(result){
        Twister.getUser(replyusername)._stream._posts[replyid]._replies._data[newpost.getUsername()+":post"+newpost.getId()]=true; 
        if(cbfunc) cbfunc(newpost);
      },
      function(error){
        thisAccount._handleError(error);
      }
    );
    
  });

}

TwisterAccount.prototype.retwist = function (rtusername,rtid,cbfunc) {
  
  var thisAccount = this;
    
  var Twister = this._scope;

  Twister.getUser(rtusername).doPost(rtid,function(post){
    
    var post = {
      rt: post._data,
      sig_rt: post._signature
    }
    
    
    thisAccount._signAndPublish(post,function(newpost){
    
      var v = {
        rt: newpost._data,
        sig_rt: newpost._signature
      }
      
      thisAccount._dhtput(
        rtusername,
        "rts"+rtid,
        "m",
        v,
        0,
        function(result){
          Twister.getUser(rtusername)._stream._posts[rtid]._retwists._data[newpost.getUsername()+":post"+newpost.getId()]=true;  
          if(cbfunc) cbfunc(newpost);
        },
        function(error){
          thisAccount._handleError(error);
        }
      );

    });
    
  });


}

TwisterAccount.prototype.getTorrent = function (username) {
  
  if( username in this._torrents ) {
    return this._torrents[username];
  } else {
    var TwisterTorrent = require('./TwisterTorrent.js');
    var newtorrent = new TwisterTorrent(this._name,username,this._scope);
    this._torrents[username]=newtorrent;
    return this._torrents[username];
  }

}

TwisterAccount.prototype.getDirectMessages = function (username, cbfunc, querySettings) {

	if ( !(username in this._directmessages) ){
	
		var TwisterDirectMessages = require("./TwisterDirectMessages.js");
		
		var newdmsgs = new TwisterDirectMessages(this._name,username,this._scope);
		
		this._directmessages[username] = newdmsgs;
	
	}
	
	return this._directmessages[username];

}

TwisterAccount.prototype.doLatestDirectMessage = function (username, cbfunc, querySettings) {

	this.getDirectMessages(username)._checkQueryAndDo(cbfunc, querySettings);

}

TwisterAccount.prototype.doLatestDirectMessagesUntil = function (username, cbfunc, querySettings) {

	this.getDirectMessages(username)._doUntil(cbfunc, querySettings);

}

TwisterAccount.prototype._signAndPublish = function(post_ori,cbfunc){
  
  var post = JSON.parse(JSON.stringify(post_ori));
  
  if ("sig_rt" in post) {
      post.sig_rt = new Buffer(post.sig_rt, 'hex');
  }
  
  var thisAccount = this;
  
  var Twister = this._scope;

  this.getTorrent(this._name)._checkQueryAndDo(function(thisTorrent){

    var newid = thisTorrent._latestId+1;
  
    thisAccount.RPC("getinfo",[],function(info){

      Twister.getUser(thisAccount._name).doStatus(function(status){  
        
        //console.log("new post msg after",status)

        
        post.height = info.blocks-1;
        post.n = thisAccount._name;
        post.k = newid;
        post.lastk = status.getId();
        post.time = Math.round(Date.now()/1000);
        
        //console.log("new post will be",post)
        
        thisAccount._privkey.sign(post,function(sig){
          
          var v = {
            sig_userpost: sig,
            userpost: post
          };
          
          //console.log("publishing new post ",v);
          
          var message = bencode.encode(v);
          
          thisAccount.RPC("newpostraw",[thisAccount._name,newid,message.toString("hex")],function(){
            
            thisAccount._publishPostOnDht(v,function(){
              
              console.log("going to verify ",v)
              
              v.sig_userpost = v.sig_userpost.toString("hex");
              
              if ("sig_rt" in v.userpost) {
                v.userpost.sig_rt = v.userpost.sig_rt.toString("hex");
              }
              
              thisTorrent._latestId = newid;
              
              Twister.getUser(thisAccount._name)._stream._verifyAndCachePost(v,cbfunc);
              
            });
                        
          },function(error){
            thisAccount._handleError(error);
          });
          
        });
        
      });

    },function(error){
      thisAccount._handleError(error);
    });
    
  });
  
}

TwisterAccount.prototype._dhtput = function(username,resource,sorm,value,seq,cbfunc){
  
  var thisAccount = this;
  
  var Twister = this._scope;
  
  thisAccount.RPC("getinfo",[],function(info){
    
    var p = {
        height: info.blocks-1,
        v:value,
        seq: seq,
        target:{
          "n" : username,
          "r" : resource,
          "t" : sorm
        },
        time: Math.round(Date.now()/1000),
        v: value
      };
    
    console.log("dhtputraw",p)
    
    thisAccount._privkey.sign(p,function(sig){
      
        var dhtentry = {
          p: p,
          sig_user:thisAccount._name,
          sig_p: sig
        }
        
        var message = bencode.encode(dhtentry);
        
        thisAccount.RPC("dhtputraw",[message.toString("hex")],function(){
          if(cbfunc) cbfunc();
        },function(error){
          thisAccount._handleError(error);
        });
        
    });
    
  },function(error){
    thisAccount._handleError(error);
  });
  
}

TwisterAccount.prototype._publishPostOnDht = function(v,cbfunc){
  
  var Twister = this._scope;
  
  var thisAccount = this;
  
  var querId = v.sig_userpost.toString("hex");
  
  Twister.onQueryComplete(querId,function(){
    if(cbfunc) cbfunc(v);
  });

  Twister.raiseQueryId(querId);
        
  thisAccount._dhtput(
    thisAccount._name,
    "status",
    "s",
    v,
    v.userpost.k,
    function(result){
      Twister.bumpQueryId(querId);
    },
    function(error){
      thisAccount._handleError(error);
    }
  );
  
  Twister.raiseQueryId(querId);
        
  thisAccount._dhtput(
    thisAccount._name,
    "post"+v.userpost.k,
    "s",
    v,
    1,
    function(result){
      Twister.bumpQueryId(querId);
    },
    function(error){
      thisAccount._handleError(error);
    }
  );
  
  if(v.userpost && v.userpost.msg){
    
    var parsedContent = TwisterContentParser.parseContent(v.userpost.msg);
            
    parsedContent.map(function(item){
      
      if(item.type=="hashtag"){
                
        Twister.raiseQueryId(querId);
        
        thisAccount._dhtput(
          item.raw,
          "hashtag",
          "m",
          v,
          0,
          function(result){
            //console.log(Twister.getHashtag(item.raw))
            Twister.getHashtag(item.raw)._data[v.userpost.n+":post"+v.userpost.k]=true;
            Twister.bumpQueryId(querId);
          },
          function(error){
            thisAccount._handleError(error);
          }
        );
        
      }
      
      
      if(item.type=="mention"){
        
        Twister.raiseQueryId(querId);
                
        thisAccount._dhtput(
          item.raw,
          "mention",
          "m",
          v,
          0,
          function(result){
            Twister.getUser(item.raw)._mentions._data[v.userpost.n+":post"+v.userpost.k]=true;
            Twister.bumpQueryId(querId);
          },
          function(error){
            thisAccount._handleError(error);
          }
        );
        
      }
      
    });
        
    
  }
  
}
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
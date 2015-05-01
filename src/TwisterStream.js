var inherits = require('inherits');

var TwisterResource = require('./TwisterResource.js');
//var TwisterTorrent = require('./TwisterTorrent.js');

/**
 * Describes the stream of posts of a {@link TwisterUser}.
 * @class
 */
TwisterStream = function (name,scope) {
    
    TwisterResource.call(this,name,scope);
    
    this._latestId = -1;
    this._posts = {};
    this._verified = true; //post are verified individually
    
    this._activeTorrentUser = null;
    
    this._type = "stream";

}

inherits(TwisterStream,TwisterResource);

TwisterStream.prototype.flatten = function () {

    var flatData = TwisterResource.prototype.flatten.call(this);
    
    var flatPosts = [];
    
    for (var id in this._posts){
        flatPosts.push(this._posts[id].flatten());
    }
    
    flatData.posts = flatPosts;
    flatData.latestId  = this._latestId;
    flatData.activeTorrentUser  = this._activeTorrentUser;
    
    
    return flatData;


}

TwisterStream.prototype.inflate = function (flatData) {
    
  var Twister = this._scope;

  var TwisterPost = require('./TwisterPost.js');

  TwisterResource.prototype.inflate.call(this,flatData);

  this._latestId = flatData.latestId;
  this._activeTorrentUser = flatData.activeTorrentUser;

  for(var i = 0; i < flatData.posts.length; i++){

    if (flatData.posts[i].verified) {

      var newpost = new TwisterPost(flatData.posts[i].data,flatData.posts[i].signature,Twister);
      newpost.inflate(flatData.posts[i]);
      this._posts[newpost.getId()]=newpost;

    } else if (flatData.posts[i].data.k==this._latestId) {

      this._latestId = -1;
      this._lastUpdate = -1;

    }

  }

}

TwisterStream.prototype._do =  function (cbfunc) {
    
    this._doPost(this._latestId,cbfunc);
    
}

TwisterStream.prototype.updateCache = function (cbfunc) {
  
  var Twister = this._scope;
  
  if (this._activeTorrentUser) {
    Twister._wallet[this._activeTorrentUser]._torrents[this._name].updatePostsCache(cbfunc);
  } else {
    this._log("user has no active torrent")
    cbfunc(false);
  }

}

TwisterStream.prototype.fillCache = function (id,cbfunc) {
  
  var Twister = this._scope;
  
  if (this._activeTorrentUser) {
    Twister._wallet[this._activeTorrentUser]._torrents[this._name].fillPostsCache(id,cbfunc);
  } else {
    cbfunc(false);
  }

}

TwisterStream.prototype._queryAndDo = function (cbfunc) {
  
    var thisResource = this;
        
    thisResource.updateCache(function(success){

        if (success) {
            
            thisResource._log("updating cache with torrent successfull")
          
            thisResource._do(cbfunc);
            thisResource._updateInProgress = false;

        } else {
          
            thisResource._log("updating cache with torrent failed")

            thisResource.dhtget([thisResource._name, "status", "s"], function (result) {

                    thisResource._log("result from dhtget: "+JSON.stringify(result));
              
                    if (result[0]) {

                        thisResource._verifyAndCachePost(result[0].p.v, function(newpost) {

                            thisResource._latestId = newpost.getId();
                            thisResource._lastUpdate = Date.now()/1000;
                            thisResource._updateInProgress = false;

                            cbfunc(newpost);

                        });


                    } else { 
			
                      thisResource._handleError({
                        message: "DHT resource is empty.",
                        code: 32052
                      })
                      thisResource._updateInProgress = false;
                      cbfunc(null);
                      
                    }

                }

            );

        }

    });  
        
}

TwisterStream.prototype._verifyAndCachePost =  function (payload,cbfunc) {
    
    var Twister = this._scope;
        
    var thisResource = this;
    
    var newid = payload.userpost.k;
    var payloadUser = payload.userpost.n;

    //console.log(payloadUser+":post"+newid);
    
    if( !( newid in thisResource._posts) ) {

		var signatureVerification = thisResource.getQuerySetting("signatureVerification");
		
        var TwisterPost = require('./TwisterPost.js');

        var newpost = new TwisterPost(payload.userpost,payload.sig_userpost,Twister);

        thisResource._posts[newpost.getId()] = newpost;
      
        if ( thisResource._latestId<newpost.getId() ) {
        
            thisResource._latestId=newpost.getId();
        
        }
        
        if (cbfunc && signatureVerification=="none") {
            
            thisResource._log("no signature verifcation needed");
          
            newpost._verified = true;
          
            cbfunc(newpost);
          

        } else {
        
			if (cbfunc && signatureVerification=="background") { 
              
              thisResource._log("issuing signature verification in background");
              
              var errorfunc = thisResource.getQuerySetting("errorfunc");
              
              cbfunc(newpost); 
            
            }
			
			Twister.getUser(thisResource._name)._doPubKey(function(pubkey){

				pubkey.verifySignature(payload.userpost,payload.sig_userpost,function(verified){

					if (verified) {

						newpost._verified=true;
                      
                        if (newpost.isRetwist()) {
                          
                          var post_rt = payload.userpost.rt;
                          var sig_rt = payload.userpost.sig_rt;
                          
                          Twister.getUser(post_rt.n)._doPubKey(function(pubkey){

                            pubkey.verifySignature(post_rt,sig_rt,function(verified){

                                if (verified) {
                                  
                                  if (cbfunc && signatureVerification=="instant") {
                                    cbfunc(newpost); 
                                  }
                                  
                                } else {

                                  errorfunc.call(thisResource,{
                                    message: "Signature of retwisted post could not be verified.",
                                    code: 32062
                                  });
                                
                                }
                              
                            });
                            
                          });
                          
                        } else {

						  if (cbfunc && signatureVerification=="instant") { cbfunc(newpost); }
                          
                        }

					} else {

                        errorfunc.call(thisResource,{
                          message: "Post signature could not be verified.",
                          code: 32060
                        });

					}

				});

			});
				
		}
 
    } else if(cbfunc) {
      cbfunc(thisResource._posts[newid]);
    }

}

TwisterStream.prototype._doPost = function (id, cbfunc, querySettings) {

  if (querySettings===undefined) {querySettings={};} 
  
  //console.log(querySettings)
  
  var Twister = this._scope;

  var thisResource = this;
  
  if (id && id>0) {

    if (id in this._posts){

      cbfunc(this._posts[id])

      this._log("post already in cache");

    } else {
        
      thisResource._activeQuerySettings = querySettings;
      thisResource._updateInProgress = true;

      this._log("post "+id+" not in cache");

      var thisResource = this;

      thisResource.fillCache(id,function(success){

        if (success) {

          thisResource._log("fill cache was successfull")
          
          thisResource._activeQuerySettings = {};
          thisResource._updateInProgress = false;

          cbfunc(thisResource._posts[id])

        } else {

          thisResource.dhtget([thisResource._name, "post"+id, "s"],

            function (result) {

              if (result[0]) {
            
                thisResource._verifyAndCachePost(result[0].p.v,cbfunc);
                
              } else {
			
                thisResource._handleError({
                  message: "DHT resource is empty.",
                  code: 32052
                })
                thisResource._updateInProgress = false;
                cbfunc(null);
                
              }
          
              thisResource._activeQuerySettings = {};
              thisResource._updateInProgress = false;

            }

          ); 

        }

      });

    }

  }
    
};

TwisterStream.prototype._doUntil = function (cbfunc, querySettings) {

  this._checkQueryAndDo(function doUntil(post){

    var retVal = cbfunc(post);

    if( post.getId()!=1 && retVal!==false ) { 

      post.doPreviousPost(doUntil, querySettings); 

    }

  }, querySettings);
	
}

module.exports = TwisterStream;


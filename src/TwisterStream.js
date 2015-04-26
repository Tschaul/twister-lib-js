var inherits = require('inherits');

var TwisterResource = require('./TwisterResource.js');
var TwisterTorrent = require('./TwisterTorrent.js');

/**
 * Describes the stream of posts of a {@link TwisterUser}.
 * @class
 */
TwisterStream = function (name,scope) {
    
    TwisterResource.call(this,name,scope);
    
    this._latestId = -1;
    this._posts = {};
    this._verified = true; //post are verified individually
    
    this._torrent = new TwisterTorrent(name,scope);
    
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
    flatData.torrent  = this._torrent.flatten();
    
    
    return flatData;


}

TwisterStream.prototype.inflate = function (flatData) {
    
    var Twister = this._scope;
  
    var TwisterPost = require('./TwisterPost.js');
    
    TwisterResource.prototype.inflate.call(this,flatData);
    
    this._latestId = flatData.latestId;
    
    for(var i = 0; i < flatData.posts.length; i++){
        
		if (flatData.posts[i].verified) {
		
			var newpost = new TwisterPost(flatData.posts[i].data,Twister);
			newpost.inflate(flatData.posts[i]);
			this._posts[newpost.getId()]=newpost;
			
		}
    
    }
    
    this._torrent.inflate(flatData.torrent);

}

TwisterStream.prototype._do =  function (cbfunc) {
    
    this._doPost(this._latestId,cbfunc);
    
}

TwisterStream.prototype._queryAndDo = function (cbfunc) {
  
    var thisResource = this;
        
    thisResource._torrent.updateCache(function(success){

        if (success) {
            
            thisResource._log("updating cache with torrent successfull")
          
            thisResource._do(cbfunc);
            thisResource._updateInProgress = false;

        } else {
          
            thisResource._log("updating cache with torrent failed")

            thisResource.dhtget([thisResource._name, "status", "s"], function (result) {

                    console.log(result);
              
                    if (result[0]) {

                        thisResource._verifyAndCachePost(result[0].p.v, function(newpost) {

                            thisResource._latestId = newpost.getId();
                            thisResource._lastUpdate = Date.now()/1000;
                            thisResource._updateInProgress = false;

                            cbfunc(newpost);

                        });


                    } else { 
                      cbfunc(null);
                      thisResource._updateInProgress = false;
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
    
    if( payloadUser==thisResource._name && !( newid in thisResource._posts) ) {

		var signatureVerification = thisResource.getQuerySetting("signatureVerification");
		
        var TwisterPost = require('./TwisterPost.js');

        var newpost = new TwisterPost(payload.userpost,Twister);

        thisResource._posts[newpost.getId()] = newpost;
      
        
        if ( thisResource._latestId<newpost.getId() ) {
        
            thisResource._latestId=newpost.getId();
        
        }
        
        if (cbfunc && signatureVerification=="none") {
            
            cbfunc(newpost);

        } else {
        
			if (cbfunc && signatureVerification=="background") { cbfunc(newpost); }
			
			Twister.getUser(thisResource._name)._doPubKey(function(pubkey){

				pubkey.verifySignature(payload.userpost,payload.sig_userpost,function(verified){


					if (verified) {

						newpost._verified=true;

						if (cbfunc && signatureVerification=="instant") { cbfunc(newpost); }

					} else {

						thisResource._handleError({message:"signature of post could not be verified"});

					}

				});

			});
				
		}
 
    } else {
    
    }

}

TwisterStream.prototype._doPost = function (id,cbfunc) {

  var Twister = this._scope;

  if (id && id>0) {

    if (id in this._posts){

      cbfunc(this._posts[id])

      this._log("post already in cache");

    } else {

      this._log("post "+id+" not in cache");

      var thisResource = this;

      thisResource._torrent.fillCache(id,function(success){

        if (success) {

          thisResource._log("fill cache was successfull")

          cbfunc(thisResource._posts[id])

        } else {

          thisResource.dhtget([thisResource._name, "post"+id, "s"],

            function (result) {

              thisResource._verifyAndCachePost(result[0].p.v,cbfunc);

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


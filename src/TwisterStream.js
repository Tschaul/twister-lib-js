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
    
    var TwisterPost = require('./TwisterPost.js');
    
    TwisterResource.prototype.inflate.call(this,flatData);
    
    this._latestId = flatData.latestId;
    
    for(var i = 0; i < flatData.posts.length; i++){
        
		if (flatData.posts[i].verified) {
		
			var newpost = new TwisterPost(flatData.posts[i].data,this._scope);
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

    //console.log("inside stream query and do of "+this._name);
    
    var thisResource = this;
        
    thisResource._torrent.updateCache(function(success){

        if (success) {
            
            thisResource._do(cbfunc);

        } else {

            thisResource.dhtget([thisResource._name, "status", "s"], function (result) {

                    if (result[0]) {

                        thisResource._verifyAndCachePost(result[0].p.v, function(newpost) {

                            thisResource._latestId = newpost.getId();
                            thisResource._lastUpdate = Date.now()/1000;

                            cbfunc(newpost);

                        });


                    } else { cbfunc(null) }

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

        var newpost = new TwisterPost(payload.userpost,payload.sig_userpost,thisResource._scope);

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

						thisResource._verified=true;

						if (cbfunc && signatureVerification=="instant") { cbfunc(newpost); }

					} else {

						thisResource._handleError({message:"signature of post could not be verified"});

					}

				});

			});
				
		}
 
    }

}

TwisterStream.prototype._doPost = function (id,cbfunc) {

    var Twister = this._scope;
    
    if (id && id>0) {

        if (id in this._posts){
            
            cbfunc(this._posts[id])
            
            //console.log("post already in cache");
            
        } else {
            
            var thisResource = this;
            
            thisResource._torrent.fillCache(id,function(success){
        
                if (success) {

                    thisResource._doPost(thisResource._latestId,cbfunc);

                } else {

                    thisResource.dhtget([thisResource._name, "post"+id, "s"],
                                   
                        function (result) {

                            if (result[0]) {

                                thisResource._verifyAndCachePost(result[0].p.v,cbfunc);
                                
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

TwisterStream.prototype._doUntil = function (cbfunc, querySettings) {

	this._checkQueryAndDo(function doUntil(post){
	
		var retVal = cbfunc(post);
		
		if( post.getId()!=1 && retVal!==false ) { 
			
			post.doPreviousPost(doUntil, querySettings); 
			
		}
	
	}, querySettings);
	
}

module.exports = TwisterStream;


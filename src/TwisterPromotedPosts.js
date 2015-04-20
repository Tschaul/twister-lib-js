var inherits = require('inherits');

var TwisterResource = require('./TwisterResource.js');

/**
 * Describes the promoted posts that are part of the twister blockchain.
 * @class
 */
TwisterPromotedPosts = function (scope) {
    
    var name = "promoted";
	this._hasParentUser = false;
	
    TwisterResource.call(this,name,scope);
    
    this._latestId = -1;
    this._posts = {};
    
    this._type = "promotedposts";

}

inherits(TwisterPromotedPosts,TwisterResource);

TwisterPromotedPosts.prototype.flatten = function () {

    var flatData = TwisterResource.prototype.flatten.call(this);
    
    var flatPosts = [];
    
    for (var id in this._posts){
        flatPosts.push(this._posts[id].flatten());
    }
    
    flatData.posts = flatPosts;
    flatData.latestId  = this._latestId;    
    
    return flatData;

}

TwisterPromotedPosts.prototype.inflate = function (flatData) {
    
    var TwisterPost = require('./TwisterPost.js');
    
    TwisterResource.prototype.inflate.call(this,flatData);
    
    this._latestId = flatData.latestId;
    
    for(var i = 0; i < flatData.posts.length; i++){
        
        var newpost = new TwisterPost(flatData.posts[i].data,this._scope);
        newpost.inflate(flatData.posts[i]);
        this._posts[newpost.getId()]=newpost;
    
    }

}

TwisterPromotedPosts.prototype._do =  function (cbfunc) {
    
    this._doPost(this._latestId,cbfunc);
    
}

TwisterPromotedPosts.prototype._queryAndDo = function (cbfunc) {
    	
    var thisResource = this;
        
	thisResource.RPC("getspamposts", [ 30 ], function(res) {
            		
			if (res.length>0) {

				for (var i = 0; i<res.length; i++) {

					thisResource._verifyAndCachePost(res[i],function(newpost){

						if ( newpost.getId() > thisResource._latestId ) {

							thisResource._latestId = newpost.getId();
							thisResource._lastUpdate = Date.now()/1000;

						}

					});

				}
				
				thisResource._do(cbfunc);

			} 

		}, function(ret) {

			thisResource._handleError(ret);

		}
					 
	);
 
        
}

TwisterPromotedPosts.prototype._verifyAndCachePost =  function (payload,cbfunc) {
	
    var Twister = this._scope;
        
    var thisResource = this;
    
    var newid = payload.userpost.k;
    var payloadUser = payload.userpost.n;
    
    if( !( newid in thisResource._posts) ) {

        var TwisterPost = require('./TwisterPost.js');

        var newpost = new TwisterPost(payload.userpost,payload.sig_userpost,thisResource._scope);

		newpost._isPromotedPost = true;
		
        thisResource._posts[newpost.getId()] = newpost;
        
        if ( thisResource._latestId<newpost.getId() ) {
        
            thisResource._latestId=newpost.getId();
        
        }
        
        if (cbfunc) {
            
            cbfunc(newpost);

        }
        
        Twister.getUser(newpost.getUsername())._doPubKey(function(pubkey){
                    
            pubkey.verifySignature(payload.userpost,payload.sig_userpost,function(verified){

                if (verified) {

					thisResource._verified=true;

                } else {

                    thisResource._handleError({message:"signature of promoted post could not be verified"});

                }
                
            });

        });
        
    }

}

TwisterPromotedPosts.prototype._doPost = function (id,cbfunc) {

    var Twister = this._scope;
    
    if (id && id>0) {

        if (id in this._posts){
            
            cbfunc(this._posts[id])
            
        } else {
            
            var thisResource = this;
            
            thisResource.RPC("getspamposts", [ 30 , id ], function(res) {
            		
					if (res.length>0) {

						for (var i = 0; i<res.length; i++) {

							thisResource._verifyAndCachePost(res[i]);

						}

						cbfunc(thisResource._posts[id])

					} 

				}, function(ret) {

					thisResource._handleError(ret);

				}

			);
            
        }
        
    }
    
};


TwisterPromotedPosts.prototype.doLatestPostsUntil = function (cbfunc, querySettings) {

	Twister._promotedPosts._checkQueryAndDo(function doUntil(post){
	
		var retVal = cbfunc(post);
		
		if( post.getId()!=1 && retVal!==false ) { 
			
			post.doPreviousPost(doUntil, querySettings); 
			
		}
	
	}, querySettings);
	
}

module.exports = TwisterPromotedPosts;


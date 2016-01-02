var inherits = require('inherits');

var TwisterResource = require('./TwisterResource.js');


/**
 * Describes a hashtag resource.
 * @module
 */
var TwisterHashtag = function (name,scope) {
    
    TwisterResource.call(this,name,scope);
    this._type = "hashtag";
    this._data = {};
	this._hasParentUser = false;
    
}

inherits(TwisterHashtag,TwisterResource);

TwisterHashtag.prototype.trim = function (timestamp) {

  if (!timestamp || timestamp > this._lastUpdate){

    delete this._scope._hashtags[this._name];
    
  }

}

TwisterHashtag.prototype._do = function (cbfunc) {
	this.doPosts(cbfunc);
}

TwisterHashtag.prototype._queryAndDo = function (cbfunc, querySettings) {
    
    var currentCounter = 1;
        
    var Twister = this._scope;
    
    var thisHashtag = this;
    
    thisHashtag._data = {};

    thisHashtag._lastUpdate=Date.now()/1000;
        
    thisHashtag.dhtget([thisHashtag._name, "hashtag", "m"],

        function (result) {
      
            var TwisterPost = require("./TwisterPost.js");

            for (i=0; i<result.length; i++) {

                var username = result[i].p.v.userpost.n;
                var id = result[i].p.v.userpost.k;

                thisHashtag._data[username+":post"+id]=true;                

                if (! (id in Twister.getUser(username)._stream._posts ) ) {
                
                    Twister.getUser(username)._stream._verifyAndCachePost(result[i].p.v);
                    
                }

            }
        
            thisHashtag._do(cbfunc);

        }
                        
    ); 
        
}


/** @function
 * @name doPosts 
 * @description calls cbfunc with every {@link TwisterPost} object of the hashtag.
 * @param {function} cbfunc callback function
 */
TwisterHashtag.prototype.doPosts = function (cbfunc) {

	var posts = [];
	
    for (var key in this._data) {

        var nandk = key.split(":post");
        var username = nandk[0];
        var id = parseInt(nandk[1]);
        
		posts.push(Twister.getUser(username).getPost(id));
		
    }
	
	cbfunc(posts);

}

module.exports = TwisterHashtag;
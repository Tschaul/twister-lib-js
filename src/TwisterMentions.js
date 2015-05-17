var inherits = require('inherits');

var TwisterResource = require('./TwisterResource.js');

/**
 * Describes the mentions of a {@link TwisterUser}.
 * @module
 */
var TwisterMentions = function (name,scope) {
    
    TwisterResource.call(this,name,scope);
    this._type = "mentions";
    this._data = {};
    
}

inherits(TwisterMentions,TwisterResource);

TwisterMentions.prototype.trim = function (timestamp) {

  if (!timestamp || timestamp > this._lastUpdate){

    var thisUser = this._scope.getUser(this._name);

    var TwisterMentions = require("./TwisterMentions.js");
    
    thisUser._mentions = new TwisterMentions(this._name,this._scope);
    
  }

}

TwisterMentions.prototype._do = function (cbfunc) {
	this.doPosts(cbfunc);
}

TwisterMentions.prototype._queryAndDo = function (cbfunc) {
    
    var currentCounter = 1;
        
    var Twister = this._scope;
    
    var thisMentions = this;
    
    var thisUser = Twister.getUser(this._name);

    thisMentions._data = {};

    thisMentions._lastUpdate=Date.now()/1000;
        
    thisMentions.dhtget([thisUser.getUsername(), "mention", "m"],

        function (result) {

            var TwisterPost = require("./TwisterPost.js");

            for (i=0; i<result.length; i++) {

                var username = result[i].p.v.userpost.n;
                var id = result[i].p.v.userpost.k;

                thisMentions._data[username+":post"+id]=true;                

                if (! (id in Twister.getUser(username)._stream._posts ) ) {
                
                    Twister.getUser(username)._stream._verifyAndCachePost(result[i].p.v);
                    
                }

            }
        
            thisMentions._do(cbfunc);

        }
                        
    ); 
        
}

/** @function
 * @name doPosts 
 * @description calls cbfunc with every {@link TwisterPost} object of the mentions.
 * @param {function} cbfunc callback function
 */
TwisterMentions.prototype.doPosts = function (cbfunc) {

	var posts = [];
	
    for (var key in this._data) {

        var nandk = key.split(":post");
        var username = nandk[0];
        var id = parseInt(nandk[1]);
        
		posts.push(Twister.getUser(username).getPost(id));
		
    }
	
	cbfunc(posts);

}

module.exports = TwisterMentions;
var inherits = require('inherits');

var TwisterResource = require('./TwisterResource.js');

/**
 * Describes the replies to a {ælink TwisterPost}.
 * @class
 */
var TwisterReplies = function (name,id,scope) {
    
    TwisterResource.call(this,name,scope);
    this._type = "replies";
    this._id = id;
    this._data = {};
    
}

inherits(TwisterReplies,TwisterResource);

TwisterReplies.prototype.flatten = function () {

    var flatData = TwisterResource.prototype.flatten.call(this);
    
    flatData.id  = this._id;
    
    return flatData;


}

TwisterReplies.prototype.inflate = function (flatData) {
    
    TwisterResource.prototype.inflate.call(this,flatData);
    
    this._id = flatData.id;

}

TwisterReplies.prototype.trim = function (timestamp) {

  if (!timestamp || timestamp > this._lastUpdate){

    var thisPost = this._scope.getUser(this._name).getPost(this._id);

    var TwisterReplies = require("./TwisterReplies.js");
    
    thisPost._replies = new TwisterReplies(this._name,this._id,this._scope);
    
  }

}

TwisterReplies.prototype._do = function (cbfunc) {
	this.doPosts(cbfunc);
}

TwisterReplies.prototype._queryAndDo = function (cbfunc) {
    
    var currentCounter = 1;
        
    var Twister = this._scope;
    
    var thisReplies = this;
    
    var thisUser = Twister.getUser(this._name);

    thisReplies._data = {};

    thisReplies._lastUpdate=Date.now()/1000;
    
    thisReplies.dhtget([thisUser.getUsername(), "replies"+thisReplies._id, "m"],

        function (result) {

            var TwisterPost = require("./TwisterPost.js");

            for (i=0; i<result.length; i++) {

                var username = result[i].p.v.userpost.n;
                var id = result[i].p.v.userpost.k;

                thisReplies._data[username+":post"+id]=true;                

                if (! (id in Twister.getUser(username)._stream._posts ) ) {
                
                    Twister.getUser(username)._stream._verifyAndCachePost(result[i].p.v);
                    
                }

            }

            thisReplies._do(cbfunc);

        }
                        
    ); 
        
}

TwisterReplies.prototype.doPosts = function (cbfunc) {

    var posts = [];
	
    for (var key in this._data) {

        var nandk = key.split(":post");
        var username = nandk[0];
        var id = parseInt(nandk[1]);
        
		posts.push(Twister.getUser(username).getPost(id));
		
    }
	
	cbfunc(posts);

}

module.exports = TwisterReplies;
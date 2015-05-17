var inherits = require('inherits');

var TwisterResource = require('./TwisterResource.js');

/**
 * Describes the retwists of a {@link TwisterPost}.
 * @class
 */
var TwisterRetwists = function (name,id,scope) {
    
    TwisterResource.call(this,name,scope);
    this._type = "retwists";
    this._id = id;
    this._data = {};
    
}

inherits(TwisterRetwists,TwisterResource);

TwisterRetwists.prototype.flatten = function () {

    var flatData = TwisterResource.prototype.flatten.call(this);
    
    flatData.id  = this._id;
    
    return flatData;


}

TwisterRetwists.prototype.inflate = function (flatData) {
    
    TwisterResource.prototype.inflate.call(this,flatData);
    
    this._id = flatData.id;

}

TwisterRetwists.prototype.trim = function (timestamp) {

  if (!timestamp || timestamp > this._lastUpdate){

    var thisPost = this._scope.getUser(this._name).getPost(this._id);

    var TwisterRetwists = require("./TwisterRetwists.js");
    
    thisPost._retwists = new TwisterRetwists(this._name,this._id,this._scope);
    
  }

}

TwisterRetwists.prototype._do = function (cbfunc) {
	this.doPosts(cbfunc);
}

TwisterRetwists.prototype._queryAndDo = function (cbfunc) {
    
    var currentCounter = 1;
        
    var Twister = this._scope;
    
    var thisRetwists = this;
    
    var thisUser = Twister.getUser(this._name);

    thisRetwists._data = {};

    thisRetwists._lastUpdate=Date.now()/1000;
        
    thisRetwists.dhtget([thisUser.getUsername(), "rts"+thisRetwists._id, "m"],

        function (result) {

            var TwisterPost = require("./TwisterPost.js");

            for (i=0; i<result.length; i++) {

                var username = result[i].p.v.userpost.n;
                var id = result[i].p.v.userpost.k;

                thisRetwists._data[username+":post"+id]=true;                

                if (! (id in Twister.getUser(username)._stream._posts ) ) {
                
                    Twister.getUser(username)._stream._verifyAndCachePost(result[i].p.v);
                    
                }

            }
        
            thisRetwists._do(cbfunc);

        }
                        
    ); 
        
}

TwisterRetwists.prototype.doPosts = function (cbfunc) {

    var posts = [];
	
    for (var key in this._data) {

        var nandk = key.split(":post");
        var username = nandk[0];
        var id = parseInt(nandk[1]);
        
		posts.push(this._scope.getUser(username).getPost(id));
		
    }
	
	cbfunc(posts);
}

module.exports = TwisterRetwists;
var inherits = require('inherits');

var TwisterResource = require('./TwisterResource.js');

TwisterHashtag = function (name,scope) {
    
    TwisterResource.call(this,name,scope);
    this._type = "hashtag";
    this._data = {};
    
}

inherits(TwisterHashtag,TwisterResource);

TwisterHashtag.prototype._queryAndDo = function (cbfunc) {
    
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

TwisterHashtag.prototype.doPosts = function (cbfunc) {

    for (var key in this._data) {

        var nandk = key.split(":post");
        var username = nandk[0];
        var id = parseInt(nandk[1]);
        Twister.getUser(username).doPost(id,cbfunc);

    }

}

module.exports = TwisterHashtag;
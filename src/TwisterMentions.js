var inherits = require('inherits');

var TwisterResource = require('./TwisterResource.js');

TwisterMentions = function (name,scope) {
    
    TwisterResource.call(this,name,scope);
    this._type = "mentions";
    this._data = {};
    
}

inherits(TwisterMentions,TwisterResource);

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

TwisterMentions.prototype.doPosts = function (cbfunc) {

    for (var key in this._data) {

        var nandk = key.split(":post");
        var username = nandk[0];
        var id = parseInt(nandk[1]);
        Twister.getUser(username).doPost(id,cbfunc);

    }

}

module.exports = TwisterMentions;
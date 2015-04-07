'use strict';

function TwisterUser(name) {
    this._name = name;
    this._posts = {};
    this._lastUpdate = -1;
    this._latestId = -1;
    this._latestTimestamp = -1;
}

TwisterUser.prototype.update = function (cbfunc) {

    var thisUser = this;
    Twister.RPC("dhtget", [thisUser._name, "status", "s"],
        function (result) {
        
            var newpost = new TwisterPost(result[0].p.v.userpost);
            thisUser._latestId = newpost.getId();
            thisUser._latestTimestamp = newpost.getTimestamp();
            thisUser._posts[thisUser._latestId]=newpost;

            thisUser._lastUpdate = Date.now();

            if (cbfunc) cbfunc(newpost);
        
        },
        function(ret) {console.log(ret);}
    );

}

TwisterUser.prototype.doPostsSince = function (timestamp,cbfunc) {
    
    var thisUser = this;
    
    if (timestamp <= 0) { timestamp = timestamp+Date.now()/1000; }
    
    var doPostTilTimestamp = function(post){
        if (post.getTimestamp()>timestamp) {
            cbfunc(post);
            thisUser.doPost(post.getlastId(),doPostTilTimestamp);
        }
    };
        
    this.update(doPostTilTimestamp);
    
}

TwisterUser.prototype.doPost = function (id,cbfunc) {

    if (id in this._posts){
        cbfunc(this._posts[id])
    } else {
        var thisUser = this;
        Twister.RPC("dhtget", [thisUser._name, "post"+id, "s"],
            function (result) {

                var id = result[0].p.v.userpost.k;
                var newpost = new TwisterPost(result[0].p.v.userpost);
                thisUser._posts[id]=newpost;

                cbfunc(newpost);

            },
            function(ret) {console.log(ret);}
        );   
    }
    
}
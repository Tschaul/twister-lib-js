function TwisterUser(name) {
    this._name = name;
    this._posts = [];
    this._lastUpdate = -1;
}

TwisterUser.prototype.update = function () {

    Twister.RPC("getposts", [10,[{username:this._name}]],
        function(user,results) {
            //console.log(results);
            
            for (var i=0; i<results.length; i++) {
                var k=results[i].userpost.k;
                //console.log(results[i].userpost.k);
                if(user._posts[k]===undefined){
                    //console.log(results[i].userpost.k);
                    var newpost = new TwisterPost(results[i])
                    user._posts.push(newpost);
                }
                
            }
        
        }, this,
        function(a,ret) {console.log(ret);}, null);

}

TwisterUser.prototype.getPost = function (k) {
    for (var i=0; i<this._posts.length; i++) {
        if(this._posts[i].getId()==k) return this._posts[i];
    }
}
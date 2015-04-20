function TwisterUsers(names) {
    this._names = names;
}

TwisterUsers.prototype.doStatuses = function (cbfunc, outdatedLimit) {

    var currentCount = 0;
    var totalCount = this._names.length;
    var retAll = [];
    
    var cbfuncIfAllComplete = function (post) {
    
        if (post!==null) { retAll.push(post); }
        
        currentCount++;
        
        
        if (currentCount==totalCount) {
            
            //console.log("complete "+post.getUsername());
         
            cbfunc(retAll);
            
        } else {
            
            //console.log("not complete "+post.getUsername());
        
        }
    
    };
    
    for (var i=0; i<this._names.length; i++) {
        
        //console.log(this._names[i])
        Twister.getUser(this._names[i]).doStatus(cbfuncIfAllComplete, outdatedLimit);

    }

}

TwisterUsers.prototype.doLatestPosts = function (count, cbfunc, outdatedLimit) {
        
    var currentCount = 0;
    var currentPosts = [];
    
    var addPostToCurrentPostsAndRedo = function (post) {
    
        for (var i = 0; i<currentPosts.length; i++) {
            
            if (post.getUsername()==currentPosts[i].getUsername()) {
                
                currentPosts[i]=post;
            
            }
            
        }
        
        doPostTilCount(currentPosts);
    
    }
    
    var doPostTilCount = function (posts) {
        
        currentPosts = posts;
        
        if (currentCount < count) {
            
            var latestTimestamp = 0;
            var latestPostIndex = -1;
            
            for (var i = 0; i<posts.length; i++) {
            
                if (posts[i].getTimestamp()>latestTimestamp) {
                
                    latestTimestamp = posts[i].getTimestamp();
                    latestPostIndex = i;
                
                }
            
            }
            
            Twister.getUser(posts[latestPostIndex].getUsername())
                .doPost(
                    posts[latestPostIndex].getlastId(),
                    addPostToCurrentPostsAndRedo
                );
            
            cbfunc(posts[latestPostIndex]);
            currentCount++;
            
        }
        
    };
    
    this.doStatuses(doPostTilCount,outdatedLimit);
    //this.doStatuses(function(posts){console.log(posts)},outdatedLimit);
    
};
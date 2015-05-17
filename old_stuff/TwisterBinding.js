function TwisterBinding(context,listener,cbfunc,arg) {
    this._context=context;
    this._listener=listener;
    this._cbfunc=cbfunc;
    this._arg=arg;
    this._handeledPosts={};
    this._interval=5000;
    this._stopping=false;
}

TwisterBinding.prototype.callListener = function (cbfunc) {
    //console.log(this._context);

    if (this._arg === undefined || this._arg === null) {
        this._context[this._listener](cbfunc);
    } else { 
        this._context[this._listener](this._arg,cbfunc);
    }
    
}

TwisterBinding.prototype.run = function () {
    
    thisBinding=this;
    
    //console.log("calling listener");

    this.callListener(function(post){

        //console.log("testsetset ");
    
        var postIdentifier = post.getUser() + ":post" + post.getId();
        
        if ( !(thisBinding._handeledPosts[postIdentifier]) ) {
            
		    //console.log("got unknow post ");

            var retval = thisBinding._cbfunc(post);
            if (!retval) {
                //console.log("stopping "+retval)
                thisBinding._stopping=true;
            } else {
                //console.log("not stopping "+retval)
                
            }
            thisBinding._handeledPosts[postIdentifier]=true;
            
        } else { 

		    //console.log("got know post ");

	    }
        
    });
    
    if (this._stopping == false) {
        //console.log("check settimeout "+this._interval);
        setTimeout(function(){thisBinding.run()},this._interval);
    }
    
}

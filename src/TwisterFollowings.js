var inherits = require('inherits');

var TwisterResource = require('./TwisterResource.js');

TwisterFollowings = function (name,scope) {
    
    TwisterResource.call(this,name,scope);
    this._type = "following";
    
}

inherits(TwisterFollowings,TwisterResource);

TwisterFollowings.prototype._queryAndDo = function (cbfunc) {

    var currentCounter = 1;
        
    var thisResource = this;

    thisResource._data = [];

    thisResource._lastUpdate=Date.now()/1000;

    var requestTilEmpty = function (cbfunc) {

        thisResource.dhtget([thisResource._name, "following"+currentCounter, "s"],
                       
            function (result) {

                if (result[0] && result[0].p.v[0]) {

                    for (var i = 0; i<result[0].p.v.length; i++) {

                        thisResource._data.push(result[0].p.v[i]);

                    }

                    currentCounter++;
                    requestTilEmpty(cbfunc)

                } else {
                
                    thisResource._do(cbfunc);
                
                }

            }


        ); 

    };  
        
    requestTilEmpty(cbfunc);
        
}

TwisterFollowings.prototype.getNames = function () {

    return this._data;
    
}

TwisterFollowings.prototype.doUsers = function(cbfunc) {

    var Twister = this._scope;
    
    var followingNames = this.getNames();
    
    for (var i=0; i<followingNames.length; i++) {

        cbfunc(Twister.getUser(followingNames[i]));

    }

}

module.exports = TwisterFollowings;
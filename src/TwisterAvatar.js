var inherits = require('inherits');

var TwisterResource = require('./TwisterResource.js');

/**
 * Describes the avatar of a {@link TwisterUser}.
 * @module 
 */
TwisterAvatar = function (name,scope) {
    
    TwisterResource.call(this,name,scope);
  
    this._type = "avatar";
    
}

inherits(TwisterAvatar,TwisterResource);

module.exports = TwisterAvatar;

TwisterAvatar.prototype._queryAndDo = function (cbfunc) {

    var thisResource = this;
    
    var Twister = this._scope;
    
    thisResource.dhtget([thisResource._name, "avatar", "s"],
                   
        function (result) {
         
            thisResource._updateInProgress = false;

            if (result[0]) {

                thisResource._data=result[0].p.v;
                thisResource._revisionNumber=result[0].p.seq;
                thisResource._lastUpdate=Date.now()/1000;
                cbfunc(thisResource);

            } else {
			
				thisResource._handleError({
                  message: "DHT resource is empty.",
                  code: 32052
                })
                thisResource._revisionNumber=0;
                thisResource._lastUpdate=Date.now()/1000;
                //cbfunc(thisResource);
			
			}

        }

    );   
        
}

/** @function
 * @name getUrl 
 * @description return the (data-)url of the avatar
 */
TwisterAvatar.prototype.getUrl = function () {

    return this._data;
    
}
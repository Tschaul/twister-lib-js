var inherits = require('inherits');

var TwisterResource = require('./TwisterResource.js');

/**
 * Describes the avatar of a {@link TwisterUser}.
 * @module 
 */
var TwisterAvatar = function (name,scope) {
    
    TwisterResource.call(this,name,scope);
  
    this._type = "avatar";
    
}

inherits(TwisterAvatar,TwisterResource);

module.exports = TwisterAvatar;

TwisterAvatar.prototype.trim = function (timestamp) {

  if (!timestamp || timestamp > this._lastUpdate){

    var thisUser = this._scope.getUser(this._name);

    var TwisterAvatar = require("./TwisterAvatar.js");
    
    thisUser._avatar = new TwisterAvatar(this._name,this._scope);
    
  }

}

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
			
				/*thisResource._handleError({
                  message: "DHT resource is empty.",
                  code: 32052
                })*/
                thisResource._revisionNumber=0;
                thisResource._lastUpdate=Date.now()/1000;
                cbfunc(thisResource);
			
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

/** @function
 * @name getUsername 
 * @description return the username of the owner of the avatar
 */
TwisterAvatar.prototype.getUsername = function () {

    return this._name;
    
}
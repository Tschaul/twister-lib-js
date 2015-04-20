var inherits = require('inherits');

var TwisterResource = require('./TwisterResource.js');

/**
 * Describes the avatar of a {@link TwisterUser}.
 * @class
 */
TwisterAvatar = function (name,scope) {
    
    this._type = "avatar";
    this._name = name;
    this._data =  null;

    TwisterResource.call(this,name,scope);
    
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
			
				
                thisResource._revisionNumber=0;
                thisResource._lastUpdate=Date.now()/1000;
                cbfunc(thisResource);
			
			}

        }

    );   
        
}

TwisterAvatar.prototype.getUrl = function () {

    return this._data;
    
}
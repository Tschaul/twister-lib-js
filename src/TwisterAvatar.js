var inherits = require('inherits');

var TwisterResource = require('./TwisterResource.js');

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
    
    this._updateInProgress = true;
    
    thisResource.dhtget([thisResource._name, "avatar", "s"],
                   
        function (result) {
         
            thisResource._updateInProgress = false;

            if (result[0]) {

                thisResource._data=result[0].p.v;
                thisResource._lastUpdate=Date.now()/1000;
                cbfunc(thisResource);

            }

        }

    );   
        
}

TwisterAvatar.prototype.getUrl = function () {

    return this._data;
    
}
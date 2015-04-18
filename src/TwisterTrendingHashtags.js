var inherits = require('inherits');

var TwisterResource = require('./TwisterResource.js');

TwisterTrendingHashtags = function (count,scope) {
    
    var name = "trending";
    
    this._count = count;
    this._data =  null;
	this._hasParentUser = false;

    TwisterResource.call(this,name,scope);   
    
    this._type = "trendinghashtags";

    
}

inherits(TwisterTrendingHashtags,TwisterResource);

module.exports = TwisterTrendingHashtags;

TwisterTrendingHashtags.prototype.flatten = function () {

    var flatData = TwisterResource.prototype.flatten.call(this);
    
    flatData.count = this._count;
        
    return flatData;

}

TwisterTrendingHashtags.prototype.inflate = function (flatData) {
    
    TwisterResource.prototype.inflate.call(this,flatData);
    
    this._count = flatData.count;

}

TwisterTrendingHashtags.prototype._queryAndDo = function (cbfunc) {

    var thisResource = this;
    
    thisResource._updateInProgress = true;
            
    thisResource.RPC("gettrendinghashtags", [ thisResource._count ], function(res) {

        //var TwisterCrypto = require('./TwisterCrypto.js');
        //console.log(res);
        thisResource._lastUpdate = Date.now()/1000;
        
        thisResource._data = res;

        if (cbfunc) {

            thisResource._do(cbfunc);

        }

        thisResource._updateInProgress = false;

    }, function(ret) {

        thisResource._handleError(ret);

    });     
        
}

TwisterTrendingHashtags.prototype.setCount = function (newcount) {

    this._count = newcount;
    this._data = null;
    this._verified = false;
    this._lastUpdate = -1;
    this._updateInProgress = false;

}

TwisterTrendingHashtags.prototype.getHashtags = function () {

    return this._data;
    
}

TwisterTrendingHashtags.prototype.doHashtags = function (cbfunc) {

    var Twister = this._scope;
    
    for(var i=0; i<this._data.length; i++) {
        
        cbfunc(Twister.getHashtag(this._data[i]));
    
    }
    
}


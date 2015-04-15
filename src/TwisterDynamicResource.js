"use strict";

function TwisterDynamicResource (scope) {

    this._scope = scope;
    this._lastUpdate = -1;
    this._updateInProgress = false;
    this._data = null;

}

TwisterDynamicResource.prototype._do = function (cbfunc,outdatedlimit) {

    var Twister = this._scope;

    var thisResource = this;
    
    if (!thisUser._requestInProgress) {

        var outdatedTimestamp = 0;
        
        if (outdatedLimit !== undefined) {

            outdatedTimestamp = Date.now()/1000 - outdatedLimit;

        }

        if ( (outdatedLimit !== undefined) && (this._lastUpdate > outdatedTimestamp) ){

            cbfunc(thisResource)

        } else {

            thisResource._queryAndDo(cbfunc);
        }

    } else {
    
        setTimeout(function(){
        
            thisResource._do(cbfunc,60);
            
        },200);
        
    }

} 
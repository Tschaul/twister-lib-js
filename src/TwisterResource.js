"use strict";

function TwisterResource (name,scope) {

    this._type = "none";
    this._scope = scope;
    this._name = name;
    this._data = null;
    this._verified = false;
    this._lastUpdate = -1;
    this._querySettings = {};
    
    this._updateInProgress = false;
    this._activeQuerySettings = {};

}

module.exports = TwisterResource;

TwisterResource.prototype.flatten = function () {

    return { 
        lastUpdate: this._lastUpdate,
        name: this._name,
        data: this._data
    };

}

TwisterResource.prototype.inflate = function (flatData) {
    
    this._lastUpdate = flatData.lastUpdate;
    this._name = flatData.name;
    this._data = flatData.data;

}

TwisterResource.prototype._do =  function (cbfunc) {

    cbfunc(this);

}

TwisterResource.prototype._checkQueryAndDo = function (cbfunc,querySettings) {
    
    if (!querySettings) {querySettings={};}
    
    var Twister = this._scope;

    var thisResource = this;
        
    if (!thisResource._updateInProgress) {
        
        thisResource._activeQuerySettings = querySettings;
        thisResource._updateInProgress = true;

        var outdatedTimestamp = 0;
        
        outdatedTimestamp = Date.now()/1000 - thisResource.getQuerySetting("outdatedLimit");    

        if ( this._lastUpdate > outdatedTimestamp ){
            
            thisResource._do(cbfunc);
            
            thisResource._activeQuerySettings = {};
            thisResource._updateInProgress = false;

        } else {
            
            thisResource._queryAndDo(function(newresource){
                
                newresource._do(cbfunc);
                
                thisResource._activeQuerySettings = {};
                thisResource._updateInProgress = false;
            
            });
            
        }

    } else {
        
        setTimeout(function(){
        
            thisResource._checkQueryAndDo(cbfunc,querySettings);
            
        },200);
        
    }

} 

TwisterResource.prototype.getQuerySetting = function (setting) {

    var Twister = this._scope;
    
    if (setting in this._activeQuerySettings) {
        return this._activeQuerySettings[setting];
    }
    
    if (setting in this._querySettings) {
        return this._querySettings[setting];
    }
    
    if (setting in Twister._querySettingsByType) {
        return Twister._querySettingsByType[setting];
    }
    
    if (setting in Twister.getUser(this._name)._querySettings) {
        return Twister.getUser(this._name)._querySettings[setting];
    }
    
    if ( ("_"+setting) in Twister) {
        return Twister[("_"+setting)];
    }
    
    this._handleError({message:"unknown query setting was requested."});

}

TwisterResource.prototype.setQuerySetting = function (setting,value) {

    this._querySettings[settings] = value;

}

TwisterResource.prototype._handleError = function (error) {
    
    this._updateInProgress = false;

    this.getQuerySetting("errorfunc").call(this,error);
    
}

TwisterResource.prototype.RPC = function (method, params, resultFunc, errorFunc) {
    
    
    if ( (typeof $ == "function") && ( typeof $.JsonRpcClient == "function") ) {
        
        var foo = new $.JsonRpcClient({ 
        ajaxUrl: this.getQuerySetting("host"),
        timeout: this.getQuerySetting("timeout")
        });
        foo.call(method, params,
            function(ret) { if(typeof resultFunc === "function") resultFunc(ret); },
            function(ret) { if(typeof errorFunc === "function" && ret != null) errorFunc(ret); }
        );
        
    } else {
                    
        var request = require('request');
        request({
            uri: this.getQuerySetting("host"),
            method: "POST",
            timeout: this.getQuerySetting("timeout"),
            followRedirect: true,
            maxRedirects: 10,
            body: '{"jsonrpc": "2.0", "method": "'+method+'", "params": '+JSON.stringify(params)+', "id": 0}'
        }, function(error, response, body) {
            
            if (error) { console.log(error); } else {
                var res = JSON.parse(body);
                if (res.error) {
                    errorFunc(res.error);
                } else {
                    resultFunc(res.result);
                }
                
            }
            
        });
        
    }
      
}

TwisterResource.prototype.dhtget = function (args,cbfunc) {

    var Twister = this._scope;
    
    var thisResource = this;
    
    if ( Twister._activeDHTQueries < Twister._maxDHTQueries ) {
    
        Twister._activeDHTQueries++;
        
        thisResource.RPC("dhtget", args, function(res){
            
            Twister._activeDHTQueries--;
            
            if (res[0]) {
            
                var signingUser = res[0].sig_user;
                
                if (args[2]="m" || (args[0]==signingUser) ) {
                
                    cbfunc(res);

                    Twister.getUser(signingUser)._doPubKey(function(pubkey){

                        pubkey.verifySignature(res[0].p,res[0].sig_p,function(verified){


                            if (verified) {

                                thisResource._verified = true;


                            } else {

                                console.log("WARNING: DHT resource signature could not be verified!")

                            }

                        });

                    });
                    
                }
                
            }
            
        }, function(error) {
            
            Twister._activeDHTQueries--;
            thisResource._handleError(error);
            
        });
        
    } else {
                
        setTimeout(function(){
        
            thisResource.dhtget(args,cbfunc);
            
        },200);
    
    }

}
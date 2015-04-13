'use strict';

var Twister = {};

Twister._cache = {};

Twister._activeDHTQueries = 0;
Twister._maxDHTQueries = 5;

Twister._options = {};

Twister.init = function (options) {
    
    Twister._options = options;

}

Twister.RPC = function (method, params, resultFunc, errorFunc) {
    
    if ( (typeof $ == "function") && ( typeof $.JsonRpcClient == "function") ) {
        
        var foo = new $.JsonRpcClient({ 
        ajaxUrl: Twister._options.host,
        timeout: 10000
        });
        foo.call(method, params,
            function(ret) { if(typeof resultFunc === "function") resultFunc(ret); },
            function(ret) { if(typeof errorFunc === "function" && ret != null) errorFunc(ret); }
        );
        
    } else {
            
        var request = require('request');
        request({
            uri: Twister._options.host,
            method: "POST",
            timeout: 20000,
            followRedirect: true,
            maxRedirects: 10,
            body: '{"jsonrpc": "2.0", "method": "'+method+'", "params": '+JSON.stringify(params)+', "id": 0}'
        }, function(error, response, body) {
            
            if (error) { 
                
                console.log(error);
                
            } else {
            
                var res = JSON.parse(body);

                //console.log(res);

                if (res.error) {

                    errorFunc(res.error);

                } else {

                    resultFunc(res.result);

                }
                
            }
            
        });
        
    }
      
      
}

Twister.dhtget = function (args,cbfunc) {

    if ( Twister._activeDHTQueries < Twister._maxDHTQueries ) {
    
        Twister._activeDHTQueries++;
        
        Twister.RPC("dhtget", args, function(post){
            
            Twister._activeDHTQueries--;
            cbfunc(post);
        
        }, function(ret) {
            
            Twister._activeDHTQueries--;
            console.log(ret);
            
        });
        
    } else {
                
        setTimeout(function(){
        
            Twister.dhtget(args,cbfunc);
            
        },200);
    
    }

}

Twister.getUser = function (initval) {
    
    if (Twister._cache[initval] === undefined) {
    
        var TwisterUser = require('./TwisterUser.js');
        
        Twister._cache[initval] = new TwisterUser(initval,Twister);

    }
    
    return Twister._cache[initval];

}

Twister.serializeCache = function () {

    var retUser = [];
    
    for (var username in this._cache){
        retUser.push(this._cache[username].flatten());
    }
    
    return {users: retUser};


}

Twister.deserializeCache = function (flatData) {

    for(var i = 0; i < flatData.users.length; i++){
        
        var newuser = new TwisterUser(flatData.users[i].name,Twister);
        newuser.inflate(flatData.users[i]);
        this._cache[flatData.users[i].name]=newuser;
    
    }
}

module.exports = Twister;

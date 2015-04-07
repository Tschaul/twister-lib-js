'use strict';

var Twister = {};

Twister.Cache = {};

Twister.RPC = function (method, params, resultFunc, resultArg, errorFunc, errorArg) {
    var foo = new $.JsonRpcClient({ 
        ajaxUrl: "http://178.62.231.62"
    });
    foo.call(method, params,
        function(ret) { if(typeof resultFunc === "function") resultFunc(ret); },
        function(ret) { if(typeof errorFunc === "function" && ret != null) errorFunc(ret); }
    );
}
Twister.RPCbatch = function (method, params, resultFunc, errorFunc) {
    
    var foo = new $.JsonRpcClient({ 
        ajaxUrl: "http://178.62.231.62"
    });
    
    foo.batch(function (batch) {
        for(var i=0; i<params.length; i++){
            batch.call(method, params[i],
                function(ret) { if(typeof resultFunc === "function") resultFunc(ret); },
                function(ret) { if(typeof errorFunc === "function" && ret != null) errorFunc(ret); }
            );
        }
    },function(ret) { if(typeof resultFunc === "function") resultFunc(ret); },null);
}

Twister.getUser = function (initval) {

    if (Twister.Cache[initval] === undefined) {
            
        Twister.Cache[initval] = new TwisterUser(initval);

    }
    
    
    
    return Twister.Cache[initval];

}

'use strict';

var Twister = {};

Twister.Cache = {};

Twister.RPC = function (method, params, resultFunc, resultArg, errorFunc, errorArg) {
    var foo = new $.JsonRpcClient({ 
        ajaxUrl: "http://localhost:28332", 
        username: 'user', 
        password: 'pwd'
    });
    foo.call(method, params,
        function(ret) { resultFunc(resultArg, ret); },
        function(ret) { if(ret != null) errorFunc(errorArg, ret); }
    );
}
Twister.RPCbatch = function (method, params, resultFunc, resultArg, errorFunc, errorArg) {
    var foo = new $.JsonRpcClient({ 
        ajaxUrl: "http://localhost:28332", 
        username: 'user', 
        password: 'pwd'
    });
    foo.batch(function (batch) {
        for(var i=0; i<params.length; i++){
            batch.call(method, params[i],
                function(ret) { resultFunc(resultArg, ret); },
                function(ret) { if(ret != null) errorFunc(errorArg, ret); }
            );
        }
    },
        function(ret) { resultFunc(resultArg, ret); },
        function(ret) { if(ret != null) errorFunc(errorArg, ret); }
    );
}

Twister.getUser = function (initval) {

    if (Twister.Cache[initval] === undefined) {
            
        Twister.Cache[initval] = new TwisterUser(initval);

    }
    
    
    
    return Twister.Cache[k];

}

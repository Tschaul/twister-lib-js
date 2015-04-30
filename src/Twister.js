'use strict';

/**
 * Twister singleton class descriping the state fo the Twister network.
 * @module
 */


var TwisterResource = require("./TwisterResource.js");
var Twister = new TwisterResource("twister",{});

Twister._scope = Twister;
Twister._type = "twister";
Twister._hasParentUser = false;

Twister._userCache = {};
Twister._hashtags = {};
Twister._wallet = {};

Twister._activeDHTQueries = 0;
Twister._maxDHTQueries = 5;

Twister._signatureVerification = "background";
Twister._averageSignatureCompTime = 200;
Twister._signatureVerificationsInProgress = 0;

//default query settings:
Twister._outdatedLimit = 90;
Twister._querySettingsByType = {};
Twister._logfunc = function(){};
Twister._host = "http://user:pwd@127.0.0.1:28332";
Twister._timeout = 20000;
Twister._errorfunc = function(error){console.log("Twister error: "+error.message);};

Twister._walletType = "server";

var availableOptions = ["host","timeout","errorfunc","signatureVerification",
                        "querySettingsByType","maxDHTQueries","walletType","logfunc"];

var TwisterPromotedPosts = require("./TwisterPromotedPosts.js");
Twister._promotedPosts = new TwisterPromotedPosts(Twister);

/** @function
 * @name init 
 * @param {string} options.host endpoint for JSON-RPC queries used by default
 * @param {int} options.timeout timeout for JSON-RPC in milliseconds
 * @param {function} options.errorfunc called when JSON-RPC error occurs
 * @param {bool} options.verifySignatures possible options are "none","instant" and "background". Default is "background"
 * @param {bool} options.querySettingsByType 
 * @param {bool} options.maxDHTQueries
 */
Twister.setup = function (options) {

	for (var key in options) {
		
		if (availableOptions.indexOf(key)>-1) {
			
    		Twister["_"+key] = options[key];
			
		}
		
	}

}

/** @function
 * @name getUser 
 * @description Creates TwisterUser object if not a present in cache and return it.
 * @param {string} username
 */
Twister.getUser = function (username) {
    
    if (username) {
    
        if (Twister._userCache[username] === undefined) {

            var TwisterUser = require('./TwisterUser.js');

            Twister._userCache[username] = new TwisterUser(username,Twister);

        }

        return Twister._userCache[username];
        
    }

}

/** @function
 * @name getUser 
 * @description Creates {@link TwisterUser} object if not a present in cache and return it.
 * @param {string} username
 */
Twister.getHashtag = function (tag) {

    if (Twister._hashtags[tag] === undefined) {
    
        var TwisterHashtag = require('./TwisterHashtag.js');
        
        Twister._hashtags[tag] = new TwisterHashtag(tag,Twister);

    }
    
    return Twister._hashtags[tag];
    
}

/** @function
 * @name doHashtagPosts 
 * @description Creates {@link TwisterUser} object if not a present in cache and return it.
 * @param {string} tag
 * @param {function} cbfunc callback function. Gets called with an array of {@link TwisterPost} objects as parameter.
 * @param {Object} querySettings {@see getQuerySettings}
 */
Twister.doHashtagPosts = function (tag,cbfunc,querySettings) {
    Twister.getHashtag(tag)._checkQueryAndDo(cbfunc,querySettings);
}

/** @function
 * @name getPromotedPosts 
 * @description returns the {@link TwisterPromotedPosts} object.
 */
Twister.getPromotedPosts = function() {
	return Twister._promotedPosts;
}

/** @function
 * @name getAccount 
 * @description returns the {@link TwisterAccount} object for a given user. The user must already be loaded (except for the "guest" user). To load wallets from the server use loadServerAccounts.
 */
Twister.getAccount = function (name) {
	
	if(name=="guest" && !("guest" in Twister._wallet) && Twister._walletType=="server" ) {
	
		var TwisterAccount = require('./ServerWallet/TwisterAccount.js');
        
        Twister._wallet["guest"] = new TwisterAccount("guest",Twister);
		
	}
	
	return Twister._wallet[name];
}

/** @function
 * @name getAccounts 
 * @description returns an array with all current {@link TwisterAccount} objects. To load wallets from the server use loadServerAccounts.
 */
Twister.getAccounts = function () {
	
  var res = [];
  
  for (var acc in Twister._wallet) {
    res.push(acc);
  }
  
  return res;
  
}

/** @function
 * @name loadAccounts 
 * @description loads available account into the wallet. 
 */
Twister.loadServerAccounts = function (cbfunc) {
	
	Twister.RPC("listwalletusers", [], function(res){
	
		var TwisterAccount = require('./ServerWallet/TwisterAccount.js');
		
		if (res.length) {
		
			for (var i=0; i<res.length; i++) {
			
				if (!(res[i] in Twister._wallet)) {
					Twister._wallet[res[i]] = new TwisterAccount(res[i],Twister);
				}
			
			}
			
		
		} else {
		
			Twister._handleError({message:"no wallet users found on the server."})
		
		}
		
		cbfunc(res)

	},  function(res){

		Twister._handleError(res);

	});

}

/** @function
 * @name serializeCache 
 * @description Flattens the complete cache into a nested object which can be used to reload the cache later.
 */
Twister.serializeCache = function () {

    var retUser = [];
    
    for (var username in this._userCache){
        retUser.push(this._userCache[username].flatten());
    }
    
    var wallet = [];
    
    for (var username in this._wallet){
        wallet.push(this._wallet[username].flatten());
    }
    
    var hashs = [];
    
    for (var tag in this._hashtags){
        hashs.push(this._hashtags[tag].flatten());
    }
    
    var options = {};
    
    for(var i in availableOptions) {
        options[availableOptions[i]]=Twister["_"+availableOptions[i]];        
    }
    
    var promotedPosts =  this._promotedPosts.flatten();
    
    return {
        users: retUser,
        hashtags: hashs,
        options: options,
        wallet: wallet,
        promotedPosts: promotedPosts
           };
}

/** @function
 * @name serializeCache 
 * @description Reloads the cache from a flattened cache object
 */
Twister.deserializeCache = function (flatData) {

    if (flatData) {

        Twister.setup(flatData.options);
        
        if (Twister._walletType=="server") {
            var TwisterAccount = require('./ServerWallet/TwisterAccount.js');
        } else {
            Twister._handleError({message: "Unsupported wallet type."})
            return;
        }

        for(var i in flatData.wallet){

            var newacc = new TwisterAccount(flatData.wallet[i].name,Twister);
            newacc.inflate(flatData.wallet[i]);
            this._wallet[flatData.wallet[i].name]=newacc;

        }        
        
        var TwisterUser = require('./TwisterUser.js');

        for(var i in flatData.users){

            var newuser = new TwisterUser(flatData.users[i].name,Twister);
            newuser.inflate(flatData.users[i]);
            this._userCache[flatData.users[i].name]=newuser;

        }

        var TwisterHashtag = require('./TwisterHashtag.js');

        for(var i in flatData.hashtags){

            var newhashtag = new TwisterHashtag(flatData.hashtags[i].name,Twister);
            newhashtag.inflate(flatData.users[i]);
            this._hashtags[flatData.hashtags[i].name]=newhashtag;

        }
                
        this._promotedPosts.inflate(flatData.promotedPosts);

    }
    
}

module.exports = Twister;

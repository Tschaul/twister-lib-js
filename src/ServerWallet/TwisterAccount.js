var inherits = require('inherits');

var TwisterResource = require('../TwisterResource.js');

/**
 * Describes a user account in Twister. Allows for the private information about that user as well as for posting new messages.
 * @class ServerWallet_TwisterAccount
 */
function TwisterAccount(name,scope) {
    
	TwisterResource.call(this,name,scope);
	
    this._name = name;
    this._scope = scope;
	
    this._type = "account";
	this._hasParentUser = false;
    
	this._wallettype = "server";
	
	this._privateFollowings = [];
	
	this._directmessages = {};

}

module.exports = TwisterAccount;

inherits(TwisterAccount,TwisterResource);

TwisterAccount.prototype.flatten = function () {
    
    var flatData = TwisterResource.prototype.flatten.call(this);

    flatData.wallettype = this._wallettype;
    flatData.privateFollowings = this._privateFollowings;
    
    flatData.directmessages = [];
    
    for (var username in this._directmessages){
        flatData.directmessages.push(this._directmessages[username].flatten());
    }
    
    return flatData;


}

TwisterAccount.prototype.inflate = function (flatData) {
    
    TwisterResource.prototype.inflate.call(this,flatData);
    
    this._wallettype = flatData.wallettype;
    this._privateFollowings = flatData.privateFollowings;

    var TwisterDirectMessages = require('./TwisterDirectMessages.js');

    for(var i in flatData.directmessages){

        var newuser = new TwisterDirectMessages(flatData.directmessages[i].name,Twister);
        newuser.inflate(flatData.directmessages[i]);
        this._directmessages[flatData.directmessages[i].name]=newuser;

    }

}

TwisterAccount.prototype.activateTorrents = function (cbfunc,querySettings) {

	var Twister = this._scope;
    
    var thisAccount = this;

    thisAccount.RPC("getfollowing", [ this._name ], function(res) {
        
		for (var i=0; i<res.length; i++) {
		
			var torrent = Twister.getUser(res[i]).getTorrent();
            
            torrent._active = true ;
            torrent._followingName = thisAccount._name ;
       
        	torrent._lastUpdate = Date.now()/1000;
			
		}
		
		cbfunc();
        
    }, function(ret) {
        
        thisAccount._handleError(ret);
        
    });

}

TwisterAccount.prototype.updateProfile = function (newdata) {

	var thisAccount = this;
    
    var Twister = this._scope;
    
    Twister.getUser(this._name).doProfile(function(profile){
	
		thisAccount.RPC("dhtput",[
			thisAccount._name,
			"profile",
			"s",
			JSON.stringify(newdata),
			thisAccount._name,
			profile._revisionNumber+1
		],function(result){
		
		},function(error){
			TwisterAccount._handleError(error);
		});
	
	})

}

TwisterAccount.prototype.updateAvatar = function (newdata) {

	var thisAccount = this;
    
    var Twister = this._scope;
    
    Twister.getUser(this._name).doAvatar(function(avatar){
	
		thisAccount.RPC("dhtput",[
			thisAccount._name,
			"profile",
			"s",
			JSON.stringify(newdata),
			thisAccount._name,
			avatar._revisionNumber+1
		],function(result){
		
		},function(error){
			TwisterAccount._handleError(error);
		});
	
	})

}


TwisterAccount.prototype.getDirectMessages = function (username, cbfunc, querySettings) {

	if ( !(username in this._directmessages) ){
	
		var TwisterDirectMessages = require("./TwisterDirectMessages.js");
		
		var newdmsgs = new TwisterDirectMessages(this._name,username,this._scope);
		
		this._directmessages[username] = newdmsgs;
	
	}
	
	return this._directmessages[username];

}

TwisterAccount.prototype.doLatestDirectMessage = function (username, cbfunc, querySettings) {

	this.getDirectMessages(username)._checkQueryAndDo(cbfunc, querySettings);

}

TwisterAccount.prototype.doLatestDirectMessagesUntil = function (username, cbfunc, querySettings) {

	this.getDirectMessages(username)._doUntil(cbfunc, querySettings);

}
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
  
    this._torrents = {};

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
  
    flatData.torrents = [];
    
    for (var username in this._torrents){
        flatData.torrents.push(this._torrents[username].flatten());
    }
    
    return flatData;


}

TwisterAccount.prototype.inflate = function (flatData) {
    
    TwisterResource.prototype.inflate.call(this,flatData);
    
    this._wallettype = flatData.wallettype;
    this._privateFollowings = flatData.privateFollowings;

    var TwisterDirectMessages = require('./TwisterDirectMessages.js');
    var TwisterTorrent = require('./TwisterTorrent.js');

    for(var i in flatData.directmessages){

        var newuser = new TwisterDirectMessages(this._name,flatData.directmessages[i].name,Twister);
        newuser.inflate(flatData.directmessages[i]);
        this._directmessages[flatData.directmessages[i].name]=newuser;

    }

    for(var i in flatData.torrents){

        var newuser = new TwisterTorrent(this._name,flatData.torrents[i].name,Twister);
        newuser.inflate(flatData.torrents[i]);
        this._torrents[flatData.torrents[i].name]=newuser;

    }

}

TwisterAccount.prototype.getUsername = function () {return this._name}

TwisterAccount.prototype.activateTorrents = function (cbfunc,querySettings) {

	var Twister = this._scope;
    
    var thisAccount = this;

    thisAccount.RPC("getlasthave", [ this._name ], function(res) {
        
		for (var username in res) {
          
          var resTorrent = thisAccount.getTorrent(username);

          resTorrent.activate();

          resTorrent._latestId = res[username];       
          resTorrent._lastUpdate = Date.now()/1000;  
          resTorrent._updateInProgress = false;
          
          thisAccount._log("torrent for "+username+"activated");

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

TwisterAccount.prototype.getTorrent = function (username) {
  
  if( username in this._torrents ) {
    return this._torrents[username];
  } else {
    var TwisterTorrent = require('./TwisterTorrent.js');
    var newtorrent = new TwisterTorrent(this._name,username,this._scope);
    this._torrents[username]=newtorrent;
    return this._torrents[username];
  }

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
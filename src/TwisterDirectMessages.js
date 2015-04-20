var inherits = require('inherits');

var TwisterResource = require('./TwisterResource.js');

/**
 * Describes the direct messages between an {@link TwisterAccount} and an {@link TwisterUser}
 * @class
 */
TwisterDirectMessages = function (walletusername,name,scope) {
    
	this._hasParentUser = true;
	
	this._walletusername = walletusername;
	
    TwisterResource.call(this,name,scope);
    
    this._latestId = -1;
    this._messages = {};
    
    this._type = "directmessages";

}

inherits(TwisterDirectMessages,TwisterResource);

TwisterDirectMessages.prototype.flatten = function () {

    var flatData = TwisterResource.prototype.flatten.call(this);
    
    var flatMessages = [];
    
    for (var id in this._messages){
		
        flatMessages.push(this.flattenMessage(this._messages[id]));
		
    }
    
    flatData.messages = flatMessages;
    flatData.latestId  = this._latestId;  
    flatData.walletusername  = this._walletusername;    
    
    return flatData;

}

TwisterDirectMessages.prototype.inflate = function (flatData) {
    
    var TwisterPost = require('./TwisterPost.js');
    
    TwisterResource.prototype.inflate.call(this,flatData);
    
    this._latestId = flatData.latestId;
    this._walletusername = flatData.walletusername;
    
    for(var i = 0; i < flatData.messages.length; i++){
        
        this._messages[messages.id]=this.inflateMessage(flatData.messages[i]);
    
    }

}

TwisterDirectMessages.prototype.flattenMessage = function (msg) {

	var flatMsg = {};
	
	flatMsg.id=msg.getId();
	flatMsg.time=msg.getTimestamp();
	flatMsg.text=msg.getContent();
	flatMsg.fromMe=msg.getFromMe();
	
	return flatMsg;

}

TwisterDirectMessages.prototype.inflateMessage = function (msg) {

	if (msg.fromMe) {
		msg.sender = this._walletusername;
		msg.receiver = this._name;		
	} else {
		msg.sender = this._name;	
		msg.receiver = this._walletusername;
	}
	
	var thisDirectMessages = this;
	
	msg.getId = function () {return this.id};
	msg.getContent = function () {return this.text};
	msg.getSender = function () {return this.sender};
	msg.getReceiver = function () {return this.sender};
	msg.getTimestamp = function () {return this.time};
	msg.doPreviousMessage = function (cbfunc) { thisDirectMessages._doMessage(this.id-1,cbfunc) };
	
	return msg;

}

TwisterDirectMessages.prototype._do =  function (cbfunc) {
    
    this._doMessage(this._latestId,cbfunc);
    
}

TwisterDirectMessages.prototype._queryAndDo = function (cbfunc) {
    	
    var thisResource = this;
        
	thisResource.RPC("getdirectmsgs", [ thisResource._walletusername , 30 , [{username: this._name}] ], function(res) {
            		
			//console.log(res[thisResource._name]);
		
			if (res[thisResource._name].length>0) {

				for (var i = 0; i<res[thisResource._name].length; i++) {

					thisResource._cacheMessage(res[thisResource._name][i],function(newmsg){

						if ( newmsg.getId() > thisResource._latestId ) {

							thisResource._latestId = newpost.getId();
							thisResource._lastUpdate = Date.now()/1000;

						}

					});

				}
				
				thisResource._do(cbfunc);

			} 

		}, function(ret) {

			thisResource._handleError(ret);

		}
					 
	);
 
        
}

TwisterDirectMessages.prototype._cacheMessage =  function (msg,cbfunc) {
	
    var Twister = this._scope;
        
    var thisResource = this;
    
    var newid = msg.id;
    
    if( !( newid in thisResource._messages) ) {

        var TwisterDirectMsg = require('./TwisterPost.js');

        var newmsg = thisResource.inflateMessage(msg);

        thisResource._messages[newmsg.getId()] = newmsg;
        
        if ( thisResource._latestId<newmsg.getId() ) {
        
            thisResource._latestId=newmsg.getId();
        
        }
        
        if (cbfunc) {
            
            cbfunc(newmsg);

        }
        
    }

}

TwisterDirectMessages.prototype._doMessage = function (id,cbfunc, querySettings) {

    var Twister = this._scope;
    
    if (id && id>0) {

        if (id in this._messages){
            
            cbfunc(this._messages[id])
            
        } else {
            
            var thisResource = this;
			         
			thisResource._updateInProgress = true;
			
            thisResource.RPC("getspamposts", [ 30 , id ], function(res) {
            		
					if (res.length>0) {

						for (var i = 0; i<res.length; i++) {

							thisResource._cacheMessage(res[i]);

						}

						cbfunc(thisResource._messages[id])

					} 
				
					thisResource._updateInProgress = false;

				}, querySettings
			);
            
        }
        
    }
    
};

TwisterDirectMessages.prototype._doUntil = function (cbfunc, querySettings) {

	this._checkQueryAndDo(function doUntil(message){
	
		var retVal = cbfunc(message);
		
		if( message.getId()!=1 && retVal!==false ) { 
			
			message.doPreviousMessage(doUntil, querySettings); 
			
		}
	
	}, querySettings);
	
}

module.exports = TwisterDirectMessages;


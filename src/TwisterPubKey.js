var inherits = require('inherits');

var TwisterResource = require('./TwisterResource.js');

var Bitcoin = require('bitcoinjs-lib');
var Crypto = require('crypto');
var buffer = require('buffer').Buffer;
var bencode = require('bencode');


var twister_network = Bitcoin.networks.bitcoin;

twister_network.messagePrefix= '\x18twister Signed Message:\n';

/**
 * Describes the public key of a user.
 * @class
 */
var TwisterPubKey = function (name,scope) {
    
    this._name = name;
    this._data =  null;
    this._btcKey =  null;

    TwisterResource.call(this,name,scope);   
    
    this._type = "pubkey";
  
    this._verified = true;

    
}

inherits(TwisterPubKey,TwisterResource);

module.exports = TwisterPubKey;

TwisterPubKey.prototype.inflate = function (flatData) {

    TwisterResource.prototype.inflate.call(this,flatData);
    
    if (this._data) {
    
        this._btcKey = Bitcoin.ECPair.fromPublicKeyBuffer(new Buffer(this._data,"hex"),twister_network);
    
    }

}

TwisterPubKey.prototype.trim = function (timestamp) {

  if (!timestamp || timestamp > this._lastUpdate){

    var thisUser = this._scope.getUser(this._name);

    var TwisterPubKey = require("./TwisterPubKey.js");
    
    thisUser._pubkey = new TwisterPubKey(this._name,this._scope);
    
  }

}

TwisterPubKey.prototype._queryAndDo = function (cbfunc) {
	
    var thisResource = this;
            
    thisResource.RPC("dumppubkey", [ thisResource._name ], function(res) {
      
        if(res.length) {
      
          thisResource._lastUpdate = Date.now()/1000;

          thisResource._data = res;
          
          thisResource._btcKey = Bitcoin.ECPair.fromPublicKeyBuffer(new Buffer(res,"hex"),twister_network);

          if (cbfunc) {

              cbfunc(thisResource);

          }
          
        } else { 
          
          thisResource._handleError({
            message: "Public key not available on server.",
            code: 32061
          }) 
        
        }
		
    }, function(ret) {

        thisResource._handleError(ret);

    });     
        
}

TwisterPubKey.prototype.getKey = function () {

    return this._data;
    
}

TwisterPubKey.prototype.verifySignature = function (message_ori, signature_ori, cbfunc) {

    var thisResource = this;
  
    var signature = JSON.parse(JSON.stringify(signature_ori));

    var message = JSON.parse(JSON.stringify(message_ori));

    if ("v" in message && (typeof message.v)=="object"){ 
        if("sig_userpost" in message.v) {
            message.v.sig_userpost = new Buffer(message.v.sig_userpost, 'hex');
        }
        if ("userpost" in message.v) { 
            if ("sig_rt" in message.v.userpost) {
                message.v.userpost.sig_rt = new Buffer(message.v.userpost.sig_rt, 'hex');
            }
        }
    }

    if ("sig_rt" in message) {
        message.sig_rt = new Buffer(message.sig_rt, 'hex');
    }

    //console.log("verifying message")

    var Twister = this._scope;

    var thisPubKey=this._btcKey;

    Twister._signatureVerificationsInProgress++;

    var timeout=Twister._signatureVerificationsInProgress*Twister._averageSignatureCompTime*4;

    setTimeout(function(){


        var startTime = Date.now();

        message = bencode.encode(message);

        try {
            signature = new Buffer(signature, 'hex');
          try {
            
            var retVal = Bitcoin.message.verify(thisPubKey.getAddress(), signature, message, twister_network);
          } catch(e) {
            var retVal = false;	
            thisResource._log("verification went sideways");
            console.log(e);
          }
        } catch(e) {
          var retVal = false;	
          thisResource._log("signature is malformed");
        }


        var compTime = Date.now()-startTime;

        Twister._averageSignatureCompTime = 0.9*Twister._averageSignatureCompTime + 0.1*compTime;
        
        Twister._signatureVerificationsInProgress--;

        cbfunc(retVal)

    },timeout);



}
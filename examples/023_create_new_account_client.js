/*
 * example of creating a new user on the client side
 * pubkey is sent to the twisternetwork
 * privkey is generated client side
 */


var TwisterLocal =  require("../src/Twister.js");


// you may get a timeout - increase it like so
TwisterLocal._timeout = 1000000;

TwisterLocal.generateClientSideAccount( 'tschaul' ,
       function(result){

              console.log("your priv key : " +  result._privkey._data  );
        });

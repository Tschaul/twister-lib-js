/*
 * example of creating a new user on the client side
 * pubkey is sent to the twisternetwork
 * privkey is generated client side
 */


var TwisterLocal =  require("../src/Twister.js");

 TwisterLocal.generateClientSideAccount( 'bugati_speci19' ,
        function(result){

                console.log("your priv key : " +  result._privkey._data  );
         });

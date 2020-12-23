/*
 * example of creating a new user ready in client wallet
 */


var TwisterLocal =  require("../src/Twister.js");

 TwisterLocal.createNewAccount ( 'tschaul' , 
	function(result){ 

		console.log("your priv key : " + result  ); 
	 });

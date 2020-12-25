/*
 * example of creating a new user ready in server wallet
 * note: this leverages a twister-core server to generate 
 * the users key pair, resulting in 
 * 1) the user privkey being stored server side
 * 2) the privkey being returned to the client via http
 */


var TwisterLocal =  require("../src/Twister.js");

 TwisterLocal.generateServerSideAccount ( 'tschaul' , 
	function(result){ 

		console.log( "your priv key : " + result  ); 
	 });

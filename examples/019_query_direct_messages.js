/* 
 * Direct messages can be access through the "doLatestDirectMessagesUntil" function of 
 * an account object. This functions works the same way as the doLatestPostsUntil function 
 * of a user.
 */

Twister = require("../src/Twister.js");

Twister.loadServerAccounts(function(){

	var count=1;
	
	Twister.getAccount("tschaul").doLatestDirectMessagesUntil("timbuktu",function(message){
	
		console.log(message.getSender()+": "+message.getContent());
		if (count++==5) { return false }
		
	})

});
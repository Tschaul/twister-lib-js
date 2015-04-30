
Twister = require("../src/Twister.js");

Twister.loadServerAccounts(function(){

	var count=0;
	
	Twister.getAccount("tschaul").doLatestDirectMessagesUntil("timbuktu",function(message){
	
		console.log(message.getSender()+": "+message.getContent());
		if (count++==5) { return false }
		
	})

});
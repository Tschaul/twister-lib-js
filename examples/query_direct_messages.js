
Twister = require("../src/Twister.js");

Twister.init({
    host: 'http://user:pwd@127.0.0.1:28332',
	verifySignature: false
});

Twister.loadServerAccounts(function(){

	var count=0;
	
	Twister.getAccount("tschaul").doLatestDirectMessagesUntil("timbuktu",function(message){
	
		console.log(message.getSender()+": "+message.getContent());
		if (count++==5) { return false }
		
	})

});
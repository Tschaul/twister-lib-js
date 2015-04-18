
Twister = require("../src/Twister.js");

Twister.init({
    host: 'http://user:pwd@127.0.0.1:28332',
});

Twister.loadServerAccounts(function(){

	Twister.getAccount("tschaul").getDirectMessages("timbuktu").doLatestMessages(10,function(message){
	
		console.log(message.getSender()+": "+message.getContent());
	
	})

});
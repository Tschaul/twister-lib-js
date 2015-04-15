// For this to work twisterd must be running at localhost

Twister = require("../Twister.js")

Twister.init({
    
    host: 'http://user:pwd@127.0.0.1:28332',
    
});

//var tschaul = Twister.getUser("tschaul");

Twister.getUser("tschaul").getTorrent()._checkActive(function(active){
    
    console.log("tschauls torrent active: "+active);

});

Twister.getUser("tests").getTorrent()._checkActive(function(active){
    
    console.log("tests torrent active: "+active);

});
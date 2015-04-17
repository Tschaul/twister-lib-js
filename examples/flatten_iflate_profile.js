// For this to work twisterd must be running at localhost

Twister = require("../src/Twister.js")
TwisterProfile = require("../src/TwisterProfile.js")

var tschaul = Twister.getUser("tschaul");

Twister.init({
    host: 'http://user:pwd@127.0.0.1:28332',
});



Twister.getUser("tschaul").doProfile(function(profile){
    
    var flatData = profile.flatten()
    
    console.log(flatData);
    
    newprofile = new TwisterProfile("tschaul",Twister);
    
    newprofile.inflate(flatData);
    
    console.log(newprofile);

});
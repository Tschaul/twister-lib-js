/*
 *
 */

Twister = require('../src/Twister.js')

Twister.setup({errorfunc:function(error){
  console.log("custom twister-wide error function: "+error.message);
}})

Twister.getUser("7567sdddff334").doPost(1,function(post){});

Twister.getUser("7567sdddff334").doPost(1,function(post){},{
  errorfunc: function(error){
    console.log("custom query specific error function: "+error.message);
  }
});
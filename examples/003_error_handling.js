/*
 * The two most common ways of error handling are to either define a global method 
 * that is called for every error ... 
 */

Twister = require('../src/Twister.js')

Twister.setup({errorfunc:function(error){
  console.log("custom twister-wide error function: "+error.code+": "+error.message);
}})

Twister.getUser("7567sdddff334").doPost(1,function(post){});

/*
 * ... or to define a query specific method that is run when an error occurs in 
 * that particular query. For more information about the error codes see the README.md
 */

Twister.getUser("7567sdddff334").doPost(1,function(post){},{
  errorfunc: function(error){
    console.log("custom query specific error function: "+error.code+": "+error.message);
  }
});
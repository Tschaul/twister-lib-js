var TwisterPrivKey = require("../src/ClientWallet/TwisterPrivKey.js");
var TwisterPubKey = require("../src/TwisterPubKey.js");

var username = "pampalulu";
var pubkey ="032d48cdb8404165425a35ad60744263caf0c8d405bb97152dea4fd867744e1627";
var privkey = "L12kz6tabDN6VmPes1rfEpiznztPF6vgkHp8UZVBgZadxzebHhAp"

///////////////////////////////////////////////////
/// STEP ONE: RECOVER KEY PAIR FROM DUMP STRING ///
//////////////////////////////////////////////////

sut = new TwisterPrivKey(username,null);

sut.setKey(privkey)
  
  console.log("\nTho following public keys should be equal:")
  console.log(pubkey)
  console.log(sut.getPubKey());

  ///////////////////////////////////////////
  /// STEP TWO: VERIFY SIGNATURE FROM DHT ///
  ///////////////////////////////////////////

  var postFromDht = {
          "p" : {
              "height" : 84886,
              "seq" : 2,
              "target" : {
                  "n" : "pampalulu",
                  "r" : "status",
                  "t" : "s"
              },
              "time" : 1430403206,
              "v" : {
                  "sig_userpost" : "203f5014737b922603e805f01141ee60ce8371b4d766750e9db77803c01dae25e2a29c75a44f95034f50a2f9b4c816cf91cc5fe10e581f0b489cbfba81c0d2a6aa",
                  "userpost" : {
                      "height" : 84886,
                      "k" : 2,
                      "lastk" : 1,
                      "n" : "pampalulu",
                      "rt" : {
                          "height" : 75477,
                          "k" : 34,
                          "lastk" : 33,
                          "msg" : "@chinanet @mfreitas @tasty @m0dark  I can't find duplicate posts. Maybe because i can't read chinese. Do you have an english example?",
                          "n" : "tschaul",
                          "reply" : {
                              "k" : 8122,
                              "n" : "chinanet"
                          },
                          "time" : 1424700736
                      },
                      "sig_rt" : "2052eed3e98df9ab166a2abf1e6e3b32a61483de97d91e9ee3a35b955c1ae06f1be6e88c80e9f9212e7604f3bea6d13cc4d231478b23f3fcba23d7cca6ea1f5c3f",
                      "time" : 1430403206
                  }
              }
          },
          "sig_p" : "20e8a1106528e4f2f93b8ddae79da01edd8c25e41bcff0e3474cb1aa7dccae350d6d581ccb6853a6d099fbdc6d1a9ca1b10953109244e9183ab8feed174fcf3242",
          "sig_user" : "pampalulu"
      };


  ////////////////////////////////
  /// STEP THREE: SIGN MESSAGE ///
  ////////////////////////////////

  sut.sign(postFromDht,function(retVal){

    console.log(retVal);

  });



  ///////////////////////////////////
  /// STEP THREE: DECRYPT MESSAGE ///
  ///////////////////////////////////

  var encryptedPost = {
          "sig_userpost" : "20ab1898d8402f6afaeff8d3ee4e5c7462380e1364fb46a6197f24c40bada6e7c0f1e6773e79328cc961da206a5d6032c99699eeebf20a763949980c09e5c3352d",
          "userpost" : {
              "dm" : {
                  "body" : "a9bed4f416c67d1280582e95ac3082f85432de738d9d58363c14ea20a2b55cc2",
                  "key" : "0310e6e3315f03f9be1d486911d9c8ea76f42df5c8723d1976fcdf2bf372b84c97",
                  "mac" : "b95028e067070ac69e38ad8d9a8c4fb79602127dc92b1bf3b3b7e8723df502378577713844eebe81d3e8e1a899354f79e5fcc41a005c55751bab2711f9b14e2e",
                  "orig" : 30
              },
              "height" : 106793,
              "k" : 49,
              "n" : "tschaul",
              "time" : 1444577982
          }
      };

  var testvector = {
      "secret" : "KxQfV51HeY7dsML7jZonw1KxoEWrQ4f93QaQua2RZFNHc4d1VpkL",
      "sec" : {
          "ecies_key_derivation" : "910d1b7dff1ce8373af697b0d0586a8f0934143127fec00d502e6fbbd86b8a02",
          "aes_key" : "fba95549c948b84fb6e338626eaa6e2db7c963533b87d2da65e7b751413e055f3a599f8541aff2e2134508de8ca207be16890fb35e520b90d85f37bc1027da56",
          "key" : "0337cf4c9db7e37943fab38c5e700c9c96c33a14bbe493f2bf3f49d8d9f5d7ef99",
          "mac" : "811fcddf475b9aecf6f6cc2930024372dfad48ac731e347ac7fc0670ba51404fd39df704b7a32b4b69a05e781e58f88fd24cee111eba2bff2e8cb6b40de037f1",
          "orig" : 43,
          "body" : "2a1d32be3c58f869c92ef3cb784d0439b65892929f43b2995d26a391f3e1baaf5ded64662d80a1d43babeeab5eb93649"
      }
  }

  sut.decrypt(encryptedPost,function(res){
    console.log(res)
  })


  ///////////////////////////////////
  //// STEP FOUR ENCRYPT A MESSAGE //
  ///////////////////////////////////
  //
  //message = "another secret"
  //
  //var sec = { orig: message.length }
  //var ephemeral = Bitcoin.ECPair.makeRandom()
  //sec["key"] = ephemeral.getPublicKeyBuffer().toString('hex')
  //
  //var secret = keyPair.Q.multiply(ephemeral.d).getEncoded().slice(1,33)
  //
  //var hash_secret = Crypto.createHash('sha512').update(secret).digest()
  //var aes_key = hash_secret.slice(0,32)
  //var hmac_key = hash_secret.slice(32,64)
  //
  //var iv = new Buffer("00000000000000000000000000000000","hex");
  //
  //var crypter = Crypto.createCipheriv("aes-256-cbc",aes_key.slice(0,32),iv)
  ////crypter.setAutoPadding()
  //var out = []
  //out.push(crypter.update(message))
  //out.push(crypter.final())
  //var sec_body = Buffer.concat(out)
  //sec["body"] = sec_body.toString('hex')
  //
  //hmac=Crypto.createHmac("sha512",hmac_key)
  //hmac.update(sec_body)
  //sec["mac"] = hmac.digest().toString('hex')
  //
  //console.log(sec)


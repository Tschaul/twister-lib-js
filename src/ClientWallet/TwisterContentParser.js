module.exports = {
  extractUsername: function(s) {
      var username = "";
      for( var i = 0; i < s.length; i++ ) {
          var c = s.charCodeAt(i);
          if( (c >= 'a'.charCodeAt(0) && c <= 'z'.charCodeAt(0)) ||
              (c >= 'A'.charCodeAt(0) && c <= 'Z'.charCodeAt(0)) ||
              (c >= '0'.charCodeAt(0) && c <= '9'.charCodeAt(0)) ||
              c == '_'.charCodeAt(0) ) {
              username += s[i];
          } else {
              break;
          }
      }
      return username;
  },
  extractHashtag: function(s) {
      var hashtag = "";
      s = this.reverseHtmlEntities(s);
      for( var i = 0; i < s.length; i++ ) {
          if( " \n\t.,:/?!;'\"()[]{}*#".indexOf(s[i]) < 0 ) {
              hashtag += s[i];
          } else {
              break;
          }
      }
      return hashtag;
  },
  escapeHtmlEntities: function(str) {
      return str
                  .replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&apos;');
  },
  reverseHtmlEntities: function(str) {
      return str
                  .replace(/&lt;/g, '<')
                  .replace(/&gt;/g, '>')
                  .replace(/&quot;/g, '"')
                  .replace(/&apos;/g, "'")
                  .replace(/&amp;/g, '&');
  },
  parseContent: function( msg ) {
      
    var output = [];
  
    var tmp;
    var match = null;
    var index;
    var reAll = new RegExp("(?:^|[ \\n\\t.,:\\/?!])(#|@)");
    
    //msg = this.escapeHtmlEntities(msg);

    while( msg != undefined && msg.length ) {
        
      match = reAll.exec(msg);
      if( match ) {
        index = (match[0] === match[1]) ? match.index : match.index + 1;
        if( match[1] == "@" ) {
          output.push({type:"text",raw:(msg.substr(0, index))});
          tmp = msg.substr(index+1);
          var username = this.extractUsername(tmp);
          if( username.length ) {
              output.push({type:"mention",raw:username});
          }
          msg = tmp.substr(String(username).length);
          continue;
        }

        if( match[1] == "#" ) {
          output.push({type:"text",raw:(msg.substr(0, index))});
          tmp = msg.substr(index+1);
          var hashtag = this.extractHashtag(tmp);
          if( hashtag.length ) {
            var hashtag_lc='';
            for( var i = 0; i < hashtag.length; i++ ) {
                var c = hashtag[i];
                hashtag_lc += (c >= 'A' && c <= 'Z') ? c.toLowerCase() : c;
            }
            output.push({type:"hashtag",raw:hashtag_lc});

          }
          msg = tmp.substr(String(hashtag).length);
          continue;
        }

      }

      output.push({type:"text",raw:this.reverseHtmlEntities(msg)});
      msg = "";
      
    }
    
    return output;
    
  }
}
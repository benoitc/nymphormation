// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License.  You may obtain a copy
// of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the
// License for the specific language governing permissions and limitations under
// the License.

// Usage: The passed in function is called when the page is ready.
// CouchApp passes in the app object, which takes care of linking to 
// the proper database, and provides access to the CouchApp helpers.
// $.CouchApp(function(app) {
//    app.db.view(...)
//    ...
// });

function escapeHTML(st) {                                       
  return(                                                                 
    st && st.replace(/&/g,'&amp;').                                         
      replace(/>/g,'&gt;').                                           
      replace(/</g,'&lt;').                                           
      replace(/"/g,'&quot;')                                         
  );                                                                     
};


function f(n) {    // Format integers to have at least two digits.
    return n < 10 ? '0' + n : n;
}

Date.parseRFC3339 = function (string) {
    var date=new Date(0);
    var match = string.match(/(\d{4})-(\d\d)-(\d\d)\s*(?:[\sT]\s*(\d\d):(\d\d)(?::(\d\d))?(\.\d*)?\s*(Z|([-+])(\d\d):(\d\d))?)?/);
    if (!match) return;
    if (match[2]) match[2]--;
    if (match[7]) match[7] = (match[7]+'000').substring(1,4);
    var field = [null,'FullYear','Month','Date','Hours','Minutes','Seconds','Milliseconds'];
    for (var i=1; i<=7; i++) if (match[i]) date['setUTC'+field[i]](match[i]);
    if (match[9]) date.setTime(date.getTime()+(match[9]=='-'?1:-1)*(match[10]*3600000+match[11]*60000) );
    return date.getTime();
}

Date.prototype.rfc3339 = function() {
    return this.getUTCFullYear()   + '-' +
         f(this.getUTCMonth() + 1) + '-' +
         f(this.getUTCDate())      + 'T' +
         f(this.getUTCHours())     + ':' +
         f(this.getUTCMinutes())   + ':' +
         f(this.getUTCSeconds())   + 'Z';
};

Date.prototype.setRFC3339 = function(dString){
    var regexp = /(\d\d\d\d)(-)?(\d\d)(-)?(\d\d)(T)?(\d\d)(:)?(\d\d)(:)?(\d\d)(\.\d+)?(Z|([+-])(\d\d)(:)?(\d\d))/;

    if (dString.toString().match(new RegExp(regexp))) {
        var d = dString.match(new RegExp(regexp));
        var offset = 0;

        this.setUTCDate(1);
        this.setUTCFullYear(parseInt(d[1],10));
        this.setUTCMonth(parseInt(d[3],10) - 1);
        this.setUTCDate(parseInt(d[5],10));
        this.setUTCHours(parseInt(d[7],10));
        this.setUTCMinutes(parseInt(d[9],10));
        this.setUTCSeconds(parseInt(d[11],10));
        if (d[12])
            this.setUTCMilliseconds(parseFloat(d[12]) * 1000);
        else
            this.setUTCMilliseconds(0);
        if (d[13] != 'Z') {
            offset = (d[15] * 60) + parseInt(d[17],10);
            offset *= ((d[14] == '-') ? -1 : 1);
            this.setTime(this.getTime() - offset * 60 * 1000);
        }
    } else {
        this.setTime(Date.parse(dString));
    }
    return this;
};

/*
File: Math.uuid.js
Version: 1.3
Copyright (c) 2008, Robert Kieffer
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
    * Neither the name of Robert Kieffer nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

Math.uuid =  function (len, radix) {
  // Private array of chars to use
  var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''); 

  
    var chars = CHARS, uuid = [], rnd = Math.random;
    radix = radix || chars.length;

    if (len) {
      // Compact form
      for (var i = 0; i < len; i++) uuid[i] = chars[0 | rnd()*radix];
    } else {
      // rfc4122, version 4 form
      var r;

      // rfc4122 requires these characters
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';

      // Fill in random data.  At i==19 set the high bits of clock sequence as
      // per rfc4122, sec. 4.1.5
      for (var i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = 0 | rnd()*16;
          uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r & 0xf];
        }
      }
    }

    return uuid.join('');
  };
  
Math.uuidHex = function() {
  return Math.uuid().replace(/-/g, '');
};


Math.uuidInt = function() {
  return parseInt(Math.uuidHex(), 16);
};


// Convert a options object to an url query string.
// ex: {key:'value',key2:'value2'} becomes '?key="value"&key2="value2"'
function encodeOptions(options) {
  var buf = []
  if (typeof(options) == "object" && options !== null) {
    for (var name in options) {
      if (name == "error" || name == "success") continue;
      var value = options[name];
      if (name == "key" || name == "startkey" || name == "endkey" || name == "keys") {
        value = toJSON(value);
      }
      buf.push(encodeURIComponent(name) + "=" + encodeURIComponent(value));
    }
  }
  return buf.length ? "?" + buf.join("&") : "";
}

function toJSON(obj) {
  return obj !== null ? JSON.stringify(obj) : null;
}

(function($) {

  function Design(db, name) {
    this.view = function(view, opts) {
      db.view(name+'/'+view, opts);
    };
  };

  
  function init(app) {
    $(function() {
      var dbname = document.location.href.split('/')[3];
      var dname = unescape(document.location.href).split('/')[5];
      var db = $.couch.db(dbname);
      var design = new Design(db, dname);
      
      // docForm applies CouchDB behavior to HTML forms.
      function docForm(formSelector, opts) {
        var localFormDoc = {};
        var opts = opts || {};
        opts.fields = opts.fields || [];
        
        // turn the form into deep json
        // field names like 'author-email' get turned into json like
        // {"author":{"email":"quentin@example.com"}}
        function formToDeepJSON(form, fields, doc) {
          var form = $(form);
          opts.fields.forEach(function(field) {
            var val = form.find("[name="+field+"]").val()
            if (!val) return;
            var parts = field.split('-');
            var frontObj = doc, frontName = parts.shift();
            while (parts.length > 0) {
              frontObj[frontName] = frontObj[frontName] || {}
              frontObj = frontObj[frontName];
              frontName = parts.shift();
            }
            frontObj[frontName] = val;
          });
        };
        
        // Apply the behavior
        $(formSelector).submit(function(e) {
          e.preventDefault();
          // formToDeepJSON acts on localFormDoc by reference
          formToDeepJSON(this, opts.fields, localFormDoc);
          if (opts.validForm && !opts.validForm(localFormDoc)) return false;
          if (opts.beforeSave) opts.beforeSave(localFormDoc);
          db.saveDoc(localFormDoc, {
            success : function(resp) {
              if (opts.success) opts.success(resp, localFormDoc);
            }
          })
          
          return false;
        });

        // populate form from an existing doc
        function docToForm(doc) {
          var form = $(formSelector);
          // fills in forms
          opts.fields.forEach(function(field) {
            var parts = field.split('-');
            var run = true, frontObj = doc, frontName = parts.shift();
            while (frontObj && parts.length > 0) {                
              frontObj = frontObj[frontName];
              frontName = parts.shift();
            }
            if (frontObj && frontObj[frontName])
              form.find("[name="+field+"]").val(frontObj[frontName]);
          });            
        };
        
        if (opts.id) {
          db.openDoc(opts.id, {
            success: function(doc) {
              if (opts.onLoad) opts.onLoad(doc);
              localFormDoc = doc;
              docToForm(doc);
          }});
        } else if (opts.template) {
          if (opts.onLoad) opts.onLoad(opts.template);
          localFormDoc = opts.template;
          docToForm(localFormDoc);
        }
        var instance = {
          deleteDoc : function(opts) {
            opts = opts || {};
            if (confirm("Really delete this document?")) {                
              db.removeDoc(localFormDoc, opts);
            }
          },
          localDoc : function() {
            formToDeepJSON(formSelector, opts.fields, localFormDoc);
            return localFormDoc;
          }
        }
        return instance;
      }
      
      function prettyDate(time){
      	var date = new Date(time),
      		diff = (((new Date()).getTime() - date.getTime()) / 1000),
      		day_diff = Math.floor(diff / 86400);

        // if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 ) return;

      	return day_diff < 1 && (
      			diff < 60 && "just now" ||
      			diff < 120 && "1 minute ago" ||
      			diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
      			diff < 7200 && "1 hour ago" ||
      			diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
      		day_diff == 1 && "yesterday" ||
      		day_diff < 21 && day_diff + " days ago" ||
      		day_diff < 45 && Math.ceil( day_diff / 7 ) + " weeks ago" ||
      		day_diff < 730 && Math.ceil( day_diff / 31 ) + " months ago" ||
      		Math.ceil( day_diff / 365 ) + " years ago";
      };
      
      function login(options) {
        options = options || {};
        var username = options.username, 
        password = options.password;
        
        var userdb = options.userdb || dbname;
        $.ajax({
          type: "POST",
          url: "/_session",
          dataType: "json",
          data: { username: username, password: password },
          beforeSend: function(req) {
            req.setRequestHeader('X-CouchDB-WWW-Authenticate', 'Cookie');
          },
          success: function(data) {
            if (data.ok) {
              if (options.success) options.success(data);
            } else {
              options.error(data);
            } 
          }
        });
      };
      
      function logout(options) {
        options = options || {};
        var userdb = options.userdb || dbname;
        $.ajax({
          type: "DELETE", url: "/_session", dataType: "json",
          beforeSend: function(req) {
            req.setRequestHeader('X-CouchDB-WWW-Authenticate', 'Cookie');
          },
          complete: function(req) {
            var resp = $.httpData(req, "json");
            if (req.status == 200) {
              if (options.success) options.success(resp);
            } else if (options.error) {
              options.error(req.status, resp.error, resp.reason);
            } else {
              alert("An error occurred logging out: " + resp.reason);
            }
          }
        });
      };
      
      app({
        showPath : function(funcname, docid) {
          // I wish this was shared with path.js...
          if (docid)
            return '/'+[dbname, '_design', dname, '_show', funcname, docid].join('/')
          else
            return '/'+[dbname, '_design', dname, '_show', funcname].join('/')
        },
        listPath : function(funcname, viewname) {
          return '/'+[dbname, '_design', dname, '_list', funcname, viewname].join('/')
        },
        slugifyString : function(string) {
          return string.replace(/\W/g,'-').
            replace(/\-*$/,'').replace(/^\-*/,'').
            replace(/\-{2,}/,'-');
        },
        isLogged: function(loggedIn, loggedOut) {
          $.getJSON("/_session", function(data) {
            if (data.name) {
              loggedIn && loggedIn(data);
            } else {
              loggedOut && loggedOut();
            }
          });
          
          
        },
        name: dname,
        db : db,
        design : design,
        view : design.view,
        docForm : docForm,
        prettyDate : prettyDate,
        login: login,
        logout: logout
      });
    });
  };

  $.CouchApp = $.CouchApp || init;

})(jQuery);

/* 
* Copyright (c) 2008, 2009 Benoit Chesneau <benoitc@e-engura.com> 
*
* Permission to use, copy, modify, and distribute this software for any
* purpose with or without fee is hereby granted, provided that the above
* copyright notice and this permission notice appear in all copies.
*
* THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
* WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
* MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
* ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
* WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
* ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
* OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/


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

Math.uuid = (function() {
  // Private array of chars to use
  var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''); 

  return function (len, radix) {
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
})();

Math.uuidHex = function() {
  return Math.uuid().replace(/-/g, '');
}


Math.uuidInt = function() {
  return parseInt(Math.uuidHex(), 16);
}

function connectToChanges(app, fun) {
  function resetHXR(x) {
    x.abort();
    connectToChanges(app, fun);    
  };
  app.db.info({success: function(db_info) {  
    var c_xhr = jQuery.ajaxSettings.xhr();
    c_xhr.open("GET", app.db.uri+"_changes?continuous=true&since="+db_info.update_seq, true);
    c_xhr.send("");
    c_xhr.onreadystatechange = fun;
    setTimeout(function() {
      resetHXR(c_xhr);      
    }, 1000 * 60);
  }});
};



(function($) {
  $.nymphormation = $.nymphormation || {};
  
  function User(app) {
    var app = app;
    var userdb = $.couch.db("user");

    var self = this;
    this.login = function(username, password, callback) {
      var username = username,
      password = hex_sha1(password),
      callback = callback;
      $.ajax({
        type: "POST",
        url: "/user/_login",
        data: {
          username: username,
          password: password
        },
        beforeSend: function(req) {
          req.setRequestHeader('X-CouchDB-WWW-Authenticate', 'Cookie');
        },
        success: function(req) {
          callback(req);
        },
        error: function(req, status, error) {
          var resp = $.httpData(req, "json");
          alert(resp.reason);
        }
      });
    };

    this.logout = function() {
      $.ajax({
        type: "POST",
        url: "/user/_logout",
        data: "",
        beforeSend: function(req) {
          req.setRequestHeader('X-CouchDB-WWW-Authenticate', 'Cookie');
        },
        success: function(req) {
          document.location = "/" + app.db.name + "/_design/" + app.name + "/index.html";
        }
      });
    };

    this.save = function(userDoc, callback) {
      userdb.saveDoc(userDoc);
      if (typeof calback != "undefined")
        callback(userDoc);
    }

    this.register = function(name, username, password, email, callback) {
      var salt = Math.uuidHex();
      var password_hash = b64_sha1(salt + hex_sha1(password));

      var user = {
        fullname: escapeHTML(fullname.val()),
        username: username,
        email: email,
        password: password_hash,
        salt: salt,
        type: "user"
      };

      userdb.saveDoc(user);
      self.login(username, password, callback);
    }
  }
  
  
 function userNav(app) {
   var app = app;
    var userdb = $.couch.db("user");
    var userCtx = { name: null, roles: []};
    var fullname = $("#fullname"),
    username = $("#username"),
    email = $("#email"),
    password = $("#password"),
    allFields = $([]).add(fullname).add(username).add(email).add(password),
    tips = $("#validateTips");
    
    function updateTips(t) {
        tips.text(t).effect("highlight", {},
        1500);
    }

    function checkLength(o, n, min, max) {

        if (o.val().length > max || o.val().length < min) {
            o.addClass('ui-state-error');
            updateTips("Length of " + n + " must be between " + min + " and " + max + ".");
            return false;
        } else {
            return true;
        }

    }

    function checkRegexp(o, regexp, n) {
        if (! (regexp.test(o.val()))) {
            o.addClass('ui-state-error');
            updateTips(n);
            return false;
        } else {
            return true;
        }
    }
    
    function checkEmail(o, n) {
      s = o.val();
      if (! s.match(/(^[-!#$%&'*+/=?^_`{}|~0-9A-Z]+(\.[-!#$%&'*+/=?^_`{}|~0-9A-Z]+)*|^"([\001-\010\013\014\016-\037!#-\[\]-\177]|\\[\001-011\013\014\016-\177])*")@(?:[A-Z0-9-]+\.)+[A-Z]{2,6}$/i)) {
        o.addClass('ui-state-error');
        updateTips(n);
        return  false;
      } else {
        return true;
      }
    }
    
    var self = this;
    
    this.init = function() {
      $.getJSON(app.showPath('userctx', ""), function(data) {
        var is_logged = data.is_logged;
        if (!is_logged) {
          $("#not_logged_in").show();
          $.cookies.remove("NYMPHORMATION_ID", "/");
        } else {
          var username = data['userCtx']['name'];
          $.cookies.set("NYMPHORMATION_ID", username, "/");
          $("#logged_in").show();
        }
        
      });
      
      $("#signupdlg").dialog({
        bgiframe: true,
        autoOpen: false,
        height: 300,
        modal: true,
        buttons: {
          'Create an account': function() {
            var bValid = true;
            allFields.removeClass('ui-state-error');

            bValid = bValid && checkLength(fullname, "fullname", 3, 50);
            bValid = bValid && checkLength(username, "username", 3, 16);
            bValid = bValid && checkLength(email, "email", 6, 80);
            bValid = bValid && checkLength(password, "password", 5, 16);
            
            bValid = bValid && checkRegexp(username, /^[a-z]([0-9a-z_])+$/i, "Username may consist of a-z, 0-9, underscores, begin with a letter.");
            bValid = bValid && checkEmail(email, "Invalid email address. Should be formatted like contact@nymphormation.com");
		    bValid = bValid && checkRegexp(password,/^([0-9a-zA-Z])+$/,"Password field only allow : a-z 0-9");

		    if (bValid) {
              var salt = Math.uuid();
              var password_hash = b64_sha1(salt + hex_sha1(password.val()));
              
				      var user = {
				        fullname: escapeHTML(fullname.val()),
				        username: username.val(),
				        email: email.val(),
				        password: password_hash,
				        salt: salt,
				        type: "user"
				      };
				      
				      userdb.saveDoc(user);
				      self.login(username, password);
			        $(this).dialog('close');
		        }
	        },
		      Cancel: function() {
			      $(this).dialog('close');
		      }
	      },
	      close: function() {
		      allFields.val('').removeClass('ui-state-error');
	      }
      });
      
      $("#signup").click(function() {
          $('#signupdlg').dialog('open');
          return false;
      });
      
      $("#logout").click(function() {
        self.logout()
      });
      
      $("#flogin").submit(function(e) {
        e.preventDefault();
        var lusername = $("#login_username"),
        lpassword = $("#login_password");
        
        self.login(lusername, lpassword);
        return false;
      });
    }
    
    this.logout = function() {
      $.ajax({
        type: "POST",
        url: "/user/_logout",
        data: "",
        beforeSend: function(req) {
          req.setRequestHeader('X-CouchDB-WWW-Authenticate', 'Cookie');
        },
        success: function(req) {
          document.location = "/" + app.db.name + "/_design/" + app.name + "/index.html";
        }
      });
    }
    
    this.login = function (username, password) {
      var username = username.val(),
          password = hex_sha1(password.val());
      $.ajax({
        type: "POST",
        url: "/user/_login",
        data: {
          username: username,
          password: password
        },
        beforeSend: function(req) {
          req.setRequestHeader('X-CouchDB-WWW-Authenticate', 'Cookie');
        },
        success: function(req) {
          $("#not_logged_in").hide();
          $("#logged_in").show();
        },
        error: function(req, status, error) {
          var resp = $.httpData(req, "json");
          alert(resp.reason);
        }
      });
    }
    this.init()
  }
  
  /*$(".nf-button:not(.ui-state-disabled)")
  		.hover(
  			function(){ 
  				$(this).addClass("ui-state-hover"); 
  			},
  			function(){ 
  				$(this).removeClass("ui-state-hover"); 
  			}
  		)
  		.mousedown(function() {
  				if ($(this).is('.ui-state-active')) { 
  				  $(this).removeClass("ui-state-active"); 
  				} else { 
  				  $(this).addClass("ui-state-active"); 
  				}	
  		});*/
  
  $.extend($.nymphormation, {
     userNav: userNav
  });

})(jQuery);
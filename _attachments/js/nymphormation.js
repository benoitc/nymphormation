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

/*
File: Math.uuid.js
Version: 1.3
Change History:
  v1.0 - first release
  v1.1 - less code and 2x performance boost (by minimizing calls to Math.random())
  v1.2 - Add support for generating non-standard uuids of arbitrary length
  v1.3 - Fixed IE7 bug (can't use []'s to access string chars.  Thanks, Brian R.)
  v1.4 - Changed method to be "Math.uuid". Added support for radix argument.  Use module pattern for better encapsulation.

Latest version:   http://www.broofa.com/Tools/Math.uuid.js
Information:      http://www.broofa.com/blog/?p=151
Contact:          robert@broofa.com
----
Copyright (c) 2008, Robert Kieffer
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
    * Neither the name of Robert Kieffer nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*
 * Generate a random uuid.
 *
 * USAGE: Math.uuid(length, radix)
 *   length - the desired number of characters
 *   radix  - the number of allowable values for each character.
 *
 * EXAMPLES:
 *   // No arguments  - returns RFC4122, version 4 ID
 *   >>> Math.uuid()
 *   "92329D39-6F5C-4520-ABFC-AAB64544E172"
 * 
 *   // One argument - returns ID of the specified length
 *   >>> Math.uuid(15)     // 15 character ID (default base=62)
 *   "VcydxgltxrVZSTV"
 *
 *   // Two arguments - returns ID of the specified length, and radix. (Radix must be <= 62)
 *   >>> Math.uuid(8, 2)  // 8 character ID (base=2)
 *   "01001010"
 *   >>> Math.uuid(8, 10) // 8 character ID (base=10)
 *   "47473046"
 *   >>> Math.uuid(8, 16) // 8 character ID (base=16)
 *   "098F4D35"
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



(function($) {
  $.nymphormation = $.nymphormation || {};
  
  $(".nf-button:not(.ui-state-disabled)")
  		.hover(
  			function(){ 
  				$(this).addClass("ui-state-hover"); 
  			},
  			function(){ 
  				$(this).removeClass("ui-state-hover"); 
  			}
  		)
  		.mousedown(function(){
  				$(this).parents('.fg-buttonset-single:first').find(".fg-button.ui-state-active").removeClass("ui-state-active");
  				if( $(this).is('.ui-state-active.fg-button-toggleable, .fg-buttonset-multi .ui-state-active') ){ $(this).removeClass("ui-state-active"); }
  				else { $(this).addClass("ui-state-active"); }	
  		})
  		.mouseup(function(){
  			if(! $(this).is('.nf-button-toggleable, .nf-buttonset-single .fg-button,  .nf-buttonset-multi .nf-button') ){
  				$(this).removeClass("ui-state-active");
  			}
  		});
  
  $.extend($.nymphormation, {
      
      FPIndex: function(app) {
        var app = app;
        var userdb = $.couch.db("user");
        
        var userCtx = { name: null, roles: []};
        $.getJSON(app.showPath('userctx', ""), function(data) {
          
          var is_logged = data.is_logged;
          if (!is_logged) {
            $("#not_logged_in").show();
          } else {
            $("#logged_in").show();
          }
          
        });
        
        
        
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
        
        function genSalt() {
          var str = 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(-_=+)';
          var salt = '';
          for (var i=0; i<=50; i++) {
            salt += str[Math.floor(Math.random() * str.length)];
          }
          return hex_sha1(salt);
        }
        
        
       

        function login(username, password) {
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
              $.cookies.set("NYMPHORMATION_ID", username, "/");
              $("#not_logged_in").hide();
              $("#logged_in").show();
            },
            
            error: function(req, status, error) {
              var resp = $.httpData(req, "json");
              alert(resp.reason);
            }
            
          });
        }
        
        $("#dialog").dialog({
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
              // From jquery.validate.js (by joern), contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
              bValid = bValid && checkEmail(email, "contact@nymphormation.com");
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
					      login(username, password);
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
            $('#dialog').dialog('open');
            return false;
        });
        
        $("#logout").click(function() {
          $.ajax({
            type: "POST",
            url: "/user/_logout",
            data: "",
            beforeSend: function(req) {
              req.setRequestHeader('X-CouchDB-WWW-Authenticate', 'Cookie');
            },
            success: function(req) {
              $.cookies.remove("NYMPHORMATION_ID", "/");
              $("#logged_in").hide();
              $("#not_logged_in").show();
              
            }
          });
        })
        
        
        
        
        $("#flogin").submit(function(e) {
          e.preventDefault();
          var lusername = $("#login_username"),
          lpassword = $("#login_password");
          
          login(lusername, lpassword);
          return false;
        })
      }
  });

})(jQuery);
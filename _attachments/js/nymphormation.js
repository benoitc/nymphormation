function escapeHTML(st) {                                       
  return(                                                                 
    st && st.replace(/&/g,'&amp;').                                         
      replace(/>/g,'&gt;').                                           
      replace(/</g,'&lt;').                                           
      replace(/"/g,'&quot;')                                         
  );                                                                     
};

(function($) {
  $.nymphormation = $.nymphormation || {};

  $.extend($.nymphormation, {
      
      FPIndex: function(app) {
        var app = app;
        var userdb = $.couch.db("user");
        var is_logged = $.cookies.get("AuthSession")

        if (!is_logged) {
            $("#not_logged_in").css('display', '');
        }

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
          return str_sha1(salt);
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

					      var user = {
					        fullname: escapeHTML(fullname.val()),
					        username: username.val(),
					        email: email.val(),
					        password: b64_sha1(password.val()),
					        salt: genSalt(),
					        type: "user"
					      };
					      
					      userdb.saveDoc(user);
					      
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
      }
  });

})(jQuery);
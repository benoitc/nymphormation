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

function updateChanges(app) {
  app.view("news",{
    reduce: false,
    startkey: ["entry", {}],
    endkey: ["entry"],
    descending: true,
    limit: 25,
    success: function(json) {
      $("#news").html(json.rows.map(function(row) {
        var news = row.value;
        return '<article class="link">'
        + '<h1><a href="'+ news.url + '">' + news.title + '</a></h1>'
        + '<p><span class="author">'+ news.author + '</span>'
        + '<span class="comments"><a href="' + app.showPath("news", news._id) +'">'
        + 'X comments</a></span</p></article>';
      }).join(''));
    }
  });
  
}

function newestPage(app) {
  
  updateChanges(app);
  connectToChanges(app, function() {
    updateChanges(app);
  });
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

// Localize the display of <time> elements
function localizeDates() {
    var lastdate = '';
    var now = new Date();

    $('time').each(function() {
       var el = this;

        if (el.getAttribute('title') == "GMT") {
            var date = new Date(Date.parseRFC3339(el.getAttribute('datetime')));
            if (!date.getTime())
                return;
            diff = ((now.getTime() - date.getTime()) / 1000),
            day_diff = Math.floor(diff / 86400);
            if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 )
                return;
            var text = date.toLocaleString();
            var title = date.toLocaleString();
            
            if (day_diff == 0) {
                text = (diff < 60 && "Just Now" ||
                diff < 120 && "1 minute ago" ||
                diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
                diff < 7200 && "1 hour ago" ||
                diff < 86400 && Math.floor( diff / 3600 ) + " hours ago");
                title = date.toLocaleTimeString();
            } else {
                hours = date.getHours();
                minutes = date.getMinutes();
                hours = (hours < 10) && "0" + hours || hours;
                minutes = (minutes < 10) && "0" + minutes || minutes;
                text = (day_diff == 1 && "Yesterday at " +  hours + ":" + minutes ||
                el.textContent);
                title = date.toLocaleString();
            }
            el.setAttribute('title', title);
            el.textContent = "posted " + text;
        }
    });

}


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
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
        return '<article class="item">'
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

function updateComments(app, docid) {
  var docid = docid;
  var app = app;
  app.view("comments",{
    key: docid,
    descending: true,
    success: function(json) {
      $("#comments").html(json.rows.map(function(row) {
        var comment = row.value;
        var fcreated_at = new Date().setRFC3339(comment.created_at).toLocaleString();
        return '<li class="comment" id="'+comment._id + '">'
        + '<p>by <a href="#">'+ comment.author + '</a> '
        + '<time title="GMT" datetime="' + comment.created_at + '" class="caps">'
        + fcreated_at + '</time></p>'
        + '<div class="text">' + comment.comment + '</div>'
        + '<p><a id="'+comment._id + '_'+ docid + '" href="#" class="reply">'
        + 'reply</a></p></li>';
      }).join(''));
      $(".reply").click(fsubcomment);
    }
  });
  
  
}

$.fn.noticeBox = function() {
    return this.each(function() {
        var s = this.style;
        s.left = (($(window).width() - $(this).width()) / 2) + "px";
        s.top = "40px";
        });
}

markdown_help = function(obj) {
    if ($(obj).next().is('.help')) {
        $(obj).next().remove();
        $(obj).html('help');
    } else {
        $(obj).html('hide help');
        $(obj).parent().append('<table class="help">'+
        '<tr><th>you type:</th><th>you see:</th></tr>'+
        '<tr><td>*italics*</td><td><em>italics</em></td></tr>'+
        '<tr><td>**bold**</td><td><b>bold</b></td></tr>'+
        '<tr><td>[friendurl!](http://friendurl.com)</td><td><a href="http://friendurl.com">friendurl!</a></td></tr>'+
        '<tr><td>* item 1<br/>* item 2<br />* item 3<br />'+
        '<td><ul><li>item 1</li><li>item 2</li><li>item 3</li></ul></td></tr>'+
        '<tr><td> > quoted text</td><td><bloquote>quoted text</bloquote></td></tr>'+
        '</table>');
    }
}

function fsubcomment() {
  if ($(this).next().is('.subcomment'))
      return false;
  var self = this;
  var link_id = $(this).attr('id');
  var ids= link_id.split("_");
  cform = $('<form id=""></form');
  $(cform).append('<input type="hidden" name="itemid" value="'+ ids[1] +'">'
  + '<input type="hidden" name="parentid" value="'+ ids[0] + '">'
  + '<textarea name="comment" class="scomment"></textarea>');
  rsubmit=$('<div class="submit-row"></div>')
  bsubmit = $('<input type="submit" name="bsubmit" value="comment">');
  bcancel = $('<input type="reset" name="bcancel" value="cancel">');
  bcancel.click(function() {
      $(self).next().remove();
  });
  
  $.CouchApp(function(app) {
    var commentForm = app.docForm(cform, {
      fields: ["comment", "itemid", "parentid"],
      template: {
          type: "comment",
          author: "<%= username %>"
      },
      validForm: function(doc) {
          if (!doc.comment) {
            updateTips("Comment required");
            return false;
          }
          
          return true;
      },
      beforeSave: function(doc) {
        doc.created_at = new Date().rfc3339();
        if (!doc.parentid)
          doc.parentid = null;
      },
      success: function(resp) {
        notice = $('<div class="notice" type="z-index:1002; position:fixed;">comment added</div>');
        notice.appendTo(document.body).noticeBox().fadeIn(400);
        $(self).next().remove();
      }
    });
  });
  
  /*bsubmit.click(function() {
      $tcomment = $(this).parent().parent().children('.scomment');
      comment = $tcomment.val()
      
      
      return false;
  });*/
  
  
  
  help = $('<a href="#" class="show-help">help</a>');
  help.click(function() {       
      markdown_help(this);
      return false;
  });

  $(rsubmit).append(bsubmit);
  $(rsubmit).append(bcancel);
  $(rsubmit).append(help);
  $(cform).append(rsubmit);

  cdiv = $('<div class="subcomment">'+
  '</div>');
  $(cdiv).append(cform);

  $(this).parent().append(cdiv);
  return false;
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
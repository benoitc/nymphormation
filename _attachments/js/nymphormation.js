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
                        day_diff < 7 && day_diff + " days ago at "  +  hours + ":" + minutes ||    
                        el.textContent);
                title = date.toLocaleString();
            }
            el.setAttribute('title', title);
            el.textContent = text;
        }
    });

}

function Login(app, options) {
  var app = app;
  var options = options || {};
  var tips = $("#signup-tips");
  var userdb = $.couch.db("user");
  
  function updateTips(t) {
      tips.text(t).fadeIn(1500);
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
  
  
  $("#login-popup").jqmShow();
  $("a.close").click(function() {
    $("#login-popup").jqmHide();
    return false;
  })
  $("#flogin").submit(function(e) {
      e.preventDefault();
      app.login({
        userdb: "user",
        username: $("#user").val(),
        password: $("#passwd").val(),
        success: function() {
          $("#login-popup").jqmHide();
          if (options.success) options.success();
        }
      });
      return false;
  });
  
  $("#fsignup").submit(function(e) {
    e.preventDefault();
    var bValid = true;
    var username = $("#username"),
    email = $("#email"),
    password = $("#password"),
    allFields = $([]).add(username).add(email).add(password);
    
    
    allFields.removeClass('ui-state-error');

    bValid = bValid && checkLength(username, "username", 3, 16);
    bValid = bValid && checkLength(email, "email", 6, 80);
    bValid = bValid && checkLength(password, "password", 5, 16);
    
    bValid = bValid && checkRegexp(username, /^[a-z]([0-9a-z_])+$/i, "Username may consist of a-z, 0-9, underscores, begin with a letter.");
		bValid = bValid && checkRegexp(email,/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,"eg. contact&nymphormation.com");
    bValid = bValid && checkRegexp(password,/^([0-9a-zA-Z])+$/,"Password field only allow : a-z 0-9");
    
    if (bValid) {
      var salt = Math.uuid();
      var password_hash = b64_sha1(salt + hex_sha1(password.val()));
      
      var user = {
        username: username.val(),
        email: email.val(),
        password: password_hash,
        salt: salt,
        type: "user"
      };
      
      userdb.saveDoc(user);
      app.login({
        userdb: "user",
        username: username.val(),
        password: password.val(),
        success: function() {
          $("#login-popup").jqmHide();
          if (options.success) options.success();
        },
        error: function(s, e, r) {
          $("#login-popup").jqmHide();
          alert("An error occurred logging in: " + r);
        }
      });
    }
    return false;
  });
  
  
}

function parseUri(sourceUri){
   /* parseUri by Steven Levithan (http://badassery.blogspot.com) */
    var uriPartNames = ["source","protocol","authority","domain","port","path","directoryPath","fileName","query","anchor"];
    var uriParts = new RegExp("^(?:([^:/?#.]+):)?(?://)?(([^:/?#]*)(?::(\\d*))?)?((/(?:[^?#](?![^?#/]*\\.[^?#/.]+(?:[\\?#]|$)))*/?)?([^?#/]*))?(?:\\?([^#]*))?(?:#(.*))?").exec(sourceUri);
    var uri = {};
    
    for(var i = 0; i < 10; i++){
        uri[uriPartNames[i]] = (uriParts[i] ? uriParts[i] : "");
    }
    
    // Always end directoryPath with a trailing backslash if a path was present in the source URI
    // Note that a trailing backslash is NOT automatically inserted within or appended to the "path" key
    if(uri.directoryPath.length > 0){
        uri.directoryPath = uri.directoryPath.replace(/\/?$/, "/");
    }
    
    return uri;
}

function updateChanges(app) {
  app.view("news",{
    reduce: false,
    startkey: ["link", {}],
    endkey: ["link"],
    descending: true,
    limit: 25,
    success: function(data) {
      var ids = [];
      for (var i=0; i<data.rows.length; i++) {
        ids.push(data.rows[i].value['_id']);
      }
      
      app.view("comments", {
        keys: ids,
        group: true,
        success: function(json) {
          var nb_comments = {};
          for (var i=0; i<json.rows.length; i++) {
            row = json.rows[i];
            nb_comments[row.key] = row.value;
          }
          
          $("#content").html(data.rows.map(function(row) {
            var news = row.value;
            url = parseUri(news.url)
            var nb = nb_comments[news._id] || 0;
            var fcreated_at = new Date().setRFC3339(news.created_at).toLocaleString();
            return '<article class="item">'
            + '<h2><a href="'+ news.url + '">' + news.title + '</a> <span clas="host">'+url.domain+'</span></h2>'
            + '<p><span class="author">by '+ news.author + '</span> '
            + '<time title="GMT" datetime="' + news.created_at +'" class="caps">'+ fcreated_at + '</time>'
            + '<span class="nb_comments"><a href="' + app.showPath("item", news._id) +'">'
            + ' ' + nb + ' comments</a></span</p></article>';
          }).join(''));
          localizeDates();
        }
      });  
    }
  });
}

function newestPage(app) {
  
  updateChanges(app);
  connectToChanges(app, function() {
    updateChanges(app);
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

function formToDeepJSON(form, fields, doc) {
  var form = $(form);
  fields.forEach(function(field) {
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

function fsubcomment(app, obj) {

  var obj = obj;
  app.isLogged(function() {
    var self = obj;
    var link_id = $(self).attr('id');
    var ids= link_id.split("_");
    cform = $('<form id=""></form');
    $(cform).append('<input type="hidden" name="linkid" value="'+ ids[1] +'">'
    + '<input type="hidden" name="parentid" value="'+ ids[0] + '">'
    + '<textarea name="body" class="scomment"></textarea>');
    rsubmit=$('<div class="submit-row"></div>')
    bsubmit = $('<input type="submit" name="bsubmit" value="comment">');
    bcancel = $('<input type="reset" name="bcancel" value="cancel">');
    bcancel.click(function() {
        $(self).next().remove();
    });


    $(cform).submit(function(e) {
      e.preventDefault();
      var localFormDoc = {
        type: "comment",
        author: username
      };

      formToDeepJSON(this, ["body", "linkid", "parentid"], localFormDoc);
      if (!localFormDoc.body) {
        alert("Comment required");
        return false;
      }
  
      localFormDoc.created_at = new Date().rfc3339();
      if (!localFormDoc.parentid) {
        localFormDoc.parentid = null;
      }
      app.db.openDoc(localFormDoc.parentid,{ 
        success: function(json) {
          if (json.path == undefined)
            path = [];
          else
            path = json.path;
          path.push(localFormDoc.parentid);
          localFormDoc.path = path;
          app.db.saveDoc(localFormDoc, {
            success: function(resp) {
              notice = $('<div class="notice" type="z-index:1002; position:fixed;">comment added</div>');
              notice.appendTo(document.body).noticeBox().fadeIn(400);
              $(self).next().remove();
            }
          });
      
        }
      });    
      return false; 
    });

    help = $('<a href="#" class="show-help">help</a>');
    help.click(function() {       
        markdown_help(self);
        return false;
    });

    $(rsubmit).append(bsubmit);
    $(rsubmit).append(bcancel);
    $(rsubmit).append(help);
    $(cform).append(rsubmit);

    cdiv = $('<div class="subcomment"></div>');
    $(cdiv).append(cform);

    $(self).parent().append(cdiv);
  }, function() {
    new Login(app, {
       success: function() {
         fsubcomment(app, obj);
       }
     });
  });
  
}



function updateComments(app, linkid, docid) {
  var docid = docid;
  var linkid = linkid;
  var app = app;
  
  function children(parentid, rows, comments, idx_comments) {
    for(var v=0; v < rows.length; v++) {
      value = rows[v].value;
      children = [];
      if (idx_comments[value['_id']] != undefined)
        children = idx_comments[value['_id']]['children'];
      value['children'] = children
      idx_comments[value._id] = value;

      if (value['parentid'] && value['parentid'] != parentid) {
        if (idx_comments[value['parentid']] == undefined) 
          idx_comments[value['parentid']] = {};
        if (idx_comments[value['parentid']]['children']  == undefined)
          idx_comments[value['parentid']]['children'] = [];
        idx_comments[value['parentid']]['children'].push(value._id);
      } else {
        comments.push(value)
      }
    }
  }
  
  
  function iter_comments(comments, idx, start) {
    if (start == undefined) {
       start = 0;
    }
    var c = comments[start];
    var thread = [];
    if (c['children'].length > 0) {
      for (var i=0; i < c.children.length; i++)
        thread.push(idx[c.children[i]]);
      iter_comments(thread, idx)
    }
    c['thread']  = thread;
    comments[start] = c;
    if (start < (comments.length - 1))
      iter_comments(comments, idx, start+1);
  }
  
  function dthread(thread, level) {
    if (level == undefined)
      level = 0;
    ret = "<ul>";
    for (var i=0; i<thread.length; i++) {
      var c = thread[i];
      var fcreated_at = new Date().setRFC3339(c.created_at).toLocaleString();
      ret += '<li class="comment" id="'+c._id + '">'
      + '<p class="meta">by <a href="#">'+ c.author + '</a> '
      + '<time title="GMT" datetime="' + c.created_at + '" class="caps">'
      + fcreated_at + '</time></p>'
      + '<div class="text">' + c.body + '</div>';
      
      ret += '<p><a href="'+ app.showPath("item", c._id) + '">link</a>'
      if (level < 5 )
        ret += ' | <a id="'+c._id + '_'+ linkid + '" href="#" class="reply">reply</a>';
      ret += '</p>'
      if (c['thread'])
        ret += dthread(c['thread'], level+1);
      ret +=  "</li>"
    }
    ret += "</ul>";
    return ret
  }
  
  app.view("comments_subtree",{
    startkey: [docid],
    endkey: [docid, {}],
    success: function(json) {
      if (json.rows.length>0) {
        var idx_comments = {};
        var comments = [];
        children(docid, json.rows, comments, idx_comments);
        iter_comments(comments, idx_comments);
        $("#comments").html(dthread(comments));
      }
      $(".reply").click(function(e) {
        if ($(this).next().is('.subcomment'))
            return false;
            
        new fsubcomment(app, this);
        return false;
      });
      return true;
    }
  });
  
  
}




function itemPage(app, linkid, docid) {
  
  
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



function userNav(app) {
  var href = document.location;
  app.isLogged(function(data) {
     $('.userprofile').autoRender({ userprofile: data.userCtx.name })
     $(".logged_in").show();
   }, function() {
     $(".not_logged_in").show();
     $("#login").click(function(e){
       e.preventDefault();
       Login(app, {
         success: function() {
           document.location = href;
         }
       });
       return false;
     });
   });
   
   $("#logout").click(function() {
     app.logout({
       userdb: "user",
       success: function() {
         document.location = "/" + app.db.name + "/_design/" + app.name + "/index.html";
       }
     });
   });
   
   $("a.add").click(function() {
      var href = $(this).attr("href");
       app.isLogged(function() {
         document.location = href;
       }, function() {
         new Login(app, {
           success: function() {
             document.location = href;
           }
         });
       });
       return false;
    });
}

(function($) {
  $("#login-popup").jqm();

  $(".nf-button")
    .hover(
  		function() {
  			$(this).addClass('ui-state-hover');
  		},
  		function() {
  			$(this).removeClass('ui-state-hover');
  		}
  	)
  	.focus(function() {
  		$(this).removeClass('ui-state-focus');
  	})
  	.blur(function() {
  	  $(this).removeClass('ui-state-focus');
  	})
  	.mousedown(function(ev) {
			ev.stopPropagation();
		})
		.mouseout(function(ev) {
		  ev.stopPropagation();
		});
		
	  

})(jQuery);
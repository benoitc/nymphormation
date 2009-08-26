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

function escapeHTML(st) {                                       
  return(                                                                 
    st && st.replace(/&/g,'&amp;').                                         
      replace(/>/g,'&gt;').                                           
      replace(/</g,'&lt;').                                           
      replace(/"/g,'&quot;')                                         
  );                                                                     
};

// manage login. ask to register if needed
function Login(app, options) {
  var app = app;
  var options = options || {};
  var tips = $("#signup-tips");
  var userdb = $.couch.db("users");
  
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
  
  function login(username, password) {
    app.login({
      userdb: "users",
      username: username,
      password: password,
      success: function() {
        userdb.view("profile/profile", {
          key: username,
          success: function(json) {
            var profile = json.rows[0].value;
            $.cookies.set("NYMPHORMATION_ID", 
              profile['username'] + ";" + profile['gravatar'],
              "/");
            $("#login-popup").jqmHide();
            if (options.success) options.success();
          }
        });
        
      },
      error: function(d) {
        $("#login-popup").jqmHide();
        alert("An error occurred logging in: " + r);
      }
    });
  }
  
  $("#login-popup").jqmShow();
  $("a.close").click(function() {
    $("#login-popup").jqmHide();
    return false;
  });
 
  $("#flogin").submit(function(e) {
      e.preventDefault();
      login($("#user").val(), $("#passwd").val())
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
      var user = {
        username: username.val(),
        email: email.val(),
        password: password.val(),
        active: "true"
      };
      
      $.ajax({
        type: "POST",
        url: "/_user",
        data: user,
        success: function() {
          login(username.val(), password.val());
        },
        error: function() {
          updateTips("Username already exist");
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

function updatenbComments(app, ids) {
  app.view("nbcomments", {
    keys: ids,
    group: true,
    success: function(json) {
      for(var c=0; c<json.rows.length; c++) {
        value = json.rows[c].value + " comment";
        if (json.rows[c].value > 1)
          value +="s";
        value = '<a href="../../_show/item/'+ json.rows[c].key +'">'+value+'</a>'
        $("#"+json.rows[c].key+" p span.nbcomments").html(value);
      }
    }
  });
}

function updatenbVotes(app, ids) {
  app.view("points", {
    keys: ids,
    group: true,
    success: function(json) {
      for(var c=0; c<json.rows.length; c++) {
        value = json.rows[c].value + " vote";
        if (json.rows[c].value > 1)
          value +="s"
        value = '<a href="../../_show/item/'+ json.rows[c].key +'">'+value+'</a>'
        $("#"+json.rows[c].key+" p span.nbvotes").html(value);
      }
    }
  });
}

function updateChanges(app) {
  var app = app;
  
  var href = document.location.href;
  var uri = parseUri(document.location.href);
  var query = {};
  if (uri.query) {
    query_parts = uri.query.split("&");
    for (var i=0; i<query_parts.length; i++) {
      p = query_parts[i].split("=");
      query[p[0]] = p[1] || "";
    }
  }

  
  var next = query["startkey"] || false;
  var options = {}
  if (next) {
     var ids = [];
      $('.item').each(function() {
          ids.push($(this).attr('id'));
      });
      updatenbComments(app, ids);
      updatenbVotes(app, ids);    
      
  } else {
    
    app.view("news", {
      descending: true,
      limit: 11,
      success: function(data) {
        link_update = true
        if (first_key && (first_key[0] == data.rows[0].key[0] && first_key[1] == data.rows[0].key[1]))
          link_update = false;
        var ids = [];
        if (!link_update) {
          for (var i=0; i<data.rows.length; i++)
            ids.push(data.rows[i].value['_id']);
        } else {
          $("#links").html(data.rows.map(function(row, idx) {
            if (idx == 10)
             return ''
            var news = row.value;
            ids.push(row.value['_id']);
            if (news.url)
              domain = parseUri(news.url).domain;
            else
              domain = "";

            var item_url = news.url || app.showPath("item", news._id);

            var fcreated_at = new Date().setRFC3339(news.created_at).toLocaleString();
            return '<article class="item" id="'+news._id+'">'
            + '<h2><a href="'+ item_url + '">' + news.title + '</a> <span clas="host">'+domain+'</span></h2>'
            + '<p><span class="author">by <img src="http://www.gravatar.com/avatar/'
            + news.author.gravatar +'?s=22&amp;d=identicon" alt=""> <a href="'+ app.listPath('user', 'links')
            +'?key='+encodeURIComponent(JSON.stringify(news.author.username))+'">'
            + news.author.username + '</a></span> '
            + '<time title="GMT" datetime="' + news.created_at +'" class="caps">'+ fcreated_at + '</time>'
            + ' <span class="nbcomments"><a href="' + app.showPath("item", news._id) +'">0 comments</a></span>'
            + ' <span class="nbvotes"><a href="' + app.showPath("item", news._id) +'">0 votes</a></span></p></article>';

          }).join(''));

          if (data.rows.length == 11) {
            var params_string = "?next=" + encodeURIComponent(toJSON(data.rows[data.rows.length-1].key));
            var next = $('<div class="next"><a href="'+ app.listPath("links", "news")
            + encodeOptions({key: data.rows[data.rows.length-1].key, descending: true, limit: 11 }) +'">next</a></div>');
            $("#links").append(next);
          }
          localizeDates();
        }
        updatenbComments(app, ids);
        updatenbVotes(app, ids);
      }
    });
    
  }
  
  
}

function newestPage(app) {
  
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

function submitComment(app, form, link_title) {
  var href = document.location;
  var app = app,
  link_title = link_title;
   
  var converter = new Showdown.converter;
  
  var localFormDoc = {
    type: "comment",
    link_title: link_title
  }

  formToDeepJSON(form, ["body", "linkid", "parentid"], localFormDoc);
  if (!localFormDoc.body) {
    alert("Comment required");
    return false;
  }
  
  localFormDoc.html = converter.makeHtml(escapeHTML(localFormDoc.body));
  
  localFormDoc.created_at = new Date().rfc3339();
  if (!localFormDoc.parentid) {
    localFormDoc.parentid = null;
  }
  var cookie = $.cookies.get("NYMPHORMATION_ID", "/").split(";");
  localFormDoc.author = { 
    username: cookie[0],
    gravatar: cookie[1]
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
          document.location = href;
        }
      });
    }
  });    
     
}

function fsubcomment(app, obj, link_title) {
  var obj = obj,
  link_title = link_title;
  app.isLogged(function() {
    var self = obj;
    var link_id = $(self).attr('id');
    var ids= link_id.split("_");
    cform = $('<form id="" class="cform"></form');
    $(cform).append('<input type="hidden" name="linkid" value="'+ ids[1] +'">'
    + '<input type="hidden" name="parentid" value="'+ ids[0] + '">'
    + '<textarea name="body" class="scomment"></textarea>');
    rsubmit=$('<div class="submit-row"></div>')
    bsubmit = $('<input type="submit" name="bsubmit" value="comment"'
    +'class="nf-button ui-state-default ui-corner-all">');
    bcancel = $('<input type="reset" name="bcancel" value="cancel"'
    +'class="nf-button ui-state-default ui-corner-all">');
    bcancel.click(function() {
        $(self).next().remove();
    });

    help = $('<a href="#" class="show-help">help</a>');
    help.click(function() {       
        markdown_help(this);
        return false;
    });

    $(rsubmit).append(bsubmit);
    $(rsubmit).append(bcancel);
    $(rsubmit).append(help);
    $(cform).append(rsubmit);
    $(cform).submit(function(e) {
        e.preventDefault();
        submitComment(app, this, link_title);
        return false;
    });
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


function doVote(app, obj, value) {
  var app=app,
  obj=obj,
  value=value,
  votes = {};

  var href = document.location;
  var id = $(obj).attr("id").substr(1);
  var cookie = $.cookies.get("NYMPHORMATION_ID", "/").split(";");
  var d = $('article#'+ id + " time").attr("datetime");
  
  var cookie_votes = $.cookies.get("NYMPHORTMATION_VOTES", "");
  if (cookie_votes)
    votes = JSON.parse(Base64.decode(cookie_votes));
            
  if (id in votes && value == votes[id]) return;
  
  var vote = {
    itemid: id,
    d: d,
    v: value,
    author: { 
      username: cookie[0],
      gravatar: cookie[1]
    },
    type: "vote",
  }
  
  app.db.saveDoc(vote, {
    success: function(doc) {
      votes[id] = value;
      $.cookies.set("NYMPHORTMATION_VOTES", Base64.encode(JSON.stringify(votes)), "/");
      document.location = href;
    }
  });
}

function updateVotes(app, linkid) {
  app.view("points", {
    key: linkid,
    success: function(json) {
      $("span.vote-count").html(json.rows[0].value);
    }
  })
}

function itemPage(app, linkid, docid) {
  var app=app,
  linkid=linkid,
  docid=docid,
  votes = {};
  
  var cookie_votes = $.cookies.get("NYMPHORTMATION_VOTES", "");
  if (cookie_votes)
    votes = JSON.parse(Base64.decode(cookie_votes));
    
  if (linkid in votes) {
    var vote = $("#u"+linkid);
    vote.attr("src", "../../images/vote-arrow-up.png")
    vote.addClass("voted");
  }
    
  updateVotes(app, linkid);
  connectToChanges(app, function() {
    updateVotes(app, linkid);
  });
}


function updateComments(app, linkid, docid, link_title) {
  var docid = docid,
  linkid = linkid,
  app = app,
  link_title = link_title;
  
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
      + '<p class="meta">by <img src="http://www.gravatar.com/avatar/'
      + c.author.gravatar +'?s=22&amp;d=identicon" alt=""><a href=\''
      + app.listPath('user', 'links')+'?key="'+c.author.username+'"\'>'
      + c.author.username + '</a> '
      + '<time title="GMT" datetime="' + c.created_at + '" class="caps">'
      + fcreated_at + '</time></p>'
      + '<div class="text">' + c.html + '</div>';
      
      ret += '<p class="bottom"><a href="'+ app.showPath("item", c._id) + '">link</a>'
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
        localizeDates();
      }
      $(".reply").click(function(e) {
        if ($(this).next().is('.subcomment'))
            return false;    
        new fsubcomment(app, this, link_title);
        return false;
      });
      return true;
    }
  });
  
  
}

function connectToChanges(app, fun) {
  function resetHXR(x) {
    x.abort();
    connectToChanges(app, fun);    
  };
  app.db.info({success: function(db_info) {  
    var c_xhr = jQuery.ajaxSettings.xhr();
    c_xhr.open("GET", app.db.uri+"_changes?feed=longpoll&since="+db_info.update_seq, true);
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
     // get user profile
     //$('.userprofile').autoRender({ userprofile: data.userCtx.name })
     $('.userprofile').html(data.name);
     
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
     var href = document.location.href;
     app.logout({
       userdb: "user",
       success: function() {
         try {
           $.cookies.remove("NYMPHORMATION_ID", "/");
         } catch (e) {}
         document.location = href;
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
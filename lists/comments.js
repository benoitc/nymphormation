function(head, row, req, row_info) {
 // !json templates.comments
 // !code helpers/ejs/ejs.js
 // !code helpers/template.js
 // !code vendor/couchapp/path.js
 // !code vendor/couchapp/date.js
 // !code vendor/couchapp/json2.js
 
 var feedPath = listPath('comments','comments',{descending:true, limit:25, format:"atom"});
 var feedLinksPath = listPath('links','news',{descending:true, limit:25,  format:"atom"});
 
 return respondWith(req, {
   html: function() {
     if (head) {
       return template(templates.comments.head, {
         username: req.userCtx['name'],
         feedPath: feedPath
       });
     } else if (row) {
       if (row_info.row_number == 24 || row_info.row_number == 124)
           return {stop: true}

       var fcreated_at = new Date().setRFC3339(row.value.created_at).toLocaleString();
       return template(templates.comments.row, {
         doc: row.value,
         fcreated_at: fcreated_at,
         author: toJSON(row.value.author.username),
         link_url: showPath("item", row.value._id),
         parent_url: showPath("item", row.value.parentid)
       });
     } else {
       if (row_info.row_number == 25) {
         next = listPath('comments','comments', {
            descending:true, 
            limit:26,
            startkey: row_info.prev_key
          })
       } else {
         next = false;
       }
       return template(templates.comments.tail, {
         username: req.userCtx['name'],
         next: next
       });
     }
   },
   atom: function() {
     // with first row in head you can do updated.
     if (head) {
       var f = <feed xmlns="http://www.w3.org/2005/Atom"/>;
       f.title = "nymphormation01 - comments";
       f.id = makeAbsolute(req, "index.html");
       f.link.@href = makeAbsolute(req, feedPath);
       f.link.@rel = "self";
       f.generator = 'nymphormation.org';
       f.updated = new Date().rfc3339();
       return {body: '<?xml version="1.0" encoding="UTF-8"?>\n'+
           f.toXMLString().replace(/\<\/feed\>/,'')};
     } else if (row) {
       var entry = <entry/>;
       entry.id = makeAbsolute(req, showPath("item", row.id));
       entry.title = "by " + row.value.author.username + " on " + row.value.link_title;
       entry.content = row.value.html;
       entry.content.@type = 'html';
       entry.updated = row.value.created_at;
       entry.author = <author><name>{row.value.author.username}</name></author>;
       entry.link.@href = makeAbsolute(req, showPath('item', row.id));
       entry.link.@rel = "alternate";
       return {body:entry};
     } else {
       return {body: "</feed>"};
     }
   },
   sitemap: function() {
    //sitemap
    if (head) {
      return {body:'<?xml version="1.0" encoding="UTF-8"?>\n'+
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>'};
    } else if (row) {
      var url = <url/>;
      url.loc = makeAbsolute(req, showPath('item', row.id));
      url.lastmod = row.value.created_at;
      url.changefreq = "daily";
      url.priority = "0.5";
      return {body:url};
    } else {
      return {body: "</urlset>"};
    }

  }
   
 })
}
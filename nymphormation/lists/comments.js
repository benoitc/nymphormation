/* 
 This file is part of nymphormation released under the Apache2 license. 
 See the NOTICE for more information. */


function(head, req) {
 // !json templates.comments
 // !code helpers/ejs/ejs.js
 // !code helpers/template.js
 // !code vendor/couchapp/path.js
 // !code vendor/couchapp/date.js
 // !code vendor/couchapp/json2.js
 
 var feedPath = listPath('comments','comments',{descending:true, limit:25, format:"atom"});
 var feedLinksPath = listPath('links','news',{descending:true, limit:25,  format:"atom"});
 
 provides("html", function() {
     send(template(templates.comments.head, {
         username: req.userCtx.name || "",
         feedPath: feedPath
     }));
     var row, key,
     i = 0;
     while (row = getRow()) {
       if (i == 24 || i == 124)
          break;

       var fcreated_at = new Date().setRFC3339(row.value.created_at).toLocaleString();
       send(template(templates.comments.row, {
         doc: row.value,
         fcreated_at: fcreated_at,
         author: toJSON(row.value.author.username),
         link_url: showPath("item", row.value._id),
         parent_url: showPath("item", row.value.parentid)
       }));
       i = i + 1;
       key = row.key;
     }
     if (i== 25) {
       next = listPath('comments','comments', {
          descending:true, 
          limit:26,
          startkey: key
        });
     } else {
       next = false;
     }
     return template(templates.comments.tail, {
       username: req.userCtx.name || "",
       next: next
     });
   });
   
   
  provides("atom", function() {
     // with first row in head you can do updated.
     
      var f = <feed xmlns="http://www.w3.org/2005/Atom"/>;
     f.title = "nymphormation01 - comments";
     f.id = makeAbsolute(req, "index.html");
     f.link.@href = makeAbsolute(req, feedPath);
     f.link.@rel = "self";
     f.generator = 'nymphormation.org';
     f.updated = new Date().rfc3339();
     send('<?xml version="1.0" encoding="UTF-8"?>\n'+
         f.toXMLString().replace(/\<\/feed\>/,''));
     while (row = getRow()) {
       var entry = <entry/>;
       entry.id = makeAbsolute(req, showPath("item", row.id));
       entry.title = "by " + row.value.author.username + " on " + row.value.link_title;
       entry.content = row.value.html;
       entry.content.@type = 'html';
       entry.updated = row.value.created_at;
       entry.author = <author><name>{row.value.author.username}</name></author>;
       entry.link.@href = makeAbsolute(req, showPath('item', row.id));
       entry.link.@rel = "alternate";
       send(entry);
     } 
     return "</feed>";
   });
   provides("sitemap", function() {
    //sitemap
    send('<?xml version="1.0" encoding="UTF-8"?>\n'+
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>');
    while (row = getRow()) {
      var url = <url/>;
      url.loc = makeAbsolute(req, showPath('item', row.id));
      url.lastmod = row.value.created_at;
      url.changefreq = "daily";
      url.priority = "0.5";
      send(url);
    } 
    return "</urlset>";

  });
}

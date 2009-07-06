function(head, req) {
  // !json templates.links
  // !code helpers/ejs/ejs.js
  // !code helpers/template.js
  // !code vendor/couchapp/path.js
  // !code vendor/couchapp/date.js
  // !code vendor/couchapp/json2.js
  
  req.userCtx = { name: ""}

  var feedPath = listPath('links','news',{descending:true, limit:25,  format:"atom"});

  return respondWith(req, {
    html: function() {

      send(template(templates.links.head, {
        username: req.userCtx.name,
        feedPath: feedPath
      }));
      var row, key, first_key,
      i = 0;
      while (row = getRow()) {
        if (!req.query.limit && i > 9)
          break;

        var item_url = row.value.url || showPath("item", row.id);
        var fcreated_at = new Date().setRFC3339(row.value.created_at).toLocaleString();
        if (row.value['url'])
          row.value['domain'] =  parseUri(row.value['url']).domain;
        else
          row.value['domain'] = "";

        send(template(templates.links.row, {
          doc: row.value,
          author: toJSON(row.value.author.username),
          fcreated_at: fcreated_at,
          item_url: item_url
        }));
        if (i == 0)
          first_key = row.key;
        i = i + 1;
        key = row.key;
       }
       
       
       if (i == 11) {
         next = listPath('links','news', {
                  descending:true, 
                  limit:11,
                  startkey: key
         })
       } else {
         next = false;
       }
       return template(templates.links.tail, {
         username: req.userCtx.name,
         next:next,
         first_key: toJSON(first_key)
       });
  },
  atom: function() {
    // with first row in head you can do updated.
     
    var f = <feed xmlns="http://www.w3.org/2005/Atom"/>;
    f.title = "nymphormation01 - latest links";
    f.id = makeAbsolute(req, "index.html");
    f.link.@href = makeAbsolute(req, feedPath);
    f.link.@rel = "self";
    f.generator = 'nymphormation.org';
    f.updated = new Date().rfc3339();
    send('<?xml version="1.0" encoding="UTF-8"?>\n'+
           f.toXMLString().replace(/\<\/feed\>/,''));
    for (row = getRow()) {
      var url = "";
       if (row.value.url) {
         url = row.value.url;
         content = '<a href="'+ makeAbsolute(req, showPath('item', row.id)) + '">Comments</a>';
       } else {
         url = makeAbsolute(req, showPath('item', row.id));
         content = row.value.html 
         + '<a href="'+ makeAbsolute(req, showPath('item', row.id)) + '">Comments</a>';
       }
       
       var entry = <entry/>;
       entry.id = makeAbsolute(req, showPath("item", row.id));
       entry.title = row.value.title;
       entry.content = content;
       entry.content.@type = 'html';
       entry.updated = row.value.created_at;
       entry.author = <author><name>{row.value.author.username}</name></author>;
       entry.link += <link href={url}></link>;       
       entry.link += <link href={makeAbsolute(req, showPath('item', row.id))} rel={"alternate"} type={"text/html"} title={"Comments"}></link>;       
       send(entry);
    }

    return "</feed>";
   },
   sitemap: function() {
     //sitemap
     send('<?xml version="1.0" encoding="UTF-8"?>\n'+
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>');
     for (row=getRow()) {
       var url = <url/>;
       url.loc = makeAbsolute(req, showPath('item', row.id));
       url.lastmod = row.value.created_at;
       url.changefreq = "daily";
       url.priority = "0.5";
       return {body:url};
     }
     return "</urlset>";
   }
   
 });
}
/* 
 This file is part of nymphormation released under the Apache2 license. 
 See the NOTICE for more information. */


function(head, req) {
  // !json templates.user
  // !code helpers/ejs/ejs.js
  // !code helpers/template.js
  // !code vendor/couchapp/path.js
  // !code vendor/couchapp/date.js
  // !code vendor/couchapp/json2.js
 
 var username = JSON.parse(req.query['key']) || ""
 var feedPath = listPath('user','links', {
   key: username,
   limit:25,
   format:"atom"
 });
 
   provides("html", function() {
     send(template(templates.user.head, {
          username: username,
          feedPath: feedPath
      }));
      
      var row, key,
      i = 0;
      while (row = getRow()) {

        var item_url = row.value.url || showPath("item", row.id);
        var fcreated_at = new Date().setRFC3339(row.value.created_at).toLocaleString();
        if (row.value['url'])
          row.value['domain'] =  parseUri(row.value['url']).domain;
        else
          row.value['domain'] = "";
          
        send(template(templates.user.row, {
          doc: row.value,
          fcreated_at: fcreated_at,
          item_url: item_url
        }));
      }
      return template(templates.user.tail, {
          username: username
      });
    });
    
   provides("atom", function() {
     // with first row in head you can do updated.
     var f = <feed xmlns="http://www.w3.org/2005/Atom"/>;
     f.title = "nymphormation01 - " + username + " links";
     f.id = makeAbsolute(req, "index.html");
     f.link.@href = makeAbsolute(req, feedPath);
     f.link.@rel = "self";
     f.generator = 'nymphormation.org';
     f.updated = new Date().rfc3339();
     send('<?xml version="1.0" encoding="UTF-8"?>\n'+
         f.toXMLString().replace(/\<\/feed\>/,''));
     while (row = getRow()) {
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
    });
}
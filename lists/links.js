function(head, row, req, row_info) {
 // !code vendor/couchapp/path.js
 // !code vendor/couchapp/date.js
 
 var feedPath = listPath('links','news',{descending:true, limit:25, reduce: false, format:"atom"});
 
 return respondWith(req, {
   atom: function() {
     // with first row in head you can do updated.
     if (head) {
       var f = <feed xmlns="http://www.w3.org/2005/Atom"/>;
       f.title = "nymphormation01 - latest links";
       f.id = makeAbsolute(req, "index.html");
       f.link.@href = makeAbsolute(req, feedPath);
       f.link.@rel = "self";
       f.generator = 'nymphormation.org';
       f.updated = new Date().rfc3339();
       return {body: '<?xml version="1.0" encoding="UTF-8"?>\n'+
           f.toXMLString().replace(/\<\/feed\>/,'')};
     } else if (row) {
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
       entry.title = row.value.title + " by " + row.value.author.username;
       entry.content = content;
       entry.content.@type = 'html';
       entry.updated = row.value.created_at;
       entry.author = <author><name>{row.value.author.username}</name></author>;
       entry.link += <link href={makeAbsolute(req, showPath('item', row.id))} rel={"alternate"} type={"text/html"} title={"Comments"}></link>;       
       return {body:entry};
     } else {
       return {body: "</feed>"};
     }
   }
   
 });
}
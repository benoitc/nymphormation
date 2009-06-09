function(head, row, req, row_info) {
 // !json templates.comments
 // !code helpers/ejs/ejs.js
 // !code helpers/template.js
 // !code vendor/couchapp/path.js
 // !code vendor/couchapp/date.js
 
 
 return respondWith(req, {
   html: function() {
     if (head) {
       return template(templates.comments.head, {
         req: toJSON(req)
       });
     } else if (row) {
       var fcreated_at = new Date().setRFC3339(row.value.created_at).toLocaleString();
       return template(templates.comments.row, {
         doc: row.value,
         fcreated_at: fcreated_at,
         link_url: showPath("item", row.value._id),
         parent_url: showPath("item", row.value.parentid)
       });
     } else {
       return template(templates.comments.tail, {});
     }
   }
   
 })
}
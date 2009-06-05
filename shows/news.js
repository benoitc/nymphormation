function(doc, req) {
  // !code helpers/ejs/ejs.js
  // !code helpers/template.js
  // !code vendor/couchapp/path.js
  // !code vendor/couchapp/date.js
  
  // !json templates.edit
  // !json templates.show
  
  // redirect to homepage if not authenticated
  if (!doc && (typeof req.userCtx['name'] == "undefined" || ! req.userCtx['name'])) {
    return {
      code: 302,
      headers: {
        "Location": "../index.html"
      }
    }
  }
   
  var fcreated_at = null;
  
  if (!doc) {
    tpl = templates.edit;
  } else {
    tpl = templates.show;
    var fcreated_at = new Date().setRFC3339(doc.created_at).toLocaleString();
  }
  
  return template(tpl, {
      doc: doc,
      fcreated_at: fcreated_at,
      username: req.userCtx['name'],
      assets : assetPath()
  })
}
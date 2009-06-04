function(doc, req) {
  // !code helpers/ejs/ejs.js
  // !code helpers/template.js
  // !code vendor/couchapp/path.js
  
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
   
  if (!doc)
    tpl = templates.edit;
  else
    tpl = templates.show;
  
  return template(tpl, {
      doc: doc,
      username: req.userCtx['name'],
      assets : assetPath()
  })
}
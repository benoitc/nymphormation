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
  var parent_url = null;
  var path = null;
  var linkid = null;
  var link_title = ""
  if (!doc) {
    tpl = templates.edit;
  } else {
    tpl = templates.show;
    var fcreated_at = new Date().setRFC3339(doc.created_at).toLocaleString();
    if (doc.type == "link") {
      linkid = doc._id;
      path = [ linkid ];
      if (doc.url)
        doc.domain = parseUri(doc.url).domain;
      else
        doc.domain = "";
      link_title = doc.title
        
    } else {
      linkid = doc.linkid;
      link_title = doc.link_title,
      path = doc.path;
      path.push(doc._id); 
      parent_url = showPath("item", doc.parentid);
    }
  }
  
  return template(tpl, {
      doc: doc,
      jdoc: toJSON(doc),
      linkid: linkid,
      link_title: link_title,
      parent_url: parent_url,
      path: toJSON(path),
      fcreated_at: fcreated_at,
      username: req.userCtx['name'],
      assets : assetPath()
  })
}
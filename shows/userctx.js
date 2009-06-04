function(doc, req) {

  if (typeof req.userCtx['name'] != "undefined" && req.userCtx['name']) {
    is_logged = true;
  } else {
    is_logged = false;
  }
    
  resp = {
    is_logged: is_logged,
    userCtx: req.userCtx
  };
  
  return {
      headers: {
        "Cache-Control": "no-cache, must-revalidate",
        "Pragma": "no-cache",
        "Last-Modified": new Date().toUTCString()
      },
      json : resp
  };
}
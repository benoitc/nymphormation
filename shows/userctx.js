function(doc, req) {
  if (typeof req.cookie['AuthSession'] != "undefined" && req.cookie['AuthSession']) {
    is_logged = true;
  } else {
    is_logged = false;
  }
    
  resp = {
    is_logged: is_logged,
    userCtx: req.userCtx
  };
  
  return {
      json : resp
  };
}
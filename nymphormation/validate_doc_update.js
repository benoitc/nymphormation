function (newDoc, oldDoc, userCtx) {
  function forbidden(message) {    
    throw({forbidden : message});
  };
  
  function unauthorized(message) {
    throw({unauthorized : message});
  };

  if (userCtx.roles.indexOf('_admin') == -1) {
    // admin can edit anything, only check when not admin...
    if (newDoc._deleted) 
      unauthorized("You may not delete a doc.");     
  }
  
  if (userCtx.roles.indexOf('_admin') && (!userCtx.name || userCtx.name == undefined)) {
    // only connected users can create.
    forbidden("you'll need to login or register to do that");
  }
}
/* 
 This file is part of nymphormation released under the Apache2 license. 
 See the NOTICE for more information. */

function(doc) {
  // !code vendor/couchapp/_attachments/md5.js
  
  if (doc.type == "user") {
    var user = {
      username: doc.username,
      email: doc.email,
      gravatar: hex_md5(doc.email)
    }
    emit(doc.email, user);
  }
}
function(doc) {
  // !code vendor/couchapp/_attachments/md5.js
  
  if (doc.type == "user") {
    var user = {
      username: doc.username,
      email: doc.email,
      gravatar: hex_md5(doc.email)
    }
    emit(doc.username, user);
  }
}
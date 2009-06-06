function(doc) {
  if (doc.type == "comment") {
    emit(doc.linkid, doc);
  }  
}
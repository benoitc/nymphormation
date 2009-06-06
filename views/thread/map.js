function(doc) {
  if (doc.type == "comment") {
    emit(doc.itemid, doc);
  }  
}
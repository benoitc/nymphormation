function(doc) {
  if (doc.type == "vote") {
    emit([doc.itemid, doc.author.username], null);
  }
}
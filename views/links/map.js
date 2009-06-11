function(doc) {
  if (doc.type == "link")
    emit(doc.author.username, doc);
}
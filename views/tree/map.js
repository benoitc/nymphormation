function(doc) {
  if (doc.type == "comment") {
    emit(doc.path, doc)
  }
}
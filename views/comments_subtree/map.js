function(doc) {
  if (doc.type == "comment") {
    for (var i in doc.path)
      emit([doc.path[i], doc._local_seq], doc);
  }
}
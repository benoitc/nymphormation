function(doc) {
  if (doc.type == "comment") {
    emit([doc._local_seq, doc.linkid], doc);
  }
}
function(doc) {
  if (doc.type == "link") {
    emit([doc.type, doc._local_seq], doc);
  }
};
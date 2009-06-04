function(doc) {
  if (doc.type == "entry") {
    emit([doc.type, doc._local_seq], doc);
  }
};
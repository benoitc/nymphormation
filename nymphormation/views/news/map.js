function(doc) {
  if (doc.type == "link") {
    emit([doc._local_seq, doc._id], doc);
  }
};
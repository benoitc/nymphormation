function(doc) {
  if (doc.type == "link") {
    emit([doc._id, doc._local_seq], doc);
  }
};
function(doc) {
  if (doc.type == "vote") {
    emit(doc.itemid, {d: doc.d, v: doc.v});
  }
}
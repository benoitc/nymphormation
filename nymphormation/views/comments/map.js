/* 
 This file is part of nymphormation released under the Apache2 license. 
 See the NOTICE for more information. */


function(doc) {
  if (doc.type == "comment") {
    emit([doc._local_seq, doc.linkid], doc);
  }
}
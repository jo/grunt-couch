function(doc) {
  if (doc.name) {
    emit(doc.name, null);
  }
}

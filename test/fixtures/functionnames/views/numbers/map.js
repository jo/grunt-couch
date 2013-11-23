function numberMap(doc) {
  if (doc.number) {
    emit(doc.number, null);
  }
}

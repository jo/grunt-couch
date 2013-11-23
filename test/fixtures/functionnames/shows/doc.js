function show_doc(doc, req) {
  return {
    body: 'Hello #' + doc.number
  };
}

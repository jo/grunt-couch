function(doc, req) {
  return {
    body: 'Hello #' + doc.number
  }
}

function(doc, req) {
  doc = doc || {};

  for (var field in req.form) {
    doc[field] = req.form[field];
  }
  doc.type = 'doc';

  return [doc, 'updated doc'];
}

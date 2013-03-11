function(newDoc, oldDoc, userCtx, secObj) {
  if (typeof newDoc.number !== 'number') {
    throw({ forbidden: 'Document must have a number.' });
  }
}

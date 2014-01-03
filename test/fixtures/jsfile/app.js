

var ddoc = {
  "_id": "_design/jsfile",
  "views": {}
};

ddoc.views.names = {};
ddoc.views.names.map = function(doc) {
  if (doc.name) {
    emit(doc.name, null);
  }
};

module.exports = ddoc;

function(head, req) {
  var row;
  start({
    headers: {
      'Content-Type': 'text/html'
    }
  });
  send('<!DOCTYPE html><html lang=en>');
  send('<ol>');
  while(row = getRow()) {
    send('<li>' + row.key + '</li>');
  }
  send('</ol>');
}

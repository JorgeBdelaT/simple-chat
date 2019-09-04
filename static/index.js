$(document).ready(function() {
  var socket = io.connect('http://' + document.domain + ':' + location.port);
  // production
  // var socket = io.connect('https://' + document.domain + ':' + location.port);

  let currentPage;
  let totalMsgs;
  let totalPages;

  // event handler for new connections.
  socket.on('connect', function() {
    try {
      console.log('Succesful connection');
      socket.emit('succesful_connection');
      currentPage = 1;
    }
    catch (e) {
      console.log(e);
    }
  });

  // event handler for no messages
  socket.on('no_msgs', function(data) {
    totalMsgs = 0;
    updatePagination();
    $('#chat').append('<h3>The chat is empty</h3>');
  });

  // event handler for message buffer
  socket.on('buffer_ready', function(data) {
    totalMsgs = data.len;
    currentPage = data.current_page;
    updatePagination();
    $('#chat').empty();
    for (var i = 0; i < data.msgs.length; i++) {
      const msg = data.msgs[i];
      $('#chat').append('<div class="message-card"><b style="color: #000">'+msg.username+'</b> '+ '(' +msg.timestamp+ '): '+msg.content+'</div>');
    }
  });

  // form handler
  $('form#message').submit(function(event) {
    var now = new Date().toLocaleString('en-GB')

    const msg = {
      'username': $('#username').val(),
      'content': $('#content').val(),
      'timestamp': now
    };

    socket.emit('send_message', {'msg': msg});
    $( '#content' ).val( '' ).focus();
    return false;
  });

  // api call handler
  $('#getUsername').click(function(e){
    e.preventDefault()
    fetch('https://uinames.com/api/')
      .then(function(response) {
        return response.json();
      })
      .then(function(myJson) {
        const username = myJson.name + ' ' + myJson.surname;
        $('#username').empty();
        $('#username').val(username);
        $( '#content' ).val( '' ).focus();
      });
  });

  function updatePages() {
    if (totalMsgs % 5 === 0) {
      totalPages = Math.trunc(totalMsgs / 5);
    } else {
      totalPages = Math.trunc(totalMsgs / 5) + 1;
    }
  }

  function updatePagination() {
    updatePages();
    updateMsgCounter();
    $('#pagination').empty();
    for (var i = 1; i <= totalPages; i++) {
      if (i === currentPage) {
        $('#pagination').append('<li class="page-item active" id="page-'+i+'"><a class="page-link">'+i+'</a></li>');
      } else {
        $('#pagination').append('<li class="page-item" id="page-'+i+'"><a class="page-link">'+i+'</a></li>');
        $('#page-'+i).click({nextPage: i}, getMsgs);
      }
    }
  }

  function getMsgs(event) {
    nextPage = event.data.nextPage;
    socket.emit('msgs_buffer', {'current_page': currentPage, 'next': nextPage});
  }

  function updateMsgCounter() {
    $('#msgCounter').empty();
    $('#msgCounter').append('Total messages: ' + totalMsgs);
  }
});

$(document).ready(function() {
    if(!state.board_id) {
	showCreateNewBoard();
    }
    else {
	showBoard();
    }
});

showCreateNewBoard = function() {
    $('#header').show();
    $('#start_new_game').show();
    $('#board').hide();
}

showBoard = function() {
    $('#header').show();
    $('#start_new_game').hide();
    showPlayArea();
}

showPlayArea = function() {
    $('#board').show();
    var c = $("#myCanvas")[0];
    var cxt = c.getContext("2d");
    cxt.fillStyle = "#0";
    var i;
    var j;
    for(i=1; i<=10; i++) 
    {
    	for(j=1; j<=10; j++) {
    	    cxt.beginPath();
	    cxt.arc(i*60, j*60, 20, 0, Math.PI*2, true);
    	    cxt.closePath();
    	    cxt.fill();
    	}
    }
}

createNewBoard = function(dimension) {
    $.post('/new', {'dimension': dimension},
	   function (data) {
               state = JSON.parse(data);
	       showBoard()
	   });
}

openChannel = function() {
    var token = state.token;
    var channel = new goog.appengine.Channel(token);
    var handler = {
        'onopen': onOpened,
        'onmessage': onMessage,
        'onerror': function() {},
        'onclose': function() {}
    };
    var socket = channel.open(handler);
    socket.onopen = onOpened;
    socket.onmessage = onMessage;
};

onOpened = function() {
};

onMessage = function(m) {
};

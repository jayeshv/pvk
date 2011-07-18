$(document).ready(function() {
    if(!board.board_id) {
	showCreateNewBoard();
    }
    else {
	openChannel();
	showBoard();
    }
});

showCreateNewBoard = function() {
    $('#header').show();
    $('#start_game').show();
    $('#board').hide();
}

showBoard = function() {
    $('#header').show();
    $('#start_game').hide();
    showPlayArea();
}

showPlayArea = function() {
    $("#board").show();
    if(!board.other_player) {
	$("#players").show();
	// $("#your_move").hide();
	// $("#opponend_move").hide();
    }
    else {
	$("#players").hide();
    }
    if(board.myturn) {
	$("#players").hide();
	// $("#your_move").show();
	$("#won_game").hide();
	$("#lost_game").hide();
	// $("#opponend_move").hide();
	showClickableBoard();
    }
    else {
	$("#players").show();
	$("#your_move").hide();
	$("#won_game").hide();
	$("#lost_game").hide();
	$("#opponend_move").show();
	showReadonlyaBoard();
    }
}

showClickableBoard = function() {    
    var boardCanvas = $("#myCanvas")[0];
    //boardCanvas.disabled = false;  
    drawBoard();
}

showReadonlyaBoard = function() {
    var boardCanvas = $("#myCanvas")[0];
    //boardCanvas.disabled = true;    
    drawBoard();
}

drawBoard = function() {
    var board_width = $("#board").width();
    var boardCanvas = $("#myCanvas")[0];
    boardCanvas.setAttribute('width', board_width);
    boardCanvas.setAttribute('height', board_width);
    var cxt = boardCanvas.getContext("2d");
    cxt.fillStyle = "#000";
    var i;
    var j;
    var spacing = board_width * 0.0904;
    var radious = board_width * 0.0301;
    for(i=1; i<=board.dimension; i++) 
    {
    	for(j=1; j<=board.dimension; j++) {
    	    cxt.beginPath();
    	    cxt.arc(i*spacing, j*spacing, radious, radious, Math.PI*2, true);
    	    cxt.closePath();
    	    cxt.fill();
    	}
    }
    $("#myCanvas").click(function() {
	strike();
    });
}

strike = function() {
    if(board.myturn) {
	board.myturn = false;
	showPlayArea();
	$.post('/strike', {'board': board.board_id},
	       function (data) {
	       });
    }
}

createNewBoard = function(dimension) {
    board.dimension = dimension;
    $.post('/new', {'dimension': dimension},
	   function (data) {
	       alert(data);
               newBoard = JSON.parse(data);
	       board.token = newBoard.token;
	       board.board_id = newBoard.board_id;
	       openChannel();
	       showBoard();
	   });
}

playerJoined = function(user) {
    board.other_player = user.id;
    board.myturn = true;
    showPlayArea();
}

updateReceived = function(data) {
    board.myturn = true;
    showPlayArea();
}

openChannel = function() {
    var channel = new goog.appengine.Channel(board.token);
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

onMessage = function(msg) {
    message = JSON.parse(msg.data);
    if(message.type=="join") {
	playerJoined(message.user)
    }
    else if(message.type=='update') {
	updateReceived(message.update)
    }
    else if(message.type=='leave') {
    	alert("leave");
    }
};


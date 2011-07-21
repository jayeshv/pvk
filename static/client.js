$(document).ready(function() {
    board.me = JSON.parse(board.me)
    if(!board.board_id) {
	showCreateNewBoard();
    }
    else {
	board.other_player = JSON.parse(board.other_player)
	openChannel();
	$('#board_url').hide();
	board.i_am_player1 = false;
	board.myturn = false;
	$('#player1').addClass('player active');
	$('#player1').css('background-image', 'url("' + board.other_player.avatar + '")');
	$('#player1_name').html(board.other_player.name);

	$('#player2').css('background-image', 'url("' + board.me.avatar + '")');
	$('#player2_name').html(board.me.name);
	$('#player2').addClass('player player2');
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
    var radious = board_width * 0.0201;
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
	if(board.myturn) {
	    strike();
	}
    });
}

strike = function() {
    if(board.myturn) {
	board.myturn = false;
	showPlayArea();
	$.post('/strike', {'board': board.board_id},
	       function (data) {
		   board.myturn = false;
		   if(board.i_am_player1) {
		       $('#player1').removeClass('active');
		       $('#player2').addClass('active');  
		   }
		   else {
		       $('#player2').removeClass('active');
		       $('#player1').addClass('active');
		   }
	       });
    }
}

createNewBoard = function(dimension) {
    board.dimension = dimension;
    $.post('/new', {'dimension': dimension},
	   function (data) {
	       newBoard = JSON.parse(data);	       
	       $('#board_url').show();
	       $('#board_url').html("Share this url: <span class=\"url\">http://pvk.jayeshv.info?board=" + newBoard.board_id + "</span>");
	       board.token = newBoard.token;
	       board.i_am_player1 = true;
	       $('#player1').addClass("player");
	       $('#player1').css('background-image', 'url("' + board.me.avatar + '")');
	       $('#player1_name').html(board.me.name);
	       $('#player2').addClass("waiting");
	       board.board_id = newBoard.board_id;
	       openChannel();
	       showBoard();
	   });
}

playerJoined = function(user) {
    board.other_player = user;
    $('#board_url').hide();
    board.myturn = true;
    $('#player2').addClass("player player2");
    $('#player2').removeClass("waiting");
    $('#player2').css('background-image', 'url("' + board.other_player.avatar + '")');
    $('#player2').html(board.other_player.name);
    $('#player1').addClass("active");
    showPlayArea();
}

updateReceived = function(data) {
    board.myturn = true;
    if(board.i_am_player1) {
	$('#player2').removeClass('active');
	$('#player1').addClass('active');  
    }
    else {
	$('#player1').removeClass('active');
	$('#player2').addClass('active');
    }
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


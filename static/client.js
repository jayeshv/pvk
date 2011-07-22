var board_width;
var boardCanvas;
var cxt;
var spacing;
var radius;
var poojyams;

var activeColor = {
    'me': "#C40D0D",
    'other': "#0909C4"
}

$(document).ready(function() {
    setViewParams();
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

setViewParams = function() {
    board_width = $("#board").width();
    boardCanvas = $("#myCanvas")[0];
    cxt = boardCanvas.getContext("2d");
    spacing = board_width * 0.0904;
    radious = board_width * 0.0201;
}

poojyam = function(row, column) {
    this.row = row;
    this.column = column;
    this.draw = draw;
    this.isMyRegion = isMyRegion;
}

draw = function(active, user) {
    cxt.fillStyle = "#000";
    if(active) {
	if(active) {
	    cxt.fillStyle = activeColor[user];
	}
	else {
	    cxt.fillStyle = activeColor.player2;
	}
    }
    cxt.beginPath();
    cxt.arc(this.row*spacing, this.column*spacing, radious, radious, Math.PI*2, true);
    cxt.closePath();
    cxt.fill();
}

isMyRegion = function(x, y) {
    if(x >= this.row*spacing - radious && x <= this.row*spacing + radious) {
	if(y >= this.column*spacing - radious && y <= this.column*spacing + radious) {
	    return true;
	}
    }
    return false;
}

getPoojyam = function(row, column){
    return 
}

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
    drawBoard();
}

showReadonlyaBoard = function() {
    var boardCanvas = $("#myCanvas")[0];
    drawBoard();
}

drawBoard = function() {
    board_width = $("#board").width();
    boardCanvas.setAttribute('width', board_width);
    boardCanvas.setAttribute('height', board_width);
    var i;
    var j;
    poojyams = new Array(board.dimension);
    for(i=1; i<=board.dimension; i++) 
    {
	poojyams[i] = new Array(board.dimension);
    	for(j=1; j<=board.dimension; j++) {
	    var this_poojyam = new poojyam(i, j);
	    poojyams[i][j] = this_poojyam;
	    this_poojyam.draw(false, '');
    	}
    }
    var canvasElement = $("#myCanvas");
    canvasElement.click(function(e) {
	if(board.myturn) {
	    xpos = e.clientX - canvasElement.position().left;
	    ypos = e.clientY - canvasElement.position().top;
	    for(i=1; i<=board.dimension; i++) 
	    {
    		for(j=1; j<=board.dimension; j++) {
		    if(poojyams[i][j].isMyRegion(xpos, ypos)) {
			strike(i, j);
		    }
    		}
	    }
	}
    });
}

strike = function(i, j) {
    board.myturn = false;
    //showPlayArea();
    var poojyam = poojyams[i][j];
    poojyam.draw(true, 'me');
    $.post('/strike', {'board': board.board_id, 'xvalue': i, 'yvalue': j},
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
    //showPlayArea();
    updated_poojyam = poojyams[data[0]][data[1]]
    updated_poojyam.draw(true, 'other');
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


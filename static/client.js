var boardWidth;
var boardCanvas;
var cxt;
var spacing;
var radius;
var poojyams;
var activePoojyam;
var lines = new Array();
var totalPlayer1 = 0;
var totalPlayer2 = 0;
var totalLines = 0;

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
	$('#player1').addClass('active');
	$('#player1').css('background-image', 'url("' + board.other_player.avatar + '")');
	$('#player1_name').text(board.other_player.name);

	$('#player2').css('background-image', 'url("' + board.me.avatar + '")');
	$('#player2_name').text(board.me.name);
	showBoard();
    }
});

setViewParams = function() {
    boardWidth = $("#board").width();
    boardCanvas = $("#myCanvas")[0];
    cxt = boardCanvas.getContext("2d");
    spacing = boardWidth * 0.0904;
    radious = boardWidth * 0.0201;
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
    }
    else {
	$("#players").hide();
    }
    if(board.myturn) {
	$("#players").hide();
	$("#won_game").hide();
	$("#draw_game").hide();
	$("#lost_game").hide();
	drawBoard();
    }
    else {
	$("#players").show();
	$("#won_game").hide();
	$("#draw_game").hide();
	$("#lost_game").hide();
	$("#opponend_move").show();
	drawBoard();
    }
}

drawBoard = function() {
    boardWidth = $("#board").width();
    boardCanvas.setAttribute('width', boardWidth);
    boardCanvas.setAttribute('height', boardWidth);
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
    //showCloseButton();
    var canvasElement = $("#myCanvas");
    canvasElement.click(function(e) {
	if(board.myturn) {
	    xpos = e.clientX - canvasElement.position().left;
	    ypos = e.clientY - canvasElement.position().top;
	    for(i=1; i<=board.dimension; i++)
	    {
    		for(j=1; j<=board.dimension; j++) {
		    if(poojyams[i][j].isMyRegion(xpos, ypos)) {
			poojyamClicked(poojyams[i][j]);
			break;
		    }
    		}
	    }
	}
    });
}

showCloseButton = function() {
    $("close").show();
}

poojyamClicked = function(selected) {
    if(activePoojyam) {
	activePoojyam.draw(false, '');
	if(checkProximity(selected, activePoojyam)) {
	    var pointGain = drawLine(activePoojyam, selected);
	    sendStrike(activePoojyam, selected, pointGain);
	    activePoojyam = null;
	}
	else {
	    activePoojyam = selected;
	    selected.draw(true, 'me');
	}
    }
    else {
	activePoojyam = selected;
	selected.draw(true, 'me')
    }
}

checkProximity = function(selected, active) {
    var rowDiff = Math.abs(selected.row-active.row)
    var colDiff = Math.abs(selected.column-active.column)
    if((rowDiff == 0 && colDiff == 1) || (rowDiff == 1 && colDiff == 0)) {
	//check if line exists
	if(lines[[selected.row * board.dimension + selected.column, active.row * board.dimension + active.column]] || lines[[active.row * board.dimension + active.column, selected.row * board.dimension + selected.column]]) {
	    return false;
	}
	return true;
    }
    return false;
}

drawLine = function(from, to) {
    cxt.moveTo(from.row * spacing, from.column * spacing);
    cxt.lineTo(to.row * spacing, to.column * spacing);
    cxt.stroke();
    totalLines = totalLines + 1;
    lines[[from.row * board.dimension + from.column, to.row * board.dimension + to.column]] = true;
    var pointGain = checkForSquare(from, to);
    if(pointGain) {
	checkForFinish();
    }
    return pointGain;
}

checkForSquare = function(from, to) {
    var rowDiff = from.row-to.row;
    var colDiff = from.column-to.column;
    var pointGain = false;
    if(rowDiff == 0) {
	if(lineExists([from.row - 1, from.column], [to.row - 1, to.column]) && lineExists([from.row, from.column], [from.row - 1, from.column]) && lineExists([to.row - 1, to.column], [to.row, to.column])) {
	    //left square
	    if(colDiff == 1) {
		var completedTop = [to.row - 1, to.column];
	    }
	    else {
		var completedTop = [from.row - 1, from.column];
	    }
	    claimSquare(completedTop);
	    pointGain = true;
	}
	if(lineExists([from.row + 1, from.column], [to.row + 1, to.column]) && lineExists([from.row, from.column], [from.row + 1, from.column]) && lineExists([to.row + 1, to.column], [to.row, to.column])) {
	    //right square
	    if(colDiff == 1) {
		var completedTop = [to.row, to.column];
	    }
	    else {
		var completedTop = [from.row, from.column];
	    }
	    claimSquare(completedTop);
	    pointGain = true;
	}
    }
    else {
	if(lineExists([from.row, from.column - 1], [to.row, to.column - 1]) && lineExists([from.row, from.column], [from.row, from.column - 1]) && lineExists([to.row, to.column - 1], [to.row, to.column])) {
	    //top square;
	    if(rowDiff == 1) {
		var completedTop = [to.row, to.column - 1];
	    }
	    else {
		var completedTop = [from.row, from.column - 1];
	    }
	    claimSquare(completedTop);
	    pointGain = true;
	}
	if(lineExists([from.row, from.column + 1], [to.row, to.column + 1]) && lineExists([from.row, from.column], [from.row, from.column + 1]) && lineExists([to.row, to.column + 1], [to.row, to.column])) {
	    //bottom square
	    if(rowDiff == 1) {
		var completedTop = [to.row, to.column];
	    }
	    else {
		var completedTop = [from.row, from.column];
	    }
	    claimSquare(completedTop);
	    pointGain = true;
	}
    }
    return pointGain;
}

claimSquare = function(topLeft) {
    if(board.myturn) {
	if(board.i_am_player1) {
	    //player1
	    totalPlayer1 = totalPlayer1 + 1;
	    $("#player1_points").text(totalPlayer1);
	    drawPlayerInside(board.me.avatar_small, topLeft);
	}
	else {
	    //player2
	    totalPlayer2 = totalPlayer2 + 1;
	    $("#player2_points").text(totalPlayer2);
	    drawPlayerInside(board.me.avatar_small, topLeft);
	}
    }
    else {
	if(board.i_am_player1) {
	    //player2
	    totalPlayer2 = totalPlayer2 + 1;
	    $("#player2_points").text(totalPlayer2);
	    drawPlayerInside(board.other_player.avatar_small, topLeft);
	}
	else {
	    //player1
	    totalPlayer1 = totalPlayer1 + 1;
	    $("#player1_points").text(totalPlayer1);
	    drawPlayerInside(board.other_player.avatar_small, topLeft);
	}
    }
}

drawPlayerInside = function(imageUrl, topLeft) {
    var img = new Image();
    img.src = imageUrl;
    img.onload = function(){
	cxt.drawImage(img, topLeft[0] * spacing + radious, topLeft[1] * spacing + radious);
    }
}

lineExists = function(from, to) {
    var fromVal = board.dimension * from[0] + from[1];
    var toVal = board.dimension * to[0] + to[1];
    if(lines[[fromVal, toVal]] || lines[[toVal, fromVal]]) {
    	return true;
    }
    return false;
}

checkForFinish = function() {
    if(totalLines == (2 * board.dimension * (board.dimension - 1))) {
	if(totalPlayer1 > totalPlayer2) {
	    if(board.i_am_player1) {
		//alert('you won');
		$("#won_game").show();
	    }
	    else {
		$("#lost_game").show();
	    }
	}
	else if(totalPlayer2 > totalPlayer1) {
	    if(board.i_am_player1) {
		$("#lost_game").show();
	    }
	    else {
		$("#won_game").show();
	    }
	}
	else if(totalPlayer2 == totalPlayer1) {
	    $("#draw_game").show();
	}
    }
}

sendStrike = function(from, to, pointGain) {
    if(!pointGain) {
	board.myturn = false;
	if(board.i_am_player1) {
	    $('#player1').removeClass('active');
	    $('#player2').addClass('active');
	}
	else {
	    $('#player2').removeClass('active');
	    $('#player1').addClass('active');
	}
    }
    var postData = JSON.stringify({'board': board.board_id, 'line_from': [from.row, from.column], 'line_to': [to.row, to.column]}, '');
    $.post('/strike', {'update': postData},
	   function (data) {
	       //board.myturn = false;
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
	       $('#player1_name').text(board.me.name);
	       $('#player2').addClass("waiting");
	       board.board_id = newBoard.board_id;
	       openChannel();
	       showBoard();
	   });
}

playerJoined = function(user) {
    board.other_player = user;
    setTimeout("setJoinedUser()", 4000);   //a hack
}

setJoinedUser = function() {
    $('#board_url').hide();
    $('#player2').removeClass("waiting");
    $('#player2').css('background-image', 'url("' + board.other_player.avatar + '")');
    $('#player2_name').text(board.other_player.name);
    board.myturn = true;
    if(board.i_am_player1) {
	$('#player1').addClass("active");
    }
    else {
	$('#player2').addClass("active");
    }
}

updateReceived = function(data) {
    from = poojyams[data[0][0]][data[0][1]];
    to = poojyams[data[1][0]][data[1][1]];
    var pointGain = drawLine(from, to);
    if(!pointGain) {
	if(board.i_am_player1) {
	    $('#player2').removeClass('active');
	    $('#player1').addClass('active');
	}
	else {
	    $('#player1').removeClass('active');
	    $('#player2').addClass('active');
	}
	board.myturn = true;
    }
}

openChannel = function() {
    var channel = new goog.appengine.Channel(board.token);
    var handler = {
        'onopen': onOpened,
        'onmessage': onMessage,
        'onerror': function() {
	    alert("The connection between you and other player seems to be broken...");
	},
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
	playerJoined(message.user);
    }
    else if(message.type=='update') {
	updateReceived(message.update);
    }
    else if(message.type=='leave') {
    	alert("leave");
    }
};

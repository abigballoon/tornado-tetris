var Screen = {
	/*
	*/
	gameScreen : new Array(),
	Screen_id : '',
	white : '',
	w : 0,
	h : 0,

	editCanvas : function(){},

	paintScreen : function (arg) {
		// body...
		Screen.editCanvas();
		$("#" + Screen.Screen_id).html(""); //清空原来的screen
		var output_line = '';
		var temp;
		for(var y = 0; y < Screen.h; y++){
			output_line = ''
			for(var x = 0; x < Screen.w; x++){
				output_line += Screen.gameScreen[y][x];
			}
			temp = $("#" + Screen.Screen_id).html();
			$("#" + Screen.Screen_id).html(temp+"<div class=\"pixel\">" + output_line + "</div>");
		}
		Screen.erase();
	},

	initializeScreen : function (size, default_char, Screen_id){
		var xindex = 0;
		var yindex = 0;
		var x = size[0];
		var y = size[1];
		for (yindex = 0; yindex < y; yindex++){
			Screen.gameScreen[yindex] = new Array();
			for (xindex = 0; xindex < x; xindex++){
				Screen.gameScreen[yindex][xindex] = default_char;
			}
		}
		Screen.w = x;
		Screen.h = y;
		Screen.Screen_id = Screen_id;
		Screen.white = default_char;
	},

	erase : function(){
		for(var y = 0; y < Screen.h; y++){
			for(var x = 0; x < Screen.w; x++){
				Screen.gameScreen[y][x] = Screen.white;
			}
		}
	},

	putRect : function (rect, with_char){
		var ltx = rect[0][0];
		var lty = rect[0][1];
		var rbx = rect[1][0];
		var rby = rect[1][1];
		for(var y = lty; y < rby; y++){
			output_line = '';
			for(var x = ltx; x < rbx; x++){
				if((x < this.w && x >= 0)&&(y<this.h&&y>=0)){
					Screen.gameScreen[y][x] = with_char;
				}
			}
		}		
	},

	putPixel : function (x, y, with_char){
		Screen.gameScreen[y][x] = with_char;
	},
};


var Block = {
	//这个类只用来储存位置信息， 把位置转化到Screen的是paintBlock
	settled_block : new Array(), //储存已经定下来的方块, 0代表没有方块
	floating_block_shape : [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]], //表示还在移动的方块的形状
	floating_block_pos : [0,0], //还在移动的方块的左上坐标
	block_width : 0, //方块的宽度
	direction : [1,1,1,1], // 分别表示 上右下左 方向能不能移动。1表示可以。
	w : 0,
	h : 0,

	init : function(screenw, screenh, bw){
		Block.block_width = bw
		for(var y = 0; y < screenh/bw; y++){
			Block.settled_block[y] = new Array();
			for(var x = 0; x < screenw/bw; x++){
				Block.settled_block[y][x] = 0;
			}
		}
		Block.w = screenw/bw;
		Block.h = screenh/bw;

		block_shape.nextBlock(5); // block_shape应该在外面再随机一个初始值。
		this.floating_block_shape = block_shape.nextShape();
		this.floating_block_pos = [2*this.block_width, -3*this.block_width];
	},

	getSettle : function(x,y){
		if(x<0||y<0||x>=this.w||y>=this.h){
			return 0;
		}else{
			return this.settled_block[y][x];
		}
	},

	avalibleDirection : function(){
		// 记下shape4个边界值
		var t = -1;
		var r = -1;
		var b = -1;
		var l = -1;
		for(var y = 0; y < 4; y++){
			for(var x = 0; x < 4; x++){
				if(Block.floating_block_shape[y][x] == 1){
					if(t == -1){
						t = y; //从上到下，第一个肯定是最上的，b同理
					}
					if(l == -1 || l > x){
						l = x;
					}
					if(r == -1 || r < x){
						r = x;
					}
					b = y;
				}
			}
		}
		// 加上偏移量才是实际位置。
		t += Block.floating_block_pos[1]/Block.block_width; //***************为什么要除width
		b += Block.floating_block_pos[1]/Block.block_width;
		l += Block.floating_block_pos[0]/Block.block_width;
		r += Block.floating_block_pos[0]/Block.block_width;
		// 划出方块四周的区域，如果有settled的方块那那个方向就不能前进了

		// 这一部分作用其实只是初始化四个方向的数组长度。
		var topline = new Array();
		var leftline = new Array();
		var rightline = new Array();
		var bottomline = new Array();
		var index = 0;
		for(var x = l; index < r-l+1; x++){
			topline[index] = new Array(x, t-1);
			bottomline[index] = new Array(x, b+1);
			index ++;
		}

		index = 0;
		for(var y = t; index < b-t+1; y++){
			leftline[index] = new Array(l-1,y);
			rightline[index] = new Array(r+1,y);
			index ++;
		}
		// 这一部分作用其实只是初始化四个方向的数组长度。

		//************** 这一大片是用来找边界的 **************
		index = 0;
		for(var x = 0; x < 4; x++){
			for(var y = 0; y < 4; y++){
				if(this.floating_block_shape[y][x] == 1){
					topline[index][0] = x + Block.floating_block_pos[0]/Block.block_width;
					topline[index][1] = y + Block.floating_block_pos[1]/Block.block_width - 1;
					index++;
					break;
				}
			}
		}

		index = 0;
		for(var y = 0; y < 4; y++){
			for(var x = 0; x < 4; x++){
				if(this.floating_block_shape[y][x] == 1){
					leftline[index][0] = x + Block.floating_block_pos[0]/Block.block_width - 1;
					leftline[index][1] = y + Block.floating_block_pos[1]/Block.block_width;
					index++;
					break;
				}
			}
		}

		index = 0;
		for(var x = 0; x < 4; x++){
			for(var y = 3; y >= 0; y--){
				if(this.floating_block_shape[y][x] == 1){
					bottomline[index][0] = x + Block.floating_block_pos[0]/Block.block_width;
					bottomline[index][1] = y + Block.floating_block_pos[1]/Block.block_width + 1;
					index++;
					break;
				}
			}
		}

		index = 0;
		for(var y = 0; y < 4; y++){
			for(var x = 3; x >= 0; x--){
				if(this.floating_block_shape[y][x] == 1){
					rightline[index][0] = x + Block.floating_block_pos[0]/Block.block_width + 1;
					rightline[index][1] = y + Block.floating_block_pos[1]/Block.block_width;
					index++;
					break;
				}
			}
		}
		//************** 这一大片是用来找边界的 **************
		Block.direction = [1,1,1,1];
		// 用t,r,b,l判定有没有超出边界
		if(t == 0){Block.direction[0] = 0;}
		if(l == 0){Block.direction[3] = 0;}
		if(r == Block.w - 1){Block.direction[1] = 0;}
		if(b == Block.h - 1){Block.direction[2] = 0;}

		// 判定四周有没有方块
		for (var i = topline.length - 1; i >= 0; i--) {
			x = topline[i][0];
			y = topline[i][1];
			if(Block.direction[0]){
				if(this.getSettle(x, y)){
					Block.direction[0] = 0;
				}
			}
			x = bottomline[i][0];
			y = bottomline[i][1];
			if(Block.direction[2]){
				if(this.getSettle(x, y)){
					Block.direction[2] = 0;
				}
			}
		};

		for (var i = leftline.length - 1; i >= 0; i--) {
			x = leftline[i][0];
			y = leftline[i][1];
			if(Block.direction[3]){
				if(this.getSettle(x, y)){
					Block.direction[3] = 0;
				}
			}
			x = rightline[i][0];
			y = rightline[i][1];
			if(Block.direction[1]){
				if(this.getSettle(x, y)){
					Block.direction[1] = 0;
				}
			}
		};
	},

	move : function(vector){
		// vector 是一个二维向量， 指向要移动到的方向，因为不能对角运动，向量的模=1
		this.floating_block_pos[0] += vector[0]*this.block_width;
		this.floating_block_pos[1] += vector[1]*this.block_width;
	},

	moveLeft : function(){
		this.avalibleDirection();
		if(this.direction[3] == 1){
			this.move([-1,0]);
		}
	},

	moveRight : function(){
		this.avalibleDirection();
		if(this.direction[1] == 1){
			this.move([1,0]);
		}
	},

	moveUp : function(){
		this.avalibleDirection();
		if(this.direction[0] == 1){
			this.move([0,-1]);
		}
	},

	moveDown : function(){
		this.avalibleDirection();
		if(this.direction[2] == 1){
			this.move([0,1]);
		}else{
			for(var y = 0; y < 4; y++){
				for(var x = 0; x < 4; x++){
					var x_offset = this.floating_block_pos[0]/this.block_width;
					var y_offset = this.floating_block_pos[1]/this.block_width;
					if(this.floating_block_shape[y][x]==1){
						this.settled_block[y+y_offset][x+x_offset] = 1;
					}
				}
			}
			this.clearline();
			this.floating_block_pos = [2*this.block_width,-3*this.block_width];
			block_shape.nextBlock(Math.floor((Math.random()*7)+0));
			this.floating_block_shape = block_shape.nextShape();
		}
	},

	turn : function(){
		this.floating_block_shape = block_shape.nextShape();
	},

	settle : function(){
		// 有可能是在半空中叫的函数也可能真的到底了，所以先move到底。
		while(this.direction[2] == 1){
			this.moveDown();
		}
		this.direction = [1,1,1,1];
	},

	clearline : function(){
		var filled = true;
		for(var y = this.h-1; y >= 0; y--){
			filled = true;
			for(var x = 0; x < this.w; x++){
				if(this.settled_block[y][x] == 0){
					filled = false;
				}
			}
			if(filled && y == 0){
				for(var x2 = 0; x < this.w; x++){
					this.settled_block[y][x2] = 0;
				}
			}else if(filled){ // 先把0行以下的往下降，然后再单独清零第零行
				for(var y2 = y; y2 > 0; y2--){
					for(var x2 = 0; x2 < this.w; x2++){
						this.settled_block[y2][x2] = this.settled_block[y2-1][x2];
					}
				}
				for(var x2 = 0; x < this.w; x++){
					this.settled_block[0][x2] = 0;
				}
				y += 1;  //这一行要重新检查一遍。
			}
		}
	},
}

var paintBlock = {
	block : null,
	myscreen : null,

	init : function(b, s){
		paintBlock.block = b;
		paintBlock.myscreen = s;
	},

	paintSettled : function(){
		for(var y = 0; y < paintBlock.block.h; y++){
			for(var x = 0; x < paintBlock.block.w; x++){
				if(paintBlock.block.settled_block[y][x] == 1){
					paintBlock.myscreen.putRect([[x*paintBlock.block.block_width, y*paintBlock.block.block_width], 
						[(x+1)*paintBlock.block.block_width, (y+1)*paintBlock.block.block_width]], "+")

				}
			}
		}
	},

	paintFloat : function(){
		for(var y = 0; y < 4; y++){
			for(var x = 0; x < 4; x++){
				if(paintBlock.block.floating_block_shape[y][x] == 1){ // !!**********要判定是不是在边界里**********!!
					lt = [x*paintBlock.block.block_width + paintBlock.block.floating_block_pos[0], y*paintBlock.block.block_width + paintBlock.block.floating_block_pos[1]];
					rb = [(x+1)*paintBlock.block.block_width + paintBlock.block.floating_block_pos[0], (y+1)*paintBlock.block.block_width + paintBlock.block.floating_block_pos[1]];
					paintBlock.myscreen.putRect([lt, rb], "+")
				}
			}
		}
	},

	paint : function(){
		paintBlock.paintSettled();
		paintBlock.paintFloat();
		paintBlock.myscreen.paintScreen("paintBlock called.");
	}
}

//***************************** websocket *****************************

function newCommand(command) {
    var s = {command:"move",val:command,cookies:"",}
    connecter.socket.send(JSON.stringify(s));
}

jQuery.fn.formToDict = function() {
    var fields = this.serializeArray();
    var json = {}
    for (var i = 0; i < fields.length; i++) {
        json[fields[i].name] = fields[i].value;
    }
    if (json.next) delete json.next;
    return json;
};

var connecter = {
    socket: null,

    start: function() {
        var url = "ws://" + location.host + "/tetrissocket";
        connecter.socket = new WebSocket(url);
        connecter.socket.onmessage = function(event) {
        	var ms = new Date().getTime();
            var response = JSON.parse(event.data);
            if (response.command == "role" && response.val == "R" ){
                connecter.socket.send(JSON.stringify({command:"role",val:"P",cookies:getCookie("gameID"),}));
                console.log("cookies: "+getCookie("gameID"))
            }else if(response.command == "move"){
                switch(response.val){
                	case "L":
                		Block.moveLeft();
                		break;
                	case "R":
                		Block.moveRight();
                		break;
                	case "D":
                		Block.moveDown();
                		break;
                	case "I":
                		Block.turn();
                		break;
                	case "U":
                		Block.settle();
                		break;
                }
                paintBlock.paint();
            }
            ms = new Date().getTime() - ms;
            console.log("execute command used: "+ms);
        }
    },
};

//***************************** websocket *****************************

function autoMove(){
	Block.moveDown();
	paintBlock.paint();
}

$(document).ready(function(){
	connecter.start();
	var size = new Array(50,100);
	Screen.initializeScreen(size, "#", "gamepanel");
	Screen.paintScreen();
	Block.init(50,100,5);
	paintBlock.init(Block, Screen);
	paintBlock.paint();
  	$(document).keyup(function(e) {
    	switch (e.keyCode){
    		case 32:
    			Block.turn();
    			break;
    		case 37:
    		  	Block.moveLeft();
    		  	break;
    		case 38:
    			Block.moveUp();
    			break;
    		case 39:
    			Block.moveRight();
    			break;
    		case 40:
    			Block.moveDown();
    			break;
    		case 90:
    			Block.settle();
    			break;
    }
    paintBlock.paint();
  });
  setInterval("autoMove()",0.6*1000);
});

/*! 一叶孤舟 | qq:28701884 | 欢迎指教 */

var play = play||{};

play.init = function (depth, map){
	var map = map || com.initMap;
	var depth = depth || 3
	play.my				=	1;				//玩家方
	play.nowMap			=	map;
	play.map 			=	com.arr2Clone ( map );		//初始化棋盘
	play.nowManKey		=	false;			//现在要操作的棋子
	play.pace 			=	[];				//记录每一步
	play.isPlay 		=	true ;			//是否能走棋

	play.bylaw 			= 	com.bylaw;
	play.show 			= 	com.show;
	play.showPane 		= 	com.showPane;
	play.isOffensive	=	true;			//是否先手
	play.depth			=	depth;			//搜索深度
	play.isFoul			=	false;			//是否犯规长将
	com.pane.isShow		=	 false;			//隐藏方块

	// 棋谱学习模式相关
	play.isManualMode	=	false;			//是否为棋谱学习模式
	play.manualMoves		=	[];				//棋谱着法数据
	play.manualStepIndex	=	0;				//当前棋谱步数

	//清除所有旗子
	play.mans 			=	com.mans	= {};
	
	//这么搞有点2，以后说不定出啥问题，先放着记着以后改
	com.childList.length = 3
	/*
	l(com.childList)
	for (var i=0; i<com.childList.length ; i++){
		var o = com.childList[i];
		if (o.pater) com.childList.splice(i, 1)
	}
	l(com.childList)
	*/
	com.createMans( map )		//生成棋子
	com.bg.show();
	
	//初始化棋子
	for (var i=0; i<play.map.length; i++){
		for (var n=0; n<play.map[i].length; n++){
			var key = play.map[i][n];
			if (key){
				com.mans[key].x=n;
				com.mans[key].y=i;
				com.mans[key].isShow = true;
			}
		}
	}
	play.show();
	
	//绑定点击事件
	com.canvas.addEventListener("click",play.clickCanvas)
	//clearInterval(play.timer);
	//com.get("autoPlay").addEventListener("click", function(e) {
		//clearInterval(play.timer);
		//play.timer = setInterval("play.AIPlay()",1000);
	//	play.AIPlay()
	//})
	/*
	com.get("offensivePlay").addEventListener("click", function(e) {
		play.isOffensive=true;
		play.isPlay=true ;
		com.get("chessRight").style.display = "none";
		play.init();
	})
	
	com.get("defensivePlay").addEventListener("click", function(e) {
		play.isOffensive=false;
		play.isPlay=true ;
		com.get("chessRight").style.display = "none";
		play.init();
	})
	*/
	
	
	
	/*
	var initTime = new Date().getTime();
	for (var i=0; i<=100000; i++){
		
		var h=""
		var h=play.map.join();
		//for (var n in play.mans){
		//	if (play.mans[n].show) h+=play.mans[n].key+play.mans[n].x+play.mans[n].y
		//}
	}
	var nowTime= new Date().getTime();
	z([h,nowTime-initTime])
	*/
	
}



//悔棋
play.regret = function (){
	var map  = com.arr2Clone(com.initMap);
	//初始化所有棋子
	for (var i=0; i<map.length; i++){
		for (var n=0; n<map[i].length; n++){
			var key = map[i][n];
			if (key){
				com.mans[key].x=n;
				com.mans[key].y=i;
				com.mans[key].isShow = true;
			}
		}
	}
	var pace= play.pace;
	pace.pop();
	pace.pop();
	
	for (var i=0; i<pace.length; i++){
		var p= pace[i].split("")
		var x = parseInt(p[0], 10);
		var y = parseInt(p[1], 10);
		var newX = parseInt(p[2], 10);
		var newY = parseInt(p[3], 10);
		var key=map[y][x];
		//try{
	 
		var cMan=map[newY][newX];
		if (cMan) com.mans[map[newY][newX]].isShow = false;
		com.mans[key].x = newX;
		com.mans[key].y = newY;
		map[newY][newX] = key;
		delete map[y][x];
		if (i==pace.length-1){
			com.showPane(newX ,newY,x,y)
		}
		//} catch (e){
		//	com.show()
		//	z([key,p,pace,map])
		
		//	}
	}
	play.map = map;
	play.my=1;
	play.isPlay=true;
	com.show();
}



//点击棋盘事件
play.clickCanvas = function (e){
	if (!play.isPlay) return false;
	var key = play.getClickMan(e);
	var point = play.getClickPoint(e);
	
	var x = point.x;
	var y = point.y;
	
	if (key){
		play.clickMan(key,x,y);
	}else {
		play.clickPoint(x,y);
	}
	play.isFoul = play.checkFoul();//检测是不是长将
}

//点击棋子，两种情况，选中或者吃子
play.clickMan = function (key,x,y){
	var man = com.mans[key];
	//吃子
	if (play.nowManKey&&play.nowManKey != key && man.my != com.mans[play.nowManKey ].my){
		//man为被吃掉的棋子
		if (play.indexOfPs(com.mans[play.nowManKey].ps,[x,y])){
			man.isShow = false;
			var pace=com.mans[play.nowManKey].x+""+com.mans[play.nowManKey].y
			//z(bill.createMove(play.map,man.x,man.y,x,y))
			delete play.map[com.mans[play.nowManKey].y][com.mans[play.nowManKey].x];
			play.map[y][x] = play.nowManKey;
			com.showPane(com.mans[play.nowManKey].x ,com.mans[play.nowManKey].y,x,y)
			com.mans[play.nowManKey].x = x;
			com.mans[play.nowManKey].y = y;
			com.mans[play.nowManKey].alpha = 1
			
			play.pace.push(pace+x+y);
			play.nowManKey = false;
			com.pane.isShow = false;
			com.dot.dots = [];
			com.show()
			com.get("clickAudio").play();
			setTimeout(play.AIPlay,500);
			if (key == "j0") play.showWin (-1);
			if (key == "J0") play.showWin (1);
		}
	// 选中棋子
	}else{
		if (man.my===1){
			if (com.mans[play.nowManKey]) com.mans[play.nowManKey].alpha = 1 ;
			man.alpha = 0.8;
			com.pane.isShow = false;
			play.nowManKey = key;
			com.mans[key].ps = com.mans[key].bl(); //获得所有能着点
			com.dot.dots = com.mans[key].ps
			com.show();
			//com.get("selectAudio").start(0);
			com.get("selectAudio").play();
		}
	}
}

//点击着点
play.clickPoint = function (x,y){
	var key=play.nowManKey;
	var man=com.mans[key];
	if (play.nowManKey){
		// 检查是否是棋谱学习模式
		if (play.isManualMode && play.my === 1) {
			var currentMove = play.manualMoves[play.manualStepIndex];
			if (currentMove && currentMove.from && currentMove.to) {
				// 检查移动是否符合棋谱（使用棋子的当前位置）
				var actualFromX = man.x;
				var actualFromY = man.y;
				var targetX = x;
				var targetY = y;

				console.log('=== 棋谱验证 ===');
				console.log('当前步数索引:', play.manualStepIndex);
				console.log('棋谱步骤:', currentMove.notation);
				console.log('期望从:', currentMove.from.x, ',', currentMove.from.y);
				console.log('期望到:', currentMove.to.x, ',', currentMove.to.y);
				console.log('实际从:', actualFromX, ',', actualFromY);
				console.log('实际到:', targetX, ',', targetY);
				console.log('棋子key:', key, '棋子类型:', man.pater);

				// 验证移动
				if (actualFromX === currentMove.from.x && actualFromY === currentMove.from.y &&
					targetX === currentMove.to.x && targetY === currentMove.to.y) {
					console.log('验证通过！');
					// 符合棋谱，继续执行
				} else {
					console.log('验证失败！');
					var errorMsg = '走错了！请按照棋谱提示下棋。\n\n';
					errorMsg += '期望：' + currentMove.notation + '\n';
					errorMsg += '期望从 (' + currentMove.from.x + ',' + currentMove.from.y + ') 到 (' + currentMove.to.x + ',' + currentMove.to.y + ')\n';
					errorMsg += '实际从 (' + actualFromX + ',' + actualFromY + ') 到 (' + targetX + ',' + targetY + ')';
					alert(errorMsg);
					return;
				}
			}
		}

		if (play.indexOfPs(com.mans[key].ps,[x,y])){
			var pace=man.x+""+man.y
			//z(bill.createMove(play.map,man.x,man.y,x,y))
			delete play.map[man.y][man.x];
			play.map[y][x] = key;
			com.showPane(man.x ,man.y,x,y)
			man.x = x;
			man.y = y;
			man.alpha = 1;
			play.pace.push(pace+x+y);
			play.nowManKey = false;
			com.dot.dots = [];
			com.show();
			com.get("clickAudio").play();

			// 棋谱学习模式特殊处理
			if (play.isManualMode) {
				play.handleManualMove();
			} else {
				setTimeout(play.AIPlay,500);
			}
		}else{
			//alert("不能这么走哦！")
		}
	}

}

//Ai自动走棋
play.AIPlay = function (){
	//return
	play.my = -1 ;
	var pace=AI.init(play.pace.join(""))
	if (!pace) {
		play.showWin (1);
		return ;
	}
	play.pace.push(pace.join(""));
	var key=play.map[pace[1]][pace[0]]
		play.nowManKey = key;
	
	var key=play.map[pace[3]][pace[2]];
	if (key){
		play.AIclickMan(key,pace[2],pace[3]);
	}else {
		play.AIclickPoint(pace[2],pace[3]);
	}
	com.get("clickAudio").play();
	
	
}

//检查是否长将
play.checkFoul = function(){
	var p=play.pace;
	var len=parseInt(p.length,10);
	if (len>11&&p[len-1] == p[len-5] &&p[len-5] == p[len-9]){
		return p[len-4].split("");
	}
	return false;
}



play.AIclickMan = function (key,x,y){
	var man = com.mans[key];
	//吃子
	man.isShow = false;
	delete play.map[com.mans[play.nowManKey].y][com.mans[play.nowManKey].x];
	play.map[y][x] = play.nowManKey;
	play.showPane(com.mans[play.nowManKey].x ,com.mans[play.nowManKey].y,x,y)
	
	com.mans[play.nowManKey].x = x;
	com.mans[play.nowManKey].y = y;
	play.nowManKey = false;
	
	com.show()
	if (key == "j0") play.showWin (-1);
	if (key == "J0") play.showWin (1);
}

play.AIclickPoint = function (x,y){
	var key=play.nowManKey;
	var man=com.mans[key];
	if (play.nowManKey){
		delete play.map[com.mans[play.nowManKey].y][com.mans[play.nowManKey].x];
		play.map[y][x] = key;
		
		com.showPane(man.x,man.y,x,y)
	
		man.x = x;
		man.y = y;
		play.nowManKey = false;
		
	}
	com.show();
}


play.indexOfPs = function (ps,xy){
	for (var i=0; i<ps.length; i++){
		if (ps[i][0]==xy[0]&&ps[i][1]==xy[1]) return true;
	}
	return false;
	
}

//获得点击的着点
play.getClickPoint = function (e){
	var domXY = com.getDomXY(com.canvas);
	var x=Math.round((e.pageX-domXY.x-com.pointStartX-20)/com.spaceX)
	var y=Math.round((e.pageY-domXY.y-com.pointStartY-20)/com.spaceY)
	return {"x":x,"y":y}
}

//获得棋子
play.getClickMan = function (e){
	var clickXY=play.getClickPoint(e);
	var x=clickXY.x;
	var y=clickXY.y;
	if (x < 0 || x>8 || y < 0 || y > 9) return false;
	return (play.map[y][x] && play.map[y][x]!="0") ? play.map[y][x] : false;
}

play.showWin = function (my){
	play.isPlay = false;
	if (my===1){
		alert("恭喜你，你赢了！");
	}else{
		alert("很遗憾，你输了！");
	}
}

// 处理棋谱学习模式下的移动
play.handleManualMove = function() {
	if (!play.isManualMode) return;

	// 红方走完了，更新步数索引
	play.manualStepIndex++;

	// 检查是否还有黑方的棋谱步骤
	if (play.manualStepIndex >= play.manualMoves.length) {
		alert('恭喜！你已经学会了这个棋谱！');
		play.isManualMode = false;
		return;
	}

	// 黑方自动走出下一步
	setTimeout(function() {
		var blackMove = play.manualMoves[play.manualStepIndex];
		if (blackMove && blackMove.from && blackMove.to) {
			play.manualMoveByCoords(blackMove.from, blackMove.to);
			play.manualStepIndex++;

			// 更新提示
			if (com.enhanced && com.enhanced.showNextMoveHint) {
				com.enhanced.showNextMoveHint();
			}

			// 检查是否完成
			if (play.manualStepIndex >= play.manualMoves.length) {
				setTimeout(function() {
					alert('恭喜！你已经学会了这个棋谱！');
					play.isManualMode = false;
				}, 300);
			}
		}
	}, 600);
};

// 根据坐标手动执行移动（用于棋谱模式）
play.manualMoveByCoords = function(from, to) {
	var fromX = from.x;
	var fromY = from.y;
	var toX = to.x;
	var toY = to.y;

	// 找到起始位置的棋子
	var key = play.map[fromY][fromX];
	if (!key) return;

	// 执行移动
	var man = com.mans[key];

	// 检查目标位置是否有棋子
	var targetKey = play.map[toY][toX];
	if (targetKey) {
		// 吃子
		com.mans[targetKey].isShow = false;
	}

	// 更新棋盘
	delete play.map[fromY][fromX];
	play.map[toY][toX] = key;

	// 更新棋子位置
	man.x = toX;
	man.y = toY;

	// 记录着法
	var pace = fromX + "" + fromY;
	play.pace.push(pace + toX + toY);

	// 显示移动效果
	com.showPane(fromX, fromY, toX, toY);
	com.show();
	com.get("clickAudio").play();

	// 检查是否结束
	if (targetKey === "j0") {
		setTimeout(function() { play.showWin(1); }, 300);
	}
	if (targetKey === "J0") {
		setTimeout(function() { play.showWin(-1); }, 300);
	}
};



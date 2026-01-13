/**
 * 经典棋谱数据
 * 包含开局定式、中局技巧和名局赏析
 * 坐标说明：y=0是黑方底线，y=9是红方底线
 */

com.manuals = {
	opening: [
		{
			id: "open_001",
			name: "中炮过河车对屏风马",
			type: "opening",
			redPlayer: "红方",
			blackPlayer: "黑方",
			description: "经典开局，中炮过河车对屏风马",
			moves: [
				// 红方：炮二平五（中炮）
				{ from: {x: 1, y: 7}, to: {x: 4, y: 7}, notation: "炮二平五" },
				// 黑方：马８进７
				{ from: {x: 7, y: 0}, to: {x: 6, y: 2}, notation: "马８进７" },
				// 红方：马二进三
				{ from: {x: 1, y: 9}, to: {x: 2, y: 7}, notation: "马二进三" },
				// 黑方：卒７进１
				{ from: {x: 3, y: 3}, to: {x: 3, y: 4}, notation: "卒７进１" },
				// 红方：车一平二
				{ from: {x: 0, y: 9}, to: {x: 1, y: 9}, notation: "车一平二" },
				// 黑方：马２进３
				{ from: {x: 1, y: 0}, to: {x: 2, y: 2}, notation: "马２进３" },
				// 红方：车二进六
				{ from: {x: 1, y: 9}, to: {x: 1, y: 4}, notation: "车二进六" },
				// 黑方：马７进６
				{ from: {x: 6, y: 2}, to: {x: 5, y: 4}, notation: "马７进６" }
			],
			notes: "中炮过河车对屏风马是象棋中最常见的开局之一"
		},
		{
			id: "open_002",
			name: "飞相局对中炮",
			type: "opening",
			redPlayer: "红方",
			blackPlayer: "黑方",
			description: "稳健的飞相局开局",
			moves: [
				// 红方：相三进五
				{ from: {x: 2, y: 9}, to: {x: 4, y: 7}, notation: "相三进五" },
				// 黑方：炮２平５
				{ from: {x: 7, y: 2}, to: {x: 4, y: 2}, notation: "炮２平５" },
				// 红方：炮八平五
				{ from: {x: 7, y: 7}, to: {x: 4, y: 7}, notation: "炮八平五" },
				// 黑方：马２进３
				{ from: {x: 1, y: 0}, to: {x: 2, y: 2}, notation: "马２进３" },
				// 红方：马八进七
				{ from: {x: 7, y: 9}, to: {x: 6, y: 7}, notation: "马八进七" },
				// 黑方：车１平２
				{ from: {x: 0, y: 0}, to: {x: 1, y: 0}, notation: "车１平２" }
			],
			notes: "飞相局是稳健的开局选择，以防守反击为主"
		},
		{
			id: "open_003",
			name: "仙人指路对卒底炮",
			type: "opening",
			redPlayer: "红方",
			blackPlayer: "黑方",
			description: "灵活的仙人指路开局",
			moves: [
				// 红方：兵七进一
				{ from: {x: 3, y: 6}, to: {x: 3, y: 5}, notation: "兵七进一" },
				// 黑方：炮２平３
				{ from: {x: 7, y: 2}, to: {x: 4, y: 2}, notation: "炮２平３" },
				// 红方：炮八平五
				{ from: {x: 7, y: 7}, to: {x: 4, y: 7}, notation: "炮八平五" },
				// 黑方：马８进７
				{ from: {x: 7, y: 0}, to: {x: 6, y: 2}, notation: "马８进７" },
				// 红方：炮五进四
				{ from: {x: 4, y: 7}, to: {x: 4, y: 3}, notation: "炮五进四" },
				// 黑方：马２进３
				{ from: {x: 1, y: 0}, to: {x: 2, y: 2}, notation: "马２进３" }
			],
			notes: "仙人指路变化灵活，可根据对手选择不同布局"
		},
		{
			id: "open_004",
			name: "起马局对中炮",
			type: "opening",
			redPlayer: "红方",
			blackPlayer: "黑方",
			description: "以马起先的灵活开局",
			moves: [
				// 红方：马二进三
				{ from: {x: 1, y: 9}, to: {x: 2, y: 7}, notation: "马二进三" },
				// 黑方：炮８平５
				{ from: {x: 7, y: 2}, to: {x: 4, y: 2}, notation: "炮８平５" },
				// 红方：马八进七
				{ from: {x: 7, y: 9}, to: {x: 6, y: 7}, notation: "马八进七" },
				// 黑方：马８进７
				{ from: {x: 7, y: 0}, to: {x: 6, y: 2}, notation: "马８进７" },
				// 红方：炮二平五
				{ from: {x: 1, y: 7}, to: {x: 4, y: 7}, notation: "炮二平五" },
				// 黑方：马２进３
				{ from: {x: 1, y: 0}, to: {x: 2, y: 2}, notation: "马２进３" }
			],
			notes: "起马局是一种稳健的开局方式"
		}
	],

	midgame: [
		{
			id: "mid_001",
			name: "中局弃子攻杀",
			type: "midgame",
			redPlayer: "红方",
			blackPlayer: "黑方",
			description: "中局弃子攻杀技巧",
			moves: [
				{ from: {x: 1, y: 7}, to: {x: 4, y: 7}, notation: "炮二平五" },
				{ from: {x: 7, y: 2}, to: {x: 4, y: 2}, notation: "炮８平５" },
				{ from: {x: 1, y: 9}, to: {x: 2, y: 7}, notation: "马二进三" },
				{ from: {x: 7, y: 0}, to: {x: 6, y: 2}, notation: "马８进７" },
				{ from: {x: 0, y: 9}, to: {x: 1, y: 9}, notation: "车一平二" },
				{ from: {x: 1, y: 0}, to: {x: 2, y: 2}, notation: "马２进３" },
				{ from: {x: 7, y: 9}, to: {x: 6, y: 7}, notation: "马八进七" },
				{ from: {x: 8, y: 0}, to: {x: 7, y: 0}, notation: "车９平８" },
				{ from: {x: 1, y: 9}, to: {x: 1, y: 4}, notation: "车二进六" },
				{ from: {x: 6, y: 2}, to: {x: 5, y: 4}, notation: "马７进６" },
				{ from: {x: 3, y: 6}, to: {x: 3, y: 5}, notation: "兵七进一" },
				{ from: {x: 3, y: 5}, to: {x: 3, y: 4}, notation: "卒７进１" }
			],
			notes: "中局阶段弃子攻杀，需要准确判断局面"
		},
		{
			id: "mid_002",
			name: "运子攻王技巧",
			type: "midgame",
			redPlayer: "红方",
			blackPlayer: "黑方",
			description: "中局运子攻王技巧",
			moves: [
				{ from: {x: 1, y: 7}, to: {x: 4, y: 7}, notation: "炮二平五" },
				{ from: {x: 7, y: 2}, to: {x: 4, y: 2}, notation: "炮８平５" },
				{ from: {x: 1, y: 9}, to: {x: 2, y: 7}, notation: "马二进三" },
				{ from: {x: 7, y: 0}, to: {x: 6, y: 2}, notation: "马８进７" },
				{ from: {x: 7, y: 9}, to: {x: 6, y: 7}, notation: "马八进七" },
				{ from: {x: 1, y: 0}, to: {x: 2, y: 2}, notation: "马２进３" },
				{ from: {x: 3, y: 6}, to: {x: 3, y: 5}, notation: "兵七进一" },
				{ from: {x: 8, y: 0}, to: {x: 7, y: 0}, notation: "车９平８" }
			],
			notes: "运子攻王是中局的重要技巧"
		},
		{
			id: "mid_003",
			name: "兑子争先技巧",
			type: "midgame",
			redPlayer: "红方",
			blackPlayer: "黑方",
			description: "中局兑子争先技巧",
			moves: [
				{ from: {x: 1, y: 7}, to: {x: 4, y: 7}, notation: "炮二平五" },
				{ from: {x: 7, y: 2}, to: {x: 4, y: 2}, notation: "炮８平５" },
				{ from: {x: 1, y: 9}, to: {x: 2, y: 7}, notation: "马二进三" },
				{ from: {x: 7, y: 0}, to: {x: 6, y: 2}, notation: "马８进７" },
				{ from: {x: 7, y: 9}, to: {x: 6, y: 7}, notation: "马八进七" },
				{ from: {x: 1, y: 0}, to: {x: 2, y: 2}, notation: "马２进３" },
				{ from: {x: 6, y: 7}, to: {x: 5, y: 6}, notation: "马七进六" }
			],
			notes: "兑子争先需要准确计算"
		}
	],

	famous: [
		{
			id: "fame_001",
			name: "胡荣华经典对局",
			type: "famous",
			redPlayer: "胡荣华",
			blackPlayer: "杨官璘",
			year: "1960",
			description: "胡荣华VS杨官璘经典对局",
			moves: [
				{ from: {x: 1, y: 7}, to: {x: 4, y: 7}, notation: "炮二平五" },
				{ from: {x: 7, y: 2}, to: {x: 4, y: 2}, notation: "炮８平５" },
				{ from: {x: 1, y: 9}, to: {x: 2, y: 7}, notation: "马二进三" },
				{ from: {x: 7, y: 0}, to: {x: 6, y: 2}, notation: "马８进７" },
				{ from: {x: 0, y: 9}, to: {x: 1, y: 9}, notation: "车一平二" },
				{ from: {x: 1, y: 0}, to: {x: 2, y: 2}, notation: "马２进３" },
				{ from: {x: 7, y: 9}, to: {x: 6, y: 7}, notation: "马八进七" },
				{ from: {x: 3, y: 6}, to: {x: 3, y: 5}, notation: "兵七进一" }
			],
			notes: "1960年胡荣华战胜杨官璘的经典对局"
		},
		{
			id: "fame_002",
			name: "许银川精彩对局",
			type: "famous",
			redPlayer: "许银川",
			blackPlayer: "吕钦",
			year: "1993",
			description: "许银川VS吕钦精彩对局",
			moves: [
				{ from: {x: 3, y: 6}, to: {x: 3, y: 5}, notation: "兵七进一" },
				{ from: {x: 7, y: 2}, to: {x: 4, y: 2}, notation: "炮２平５" },
				{ from: {x: 7, y: 7}, to: {x: 4, y: 7}, notation: "炮八平五" },
				{ from: {x: 7, y: 0}, to: {x: 6, y: 2}, notation: "马８进７" },
				{ from: {x: 7, y: 9}, to: {x: 6, y: 7}, notation: "马八进七" },
				{ from: {x: 4, y: 7}, to: {x: 4, y: 3}, notation: "炮五进四" }
			],
			notes: "1993年许银川战胜吕钦的经典对局"
		},
		{
			id: "fame_003",
			name: "赵国荣名局赏析",
			type: "famous",
			redPlayer: "赵国荣",
			blackPlayer: "李来群",
			year: "1991",
			description: "赵国荣VS李来群名局",
			moves: [
				{ from: {x: 1, y: 7}, to: {x: 4, y: 7}, notation: "炮二平五" },
				{ from: {x: 7, y: 2}, to: {x: 4, y: 2}, notation: "炮８平５" },
				{ from: {x: 1, y: 9}, to: {x: 2, y: 7}, notation: "马二进三" },
				{ from: {x: 7, y: 0}, to: {x: 6, y: 2}, notation: "马８进７" }
			],
			notes: "1991年赵国荣战胜李来群的经典对局"
		},
		{
			id: "fame_004",
			name: "柳大华盲棋对局",
			type: "famous",
			redPlayer: "柳大华",
			blackPlayer: "徐天利",
			year: "1988",
			description: "柳大华盲棋精彩对局",
			moves: [
				{ from: {x: 1, y: 7}, to: {x: 4, y: 7}, notation: "炮二平五" },
				{ from: {x: 7, y: 2}, to: {x: 4, y: 2}, notation: "炮８平５" },
				{ from: {x: 1, y: 9}, to: {x: 2, y: 7}, notation: "马二进三" },
				{ from: {x: 7, y: 0}, to: {x: 6, y: 2}, notation: "马８进７" },
				{ from: {x: 7, y: 9}, to: {x: 6, y: 7}, notation: "马八进七" },
				{ from: {x: 0, y: 9}, to: {x: 1, y: 9}, notation: "车一平二" }
			],
			notes: "1988年柳大华盲棋1对19的精彩对局之一"
		}
	]
};

// 获取指定分类的棋谱列表
com.getManualsByCategory = function(category) {
	return com.manuals[category] || [];
};

// 根据ID获取棋谱
com.getManualById = function(id) {
	for (let category in com.manuals) {
		for (let manual of com.manuals[category]) {
			if (manual.id === id) {
				return manual;
			}
		}
	}
	return null;
};

// 获取所有棋谱数量
com.getAllManualsCount = function() {
	let count = 0;
	for (let category in com.manuals) {
		count += com.manuals[category].length;
	}
	return count;
};

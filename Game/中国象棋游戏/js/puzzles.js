/**
 * 残局挑战数据
 * 包含基础残局、中级残局、高级残局和江湖残局
 * 棋盘说明：黑方(大写)在上方(y=0-4)，红方(小写)在下方(y=5-9)
 */

com.puzzles = {
	basic: [
		{
			id: "basic_001",
			name: "单兵例胜孤将",
			difficulty: "easy",
			description: "单兵对孤将，必胜残局",
			category: "basic",
			map: [
				[    ,    ,    ,    ,'J0',    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,'j0',    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,'z0']
			],
			solution: ["红兵前进，利用将帅对面规则取胜"],
			hint: "兵向九宫推进，将帅不能对面是关键"
		},
		{
			id: "basic_002",
			name: "单车例胜双士",
			difficulty: "easy",
			description: "单车对双士，必胜残局",
			category: "basic",
			map: [
				[    ,    ,    ,    ,'J0','S0',    ,    ,    ],
				[    ,    ,    ,    ,    ,'S1',    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,'c0',    ,    ,    ,    ]
			],
			solution: ["红车配合将帅，各个击破双士"],
			hint: "用车将军，逐步吃掉双士"
		},
		{
			id: "basic_003",
			name: "双兵例胜单士",
			difficulty: "medium",
			description: "双兵对单士，必胜残局",
			category: "basic",
			map: [
				[    ,    ,    ,    ,'J0','S0',    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,'j0',    ,    ,    ,    ],
				[    ,    ,    ,    ,'z0',    ,'z1',    ,    ]
			],
			solution: ["双兵配合，一兵冲底，一兵配合"],
			hint: "高兵配合低兵，逐步推进"
		}
	],

	intermediate: [
		{
			id: "inter_001",
			name: "马炮例胜单马",
			difficulty: "medium",
			description: "马炮对单马，需要精妙配合",
			category: "intermediate",
			map: [
				[    ,    ,    ,    ,'J0',    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,'M0',    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,'m0',    ,    ,'p0',    ,    ],
				[    ,    ,    ,    ,'j0',    ,    ,    ,    ]
			],
			solution: ["马炮配合，炮做马架，杀将取胜"],
			hint: "炮镇中路，马侧翼将军"
		},
		{
			id: "inter_002",
			name: "双车例胜单车",
			difficulty: "medium",
			description: "双车对单车，双车错杀",
			category: "intermediate",
			map: [
				[    ,    ,    ,    ,'J0',    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,'j0',    ,    ,    ,    ],
				[    ,    ,    ,    ,'c0',    ,'c1',    ,    ]
			],
			solution: ["双车错杀，控制要道，逐步紧逼"],
			hint: "双车分别控制不同线路，形成错杀"
		},
		{
			id: "inter_003",
			name: "炮双士例胜单炮",
			difficulty: "medium",
			description: "炮双士对单炮，依靠士助攻",
			category: "intermediate",
			map: [
				[    ,    ,    ,    ,'J0',    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,'j0','s0',    ,    ,    ],
				[    ,    ,    ,    ,    ,'s1',    ,'p0',    ]
			],
			solution: ["双炮对峙，士助攻取胜"],
			hint: "利用士做炮架，控制对方将"
		}
	],

	advanced: [
		{
			id: "adv_001",
			name: "七星聚会",
			difficulty: "hard",
			description: "著名江湖残局，变化复杂",
			category: "advanced",
			map: [
				[    ,'Z0',    ,    ,'J0',    ,    ,    ,    ],
				[    ,    ,    ,    ,'S0',    ,    ,    ,    ],
				[    ,    ,    ,    ,'X0','s0',    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,'Z1',    ,    ],
				[    ,    ,    ,    ,'C0',    ,    ,    ,    ],
				[    ,    ,    ,'c0',    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,'p0',    ,    ,    ,    ],
				[    ,'P0',    ,'j0',    ,'P1',    ,    ,    ]
			],
			solution: ["经典七星聚会残局，红先和"],
			hint: "这是经典江湖残局，双方都需要精确计算，最终结果是和棋"
		},
		{
			id: "adv_002",
			name: "野马操田",
			difficulty: "hard",
			description: "以马为主的复杂残局",
			category: "advanced",
			map: [
				[    ,    ,    ,'J0',    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,'m0',    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,'M0',    ],
				[    ,    ,    ,    ,'C0',    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,'j0',    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ]
			],
			solution: ["野马操田，红先胜"],
			hint: "运用马的八面威风，配合其他子力取胜"
		},
		{
			id: "adv_003",
			name: "千里独行",
			difficulty: "expert",
			description: "车炮兵配合的经典残局",
			category: "advanced",
			map: [
				[    ,    ,    ,'J0',    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,'c0',    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,'p0',    ,    ,    ],
				[    ,    ,    ,    ,'j0',    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,'z0',    ,    ]
			],
			solution: ["千里独行，红先和"],
			hint: "需要精确计算每一步，确保不败"
		}
	],

	classic: [
		{
			id: "classic_001",
			name: "蚯蚓降龙",
			difficulty: "expert",
			description: "著名江湖残局，变化繁多",
			category: "classic",
			map: [
				[    ,    ,    ,'S0','J0',    ,    ,    ,    ],
				[    ,    ,    ,'X0','x0',    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,'Z0',    ,    ,    ,    ],
				[    ,    ,    ,    ,'P0',    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,'j0',    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ]
			],
			solution: ["蚯蚓降龙，红先和"],
			hint: "这是著名江湖残局，需要深入研究才能找到和棋之路"
		},
		{
			id: "classic_002",
			name: "马跃檀溪",
			difficulty: "expert",
			description: "以马为主力的巧妙残局",
			category: "classic",
			map: [
				[    ,    ,    ,'J0',    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,'m0',    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,'M0',    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,'j0',    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ]
			],
			solution: ["马跃檀溪，红先胜"],
			hint: "运用马的独特优势，配合其他子力取胜"
		},
		{
			id: "classic_003",
			name: "五虎下川",
			difficulty: "expert",
			description: "五子配合的经典残局",
			category: "classic",
			map: [
				[    ,    ,    ,'J0',    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,'z0','z1',    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,'j0',    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ]
			],
			solution: ["五虎下川，红先和"],
			hint: "五子齐心协力，寻找和棋机会"
		},
		{
			id: "classic_004",
			name: "三英战吕布",
			difficulty: "expert",
			description: "以少胜多的经典残局",
			category: "classic",
			map: [
				[    ,    ,    ,'J0',    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,'m0','m1',    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,'j0',    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ]
			],
			solution: ["三英战吕布，红先和"],
			hint: "双马配合，寻找胜机"
		},
		{
			id: "classic_005",
			name: "二郎搜山",
			difficulty: "expert",
			description: "双车配合的精妙残局",
			category: "classic",
			map: [
				[    ,    ,    ,'J0',    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,'c0',    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ],
				[    ,    ,    ,    ,'j0',    ,    ,    ,    ],
				[    ,    ,    ,    ,    ,    ,    ,    ,    ]
			],
			solution: ["二郎搜山，红先胜"],
			hint: "双车巧妙配合，控制要道取胜"
		}
	]
};

// 获取指定分类的残局列表
com.getPuzzlesByCategory = function(category) {
	return com.puzzles[category] || [];
};

// 根据ID获取残局
com.getPuzzleById = function(id) {
	for (let category in com.puzzles) {
		for (let puzzle of com.puzzles[category]) {
			if (puzzle.id === id) {
				return puzzle;
			}
		}
	}
	return null;
};

// 获取所有残局数量
com.getAllPuzzlesCount = function() {
	let count = 0;
	for (let category in com.puzzles) {
		count += com.puzzles[category].length;
	}
	return count;
};

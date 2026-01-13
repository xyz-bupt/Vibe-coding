/**
 * 中国象棋增强功能模块
 * 包含残局挑战、棋谱学习、收藏管理等功能
 */

(function() {
	// 增强功能初始化
	com.enhanced = {
		currentPuzzle: null,
		currentManual: null,
		selectedPuzzleId: null,
		selectedManualId: null,
		currentCategory: 'basic',
		autoPlayInterval: null,
		isAutoPlaying: false,

		init: function() {
			this.bindMenuEvents();
			this.bindGameEvents();
			this.renderPuzzleList();
			this.renderManualList();
		},

		// 绑定菜单事件
		bindMenuEvents: function() {
			// 人机对弈
			com.get('indexDy').addEventListener('click', () => {
				this.showMenu('menuDy');
			});

			// 双人对战
			com.get('indexPvp').addEventListener('click', () => {
				this.showMenu('menuPvp');
			});

			// 残局挑战
			com.get('indexQj').addEventListener('click', () => {
				this.showMenu('menuQj');
			});

			// 经典棋谱
			com.get('indexManual').addEventListener('click', () => {
				this.showMenu('menuManual');
			});

			// 我的收藏
			com.get('indexCollection').addEventListener('click', () => {
				com.collectionUI.render();
				this.showMenu('menuCollection');
			});

			// 返回按钮
			com.get('menuFh').addEventListener('click', () => {
				this.showMainMenu();
			});

			com.get('menuFhPvp').addEventListener('click', () => {
				this.showMainMenu();
			});

			com.get('menuGb').addEventListener('click', () => {
				this.showMainMenu();
			});

			com.get('menuFhManual').addEventListener('click', () => {
				this.showMainMenu();
			});

			// 残局分类按钮
			com.get('puzzleCategories').addEventListener('click', (e) => {
				if (e.target.classList.contains('category-btn')) {
					this.switchPuzzleCategory(e.target.getAttribute('data-category'));
				}
			});

			// 棋谱分类按钮
			com.get('manualCategories').addEventListener('click', (e) => {
				if (e.target.classList.contains('category-btn')) {
					this.switchManualCategory(e.target.getAttribute('data-category'));
				}
			});

			// 开始残局挑战
			com.get('puzzleBtn').addEventListener('click', () => {
				this.startPuzzle();
			});

			// 开始学习棋谱
			com.get('manualBtn').addEventListener('click', () => {
				this.startManual();
			});

			// 双人对战开始
			com.get('pvpBtn').addEventListener('click', () => {
				this.startPvP();
			});

			// 更换皮肤
			com.get('stypeBtn').addEventListener('click', () => {
				this.switchSkin();
			});

			// 开始对弈
			com.get('playBtn').addEventListener('click', () => {
				this.startAI();
			});
		},

		// 绑定游戏界面事件
		bindGameEvents: function() {
			// 棋谱面板切换
			com.get('toggleMoves').addEventListener('click', () => {
				const panel = com.get('movesPanel');
				panel.classList.toggle('hidden');
				com.get('toggleMoves').textContent = panel.classList.contains('hidden') ? '显示' : '隐藏';
			});

			// 保存棋谱
			com.get('saveBtn').addEventListener('click', () => {
				this.showSaveModal();
			});

			// 保存弹窗
			com.get('closeSaveModal').addEventListener('click', () => {
				com.get('saveModal').style.display = 'none';
			});

			com.get('cancelSave').addEventListener('click', () => {
				com.get('saveModal').style.display = 'none';
			});

			com.get('confirmSave').addEventListener('click', () => {
				this.saveManual();
			});

			// 提示按钮
			com.get('hintBtn').addEventListener('click', () => {
				this.showHint();
			});

			// 棋谱导航
			com.get('prevMove').addEventListener('click', () => {
				this.prevMove();
			});

			com.get('nextMove').addEventListener('click', () => {
				this.nextMove();
			});

			com.get('autoPlay').addEventListener('click', () => {
				this.toggleAutoPlay();
			});
		},

		// 显示主菜单
		showMainMenu: function() {
			com.get('menuDy').style.display = 'none';
			com.get('menuPvp').style.display = 'none';
			com.get('menuQj').style.display = 'none';
			com.get('menuManual').style.display = 'none';
			com.get('menuCollection').style.display = 'none';
			com.get('indexBox').style.display = 'block';
		},

		// 显示指定菜单
		showMenu: function(menuId) {
			this.showMainMenu();
			com.get('indexBox').style.display = 'none';
			com.get(menuId).style.display = 'block';
		},

		// 切换残局分类
		switchPuzzleCategory: function(category) {
			this.currentCategory = category;
			this.selectedPuzzleId = null;

			// 更新按钮状态
			com.get('puzzleCategories').querySelectorAll('.category-btn').forEach(btn => {
				btn.classList.toggle('active', btn.getAttribute('data-category') === category);
			});

			this.renderPuzzleList();
		},

		// 渲染残局列表
		renderPuzzleList: function() {
			const list = com.get('puzzleList');
			const puzzles = com.getPuzzlesByCategory(this.currentCategory);

			let html = '';
			puzzles.forEach(puzzle => {
				const difficultyClass = 'difficulty-' + puzzle.difficulty;
				const difficultyText = {
					'easy': '简单',
					'medium': '中等',
					'hard': '困难',
					'expert': '专家'
				}[puzzle.difficulty] || '未知';

				html += `
					<div class="puzzle-item ${this.selectedPuzzleId === puzzle.id ? 'selected' : ''}" data-id="${puzzle.id}">
						<div class="puzzle-title">${puzzle.name}</div>
						<div class="puzzle-info">
							<span class="puzzle-difficulty ${difficultyClass}">${difficultyText}</span>
							<span class="puzzle-desc">${puzzle.description}</span>
						</div>
					</div>
				`;
			});

			list.innerHTML = html;

			// 绑定点击事件
			list.querySelectorAll('.puzzle-item').forEach(item => {
				item.addEventListener('click', () => {
					list.querySelectorAll('.puzzle-item').forEach(i => i.classList.remove('selected'));
					item.classList.add('selected');
					this.selectedPuzzleId = item.getAttribute('data-id');
				});
			});
		},

		// 开始残局挑战
		startPuzzle: function() {
			if (!this.selectedPuzzleId) {
				alert('请先选择一个残局');
				return;
			}

			const puzzle = com.getPuzzleById(this.selectedPuzzleId);
			if (!puzzle) {
				alert('残局数据错误');
				return;
			}

			this.currentPuzzle = puzzle;

			// 初始化游戏
			com.get('chessBox').style.display = 'block';
			com.get('menuBox').style.display = 'none';
			com.get('manualNav').style.display = 'none';

			play.init(4, puzzle.map);

			// 显示提示信息
			setTimeout(() => {
				if (puzzle.hint) {
					alert('提示: ' + puzzle.hint);
				}
			}, 500);
		},

		// 切换棋谱分类
		switchManualCategory: function(category) {
			this.currentCategory = category;
			this.selectedManualId = null;

			// 更新按钮状态
			com.get('manualCategories').querySelectorAll('.category-btn').forEach(btn => {
				btn.classList.toggle('active', btn.getAttribute('data-category') === category);
			});

			this.renderManualList();
		},

		// 渲染棋谱列表
		renderManualList: function() {
			const list = com.get('manualList');
			const manuals = com.getManualsByCategory(this.currentCategory);

			let html = '';
			manuals.forEach(manual => {
				html += `
					<div class="manual-item ${this.selectedManualId === manual.id ? 'selected' : ''}" data-id="${manual.id}">
						<div class="manual-title">${manual.name}</div>
						<div class="manual-info">
							<span>${manual.redPlayer} VS ${manual.blackPlayer}</span>
							${manual.year ? `<span>${manual.year}</span>` : ''}
						</div>
						<div class="manual-desc">${manual.description}</div>
					</div>
				`;
			});

			list.innerHTML = html;

			// 绑定点击事件
			list.querySelectorAll('.manual-item').forEach(item => {
				item.addEventListener('click', () => {
					list.querySelectorAll('.manual-item').forEach(i => i.classList.remove('selected'));
					item.classList.add('selected');
					this.selectedManualId = item.getAttribute('data-id');
				});
			});
		},

		// 开始学习棋谱（交互式模式）
		startManual: function() {
			if (!this.selectedManualId) {
				alert('请先选择一个棋谱');
				return;
			}

			const manual = com.getManualById(this.selectedManualId);
			if (!manual) {
				alert('棋谱数据错误');
				return;
			}

			this.currentManual = manual;

			// 初始化游戏
			com.get('chessBox').style.display = 'block';
			com.get('menuBox').style.display = 'none';
			com.get('manualNav').style.display = 'none';

			// 初始化为双人对战模式（红方玩家，黑方按照棋谱走）
			play.init(0);

			// 设置为棋谱学习模式
			play.isManualMode = true;
			play.manualMoves = manual.moves || [];
			play.manualStepIndex = 0;

			// 显示棋谱说明
			let msg = '交互式学习模式\n\n';
			msg += '你执红方，请按照棋谱提示下棋。\n';
			msg += '下对后，黑方会自动走出对应的一步。\n';
			msg += '当前棋谱：' + manual.name;
			alert(msg);

			// 显示第一步提示（如果有）
			if (manual.moves && manual.moves.length > 0) {
				this.showNextMoveHint();
			}
		},

		// 显示下一步棋谱提示
		showNextMoveHint: function() {
			if (!this.currentManual || !this.currentManual.moves) return;

			const currentIndex = play.manualStepIndex || 0;
			if (currentIndex >= this.currentManual.moves.length) {
				alert('棋谱已学完！');
				return;
			}

			const move = this.currentManual.moves[currentIndex];
			// 红方的棋谱步骤
			const stepNumber = Math.floor(currentIndex / 2) + 1;
			const notation = move.notation || '未记录';

			// 更新游戏状态显示
			const statusEl = com.get('gameStatus');
			if (statusEl) {
				statusEl.textContent = `请红方走：第${stepNumber}步 ${notation}`;
			}

			// 高亮显示提示中的棋子
			if (move.from) {
				this.highlightMove(move.from);
			}
		},

		// 高亮显示移动提示
		highlightMove: function(from) {
			// 可以在这里添加高亮逻辑
			// 例如高亮显示要移动的棋子
		},

		// 检查红方是否按棋谱下棋
		checkManualMove: function(fromX, fromY, toX, toY) {
			if (!this.isManualMode || !this.currentManual) return false;

			const currentIndex = play.manualStepIndex || 0;
			const move = this.currentManual.moves[currentIndex];

			if (!move || !move.from || !move.to) return false;

			// 检查是否与棋谱匹配
			const isMatch = (fromX === move.from.x && fromY === move.from.y &&
			                  toX === move.to.x && toY === move.to.y);

			if (isMatch) {
				// 红方走对了，黑方自动走出下一步
				this.autoPlayBlackMove();
				return true;
			} else {
				alert('走错了！请按照棋谱提示下棋。\n提示：' + move.notation);
				return false;
			}
		},

		// 黑方自动走出棋谱中的下一步
		autoPlayBlackMove: function() {
			const currentIndex = (play.manualStepIndex || 0) + 1;

			if (currentIndex >= this.currentManual.moves.length) {
				// 棋谱走完了
				alert('恭喜！你已经学会了这个棋谱！');
				this.isManualMode = false;
				return;
			}

			const move = this.currentManual.moves[currentIndex];

			// 延迟执行黑方的移动
			setTimeout(() => {
				// 这里需要调用 play 对象的移动方法
				// 由于原始代码结构复杂，我们简化处理
				if (play && play.manualMoveByCoords) {
					play.manualMoveByCoords(move.from, move.to);
				}

				// 更新步数索引
				play.manualStepIndex = currentIndex + 1;

				// 显示下一步提示
				this.showNextMoveHint();

				// 更新着法记录
				this.addMoveToHistory(move, 'black');
			}, 500);
		},

		// 添加着法到历史记录
		addMoveToHistory: function(move, side) {
			if (!play.moveHistory) play.moveHistory = [];
			play.moveHistory.push({
				notation: move.notation,
				side: side
			});
			play.renderMoves();
		},

		// 开始双人对战
		startPvP: function() {
			com.get('chessBox').style.display = 'block';
			com.get('menuBox').style.display = 'none';
			com.get('manualNav').style.display = 'none';

			// 初始化双人对战模式 (depth=0 表示无AI)
			play.init(0);
		},

		// 开始人机对弈
		startAI: function() {
			var depth = parseInt(getRadioValue("depth"), 10) || 3;
			play.isPlay = true;
			play.init(depth);
			com.get("chessBox").style.display = "block";
			com.get("menuBox").style.display = "none";
		},

		// 显示保存棋谱弹窗
		showSaveModal: function() {
			if (!play || !play.map) {
				alert('当前没有对局记录');
				return;
			}

			com.get('saveModal').style.display = 'flex';
			com.get('manualName').value = '';
			com.get('manualNote').value = '';
		},

		// 保存棋谱
		saveManual: function() {
			const name = com.get('manualName').value.trim();
			const note = com.get('manualNote').value.trim();

			if (!name) {
				alert('请输入棋谱名称');
				return;
			}

			const manual = {
				name: name,
				note: note,
				moves: play.history || [],
				map: null
			};

			com.collection.add(manual);

			com.get('saveModal').style.display = 'none';
			alert('棋谱保存成功！');
		},

		// 显示提示
		showHint: function() {
			if (this.currentPuzzle && this.currentPuzzle.solution) {
				const solution = this.currentPuzzle.solution.join(' → ');
				alert('参考解法: ' + solution);
			} else {
				alert('当前没有可用提示');
			}
		},

		// 上一步
		prevMove: function() {
			if (play && play.replayIndex > 0) {
				play.replayIndex--;
				play.restoreToMove(play.replayIndex);
				this.updateMoveInfo();
			}
		},

		// 下一步
		nextMove: function() {
			if (play && this.currentManual && play.replayIndex < this.currentManual.moves.length) {
				play.replayIndex++;
				play.restoreToMove(play.replayIndex);
				this.updateMoveInfo();
			}
		},

		// 更新着法信息
		updateMoveInfo: function() {
			if (this.currentManual) {
				com.get('moveInfo').textContent = `第 ${play.replayIndex} / ${this.currentManual.moves.length} 步`;
			}
		},

		// 切换自动播放
		toggleAutoPlay: function() {
			if (this.isAutoPlaying) {
				this.stopAutoPlay();
			} else {
				this.startAutoPlay();
			}
		},

		// 开始自动播放
		startAutoPlay: function() {
			if (!this.currentManual || !this.currentManual.moves) return;

			this.isAutoPlaying = true;
			com.get('autoPlay').textContent = '暂停';

			this.autoPlayInterval = setInterval(() => {
				if (play.replayIndex < this.currentManual.moves.length) {
					this.nextMove();
				} else {
					this.stopAutoPlay();
				}
			}, 1500);
		},

		// 停止自动播放
		stopAutoPlay: function() {
			this.isAutoPlaying = false;
			com.get('autoPlay').textContent = '自动播放';
			if (this.autoPlayInterval) {
				clearInterval(this.autoPlayInterval);
				this.autoPlayInterval = null;
			}
		},

		// 切换皮肤
		switchSkin: function() {
			const currentSkin = com.getCookie('stype') || 'stype2';
			const skins = ['stype1', 'stype2', 'stype3'];
			const currentIndex = skins.indexOf(currentSkin);
			const nextIndex = (currentIndex + 1) % skins.length;
			const nextSkin = skins[nextIndex];

			com.setCookie('stype', nextSkin);
			com.init(nextSkin);
		}
	};

	// 扩展play对象，添加棋谱回放功能
	if (typeof play !== 'undefined') {
		play.replayIndex = 0;
		play.replayManual = function(moves) {
			this.history = moves;
			this.replayIndex = 0;
			this.renderMoves();
		};

		play.restoreToMove = function(index) {
			// 重置棋盘
			if (this.initMap) {
				com.createMans(this.initMap);
			}

			// 回放到指定步数
			for (let i = 0; i < index && i < this.history.length; i++) {
				const move = this.history[i];
				// 执行移动逻辑
				// 这里需要根据实际的棋子移动逻辑来实现
			}

			this.renderMoves();
		};

		play.renderMoves = function() {
			const list = com.get('movesList');
			if (!list) return;

			let html = '';
			if (this.history) {
				this.history.forEach((move, i) => {
					const step = Math.floor(i / 2) + 1;
					const isRed = i % 2 === 0;
					html += `
						<div class="move-item">
							<span class="move-number">${step}. ${isRed ? '红' : '黑'}</span>
							<span class="move-notation">${move.notation || '未记录'}</span>
						</div>
					`;
				});
			}
			list.innerHTML = html;
		};
	}

	// 页面加载完成后初始化
	window.addEventListener('load', () => {
		com.enhanced.init();
	});

})();

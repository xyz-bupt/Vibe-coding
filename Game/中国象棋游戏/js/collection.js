/**
 * 收藏管理模块
 * 用于保存和管理用户的棋谱收藏
 */

com.collection = {
	// 收藏列表
	items: [],

	// 初始化
	init: function() {
		this.load();
	},

	// 从本地存储加载收藏
	load: function() {
		try {
			const data = localStorage.getItem('chess_collection');
			if (data) {
				this.items = JSON.parse(data);
			}
		} catch (e) {
			console.error('加载收藏失败:', e);
			this.items = [];
		}
	},

	// 保存收藏到本地存储
	save: function() {
		try {
			localStorage.setItem('chess_collection', JSON.stringify(this.items));
			return true;
		} catch (e) {
			console.error('保存收藏失败:', e);
			return false;
		}
	},

	// 添加收藏
	add: function(manual) {
		const item = {
			id: this.generateId(),
			name: manual.name || '未命名棋谱',
			note: manual.note || '',
			moves: manual.moves || [],
			date: new Date().toISOString(),
			map: manual.map || null
		};

		this.items.unshift(item);
		this.save();
		return item;
	},

	// 删除收藏
	remove: function(id) {
		const index = this.items.findIndex(item => item.id === id);
		if (index !== -1) {
			this.items.splice(index, 1);
			this.save();
			return true;
		}
		return false;
	},

	// 更新收藏
	update: function(id, data) {
		const item = this.items.find(item => item.id === id);
		if (item) {
			Object.assign(item, data);
			item.date = new Date().toISOString();
			this.save();
			return true;
		}
		return false;
	},

	// 获取收藏
	get: function(id) {
		return this.items.find(item => item.id === id);
	},

	// 获取所有收藏
	getAll: function() {
		return this.items;
	},

	// 清空所有收藏
	clear: function() {
		this.items = [];
		this.save();
	},

	// 生成唯一ID
	generateId: function() {
		return 'col_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
	},

	// 导出收藏
	export: function() {
		const data = JSON.stringify(this.items, null, 2);
		const blob = new Blob([data], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'chess_collection_' + new Date().toISOString().slice(0,10) + '.json';
		a.click();
		URL.revokeObjectURL(url);
	},

	// 导入收藏
	import: function(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				try {
					const data = JSON.parse(e.target.result);
					if (Array.isArray(data)) {
						this.items = data.concat(this.items);
						this.save();
						resolve(true);
					} else {
						reject(new Error('无效的文件格式'));
					}
				} catch (err) {
					reject(err);
				}
			};
			reader.onerror = () => reject(new Error('读取文件失败'));
			reader.readAsText(file);
		});
	}
};

// 收藏管理器UI控制器
com.collectionUI = {
	currentCategory: 'all',

	init: function() {
		this.bindEvents();
		this.render();
	},

	bindEvents: function() {
		// 返回按钮
		com.get('menuFhCollection').addEventListener('click', () => {
			this.showMainMenu();
		});
	},

	showMainMenu: function() {
		com.get('menuCollection').style.display = 'none';
		com.get('indexBox').style.display = 'block';
	},

	render: function() {
		const list = com.get('collectionList');
		const items = com.collection.getAll();

		if (items.length === 0) {
			list.innerHTML = '<p class="empty-hint">暂无收藏的对局<br>在游戏中点击"保存棋谱"按钮来保存精彩对局</p>';
			return;
		}

		let html = '';
		items.forEach(item => {
			const date = new Date(item.date).toLocaleDateString('zh-CN');
			html += `
				<div class="collection-item" data-id="${item.id}">
					<div class="manual-title">${this.escapeHtml(item.name)}</div>
					<div class="manual-info">
						<span class="collection-date">${date}</span>
						${item.note ? '<span class="collection-note">有备注</span>' : ''}
						<span class="collection-moves">${item.moves.length} 步</span>
					</div>
					<div class="collection-actions">
						<button class="btn-play" data-id="${item.id}">复盘</button>
						<button class="btn-delete" data-id="${item.id}">删除</button>
					</div>
				</div>
			`;
		});

		list.innerHTML = html;
		this.bindItemEvents();
	},

	bindItemEvents: function() {
		const list = com.get('collectionList');

		// 复盘按钮
		list.querySelectorAll('.btn-play').forEach(btn => {
			btn.addEventListener('click', (e) => {
				e.stopPropagation();
				const id = btn.getAttribute('data-id');
				this.playManual(id);
			});
		});

		// 删除按钮
		list.querySelectorAll('.btn-delete').forEach(btn => {
			btn.addEventListener('click', (e) => {
				e.stopPropagation();
				const id = btn.getAttribute('data-id');
				if (confirm('确定要删除这个收藏吗？')) {
					com.collection.remove(id);
					this.render();
				}
			});
		});
	},

	playManual: function(id) {
		const item = com.collection.get(id);
		if (!item) return;

		// 初始化棋局
		com.get('chessBox').style.display = 'block';
		com.get('menuBox').style.display = 'none';

		// 显示棋谱导航
		com.get('manualNav').style.display = 'flex';

		// 设置初始棋盘
		if (item.map) {
			play.init(4, item.map);
		} else {
			play.init(4);
		}

		// 回放棋谱
		if (item.moves && item.moves.length > 0) {
			play.replayManual(item.moves);
		}
	},

	escapeHtml: function(text) {
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}
};

// 页面加载完成后初始化收藏功能
window.addEventListener('DOMContentLoaded', () => {
	com.collection.init();
	com.collectionUI.init();
});

"use strict";

/* --------------------================-------------------- */
/*                    Utility  Functions                    */
/* --------------------================-------------------- */

(function() {
	function _generateElement(args, el) {
		let e = null;
		let _tci = args.shift().split(/\s*(?=[\.#])/); // tag, class, id
		if(/\.|#/.test(_tci[0])) e = el('div');
		_tci.forEach(function(v) {
			if(!e) e = el(v)
			else if(v[0] === '.') e.classList.add(v.slice(1))
			else if(v[0] === '#') e.setAttribute('id', v.slice(1))
		});
		function item(l) {
			switch (l.constructor) {
				case Array:
					l.forEach(item);
					break;
				case Object:
					for(let attr in l) {
						if(attr === 'style') {
							for(let style in l[attr]) {
								e.style[style] = l[attr][style];
							}
						}else if(attr.substr(0, 2) === 'on'){
							e.addEventListener(attr.substr(2), l[attr]);
						}else{
							e.setAttribute(attr, l[attr]);
						}
					}
					break;
				default:
					if(l.nodeType != undefined) e.appendChild(l)
    				else e.appendChild(document.createTextNode(l))
			}
		}
		while(args.length > 0) {
			item(args.shift());
		}
		return e;
	}

	window.h = function() {
		return _generateElement([].slice.call(arguments), function(tagName) {
			return document.createElement(tagName);
		});
	}

	window.svg = function() {
		return _generateElement([].slice.call(arguments), function(tagName) {
			return document.createElementNS('http://www.w3.org/2000/svg', tagName);
		});
	}
})(); // h, svg


/* --------------------================-------------------- */
/*                       Functions yo                       */
/* --------------------================-------------------- */

function save() {
	let lastStrokeNumber = 0;
	let actualStrokeNumber = 0;
	return `
	${drawing.size.x}, ${drawing.size.y} |
	${drawing.history.map(function(h) {
		if(h.strokeNumber !== lastStrokeNumber){
			actualStrokeNumber++;
			lastStrokeNumber = h.strokeNumber;
		}
		return `
		${h.coords.x}, ${h.coords.y},
		${h.color}, ${actualStrokeNumber}
		`
	}).join('|')}
	`.replace(/\s+/g, '');
}

/* --------------------================-------------------- */
/*                        UI Classes                        */
/* --------------------================-------------------- */

class Palette {
	constructor() {
		this.selected = 1;

		this.palette = [
			null,
			{ r: 0  , g: 0  , b: 0   },
			{ r: 34 , g: 32 , b: 52  },
			{ r: 69 , g: 40 , b: 60  },
			{ r: 102, g: 57 , b: 49  },
			{ r: 143, g: 86 , b: 59  },
			{ r: 223, g: 113, b: 38  },
			{ r: 217, g: 160, b: 102 },
			{ r: 238, g: 195, b: 154 },
			{ r: 251, g: 242, b: 54  },
			{ r: 153, g: 229, b: 80  },
			{ r: 106, g: 190, b: 48  },
			{ r: 55 , g: 148, b: 110 },
			{ r: 75 , g: 105, b: 47  },
			{ r: 82 , g: 75 , b: 36  },
			{ r: 50 , g: 60 , b: 57  },
			{ r: 63 , g: 63 , b: 116 },
			{ r: 48 , g: 96 , b: 130 },
			{ r: 91 , g: 110, b: 225 },
			{ r: 99 , g: 155, b: 255 },
			{ r: 95 , g: 205, b: 228 },
			{ r: 203, g: 219, b: 252 },
			{ r: 255, g: 255, b: 255 },
			{ r: 155, g: 173, b: 183 },
			{ r: 132, g: 126, b: 135 },
			{ r: 105, g: 106, b: 106 },
			{ r: 89 , g: 86 , b: 82  },
			{ r: 118, g: 66 , b: 138 },
			{ r: 172, g: 50 , b: 50  },
			{ r: 217, g: 87 , b: 99  },
			{ r: 215, g: 123, b: 186 },
			{ r: 143, g: 151, b: 74 },
			{ r: 138, g: 111, b: 48 },
		]; // dawnbringer 32 palette

		this.element = this.render();
	}

	rgbToString(c) {
		if(c.constructor === Number) c = this.palette[c];
		if(!c) return null;
		return `rgb(${c.r}, ${c.g}, ${c.b})`
	}

	selectColor(i) {
		document.querySelector(`[data-i="${this.selected}"]`).classList.remove('selected');
		document.querySelector(`[data-i="${i}"]`).classList.add('selected');
		this.selected = i;
	}

	render() {
		return h('div.palette', this.palette.map(function(c, i) {
			return h(`div.color${i===this.selected?'.selected':''}`, {
				'data-i': i,
				'onclick': this.selectColor.bind(this, i),
				'style': { 
					'background': c ? this.rgbToString(c) : ''
				},
			}, c ? '' : 'eraser');
		}.bind(this) ));
	}
}

class DrawingBoard {
	constructor(w, h) {
		this.data = {};
		this.history = [];

		this.size = {
			x: w || 16,
			y: h || 16
		}

		this.strokeNumber = 0;

		this.pixelSize = 16;

		this.element = this.render();
		this.updateSize();
	}

	globalToLocalPos(pos) {
		let bbox = this.svg.getBoundingClientRect();
		return {
			x: pos.x - bbox.left - window.scrollX,
			y: pos.y - bbox.top - window.scrollY
		}
	}

	posToPixelCoords(pos) {
		return {
			x: Math.floor(pos.x / this.pixelSize),
			y: Math.floor(pos.y / this.pixelSize)
		}
	}

	setPixel(coords, color) {
		let key = `${coords.x},${coords.y}`;
		let rgbString = palette.rgbToString(color)
		if(this.data[key] !== rgbString) {
			this.data[key] = rgbString;
			this.history.push({
				coords: coords,
				color: color,
				strokeNumber: this.strokeNumber,
				timestamp: new Date() * 1
			});

			if(rgbString) {
				this.getPixelElement(coords).setAttribute('fill', rgbString);
			} else {
				this.removePixelElement(coords);
			}

			preview.setHistory(this.history);
		}
	}

	getPixelElement(coords) {
		let element = this.svg.querySelector(`[data-coords="${coords.x},${coords.y}"]`);
		if(!element) {
			element = svg('rect', {
				'width': this.pixelSize, 'height': this.pixelSize,
				'x': coords.x * this.pixelSize, 'y': coords.y * this.pixelSize,
				'data-coords': `${coords.x},${coords.y}`,
			})
			this.svg.appendChild(element);
		}
		return element;
	}

	removePixelElement(coords) {
		let element = this.svg.querySelector(`[data-coords="${coords.x},${coords.y}"]`);
		if(element) {
			element.parentElement.removeChild(element);
		}
	}

	setPixelAtGlobalPos(pos, color) {
		let pixelCoords = this.posToPixelCoords(
			this.globalToLocalPos(pos)
		);
		this.setPixel(pixelCoords, color);
	}

	updateSize() {
		this.svg.setAttribute('width', this.size.x * this.pixelSize);
		this.svg.setAttribute('height', this.size.y * this.pixelSize);
	}

	render() {
		return h('div.drawingboard', [
			h('input', {
				type: 'number',
				value: this.size.x,
				onchange: function(e) {
					this.size.x = Number(e.target.value);
					this.updateSize();
				}.bind(this),
			}),
			h('input', {
				type: 'number',
				value: this.size.y,
				onchange: function(e) {
					this.size.y = Number(e.target.value);
					this.updateSize();
				}.bind(this),
			}),
			this.svg = svg('svg', {
				'onmousedown': function(e) {
					this.strokeNumber++;
				}.bind(this),
				'onclick': function(e) {
					this.setPixelAtGlobalPos({
						x: e.clientX,
						y: e.clientY
					}, palette.selected);
				}.bind(this),
				'onmousemove': function(e) {
					if(e.buttons === 1) { // checks if mouse is down? not sure if this works cross-browser
						this.setPixelAtGlobalPos({
							x: e.clientX,
							y: e.clientY
						}, palette.selected);
					}
				}.bind(this),
			}, [
				svg('defs', [
					svg('pattern #empty', { 
						'width': 5, 'height': 5,
						'patternUnits': 'userSpaceOnUse',
					}, [
						svg('line', {
							'x1': 0, 'y1': 0,
							'x2': 5, 'y2': 5,
							'stroke': '#CCCCCC',
						}),
						svg('line', {
							'x1': 0, 'y1': 5,
							'x2': 5, 'y2': 0,
							'stroke': '#CCCCCC',
						})
					])
				]),
				svg('rect', {
					'x': 0, 'y': 0, 'width': '100%', 'height': '100%',
					'fill': 'url(#empty)'
				})
			]),
		]);
	}
}

class PreviewCanvas {
	constructor() {
		this.element = this.render();

		this.ctx = this.canvas.getContext('2d');

		this.setHistory([]);
		this.updateCanvas();
	}

	setHistory(history) {
		this.data = {};
		this.history = JSON.parse(JSON.stringify(history)); // clone...
		this.frame = 0;
	}

	updateCanvas() {
		requestAnimationFrame(this.updateCanvas.bind(this));

		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		if(true) {
			this.frame++;
			if(this.frame > this.history.length) {
				this.frame = 0;
				this.data = {};
			}

			/*let pix = this.history[this.frame];

			this.data[`${p.coords.x},${p.coords.y}`]*/
			this.history.slice(0, this.frame).forEach(function(pix) {
				if(pix.color) {
					this.ctx.fillStyle = palette.rgbToString(pix.color);
					this.ctx.fillRect(pix.coords.x, pix.coords.y, 1, 1);
				} else {
					this.ctx.clearRect(pix.coords.x, pix.coords.y, 1, 1);
				}
			}.bind(this));
		}
	}

	render() {
		return h('div.panel', [
			this.canvas = h('canvas', {
				width: drawing.size.x,
				height: drawing.size.y,
				style: {
					width: `${drawing.size.x * 8}px`,
					height: `${drawing.size.y * 8}px`
				}
			})
		]);
	}
}

/* --------------------================-------------------- */
/*                        Init Vars                         */
/* --------------------================-------------------- */

let palette = new Palette();
let drawing = new DrawingBoard(16, 20);
let preview = new PreviewCanvas();

/* --------------------================-------------------- */
/*                          Render                          */
/* --------------------================-------------------- */

document.body.appendChild(h('div', [
	palette.element, drawing.element, preview.element
]));





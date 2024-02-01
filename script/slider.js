class Slider{

	constructor(width=DEFAULTWIDTH,height=DEFAULTHEIGHT){
		this.width = width;
		this.height = height;
				
		let tiles = this.width*this.height;
		this.board = new Array(tiles).fill(0).map((e,i)=>{return i});
		this.board[this.blankValue] = BLANKTILE;
	
	}
	
	onSolve(){
		
	}
	
	onError(){
		
	}
	
	get blankIndex(){
		return this.board.indexOf(BLANKTILE);
	}
	
	get blankValue(){
		return this.board.length - 1;
	}
	
	get isSolved(){
		let temp = clone(this.board).map((e)=>{
			return e==BLANKTILE?this.blankValue:e;
		});
		return JSON.stringify(temp)==JSON.stringify(clone(temp).sort((a,b)=>{
			return a-b;
		}));	
	}
	
	get canvas(){
		return document.getElementById("theCanvas");
	}
	
	get previewCanvas(){
		return document.getElementById("previewCanvas");
	}
	
	get ctx(){
		return this.canvas.getContext("2d");
	}
	
	get previewCtx(){
		return this.previewCanvas.getContext("2d");
	}
	
	get tileHeight(){
		return this.canvas.height / this.height;
	}
	
	get tileWidth(){
		return this.canvas.width / this.width;
	}
	
	get canvasContainer(){
		return document.getElementById("canvasContainer");
	}
	
	get scale(){
		return Math.min(this.canvasContainer.clientWidth / this.canvas.width , 800 / this.canvas.height);
	}
	
	get previewCanvasContainer(){
		return document.getElementById("previewCanvasContainer");
	}
	
	get previewScale(){
		return this.previewCanvasContainer.clientWidth / this.canvas.width;
	}
	
	get videoElement(){
		return document.getElementById("tempVideo");
	}
	
	loadImg(src,maintainState){
		this.img = new Image();
		this.img.onload = ()=>{
			if(isRemovedImage(this.img)){
				this.onError()
			}else{
				this.prepareBoard(maintainState);
			}
		};
		this.img.onerror = ()=>{
			this.onError();
		};
		this.img.src = src;
		this.animated = false;
	}
	
	loadVideo(src,maintainState){
		this.animated = true;
				
		this.videoElement.addEventListener('loadeddata', (e) => {
			if(this.videoElement.readyState >= 3){
				this.img = this.videoElement;
				this.img.height = this.videoElement.videoHeight;
				this.img.width = this.videoElement.videoWidth;
				this.prepareBoard(maintainState);
			}
		});
	
		this.videoElement.addEventListener('play',()=>{this.render();});
		this.videoElement.src = src;
	}
	
	
	
	handleClick(event){
		let x = Math.floor(event.offsetX / this.tileWidth);
		let y = Math.floor(event.offsetY / this.tileHeight);
		
		let index =  (y*this.width)+x;
			
		this.slideTile(index);
	}
	
	prepareBoard(maintainState){
		if(!maintainState){
			this.shuffle();
		}
		
		this.canvas.height = this.img.height;
		this.canvas.width = this.img.width;
	
		this.previewCanvas.height = this.img.height;
		this.previewCanvas.width = this.img.width;		

		this.canvas.onclick = (event)=>{
			this.handleClick(event);
		};
		
		this.canvas.style.cssText = `transform:scale(${this.scale});`;
		this.previewCanvas.style.cssText = `transform:scale(${this.previewScale});`;
	
		this.render();
		
		this.previewCanvas.classList.remove("hidePreview");
		this.togglePreview();
	}
	
	togglePreview(){
		this.previewCanvas.classList.toggle("hidePreview");
		this.renderPreview();
	}
	
	
	
	shuffle(){
		let c = 0;
		while(true){
			//select a random index
			let index = Math.floor(Math.random()*this.board.length);
			//see if it is legal
			if(this.isLegalMove(index)){
				this.board[this.blankIndex] = this.board[index];
				this.board[index] = -1;
			}
			c+=1;
			if(c > 10000 && Math.random() > 0.9999){
				break;
			}
		}
	}
	
	isLegalMove(index){
		let a = this.tileAt(index);
		let b = this.tileAt(this.blankIndex);
		
		return (a.x==b.x && (a.y==b.y-1||a.y==b.y+1))||(a.y==b.y && (a.x==b.x-1||a.x==b.x+1))
	}
	
	tileAt(index){
		return {
			x : index%this.height,
			y : Math.floor(index/this.height),
		}
	}
	
	slideTile(index){
		if(this.isSolved){
			this.onSolve();
			return;
		}else if(this.isLegalMove(index)){	
			this.board[this.blankIndex] = this.board[index];
			this.board[index] = -1;
			

			this.render();
			
		}
	}
	
	renderPreview(){
		if(!this.previewCanvas.classList.contains("hidePreview")){
			this.previewCtx.drawImage(this.img,0,0);
		}else{
			this.previewCtx.fillRect(0,0,this.previewCanvas.width,this.previewCanvas.height);
		}
	}
	
	render(){
		this.renderPreview();
		
		if(this.isSolved){
			this.ctx.drawImage(this.img,0,0);
		}else{
			let c = this.canvas;	
			for(let y=0;y<this.height;y++){
				for(let x=0;x<this.width;x++){
					let index = (y*this.width)+x;
					let tileToDraw = this.board[index];
					if(index==this.blankIndex){
						this.ctx.fillRect(x*this.tileWidth,y*this.tileHeight,this.tileWidth,this.tileHeight);
					}else{
						let s = this.tileAt(tileToDraw);
						let sx = s.x
						let sy = s.y
						this.ctx.drawImage(this.img,sx*this.tileWidth,sy*this.tileHeight,this.tileWidth,this.tileHeight,x*this.tileWidth,y*this.tileHeight,this.tileWidth,this.tileHeight);
					}
				}
			}
		}
		if(this.animated){
			setTimeout(() => {
				this.render();
			}, 0);
		}
	}
}
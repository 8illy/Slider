
let config = {
	width : 4,
	height : 4,
	
	scale : 1,
}


const limit = 100;//todo - paging

let redditMedia = [];
let redditMediaIndex = 0;


function restart(){
	redditMedia = [];
	redditMediaIndex = 0;
	
	config.width = Number(document.getElementById("boardWidth").value);
	config.height = Number(document.getElementById("boardHeight").value);
	
	let SORT = document.getElementById("redditSort").value; // top hot new rising controversial
	let DURATION = document.getElementById("redditDuration").value;//all year month week day hour
	let subsStr = document.getElementById("subreddits").value;
	let REDDIT_URL = `https://www.reddit.com/${subsStr}/${SORT}.json?sort=${SORT}&limit=${limit}&t=${DURATION}`;

	loadRedditImages(REDDIT_URL);
}

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

function shufflePuzzle(array){
	
	let c = 0;
	while(true){
		//select a random index
		let blankIndex = config.board.findIndex(findBlank);
		let index = Math.floor(Math.random()*array.length);
		//see if it is legal
		if(isLegalMovement(array,index)){
			config.board[blankIndex] = config.board[index];
			config.board[index] = -1;
		}
		c+=1;
		if(c > 10000 && Math.random() > 0.9999){
			break;
		}
	}
	
	return array;
}

function prepareConfig(){
	let sections = config.width*config.height;
	config.board = new Array(sections).fill(0).map(function(e,i){return i});
	let blank = config.board.length - 1;//Math.floor(Math.random() * config.board.length);
	config.blankValue = config.board[blank];
	config.board[blank] = -1;
	
	
	
	config.board = shufflePuzzle(config.board);
	
	
	
}

function clickPreview(){
	let e = document.getElementById("previewCanvas");
	e.classList.toggle("hidePreview");

	if(!e.classList.contains("hidePreview")){
		showPreview();
	}else{
		hidePreview();
	}
}

function showPreview(){
	config.previewCtx.drawImage(config.img,0,0);
}

function hidePreview(){
	config.previewCtx.fillRect(0,0,document.getElementById("previewCanvas").width,document.getElementById("previewCanvas").height);
}

function prepareBoard(event){

	

	let img = event?event.target:config.img;

	let c = document.getElementById("theCanvas");
	c.height = img.height;
	c.width = img.width;
	
	
	let c2 = document.getElementById("previewCanvas");
	c2.height = img.height;
	c2.width = img.width;

	config.previewCtx = document.getElementById("previewCanvas").getContext("2d");
	config.ctx = c.getContext("2d");
	config.tileHeight = c.height / config.height;
	config.tileWidth = c.width / config.width;
	c.onclick = handleCanvasClick;
	
	config.img = img;
	
	
	let containerWidth = document.getElementById("canvasContainer").clientWidth;
	config.scale = Math.min(containerWidth / c.width , 800 / c.height);
	c.style.cssText = `transform:scale(${config.scale});`;
	
	let previewContainerWidth = document.getElementById("previewCanvasContainer").clientWidth;
	config.previewScale = previewContainerWidth / c.width
	c2.style.cssText = `transform:scale(${config.previewScale});`;

	renderBoard();
	
	document.getElementById("previewCanvas").classList.remove("hidePreview");
	clickPreview();
}

function findBlank(e){
	return e==-1;
}


function handleCanvasClick(event){
	let c = document.getElementById("theCanvas");
	
	let x = Math.floor(event.offsetX / config.tileWidth);
	let y = Math.floor(event.offsetY / config.tileHeight);
	
	let index =  (y*config.width)+x;
		
	slideTile(index);
	
}

function handleCanvasClickEDIT(event){
	let c = document.getElementById("theCanvas");
	let tileX = Math.floor(event.x / (config.tileWidth * config.scale));
	let tileY = Math.floor(event.y / (config.tileHeight * config.scale));
	let index =  (tileY*config.width)+tileX;	
	slideTile(index);
	//redditMediaIndex+=1;//joke option
	//showImage();//joke option
}

function indexToXY(index){
	return {
		x : index%config.height,
		y : Math.floor(index/config.height),
	}
}

function isLegalMovement(array,index){
	let blankIndex = array.findIndex(findBlank);
	let a = indexToXY(index);
	let b = indexToXY(blankIndex);
	
	return (a.x==b.x && (a.y==b.y-1||a.y==b.y+1))||(a.y==b.y && (a.x==b.x-1||a.x==b.x+1))
}

function slideTile(index){
	if(isSolved()){
		nextImage();
		return;
	}
	
	if(isLegalMovement(config.board,index)){
		let blankIndex = config.board.findIndex(findBlank);

		config.board[blankIndex] = config.board[index];
		config.board[index] = -1;
		
		if(isSolved()){
			config.ctx.drawImage(config.img,0,0);
		}else{
			renderBoard();
		}
	}
}

function renderBoard(){
	let c = document.getElementById("theCanvas");
	
	if(config.isGfy){
		//get the current frame to display
		
	}
	
	for(let y=0;y<config.height;y++){
		for(let x=0;x<config.width;x++){
			let index = (y*config.width)+x;
			let tileToDraw = config.board[index];
			if(tileToDraw == -1){
				config.ctx.fillRect(x*config.tileWidth,y*config.tileHeight,config.tileWidth,config.tileHeight);
			}else{
				let s = indexToXY(tileToDraw);
				let sx = s.x
				let sy = s.y
				config.ctx.drawImage(config.img,sx*config.tileWidth,sy*config.tileHeight,config.tileWidth,config.tileHeight,x*config.tileWidth,y*config.tileHeight,config.tileWidth,config.tileHeight);
			}
		}
	}

}

function isSolved(){
	let temp = clone(config.board).map(function(e){return e==-1?config.blankValue:e});
	return JSON.stringify(temp)==JSON.stringify(clone(temp).sort((a,b)=>{return a-b}));	
}

function clone(a){
	return JSON.parse(JSON.stringify(a));
}

function drawImg(src,isGfy){
	let img = new Image();
	img.onload = (event)=>{
		if(isRemovedImage(img)){
			nextImage();
		}else{
			prepareBoard(event);
		}
	};
	img.onerror = nextImage;
	img.src = src;
	config.image = src;
	config.isGfy = isGfy;
	

}

function isRemovedImage(img){
//imgur image removed
	if( img.width==161 && img.height==81){
		return true;
	};
	
//reddit image removed
	if( img.width==130 && img.height==60){
		return true;
	};
	
	return false;

}


///////////////////////////////////////

function doRequest(url,callback){
	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState == 4) {
			callback(JSON.parse(this.responseText));
		}
	};
	//proxy this here.
	xhr.open("GET", url, true);
	xhr.send();
}

function loadRedditImages(REDDIT_URL){
	
	doRequest(REDDIT_URL,loadedRedditImages);
}

function loadedRedditImages(data){
	let posts = data.data.children;
	
	redditMedia = redditMedia.concat(posts);
	
	shuffle(redditMedia)
	prepareConfig();
	showImage();
}

function nextImage(){
	redditMediaIndex+=1;
	prepareConfig();
	showImage();
}

function setMediaTitle(media){
	document.getElementById("redditTitle").href="https://old.reddit.com/"+media.data.permalink;
	document.getElementById("redditTitle").innerText=media.data.title;
}

function showImage(){
	let media = redditMedia[redditMediaIndex];
	
	if(!media.data.url_overridden_by_dest || media.data.secure_media!=null){
		return nextImage();
	}
		
	if(media.data.domain=="gfycat.com"||media.data.domain=="redgifs.com"){
		if(!document.getElementById("allowGFY").checked){
			return nextImage();
		}
		loadGfy(media.data.url);
	}else{
		var redditMp4 = getRedditMP4(media);
		var redditLink = getRedditLink(media);
		var extLink = media.data.url_overridden_by_dest;
		
		if(redditMp4 && document.getElementById("animateGif").checked){
			//drawVideo(redditMp4)
			drawVideo("https://cors-anywhere.herokuapp.com/"+redditMp4)
		}else{
			drawImg(redditLink?redditLink:extLink);
		}
		
	}
	
	setMediaTitle(media);

}

function getRedditMP4(media){
	try{
		return media.data.preview.images[0].variants.mp4.source.url.replace(/&amp;/,"&");
	}catch(err){
		return false;
	}
}

function getRedditLink(media){
	try{
		return media.data.preview.images[0].source.url.replace(/&amp;/,"&");
	}catch(err){
		return false;
	}
}

function drawVideo(url){
	config.isGfy = true;
	let videoElement = document.getElementById("tempVideo");
		
	videoElement.addEventListener('loadeddata', (e) => {
		if(videoElement.readyState >= 3){
			console.log("loaded");
			config.img = videoElement;
			config.img.height = videoElement.videoHeight;
			config.img.width = videoElement.videoWidth;
			prepareBoard();
		}
	});
	
	videoElement.addEventListener('play',rerenderFrame);
	videoElement.src = url;
}

function loadGfy(mediaUrl){
	let BASE_URL = (new URL(mediaUrl)).host.replace("www.","");
	let gfyId = mediaUrl.split("/");
	gfyId = gfyId[gfyId.length-1];
	gfyId = gfyId.split(/[^a-zA-Z]/g)[0];
	let url = `https://api.${BASE_URL}/v1/gfycats/${gfyId}`;
	
	doRequest(url,function(data){
		drawVideo(data.gfyItem.mp4Url);
	});
	
}

function rerenderFrame(){

	if(isSolved()){
		config.ctx.drawImage(config.img,0,0);
	}else{
		renderBoard();
	}
	let e = document.getElementById("previewCanvas");
	if(!e.classList.contains("hidePreview")){
		showPreview();
	}else{
		hidePreview();
	}
	if(config.isGfy){
		setTimeout(() => {
			rerenderFrame();
		}, 0);
	}
}


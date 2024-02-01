
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

function clone(a){
	return JSON.parse(JSON.stringify(a));
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

function redditItem(item){
	return item.data;
}

function getRedditMP4(media){
	try{
		return media.preview.images[0].variants.mp4.source.url.replace(/&amp;/,"&");
	}catch(err){
		return false;
	}
}

function getRedditLink(media){
	try{
		return media.preview.images[0].source.url.replace(/&amp;/,"&");
	}catch(err){
		return false;
	}
}




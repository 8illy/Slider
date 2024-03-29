class Game{
	
	constructor(){
		this.reddit = new Reddit();
		this.restart();
	}
	
	
	get redditSort(){
		return document.getElementById("redditSort").value; // top hot new rising controversial;
	}
	
	get redditTime(){
		return document.getElementById("redditDuration").value; //all year month week day hour
	}
	
	get redditPage(){
		return document.getElementById("subreddits").value;
	}
	get proxy(){
		return document.getElementById("proxy").value;
	}
	
	get allowGfy(){
		return document.getElementById("allowGFY").checked;
	}
	
	get animateGifs(){
		return document.getElementById("animateGif").checked;
	}
	
	get redditTitle(){
		return document.getElementById("redditTitle");
	}
	
	restart(){

		this.reddit.sort = this.redditSort;
		this.reddit.time = this.redditTime;
		this.reddit.page = this.redditPage;
		
		this.reddit.clearMedia();
		
		this.reddit.load(()=>{
			if(this.slider){
				delete this.slider;
			}
			this.slider = new Slider();
			
			this.slider.onSolve = ()=>{
				this.loadNextRedditMedia();
			}
			
			this.slider.onError = this.slider.onSolve;
			
			this.loadNextRedditMedia();
		});
	}
	
	refresh(){
		--this.reddit.counter;
		this.loadNextRedditMedia(true);
	}
	
	setMediaTitle(media){
		this.redditTitle.href="https://old.reddit.com/"+media.permalink;
		this.redditTitle.innerText=media.title;
	}
	
	loadNextRedditMedia(maintainState){
		let media = this.reddit.nextItem;

		if(!media){
			alert("out of options");
			return;
		}
		let extLink = media.url_overridden_by_dest;
		if(!extLink /*|| media.secure_media!=null*/){
			return this.loadNextRedditMedia(maintainState);
		}
		
		if(media.domain=="gfycat.com"||media.domain=="redgifs.com"){
			if(!this.allowGfy){
				return this.loadNextRedditMedia(maintainState);
			}
			this.loadGfy(media.url,(url)=>{
				this.slider.loadVideo(this.proxy+"/"+url,maintainState);
			});
			
		}else{
			let redditMp4 = getRedditMP4(media);
			let redditLink = getRedditLink(media);
			
			if(redditMp4 && this.animateGifs){
				this.slider.loadVideo(this.proxy+"/"+redditMp4,maintainState)
			}else{
				this.slider.loadImg(redditLink?redditLink:extLink,maintainState);
			}
		}
		
		this.setMediaTitle(media);
	}
	
	loadGfy(mediaUrl,cb){
		let BASE_URL = (new URL(mediaUrl)).host.replace("www.","");
		let gfyId = mediaUrl.split("/");
		gfyId = gfyId[gfyId.length-1];
		gfyId = gfyId.split(/[^a-zA-Z]/g)[0];
		let url = `${this.proxy}/api.${BASE_URL}/v1/gfycats/${gfyId}`;
		
		doRequest(url,function(data){
			cb(data.gfyItem.mp4Url);
		});
	
	}
}
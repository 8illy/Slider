class Reddit{
	
	constructor(page="/r/cats",sort="new",time="all"){
		this.page = page;
		this.sort = sort;
		this.time = time;
		
		this.clearMedia();
	}
	
	get after(){
		return this.media[this.media.length-1]?.id;
	}
	
	get url(){
		return `https://www.reddit.com/${this.page}.json?sort=${this.sort}&t=${this.time}&limit=100&after=${this.after}`
	}
	
	get nextItem(){
		return this.media[this.counter++];
	}
	
	clearMedia(){
		this.counter = 0;
		this.media = [];
	}
	
	load(cb){
		doRequest(this.url,(data)=>{
			this.loaded(data,cb);
		});
	}
	
	loaded(data,cb){
		let posts = shuffle(data.data.children.map(redditItem));
	
		this.media = this.media.concat(posts).filter((item,index,arr)=>{
			return arr.findIndex((e)=>{
				return e.id == item.id;
			}) == index;
		});
		
		if(cb){
			cb();
		}
	
	}
	
}
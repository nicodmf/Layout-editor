/** 
 * This class not really used, this is just an exemple
 * of implementation.
 */
var LayoutEditData = new Class({
	Extends: LayoutEditContener,
	initialize: function(contener){
		this.setContener(contener);
		this.name = "";
		this.type = "";
		this.content = "";
	},
	setContener: function(contener){
		this.contener = contener;
	},
	/**
	 * Load can only be from an javascript object
	 * @var object
	 */
	load: function(obj){
		this.name = obj.name
		this.type = obj.type
		this.content = obj.content
	},
	getParameters: function(){
		return new Array('type', 'name', 'content');
	}
	getChilds: function(){
	},
	addChilds: function(child){
		this.childs[] = child;
	}
	/**
	 * Save this contener in specified format
	 * Warning json format return string not enclosed, without childs elements
	 * @var type string json,css,html
	 */
	save: function(type){
		switch(type){
			case 'json' : return this.saveJson();
			case 'html' : return this.saveHtml();
			case 'css' : return this.saveCss();
		}
	},
	saveJson: function(){
		return "name:"+this.name+",type:"+this.type+",\n"
	},
	saveHtml: function(){
		var parameters = this.getParameters();
		var htmlParameters = "";
		for(p in parameters){
			eval("var value=this.p");
			htmlParameters+= "data-"+p+'="'+value+'" ';
		}		
		return '<div class="contener '+this.type+'" '+htmlParameters+'>'+this.content+"</div>"
	},
	saveCss: function(){
		return ".contener."+this.type+"{"+"}\n";
	},	
	getElements: function(){
		return this.getChilds();
	}
})
var LayoutEditContener = new Class({
	//Extends: Element,
	automatic:true,
	type:"px",
	realWidth:0,
	
	initialize: function(tagname, options){
		this.parent(tagname);
	},
	editInPlace: function(e){
		var el = e
		el.addEvent('dblclick',function(e) {
			//store "before" message
			var before = el.get('html').trim();
			//erase current
			el.set('html','');
			//replace current text/content with input or textarea element
			var input = new Element('input', { 'class':'box', 'value':before });
			//console.log(this)
			input.addEvent('keydown', function(e) { if(e.key == 'enter') { this.fireEvent('blur'); } });
		
			input.inject(el).select();
			//add blur event to input
			input.addEvent('blur', function() {
				//get value, place it in original element
				val = input.get('value').trim();
				el.addClass(val != '' ? '' : 'editable-empty');
				el.obj.setTitle(val)
			});
		});
	},
	createTitle:function(){
		this.title = new Element('p').set('text', this.name).addClass('title')
		this.title.obj = this;
		this.editInPlace(this.title);
		this.e.adopt(this.title);
	},
	setTitle:function(name){
		this.le.updateSave = new Date();
		this.e.getElement("p").set("text", name);
		this.name = name;
	},
	
	sets: function(obj){ for (var at in obj) eval("this."+at+"="+obj[at]);},
	toElement: function(){ return this.e;},
	paddings: function(){ return this.e.getStyle('padding-left').toInt()+this.e.getStyle('padding-right').toInt();},
	diffReal: function(){ return this.paddings()+this.borders()+this.margins();},
	getWidth: function(real){ return real?this.realWidth:this.e.getStyle("width").toInt();},
	margins: function(){ return this.e.getStyle('margin-left').toInt()+this.e.getStyle('margin-right').toInt();},
	borders: function(){ return this.e.getStyle('border-left').toInt()+this.e.getStyle('border-right').toInt();},
	getSpecialHtml: function(){ return "";},
	getSpecialJson: function(){ return "";},
	getCss: function(id){ return id+" ."+this.name+"{"+"}";},
	getClasses: function(){ return this.type+(this.e.hasClass('contener')==true?" final":"");},

	setMinWidth: function(w){
		this.minWidth = w;
		if(this.le.canvas!=this.e)
			this.ref.testMinWidth(w+this.diffReal());
	},
	testMinWidth: function(w){
		var ls = this.e.getElements('layer');
		var max = 0;
		for(var i; i<ls.length; i++){
			var sumDiff=0;
			var ele = ls[i].obj;
			while(this!=ele){
				sumDiff += ele.diffReal();
				ele = ele.ref;
			}
			max = Math.max(ls[i].obj.minWidth +sumDiff, max);
		}
		if(this.minWidth==undefined || max<w)
			this.setMinWidth(w);
	},
})
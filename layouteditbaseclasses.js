var appHistory = new Class({
	
})
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
				el.set('text',val).addClass(val != '' ? '' : 'editable-empty');
				el.obj.setTitle(val)
			});
		});
	},
	createTitle:function(){
		this.title = new Element('p').set('text', this.name)
		this.title.obj = this;
		this.editInPlace(this.title);
		this.e.adopt(this.title);
	},
	setTitle:function(name){
		this.le.updateSave = new Date();
		this.name = name
	},
	toElement: function(){
		return this.e
	},
	sets: function(obj){
		for (var at in obj) eval("this."+at+"="+obj[at]);
	},
	margins: function(){
		return this.e.getStyle('margin-left').toInt()+this.e.getStyle('margin-right').toInt()
	},
	paddings: function(){
		return this.e.getStyle('padding-left').toInt()+this.e.getStyle('padding-right').toInt();
	},
	borders: function(){
		return this.e.getStyle('border-left').toInt()+this.e.getStyle('border-right').toInt();
	},
	diffReal: function(){
		return this.paddings()+this.borders()+this.margins();
	},
	getWidth: function(real){
		return real?this.realWidth:this.e.getStyle("width").toInt();
	},
	getSpecialHtml:function(){
		return "";
	},
	getSpecialJson:function(){
		return "";
	},
	getCss:function(id){
		//return "#"+this.name+"{"+"}";
		return id+" ."+this.name+"{"+"}";
	},
	getClasses:function(){
		return this.type+(this.e.hasClass('contener')==true?" final":"");
	},
	setMinWidth: function(w){
		this.minWidth = w
		if(this.le.canvas!=this.e)
			this.ref.testMinWidth(w+this.diffReal())
	},
	testMinWidth: function(w){
		var ls = this.e.getElements('layer')
		var max = 0
		for(var i; i<ls.length; i++){
			var sumDiff=0;
			var ele = ls[i].obj 
			while(this!=ele){
				sumDiff += ele.diffReal();
				ele = ele.ref
			}
			max = Math.max(ls[i].obj.minWidth +sumDiff, max)
		}
		if(this.minWidth==undefined || max<w)
			this.setMinWidth(w)
	},

})

var LayoutEditToolbar = new Class({
	Implements: [Options], // Classes implémentées
	options : {
		'toolbar_lin':['add_top', 'add_bottom', 'add_inside_left', 'add_inside_right', 'del_lin', 'pro_lin'],
	   	'toolbar_col':['add_left', 'add_right', 'add_inside_top', 'add_inside_bottom', 'del_col', 'pro_col']
	},
	
})

var LayoutEditMesureBox = new Class({
	initialize: function(col){
		this.initEvent();
		this.col = col
		this.coo = col.obj
		this.line = col.obj.line
		this.ec = new Element('div').addClass('mesures');
		this.e = new Element('div').addClass('contener').inject(this.ec);

		this.fd = new Element('div').addClass('fixed');
		this.md = new Element('div').addClass('mesuresM activ');
		this.pd = new Element('div').addClass('mesuresP');

		this.fd.inject(this.e)
		this.md.inject(this.e)
		this.pd.inject(this.e)
		
		this.f = new Element('a').set('title', texts.lebm_val_fixe).set('href','#').inject(this.fd);
		this.m = new Element('a').set('title', texts.lebm_val_pixe).inject(this.md);
		this.p = new Element('a').set('title', texts.lebm_val_pour).set('href','#').inject(this.pd);
		
		this.f.addEvent("click", this.choiceFixed.Bind);
		this.m.addEvent("click", this.choiceUnit.Bind);
		this.p.addEvent("click", this.choiceUnit.Bind);

		this.val = new Element('span').addClass('mesure_val').inject(this.m);
		this.type = new Element('span').set('text',"px").addClass('mesure_type').inject(this.m);

		this.valP = new Element('span').addClass('mesure_valP').inject(this.p);
		this.typeP = new Element('span').set('text',"%").addClass('mesure_typeP').inject(this.p);
		
		this.setActiv('p');
		
		this.ec.inject(col);
	},
	choiceUnit: function(e){
		this.coo.le.updateSave = new Date();
		if($(e.target).getParent("div").hasClass("mesuresM")){
			this.setActiv("m")
			this.setFixed(true);
		}else{
			this.setActiv("p")
			this.setFixed(false);
		}
		e.stop();
		return false
	},
	choiceFixed:function(e){
		this.coo.le.updateSave = new Date();
		if(this.ec.hasClass('fixed')){
			this.setFixed(false)
		}else{
			this.setFixed(true)
		}
		return false
	},
	setFixed:function(fixed){
		if(fixed){
			this.coo.realWidthFixed=true
			this.ec.addClass('fixed')		
		}else{
			this.coo.realWidthFixed=false
			this.ec.removeClass('fixed')
			this.coo.le.fixColumns(this.coo)
		}
	},
	setActiv:function(activ){
		if(activ=="p"){
			this.pd.addClass('activ')
			this.md.removeClass('activ')
			this.m.set('href','#')
			this.p.set('href',null)
			this.coo.realWidthUnit = "pourcent"
			this.md.inject(this.e)
		}
		if(activ=="m"){
			this.md.addClass('activ')
			this.pd.removeClass('activ')
			this.m.set('href',null)
			this.p.set('href','#')
			this.coo.realWidthUnit = "mesure"
			this.pd.inject(this.e)
		}	
	},
	set:function(val, pour, activ){
		if(val>120)this.e.setStyles({'position':null,'right':null,'top':null})
		else if(val>85)this.e.setStyles({'position':'absolute','right':'1px','top':null})
		else this.e.setStyles({'position':null,'top':'23px'})
		this.val.set('text',this.col.obj.le.round(val));
		this.valP.set('text',this.col.obj.le.round(pour));
		this.setActiv(activ)
	},
	initEvent: function(){
		this.choiceFixed.Bind = this.choiceFixed.bind(this);
		this.choiceUnit.Bind = this.choiceUnit.bind(this);
	}
})

var LayoutEditColumn = new Class({
	Extends: LayoutEditContener,
	initialize: function(ref, position, pseudoRef, layoutEdit){
		this.type = "col"
		this.le = layoutEdit
		this.minWidth = this.le.minWidths
		this.ref = ref.obj
		this.line = ref.obj
		this.id = layoutEdit.getId();
		this.name = 'col_'+this.id
		this.e = new Element('div');
		this.e.obj = this
		this.createColumn(ref, position, pseudoRef);
		this.llupdate = new Date();
	},
	createColumn : function(ref, position, pseudoRef){
		if(!pseudoRef)pseudoRef=ref;
		
		//Création de la colonne
		this.e.set('id', 'col_'+this.id).addClass('col layer contener')
		this.createTitle();
		
		//Intégration de la colonne
		this.e.inject(pseudoRef, position);
		
		//Création de la boite de mesure et de l'objet mesure
		this.lemb = new LayoutEditMesureBox(this.e)
		
		//
		this.realWidthUnit = "pourcent"
		this.realWidthFixed = false
		//Application des largeurs
		this.le.fixColumns(this);
		

		//Enregistrement de la largeur réelle
		this.updateDiff();

		//Suppression de la qualité de conteneur final
		ref.removeClass('contener');
		
		//Création des évènements outils
		this.e.getFirst('p').addEvent('mouseover', function(e){
				$('toolbar_lin').removeClass('visible')
				$('toolbar_col').addClass('visible').inject(this.le.findParent(e.target), 'top');
				e.stop()
			}.bind(this)
		)
		this.e.addEvent('mouseleave', function(e){$('toolbar_col').removeClass('visible')})
		
		//Création des mouvements
		this.le.createMoves();
		
		//Création des évènements de glisse
		this.le.createDragCols(this);
	},
	updateDiff: function(){
		this.diffWidth =  this.realWidth - this.getWidth();
	},
	setDisplayWidth: function(){
		this.realWidthPourcent = this.realWidth*100/this.line.realWidth
		this.lemb.set(this.realWidth, this.realWidthPourcent)
		
	},
	setDisplayWidthChanged: function(w){
		this.width = w
		this.realWidth = w + this.diffWidth
		this.setDisplayWidth()		
	},
	getChilds:function(){
		return this.getLines();
	},
	getLines:function(){
		if(this.le.update==this.llupdate)
			return this.lines;
		this.llupdate = this.le.update			
		this.lines = new Array();
		this.e.getChildren(".layer.lin").each(
			function(e){
				this.lines.push(e.obj)
			}, this
		)
		return this.lines;
	},
	getSpecialJson:function(){
		if(this.realWidthUnit=="pourcent")
			var w="'unit':'pourcent', 'width':"+this.realWidthPourcent+","
		else
			var w="'unit':'pixel', 'width':"+this.realWidth+","
		return "'fixed':"+(this.realWidthFixed?"true":"false")+", "+w;
	},
	getCss:function(id){
		var w = this.realWidthUnit == "pourcent" ? Math.round(this.realWidthPourcent*100)/100 : this.le.round(this.realWidth);
		var u = this.realWidthUnit == "pourcent" ? "%": "px"
		//return "#"+this.name+"{"+"}";
		return id+" ."+this.name+"{width:"+w+u+";}";
	}
})

var LayoutEditLine = new Class({
	Extends: LayoutEditContener,
	initialize: function(ref, position, pseudoRef, layoutEdit){
		this.type = "lin"
		this.le = layoutEdit
		this.minWidth = this.le.minWidths
		this.ref = ref.obj
		this.col = ref.obj
		this.id = layoutEdit.getId();
		this.name = 'lin_'+this.id
		this.e = new Element('div');
		this.e.obj = this
		this.createLine(ref, position, pseudoRef);
		this.lcupdate = new Date();
	},		
	createLine : function(ref, position, pseudoRef){
		if(!pseudoRef)pseudoRef=ref;
		//Création de la ligne
		this.e.set('id', 'lin_'+this.id).addClass('lin layer contener');
		this.createTitle();
		
		//Enregistrement de la largeur réelle
		this.realWidth = ref.obj.realWidth
		this.width = this.getWidth();
		this.diffWidth = this.realWidth - this.width;

		//Création du clearer
		new Element("div").addClass("clearer").inject(this.e);

		//Injection de la ligne dans le dom
		this.e.inject(pseudoRef, position);
		
		//Suppression de la qualité de conteneur final
		ref.removeClass('contener');
		
		//Création des évènements outils
		this.e.getFirst('p').addEvent('mouseover', function(e){
			//var p=this.le.findParent(e.target);
			if(this.e.getParent()==this.le.element)
				$('toolbar_lin').addClass('canvas');
			else
				$('toolbar_lin').removeClass('canvas');
			$('toolbar_col').removeClass('visible')
			$('toolbar_lin').addClass('visible').inject(this,'top');
			e.stop();
		}.bind(this));
		this.e.addEvent('mouseleave', function(e){$('toolbar_lin').removeClass('visible')})
		//Création des mouvements
		this.le.createMoves();
		//Suppression des évènement de colonne
		this.e.addEvent('mouseover', function(evt){evt.stop()})
	},
	setWidth: function(w){
		this.width = w
		this.realWidth = w + this.diffWidth
	},
	getWidth: function(real){
		return real?this.realWidth:this.e.getStyle("width").toInt();
	},
	getChilds:function(){
		return this.getCols();
	},
	getCols:function(){
		if(this.le.update==this.lcupdate)
			return this.cols;
		this.lcupdate = this.le.update			
		this.cols = null;
		this.cols = new Array();
		this.e.getChildren(".layer.col").each(
			function(e){
				this.cols.push(e.obj)
			}, this
		)
		return this.cols;
	},
	getColsBorders: function(){
		var cols = this.getCols();
		var b =0
		for(var c=0; c<cols.length; c++){
			b+=cols[c].borders()
			b+=cols[c].margins()
			b+=cols[c].paddings()
		}
		return b;
	},
	getSpecialHtml:function(){
		if(this.e.hasClass('contener')!=true || this.le.canvas==this)
			return '<div class="clearer"></div>';
		return "";
	},
})


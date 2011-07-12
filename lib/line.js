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
		this.moveButton = new Element("div").addClass("move button").inject(this.e)
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
		
		this.showMoveButton.Bind = this.showMoveButton.bind(this);
		this.hideMoveButton.Bind = this.hideMoveButton.bind(this);
		this.e.addEvent('mouseover', this.showMoveButton.Bind)
		this.e.addEvent('mouseleave', this.hideMoveButton.Bind)
	},
	showMoveButton: function(evt){
		if(this.le.move)return;
		if(this.le.canvas.obj == this)return;
		this.le.canvas.getElements('.move.button').removeClass('visible');
		this.moveButton.addClass('visible');
		this.moveButton.addEvent('mousedown', this.le.mov_lin.Bind);
		evt.stop();
	},
	hideMoveButton: function(evt){
		if(this.le.move)return;
		if(this.le.canvas.obj == this)return;
		this.moveButton.removeClass('visible');
		this.moveButton.removeEvent('mousedown', this.le.mov_lin.Bind);
		evt.stop();
	},
	setWidth: function(w){
		this.width = w
		this.realWidth = w + this.diffWidth
	},
	setRealWidth: function(w){
		this.realWwidth = w
		this.width = w - this.diffWidth
	},
	getWidth: function(real){
		return real?this.realWidth:this.e.getStyle("width").toInt();
	},
	getChilds:function(){
		return this.getCols();
	},
	getCols:function(force){
		force = force == true ? true : false;
	//	if(this.le.update==this.lcupdate && ! force)
	//		return this.cols;
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

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
		this.moveButton = new Element("div").addClass("move button").inject(this.e)
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
		
		this.showMoveButton.Bind = this.showMoveButton.bind(this);
		this.hideMoveButton.Bind = this.hideMoveButton.bind(this);
		this.e.addEvent('mouseover', this.showMoveButton.Bind)
		this.e.addEvent('mouseleave', this.hideMoveButton.Bind)
	},
	showMoveButton: function(evt){
		if(this.le.move==true)return;
		if(this.le.canvas.obj == this)return;
		this.le.canvas.getElements('.move.button').removeClass('visible');
		this.moveButton.addClass('visible');
		this.moveButton.addEvent('mousedown', this.le.mov_col.Bind);
		evt.stop();
	},
	hideMoveButton: function(evt){
		if(this.le.move==true)return;
		if(this.le.canvas.obj == this)return;
		this.moveButton.removeClass('visible');
		this.moveButton.removeEvent('mousedown', this.le.mov_col.Bind);
		evt.stop();
	},
	updateDiff: function(){
		this.diffWidth =  this.realWidth - this.getWidth();
	},
	setDisplayWidth: function(){
		this.realWidthPourcent = this.realWidth*100/this.line.realWidth
		this.lemb.set(this.realWidth, this.realWidthPourcent)
		
	},
	setWidth: function(width, unit, fixe){
		this.realWidthUnit = unit
		this.realWidthFixed = fixe
		if(unit=="pourcent"){
			this.realWidthPourcent = width
			this.realWidth = this.realWidthPourcent/100*this.line.realWidth
			this.lemb.setActiv("p")
		}else{
			this.realWidth = width
			this.lemb.setFixed(fixe);
			this.lemb.setActiv("m")
		}
		this.e.setStyle('width',(this.realWidth-this.diffWidth)+"px");
		this.setDisplayWidth()
		lines = this.getLines();
		for(var i=0; i<lines.length; i++){
			lines[i].setRealWidth(width);
		}
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
//		if(this.le.update==this.llupdate)
//			return this.lines;
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

/**
 * Table Edit
 * ----------
 *
 * Un editeur de table fait en div
 */
/**
 * La classe elle-même
 */
var LayoutEdit = new Class({
	Implements: [Options], // Classes implémentées
	/**
	 * Options par défaut
	 *
	 */
	options : {
		'toolbar_lin':['add_inside_left', 'add_inside_right', 'add_top', 'add_bottom', 'del_lin'/*, 'pro_lin'*/],
	   	'toolbar_col':['add_inside_top', 'add_inside_bottom', 'add_left', 'add_right', 'del_col'/*, 'pro_col'*/],
	   	'toolbar_can':['view_just_conteners']
	},
	/**
	 * Constructeur
	 * @param element : l'élément à construite
	 * @param options : divers options réécrivants les options d'origines
	 */
	initialize : function(element, options){
		this.element = element;
		var eid = this.element.get("id");
		var ecs = this.element.get("class").replace(" ", ".");;
		this.id=(eid!=""?"#"+eid:"")+(ecs!=""?"."+ecs:"")
		this.element.setStyle("position","relative").addClass("le")
		this.element.obj = new Object();
		this.element.obj.realWidth = this.element.getStyle('width').toInt();
		this.update = new Date()
		this.updateSave = new Date();
		this.updateSaved = new Date();
		this.lines = new Array();
		this.columns = new Array();
		this.sortables = new Array();
		this.draggable = new Array(),
		this.setOptions(options);
		this.initEvent();
		this.ids = 0;
		this.minWidths = 50;
		this.canvas = this.createLine(this.element, 'top');
		this.createColumn(this.canvas, 'top');
		this.tl = this.createToolBar('toolbar_lin');
		this.tc = this.createToolBar('toolbar_col');
		this.tC = this.createToolBar('toolbar_can');
		this.createCanvasTitle(this.element.obj.realWidth);
		this.createMoveBar('right');
		this.createMoveBar('left');
		this.css = "";
		this.html = "";
		this.json = "";
		this.headCss = ".clearer{clear:both;height:0px; min-height:0px;font-size:0px}\n"+
					   ".col{float:left}\n";
	},
	createCanvasTitle : function(width){
		var canvasTitle = new Element("p").addClass("title canvas").set('text', 'Canvas - '+width+'px').inject(this.element);
	},
	save:function(){
		if(this.update > this.updateSaved)
			this.saveReal();
		if(this.updateSave > this.updateSaved)
			this.saveReal();
		return true;		
	},
	saveReal : function(){
		this.updateSaved = new Date();
		this.updateSave = this.updateSaved;
		var result = this.saveWalk(this.canvas.obj, 0);
		this.css = this.headCss+result.css		
		this.html = result.html;
		this.json = result.json;
		
	},
	returnTab : function(n){
		r="";
		for(var i=0; i<n; i++)
			r+="\t";
		return r;
	},
	saveWalk:function(el, niv){
		var t = this.returnTab(niv)
		var childs = el.getChilds();
		var obj = new Object()
		niv++
		obj.css = el.getCss(this.id)+"\n";
		//obj.html = t+'<div id="'+el.name+'" class="'+el.getClasses()+'">\n';
		obj.html = t+'<div data-title="'+el.name+'" class="'+el.name+' '+el.getClasses()+'">\n';
		
		obj.json = t+'{ \n';
		obj.json += t+"\t\'name\':'"+el.name+"', \'type\':'"+el.type+"',\n";
		var s=el.getSpecialJson()
		obj.json += s!=""?t+"\t"+s+"\n":"";
		if(childs.length>0)
			obj.json += t+"\t'elements' : [\n";
		
		for(var i=0; i<childs.length; i++){
			var res = this.saveWalk(childs[i], niv);
			obj.css += res.css;
			obj.html += res.html;			
			obj.json += res.json+",\n";			
		}
		
		var s=el.getSpecialHtml()
		obj.html += s!=""?t+"\t"+s+"\n":"";
		obj.html += t+"</div>\n";
		
		if(childs.length>0)
			obj.json += t+"\t]\n";
		obj.json += t+"}";
		return obj;		
	},
	getCss:function(){
		this.save();
		return this.css	
	},
	getHtml:function(){
		this.save();
		return this.html
	},
	getJson:function(){
		this.save();
		return this.json
	},
	/**
	 * Recherche le plus proche parent d'un element
	 * ayant la classe layer
	 * @param e l'élément de départ
	 */
	findParent: function(e, t){
		if($(e).hasClass('layer'))return $(e);
		if(t)return $(e).getParent("div.layer."+t);
		return $(e).getParent("div.layer");
	},
	round:function(val){
		var r = val.toInt()
		return r>val?r-1:r;
	},
	fixColumns: function(col){
		var s = col.line.e.getChildren('div.layer.col');
		s.addClass('after');
		s[0].addClass('first');
		s[0].removeClass('after');
		this.fixColumnWidth(col);
	},
	fixColumnWidth: function(col){
		if(!col.realWidth)var newCol = col;
		var cnt = col;
		var ref = col.line
		var s = ref.getCols();		
		/**
		 * Ordre de priorité des affectations de tailles
		 *  - fixé numériquement (realWidthUnit=='unit' && realWidthFixe==true)
		 *			=> realWidth
		 *  - fixé en pourcentage (realWidthUnit=='pourcent' && realWidthFixe==true)
		 *			=> realWidthPourcent => non implémenté
		 *  - non fixé en numérique (realWidthUnit=='unit' && realWidthFixe==false)
		 *			=> realWidth => non implémenté
		 *  - non fixé en pourcentage (realWidthUnit=='pourcent' && realWidthFixe==false)
		 *			=> realWidthPourcent
		 */
		//Création des tableaux de mémorisation des valeurs
		var cs = new Array();
		var fs = new Array();
		var cs = new Array();
		var widths = new Array();
		var realWidths = new Array();
		//Définition des totaux avant calcul
		var totalPourcent = 0
		var totalPourcentWithoutFixe = 100
		var totalSavePourcentWithoutFixe = 0;
		var totalFixe = 0
		var nbFixe = 0
		//var totalWithoutFixe = ref.getWidth(true)
		/* Taille de la ligne */
		var minWidth = 0;
		//var minRealWidth = 0;
		var totalWidth = ref.getWidth()-ref.getColsBorders();
		var totalRealWidth = ref.getWidth(true);
		var nbcols = s.length
		for(var i=0; i<nbcols; i++){
			//Application des largeurs basiques suivant les pourcentages 
			widths[i]=totalWidth*s[i].realWidthPourcent/100
			realWidths[i]=totalRealWidth*s[i].realWidthPourcent/100
			//
			if(!s[i].realWidth)var newCol=s[i];
			cs[i] = new Object();
			cs[i].fixe = false
			cs[i].width = s[i].realWidth
			cs[i].pourc = s[i].realWidthPourcent
			cs[i].unit  = s[i].realWidthUnit
			if(s[i].realWidthFixed==true)var fixe=true
			if(s[i].realWidthUnit=='mesure' && s[i].realWidthFixed==true){
				nbFixe++;
				cs[i].fixe = true
				var mesurefixe=true;
				totalFixe += s[i].realWidth;
				totalPourcentWithoutFixe -= s[i].realWidth/totalRealWidth*100;
				//totalWithoutFixe -= s[i].realWidth;
				widths[i]=s[i].getWidth();
				realWidths[i]=s[i].realWidth;
				minWidth+=s[i].getWidth();
			}else{
				minWidth+=s[i].minWidth;
				totalSavePourcentWithoutFixe += s[i].realWidth/totalRealWidth*100;
				var lastNotFixed = i
			}
			if(s[i].realWidth==0)var newColI=i;
			totalPourcent += s[i].realWidthPourcent
		}
		var proportionWithoutFixe = 100/totalPourcentWithoutFixe
		//console.log(totalPourcent)
		if(!newCol && !fixe && totalPourcent>99.99){
			//rien a faire, juste a adapter les largeurs;
									
		}else
		if(newCol==col && nbcols==1){
			//console.log("première colonne")
			widths[0] = totalWidth
			realWidths[0] = totalRealWidth
		}else
		//En cas d'ajout simple
		if((newCol==col && nbcols>1 && !mesurefixe)){
			widths[newColI] = totalWidth/i
			realWidths[newColI] = totalRealWidth/i
			for(var j=0; j<nbcols; j++){
				if(j==newColI)continue;
				widths[j] = (totalWidth-totalWidth/i)*s[j].realWidthPourcent/100
				realWidths[j] = (totalRealWidth-totalRealWidth/i)*s[j].realWidthPourcent/100
			}
		}else
		if(totalPourcent<98 && !mesurefixe){
			//console.log("delete column")
			for(var j=0; j<nbcols; j++){
				widths[j] = widths[j]/totalPourcent*100
				realWidths[j] = realWidths[j]/totalPourcent*100
			}
		}else
		//En cas de mesure fixe
		if(mesurefixe){
			var totalWidthWithoutFixe =totalWidth*totalPourcentWithoutFixe/100;
			var totalRealWidthWithoutFixe =totalRealWidth*totalPourcentWithoutFixe/100;
			if((newCol==col && nbcols>1)){

				widths[newColI] = totalWidthWithoutFixe/(i-nbFixe)
				realWidths[newColI] = totalRealWidthWithoutFixe/(i-nbFixe)
				for(var j=0; j<nbcols; j++){
					if(j==newColI)continue;
					if(!cs[j].fixe){
						widths[j] = (totalWidthWithoutFixe-widths[newColI])*s[j].realWidthPourcent/100*100/totalPourcentWithoutFixe
						realWidths[j] = (totalRealWidthWithoutFixe-realWidths[newColI])*s[j].realWidthPourcent/100*100/totalPourcentWithoutFixe;
					}
				}
			}else
			if(totalPourcent<98){
				for(var j=0; j<nbcols; j++){
					if(!cs[j].fixe){
						widths[j] = totalWidth*totalPourcentWithoutFixe/totalSavePourcentWithoutFixe*s[j].realWidthPourcent/100
						realWidths[j] = totalRealWidth*totalPourcentWithoutFixe/totalSavePourcentWithoutFixe*s[j].realWidthPourcent/100;
					}
				}
			}else{
				//totalFixe
				for(var j=0; j<nbcols; j++){
					if(!cs[j].fixe){
						widths[j] = (totalWidthWithoutFixe)*s[j].realWidthPourcent/totalSavePourcentWithoutFixe;
						realWidths[j] = (totalRealWidthWithoutFixe)*s[j].realWidthPourcent/totalSavePourcentWithoutFixe;
					}
				}
			}
		}
		/* vérification des tailles */
		var twc = 0
		var trwc = 0
		for(var j=0; j<nbcols; j++){
			twc += widths[j]
			trwc += realWidths[j]
		}
		/* Application de la taille minimal à la ligne */
		s[0].line.setMinWidth(minWidth)
		/* Application des tailles */
		for(var i=0; i<s.length;i++){
			/* Application des ajustements */
			if(twc != totalWidth)
				if(s[i].realWidthUnit!='mesure' || s[i].realWidthFixed!=true)
					widths[i] = widths[i] - (twc - totalWidth)/(s.length-nbFixe)
			if(trwc != totalRealWidth)
				if(s[i].realWidthUnit!='mesure' || s[i].realWidthFixed!=true)
					realWidths[i] = realWidths[i] - (trwc - totalRealWidth)/(s.length-nbFixe)
			/* Taille d'affichage */
			s[i].e.setStyle('width',widths[i]+"px");

			//Taille Réelle
			s[i].realWidth = realWidths[i]
			s[i].updateDiff()
			s[i].setDisplayWidth()
			
			//
			var ls = s[i].getLines()
			for(var l=0; l<ls.length; l++){
				
				ls[l].realWidth = realWidths[i]
				var cols = ls[l].getCols();
				if(cols.length>0)
				//envoi de la première colonne afin de fixer la largeur
				this.fixColumnWidth(cols[0], true)
			}
		}
	},
	createDragCols: function(col){
		var cols = col.line.getCols();
		if(cols.length>0){
			for(var c=0; c<cols.length; c++){			
				col = cols[c].e;
				col.removeEvent('mouseover', this.evtDragLeft.Bind);
				col.removeEvent('mouseleave', this.evtDragLeft.Bind);
				col.removeEvent('mouseover', this.evtDragRight.Bind);
				col.removeEvent('mouseleave', this.evtDragRight.Bind);
			}
		}
		if(cols.length>1){
			for(var c=0; c<cols.length; c++){
				col = cols[c].e
				//Ajout des curseurs de mouvement
				if(c>0){
					col.evtLeft = col.addEvent('mouseover', this.evtDragLeft.Bind)
					col.evtLeft = col.addEvent('mouseleave', this.evtDragLeft.Bind)
				}
				if(c<cols.length-1){
					col.evtRight = col.addEvent('mouseover', this.evtDragRight.Bind);
					col.evtRight = col.addEvent('mouseleave', this.evtDragRight.Bind);
				}
			}
		}
	},
	evtDragRight : function(e){
		switch(e.type){
			case "mouseover":
				$('mb_right').inject(this.findParent(e.target,'col'));
				e.stop(); $('mb_right').addClass('visible')
				break;
			case "mouseout":
				e.stop(); $('mb_right').removeClass('visible')
		}
	
	},
	evtDragLeft : function(e){
		switch(e.type){
			case "mouseover":
				$('mb_left').inject(this.findParent(e.target,'col'));
				e.stop(); $('mb_left').addClass('visible')
				break;
			case "mouseout":
				e.stop(); $('mb_left').removeClass('visible')
		}
	},
	
	/**
	 * Créer une colonne
	 * @param ref : la référence de placement
	 * @param position : la position par rapport à la référence
	 * @param pseudoRef : conteneur réel
	 * @return element : l'élément colonne
	 */
	createColumn : function(ref, position, pseudoRef){
		this.update = new Date()
		var c = new LayoutEditColumn(ref, position, pseudoRef, this)
		this.columns.push(c)
		
		return c.e
	},
	getId: function(){
		return this.ids++;
	},
	/**
	 * Créer ligne
	 * @param ref : le conteneur référent, une colonne
	 * @param position : la position en rapport avec le référent
	 * @return element : l'élément line
	 */
	createLine : function(ref, position, pseudoRef){
		this.update = new Date()
		var l = new LayoutEditLine(ref, position, pseudoRef, this)
		this.lines.push ( l )
		return l.e
	},
	createMoves: function(){
		//Créer les mouvements de liste
		/*var layers = this.element.getElements('.layer')
		for(var i=0; i<layers.length; i++){
			var l = layers[i]
			var s = l.hasClass('col')?layers[i].getChildren('.lin'):layers[i].getChildren('.col');
			if(s.length>1)	this.sortables.push(new Sortables(s, {opacity:0.5}));
		}*/
		//console.log(this.sortables)
	},
	moveBar : function(e){
		if(this.dragResize)this.dragResize.detach()
		e.stop();

		var col = this.findParent(e.target, 'col')
		var invert=true

		if(e.target.get("id")=="mb_right"){
			var sibCol = col.getNext(".layer.col");
			invert=false
		}else
			var sibCol = col.getPrevious(".layer.col");
		col.sibCol = sibCol
		limitMin = col.obj.minWidth
		//console.log(limitMin)
		limitMax = col.obj.getWidth()+sibCol.obj.getWidth() - sibCol.obj.minWidth
		col.moveHandle = e.target;
		col.le = this
		this.dragResize = col.makeResizable({
			'handle':col.moveHandle,
			'stopPropagation':true,
			'preventDefault':true,
			'invert':invert,
			'snap':0,
			'limit':{x:[limitMin,limitMax]},
			'modifiers':{x: 'width', y: null},
			'onStart': function(el){
				
				el.startWidth = el.getStyle("width").toInt()
				el.sibCol.startWidth = el.sibCol.getStyle("width").toInt()
				//el.sibCol.obj.lemb.setFixed(true)
				//el.obj.lemb.setFixed(true)
			},
			'onDrag' : function(el, evt){
				var newWidth = el.sibCol.startWidth-(el.getStyle("width").toInt()-el.startWidth);
				el.sibCol.setStyle('width', newWidth);

				el.obj.setDisplayWidthChanged(el.obj.getWidth())
				el.sibCol.obj.setDisplayWidthChanged(el.sibCol.obj.getWidth())
				
				//Mise à jour des sous colones
				el.sibCol.obj.getLines().each(
					function(e){
						e.realWidth = e.col.realWidth
						if(e.getCols().length>0)
							e.le.fixColumnWidth(e.getCols()[0])
					}					
				)
				el.obj.getLines().each(
					function(e){
						e.realWidth = e.col.realWidth
						if(e.getCols().length>0)
							e.le.fixColumnWidth(e.getCols()[0])
					}					
				)
			},
			'onComplete': function(el, evt){
				//console.log("a"+el.obj.le.updateSave);
				el.obj.le.updateSave = new Date();
    		}
		})
	},
	createMoveBar : function(name){
		var d = new Element('div').set('id', 'mb_'+name).addClass('movebar').inject(this.element)
		d.addEvent('mouseover', this.moveBar.bind(this))
	},
	createToolBar : function(name){
		var buttons = eval("this.options."+name)
		var d = new Element('div').set('id', name).addClass('toolbar '+name).inject(this.element)
		for(var i=0; i<buttons.length; i++){
			this.createButton(buttons[i]).inject(d,'bottom')
		}
		return d;
	},
	createButton : function(button){
		var d = new Element('div').set('id', 'button_'+button)
			.set('class',button).addClass('button')
		var a = new Element('a').set('class','button_link').set('href','#')
			.set('title', eval('texts.'+button))
		d.adopt(a);
		a.addEvent('click', eval('this.'+button+'.Bind'));
		return d;
	},
	add_left :function(evt){
		var col = this.findParent(evt.target)
		var line = col.obj.line.e
		this.createColumn(line, 'before', col);
		return false
	},
	add_right :function(evt){
		var col = this.findParent(evt.target)
		var line = col.obj.line.e
		this.createColumn(line, 'after', col);
		return false
	},
	add_top :function(evt){
		var line = this.findParent(evt.target)
		var col  = line.obj.col.e
		if(line==this.canvas){
			var tcanvas = this.createLine(this.element, 'top');
			var col = this.createColumn(tcanvas, 'top');
			this.createLine(col, 'top');
			this.canvas.obj.ref = col.obj
			this.canvas.obj.col = col.obj
			this.canvas.inject(col, 'bottom')
			this.canvas = tcanvas
			this.fixColumns(col.obj)
		}else this.createLine(col, 'before', line);
		return false
	},
	add_bottom :function(evt){
		var line = this.findParent(evt.target)
		var col  = line.obj.col.e
		if(line==this.canvas){
			var tcanvas = this.createLine(this.element, 'top');
			var col = this.createColumn(tcanvas, 'top');
			this.createLine(col, 'top');
			this.canvas.inject(col, 'top')
			this.canvas.obj.ref = col.obj
			this.canvas.obj.col = col.obj
			this.canvas = tcanvas
			this.fixColumns(col.obj)
		}else this.createLine(col, 'after', line);
		return false
	},
	add_inside_left :function(evt){
		line = this.findParent(evt.target)
		this.createColumn(line, 'top', line);
		return false
	},
	add_inside_right :function(evt){
		var line = this.findParent(evt.target);
		var c = line.getChildren('div.clearer')[0];
		this.createColumn(line, 'before', c);
		return false
	},
	add_inside_top :function(evt){
		this.createLine(this.findParent(evt.target), 'top');
		return false
	},
	add_inside_bottom :function(evt){
		this.createLine(this.findParent(evt.target), 'bottom');
		return false
	},
	del_lin :function(evt){
		this.update = new Date()
		var e = this.findParent(evt.target);
		var p = e.obj.ref.e
		//Replacement des toolbars
			this.replaceBars();
		e.destroy();
		if(p.getChildren('.layer').length==0)
			p.addClass('contener');
		return false
	},
	del_col :function(evt){
		this.update = new Date()
		var e = this.findParent(evt.target);
		var p = this.findParent(e.getParent('*'));
		//Replacement des toolbars
		this.replaceBars();
		e.destroy();
		//Calcul des dimension des colonnes
		var c =p.getChildren('div.layer.col')
		if(c.length>0){
			this.createDragCols(c[0].obj);
			this.fixColumns(c[0].obj)
		}else
			p.addClass('contener');
		return false
	},
	view_just_conteners :function(evt){
		this.element.toggleClass('le')
		this.element.toggleClass('lightle')
		this.fixColumns(this.canvas.obj.getCols()[0]);
		return false
	},
	pro_lin :function(evt){
	},
	pro_col :function(evt){
	},
	/**
	 * Replacement de toolbars à l'origine
	 * du conteneur principal
	 */
	replaceBars: function(){
		$('mb_left').removeClass('visible')
		$('mb_right').removeClass('visible')
		$('mb_left').inject(this.element);
		$('mb_right').inject(this.element);
		$('toolbar_lin').removeClass('visible').inject(this.element);
		$('toolbar_col').removeClass('visible').inject(this.element);
	},
	/**
	 * Initialisation des Evenements
	 */
	initEvent: function(){
		this.view_just_conteners.Bind = this.view_just_conteners.bind(this);
		this.add_left.Bind = this.add_left.bind(this);
		this.add_right.Bind = this.add_right.bind(this);
		this.add_top.Bind = this.add_top.bind(this);
		this.add_bottom.Bind = this.add_bottom.bind(this);
		this.add_inside_left.Bind = this.add_inside_left.bind(this);
		this.add_inside_right.Bind = this.add_inside_right.bind(this);
		this.add_inside_top.Bind = this.add_inside_top.bind(this);
		this.add_inside_bottom.Bind = this.add_inside_bottom.bind(this);
		this.del_col.Bind = this.del_col.bind(this);
		this.pro_col.Bind = this.pro_col.bind(this);
		this.del_lin.Bind = this.del_lin.bind(this);
		this.pro_lin.Bind = this.pro_lin.bind(this);
		this.evtDragRight.Bind = this.evtDragRight.bind(this);
		this.evtDragLeft.Bind = this.evtDragLeft.bind(this);
	}
})


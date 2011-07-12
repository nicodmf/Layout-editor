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

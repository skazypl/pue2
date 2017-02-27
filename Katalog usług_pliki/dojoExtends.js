dojo.require("dojox.grid.cells.dijit");
dojox.grid.cells._Widget = dojo.extend(dojox.grid.cells._Widget, {
	getWidgetProps: function(inDatum){
		return dojo.mixin(
			{
				dir: this.dir,
				lang: this.lang
			},
			this.widgetProps||{},
			{
				constraints: dojo.mixin({}, this.constraint) || {},
				//BUG#5641, DOJO ISSUE: http://trac.dojotoolkit.org/ticket/14141
				required: (this.constraint || {}).required,
				value: inDatum
			}
		);
	}
});

dojo.require("dijit._KeyNavContainer");
//BUG#5637, DOJO ISSUE: http://trac.dojotoolkit.org/ticket/11712
dijit._KeyNavContainer = dojo.extend(dijit._KeyNavContainer, {
	_onContainerFocus: function(evt){
		// summary:
		//              Handler for when the container gets focus
		// description:
		//              Initially the container itself has a tabIndex, but when it gets
		//              focus, switch focus to first child...
		// tags:
		//              private
		
		// Note that we can't use _onFocus() because switching focus from the
		// _onFocus() handler confuses the focus.js code
		// (because it causes _onFocusNode() to be called recursively)
		// Also, _onFocus() would fire when focus went directly to a child widget due to mouse click.
		
		// Ignore spurious focus events:
		//      1. focus on a child widget bubbles on FF
		//      2. on IE, clicking the scrollbar of a select dropdown moves focus from the focused child item to me
		if(evt.target !== this.domNode || this.focusedChild){ return; }
		
		this.focusFirstChild();
		
		// and then set the container's tabIndex to -1,
		// (don't remove as that breaks Safari 4)
		// so that tab or shift-tab will go to the fields after/before
		// the container, rather than the container itself
		dojo.attr(this.domNode, "tabIndex", "-1");
	}
});

//BUG##5914, blad (nodeType is undefined) przy szybkim przelaczaniu sie po menu w IE
if (dojo.isIE) {
	dojo.getComputedStyle = function(node){
		// IE (as of 7) doesn't expose Element like sane browsers
		return (node && node.nodeType && node.nodeType == 1) /* ELEMENT_NODE*/ ? node.currentStyle : {};
	};
}

dojo.require("dojox.grid.enhanced.plugins.Pagination");
//BUG#6231, podczas przeliczania wysokości w którejś iteracji wysokość jest ustawiana na ujemną, co powoduje wysyp na IE
dojox.grid.enhanced.plugins._Paginator = dojo.extend(dojox.grid.enhanced.plugins._Paginator, {
	_resetGridHeight: function(changeSize, resultSize){
		// summary:
		//		Function of resize grid height to place this pagination bar.
		//		Since the grid would be able to add other element in its domNode, we have
		//		change the grid view size to place the pagination bar.
		//		This function will resize the grid viewsNode height, scorllboxNode height
		var g = this.grid;
		changeSize = changeSize || this._changeSize;
		resultSize = resultSize || this._resultSize;
		delete this._changeSize;
		delete this._resultSize;
		if(g._autoHeight){
			return;
		}
		var padBorder = g._getPadBorder().h;
		if(!this.plugin.gh){
			this.plugin.gh = dojo.contentBox(g.domNode).h + 2 * padBorder;
		}
		if(resultSize){
			changeSize = resultSize;
		}
		if(changeSize){
			this.plugin.gh = dojo.contentBox(g.domNode).h + 2 * padBorder;
		}
		var gh = this.plugin.gh,
			hh = g._getHeaderHeight(),
			ph = dojo.marginBox(this.domNode).h;
		ph = this.plugin.paginators[1] ? ph * 2 : ph;
		if(typeof g.autoHeight == "number"){
			var cgh = gh + ph - padBorder;
			if (cgh < 0) {
				cgh = 0;
			}
			dojo.style(g.domNode, "height", cgh + "px");
			dojo.style(g.viewsNode, "height", (cgh - ph - hh) + "px");
			
			this._styleMsgNode(hh, dojo.marginBox(g.viewsNode).w, cgh - ph - hh);
		}else{
			var h = gh - ph - hh - padBorder;
			if (h < 0) {
				h = 0;
			}
			dojo.style(g.viewsNode, "height", h + "px");
			var hasHScroller = dojo.some(g.views.views, function(v){
				return v.hasHScrollbar();
			});
			dojo.forEach(g.viewsNode.childNodes, function(c, idx){
				dojo.style(c, "height", h + "px");
			});
			dojo.forEach(g.views.views, function(v, idx){
				if(v.scrollboxNode){
					if(!v.hasHScrollbar() && hasHScroller){
						dojo.style(v.scrollboxNode, "height", (h - dojox.html.metrics.getScrollbar().h) + "px");
					}else{
						dojo.style(v.scrollboxNode, "height", h + "px");
					}
				}
			});
			this._styleMsgNode(hh, dojo.marginBox(g.viewsNode).w, h);
		}
	}
});

dojo.string.startWith = function(/* string */ needle, /* string */ haystack, /* bool */ trimBefore) {
    if(trimBefore) {
        needle = dojo.string.trim(needle)
    }
    if(needle.length > haystack.length) {
        return false;
    }
    return haystack.substr(0,needle.length) === needle;
}

dojo.require("dijit.form.Button");
dijit.form.Button.prototype._old_SetLabelAttr = dijit.form.Button.prototype._setLabelAttr;
dijit.form.Button.prototype._setLabelAttr = function(content) {
	this._old_SetLabelAttr(content);
	if(this.attributeMap && this.attributeMap.value && !this.get(this.attributeMap.value)) {
		return;
	}
	if ( (!this.value || this.value == "") && content) {
		this.set('value', dojo.trim(content));
	}
};
dijit.form.Button.prototype._old_postCreate = dijit.form.Button.prototype.postCreate;
dijit.form.Button.prototype.postCreate = function() {
	this._old_postCreate();
	if (this.valueNode) {
		dijit.setWaiRole(this.valueNode, "presentation");
	}
};


/****************************************************/
/************** KOD EKSPERYMENTALNY *****************/
/****************************************************/
dijit.form.Button.prototype._old_SetDisabledAttr = dijit.form.Button.prototype._setDisabledAttr;
dijit.form.Button.prototype._setDisabledAttr = function(disabled) {
	this._old_SetDisabledAttr(disabled);
	if(disabled == true && dojo.isIE) {
		hideConnectedDijitTooltipForWidgetId(this.get('id'));
	}
};

dijit.form.Button.prototype._old_clicked = dijit.form.Button.prototype._clicked;
dijit.form.Button.prototype._clicked = function(e) {
	this._old_clicked(e);
	hideConnectedDijitTooltipForWidgetId(this.get('id'));
};

dojo.require("dijit.Dialog");

dijit.Dialog.prototype._old_onBlur = dijit.Dialog.prototype._onBlur;
dijit.Dialog.prototype._onBlur = function(by) {
	this._old_onBlur(by);
	
	//	http://bugs.dojotoolkit.org/ticket/15370
	//	http://bugs.dojotoolkit.org/changeset/30001/dojo
	
	// If focus was accidentally removed from the dialog, such as if the user clicked a blank
	// area of the screen, or clicked the browser's address bar and then tabbed into the page,
	// then refocus.   Won't do anything if focus was removed because the Dialog was closed, or
	// because a new Dialog popped up on top of the old one.
	var refocus = dojo.hitch(this, function(){
		if(this.open && !this._destroyed && dijit._DialogLevelManager.isTop(this)){
			this._getFocusItems(this.domNode);
			dijit.focus(this._firstFocusItem);
		}
	});
	if(by == "mouse"){
		// wait for mouse up, and then refocus dialog; otherwise doesn't work
		var handle = this.connect(dojo.doc, "mouseup", function(){
			this.disconnect(handle);
			refocus();
		});
	}else{
		refocus();
	}
};

dijit.Dialog.prototype._old_Show = dijit.Dialog.prototype.show;
dijit.Dialog.prototype.show = function() {
	this._old_Show();
	try {
		if(this.containerNode) {
			dojo.create("a", {href:"#"}, this.containerNode);
		} else if(this.domNode) {
			dojo.create("a", {href:"#"}, this.domNode);
		}
	} catch(e) {
		console.error("ERROR", e);
	}
}
/****************************************************/
/********** KONIEC KODU EKSPERYMENTALNEGO ***********/
/****************************************************/
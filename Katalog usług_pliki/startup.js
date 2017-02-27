function przeladujEkranLogowania() {
	if (dijit.byId("mainContent")) {
		showExpiredSessionAlertAndReload();
	} else {
		var contextPane = dijit.byId("contextPane");
		contextPane.set("href", cA);
		dojo.connect(contextPane, "onDownloadEnd", contextPane, function() {
			hideSplash();
		});
	}
};

function postLoadLogowanie() {

	var asystent = getAsystent();
	asystent.placeAt("asystentDialogContainer");

	var gridExportForm = getGridExportForm();
	gridExportForm.placeAt("gridExportFormIdContainer");

	var border = getLogowanieBorderContainer();
	border.placeAt("mainBorderContainer");

	border.addChild(getLogowanieTop());
	border.addChild(getLogowanieCenter());
	border.addChild(getLogowanieBottom());

	border.startup();

	przeladujEkranLogowania();
};

function getAsystent() {

	var viewport = dijit.getViewport();

	var height = 294;
	var width = 674;
	
	var left = (viewport.w - width) / 2;
	var top = (viewport.h - height) / 2;
	
	var asystentStyle =
			"position:absolute;" +
			"top:" + top + "px;" +
			"left:" + left + "px;" +
			"width:" + width + "px;" +
			"height:" + height + "px;" +
			"z-index:253975;" +
			"visibility:hidden;";

	return new zusnpi.asystentComponent.dialog({
		resizable : false,
		dockable : false,
		style : asystentStyle,
		id : "asystentDialog"
	});
};

function getLogowanieBorderContainer() {
	return new dijit.layout.BorderContainer({
		gutters : false,
		style : "width: 100%; height: 100%; min-height: 46em;"
	});
};

function getLogowanieTop() {
	var url = getAdresStronyGlownej();
	var topContextPane = new dojox.layout.ContentPane(
			{
				region : "top",
				id : "topPane",
				style : "padding:0;margin:0;",
				content : "<div style='width:100%;height:15px;border-bottom:#AFB5B1 1px solid;background-image:url(\"css/img/top_menu.gif\");'>"
						+ "</div>"
						+ "<div style='width:100%;padding:5px 0 0 0;margin-bottom:2px;border-bottom:#B4B5BA 1px solid;background-image:url(\"css/img/header_bkg.png\");height:54px;'>"
						+ "<div style='left:0;position: absolute;top: 21px;height:54px;white-space:nowrap;'>"
						+ "<a href='"+url+"'><img src='css/img/logo_zus_male.png' alt='Logo ZUS' style='float:left;border:none;width:67px;height:41px;margin:4px 19px 0 5px;' /></a>"
						+ "</div>"
						+ "<div style='float:right;text-align: right;top: 21px;text-align:right;'>"
						+ "<ul style='height:15px; margin-top:2px; margin-right:5px; list-style-type:none'>"
						+ "<li style='display:inline;'><a href=\"http://www.zus.pl/default.asp?p=2&amp;id=8\" target=\"_blank\" class=\"menu-cit\">Kontakt z COT</a></li>"
						+ (showSkypeWithCOT ? "<li style='display:inline;'><a href=\"skype:" + getCOTSkypeId() + "?call\" id=\"cotSkypeStatus\" class=\"skype-cot\">Skype z COT</a></li>" : "")
						+ "<li style='display:inline;'><a href=\"javascript:void(0)\" class='menu-wd' onclick=\"toggleWD();\">Wirtualny Doradca</a></li>"
						+ "</ul>" + "</div>" + "</div>"

			});
	return topContextPane;
};

function getLogowanieCenter() {
	return new dojox.layout.ContentPane({
		region : "center",
		id : "contextPane",
		style : "padding:0;",
		onDownloadError : function(error) {
			errorLogoutLoad(error);
		}
	});
};

function getLogowanieBottom() {
	return new dojox.layout.ContentPane(
			{
				region : "bottom",
				id : "bottomPane",
				style : "padding:0;margin:0;",
				content : "<div style=\"width:100%;border:0;height:52px;background-color:#ffffff;margin-top:5px;\">"
						+ "<div style=\"float:left;font-size:12px;padding:13px 0 10px 30px;\">Projekt jest współfinansowany przez Unię Europejską<br />z Europejskiego Funduszu Rozwoju Regionalnego</div>"
						+ "<img src=\"css/img/logo_ig2.jpg\" width=\"116\" height=\"52\" alt=\"\" role=\"presentation\" style=\"margin-right:30px;\"/>"
						+ "<img src=\"css/img/logo_pue_small.jpg\" width=\"73\" height=\"52\" alt=\"\" role=\"presentation\" style=\"margin-right:30px;\"/>"
						+ "<img src=\"css/img/logo_zus_small.jpg\" width=\"53\" height=\"52\" alt=\"\" role=\"presentation\" style=\"margin-right:20px;\"/>"
						+ "<img src=\"css/img/logo_ue.jpg\" width=\"113\" height=\"52\" alt=\"\" role=\"presentation\" style=\"margin-right:150px;\"/>"
						+ "</div>"
			});
};

function przeladujEkranZalogowany() {
	var mainContent = dijit.byId("mainContent");
	mainContent.set("href", cA);
	dojo.connect(mainContent, "onDownloadEnd", mainContent, function() {
		hideSplash();
	});
};

function postLoadZalogowany() {

	var asystent = getAsystent();
	asystent.placeAt("asystentDialogContainer");

	var gridExportForm = getGridExportForm();
	gridExportForm.placeAt("gridExportFormIdContainer");

	var border = getZalogowanyBorderContainer();
	border.placeAt("mainBorderContainer");

	border.addChild(getZalogowanyTop());
	border.addChild(getZalogowanyCenter());
	border.addChild(getZalogowanyBottom());
	
	border.startup();
	przeladujEkranZalogowany();
    riu.zalogowany();
};

function getZalogowanyAsystent() {
	return new zusnpi.asystentComponent.dialog(
			{
				resizable : false,
				dockable : false,
				style : "position:absolute;top:150px;left:462px;width:674px;height:294px;z-index:253975;visibility:hidden;",
				id : "asystentDialog"
			});
};

function getZalogowanyBorderContainer() {
	return new dijit.layout.BorderContainer({
		gutters : false,
		style : "width: 100%; height: 100%;overflow:hidden; min-height: 40em"
	});
};

function getZalogowanyCenter() {
	return new dojox.layout.ContentPane({
		region : "center",
		id : "mainContent",
		style : "padding:0;",
		onLoad : function() {
			onHashChanged(dojo.hash());
		},
		onDownloadError : function(error) {
			errorLogoutLoad(error);
		}
	});
};

function getZalogowanyTop() {
	return new dojox.layout.ContentPane({
		region : "top",
		style : "padding:0;margin:0;height:78px;",
		href : "topZalogowanyFtl.npi?contentAction=" + cA // this action is in
															// wsp in struts.xml
	});
};

function getZalogowanyBottom() {
	return new zusnpi.menu.StatusBar({
		region : "bottom",
		id : "statusBar"
	});
};

function getGridExportForm() {
	return new dijit.form.Form({
		id : "GRID_EXPORT_FORM_ID"
	});
};

function openFormularzHelp() {
	openHelpDialog('faq0002', 1000, 600, 'Pomoc');
};

function getFormularzHelpImageLink() {
	return	"<a href=\"#\" onclick=\"openFormularzHelp();\" style=\"cursor:pointer;\" title=\"Pomoc\">"+
				"<img alt=\"Pomoc do formularza elektronicznego\" src=\"css/img/help.png\" alt=\"Pomoc\">"+
				"</img>"+
			"</a>";
};

/**
 * author dszkoda
 * update zbyszek szot
 * @param uuid - identyfikator sesji
 * @param danePoczatkowe - url do danych inicjalnych
 * @param urlFormularza - url do pliku swf
 * @param trybFormularza - tryb pracy formularza
 * @param idDokumentu - identyfikator dokumentu
 * @param sofFormCloseHandler - funkcja wywolywana przy zamykaniu okna
 */
function wczytajFormularz(uiid, danePoczatkowe, urlFormularza, trybFormularza, idDokumentu, kodTypuDok, sofFormCloseHandler, sofContainer) {
	//tymczasowo rnoworyta
	console.log("Wczytaj Formularz "+uiid+" "+danePoczatkowe+" "+urlFormularza +" "+ kodTypuDok+" "+trybFormularza+" "+idDokumentu);
	
	if(document.getElementById(uiid) == null) {
		secondDlg = new dijit.Dialog({id:uiid,draggable:false});
		secondDlg.uiid = uiid;
		secondDlg.danePoczatkowe = danePoczatkowe;
		secondDlg.urlFormularza = fixSwfUrl(urlFormularza);
		secondDlg.trybFormularza = trybFormularza;
		secondDlg.idDokumentu = idDokumentu;
		secondDlg.kodTypuDok = kodTypuDok;
		secondDlg.bottomButtons = danePoczatkowe.replace('dajDaneInicjujace.npi', 'pobierzDodatkowePrzyciski.npi');
	
		prepareHandlers(secondDlg,sofFormCloseHandler);
		if(urlFormularza.endsWith(".swf")) {
			if(isFlashPlayerInstaled()) {
				if(isPepFlashPlayerInstaled()) {
					setPepPluginFlashInfoDialogProperties(secondDlg);	
				}
				else {
					setDocumentDialogProperies(secondDlg);
				}
			}
			else {
			    setnoFlashInfoDialogProperties(secondDlg);
			}
		}
		else {
			secondDlg.danePoczatkowe = secondDlg.danePoczatkowe.replace("dajDaneInicjujace.npi", "dajDaneInicjujaceHtml.npi")
			setHtmlDocumentDialogProperies(secondDlg, sofContainer);
		}
		secondDlg.show();
	} 
	else{
		console.error("Próba utworzenia okna formularza o istniejącym id");
	}
}

/**
 * Funkcja ustawia zachowanie się okna po jego zamknięciu
 * oraz dynamicznie dodaje tekst na zdarzeniu onShow przeznaczony dla screen readera
 * informujący o otwieraniu się okna dialogowego
 *
 * @param dialog - obiekt dijit.Dialog
 * @param sofFormCloseHandler funkcja wykonywana podczas zamykania okna
 */
function prepareHandlers(dialog,sofFormCloseHandler){
	dojo.connect(dialog, "onHide", null, function(){
		if(dijit.byId('buttonsPanel') != null && dijit.byId('buttonsPanel') != undefined){
			dijit.byId('buttonsPanel').destroyRecursive();
		}
	  	setTimeout(dojo.hitch(dialog,function(){
			try {
				if (dialog.sofFormCloseHandler != null){
					dialog.sofFormCloseHandler();
				}
			}
			catch (ex){
				console.error("Proces zamykania okna nie przebiegł prawidłowo", ex);
			}
			dialog.destroy();


 		}),dijit.defaultDuration);
	});

	if (sofFormCloseHandler != null){
		//nie działa od kiedy jest destroy zamiast hide
		//dojo.connect(secondDlg, "onHide", null, sofFormCloseHandler);
		secondDlg.sofFormCloseHandler = sofFormCloseHandler;
	}
	dojo.connect(dialog, "onShow", null,function(){
		  var titleText = dialog.titleNode.innerHTML;
		  dialog.titleNode.innerHTML = titleText + " <span role='alert' style='font-size:0'>Trwa wczytywanie formularza, proszę czekać.</span>";
	});
}

/**
 * Funkcja ustawia parametry początkowe dla okna wyświetlającego obiekt Flash
 * @param dialog - obiekt dijit.Dialog
 */
function setDocumentDialogProperies(dialog){
	var dialogTextTitle = "Formularz elektroniczny";
	    dialog.titleNode.innerHTML = dialogTextTitle + " " + getFormularzHelpImageLink();
	
	dialog.flashView =  getEmbededSwfObject(dialog.uiid,dialog.danePoczatkowe,dialog.urlFormularza,dialog.trybFormularza,dialog.idDokumentu);
	dialog.attr("content",dialog.flashView);
	var onFocus = dojo.connect(dialog, "onFocus", dojo.hitch(dialog, function(){
		var viewport = dijit.getViewport();
		
		var d_w = 935;
		var d_h = viewport.h-80;
		var d_l = (viewport.w - d_w - 20)/2;
		var d_t = 20/2;
		dojo.style(this.domNode, {top: d_t+"px", left: d_l + "px"});
		dojo.style(this.containerNode,{width:d_w+"px",height:d_h+"px",overflow:"visible",position:"relative"});
		dojo.style(this.flashView,{width:d_w+"px",height:d_h+"px",overflow:"visible",position:"relative"});			
		this.flashView.resize({w: d_w, h: d_h});
		dojo.disconnect(onFocus);
	}));
}

/**
 * Funkcja ustawia parametry początkowe dla okna wyświetlającego obiekt Flash
 * @param dialog - obiekt dijit.Dialog
 */
function setHtmlDocumentDialogProperies(dialog, sofContainer){
	var dialogTextTitle = "Formularz elektroniczny";
	    dialog.titleNode.innerHTML = dialogTextTitle + " " + getFormularzHelpImageLink();
	
	dialog.flashView =  getEmbededHtmlObject(dialog.uiid,dialog.danePoczatkowe,dialog.urlFormularza,dialog.trybFormularza,dialog.idDokumentu, dialog.kodTypuDok);

	dojo.xhrPost({
		url: dialog.bottomButtons,
		content: {
			idDokumentu: dialog.idDokumentu,
			trybFormularza: dialog.trybFormularza,
			kodTypuDok: dialog.kodTypuDok
		},
		sync: true,
		handleAs: 'json',
		load: function(resp){
			dialog.attr("content", dodajGuziki(dialog.flashView, resp, dialog, sofContainer));
		}
	});

	var onFocus = dojo.connect(dialog, "onFocus", dojo.hitch(dialog, function(){
		if(dialog.guzikiIds){
			for(var i = 0; i < dialog.guzikiIds.length; i++){
				dojo.connect(dijit.byId(dialog.guzikiIds[i]), 'onClick', function(){
					sofContainer.setKodTypuDok(dialog.guzikiForm[this.id].kodTypuDok);
					sofContainer.setIdDokumentu(dialog.guzikiForm[this.id].id);
					ustawDaneFomrularza(sofContainer, dialog);
				});
			}
		}

		var viewport = dijit.getViewport();
		
		var d_w = 935;
		var d_h = viewport.h-80;
		var d_l = (viewport.w - d_w - 20)/2;
		var d_t = 20/2;
		dojo.style(this.domNode, {top: d_t+"px", left: d_l + "px"});
		dojo.style(this.containerNode,{width:d_w+"px",height:d_h+"px",overflow:"visible",position:"relative"});
//		dojo.style(this.flashView,{width:d_w+"px",height:d_h+"px",overflow:"visible",position:"relative"});			
//		this.flashView.resize({w: d_w, h: d_h});
		dojo.disconnect(onFocus);
	}));

//  var url = dialog.danePoczatkowe + '?UUID='+dialog.uiid+'&kodTypuDok='+dialog.kodTypuDok+'&trybFormularza='+dialog.trybFormularza+'&idDokumentu='+dialog.idDokumentu;
//	showWindow(url, dialogTextTitle, screen.width * (2/3), screen.height * (2/3));
}

function dodajGuziki(content, guziki, dialog, sofContainer){
	if(guziki.length > 0){
		dialog.sofContainer = sofContainer;
		content = content.replace('height: 100%', 'height: 95%');
		var buttons = '<div dojoType="dijit.layout.ContentPane" height="5%" id="buttonsPanel" style="height:5%; width: 900px; margin: 0 auto; text-align: right;">',
			guzikiIds = [],
			guzikiForm = {};
		for(var i = 0; i < guziki.length; i++){
			var button = "";
			button = '<div dojoType="dijit.form.DropDownButton" ' +
						'id="additionalBtn-Container' + i + '"' +
						'class="zusButtonLight">' +
							'<span>' + guziki[i].label + '</span>' +
							'<div dojoType="dijit.Menu">';
			for(var j = 0; j < guziki[i].additionalParams.length; j++){
				var btnId = 'additionalBtn-' + i +'-'+ j,
					idDok = guziki[i].additionalParams[j].id,
					seriaDok = guziki[i].additionalParams[j].seriaDok,
					numerDok = guziki[i].additionalParams[j].numerDok,
					kodTypuDok = guziki[i].additionalParams[j].kodTypuDok;
				guzikiIds.push(btnId);
				guzikiForm[btnId] = {id: idDok, kodTypuDok: kodTypuDok, seriadok: seriaDok, numerDok: numerDok};
				button += '<div dojoType="dijit.MenuItem" id="'+btnId+'">'+kodTypuDok+'-id-'+seriaDok+numerDok+'</div>';
			}
			button += '</div></div>';
			buttons += button;
		}
		buttons += '</div>';
		dialog.guzikiIds = guzikiIds;
		dialog.guzikiForm = guzikiForm;
		return content + buttons;
	}
	return content;
}

/**
 * Funkcja ustawia parametry początkowe dla okna wyświetlającego informacje o braku FlashPlayer'a
 * @param dialog - obiekt dijit.Dialog
 */
function setnoFlashInfoDialogProperties(dialog){
	
	
	var h_info = 200+"px";
	var w_info = 500+"px";
	
	var dialogTextTitle = "Brak zainstalowanej wtyczki FlashPlayer";
	dialog.titleNode.innerHTML = dialogTextTitle + " " + getFormularzHelpImageLink();
	dialog.flashView = getNoFlashInfoContent();
	dialog.attr("content", dialog.flashView);
	dialog.flashView.setAttribute("style","height:"+h_info+";width:"+w_info);
	
}
/**
 * Funkcja ustawia parametry początkowe dla okna wyświetlającego informacje o nieodpowiedniej wtyczce FlashPlayer'a
 * @param dialog - obiekt dijit.Dialog
 */
function setPepPluginFlashInfoDialogProperties(dialog){
	
	var h_info = 200+"px";
	var w_info = 500+"px";
	
	var dialogTextTitle = "INFORMACJA:";
	dialog.titleNode.innerHTML = dialogTextTitle + " " + getFormularzHelpImageLink();
	dialog.draggable = true;
	dialog.flashView = getPluginInfoContent();
	dialog.attr("content", dialog.flashView);
	dialog.flashView.setAttribute("style","height:"+h_info+";width:"+w_info);
}

/**
 * Funkcja sprwawdza czy w przeglądarce jest aktywna wtyczka pepflashplayer
 * @returns {Boolean} - flaga czy w przeglądarce jest aktywna wtyczka pepflashplayer
 */
function isPepFlashPlayerInstaled(){
	
	var pluginName1 = "pepflashplayer.dll";
	var pluginName2 = "libpepflashplayer.so";
	
	
	for (var i=0; i < navigator.plugins.length; i++) {
		
		if (navigator.plugins[i].filename == pluginName1 || navigator.plugins[i].filename == pluginName2){
			
			return true;
		}
	}
	return false;
}
/**
 * Funkcja sprawdza czy w przeglądarce jest aktywna wtyczka FlashPlayer'a
 * @returns {Boolean} - flaga czy w przeglądarce jest aktywna wtyczka FlashPlayer'a
 */
function isFlashPlayerInstaled(){
	
	if(FlashDetect.versionAtLeast(10,2)){
		return true;
	}
	return false;
}


/**
 * Funkcja którą uruchamia formularz po załadowaniu się,
 * ukrywa ikonę "X" - zamknij w oknie dialogowym
 */
function ukryjPrzyciskZamknij(){	
	dojo.style(secondDlg.closeButtonNode, "display","none");	
}

function wczytajFormularzWgKonfiguracji(sofFormConfig, sofFormCloseHandler, sofContainer) {
	console.log("WczytajFormularzWgKonfiguracji", sofFormConfig, sofFormConfig.trybFormularza);
	wczytajFormularz(sofFormConfig.uuid, sofFormConfig.dataRequestURL,
			sofFormConfig.swfURL, sofFormConfig.trybFormularza,
			sofFormConfig.idDokumentu, sofFormConfig.kodTypuDok, sofFormCloseHandler, sofContainer);
}

/**
 * Funkcja wywoływana przez formularz po zakonczeniu pracy,
 * zamyka okno w którym był osadzony formularz
 * @param idOkna - id okna które ma zamknął formularz
 */
function zamknijFormularz(idOkna){
	var okno = dijit.byId(idOkna);
	if (okno != null){
		if(dijit.byId('buttonsPanel') != null && dijit.byId('buttonsPanel') != undefined){
			dijit.byId('buttonsPanel').destroyRecursive();
		}
		try {
			if (okno.sofFormCloseHandler != null){
				okno.sofFormCloseHandler();
			}
		}
		catch (ex){
			console.error("Proces zamykania okna nie przebiegł prawidłowo", ex);
		}
		okno.destroy();
	}
}
/**
 * Funkcja zwraca wartość cookie o przekazanej w parametrze nazwie
 *
 * @param cName nazwa cookie którego wartość chcemy otrzymać
 * @returns wartość cookie
 */
function getDocumentCookie(cName){

	if (document.cookie.length>0)
	{
	cStartIndex=document.cookie.indexOf(cName + "=");
	if (cStartIndex!=-1)
	{
	cStartIndex=cStartIndex + cName.length+1 ;
	cEndIndex=document.cookie.indexOf(";",cStartIndex);
	if (cEndIndex==-1) cEndIndex=document.cookie.length;
	return unescape(document.cookie.substring(cStartIndex,cEndIndex));
	}
	}

	return "";
}

String.prototype.endsWith = function(str){
	return (this.match(str+"$")==str)
}

String.prototype.startsWith = function(str){
	return (this.match("^"+str)==str)
}

function showWindow(pageURL, title,w,h) {
	var left = (screen.width/2)-(w/2);
	var top = (screen.height/2)-(h/2);
	var targetWin = window.open (pageURL, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
}
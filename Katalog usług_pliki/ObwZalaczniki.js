function ObwZalaczniki(){
	
	var tempId;
	


	this.formOnComplete = function()
	{
		
		dojo.byId('obwLdrDokumentRoboczyPanelAjaxLoader').style.visibility='';
		var uploaderId = obwUploaderId.getUploaderId();
		var metadokumentId = dojo.byId("metadokumentId").value;	
		var contentVar = {
				'uploaderId': uploaderId,
				'metadokumentId': metadokumentId
			};
		var args = {
			url: 'obw/zalaczniki/zapisz.npi',
			content: contentVar,
			handleAs: "json",
			load: function(resp){
				dojo.byId('obwLdrDokumentRoboczyPanelAjaxLoader').style.visibility='hidden';
				
				if(resp['warning']){
					alert(resp['warning']);
					return;
				}
				
				if(resp['info']){
					alert(
					{
						content: resp['info'],
						dialogHeight: '200px'
					});
				}
				
				odswiezZalaczniki();	
			}
		};
		dojo.xhrPost(args);	
		obwUploaderId.resetUploader();
	}
	
	this.createAttachmentsList = function(data)
	{
		if(data!=null)
		{
			dijit.byId('obwDokumentyZalacznikiId').attr('content', '');
			daneZalacznikow =data["metadokumentDanePelne"]["zalacznikDanePodstawowe"];
			obwZalaczniki.utworzListeZalacznikow(daneZalacznikow, 'obwDokumentyZalacznikiId', true);
		}
	}
	
	this.utworzListeZalacznikowDlaPodanegoDokumentu = function(metadokumentId, daneZalacznikow, idElementu, usunLink) {
		if(daneZalacznikow!=null && daneZalacznikow.length>0)
			new dijit.layout.ContentPane({content:''}).placeAt(dijit.byId(idElementu).domNode, 'only');
		else
			new dijit.layout.ContentPane({content:'<i>Brak załączników</i>'}).placeAt(dijit.byId(idElementu).domNode, 'only');
		
		if(metadokumentId != null) {
			var contentVar = {
				'metadokumentId': metadokumentId
			};
	
			var args = {
			    sync: true,
				url: 'obw/dodajDokumentyRobocze/dozwoloneZalaczniki.npi',
				content: contentVar,
				handleAs: "json",
				load: function(resp){
					var zalaczniki = resp["dozwoloneZalaczniki"];
					dojo.forEach(daneZalacznikow, function(entry, i){
						new dijit.layout.ContentPane({
			            	content: getZalacznikItem(++i, entry, usunLink, zalaczniki)
			        	}).placeAt(dijit.byId(idElementu).domNode, 'last');
					});	
	            }
			};
			dojo.xhrPost(args);
		}
	}
	
	this.utworzListeZalacznikowWyslanych = function(daneZalacznikow, idElementu, usunLink)
	{	
		if(daneZalacznikow!=null && daneZalacznikow.length>0)
			new dijit.layout.ContentPane({content:''}).placeAt(dijit.byId(idElementu).domNode, 'only');
		else
			new dijit.layout.ContentPane({content:'<i>Brak załączników</i>'}).placeAt(dijit.byId(idElementu).domNode, 'only');
		
		dojo.forEach(daneZalacznikow, function(entry, i){
			new dijit.layout.ContentPane({
            	content: getZalacznikItem(++i, entry, usunLink)
        	}).placeAt(dijit.byId(idElementu).domNode, 'last');
		});	
	};

	this.utworzListeZalacznikow = function(daneZalacznikow, idElementu, usunLink)
	{	
		if(daneZalacznikow!=null && daneZalacznikow.length>0)
			new dijit.layout.ContentPane({content:''}).placeAt(dijit.byId(idElementu).domNode, 'only');
		else
			new dijit.layout.ContentPane({content:'<i>Brak załączników</i>'}).placeAt(dijit.byId(idElementu).domNode, 'only');
		
		if(dojo.byId("metadokumentId") != null) {
			var metadokumentId = dojo.byId("metadokumentId").value;
			var contentVar = {
				'metadokumentId': metadokumentId
			};
	
			var args = {
			    sync: true,
				url: 'obw/dodajDokumentyRobocze/dozwoloneZalaczniki.npi',
				content: contentVar,
				handleAs: "json",
				load: function(resp){
					var zalaczniki = resp["dozwoloneZalaczniki"];
					if(document.getElementById('obwDodajDokumentRoboczyContentPane') != null) {
						document.getElementById('obwDodajDokumentRoboczyContentPane').style.visibility="visible";
						if(zalaczniki == null || zalaczniki=="") {
							document.getElementById('obwDodajDokumentRoboczyContentPane').style.visibility="hidden";
						}
					}
					
					dojo.forEach(daneZalacznikow, function(entry, i){
						new dijit.layout.ContentPane({
			            	content: getZalacznikItem(++i, entry, usunLink, zalaczniki)
			        	}).placeAt(dijit.byId(idElementu).domNode, 'last');
					});	
	            }
			};
			dojo.xhrPost(args);
		}
	};

	getZalacznikItem =  function (i, entry, usunLink, dozwoloneZalaczniki)
	{
		var rozmiar = entry["rozmiar"]  / 1024.0;
		var zalacznikItem = i + ': ' + entry["nazwa"]+ '&nbsp;<i>' + rozmiar.toFixed(2) + '&nbsp;KB&nbsp;</i>';
		// Dodanie podglądu dla menu załącznika w formacie PDF
		var nieDodano = true;
		if(dozwoloneZalaczniki != null) {
			var tablicaDozowolonychZalacznikow = dozwoloneZalaczniki.toString().split(",");
			
			for (var i=0;i<tablicaDozowolonychZalacznikow.length;i++) {
				  if (tablicaDozowolonychZalacznikow[i] != null && tablicaDozowolonychZalacznikow[i] !='') {
					  if(tablicaDozowolonychZalacznikow[i].length > 0 && entry["nazwa"].toString().endsWith(".xml") && entry["nazwa"].toString().startsWith(tablicaDozowolonychZalacznikow[i]) && nieDodano)
						{
							zalacznikItem+=  obwUtils.getMenuLink('Podgląd', "obwZalaczniki.podgladZalaczonegoDokumentuRoboczego('"+ entry["id"]["fullId"]+"', '" + tablicaDozowolonychZalacznikow[i] + "','" + entry["nazwa"] + "');") + '&nbsp;';
							nieDodano = false;
						}
				  }
			}
		}
		
		if(entry["format"] == "PDF")
		{
			zalacznikItem+=  obwUtils.getMenuLink('Podgląd', "obwZalaczniki.podgladZalacznika('"+ entry["id"]["fullId"]+"', '" + entry["nazwa"] + "');") + '&nbsp;';
		}
					
		zalacznikItem+= obwUtils.getMenuLink('Pobierz', 'obwZalaczniki.pobierzZalacznik(\''+ entry["id"]["fullId"]+'\');');            	            	
	    zalacznikItem+= (usunLink ? ('&nbsp;'+obwUtils.getMenuLink('Usuń', 'obwZalaczniki.usunZalacznik(\''+ entry["id"]["fullId"]+'\')')) : '' );
	
		return zalacznikItem;
	};
	
	/**
	 * Funkcja uruchamiana po wyborze opcji podgląd z menu danego załącznika. Wyświetla załączniki w formacie PDF w dialogu podglądu
	 */
	this.podgladZalaczonegoDokumentuRoboczego = function(id, typFomrularza, nazwaPliku)
	{
		wizualizacjaId = id;
		wizualizacjaKodDokumentu = typFomrularza;
		wizualizacjaWersjaDokumentu = "";
		wizualizacjaWersjaFormularza = "";
		wizualizacjaURL = 'obw/dodajDokumentyRobocze/pobierzZalacznikDoPodgladu.npi';
		obwWizualizacjaDialog.show();
	};

	/**
	 * Funkcja uruchamiana po wyborze opcji podgląd z menu danego załącznika. Wyświetla załączniki w formacie PDF w dialogu podglądu
	 */
	this.podgladZalacznika = function(id, fileName)
	{
		var url = 'obw/pobierzZalacznikDoPodgladu/'+obwUtils.getIdFromFullId(id)+'/'+fileName;
		obwUtils.log(url);
		
		var preview = new zusnpi.dialog.PdfView({
			title : "Podgląd załącznika",
			pdfUrl : url,
		});
	};
	
	
	odswiezZalaczniki = function()
	{
			var uploaderId = obwUploaderId.getUploaderId();
			var metadokumentId = dojo.byId("metadokumentId").value;
			var contentVar = {
					'metadokumentId': metadokumentId
					};
			var args = {
					url: 'obw/zalaczniki/odswiezListe.npi',
					content: contentVar,
					handleAs: "json",
					load: function(resp){
						obwZalaczniki.createAttachmentsList(resp);
						var actualDocumentSize = resp["actualDocumentSize"] / 1024.0;
						if(dojo.byId('actualFileSizeInfo')){
							dojo.byId('actualFileSizeInfo').innerHTML =  "<b>Aktualny rozmiar dokumentu wraz z załącznikami: " + actualDocumentSize.toFixed(2) + " KB</b>";
						}
						dojo.byId('obwLdrDokumentRoboczyPanelAjaxLoader').style.visibility='hidden';
					}
				};
				dojo.xhrPost(args);		
	};
	
	updateFormList = function (resp)
	{	
		 createAttachmentsList(resp);	
	}
	
	function createAttachmentsList(data)
	{
		dijit.byId('obwDokumentyZalacznikiId').attr('content', '');
		daneZalacznikow =data["metadokumentDanePelne"]["zalacznikDanePodstawowe"];
		obwZalaczniki.utworzListeZalacznikow(daneZalacznikow, "obwDokumentyZalacznikiId", true);	
	}
	
	this.pobierzZalacznik = function(id) {
		tempId = id;
		if(tempId==null) {
			console.log('Nie ustawiono id');
			return;
		}
		
		var params = {
			'id.fullId' : tempId
		}
		var url = 'obw/dokumentyRobocze/pobierzZalacznik.npi';
		exportForm(url, '', params);
	}

	this.usunZalacznik = function(id)
	{
		tempId = id;
		
		confirm({
			title: 'Potwierdzanie',
			content: 'Na pewno chcesz usunąć wybrany załącznik?',
			onOkClick: function() {
				dojo.byId('obwLdrDokumentRoboczyPanelAjaxLoader').style.visibility='';
				var contentVar = {
						'zalacznikId': tempId,
					};
				var args = {
					url: 'obw/zalaczniki/usun.npi',
					content: contentVar,
					handleAs: "json",
					load: function(resp){
						odswiezZalaczniki();
					
					}
				};
				dojo.xhrPost(args);					
			}

				
			// onCancelClick: obwGrids.doNothing
		});		
	};
}

var obwZalaczniki = new ObwZalaczniki();
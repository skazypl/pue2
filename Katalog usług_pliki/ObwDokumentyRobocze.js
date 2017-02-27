function ObwDokumentyRobocze()
{	
	/** Flaga określająca czy należy sprawdzić kontekst wywołania - ustawiana przy każdym
	    wejściu na ścieżkę dokumentów roboczych  */
	this.sprawdzKontekst = true,
	/** Flaga określająća czy okno wywołano w kontekscie katalogu usług */
	this.katalogUslug = false,
	/** FullId nowododanego dokumentu */
	this.fullId = null,
	/** Typ nowododanego dokumentu */
	this.typ = null,
	/** Id dokumentu, kótry ma zostać zaznaczony */
	this.idDokumentuDoZaznaczenia = null;
	/** Flaga określająca czy ma zostać wykonane przeładowanie i zaznnaczenie dokumentu */
	this.czyZaznaczycDokument = false;
	/** Flaga określająca czy zdarzenie onLoad już się wykonało  */
	this.obwDokumentyRoboczeOnLoadExecuted = false;
	/** Flaga określajaca czy w zdarzeniu onLoad otworzyć zaznaczony dokumnet do edycji w SOF */
	this.otworzDokumentPoZaladodaniu = false;
	
	this.otworzFormularz = false;
	this.kodyTJO = null;
	/** Domyślna kolumna po której jest sortowana lista dokumentów roboczych */
	this.domyslnaKolumnaSortowania = 6;

	this.dokumentRoboczyCustomFilterId=null;
	this.zaznaczDokumentRoboczy = false;
	
	
	/**
	 * Zwraca strukturę listy dokumentów roboczych
	 */
	this.getStructure = function()
	{
		//obwDokumentyRobocze.pobierzMaksRozmiarZalacznikow();
		var actionStructure = getStructureFromAction('obw/dokumentyRobocze/getStructure.npi');

		return {
			cells : [ {
				field : actionStructure.ID.field,
				hidden : true
			},{
				field : actionStructure.KOD.field,
				hidden : true,
				filterable : false
			},{
				field : actionStructure.PODPISANY_ZEWNETRZNIE.field,
				hidden : true,
				filterable : false
			},{
				field : actionStructure.NAZWA_TYPU.field,
				name : actionStructure.NAZWA_TYPU.name,
				datatype : 'string',
				width : 'auto'
			}, {
				field : actionStructure.MOMENT_UTWORZENIA.field,
				name : actionStructure.MOMENT_UTWORZENIA.name,
				datatype : 'date',
				width : '120px',
				formatter : function(val)
				{
					return gridDateTimeFormatter(val);
				}
			}, {
				field : actionStructure.MOMENT_MODYFIKACJI.field,
				name : actionStructure.MOMENT_MODYFIKACJI.name,
				width : '120px',
				datatype : 'date',
				formatter : function(val)
				{
					return gridDateTimeFormatter(val);
				}
			}, {
				field : actionStructure.STATUS.field,
				name : actionStructure.STATUS.name,
				filterable : false,
				datatype : 'string',
				width : '60px'
			},getCheckboxColumnExt({
									title:"Wybór",
									width:"45px",
									gridId:"obwGridListaDokumentowRoboczych",
									showHeaderCheckbox:true
								})
			]
		};
	};

	this.pobierzMaksRozmiarZalacznikow = function(){
		var args = {
				url: 'obw/zalaczniki/getMaxFileSize.npi',
				handleAs: "json",
				load: function(resp){
					var maxFileSize = resp["maxFileSize"];
					var maxFileSizeInKb = maxFileSize / 1024.0;
					var maxDocumentFileSize = resp["maxDocumentFileSize"];
					var maxDocumentFileSizeInKb = maxDocumentFileSize / 1024.0;
					if(obwImportUploaderId){
						obwImportUploaderId.set('maxFileSize', maxFileSize);
						obwImportUploaderId.set('fileTooBigMessage', "Zbyt duży rozmiar pliku. Maksymalny rozmiar dokumentu to: " + maxFileSizeInKb.toFixed(2) + " KB");
					}
					if(obwUploaderId){
						obwUploaderId.set('maxFileSize', maxFileSize);
						obwUploaderId.set('fileTooBigMessage', "Zbyt duży rozmiar pliku. Maksymalny rozmiar załącznika to: " + maxFileSizeInKb.toFixed(2) + " KB");
					}
					if(dojo.byId('maxKbInfo')){
						dojo.byId('maxKbInfo').innerHTML =  "<div> <i>Maksymalny rozmiar załącznika to: " + maxFileSizeInKb.toFixed(2)
						+ " KB </i> </div> " +
						" <div> <i> Dopuszczalny rozmiar dokumentu z załącznikami: " + maxDocumentFileSizeInKb.toFixed(2)
						+ " KB </i> </div> ";
					}
				}
			}
			dojo.xhrPost(args);	
	};
	
	this.initializeKodyTJO = function(){
		if(obwDokumentyRobocze.kodyTJO == null){
			var args = {
				url: 'obw/dokumentyRobocze/pobierzKodyTJO.npi',
				handleAs: "json",
				load: function(resp){
					obwDokumentyRobocze.kodyTJO = resp["dict"];
					obwDokumentyRobocze.setKodyTJO();
				}
			}
			dojo.xhrPost(args);	
		} else {
			obwDokumentyRobocze.setKodyTJO();
		}
	};
	
	this.setKodyTJO = function(){
		var tjoList = obwDokumentyRobocze.kodyTJO;
		
	    var options = new dojo.data.ItemFileWriteStore({data:
		    {
	    	  identifier: 'id',
	    	  label: 'name',
    		  items: []
		    }
	    });
	
	    for (var key in tjoList) {
	         options.newItem(
	        		 {id: key,
	        		 name: tjoList[key]}
	        );
	    }
	
	    obwDokumentRoboczyWyslijDialogUnit.attr('queryExpr', '*${0}*');
	    obwDokumentRoboczyWyslijDialogUnit.attr('highlightMatch', 'none');
	    obwDokumentRoboczyWyslijDialogUnit.attr('maxHeight', '150');
	    obwDokumentRoboczyWyslijDialogUnit.attr('autocomplete', 'false');
	    obwDokumentRoboczyWyslijDialogUnit.attr('store', options);
//	
//		for (var key in tjoList) {
//			obwDokumentRoboczyWyslijDialogUnit.addOption(
//			{
//				label:tjoList[key],
//				value:key
//			});
//		}
		
	};
	
	/**
	 * Wywołuje akcję weryfikacji dokumentu roboczego
	 */
	this.weryfikujDokument = function(){
		obwUtils.disableButton('obwDokumentyRoboczeWeryfikujDokumentButton');
		
		var contentVar = {
				'id.fullId' : metadokumentId.value
			};
		
		var args = {
			url : 'obw/dokumentyRobocze/weryfikujDokument.npi',
			content : contentVar,
			handleAs : "json",
			load : function(resp)
			{
				obwUtils.enableButton('obwDokumentyRoboczeWeryfikujDokumentButton');
				if(resp["blad"])
				{
					alert(resp["komunikat"],{dialogWidth : '550px'});
				}
				else{
					alert("Dokument poprawny.");
				}
			}
		};
		
		dojo.xhrPost(args);
	
	};
	
	this.formatPostalCode = function(postalCode){
		if(postalCode){
			var postcalCodeRegex = /^[0-9]{2}\-[0-9]{3}$/;
			if(postcalCodeRegex.test(postalCode)){
				return postalCode;
			} else {
				return postalCode.substring(0,2) + '-' + postalCode.substring(2);
			}
		}
		return postalCode;
	}

	this.czyDokumentPrzeznaczonyDoWysylki = function(onOkClickFunction)
	{
		var czyMoznaWyslacFlaga = true;
		var contentVar = {
			'id.fullId': metadokumentId.value,
			'kodDok' : typDokumentuKod.attr("value")
		};
		var args = {
			url: 'obw/dokumentyRobocze/sprawdzCzyDokumentPrzeznaczonyDoWysylki.npi',
			content: contentVar,
			handleAs: 'json',
			sync: true,
			load: function (resp) {
				if (resp.blad) {
					new zusnpi.dialog.Alert({content: resp.komunikat}).show();
					czyMoznaWyslacFlaga = false;
					return;
				}

				if (resp.czyPrzeznaczonyDoWysylki) {
					czyMoznaWyslacFlaga = true;
					if (typeof onOkClickFunction === 'function') {
						onOkClickFunction();
					}
				}
				else {
					var alert = new zusnpi.dialog.Alert();
					if (typeof onOkClickFunction === 'function') {
						alert.onOkClick = onOkClickFunction;
					}
					alert.dialogContent.set('value', resp.komunikat);
					alert.setArgs();
					alert.show();

					czyMoznaWyslacFlaga = false;
				}
			}
		};

		dojo.xhrPost(args);

		return czyMoznaWyslacFlaga;
	};
	
	/**
	 * Rozpoczyna ścieżkę wysłania dokumentu
	 */
	this.wyslijDokument = function()
	{
		if (!obwDokumentyRobocze.czyDokumentPrzeznaczonyDoWysylki()) {
			return;
		}

		obwUtils.disableButton('obwDokumentyRoboczeWyslijDokument');
		obwDokumentyRobocze.initializeKodyTJO();
		var contentDialogVar = {
				'id.fullId' : metadokumentId.value
		};
		
		var dialogArgs = {
				url : 'obw/dokumentyRobocze/pobierzDaneDoDialogu.npi',
				content : contentDialogVar,
				handleAs : "json",
				load : function(resp)
				{
					obwUtils.enableButton('obwDokumentyRoboczeWyslijDokument');
					if(resp){
						
						if(resp["blad"]){
							alert(resp["komunikat"]);
							return;
						}
						
						if(resp["SW-1"]){
							obwDokumentRoboczySW1WyslijDialog.show();
							return;
						}
						
						if(resp["immediate"]){
							if(resp["wykonanie"])
							{
								obwGridListaDokumentowRoboczych.reload();
								obwListaDokumentowRoboczychCrudButtonPanel.swapPanel(obwListaDokumentowRoboczychGridContainer);
								alert(resp["komunikat"]);
							}
							else
							{
								if(resp["zlecenie"]!=null){
									fullId = resp["zlecenie"]["id"]["fullId"];
									obwZlecenia.potwierdzZlecenie(fullId, 'DOKROBC');
								}
								else{
									alert(resp["komunikat"]);
								}
							}		
							obwUtils.enableButton('obwDokumentyRoboczeWyslijDokument');
							return;
						}
						
						obwDokumentRoboczyWyslijDialogradioOneJsId.set('disabled',  !resp["sposobOdp"][0]);
						obwDokumentRoboczyWyslijDialogradioTwoJsId.set('disabled', !resp["sposobOdp"][1]);
						obwDokumentRoboczyWyslijDialogradioThreeJsId.set('disabled', !resp["sposobOdp"][2]);
						
						if(resp["sposobOdp"][0]){
							obwDokumentRoboczyWyslijDialogradioOneJsId.set('checked', true);
						} else if(resp["sposobOdp"][1]){
							obwDokumentRoboczyWyslijDialogradioTwoJsId.set('checked', true);
						} else if(resp["sposobOdp"][2]) {
							obwDokumentRoboczyWyslijDialogradioThreeJsId.set('checked', true);
						}
						
						if("ELE" == resp["responseType"] && resp["sposobOdp"][0]){
							obwDokumentRoboczyWyslijDialogradioOneJsId.set('checked', true);
						} else if("TJO" == resp["responseType"] && resp["sposobOdp"][1]){
							obwDokumentRoboczyWyslijDialogradioTwoJsId.set('checked', true);
						} else if("PAP" == resp["responseType"] && resp["sposobOdp"][2]) {
							obwDokumentRoboczyWyslijDialogradioThreeJsId.set('checked', true);
						}
						
						obwDokumentyRobocze.ustawInfoSposobOdp(resp["sposobOdp"]);
						
						obwDokumentRoboczyWyslijDialogName.set('value', resp["name"]);
						obwDokumentRoboczyWyslijDialogSurname.set('value', resp["surname"]);
						obwDokumentRoboczyWyslijDialogName2.set('value', resp["name"]);
						obwDokumentRoboczyWyslijDialogSurname2.set('value', resp["surname"]);
						obwDokumentRoboczyWyslijDialogUnit.set('value', resp["unit"]);
						obwDokumentRoboczyWyslijDialogPostalCode.set('value', obwDokumentyRobocze.formatPostalCode(resp["postalCode"]));
						obwDokumentRoboczyWyslijDialogPlace.set('value', resp["place"]);
						obwDokumentRoboczyWyslijDialogStreet.set('value', resp["street"]);
						obwDokumentRoboczyWyslijDialogNrLokalu.set('value', resp["nrLokalu"]);
						obwDokumentRoboczyWyslijDialogNrDomu.set('value', resp["nrDomu"]);
						obwDokumentRoboczyWyslijDialogInstitution.set('value', resp["instytucja"]);
						if (resp["typDok"] == "1") {
						contactTypeDowod.set('checked', true);
						contactTypePaszport.set('checked', false);
					    } else if (resp["typDok"] == "2"){
						contactTypeDowod.set('checked', false);
						contactTypePaszport.set('checked', true);
					    }
						obwDokumentRoboczyWyslijDialogDokument.set('value',resp["dokNr"]);
					}
					obwDokumentRoboczyWyslijDialog.show();
				}
		};
		
		
		obwDokumentRoboczyWyslijDialog.onHide = function(e) {
				if(!getObwDokumentRoboczyWyslijDialogIsSuccess()){
					return;
				}
				
				obwUtils.disableButton('obwDokumentyRoboczeWyslijDokument');
				var contentVar = {
						'id.fullId' : metadokumentId.value,
						'name' : getObwDokumentRoboczyWyslijDialogName(),
						'surname' : getObwDokumentRoboczyWyslijDialogSurname(),
						'unit' : getObwDokumentRoboczyWyslijDialogUnit(),
						'responseType' : getObwDokumentRoboczyWyslijDialogResponseType(),
						'postalCode' : obwDokumentRoboczyWyslijDialogPostalCode.value ,
						'place' : obwDokumentRoboczyWyslijDialogPlace.value ,
						'street' : obwDokumentRoboczyWyslijDialogStreet.value ,
						'kodDok' : getObwDokumentRoboczyWyslijDialogResponseType(),
						'instytucja' : obwDokumentRoboczyWyslijDialogInstitution.value,
						'typOsobaInstytucja' : getObwDokumentRoboczyWyslijDialogOsobaType(),
						'typDok' : getObwDokumentRoboczyWyslijDialogDokumentType(),
						'dokNr': obwDokumentRoboczyWyslijDialogDokument.value,
						'nrLokalu': obwDokumentRoboczyWyslijDialogNrLokalu.value,
						'nrDomu': obwDokumentRoboczyWyslijDialogNrDomu.value
					};
				
				var args = {
					url : 'obw/dokumentyRobocze/wyslijDokument.npi',
					content : contentVar,
					handleAs : "json",
					load : function(resp)
					{
						obwUtils.log("onLoad wyslijDokument:" + resp);
						if(resp["blad"])
						{
							alert(resp["komunikat"]);
						}
						else
						if(resp["wykonanie"])
						{
							obwGridListaDokumentowRoboczych.reload();
							obwListaDokumentowRoboczychCrudButtonPanel.swapPanel(obwListaDokumentowRoboczychGridContainer);
							alert(resp["komunikat"]);
						}
						else
						{
							if(resp["zlecenie"]!=null){
								fullId = resp["zlecenie"]["id"]["fullId"];
								obwZlecenia.potwierdzZlecenie(fullId, 'DOKROBC');
							}
							else
								alert(resp["komunikat"]);
						}		
						obwUtils.enableButton('obwDokumentyRoboczeWyslijDokument');
					}
				};
				
				dojo.xhrPost(args);			
		};		
		
		obwDokumentRoboczySW1WyslijDialog.onHide = function(e) {
			if(!getObwDokumentRoboczySW1WyslijDialogIsSuccess()){
				return;
			}
			
			obwUtils.disableButton('obwDokumentyRoboczeWyslijDokument');
			var contentVar = {
					'id.fullId' : metadokumentId.value,
					'responseType' : obwDokumentRoboczySW1WyslijDialogReponseType.value,
					'kodDok' : obwDokumentRoboczySW1WyslijDialogReponseType.value
				};
			
			var args = {
				url : 'obw/dokumentyRobocze/wyslijDokument.npi',
				content : contentVar,
				handleAs : "json",
				load : function(resp)
				{
					obwUtils.log("onLoad wyslijDokument:" + resp);
					if(resp["blad"])
					{
						alert(resp["komunikat"]);
					}
					else
					if(resp["wykonanie"])
					{
						obwGridListaDokumentowRoboczych.reload();
						obwListaDokumentowRoboczychCrudButtonPanel.swapPanel(obwListaDokumentowRoboczychGridContainer);
						alert(resp["komunikat"]);
					}
					else
					{
						if(resp["zlecenie"]!=null){
							fullId = resp["zlecenie"]["id"]["fullId"];
							obwZlecenia.potwierdzZlecenie(fullId, 'DOKROBC');
						}
						else
							alert(resp["komunikat"]);
					}		
					obwUtils.enableButton('obwDokumentyRoboczeWyslijDokument');
				}
			};
			
			dojo.xhrPost(args);			
		};
		
		dojo.xhrPost(dialogArgs);	
	};
	
			
	
	this.ustawInfoSposobOdp = function(info){
		var myHtml = '<div>Typ wysyłanego dokumentu pozwala na przekazanie odpowiedzi z ZUS następującymi kanałami:</div>';
		var moreInfo = !info[0] || !info[1] || !info[2];
		
		if(moreInfo){
			myHtml += '<ul>';
			if(info[0]){
				myHtml += '<li>elektronicznie (przez portal PUE ZUS)</li>';
			}
			if(info[2]){
				myHtml += '<li>pocztą tradycyjną</li>';
			}
			if(info[1]){
				myHtml += '<li>do odbioru w TJO ZUS</li>';
			}
			
			myHtml += '</ul>';
		}
		dojo.byId('sposobOdpInfoDialog').innerHTML = myHtml;
	};
	/**
	 * Akcja wywoywana na liscie dokumentow roboczych jesli utworzono zlecenie, a nie autoryzowano go dla dokumentu
	 */	
	this.onWynikAutoryzacjiZlecenia = function(wykonano, komunikat, kodTypuDokumentu)	
	{		
		if(wykonano)
		{
			if(komunikat != null)
			{
				alert(komunikat);
			}
		}
		else
		{			
//			alert(obwDokumentyRobocze._getNotSentMessage(komunikat, kodTypuDokumentu));
			alert({
				content : obwDokumentyRobocze._getNotSentMessage(komunikat, kodTypuDokumentu),
				dialogWidth : '450px'
			});
		}
	};
	
	/**
	 * Zwraca komunikat o niewysłaniu dokumentu.
	 */	
	this._getNotSentMessage = function(komunikat, kodTypuDokumentu)
	{
		return 'Dokument ' + kodTypuDokumentu + ' nie został wysłany. ' + (komunikat != null ? komunikat : '') + ' Zlecenie wysłania dokumentu dostępne jest na liście operacji do potwierdzenia, skąd można wykonać autoryzację usługi.';
	};
	
	/**
	 * Akcja klawisza usuń
	 */	
	this.onClickUsun = function()
	{
		obwDokumentyRobocze.invokeUsun(null);
	};

	
	/**
	 * Funkcja odpowiedzialna za usunięcie dokumentu
	 */
	this.invokeUsun = function(fullId)
	{
		obwUtils.invokeSingleMultiGridAction(fullId, 'Usuń', 'Chcesz usunąć wybrany dokument? Dokument zostanie przeniesiony do kosza.',
				'Chcesz usunąć wybrany dokument? Dokument zostanie przeniesiony do kosza.',
				'Chcesz usunąć wybrane dokumenty? Dokumenty zostaną przeniesione do kosza. Liczba wybranych dokumentów:',
				'obw/dokumentyRobocze/przeniesDoKosza.npi', getGridObject());
	};

	
	/**
	 * Akcja klawisza eksportuj
	 */
	this.onClickEksportuj = function()
	{
		obwDokumentyRobocze.invokeEksportuj(null);
	};

	
	/**
	 * Funkcja odpowiedzialna za eksport dokumentu
	 */
	this.invokeEksportuj = function(fullId)
	{
		obwUtils.invokeSingleMultiGridAction(fullId, 'Eksportuj', 'Chcesz wyeksportować wybrany dokument?',
				'Chcesz wyeksportować wybrany dokument?', 'Chcesz  wyeksportować wybrane dokumenty? Liczba wybranych dokumentów:',
				'obw/dokumentyRobocze/eksportuj.npi', getGridObject(), true);
	};

	
	/**
	 * Funkcja wywoływana przy akcji onShow panelu dukement roboczy. Odpowiada za zakrycie odpowiedniego obszaru wczesniejszego panelu.
	 */
	this.onLdpDokumentRoboczyDialogOnShow = function(idArg, data, mode)
	{		
		obwLdrMenuPane.set("style", "display: none;");
		dijit.byId("contextPane").resize();
		var isPodpisany = getGridObject().getSelectedRecord()["czyPodpisanyZewnetrznie"];
		if(isPodpisany == "true"){
			dokumentRoboczyEdytujButton.set('disabled', true);
			dojo.style( dojo.byId('podpisaneZewnetrznie').parentNode.parentNode, {display:''});
		} else {
			dokumentRoboczyEdytujButton.set('disabled', false);
			dojo.style( dojo.byId('podpisaneZewnetrznie').parentNode.parentNode, {display:'none'})
		}
		
	};

	
	/**
	 * Funkcja wywoływana przy akcji onHide panelu dukement roboczy. Odpowiada za poprawny powrót do widoku okna listy dokumentów roboczych.
	 */	
	this.onLdpDokumentRoboczyDialogOnHide = function(idArg, data, mode)
	{
		obwLdrMenuPane.set("style", "display: block;");
		dijit.byId("contextPane").resize();
	};
	
	
	/**
	 * Funkcja wywoływana przy akcji onLoad panelu dukement roboczy. Odpowiada za utworzenie listy załączników.
	 */
	this.obwLdrDokumentRoboczyFormPanelOnLoad = function(idArg, data, mode)
	{
		obwDokumentyRobocze.obsluzZalaczniki(data["metadokumentDanePelne"]);
		odswiezZalaczniki();
		if(obwDokumentyRobocze.otworzFormularz){
			obwDokumentyRobocze.otworzFormularz = false;
			obwFormularze.wyswietlFormularzSOFTworzenieNowego(obwDokumentyRobocze.typ, obwDokumentyRobocze.idDokumentuDoZaznaczenia);
		}
		obwLdrDokumentRoboczyFormPanel.closeButton.focus();
	};

	
	/**
	 * Metoda podpita na zdarzeniu userDefinedPreLoad na liście. Sprawdza za piwerwszym razem kontekst wywołania
	 * formatki i jeśli jest ono z katalogu usług to ustawia sortowanie po dacie utworzenia dokumentu
	 */
	this.ustawSortowanie = function()
	{		
		obwUtils.log('ustawSortowanie: '+ obwDokumentyRobocze.sprawdzKontekst);
		if(obwDokumentyRobocze.sprawdzKontekst==true)
		{
			obwUtils.log('sprawdzKontekst');
			obwDokumentyRobocze.sprawdzKontekst = false;
			obwUtils.invokeSimpleAction(null, 'obw/dokumentyRobocze/sprawdzKontekst.npi', function(resp){
				obwDokumentyRobocze.katalogUslug = resp['katalogUslug'];
				var fullId = resp['fullId'];
				var typ = resp['typ'];
				var wywolanie = resp['wywolanie'];
				var parametryWywolania = resp['parametryWywolania'];
				if(wywolanie){
					obwFormularze.utworzFormularz(typ, parametryWywolania);
				}
				
				//jeśli wywołanie z katalogu usług to ustaw sortowanie
				if(obwDokumentyRobocze.katalogUslug)
				{
					if(fullId){
						obwDokumentyRobocze.ustawSelekcjeNaLiscie(obwUtils.getIdFromFullId(fullId), typ);
					}
				} 				
			});
		}		
	};	

	/**
	 * Rozpoczyna ścieżkę ustawienia zaznaczenia na nowododanym rekordzie (wywoływane dodawania dokumentu lub z wykonania usługi z katalogu)
	 */
	this.ustawSelekcjeNaLiscie = function(idDokumentu, kodFormularza)
	{
		
		obwUtils.log("ustawSelekcjeNaLiscie: idDokument="+idDokumentu+" kodFormularza="+kodFormularza);
		
		//idDokumentu do zaznaczenia
		obwDokumentyRobocze.idDokumentuDoZaznaczenia = idDokumentu;
		obwDokumentyRobocze.kodFormularza = kodFormularza;
		
		//ustaw kod formularza na postawie przekazanego parametru (z katalogu usług) lub z listy wyboru typu formularza (dodawanie nowego)
		if(kodFormularza==null || idDokumentu == null)
		{
			obwUtils.log("ustawSelekcjeNaLiscie: Brak wymagabych parametrów.");
			return;
		}
			
		
		//ustaw flagę zaznaczenia rekordu
		obwDokumentyRobocze.czyZaznaczycDokument = true;
		
		//wyczyść filtry i posortuj dokumenty po dacie utworzenia
		getGridObject().clearGridFilter();	
		getGridObject().setSortIndex(obwDokumentyRobocze.domyslnaKolumnaSortowania, false);
		getGridObject().update();
		obwUtils.log("ustawSelekcjeNaLiscie: wyczyść filtry i posortuj dokumenty po dacie utworzenia"+obwDokumentyRobocze.czyZaznaczycDokument);

	};
	
	this.preLoad = function(){
		obwUtils.log("Preload "+obwDokumentyRobocze.dokumentRoboczyCustomFilterId,obwListaDokumentowRoboczychZawezoneId.value);
		if(obwDokumentyRobocze.dokumentRoboczyCustomFilterId!=null)
		{
			obwListaDokumentowRoboczychZawezoneId.value=obwDokumentyRobocze.dokumentRoboczyCustomFilterId;
			obwDokumentyRobocze.dokumentRoboczyCustomFilterId=null;
			dojo.style( dojo.byId('czyZawezoneContentPane'), {display:'block'});
			//obwGridListaDokumentowRoboczych.customFilterControlId="obwListaDokumentowRoboczychCustomSingleFilterId";
			obwDokumentyRobocze.zaznaczDokumentRoboczy=true;
		}
		else
		{
			obwDokumentyRobocze.ustawSortowanie();
		}
	};
	
	this.postLoad = function(){
		obwUtils.log("Postload")
		obwListaDokumentowRoboczychCrudButtonPanel.RButton.focus();
		if (typeof autoloadSW1 !== 'undefined') {
			autoloadSW1();
		}
		
		if(!obwDokumentyRobocze.zaznaczDokumentRoboczy)
		{
			obwDokumentyRobocze.zaznaczRekordPoPrzeladowaniu();
			return;
		}
		obwDokumentyRobocze.zaznaczDokumentRoboczy = false;		
		var currentRecord = getGridObject().getRecordForIndex(0);
		if(currentRecord==null) return;
		getGridObject().selectByItemIndex(0);	
		obwListaDokumentowRoboczychCrudButtonPanel._onRClick();
	};
	
	/** Custom filtr dla wyszukiwania po id dokumentu roboczego (wykorzystywane tylko przy przekierowaniach)*/
	this.searchSingle = function()
	{
		obwUtils.log("searchSingle ",obwListaDokumentowRoboczychZawezoneId.value);
		if(obwListaDokumentowRoboczychZawezoneId.value=="") return null;
		return {
				Id:{
					value:obwListaDokumentowRoboczychZawezoneId.value,
					datatype:"number"
				}
		};
	};
	
	this.pokazWszystkie = function(){
		obwListaDokumentowRoboczychZawezoneId.value=null;
		dojo.style( dojo.byId('czyZawezoneContentPane'), {display:'none'});
		//obwGridListaDokumentowRoboczych.customFilterControlId="obwListaKomunikatowCustomFilterId";
		obwGridListaDokumentowRoboczych.reload();
		obwListaDokumentowRoboczychGridContainer.resize();
	};
	
	this.onClickNowyDokument = function(){
		obwDokumentyRobocze.pokazWszystkie();
		wyborTypuFormularzaDialog.show();
	}
	
	this.onClickImportujDokument = function(){
		obwDokumentyRobocze.pokazWszystkie();
		importDokumentowDialog.show();
	}
	
	/**
	 *  Metoda podpięta pod zdarzenie userDefinedPostLoad listy dokumentów roboczych.
	 *  Jeśli jest ustawiona flaga czyZaznaczycDokument to zaznacza na gridzie dokumentów roboczych ostatnio
	 *  dodany dokument (następuje sortowanie po dacie utworzenia i następnie wyszukuiwany jest wśród widocznych pozycji dokument
	 *  o id = idDokumentuDoZaznaczenia. W przypadku nie znalezienia dokumentu flaga
	 */	
	this.zaznaczRekordPoPrzeladowaniu = function()
	{
		obwUtils.log('wykonane onload= ' + obwDokumentyRobocze.obwDokumentyRoboczeOnLoadExecuted);
		obwUtils.log("zaznaczRekordPoPrzeladowaniu "+obwDokumentyRobocze.czyZaznaczycDokument);
		
		
		if(obwFormularze.sygnatura_sprawy != null){
			wyborTypuFormularzaDialog.show();
		}
		
		if(!obwDokumentyRobocze.czyZaznaczycDokument)
			return;
		
		obwDokumentyRobocze.czyZaznaczycDokument = false;		
		
		var i =0;
		//sprawdź wszystkie możliwie widoczne rekordy w kolejności od najbardziej prawdopodobnego
		while(i<100)
		{
			var currentRecord = getGridObject().getRecordForIndex(i);
			//jak się skończy lista to przerwij
			if(currentRecord==null) return;
						
			var currentIdOb = obwUtils.getIdFromFullId(currentRecord['id.fullId']);
			obwUtils.log("zaznaczRekordPoPrzeladowaniu - sprawdzam: "+currentIdOb +" " + obwDokumentyRobocze.idDokumentuDoZaznaczenia);
			//idOb rekordu o indeksie i zgadza się z idOb szukanego obiektu
			if(currentIdOb == obwDokumentyRobocze.idDokumentuDoZaznaczenia)
			{
				getGridObject().selectByItemIndex(i);	
				obwUtils.log("zaznaczRekordPoPrzeladowaniu - zaznaczam: index=" + i + " fullId=" + currentRecord['id.fullId']);
				obwDokumentyRobocze.typ = currentRecord['typDokumentuDanePelne.kod'];
				
				obwUtils.log('wykonane onload= ' + obwDokumentyRobocze.obwDokumentyRoboczeOnLoadExecuted);
				if(obwDokumentyRobocze.obwDokumentyRoboczeOnLoadExecuted==true)
				{
					obwUtils.log('zaznacz natychmiast');
					                    obwDokumentyRobocze.otworzZaznaczonyDokument();			
				} else {
					obwDokumentyRobocze.otworzDokumentPoZaladodaniu=true;
				}
		
				return;
			}
			i++;
		}
		
		
		obwUtils.log("zaznaczRecord- nie znaleznion rekordu: ", this.idDokumentuDoZaznaczenia);
	};
	
	
	/**
	 * Przeniesienie kontrolek uploadu na fromatkę dokumentu oraz dialog importu.
	 * Uploadery tworzone są na liście roboczych ze względu na porblemy inicjalizacji w IE8	
	 */	
	this.obwDokumentyRoboczeOnLoad = function()
	{
		obwUtils.log('wykonane onload= ' + obwDokumentyRobocze.obwDokumentyRoboczeOnLoadExecuted);
		obwUtils.log("obwDokumentyRoboczeOnLoad");
		
		dojo.disconnect(obwDokumentyRoboczeHandle);
		
		obwUtils.log('pobieranie maksymalnego rozmiaru załączników');
		obwDokumentyRobocze.pobierzMaksRozmiarZalacznikow();
		obwDokumentyRobocze.obwDokumentyRoboczeOnLoadExecuted = true;
		obwUtils.log('wykonane onload= ' + obwDokumentyRobocze.obwDokumentyRoboczeOnLoadExecuted);
			
		var element = dojo.byId("obwDodajDokumentRoboczy");
		var place  = dojo.byId("obwDodajDokumentRoboczyContentPane");
		if(element != null) {
			dojo.place(element, place, "only");
		}
		
		var element = dojo.byId("obwUploaderId");
		var place  = dojo.byId("obwZalacznikiUploaderContentPane");
		if(element != null) {
			dojo.place(element, place, "only");
		}
			   	
		var element = dojo.byId("obwImportUploaderId");
		var place  = dojo.byId("obwImportDokumentowUploaderContentPane");	
		if(element != null) {
			dojo.place(element, place, "only");
		}
		   	
		dijit.byId("contextPane").resize();
		   	
		if(obwDokumentyRobocze.otworzDokumentPoZaladodaniu) otworzZaznaczonyDokument();
	};	
	
	this.onWczytanieListy = function()
	{
		obwDokumentyRobocze.sprawdzKontekst=true;
		obwDokumentyRobocze.obwDokumentyRoboczeOnLoadExecuted = false;
	}
	
	this.otworzZaznaczonyDokument = function()
	{
		obwListaDokumentowRoboczychCrudButtonPanel._onRClick();			
		obwDokumentyRobocze.otworzFormularz = true;
	};	
	
	/**
	 * Funkcja zwracająca ID grida
	 */
	var getGridObject = function()
	{
		return obwGridListaDokumentowRoboczych;
	};

	
	
	
	
	/**
	 * Funkcja klawisza sprawdzającego aktualność dokumentu. Jego zadaniem jest srawdzenie aktualnej wersji dokumentu i porównanie jej z wersją użytkownika.
	 * W przypadku wersji nieaktualnej użytkownik jest o tym informowany i pytany, czy chce zaktualizować wzór dokumentu.
	 * Jeśli chce to zostaje przekierowany do SOFa z nową wersją dokumentu, jeżeli nie chce to jest on jedynie powiadamiany o swoim wyborze.
	 */	
	this.sprawdzAktualnoscDokumentu = function()
	{
		_sprawdzAktualnoscDokumentu(_dokumentAktualnyInfo, _uaktualnijWersjeDokumentu);
	};
		
	/**
	 * Funkcja otwierająca dokument do edycji. Następuje srawdzenie aktualnej wersji dokumentu i porównanie jej z wersją zapisanego dokuemntu.
	 * W przypadku wersji nieaktualnej użytkownik jest o tym informowany i pytany, czy chce zaktualizować wzór dokumentu -> jeśli tak dokument jest aktualizowany i otwierany
	 * w formularzu SOF do edycji, w przeciwnym przypadku dokument pozostaje niezmieniony i wyświetlane info. Jeśli dokument jest aktualny automatycznie następuje otwarcie
	 * formularza w trybie edycji.
	 */	
	this.otworzDokumentDoEdycji = function()
	{
		_sprawdzAktualnoscDokumentu(_otworzDokumentDoEdycji, _uaktualnijWersjeDokumentu);	
	};
	
	var _dokumentAktualnyInfo = function()
	{
		alert("Dokument jest zapisany w aktualnej wersji wzoru dokumentu.");
	};
	
	/**
	 * Funkcja prywatna otwierająca dokument do edycji w formularzu SOF
	 */	
	var _otworzDokumentDoEdycji = function()
	{
		obwFormularze.wyswietlFormularzSOFEdycjaDokumentu(typDokumentuKod.value, idOb.value);			
	};		
		
	/**
	 * Funkcja prywatna wywołująca uaktualnienie dokumentu do bieżącej wersji wzoru
	 */	
	var _uaktualnijWersjeDokumentu = function()
	{
		var contentVar = {
			'id.fullId' : obwGridListaDokumentowRoboczych.getSelectedRecord()["id.fullId"]
		};
		var args = {
			url : 'obw/dokumentyRobocze/uaktualnijWersjeDokumentu.npi',
			content : contentVar,
			handleAs : "json",
			load : function(resp)
			{
					obwFormularze.wyswietlFormularzSOFEdycjaDokumentu(typDokumentuKod.value, idOb.value);			
			}
		}
			
		dojo.xhrPost(args);	
	};		
		
	/**
	 * Funkcja prywatna sprawdzająca aktualność dokumentu. Jej daniem jest srawdzenie aktualnej wersji dokumentu i porównanie jej z wersją użytkownika.
	 * W przypadku wersji nieaktualnej i potwierdzeniu przez użytkownika chęci aktualizacji wykonywana jest funkcja przekazana przez parametr "onNieaktualnyFunction"
	 * W przypadku wersji aktualnej wykonywana jest funckja przekazana przez parametr "onAktualnyFunction"
	 */	
	var _sprawdzAktualnoscDokumentu = function(onAktualnyFunction, onNieaktualnyFunction)
	{
		//obwUtils.disableButton(obwAktualnoscWzoruDokumentuButton);
		var contentVar = {
			'id.fullId' : obwGridListaDokumentowRoboczych.getSelectedRecord()["id.fullId"],
			'kod' : typDokumentuKod.attr("value")
		};
			
		var args = {
			url : 'obw/dokumentyRobocze/pobierzNajnowszaWersjeDokumentu.npi',
			content : contentVar,
			handleAs : "json",
			load : function(resp)
			{
				//obwUtils.enableButton(obwAktualnoscWzoruDokumentuButton);
				// Pobranie wersji wzoru dokumentu użytkownika z formatki szczegółów dokumentu roboczego
				var wersjaDokumentuUzytkownika = wersjaWzoruDok.attr("value");
				// Pobranie aktualnej wersji wzoru dokumentu
				var wersjaBiezacaDokumentu = resp["wersja"];

				// Przekierowanie do SOFa z nowszą wersją
				if(wersjaDokumentuUzytkownika < wersjaBiezacaDokumentu)
				{
					var dialogPotwierdzenia = new zusnpi.dialog.Confirm({
						title: "Aktualizacja dokumentu",
						dialogHeight : '150px',
						dialogWidth : '450px',
						content: "Wersja " + wersjaDokumentuUzytkownika + " wzoru dokumentu jest wersją nieaktualną. Bieżącą wersją wzoru dokumentu jest wersja " + wersjaBiezacaDokumentu + ". Nastąpi konwersja dokumentu do bieżącej wersji i przekierowanie do edycji. Chcesz kontynuować?"
					});
					// Funkcja klawisza OK dialogu
					dialogPotwierdzenia.onOkClick = function(){
						onNieaktualnyFunction();
					}
					// Funkcja klawisza Anuluj dialogu
					dialogPotwierdzenia.onCancelClick = function(){
						alert("Dokument pozostał w dotychczasowej wersji wzoru.");
					}
					dialogPotwierdzenia.setArgs();
					dialogPotwierdzenia.show();
				}
				// Komunikat o aktualności
				else if(wersjaDokumentuUzytkownika == wersjaBiezacaDokumentu)
				{
					onAktualnyFunction();
				}
				
			}
		}
			
		dojo.xhrPost(args);	
	};	
	
	this.obsluzZalaczniki = function(rec)
	{
			var contentVar = {
				'kodDok' : typDokumentuKod.attr("value")
			};
				
			var args = {
				url : 'obw/dokumentyRobocze/pobierzInfoOZalacznikach.npi',
				content : contentVar,
				handleAs : "json",
				load : function(resp)
				{
					var zalaczniki = resp["dozwoloneZalaczniki"];
					
					dojo.style(dijit.byId('obwUploadZalacznikow').domNode, {
						  display: ( 'block' )
					});
						
					dojo.style(dojo.byId('maxKbInfo'), {
						  display: ( 'block' )
					});
					
					dojo.style(dojo.byId('zalacznikiInfo'), {
						  display: ( 'block' )
					});
					
					dojo.style(dijit.byId('obwUploaderId_uploader').domNode, {
						visibility: ( '' )
					});
					
					dojo.style(dojo.byId('actualFileSizeInfo'), {
						  display: ( 'block' )
					});
					
					if(!zalaczniki){
							dojo.style(dijit.byId('obwUploaderId_uploader').domNode, {
								  visibility: ( 'hidden' )
							});
							dojo.style(dojo.byId('maxKbInfo'), {
								  display: ( 'none' )
							});
							dojo.style(dojo.byId('actualFileSizeInfo'), {
								  display: ( 'none' )
							});
							dojo.byId('zalacznikiInfo').innerHTML = "<div> <i>Wybrany typ dokumentu nie pozwala na dołączanie załączników. </i> </div> ";
					} else {
						dojo.style(dojo.byId('zalacznikiInfo'), {
							  display: ( 'none' )
						});
					}
				}
			}
			dojo.xhrPost(args);	

		
	};
	
	this.pobierzPobownieDaneDokumentuRoboczego = function(czyPrzeladowac)
	{
                // jesli wywolanie jest z poziomu menu Zlecenia->Operacje do potwierdzenia, to reload ma nie wystepowac
                //console.log('czy przeladowac wartosc: ' + czyPrzeladowac.get("value"));
                if(czyPrzeladowac.get("value")=='noReload')
                    return;

                if((typeof obwLdrDokumentRoboczyFormPanel == 'undefined') || (typeof obwGridListaDokumentowRoboczych == 'undefined'))
			return;

		var rec = obwGridListaDokumentowRoboczych.getSelectedRecord();
		if(typeof rec == 'undefined') return;
		if(rec === null) return;
		
		if(rec["id.fullId"] != null)
		{
			var contentVar = {
				'id.fullId' : obwGridListaDokumentowRoboczych.getSelectedRecord()["id.fullId"],
				'kod' : typDokumentuKod.attr("value")
			};
			var args = {
				url : 'obw/dokumentyRobocze/load.npi',
				content : contentVar,
				handleAs : "json",
				headers : {
					"Sof-Autosave" : "true"
				},
				load : function(resp)
				{
					if(resp){
						metadokumentMomentModyfikacji.set('value', resp.metadokumentDanePelne.momentModyfikacji);
						metadokumentMomentUtworzenia.set('value', resp.metadokumentDanePelne.momentUtworzenia);
						typDokumentuNazwa.set('value', resp.metadokumentDanePelne.typDokumentuDanePelne.nazwa);
						typDokumentuKod.set('value', resp.metadokumentDanePelne.typDokumentuDanePelne.kod);
						wersjaWzoruDok.set('value', resp.metadokumentDanePelne.wersjaTypuDokumentu);
						wersjaFormularza.set('value', resp.metadokumentDanePelne.wersjaTypuFormularza);
						metadokumentOpisTypuDokumentu.set('value', resp.metadokumentDanePelne.typDokumentuDanePelne.opis);
					}
				}
			}
					
			dojo.xhrPost(args);
			//getGridObject().setSortIndex(5, false);
		}
		else
			return;
	};
	
	this.wlascicielFormatter = function(value){
		
		if(value){
			if('Rola ogólna'==value["nazwaTypuRoli"]) return 'Rola ogólna';
			return value["nazwaTypuRoli"] + ' - ' + value["nazwaPodmiotu"];
		}
		
		return '';
	};
	
	this.podpisaneFormatter = function(value){
		
		if(value){
			return 'Dokument został podpisany zewnętrznie';
		}
		
		return '';
	};
	

	this.sygnaturaFormatter = function(value){
		
		if(value){
			return value + ' - <a class="orange_arr" onClick="obwDokumentyRobocze.otworzDialog()">Zmień</a>';
		}
		
		return 'Brak - <a class="orange_arr" onClick="obwDokumentyRobocze.otworzDialog()">Zmień</a>';
	};
	
	this.otworzDialog = function(){
		zmienSygnatureSprawy.show();
	};
	
	/**
	 * Weryfikacja podpisanego dokumentu w ePUAP
	 */
	this.weryfikujPodpisanyPrzezEPUAPDokument = function(){
		obwUtils.showSendActionSplash();
		
		var args = {
			url 	 : 'obw/zlecenia/obwWeryfikujDokumentPodpisanyPrzezEPUAP.npi',
			handleAs : 'json',
			sync 	 : true,
			load 	 : function(resp)
			{
				obwUtils.hideSendActionSplash();
				
				var wykonano  = resp['wykonano'];
				var komunikat = resp['komunikat'];
				var kodTypuDokumentu = '"' + resp['kodTypuDokumentu'] + '"';
				
				// Komunikat w przypadku błędnej weryfikacji dokumentu
				if (!wykonano)
				{
					obwZlecenia.onWynikAutoryzacjiZlecenia(wykonano, obwDokumentyRobocze._getNotSentMessage(komunikat, kodTypuDokumentu));
				}
				// Komunikat w przypadku prawidłowego podpisania dokumentu
				else {
					obwDokumentyRobocze.onWynikAutoryzacjiZlecenia(wykonano, komunikat, kodTypuDokumentu);
				}
			},
			error : function(error, resp) {
				error(error);
			}
		};
		dojo.xhrPost(args);
	};
	
	/**
	 * Weryfikacja podpisanych dokumentów w ePUAP
	 */
	this.weryfikujPodpisanePrzezEPUAPDokumenty = function(){
		
		obwUtils.showSendActionSplash();
		
		var args = {
			url 	 : 'obw/zlecenia/obwWeryfikujDokumentyZZalacznikamiPodpisanePrzezEPUAP.npi',
			handleAs : 'json',
			sync 	 : true,
			load 	 : function(resp)
			{
				obwUtils.hideSendActionSplash();
				
				var wykonano  = resp['wykonano'];
				var komunikat = resp['komunikat'];
				
				var liczbaDokumentow = resp['liczbaDokumentow'];
				var kodTypuDokumentu = '"' + resp['kodTypuDokumentu'] + '"';
				
				// Komunikat w przypadku błędnej weryfikacji dokumentu
				if (!wykonano)
				{
					if(liczbaDokumentow == 1)
					{
						komunikat = 'Dokument ' + kodTypuDokumentu + ' nie został wysłany. ' + komunikat;
					}
					else
					{
						komunikat = 'Dokumenty nie zostały wysłane. ' + komunikat;
					}
					
					alert(komunikat);
				}
				// Komunikat w przypadku prawidłowego podpisania dokumentu
				else {
					komunikat = "Wynik potwierdzania operacji wysyłania dokumentów: \n - liczba wysłanych dokumentów: " + resp["validOperationCount"]
						+ ", \n - liczba niepodpisanych dokumentów: " + resp["notSignedCount"]
						+ ", \n - liczba błędnie zweryfikowanych dokumentów: " + resp["signatureErrorCount"];
					if(resp["naleznosciCount"] != null && resp["naleznosciCount"] > 0)
						komunikat += ", \n - liczba utworzonych należności: " + resp["naleznosciCount"] + ".";
					
					var dialog = new zusnpi.dialog.Alert({
						dialogHeight : '150px',
						dialogWidth  : '480px',
						content : komunikat
					});
									
					dialog.onOkClick = function(){
						dialog.hide();
					}
					
					dialog.setArgs();
					dialog.show();
				}				

			},
			error : function(error, resp) {
				error(error);
			}
		};
		dojo.xhrPost(args);
	};
	
	/**
	 * Usunięcie elementu ePUAP z sesji
	 */
	this.usunElementEPUAPZSesji = function()
	{
		var args = {
			url 	 : 'obw/obwUsunElementEPUAPZSesji.npi',
			handleAs : "json",
			load 	 : function(resp)
			{
				var kodTypuDokumentu = '"' + resp['kodTypuDokumentu'] + '"';
				var tresc = 'Podpisywanie dokumentu ' + kodTypuDokumentu + ' profilem zaufanym ePUAP zostało anulowane.';
				var komunikat = obwDokumentyRobocze._getNotSentMessage(tresc, kodTypuDokumentu);
		
				alert({ dialogHeight : '150px', dialogWidth : '650px', content : komunikat });
			}
		};
		dojo.xhrPost(args);
	}
}
var obwDokumentyRobocze = new ObwDokumentyRobocze();
dojo.require("obw.widget.obwBaseWidget");	
dojo.require("obw.widget.zlecenia.dialog.obwWyborTypuPotwierdzeniaDialog2");
dojo.require("obw.widget.zlecenia.dialog.obwWyborTypuPotwierdzeniaDialog");
	
function ObwZlecenia() {
	
	this.filtrujZleceniaOfe = function(selected)
	{
		var rec = dijit.byId('gridPotwierdzeniaId');
		
		var items = rec.store._items;
		if (!items) {
			return;
		}
		for ( var i = 0; i < items.length; i++) {
			if(rec.getRecordForIndex(i).nazwaUslugi.indexOf("ZUS-US-OFE-01") == -1 || rec.getRecordForIndex(i).nazwaUslugi.indexOf("ZUS-US-OFE-02") == -1 || rec.getRecordForIndex(i).nazwaUslugi.indexOf("SW-1") == -1){
				rec.addOrRemoveIdToSelection(selected, i);
			}
		}
		rec.update();
	}
	
	/**
	 * Zwraca strukturę listy zleceń
	 */
	this.getStructure = function()
	{
		var actionStructure = getStructureFromAction("obw/zlecenia/getStructure.npi");
		var checkBoxColumn  =  getCheckboxColumnExt({
                             				title:"Wybór",
                             				width:"45px",
                             				gridId:"gridPotwierdzeniaId",
                             				showHeaderCheckbox:true
                             			});
		return {
			cells: [
				{
					field: actionStructure.ID.field,
					hidden: true
				}, {
					field: actionStructure.NAZWA_USLUGI.field,
					name: actionStructure.NAZWA_USLUGI.name,
					datatype:'string',
					// sortable: false,
					width: 'auto'
				}, {
					field: actionStructure.DATA_ZAREJESTROWANIA.field,
					name: actionStructure.DATA_ZAREJESTROWANIA.name,
					datatype:'date',
					width: '120px',
					formatter : function(val)
					{
						return gridDateTimeFormatter(val);
					}
				}, {
					field : actionStructure.POZIOM_BEZPIECZENSTWA.field,
					name : actionStructure.POZIOM_BEZPIECZENSTWA.name,
					datatype : 'string',
					filterable : false,
					sortable : false,
					width : '120px',
					formatter : function(val)
					{
						return obwZlecenia.getPoziomBezpieczenstwa(val);
					}
			}, {
				name : 'Menu',
				width : '240px',
				filterable : false,
				sortable : false,
				formatter : function(val, rowIndex) {
					return obwZlecenia.getMenuItems(rowIndex);
				}
			}, {
			     width:checkBoxColumn.width,
                 showHeaderCheckbox:true,
                 field: checkBoxColumn.field,
                 name: checkBoxColumn.name,
                 filterable: false,
                 sortable: false,
                 styles: checkBoxColumn.styles,
                 datatype: 'boolean',
                 noresize: true,
                 onHeaderCheckFunctionName:'obwZlecenia.filtrujZleceniaOfe',
                 formatter: function(objectValue, rowNumber, cellInfo){
                     var checkBox = checkBoxColumn.formatter(objectValue,rowNumber, cellInfo) ;
                     var rec = dijit.byId("gridPotwierdzeniaId").getRecordForIndex(rowNumber) ;
                     if(rec.nazwaUslugi.indexOf("ZUS-US-OFE-01") >= 0 || rec.nazwaUslugi.indexOf("ZUS-US-OFE-02") >= 0 || rec.nazwaUslugi.indexOf("SW-1") >= 0){
                          checkBox.set("disabled","true");
                     }
                     return checkBox;
                 }
			  }
				// ,
				// getCheckboxColumn("Wybór", "45px", "gridPotwierdzeniaId")

			]
		};	
	};
	/**
	 * Zwraca string prezentowany w gridzie w zaleznosci od poziomu
	 * bezpieczenstwa
	 */
	this.getPoziomBezpieczenstwa = function(poziomBezpieczenstwa)
	{
		if(poziomBezpieczenstwa==2) {
			return "<span title='Wymaga autoryzacji podpisem kwalifikowanym lub profilem ePUAP'>2 - podpis profilem zaufanym ePUAP</span>";
		}
		else if(poziomBezpieczenstwa==1) {
			return "<span title='Wymaga autoryzacji profilem PUE, podpisem kwalifikowanym lub profilem ePUAP'>1 - podpis profilem PUE</span>";
		}
		else
		{
			return "<span title='Wymaga autoryzacji podpisem kwalifikowanym'>3 - kwalifikowany podpis elektroniczny</span>";
		}
	}
	
	/**
	 * Zwraca pozycję menu dla lsity zleceń
	 */
	this.getMenuItems = function(rowIndex)
	{
		var rec = dijit.byId("gridPotwierdzeniaId").getRecordForIndex(rowIndex);
		var pozBezpieczenstwa = rec["poziomBezpieczenstwa"];
		var link = "";
		if(pozBezpieczenstwa == 2 || rec["nazwaUslugi"].indexOf("SW-1") != -1){
			link+=obwUtils.getMenuLink('Potwierdź profilem zaufanym ePUAP', 'obwZlecenia.potwierdzEpuap('+rowIndex+')')+'<br/>';
		}
		link+=obwUtils.getMenuLink('Potwierdź podpisem kwalifikowanym', 'obwZlecenia.potwierdzPodpisem('+rowIndex+')')+'<br/>';
		if(rec["nazwaUslugi"].indexOf("ZUS-US-OFE-01") != -1 || rec["nazwaUslugi"].indexOf("ZUS-US-OFE-02") != -1 || rec["nazwaUslugi"].indexOf("SW-1") != -1){
			link+=obwUtils.getMenuLink('Potwierdź profilem PUE', 'obwZlecenia.potwierdzProfilemPue('+rowIndex+')')+'<br/>';
		}
		link+=obwUtils.getMenuLink('Odrzuć', 'obwZlecenia.odrzucOperacje('+rowIndex+')');
		return link;
	};
			
	/**
	 * Potwierdzanie zleceń z listy zleceń buttonem "Potwierdź"
	 */
	this.potwierdzZlecenieZListy = function()
	{
		var rec = dijit.byId('gridPotwierdzeniaId').getSelectedRecord();
		if(rec != null)
		{	
			var fullId = rec["id.fullId"];
			obwZlecenia.potwierdzZlecenie(fullId, 'ZLECENIA');		
		}
		else
		{
			alert('Nie wybrano zlecenia do potwierdzenia.');
		}	
	}
	
	
	this.potwierdzZlecenia = function (jsIdGrida, kontekstWywolania)
	{	
		   // Wywołanie widgeta potwierdzenia zlecenia
			dialogPotwierdzZlecenie = new obw.widget.zlecenia.dialog.obwWyborTypuPotwierdzeniaDialog2();
			dialogPotwierdzZlecenie.setId(jsIdGrida);
			dialogPotwierdzZlecenie.setKontekstWywolania(kontekstWywolania);
			dialogPotwierdzZlecenie.setOnAnulujFunction(obwZlecenia._anulujPotwierdzanie);
			dialogPotwierdzZlecenie.setOnProfilPueFunction(dojo.hitch(dialogPotwierdzZlecenie, obwZlecenia._potwierdzProfilPue2));
			dialogPotwierdzZlecenie.setOnProfilEpuapFunction(dojo.hitch(dialogPotwierdzZlecenie, obwZlecenia._potwierdzProfilEpuap2));
			dialogPotwierdzZlecenie.setOnPodpisCyfrowyFunction(dojo.hitch(dialogPotwierdzZlecenie, obwZlecenia._potwierdzPodpisCyfrowy2));
			dialogPotwierdzZlecenie.fetch();	
	};
	
	this.potwierdzZleceniaZListy = function()
	{	
		var recCount = dijit.byId('gridPotwierdzeniaId').getMultiSelectionSelectedRecordsCount();
		
		if(recCount > 1){
			obwZlecenia.potwierdzZlecenia(obwListaZlecen, 'ZLECENIA');	
		}else{
			var rec = dijit.byId('gridPotwierdzeniaId').getSelectedRecord();
			if(rec != null)
			{	
				var fullId = rec["id.fullId"];
				obwZlecenia.potwierdzZlecenie(fullId, 'ZLECENIA');		
			}
			else
			{
				alert("Nie zaznaczono zadnego rekordu");
			}
		}
	};
				
			
	/**
	 * Potwierdzanie zlecenia o przekazanym fullId w wybranym kontekscie
	 * wywołania - otwiera okienko wyboru sposobu potwierdzenia, ładuje dane
	 * zlecenia i poywala użytkownikowi wybrać sposób potwierdzenia zlecenia
	 */
	this.potwierdzZlecenie = function (zlecenieFullId, kontekstWywolania)
	{
			// Wywołanie widgeta potwierdzenia zlecenia
			dialogPotwierdzZlecenie = new obw.widget.zlecenia.dialog.obwWyborTypuPotwierdzeniaDialog();
			dialogPotwierdzZlecenie.setId(zlecenieFullId);
			dialogPotwierdzZlecenie.setKontekstWywolania(kontekstWywolania);
			
			dialogPotwierdzZlecenie.setOnAnulujFunction(obwZlecenia._anulujPotwierdzanie);
			dialogPotwierdzZlecenie.setOnShowFunction(obwZlecenia._pokazDialogZlecenia);
			
			dialogPotwierdzZlecenie.setOnProfilPueFunction(obwZlecenia._potwierdzProfilPue);
			dialogPotwierdzZlecenie.setOnProfilEpuapFunction(obwZlecenia._potwierdzProfilEpuap);
			dialogPotwierdzZlecenie.setOnPodpisCyfrowyFunction(obwZlecenia._potwierdzPodpisCyfrowy);
			
			dialogPotwierdzZlecenie.fetch();		
	}	
	

	/**
	 * Akcja wywoywana przy pokazaniu okna zlecenia z kontekstu dokumentu roboczego
	 */	
	this._pokazDialogZlecenia = function(kontekstWywolania, typZlecenia, idObiektuZlecenia)
	{
		obwUtils.log('pokazDialogZlecenia - wywołanie');
		if(kontekstWywolania == 'DOKROBC')
		{
			obwUtils.log('pokazDialogZlecenia - powrot');
			obwGridListaDokumentowRoboczych.reload();
			obwListaDokumentowRoboczychCrudButtonPanel.swapPanel(obwListaDokumentowRoboczychGridContainer);
		}
	};
	
	/**
	 * Callback wywoływany przy anulowaniu potwierdzenia zlecenia
	 */
	this._anulujPotwierdzanie =	function(kontekstWywolania, typZlecenia, idObiektuZlecenia, kodTypuDokumentu){
		obwUtils.log('wywołano onAnulujFunction:');
		obwUtils.log('Kontekst: ' + kontekstWywolania);
		obwUtils.log('Typ zlecenia: ' + typZlecenia);
		obwUtils.log('ID obiektu zlecenia: ' + idObiektuZlecenia);
		obwUtils.log('Typ dokumentu: ' + kodTypuDokumentu);
		if(kontekstWywolania == 'DOKROBC')
		{
			obwDokumentyRobocze.onWynikAutoryzacjiZlecenia(false,null,kodTypuDokumentu);
		} else if(kontekstWywolania == 'ZLECENIA') {
			//alert("Podpisywanie dokumentu zostało anulowane.");
		}
	}
	
	
	this._potwierdzProfilPue = function(kontekstWywolania, typZlecenia, idObiektuZlecenia, kodTypuDokumentu){
		obwUtils.log('--- wywołano potwierdzProfilPue:');
		obwUtils.log(kontekstWywolania);
		obwUtils.log(typZlecenia);
		obwUtils.log(idObiektuZlecenia);
		obwUtils.log(kodTypuDokumentu);
		
		if(typZlecenia!=null && typZlecenia.indexOf('DOK_')>=0){
			obwZlecenia.zapiszDanePotwierdzoneProfilemPue(idObiektuZlecenia, kontekstWywolania, kodTypuDokumentu);
		} else {
			alert('Nieznany typ zlecenia.');
		}
	};
	
	this._potwierdzProfilPue2 = function(idDokumentow)
	{			
	};
	
	
	/**
	 * Callback wywoływany przy wyborze sposobu potwierdzenia poprzez profil
	 * zaufany ePuap
	 */
	this._potwierdzProfilEpuap = function(kontekstWywolania, typZlecenia, idObiektuZlecenia, kodTypuDokumentu){
		obwUtils.log('--- wywołano onProfilEpuapFunction:');
		obwUtils.log(kontekstWywolania);
		obwUtils.log(typZlecenia);
		obwUtils.log(idObiektuZlecenia);
		obwUtils.log(kodTypuDokumentu);
		
		//-------- #13567 - BEGIN
		var callback = function(){
			obwZlecenia.potwierdzDokumentPrzezEpuap(idObiektuZlecenia, kontekstWywolania, kodTypuDokumentu);	
		};
		var mainComponent = dojo.byId("mainContentPaneListaDokumentowRoboczych");
		if(mainComponent == null){
			mainComponent = dojo.byId("mainContentPaneListaZlecen");
		}
		checkEPUAPInfoAndShowMessageAsync((mainComponent != null ? mainComponent.id : null), callback, callback);
		//-------- #13567 - END		
	};
	
	/**
	 * Tymczasowa wersja dla wielu dokumentów
	 */
	this._potwierdzProfilEpuap2 = function(idDokumentow)
	{			
		var multiSignDialog = new zusnpi.dialog.Confirm({
			dialogHeight : '150px',
			dialogWidth  : '460px',
			content : 'Za chwilę nastąpi przekierowanie na platformę ePUAP w celu podpisania wybranych dokumentów swoim profilem zaufanym. Kontynuować?'
		});
		
		multiSignDialog.onCancelClick = function()
		{
			alert("Podpisywanie dokumentów profilem zaufanym ePUAP zostało anulowane.");
			multiSignDialog.hide();
		}
		multiSignDialog.onOkClick = function()
		{
			var contentVar = {
				'selectedRows' : idDokumentow
			};
			var args = {
				url 	 : 'obw/obwPodpiszDokumentyZZalacznikamiPoprzezEPUAP.npi',
				content  : contentVar,
				handleAs : 'json',
				sync	 : true,
				load 	 : function(resp)
				{
					if(resp['blad']) {
						alert('Błąd połączenia z portalem ePUAP.');
					} else {
						var url = resp['url'];
						if (url != null) {
							window.open(url,'Podpis_przez_EPUAP', 'width=1150,height=600,menubar=no,toolbar=no,location=no,scrollbars=yes,resizable=yes,status=no');
						} else {
							alert('Błąd połączenia z portalem ePUAP.');
						}
					}
				},
				error : function(error, resp) {
					error(error);
				}
			}		
			dojo.xhrPost(args);
		}
		
		multiSignDialog.setArgs();
		multiSignDialog.show();
		
	};
	
	/**      	
     * Wywołuje akcję potwierdzenia wybranego dokumentu profilem Pue
	 */
	this.zapiszDanePotwierdzoneProfilemPue = function(fullId, kontekstWywolania, kodTypuDokumentu) {
		
		var args = {
			url : 'obw/zlecenia/zapiszDanePotwierdzoneProfilemPue.npi',
			content : {
				'id.fullId' : fullId,
				'podpisaneDane' : tresc,
				'ofe' : Boolean.TRUE
			},
			handleAs : "json",
			load : function(resp) {									
				obwUtils.hideSendActionSplash();
				
				var wykonano = 	resp["wykonano"];			
				var komunikat = resp["komunikat"];
				if(kontekstWywolania == 'DOKROBC'){
					obwDokumentyRobocze.onWynikAutoryzacjiZlecenia(wykonano, resp["komunikat"], kodTypuDokumentu);
				
				}else if(kontekstWywolania == 'ZLECENIA'){
					obwZlecenia.onWynikAutoryzacjiZlecenia(wykonano, resp["komunikat"], kodTypuDokumentu);
				
				}else{
					if(komunikat!=null) alert(komunikat);
				}
			}
		};
		dojo.xhrPost(args);
	}
	
	
	/**      	
     * Wywołuje akcję potwierdzenia wybranego dokumentu przez ePUAP
	 */
	this.potwierdzDokumentPrzezEpuap = function(fullId, kontekstWywolania, kodTypuDokumentu)
	{
		
		var dialogPotwierdzenia = new zusnpi.dialog.Confirm({
			dialogHeight : '150px',
			dialogWidth  : '460px',
			content : 'Za chwilę nastąpi przekierowanie na platformę ePUAP w celu podpisania dokumentu ' + kodTypuDokumentu + ' swoim profilem zaufanym. Kontynuować?'
		});
		
		
		dialogPotwierdzenia.onCancelClick = function(){
			// Komunikat dla operacji potwierdzania dokumentu roboczego
			if(kontekstWywolania == 'DOKROBC')
			{

				var dialogAlertu = new zusnpi.dialog.AlertCustom({
                    dialogHeight : '200px',
                    content : obwDokumentyRobocze._getNotSentMessage("Podpisywanie dokumentu " + kodTypuDokumentu + " profilem zaufanym ePUAP zostało anulowane.", kodTypuDokumentu),
                    iconPath:"css/img/error.png"
                });
                dialogAlertu.onOkClick = function(){
                    dialogAlertu.hide();
                }
                dialogAlertu.show();
			}
			// Komunikat dla operacji potwierdzania zlecenia
			else if(kontekstWywolania == 'ZLECENIA')
			{
				alert("Podpisywanie dokumentu " + kodTypuDokumentu + " profilem zaufanym ePUAP zostało anulowane.");
			}
			
			dialogPotwierdzenia.hide();
		}
		dialogPotwierdzenia.onOkClick = function(){
			
			var contentVar = {
				'id.fullId' : fullId
			};
			var args = {
				url 	 : 'obw/obwPodpiszDokumentPoprzezEPUAP.npi',
				content  : contentVar,
				handleAs : "json",
				sync	 : true,
				load 	 : function(resp)
				{
					if(resp['blad']) {
						// Komunikat błędu dla operacji potwierdzania dokumentu roboczego
						if(kontekstWywolania == 'DOKROBC')
						{
							alert(obwDokumentyRobocze._getNotSentMessage("Błąd połączenia z systemem ePUAP.", kodTypuDokumentu));
						}
						// Komunikat błędu dla operacji potwierdzania zlecenia
						else if(kontekstWywolania == 'ZLECENIA')
						{
							alert('Błąd połączenia z systemem ePUAP.');
						} else {
							alert(resp['blad']);
						}
					} else {
						var url = resp['url'];
						if (url != null) {
							window.open(url,'Podpis_przez_EPUAP', 'width=1150,height=600,menubar=no,toolbar=no,location=no,scrollbars=yes,resizable=yes,status=no');
							obwUtils.log('obwListaZlecen.reload();');
						} else {
							alert('Błąd połączenia z systemem ePUAP.');
						}
					}
				},
				error : function(error, resp) {
					error(error);
				}
			}		
			dojo.xhrPost(args);
			
		}

		dialogPotwierdzenia.setArgs();
		dialogPotwierdzenia.show();

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
					komunikat = 'Dokument ' + kodTypuDokumentu + ' nie został wysłany. ' + komunikat;	
					obwZlecenia.onWynikAutoryzacjiZlecenia(wykonano, komunikat);
				}
				// Komunikat w przypadku prawidłowego podpisania dokumentu
				else {
					obwZlecenia.onWynikAutoryzacjiZlecenia(wykonano, komunikat);
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
				
				obwListaZlecen.reloadWithClearMultiselection();
				
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
	 * Callback wywoływany przy wyborze sposobu potwierdzenia poprzez podpis
	 * cyfrowy
	 */
	this._potwierdzPodpisCyfrowy = function(kontekstWywolania, typZlecenia, idObiektuZlecenia, kodTypuDokumentu){
		obwUtils.log('--- wywołano onPodpisCyfrowyFunction:');
		obwUtils.log(kontekstWywolania);
		obwUtils.log(typZlecenia);
		obwUtils.log(idObiektuZlecenia);
		obwUtils.log(kodTypuDokumentu);

		if(typZlecenia!=null && typZlecenia.indexOf('DOK_')>=0)
		{			
			obwUtils.log('potwierdzanie: '+ obwSigningComponent);

			var loadCallback = function(){
				obwSigningComponent.podpiszDokument(idObiektuZlecenia, kontekstWywolania, kodTypuDokumentu);
			}


			obwSigningComponent.wczytajApplet(loadCallback);


		} else {
			alert('Nieznany typ zlecenia.');
		}		
	}	
	
	/**
	 * Tymczasowa wersja dla wielu dokumentów
	 */
	this._potwierdzPodpisCyfrowy2 = function(){
		
		obwUtils.log('Wywołano onPodpisCyfrowyFunction2:');
		
		var verificationFlag = true;
		
		for(var i = 0; i < this.kodyZlecen.length; i++){
			if(this.kodyZlecen[i] == null || this.kodyZlecen[i].indexOf('DOK_') < 0){
				verificationFlag = false;
			}
		}
		if(verificationFlag){
			var ids = this.idDokumentow;
			var loadCallback = function(){
				var contentVar = {
					'zlecenia' : ids
				};

				obwUtils.log('Pobieranie zawartosci zlecen');
				dojo.hitch(this, obwUtils.invokeSimpleAction(contentVar, 'obw/zlecenia/pobierzZawartoscZlecen.npi', dojo.hitch(this, function(resp){
					

						arrTresciDokumentowMerytorycznych = resp['zawartoscZlecen'];
						arrZalaczniki = resp['zalaczniki'];

						if(arrTresciDokumentowMerytorycznych != null && arrZalaczniki != null){

							obwUtils.log('Ilosc dokumentów do podpisu : ' + resp['zawartoscZlecen'].length);
							obwUtils.log('Podpisywanie dokumentow');

							signDocuments(resp['zawartoscZlecen'], resp['zalaczniki'], '-1', dojo.hitch(this, function(resp){

								content = {
									'podpisaneDane' : resp,
									'zlecenia' : ids
								};

								obwUtils.showSendActionSplash();

								obwUtils.log('Zapisywanie podpisanych dokumentow');
								obwUtils.invokeSimpleAction(content, 'obw/zlecenia/obwZapiszPodpisaneZlecenia.npi', dojo.hitch(this, function(resp){
									obwUtils.hideSendActionSplash();

									var wykonano = 	resp["wykonano"];
									var komunikat = resp["komunikat"];

									//obwUtils.log('this.jsGridId.reloadWithClearMultiselection();')
									this.jsGridId.reloadWithClearMultiselection();

									if(wykonano)
									{
										if(komunikat!=null) alert(komunikat);
									} else {

										komunikat = "Wynik potwierdzania operacji wysyłania dokumentów: \n - liczba wysłanych dokumentów: " + resp["validOperationCount"]
											+ ", \n - liczba niepodpisanych dokumentów: " + resp["notSignedCount"]
											+ ", \n - liczba błędnie zweryfikowanych dokumentów: " + resp["signatureErrorCount"];
										if(resp["naleznosciCount"]!=null && resp["naleznosciCount"]>0)
											komunikat+= ", \n - liczba utworzonych należności: " + resp["naleznosciCount"] + ".";

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
								}));

							}));
						}else{
							alert('Wystąpił błąd przy pobieraniu zawartości dokumentów');
						}
				})));
			}

			obwSigningComponent.wczytajApplet(loadCallback);



			
		
		}else{
			alert('Wśród zleceń wystąpił nieznany typ.');
		}
	}
	
	/**
	 * Odrzucenie zlecenia bezpośrenio z listy zleceń
	 */
	this.odrzucOperacje = function()
	{
		
//		if(fullId!=null)
//		{
//			obwUtils.invokeGridAction(fullId, "Odrzuć zlecenie", "Na pewno chcesz odrzucić zlecenie?", 'obw/zlecenia/odrzucZlecenie.npi', obwListaZlecen, true, null, null);		
//		}
//		else
//		{
//			alert('Nie wybrano zlecenia do odrzucenia');
//		}
		
		obwUtils.invokeSingleMultiGridAction(null,  "Odrzuć zlecenie", 'Chcesz odrzucić wybrane zlecenie? ',
				'Chcesz odrzucić wybrane zlecenie? ',
				'Chcesz odrzucić wybrane zlecenia? Liczba wybranych zleceń: ',
				'obw/zlecenia/odrzucZlecenie.npi', getGridObject());
	
	};

	
	/**
	 * Potwierdzenie zlecenia poprzez profil ePuap bezpośrednio z listy
	 */
	this.potwierdzEpuap = function(rowIndex)
	{
		var fullId = obwListaZlecen.getSelectedRecord()["id.fullId"];
		obwUtils.invokeAction(fullId,'obw/zlecenia/obwDaneZlecenia.npi',function(resp)
		{
			if(resp["blad"])
			{
				alert(resp["komunikat"]);
				obwListaZlecen.reloadWithClearMultiselection();
				//obwUtils.log('potwierdzEpuap1: obwListaZlecen.reloadWithClearMultiselection();');
			}
			else
			{
				this.typZlecenia = resp["kodUslugi"];
	    		this.idObiektuZlecenia  = resp["przedmiotZleceniaWskazanie"]["id"]["fullId"];
	    		this.kodTypuDokumentu = '"' + resp["typDokumentu"] + '"';
	    		
	    		//-------- #13567 - BEGIN
	    		var callback = function(){
	    			obwZlecenia.potwierdzDokumentPrzezEpuap(resp["przedmiotZleceniaWskazanie"]["id"]["fullId"], 'ZLECENIA', kodTypuDokumentu);	
	    		};
	    		checkEPUAPInfoAndShowMessageAsync("mainContentPaneListaZlecen", callback, callback);
	    		//-------- #13567 - END
	    		
	    		//obwUtils.log('obwListaZlecen.reload();');
	    		//obwUtils.log('potwierdzEpuap2: obwListaZlecen.reloadWithClearMultiselection();');
			}
		});		
	};
	
	
	/**
	 * Potwierdzenie zlecenia poprzez podpis cyfrowy bezpośrednio z listy
	 */
	this.potwierdzPodpisem = function(rowIndex)
	{
		var fullId = obwListaZlecen.getSelectedRecord()["id.fullId"];
		obwUtils.invokeAction(fullId,'obw/zlecenia/obwDaneZlecenia.npi',function(resp)
		{
			if(resp["blad"])
			{
				alert(resp["komunikat"]);
				obwListaZlecen.reloadWithClearMultiselection();
			}
			else
			{
				this.typZlecenia = resp["kodUslugi"];
	    		this.idObiektuZlecenia  = resp["przedmiotZleceniaWskazanie"]["id"]["fullId"];
	    		
	    		obwZlecenia._potwierdzPodpisCyfrowy('ZLECENIA', typZlecenia, idObiektuZlecenia);
	    		obwUtils.log('obwListaZlecen.reload();');
			}
		});		
	};
	
	/**
	 * Potwierdzenie zlecenia poprzez profil pue
	 */
	this.potwierdzProfilemPue = function(rowIndex){
		var fullId = obwListaZlecen.getSelectedRecord()["id.fullId"];
		obwUtils.invokeAction(fullId,'obw/zlecenia/obwDaneZlecenia.npi',function(resp){
			if(resp["blad"]){
				alert(resp["komunikat"]);
				obwListaZlecen.reloadWithClearMultiselection();
			}else{
				this.typZlecenia = resp["kodUslugi"];
	    		this.idObiektuZlecenia  = resp["przedmiotZleceniaWskazanie"]["id"]["fullId"];
	    		obwZlecenia._potwierdzProfilPue('ZLECENIA', typZlecenia, idObiektuZlecenia);
	    		obwUtils.log('obwListaZlecen.reload();');
			}
		});		
	};
	
	/**
	 * Akcja wywoywana na liscie zleceń po zakończeniu autoryzacji zlenia
	 */	
	this.onWynikAutoryzacjiZlecenia = function(wykonano, komunikat)	
	{	
		
		obwUtils.log('onWynikAutoryzacjiZlecenia');
		
		obwUtils.log('type: ' + typeof obwListaZlecen );
		obwUtils.log('element: ' + obwListaZlecen );
		obwUtils.log('komunikat: ' + komunikat);
		if (typeof obwListaZlecen != 'undefined' && obwListaZlecen != null)
		{
			obwListaZlecen.reloadWithClearMultiselection();		
			obwUtils.log('onWynikAutoryzacjiZlecenia: obwListaZlecen.reloadWithClearMultiselection();');
		}

		if(komunikat != null)
		{
			alert(komunikat);
		}
	};
	
	/**
	 * Funkcja wywoływana przy akcji onLoad panelu dokument zlecenia. Odpowiada
	 * za utworzenie listy załączników.
	 */
	this.obwLdrDokumentZleconyFormPanelOnLoad = function(idArg, data, mode)
	{
		// Utworzenie listy załączników
		dijit.byId('obwDokumentyZalacznikiId').attr('content', '');
		daneZalacznikow =data["metadokumentDanePelne"]["zalacznikDanePodstawowe"];
		obwZalaczniki.utworzListeZalacznikow(daneZalacznikow, "obwDokumentyZalacznikiId", false);	

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
	 * Funkcja zwracająca ID grida
	 */
	var getGridObject = function()
	{
		return obwListaZlecen;
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
				var kodTypuDokumentu = '';
					
				if(resp['kodTypuDokumentu'] != '')
					kodTypuDokumentu = ' "' + resp['kodTypuDokumentu'] + '"';
				
				var komunikat = 'Podpisywanie dokumentu' + kodTypuDokumentu + ' profilem zaufanym ePUAP zostało anulowane. Dokument nie został wysłany.';
				
				if(resp['czyWielopodpis'] == true)
					komunikat = 'Podpisywanie dokumentów profilem zaufanym ePUAP zostało anulowane. Dokumenty nie został wysłane.';
				
				alert(komunikat);
			}
		};
		dojo.xhrPost(args);
	};
	
	/**
	 * Zwraca informację o liczbie niepotwierdzonych zleceń dla panelu obszaru zleceń
	 */
	this.pobierzDaneObszaruZlecen = function () {
		var args = {
			url : 'obw/obszar/pobierzInformacje.npi',
			handleAs : "json",
			load : function(resp)
			{
				var liczbaZlecenNiepotwierdzonych = resp["zle"];
				var komponentZlecen = dojo.byId('niepotwierdzoneZlecenia');
				
				if(komponentZlecen){
					komponentZlecen.innerHTML = liczbaZlecenNiepotwierdzonych > 0 ? 'Liczba niepotwierdzonych zleceń: ' + liczbaZlecenNiepotwierdzonych : 'Brak niepotwierdzonych zleceń';
				}
			}
		};
		
		dojo.xhrPost(args);
	};
}


var obwZlecenia = new ObwZlecenia();
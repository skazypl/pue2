function ObwPoswiadczenia()
{
	/**
	 * Zwraca strukturę listy niepodpisanych poświadczeń
	 */
	this.getStructure = function()
	{
		var actionStructure = getStructureFromAction('obw/poswiadczenia/getStructure.npi');
		return {
			cells : [ {
				field : actionStructure.ID.field,
				hidden : true
			}, {
				field : actionStructure.ZRODLO.field,
				name : actionStructure.ZRODLO.name,
				datatype : 'string',
				width : 'auto',
				filterable : false,
				sortable : false,
				formatter : function(val)
				{
					return 'Zakład Ubezpieczeń Społecznych';
				}
			}, {
				field : actionStructure.MOMENT_NADANIA.field,
				name : actionStructure.MOMENT_NADANIA.name,
				datatype : 'date',
				width : '120px',
				formatter : function(val)
				{
					return gridDateTimeFormatter(val);
				}
			}, {
				name : 'Menu',
				width : '250px',
				filterable : false,
				sortable : false,
				formatter : function(value, rowIndex)
				{
					return obwPoswiadczenia.getMenuItems(rowIndex);
				}
			},
			getCheckboxColumnExt({
				title:"Wybór",
				width:"45px",
				gridId:"obwLdpPoswiadczeniaGrid",
				showHeaderCheckbox:true
			})]
		};
	};


	this.potwierdzWielePrzezEpuap = function(){
		var selectedCount = obwLdpPoswiadczeniaGrid.getMultiSelectionSelectedRecordsCount();

		//jeśli multiseleksja pusta, sprawdzy czy zaznaczono jeden rekord, jesli tak to pojedyncze podpisanie
		if (selectedCount<1 && obwLdpPoswiadczeniaGrid.getSelectedRecordsCount() > 0){
			obwUtils.log('Multiselekcja pusta, podpisanie pojedynczego przez EPUAP');
			obwPoswiadczenia.potwierdzPrzezEpuapId(obwUtils.getFullIdForSelectedRecord(obwLdpPoswiadczeniaGrid));
			return;
		}

		if(selectedCount<1){
			var dialogAlertu = new zusnpi.dialog.Alert({
				dialogHeight : '50x',
				dialogWidth  : '450px',
				content : 'Nie zaznaczono żadnych dokumentów do podpisu!'
			});
			dialogAlertu.onOkClick = function(){
				dialogAlertu.hide();
			}
			dialogAlertu.setArgs();
			dialogAlertu.show();
			return;
		}

		confirm({
			title : 'Podpisz przez EPUAP',
			content : (selectedCount > 1 ? 'Chcesz podpisać wybrane dokumenty profilem zaufanym EPUAP?Liczba wybranych dokumentów:' + ' '
					+ selectedCount + '.' : 'Chcesz podpisać wybrane dokumenty profilem zaufanym EPUAP?'),
			onOkClick : function() {
					dojo.xhrPost({
						content: {
							selectedRows: obwLdpPoswiadczeniaGrid.getMultiSelectionSelectedIds()
						},
						handleAs: "json",
						load: function(resp){
							if(resp['blad']){
								var dialogAlertu = new zusnpi.dialog.Alert({
									dialogHeight : '150px',
									dialogWidth  : '650px',
									content : 'Poświadczenie nie może zostać podpisane. Powód: \r\n'
											+ 'Brak połączenia do ePUAP.'
								});
								dialogAlertu.onOkClick = function(){
									dialogAlertu.hide();
								}
								dialogAlertu.setArgs();
								dialogAlertu.show();
							} else {
								var url = resp['url'];
								if (url != null) {
									window.open(url,'Podpis_UPD_przez_EPUAP', 'width=1150,height=600,menubar=no,toolbar=no,location=no,scrollbars=yes,resizable=yes,status=no');
								} else {
									alert('Nie podano adresu');
								}
							}
						},
						url: 'obw/obwPodpiszWieleUPDPoprzezEPUAP.npi'
					});
			}
		});
	};

	/**
	 * Zwraca pozycje menu dla listy poświadczeń
	 */
	this.getMenuItems = function(rowIndex)
	{
		var link = "";
		//-------- #13567 - BEGIN
		link += obwUtils.getMenuLink('Potwierdź profilem zaufanym ePUAP', 'obwPoswiadczenia.potwierdzPrzezEpuapWithCheck(' + rowIndex + ')')+'<br/>';
		//-------- #13567 - END
		link += obwUtils.getMenuLink('Potwierdź podpisem kwalifikowanym', 'obwPoswiadczenia.podpiszUPD(' + rowIndex + ')');
		return link;
	};

	//-------- #13567 - BEGIN
	this.potwierdzPrzezEpuapWithCheck = function(rowIndex)
	{
		var callback = function(){
			obwPoswiadczenia.potwierdzPrzezEpuap(rowIndex);
		};
		checkEPUAPInfoAndShowMessageAsync("mainContentPaneListaDokumentowPrzychodzacych", callback, callback);
	};
	//-------- #13567 - END

	/**
	 * Wywołuje akcję potwierdzenia poświadczenia doręczenia przez ePUAP
	 */
	this.potwierdzPrzezEpuap = function(rowIndex)
	{
		var fullId = null;

		if (rowIndex != null) {
			fullId = obwUtils.getFullIdForRowIndex(obwLdpPoswiadczeniaGrid, rowIndex);
		} else {
			fullId = obwUtils.getFullIdForSelectedRecord(obwLdpPoswiadczeniaGrid);
		}
		obwPoswiadczenia.potwierdzPrzezEpuapId(fullId);

	};

	this.potwierdzPrzezEpuapId = function(fullId){
		var dialogPotwierdzenia = new zusnpi.dialog.Confirm({
			dialogHeight : '150px',
			dialogWidth  : '460px',
			content : 'Za chwilę nastąpi przekierowanie na platformę ePUAP w celu podpisania wybranego dokumentu swoim profilem zaufanym. Kontynuować?'
		});
		dialogPotwierdzenia.onCancelClick = function(){
			dialogPotwierdzenia.hide();
		}
		dialogPotwierdzenia.onOkClick = function(){
			var contentVar = {
				'id.fullId' : fullId
			};
			var args = {
				url 	 : 'obw/obwPodpiszUPDPoprzezEPUAP.npi',
				content  : contentVar,
				handleAs : "json",
				sync	 : true,
				load 	 : function(resp)
				{
					if(resp['blad']) {
						var dialogAlertu = new zusnpi.dialog.Alert({
							dialogHeight : '150px',
							dialogWidth  : '650px',
							content : 'Poświadczenie nie może zostać podpisane. Powód: \r\n'
									+ 'Brak połączenia do ePUAP.'
						});
						dialogAlertu.onOkClick = function(){
							dialogAlertu.hide();
						}
						dialogAlertu.setArgs();
						dialogAlertu.show();
					} else {
						var url = resp['url'];
						if (url != null) {
							window.open(url,'Podpis_UPD_przez_EPUAP', 'width=1150,height=600,menubar=no,toolbar=no,location=no,scrollbars=yes,resizable=yes,status=no');
						} else {
							alert('Nie podano adresu');
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
	this.weryfikujUPDPodpisanePrzezEPUAP = function()
	{
		var args = {
			url 	 : 'obw/obwWeryfikujUPDPodpisanePrzezEPUAP.npi',
			handleAs : "json",
			sync 	 : true,
			load 	 : function(resp)
			{
				obwLdpPoswiadczeniaGrid.reloadWithClearMultiselection();
				obwLdpDokumentyPrzychodzaceGrid.reload();
				var iloscPoprawnieZweryfikowanych = resp['poprawniePodpisane'];
				var iloscNiepoprawnieZweryfikowanych = resp['niepoprawniePodpisane'];
				if(iloscNiepoprawnieZweryfikowanych!=null){
					var dialogBledu = new zusnpi.dialog.Alert({
						dialogHeight : '150px',
						dialogWidth  : '650px',
						content : iloscNiepoprawnieZweryfikowanych>0?'Wynik podpisywania dokumentów:\nPoprawnie podpisanych UPD: '+iloscPoprawnieZweryfikowanych+' \n Niepoprawnie podpisanych UPD : '+iloscNiepoprawnieZweryfikowanych+'\nDla poprawnie podpisanych poświadczeń dokumenty są dostępne na liście dokumentów odebranych. ':'Poprawnie podpisanych UPD: '+iloscPoprawnieZweryfikowanych+'\nDla poprawnie podpisanych poświadczeń dokumenty są dostępne na liście dokumentów odebranych.'
								//'Poświadczenie nie zostało podpisane. Powód: \r\n'
							    //+ 'Błąd przesyłu dokumentu do ePUAP.'
					});
					dialogBledu.onOkClick = function(){
						dialogBledu.hide();
					}
					dialogBledu.setArgs();
					dialogBledu.show();
					return;
				}
				// Komunikat w przypadku wystąpienia błędu
				var zweryfikowany = resp['zweryfikowany'];
				var blad = resp['blad'];
				if (!zweryfikowany)
				{
					var dialogBledu = new zusnpi.dialog.Alert({
						dialogHeight : '150px',
						dialogWidth  : '650px',
						content : blad
								//'Poświadczenie nie zostało podpisane. Powód: \r\n'
							    //+ 'Błąd przesyłu dokumentu do ePUAP.'
					});
					dialogBledu.onOkClick = function(){
						dialogBledu.hide();
					}
					dialogBledu.setArgs();
					dialogBledu.show();
				}
				// Prezentacja podpisanego dokumentu
				var fullId = resp["fullId"];
				if(fullId != null)
				{
					obwPoswiadczenia.podajDokumentPoPodpisaniuUPD(fullId);
				}
			},
			error 	 : function(error, resp) {
				error(error);
			}
		};
		dojo.xhrPost(args);
	};

	this.podpiszMultiUPD = function(){
		var args = {
			url 	 : 'obw/poswiadczenia/validateUPD.npi',
			handleAs : "json",
			load 	 : function(resp)
			{
				var selectedCount = obwLdpPoswiadczeniaGrid.getMultiSelectionSelectedRecordsCount();

				//jeśli multiseleksja pusta, sprawdzy czy zaznaczono jeden rekord, jesli tak to pojedyncze podpisanie
				if (selectedCount<1 && obwLdpPoswiadczeniaGrid.getSelectedRecordsCount() > 0){
					obwUtils.log('Multiselekcja pusta, podpisanie pojedynczego');
					obwPoswiadczenia.podpiszUPDId(obwUtils.getFullIdForSelectedRecord(obwLdpPoswiadczeniaGrid));
					return;
				}

				if(selectedCount<1){

					var dialogAlertu = new zusnpi.dialog.Alert({
						dialogHeight : '50x',
						dialogWidth  : '450px',
						content : 'Nie zaznaczono żadnych dokumentów do podpisu!'
					});
					dialogAlertu.onOkClick = function(){
						dialogAlertu.hide();
					}
					dialogAlertu.setArgs();
					dialogAlertu.show();
					return;
				}

				obwUtils.log('Wywołano podpiszMultiUPD:');

				var loadCallback = function(){
					var listaIdPoswiadczen = obwUtils.getFullIdsForGridSelection(obwLdpPoswiadczeniaGrid);
					var contentVar = {
						'poswiadczeniaIdList' : listaIdPoswiadczen
					};
					obwUtils.log('Pobieranie zawartosci poswiadczen');
					dojo.hitch(this, obwUtils.invokeSimpleAction(contentVar, 'obw/poswiadczenia/pobierzPoswiadczeniaDoPodpisu.npi', dojo.hitch(this, function(resp){
							arrTresciDokumentowMerytorycznych = resp['listaPoswiadczen'];
							if(arrTresciDokumentowMerytorycznych != null){
								obwUtils.log('Ilosc dokumentów do podpisu : ' + resp['listaPoswiadczen'].length);
								obwUtils.log('Podpisywanie dokumentow');
								var attachementEmptyArray = [];
								signDocuments(resp['listaPoswiadczen'], attachementEmptyArray, '-1', dojo.hitch(this, function(resp){
									obwUtils.hideSendActionSplash();
									content = {
										'podpisaneDane' : resp,
										'poswiadczeniaIdList' : listaIdPoswiadczen
									};
									var progressDialog = new zusnpi.dialog.ProgressDialog({
										title : 'Weryfikacja podpisanych dokumentów...',
										progressActionURL : "obw/poswiadczenia/getStatusWeryfikacji.npi"
									});
									progressDialog.init();
									obwUtils.log('Zapisywanie podpisanych dokumentow');
									obwUtils.invokeSimpleAction(content, 'obw/poswiadczenia/obwWeryfikujPoswiadczenia.npi', dojo.hitch(this, function(resp){
										progressDialog.close();
										progressDialog.destroy();
										obwUtils.log('Komunikat '+resp['wykonano']);
										var wykonano = 	resp["wykonano"];
										//var komunikat = resp["komunikat"];
										//obwUtils.log('this.jsGridId.reloadWithClearMultiselection();')
										obwLdpPoswiadczeniaGrid.reloadWithClearMultiselection();
										obwLdpDokumentyPrzychodzaceGrid.reload();
										if(wykonano)
										{
											if(komunikat!=null) alert(komunikat);
										} else {
											komunikat = "Wynik podpisywania dokumentów: \n - liczba podpisanych dokumentów: " + resp["validOperationCount"]
												+ ", \n - liczba niepodpisanych dokumentów: " + resp["notSignedCount"]
												+ ", \n - liczba błędnie zweryfikowanych dokumentów: " + resp["signatureErrorCount"];
											komunikat = komunikat + "\nDla poprawnie podpisanych poświadczeń dokumenty są dostępne na liście dokumentów odebranych."
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
			}
		};
		dojo.xhrPost(args);
	};

	/**
	 * Wywołuje akcję podpisu poświadczenia doręczenia
	 */
	this.podpiszUPD = function(rowIndex)
	{
		var fullId = null;

		if (rowIndex != null){
			fullId = obwUtils.getFullIdForRowIndex(obwLdpPoswiadczeniaGrid, rowIndex);
		}
		else{
			fullId = obwUtils.getFullIdForSelectedRecord(obwLdpPoswiadczeniaGrid);
		}
		obwPoswiadczenia.podpiszUPDId(fullId);
	};

	this.podpiszUPDId = function(fullId){

		var args = {
				url 	 : 'obw/poswiadczenia/validateUPD.npi',
				handleAs : "json",
				load 	 : function(resp)
				{

					var loadCallback = function(){
						obwSigningComponent.podpiszUPD(fullId);
					}

					obwSigningComponent.wczytajApplet(loadCallback);
				}
		};
		dojo.xhrPost(args);
	};

	/**
	 * Wyszukuje dokument po podpisaniu UPD i prezentuje go użytkownikowi
	 */
	this.podajDokumentPoPodpisaniuUPD = function(fullId)
	{
		obwLdpPoswiadczeniaGrid.reload();
		obwLdpDokumentyPrzychodzaceGrid.setSortIndex(5, false);
		obwLdpDokumentyPrzychodzaceGrid.set('userDefinedPostLoad', function()
		{
			obwLdpDokumentyPrzychodzaceGrid.set('userDefinedPostLoad', null);
			if (obwUtils.findRecordById(obwLdpDokumentyPrzychodzaceGrid, fullId))
			{
				obwListaDokumentowPrzychodzacychCrudButtonPanel._onRClick();
			}
			//else
				//alert('Brak poświadczonego dokumentu - odśwież listę i wyszukaj w dokumentach odebranych.');
		});
		wizualizacjaId = fullId;
		wizualizacjaURL = 'obw/dokumentMerytoryczny/pobierzWizualizacje.npi';
		obwPodgladDokumentuOdpowiedziDialog.show();
	};

	this.initialSort = true;

	this.postLoad = function(){
//		if(obwPoswiadczenia.initialSort){
//			obwPoswiadczenia.initialSort = false;
//			getGridObject().setSortIndex(3, false)
//		}
		if (obwLdpPoswiadczeniaGrid.store._items.length < 1 && obwLdpPoswiadczeniaGrid.getFilter().length < 1){
			titlePaneListaDokumentowWymagajacychPoswiadczenia.doClose();
		}
	};

	var getGridObject = function()
	{
		return obwLdpPoswiadczeniaGrid;
	};

	/**
	 * Wywołuje akcję eksportu poświadczenia UPP lub UPD w zależności od kontekstu wywołania (dialog danych upp lub upd)
	 */
	this.exportPoswiadczenia = function(fullId, url)
	{
		obwUtils.log('exportPoswiadczenia: fullId='+fullId+' url='+url);
		if (fullId == null)
		{
			console.log('Nie ustawiono id!');
			return;
		}
		var params = {
			'id.fullId' : fullId
		};
		exportForm(url, '', params);
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
				var komunikat = 'Podpisywanie poświadczenia doręczenia profilem zaufanym ePuap zostało anulowane.';
				var dialogBledu = new zusnpi.dialog.Alert({
					dialogHeight : '150px',
					dialogWidth  : '650px',
					content : komunikat
				});
				dialogBledu.onOkClick = function(){
					dialogBledu.hide();
				}
				dialogBledu.setArgs();
				dialogBledu.show();
			}
		};
		dojo.xhrPost(args);
	};
}

var obwPoswiadczenia = new ObwPoswiadczenia();

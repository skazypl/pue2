dojo.require("obw.widget.obwBaseWidget");
dojo.require("obw.widget.sprawy.dialog.obwSubskrypcjaDialog");

function ObwSprawy()
{

	this.sprawaCustomFilterId=null;
	this.zaznaczSprawe = false;
	
	sprawaFullId = null,

	/**
	 * Zwraca strukturę listy spraw
	 */	
	this.getStructure = function()
	{
		var actionStructure = getStructureFromAction("obw/sprawy/getStructure.npi");
		return {
			cells : [ {
				field : actionStructure.ID.field,
				hidden : true
			}, {
				field : actionStructure.ID_SPRAWY.field,
				hidden : true
			},{
				field : actionStructure.SYGNATURA.field,
				name : actionStructure.SYGNATURA.name,
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
				datatype : 'date',
				width : '120px',
				formatter : function(val)
				{
					return gridDateTimeFormatter(val);
				}
			}, /*{
				field : actionStructure.TYP_SPRAWY.field,
				name : actionStructure.TYP_SPRAWY.name,
				datatype : 'string',
				width : '70px',
				hidden : true
			},*/ {
				field : actionStructure.STATUS_SPRAWY.field,
				name : actionStructure.STATUS_SPRAWY.name,
				datatype : 'string',
				width : '80px'
			}, {
				name : 'Menu',
				width : '90px',
				filterable : false,
				sortable : false,
				formatter : function(value, rowIndex)
				{
					return obwSprawy.getMenuPozycjeSprawy(rowIndex);
				}
			} ]
		};
	};

	/**
	 * Zwraca strukturę listy dokumentów sprawy
	 */
	this.getStructureDokumentySprawy = function()
	{
		var actionStructure = getStructureFromAction('obw/dokumentySprawy/getStructure.npi');

		return {
			cells : [ {
				field : actionStructure.ID.field,
				hidden : true
			}, {
				field : actionStructure.NAZWA_TYPU.field,
				name : actionStructure.NAZWA_TYPU.name,
				datatype : 'string',
				width : 'auto',
				formatter : function(value, rowIndex)
				{
					return getCellCustomGreyFormater(value, rowIndex);
				}
			},{
				field : actionStructure.STATUS.field,
				name : actionStructure.STATUS.name,
				datatype : 'string',
				width : '80px',
				formatter : function(value, rowIndex)
				{
					return getCellCustomGreyFormater(getStatusFomatter(value), rowIndex);
				}
			},{
				field : actionStructure.MOMENT_WYSLANIA.field,
				name : actionStructure.MOMENT_WYSLANIA.name,
				datatype : 'date',
				width : '180px',
				formatter : function(value, rowIndex)
				{
					return getCellCustomGreyFormater(gridDateTimeFormatter(value), rowIndex);
				}
			},{
				field : actionStructure.ARCHIWALNY.field,
				hidden: true
			},{
				field : actionStructure.KOD_STATUSU.field,
				name : actionStructure.KOD_STATUSU.name,
				hidden : true
			},	getCheckboxColumnExt({	
				title:"Wybór",
				width:"45px",
				gridId:"obwListaDokumentowSprawyGrid",
				showHeaderCheckbox:true
			}) ]
		};
	};

	/**
	 * Zwraca pozycje menu dla listy spraw
	 */
	this.getMenuPozycjeSprawy = function(rowIndex)
	{
		var links = obwUtils.getMenuLink('Szczegóły', 'obwSprawy.menuListaDokumentowSprawy()') + '<br/>'
				  + obwUtils.getMenuLink('Subskrybuj', 'obwSprawy.subskrypcja()');
		return links;
	};

	this.utworzDokumentZSprawy = function(){
		var selected = listaSprawGrid.getSelectedRecord();
		var sygnatura_sprawy = selected["sygnatura"];
		obwFormularze.ustawSygnatureSprawy(sygnatura_sprawy);
		dojo.hash('OBW0031');
		
	};
	
	/**Zawężanie listy dla przekierowania z wyszukiwania */
	this.searchSingle = function()
	{
		return {
			Id:{
				value:obwListaSprawZawezoneId.value,
				datatype:"number"
			}
		};
	}
	
	this.pokazWszystkie = function()
	{
		obwListaSprawZawezoneId.value=null;
//		dojo.style( dojo.byId('czyArchwialneContentPane'), {display:'block'});
		dojo.style( dojo.byId('czyZawezoneContentPane'), {display:'none'});
		//listaSprawGrid.customFilterControlId=null;//FIXME sprawdzic czy null moze byc
		listaSprawGrid.reload();
		obwListaSprawGridContainerId.resize();
	}
	
	/**
	 * Akcja klawisza subskrybuj. Funkcja wywołyje dialog wyboru typu subskrypcji.
	 */
	this.subskrypcja = function()
	{
		var selected = listaSprawGrid.getSelectedRecord();
		if (selected){
			var wybranaSprawa = selected["id.fullId"];
			dojo.xhrPost({
				url : "obw/sprawy/pobierzSubskrypcja/load.npi",
				content : {
					"idSprawy" : wybranaSprawa
				},
				handleAs : "json",
				load : function(resp) {
					if (resp){
						//pobrac subskrypcje, ustawic dialog i go pokazac
						var sms = resp.czestoscSms;
						var email = resp.czestoscMail;
						subskrypcjaMailSelectId.setValue(email);
						subskrypcjaSmsSelectId.setValue(sms);
						obwSubskrypcjeDialogId.idSprawy = wybranaSprawa;
						obwSubskrypcjeDialogId.subskrypcja = resp;
						obwSubskrypcjeDialogId.show();
					}
					else{
						//mamy puste dane pelne wiec trzeba stworzyc nowe sztuczne dane na ewentualnosc zapisu
						subskrypcjaMailSelectId.setValue('N');
						subskrypcjaSmsSelectId.setValue('N');
						obwSubskrypcjeDialogId.subskrypcja = null;
						obwSubskrypcjeDialogId.idSprawy = wybranaSprawa;
						obwSubskrypcjeDialogId.show();
					}

				},
				error : function(error, resp) {
					error(error);
				}
			});
		}
		else
		{
			alert("Nie wybrano sprawy!");
		}
	};

	/**
	 * Akcja grida wykonywana przed jego wczytaniem
	 */
//	this.preLoad = function(){
//		listaSprawGrid.setSortIndex(4, false);
//	};
	//FIXME sprawdzic, czy ta funkcja byla gdzies uzywana!!


	/**
	 * Akcja klawisza eksportuj
	 */
	this.onClickEksportuj = function()
	{
		obwSprawy.invokeEksportuj(null);
	};

	/**
	 * Funkcja odpowiedzialna za eksport danej sprawy
	 */
	this.invokeEksportuj = function(fullId)
	{
		obwUtils.invokeSingleMultiGridAction(fullId, 'Eksportuj', 'Chcesz wyeksportować wybrany dokument?',
				'Chcesz wyeksportować wybrany dokument?', 'Chcesz  wyeksportować wybrane dokumenty? Liczba wybranych dokumentów:',
				'obw/dokumentySprawy/eksportuj.npi', getGridObject(), true);
	};

	/**
	 * Funkcja zwracająca ID grida
	 */
	var getGridObject = function()
	{
		return obwListaDokumentowSprawyGrid;
	};

	var getStatusFomatter = function(value)
	{
		if(value == 'Odebrany'){
			return 'Odebrany';
		} else if(value == 'Wysłany/dostarczony'){
			return 'Wysłany';
		}
		return '';
	};
	
	this.searchDokumenty = function(){
		obwUtils.log("Custom filtr ",listaSprawGrid.getSelectedRecord());
		if(listaSprawGrid.getSelectedRecord()==null)
		{
			if(obwListaSprawZawezoneId.value!=null && obwListaSprawZawezoneId.value!="")
			{
				return {
					SprawaId:{
						value:obwListaSprawZawezoneId.value,
						datatype:"number"
					}
				};
			}
			return;
		}
		return {
			SprawaId:{
				value:listaSprawGrid.getSelectedRecord()["id.idOb"],
				datatype:"number"
			}
		};
	};
	/**
	 * Funkcja odpowiedzialna za obsługę menu listy spraw
	 */
	this.menuListaDokumentowSprawy = function()
	{
		var wybranaSprawa = listaSprawGrid.getSelectedRecord()["id.idOb"];
		obwUtils.log("Wybrana sprawa "+wybranaSprawa);
		if (wybranaSprawa != null)
		{
			sprawyWizard.selectChild(listaDokumentowSprawyContentPane);
			
			var longSplash = new zusnpi.layout.splash.LongActionSplashscreen({
			parentId: 'obwListaDokumentowSprawyMainBorder', //działa tak samo jak parentId w zusnpi.layout.splash.Splashscreen
			actionUrl: 'obw/sprawy/obwDaneSprawy.npi', //adres akcji która ma zostać wykonana
			getContentArgs: function() { return { 'id.fullId' : listaSprawGrid.getSelectedRecord()["id.fullId"]};}, //parametr nieobowiązkowy, funkcja zwracająca argumenty dla wołanej akcji
			onSuccessCallback: function(data)
			{
				formDaneSprawy.attr("value", data);
				obwListaDokumentowSprawyGrid.reload();
				longSplash.destroy();
			},
			onFailureCallback: function(error)
			{
				longSplash.destroy();
			}
			});
			longSplash.fireAction();
			
			// Pobranie dokumentów dla konkretnej sprawy
			//obwListaDokumentowSprawyGrid.set('storeURL', 'obw/dokumentySprawy/filter.npi?idsp=' + wybranaSprawa);
			//obwListaDokumentowSprawyGrid.init();
		}
		else
		{
			alert("Nie wybrano sprawy!");
		}
	};

	/**
	 * Funkcja odpowiedzialna za obsługę klawisza powrót do listy spraw
	 */
	this.powrotDoListySpraw = function()
	{
		sprawyWizard.selectChild(listaSprawContentPane);
	};

	/**
	 * Funkcja odpowiedzialna za obsługę klawisza szczegóły dla listy dokumentów sprawy
	 */
	this.menuSzczegolyDokumentuSprawy = function()
	{
		var wybranyDokument = obwListaDokumentowSprawyGrid.getSelectedRecord()["id.fullId"];
		if (wybranyDokument != null)
		{
			var typDokumentu = obwListaDokumentowSprawyGrid.getSelectedRecord()["kodStatusuMetadanych"];
			// FIXME: Wyrzucić poniższą linijkę oraz zmienną statDokumentu z ifów,
			// gdyż służy to jedynie do testowania fake'a i szyny jednocześnie
			var statDokumentu = obwListaDokumentowSprawyGrid.getSelectedRecord()["statusMetadanych"];
			// Wyświetlenie odpowiednich właściwości dokumentu oraz aktywacja klawisza poświadczeń
			if (typDokumentu == "ODBR" || statDokumentu == "ODBR")
			{
				sprawyWizard.selectChild(dokumentOdebranyContentPane);

				var longSplash = new zusnpi.layout.splash.LongActionSplashscreen({
					parentId: 'obwDokumentSprawyOdebrany', //działa tak samo jak parentId w zusnpi.layout.splash.Splashscreen
					actionUrl: 'obw/dokumentyPrzychodzace/load.npi', //adres akcji która ma zostać wykonana
					getContentArgs: function() { return { 'id.fullId' : obwListaDokumentowSprawyGrid.getSelectedRecord()["id.fullId"]};}, //parametr nieobowiązkowy, funkcja zwracająca argumenty dla wołanej akcji
					onSuccessCallback: function(data)
					{
						formDaneDokumentuOdebranegoSprawy.attr("value", data);
						obwSprawy.aktywujKlawiszPoswiadczenia(data);
						obwSprawy.pobierzZalaczniki(data);
						longSplash.destroy();
					},
					onFailureCallback: function(error)
					{
						longSplash.destroy();
					}
					});
					longSplash.fireAction();
			}
			if (typDokumentu == "WYSL" || typDokumentu == "WODRZ" || typDokumentu == "WUAD" || statDokumentu == "WYSL" || statDokumentu == "WODRZ" || statDokumentu == "WUAD")
			{
				sprawyWizard.selectChild(dokumentWyslanyContentPane);

				var longSplash = new zusnpi.layout.splash.LongActionSplashscreen({
					parentId: 'obwDokumentSprawyWyslany', //działa tak samo jak parentId w zusnpi.layout.splash.Splashscreen
					actionUrl: 'obw/dokumentyWyslane/obwDokumentWyslanyGetContent.npi', //adres akcji która ma zostać wykonana
					getContentArgs: function() { return { 'id.fullId' : obwListaDokumentowSprawyGrid.getSelectedRecord()["id.fullId"]};}, //parametr nieobowiązkowy, funkcja zwracająca argumenty dla wołanej akcji
					onSuccessCallback: function(data)
					{
						formDaneDokumentuWyslanegoSprawy.attr("value", data);
						obwSprawy.aktywujKlawiszPoswiadczenia(data);
						obwSprawy.pobierzZalacznikiDokumentuWyslanego(data);
						longSplash.destroy();
					},
					onFailureCallback: function(error)
					{
						longSplash.destroy();
					}
					});
					longSplash.fireAction();
			}
		}
		else
		{
			alert("Nie wybrano dokumentu!");
		}
	};
	/**
	 * Funkcja odpowiedzialna za obsługę klawisza zamknij szczegółów dokumentu
	 */
	this.powrotDoListyDokumentowSprawy = function()
	{
		obwSprawy.dezaktywujKlawiszePoswiadczenia();
		sprawyWizard.selectChild(listaDokumentowSprawyContentPane);
	};

	/**
	 * Funkcja odpowiedzialna za aktywację przycisku podglądu poświadczeń jeżeli tylko takowe istnieje
	 */
	this.aktywujKlawiszPoswiadczenia = function(responseObject)
	{
		if(responseObject["metadokumentDanePelne"]["poswiadczenieWskazanie"]["id"]["idOb"] != null)
		{
			poswiadczenieDoreczeniaSprawyButton.set('disabled', false);
			poswiadczeniePrzedlozeniaSprawyButton.set('disabled', false);
		}		
	};

	/**
	 * Funkcja odpowiedzialna za dezaktywację przycisków podglądu poświadczeń
	 */
	this.dezaktywujKlawiszePoswiadczenia = function()
	{
		poswiadczenieDoreczeniaSprawyButton.set('disabled', true);
		poswiadczeniePrzedlozeniaSprawyButton.set('disabled', true);
	};

	/**
	 * Funkcja odpowiedzialna za pobranie załączników dla dokumentu odebranego danej sprawy	
	 */
	this.pobierzZalaczniki = function(responseObject)
	{
		obwZalaczniki.createAttachmentsList(responseObject);
	};

	/**
	 * Funkcja odpowiedzialna za pobranie załączników dla dokumentu wysłanego danej sprawy	
	 */	
	this.pobierzZalacznikiDokumentuWyslanego = function(responseObject)
	{
		if(responseObject != null)
		{
			dijit.byId('obwDokumentySprawyWyslanyZalacznikiId').attr('content', '');
			var daneZalacznikow = responseObject["metadokumentDanePelne"]["zalacznikDanePodstawowe"];
			obwZalaczniki.utworzListeZalacznikow(daneZalacznikow, 'obwDokumentySprawyWyslanyZalacznikiId', true);
		}
	};	

	this.preLoad = function()
	{
		obwUtils.log("Preload "+obwSprawy.sprawaCustomFilterId,obwListaSprawZawezoneId.value);
		if(obwSprawy.sprawaCustomFilterId!=null)
		{
			obwListaSprawZawezoneId.value=obwSprawy.sprawaCustomFilterId;
			obwSprawy.sprawaCustomFilterId=null;
			//dojo.style( dojo.byId('czyArchwialneContentPane'), {display:'none'});
			dojo.style( dojo.byId('czyZawezoneContentPane'), {display:'block'});
			listaSprawGrid.customFilterControlId="obwListaSprawCustomSingleFilterId";
			obwSprawy.zaznaczSprawe=true;
		}
		obwSprawy.dezaktywujKlawiszeListySpraw();
		
	};
	
	this.postLoad = function()
	{
		obwSprawy.aktywujKlawiszeListySpraw();
		przegladajSpraweButton.focus();
		obwUtils.log("Postload ",obwSprawy.zaznaczSprawe);
		if(!obwSprawy.zaznaczSprawe)
			return;
		
		obwSprawy.zaznaczSprawe = false;		
		var currentRecord = listaSprawGrid.getRecordForIndex(0);
		if(currentRecord==null) return;
		obwUtils.log("Biezacy rekord",currentRecord);
		listaSprawGrid.selectByItemIndex(0);	
//		obwSprawy.menuListaDokumentowSprawy();
		obwSprawy.pokazSzczegolyZWywolaniaWyszukiwania(currentRecord);
		obwSprawy.aktywujKlawiszeListyDokumentowSprawy();
		obwUtils.log("Koniec postLoad");
	}
	
	this.pokazSzczegolyZWywolaniaWyszukiwania = function(recWybranejSprawy)
	{
		obwUtils.log("Pokaz szczegóły ",recWybranejSprawy);
		var wybranaSprawa = recWybranejSprawy["id.idOb"];
		obwUtils.log("Wywolanie ",recWybranejSprawy["id.fullId"]);
		obwUtils.invokeAction(recWybranejSprawy["id.fullId"], 'obw/sprawy/obwDaneSprawy.npi',
			function(responseObject)
			{
				formDaneSprawy.attr("value", responseObject);
			}
		);

		// Pobranie dokumentów dla konkretnej sprawy
		//obwListaDokumentowSprawyGrid.set('storeURL', 'obw/dokumentySprawy/filter.npi?idsp=' + wybranaSprawa);
		//obwListaDokumentowSprawyGrid.init();
		obwListaDokumentowSprawyGrid.reload();

		// Przejście do menu lista dokumentów spraw
		sprawyWizard.selectChild(listaDokumentowSprawyContentPane);
	}
	
	/**
	 * Funkcja odpowiedzialna za dezaktywację przycisków grida listy spraw
	 */
	this.dezaktywujKlawiszeListySpraw = function()
	{
		//obwSprawy.preLoad();
		listaSprawGrid.deselectAll();
		if(listaSprawGrid.getSelectedRecord() == null)
		{
			przegladajSpraweButton.set('disabled', true);
			subskrybujSpraweButton.set('disabled', true);
		} else {
			przegladajSpraweButton.set('disabled', false);
			subskrybujSpraweButton.set('disabled', false);
		}
	};

	/**
	 * Funkcja odpowiedzialna za aktywację przycisków grida listy spraw
	 */
	this.aktywujKlawiszeListySpraw = function()
	{
		listaSprawGrid.selectFirst();
		if(listaSprawGrid.getSelectedRecord() != null)
		{
			przegladajSpraweButton.set('disabled', false);
			subskrybujSpraweButton.set('disabled', false);
		}
		
		dojo.connect(listaSprawGrid, "onSelectionChanged", function(){
			if(listaSprawGrid.getSelectedRecord() != null)
			{
				przegladajSpraweButton.set('disabled', false);
				subskrybujSpraweButton.set('disabled', false);
			}
			else
			{
				przegladajSpraweButton.set('disabled', true);
				subskrybujSpraweButton.set('disabled', true);			
			}
		});
	};

	/**
	 * Funkcja odpowiedzialna za dezaktywację przycisków grida listy dokumentow spraw
	 */
	this.dezaktywujKlawiszeListyDokumentowSprawy = function()
	{
		obwListaDokumentowSprawyGrid.deselectAll();
		if(obwListaDokumentowSprawyGrid.getSelectedRecord() == null)
		{
			szczegolyDokumentuSprawyButton.set('disabled', true);
			eksportujDokumentySprawyButton.set('disabled', true);
			obwPrzeniesDoArchiwumButton.set('disabled', true);
			obwPrzywrocZArchiwumButton.set('disabled', true);
		} else {
			szczegolyDokumentuSprawyButton.set('disabled', false);
			eksportujDokumentySprawyButton.set('disabled', false);
			obwPrzeniesDoArchiwumButton.set('disabled', false);
			obwPrzywrocZArchiwumButton.set('disabled', false);
		}
	};

	/**
	 * Funkcja odpowiedzialna za aktywację przycisków grida listy dokumentow spraw
	 */
	this.aktywujKlawiszeListyDokumentowSprawy = function()
	{
		obwListaDokumentowSprawyGrid.selectFirst();
		powrotDoListySprawyButton.focus();
		//obwSprawy.postLoad();
		dojo.connect(obwListaDokumentowSprawyGrid, "onSelectionChanged", function(){
			if(obwListaDokumentowSprawyGrid.getSelectedRecord() != null)
			{
				szczegolyDokumentuSprawyButton.set('disabled', false);
				eksportujDokumentySprawyButton.set('disabled', false);
				obwPrzeniesDoArchiwumButton.set('disabled', false);
				//if(obwListaDokumentowSprawyGrid.getSelectedRecord()["czyArchiwalny"] == true){
					obwPrzywrocZArchiwumButton.set('disabled', false);
				//}
			}
			else
			{
				szczegolyDokumentuSprawyButton.set('disabled', true);
				eksportujDokumentySprawyButton.set('disabled', true);
				obwPrzeniesDoArchiwumButton.set('disabled', true);
				obwPrzywrocZArchiwumButton.set('disabled', true);
			}
		});
	};
	
	/**
	 * Szybkie wyszukiwanie
	 */
	this.getCustomFilter = function()
	{
        return {
            "CzyZArchiwalnymi": {
                value: true,
                datatype: "bool"
            }
        }		
	};
	
	/**
	 * Funkcja zwraca wartość atrybutu archiwalny dla podanego rekordu
	 */
	var isArchiwum = function(rowIndex)
	{
		var rec = getGridObject().getRecordForIndex(rowIndex);
		return rec["czyArchiwalny"];
	};
	
	/**
	 * Akcja klawisza przenieś do archiwum
	 */	
	this.onClickDoArchiwum = function()
	{
		obwSprawy.invokeDoArchiwum(null);
	};

	/**
	 * Funkcja odpowiedzialna za przeniesienie do archiwum
	 */
	this.invokeDoArchiwum = function(fullId)
	{
		obwUtils.invokeSingleMultiGridAction(fullId, 'Przenieś do archiwum', 'Chcesz przenieść wybrany dokument do archiwum?',
				'Chcesz przenieść wybrany dokument do archiwum?',
				'Chcesz przenieść wybrane dokumenty do archiwum? Liczba wybranych dokumentów:',
				'obw/dokumentySprawy/przeniesDoArchiwum.npi', getGridObject());
	};
	
	/**
	 * Akcja klawisza przywróć z archiwum
	 */	
	this.onClickZArchiwum = function()
	{
		obwSprawy.invokeZArchiwum(null);
	};

	/**
	 * Funkcja odpowiedzialna za przywrócenie z archiwum
	 */
	this.invokeZArchiwum = function(fullId)
	{
		obwUtils.invokeSingleMultiGridAction(fullId, 'Przywróć z archiwum',  'Chcesz przywrócić wybrany dokument z archiwum?',
				'Chcesz przywrócić wybrany dokument z archiwum?',
				'Chcesz przywrócić wybrane dokumenty z archiwum? Liczba wybranych dokumentów:',
				'obw/dokumentySprawy/przywrocZArchiwum.npi', getGridObject());
	};
	
	/**
	 * Formater ustawiający styl tekstu dla dokumentów archiwalnych
	 */
	var getCellCustomGreyFormater = function(value, rowIndex)
	{
		var retVal = "";
	
		if(isArchiwum(rowIndex))
		{
			retVal = obwUtils.getGrayText(value, isArchiwum(rowIndex));
			retVal = obwUtils.getItalicText(retVal, isArchiwum(rowIndex));
		} else {
			retVal = value;
		}
		
		return retVal;
	}
	
}

var obwSprawy = new ObwSprawy();
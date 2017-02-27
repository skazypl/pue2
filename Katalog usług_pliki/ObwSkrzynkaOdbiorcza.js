function ObwSkrzynkaOdbiorcza(){


	var getGridObject = function()
	{
		return obwLdpDokumentyPrzychodzaceGrid;
	};

	var getGrayCellValue = function(value, rowIndex)
	{
		var retVal = "";
		retVal = obwUtils.getGrayText(value, isArchiwum(rowIndex));
		retVal = obwUtils.getItalicText(retVal, isArchiwum(rowIndex));

		return retVal;
	};

	var isArchiwum = function(rowIndex)
	{
		var rec = getGridObject().getRecordForIndex(rowIndex);
		return rec["czyArchiwalny"];
	};

	this.dokumentOdebranyCustomFilterId=null;
	this.zaznaczDokumentOdebrany = false;

	/**
	 * Zwraca strukturę listy dokumentów odebranych
	 */
	this.getStructure = function()
	{
		var actionStructure = getStructureFromAction('obw/dokumentyPrzychodzace/getStructure.npi');
		return {
			cells : [ {
				field : actionStructure.ID.field,
				hidden : true
			}, {
				field : actionStructure.NAZWA_TYPU.field,
				name : actionStructure.NAZWA_TYPU.name,
				datatype : 'string',
				width : 'auto',
				formatter: function(val, rowIndex){
					return getGrayCellValue(val, rowIndex);
				}
			}, {
				field : actionStructure.MOMENT_WPLYWU.field,
				name : actionStructure.MOMENT_WPLYWU.name,
				datatype : 'date',
				width : '120px',
				formatter: function(val, rowIndex){
					return getGrayCellValue(gridDateTimeFormatter(val), rowIndex);
				}
			}, {
				field : actionStructure.NUMER_SPRAWY.field,
				name : actionStructure.NUMER_SPRAWY.name,
				datatype : 'string',
				width : '100px',
				hidden : true
			}, {
				field : actionStructure.MOMENT_POSWIADCZENIA.field,
				name : actionStructure.MOMENT_POSWIADCZENIA.name,
				datatype : 'date',
				width : '120px',
				sortable : true,
				filterable : true,
				formatter: function(val, rowIndex){
					return getGrayCellValue(gridDateTimeFormatter(val), rowIndex);
				}
			}, {
				field: actionStructure.ARCHIWALNY.field,
				hidden: true
			},
			{
				name : 'Menu',
				width : '80px',
				filterable : false,
				sortable : false,
				formatter : function(value, rowIndex)
				{
					return obwSkrzynkaOdbiorcza.getMenuItems(rowIndex);
				}
			},
			getCheckboxColumnExt({
				title:"Wybór",
				width:"45px",
				gridId:"obwLdpDokumentyPrzychodzaceGrid",
				showHeaderCheckbox:true
			})
			]
		};
	};

	/**
	 * Zwraca pozycje menu dla listy dokumentów przychodzących
	 */
	this.getMenuItems = function(rowIndex)
	{
		var links = obwUtils.getMenuLink('Szczegóły', 'obwDokumentyOdebraneButtonPanel._onRClick()') + '<br/>'
				  + obwUtils.getMenuLink('Eksportuj', 'obwSkrzynkaOdbiorcza.invokeEksportujRow('+rowIndex+')');

		return links;
	};

	/** Szybkie wyszukiwanie */
	this.search = function()
	{
		var czyArchiwalneCheckbox = dijit.byId("czyArchiwalneCheckbox");
        var czyArchiwalne = czyArchiwalneCheckbox.checked;

        return {
            "CzyZArchiwalnymi": {
                value: czyArchiwalne,
                datatype: "bool"
            }
        };
	};

	/** Custom filtr dla wyszukiwania po id dokumentu (wykorzystywane tylko przy przekierowaniach)*/
	this.searchSingle = function()
	{
		obwUtils.log("searchSingle ",obwListaDokumentowPrzychodzacychZawezoneId.value);
		if(obwListaDokumentowPrzychodzacychZawezoneId.value=="") return null;
		return {
				Id:{
					value:obwListaDokumentowPrzychodzacychZawezoneId.value,
					datatype:"number"
				}
		};
	};
	/**
	 * Akcja klawisza eksportuj
	 */
	this.onClickEksportuj = function()
	{
		obwSkrzynkaOdbiorcza.invokeEksportuj(null);
	};

	/**
	 * Funkcja wywolujaca eksport pojedynczego elementu z kolumny menu
	 */
	this.invokeEksportujRow = function(rowIndex)
	{
		var fullId = obwUtils.getFullIdForRowIndex(getGridObject(), rowIndex);
		obwUtils.invokeExportAction(fullId, 'obw/dokumentyPrzychodzace/eksportuj.npi', null);
	}

	/**
	 * Funkcja odpowiedzialna za eksport dokumentu
	 */
	this.invokeEksportuj = function(fullId)
	{
		obwUtils.invokeSingleMultiGridAction(fullId, 'Eksportuj', 'Chcesz wyeksportować wybrany dokument?',
				'Chcesz wyeksportować wybrany dokument?', 'Chcesz  wyeksportować wybrane dokumenty? Liczba wybranych dokumentów:',
				'obw/dokumentyPrzychodzace/eksportuj.npi', getGridObject(), true);
	};

	this.obwDokumentOdebranySzczegolyClicked = function(){
//		obwLdpDokumentPrzychodzacyFormPanel.init({
//			controller: obwDokumentyOdebraneButtonPanel,
//			initButtons: true,
//			submitButton: obwDokumentyOdebraneButtonPanel.SaveButton,
//			cancelButton: obwDokumentyOdebraneButtonPanel.CancelButton,
//			workMode: new zusnpi.form.WorkMode().BROWSE
//		});
		obwLdpDokumentPrzychodzacyFormPanel.load(obwDokumentyOdebraneButtonPanel._getIdValue());
		stackSkrzynkaOdbiorcza.forward();
		dojo.style(dojo.byId("obwTrescKomunikatu").parentNode.parentNode, {display:'none'});
	};


	this.obwDokumentOdebranySzczegolyBack = function(){
//		stackSkrzynkaOdbiorcza.resize({w : '100%', h : "100%"});
//		dijit.byId('centerContentPaneSkrzynkaOdbiorcza').resize();
		stackSkrzynkaOdbiorcza.back();
		obwSkrzynkaOdbiorcza.dezaktywujKlawiszPoswiadczenia();
	};

	/**
	 * Funkcja uruchamiana przy wczytywaniu panelu szczegółów dokumentów odebranych. Aktywuje klawisz poświadczenia oraz tworzy listę załączników
	 */
	this.obwDokumentPrzychodzacyFormPanelOnLoad = function(idArg, data, mode)
	{
        if (data["metadokumentDanePelne"]["poswiadczenieWskazanie"] == null) {
            obwSkrzynkaOdbiorcza.dezaktywujKlawiszPoswiadczenia();
        } else {
            obwSkrzynkaOdbiorcza.aktywujKlawiszPoswiadczenia();
        }

		var odp = 'ODP' == typDokumentuKod.attr("value");
		if(odp)
		{
			dijit.byId('obwDokumentyZalacznikiId').attr('content', '');
			daneZalacznikow = data["metadokumentDanePelne"]["zalacznikDanePodstawowe"];
			obwZalaczniki.utworzListeZalacznikowWyslanych(daneZalacznikow, "obwDokumentyZalacznikiId", false);
			dojo.style(dojo.byId("obwZalacznikiOdebranego"), {display:'block'});
			dojo.style(dojo.byId("obwTrescKomunikatu").parentNode.parentNode, {display:'none'});
			//dojo.style(dojo.byId("obwPrzegladajDokumentOdebranyId").parentNode, {display:'block'});
		}
		else
		{
			//dojo.style(dojo.byId("obwPrzegladajDokumentOdebranyId").parentNode, {display:'none'});
			dojo.style(dojo.byId("obwZalacznikiOdebranego"), {display:'none'});
			dojo.style(dojo.byId("obwTrescKomunikatu").parentNode.parentNode, {display:'none'});
			//dojo.style(dojo.byId("obwTrescKomunikatu").parentNode.parentNode, {display:''});
			//obwDokumentyPrzychodzace.obwPobierzTrescKomunikatu(metadokumentDanePelneId.attr("value"));
		}
		obwSkrzynaOdbiorczaSzczegolyCloseButton.focus();

	};

	this.obwPobierzTrescKomunikatu = function(trescId)
	{
		var contentVar = {
			'id.fullId' : trescId
		};

		var args = {
			url : 'obw/dokumentMerytoryczny/pobierzTresc.npi',
			content : contentVar,
			handleAs : "json",
			load : function(resp)
			{
				obwTrescKomunikatu.attr("value",resp);
			}
		};
		dojo.xhrPost(args);
	}

	this.preLoad = function(){
		obwUtils.log("Preload "+obwSkrzynkaOdbiorcza.zaznaczDokumentOdebrany,obwListaDokumentowPrzychodzacychZawezoneId.value);
		if(obwSkrzynkaOdbiorcza.dokumentOdebranyCustomFilterId!=null)
		{
			obwListaDokumentowPrzychodzacychZawezoneId.value = obwSkrzynkaOdbiorcza.dokumentOdebranyCustomFilterId;
			obwSkrzynkaOdbiorcza.dokumentOdebranyCustomFilterId=null;
			dojo.style( dojo.byId('czyArchwialneContentPane'), {display:'none'});
			dojo.style( dojo.byId('czyZawezoneContentPane'), {display:'block'});
			obwLdpDokumentyPrzychodzaceGrid.customFilterControlId="obwListaDokumentowPrzychodzacychCustomSingleFilterId";
			obwSkrzynkaOdbiorcza.zaznaczDokumentOdebrany=true;
		}
	};

	this.postLoad = function(){
		obwUtils.log("Postload");
		obwDokumentyOdebraneButtonPanel.RButton.focus();
		dojo.byId('obwSkrzynkaOdbiorczaListId').scrollTop=0;
		if(!obwSkrzynkaOdbiorcza.zaznaczDokumentOdebrany){
			return;
		}
		obwSkrzynkaOdbiorcza.zaznaczDokumentOdebrany = false;
		var currentRecord = getGridObject().getRecordForIndex(0);
		if(currentRecord==null) return;
		getGridObject().selectByItemIndex(0);
		obwDokumentyOdebraneButtonPanel._onRClick();

	};

	/**
	 * Funkcja odpowiedzialna za aktywację przycisku podglądu poświadczeń jeżeli tylko takowe istnieje
	 */
	this.aktywujKlawiszPoswiadczenia = function()
	{
		if(pId.attr("value") != '')
		{
			poswiadczenieDoreczeniaButton.set('disabled', false);
		}
	};

	/**
	 * Funkcja odpowiedzialna za dezaktywację przycisku podglądu poświadczeń
	 */
	this.dezaktywujKlawiszPoswiadczenia = function()
	{
		poswiadczenieDoreczeniaButton.set('disabled', true);
	};

	this.onClickDoArchiwum = function()
	{
		obwSkrzynkaOdbiorcza.invokeDoArchiwum(null);
	};

	/**
	 * Funkcja odpowiedzialna za przeniesienie do archiwum
	 */
	this.invokeDoArchiwum = function(fullId)
	{
		obwUtils.invokeSingleMultiGridAction(fullId, 'Przenieś do archiwum', 'Chcesz przenieść wybrany dokument do archiwum? Dokument będzie dostępny przy zaznaczeniu opcji "Pokazuj archiwalne"',
				'Chcesz przenieść wybrany dokument do archiwum? Dokument będzie dostępny przy zaznaczeniu opcji "Pokazuj archiwalne"',
				'Chcesz przenieść wybrane dokumenty do archiwum? Dokumenty będą dostępne przy zaznaczeniu opcji "Pokazuj archiwalne". Liczba wybranych dokumentów:',
				'obw/dokumentyPrzychodzace/przeniesDoArchiwum.npi', getGridObject());
		//getGridObject().deselectAll();
	};

	/**
	 * Akcja klawisza przywróć z archiwum
	 */
	this.onClickZArchiwum = function()
	{
		obwSkrzynkaOdbiorcza.invokeZArchiwum(null);
	};

	/**
	 * Funkcja odpowiedzialna za przywrócenie z archiwum
	 */
	this.invokeZArchiwum = function(fullId)
	{
		obwUtils.invokeSingleMultiGridAction(fullId, 'Przywróć z archiwum',  'Chcesz przywrócić wybrany dokument z archiwum?',
				'Chcesz przywrócić wybrany dokument z archiwum?',
				'Chcesz przywrócić wybrane dokumenty z archiwum? Liczba wybranych dokumentów:',
				'obw/dokumentyPrzychodzace/przywrocZArchiwum.npi', getGridObject());
		//getGridObject().deselectAll();
	};

	this.czyAktywnyArchiwalny = function()
	{
		var czyArchiwalneCheckbox = dijit.byId("czyArchiwalneCheckbox");
        return !czyArchiwalneCheckbox.checked;
	};

	this.pokazWszystkie = function(){
		obwListaDokumentowPrzychodzacychZawezoneId.value=null;
		dojo.style( dojo.byId('czyArchwialneContentPane'), {display:'block'});
		dojo.style( dojo.byId('czyZawezoneContentPane'), {display:'none'});
		obwLdpDokumentyPrzychodzaceGrid.customFilterControlId="obwListaDokPrzyCustomFilterId";
		obwLdpDokumentyPrzychodzaceGrid.reload();
		obwListaDokumentowPrzychodzacychGridContainerId.resize();
	};

}
var obwSkrzynkaOdbiorcza = new ObwSkrzynkaOdbiorcza();
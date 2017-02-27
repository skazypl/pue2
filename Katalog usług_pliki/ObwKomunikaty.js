function ObwKomunikaty()
{
	this.komunikatCustomFilterId=null;
	this.zaznaczKomunikat = false;
	
	/**
	 * Zwraca strukturę listy komunikatów
	 */
	this.getStructure = function()
	{

		var actionStructure = getStructureFromAction('obw/komunikaty/getStructure.npi');
		return {
			cells : [
				{
					field : actionStructure.ID.field,
					hidden : true
				}, {
					field : actionStructure.MOMENT_WYSLANIA.field,
					name : actionStructure.MOMENT_WYSLANIA.name,
					datatype : 'date',
					width : '120px',
					formatter : function(value, rowIndex)
					{
						return getCellCustomBoldGreyFormater(gridDateTimeFormatter(value), rowIndex);
					}
				}, {
					field : actionStructure.MOMENT_ODBIORU.field,
					name : actionStructure.MOMENT_ODBIORU.name,
					datatype : 'date',
					width : '120px',
					formatter : function(value, rowIndex)
					{
						if(value==null && wymagaPotwierdzenia(rowIndex) ) return getCellCustomBoldGreyFormater( "<i><center>Wymaga <br/>potwierdzenia</center></i>", rowIndex);
						return getCellCustomBoldGreyFormater(gridDateTimeFormatter(value), rowIndex);	
					}
				}, {
					field : actionStructure.NAZWA_KOMUNIKATU.field,
					name : actionStructure.NAZWA_KOMUNIKATU.name,
					datatype : 'string',
					width : 'auto',
					formatter : function(value, rowIndex)
					{
						return getCellCustomBoldGreyFormater(value, rowIndex);
					}
				}, {
					field : actionStructure.MOMENT_POTWIERDZENIA.field,
					hidden : true
				}, {
					field : actionStructure.WYMAGALNOSC_POTWIERDZENIA.field,
					hidden : true
				},{
					field : actionStructure.ARCHIWALNY.field,
					hidden: true
				},{
					name : 'Menu',
					width : '70px',
					filterable : false,
					sortable : false,
					formatter : function(value, rowIndex)
					{
						return getMenuItems(rowIndex);
					}
				},	getCheckboxColumnExt({	
					title:"Wybór",
					width:"45px",
					gridId:"listaKomunikatow",
					showHeaderCheckbox:true
				})
			]
		};
	};

	this.initialSort = true;
	
	this.preLoad = function(){
		obwUtils.log("Preload "+obwKomunikaty.komunikatCustomFilterId,obwListaKomunikatowZawezoneId.value);
		if(obwKomunikaty.komunikatCustomFilterId!=null)
		{
			obwListaKomunikatowZawezoneId.value=obwKomunikaty.komunikatCustomFilterId;
			obwKomunikaty.komunikatCustomFilterId=null;
			dojo.style( dojo.byId('czyArchwialneContentPane'), {display:'none'});
			dojo.style( dojo.byId('czyZawezoneContentPane'), {display:'block'});
			listaKomunikatow.customFilterControlId="obwListaKomunikatowCustomSingleFilterId";
			obwKomunikaty.zaznaczKomunikat=true;
		}
	};
	
	this.postLoad = function(){
		obwUtils.log("Postload");
		obwSzczegolyKomunikatuButton.focus();
		if(!obwKomunikaty.zaznaczKomunikat)
			return;
		
		obwKomunikaty.zaznaczKomunikat = false;		
		var currentRecord = getGridObject().getRecordForIndex(0);
		if(currentRecord==null) return;
		getGridObject().selectByItemIndex(0);	
		obwKomunikaty.onClickSzczegoly();
	};
	
	/** Szybkie wyszukiwanie */
	this.search = function()
	{
		var czyArchiwalneCheckbox = dijit.byId("czyArchiwalneCheckboxKomunikaty");
        var czyArchiwalne = czyArchiwalneCheckbox.checked;
		obwPrzywrocZArchiwum.set('disabled', !czyArchiwalne);
		
        return {
            "CzyZArchiwalnymi": {
                value: czyArchiwalne,
                datatype: "bool"
            }
        };		
	};	
	
	/** Custom filtr dla wyszukiwania po id komunikatu (wykorzystywane tylko przy przekierowaniach)*/
	this.searchSingle = function()
	{
		obwUtils.log("searchSingle ",obwListaKomunikatowZawezoneId.value);
		return {
				Id:{
					value:obwListaKomunikatowZawezoneId.value,
					datatype:"number"
				}
		};
	};
	
	this.pokazWszystkie = function(){
		obwListaKomunikatowZawezoneId.value=null;
		dojo.style( dojo.byId('czyArchwialneContentPane'), {display:'block'});
		dojo.style( dojo.byId('czyZawezoneContentPane'), {display:'none'});
		listaKomunikatow.customFilterControlId="obwListaKomunikatowCustomFilterId";
		listaKomunikatow.reload();
		obwListaKomunikatowGridContainerId.resize();
	};
		
	var getCellCustomBoldGreyFormater = function(value,rowIndex)
	{
		var retVal = "";
	
		if(isArchiwum(rowIndex))
		{
			retVal = obwUtils.getGrayText(value, isArchiwum(rowIndex));
			retVal = obwUtils.getItalicText(retVal, isArchiwum(rowIndex));
		}
		else
			retVal =  getBoldedCellValue(value, rowIndex);
		
		return retVal;
	}
	
	var getBoldedCellValue = function(value, rowIndex)
	{
		return obwUtils.getBoldedText(value, !isPrzeczytana(rowIndex));
	};
	
	var isPrzeczytana = function(rowIndex)
	{
		var rec = getGridObject().getRecordForIndex(rowIndex);
		return rec["dataOdczytania"] != null;
	};
	
	var wymagaPotwierdzenia = function(rowIndex)
	{

		var rec = getGridObject().getRecordForIndex(rowIndex);

		return rec["wymagaPotwierdzenia"];
	};
	
	var getGridObject = function()
	{
		return listaKomunikatow;
	};
	
	
	/**
	 * Funkcja odpowiedzialna za aktywację przycisku podglądu poświadczeń jeżeli tylko takowe istnieje
	 */
	this.aktywujKlawiszPoswiadczenia = function()
	{
		obwKomunikaty.onFormLoad();
//		if(pId.attr("value") != '')
//		{
//			poswiadczenieDoreczeniaButton.set('disabled', false);
//		}		
	};
	
	/**
	 * Funkcja odpowiedzialna za dezaktywację przycisku podglądu poświadczeń
	 */
	this.dezaktywujKlawiszPoswiadczenia = function()
	{
		//poswiadczenieDoreczeniaButton.set('disabled', true);
	};	
	
	/** Ładuje dane wiadomości po otwarciu formatki*/
	this.onFormLoad = function()
	{
		var rec = getGridObject().getSelectedRecord();

		var id = rec["id.fullId"];
		if (rec["dataOdczytania"] == null)
		{
			getGridObject().reload();
		}	
		obwKomunikatPrintButtonsPanel.set(
				"exportFormParams", {
					"id.fullId" : id
				});
		dokumentPanel.closeButton.focus();
	}
	
	/** Ładuje dane wiadomości po otwarciu formatki*/
	this.onFormShow = function()
	{
		var rec = getGridObject().getSelectedRecord();

		if(!rec["wymagaPotwierdzenia"]){
			dojo.style(  dojo.byId('obwKomunikatDataPotwierdzenia').parentNode.parentNode, {display:'none'});
		} else {
			dojo.style(  dojo.byId('obwKomunikatDataPotwierdzenia').parentNode.parentNode, {display:''})
		}
	}
	
	/**
	 * Zwraca pozycję menu dla listy wiadomości
	 */
	var getMenuItems = function(rowIndex)
	{
		var link = obwUtils.getMenuLink('Szczegóły', 'obwKomunikaty.onClickSzczegolyLink(\'' + rowIndex + '\')');
		return link;
	};
	
	
	this.onClickSzczegolyLink = function(rowIndex)
	{
		invokeSzczegoly(rowIndex);
	};
	
	this.onClickSzczegoly = function()
	{
		invokeSzczegoly(null);
	};
	
	var invokeSzczegoly = function(rowIndex){
		
		var rec = getGridObject().getRecordForIndex(rowIndex);
		
		if(null == rec){
			rec = getGridObject().getSelectedRecord();
		}
		
		if(!rec["wymagaPotwierdzenia"] || null != rec["dataOdczytania"]){
			obwListaKomunikatowCrudButtonPanel._onRClick();
			return;
		}
		
		
		obwPotwierdzOdbiorKomunikatuDialog.onHide = function(){
			
			if(!getObwPotwierdzOdbiorKomunikatuDialogSuccess()){
				return;
			}
			
			obwUtils.invokeAction(rec["id.fullId"], 'obw/komunikaty/potwierdzOdbior.npi', function()
				{
					obwListaKomunikatowCrudButtonPanel._onRClick();
				});
		}
		
		obwPotwierdzOdbiorKomunikatuDialog.show();
		
//		var dialogPotwierdzenia = new zusnpi.dialog.Confirm({
//			title: "Potwierdź odbiór komunikatu",
//			content: "Czy potwierdzić odbiór komunikatu?"
//		});
//		
//		dialogPotwierdzenia.onOkClick = function(){
//			obwUtils.invokeAction(rec["id.fullId"], 'obw/komunikaty/potwierdzOdbior.npi', function()
//				{
//					obwListaKomunikatowCrudButtonPanel._onRClick();
//				});
//		}
//		
//		dialogPotwierdzenia.onCancelClick = function(){
//			
//		}
//		
//		dialogPotwierdzenia.setArgs();
//		dialogPotwierdzenia.show();
	}
	
	
	var getGrayCellValue = function(value, rowIndex)
	{
		return obwUtils.getGrayText(value, isArchiwum(rowIndex));
	};
	
	var isArchiwum = function(rowIndex)
	{
		var rec = getGridObject().getRecordForIndex(rowIndex);
		return rec["czyArchiwalny"];
	};

	this.onClickDoArchiwum = function()
	{
		 obwKomunikaty.invokeDoArchiwum(null);
	};

	
	/**
	 * Funkcja odpowiedzialna za przeniesienie do archiwum
	 */
	this.invokeDoArchiwum = function(fullId)
	{
		obwUtils.invokeSingleMultiGridAction(fullId, 'Przenieś do archiwum', 'Chcesz przenieść wybrany komunikat do archiwum? Komunikat będzie dostępny przy zaznaczeniu opcji "Pokazuj archiwalne".',
				'Chcesz przenieść wybrany komunikat do archiwum? Komunikat będzie dostępny przy zaznaczeniu opcji "Pokazuj archiwalne".',
				'Chcesz przenieść wybrane komunikaty do archiwum? Komunikaty będą dostępne przy zaznaczeniu opcji "Pokazuj archiwalne". Liczba wybranych komunikatów:',
				'obw/komunikaty/przeniesDoArchiwum.npi', getGridObject());
		//getGridObject().deselectAll();
	};
	
	
	/**
	 * Akcja klawisza przywróć z archiwum
	 */	
	this.onClickZArchiwum = function()
	{
		obwKomunikaty.invokeZArchiwum(null);
	};

	
	/**
	 * Funkcja odpowiedzialna za przywrócenie z archiwum
	 */
	this.invokeZArchiwum = function(fullId)
	{
		obwUtils.invokeSingleMultiGridAction(fullId, 'Przywróć z archiwum',  'Chcesz przywrócić wybrany komunikat z archiwum?',
				'Chcesz przywrócić wybrany komunikat z archiwum?',
				'Chcesz przywrócić wybrane komunikaty z archiwum? Liczba wybranych komunikatów:',
				'obw/komunikaty/przywrocZArchiwum.npi', getGridObject());
		//getGridObject().deselectAll();
	};	
	this.czyAktywnyArchiwalny = function()
	{
		var czyArchiwalneCheckbox = dijit.byId("czyArchiwalneCheckboxKomunikaty");
		return !czyArchiwalneCheckbox.checked;
	};
	
	this.createAddedMessage = function(addedMessage, date)
	{
		var message = "";
		if (addedMessage){	
			message += "-------------------------------------";
			message += "</br>Treść komunikatu odebranego</br>";
			message += "-------------------------------------";
			message += "</br>Data wysłania: ";
			if (date){
				message += date;
			}
			message += "</br></br>";
			message += addedMessage;
		}
		return message
	};
}

var obwKomunikaty = new ObwKomunikaty();
function ObwDodajDokumentyRobocze()
{
	/**
	 * Wywoływane na on load dialogu dodawania roboczych dokumentów. Czyści sesję i
	 * wyświetlaną listę z dozwolonymi do dodania dokumentami roboczymi
	 */
	this.obwImportDokumentowDialogOnShow = function() {
		obwUtils.log('obwImportDokumentowDialogOnShow');
	};
	
	this.obwImportDokumentowDialogOnHide = function() {
		obwUtils.log('obwImportDokumentowDialogOnHide');
	};
	
	this.dodajDokumentyRobocze = function() {
		obwUtils.log('dodajDokumentyRobocze');
		obwDodajDokumentyRoboczeDialog.show();
		getGridObject().reloadWithClearMultiselection();
		getGridObject().setQuery("{test}");
		getGridObject().filterGridWithCustomFilter();
	}
	
	this.onClickAnuluj = function()
	{
		obwDodajDokumentyRoboczeDialog.hide();
	};
	
	this.onClickZalacz = function()
	{
		var metadokumentId = dojo.byId("metadokumentId").value;	
		obwDodajDokumentyRobocze.invokeZalacz(metadokumentId, null);
	};
	
	this.invokeZalacz = function(metadokumentId, fullId)
	{
		obwUtils.log("invokeZalacz: " + metadokumentId);
		obwDodajDokumentyRobocze.invokeSingleMultiGridZalaczAction(metadokumentId, 'Załącz', 'Chcesz załączyć wybrany dokument?',
			'Chcesz załączyć wybrany dokument?',
			'Chcesz załączyć wybrane dokumenty?. Liczba wybranych dokumentów:',
			'obw/dodajDokumentyRobocze/zalacz.npi', getGridObject());
	};
	
	var getGridObject = function()
	{
		return obwDodajDokumentyRoboczeDialogGridListaDokumentowRoboczych;
	};
	
	this.customFilter = function() {
		return dojo.byId("metadokumentId").value;
	};
	
	/**
	 * Zwraca strukturę listy dokumentów roboczych
	 */
	this.getStructure = function()
	{
		obwUtils.log('getStructure');
		//obwDokumentyRobocze.pobierzMaksRozmiarZalacznikow();
		var actionStructure = getStructureFromAction('obw/dodajDokumentyRobocze/getStructure.npi');

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
									gridId:"obwDodajDokumentyRoboczeDialogGridListaDokumentowRoboczych",
									showHeaderCheckbox:true
								})
			]
		};
	};
	
	this.invokeSingleMultiGridZalaczAction = function(metadokumentId, title, messageSingle,
			messageMultiOne, messageMultiMany, url, gridJsId) {
		var selectedCount = gridJsId.getMultiSelectionSelectedRecordsCount();
		var selectedRecord = gridJsId.getSelectedRecord();
		if(selectedCount >= 1 || selectedRecord != null) {
			confirm({
				title : title,
				content : (selectedCount > 1 ? messageMultiMany + ' '
						+ selectedCount + '.' : messageMultiOne),
				onOkClick : function() {
					obwDodajDokumentyRobocze.invokeZalaczAction(metadokumentId, url, gridJsId);
				}
			});
		}
		else {
			alert('Niewskazano dokumentu lub dokumentów do załączenia');
		}
	};
	
	this.invokeZalaczAction = function(metadokumentId, url, gridJsId) {
		if (gridJsId == null) {
			console.log('Nie ustawiono grida');
			return;
		}
		
		var selectedCount = gridJsId.getMultiSelectionSelectedRecordsCount();
		var selectedRows = gridJsId.getMultiSelectionSelectedIds();
		if(selectedCount <= 0 && gridJsId.getSelectedRecord() != null) {
			selectedRows = gridJsId.getSelectedRecord()["id.fullId"];
		}

		var args = null;
		args = {
			url : url,
			content : {
				'metadokumentId' : metadokumentId,
				'selectedRows' : selectedRows
			},
			timeout : 1000
		};
	 	
		obwDodajDokumentyRobocze.invokeZalaczUrlAction(args.content, url,null);
		obwDodajDokumentyRoboczeDialog.hide();
	};
	
	this.invokeZalaczUrlAction = function(contentVar, url, onLoadFunction) {
		var args = {
			url : url,
			content : contentVar,
			handleAs : "json",
			load : function(resp) {
				obwDokumentyRobocze.obsluzZalaczniki(resp);
				odswiezZalaczniki();
			}
		}
		dojo.xhrPost(args);
	};
	
	this.preLoad = function(){
		obwUtils.log("Preload");
	};
	
	this.postLoad = function(){
		obwUtils.log("Postload")
		getGridObject().deselectAll();
	};
}

var obwDodajDokumentyRobocze = new ObwDodajDokumentyRobocze();
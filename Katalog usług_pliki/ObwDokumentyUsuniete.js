function ObwDokumentyUsuniete()
{
	/**
	 * Zwraca strukturę listy dokumentów usuniętych
	 */
	this.getStructure = function()
	{

		var actionStructure = getStructureFromAction('obw/dokumentyUsuniete/getStructure.npi');

		return {
			cells : [ {
				field : actionStructure.ID.field,
				hidden : true
			}, {
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
				field : actionStructure.MOMENT_USUNIECIA.field,
				name : actionStructure.MOMENT_USUNIECIA.name,
				datatype : 'date',
				width : '120px',
				formatter : function(val)
				{
					return gridDateTimeFormatter(val);
				}
			}, 	getCheckboxColumnExt({	
				title:"Wybór",
				width:"45px",
				gridId:"obwGridListaDokumentowUsunietych",
				showHeaderCheckbox:true
			})
			]
		};
	};

	/**
	 * Funkcja wywoływana przy akcji onLoad panelu dukement roboczy. Odpowiada za utworzenie listy załączników.
	 */
	this.obwLdrDokumentUsunietyFormPanelOnLoad = function(idArg, data, mode)
	{

		// Utworzenie listy załączników
		dijit.byId('obwDokumentyZalacznikiId').attr('content', '');
		daneZalacznikow =data["metadokumentDanePelne"]["zalacznikDanePodstawowe"];
		obwZalaczniki.utworzListeZalacznikow(daneZalacznikow, "obwDokumentyZalacznikiId", false);	
		obwDokumentUsunietyFormPanel.closeButton.focus();
	};
	
	this.preLoad = function(){
//		getGridObject().setSortIndex(3, false);
	};
	
	this.postLoad = function(){
		obwListaDokumentowUsunietychCrudButtonPanel.RButton.focus();
	};

	var getGridObject = function()
	{
		return listaSprawGrid;
	};
	
	/**
	 * Akcja klawisza usuń
	 */
	this.onClickUsun = function()
	{
		obwDokumentyUsuniete.invokeUsun(null);
	};

	
	/**
	 * Funkcja odpowiedzialna za usunięcie dokumentu
	 */
	this.invokeUsun = function(fullId)
	{
		obwUtils.invokeSingleMultiGridAction(fullId, 'Usuń trwale', 'Chcesz trwale usunąć wybrany dokument? Operacja ta jest nieodwracalna.',
				'Chcesz trwale usunąć wybrane dokumenty?', 'Chcesz trwale usunąć wybrane dokumenty? Operacja ta jest nieodwracalna. Liczba wybranych dokumentów:',
				'obw/dokumentyUsuniete/usunTrwale.npi', getGridObject());
	};

	
	/**
	 * Akcja klawisza przywróć
	 */
	this.onClickPrzywroc = function()
	{
		obwDokumentyUsuniete.invokePrzywroc(null);
	};

	
	/**
	 * Funkcja odpowiedzialna za przywrócenie dokumentu
	 */
	this.invokePrzywroc = function(fullId)
	{
		obwUtils.invokeSingleMultiGridAction(fullId, 'Przywróć', 'Chcesz przywrócić wybrany dokument?',
				'Chcesz przywrócić wybrany dokument?', 'Chcesz przywrócic wybrane dokumenty? Liczba wybranych dokumentów:',
				'obw/dokumentyUsuniete/przywroc.npi', getGridObject());
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
	 * Funkcja zwracająca ID grida
	 */
	var getGridObject = function()
	{
		return obwGridListaDokumentowUsunietych;
	}

}
var obwDokumentyUsuniete = new ObwDokumentyUsuniete();
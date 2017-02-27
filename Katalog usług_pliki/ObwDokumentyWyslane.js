function ObwDokumentyWyslane()
{

    this.dokumentWyslanyCustomFilterId=null;
    this.zaznaczDokumentWyslany= false;
    /**
     * Zwraca strukturę listy dokumentów wysłanych
     */
    this.getStructure = function() {

        var actionStructure = getStructureFromAction('obw/dokumentyWyslane/getStructure.npi');

        var rolaKomornik = isKomornik();

        return {
            cells: [
                {
                    field: actionStructure.ID.field,
                    hidden: true
                }, {
                    field: actionStructure.NAZWA_TYPU.field,
                    name: actionStructure.NAZWA_TYPU.name,
                    datatype:'string',
                    width: 'auto',
                    formatter:  function(val, rowIndex) {
                        return getGrayCellValue(val, rowIndex);
                    }
                }, {
                    field: actionStructure.STATUS_METADANYCH.field,
                    hidden: true
                }, {
                    field: actionStructure.MOMENT_UTWORZENIA.field,
                    name: actionStructure.MOMENT_UTWORZENIA.name,
                    width: '120px',
                    datatype:'date',
                    formatter: function(val, rowIndex) {
                        return getGrayCellValue(gridDateTimeFormatter(val), rowIndex);
                    }
                }, {
                    field: actionStructure.MOMENT_WYSLANIA.field,
                    name: actionStructure.MOMENT_WYSLANIA.name,
                    width: '120px',
                    datatype:'date',
                    formatter: function(val, rowIndex){
                        return getGrayCellValue(gridDateTimeFormatter(val), rowIndex);
                    }
                }, {
                    field: actionStructure.ZRODLO_POWSTANIA.field,
                    hidden: true
                }, {
                    field: actionStructure.KANAL_PRZEKAZANIA.field,
                    name: actionStructure.KANAL_PRZEKAZANIA.name,
                    datatype:'string',
                    width: '80px',
                    filterable : true,
                    formatter:  function(val, rowIndex) {
                        var value = val;
                        if(val == 'CIT')
                        {
                            value = 'COT';
                        }
                        return getGrayCellValue(value, rowIndex);
                    }
                }, {
                    field: actionStructure.ARCHIWALNY.field,
                    hidden: true
                }, {
                    field: actionStructure.PESEL_EKS.field,
                    name: actionStructure.PESEL_EKS.name,
                    datatype:'string',
                    width: 'auto',
                    hidden: !rolaKomornik,
                    formatter:  function(val, rowIndex) {
                        return getGrayCellValue(val, rowIndex);
                    }
                }, {
                    field: actionStructure.SYGNATURA_SPRAWY_EKS.field,
                    name: actionStructure.SYGNATURA_SPRAWY_EKS.name,
                    datatype:'string',
                    width: 'auto',
                    hidden: !rolaKomornik,
                    formatter:  function(val, rowIndex) {
                        return getGrayCellValue(val, rowIndex);
                    }
                },
                getCheckboxColumnExt({
                                        title:"Wybór",
                                        width:"45px",
                                        gridId:"obwGridListaDokumentowWyslanych",
                                        showHeaderCheckbox:true
                                    })
            ]
        };
    };

    var isKomornik = function() {
        var isKomornik = false; // jesli rola Komornika, to dodane 2 kolumny
        var args = {
            url: 'obw/dokumentyWyslane/isKomornik.npi',
            sync: true,
            handleAs: 'json',
            load: function(resp) {
                if (resp['rolaKomornika']) {
                    isKomornik = resp['rolaKomornika'];
                }
            },
            error: function(error) {
                error( error );
            }
        };
        dojo.xhrPost( args );
        return isKomornik;
    }

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

    /**
     * Akcja klawisza eksportuj
     */
    this.onClickEksportuj = function()
    {
        obwDokumentyWyslane.invokeEksportuj(null);
    };

    /**
     * Akcja klawisza eksportuj upp
     */
    this.onClickEksportujUPP = function()
    {
        obwDokumentyWyslane.invokeEksportujUPP(null);
    };

    /**
     * Funkcja odpowiedzialna ze eksport dokumentu
     */
    this.invokeEksportuj = function(fullId)
    {
        obwUtils.invokeSingleMultiGridAction(fullId, 'Eksportuj', 'Chcesz wyeksportować wybrany dokument?',
                'Chcesz wyeksportować wybrany dokument?', 'Chcesz  wyeksportować wybrane dokumenty? Liczba wybranych dokumentów:',
                'obw/dokumentyWyslane/eksportuj.npi', getGridObject(), true);
    };

    /**
     * Funkcja odpowiedzialna ze eksport dokumentu
     */
    this.invokeEksportujUPP = function(fullId)
    {
        obwUtils.invokeSingleMultiGridAction(fullId, 'Eksportuj UPP', 'Chcesz wyeksportować Urzędowe Poświadczenia Przedłożenia dla wybranych dokumentów?',
                'Chcesz wyeksportować Urzędowe Poświadczenia Przedłożenia dla wybranych dokumentów?', 'Chcesz wyeksportować Urzędowe Poświadczenia Przedłożenia dla wybranych dokumentów? Liczba wybranych dokumentów:',
                'obw/dokumentyWyslane/exportAllUPP.npi', getGridObject(), true);
    };

//	this.dokumentWyslanyCustomFilterId=null;
//	this.zaznaczDokumentWyslany= false;
    this.preLoad = function(){
        obwUtils.log("Preload "+obwDokumentyWyslane.dokumentWyslanyCustomFilterId,obwListaDokumentowWyslanychZawezoneId.value);
        if(obwDokumentyWyslane.dokumentWyslanyCustomFilterId!=null)
        {
            obwListaDokumentowWyslanychZawezoneId.value=obwDokumentyWyslane.dokumentWyslanyCustomFilterId;
            obwDokumentyWyslane.dokumentWyslanyCustomFilterId=null;
            dojo.style( dojo.byId('czyArchwialneContentPane'), {display:'none'});
            dojo.style( dojo.byId('czyZawezoneContentPane'), {display:'block'});
            obwGridListaDokumentowWyslanych.customFilterControlId="obwListaDokumentowWyslanychCustomSingleFilterId";
            obwDokumentyWyslane.zaznaczDokumentWyslany=true;
        }
        dijit.byId('czyArchiwalneCheckbox').setDisabled(true);
    };

    this.postLoad = function(){
        obwUtils.log("Postload")
        dijit.byId('czyArchiwalneCheckbox').setDisabled(false);
        obwListaDokumentowWyslanychCrudButtonPanel.RButton.focus();
        if(!obwDokumentyWyslane.zaznaczDokumentWyslany)
            return;
        obwDokumentyWyslane.zaznaczDokumentWyslany = false;
        var currentRecord = getGridObject().getRecordForIndex(0);
        if(currentRecord==null) return;
        obwGridListaDokumentowWyslanych.selectByItemIndex(0);
        obwListaDokumentowWyslanychCrudButtonPanel._onRClick();
    };

    /** Custom filtr dla wyszukiwania po id dokumentu (wykorzystywane tylko przy przekierowaniach)*/
    this.searchSingle = function()
    {
        obwUtils.log("searchSingle ",obwListaDokumentowWyslanychZawezoneId.value);
        if(obwListaDokumentowWyslanychZawezoneId.value=="") return null;
        return {
                Id:{
                    value:obwListaDokumentowWyslanychZawezoneId.value,
                    datatype:"number"
                }
        };
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

    this.pokazWszystkie = function(){
        obwListaDokumentowWyslanychZawezoneId.value=null;
        dojo.style( dojo.byId('czyArchwialneContentPane'), {display:'block'});
        dojo.style( dojo.byId('czyZawezoneContentPane'), {display:'none'});
        obwGridListaDokumentowWyslanych.customFilterControlId="obwListaDokWysCustomFilterId";
        obwGridListaDokumentowWyslanych.reload();
        obwListaDokumentowWyslanychGridContainerId.resize();
    };

    this.czyAktywnyArchiwalny = function()
    {
        var czyArchiwalneCheckbox = dijit.byId("czyArchiwalneCheckbox");
        return !czyArchiwalneCheckbox.checked;
    };


    /**
     *  Funkcja odpowiedzialna za aktywację przycisku podglądu poświadczeń jeżeli tylko takowe istnieje
     */
    this.aktywujKlawiszPoswiadczenia = function()
    {
        if(pId.attr("value") != '')
        {
            poswiadczeniePrzedlozeniaButton.set('disabled', false);
        }
    };


    /**
     *  Funkcja odpowiedzialna za dezaktywację przycisku podglądu poświadczeń
     */
    this.dezaktywujKlawiszPoswiadczenia = function()
    {
        poswiadczeniePrzedlozeniaButton.set('disabled', true);
    };


    /**
     * Funkcja zwracająca ID grida
     */
    var getGridObject = function()
    {
        return obwGridListaDokumentowWyslanych;
    }


    /**
     * Akcja klawisza przenies do archiwum
     */
    this.onClickDoArchiwum = function()
    {
        obwDokumentyWyslane.invokeDoArchiwum(null);
    };


    /**
     * Funkcja odpowiedzialna za przeniesienie do archiwum
     */
    this.invokeDoArchiwum = function(fullId)
    {
        obwUtils.invokeSingleMultiGridAction(fullId, 'Przenieś do archiwum', 'Chcesz przenieść wybrany dokument do archiwum? Dokument będzie dostępny przy zaznaczeniu opcji "Pokazuj archiwalne"',
                'Chcesz przenieść wybrany dokument do archiwum? Dokument będzie dostępny przy zaznaczeniu opcji "Pokazuj archiwalne"',
                'Chcesz przenieść wybrane dokumenty do archiwum? Dokumenty będą dostępne przy zaznaczeniu opcji "Pokazuj archiwalne". Liczba wybranych dokumentów:',
                'obw/dokumentyWyslane/przeniesDoArchiwum.npi', getGridObject());
        //getGridObject().deselectAll();
    };



    /**
     * Akcja klawisza przywróć z archiwum
     */
    this.onClickZArchiwum = function()
    {
        obwDokumentyWyslane.invokeZArchiwum(null);
    };


    /**
     * Funkcja odpowiedzialna za przywrócenie z archiwum
     */
    this.invokeZArchiwum = function(fullId)
    {
        obwUtils.invokeSingleMultiGridAction(fullId, 'Przywróć z archiwum',  'Chcesz przywrócić wybrany dokument z archiwum?',
                'Chcesz przywrócić wybrany dokument z archiwum?',
                'Chcesz przywrócić wybrane dokumenty z archiwum? Liczba wybranych dokumentów:',
                'obw/dokumentyWyslane/przywrocZArchiwum.npi', getGridObject());
        //getGridObject().deselectAll();
    };

    this.czyAktywnyArchiwalny = function()
    {
        var czyArchiwalneCheckbox = dijit.byId("czyArchiwalneCheckbox");
        return !czyArchiwalneCheckbox.checked;
    };
    
    this.dezaktywujKlawiszPodgladu = function(responseObject)
	{
		var kodStatusu = responseObject["metadokumentDanePelne"]["kodStatusuMetadanych"];
		if(kodStatusu != null && kodStatusu == "EODBR")
		{
			podgladDokumentuWyslanyButton.set('disabled', true);
		}		
	};
	
	this.dezaktywujKlawiszEksportu = function(responseObject)
	{
		var kodStatusu = responseObject["metadokumentDanePelne"]["kodStatusuMetadanych"];
		if(kodStatusu != null && kodStatusu == "EODBR")
		{
			eksportujDokumentWyslanyButton.set('disabled', true);
		}		
	};
}

var obwDokumentyWyslane = new ObwDokumentyWyslane();
function ObwWiadomosci()
{
    this.wiadomoscCustomFilterId=null;
    this.zaznaczWiadomosc = false;
    /**
	 * Zwraca strukturę listy wiadomości
	 */
    this.getStructure = function()
    {
        var actionStructure = getStructureFromAction("obw/wiadomosci/getStructure.npi");
        return {
            cells : [  {
                field : actionStructure.ID.field,
                hidden : true
            }, {
                field : actionStructure.DATA_WYSLANIA.field,
                name : actionStructure.DATA_WYSLANIA.name,
                datatype : 'date',
                width : '129px',
                formatter : function(value, rowIndex)
                {
                    return getBoldedCellValue(gridDateTimeFormatter(value), rowIndex);
                }
            }, {
                field : actionStructure.DATA_ODCZYTANIA.field,
                name : actionStructure.DATA_ODCZYTANIA.name,
                datatype : 'date',
                width : '129px',
                formatter : function(value, rowIndex)
                {
                    return getBoldedCellValue(gridDateTimeFormatter(value), rowIndex);
                }
            }, {
                field : actionStructure.NAGLOWEK.field,
                name : actionStructure.NAGLOWEK.name,
                width : 'auto',
                datatype : "string",
                formatter : function(value, rowIndex)
                {
                    return getBoldedCellValue(obwUtils.getTruncatedText(value, 30), rowIndex);
                }
            }, {
                name : 'Menu',
                width : '100px',
                filterable : false,
                sortable : false,
                formatter : function(value, rowIndex)
                {
                    return getMenuItems(rowIndex);
                }
            }, 	getCheckboxColumnExt({	
                title:"Wybór",
                width:"45px",
                gridId:"obwWiadomosciGridId",
                showHeaderCheckbox:true
            })
            ]
        };

    };

    this.onClickSzczegoly = function()
    {
        obwListaWiadomosciBP._onRClick();
    };

    this.onClickSzczegolyLink = function(rowIndex)
    {
        obwListaWiadomosciBP._onRClick();
    };

    this.onClickUsun = function()
    {
        invokeUsun(null, null, null);
    };

    this.onClickUsunLink = function(rowIndex)
    {
        invokeUsun(obwUtils.getFullIdForRowIndex(getGridObject(), rowIndex), true, rowIndex);
    };

    this.onClickOznaczJakoPrzeczytane = function()
    {
        invokeOznaczJakoPrzeczytane(null);
    };

    this.onClickOznaczJakoPrzeczytaneLink = function(rowIndex)
    {
        invokeOznaczJakoPrzeczytane(obwUtils.getFullIdForRowIndex(getGridObject(), rowIndex));
    };

    /** Ładuje dane wiadomości po otwarciu formatki*/
    this.onFormLoad = function()
    {
        var rec = getGridObject().getSelectedRecord();
        if (rec["przeczytana"] == false)
            obwUtils.invokeAction(rec["id.fullId"], 'obw/wiadomosci/oznaczJakoPrzeczytane.npi', function()
            {
                getGridObject().reload();
            });
        var nadawca = rec["wyslana"] ? "NPI" : "ZUS";
        var dataWyslania = rec["momentWyslania"];
        var tresc = rec["tresc"];
        dijit.byId("od").set("value", nadawca);
        dijit.byId("dataWyslania").set("value", dataWyslania);
        //dijit.byId("dataOdczytania").set("value", rec["momentOdczytania"]);
        dijit.byId("tresc").set("value", tresc);
        obwWiadomoscPrintButtonsPanel.set(
            "exportFormParams", {
                "nadawca" : nadawca,
                "dataWyslania" : dataWyslania,
                "tresc" : tresc
            });
        wiadomoscPanel.closeButton.focus();
    },

    /** Szybkie wyszukiwanie w liście wiadomości */
    this.search = function()
    {
        var klucz = dijit.byId('obwWiadomosciSzybkieWyszukiwanieId').get('value');
        return {
            Tresc : {
                value : klucz,
                datatype : 'string'
            }
        };
    };
	
    /**Zawężanie listy dla przekierowania z wyszukiwania */
    this.searchSingle = function()
    {
        if(obwListaWiadomosciZawezoneId.value=='' || obwListaWiadomosciZawezoneId.value==null) return null;
        return {
            Id:{
                value:obwListaWiadomosciZawezoneId.value,
                datatype:"number"
            }
        };
    }
	
    /** Aktywacja/dezaktywacja klawisza odpowiedzialnego za oznaczenie danej wiadomości jako przeczytanej */
    this.aktywujKlawiszPrzeczytano = function()
    {
        obwWiadomosci.wykonajZaznaczenieWiadomosci();
        //		dojo.connect(getGridObject(), "onSelected", function(){
        //			var przeczytana = getGridObject().getSelectedRecord()["przeczytana"];
        //			if (przeczytana)
        //			{
        //				// Jeżeli wiadomość była już przeczytana, dezaktywuj klawisz
        //				obwButtonPrzeczytane.set('disabled', true);
        //			}
        //			else
        //			{
        //				// Jeżeli wiadomość nie była jeszcze przeczytana, aktywuj klawisz
        //				obwButtonPrzeczytane.set('disabled', false);
        //			}
        //		});	
        dijit.byId('obwListaWiadomosciBP').RButton.focus();
    };
	
    this.wykonajZaznaczenieWiadomosci = function()
    {
        if(!obwWiadomosci.zaznaczWiadomosc)
            return;
		
        obwWiadomosci.zaznaczWiadomosc = false;		
        var currentRecord = getGridObject().getRecordForIndex(0);
        if(currentRecord==null) return;
        getGridObject().selectByItemIndex(0);	
        obwListaWiadomosciBP._onRClick();
    }
	
    this.pokazWszystkie = function()
    {
        obwListaWiadomosciZawezoneId.value = null;
        dojo.style( dojo.byId('czyArchwialneContentPane'), {
            display:'block'
        });
        dojo.style( dojo.byId('czyZawezoneContentPane'), {
            display:'none'
        });
        obwWiadomosciGridId.customFilterControlId="obwListaWiadomosciCustomFilterId";
        obwWiadomosciGridId.reload();
        obwWiadomosciGridContainerId.resize();
    }
	
	
    this.preLoad = function(){
        obwUtils.log("Preload "+obwWiadomosci.wiadomoscCustomFilterId,obwListaWiadomosciZawezoneId.value);
        if(obwWiadomosci.wiadomoscCustomFilterId!=null)
        {
            obwListaWiadomosciZawezoneId.value=obwWiadomosci.wiadomoscCustomFilterId;
            obwWiadomosci.wiadomoscCustomFilterId=null;
            dojo.style( dojo.byId('czyArchwialneContentPane'), {
                display:'none'
            });
            dojo.style( dojo.byId('czyZawezoneContentPane'), {
                display:'block'
            });
            obwWiadomosciGridId.customFilterControlId="obwListaWiadmosciCustomSingleFilterId";
            obwWiadomosci.zaznaczWiadomosc=true;
        }
    }

	
    this.wiadomosciSzybkieSzukanieKeyPress = function(event){
        var keyCode = event.keyCode ? event.keyCode : event.which;
        if (keyCode == 13){
            obwWiadomosciGridId.filterGridWithCustomFilter();
        }
    };
    /**
	 * Zwraca pozycję menu dla listy wiadomości
	 */
    var getMenuItems = function(rowIndex)
    {
        var link = obwUtils.getMenuLink('Szczegóły', 'obwWiadomosci.onClickSzczegolyLink(\'' + rowIndex + '\')');
        if (isPrzeczytana(rowIndex))
            link += '<br/>' + obwUtils.getMenuLink('Usuń', 'obwWiadomosci.onClickUsunLink(\'' + rowIndex + '\')');

        return link;
    };

    var invokeUsun = function(fullId, flaga, rowIndex)
    {
       if(flaga!=null || flaga == true) {
            console.log('odznaczany checkbox = ' + rowIndex+1);
            var grid = getGridObject();
            grid.addOrRemoveIdToSelection(false, rowIndex);
            console.log('grid = ' + grid.valueOf());
            obwUtils.invokeSingleMultiGridAction(fullId, 'Usuń', 'Chcesz usunąć wybraną wiadomość? Wiadomość zostanie trwale usunięta z portalu.',
                'Chcesz usunąć wybraną wiadomość? Wiadomość zostanie trwale usunięta z portalu.',
                'Chcesz usunąć wybrane wiadomości? Wiadomości zostaną trwale usunięte z portalu. Liczba wybranych wiadomości:',
                'obw/wiadomosci/usun.npi', grid);
        } else {
            obwUtils.invokeSingleMultiGridAction(fullId, 'Usuń', 'Chcesz usunąć wybraną wiadomość? Wiadomość zostanie trwale usunięta z portalu.',
                'Chcesz usunąć wybraną wiadomość? Wiadomość zostanie trwale usunięta z portalu.',
                'Chcesz usunąć wybrane wiadomości? Wiadomości zostaną trwale usunięte z portalu. Liczba wybranych wiadomości:',
                'obw/wiadomosci/usun.npi', getGridObject());
        }
    };

    var invokeOznaczJakoPrzeczytane = function(fullId)
    {
        obwUtils.invokeSingleMultiGridAction(fullId, 'Oznacz jako przeczytane',
            'Chcesz oznaczyć jako przeczytaną wybraną wiadomość?',
            'Chcesz oznaczyć jako przeczytaną wybraną wiadomość?', 'Chcesz oznaczyć jako przeczytane wybrane wiadomości?  Liczba wybranych wiadomości:',
            'obw/wiadomosci/oznaczJakoPrzeczytane.npi', getGridObject());
    };

    var isPrzeczytana = function(rowIndex)
    {
        var rec = getGridObject().getRecordForIndex(rowIndex);
        return rec["przeczytana"];
    };

    var getBoldedCellValue = function(value, rowIndex)
    {

        return obwUtils.getBoldedText(value, !isPrzeczytana(rowIndex));
    };

    var getGridObject = function()
    {
        return obwWiadomosciGridId;
    };

}

var obwWiadomosci = new ObwWiadomosci();
dojo.require("obw.widget.obwBaseWidget");
dojo.require("obw.widget.platnosci.dialog.obwDaneNaleznosciDialog");
dojo.require("obw.widget.platnosci.dialog.obwSoftErrorDialog");
	
function ObwNaleznosci()
{
	this.wplataCustomFiltrId = null;
	/**
	 * Zwraca strukturę listy należności
	 */
	this.getStructure = function(){
		var actionStructure = getStructureFromAction("obw/naleznosci/getStructure.npi");
		
		var currencyFormatter = new CurrencyFormatter(null, CurrencyFormatter.INPUT_CURRENCY_ENUM.PLN, CurrencyFormatter.PRESENTATION_FORMAT_ENUM.PLN_ONLY);
		
		return {
			cells: [
				{
					field: actionStructure.ID.field,
					hidden: true
				}, {
					field: actionStructure.TYTUL_NALEZNOSCI.field,
					name: actionStructure.TYTUL_NALEZNOSCI.name,
					datatype:'string',
					width: 'auto'
				}, {
					field: actionStructure.KWOTA_NALEZNOSCI.field,
					name: actionStructure.KWOTA_NALEZNOSCI.name,
					width: '70px',
					datatype:'number',
					formatter: currencyFormatter,
					headerStyles: "text-align:center;",
					styles: "text-align:right;"
				}, {
					field: actionStructure.DATA_NALEZNOSCI.field,
					name: actionStructure.DATA_NALEZNOSCI.name,
					width: '110px',
					datatype: 'date',
					formatter: function(val) {
						return gridDateTimeFormatter(val);
					}
				},{
					field: actionStructure.STATUS_NALEZNOSCI.field,
					name: actionStructure.STATUS_NALEZNOSCI.name,
					datatype:'string',
					width: '70px',
					filterable: false,
					formatter: function(value, rowIndex){
						return obwNaleznosci.naleznoscStatusFormatter(value);
					}
				},
				{
					name: 'Menu',
					width: '80px',
					filterable: false,
					sortable: false,
					formatter: function(value, rowIndex){
						return obwNaleznosci.getMenuItems(rowIndex);
					}
				},
				getCheckboxColumn("Wybór", "45px", "obwGridNaleznosciId")
			
			]
		};
	};
	
	
	this.naleznoscStatusFormatter = function(value)
	{
		if(value=='zlecona')
			return "Zlecono wpłatę";
		else if(value=='nalezna')
			return "Należna";
		else if(value=='oplacona')
			return "Opłacona";
	}
	
	/**
	 * Funkcja odpowiedzialna za wywołanie dialogu zawierającego formularz ze szczegółami o należności
	 */
	this.pokazSzczegoly = function()
	{
		var fullId = obwGridNaleznosciId.getSelectedRecord();
		if(fullId!=null)
		{
			dialogNaleznosc = new obw.widget.platnosci.dialog.obwDaneNaleznosciDialog();
			dialogNaleznosc.setId(obwGridNaleznosciId.getSelectedRecord()["id.fullId"]);
			dialogNaleznosc.show();
		}		
	};
		
	
	/**
	 * Zwraca pozycje menu dla listy należności
	 */
	this.getMenuItems = function(rowIndex)
	{
		return  obwUtils.getMenuLink('Szczegóły', 'obwListaNaleznosciCrudButtonPanel._onRClick()');
	};
	
	
	/**
	 * Zwraca strukturę listy należności i wpłat
	 */
	this.getColumnsForListaNaleznosciWplata = function()
	{
		var actionStructure = getStructureFromAction("obw/naleznosci/getStructure.npi");
		return {
			cells: [
				{
					field: actionStructure.ID.field,
					hidden: true
				}, {
					field: actionStructure.TYP_DOKUMENTU.field,
					name: actionStructure.TYP_DOKUMENTU.name,
					width: 'auto'
				}, {
					field: actionStructure.TYTUL.field,
					name: actionStructure.TYTUL.name,
					width: 'auto'
				}, {
					field: actionStructure.KWOTA_NALEZNOSCI.field,
					name: actionStructure.KWOTA_NALEZNOSCI.name,
					width: '70px'
				}
			]
		};
	};
	
	
	/**
	 * Funkcja odpowiedzialna za wyświetlenie panelu z wyborem banku
	 */
	this.showZlecWplate = function()
	{
		// dojo.style(obwListaNaleznosciButtonZlec.domNode, {
		// visibility: ( 'visible' ),//: 'visible'
		// display: ( 'inline-block' )//: 'block'
		// });
		// dojo.style(obwListaNaleznosciButtonZamknij.domNode, {
		// visibility: ( 'hidden' ),//: 'visible'
		// display: ( 'inline-block' )//: 'block' 'none'
		// });
		obwListaNaleznosciPrint.set("style", "display: block");
		// obwListaNaleznosciPanelsContainer.forward();
		obwListaNaleznosciCrudButtonPanel._onRClick();		
	};
	
	
	/**
	 * Funkcja odpowiedzialna za powrót do szczegółów należności
	 */
	this.showZamknij = function()
	{
		// dojo.style(obwListaNaleznosciButtonZlec.domNode, {
		// visibility: ( 'hidden' ),//: 'visible'
		// display: ( 'none' )//: 'block'
		// });
		// dojo.style(obwListaNaleznosciButtonZamknij.domNode, {
		// visibility: ( 'visible' ),//: 'visible'
		// display: ( 'inline-block' )//: 'block' //: 'none' //inline-block
		// });
		obwListaNaleznosciPrint.set("style", "display: none;");
		obwListaNaleznosciPanelsContainer.back();
	};
	
	
	/**
	 * Akcja klawisza generuj wpłatę
	 */
	this.generujWplate = function()
	{
		var liczba_wybranych = obwGridNaleznosciId.getMultiSelectionSelectedRecordsCount();
		if(obwGridNaleznosciId.getMultiSelectionSelectedRecordsCount()>0)
		{
			obwUtils.log("liczba: "+obwGridNaleznosciId.getMultiSelectionSelectedRecordsCount());
			confirm(
				{
					title: "Generacja wpłaty", 				
					content: "Czy chcesz utworzyć wpłatę obejmującą wybrane należności? Liczba wybranych należności: " + liczba_wybranych + '.',
					dialogHeight : '180px',
					dialogWidth : '450px',
					onOkClick: function() {
						obwGridNaleznosciId.sendSelectedIdsToAction('obw/naleznosci/generujWplate.npi', obwNaleznosci.stworzWplateOnResp);					
					}
				});
		} else if(obwGridNaleznosciId.getSelectedRecord()!=null){
			obwUtils.log('=0');
			confirm(
					{
						title: "Generacja wpłaty", 				
						content: "Czy chcesz wygenerować wpłatę dla wybranej należności?",
						dialogHeight : '180px',
						dialogWidth : '450px',
						onOkClick: function() {
							obwUtils.invokeAction(obwGridNaleznosciId.getSelectedRecord()["id.fullId"], 'obw/naleznosci/generujWplate.npi', obwNaleznosci.stworzWplateOnResp);
						}
					});
		} else	{
			alert("Nie wybrano żadnej należności.");
		}
	};
	
	
	
	this.stworzWplateOnResp = function (resp)
	{
		komunikat= resp["komunikat"];
		if (komunikat!=null)	{
			var dialog = new obw.widget.platnosci.dialog.obwSoftErrorDialog();
			if (dialog && dialog.setArgs && dialog.show) {
				dialog.setArgs(komunikat);
				dialog.show();
			}
//			showDialog(new obw.widget.platnosci.dialog.obwSoftErrorDialog());
			return;
		}
		
		var wplataFullId = resp["wplataId"].fullId;
		obwUtils.log(resp["wplataId"].fullId);
		
		obwGridNaleznosciId.reload();
		obwNaleznosci.przekierujNaWplate(wplataFullId);
	}
	
	/**
	 *
	 */
	this.przekierujNaWplate = function(wplataFullId)
	{
		obwUtils.log("Wplata id="+wplataFullId);
		if(wplataFullId!=null)
		{
			confirm(
					{
						title: "Przekierowanie do szczegółów wpłaty", 				
						content: "Wpłata została wygenerowana dla wybranej/wybranych należności. Czy chcesz przejść do szczegółów wpłaty?",
						dialogHeight : '180px',
						dialogWidth : '450px',
						onOkClick: function() {
							obwNaleznosci.przejdzDoWplaty(wplataFullId)							
						}
					});
		}
	}
	/**
	 * Funkcja przekierowująca na formatkę wpłaty do szczegółów wpłaty która została właśnie stworzona dla wybranych należności
	 */
	this.przejdzDoWplaty = function(wplataFullId)
	{
		//obwUtils.log("przejdzDoWplaty");
		var contentVar = {
				'id.fullId': wplataFullId			
			};
		var args = {
			url: 'obw/naleznosci/przejdzDoWplaty.npi',
			content: contentVar,
			handleAs: "json",
			load: function(resp){
				if(resp!=null && resp["komunikat"]!=null){
					komunikat= resp["komunikat"];
					if (komunikat!=null)	{
						alert(komunikat);
						return;
					}
				}
				dojo.hash("PLA0011");
			}
		}
		dojo.xhrPost(args);
	}
	/**
	 * Funcjac przekierowująca na formatke wpłaty ze szczegółów należności,
	 * wywołuje akcję która ustawia parametry w sesji dla listy wpłat
	 */
	this.przejdzDoPojedynczejWplaty = function(){
		var wplataFullId = obwNaleznosci.wplataCustomFiltrId;
		if(wplataFullId==null){
			alert("Należność nie posiada wpłaty");
			return;
		}
		obwWplaty.wywolaniePojedynczej = true;
		obwWplaty.wplataCustomFilterId = wplataFullId;
		dojo.hash("PLA0011");
	}
	
	/**
	 * Funkcja odpowiedzialna za generację wplaty dla wybranej należności
	 */
	this.invokeGenerujWplate = function(fullId)
	{		
		obwUtils.invokeSingleMultiGridAction(fullId, 'Generuj', 'Chcesz wygenerować wpłatę dla wybranej należności?',
				'Chcesz wygenerować wpłatę dla wybranej należności?','Chcesz wygenerować wpłatę dla wybranych należności? Liczba wybranych należności:',
				'obw/naleznosci/generujWplate.npi', getGridObject());
//		obwUtils.invokeSingleMultiGridAction(fullId, 'Generuj', 'Chcesz wygenerować wpłatę dla wybranej należności?',
//				'Chcesz wygenerować wpłatę dla wybranej należności?','Chcesz wygenerować wpłatę dla wybranych należności? Liczba wybranych należności:',
//				'obw/naleznosci/generujWplate.npi', getGridObject(),false,obwListaNaleznosciCrudButtonPanel._onRClick);//, false, obwNaleznosci.showZlecWplate, function(){ });		
	};
	
	
	/**
	 * Zwraca ID grida
	 */
	var getGridObject = function()
	{
		return obwGridNaleznosciId;
	};

	
	/**
	 * Funkcja odpowiedzialna za obsługę klawisza szczegóły dla listy należności
	 */
	this.menuSzczegolyNaleznosci = function()
	{
		var wybranaNaleznosc = obwGridNaleznosciId.getSelectedRecord()["id.fullId"];
		if (wybranaNaleznosc != null)
		{
			obwUtils.invokeAction(wybranaNaleznosc, 'obw/naleznosci/obwDaneNaleznosci.npi',
					function(responseObject)
					{
						formDaneNaleznosci.attr("value", responseObject);
					}
			);
			naleznosciWizard.selectChild(szczegolyNaleznosciContentPane);
		}
		else
		{
			alert("Nie wybrano należności!");
		}
	};	
	
	
	/**
	 * Funkcja odpowiedzialna za obsługę klawisza wybór banku dla listy należności
	 */
	this.menuWyborBanku = function()
	{
		naleznosciWizard.selectChild(wyborBankuContentPane);
	};
	
	
	/**
	 * Funkcja odpowiedzialna za powrót do menu listy należności
	 */
	this.powrotDoListyNaleznosci = function()
	{
		naleznosciWizard.selectChild(listaNaleznosciContentPane);
	};	
	
	
	/**
	 * Funkcja odpowiedzialna za dezaktywację przycisków grida listy należności
	 */
	this.dezaktywujKlawiszeListyNaleznosci = function()
	{
		obwGridNaleznosciId.deselectAll();
	};

	
	/**
	 * Funkcja odpowiedzialna za aktywację przycisków grida listy należności
	 */
	this.aktywujKlawiszeListyNaleznosci = function()
	{
		dojo.connect(obwGridNaleznosciId, "onSelected", function(){

			if(obwGridNaleznosciId.getSelectedRecord() != null)
			{
				//przegladajNaleznoscButton.set('disabled', false);
				//wyborBankuButton.set('disabled', false);
			}
			else
			{
				//przegladajNaleznoscButton.set('disabled', true);
				//wyborBankuButton.set('disabled', true);			
			}
		});
		var currentRecord = obwGridNaleznosciId.getRecordForIndex(0);
		if(currentRecord==null) return;
		obwGridNaleznosciId.selectByItemIndex(0);	
		obwListaNaleznosciCrudButtonPanel.RButton.focus();
	};
	
	/**
	 * Funkcja odpowiedzialna za utworzenie listy należności na formatce szczegółów wpłaty
	 */
	this.utworzListeNaleznosci = function(daneNaleznosci, idElementu)
	{	
		if(daneNaleznosci != null && daneNaleznosci.length > 0)
			new dijit.layout.ContentPane({content:''}).placeAt(dijit.byId(idElementu).domNode, 'only');
		else
			new dijit.layout.ContentPane({content:'<i>Brak należności</i>'}).placeAt(dijit.byId(idElementu).domNode, 'only');
		
		dojo.forEach(daneNaleznosci, function(entry, i)
		{
			new dijit.layout.ContentPane({
            	content: obwNaleznosci.getNaleznoscItem(++i, entry)
        	}).placeAt(dijit.byId(idElementu).domNode, 'last');
		});	
	};
	
	/**
	 * Funkcja odpowiedzialna za pobranie pozycji dla listy należności dla danej wpłaty
	 */
	this.getNaleznoscItem =  function(i, entry)
	{
		var naleznoscItem = i + ': ' + entry["tytulNaleznosci"]+ '&nbsp;'+
        obwUtils.getMenuLink('Szczegóły', 'obwNaleznosci.pobierzNaleznosc(\''+ entry["id"]["fullId"]+'\');');
		return naleznoscItem;
	};
	
	this.onLdpNaleznoscDialogOnShow = function()
	{
		
	};
	
	this.onLdpNaleznoscDialogOnHide = function()
	{
		
	};
	
	this.sprawdzWplateDlaNaleznosci = function()
	{

		var rec = obwGridNaleznosciId.getSelectedRecord();	
		//obwUtils.log("Sprawdzanie",rec);
		if(rec!=null){
			//obwUtils.log("Status ",rec['statusNaleznosci'])
			if(rec['statusNaleznosci']=='zlecona' || rec['statusNaleznosci']=='oplacona')
			{
				//obwUtils.log("Sprawdzanie false");
				return false;
			}
		}
		//obwUtils.log("Sprawdzanie true");
		return true;
	}
	
	this.obwLdrNaleznoscFormPanelOnLoad = function(id,data)
	{
		//obwUtils.log(data);
		if(data['wplataWskazanie'] && data['wplataWskazanie']['id']){
			obwNaleznosci.wplataCustomFiltrId=data['wplataWskazanie']['id']['idOb'];
		}
		obwListaNaleznosciCrudButtonPanel.CloseButton.focus();
	}
	
	/**
	 * Funkcja odpowiedzialna za pobranie elementu listy należności dla formatki szczegółów wpłaty
	 */
	this.pobierzNaleznosc = function(id) {
		dialogNaleznosc = new obw.widget.platnosci.dialog.obwDaneNaleznosciDialog();
		dialogNaleznosc.setId(id);
		dialogNaleznosc.show();		
	}	
	
	this.swiadczeniobiorcaFormatter = function(value)
	{
		return value["nazwaTypuRoli"]+" "+value["nazwaPodmiotu"];
	}
	
	this.getCustomFilter = function()
	{
		var selectedValue = dijit.byId('naleznosciStateFilterId').attr('value');
        return {
            status: {
                value: selectedValue,
                datatype: "string"
            }
        };
	}
}
var obwNaleznosci = new ObwNaleznosci();
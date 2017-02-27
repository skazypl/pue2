dojo.require("obw.widget.obwBaseWidget");
dojo.require("obw.widget.platnosci.dialog.obwDaneWplatyDialog");
dojo.require("obw.widget.platnosci.dialog.obwDaneNaleznosciDialog");
	
	
function ObwWplaty()
{
	/** Flaga warunkująca czy ma zostać sprawdzony kontekst wywołania listy wpłat **/
	this.sprawdzKontekst = true;
	/** Id wpłaty, która ma zostać zaznaczona */
	//this.idWplatyDoZaznacznia = null;
	/** Flaga określająca czy ma zostać wykonane przeładowanie i zaznnaczenie dokumentu */
	this.czyZaznaczycWplate = false;
	/** Indeks domyślnej kolumny sortowania na liście wpłat **/
	this.domyslnaKolumnaSortowania = 6;
	
	this.wplataCustomFilterId = null;
	
	//this.wplataId = null;
	
	this.wywolaniePojedynczej = false;
	
	/**
	 * Zwraca strukturę listy wpłat
	 */
	this.getStructure = function(){
		var actionStructure = getStructureFromAction("obw/wplaty/getStructure.npi");

		var currencyFormatter = new CurrencyFormatter(null, CurrencyFormatter.INPUT_CURRENCY_ENUM.PLN, CurrencyFormatter.PRESENTATION_FORMAT_ENUM.PLN_ONLY);

		return {
			cells: [
				{
					field: actionStructure.ID.field,
					hidden: true
				},{
					field: actionStructure.POTWIERDZONA_WPLATY.field,
					hidden: true
				},{
					field: actionStructure.NUMER_ZLECENIA.field,
					hidden: true
				}, {
					field: actionStructure.TYTUL_WPLATY.field,
					name: actionStructure.TYTUL_WPLATY.name,
					datatype:'string',
					width: 'auto'
				}, {
					field: actionStructure.KWOTA_WPLATY.field,
					name: actionStructure.KWOTA_WPLATY.name,
					datatype:'number',
					formatter: currencyFormatter,
					width: '100px',
					headerStyles: "text-align:center;",
					styles: "text-align:right;"
				},{
					field: actionStructure.DATA_UTWORZENIA.field,
					name: actionStructure.DATA_UTWORZENIA.name,
					datatype:'date',
					width: '120px',
					formatter: function(val) {
						return gridDateTimeFormatter(val);
					}
				}, {
					field: actionStructure.DATA_WPLATY.field,
					name: actionStructure.DATA_WPLATY.name,
					datatype:'date',
					width: '120px',
					formatter: function(value,rowIndex) {
						return dataWplatyFormatter(value,rowIndex);
					}
				}, {
					name: 'Menu',
					width: '80px',
					filterable: false,
					sortable: false,
					formatter: function(value, rowIndex){
						return obwWplaty.getMenuItems(rowIndex);
					}
				}
				
			]
		};
	};	
	
	
	/**
	 * Funkcja odpowiedzialna za wywołanie dialogu zawierającego formularz z danymi o szczegółach wpłaty
	 */
	this.pokazSzczegolyWplaty = function()
	{
		var fullId = dijit.byId('gridWplatId').getSelectedRecord();
		if(fullId != null)
		{
			dialogWplata = new obw.widget.platnosci.dialog.obwDaneWplatyDialog();
			dialogWplata.setId(obwListaWplat.getSelectedRecord()["id.fullId"]);
			dialogWplata.show();
		}
	};
	
	
	/**
	 * Funkcja ustawia wysokość kontrolki z listą banków
	 */
	this.setBankChooserHeight = function()
	{
        var height = 130;
        var bankiPanelHeight = 180;
        var liczbaBankow = _self.liczbaBankow;
        //dodana wysokosc = liczba dodatkowych wierszy * wysokosc wiersza
        var addHeight = Math.floor((liczbaBankow - 1) / _self.liczbaKolumn)*75;
        //ustawienie wysokosci kontrolki WyborBankuChooser
        _self.setAttribute("style", "width: 100%; height: "+(height+addHeight)+"px;");
        //zmiana wielkosci dialogu
        var bankiPanel = dijit.byId('obwWplatyPanelBankiId');
		if (bankiPanel) {
			bankiPanel.resize({w : 480, h : (bankiPanelHeight+addHeight)});
		}
	};
	
	/**
	 * Funkcja wywołuje w zależności od statusu wpłaty akcję przy kliknięciu na Szczegóły z menu kontekstowego
	 */
	this.szczegolyWplatyListWplat = function(rowIndex)
	{
		var rec = obwListaWplat.getRecordForIndex(rowIndex);
		if(rec['czyPotwierdzona']==true)
			obwListaWplatCrudButtonPanel._onRClick();
		else
			obwListaWplatCrudButtonPanel._onUClick();
	}


	/**
	 * Funkcja odpowiedzialna za wywołanie dialogu zawierającego formularz z danymi o szczegółach należności
	 */
	this.pokazSzczegolyNaleznosci = function()
	{
		var fullId = dijit.byId('gridWplatId').getSelectedRecord();
		if(fullId != null)
		{
			dialogNaleznosc = new obw.widget.platnosci.dialog.obwDaneNaleznosciDialog();
			dialogNaleznosc.setId(obwListaWplat.getSelectedRecord()["id.fullId"]);
			dialogNaleznosc.show();
		}
	};
	
	
	/**
	 *
	 */
	this.pobierzWplate = function()
	{
		dojo.style(wykonajWplateButton.domNode, {
			  visibility: ( 'hidden' ),// : 'visible'
			  display: ( 'none' )// : 'block'
			});
		// obwSzczegolyNaleznosciButtonPanelEdit.hide();
		naleznosciSzczegolyDialog.show();
	};

	
	/**
	 * Funkcja odpowiedzialna za potwierdzenie wpłaty
	 */
	this.potwierdzWplate = function()
	{
		var fullId = obwListaWplat.getSelectedRecord()["id.fullId"];
		if(fullId != null)
		{
	
			obwUtils.invokeGridAction(fullId, 'Potwierdzenie wpłaty', 'Chcesz zmienić status wpłaty na potwierdzoną z pominięciem systemu bankowego?', 'obw/wplaty/potwierdzWplate.npi', obwListaWplat, true);
		}
	};
	
	/**
	 * Zwraca pozycje menu dla listy wpłat
	 */
	this.getMenuItems = function(rowIndex)
	{
		var links = obwUtils.getMenuLink('Szczegóły', 'obwWplaty.szczegolyWplatyListWplat('+rowIndex+')');
		return links;
	};
	
	/**
	 * Zwraca listę należności dla danej wpłaty
	 */
	this.utworzListeNaleznosciDlaWplaty = function(data)
	{
		if(data != null)
		{
			dijit.byId('obwWplatyListaNaleznosciId').attr('content', '');
			var daneNaleznosci = data["naleznoscDanePelne"];
			obwNaleznosci.utworzListeNaleznosci(daneNaleznosci, "obwWplatyListaNaleznosciId");
		}
	};
	/**
	 * Formater danych swiadczeniobiorcy do szczegółów wpłaty
	 */
	this.swiadczeniobiorcaFormatter = function(value)
	{
		return value["nazwaTypuRoli"]+" "+value["nazwaPodmiotu"];
	}
	/**
	 * Formater danych kolumny potwierdzona do listy wpłat
	 */
	this.potwierdzonaFormatter = function(value)
	{
		if(value == true){
			return 'potwierdzona';
		} else{
			return 'nie potwierdzona';
		}
	};
	
	this.dataPotwierdzeniaPanelFormatter = function(value)
	{
		if(value.dataWplaty==null){
			if(value.nrZlecenia<2){
				return "[wpłata nie została jeszcze przekazana do systemu bankowego]";
			}
			else{
				return "[wpłata nie potwierdzona, ale zostało wywołane już przekierowanie do systemu bankowego]";
			}
		}
		else
			return gridDateTimeFormatter(value.dataWplaty);
	}
	/**
	 * Metoda ustawiająca szczegóły wpłaty przy wyświetleniu szczegółów
	 */
	this.onSzczegolyWplatyShow = function(idArg, data, mode)
	{
		obwWplaty.utworzListeNaleznosciDlaWplaty(data);
		obwWplaty.setVisibilityBankiPanel(data["wplataDanePelne"]["czyPotwierdzona"]);
		dijit.byId("wyborBankuChooserId").pobierzDaneBankow();
		obwWplataZusnpiFormPanel.cancelButton.focus();
	};
	/**
	 * Metoda ustawia widoczność panelu z wyborem banku w zależności od statusu wpłaty -
	 * dla wpłaty niepotwierdzonej panel jest dostępny, dla potwierdzonej nie jest dostępny
	 */
	this.setVisibilityBankiPanel = function(isPotwierdzonaWplata)
	{
		dijit.byId("wyborBankuChooserId").set('disabled', isPotwierdzonaWplata);
	};
	/**
	 * Metoda przekazująca do serwera dane wpłaty id wpłaty i numer banku. Dla tych danych na serwerze jest generowany url do banku
	 * i xml z danymi wpłaty do przekazania do banku
	 */
	this.wykonajPlatnosc = function(fullId)
	{
		var wybranyBank = dijit.byId("wyborBankuChooserId").get('wybranyBank');
		if(wybranyBank!=null){
			var numerBanku=wybranyBank.idBanku;
			var contentVar = {
					'id.fullId' :wplataDanePelneId.value,
					'numerBanku' : numerBanku
			};
			obwUtils.invokeSimpleAction(contentVar, 'obw/wplaty/wykonajPlatnosc.npi', function(resp){
				var rec = obwListaWplat.getSelectedRecord();
				if(resp['podpisanyXml']!=null)
				{
					obwWplaty.przejdzDoBanku(resp['bankUrl'],resp['podpisanyXml']);
				} else if(resp['potwierdzona']) {
					alert('Wpłata została przekazana do systemu bankowego i zostało już odebrane potwierdzenie realizacji.');
				}		
				obwListaWplat.reload();
				obwWplaty.pobierzPonownieDaneWplaty(rec);
			});
		}
	};
	
	this.pobierzPonownieDaneWplaty = function(rec)
	{
		if(typeof rec == 'undefined') return;
		if(rec === null) return;
		
		if(rec["id.fullId"] != null)
		{
			var contentVar = {
				'id.fullId' : rec["id.fullId"]
			};
			var args = {
				url : 'obw/wplaty/load.npi',
				content : contentVar,
				handleAs : "json",
				load : function(resp)
				{
					if(resp){
						dataPotwierdzeniaJsId.set('formattedValue', obwWplaty.dataPotwierdzeniaPanelFormatter(resp.wplataDanePelne));
						czyPotwierdzonaJsId.set('formattedValue',obwWplaty.potwierdzonaFormatter(resp.wplataDanePelne.czyPotwierdzona) );
						dataZleceniaId.set('formattedValue', resp.wplataDanePelne.dataZlecenia );
						obwWplaty.setVisibilityBankiPanel(resp["wplataDanePelne"]["czyPotwierdzona"]);
					}
				}
			}
					
			dojo.xhrPost(args);
		}
	};
	/**
	 * Metoda wywołująca stronę wybranego banku w nowym oknie, metodą post i przekazująca xml'a z danymi wpłaty
	 */
	this.przejdzDoBanku = function(url,dane) {
		  var myForm = document.createElement("form");
		  myForm.method="post" ;
		  myForm.action = url ;
		  myForm.target = "strBank";
	      myForm.appendChild(stworzInput("dane","data",dane)) ; // zgodnie z ustaleniemi z bamkiem pole w żądaniu ma nazwę data, a nie dane
		  document.body.appendChild(myForm) ;
	      var newWindow = window.open('', 'strBank','width=1300,height=700,menubar=no,toolbar=no,location=no,scrollbars=yes,resizable=yes,status=no');
		  myForm.submit() ;
		  document.body.removeChild(myForm);
		//window.open('obw/wplaty/przekierujBank.npi?url=' + url + '&data=' + dane, "_new");
	};
		
	var stworzInput = function(id,name,value)
	{
	      var input = document.createElement("input");
	      input.setAttribute("id",id);
	      input.setAttribute("name",name);
	      input.setAttribute("value",value);
	      input.setAttribute("type","hidden");
	      return input;
	};
		
	this.onWczytanieListy = function()
	{
		obwWplaty.sprawdzKontekst=true;
	}
	/**
	 * Metoda podpięta na zdarzeniu userDefinedPreLoad na liście. Sprawdza za pierwszym razem kontekst wywołania
	 * formatki i jeśli jest ono z listy należności to ustawia sortowanie po dacie utworzenia wpłaty
	 */
	this.ustawSortowanie = function()
	{	
		obwUtils.log('ustawSortowanie: '+ obwWplaty.sprawdzKontekst);
		if(obwWplaty.sprawdzKontekst==true)
		{
			dojo.style( dojo.byId('obwListaWplatKomunikatZawezone'), {display:'none'});
			obwUtils.log('sprawdzKontekst');
			obwWplaty.sprawdzKontekst = false;
			obwUtils.invokeSimpleAction(null, 'obw/wplaty/sprawdzKontekstWywolania.npi', function(resp){
				if(resp!=null)
				{
					var fullId = resp['wplataId'];
					var wywolanie = resp['wywolanie'];
					obwUtils.log("Wywolanie i full id "+fullId+" "+wywolanie,fullId.idOb);
					if(wywolanie){
						if(fullId){
							obwWplaty.ustawSelekcjeNaLiscie(fullId.idOb);
						}
					}
				} 				
			});
			if(obwWplaty.wywolaniePojedynczej){
				obwUtils.log("Wywolanie pojedynczej",obwWplaty.wplataCustomFilterId);
				dojo.style( dojo.byId('obwListaWplatKomunikatZawezone'), {display:'block'});
				if(obwWplaty.wplataCustomFilterId!=null){
					obwWplaty.wywolaniePojedynczej=false;
					obwWplaty.ustawSelekcjeNaLiscie(obwWplaty.wplataCustomFilterId);
					obwListaWplatZawezoneId.value = obwWplaty.wplataCustomFilterId;
				}
			}
		}		
	};
	
	this.pokazWszystkie = function(){
//		obwUtils.log("Wywolanie pokaz wszystkie "+obwWplaty.wywolaniePojedynczej+" "+obwListaWplatZawezoneId.value+" "+obwWplaty.wplataCustomFilterId);
		obwListaWplatZawezoneId.value = null;
		//obwWplaty.wplataCustomFilterId = null;
//		obwWplaty.wywolaniePojedynczej = false;
//		obwUtils.log("Przed reload "+obwWplaty.wywolaniePojedynczej+" "+obwListaWplatZawezoneId.value+" "+obwWplaty.wplataCustomFilterId);
		//obwListaWplat.customFilterControlId = null;
		obwListaWplat.reload();
		dojo.style( dojo.byId('obwListaWplatKomunikatZawezone'), {display:'none'});
		obwWplatyGridContainerId.resize();
	}
	/**
	 *  Metoda podpięta pod zdarzenie userDefinedPostLoad listy wpłat.
	 *  Jeśli jest ustawiona flaga czyZaznaczycWplate to zaznacza na gridzie wpłat ostatnio
	 *  dodaną wpłatę (następuje sortowanie po dacie utworzenia i następnie wyszukuiwana jest wśród widocznych pozycji wpłata
	 *  o id = idWplatyDoZaznaczenia.
	 */
	this.zaznaczRekordPoPrzeladowaniu = function()
	{
		obwUtils.log("zaznaczRekordPoPrzeladowaniu "+obwWplaty.czyZaznaczycWplate);

		var currentRecordWplata = obwListaWplat.getRecordForIndex(0);
		if(currentRecordWplata==null) return;
		obwListaWplat.selectByItemIndex(0);	
		obwListaWplatCrudButtonPanel.UButton.focus();
		
		if(!obwWplaty.czyZaznaczycWplate)
			return;
		
		obwWplaty.czyZaznaczycWplate = false;		
		
		var i =0;
		//sprawdź wszystkie możliwie widoczne rekordy w kolejności od najbardziej prawdopodobnego
		while(i<100)
		{
			var currentRecord = getGridObject().getRecordForIndex(i);
			//jak się skończy lista to przerwij
			if(currentRecord==null) return;
						
			var currentIdOb = obwUtils.getIdFromFullId(currentRecord['id.fullId']);
			obwUtils.log("zaznaczRekordPoPrzeladowaniu - sprawdzam: "+currentIdOb +" " + obwWplaty.idWplatyDoZaznaczenia);
			//idOb rekordu o indeksie i zgadza się z idOb szukanego obiektu
			if(currentIdOb == obwWplaty.idWplatyDoZaznaczenia)
			{
				getGridObject().selectByItemIndex(i);	
				obwUtils.log("zaznaczRekordPoPrzeladowaniu - zaznaczam: index=" + i + " fullId=" + currentRecord['id.fullId']);
				obwListaWplatCrudButtonPanel._onUClick();
				return;
			}
			i++;
		}
		obwUtils.log("zaznaczRecord- nie znaleznion rekordu: ", this.idDokumentuDoZaznaczenia);
	};
	/**
	 * Rozpoczyna ścieżkę ustawienia zaznaczenia na nowododanym rekordzie
	 */
	this.ustawSelekcjeNaLiscie = function(idWplaty)
	{
		obwWplaty.idWplatyDoZaznaczenia = idWplaty;
		if(obwWplaty==null)
		{
			return;
		}
		//ustaw flagę zaznaczenia rekordu
		obwWplaty.czyZaznaczycWplate = true;
		//wyczyść filtry i posortuj wpłaty po dacie utworzenia
		getGridObject().clearGridFilter();	
		getGridObject().setSortIndex(obwWplaty.domyslnaKolumnaSortowania, false);	
		getGridObject().update();
		obwUtils.log("ustawSelekcjeNaLiscie: wyczyść filtry i posortuj wpłaty po dacie utworzenia"+obwWplaty.czyZaznaczycDokument);
		
	};
	
	this.getCustomFilter = function()
	{
//		obwUtils.log("Zwrocenie custom filtra ",obwListaWplatZawezoneId.value);
		var filterValue = obwListaWplatZawezoneId.value;
		if(filterValue=="" || filterValue==null)
		{
		    return {};
	    }
        return {
            Id: {
                value: filterValue,
                datatype: "number"
            }
        };
	}
	var dataWplatyFormatter = function(value, rowIndex)
	{
		//obwUtils.log("Formatowanie daty "+value+" "+rowIndex);
		if(value==null){
			var rec = getGridObject().getRecordForIndex(rowIndex);
			//obwUtils.log("Numer zlecenia "+rec["nrZlecenia"]);
			if(rec["nrZlecenia"]<2){
				return "<I>[nieprzekazana]</I>";
			}
			else{
				return "<I>[niepotwierdzona]</I>";
			}
		}
		else
			return gridDateTimeFormatter(value);
	};
	
	/**
	 * Zwraca obiekt listy wpłat
	 */
	var getGridObject = function()
	{
		return obwListaWplat;
	};
	
}

var obwWplaty = new ObwWplaty();
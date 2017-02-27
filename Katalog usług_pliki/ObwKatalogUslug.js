dojo.require("dojo.hash");

function ObwKatalogUslug(){
	
	this.uslugaCustomFiltrSingleId = null;
	this.zaznaczUsluge = false;
	var dictNPI = null;
	var dictCIT = null;
	var isCit = null;
	var handlerOnChange = null;
	/**
	 * Zwraca strukturę listy usług katalogu
	 */
	this.getStructure = function ()
	{
		obwKatalogUslug.initializeDict();
		var actionStructure = getStructureFromAction("obw/uslugi/getStructure.npi");
		return {
			cells: [
				{
					field: actionStructure.ID.field,
					hidden: true
				}, {
					field: actionStructure.NAZWA_USLUGI.field,
					name: actionStructure.NAZWA_USLUGI.name,
					datatype:'string',
					width: 'auto',
					formatter: function(value,rowIndex) {
						return nazwaUslugiFormatter(value,rowIndex);
					}
				}, {
					field: actionStructure.KOD_USLUGI.field,
					name: actionStructure.KOD_USLUGI.name,
					datatype:'string',
					width: 'auto',
					hidden: true
				}, {					
					field: actionStructure.POZIOM_BEZPIECZENSTWA.field,
					hidden: true
				}, {					
					field: actionStructure.POZIOM_BEZPIECZENSTWA_CIT.field,
					hidden: true
				},   {					
					field: actionStructure.CZY_PLATNA.field,
					hidden: true
				},				
				// {
				// field: actionStructure.KANAL_DOSTEPU.field,
				// name: actionStructure.KANAL_DOSTEPU.name,
				// datatype:'string',
				// width: '100px',
				// },
				{
					name: 'Menu',
					width: '130px',
					filterable: false,
					sortable: false,
					formatter: function(val,rowIndex) {
						return obwKatalogUslug.getMenuLinks(rowIndex);
					}
				}
			]
		};	
	};
	
	var nazwaUslugiFormatter = function(value, rowIndex)
	{
		if(rowIndex!=null)
		{
			var rec = getGridObject().getRecordForIndex(rowIndex);
			obwUtils.log("",rec);
			if(rec!=null)
			{
				var systemowa = rec["jestSystemowa"];
				if(systemowa)
					return value;
				else
				{
					return rec["opis"];
				}
			}
		}
		return value;
	};
	
	this.wypelnijRodzajeUslug = function()
	{
		if(!rodzajSzukanejUslugi.isLoaded()){
			rodzajSzukanejUslugi.setStore(new dojo.data.ItemFileWriteStore({data : {"items":[{"id":"WSZYSTKIE","label":"Wszystkie"},
		                 		                                                     {"id":"SYSTEMOWE","label":"Systemowe"},
		                		                                                     {"id":"DOWYSLANIA","label":"Złożenia dokumentu"}],
		                		                                           "label":"label","identifier":"id"}}));
		}
	}
	
	this.initializeDict = function(){
		if(obwKatalogUslug.dict == null){
			var args = {
				url: 'obw/uslugi/getPoziomBezpieczenstwaDesc.npi',
				handleAs: "json",
				load: function(resp){
					obwKatalogUslug.dictNPI = resp["dictNPI"];
					obwKatalogUslug.dictCIT = resp["dictCIT"];
					obwKatalogUslug.isCit = resp["isCit"];
				}
			};
			dojo.xhrPost(args);	
		}
	};
	
	/**
	 * Zwraca pozycje menu dla listy usług
	 */
	this.getMenuLinks = function(rowIndex)
	{
		var rec = dijit.byId("obwKatalogUslugGrid").getRecordForIndex(rowIndex);
		var pozBezpieczenstwa = obwKatalogUslug.isCit ? rec["dostepPUE.poziomBezpCIT"] : rec["dostepPUE.poziomBezpNPI"];
		var fullId = rec["id.fullId"];
		var kod = rec["kod"];
		
		return obwUtils.getMenuLink('Przejdź do usługi', 'obwKatalogUslug.przejdzDoUslugi(\''+fullId+'\', \''+pozBezpieczenstwa+'\', \''+ kod +'\')') + '<br/>'
		+ obwUtils.getMenuLink('Szczegóły', 'obwKatalogUslugCrudButtonPanel._onRClick()');		
	};

	/**
	 * Wyświetla okienko potwierdzenia i przechodzi do wywołania usługi biznesowej
	 */
	this.przejdzDoUslugi = function(fullId, pozBezpieczenstwa, kod){
		
		if(fullId != null)
		{
			var message = "";
			if(pozBezpieczenstwa==null)
			{
				message = "Wysłanie dokumentu nie jest realizowane przez kanał dostępu ";
				if(obwKatalogUslug.isCit)
					message +=" CIT. \n";
				else{
					message +=" NPI. \n";
				}
				message+="Istnieje możliwość utworzenia dokumentu w obszarze roboczym.Czy chcesz kontynuować?";
			}
			else
			{

				message = "Poziom bezpieczeństwa usługi: " + pozBezpieczenstwa+".";

			    if(obwKatalogUslug.isCit){
			    	message = message.replace("usługi", "usługi dla kanału CIT");
			    	if(pozBezpieczenstwa>1){
						message+="\nKonsultant CIT może utworzyć dokument w imieniu użytkownika i zapisać go w jego obszarze dokumentów roboczych. ";
			    	}
			    } else {
			    	if (pozBezpieczenstwa == 1){
			    		message += "\nUsługa dostępna jest tylko dla zalogowanych użytkowników.";
			    	}
					if(pozBezpieczenstwa>1){
						message+="\nAby wykonać wybraną usługę wymagana jest autoryzacja ";
					}
					if(kod=='DOK_ZUS-US-OFE-01' || kod=='DOK_ZUS-US-OFE-02'){
						message+="przy użyciu profilu PUE, profilu zaufanego ePuap lub podpisem kwalifikowanym. ";
					}else{
						if(pozBezpieczenstwa==2){
							message+="przy użyciu profilu zaufanego ePuap lub podpisem kwalifikowanym. ";
						}else if(pozBezpieczenstwa==3){
							message+="podpisem kwalifikowanym. ";
						}
					}
					
					
				}
			
				message+="\nNastąpi przekierowanie do wykonania usługi biznesowej. Na pewno chcesz kontynuować?";
			}
			confirm(
					{
						title: "Przekierowanie do usługi biznesowej", 				
						content: message,
						dialogHeight : '180px',
						dialogWidth : '450px',
						onOkClick: function() {
							obwKatalogUslug.wywolajUsluge(fullId, pozBezpieczenstwa, kod)							
						}
					});
		}
		else
		{
			alert('Nie wybrano usługi do wykonania');
		}
	};
	
/*	this.postLoad = function()
	{
		var rec = dijit.byId("obwKatalogUslugGrid").getSelectedRecord();
		if(!rec["jestPlatna"]){
			dojo.style( dojo.byId('uslugaDanePelneJestOplataPrzedRealizacja').parentNode.parentNode, {display:'none'});
		} else {
			dojo.style( dojo.byId('uslugaDanePelneJestOplataPrzedRealizacja').parentNode.parentNode, {display:''})
		}
		if(!rec["typDokumentuWskazanie.id"] != null){
			dojo.style( dojo.byId('uslugaDanePelneTypDokumentuWskazanie').parentNode.parentNode, {display:'none'});
		} else {
			dojo.style( dojo.byId('uslugaDanePelneTypDokumentuWskazanie').parentNode.parentNode, {display:''});
		}
	};*/
	
	/**
	 * Wywołuje usługę biznesową
	 */
	this.wywolajUsluge = function(fullId, pozBezpieczenstwa, kod)
	{
		var contentVar = {
				'id.fullId': fullId,
				'kod' : kod				
			};
		var args = {
			url: 'obw/uslugi/wywolajUsluge.npi',
			content: contentVar,
			handleAs: "json",
			load: function(resp){
				przekierowanie = resp["przekierowanie"];
				komunikat= resp["komunikat"];
				obszar = resp["obszar"];
				hash = resp["hash"];
				if(przekierowanie) {
					obwKatalogUslug.przekierujDoObszaru(obszar, hash);			
				} else if (komunikat!=null)	{
					alert(komunikat);
				}
			}
		};
		dojo.xhrPost(args);	
	};

	this.przekierujDoObszaru = function(obszar, hash)
	{
		var browserAdres = window.location.href;
		if ("ubezpieczony" == obszar){
			if (browserAdres.indexOf("obszar-ubezpieczonego") > 0){
				dojo.hash(hash);
			}
			else {
				changeRole('UBEZPIECZONY','obszar-ubezpieczonego.npi#'+hash)
			}
		}
		else if ("platnik" == obszar){
			if (browserAdres.indexOf("obszar-platnika") > 0){
				dojo.hash(hash);
			}
			else {
				changeRole('PLATNIK','obszar-platnika.npi#'+hash)
			}
		}
		else if ("ogolny" == obszar){
			dojo.hash(hash);
		}
		else if ("swiadczeniobiorca" == obszar){
			if (browserAdres.indexOf("obszar-swiadczeniobiorcy") > 0){
				dojo.hash(hash);
			}
			else {
				changeRole('SWIADCZENIOBIORCA','obszar-swiadczeniobiorcy.npi#'+hash)
			}
		}
		else if ("komornik" == obszar){
			if (browserAdres.indexOf("obszar-komornika") > 0){
				dojo.hash(hash);
			}
			else {
				changeRole('KOMORNIK','obszar-komornika.npi#'+hash)
			}
		}
		else {
			dojo.hash("OBW0031");
		}				
	};
	
	/**
	 * Szybkie wyszukiwanie w katalogu usług
	 */
	this.search = function()
	{
		var klucz=dijit.byId('obwKatalogUslugSzybkieWyszukiwanieId').get('value');
		var rodzaj = "WSZYSTKIE";
		if(rodzajSzukanejUslugi.isLoaded())
			rodzaj = rodzajSzukanejUslugi.getValue();
		obwUtils.log("Czy systemowa = "+rodzaj);
		return {
			Tekst: {
				value:klucz,
				datatype:'string'
			},
			Rodzaj:{
				value:rodzaj,
				datatype:'string'
			}
		};
	};
	
	/**
	 * Custom filtr do zaweżania listy usług
	 */
	this.searchSingle = function()
	{
		obwUtils.log("custom serach");
		return {
			Id:{
				value:obwKatalogUslugZawezoneId.value,
				datatype:"number"
			}
		};
	};
	
	this.preLoad = function()
	{

		obwUtils.log("Preload");
		if(obwKatalogUslug.uslugaCustomFiltrSingleId!=null)
		{
			obwKatalogUslugZawezoneId.value=obwKatalogUslug.uslugaCustomFiltrSingleId;
			obwKatalogUslug.uslugaCustomFiltrSingleId=null;
			dojo.style( dojo.byId('uslugaCustomStdCustomFiltrPanel'), {display:'none'});
			dojo.style( dojo.byId('czyZawezoneContentPane'), {display:'block'});
			obwKatalogUslugGrid.customFilterControlId="obwKatalogUslugCustomSingleFilterId";
			obwKatalogUslug.zaznaczUsluge=true;
		}
	};
	
	this.postLoad = function()
	{
		var rec = dijit.byId("obwKatalogUslugGrid").getSelectedRecord();
		if(!rec["jestPlatna"]){
			dojo.style( dojo.byId('uslugaDanePelneJestOplataPrzedRealizacja').parentNode.parentNode, {display:'none'});
		} else {
			dojo.style( dojo.byId('uslugaDanePelneJestOplataPrzedRealizacja').parentNode.parentNode, {display:''});
		}
		//dojo.disconnect(this.handlerOnChange);
		obwUtils.log("Postload");
		//obwKatalogUslug.onLoad();
		if (obwKatalogUslugCrudButtonPanel && obwKatalogUslugCrudButtonPanel.RButton)
			obwKatalogUslugCrudButtonPanel.RButton.focus();
		if (obwUslugaZusnpiFormPanel && obwUslugaZusnpiFormPanel.closeButton)
			obwUslugaZusnpiFormPanel.closeButton.focus();
		if(!obwKatalogUslug.zaznaczUsluge)
			return;
		
		obwKatalogUslug.zaznaczUsluge = false;		
		var currentRecord = getGridObject().getRecordForIndex(0);
		if(currentRecord==null) return;
		getGridObject().selectByItemIndex(0);	
		obwKatalogUslugCrudButtonPanel._onRClick();			
	}
	
	/**
	 * Zwraca obiekt listy wpłat
	 */
	var getGridObject = function()
	{
		return obwKatalogUslugGrid;
	};
		
	this.pokazWszystkie = function(){
		obwKatalogUslugZawezoneId.value=null;
		dojo.style( dojo.byId('uslugaCustomStdCustomFiltrPanel'), {display:'block'});
		dojo.style( dojo.byId('czyZawezoneContentPane'), {display:'none'});
		obwKatalogUslugGrid.customFilterControlId="obwKatalogUslugCustomFilterId";
		obwKatalogUslugGrid.reload();
	}
	
	this.booleanFormatter = function(value)
	{
		if(value == true){
			return 'tak';
		} else{
			return 'nie';
		}
	};
	
	this.typyRolFormatter = function(value)
	{
		if(value){
			var newVal = '';
			var rolesList = value.rola;
			for(var i=0;i<rolesList.length;i++){
					newVal = newVal + obwKatalogUslug.decodeRole(rolesList[i]) + ', ';
			}
			if(rolesList.length > 0){
				newVal = newVal.substr(0, newVal.length - 2);
			}
			return newVal;
		}
		return '';
	};
	
	this.decodeRole = function decodeRole(role){
			switch(role){
			 case 'OGOLNA': return 'Ogólna';
			 case 'LEKARZ': return 'Lekarz';
			 case 'SWIADCZENIOBIORCA': return 'Świadczeniobiorca';
			 case 'PLATNIK': return 'Płatnik';
			 case 'UBEZPIECZONY': return 'Ubezpieczony';
			 default: return role;
			}
	};
	
	this.poziomyBezpieczenstwaCITFormatter = function(value){
		if(value){
			return value + ' - ' + obwKatalogUslug.dictCIT[value];
		} else {
			return 'Usługa nie jest realizowana przez ten kanał dostępu.';
		}
	};
	
	this.poziomyBezpieczenstwaNPIFormatter = function(value){
		if(value){
		    if (value == "2" && (getGridObject().getSelectedRecord().kod == "DOK_ZUS-US-OFE-01" || getGridObject().getSelectedRecord().kod == "DOK_ZUS-US-OFE-02"))   {
		       return value + ' - ' + obwKatalogUslug.dictNPI[value] + " lub profilem PUE" ;
		    }
			return value + ' - ' + obwKatalogUslug.dictNPI[value];
		} else {
			return 'Usługa nie jest realizowana przez ten kanał dostępu.';
		}
	};
	
	this.katalogUslugSzybkieWyszukanieKeyPress = function(event){
			var keyCode = event.keyCode ? event.keyCode : event.which;
			if (keyCode == 13){
			dijit.byId('obwKatalogUslugGrid').filterGridWithCustomFilter();
		}
	};

}

var obwKatalogUslug = new ObwKatalogUslug();
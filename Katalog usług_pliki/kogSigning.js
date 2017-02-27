dojo.require("kog.podpis.kogBaseWidget");	
dojo.require("kog.podpis.kogWyborTypuPotwierdzeniaDialog");

function KogSigning() {
	
	this.wyslijDokument = function(){
		console.log("wyslijDokument");
		var args = {
				url 	 : 'obszar-ogolny/weryfikujZFA.npi',
				handleAs : "json",
				load 	 : function(resp)
				{
					if(resp['blad'])
					{
						alert(resp['komunikat']);
						return;
					}
					var zweryfikowany = resp['zweryfikowany'];
					if(zweryfikowany) {
						kogSigning.wyborSposobuPodpisu();
                        kogFormularze.initButtons();
                    }
					else
						alert("Dokument zawiera błędy. Proszę przejść do edycji dokumentu.");										
				}
			};
			dojo.xhrPost(args);
	};
	
	this.wyborSposobuPodpisu = function()
	{
		kogUtils.log("wyborPodpisu");
		dialogWyborTypuPodpisu = new kog.podpis.kogWyborTypuPotwierdzeniaDialog();
		dialogWyborTypuPodpisu.setKontekstWywolania();
		dialogWyborTypuPodpisu.setOnAnulujFunction(kogSigning._anulujPodpisywanie);
		dialogWyborTypuPodpisu.setOnProfilEpuapFunction(kogSigning.potwierdzDokumentPrzezEpuap);
		dialogWyborTypuPodpisu.setOnPodpisCyfrowyFunction(kogSigning._potwierdzPodpisCyfrowy);
		dialogWyborTypuPodpisu.fetch();
	};
	
	this._anulujPodpisywanie = function()
	{
		kogUtils.log('wywołano onAnulujFunction:');		
	};
	
	/**
	 * Wywołuje akcję potwierdzenia wybranego dokumentu przez ePUAP
	 */
	this.potwierdzDokumentPrzezEpuap = function()
	{
		var dialogPotwierdzenia = new zusnpi.dialog.Confirm({
			dialogHeight : '150px',
			dialogWidth  : '460px',
			content : 'Za chwilę nastąpi przekierowanie na platformę ePUAP w celu podpisania wybranego dokumentu swoim profilem zaufanym. Kontynuować?'
		});
		dialogPotwierdzenia.onCancelClick = function(){
				alert("Podpisywanie dokumentu profilem zaufanym ePUAP zostało anulowane.");
		};
		dialogPotwierdzenia.onOkClick = function(){
			var args = {
				url 	 : 'obszar-ogolny/kogPodpiszDokumentPoprzezEPUAP.npi',
				handleAs : "json",
				sync	 : true,
				load 	 : function(resp)
				{
					if(resp['blad']) {
							alert('Błąd połączenia z systemem ePUAP.');
					} else {
						var url = resp['url'];
						if (url != null) {
							window.open(url,'Podpis_przez_EPUAP', 'width=1150,height=600,menubar=no,toolbar=no,location=no,scrollbars=yes,resizable=yes,status=no');
						} else {
							alert('Błąd połączenia z systemem ePUAP.');
						}
					}
				},
				error : function(error, resp) {
					error(error);
				}
			};
			dojo.xhrPost(args);
		};
		dialogPotwierdzenia.setArgs();
		dialogPotwierdzenia.show();
	};
	
	/**
	 * Callback wywoływany przy wyborze sposobu potwierdzenia poprzez podpis
	 * cyfrowy
	 */
	this._potwierdzPodpisCyfrowy = function(){
		kogUtils.log('--- wywołano onPodpisCyfrowyFunction:');
		
		kogSigningComponent.wczytajApplet();
		if(kogSigningComponent != null && kogSigningComponent.isLoaded())
		{
			kogUtils.log('różne od null: '+ kogSigningComponent);
			kogSigningComponent.podpiszDokument();
		}
		else
		{
			alert('Komponent podpisu jeszcze nie załadowany - spróbuj ponownie za pare sekund.');
		}		
	};
}
var kogSigning = new KogSigning();
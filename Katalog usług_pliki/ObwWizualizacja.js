function ObwWizualizacja()
{
	this.kod = null;
	this.url = null;
	this.tytul = null;
	
	this.setVisualisationParams = function()
	{
		
	};

    this.sprawdzCzyZablokowacPrzyciskiWizualizacji = function(actionUrl) {
        var value = obwUtils.getIdFromFullId(wyborTypuWizualizacjiDialogId.displayedValue);
        var args = {
            url: actionUrl,
            content: {
                'kod': wyborTypuWizualizacjiDialogkodTypuDokumentu.attr("value"),
                'wersjaDokumentu': pWersjaTypuDokumentu.attr("value"),
                'wersjaFormularza': pWersjaTypuFormularza.attr("value"),
                'tempIdHolder': value
            },
            sync: true,
            handleAs: 'json',
            load: function(resp) {
                var result = resp.czyDostepnaWizualizacja;
                var pozostale = resp.czyPozostaleWizualizacje;
                przyciskWyswietlaniaWizualizacjiFormularza.setDisabled(!pozostale);
                przyciskWyswietleniaWizualizacjiHtml.setDisabled(!result);
                przyciskWyswietleniaWizualizacjiPdf.setDisabled(!pozostale);
            }
        };
        dojo.xhrPost(args);
    };
}


var obwWizualizacja = new ObwWizualizacja();


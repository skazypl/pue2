var kogSigningUtils = {

	/**
	 * Splash pokazywany podczas wysyłania dokumentów
	 */
	sendActionSplash : new zusnpi.layout.splash.Splashscreen({
		//id komponentu który ma zostać zakryty (puste ponieważ ma zakryć cały ekran)
		parentId : '',
		//parametr nieobowiązkowy, główny tekst komunikatu na splashscreenie, domyślna wartość taka jak podana
		text : 'Proszę czekać',
		//parametr nieobowiązkowy, dodatkowy tekst komunikatu na splashscreenie, domyślnie pusty
		additionalText : 'Trwa wysyłanie danych...',
		//parametr nieobowiązkowy, czas po którym splash zniknie samoistnie, nawet bez wywoływania metody hide(), jeśli ustawione 0 nigdy nie znika
		timeoutMillis : 0,
		//parametr nieobowiązkowy, nazwa klasy css z ikoną wyświetlaną nad głównym tekstem, domyślnia wartość taka jak podana
		loaderImageClass : 'loadingPanelLoaderImage'
	}),
	
	/**
	 * Pokazuje splasha podczas wysyłania dokumentów
	 */
	showSendActionSplash : function()
	{
		kogSigningUtils.sendActionSplash.show();
	},
	
	/**
	 * Chowa splasha podczas wysyłania dokumentów
	 */
	hideSendActionSplash : function()
	{
		kogSigningUtils.sendActionSplash.hide();
	}
}
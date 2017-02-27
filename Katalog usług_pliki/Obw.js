function Obw()
{
	/**
	 * Zwraca informacje na temat skrzynek
	 */
	
	this.pobierzDane = function () {
		var args = {
				url : 'obw/obszar/pobierzInformacje.npi',
				handleAs : "json",
				load : function(resp)
				{
					var wiad = resp["wiad"];
					var dok = resp["dok"];
					var kom = resp["kom"];
					var wiadComponent = dojo.byId('wiad');
					var dokComponent = dojo.byId('dok');
					var komComponent = dojo.byId('kom');
					
					if(wiadComponent){
						wiadComponent.innerHTML = wiad > 0 ? 'Liczba nieprzeczytanych wiadomości: ' + wiad : 'Brak nieprzeczytanych wiadomości';
					}
					
					if(dokComponent){
						dokComponent.innerHTML = dok > 0 ? 'Liczba nieodebranych dokumentów: ' + dok : 'Brak nieodebranych dokumentów';
					}
					
					if(komComponent){
						komComponent.innerHTML = kom > 0 ? 'Liczba nieprzeczytanych komunikatów: ' + kom : 'Brak nieprzeczytanych komunikatów';
					}
					
				}
			};
		
		dojo.xhrPost(args);
	};

}
var obw = new Obw();
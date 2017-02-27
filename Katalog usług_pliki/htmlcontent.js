/**
 *
 * Funkcja generuje kod HTML z formularzem na podstawie przekazanych parametrow
 *
 * @param uuid - identyfikator sesji
 * @param danePoczatkowe - url do danych inicjalnych
 * @param urlFormularza - url do pliku swf
 * @param trybFormularza - tryb pracy formularza
 * @param idDokumentu - identyfikator dokumentu
 *
 * @returns dijit.layout.BorderContainer z osadzonym w HTML obiektem flash.
 */
   function getEmbededHtmlObject(uiid,danePoczatkowe,urlFormularza,trybFormularza, idDokumentu, kodTypuDok){
    var params = "UUID="+uiid+"&UrlDanePoczatkowe="+danePoczatkowe+"&trybFormularza="+trybFormularza+"&idDokumentu="+idDokumentu;
    var statusOfe = "0";    
    if ((urlFormularza.indexOf("ZUS-US-OFE-01") != -1 || urlFormularza.indexOf("ZUS-US-OPW-01") != -1 || urlFormularza.indexOf("ZUS-US-WSZ-01") != -1) && trybFormularza!="podglad" && trybFormularza!="podgladPdf" && trybFormularza!="podgladBezWalidacji") {
        dojo.xhrPost({
            url : 'obw/dokumentyRobocze/sprawdzCzyUbezpieczonyPosiadaOfe.npi',
            sync : true,
            handleAs : "json",
            content : { 'id.idOb' : idDokumentu },
            load : function(resp)
            {
                if(resp!=null){
                    params = params+"&statusOfe="+resp["ofeDostepne"];
                    statusOfe =  resp["ofeDostepne"];
                }
            }
        });
    }

    var container  = getContentHtmlContainer(uiid,danePoczatkowe,trybFormularza, idDokumentu, kodTypuDok, statusOfe);
    return container;
   }

   /**
    * Funkcja zwraca dijit.layout.BorderContainer osadzonym kodem HTML
    * @param htmlCode - kod html przekazany do osadzenia dijit.layout.BorderContainer
    * @returns dijit.layout.BorderContainer zawieraj�cy kod HTML
    */
   function getContentHtmlContainer(uiid,danePoczatkowe,trybFormularza, idDokumentu, kodTypuDok, statusOfe){
	   /*
       var content = new dojox.layout.ContentPane({region:"center"});
       var container = new dijit.layout.BorderContainer();
       content.attr("content",
               dojo.create("iframe", {
                   "src": danePoczatkowe + "?UUID="+uiid+"&kodTypuDok="+kodTypuDok+"&trybFormularza="+trybFormularza+"&idDokumentu="+idDokumentu,
                   "style": "border: 0; width: 100%; height: 100%",
                   "scrolling": "no",
                   "seamless" : "seamless"
               })
       );
       container.addChild(content);
       return container;
       

	   var htmlForm = "<html><body>Brak formularza</body></html>";
	   var xhrArgs = {
			url: danePoczatkowe + "?UUID="+uiid+"&kodTypuDok="+kodTypuDok+"&trybFormularza="+trybFormularza+"&idDokumentu="+idDokumentu,
		    handleAs: "text",
			sync : true,
		    load: function(data){
		    	htmlForm = data;
		    },
		    error: function(error){
		      htmlForm = "Błąd podczas pobierania formularza - " + error;
		    }
	   }
	   dojo.xhrGet(xhrArgs);
	   */
//	   var content = new dojox.layout.ContentPane({region:"center"});
//	   var container = new dijit.layout.BorderContainer();
//	   content.attr("content",htmlForm);
//	   container.addChild(content);
//	   return container;
       
           
	   var url = danePoczatkowe + '?UUID='+uiid+'&kodTypuDok='+kodTypuDok+'&trybFormularza='+trybFormularza+'&idDokumentu='+idDokumentu+'&statusOfe='+statusOfe;
	   var htmlForm = "<iframe id='html-form-iframe' scrolling='no' allowfullscreen='yes' tabIndex='0' style='border: 0px; width:100%; height: 100%;' src='" + url + "'>";
//	   var htmlForm = "<iframe allowfullscreen='yes' tabIndex='0' style='border: 0px; width:100%; height: 100%;' src='" + url + "'>";
       htmlForm +="<p>Twoja przeglądarka nie wspiera iframe.</p>";
  	   htmlForm +="</iframe>";
  	   return htmlForm;
  	   
  	 /*
	   var content = new dojox.layout.ContentPane({region:"center"});
	   var container = new dijit.layout.BorderContainer();
	   content.attr("content",htmlForm);
	   container.addChild(content);
	   return container;
  	   */

   }

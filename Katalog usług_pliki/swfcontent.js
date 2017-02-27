/**
 * author dszkoda
 *
 * Funkcja generuje kod HTML z osadzonym obiektem flash na podstawie przekazanych parametrow
 *
 * @param uuid - identyfikator sesji
 * @param danePoczatkowe - url do danych inicjalnych
 * @param urlFormularza - url do pliku swf
 * @param trybFormularza - tryb pracy formularza
 * @param idDokumentu - identyfikator dokumentu
 *
 * @returns dijit.layout.BorderContainer z osadzonym w HTML obiektem flash.
 */
       function getEmbededSwfObject(uiid,danePoczatkowe,urlFormularza,trybFormularza, idDokumentu){
    	var params = "UUID="+uiid+"&UrlDanePoczatkowe="+danePoczatkowe+"&trybFormularza="+trybFormularza+"&idDokumentu="+idDokumentu;
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
					}
				}
    		});
    	}
    	var viewport = dijit.getViewport();		
   		var d_h = viewport.h-95;
    	
    	
    	    var swfHtmlObject =
    	    	
    	    "<object classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000' width='100%' height='"+d_h+"' id='Koperta'>"+
            "<param name='movie' value="+urlFormularza+" />"+
            "<param name='quality' value='high' />"+
            "<param name='bgcolor' value='#ffffff' />"+
            "<param name='allowScriptAccess' value='sameDomain' />"+
            "<param name='allowFullScreen' value='true' />"+
            "<param name='allowFullScreenInteractive' value='true' />"+
            "<param name='flashVars' value="+params+" />"+
            "<object type='application/x-shockwave-flash' data="+urlFormularza+" width='100%' height='"+d_h+"'>"+
                "<param name='quality' value='high' />"+
                "<param name='bgcolor' value='#ffffff' />"+
                "<param name='allowScriptAccess' value='sameDomain' />"+
                "<param name='allowFullScreen' value='true' />"+
                "<param name='allowFullScreenInteractive' value='true' />"+
                "<param name='flashVars' value="+params+" />"+
            "</object>"+
            "</object>";

    	   var container  = getContentContainer(swfHtmlObject);

    	   return container;
       }


    /**
     * Funkcja generuje kod HTML z informacj� o braku zainstalowanej odpowiedniej wersji Flash Player'a
     * @returns dijit.layout.BorderContainer zawieraj�cy kod HTML
     */
    function getNoFlashInfoContent(){
    	
    	   var htmlNoFlashInfo =
        	   "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>"+
        	   "<html>"+
        	   "<head>"+
        	   "<meta http-equiv='Content-Type' content='text/html; charset=UTF-8' pageEncoding='UTF-8'>"+
        	   "</head>"+
        	   "<body>"+
        	   "<div style='text-align:center; margin-top:30px;font-weight:bold'>"+
        	   "Do poprawnego wy\u015bwietlenia formularza wymagany jest FlashPlayer w wersji 10.2 lub wy\u017Cszej<br/>"+
        	   "<a href='http://get.adobe.com/pl/flashplayer/'>"+
        	   "Kliknij aby pobra\u0107\ aktualn\u0105\ wersj\u0119\ FlashPlayer'a:"+
        	   "<br/><br/>"+
        	   "<img src='http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif' alt='Get Adobe Flash Player'/>"+
        	   "</a><br/><br/>"+
        	   "Uwaga: instalacja FlashPlayer'a mo\u017Ce wymaga\u0107\ ponownego uruchomienia przegl\u0105\darki"+
        	   "</div>"+
        	   "</body>"+
        	   "</html>";
        		
    	
    	   var container  = getContentContainer(htmlNoFlashInfo);
    	
    	   return container;
       }
    /**
     * Funkcja generuje kod HTML z informacj� o wykryciu niewpe�ni kompatybilnej wtyczki FlashPlayer'a
     * @returns dijit.layout.BorderContainer zawieraj�cy kod HTML
     */
       function getPluginInfoContent(){
    	
    	   var htmlChangePluginInfo =
        	   "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>"+
        	   "<html>"+
        	   "<head>"+
        	   "<meta http-equiv='Content-Type' content='text/html; charset=UTF-8' pageEncoding='UTF-8'>"+
        	   "</head>"+
        	   "<body>"+
        	   "<div style='text-align:center; margin-top:30px;font-weight:bold'>"+
        	
        	   "Formularz nie mo&#380;e by&#263; uruchomiony. Wykryto wtyczk&#281; (plugin)" +
        	   " <b>Adobe Flash Player</b>, kt&#243;ra jest bezpo&#347;rednio zintegrowana z przegl&#261;dark&#261;" +
        	   " Google Chrome i jest domy&#347;lnie w&#322;&#261;czona.<br/>Poprawne funkcjonowanie formularzy" +
        	   " wymaga zainstalowania i u&#380;ywania zewn&#281;trznej wtyczki (plugina) <b>Adobe Flash Player</b>."+
        	   "<br/>Szczeg&#243;ly rekonfiguracji przegladarki Google Chrome znajduj&#261; si&#281; w linku poni&#380;ej:<br/><br/>"+

        	   "<a href=\"https://support.google.com/chrome/bin/answer.py?hl=pl&answer=108086&topic=1678462&ctx=topic\" target=\"_blank\">https://support.google.com/chrome</a>"+
        	   "</div>"+
        	   "</body>"+
        	   "</html>";
    	
    	   var container  = getContentContainer(htmlChangePluginInfo);
   	
    	   return container;
    	
       }

       /**
        * Funkcja zwraca dijit.layout.BorderContainer osadzonym kodem HTML
        * @param htmlCode - kod html przekazany do osadzenia dijit.layout.BorderContainer
        * @returns dijit.layout.BorderContainer zawieraj�cy kod HTML
        */
       function getContentContainer(htmlCode){
    	
    	   var content = new dojox.layout.ContentPane({region:"center"});
    	   var container = new dijit.layout.BorderContainer();
    	   content.attr("content",htmlCode);
    	   content.attr("id","dialogSwfContent");
    	   container.addChild(content);
    	
    	   return container;
    	
       }


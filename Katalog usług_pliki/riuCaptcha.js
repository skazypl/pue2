function RiuCaptcha() {

	this.playing = false;
		
	this.bladCatpchyWyjatek = function(e, pokazywacKomunikat) {
		console.error(e);
		if(pokazywacKomunikat) {
			var komunikat = 'Nie można odtworzyć kodu captchy - upewnij się, że masz zainstalowaną i włączoną najnowszą wtyczkę Adobe Flash Player.';
			alert(komunikat);
		}
	}
	
	this.play = function() {
		var captchaTextbox = dijit.byId("kodZObrazka");
		this.playing = true;
		var mp3player = document.getElementById("captchaPlayerId");
		try {
			captchaTextbox.focus();
			var _this = this;
			setTimeout(function() {
				if(_this.playing) {
					mp3player.callPlay("riu/pobierzAudio.npi");
				}
			}, 2000);			
		} catch (e) {
			riuCaptcha.bladCatpchyWyjatek(e, true);		
		}
	}

	this.pause = function() {
		this.playing = false;
		var mp3player = document.getElementById("captchaPlayerId");
		try {
			mp3player.callPause();
		} catch (e) {
			riuCaptcha.bladCatpchyWyjatek(e);
		}
	}

	this.setPlaying = function(doc) {
		if (!this.playing) {			
			this.play();
			doc.src='images/riuCaptchaSpeakerOn.png';
		} else {
			this.pause();
			doc.src='images/riuCaptchaSpeakerOff.png';
		}
	}
	
    this.odswiezObrazek = function() {
    	var captchaTextbox = dijit.byId("kodZObrazka"); 
    	if(captchaTextbox != null) {
	    	captchaTextbox.set('value', '');
	    	captchaTextbox.validate();
	    	captchaTextbox.focus();
    	}
        var obrazekElement = document.getElementById("obrazek_id");
        if (obrazekElement != null) {
            obrazekElement.src = "riu/pobierzObrazek.npi?" + (new Date()).getTime();
        }
        riuCaptcha.pause();	
    }
    
}

var riuCaptcha = new RiuCaptcha();
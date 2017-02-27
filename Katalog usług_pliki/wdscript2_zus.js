/*
* wdscript2 dla ZUS
* http://www.stanusch.com/
*
* Stanusch Technologies S.A.
*
* Date: 14-11-2012
* Author: Kamil Michalik
* prod
* Wymagane skrypty: 1) SWFObject v2.2 - http://code.google.com/p/swfobject 
*                   
*/

var stwd_adviser = {
    expressInstall: "http://pue.zus.pl/WDPlayer/Common/expressInstall.swf",
    skin: "http://pue.zus.pl/WDPlayer/avatar.swf",
    configFile: "http://pue.zus.pl/JAIO-WEB/playerConfig/MA?prefix=zus_syzyf",
    engine: "http://pue.zus.pl/WDPlayer/Common/engine.swf",
    nextFocusElementId: "search_input",
    actionId: "",
    currentPage: "",
    playerId: "MA",
    partitionName: "",
    cookieName: "swtd_cookie_zus_12342",
    wmode: "opaque",
    width: 650,
    height: 270,
    conatiner: "wirtualny",
    protocol: "",
    uid: "stwduid",
    isOpen: true,
    tabIndex: 1,
    dynamicContainerId: "stwd_dynamic_container_12342",
    noFlashInfo: "<p>Wymagany Flash Player 9 lub nowszy: <a href='http://get.adobe.com/flashplayer/?promoid=DAFYL'>http://get.adobe.com</a></p>",
    notWiText: "notWiText",
    voiceOnStart: false,
    embed: function (actionId) {
        if (actionId) this.actionId = actionId;
        if (this.protocol == "") 
        {
            this.protocol = window.location.href.substring(0,window.location.href.indexOf(':'));
        }
        this.flashvars = {
            skin: this.skin,
            configfile: this.configFile,
            engine: this.engine,
            startQuestion: this.actionId,
            startQuestion2: this.actionId,
            currentpage: this.currentPage,
            playerId: this.playerId,
            partitionName: this.partitionName,
            protocol: this.protocol,
            test: "test",
            voiceOnStart: this.voiceOnStart
        };
        this.params = {
            menu: "true",
            wmode: this.wmode,
            allowScriptAccess: "always"
        };
        this.attributes = {
            id: this.uid,
            name: this.uid
        };

        if (this.isOpen) this.show();
        
        
    },
    setFocusOnFlash: function() 
    { 
        var f = swfobject.getObjectById(this.uid); 
        if (f) 
        { 
            f.tabIndex = this.tabIndex; 
            f.focus(); 
        } 
    },
    setFocusOnHtml: function()
    {
        document.getElementById(this.nextFocusElementId).focus();
    },
    hide: function () {
        stwd_adviser.remove();
    },
    show: function () {
        document.getElementById(this.conatiner).innerHTML = "<div id='" + this.dynamicContainerId + "'>" + stwd_adviser.noFlashInfo + "</div>";
        stwd_adviser.open();

		//zmieniam starQuestion, kontekst tylko przy pierwszym uruchomieniu
        this.flashvars.startQuestion = "";
    },
    open: function () {
        if (this.protocol == "https") this.skin = this.skin.replace( "http://", "https://" );
        swfobject.embedSWF(this.skin, this.dynamicContainerId, this.width, this.height, "9", this.expressInstall, this.flashvars, this.params, this.attributes);
    },
    answerQuestion: function (actionId) {
        try {
            document.getElementById(this.uid).answerQuestion(actionId);
        }
        catch (e) 
        { 
			
        }
    },
    playMovies: function (moviesXMlStringify) {
        // moviesXMlStringify = "hi_001.flv;no_001.flv;bye_001.flv;no_001.flv";
        // call ex. javascript: stwd_adviser.playMovies("<movies><movie>no_001.flv</movie><movie>hi_001.flv</movie><movie>bye_001.flv</movie></movies>");
        try {
            document.getElementById(this.uid).playMovies(moviesXMlStringify);
        }
        catch (e) {
            alert("Demo playmovies error:" + e)
        }
    },
    remove: function () {
        swfobject.removeSWF(this.uid);
    },
    openData: function (data) {
        if (data.indexOf("wait_play_") != -1) {
            return;
        }
        else if (data.indexOf("http://goto:") != -1) {
            var dcut = data.substr(12);
            //alert("GOTO!!!");
            try
            {
                goto(dcut);
            }
            catch(e)
            {
                this.answerQuestion(this.notWiText);
            }
        }
        else if (data.indexOf("http://help:") != -1) {
            var dcut = data.substr(12);
            //alert("GOTO!!!");
            try
            {
                wdOpenHelp(dcut);
            }
            catch(e)
            {
            //this.answerQuestion(this.notWiText);
            }
        }
        else if (data.indexOf("http://") != -1)
            window.open(data, "_blank");
        else {
            try {
                goto(data);
            }
            catch (e) {
                this.answerQuestion(this.notWiText);
            }
        }
    },
    lockWd: function () {
        try {
            document.getElementById(this.uid).lockWd();
        }
        catch (e) {
            alert(e);
        }
    },
    unlockWd: function () {
        try {
            document.getElementById(this.uid).unlockWd();
        }
        catch (e) {
            alert(e);
        }
    },
    gotoKrok: function (krokNo) {
        /*alert("run step:" + krokNo);*/
        try
        {
            runstep(krokNo);
        }
        catch(e)
        {
            this.answerQuestion(this.notWiText);
        }
    }
}

function wdOpenHelp(screenId) {
    window.open("https://pue.zus.pl/portal/pomoc/index.html?" + screenId + ".html", "help", "status=1");
}
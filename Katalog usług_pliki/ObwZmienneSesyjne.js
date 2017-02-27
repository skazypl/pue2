function ObwZmienneSesyjne() {

    this.inicjalizujZmienneSesyjne = function() {
        var args = {
            url: 'obw/inicjalizacjaZmiennychSesyjnych/iniciuj.npi',
            sync: true,
            content: {
            },
            handleAs: 'json',
            load: function (resp) {
            }
        };
        dojo.xhrPost(args);
    }
}

var obwZmienneSesyjne = new ObwZmienneSesyjne();
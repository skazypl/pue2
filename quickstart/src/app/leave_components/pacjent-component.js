"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var Zwolnienie = (function () {
    function Zwolnienie() {
    }
    return Zwolnienie;
}());
exports.Zwolnienie = Zwolnienie;
var zwolnienia = [
    { 'id': '0', name: 'Jan Kowalski', from: '04-02-2017', to: '11-02-2017', illness: 'Grypa' },
    { 'id': '0', name: 'Jan Kowalski', from: '04-02-2017', to: '11-02-2017', illness: 'Grypa' },
    { 'id': '0', name: 'Jan Kowalski', from: '04-02-2017', to: '11-02-2017', illness: 'Grypa' },
    { 'id': '0', name: 'Jan Kowalski', from: '04-02-2017', to: '11-02-2017', illness: 'Grypa' },
    { 'id': '0', name: 'Jan Kowalski', from: '04-02-2017', to: '11-02-2017', illness: 'Grypa' },
];
var PacjentComponent = (function () {
    function PacjentComponent() {
        this.list = zwolnienia;
    }
    PacjentComponent.prototype.clicked = function () {
        alert();
    };
    PacjentComponent = __decorate([
        core_1.Component({
            selector: 'pacjent',
            templateUrl: 'pages/leave_subpages/pacjent.html',
        }), 
        __metadata('design:paramtypes', [])
    ], PacjentComponent);
    return PacjentComponent;
}());
exports.PacjentComponent = PacjentComponent;
//# sourceMappingURL=pacjent-component.js.map
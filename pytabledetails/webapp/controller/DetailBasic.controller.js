sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/arteriatech/ss/utils/js/Common",
	"com/arteriatech/ppc/utils/js/Common"
],
function (Controller, oSSCommon, oPPCommon) {
    "use strict";

    return Controller.extend("pytabledetails.controller.DetailBasic", {
        onInit: function () {
            gDetailBasic = this.getView();  
        }
    });
});
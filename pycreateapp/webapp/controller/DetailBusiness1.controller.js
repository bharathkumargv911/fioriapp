sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/arteriatech/ss/utils/js/Common",
	"com/arteriatech/ppc/utils/js/Common"
],
function (Controller, oSSCommon, oPPCCommon) {
    "use strict";

    return Controller.extend("pycreateapp.controller.DetailBusiness1", {
        onInit: function () {
            gDetailBusiness1 = this.getView();
        },
    });
});
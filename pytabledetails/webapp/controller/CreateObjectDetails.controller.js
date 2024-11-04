sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/arteriatech/ss/utils/js/Common",
	"com/arteriatech/ppc/utils/js/Common",
    "sap/ui/core/format/DateFormat"
],
function (Controller, oSSCommon, oPPCommon,DateFormat) {
    "use strict";

    return Controller.extend("pytabledetails.controller.CreateObjectDetails", {
        onInit: function () {
            gCreateObjectDetail = this.getView();
        },
        formatDate: function (sDate) {
            if (!sDate) {
                return "";
            }
            var oDateFormat = DateFormat.getDateInstance({ pattern: "dd/MM/yyyy" });
            var oDate = new Date(sDate);
            return oDateFormat.format(oDate);
        },

    });
});
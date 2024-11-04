sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/arteriatech/ss/utils/js/Common",
    "com/arteriatech/ppc/utils/js/Common"
],
function (Controller,oSSCCommon,oPPCCommon) {
    "use strict";
    var oi18n = "",
        oPPCUtili18n = "";
    var oDevice = sap.ui.Device;
    var oBusyDialog = new sap.m.BusyDialog();
    return Controller.extend("pytestapp.controller.Main", {
        onInit: function () {
            this.onInitialHookUps();
        },

        onInitialHookUps:function(){
            this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()));
            oi18n = this._oComponent.getModel("i18n").getResourceBundle();
            oPPCUtili18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();
            this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this._oRouter.attachRouteMatched(this.onRouteMatched, this);
        },

        onRouteMatched:function(){
        },

    });
});

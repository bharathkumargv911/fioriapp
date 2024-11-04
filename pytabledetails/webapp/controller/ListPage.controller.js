sap.ui.define([
   "sap/ui/core/mvc/Controller",
  "com/arteriatech/ss/utils/js/Common",
  "com/arteriatech/ppc/utils/js/Common"
],
function (Controller, oSSCommon, oPPCommon) {
    "use strict";
    var oi18n;
    var oPPCUtili18n;
    var oDevice = sap.ui.Device;
    var BusyDialog = new sap.m.BusyDialog();
    return Controller.extend("pytabledetails.controller.ListPage", {
        onInit: function () {
            
            // this._oComponent = sap.ui.component(sap.ui.Component.getOwnerIdFor(this.getView()));
            // var oDataModel = this._oComponent.getModel("PCGW");
            // var oUtilsI18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();
            // this._oRouter = sap.ui.core.UIComponent.getRouteFor(this);
            // oPPCommon.initMsgMangerObjects();


            // if(sap.ui.Device.support.touch===false){
            //     this.getView().addStyleClass("sapUiSizeCompact");
            // }
            // if(this.onInitHookUp_Exit){
            //     this.onInitHookUp();
            // }
            this.onInitialHookUps();
        },

        onInitialHookUps:function(){
            this._oView = this.getView();
            this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this._oView));
            oi18n = this._oComponent.getModel("i18n").getResourceBundle();
            oPPCUtili18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();
            this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this._oRouter.attachRouteMatched(this.onRouteMatched, this);
        },

    
        onRouteMatched: function () { },

        onCreate:function(){
            this._oRouter.navTo("CreatePage", {}, true);
        }
    });
});

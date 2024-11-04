sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/arteriatech/ss/utils/js/Common",
	"com/arteriatech/ppc/utils/js/Common"
],
function (Controller, oSSCommon, oPPCommon) {
    "use strict";

    return Controller.extend("pyopcnfglist.controller.Main", {
        onInit: function () {
            
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()));
			var oDataModel = this._oComponent.getModel("PCGW");
			var oUtilsI18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			/*
			 *PSPO name should be from generic table which a is typeset name for app-wise generic checks, this name changes for each app, it will be maintained uniquely.
			 *call util function to get constant value and this value should me maintained in the ppsutil constants also
			 */
			//var pspoTypsetName = oPPSCommon.getPPSUIConstants("PSPO");
			//call ppsutil function to load product and app features, and this function saves features globally
			// oSSCommon.loadProductFeatures({
			// 	oDataModel: oDataModel,
			// 	oUtilsI18n: oUtilsI18n
			// });
			// 	oSSCommon.loadAppFeatures({
			// 	oDataModel: oDataModel,
			// 	oUtilsI18n: oUtilsI18n,
			// 	Typeset: "SFSO"
			// });
			oPPCommon.initMsgMangerObjects();

			if (sap.ui.Device.support.touch === false) {
				this.getView().addStyleClass("sapUiSizeCompact");
			}
			if (this.onInitHookUp_Exit) {
				this.onInitHookUp();
			}
        }
    });
});

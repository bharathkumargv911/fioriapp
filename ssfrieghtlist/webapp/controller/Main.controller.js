sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/arteriatech/ppc/utils/js/Common",
	"com/arteriatech/ss/utils/js/Common"
], function (Controller, oPPCCommon, oSSCommon) {
	"use strict";

	return Controller.extend("com.arteriatech.ssfrieghtlist.controller.Main", {
		onInit: function () {

			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()));
			var oDataModel = this._oComponent.getModel("PCGW");
			var oUtilsI18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();
			oPPCCommon.initMsgMangerObjects();
			oPPCCommon.loadProductFeatures({
				Typeset: "PD",
				oDataModel: oDataModel,
				oUtilsI18n: oUtilsI18n
			});
			if (sap.ui.Device.support.touch === false) {
				this.getView().addStyleClass("sapUiSizeCompact");
			}

		}
	});
});
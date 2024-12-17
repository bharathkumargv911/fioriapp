/*
 * Copyright (C) 2015-2016 Arteria Technologies Pvt. Ltd. All rights reserved
 */
jQuery.sap.require("com.arteriatech.ppc.utils.js.Common");
jQuery.sap.require("com.arteriatech.ss.utils.js.Common");
"com/arteriatech/ss/utils/js/Common"
var oPPCCommon = com.arteriatech.ppc.utils.js.Common;
var oSSCommon = com.arteriatech.ss.utils.js.Common;
sap.ui.controller("com.arteriatech.zsf.quot.controller.Main", {
	onInit: function () {
		this.onInitHookUp();
	},
	onInitHookUp: function () {
		this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()));
		var oDataModel = this._oComponent.getModel("PCGW");
		var oUtilsI18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();

		oSSCommon.loadProductFeatures({
			oDataModel: oDataModel,
			oUtilsI18n: oUtilsI18n
		});

		oSSCommon.loadAppFeatures({
			oDataModel: oDataModel,
			oUtilsI18n: oUtilsI18n,
			Typeset: ["SF", "PD"],
			bMultiTypeset: true
		});
		// oPPCCommon.loadProductFeatures({
		// 	Typeset: "PD",
		// 	oDataModel: oDataModel,
		// 	oUtilsI18n: oUtilsI18n
		// });

		oPPCCommon.initMsgMangerObjects();

		if (sap.ui.Device.support.touch === false) {
			this.getView().addStyleClass("sapUiSizeCompact");
		}

		if (this.onInitHookUp_Exit) {
			this.onInitHookUp();
		}
	}
});
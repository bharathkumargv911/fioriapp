sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/arteriatech/ppc/utils/js/Common",
	"com/arteriatech/ss/utils/js/Common"
], function(Controller,oPPCCommon,oPPSCommon) {
	"use strict";
	return Controller.extend("com.arteriatech.ss.slsprsn.create.controller.Main", {
		onInit: function() {
		this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()));
			var oDataModel = this._oComponent.getModel("PCGW");
			var oUtilsI18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();
			/*
			 *PSPO name should be from generic table which a is typeset name for app-wise generic checks, this name changes for each app, it will be maintained uniquely.
			 *call util function to get constant value and this value should me maintained in the ppsutil constants also
			 */
			//var pspoTypsetName = oPPSCommon.getPPSUIConstants("PSPO");
			//call ppsutil function to load product and app features, and this function saves features globally
			oPPSCommon.loadProductFeatures({
				oDataModel: oDataModel,
				oUtilsI18n: oUtilsI18n
			});
			oPPCCommon.initMsgMangerObjects();
			
			if (sap.ui.Device.support.touch === false) {
				this.getView().addStyleClass("sapUiSizeCompact");
			}
	}

	});

});
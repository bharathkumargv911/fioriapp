sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"com/arteriatech/ppc/utils/js/Common",
	"com/arteriatech/prd/utils/js/Common"
], function(Controller, JSONModel, History) {
	"use strict";
	var oi18n, oUtilsI18n;
	var Device = sap.ui.Device;
	var oPPCCommon = com.arteriatech.ppc.utils.js.Common;
	var oProductCommon, oCommonValueHelp;
	var product = "PD";
	return Controller.extend("com.arteria.ss.stockadjustmnt.create.controller.DetailPageItems", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf client.newplugin.artlisttemplate.resources..view.DetailPageItems
		 */
		onInit: function() {
			this.onInitHookUp();
		},

		onInitHookUp: function() {
			gSAItemView = this.getView();
			/**
			 * Get reference of the Parent component i.e Component.js
			 */
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(gSAItemView));

			if (product === "PPS") {
				oProductCommon = com.arteriatech.pps.utils.js.Common;
				oCommonValueHelp = com.arteriatech.pps.utils.js.CommonValueHelp;
			} else if (product === "PD") {
				oProductCommon = com.arteriatech.ss.utils.js.Common;
				oCommonValueHelp = com.arteriatech.ss.utils.js.CommonValueHelp;
			} else if (product === "CL") {
				oProductCommon = com.arteriatech.cl.utils.js.Common;
				oCommonValueHelp = com.arteriatech.cl.utils.js.CommonValueHelp;
			}
			/*else {
								//<ToAdd if any new product> 
							}*/

			//i18n
			oi18n = this._oComponent.getModel("i18n").getResourceBundle();
			oUtilsI18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();

			if (this.onInitHookUp_Exit) {
				this.onInitHookUp_Exit();
			}
		},
		onChangeReasonDesc: function(oEvent) {
			if (oEvent.getSource().getSelectedKey() !== "") {
				var path = oEvent.getSource().getBindingContext("MaterialDocItemDetails").getPath();
				oEvent.getSource().getBindingContext("MaterialDocItemDetails").getModel().setProperty(path + "/ReasonDesc", oEvent.getSource()
					.getSelectedItem().getText().split(" - ")[1].trim());
			}
		},
		onChangeAdjQty: function(oEvent) {
			com.arteriatech.ppc.utils.js.Common.formatNumber(oEvent);
			var aItems = this.getView().getModel("MaterialDocItemDetails").getData();
			var a = 0;
			var Quantity;
			var AdjQty;
			var DiffQty;
			for (var i = 0; i < aItems.length; i++) {
				Quantity = aItems[i].Quantity;
				AdjQty = aItems[i].AdjQty;
				DiffQty = aItems[i].DiffQty;
				if (aItems[i].AdjQty === undefined) {

				} else if (aItems[i].AdjQty > aItems[i].Quantity) {
					// aItems[i].MvmtTypeID = "802";
					aItems[i].DiffQty = aItems[i].Quantity - aItems[i].AdjQty;
					// book stock means Quantity is larger than AdjQty 
					this._oComponent.getModel("MaterialDocs").setProperty("/MvmtTypeID", "802");
					this._oComponent.getModel("MaterialDocs").setProperty("/MvmntTypeDesc", "");
				} else if (aItems[i].AdjQty < aItems[i].Quantity) {
					aItems[i].DiffQty = aItems[i].Quantity - aItems[i].AdjQty;
					// Book stock(Quantity) is greater than physical stock (AdjQty) 
					// aItems[i].MvmtTypeID = "801";
					this._oComponent.getModel("MaterialDocs").setProperty("/MvmtTypeID", "801");
					this._oComponent.getModel("MaterialDocs").setProperty("/MvmntTypeDesc", "");
				} else if (aItems[i].AdjQty === aItems[i].Quantity) {
					aItems[i].DiffQty = aItems[i].Quantity - aItems[i].AdjQty;
				}
			}
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf client.newplugin.artlisttemplate.resources..view.DetailPageItems
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf client.newplugin.artlisttemplate.resources..view.DetailPageItems
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf client.newplugin.artlisttemplate.resources..view.DetailPageItems
		 */
		//	onExit: function() {
		//
		//	}

	});

});
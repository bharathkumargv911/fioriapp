sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"com/arteriatech/ppc/utils/js/Common",
	"com/arteriatech/prd/utils/js/Common"
], function(Controller, JSONModel, History, oPPCCommon) {
	"use strict";
	var oi18n, oUtilsI18n;
	var Device = sap.ui.Device;
	var oDialog = new sap.m.Dialog();
	var oProductCommon, oCommonValueHelp;
	var product = "PD";
	return Controller.extend("com.arteria.ss.stockadjustmnt.create.controller.DetailPageHeader", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf client.newplugin.artlisttemplate.resources..view.DetailPageHeader
		 */
		onInit: function() {
			this.onInitHookUp();
		},

		onInitHookUp: function() {
			gSADetailHeaderView = this.getView();
			/**
			 * Get reference of the Parent component i.e Component.js
			 */
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(gSADetailHeaderView));

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
			this.setMoveMentTypeDD();
			if (this.onInitHookUp_Exit) {
				this.onInitHookUp_Exit();
			}
		},
		setMoveMentTypeDD: function() {
			var oModelData = this._oComponent.getModel("PCGW");
			var oMoveMentTypeFilter = new Array();
			oMoveMentTypeFilter = oPPCCommon.setODataModelReadFilter(this.getView(), "", oMoveMentTypeFilter, "Typeset", sap.ui.model.FilterOperator
				.EQ, ["GRMTYP"], false, false, false);
			oPPCCommon.getDropdown(oModelData, "ConfigTypesetTypes", oMoveMentTypeFilter, "Types", "TypesName", oDialog, this.getView(),
				"MoveMentTypeDD", "None",
				function() {});
		},
		onDateValidate: function(e) {
				var source = e.getSource().getId().split("-");
				source = "/UI/InstrumentDateId-" + source[source.length - 1];
				var date = new Date(e.getParameter("value"));
				var todate = oPPCCommon.getCurrentServerDate(this);
				var currentDate = todate;
				var difference = ((currentDate - date) / (1000 * 60 * 60 * 24));
				if (difference <= 0) {
					var msg = oi18n.getText("DetailHeader.Message.validInstDate");
					oPPCCommon.addMsg_MsgMgr(msg, "error", source);
					this.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel().getData()
						.length);
					oPPCCommon.showMessagePopover(gSADetailHeaderView);

				} else {
					oPPCCommon.removeMsgsInMsgMgrById(source);

				}
			}
			/**
			 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
			 * (NOT before the first rendering! onInit() is used for that one!).
			 * @memberOf client.newplugin.artlisttemplate.resources..view.DetailPageHeader
			 */
			//	onBeforeRendering: function() {
			//
			//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf client.newplugin.artlisttemplate.resources..view.DetailPageHeader
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf client.newplugin.artlisttemplate.resources..view.DetailPageHeader
		 */
		//	onExit: function() {
		//
		//	}

	});

});
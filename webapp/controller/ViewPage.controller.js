sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"com/arteriatech/ppc/utils/js/Common",
	"com/arteriatech/ss/utils/js/Common"
], function(Controller, JSONModel, History) {
	"use strict";
	var oi18n, oUtilsI18n;
	var Device = sap.ui.Device;
	var oPPCCommon = com.arteriatech.ppc.utils.js.Common;
	var oProductCommon, oCommonValueHelp;
	var product = "PD";
	return Controller.extend("com.arteriatech.zsf.quot.controller.ViewPage", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.arteriatech.zsf.quot.view.ViewPage
		 */
		onInit: function() {
			this.onInitHookUp();
		},

		onInitHookUp: function() {
			this._oView = this.getView();
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this._oView));
			oi18n = this._oComponent.getModel("i18n").getResourceBundle();
			oUtilsI18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();

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

			/*this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.attachRouteMatched(this.onRouteMatched, this);*/

			this.TokenInput = this.getView().byId("ViewPageValueHelp");
			this.aKeys = []; // ToADD ["PONumber", "PONumber"];
			this.byId("ViewPageValueHelp").setValueState(sap.ui.core.ValueState.None);
			this.byId("ViewPageValueHelp").setValueStateText("");

			var that = this;

			//ToAdd upcomment and Update below lines
			/*var sPreviourEnteredValue;
			this.TokenInput.addValidator(function(args) {
				if (sPreviourEnteredValue !== args.text) {
					sPreviourEnteredValue = args.text;
					var oDataModel = that._oComponent.getModel("PSGW_PUR");
					args.text = args.text.toUpperCase();
					var F4Filters = new Array();
					var fPONumber = new sap.ui.model.Filter("PONumber", sap.ui.model.FilterOperator.EQ, args.text);
					F4Filters.push(fPONumber);
					oProductCommon.getTokenForInput(args, oDataModel, "POs", F4Filters, "PONumber", "PONumber", that.POTokenInput,
						"ToAdd",
						function(oToken, IsSuccess) {
							if (IsSuccess) {
								sPreviourEnteredValue = "";
							}
						}, that, oUtilsI18n, "ViewPageValueHelp");
				}
			});*/

			if (this.onInitHookUp_Exit) {
				this.onInitHookUp();
			}
		},

		/*onRouteMatched: function(evt) {

		},*/
		ViewPageF4: function() {
			//ToAdd
		},
		onF4Change: function(oEvent) {
			if (oEvent.getSource().getValue() === "") {
				oPPCCommon.removeMsgsInMsgMgrByMsgCode("Err_ValueHelp");
				oEvent.getSource().setValueState("None");
				oEvent.getSource().setValueStateText("");
			}
		},
		gotoDetail: function(oEvent) {
				if (this.byId("ViewPageValueHelp").getTokens().length > 0) {
					this.byId("ViewPageValueHelp").setValueState(sap.ui.core.ValueState.None);
					this.byId("ViewPageValueHelp").setValueStateText("");
					var path = "";
					var oModelContext = oEvent.getSource().getBindingContext("POItems");
					/**
					 * Check for the Multi-Origin of the service
					 * If true pass Multi-Origin Property in the routing  
					 */
					var selectedNumber = this.byId("ViewPageValueHelp").getTokens()[0].mProperties.key;

					//ToAdd uncomment below line and update the path
					/*if (oModelContext !== undefined && oPPCCommon.isMultiOrigin(oModelContext)) {
						var SAPMultiOriginPropertyName = oPPCCommon.getSAPMultiOriginPropertyName();
						path = "POs(PONumber='" + oModelContext.getProperty("PONumber") + "'," +
							SAPMultiOriginPropertyName + "='" + oModelContext.getProperty(SAPMultiOriginPropertyName) + "')";
					} else {
						path = "POs(PONumber='" + PONumber + "')";
					}*/

					this._oRouter.navTo("DetailPage", {
						contextPath: path
					}, false);

				} else {
					this.byId("ViewPageValueHelp").setValueState(sap.ui.core.ValueState.Error);
					this.byId("ViewPageValueHelp").setValueStateText("ToAdd Message");
					sap.m.MessageBox.error(
						"ToAdd Message", {
							styleClass: sap.ui.Device.support.touch ? "" : "sapUiSizeCompact"
						}
					);
				}
			}
			/**
			 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
			 * (NOT before the first rendering! onInit() is used for that one!).
			 * @memberOf com.arteriatech.zsf.quot.view.ViewPage
			 */
			//	onBeforeRendering: function() {
			//
			//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.arteriatech.zsf.quot.view.ViewPage
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.arteriatech.zsf.quot.view.ViewPage
		 */
		//	onExit: function() {
		//
		//	}

	});

});
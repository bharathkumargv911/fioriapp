sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"com/arteriatech/ppc/utils/js/Common",
	"com/arteriatech/ss/utils/js/Common"
], function (Controller, JSONModel, History, oPPCCommon, oProductCommon) {
	"use strict";
	var oi18n, oUtilsI18n;
	var Device = sap.ui.Device;
	var oPPCCommon = com.arteriatech.ppc.utils.js.Common;
	var oProductCommon, oCommonValueHelp;
	var product = "PD";
	var contextPath = "";
	return Controller.extend("com.arteriatech.zsf.quot.controller.ItemDetailPage", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.arteriatech.zsf.quot.view.ItemDetailPage
		 */
		onInit: function () {
			this.onInitHookUp();
		},
		onInitHookUp: function () {
			gItemDetailPageView = this.getView();
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(gItemDetailPageView));
			oi18n = this._oComponent.getModel("i18n").getResourceBundle();
			oUtilsI18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();
			this.router = sap.ui.core.UIComponent.getRouterFor(this);
			this.router.attachRouteMatched(this.onRouteMatched, this);
			this.setDefaultSettings();

			if (this.onInitialHookUps_Exit) {
				this.onInitialHookUps_Exit();
			}

		},

		onRouteMatched: function (oEvent) {
			if (oEvent.getParameter("name") !== "ItemDetailPage") {
				return;
			}
			this.getView().setBusy(true);
			var oHistory = sap.ui.core.routing.History.getInstance();
			if (oHistory.getDirection() !== "Backwards") {
				contextPath = oEvent.getParameter("arguments").contextPath;
				this.getQuotItemDetails();
			}
			if (this.onRouteMatched_Exit) {
				this.onRouteMatched_Exit(oEvent);
			}

		},
		setDefaultSettings: function () {
			var oViewSettingModelItemDtl = new sap.ui.model.json.JSONModel();
			this.viewSettingDataItemDtl = {
				QuotItemTextCount: 0,
				QuotItemConditionCount: 0,
				QuotItemSchdlsCount: 0,
				QuotationPFItemCount: 0
			};
			oViewSettingModelItemDtl.setData(this.viewSettingDataItemDtl);
			this.getView().setModel(oViewSettingModelItemDtl, "LocalViewSettingItemDtl");

			if (this.setDefaultSettings_Exit) {
				this.setDefaultSettings_Exit();
			}
		},
		getQuotItemDetails: function () {
			var that = this;
			var odataModel = this._oComponent.getModel("SFGW_INQ");
			odataModel.setHeaders({
				"x-arteria-loginid": this.getCurrentUsers("QuotationItemDetails", "read")
			});
			odataModel.read("/" + contextPath, {

				urlParameters: {
					"$expand": "QuotationItemSchedules,QuotationConditionItemDetails,QuotationPFItemDetails" //QuotationPFItemDetails
				},
				success: function (oData) {
					that.setQuotItemDetails(oData);
					that.getView().setBusy(false);

				},
				error: function (error) {
					that.getView().setBusy(false);
					//that.handleoDataError(error);
				}
			});

			if (this.getContractItemDetails_Exit) {
				this.getContractItemDetails_Exit();
			}
		},
		getCurrentUsers: function (sServiceName, sRequestType) {
			var sLoginID = oProductCommon.getCurrentLoggedUser({
				sServiceName: sServiceName,
				sRequestType: sRequestType
			});
			if (this.getCurrentUsers_Exit) {
				sLoginID = this.getCurrentUsers_Exit(sServiceName, sRequestType);
			}
			return sLoginID;
		},
		setQuotItemDetails: function (oData) {
			// QuotationItemDetails
			// var oQuotItemsModel = new sap.ui.model.json.JSONModel();
			// oQuotItemsModel.setData(oData);
			// this._oComponent.setModel(oQuotItemsModel, "QuotationItemDetails");
			this.getView().getModel("LocalViewSettingItemDtl").setProperty("/QuotationNo", oData.QuotationNo);
			this.getView().getModel("LocalViewSettingItemDtl").setProperty("/ItemNo", oData.ItemNo);
			var oQuotItemCondtionsModel = new sap.ui.model.json.JSONModel();
			for (var i = 0; i < oData.QuotationConditionItemDetails.results; i++) {
				oData.QuotationConditionItemDetails.results[i].ConditionValue = parseFloat(oData.QuotationConditionItemDetails.results[i].ConditionValue);
			}
			if (oData.QuotationConditionItemDetails.results.length > 0) {
				oQuotItemCondtionsModel.setData(oData.QuotationConditionItemDetails.results);
				this._oComponent.setModel(oQuotItemCondtionsModel, "QuotationConditionItemDetails");
				this.getView().getModel("LocalViewSettingItemDtl").setProperty("/QuotItemConditionCount", oData.QuotationConditionItemDetails.results
					.length);
			} else {
				this.ItemCondNoDataFound();
			}
			if (oData.QuotationItemSchedules.results.length > 0) {
				var oQuotItemSchdlsModel = new sap.ui.model.json.JSONModel();
				oQuotItemSchdlsModel.setData(oData.QuotationItemSchedules.results);
				this._oComponent.setModel(oQuotItemSchdlsModel, "QuotationItemSchedules");
				this.getView().getModel("LocalViewSettingItemDtl").setProperty("/QuotItemSchdlsCount", oData.QuotationItemSchedules.results.length);
			} else {
				this.ItemSchdlNoDataFound();
			}

			if (oData.QuotationPFItemDetails.results.length > 0) {
				var oQuotationPFItemDetailsModel = new sap.ui.model.json.JSONModel();
				oQuotationPFItemDetailsModel.setData(oData.QuotationPFItemDetails.results);
				this._oComponent.setModel(oQuotationPFItemDetailsModel, "QuotationPFItemDetails");
				this.getView().getModel("LocalViewSettingItemDtl").setProperty("/QuotationPFItemCount", oData.QuotationPFItemDetails.results.length);
			} else {
				this.ItemPFNoDataFound();
			}

			if (this.setContractItemDetails_Exit) {
				this.setContractItemDetails_Exit();
			}

		},
		ItemCondNoDataFound: function () {
			var oView = this.getView();
			/** Clear Model of the view */
			if (oView.getModel("QuotationConditionItemDetails") !== undefined) {
				oView.getModel("QuotationConditionItemDetails").setProperty("/", {});
			}

			gQuotItemCondtionsView.byId("QuotItemPFTable").setNoDataText(oUtilsI18n.getText("common.NoResultsFound"));
			gQuotItemCondtionsView.byId("UIQuotItemPFTable").setNoData(oUtilsI18n.getText("common.NoResultsFound"));
			gQuotItemCondtionsView.byId("UIQuotItemPFTable").setVisibleRowCount(2);
			gQuotItemCondtionsView.byId("UIQuotItemPFTable").setMinAutoRowCount(2);

			oView.getModel("LocalViewSettingItemDtl").setProperty("/QuotItemConditionCount", 0);

			if (this.ItemCondNoDataFound_Exit) {
				this.ItemCondNoDataFound_Exit();
			}
		},
		ItemSchdlNoDataFound: function () {
			var oView = this.getView();
			/** Clear Model of the view */
			if (oView.getModel("QuotationItemSchedules") !== undefined) {
				oView.getModel("QuotationItemSchedules").setProperty("/", {});
			}
			gQuotItemCondtionsView.byId("QuotItemShdlsTable").setNoDataText(oUtilsI18n.getText("common.NoResultsFound"));
			gQuotItemCondtionsView.byId("UIQuotItemShdlsTable").setNoData(oUtilsI18n.getText("common.NoResultsFound"));
			gQuotItemCondtionsView.byId("UIQuotItemShdlsTable").setVisibleRowCount(2);
			gQuotItemCondtionsView.byId("UIQuotItemShdlsTable").setMinAutoRowCount(2);

			oView.getModel("LocalViewSettingItemDtl").setProperty("/QuotItemSchdlsCount", 0);

			if (this.ItemSchdlNoDataFound_Exit) {
				this.ItemSchdlNoDataFound_Exit();
			}
		},
		ItemPFNoDataFound: function () {
			var oView = this.getView();
			/** Clear Model of the view */
			if (oView.getModel("QuotationItemSchedules") !== undefined) {
				oView.getModel("QuotationItemSchedules").setProperty("/", {});
			}
			gQuotItemPFView.byId("QuotItemShdlsTable").setNoDataText(oUtilsI18n.getText("common.NoResultsFound"));
			gQuotItemPFView.byId("UIQuotItemShdlsTable").setNoData(oUtilsI18n.getText("common.NoResultsFound"));
			gQuotItemPFView.byId("UIQuotItemShdlsTable").setVisibleRowCount(2);
			gQuotItemPFView.byId("UIQuotItemShdlsTable").setMinAutoRowCount(2);

			oView.getModel("LocalViewSettingItemDtl").setProperty("/QuotItemSchdlsCount", 0);

			if (this.ItemSchdlNoDataFound_Exit) {
				this.ItemSchdlNoDataFound_Exit();
			}
		},
		navigateBack: function () {
			//ToAdd if any other navigation
			window.history.go(-1);
			if (this.navigateBack_Exit) {
				this.navigateBack_Exit();
			}
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.arteriatech.zsf.quot.view.ItemDetailPage
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.arteriatech.zsf.quot.view.ItemDetailPage
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.arteriatech.zsf.quot.view.ItemDetailPage
		 */
		//	onExit: function() {
		//
		//	}

	});

});
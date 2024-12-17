sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"com/arteriatech/ppc/utils/js/Common",
	"com/arteriatech/ss/utils/js/Common",
	"com/arteriatech/zsf/quot/util/Formatter",
	"com/arteriatech/ss/utils/js/CommonValueHelp",
	"com/arteriatech/ss/utils/js/UserMapping",
	"sap/m/BusyDialog"
], function (Controller, JSONModel, History, oPPCCommon, oSSCommon) {
	"use strict";
	var oi18n = "",
		oPPCUtili18n = "";
	var oDevice = sap.ui.Device;
	var busyDialog = new sap.m.BusyDialog();
	return Controller.extend("com.arteriatech.zsf.quot.controller.ApproveList", {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 */
		onInit: function () {
			this.onInitialHookUps();
		},
		onInitialHookUps: function () {
			busyDialog.open();
			gApproveListView = this.getView();

			this._oView = this.getView();
			oPPCCommon.initMsgMangerObjects();
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this._oView));
			oi18n = this._oComponent.getModel("i18n").getResourceBundle();
			oPPCUtili18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			//Attach event for routing on view patter matched 
			this._oRouter.attachRouteMatched(this.onRouteMatched, this);
			this.setDefaultSettings();
			if (this.onInitialHookUps_Exit) {
				this.onInitialHookUps_Exit();
			}
		},
		onRouteMatched: function (oEvent) {
			if (oEvent.getParameter("name") !== "quotapprovelist" && oEvent.getParameter("name") !== "searchquotapprovelist" && oEvent.getParameter(
					"name") !== "quotapprovelistapp" && oEvent.getParameter("name") !== "quotapprove") {
				return;
			}
			var that = this;
			var oDataModel = this._oComponent.getModel("PUGW");
			oSSCommon.setODataModel(oDataModel);
			var oHistory = sap.ui.core.routing.History.getInstance();
			if (oHistory.getDirection() !== "Backwards") {
				that.getQuotApproveList();
			} else if (oEvent.getParameter("name") === "quotapprovelist" || oEvent.getParameter("name") === "quotapprovelistapp") {
				that.getQuotApproveList();
			} else {
				that.getQuotApproveList();
			}
		},
		getCurrentUsers: function (sServiceName, sRequestType) {
			var sLoginID = oSSCommon.getCurrentLoggedUser({
				sServiceName: sServiceName,
				sRequestType: sRequestType
			});
			return sLoginID;
		},
		onPressRefresh: function () {
			var that = this;
			if (that.getView().byId("RefreshBtn")) {
				that.getView().byId("RefreshBtn").setEnabled(false);
			}
			busyDialog.open();
			that.getQuotApproveList();
		},
		getQuotApproveList: function () {
			busyDialog.open();
			var that = this;
			var SOItemsListModel = this._oComponent.getModel("PCGW");
			oSSCommon.getCurrentLoggedUser({
				sServiceName: "Tasks",
				sRequestType: "read"
			}, function (LoginID) {
				SOItemsListModel.setHeaders({
					"x-arteria-loginid": LoginID
				});
				SOItemsListModel.read("/Tasks", {
					filters: that.prepareSOApprItemsODataFilter(LoginID),
					urlParameters: {
						"$select": "EntityKeyID,EntityDate1,EntityAttribute1,EntityAttribute2,EntityAttribute5,EntityAttribute6,EntityAttribute9,EntityAttribute10,EntityQty1,EntityUOM,EntityValue1,EntityCurrency,InstanceID,EntityType,EntityAttribute11,EntityAttribute12,EntityAttribute7,EntityAttribute8,EntityAttribute13,EntityAttribute14,EntityAttribute15,EntityAttribute16,EntityAttribute17,EntityAttribute18"
					},
					success: function (oData) {
						oData = oPPCCommon.formatItemsOData({
							oData: oData
						});
						for (var i = 0; i < oData.length; i++) {
							oData[i].EntityKeyID = (parseInt(oData[i].EntityKeyID)).toString();
							if (isNaN(oData[i].EntityKeyID)) {
								oData[i].EntityKeyIDTemp = (parseFloat(oData[i].EntityKeyID)).toString();
							} else {
								oData[i].EntityKeyIDTemp = oData[i].EntityKeyID;
							}
						}
						var oTasksItemsModel = new sap.ui.model.json.JSONModel();
						oTasksItemsModel.setData(oData);
						oTasksItemsModel.setSizeLimit(oData.length);
						that._oComponent.setModel(oTasksItemsModel, "Tasks");
						that.getView().getModel("LocalViewSetting").setProperty("/ListItemsCount", oData.length);
						that.applyUITableGrouping(0);
						busyDialog.close();
						that.getView().getModel("LocalViewSettingApprv").setProperty("/selectedCheckbox", false);
						that._oComponent.getModel("LocalViewSettingApprv").setProperty("/approveButton", true);
						that._oComponent.getModel("LocalViewSettingApprv").setProperty("/rejectButton", true);
						if (that.getView().byId("RefreshBtn")) {
							that.getView().byId("RefreshBtn").setEnabled(true);
						}

					},
					error: function (error) {
						var oTasksItemsModel = new sap.ui.model.json.JSONModel();
						oTasksItemsModel.setData([]);
						that._oComponent.setModel(oTasksItemsModel, "Tasks");
						that.getView().getModel("LocalViewSetting").setProperty("/ListItemsCount", 0);
						oPPCCommon.dialogErrorMessage(error, oPPCUtili18n.getText("common.Dialog.Error.ServiceError.Header"));
						busyDialog.close();
						if (that.getView().byId("RefreshBtn")) {
							that.getView().byId("RefreshBtn").setEnabled(true);
						}
					}
				});
			});
		},
		applyUITableGrouping: function (iPosition) {
			var oColumn = this.getView().byId("UIApproveTable").getColumns()[0];
			var sOrder = "Descending"; // ? "Descending" : "Ascending";
			this.getView().byId("UIApproveTable").sort(oColumn, sOrder, false);

			var aColumn = this.getView().byId("UIApproveTable").getColumns()[1];
			var sItemNo = "Ascending"; // ? "Descending" : "Ascending";
			this.getView().byId("UIApproveTable").sort(aColumn, sItemNo, true);
			if (this.applyUITableGrouping_Exit) {
				this.applyUITableGrouping_Exit(iPosition);
			}
		},
		prepareSOApprItemsODataFilter: function (LoginID) {
			var QuotItemsFilters = new Array();
			QuotItemsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", QuotItemsFilters, "LoginID", "", [LoginID], false, false,
				false);
			QuotItemsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", QuotItemsFilters, "EntityType", sap.ui.model.FilterOperator
				.EQ, ["QOT"], true, false, false);
			if (this.prepareSOApprItemsODataFilter_Exit) {
				QuotItemsFilters = this.prepareSOApprItemsODataFilter_Exit(QuotItemsFilters);
			}
			return QuotItemsFilters;
		},
		setDefaultSettings: function () {
			var oLocalViewSettingModel = new sap.ui.model.json.JSONModel();
			oLocalViewSettingModel.setData({
				ListItemsCount: 0,
				approveButton: true,
				rejectButton: true
			});
			this.getView().setModel(oLocalViewSettingModel, "LocalViewSetting");
		},
		/*------------------------------------------Navigation-------------------------------------------*/
		/** Routing navigation to SO Details with SONumber */
		getQuotDetails: function (oEvent) {
			var path = "";
			var oModelContext = oEvent.getSource().getBindingContext("Tasks");
			/**
			 * Check for the Multi-Origin of the service
			 * If true pass Multi-Origin Property in the routing
			 */
			if (oPPCCommon.isMultiOrigin(oModelContext)) {
				var SAPMultiOriginPropertyName = oPPCCommon.getSAPMultiOriginPropertyName();
				path = "(QuotationNo='" + oModelContext.getProperty("EntityKeyID") + "',InstanceID='" + oModelContext.getProperty("InstanceID") +
					"'," +
					SAPMultiOriginPropertyName + "='" + oModelContext.getProperty(SAPMultiOriginPropertyName) + "')";
				// path = "Quotations(QuotationNo='" + oModelContext.getProperty("EntityKeyID") + "'," +
				// 	SAPMultiOriginPropertyName + "='" + oModelContext.getProperty(SAPMultiOriginPropertyName) + "')";
			} else {
				path = "Quotations(QuotationNo='" + oModelContext.getProperty("EntityKeyID") + "',InstanceID='" + oModelContext.getProperty(
					"InstanceID") + "')";
				// path = "Quotations(QuotationNo='" + oModelContext.getProperty("EntityKeyID") + "')";
			}
			this._oRouter.navTo("approveDetailPage", {
				contextPath: path
			}, false);
		},

		/*------------------------------------------Table Filter, Sorter & Export to EXCEL-------------------------------------*/
		sorterFilterApprove: function () {
			if (!this._busyDialog) {
				this._busyDialog = sap.ui.xmlfragment("com.arteriatech.zsf.quot.util.ApproveDialog", this);
			}
			var oModel = this.getView().getModel("PCGW");
			this._busyDialog.setModel(oModel, "PCGW");
			var oi18nModel = this.getView().getModel("i18n");
			this._busyDialog.setModel(oi18nModel, "i18n");
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._busyDialog);
			this._busyDialog.open();
		},
		exportToExcel: function (oEvent) {
			var table1 = this.getView().byId("ApproveTable");
			var items;
			items = table1.getItems();
			if (items.length > 0) {
				if (oDevice.system.desktop) {
					oPPCCommon.copyAndApplySortingFilteringFromUITable({
						thisController: this,
						mTable: this.getView().byId("ApproveTable"),
						uiTable: this.getView().byId("UIApproveTable")
					});
				}
			}
			var table = this.getView().byId("ApproveTable"); // oEvent.getSource().getParent().getParent();
			var oModel = this.getView().getModel("Tasks");
			oPPCCommon.exportToExcel(table, oModel, {
				bExportAll: false,
				oController: this,
				bLabelFromMetadata: false,
				sModel: "PCGW",
				sEntityType: "Task",
				oUtilsI18n: oPPCUtili18n,
				sFileName: "SORs"
			});
		},
		setTableRowCount: function (fItemsCount) {
			if (fItemsCount < 10) {
				this.getView().getModel("LocalViewSetting").setProperty("/tableRowCount", fItemsCount);
			} else {
				this.getView().getModel("LocalViewSetting").setProperty("/tableRowCount", 10);
			}
		},
		// approve checkbox
		onselectedCheckbox: function (oEvent) {
			var that = this;
			var selected = oEvent.mParameters.selected;
			var sPath = oEvent.getSource().getBindingContext("Tasks").getPath();
			var iItemIndex = parseInt(sPath.split("/")[1].trim());
			var listItems = this.getView().getModel("Tasks").getProperty("/");
			for (var i = 0; i < listItems.length; i++) {
				if (selected) {
					if (iItemIndex === i) {
						this.getView().getModel("Tasks").setProperty("/" + i + "/selectedCheckbox", true);
					} else {
						this.getView().getModel("Tasks").setProperty("/" + i + "/selectedCheckbox", false);
					}
				} else {
					this.getView().getModel("Tasks").setProperty("/" + i + "/selectedCheckbox", false);
				}
			}
			busyDialog.close();
		}

		// collectionAllItemSelect: function (oEvent) {
		// 	var oView = this.getView();
		// 	busyDialog.open();
		// 	var that = this;
		// 	var selected = oEvent.mParameters.selected;
		// 	var Tasks = this.getView().getModel("Tasks").getProperty("/");
		// 	for (var i = 0; i < Tasks.length; i++) {
		// 		if (selected === true) {
		// 			this.getView().getModel("Tasks").setProperty("/" + i + "/selectedCheckbox", true);
		// 			that._oComponent.getModel("LocalViewSettingApprv").setProperty("/selectedCheckbox", true);
		// 		} else {
		// 			this.getView().getModel("Tasks").setProperty("/" + i + "/selectedCheckbox", false);
		// 			that._oComponent.getModel("LocalViewSettingApprv").setProperty("/selectedCheckbox", false);
		// 		}
		// 	}
		// 	busyDialog.close();
		// },

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 */
		//		onBeforeRendering: function() {

		//		},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 */
		/*onAfterRendering: function() {

		},*/

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 */
		//		onExit: function() {

		//		}

	});

});
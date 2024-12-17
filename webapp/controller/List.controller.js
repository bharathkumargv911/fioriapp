jQuery.sap.require("com.arteriatech.zsf.quot.view.ErrorLog");

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"com/arteriatech/ppc/utils/js/Common",
	"com/arteriatech/ss/utils/js/Common",
	"com/arteriatech/ss/utils/js/CommonValueHelp",
	"com/arteriatech/ss/utils/js/UserMapping",
	"com/arteriatech/zsf/quot/util/Formatter"
], function (Controller, JSONModel, History, oPPCCommon, oProductCommon, oCommonValueHelp) {
	"use strict";
	var oi18n, oUtilsI18n;
	var Device = sap.ui.Device;
	var oPPCCommon = com.arteriatech.ppc.utils.js.Common;
	var oProductCommon, oProductUserMapping, oCommonValueHelp;
	var oSSCommon = com.arteriatech.ss.utils.js.Common;
	var oSSCommonValueHelp = com.arteriatech.ss.utils.js.CommonValueHelp;
	var busyDialog = new sap.m.BusyDialog();
	var product = "PD";
	return Controller.extend("com.arteriatech.zsf.quot.controller.List", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.arteriatech.zsf.quot.view.List
		 */
		onInit: function () {
			this.onInitHookUp();
		},
		onInitHookUp: function () {
			this._oView = this.getView();
			gListPageView = this.getView();
			/**
			 * Get reference of the Parent component i.e Component.js
			 */
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this._oView));
			if (product === "PPS") {
				oProductCommon = com.arteriatech.pps.utils.js.Common;
				oCommonValueHelp = com.arteriatech.pps.utils.js.CommonValueHelp;
				oProductUserMapping = com.arteriatech.pps.utils.js.UserMapping;
			} else if (product === "PD") {
				oProductCommon = com.arteriatech.ss.utils.js.Common;
				oCommonValueHelp = com.arteriatech.ss.utils.js.CommonValueHelp;
				oProductUserMapping = com.arteriatech.ss.utils.js.UserMapping;
			} else if (product === "CL") {
				oProductCommon = com.arteriatech.cl.utils.js.Common;
				oCommonValueHelp = com.arteriatech.cl.utils.js.CommonValueHelp;
				oProductUserMapping = com.arteriatech.cl.utils.js.UserMapping;
			}
			oi18n = this._oComponent.getModel("i18n").getResourceBundle();
			oUtilsI18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();
			this.setDefaultSettings();
			//Router Initialisation
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			//Attach event for routing on view patter matched 
			this._oRouter.attachRouteMatched(this.onRouteMatched, this);
			this.setValuehelpPropety();
			if (this.onInitHookUp_Exit) {
				this.onInitHookUp_Exit();
			}
		},
		onRouteMatched: function (oEvent) {
			/**Check if the routing is "TO THE VIEW" or "FROM THE VIEW"
			 * If "TO THE VIEW" the value of oEvent.getParameter("name") will be same as view name registered in the routing(manifest.json)
			 * Only if "TO THE VIEW" execute the controller methods else just return from controller
			 */
			if (oEvent.getParameter("name") !== "ListPage" && oEvent.getParameter("name") !== "SearchListPage") {
				return;
			}
			if (oPPCCommon.getFLPTileAction() === "Approve") {
				this._oRouter.navTo("quotapprovelist", {}, true);
			} else {
				busyDialog.open();
				var selectedCustomer = "";
				var oDataModel = this.getView().getModel("PUGW");
				oProductCommon.setODataModel(oDataModel);
				var that = this;
				var oHistory = sap.ui.core.routing.History.getInstance();
				this.contextPath = oEvent.getParameter("arguments").contextPath;
				oPPCCommon.removeAllMsgs();
				if (oHistory.getDirection() !== "Backwards") {
					this.onReset();
					if (oEvent.getParameter("name") === "SearchListPage") {
						this.contextPath = oEvent.getParameter("arguments").contextPath;
						oProductCommon.getCustomerInputType(function (CustomerInputType) {
							that.sCustomerInputType = CustomerInputType;
							that.getParametersFromContext(that.contextPath);
						});
					} else {
						oProductCommon.getCustomerInputType(function (CustomerInputType) {
							that.sCustomerInputType = CustomerInputType
							that.getCustomers("", function () {
								busyDialog.close();
							});
						});
					}
				} else {
					this.getQuotations();
				}
			}
		},
		/* 
			1)Clear All Models.
			2)Reset all default selection fileds.
		*/
		onReset: function () {
			//Remove Tokens from all MultiInputs 
			var aValueHelpIDs = []; //<ToAdd all ValueHelp IDs with cama seperation>
			this.clearTokens(aValueHelpIDs);

			//Clear Model
			if (this.getView().getModel("QuotationItems") !== undefined) {
				this.getView().getModel("QuotationItems").setProperty("/", {});
				this.resetUITable();
			}

			if (this.onReset_Exit) {
				this.onReset_Exit();
			}
		},
		resetUITable: function () {
			oPPCCommon.clearUITable(this.getView(), "UIListTable", "QuotationItems");

			if (this.resetUITable_Exit) {
				this.resetUITable_Exit();
			}
		},

		clearTokens: function (mParameters) {
			for (var i = 0; i < mParameters.length; i++) {
				this.getView().byId(mParameters[i]).removeAllTokens();
			}
		},

		setDefaultSettings: function () {
			/**
			 * All view related local settings should be mapped in a Model and is called LocalViewSetting
			 */
			var oViewSettingModel = new sap.ui.model.json.JSONModel();
			this.viewSettingData = {
				ListItemsCount: 0,
				CustomerColumnVisibleInF4: true,
				CustomerDD: false,
				CustomerMC: false,
				CustomerVH: false,
				DateFormat: oProductCommon.getDateFormat(),
				approveButton: true,
				approveButton: true,

			};
			oViewSettingModel.setData(this.viewSettingData);
			this._oComponent.setModel(oViewSettingModel, "LocalViewSetting");
			if (this.setDefaultSettings_Exit) {
				this.setDefaultSettings_Exit();
			}
		},
		getCurrentServerDate: function (oController, callback) {
			var oModelData = oController._oComponent.getModel("PCGW");
			oModelData.read("/Today", {
				dataType: "json",
				success: function (data) {
					if (callback) {
						callback(data.Today.Now);
					}
				},
				error: function (error) {
					if (callback) {
						sap.m.MessageBox.error(
							"Cannot laod Server Date", {
								styleClass: "sapUiSizeCompact"
							}
						);
					}
				}
			});
		},
		getDateDDValues: function () {
			var that = this;
			var sDateRange = oSSCommon.getProductFeatureValue({
				Types: "DTRNGCHK"
			});
			this.QuotationDateDifference = sDateRange;
			this.PreviousSelectedKeyQuotationDate = this.QuotationDateDifference;
			this.getCurrentServerDate(this, function (Today) {
				that.getView().getModel("LocalViewSetting").setProperty("/Today", Today);
				var date = that.getView().getModel("LocalViewSetting").getProperty("/Today");
				window.localStorage.setItem('name', JSON.stringify(date));
				var oneDayBackDate = that.getView().getModel("LocalViewSetting").getProperty("/Today");
				oneDayBackDate.setDate(Today.getDate() + parseInt(that.QuotationDateDifference));
				var todate = window.localStorage.getItem('name');
				var a = todate;
				var b = a.replace(/"/g, '');
				that.QuotationDate = {
					FromDate: oneDayBackDate,
					ToDate: new Date(b.split("T")[0])
				};
			});
			/*for Inquiry Date*/
			if (this.getView().getModel("QuotationDateViewSetting")) {
				this.getView().getModel("QuotationDateViewSetting").setProperty("/", {});
			}
			var oDataDate = [{
				DateKey: "",
				DateDesc: "Any"
			}, {
				DateKey: "0",
				DateDesc: "Today"
			}, {
				DateKey: "-1",
				DateDesc: "Today and Yesterday"
			}, {
				DateKey: "-7",
				DateDesc: "Last Seven Days"
			}, {
				DateKey: "-30",
				DateDesc: "Last One Month"
			}, {
				DateKey: "MS",
				DateDesc: "Manual Selection"
			}];
			oPPCCommon.getDateDropDownValue(oDataDate, this, "inputQuotationDate", "QuotationDateViewSetting", this.QuotationDateDifference);

		},
		onQuotationDateSelectionChanged: function (oEvent) {
			var that = this;
			var oDateSelect = oEvent.getSource();
			var sSelectedKey = oEvent.getParameter("selectedItem").getKey();
			that.openManualDateSelectionDialog(this, sSelectedKey, oDateSelect, this.PreviousSelectedKeyQuotationDate,
				"QuotationDateViewSetting",
				oi18n,
				"inputQuotationDate",
				function (date) {
					that.QuotationDate.FromDate = date.fromDate;
					that.QuotationDate.ToDate = date.toDate;
				});
			// this.PreviousSelectedKeyQuotationDate = oEvent.getParameter("selectedItem").getKey();
			if (oEvent.getParameter("selectedItem").getKey() !== "MS") {
				this.PreviousSelectedKeyQuotationDate = oEvent.getParameter("selectedItem").getKey();
			}
		},
		openManualDateSelectionDialog: function (that, sSelectedKey, oDateSelect, previousSelectedKey, model, oi18n, fieldId,
			requestCompleted, sFormatType) {
			that.dateRange = {
				fromDate: null,
				toDate: null
			};
			var view = that.getView();
			if (sSelectedKey === "MS") {
				var dateRangeSelectionDialog;
				that.OkButton = new sap.m.Button({
					text: 'OK',
					enabled: false,
					press: function () {
						if (that.DateRangeSelection.getDateValue() && that.DateRangeSelection.getSecondDateValue()) {
							var oData = view.getModel(model).getData();
							if (oData[oData.length - 1].DateKey === "SD") {
								oData.splice(oData.length - 1, 1);
							}
							view.getModel(model).setData(oData);

							that.DateManulaSeletedDesc = com.arteriatech.ppc.utils.js.Common.formatSelectedDate(that.DateRangeSelection.getDateValue(),
								that.DateRangeSelection.getSecondDateValue(), oi18n, sFormatType);
							var oDataLength = view.getModel(model).getData().length - 1;
							//						view.getModel(model).setProperty("/"+oDataLength+"/DateDesc", that.DateManulaSeletedDesc)
							var newData = view.getModel(model).getData();
							newData.push({
								DateKey: "SD",
								DateDesc: that.DateManulaSeletedDesc
							});
							view.getModel(model).setData(newData);
							view.byId(fieldId).setSelectedKey("SD");
							var fromDate = that.DateRangeSelection.getDateValue();
							//fromDate.setDate(fromDate.getDate() + 1);
							that.dateRange.fromDate = fromDate;
							var toDate = that.DateRangeSelection.getSecondDateValue();
							//toDate.setDate(toDate.getDate() + 1);
							that.dateRange.toDate = toDate;
							dateRangeSelectionDialog.close();
						}
						if (requestCompleted) requestCompleted(that.dateRange);
						return that.dateRange
					}

				});

				that.DateRangeSelection = new sap.m.DateRangeSelection({
					change: function () {
						if (that.DateRangeSelection.getDateValue() && that.DateRangeSelection.getSecondDateValue()) {
							that.OkButton.setEnabled(true);
						} else {
							that.OkButton.setEnabled(false);
						}
					},
					displayFormat: sFormatType
				});
				dateRangeSelectionDialog = new sap.m.Dialog({
					title: "Select Date Manually",
					type: 'Standard',
					resizable: true,
					draggable: true,
					content: [
						that.DateRangeSelection
					],
					beginButton: that.OkButton,
					endButton: new sap.m.Button({
						text: 'Cancel',
						press: function () {
							var oData = view.getModel(model).getData();
							if (oData[oData.length - 1].DateKey === "SD") {
								view.byId(fieldId).setSelectedKey("SD");
							} else {
								view.byId(fieldId).setSelectedKey(previousSelectedKey);
								that.setASNDateRange(that, previousSelectedKey);
							}
							dateRangeSelectionDialog.close();
						}
					}),
					afterClose: function () {
						dateRangeSelectionDialog.destroy();
					}
				});
				if (!jQuery.support.touch) {
					dateRangeSelectionDialog.addStyleClass("sapUiSizeCompact");
				}
				dateRangeSelectionDialog.open();

			} else {
				var oData = that.getView().getModel(model).getData();
				if (oData[oData.length - 1].DateKey === "SD") {
					oData.splice(oData.length - 1, 1);
				}
				that.getView().getModel(model).setData(oData);
				that.dateValues = that.setASNDateRange(that, sSelectedKey);
				that.dateRange.fromDate = that.dateValues.fromDate;
				that.dateRange.toDate = that.dateValues.toDate;

				if (requestCompleted) requestCompleted(that.dateRange);
				return that.dateRange;
			}
		},
		setASNDateRange: function (that, sSelectedKey) {
			that.DateValue = {
				fromDate: null,
				toDate: null
			};
			sSelectedKey = parseInt(sSelectedKey);
			if (!isNaN(sSelectedKey)) {
				var todate = window.localStorage.getItem('name');
				var a = todate;
				var b = a.replace(/"/g, '');
				that.DateValue.toDate = new Date(b.split("T")[0]);
				var fromDate = new Date(b.split("T")[0]);
				fromDate.setDate(fromDate.getDate() + sSelectedKey);
				that.DateValue.fromDate = fromDate;
			}
			return that.DateValue;
		},
		/*------------------------------------------Extracting Value from Contextpath------------------------*/
		getParametersFromContext: function () {
			//<ToAdd>

			var that = this;
			this.iTotalValueHelps = 3;
			var customer = oPPCCommon.getPropertyValueFromContextPath(that.contextPath, "CustomerNo");
			var dQuotationDate = oPPCCommon.getPropertyValueFromContextPath(that.contextPath, "QuotationDate");
			var QuotationNo = oPPCCommon.getPropertyValueFromContextPath(that.contextPath, "QuotationNo");
			var MaterialNo = oPPCCommon.getPropertyValueFromContextPath(that.contextPath, "MaterialNo");
			var QuotationType = oPPCCommon.getPropertyValueFromContextPath(that.contextPath, "QuotationType");
			//var material = oPPCCommon.getPropertyValueFromContextPath(that.contextPath, "Material");
			//	var status = oPPCCommon.getPropertyValueFromContextPath(that.contextPath, "Status");
			if (oPPCCommon.getPropertyValueFromContextPath(that.contextPath, "SalesArea") !== "" && oPPCCommon.getPropertyValueFromContextPath(
					that.contextPath, "SalesArea") !== undefined) {
				var SalesArea = oPPCCommon.getPropertyValueFromContextPath(that.contextPath, "SalesArea").split('-').join('/');

			}
			var SalesOffice = oPPCCommon.getPropertyValueFromContextPath(that.contextPath, "SalesOffice");
			if (QuotationType) {
				this.getView().byId("inputQuotationType").setSelectedKeys(QuotationType.split(";"));
			}
			/*	if (status) {
					this.getView().byId("inputStatus").setSelectedKeys(status.split(";"));
				}*/
			if (SalesArea) {
				this.getView().byId("inputSalesArea").setSelectedKeys(SalesArea.split(";"));
			}
			if (SalesOffice) {
				this.getView().byId("inputSalesOffice").setSelectedKeys(SalesOffice.split(";"));
			}
			if (this.sCustomerInputType === "VH") {
				// this.iTotalValueHelps++;
				if (customer !== "") {
					var sCustomerFilters = new Array();
					sCustomerFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "inputCustomerNo", sCustomerFilters, "CustomerNo", sap.ui.model
						.FilterOperator.EQ, customer.split(";"), true, false, false);
					var oModelData = this._oComponent.getModel("SFGW_MST");
					oProductCommon.createTokens(oModelData, "Customers", sCustomerFilters, "CustomerNo", "Name", this.getView().byId(
						"inputCustomerNo"), function () {
						that.callService();
					});
				} else {
					that.getCustomers(customer);
					that.callService();
				}
			} else {
				that.getCustomers(customer);
				that.callService();
			}

			if (QuotationNo !== "") {
				var sQuotationNoFilters = [];
				sQuotationNoFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "inputQuotationNo", sQuotationNoFilters, "QuotationNo",
					sap.ui
					.model
					.FilterOperator
					.EQ, QuotationNo.split(";"), true, false, false);
				oModelData = this._oComponent.getModel("SFGW_INQ");
				oProductCommon.createTokens(oModelData, "Quotations", sQuotationNoFilters, "QuotationNo", "QuotationNo", this.getView().byId(
					"inputQuotationNo"), function () {
					that.callService();
				});
			} else {
				that.callService();
			}

			// if (MaterialNo !== "") {
			// 	var sMaterialFilters = [];
			// 	sMaterialFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "inputMaterial", sMaterialFilters, "MaterialNo", sap.ui.model
			// 		.FilterOperator
			// 		.EQ, MaterialNo.split(";"), true, false, false);
			// 	var oModelData = this._oComponent.getModel("SFGW_MST");
			// 	oSSCommon.createTokens(oModelData, "Materials", sMaterialFilters, "MaterialNo", "MaterialDesc", this.getView().byId(
			// 			"inputMaterial"),
			// 		function() {
			// 			that.callService();
			// 		});
			// } else {
			// 	that.callService();
			// }

			that.getView().byId("inputQuotationDate").setSelectedKey(dQuotationDate);
			if (dQuotationDate !== "") {

				var QuotationDateFrom = oPPCCommon.getPropertyValueFromContextPath(that.contextPath, "QuotationFromDate");
				var QuotationDateTo = oPPCCommon.getPropertyValueFromContextPath(that.contextPath, "QuotationToDate");
				this.QuotationDate = {
					FromDate: new Date(QuotationDateFrom),
					ToDate: new Date(QuotationDateTo)
				};
				that.callService();
				if (dQuotationDate === "SD") {
					oPPCCommon.setMaunalSelectedDate(this, QuotationDateFrom, QuotationDateTo, "QuotationDateViewSetting", "inputQuotationDate",
						dQuotationDate,
						oi18n);
				}
			} else {
				this.QuotationDate = {
					FromDate: null,
					ToDate: null
				};

				that.callService();
			}
			/*if (material !== "") {
				var sMaterialFilters = [];
				sMaterialFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "inputMaterial", sMaterialFilters, "MaterialNo", sap.ui.model
					.FilterOperator
					.EQ, material.split(";"), true, false, false);
				oModelData = this._oComponent.getModel("SFGW_MST");
				oProductCommon.createTokens(oModelData, "Materials", sMaterialFilters, "MaterialNo", "MaterialDesc", this.getView().byId(
						"inputMaterial"),
					function() {
						that.callService();
					});gotoDetails
			} else {
				that.callService();
			}*/

			if (this.getParametersFromContext_Exit) {
				this.getParametersFromContext_Exit();
			}
		},
		QuotationNoTokenChange: function (oEvent) {
			var that = this;
			if (that.getView().byId("inputQuotationNo").getTokens().length === 1 && oEvent.getParameter("type") === "removed") {
				that.openManualDateSelectionDialog(that, -30, "", that.PreviousSelectedKeyQuotationDate, "QuotationDateViewSetting",
					oi18n, "QuotationDate",
					function (date) {
						that.QuotationDate.FromDate = date.fromDate;
						that.QuotationDate.ToDate = date.toDate;
					});
				that.getView().byId("inputQuotationDate").setSelectedKey("-30");
			}
		},
		ontokenUpdateCustomer: function (oEvent) {
			var that = this;
			if (that.getView().byId("inputQuotationNo")) {
				that.getView().byId("inputQuotationNo").removeAllTokens();
			}
			that.openManualDateSelectionDialog(that, -30, "", that.PreviousSelectedKeyQuotationDate, "QuotationDateViewSetting",
				oi18n, "QuotationDate",
				function (date) {
					that.QuotationDate.FromDate = date.fromDate;
					that.QuotationDate.ToDate = date.toDate;
				});
			that.getView().byId("inputQuotationDate").setSelectedKey("-30");
			// if (that.getView().byId("inputCustomerNo").getTokens().length === 1 && oEvent.getParameter("type") === "removed") {

			// }
			if (that.getView().byId("inputCustomerNo").getTokens().length > 0) {
				var Temp = [];
				var CustTokens = that.getView().byId("inputCustomerNo").getTokens();
				if (CustTokens.length != "") {
					for (var j = 0; j < CustTokens.length - 1; j++) {
						if (CustTokens[j].mProperties.key) {
							Temp.push(CustTokens[j].mProperties.key);
						}
					}
				}
				if (Temp.length > 0) {
					that.setQuotationModel(Temp);
				}
			}
		},
		/*-----------------------------------------Search event on Go from Filterbar-------------------------*/
		onSearch: function () {
			this.validateMandatory();
			if (oPPCCommon.doErrMessageExist()) {
				busyDialog.open();
				this.resetUITable();
				this.getQuotations();
			} else {
				oPPCCommon.displayMsg_MsgBox(this.getView(), oPPCCommon.getMsgsFromMsgMgr(), "error");
			}
		},
		getQuotations: function () {
			var that = this;
			var ListItemsListModel = this._oComponent.getModel("SFGW_INQ");
			oSSCommon.getCurrentLoggedUser({
				sServiceName: "QuotationItems",
				sRequestType: "read"
			}, function (LoginID) {
				ListItemsListModel.setHeaders({
					"x-arteria-loginid": LoginID
				});
				ListItemsListModel.read("/QuotationItems", {
					filters: that.prepareItemsODataFilter(LoginID),
					urlParameters: {
						"$select": "QuotationNo,QuotationDate,ZZDCAName,ZZDCACode,QuotationType,QuotationTypeDesc,SalesArea,SalesAreaDesc,Quantity,Payterm,PaytermDesc,ZZCity,ReqDeliveryDate,ZZSOQuantity,GrossAmount,DiscAmount,TaxAmount,NetValue,RejReason,RejReasonDesc,CustomerNo,CustomerName,Material,MaterialDesc,Plant,PlantDsec,ZZSoNo,StatusID,StatusDesc,Currency,FrieghtAmount,SalesOffice,SaleOfcDesc,Uom,ZZApprovalStatus,ZZApprovalStsDesc,ZZCrdtBlckSts,ZZCrdtBlckStsDesc"
					},
					success: function (oData) {
						oData = oPPCCommon.formatItemsOData({
							oData: oData
						});
						if (oData.length > 0) {
							for (var i = 0; i < oData.length; i++) {
								if (isNaN(oData[i].QuotationNo)) {
									oData[i].QuotationNoTemp = parseFloat(oData[i].QuotationNo);
								} else {
									oData[i].QuotationNoTemp = oData[i].QuotationNo;
								}
							}
							that.setListItemsData(oData);
							that.applyUITableGrouping(0);
						} else {
							that.setNodataFound();
						}
						busyDialog.close();
					},
					error: function (error) {
						that.setNodataFound();
						oPPCCommon.dialogErrorMessage(error, oUtilsI18n.getText("common.Dialog.Error.ServiceError.Header"));
						busyDialog.close();
					}
				});
			});
		},
		callService: function () {
			this.iTotalValueHelps--;
			if (this.iTotalValueHelps === 0) {
				this.getQuotations();
			}
		},
		setListItemsData: function (oData) {
			var oItemsModel = new sap.ui.model.json.JSONModel();
			oItemsModel.setData(oData);
			oItemsModel.setSizeLimit(oData.length);
			this._oComponent.setModel(oItemsModel, "Quotations");
			this.getView().getModel("LocalViewSetting").setProperty("/ListItemsCount", oData.length);
		},
		setTableTitle: function (dataCount) {
			this.getView().getModel("LocalViewSetting").setProperty("/ListItemsCount", dataCount);
		},

		prepareItemsODataFilter: function (LoginID) {
			var ListItemsFilters = new Array();
			if (this.sCustomerInputType === "DD") {
				ListItemsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListItemsFilters, "CustomerNo", sap.ui.model.FilterOperator
					.EQ, [
						this.getView().byId("customer").getSelectedKey()
					], false, false, false);
			} else if (this.sCustomerInputType === "VH") {
				var CustTokens = this.getView().byId("inputCustomerNo").getTokens();
				if (CustTokens.length != "") {
					for (var j = 0; j < CustTokens.length; j++) {
						if (CustTokens[j].mProperties.key) {
							ListItemsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListItemsFilters, "CustomerNo", sap.ui.model.FilterOperator
								.EQ, [
									CustTokens[j].mProperties.key
								],
								false, false, false);
						}
					}
				}
			}
			var QuotTokens = this.getView().byId("inputQuotationNo").getTokens();
			if (QuotTokens.length != "") {
				for (var j = 0; j < QuotTokens.length; j++) {
					if (QuotTokens[j].mProperties.key) {
						ListItemsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListItemsFilters, "QuotationNo", sap.ui.model.FilterOperator
							.EQ, [
								QuotTokens[j].mProperties.key
							],
							false, false, false);
					}
				}
			}
			ListItemsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListItemsFilters, "QuotationDate", sap.ui.model.FilterOperator
				.BT, [
					this.QuotationDate.FromDate, this.QuotationDate.ToDate
				], false, false, false);
			if (this.getView().byId("inputQuotationType").getSelectedKeys().length > 0) {
				ListItemsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "inputQuotationType", ListItemsFilters, "QuotationType", sap
					.ui
					.model.FilterOperator
					.EQ, this.getView().byId("inputQuotationType").getSelectedKeys(), true, false, false);
			} else {
				var SORType = this.getView().getModel("QuotationTypeDD").getData();
				for (var i = 0; i < SORType.length; i++) {
					ListItemsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "inputQuotationType", ListItemsFilters, "QuotationType",
						sap.ui.model.FilterOperator
						.EQ, [SORType[i].Key], true, false, false);
				}
			}
			ListItemsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "inputStatus", ListItemsFilters, "StatusID", sap.ui.model
				.FilterOperator
				.EQ, this.getView().byId("inputStatus").getSelectedKeys(), true, false, false);
			ListItemsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "inputZZApprovalStatus", ListItemsFilters,
				"ZZApprovalStatus", sap.ui.model
				.FilterOperator.EQ, this.getView().byId("inputZZApprovalStatus").getSelectedKeys(), true, false, false);
			ListItemsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListItemsFilters, "LoginID", sap.ui.model.FilterOperator
				.EQ, [LoginID], false, false, false);
			return ListItemsFilters;
		},

		setNodataFound: function () {
			var oView = this.getView();
			/** Clear Model of the view */
			if (oView.getModel("Quotations") !== undefined) {
				oView.getModel("Quotations").setProperty("/", {});
			}
			oView.byId("ListTable").setNoDataText(oUtilsI18n.getText("common.NoResultsFound"));
			oView.byId("UIListTable").setNoData(oUtilsI18n.getText("common.NoResultsFound"));
			oView.byId("UIListTable").setVisibleRowCount(2);
			oView.byId("UIListTable").setMinAutoRowCount(2);
			oView.getModel("LocalViewSetting").setProperty("/ListItemsCount", 0);
		},
		validateMandatory: function (messageArea) {
			oPPCCommon.removeAllMsgs();
			//ToAdd Validations for Mandatory and add error to Messagemanager
			var msg;
			// if (this.sCustomerInputType === "VH") {
			// 	if (this.getView().byId("inputCustomerNo").getTokens().length <= 0) {
			// 		msg = oi18n.getText("common.message.please.select", this.getView().byId("CustomerValueHelp").getLabel());;
			// 		oPPCCommon.addMsg_MsgMgr(msg, "error", "CustomerNo");
			// 		this.getView().byId("inputCustomerNo").setValueState(sap.ui.core.ValueState.Error);
			// 		this.getView().byId("inputCustomerNo").setValueStateText(msg);
			// 	} else {
			// 		this.getView().byId("inputCustomerNo").setValueState(sap.ui.core.ValueState.None);
			// 		this.getView().byId("inputCustomerNo").setValueStateText("");
			// 	}
			// }
			// if (this.sCustomerInputType === "DD") {
			// 	if (this.getView().byId("customer").getSelectedKey() == "") {
			// 		msg = oi18n.getText("common.message.please.select", this.getView().byId("Customer").getLabel());;
			// 		oPPCCommon.addMsg_MsgMgr(msg, "error", "Customer");
			// 		this.getView().byId("customer").setValueState(sap.ui.core.ValueState.Error);
			// 		this.getView().byId("customer").setValueStateText(msg);
			// 	} else {
			// 		this.getView().byId("customer").setValueState(sap.ui.core.ValueState.None);
			// 		this.getView().byId("customer").setValueStateText("");
			// 	}
			// }
			if (this.getView().byId("inputQuotationDate").getSelectedKey() === "" && this.getView().byId("inputQuotationNo").getTokens().length ===
				0) {
				this.byId("inputQuotationNo").setValueState(sap.ui.core.ValueState.Error);
				var msg = oi18n.getText("List.FilterBar.Validation.dateQuotationNumber", [this.getView().byId("QuotationNo").getLabel(), this.getView()
					.byId("QuotationDate").getLabel()
				]);
				this.byId("inputQuotationNo").setValueStateText(msg);
				var msgObj = oPPCCommon.addMsg_MsgMgr(msg, "error", "FG_INQNumberAndINQDate");
			} else {
				var FromDate = this.QuotationDate.FromDate;
				var ToDate = this.QuotationDate.ToDate;
				if (FromDate && ToDate) {
					FromDate.setHours(0, 0, 0, 0);
					ToDate.setHours(0, 0, 0, 0);
					var dateDifference = (ToDate - FromDate) / (1000 * 60 * 60 * 24);
					if (dateDifference > 30) {
						if (this.sCustomerInputType === "DD") {
							var CPNo = this.getView().byId("customer").getSelectedKey();
							if (!CPNo) {
								var msg1 = oi18n.getText("common.message.please.select", this.getView().byId("Customer").getLabel());
								oPPCCommon.addMsg_MsgMgr(msg1, "error", "Customer");
								this.getView().byId("customer").setValueState(sap.ui.core.ValueState.Error);
								this.getView().byId("customer").setValueStateText(msg1);
								return;
							} else {
								this.getView().byId("customer").setValueState(sap.ui.core.ValueState.None);
								this.getView().byId("customer").setValueStateText("");
							}
						} else if (this.sCustomerInputType === "VH") {
							// var CPNo = oPPCCommon.getKeysFromTokens(this.getView(), "inputCustomerNo");
							if (this.getView().byId("inputCustomerNo").getTokens().length <= 0) {
								var msg1 = oi18n.getText("common.message.please.select", this.getView().byId("CustomerValueHelp").getLabel());
								oPPCCommon.addMsg_MsgMgr(msg1, "error", "Customer");
								this.getView().byId("inputCustomerNo").setValueState(sap.ui.core.ValueState.Error);
								this.getView().byId("inputCustomerNo").setValueStateText(msg1);
								return;
							} else {
								this.getView().byId("inputCustomerNo").setValueState(sap.ui.core.ValueState.None);
								this.getView().byId("inputCustomerNo").setValueStateText("");
							}
						}
					}
				}
				if (this.byId("inputQuotationNo").getValue() === "") {
					this.byId("inputQuotationNo").setValueState(sap.ui.core.ValueState.None);
				}
			}
			if (this.validateMandatory_Exit) {
				this.validateMandatory_Exit();
			}
		},

		//add error message to message manager and valuestate
		addErrorMessages: function (view, controlID, msg) {
			view.byId(controlID).setValueState("Error");
			view.byId(controlID).setValueStateText(msg);
			oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/" + controlID);

			//for enhancement
			if (this.addErrorMessages_Exit) {
				this.addErrorMessages_Exit(view, controlID, msg);
			}
		},

		prepareContext: function () {
			var contextPath = "";
			//<TOAdd get value from Filterbar Item>
			var customerNo = this.getSelectedCustomerCode();
			var aQuotationDate = this.getView().byId("inputQuotationDate").getSelectedKey();
			var aQuotationNo = oPPCCommon.getKeysFromTokens(this.getView(), "inputQuotationNo");
			var aMaterialNo = oPPCCommon.getKeysFromTokens(this.getView(), "inputMaterial");
			var QuotationType = oPPCCommon.getKeysFromMultiCombo(this.getView(), "inputQuotationType");
			var aSalesArea = oPPCCommon.getKeysFromMultiCombo(this.getView(), "inputSalesArea").split('/').join('-');
			//var aSalesOffice = oPPCCommon.getKeysFromMultiCombo(this.getView(), "inputSalesOffice");
			//var aInquiryDate = this.getView().byId("inputInquiryDate").getSelectedKey();
			//var aMaterial = oPPCCommon.getKeysFromTokens(this.getView(), "inputMaterial");
			//var sStatus = oPPCCommon.getKeysFromMultiCombo(this.getView(), "inputStatus");
			contextPath = "(CustomerNo=" + customerNo + ",QuotationNo=" + aQuotationNo + ",QuotationType=" + QuotationType +
				",SalesArea=" + aSalesArea +
				",QuotationDate=" + aQuotationDate + ",QuotationFromDate=" + this.QuotationDate.FromDate +
				",QuotationToDate=" +
				this.QuotationDate.ToDate + ",MaterailNo=" + aMaterialNo + ")";

			/*contextPath = "(CustomerNo=" + customerNo + ",QuotationNo=" + aQuotationNo + ",QuotationType=" + QuotationType +
				",QuotationDate=" + aQuotationDate + ",QuotationFromDate=" + this.QuotationDate.FromDate + ",QuotationToDate=" +
				this.QuotationDate.ToDate + ",InquiryDate=" + aInquiryDate + ",InquiryFromDate=" + this.InquiryDate.FromDate + ",InquiryToDate=" +
				this.InquiryDate.ToDate + ")";*/
			if (this.prepareContext_Exit) {
				contextPath = this.prepareContext_Exit(contextPath);
			}
			return contextPath;
		},

		applyTableGrouping: function (sPropertyKey, sPropertyText, sPropertyLabel, aDefaultSorter) {
			oPPCCommon.setGroupInTable(this.getView(), "ListTable", sPropertyKey, true, sPropertyLabel, sPropertyText, aDefaultSorter);
		},

		applyUITableGrouping: function (iPosition) {
			// oPPCCommon.setGroupInUITable(this.getView(), "UIListTable", iPosition);
			var oColumn = this.getView().byId("UIListTable").getColumns()[0];
			var sOrder = "Descending"; // ? "Descending" : "Ascending";
			this.getView().byId("UIListTable").sort(oColumn, sOrder, false);

			var aColumn = this.getView().byId("UIListTable").getColumns()[1];
			var sItemNo = "Ascending"; // ? "Descending" : "Ascending";
			this.getView().byId("UIListTable").sort(aColumn, sItemNo, true);

			if (this.applyUITableGrouping_Exit) {
				this.applyUITableGrouping_Exit(iPosition);
			}
		},

		getCurrentUsers: function (sServiceName, sRequestType, callBack) {
			if (callBack) {
				oProductCommon.getCurrentLoggedUser({
					sServiceName: sServiceName,
					sRequestType: sRequestType
				}, function (LoginID) {
					callBack(LoginID);
				});
			} else {
				var sLoginID = oProductCommon.getCurrentLoggedUser({
					sServiceName: sServiceName,
					sRequestType: sRequestType
				});
				return sLoginID;
			}
		},

		/*-------------------------------------Customer/Customer Related Functions---------------------------*/
		getCustomers: function (customer, requestCompleted, callBack) {
			var that = this;
			that.setCustomerInputVisibility();
			if (that.sCustomerInputType !== "VH") {
				var oCustomerModel = this._oComponent.getModel("SFGW_MST");
				oProductUserMapping.getCustomers(oCustomerModel, "000002", "2", new sap.m.BusyDialog(), this._oComponent, function (aCustomer) {
					if (that.sCustomerInputType === "DD") {
						that.getView().byId("customer").setSelectedKey(customer);
					}
					that.setDropdowns();
					that.getDateDDValues();
					if (aCustomer.length === 1) {
						var Temp = [];
						Temp.push(aCustomer[0].CustomerNo);
						that.setQuotationModel(Temp);
					}
					if (requestCompleted) {
						requestCompleted();
					}
				}, "create", true);
			} else {
				that.setDropdowns();
				that.getDateDDValues();
				that.setCustomerF4Model();
				if (requestCompleted) {
					requestCompleted();
				}
			}
			if (callBack) {
				callBack();
			}
		},
		setDropdowns: function () {
			// this.setMaterialsModel();
			// this.setQuotationModel();
			this.QuotationTypeDD();
			this.getStatusDD();
			this.getApprovalStatusDD();
		},
		setCustomerF4Model: function () {
			var that = this;
			var GlobalCustomerF4SuggestorModel;
			if (sap.ui.getCore().getModel("GlobalCustomerF4SuggestorModel")) {
				GlobalCustomerF4SuggestorModel = sap.ui.getCore().getModel("GlobalCustomerF4SuggestorModel").getData();
			} else {
				GlobalCustomerF4SuggestorModel = [];
			}
			if (GlobalCustomerF4SuggestorModel.length === 0) {
				var oCustomerF4Model = this._oComponent.getModel("SFGW_MST");
				var aCustomerF4Filter = new Array();
				aCustomerF4Filter = oPPCCommon.setODataModelReadFilter("", "", aCustomerF4Filter, "LoginID", "", [
					that.getCurrentUsers("Customers", "read")
				], false, false, false);
				oCustomerF4Model.read("/Customers", {
					filters: aCustomerF4Filter,
					urlParameters: {
						"$select": "CustomerNo,Name"
					},
					success: function (oData) {
						oData = oPPCCommon.formatItemsOData({
							oData: oData.results
						});
						var CustomerF4Model = new sap.ui.model.json.JSONModel();
						CustomerF4Model.setData(oData);
						that.getView().setModel(CustomerF4Model, "CustomerF4SuggestorModel");
					},
					error: function (error) {
						var CustomerF4Model = new sap.ui.model.json.JSONModel();
						CustomerF4Model.setData([]);
						that.getView().setModel(CustomerF4Model, "CustomerF4SuggestorModel");
					}
				});
			} else {
				var oModel = new sap.ui.model.json.JSONModel(GlobalCustomerF4SuggestorModel);
				that.getView().setModel(oModel, "CustomerF4SuggestorModel");
			}
		},
		handleCustomerSuggest: function (oEvent) {
			oPPCCommon.handleSuggest({
				oEvent: oEvent,
				aProperties: ["CustomerNo", "Name"],
				sBinding: "suggestionItems"
			});
		},
		suggestionItemSelectedCustomerF4: function (oEvent) {
			var that = this;
			that.suggestionItemSelectedCustomer({
					oEvent: oEvent,
					thisController: this,
					sModelName: "CustomerF4SuggestorModel",
					sKey: "CustomerNo",
					sDescription: "Name"
				},
				function (key, desc, jData) {
					if (key) {
						if (that.getView().byId("inputQuotationNo")) {
							that.getView().byId("inputQuotationNo").removeAllTokens();
						}
						that.openManualDateSelectionDialog(that, -30, "", that.PreviousSelectedKeyQuotationDate, "QuotationDateViewSetting",
							oi18n, "QuotationDate",
							function (date) {
								that.QuotationDate.FromDate = date.fromDate;
								that.QuotationDate.ToDate = date.toDate;
							});
						that.getView().byId("inputQuotationDate").setSelectedKey("-30");
						var Temp = [];
						Temp.push(key);
						that.setQuotationModel(Temp);
					}
				});
			this.getView().byId("inputCustomerNo").setValueState("None");
			this.getView().byId("inputCustomerNo").setValueStateText("");
		},
		suggestionItemSelectedCustomer: function (mParemeters, callBack) {
			var that = this;
			mParemeters.oEvent.getSource().setValueState("None");
			mParemeters.oEvent.getSource().setValueStateText("");
			var sPath = mParemeters.oEvent.getParameter("selectedItem").getBindingContext(mParemeters.sModelName).getPath();
			if (mParemeters.sGUID) {
				var keyGUID = mParemeters.thisController.getView().getModel(mParemeters.sModelName).getProperty(sPath + "/" + mParemeters.sGUID);
				var key = mParemeters.thisController.getView().getModel(mParemeters.sModelName).getProperty(sPath + "/" + mParemeters.sKey);
				var desc = mParemeters.thisController.getView().getModel(mParemeters.sModelName).getProperty(sPath + "/" + mParemeters.sDescription);
				mParemeters.oEvent.getSource().removeAllTokens();
				mParemeters.oEvent.getSource().addToken(new sap.m.Token({
					key: keyGUID,
					text: that.TextAbstract(desc, key, 10),
					tooltip: desc + " (" + key + ")"
				}));
				mParemeters.oEvent.getSource().setValue("");
			} else {
				var key = mParemeters.thisController.getView().getModel(mParemeters.sModelName).getProperty(sPath + "/" + mParemeters.sKey);
				var desc = mParemeters.thisController.getView().getModel(mParemeters.sModelName).getProperty(sPath + "/" + mParemeters.sDescription);
				mParemeters.oEvent.getSource().removeAllTokens();
				mParemeters.oEvent.getSource().addToken(new sap.m.Token({
					key: key,
					text: that.TextAbstract(desc, key, 10),
					tooltip: desc + " (" + key + ")"
				}));
				mParemeters.oEvent.getSource().setValue("");
			}
			var jData = mParemeters.thisController.getView().getModel(mParemeters.sModelName).getProperty(sPath);
			if (callBack) {
				callBack(key, desc, jData);
			}
		},
		onChangeCustomerF4: function (oEvent) {
			var that = this;
			that.suggestionOnChange({
					oEvent: oEvent,
					thisController: this,
					sModelName: "CustomerF4SuggestorModel",
					sKey: "CustomerNo",
					sDescription: "Name",
					sLabel: that.getView().byId("CustomerValueHelp").getLabel()
				},
				function (enteredVal, bFound, key, desc, jData) {
					if (enteredVal !== "") {
						if (!bFound) {
							var msg = oi18n.getText("List.Filterbar.MultiInput.custNoError", [that.getView().byId("CustomerValueHelp").getLabel()]);
							oPPCCommon.displayMsg_MsgBox(that.getView(), msg, "error");
						} else {
							if (that.getView().byId("inputQuotationNo")) {
								that.getView().byId("inputQuotationNo").removeAllTokens();
							}
							that.openManualDateSelectionDialog(that, -30, "", that.PreviousSelectedKeyQuotationDate, "QuotationDateViewSetting",
								oi18n, "QuotationDate",
								function (date) {
									that.QuotationDate.FromDate = date.fromDate;
									that.QuotationDate.ToDate = date.toDate;
								});
							that.getView().byId("inputQuotationDate").setSelectedKey("-30");
							var Temp = [];
							Temp.push(Key);
							that.setQuotationModel(Temp);
						}
					}
				});
		},
		CustomerF4: function () {
			var that = this;
			this.CustomerTokenInput = this.getView().byId("inputCustomerNo");
			this.aCustomerKeys = ["CustomerNo", "Name"];
			that.CustomerF41({
				oController: this,
				oi18n: oi18n,
				oUtilsI18n: oUtilsI18n,
				bMultiSelect: true,
			}, function (tokens) {
				that.CustomerTokenInput.removeAllTokens();
				if (that.getView().byId("inputQuotationNo")) {
					that.getView().byId("inputQuotationNo").removeAllTokens();
				}
				that.openManualDateSelectionDialog(that, -30, "", that.PreviousSelectedKeyQuotationDate, "QuotationDateViewSetting",
					oi18n, "QuotationDate",
					function (date) {
						that.QuotationDate.FromDate = date.fromDate;
						that.QuotationDate.ToDate = date.toDate;
					});
				that.getView().byId("inputQuotationDate").setSelectedKey("-30");
				var Temp = [];
				if (tokens.length > 0) {
					for (var k = 0; k < tokens.length; k++) {
						that.sCustomer = tokens[k].getCustomData()[0].getValue().CustomerNo;
						that.sCustomerName = tokens[k].getCustomData()[0].getValue().Name;
						that.CustomerTokenInput = that.getView().byId("inputCustomerNo");
						var oToken = new sap.m.Token({
							key: that.sCustomer,
							text: that.TextAbstract(that.sCustomerName, that.sCustomer, 10),
							tooltip: that.sCustomerName + " (" + that.sCustomer + ")"
						});
						that.CustomerTokenInput.addToken(oToken);
						Temp.push(that.sCustomer);
					}
					that.setQuotationModel(Temp);
				}
			});
		},
		CustomerF41: function (mParameters, requestCompleted) {
			if (mParameters.controlID === undefined ||
				mParameters.controlID === null) {
				mParameters.controlID = "inputCustomerNo";
			}
			if (mParameters.bMultiSelect === undefined ||
				mParameters.bMultiSelect === null) {
				mParameters.bMultiSelect = true;
			}
			var sF4Heading = oPPCCommon.getLableFromMetadata({
				oDataModel: mParameters.oController.getView().getModel("SFGW_MST"),
				sEntityType: "Customer",
				sPropertyName: "CustomerNo",
				oUtilsI18n: mParameters.oUtilsI18n
			});

			var oCustomerTokenInput;
			if (mParameters.oController.CustomerTokenInput) {
				oCustomerTokenInput = mParameters.oController.CustomerTokenInput.getValue();
			}
			var oValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
				basicSearchText: oCustomerTokenInput,
				title: sF4Heading,
				supportMultiselect: mParameters.bMultiSelect,
				supportRanges: false,
				supportRangesOnly: false,
				key: mParameters.oController.aCustomerKeys[0],
				descriptionKey: mParameters.oController.aCustomerKeys[1],
				stretch: sap.ui.Device.system.phone,
				ok: function (oControlEvent) {
					if (mParameters.oController.CustomerTokenInput) {
						mParameters.oController.CustomerTokenInput.setTokens(oControlEvent.getParameter("tokens"));
						if (mParameters.controlID) {
							if (mParameters.oController.getView().byId(mParameters.controlID)) {
								mParameters.oController.getView().byId(mParameters.controlID).setValueState(sap.ui.core.ValueState.None);
								mParameters.oController.getView().byId(mParameters.controlID).setValueStateText("");
							} else {
								mParameters.oController.CustomerTokenInput.setValueState(sap.ui.core.ValueState.None);
								mParameters.oController.CustomerTokenInput.setValueStateText("");
							}
						} else {
							mParameters.oController.CustomerTokenInput.setValueState(sap.ui.core.ValueState.None);
							mParameters.oController.CustomerTokenInput.setValueStateText("");
						}
						if (requestCompleted) {
							requestCompleted(mParameters.oController.CustomerTokenInput.getTokens());
						}
					}
					oValueHelpDialog.close();
				},
				cancel: function (oControlEvent) {
					oValueHelpDialog.close();
				},
				afterClose: function () {
					oValueHelpDialog.destroy();
				}
			});
			mParameters.oController.setCustomerF4Columns(oValueHelpDialog, mParameters);
			mParameters.oController.setCustomerF4FilterBar(oValueHelpDialog, mParameters);

			if (sap.ui.Device.support.touch === false) {
				oValueHelpDialog.addStyleClass("sapUiSizeCompact");
			}

			oValueHelpDialog.open();
			if (mParameters.oController.CustomerTokenInput) {
				oValueHelpDialog.setTokens(mParameters.oController.CustomerTokenInput.getTokens());
			}
		},
		setCustomerF4Columns: function (oValueHelpDialog, mParameters) {
			var sCustomerNoLbl = oPPCCommon.getLableFromMetadata({
				oDataModel: mParameters.oController.getView().getModel("SFGW_MST"),
				sEntityType: "Customer",
				sPropertyName: "CustomerNo",
				oUtilsI18n: mParameters.oUtilsI18n
			});
			var sNameLbl = oPPCCommon.getLableFromMetadata({
				oDataModel: mParameters.oController.getView().getModel("SFGW_MST"),
				sEntityType: "Customer",
				sPropertyName: "Name",
				oUtilsI18n: mParameters.oUtilsI18n
			});

			if (oValueHelpDialog.getTable().bindItems) {
				var oColModel = new sap.ui.model.json.JSONModel();
				oColModel.setData({
					cols: [{
						label: sCustomerNoLbl,
						template: "CustomerNo"
					}, {
						label: sNameLbl,
						template: "Name"
					}]
				});
				oValueHelpDialog.getTable().setModel(oColModel, "columns");

			} else {
				oValueHelpDialog.getTable().addColumn(new sap.ui.table.Column({
					label: new com.arteriatech.ppc.utils.control.TableHeaderText({
						text: sCustomerNoLbl
					}),
					template: new sap.m.Text({
						text: "{CustomerNo}"
					}),
					sortProperty: "CustomerNo",
					filterProperty: "CustomerNo"
				}));
				oValueHelpDialog.getTable().addColumn(new sap.ui.table.Column({
					label: new com.arteriatech.ppc.utils.control.TableHeaderText({
						text: sNameLbl
					}),
					template: new sap.m.Text({
						text: "{Name}"
					}),
					sortProperty: "Name",
					filterProperty: "Name"
				}));
				oValueHelpDialog.getTable().setNoData(
					mParameters.oUtilsI18n.getText("common.NoItemSelected"));
			}
		},
		setCustomerF4FilterBar: function (oValueHelpDialog, mParameters) {
			var oTokenInputValue = "";
			oValueHelpDialog.getTable().setModel(mParameters.oController.getView().getModel("CustomerF4SuggestorModel"));
			oValueHelpDialog.getTable().bindRows("/");
			var oColumn = oValueHelpDialog.getTable().getColumns()[1];
			var sOrder = "Ascending";
			oValueHelpDialog.getTable().sort(oColumn, sOrder, false);
			if (mParameters.oController.CustomerTokenInput) {
				oTokenInputValue = mParameters.oController.CustomerTokenInput.getValue();
			}
			var code = new sap.m.Input({
				value: oTokenInputValue,
				maxLength: oPPCCommon.getMaxLengthFromMetadata({
					oDataModel: mParameters.oController.getView().getModel("SFGW_MST"),
					sEntityType: "Customer",
					sPropertyName: "CustomerNo",
					oUtilsI18n: mParameters.oUtilsI18n
				}),
				change: function () {
					oValueHelpDialog.getFilterBar().fireSearch();
				}
			});
			var desc = new sap.m.Input({
				maxLength: oPPCCommon.getMaxLengthFromMetadata({
					oDataModel: mParameters.oController.getView().getModel("SFGW_MST"),
					sEntityType: "Customer",
					sPropertyName: "Name",
					oUtilsI18n: mParameters.oUtilsI18n
				}),
				change: function () {
					oValueHelpDialog.getFilterBar().fireSearch();
				}
			});
			var sCustomerNoLbl = oPPCCommon.getLableFromMetadata({
				oDataModel: mParameters.oController.getView().getModel("SFGW_MST"),
				sEntityType: "Customer",
				sPropertyName: "CustomerNo",
				oUtilsI18n: mParameters.oUtilsI18n
			});
			var sNameLbl = oPPCCommon.getLableFromMetadata({
				oDataModel: mParameters.oController.getView().getModel("SFGW_MST"),
				sEntityType: "Customer",
				sPropertyName: "Name",
				oUtilsI18n: mParameters.oUtilsI18n
			});
			oValueHelpDialog.setFilterBar(new sap.ui.comp.filterbar.FilterBar({
				advancedMode: true,
				filterGroupItems: [
					new sap.ui.comp.filterbar.FilterGroupItem({
						groupTitle: "Customer",
						groupName: "gn1",
						name: "n1",
						label: sCustomerNoLbl,
						control: code
					}),
					new sap.ui.comp.filterbar.FilterGroupItem({
						groupTitle: "Customer",
						groupName: "gn2",
						name: "n2",
						label: sNameLbl,
						control: desc
					})
				],
				search: function (oEvent) {
					var codeValue = code.getValue();
					var descValue = desc.getValue();
					var aCustomerF4Filter = new Array();
					aCustomerF4Filter = oPPCCommon.setODataModelReadFilter("", "", aCustomerF4Filter, "LoginID", "", [oSSCommon.getCurrentLoggedUser({
						sServiceName: "Customers",
						sRequestType: "read"
					})], false, false, false);
					aCustomerF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(mParameters.oController.getView(), "",
						aCustomerF4Filter, "CustomerNo", "", [codeValue], false, false, false);
					aCustomerF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(mParameters.oController.getView(), "",
						aCustomerF4Filter, "Name", "", [descValue], false, false, false);
					var SFGW_MSTModel = mParameters.oController._oComponent.getModel("SFGW_MST");
					SFGW_MSTModel.attachRequestSent(function () {
						busyDialog.open();
					});
					SFGW_MSTModel.attachRequestCompleted(function () {
						busyDialog.close();
					});
					SFGW_MSTModel.read("/Customers", {
						filters: aCustomerF4Filter,
						urlParameters: {
							"$select": "CustomerNo,Name"
						},
						success: function (oData) {
							var CustomersModel = new sap.ui.model.json.JSONModel();
							if (oValueHelpDialog.getTable().bindRows) {
								oValueHelpDialog.getTable().clearSelection();
								CustomersModel.setData(oData.results);
								oValueHelpDialog.getTable().setModel(CustomersModel);
								oValueHelpDialog.getTable().bindRows("/");

								if (oData.results.length === 0) {
									oValueHelpDialog.getTable().setNoData(mParameters.oUtilsI18n.getText("common.NoResultsFound"));
								}
							} else {
								//Setting Rows for sap.m.Table....................................
								var oRowsModel = new sap.ui.model.json.JSONModel();
								oRowsModel.setData(oData.results);
								oValueHelpDialog.getTable().setModel(oRowsModel);
								if (oValueHelpDialog.getTable().bindItems) {
									var oTable = oValueHelpDialog.getTable();
									oTable.bindAggregation("items", "/", function () {
										var aCols = oTable.getModel("columns").getData().cols;
										return new sap.m.ColumnListItem({
											cells: aCols.map(function (column) {
												var colname = column.template;
												return new sap.m.Text({
													text: "{" + colname + "}",
													wrapping: true
												});
											})
										});
									});
								}

								if (oData.results.length === 0) {
									oValueHelpDialog.getTable().setNoDataText(mParameters.oUtilsI18n.getText("common.NoResultsFound"));
								}
							}
							if (oData.results.length > 0) {
								oValueHelpDialog.update();
							}
						},
						error: function (error) {
							oValueHelpDialog.getTable().clearSelection();
							if (oValueHelpDialog.getTable().getModel() != undefined)
								oValueHelpDialog.getTable().getModel().setProperty("/", {});
							oValueHelpDialog.getTable().setNoData(mParameters.oUtilsI18n.getText("common.NoResultsFound"));
							com.arteriatech.ss.utils.js.CommonValueHelp.dialogErrorMessage(error, "No Data Found");

						}
					});
				},
				reset: function () {

				}
			}));
		},
		TextAbstract: function (text, key, length) {
			text = text + "(" + key + ")";
			if (text === null) {
				return "";
			}
			if (text.length <= length) {
				return text;
			}
			text = text.substring(0, length);
			// last = text.lastIndexOf(" ");
			// text = text.substring(0, last);
			return text + "...";
		},
		setCustomerInputVisibility: function () {
			if (this.sCustomerInputType === "DD") {
				this.getView().getModel("LocalViewSetting").setProperty("/CustomerDD", true);
			} else if (this.sCustomerInputType === "MC") {
				this.getView().getModel("LocalViewSetting").setProperty("/CustomerMC", true);
			} else if (this.sCustomerInputType === "VH") {
				this.getView().getModel("LocalViewSetting").setProperty("/CustomerVH", true);
			}

			if (this.setCustomerInputVisibility_Exit) {
				this.setCustomerInputVisibility_Exit();
			}
		},
		getCustomerName: function () {
			if (this.getView().byId("customer").getSelectedItem() != null) {
				if (this.getView().byId("customer").getSelectedItem().getText().split("-").length > 1) {
					this.getView().getModel("LocalViewSetting").setProperty("/CustomerColumnVisibleInF4", false);
					return this.getView().byId("customer").getSelectedItem().getText().split("-")[1].trim();
				} else {
					this.getView().getModel("LocalViewSetting").setProperty("/CustomerColumnVisibleInF4", true);
					return this.getView().byId("customer").getSelectedItem().getText().split("-")[0].trim();
				}
			}
		},
		setCustomerColumnVisiblility: function () {
			if (this.getView().byId("customer").getSelectedItem() != null) {
				if (this.getView().byId("customer").getSelectedItem().getText().split("-").length > 1) {
					this.getView().getModel("LocalViewSetting").setProperty("/CustomerColumnVisibleInResult", false);
				} else {
					this.getView().getModel("LocalViewSetting").setProperty("/CustomerColumnVisibleInResult", true);
				}
			}
		},

		getSelectedCustomerCode: function () {
			var CustomerCode;
			if (this.sCustomerInputType === "DD") {
				CustomerCode = this.getView().byId("customer").getSelectedKey();
			} else if (this.sCustomerInputType === "MC") {
				var aCustomer = this.getView().byId("customerMultiCombo").getSelectedKeys();
				if (aCustomer.length > 0) {
					CustomerCode = aCustomer[0];
					for (var i = 1; i < aCustomer.length; i++) {
						if (aCustomer[i] !== "") {
							CustomerCode += ";" + aCustomer[i];
						}
					}
				}
			} else if (this.sCustomerInputType === "VH") {
				CustomerCode = oPPCCommon.getKeysFromTokens(this.getView(), "inputCustomerNo");
			}

			return CustomerCode;
		},
		getAllSelectedCustomerName: function () {
			var CustomerName = "";
			if (this.sCustomerInputType === "DD") {
				CustomerName = this.getCustomerName();
			} else if (this.sCustomerInputType === "MC") {
				var aCustomer = this.getView().byId("customerMultiCombo").getSelectedItems();
				if (aCustomer.length > 0) {
					CustomerName = aCustomer[0].getText().split(" - ")[1] + " (" + aCustomer[0].getText().split(" - ")[0] + ")";
					for (var i = 1; i < aCustomer.length; i++) {
						CustomerName += "; " + aCustomer[i].getText().split(" - ")[1] + " (" + aCustomer[i].getText().split(" - ")[0] + ")";
					}
				}
			} else if (this.sCustomerInputType === "VH") {
				CustomerName = oPPCCommon.getTextFromTokens(this.getView(), "inputCustomerNo");
			}

			if (CustomerName === "") {
				CustomerName = "(All)";
			}
			return CustomerName;
		},

		/*------------------------------------Get Drop downs--------------------------------*/
		getDropDowns: function () {

			if (this.getDropDowns_Exit) {
				this.getDropDowns_Exit();
			}
		},
		getApprovalStatusDD: function () {
			var that = this;
			var oModelData = this._oComponent.getModel("PCGW");
			var oStatusFilter = new Array();
			oStatusFilter = oPPCCommon.setODataModelReadFilter(this.getView(), "", oStatusFilter, "Typeset", sap.ui.model.FilterOperator.EQ, [
				"QAPSTS"
			], false, false, false);
			oPPCCommon.getDropdown(oModelData, "ConfigTypesetTypes", oStatusFilter, "Types", "TypesName", busyDialog, this.getView(),
				"ApprovalStatusDD", "",
				function (aDDValue) {

				});

			if (this.getApprovalStatusDD_Exit) {
				this.getApprovalStatusDD_Exit();
			}
		},
		getStatusDD: function () {
			var that = this;
			var oModelData = this._oComponent.getModel("PCGW");
			var oStatusFilter = new Array();
			oStatusFilter = oPPCCommon.setODataModelReadFilter(this.getView(), "", oStatusFilter, "Typeset", sap.ui.model.FilterOperator.EQ, [
				"QOHSTS"
			], false, false, false);
			oPPCCommon.getDropdown(oModelData, "ConfigTypesetTypes", oStatusFilter, "Types", "TypesName", busyDialog, this.getView(),
				"StatusIDDD", "",
				function (aDDValue) {

				});

			if (this.getStatusDD_Exit) {
				this.getStatusDD_Exit();
			}
		},
		QuotationTypeDD: function () {
			var that = this;
			var oModelData = this._oComponent.getModel("PCGW");
			var oFilter = new Array();
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "ModelID", sap.ui
				.model.FilterOperator.EQ, ["SFGW_INQ"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "EntityType", sap
				.ui.model.FilterOperator.EQ, ["Quotation"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "PropName", sap.ui
				.model.FilterOperator.EQ, ["QuotationType"], false, false, false);
			oSSCommon.getDropdown(oModelData, "ValueHelps", oFilter, "ID", "Description", busyDialog, this.getView(),
				"QuotationTypeDD", "",
				function (aDDValue) {

				});
			//for enhancement
			if (this.QuotationTypeDD_Exit) {
				this.QuotationTypeDD_Exit();
			}
		},
		setSalesOfficeDD: function () {
			var oModelData = this._oComponent.getModel("PCGW");
			var oStatusFilter = new Array();
			oStatusFilter = oPPCCommon.setODataModelReadFilter("", "", oStatusFilter, "LoginID", "", [oProductCommon.getCurrentLoggedUser({
				sServiceName: "ValueHelp",
				sRequestType: "read"
			})], false, false, false);
			oStatusFilter = oPPCCommon.setODataModelReadFilter(this.getView(), "", oStatusFilter, "ModelID", sap.ui.model.FilterOperator.EQ, [
				"SFGW_INQ"
			], true, false, false);
			oStatusFilter = oPPCCommon.setODataModelReadFilter(this.getView(), "", oStatusFilter, "EntityType", sap.ui.model.FilterOperator.EQ, [
				"Quotation"
			], false, false, false);
			oStatusFilter = oPPCCommon.setODataModelReadFilter(this.getView(), "", oStatusFilter, "PropName", sap.ui.model.FilterOperator.EQ, [
				"SalesOffice"
			], false, false, false);
			oPPCCommon.getDropdown(oModelData, "ValueHelps", oStatusFilter, "ID", "Description", busyDialog, this.getView(),
				"SalesOfficeDD", "",
				function () {

				}, false, "PD");
		},
		setSalesAreaDD: function () {
			var oModelData = this._oComponent.getModel("PCGW");
			var oStatusFilter = new Array();
			oStatusFilter = oPPCCommon.setODataModelReadFilter("", "", oStatusFilter, "LoginID", "", [oProductCommon.getCurrentLoggedUser({
				sServiceName: "ValueHelp",
				sRequestType: "read"
			})], false, false, false);
			oStatusFilter = oPPCCommon.setODataModelReadFilter(this.getView(), "", oStatusFilter, "ModelID", sap.ui.model.FilterOperator.EQ, [
				"SFGW_INQ"
			], true, false, false);
			oStatusFilter = oPPCCommon.setODataModelReadFilter(this.getView(), "", oStatusFilter, "EntityType", sap.ui.model.FilterOperator.EQ, [
				"Quotation"
			], false, false, false);
			oStatusFilter = oPPCCommon.setODataModelReadFilter(this.getView(), "", oStatusFilter, "PropName", sap.ui.model.FilterOperator.EQ, [
				"SalesArea"
			], false, false, false);
			oPPCCommon.getDropdown(oModelData, "ValueHelps", oStatusFilter, "ID", "Description", busyDialog, this.getView(),
				"SalesAreaDD", "",
				function () {

				}, false, "PD");
		},

		/*------------------------------------------Value Help----------------------------------------*/
		/*--------Add Validator--------------*/
		setValuehelpPropety: function () {
			var that = this;
			//Customer F4
			this.oCustomerTokenInput = this.getView().byId("inputCustomerNo");
			this.aCustomerKeys = ["CustomerNo", "CustomerName"];
			this.oQuotationNoTokenInput = this.getView().byId("inputQuotationNo");
			this.aQuotationNoKeys = ["QuotationNo", "QuotationNo"];
			if (this.setValuehelpPropety_Exit) {
				this.setValuehelpPropety_Exit();
			}
		},
		QuotationNoF4: function () {
			var that = this;
			this.validateMandatory1();
			if (oPPCCommon.doErrMessageExist()) {
				that.QuotationNoF41({
					TokenInput: this.oQuotationNoTokenInput,
					aKeys: this.aQuotationNoKeys,
					oController: this,
					oi18n: oi18n,
					oUtilsI18n: oUtilsI18n,
					controlID: "inputQuotationNo",
					title: oi18n.getText("List.FilterBar.Sales.Order.Request.No"),
					groupTitle: "Quotation Detail",
					groupTitle1: "Default",
					sCustomerCode: this.getSelectedCustomerCode(),
					sCustomerName: this.getAllSelectedCustomerName()
				}, function (tokens) {
					that.oQuotationNoTokenInput.removeAllTokens();
					if (tokens.length > 0) {
						for (var k = 0; k < tokens.length; k++) {
							that.QuotationNo = tokens[k].mProperties.key;
							that.oQuotationNoTokenInput = that.getView().byId("inputQuotationNo");
							var oToken = new sap.m.Token({
								key: that.QuotationNo,
								text: that.TextAbstract(that.QuotationNo, that.QuotationNo, 10),
								tooltip: that.QuotationNo + " (" + that.QuotationNo + ")"
							});
							that.oQuotationNoTokenInput.addToken(oToken);
						}
						that.getView().byId("inputQuotationNo").setValue("");
						that.getView().byId("inputQuotationDate").setSelectedKey("");
						that.QuotationDate.FromDate = null;
						that.QuotationDate.ToDate = null;
					} else {
						that.openManualDateSelectionDialog(that, -30, "", that.PreviousSelectedKeyQuotationDate, "QuotationDateViewSetting",
							oi18n, "QuotationDate",
							function (date) {
								that.QuotationDate.FromDate = date.fromDate;
								that.QuotationDate.ToDate = date.toDate;
							});
						that.getView().byId("inputQuotationDate").setSelectedKey("-30");
					}
				});
			} else {
				oPPCCommon.displayMsg_MsgBox(this.getView(), oPPCCommon.getMsgsFromMsgMgr(), "error");
			}
		},
		QuotationNoF41: function (mParameters, requestCompleted) {
			if (mParameters.bMultiSelect === undefined ||
				mParameters.bMultiSelect === null) {
				mParameters.bMultiSelect = true;
			}
			var oValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
				basicSearchText: mParameters.TokenInput.getValue(),
				title: mParameters.title,
				supportMultiselect: mParameters.bMultiSelect,
				supportRanges: false,
				supportRangesOnly: false,
				key: mParameters.aKeys[0],
				descriptionKey: mParameters.aKeys[1],
				stretch: sap.ui.Device.system.phone,
				ok: function (oControlEvent) {
					mParameters.TokenInput.setTokens(oControlEvent.getParameter("tokens"));
					mParameters.oController.getView().byId(mParameters.controlID).setValueState(sap.ui.core.ValueState.None);
					mParameters.oController.getView().byId(mParameters.controlID).setValueStateText("");
					if (requestCompleted) {
						requestCompleted(mParameters.TokenInput.getTokens());
						oValueHelpDialog.close();
					}
				},
				cancel: function (oControlEvent) {
					oValueHelpDialog.close();
				},
				afterClose: function () {
					oValueHelpDialog.destroy();
				}
			});
			mParameters.oController.setQuotationNoF4Columns(oValueHelpDialog, mParameters);
			mParameters.oController.setQuotationNoF4FilterBar(oValueHelpDialog, mParameters);
			if (sap.ui.Device.support.touch === false) {
				oValueHelpDialog.addStyleClass("sapUiSizeCompact");
			}
			oValueHelpDialog.open();
			if (mParameters.TokenInput) {
				oValueHelpDialog.setTokens(mParameters.TokenInput.getTokens());
			}
		},
		setQuotationNoF4Columns: function (oValueHelpDialog, mParameters) {
			var sCustomerLabel = oPPCCommon.getLableFromMetadata({
				oDataModel: mParameters.oController.getView().getModel("SFGW_INQ"),
				sEntityType: "Quotation",
				sPropertyName: "CustomerNo",
				oUtilsI18n: mParameters.oUtilsI18n
			});
			var sQuotationDateLabel = oi18n.getText("QuotationItemDetails.SalesOrderRequestDate");
			var sQuotationNoLabel = oi18n.getText("List.FilterBar.Sales.Order.Request.No");
			var sQuotationTypeLabel = oi18n.getText("List.FilterBar.Sales.Order.Request.Type");
			// oValueHelpDialog.getTable().addColumn(
			// 	new sap.ui.table.Column({
			// 		label: new com.arteriatech.ppc.utils.control.TableHeaderText({
			// 			text: sCustomerLabel
			// 		}),
			// 		template: new sap.m.Text({
			// 			text: "{CustomerName} ({CustomerNo})"
			// 		}),
			// 		sortProperty: "CustomerNo",
			// 		filterProperty: "CustomerNo"
			// 	}));
			oValueHelpDialog.getTable().addColumn(
				new sap.ui.table.Column({
					label: new com.arteriatech.ppc.utils.control.TableHeaderText({
						text: sQuotationNoLabel
					}),
					template: new sap.m.Text({
						text: "{QuotationNo}"
					}),
					sortProperty: "QuotationNo",
					filterProperty: "QuotationNo",
					filterType: "sap.ui.model.type.Float"
				}));
			oValueHelpDialog.getTable().addColumn(
				new sap.ui.table.Column({
					label: new com.arteriatech.ppc.utils.control.TableHeaderText({
						text: sQuotationTypeLabel
					}),
					template: new sap.m.Text({
						text: "{QuotationTypeDesc} ({QuotationType})"
					}),
					sortProperty: "QuotationType",
					filterProperty: "QuotationType"
				}));
			oValueHelpDialog.getTable().addColumn(
				new sap.ui.table.Column({
					label: new com.arteriatech.ppc.utils.control.TableHeaderText({
						text: sQuotationDateLabel
					}),
					template: new sap.m.Text({
						text: "{path:'QuotationDate' , formatter: 'com.arteriatech.ss.utils.js.Common.getFormattedDate' }"
					}),
					sortProperty: "QuotationDate",
					filterProperty: "QuotationDate"
				}));
			oValueHelpDialog.getTable().setNoData(mParameters.oUtilsI18n.getText("common.NoItemSelected"));
		},
		setQuotationNoF4FilterBar: function (oValueHelpDialog, mParameters) {
			oValueHelpDialog.getTable().setModel(mParameters.oController.getView().getModel("QuotationSuggestorModel"));
			oValueHelpDialog.getTable().bindRows("/");
			var oColumn = oValueHelpDialog.getTable().getColumns()[0];
			var sOrder = "Descending";
			oValueHelpDialog.getTable().sort(oColumn, sOrder, false);

			/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Getting Property Names From MetaData ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
			/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Edited By RM ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
			var sCustomerLabel = oPPCCommon.getLableFromMetadata({
				oDataModel: mParameters.oController.getView().getModel("SFGW_INQ"),
				sEntityType: "Quotation",
				sPropertyName: "CustomerNo",
				oUtilsI18n: mParameters.oUtilsI18n
			});
			var sQuotationDateLabel = oi18n.getText("QuotationItemDetails.SalesOrderRequestDate");
			var sQuotationNoLabel = oi18n.getText("List.FilterBar.Sales.Order.Request.No");
			var sQuotationTypeLabel = oi18n.getText("List.FilterBar.Sales.Order.Request.Type");
			var busyDialog = new sap.m.BusyDialog();
			var oTokenInputValue = "";
			if (mParameters.oController.TokenInput) {
				oTokenInputValue = mParameters.TokenInput.getValue();
			}
			var code = new sap.m.Input({
				value: oTokenInputValue,
				maxLength: oPPCCommon.getMaxLengthFromMetadata({
					oDataModel: mParameters.oController.getView().getModel("SFGW_INQ"),
					sEntityType: "Quotation",
					sPropertyName: "QuotationNo",
					oUtilsI18n: mParameters.oUtilsI18n
				})
			});
			var QuotationDate = new sap.m.DateRangeSelection({
				delimiter: "-",
				displayFormat: oSSCommon.getDateFormat()
			});
			var oQuotationTypeItemTemplate = new sap.ui.core.Item({
				key: "{Key}",
				text: "{Key}{Seperator}{Text}",
				tooltip: "{Key}{Seperator}{Text}"
			});
			var QuotationType = new sap.m.MultiComboBox({
				items: {
					path: "/",
					template: oQuotationTypeItemTemplate
				}
			});
			QuotationType.setModel(mParameters.oController.getView().getModel("QuotationTypeDD"));
			oValueHelpDialog.setFilterBar(new sap.ui.comp.filterbar.FilterBar({
				advancedMode: true,
				filterGroupItems: [
					new sap.ui.comp.filterbar.FilterGroupItem({
						groupTitle: mParameters.groupTitle,
						groupName: "gn1",
						name: "n1",
						label: sQuotationNoLabel,
						control: code
					}),
					new sap.ui.comp.filterbar.FilterGroupItem({
						groupTitle: mParameters.groupTitle,
						groupName: "gn1",
						name: "n4",
						label: sQuotationTypeLabel,
						control: QuotationType
					}),
					new sap.ui.comp.filterbar.FilterGroupItem({
						groupTitle: mParameters.groupTitle,
						groupName: "gn1",
						name: "n2",
						label: sQuotationDateLabel,
						control: QuotationDate
					}),
				],
				search: function (oEvent) {
					var codeValue = code.getValue();
					var aInquiryNumberF4FilterArray = new Array();
					var FromDate = oPPCCommon.addHoursAndMinutesToDate({
						dDate: QuotationDate.getDateValue()
					});
					var ToDate = oPPCCommon.addHoursAndMinutesToDate({
						dDate: QuotationDate.getSecondDateValue()
					});
					if (codeValue || (FromDate && ToDate)) {
						var LoginID = oSSCommon.getCurrentLoggedUser({
							sServiceName: "Quotations",
							sRequestType: "read"
						});
						aInquiryNumberF4FilterArray = oPPCCommon.setODataModelReadFilter("", "", aInquiryNumberF4FilterArray, "LoginID", "", [
							LoginID
						], false, false, false);
						aInquiryNumberF4FilterArray = oPPCCommon.setODataModelReadFilter(mParameters.oController.getView(),
							"", aInquiryNumberF4FilterArray, "CustomerNo", sap.ui.model.FilterOperator.EQ, [mParameters.sCustomerCode], true, false,
							false);
						aInquiryNumberF4FilterArray = oPPCCommon.setODataModelReadFilter(mParameters.oController.getView(), "",
							aInquiryNumberF4FilterArray,
							"QuotationNo", "", [codeValue], false, false, false);
						aInquiryNumberF4FilterArray = oPPCCommon.setODataModelReadFilter(mParameters.oController.getView(), "",
							aInquiryNumberF4FilterArray,
							"QuotationDate", sap.ui.model.FilterOperator.BT, [FromDate, ToDate], false, false, false);
						aInquiryNumberF4FilterArray = oPPCCommon.setODataModelReadFilter(mParameters.oController.getView(), "",
							aInquiryNumberF4FilterArray,
							"QuotationType", sap.ui.model.FilterOperator.EQ, QuotationType.getSelectedKeys(), true, false, false);
						var SFGW_SLSModel = mParameters.oController._oComponent.getModel("SFGW_INQ");
						SFGW_SLSModel.attachRequestSent(function () {
							busyDialog.open();
						});
						SFGW_SLSModel.attachRequestCompleted(function () {
							busyDialog.close();
						});
						SFGW_SLSModel.setHeaders({
							"x-arteria-loginid": LoginID
						});
						SFGW_SLSModel.read("/Quotations", {
							filters: aInquiryNumberF4FilterArray,
							urlParameters: {
								"$select": "QuotationNo,QuotationDate,QuotationType,QuotationTypeDesc,CustomerNo,CustomerName"
							},
							success: function (oData) {
								var SOsModel = new sap.ui.model.json.JSONModel();
								if (oValueHelpDialog.getTable().bindRows) {
									oValueHelpDialog.getTable().clearSelection();
									SOsModel.setData(oData.results);
									oValueHelpDialog.getTable().setModel(SOsModel);
									oValueHelpDialog.getTable().bindRows("/");
									if (oData.results.length === 0) {
										oValueHelpDialog.getTable().setNoData(mParameters.oUtilsI18n.getText("common.NoResultsFound"));
									}
								} else {
									oValueHelpDialog.getTable().getColumns()[2].setPopinDisplay("Inline");
									//Setting Rows for sap.m.Table....................................
									var oRowsModel = new sap.ui.model.json.JSONModel();
									oRowsModel.setData(oData.results);
									oValueHelpDialog.getTable().setModel(oRowsModel);
									if (oValueHelpDialog.getTable().bindItems) {
										var oTable = oValueHelpDialog.getTable();
										oTable.bindAggregation("items", "/", function () {
											var aCols = oTable.getModel("columns").getData().cols;
											return new sap.m.ColumnListItem({
												cells: aCols.map(function (column) {
													var colname = column.template;
													return new sap.m.Text({
														text: "{" + colname + "}",
														wrapping: true
													});
												})
											});
										});
									}
									if (oData.results.length === 0) {
										oValueHelpDialog.getTable().setNoDataText(mParameters.oUtilsI18n.getText("common.NoResultsFound"));
									}
								}
								if (oData.results.length > 0) {
									oValueHelpDialog.update();
								}
							},
							error: function (error) {
								oValueHelpDialog.getTable().clearSelection();
								if (oValueHelpDialog.getTable().getModel() !== undefined) {
									oValueHelpDialog.getTable().setNoData(mParameters.oUtilsI18n.getText("common.NoResultsFound"));
								}
								com.arteriatech.ss.utils.js.CommonValueHelp.dialogErrorMessage(error, "No Data Found");
							}
						});
					} else {
						var msg = "Please Enter " + sQuotationNoLabel + " (or) " + sQuotationDateLabel;
						oPPCCommon.displayMsg_MsgBox(mParameters.oController.getView(), msg, "error");
						oValueHelpDialog.getTable().clearSelection();
						if (oValueHelpDialog.getTable().getModel() != undefined) {
							oValueHelpDialog.getTable().getModel().setProperty("/", {});
						}
					}
				},
				reset: function () {

				}
			}));
		},

		/*------------------------------------------Table Filter, Sorter & Export to EXCEL-------------------------------------*/
		handleViewSettingsDialogButtonPressed: function (oEvent) {
			if (!this.ListDialog) {
				this.ListDialog = sap.ui.xmlfragment("com.arteriatech.zsf.quot.util.Dialog", this);
			}
			var oModel = this.getView().getModel("<ToAdd Model Name> Eg: PSGW_PUR");
			this.ListDialog.setModel(oModel, "<ToAdd Model Name> Eg: PSGW_PUR");
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.ListDialog);
			this.ListDialog.open();
		},
		sortAndFilterTable: function (oEvent) {
			var oView = this.getView();
			var that = this;
			var table = this.getView().byId("ListTable");
			//ToAdd custom filters if any in XML
			var oCustomFilter;
			//Eg: oCustomFilter = new sap.ui.model.Filter("PurDocType", sap.ui.model.FilterOperator.EQ, "PO");
			oPPCCommon.sortAndFilterTable(table, oEvent, function (count, aDefaultSorter) {
				oView.getModel("LocalViewSetting").setProperty("/ListItemsCount", count);
				if (count <= 0) {
					oView.byId("ListTable").setNoDataText(oUtilsI18n.getText("common.NoResultsFound"));
				} else {
					oPPCCommon.setGroupInTable(oView, "ListTable", "", true, "", "", aDefaultSorter);
					if (that.sCustomerInputType === "DD") {
						if (that.getView().byId("customer").getSelectedKey() === "") {
							oPPCCommon.setGroupInTable(oView, "ListTable", "CustomerNo", true, "Customer", "CustomerName", aDefaultSorter);
						}
					} else if (that.sCustomerInputType === "MC") {
						if (that.getView().byId("customerMultiCombo").getSelectedKeys().length !== 1) {
							oPPCCommon.setGroupInTable(oView, "ListTable", "CustomerNo", true, "Customer", "CustomerName", aDefaultSorter);
						}
					} else if (that.sCustomerInputType === "VH") {
						if (that.getView().byId("inputCustomerNo").getTokens().length !== 1) {
							oPPCCommon.setGroupInTable(oView, "ListTable", "CustomerNo", true, "Customer", "CustomerName", aDefaultSorter);
						}
					}
				}
			}, oCustomFilter);
		},
		exportToExcel: function (oEvent) {
			var table1 = this.getView().byId("ListTable");
			var items;
			items = table1.getItems();
			if (items.length > 0) {
				if (Device.system.desktop) {
					oPPCCommon.copyAndApplySortingFilteringFromUITable({
						thisController: this,
						mTable: this.getView().byId("ListTable"),
						uiTable: this.getView().byId("UIListTable")
					});
				}
			}
			var table = this.getView().byId("ListTable"); // oEvent.getSource().getParent().getParent();
			var oModel = this.getView().getModel("Quotations");
			oPPCCommon.exportToExcel(table, oModel, {
				bExportAll: false,
				oController: this,
				bLabelFromMetadata: false,
				sModel: "SFGW_INQ",
				sEntityType: "QuotationItem",
				oUtilsI18n: oUtilsI18n,
				sFileName: "Quotation List"
			});
		},

		/*----------------------------------------------Navigation-------------------------------------------------------*/
		gotoDetails: function (oEvent) {
			var path = "";
			var oModelContext = oEvent.getSource().getBindingContext("Quotations");
			/**
			 * Check for the Multi-Origin of the service
			 * If true pass Multi-Origin Property in the routing
			 */

			//ToAdd uncomment below line and update the path
			if (oPPCCommon.isMultiOrigin(oModelContext)) {
				var SAPMultiOriginPropertyName = oPPCCommon.getSAPMultiOriginPropertyName();
				path = "Quotations(QuotationNo='" + oModelContext.getProperty("QuotationNo") + "'," +
					SAPMultiOriginPropertyName + "='" + oModelContext.getProperty(SAPMultiOriginPropertyName) + "')";
			} else {
				path = "Quotations(QuotationNo='" + oModelContext.getProperty("QuotationNo") + "')";
			}
			this._oRouter.navTo("DetailPage", {
				contextPath: path
			}, false);
		},

		MaterialF4: function (oEvent) {
			oPPCCommon.removeAllMsgs();
			oPPCCommon.hideMessagePopover(gObjPageLayout);
			this.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel().getData()
				.length);

			var that = this;

			this.MaterialTokenInput = this.getView().byId("inputMaterial");
			this.aMaterialKeys = ["MaterialNo", "MaterialDesc"];

			oSSCommonValueHelp.MaterialF4({
				oController: this,
				oi18n: oi18n,
				oUtilsI18n: oUtilsI18n,
				sCpParentNo: this.getSelectedCustomerCode(),
				sCpParentName: this.getAllSelectedCustomerName()
			});

			if (this.MaterialNoF4_Exit) {
				this.MaterialNoF4_Exit();
			}
		},

		setQuotationModel: function (Customers) {
			var that = this;
			var SFGW_MSTModel = this._oComponent.getModel("SFGW_INQ");
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData([]);
			that._oComponent.setModel(oModel, "QuotationSuggestorModel");
			oSSCommon.getCurrentLoggedUser({
				sServiceName: "Quotations",
				sRequestType: "read"
			}, function (LoginID) {
				var aF4Filter = new Array();
				aF4Filter = oPPCCommon.setODataModelReadFilter("", "", aF4Filter, "LoginID", "", [
					LoginID
				], false, false, false);
				for (var k = 0; k < Customers.length; k++) {
					aF4Filter = oPPCCommon.setODataModelReadFilter("", "", aF4Filter, "CustomerNo", "", [
						Customers[k]
					], false, false, false);
				}
				if (that.QuotationDate) {
					if (that.QuotationDate.FromDate && that.QuotationDate.ToDate) {
						aF4Filter = oPPCCommon.setODataModelReadFilter("", "", aF4Filter, "QuotationDate", sap.ui.model.FilterOperator
							.BT, [
								that.QuotationDate.FromDate, that.QuotationDate.ToDate
							], false, false, false);
					}
				}
				// aF4Filter = oPPCCommon.setODataModelReadFilter("", "", aF4Filter, "QuotationType", sap.ui.model.FilterOperator.EQ, [
				// 	"QT"
				// ], true, false, false);
				SFGW_MSTModel.read("/Quotations", {
					filters: aF4Filter,
					urlParameters: {
						"$select": "QuotationNo,QuotationDate,QuotationType,QuotationTypeDesc,CustomerNo,CustomerName"
					},
					success: function (oData) {
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oData.results);
						that._oComponent.setModel(oModel, "QuotationSuggestorModel");
					},
					error: function (error) {}
				});
			});
		},
		setMaterialsModel: function () {
			var that = this;
			var SFGW_MSTModel = this._oComponent.getModel("SFGW_MST");
			SFGW_MSTModel.attachRequestSent(function () {
				//	busyDialog.open();
			});
			SFGW_MSTModel.attachRequestCompleted(function () {
				//	busyDialog.close();
			});
			var aMaterialF4Filter = new Array();
			aMaterialF4Filter = oPPCCommon.setODataModelReadFilter("", "", aMaterialF4Filter, "LoginID", "", [
				that.getCurrentUsers("Materials", "read")
			], false, false, false);
			SFGW_MSTModel.read("/Materials", {
				filters: aMaterialF4Filter,
				urlParameters: {
					"$select": "MaterialNo,MaterialDesc,BaseUom"
				},
				success: function (oData) {
					var MaterialsModel = new sap.ui.model.json.JSONModel();
					MaterialsModel.setData(oData.results);
					that._oComponent.setModel(MaterialsModel, "MaterialSuggestorModel");
				},
				error: function (error) {
					//alert(error);
				}
			});
		},
		handleMaterialSuggest: function (oEvent) {
			oPPCCommon.handleSuggest({
				oEvent: oEvent,
				aProperties: ["MaterialNo", "MaterialDesc"],
				sBinding: "suggestionItems"
			});
		},
		suggestionItemSelectedMat: function (oEvent) {
			oPPCCommon.suggestionItemSelected({
					oEvent: oEvent,
					thisController: this,
					sModelName: "MaterialSuggestorModel",
					sKey: "MaterialNo",
					sDescription: "MaterialDesc"
				},
				function (key, desc) {

				}
			);
			this.getView().byId("inputMaterial").setValueState("None");
			this.getView().byId("inputMaterial").setValueStateText("");
		},
		onChangeMaterial: function (oEvent) {
			var that = this;
			that.suggestionOnChange({
					oEvent: oEvent,
					thisController: this,
					sModelName: "MaterialSuggestorModel",
					sKey: "MaterialNo",
					sDescription: "MaterialDesc"
				},
				function (enteredVal, bFound, key, desc) {
					if (enteredVal !== "") {
						if (!bFound) {
							var msg = oi18n.getText("List.Filterbar.MultiInput.matNoError");
							oPPCCommon.displayMsg_MsgBox(that.getView(), msg, "error");
						}
					}
				}
			);
		},
		validateMandatory1: function (messageArea) {
			oPPCCommon.removeAllMsgs();
			//ToAdd Validations for Mandatory and add error to Messagemanager
			var msg;
			if (this.sCustomerInputType === "VH") {
				if (this.getView().byId("inputCustomerNo").getTokens().length <= 0) {
					msg = oi18n.getText("common.message.please.select", this.getView().byId("CustomerValueHelp").getLabel());;
					oPPCCommon.addMsg_MsgMgr(msg, "error", "CustomerNo");
					this.getView().byId("inputCustomerNo").setValueState(sap.ui.core.ValueState.Error);
					this.getView().byId("inputCustomerNo").setValueStateText(msg);
				} else {
					this.getView().byId("inputCustomerNo").setValueState(sap.ui.core.ValueState.None);
					this.getView().byId("inputCustomerNo").setValueStateText("");
				}
			}
			if (this.sCustomerInputType === "DD") {
				if (this.getView().byId("customer").getSelectedKey() == "") {
					msg = oi18n.getText("common.message.please.select", this.getView().byId("Customer").getLabel());;
					oPPCCommon.addMsg_MsgMgr(msg, "error", "Customer");
					this.getView().byId("customer").setValueState(sap.ui.core.ValueState.Error);
					this.getView().byId("customer").setValueStateText(msg);
				} else {
					this.getView().byId("customer").setValueState(sap.ui.core.ValueState.None);
					this.getView().byId("customer").setValueStateText("");
				}
			}
			if (this.validateMandatory1_Exit) {
				this.validateMandatory1_Exit();
			}
		},
		handleQuotationSuggest: function (oEvent) {
			this.validateMandatory1();
			if (oPPCCommon.doErrMessageExist()) {
				oPPCCommon.handleSuggest({
					oEvent: oEvent,
					aProperties: ["QuotationNo", "QuotationNo"],
					sBinding: "suggestionItems"
				});
			} else {
				oEvent.getSource().setValue("");
				oPPCCommon.displayMsg_MsgBox(this.getView(), oPPCCommon.getMsgsFromMsgMgr(), "error");
			}
		},
		suggestionquotationItemSelectedQuot: function (oEvent) {
			var that = this;
			this.suggestionItemSelectedCustomer({
					oEvent: oEvent,
					thisController: this,
					sModelName: "QuotationSuggestorModel",
					sKey: "QuotationNo",
					sDescription: "QuotationNo"
				},
				function (key, desc) {
					if (key) {
						that.getView().byId("inputQuotationNo").setValue("");
						that.getView().byId("inputQuotationDate").setSelectedKey("");
						that.QuotationDate.FromDate = null;
						that.QuotationDate.ToDate = null;
					}
				});
			this.getView().byId("inputQuotationNo").setValueState("None");
			this.getView().byId("inputQuotationNo").setValueStateText("");
		},
		onChangeQuotation: function (oEvent) {
			var that = this;
			that.suggestionOnChange({
					oEvent: oEvent,
					thisController: this,
					sModelName: "QuotationSuggestorModel",
					sKey: "QuotationNo",
					sDescription: "QuotationNo",
					sLabel: that.getView().byId("QuotationNo").getLabel()
				},
				function (enteredVal, bFound, key, desc, jData) {
					if (enteredVal !== "") {
						if (!bFound) {
							var msg = oi18n.getText("List.Filterbar.MultiInput.custNoError", [that.getView().byId("QuotationNo").getLabel()]);
							oPPCCommon.displayMsg_MsgBox(that.getView(), msg, "error");
						} else {
							that.getView().byId("inputQuotationNo").setValue("");
							that.getView().byId("inputQuotationDate").setSelectedKey("");
							that.QuotationDate.FromDate = null;
							that.QuotationDate.ToDate = null;
						}
					}
				});
		},
		suggestionOnChange: function (mParemeters, callBack) {
			var that = this;
			mParemeters.oEvent.getSource().setValueState("None");
			mParemeters.oEvent.getSource().setValueStateText("");
			var key = "",
				desc = "",
				jData = {};
			var enteredVal = mParemeters.oEvent.getSource().getValue();
			if (enteredVal.indexOf(' ') !== -1) {
				var enteredVal = mParemeters.oEvent.getSource().getValue();
			} else {
				var enteredVal = enteredVal.split("(")[0].trim().charAt(0).toUpperCase() + enteredVal.slice(1);
			}
			var oData = mParemeters.thisController.getView().getModel(mParemeters.sModelName).getProperty("/");
			var bFound = false;
			if (enteredVal !== "") {
				for (var i = 0; i < oData.length; i++) {
					if (oData[i][mParemeters.sKey] === enteredVal) {
						jData = oData[i];
						key = oData[i][mParemeters.sKey];
						desc = oData[i][mParemeters.sDescription];
						mParemeters.oEvent.getSource().removeAllTokens();
						if (mParemeters.sGUID) {
							var tokens = new sap.m.Token({
								key: oData[i][mParemeters.sGUID],
								text: that.TextAbstract(desc, key, 10),
								tooltip: desc + " (" + key + ")"
							});
						} else {
							var tokens = new sap.m.Token({
								key: oData[i][mParemeters.sKey],
								text: that.TextAbstract(desc, key, 10),
								tooltip: desc + " (" + key + ")"
							});
						}
						mParemeters.oEvent.getSource().addToken(tokens);
						mParemeters.oEvent.getSource().setValue("");
						bFound = true;
						break;
					} else if (oData[i][mParemeters.sDescription] === enteredVal) {
						jData = oData[i];
						key = oData[i][mParemeters.sKey];
						desc = oData[i][mParemeters.sDescription];
						mParemeters.oEvent.getSource().removeAllTokens();
						if (mParemeters.sGUID) {
							var tokens = new sap.m.Token({
								key: oData[i][mParemeters.sGUID],
								text: that.TextAbstract(desc, key, 10),
								tooltip: desc + " (" + key + ")"
							});
						} else {
							var tokens = new sap.m.Token({
								key: oData[i][mParemeters.sKey],
								text: that.TextAbstract(desc, key, 10),
								tooltip: desc + " (" + key + ")"
							});
						}
						mParemeters.oEvent.getSource().addToken(tokens);
						mParemeters.oEvent.getSource().setValue("");
						bFound = true;
						break;
					}
				}
				if (!bFound) {
					mParemeters.oEvent.getSource().setValueState("Error");
					mParemeters.oEvent.getSource().setValueStateText("Please Enter Valid " + mParemeters.sLabel);
				}
			}
			if (callBack) {
				callBack(enteredVal, bFound, key, desc, jData);
			}
		},
			// changelog
		getChangeLogDetails: function (oEvent) {
			var that = this;
			busyDialog.open();
			// that.getView().getModel("LocalViewSetting").setProperty("/Changelogview", true);
			// that.getView().getModel("LocalViewSetting").setProperty("/ApproverWorkflwview", false);
			var oModelContext = oEvent.getSource().getBindingContext("Quotations");

			var QuotationNo = oModelContext.getProperty("QuotationNo");
			// var TrackingNo = oModelContext.getProperty("ZztrackNo");
			// if (that.getView().getModel("LocalViewSetting").getProperty("/approveButton") === true) {
			// 	var custNo = oModelContext.getProperty("EntityKey");
			// 	var TrackingNo = oModelContext.getProperty("EntityKeyID");
			// }
			var ZART_DP_COMMONModel = this.getView().getModel("ZART_DP_COMMON");
			oSSCommon.getCurrentLoggedUser({
				sServiceName: "ErrorLogDetails",
				sRequestType: "read"
			}, function (LoginID) {
				// ZART_DP_COMMONModel.setHeaders({
				// 	"x-arteria-loginid": LoginID
				// });
				var fCustmItemsFilters = [];
				fCustmItemsFilters = oPPCCommon.setODataModelReadFilter(that.getView(), "", fCustmItemsFilters, "LoginId", sap.ui.model.FilterOperator
					.EQ, [LoginID], false, false, false);
				fCustmItemsFilters = oPPCCommon.setODataModelReadFilter(that.getView(), "", fCustmItemsFilters, "QuotationNo", sap.ui.model.FilterOperator
					.EQ, [QuotationNo], false, false, false);
				fCustmItemsFilters = oPPCCommon.setODataModelReadFilter(that.getView(), "", fCustmItemsFilters, "ApplInd", sap.ui.model.FilterOperator
					.EQ, ["QOT"], false, false, false);
				ZART_DP_COMMONModel.read("/ErrorLogDetails", {
					filters: fCustmItemsFilters,
					urlParameters: {
						"$select": "QuotationNo,LogMessage,CreatedBy,CreatedOn,CreatedAt"
					},
					success: function (oData) {
						for (var i = 0; i < oData.results.length; i++) {
							oData.results[i].CreatedAt = that.getConvertedTime(oData.results[i].CreatedAt);
							// if (oData.results[i].ChangedOn === null) {
							// 	oData.results[i].ChangedAt = "";
							// }
						}
						var ochangelogItemsModel = new sap.ui.model.json.JSONModel();
						ochangelogItemsModel.setData(oData.results);
						that.getView().setModel(ochangelogItemsModel, "ChangeLogs");
						that.getView().getModel("LocalViewSetting").setProperty("/ChangeLogsItemsCount", oData.results.length);
						that.openChangelogDialog(oData.results);
						// busyDialog.close();
					},
					error: function (error) {
						var ochangelogItemsModel = new sap.ui.model.json.JSONModel();
						ochangelogItemsModel.setData([]);
						that.getView().setModel(ochangelogItemsModel, "ChangeLogs");
						that.getView().getModel("LocalViewSetting").setProperty("/ChangeLogsItemsCount", 0);
						oPPCCommon.dialogErrorMessage(error, oi18n.getText("common.Dialog.Error.ServiceError.Header"));
						busyDialog.close();
					}
				});
			});
		},
		openChangelogDialog: function (Data) {
			var that = this;
			that.Content = "";
			that.Content = new com.arteriatech.zsf.quot.view.ErrorLog();
			var dialog = new sap.m.Dialog({
				title: 'Error Logs',
				type: 'Message',
				content: that.Content,
				contentWidth: '65%',
				beginButton: new sap.m.Button({
					text: 'OK',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});
			var LocalViewSetting = this.getView().getModel("LocalViewSetting");
			dialog.setModel(LocalViewSetting, "LocalViewSetting");
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(Data);
			dialog.setModel(oModel, "ChangeLogs");
			var oi18nModel = this.getView().getModel("i18n");
			dialog.setModel(oi18nModel, "i18n");
			var oDeviceModel = this.getView().getModel("Device");
			dialog.setModel(oDeviceModel, "device");
			if (sap.ui.Device.support.touch === false) {
				dialog.addStyleClass("sapUiSizeCompact");
			}
			dialog.open();
			busyDialog.close();
			if (this.openChangelogDialog_Exit) {
				this.openChangelogDialog_Exit();
			}
		},
		getConvertedTime: function (fValue) {
			if (fValue) {
				var date = new Date(fValue.ms);
				var timeinmiliseconds = date.getTime();
				var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({
					pattern: "KK:mm:ss"
				});
				var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;
				var timeStr = timeFormat.format(new Date(timeinmiliseconds + TZOffsetMs));
				if (new Date(timeinmiliseconds).getUTCHours() === 12) {
					var time = new Date(timeinmiliseconds).getUTCHours() + ":" + new Date(timeinmiliseconds).getUTCMinutes() + ":" + new Date(
						timeinmiliseconds).getUTCMilliseconds() + " " + timeStr.substring(9, 11);
					return time;
				} else {
					return timeStr;
				}
			} else {
				return fValue;
			}
		},

	});

});
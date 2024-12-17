sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"com/arteriatech/ppc/utils/js/Common",
	"com/arteriatech/ss/utils/js/Common",
	"com/arteriatech/ss/utils/js/CommonValueHelp",
	"com/arteriatech/ss/utils/js/UserMapping",
	"sap/m/Dialog",
], function (Controller, JSONModel, History, oPPCCommon, Dialog, oProductCommon) {
	"use strict";
	var oi18n, oUtilsI18n;
	var Device = sap.ui.Device;
	var oPPCCommon = com.arteriatech.ppc.utils.js.Common;
	var oProductCommon, oCommonValueHelp, oProductUserMapping;
	var oSSCommon = com.arteriatech.ss.utils.js.Common;
	var product = "PD";
	var contextPath = "";
	var busyDialog = new sap.m.BusyDialog();
	return Controller.extend("com.arteriatech.zsf.quot.controller.DetailPage", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.arteriatech.zsf.quot.view.DetailPage
		 */
		onInit: function () {
			this.onInitHookUp();
		},

		onInitHookUp: function () {
			this._oView = this.getView();
			gDetailPageView = this._oView;
			gObjPageLayout = this.getView().byId("ObjectPageLayout");
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

			//i18n
			oi18n = this._oComponent.getModel("i18n").getResourceBundle();
			oUtilsI18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();

			//Router Initialisation
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			//Attach event for routing on view patter matched 
			this._oRouter.attachRouteMatched(this.onRouteMatched, this);
			this.setDefaultSettings();

			if (this.onInitHookUp_Exit) {
				this.onInitHookUp_Exit();
			}
		},

		setDefaultSettings: function () {
			/**
			 * All view related local settings should be mapped in a Model and is called LocalViewSetting
			 */

			var oViewSettingModel = new sap.ui.model.json.JSONModel();
			this.viewSettingData = {
				ItemsCount: 0,
				editMode: false,
				detailMode: true,
				PartnersCount: 0,
				ConditionsCount: 0,
				reviewMode: false,
				editButtonVisible: false,
				itemDeleteButtonVisible: false,
				SalesArea: true,
				MaterialNo: true,
				Validity: true,
				DeleteButton: false,
				approveButtonVisible: false,
				rejectButtonVisible: false,
				approveButtonType: "Default",
				approveButton: false,
				rejectButtonType: "Default",
				rejectButton: false,
				uploadvisibility: false,
				AttachmentCount: 0,
				DateFormat: oSSCommon.getDateFormat(),
				editApproveButtonVisible: false,
				HeadereditApprove: false,
				NoApproval: true,
				EditBatch: false

			};
			oViewSettingModel.setData(this.viewSettingData);
			this._oComponent.setModel(oViewSettingModel, "LocalViewSettingDtl");
			if (this.setDefaultSettings_Exit) {
				this.setDefaultSettings_Exit();
			}
		},
		getUserProfiles: function (oData2) {
			var that = this;
			oSSCommon.getCurrentLoggedUser({
				sServiceName: "UserProfiles" + "_" + (Math.random().toFixed(2) * 100).toFixed(0),
				sRequestType: "read"
			}, function (LoginID) {
				var contextPath = "UserProfiles(Application='" + "PD" + "')";
				var oDataModel = that._oComponent.getModel("PUGW");
				oDataModel.setHeaders({
					"x-arteria-loginid": LoginID
				});
				oDataModel.read("/" + contextPath, {
					urlParameters: {
						"$select": "Application,LoginID,LoginName,RoleID,RoleDesc,RoleCatID,RoleCatDesc,IsActive"
					},
					success: function (oData) {
						var sRoleCatID = "";
						if (oData.results) {
							oData = oPPCCommon.formatItemsOData({
								oData: oData.results
							});
							sRoleCatID = oData[0].RoleID;
						} else if (oData) {
							sRoleCatID = oData.RoleID;
						}

						var RoleID = sRoleCatID;
						that.getView().getModel("LocalViewSettingDtl").setProperty("/RoleID", RoleID);

						if (!that._oComponent.getModel("LocalViewSettingDtl").getProperty("/editApproveButtonVisible")) {
							if (oData2.StatusID === "A" && RoleID === "Z00001") {
								that._oComponent.getModel("LocalViewSettingDtl").setProperty("/editButtonVisible", true);
							} else {
								that._oComponent.getModel("LocalViewSettingDtl").setProperty("/editButtonVisible", false);
							}
						}

					},
					error: function (error) {}
				});
			});
		},

		onRouteMatched: function (oEvent) {
			busyDialog.open();
			var oHistory = sap.ui.core.routing.History.getInstance();
			contextPath = oEvent.getParameter("arguments").contextPath;
			if (oHistory.getDirection() !== "Backwards") {
				if (oHistory.getDirection() === "Unknown" && oEvent.getParameter("name") === "qochange") {
					this._oRouter.navTo("DetailPage", {
						contextPath: contextPath
					}, true);
				} else if (oEvent.getParameter("name") === "qochange") {
					this.getView().getModel("LocalViewSettingDtl").setProperty("/savedSuccessfully", false);
					this.getView().getModel("LocalViewSettingDtl").setProperty("/uploadvisibility", true);
					var sQTNumber = contextPath.split("QuotationNo='")[1].split("'")[0];
					if (!this.getView().getModel("Quotations")) {
						this._oRouter.navTo("DetailPage", {
							contextPath: contextPath
						}, true);
					} else if (this.getView().getModel("Quotations").getProperty("/QuotationNo") !== sQTNumber) {
						oPPCCommon.removeAllMsgs();
						oPPCCommon.hideMessagePopover(this.getView());
						if (this.getView().getModel("LocalViewSettingDtl")) {
							this.getView().getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
								.getData().length);
							this.getView().getModel("LocalViewSettingDtl").setProperty("/detailMode", true);
							this.getView().getModel("LocalViewSettingDtl").setProperty("/editMode", false);
							this.getView().getModel("LocalViewSettingDtl").setProperty("/reviewMode", false);
							this.getView().getModel("LocalViewSettingDtl").setProperty("/pageHeader", oi18n.getText("sodetail.Page.detailHeader"));
						}
						this._oRouter.navTo("DetailPage", {
							contextPath: contextPath
						}, true);
					} else {
						this.getView().getModel("LocalViewSettingDtl").setProperty("/savedSuccessfully", false);
						contextPath = oEvent.getParameter("arguments").contextPath;
						busyDialog.close();
						if (!gDetailPageView.getModel("Quotations")) {
							this._oRouter.navTo("DetailPage", {
								contextPath: contextPath
							}, true);
						} else {
							this.gotoEdit();
						}
						// this.gotoEdit();
					}
				} else if (oEvent.getParameter("name") === "approveDetailPage") {
					contextPath = oEvent.getParameter("arguments").contextPath;
					var that = this;
					// changed by megha
					that.getView().getModel("LocalViewSettingDtl").setProperty("/editApproveButtonVisible", true);
					that.getView().getModel("LocalViewSettingDtl").setProperty("/HeadereditApprove", true);
					that.getView().getModel("LocalViewSettingDtl").setProperty("/editButtonVisible", false);
					that.getView().getModel("LocalViewSettingDtl").setProperty("/approveButton", true);
					that.getView().getModel("LocalViewSettingDtl").setProperty("/rejectButton", true);
					// that.getView().getModel("LocalViewSettingDtl").setProperty("/EditBatch", true);

					that.getDetails();
					that.getCurrentServerDate(that, function (Today) {
						that.getView().getModel("LocalViewSettingDtl").setProperty("/CurrentDate", Today);
					});
					// that.getTasks();
				} else {
					contextPath = oEvent.getParameter("arguments").contextPath;
					var that = this;
					that.getDetails();
					that.getCurrentServerDate(that, function (Today) {
						that.getView().getModel("LocalViewSettingDtl").setProperty("/CurrentDate", Today);
					});
				}
			} else {
				busyDialog.close();
			}
			//ToAdd
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
						MessageBox.error(
							"Cannot laod Server Date", {
								styleClass: "sapUiSizeCompact"
							});
					}
				}
			});
		},
		getDetails: function () {
			busyDialog.open();
			oPPCCommon.removeAllMsgs();
			var view = this.getView();
			var that = this;
			var odataModel;
			odataModel = view.getModel("SFGW_INQ");
			odataModel.setHeaders({
				"x-arteria-loginid": this.getCurrentUsers("Quotations", "read")
			});
			// odataModel.read("/" + contextPath, {
			var QuotationNo = oPPCCommon.getPropertyValueFromContextPath(contextPath, "QuotationNo");
			odataModel.read("/Quotations(QuotationNo='" + QuotationNo + "')", {
				urlParameters: {
					"$expand": "QuotationItemDetails"
				},
				success: function (oData) {
					that.getUserProfiles(oData);

					that.setQuotationData(oData);
					if (oData.StatusID === "A") {
						that.setDropdowns(oData);
					}
					// that.getDocuments(oData);
					// that.setASNDocumentList();
					busyDialog.close();
					if (that.getView().getModel("LocalViewSettingDtl").getProperty("/HeadereditApprove")) {
						if (sap.ui.getCore().getMessageManager().getMessageModel().getData().length > 0) {
							var msgCode = sap.ui.getCore().getMessageManager().getMessageModel().getData()[0].code;
							if (msgCode === "ZART_DP/013" || msgCode === "ZART_DP/048") {
								that.getView().getModel("LocalViewSettingDtl").setProperty("/NoApproval", false);
							} else {
								that.getView().getModel("LocalViewSettingDtl").setProperty("/NoApproval", true);
							}
							oPPCCommon.removeDuplicateMsgsInMsgMgr();
							var message = oPPCCommon.getMsgsFromMsgMgr();
							that.displayMsg_MsgBox(that.getView(), message, "Information");
						} else {
							that.getView().getModel("LocalViewSettingDtl").setProperty("/NoApproval", true);
						}
					}
				},
				error: function (error) {
					busyDialog.close();
					that.handleoDataError(error);
				}
			});
		},
		displayMsg_MsgBox: function (view, message, messageType, fnClose) {
			var bCompact = true;

			if (sap.ui.Device.support.touch === false) {
				bCompact = false;
			}

			if (messageType == "Information") {
				if (fnClose != undefined && fnClose != null && fnClose != "") {
					sap.m.MessageBox.information(
						message, {
							styleClass: bCompact ? "sapUiSizeCompact" : "",
							onClose: fnClose,
						}
					);
				} else {
					sap.m.MessageBox.information(
						message, {
							styleClass: bCompact ? "sapUiSizeCompact" : ""
						}
					);
				}
			} else {
				sap.m.MessageBox.error(
					message, {
						styleClass: bCompact ? "sapUiSizeCompact" : ""
					}
				);
			}
		},

		setDropdowns: function (Data) {
			this.getRejReasonDD(Data.CustomerNo);
			this.GroupCompanyDD(Data.CustomerNo);
			// this.ShippConditionDD(Data.CustomerNo);
			this.TransportZoneDD(Data.ShipToParty);
			this.PricingZoneDD(Data.ShipToParty);

			this.getPayerDD(Data.CustomerNo, Data);
			// this.setPlantDD(Data.CustomerNo, Data);
			this.setPaytermDD(Data.CustomerNo, Data);
			this.setShipToPartyDD(Data.CustomerNo, Data.SalesArea);
			this.getBilltoParties(Data.ShipToParty);
		},
		getRejReasonDD: function (CustomerNo) {
			var that = this;
			var oModelData = this._oComponent.getModel("PCGW");
			var oFilter = new Array();
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "ModelID", sap.ui
				.model.FilterOperator.EQ, ["SFGW_INQ"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "EntityType", sap
				.ui.model.FilterOperator.EQ, ["Quotation"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "PropName", sap.ui
				.model.FilterOperator.EQ, ["RejReason"], false, false, false);
			// oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "PartnerNo", sap.ui
			// 	.model.FilterOperator.EQ, [CustomerNo], false, false, false);
			oSSCommon.getDropdown(oModelData, "ValueHelps", oFilter, "ID", "Description", busyDialog, this.getView(),
				"RejReasonDD", "Select",
				function (aDDValue) {
					if (aDDValue.length === 0) {
						var oDDModel = new sap.ui.model.json.JSONModel();
						oDDModel.setData(aDDValue);
						that._oComponent.setModel(oDDModel, "RejReasonDD");
					}
					if (aDDValue.length === 1) {
						that.getView().getModel("LocalViewSettingDtl").setProperty("/TempRejReason", aDDValue[0].Key);
						that.getView().getModel("LocalViewSettingDtl").setProperty("/TempRejReasonDesc", aDDValue[0].Text);
					}
				});
			//for enhancement
			if (this.getRejReasonDD_Exit) {
				this.getRejReasonDD_Exit();
			}
		},
		// 		setShipToPartyDD: function (customer, Billtoparty) {
		// 	var that = this;
		// 	var view = gQuoteHeaderCreateView;
		// 	var oModelData = this._oComponent.getModel("PCGW");
		// 	var oFilter = new Array();
		// 	var ParentID = that.sSalesArea;
		// 	oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "ModelID", sap.ui
		// 		.model.FilterOperator.EQ, ["DP_COMM"], false, false, false);
		// 	oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "EntityType", sap
		// 		.ui.model.FilterOperator.EQ, ["Quotation"], false, false, false);
		// 	oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "PropName", sap.ui
		// 		.model.FilterOperator.EQ, ["ShipToParty"], false, false, false);
		// 	oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "PartnerNo", sap.ui
		// 		.model.FilterOperator.EQ, [customer], false, false, false);
		// 	oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "ParentID", sap.ui
		// 		.model.FilterOperator.EQ, [ParentID], false, false, false);
		// 	oSSCommon.getDropdown(oModelData, "ValueHelps", oFilter, "ID", "Description", busyDialog, view,
		// 		"ShipToParties", "None",
		// 		function (aDDValue) {
		// 			that.closeBusyDialog();
		// 			if (aDDValue.length === 0) {
		// 				var oDDModel = new sap.ui.model.json.JSONModel();
		// 				oDDModel.setData(aDDValue);
		// 				view.setModel(oDDModel, "ShipToParties");
		// 				that.getView().getModel("Quotations").setProperty("/ShipToParty", "");
		// 				that.getView().getModel("Quotations").setProperty("/ShipToPartyName", "");
		// 				// if (that._oComponent.getModel("Quotations")) {
		// 					// that._oComponent.getModel("Quotations").setProperty("/Address1", "");
		// 					// that._oComponent.getModel("Quotations").setProperty("/Address2", "");
		// 					// that._oComponent.getModel("Quotations").setProperty("/Address3", "");
		// 					// that._oComponent.getModel("Quotations").setProperty("/Address4", "");
		// 					// that._oComponent.getModel("Quotations").setProperty("/District", "");
		// 					// that._oComponent.getModel("Quotations").setProperty("/City", "");
		// 					// that._oComponent.getModel("Quotations").setProperty("/PostalCode", "");
		// 					// that._oComponent.getModel("Quotations").setProperty("/CountryCode", undefined);
		// 					// that._oComponent.getModel("Quotations").setProperty("/CountryCodeDesc", "");
		// 					// that._oComponent.getModel("Quotations").setProperty("/State", undefined);
		// 					// that._oComponent.getModel("Quotations").setProperty("/StateDesc", "");
		// 					// that._oComponent.getModel("Quotations").setProperty("/CreditLimit", "0.00");
		// 					// that._oComponent.getModel("Quotations").setProperty("/CreditExposure", "0.00");
		// 					// that._oComponent.getModel("Quotations").setProperty("/AvailableBalance", "0.00");
		// 					// that._oComponent.getModel("Quotations").setProperty("/Currency", "");
		// 				// }
		// 				// if (that.getView().getModel("LocalViewSetting")) {
		// 				// 	that.getView().getModel("LocalViewSetting").setProperty("/CreditLimit", "0.00");
		// 				// 	that.getView().getModel("LocalViewSetting").setProperty("/CreditExposure", "0.00");
		// 				// }
		// 			}
		// 			if (aDDValue.length === 1) {
		// 				that.sShipToParty = aDDValue[0].Key;
		// 				that.getView().getModel("Quotations").setProperty("/ShipToParty", that.sShipToParty);
		// 				that.getView().getModel("Quotations").setProperty("/ShipToPartyName", aDDValue[0].Text);
		// 				that.getCustomerDetail(that.sShipToParty);
		// 				that.getBilltoParties(that.sShipToParty);
		// 				that.TransportZoneDD(that.sShipToParty);
		// 			} else {
		// 				// if (that._oComponent.getModel("Quotations")) {
		// 				// 	that._oComponent.getModel("Quotations").setProperty("/Address1", "");
		// 				// 	that._oComponent.getModel("Quotations").setProperty("/Address2", "");
		// 				// 	that._oComponent.getModel("Quotations").setProperty("/Address3", "");
		// 				// 	that._oComponent.getModel("Quotations").setProperty("/Address4", "");
		// 				// 	that._oComponent.getModel("Quotations").setProperty("/District", "");
		// 				// 	that._oComponent.getModel("Quotations").setProperty("/City", "");
		// 				// 	that._oComponent.getModel("Quotations").setProperty("/PostalCode", "");
		// 				// 	that._oComponent.getModel("Quotations").setProperty("/CountryCode", undefined);
		// 				// 	that._oComponent.getModel("Quotations").setProperty("/CountryCodeDesc", "");
		// 				// 	that._oComponent.getModel("Quotations").setProperty("/State", undefined);
		// 				// 	that._oComponent.getModel("Quotations").setProperty("/StateDesc", "");
		// 				// 	that._oComponent.getModel("Quotations").setProperty("/CreditLimit", "0.00");
		// 				// 	that._oComponent.getModel("Quotations").setProperty("/CreditExposure", "0.00");
		// 				// 	that._oComponent.getModel("Quotations").setProperty("/AvailableBalance", "0.00");
		// 				// 	that._oComponent.getModel("Quotations").setProperty("/Currency", "");
		// 				// }
		// 				// if (that.getView().getModel("LocalViewSetting")) {
		// 				// 	that.getView().getModel("LocalViewSetting").setProperty("/CreditLimit", "0.00");
		// 				// 	that.getView().getModel("LocalViewSetting").setProperty("/CreditExposure", "0.00");
		// 				// }
		// 			}
		// 		}, false, false, {
		// 			bSetSizeLimit: true
		// 		});
		// 	//for enhancement
		// 	if (this.setShipToPartyDD_Exit) {
		// 		this.setShipToPartyDD_Exit();
		// 	}
		// },

		setShipToPartyDD: function (CustomerNo, sSalesArea) {
			var that = this;
			var SalesArea = sSalesArea;
			if (SalesArea.includes("-")) {
				SalesArea = SalesArea.replaceAll("-", "/");
			}
			var ParentID = SalesArea;
			var oModelData = this._oComponent.getModel("PCGW");
			var oFilter = new Array();
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "ModelID", sap.ui
				.model.FilterOperator.EQ, ["DP_COMM"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "EntityType", sap
				.ui.model.FilterOperator.EQ, ["Quotation"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "PropName", sap.ui
				.model.FilterOperator.EQ, ["ShipToParty"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "PartnerNo", sap.ui
				.model.FilterOperator.EQ, [CustomerNo], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "ParentID", sap.ui
				.model.FilterOperator.EQ, [ParentID], false, false, false);
			oSSCommon.getDropdown(oModelData, "ValueHelps", oFilter, "ID", "Description", busyDialog, this.getView(),
				"ShipToParties", "Select",
				function (aDDValue) {
					if (aDDValue.length === 1) {
						that.getView().getModel("Quotations").setProperty("/ShipToParty", aDDValue[0].Key);
						that.getView().getModel("Quotations").setProperty("/ShipToPartyName", aDDValue[0].Text);
						gDetailPageHeaderView.oController.getCustomerDetail(aDDValue[0].Key);
						that.getBilltoParties(aDDValue[0].Key);
						that.TransportZoneDD(aDDValue[0].Key);
					}
				}, false, false, {
					bSetSizeLimit: true
				});
			//for enhancement
			if (this.setShipToPartyDD_Exit) {
				this.setShipToPartyDD_Exit();
			}
		},
		setPaytermDD: function (CustomerNo, Data) {
			var that = this;
			var oModelData = this._oComponent.getModel("PCGW");
			var oFilter = new Array();
			var SalesArea = Data.SalesArea;
			if (SalesArea.includes("-")) {
				SalesArea = SalesArea.replaceAll("-", "/");
			}
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "ModelID", sap.ui
				.model.FilterOperator.EQ, ["SFGW_INQ"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "EntityType", sap
				.ui.model.FilterOperator.EQ, ["Quotation"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "PropName", sap.ui
				.model.FilterOperator.EQ, ["Payterm"], false, false, false);
			// oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "PartnerNo", sap.ui
			// 	.model.FilterOperator.EQ, [CustomerNo], false, false, false);
			// oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "ParentID", sap.ui
			// 	.model.FilterOperator.EQ, [SalesArea], false, false, false);
			oSSCommon.getDropdown(oModelData, "ValueHelps", oFilter, "ID", "Description", busyDialog, this.getView(),
				"Payterms", "Select",
				function (aDDValue) {
					var TempArr = [];
					for (var i = 0; i < aDDValue.length; i++) {
						if (aDDValue[i].Key !== "" || aDDValue[i].Text !== "") {
							TempArr.push(aDDValue[i]);
						}
					}
					var oDDModel = new sap.ui.model.json.JSONModel();
					oDDModel.setData(TempArr);
					oDDModel.setSizeLimit(TempArr.length);
					that.getView().setModel(oDDModel, "Payterms");
					that.getView().getModel("Payterms").setSizeLimit(TempArr.length);
					if (TempArr.length === 1) {
						that.getView().getModel("Quotations").setProperty("/Payterm", TempArr[0].Key);
						that.getView().getModel("Quotations").setProperty("/PaytermDesc", TempArr[0].Text);
					}
				});
			//for enhancement
			if (this.setPaytermDD_Exit) {
				this.setPaytermDD_Exit();
			}
		},
		setPlantDD: function (CustomerNo, Data) {
			var that = this;
			var SalesArea = Data.SalesArea;
			if (SalesArea.includes("-")) {
				SalesArea = SalesArea.replaceAll("-", "/");
			}
			var oModelData = this._oComponent.getModel("PCGW");
			var oFilter = new Array();
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "ModelID", sap.ui
				.model.FilterOperator.EQ, ["SFGW_INQ"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "EntityType", sap
				.ui.model.FilterOperator.EQ, ["Quotation"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "PropName", sap.ui
				.model.FilterOperator.EQ, ["Plant"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "PartnerNo", sap.ui
				.model.FilterOperator.EQ, [CustomerNo], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "ParentID", sap.ui
				.model.FilterOperator.EQ, [SalesArea], false, false, false);
			oSSCommon.getDropdown(oModelData, "ValueHelps", oFilter, "ID", "Description", busyDialog, this.getView(),
				"Plants", "Select",
				function (aDDValue) {
					if (aDDValue.length === 0) {
						var oDDModel = new sap.ui.model.json.JSONModel();
						oDDModel.setData(aDDValue);
						that._oComponent.setModel(oDDModel, "Plants");
					}
					if (aDDValue.length === 1) {
						that.getView().getModel("Quotations").setProperty("/Plant", aDDValue[0].Key);
						that.getView().getModel("Quotations").setProperty("/PlantDesc", aDDValue[0].Text);
					}
				});
			//for enhancement
			if (this.setPlantDD_Exit) {
				this.setPlantDD_Exit();
			}
		},
		getPayerDD: function (Customer) {
			var that = this;
			var ListModel = this._oComponent.getModel("ZART_DP_COMMON");
			oSSCommon.getCurrentLoggedUser({
				sServiceName: "BPDetails",
				sRequestType: "read"
			}, function (LoginID) {
				ListModel.setHeaders({
					"x-arteria-loginid": LoginID
				});
				ListModel.read("/BPDetails", {
					filters: that.prepareItemsODataFilter(LoginID, Customer),
					success: function (oData) {
						oData = oPPCCommon.formatItemsOData({
							oData: oData
						});
						// var BillToPartyDD = [];
						var PayerDD = [];
						// var BilltoGST = [];
						// if (oData.length > 1) {
						// 	BillToPartyDD.push({
						// 		Key: "",
						// 		Text: "(Select)"
						// 	});
						// }
						for (var k = 0; k < oData.length; k++) {
							oData[k].Seperator = " - ";
							// if (oData[k].BussPrtnrType === "1") {
							// 	BillToPartyDD.push({
							// 		Key: oData[k].BusinessPartnerNo,
							// 		Text: oData[k].BusinessPartnerName,
							// 		Seperator: oData[k].Seperator
							// 	});
							// 	BilltoGST.push({
							// 		BillToGST: oData[k].BillToGST,
							// 		BusinessPartnerNo: oData[k].BusinessPartnerNo,
							// 	});

							// }
							if (oData[k].BussPrtnrType === "2") {
								PayerDD.push(oData[k]);
							}

						}

						// var BillToPartyDDModel = new sap.ui.model.json.JSONModel();
						// BillToPartyDDModel.setData(BillToPartyDD);
						// that._oComponent.setModel(BillToPartyDDModel, "BillToPartyDD");
						var PayerDDModel = new sap.ui.model.json.JSONModel();
						PayerDDModel.setData(PayerDD);
						that._oComponent.setModel(PayerDDModel, "PayerDD");
						// var BilltoGSTDDModel = new sap.ui.model.json.JSONModel();
						// BilltoGSTDDModel.setData(BilltoGST);
						// that._oComponent.setModel(BilltoGSTDDModel, "BilltoGSTDD");
						// if (BillToPartyDD.length === 1) {
						// 	// that.setShipToPartyDD(Customer, BillToPartyDD[0].BusinessPartnerNo);
						// 	that.getView().getModel("Quotations").setProperty("/BillToParty", BillToPartyDD[0].BusinessPartnerNo);
						// 	that.getView().getModel("Quotations").setProperty("/BillToDesc", BillToPartyDD[0].BusinessPartnerName);
						// 	that.getView().getModel("Quotations").setProperty("/BpGstNO", BillToPartyDD[0].BillToGST);
						// } else {
						// 	that.getView().getModel("Quotations").setProperty("/BillToParty", "");
						// 	that.getView().getModel("Quotations").setProperty("/BillToDesc", "");
						// 	that.getView().getModel("Quotations").setProperty("/BpGstNO", "");
						// }
						if (PayerDD.length === 1) {
							that.getView().getModel("Quotations").setProperty("/Payer", PayerDD[0].BusinessPartnerNo);
							that.getView().getModel("Quotations").setProperty("/PayerDesc", PayerDD[0].BusinessPartnerName);
							that.getView().getModel("LocalViewSetting").setProperty("/PayerCreditLimit", PayerDD[0].CreditLimit);
							that.getView().getModel("LocalViewSetting").setProperty("/PayerCreditExposure", PayerDD[0].CreditExposure);
							// var PayerAvailableCreditLimit = parseFloat(PayerDD[0].CreditLimit) - parseFloat(PayerDD[0].CreditExposure);
							// PayerAvailableCreditLimit = PayerAvailableCreditLimit.toFixed(2);
							// that.getView().getModel("LocalViewSetting").setProperty("/PayerAvailableCreditLimit", PayerAvailableCreditLimit);
							// that.getView().getModel("LocalViewSetting").setProperty("/PayerOpenSRValue", PayerDD[0].OpenSRValue);
							// that.getView().getModel("LocalViewSetting").setProperty("/PayerCurrentSRValue", PayerDD[0].OpenSRValue);
						} else {
							that.getView().getModel("Quotations").setProperty("/Payer", "");
							that.getView().getModel("Quotations").setProperty("/PayerDesc", "");
							that.getView().getModel("LocalViewSetting").setProperty("/PayerCreditLimit", "0.00");
							that.getView().getModel("LocalViewSetting").setProperty("/PayerCreditExposure", "0.00");
							that.getView().getModel("LocalViewSetting").setProperty("/PayerAvailableCreditLimit", "0.00");
							that.getView().getModel("LocalViewSetting").setProperty("/PayerOpenSRValue", "0.00");
							// that.getView().getModel("LocalViewSetting").setProperty("/PayerCurrentSRValue", "0.00");
						}
					},
					error: function (error) {
						oPPCCommon.dialogErrorMessage(error, oUtilsI18n.getText("common.Dialog.Error.ServiceError.Header"));
						busyDialog.close();
					}
				});
			});
		},
		prepareItemsODataFilter: function (LoginID, CustomerNo) {
			var ListItemsFilters = new Array();
			ListItemsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListItemsFilters, "CustomerNo", sap.ui.model.FilterOperator
				.EQ, [CustomerNo], false, false, false);
			ListItemsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListItemsFilters, "LoginID", sap.ui.model.FilterOperator
				.EQ, [LoginID], false, false, false);
			return ListItemsFilters;
		},
		// billtoparty

		getBilltoParties: function (Customer) {
			var that = this;
			var ListModel = this._oComponent.getModel("PCGW");
			oSSCommon.getCurrentLoggedUser({
				sServiceName: "ValueHelps",
				sRequestType: "read"
			}, function (LoginID) {
				ListModel.setHeaders({
					"x-arteria-loginid": LoginID
				});
				ListModel.read("/ValueHelps", {
					filters: that.prepareItemsbilltopartyODataFilter(LoginID, Customer),
					success: function (oData) {
						oData = oPPCCommon.formatItemsOData({
							oData: oData
						});
						var BillToPartyDD = [];
						if (oData.length > 1) {
							BillToPartyDD.push({
								Key: "",
								Text: "(Select)",
								Seperator: "",
								BpGstNO: "",
							});
						}
						for (var k = 0; k < oData.length; k++) {
							BillToPartyDD.push({
								Key: oData[k].ID,
								Text: oData[k].Description,
								Seperator: " - ",
								BpGstNO: oData[k].DepPropDefID
							});
						}
						var BillToPartyDDModel = new sap.ui.model.json.JSONModel();
						BillToPartyDDModel.setData(BillToPartyDD);
						that._oComponent.setModel(BillToPartyDDModel, "BillToPartyDD");
						if (BillToPartyDD.length === 1) {
							that.getView().getModel("Quotations").setProperty("/BillToParty", BillToPartyDD[0].Key);
							that.getView().getModel("Quotations").setProperty("/BillToDesc", BillToPartyDD[0].Text);
							that.getView().getModel("Quotations").setProperty("/BpGstNO", BillToPartyDD[0].BpGstNO);
						} else {
							// that.getView().getModel("Quotations").setProperty("/BillToParty", "");
							// that.getView().getModel("Quotations").setProperty("/BillToDesc", "");
							// that.getView().getModel("Quotations").setProperty("/BpGstNO", "");
						}
					},
					error: function (error) {
						oPPCCommon.dialogErrorMessage(error, oUtilsI18n.getText("common.Dialog.Error.ServiceError.Header"));
						busyDialog.close();
					}
				});
			});
		},
		prepareItemsbilltopartyODataFilter: function (LoginID, CustomerNo) {
			var ListItemsFilters = new Array();
			ListItemsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListItemsFilters, "PartnerNo", sap.ui.model.FilterOperator
				.EQ, [CustomerNo], false, false, false);
			ListItemsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListItemsFilters, "LoginID", sap.ui.model.FilterOperator
				.EQ, [LoginID], false, false, false);
			ListItemsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListItemsFilters, "ModelID", sap.ui.model.FilterOperator
				.EQ, ["DP_COMM"], false, false, false);
			ListItemsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListItemsFilters, "EntityType", sap.ui.model.FilterOperator
				.EQ, ["Quotation"], false, false, false);
			ListItemsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListItemsFilters, "PropName", sap.ui.model.FilterOperator
				.EQ, ["BillToParty"], false, false, false);
			return ListItemsFilters;
		},
		GroupCompanyDD: function (Customer) {
			var that = this;
			var oModelData = this._oComponent.getModel("PCGW");
			var oFilter = new Array();
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "ModelID", sap.ui
				.model.FilterOperator.EQ, ["DP_COMM"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "EntityType", sap
				.ui.model.FilterOperator.EQ, ["Quotation"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "PropName", sap.ui
				.model.FilterOperator.EQ, ["GroupCompany"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "PartnerNo", sap.ui
				.model.FilterOperator.EQ, [Customer], false, false, false);
			oSSCommon.getDropdown(oModelData, "ValueHelps", oFilter, "ID", "Description", busyDialog, this.getView(), "GroupCompanyDD",
				"None",
				function (aDDValue) {
					if (aDDValue.length === 1) {
						that.getView().getModel("Quotations").setProperty("/GrpCompCode", aDDValue[0].Key);
						that.getView().getModel("Quotations").setProperty("/GrpCompName", aDDValue[0].Text);
					}
					var oDDModel = new sap.ui.model.json.JSONModel();
					oDDModel.setData(aDDValue);
					that._oComponent.setModel(oDDModel, "GroupCompanyDD");
				});
			//for enhancement
			if (this.GroupCompanyDD_Exit) {
				this.GroupCompanyDD_Exit();
			}
		},
		ShippConditionDD: function (Customer) {
			var that = this;
			var oModelData = this._oComponent.getModel("PCGW");
			var oFilter = new Array();
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "ModelID", sap.ui
				.model.FilterOperator.EQ, ["DP_COMM"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "EntityType", sap
				.ui.model.FilterOperator.EQ, ["Quotation"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "PropName", sap.ui
				.model.FilterOperator.EQ, ["ShippingCondition"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "PartnerNo", sap.ui
				.model.FilterOperator.EQ, [Customer], false, false, false);
			oSSCommon.getDropdown(oModelData, "ValueHelps", oFilter, "ID", "Description", busyDialog, this.getView(), "ShippConditionDD",
				"None",
				function (aDDValue) {
					if (aDDValue.length === 1) {
						// that.getView().getModel("Quotations").setProperty("/ShippCondition", aDDValue[0].Key);
						// that.getView().getModel("Quotations").setProperty("/ShippCondDesc", aDDValue[0].Text);
					}
					var oDDModel = new sap.ui.model.json.JSONModel();
					oDDModel.setData(aDDValue);
					that._oComponent.setModel(oDDModel, "ShippConditionDD");
				});
			//for enhancement
			if (this.ShippConditionDD_Exit) {
				this.ShippConditionDD_Exit();
			}
		},
		TransportZoneDD: function (Customer) {
			var that = this;
			var oModelData = this._oComponent.getModel("PCGW");
			var oFilter = new Array();
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "ModelID", sap.ui
				.model.FilterOperator.EQ, ["DP_COMM"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "EntityType", sap
				.ui.model.FilterOperator.EQ, ["Quotation"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "PropName", sap.ui
				.model.FilterOperator.EQ, ["TransportZone"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "PartnerNo", sap.ui
				.model.FilterOperator.EQ, [Customer], false, false, false);
			oSSCommon.getDropdown(oModelData, "ValueHelps", oFilter, "ID", "Description", busyDialog, this.getView(), "TransportZoneDD",
				"None",
				function (aDDValue) {
					if (aDDValue.length === 1) {
						that.getView().getModel("Quotations").setProperty("/TransportZone", aDDValue[0].Key);
						that.getView().getModel("Quotations").setProperty("/TransZoneDesc", aDDValue[0].Text);
					}
					var oDDModel = new sap.ui.model.json.JSONModel();
					oDDModel.setData(aDDValue);
					that._oComponent.setModel(oDDModel, "TransportZoneDD");
				});
			//for enhancement
			if (this.TransportZoneDD_Exit) {
				this.TransportZoneDD_Exit();
			}
		},
		PricingZoneDD: function (Customer) {
			var that = this;
			var oModelData = this._oComponent.getModel("PCGW");
			var oFilter = new Array();
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "ModelID", sap.ui
				.model.FilterOperator.EQ, ["DP_COMM"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "EntityType", sap
				.ui.model.FilterOperator.EQ, ["Quotation"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "PropName", sap.ui
				.model.FilterOperator.EQ, ["PricingZone"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter("", "", oFilter, "PartnerNo", sap.ui
				.model.FilterOperator.EQ, [Customer], false, false, false);
			oSSCommon.getDropdown(oModelData, "ValueHelps", oFilter, "ID", "Description", busyDialog, this.getView(), "TransportZoneDD",
				"None",
				function (aDDValue) {
					if (aDDValue.length === 1) {
						that.getView().getModel("Quotations").setProperty("/PriceList", aDDValue[0].Key);
						that.getView().getModel("Quotations").setProperty("/PriceListDesc", aDDValue[0].Text);
					}
					var oDDModel = new sap.ui.model.json.JSONModel();
					oDDModel.setData(aDDValue);
					that._oComponent.setModel(oDDModel, "PricingZoneDD");
				});
			//for enhancement
			if (this.TransportZoneDD_Exit) {
				this.TransportZoneDD_Exit();
			}
		},

		setQuotationData: function (oData) {
			this.setQuotationHeader(oData, this._oComponent);
			this.setQuotationItems(oData, this._oComponent);
			// this.getDocuments(oData);
		},
		setQuotationHeader: function (oData) {
			var HeaderData = oData;
			var oHeaderModel = new sap.ui.model.json.JSONModel();
			oHeaderModel.setData(HeaderData);
			this._oComponent.setModel(oHeaderModel, "Quotations");
			var Date = oSSCommon.getFormattedDate(HeaderData.PoDate);
			this._oComponent.getModel("LocalViewSettingDtl").setProperty("/PoDate", Date);
			var PayerAvailableCreditLimit = parseFloat(oData.ZZCreditLimit) - parseFloat(oData.ZZCreditExposure);
			PayerAvailableCreditLimit = PayerAvailableCreditLimit.toFixed(2);
			this._oComponent.getModel("LocalViewSettingDtl").setProperty("/PayerAvailableCreditLimit", PayerAvailableCreditLimit);
			// megha
			// if (!this._oComponent.getModel("LocalViewSettingDtl").getProperty("/editApproveButtonVisible")) {
			// 	if (oData.StatusID === "A") {
			// 		this._oComponent.getModel("LocalViewSettingDtl").setProperty("/editButtonVisible", true);
			// 	} else {
			// 		this._oComponent.getModel("LocalViewSettingDtl").setProperty("/editButtonVisible", false);
			// 	}
			// }

		},
		getDocuments: function (oData) {
			var oView = this.getView();
			var that = this;
			var ContractItemsListModel = this._oComponent.getModel("SFGW_INQ");
			this.getCurrentUsers1("QuotationDocuments", "read", function (LoginID) {
				ContractItemsListModel.setHeaders({
					"x-arteria-loginid": LoginID
				});
				ContractItemsListModel.read("/QuotationDocuments", {
					filters: that.prepareContractContractDocumentsODataFilter(LoginID, oData.QuotationNo),
					success: function (oData) {
						var oContractDocumentItemModel = new sap.ui.model.json.JSONModel();

						for (var i = 0; i < oData.results.length; i++) {
							var sServiceURL = gDetailPageView.getModel("SFGW_INQ").sServiceUrl;
							var sUrl = sServiceURL + "/QuotationDocuments(QuotationNo='" + oData.results[i].QuotationNo + "',DocumentID='" +
								oData.results[i].DocumentID + "',DocumentStore='" + oData.results[i].DocumentStore +
								"',Application='" +
								"PD" + "')/$value";
							oData.results[i].DocumentUrl = oPPCCommon.getDocumentURL({
								sServiceUrl: sUrl

							});
						}

						oContractDocumentItemModel.setData(oData.results);
						that._oComponent.setModel(oContractDocumentItemModel, "QuotationDocuments");
						// oView.getModel("LocalViewSettingDt1").setProperty("/AttachmentCount", oData.results.length);
						busyDialog.close();
					},
					error: function () {
						// oView.getModel("LocalViewSettingDt1").setProperty("/AttachmentCount", 0);
						busyDialog.close();
					}

				});
			});
		},
		prepareContractContractDocumentsODataFilter: function (LoginID, QuotationNo) {
			var DocumentStore = oProductCommon.getProductFeatureValue({
				Types: "DMSSTORE"
			});

			var ContractDocumentsFilters = new Array();
			ContractDocumentsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ContractDocumentsFilters, "LoginID", "", [
					LoginID
				],
				false, false, false);
			ContractDocumentsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ContractDocumentsFilters, "QuotationNo", sap.ui
				.model
				.FilterOperator.EQ, [QuotationNo], true, false, false);
			ContractDocumentsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ContractDocumentsFilters, "DocumentStore", sap.ui
				.model
				.FilterOperator.EQ, [DocumentStore], true, false, false);

			return ContractDocumentsFilters;
		},

		setASNDocumentList: function (oData) {
			this.getASNDocumentLists(this._oComponent, oData);
		},
		setQuotationItems: function (oData) {
			var QuotationItemDetailsModel = new sap.ui.model.json.JSONModel();
			if (oData.QuotationItemDetails.results.length > 0) {
				for (var i = 0; i < oData.QuotationItemDetails.results.length; i++) {
					oData.QuotationItemDetails.results[i].MatF4Input = false;
					oData.QuotationItemDetails.results[i].MatInput = true;
					oData.QuotationItemDetails.results[i].TempQuantity = oData.QuotationItemDetails.results[i].Quantity;

				}
				QuotationItemDetailsModel.setData(oData.QuotationItemDetails.results);
				this._oComponent.setModel(QuotationItemDetailsModel, "QuotationItemDetails");
				this.getView().getModel("LocalViewSettingDtl").setProperty("/ItemsCount", oData.QuotationItemDetails.results.length);
				this.getView().getModel("LocalViewSettingDtl").setProperty("/BatchNo", oData.QuotationItemDetails.results[0].BatchNo);
			} else {
				this.setQuotItemsNoDataFound();
				this.getView().getModel("LocalViewSettingDtl").setProperty("/BatchNo", "");
			}
			if (this.setQuotationItems_Exit) {
				this.setQuotationItems_Exit(oData);
			}
		},

		//-------------------------------Attachment----------------------------------

		getASNDocumentLists: function (component, oData, message) {
			var thisController = this;
			var mandatoryDocs = "";
			var DocumentTypeID = [];
			component.getModel("ASNDocumentList");
			this.getCurrentUsers1("QuotationDocuments", "read", function (LoginID) {
				var ASNDocumentListModel = component.getModel("SFGW_INQ");
				ASNDocumentListModel.attachRequestSent(
					function () {});
				ASNDocumentListModel.attachRequestCompleted(function () {});
				ASNDocumentListModel.setHeaders({
					"x-arteria-loginid": LoginID
				});

				ASNDocumentListModel.read("/QuotationDocuments", {
					filters: thisController.prepareASNDocumentListODataFilter(component, LoginID, oData),
					success: function (oData) {
						oPPCCommon.removeAllMsgs();
						oPPCCommon.hideMessagePopover(thisController);

						// if (oData.results.length > 0) {
						if (component.getModel("ASNDocumentList")) {
							component.getModel("ASNDocumentList").setProperty("/", {});
						}
						var oASNsModel = new sap.ui.model.json.JSONModel();
						oASNsModel.setData(oData.results);

						component.setModel(oASNsModel, "ASNDocumentList");

						// if (DocumentStore === "A") {
						// 	//Checking if mandatory douments in the DocumentTypeID array is available or not
						// 	for (var j = 0; j < window.ASNMandatoryDocType.length; j++) {
						// 		window.ASNMandatoryDocType[j].FoundAttachment = false;
						// 	}
						// 	for (var i = 0; i < window.ASNMandatoryDocType.length; i++) {
						// 		for (var j = 0; j < oData.results.length; j++) {
						// 			if (window.ASNMandatoryDocType[i].Key === oData.results[j].DocumentTypeID) {
						// 				window.ASNMandatoryDocType[i].FoundAttachment = true;
						// 			}
						// 		}
						// 	}

						// }

					},
					error: function (error) {
						oPPCCommon.removeAllMsgs();
						if (component.getModel("ASNDocumentList")) {
							component.getModel("ASNDocumentList").setProperty("/", {});
						}
						if (message) {
							setTimeout(function () {
								sap.m.MessageToast.show(message);
							}, 10);
						}
						window.CreateASNAttachmentView.setBusy(false);
					}
				});
			});
		},

		getCurrentUsers1: function (sServiceName, sRequestType, callBack) {
			if (callBack) {
				oSSCommon.getCurrentLoggedUser({
					sServiceName: sServiceName,
					sRequestType: sRequestType
				}, function (LoginID) {
					callBack(LoginID);
				});
			} else {
				var sLoginID = oSSCommon.getCurrentLoggedUser({
					sServiceName: sServiceName,
					sRequestType: sRequestType
				});
				return sLoginID;
			}
		},
		// prepareASNDocumentListODataFilter: function(component, LoginID) {
		// 	var that = this;
		// 	var oModelData = component.getModel("PCGW");

		// 	// oSSCommon.getStoredTypeValues({
		// 	// 	Types: "DMSSTORE",
		// 	// 	oDataModel: oModelData
		// 	// }, function(sStoredValue) {

		// 	// });
		// 	var ASNDocumentListFilters = new Array();
		// 	ASNDocumentListFilters = oPPCCommon.setODataModelReadFilter(that, "", ASNDocumentListFilters, "LoginID", "", [
		// 			LoginID
		// 		],
		// 		false, false, false);
		// 	ASNDocumentListFilters = oPPCCommon.setODataModelReadFilter(that, "", ASNDocumentListFilters, "TempObjectID", sap.ui
		// 		.model
		// 		.FilterOperator.EQ, [gTempObjectID], true, false, false);
		// 	/*ASNDocumentListFilters = oPPCCommon.setODataModelReadFilter(gASNDetailsHeaderView, "", ASNDocumentListFilters, "ASNItemNumber", sap.ui.model
		// 		.FilterOperator.EQ, ["'00000'"], false, false, false);*/
		// 	ASNDocumentListFilters = oPPCCommon.setODataModelReadFilter(that, "", ASNDocumentListFilters, "DocumentStore", sap
		// 		.ui
		// 		.model
		// 		.FilterOperator.EQ, [DocumentStore], true, false, false);

		// 	return ASNDocumentListFilters;
		// },

		prepareASNDocumentListODataFilter: function (component, LoginID, oData) {
			var that = this;
			var oModelData = component.getModel("SFGW_INQ");

			var quotNo = this.getView().getModel("Quotations").getProperty("/QuotationNo");

			// var a = component.getModel("ASNs").getProperty("/");

			// oSSCommon.getStoredTypeValues({
			// 	Types: "DMSSTORE",
			// 	oDataModel: oModelData
			// }, function(sStoredValue) {});

			var DocumentStore = oSSCommon.getProductFeatureValue({
				Types: "DMSSTORE"
			});

			var ASNDocumentListFilters = new Array();

			ASNDocumentListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ASNDocumentListFilters, "LoginID", "", [LoginID],
				false, false, false);

			ASNDocumentListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ASNDocumentListFilters, "QuotationNo", sap.ui.model
				.FilterOperator.EQ, [quotNo], true, false, false);

			// if (ASNFlag === "X") {
			// 	ASNDocumentListFilters = oPPCCommon.setODataModelReadFilter(gASNDetailsHeaderView, "", ASNDocumentListFilters, "ASNFlag", sap.ui.model
			// 		.FilterOperator.EQ, [ASNFlag], true, false, false);
			// } else if (ASNFlag === "") {
			// 	ASNDocumentListFilters = oPPCCommon.setODataModelReadFilter(gASNDetailsHeaderView, "", ASNDocumentListFilters, "ASNFlag", sap.ui.model
			// 		.FilterOperator.EQ, [ASNFlag], true, false, false);
			// }

			ASNDocumentListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ASNDocumentListFilters, "DocumentStore", sap.ui
				.model
				.FilterOperator.EQ, [DocumentStore], true, false, false);
			return ASNDocumentListFilters;
		},
		//----------------------------------------------------------------------------

		setQuotItemsNoDataFound: function () {
			var oView = this.getView();
			/** Clear Model of the view */
			if (oView.getModel("QuotationItemDetails") !== undefined) {
				oView.getModel("QuotationItemDetails").setProperty("/", {});
			}

			gDetailPageItems.byId("ItemsTable_ALL").setNoDataText(oUtilsI18n.getText("common.NoResultsFound"));
			gDetailPageItems.byId("UIItemsTable_ALL").setNoData(oUtilsI18n.getText("common.NoResultsFound"));
			gDetailPageItems.byId("UIItemsTable_ALL").setVisibleRowCount(2);
			gDetailPageItems.byId("UIItemsTable_ALL").setMinAutoRowCount(2);

			oView.getModel("LocalViewSettingDtl").setProperty("/PartnersCount", 0);

			if (this.setNodataFound_Exit) {
				this.setNodataFound_Exit();
			}
		},
		onEdit: function () {
			oPPCCommon.removeAllMsgs();
			oPPCCommon.hideMessagePopover(gObjPageLayout);
			this.gotoEdit();
		},
		getCurrentUsers: function (sServiceName, sRequestType) {
			var sLoginID = oProductCommon.getCurrentLoggedUser({
				sServiceName: sServiceName,
				sRequestType: sRequestType
			});
			return sLoginID;
		},
		handleoDataError: function (error) {
			var message = oPPCCommon.parseoDataErrorMessage(error);
			// var message = error;
			if (message.trim() === "Not Found") {
				this.clearHeaderModel();
				this.clearItemModel();
				this.router.navTo("NoMatching");
			} else {
				var that = this;
				oPPCCommon.dialogErrorMessage(error, oUtilsI18n.getText("common.Dialog.Error.ServiceError.Header"), function () {
					that.backToList();
				});
			}
		},
		ExportToExcel: function (oEvent) {
			var table1 = this.getView().byId("ItemsTable_ALL");
			var items;
			items = table1.getItems();
			if (items.length > 0) {
				if (Device.system.desktop) {
					oPPCCommon.copyAndApplySortingFilteringFromUITable({
						thisController: this,
						mTable: this.getView().byId("ItemsTable_ALL"),
						uiTable: this.getView().byId("UIItemsTable_ALL")
					});
				}
			}
			var table = this.getView().byId("ItemsTable_ALL"); // oEvent.getSource().getParent().getParent();
			var oModel = this.getView().getModel("QuotationItemDetails");
			oPPCCommon.exportToExcel(table, oModel, {
				bExportAll: false,
				oController: this,
				bLabelFromMetadata: true,
				sModel: "SFGW_INQ",
				sEntityType: "QuotationItemDetail",
				oUtilsI18n: oUtilsI18n,
				sFileName: "Quotation Detail"
			});
		},

		/*--------------------------------------------Navigation--------------------------------------------*/

		navigateBack: function () {
			var that = this;
			if (that.getView().getModel("LocalViewSettingDtl").getProperty("/editMode") === true) {
				this.backToDetail();
			} else if (that.getView().getModel("LocalViewSettingDtl").getProperty("/reviewMode") === true) {
				this.backToEdit();
			} else {
				var that = this;
				that.backToList();
			}
		},

		backToEdit: function () {
			var that = this;
			that.getView().getModel("LocalViewSettingDtl").setProperty("/detailMode", false);
			that.getView().getModel("LocalViewSettingDtl").setProperty("/editMode", true);
			that.getView().getModel("LocalViewSettingDtl").setProperty("/reviewMode", false);

		},

		gotoEdit: function () {
			var that = this;
			oPPCCommon.removeAllMsgs();
			this._oComponent.getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
				.getData()
				.length);
			//clone the data 
			this._oLocalViewSettingDtl = jQuery.extend({}, this.getView().getModel("LocalViewSettingDtl").getData());
			this._oQuotationItemDetails = jQuery.extend(true, [], this._oComponent.getModel("QuotationItemDetails").getData());
			this._oQuotations = jQuery.extend({}, this._oComponent.getModel("Quotations").getData());

			this._oComponent.getModel("LocalViewSettingDtl").setProperty("/approveButton", false);
			this._oComponent.getModel("LocalViewSettingDtl").setProperty("/rejectButton", false);
			this._oComponent.getModel("LocalViewSettingDtl").setProperty("/editApproveButtonVisible", false);
			this._oComponent.getModel("LocalViewSettingDtl").setProperty("/editMode", true);
			this._oComponent.getModel("LocalViewSettingDtl").setProperty("/detailMode", false);
			this._oComponent.getModel("LocalViewSettingDtl").setProperty("/reviewMode", false);
			this._oComponent.getModel("LocalViewSettingDtl").setProperty("/editButtonVisible", false);
			this._oComponent.getModel("LocalViewSettingDtl").setProperty("/EditBatch", true);

			//Clone the data

		},
		onCancel: function () {
			this.confirmDialog();
		},
		confirmDialog: function () {
			var that = this;
			var dialog = new sap.m.Dialog({
				title: 'Confirm',
				type: 'Message',
				state: 'Warning',
				icon: 'sap-icon://message-warning',
				content: new sap.m.Text({
					text: oi18n.getText("SODetailHeaderEdit.Popup.confirmation")
				}),
				beginButton: new sap.m.Button({
					text: 'Yes',
					press: function () {
						that.getView().getModel("LocalViewSettingDtl").setProperty("/detailMode", true);
						that.getView().getModel("LocalViewSettingDtl").setProperty("/editMode", false);
						that.getView().getModel("LocalViewSettingDtl").setProperty("/reviewMode", false);
						that.getView().getModel("LocalViewSettingDtl").setProperty("/editButtonVisible", true);
						that.getView().getModel("LocalViewSettingDtl").setProperty("/uploadvisibility", false);
						var oLocalModel = that.getView().getModel("LocalViewSettingDtl");
						var oLocalData = oLocalModel.getData();
						oLocalData = that._oLocalViewSettingDtl;
						oLocalModel.setData(oLocalData);
						//Restore the data
						var oSOItemDetailModel = that.getView().getModel("QuotationItemDetails");
						var oSOItemDetailData = oSOItemDetailModel.getData();
						oSOItemDetailData = that._oQuotationItemDetails;
						oSOItemDetailModel.setData(oSOItemDetailData);
						var oSOModel = that.getView().getModel("Quotations");
						var oSOData = oSOModel.getData();
						oSOData = that._oQuotations;
						oSOModel.setData(oSOData);
						dialog.close();
					}
				}),
				endButton: new sap.m.Button({
					text: 'No',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});
			dialog.open();
		},
		onBack: function (oEvent) {
			if (gDetailPageView.getModel("LocalViewSettingDtl").getProperty("/editMode") === true) {
				this.backToDetail();
			} else if (gDetailPageView.getModel("LocalViewSettingDtl").getProperty("/reviewMode") === true) {
				this.backToEdit();
			} else {
				var that = this;
				busyDialog.close();
				that.backToList();
			}
		},
		backToList: function () {
			var oHistory, sPreviousHash;
			oHistory = sap.ui.core.routing.History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();
			if (oPPCCommon.isUshell()) {
				if (this.getView().getModel("LocalViewSettingDtl").getProperty("/savedSuccessfully")) {
					this.getView().getModel("LocalViewSettingDtl").setProperty("/savedSuccessfully", false);
					window.history.go(-1);
				} else {
					window.history.go(-1);
				}
			} else {
				if (sPreviousHash !== undefined) {
					if (this.getView().getModel("LocalViewSettingDtl").getProperty("/savedSuccessfully")) {
						this.getView().getModel("LocalViewSettingDtl").setProperty("/savedSuccessfully", false);
						window.history.go(-1);
					} else {
						window.history.go(-1);
					}
				} else {
					window.history.go(-1);
				}
			}
		},
		clearHeaderModel: function () {
			if (this.getView().getModel("SSROs") !== undefined) {
				this.getView().getModel("SSROs").setProperty("/", {});
			}
		},
		clearItemModel: function () {
			if (this.getView().getModel("SSROItemDetails") !== undefined) {
				this.getView().getModel("SSROItemDetails").setProperty("/", {});
			}
		},
		backToDetail: function () {
			this.confirmDialog();
		},
		setItemsToken: function () {
			var aItem = this.getView().getModel("QuotationItemDetails").getData();

			for (var i = 0; i < aItem.length; i++) {
				if (gDetailPageItems.byId("UIItemsTable")) {
					if (gDetailPageItems.byId("UIItemsTable").getRows().length > 0) {
						var MatId = gDetailPageItems.byId("UIItemsTable").getRows()[i].getAggregation("cells")[1];

						MatId.removeAllTokens();
						MatId.setValueState(sap.ui.core.ValueState.None);
						MatId.setValueStateText("");

						// gDetailPageItems.byId("inputMaterial").removeAllTokens();

						// gDetailPageItems.setValueState(sap.ui.core.ValueState.None);
						// gDetailPageItems.setValueStateText("");
						if (aItem[i].Material !== undefined || aItem[i].Material !== "" || aItem[i].Material !== null) {
							MatId.addToken(new sap.m.Token({
								key: aItem[i].Material,
								text: aItem[i].MaterialDesc + " (" + aItem[i].Material + ")"
							}));
						}

					}

				}
			}

		},

		onReview: function () {
			var that = this;
			oPPCCommon.removeServerMsgsInMsgMgrByTarget("/");
			oPPCCommon.removeAllMsgs();
			this.validateQuotations("X");
			if (oPPCCommon.doErrMessageExist()) {
				//setting messageLength
				this.getView().byId("ReviewBtn").setEnabled(false);
				this.getView().getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
					.getData().length);
				//hide popover
				oPPCCommon.hideMessagePopover(gDetailPageView);
				//Call SO Simulate
				this.callSOSimulate("X");
			} else {
				this.getView().getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
					.getData()
					.length);
				oPPCCommon.showMessagePopover(gObjPageLayout);
			}
		},
		callSOSimulate: function (TestRun) {
			var that = this;
			busyDialog.open();
			//session ID
			var loginID = this.getCurrentUsers("Quotations", "create");
			this._oSOTestRunHeaderData = jQuery.extend({}, gDetailPageView.getModel("Quotations").getData());
			this._oSOTestRunItemsData = jQuery.extend(true, [], gDetailPageView.getModel("QuotationItemDetails").getData());
			var oHeader = this.getView().getModel("Quotations").getProperty("/");
			var QuotationNo = gDetailPageView.getModel("Quotations").getProperty("/QuotationNo");
			oHeader.LoginID = loginID;
			if (oHeader.PODate) {
				oHeader.PODate = oPPCCommon.addHoursAndMinutesToDate({
					dDate: oHeader.PODate
				});
			}
			oHeader.QuotationDate = oPPCCommon.addHoursAndMinutesToDate({
				dDate: oHeader.QuotationDate
			});
			if (oHeader.ReqDlvryDate) {
				oHeader.ReqDlvryDate = oPPCCommon.addHoursAndMinutesToDate({
					dDate: oHeader.ReqDlvryDate
				});
			}
			if (oHeader.ValidFrom) {
				oHeader.ValidFrom = oPPCCommon.addHoursAndMinutesToDate({
					dDate: oHeader.ValidFrom
				});
			}
			if (oHeader.ValidTo) {
				oHeader.ValidTo = oPPCCommon.addHoursAndMinutesToDate({
					dDate: oHeader.ValidTo
				});
			}
			oHeader.QuotationNo = "" + QuotationNo;
			oHeader.TestRun = "S";
			delete oHeader.AvailableBalance;
			delete oHeader.CreditLimit;
			delete oHeader.CreditExposure;
			delete oHeader.MaterialNoValueState;
			delete oHeader.MRP;
			delete oHeader.NetAmount;
			delete oHeader.TaxAmount;
			delete oHeader.GrossAmount;
			delete oHeader.NetValue;
			//delete oHeader.MaterialNoValueStateText;
			//Item Data
			var aItem = this.getView().getModel("QuotationItemDetails").getProperty("/");
			for (var i = 0; i < aItem.length; i++) {
				aItem[i].ItemPlant = oHeader.Plant;
				aItem[i].BatchNo = that.getView().getModel("LocalViewSettingDtl").getProperty("/BatchNo");
				aItem[i].ItemPlantDesc = oHeader.PlantDesc;
				aItem[i].LoginID = loginID;
				aItem[i].QuotationNo = QuotationNo;
				delete aItem[i].QuantityValueState;
				delete aItem[i].QuantityValueStateText;
				delete aItem[i].MaterialNoValueState;
				delete aItem[i].MaterialNoValueStateText;
				delete aItem[i].MaterialVisible;
				delete aItem[i].MatF4Input;
				delete aItem[i].MatInput;
				delete aItem[i].TempQuantity;
			}
			oHeader.QuotationItemDetails = aItem;
			//Call So simualte
			var oModelCreate = this.getView().getModel("SFGW_INQ");
			oModelCreate.setUseBatch(true);
			oModelCreate.setDeferredBatchGroups(["SOSimulate"]);
			oModelCreate.setHeaders({
				"x-arteria-loginid": loginID
			});
			oModelCreate.create("/Quotations", oHeader, {
				groupId: "SOSimulate"
			});
			oModelCreate.submitChanges({
				groupId: "SOSimulate",
				success: function (oData) {
					oPPCCommon.removeDuplicateMsgsInMsgMgr();
					if (oPPCCommon.doErrMessageExist()) {

						that.setSOData(oData.__batchResponses[0].__changeResponses[0].data);
						//setting messageLength
						that.getView().getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
							.getData().length);

						//hide popover
						oPPCCommon.hideMessagePopover(gObjPageLayout);
						if (TestRun === "X") {
							// that.showReviewPage();
							that.getView().getModel("LocalViewSettingDtl").setProperty("/reviewMode", true);
							that.getView().getModel("LocalViewSettingDtl").setProperty("/editMode", false);
						}
					} else {
						that.getView().getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
							.getData().length);
						oPPCCommon.showMessagePopover(gObjPageLayout);
					}
					busyDialog.close();
					that.getView().byId("ReviewBtn").setEnabled(true);
					that.getView().byId("SaveBtn").setEnabled(true);
				},
				error: function (response) {
					oPPCCommon.removeDuplicateMsgsInMsgMgr();
					that.getView().getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
						.getData()
						.length);
					oPPCCommon.showMessagePopover(gObjPageLayout)
					busyDialog.close();
					that.getView().byId("ReviewBtn").setEnabled(true);
					that.getView().byId("SaveBtn").setEnabled(true);
				}
			});
		},
		showReviewPage: function () {
			var that = this;
			//setting messageLength
			that.getView().getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
				.getData().length);
			//hide popover
			oPPCCommon.hideMessagePopover(gObjPageLayout);
			that.getView().getModel("LocalViewSettingDtl").setProperty("/reviewMode", true);
			that.getView().getModel("LocalViewSettingDtl").setProperty("/editMode", false);
			this.getView().getModel("Quotations").setProperty("/", this._oSOTestRunHeaderData);
			this.getView().getModel("QuotationItemDetails").setProperty("/", this._oSOTestRunItemsData);

			//setting table count for review page
			//this.setTabCount(this.getView().getModel("QuotationItemDetails").getProperty("/"), this.getView());

			//for enhancement
			if (this.showReviewPage_Exit) {
				this.showReviewPage_Exit();
			}
		},
		setSOData: function (oData) {
			this.setHeaderData(oData);
			this.setItemsData(oData);
		},
		setHeaderData: function (oData) {
			this._oComponent.getModel("Quotations").setProperty("/NetAmount", oData.NetAmount);
			this._oComponent.getModel("Quotations").setProperty("/GrossAmount", oData.GrossAmount);
			this._oComponent.getModel("Quotations").setProperty("/TaxAmount", oData.TaxAmount);
			this._oComponent.getModel("Quotations").setProperty("/FreightAmount", oData.FreightAmount);
			this._oComponent.getModel("Quotations").setProperty("/DiscountAmount", oData.DiscountAmount);
			this._oComponent.getModel("Quotations").setProperty("/Discount", oData.Discount);
			oData.PoDate = oPPCCommon.addHoursAndMinutesToDate({
				dDate: oData.PoDate
			});
			this._oComponent.getModel("Quotations").setProperty("/PoDate", oData.PoDate);
			oData.ValidFrom = oPPCCommon.addHoursAndMinutesToDate({
				dDate: oData.ValidFrom
			});
			this._oComponent.getModel("Quotations").setProperty("/ValidFrom", oData.ValidFrom);
			oData.ValidTo = oPPCCommon.addHoursAndMinutesToDate({
				dDate: oData.ValidTo
			});
			this._oComponent.getModel("Quotations").setProperty("/ValidTo", oData.ValidTo);
		},
		setItemsData: function (oData) {

			for (var i = 0; i < oData.QuotationItemDetails.results.length; i++) {
				oData.QuotationItemDetails.results[i].TempQuantity = this._oSOTestRunItemsData[0].TempQuantity;
				if (oData.QuotationItemDetails.results[i].Material) {
					oData.QuotationItemDetails.results[i].MatF4Input = false;
					oData.QuotationItemDetails.results[i].MatInput = true;
				} else {
					oData.QuotationItemDetails.results[i].MatF4Input = true;
					oData.QuotationItemDetails.results[i].MatInput = false;
				}

			}
			var oQuotationsModel = new sap.ui.model.json.JSONModel();
			oQuotationsModel.setData(oData.QuotationItemDetails.results);
			this._oComponent.setModel(oQuotationsModel, "QuotationItemDetails");
			this.getView().getModel("LocalViewSettingDtl").setProperty("/ItemsCount", oData.QuotationItemDetails.results.length);
		},
		onSave: function () {
			oPPCCommon.removeAllMsgs();
			oPPCCommon.hideMessagePopover(gDetailPageView);
			gDetailPageView.getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
				.getData().length);
			//remove message from message model & hide popover
			var that = this;
			this.getView().byId("SaveBtn").setEnabled(false);
			//Dialog open
			busyDialog.open();
			//session ID
			var loginID = this.getCurrentUsers("Quotations", "create");
			//Header Data
			var oHeader = this.getView().getModel("Quotations").getProperty("/");
			var oModelUpdate = this.getView().getModel("SFGW_INQ");
			oModelUpdate.setDeferredBatchGroups(["Quotations"]);
			oHeader.LoginID = loginID;
			//delete oHeader.QuotationNo;
			delete oHeader.AvailableBalance;
			delete oHeader.CreditLimit;
			delete oHeader.CreditExposure;
			delete oHeader.NetAmount;
			delete oHeader.TaxAmount;
			delete oHeader.GrossAmount;
			delete oHeader.NetValue;
			delete oHeader.MRP;
			delete oHeader.TestRun;
			delete oHeader.QuotationItemDetails;
			if (oHeader.PoDate) {
				oHeader.PoDate = oPPCCommon.addHoursAndMinutesToDate({
					dDate: oHeader.PoDate
				});
			}
			if (oHeader.ReqDlvryDate) {
				oHeader.ReqDlvryDate = oPPCCommon.addHoursAndMinutesToDate({
					dDate: oHeader.ReqDlvryDate
				});
			}
			if (oHeader.ValidFrom) {
				oHeader.ValidFrom = oPPCCommon.addHoursAndMinutesToDate({
					dDate: oHeader.ValidFrom
				});
			}
			if (oHeader.ValidTo) {
				oHeader.ValidTo = oPPCCommon.addHoursAndMinutesToDate({
					dDate: oHeader.ValidTo
				});
			}
			oHeader.QuotationDate = oPPCCommon.addHoursAndMinutesToDate({
				dDate: oHeader.QuotationDate
			});
			oModelUpdate.setHeaders({
				"x-arteria-loginid": loginID
			});
			oModelUpdate.update("/Quotations(QuotationNo='" + oHeader.QuotationNo + "')", oHeader, {
				groupId: "Quotations"
			});
			//Item Data
			var aItem = this.getView().getModel("QuotationItemDetails").getProperty("/");
			for (var i = 0; i < aItem.length; i++) {
				aItem[i].LoginID = loginID;
				aItem[i].BatchNo = that.getView().getModel("LocalViewSettingDtl").getProperty("/BatchNo");
				aItem[i].ItemPlant = oHeader.Plant;
				aItem[i].ItemPlantDesc = oHeader.PlantDesc;
				delete aItem[i].QuantityValueState;
				delete aItem[i].MaterialNoValueState;
				delete aItem[i].MaterialNoValueStateText;
				delete aItem[i].MaterialVisible;
				delete aItem[i].MatF4Input;
				delete aItem[i].MatInput;
				delete aItem[i].TempQuantity;

				oModelUpdate.setHeaders({
					"x-arteria-loginid": loginID
				});
				oModelUpdate.update("/QuotationItemDetails(QuotationNo='" + aItem[i].QuotationNo + "',ItemNo='" + aItem[i].ItemNo + "')", aItem[
					i], {
					groupId: "Quotations"
				});
			}
			oModelUpdate.submitChanges({
				groupId: "Quotations",
				success: function (oData) {
					if (oPPCCommon.doErrMessageExist()) {
						if (gDetailPageView.getModel("LocalViewSettingDtl").getProperty("/HeadereditApprove")) {
							that.onApproval("X", "", "", "", "", "");
						} else {
							gDetailPageView.getModel("LocalViewSettingDtl").setProperty("/detailMode", true);
							gDetailPageView.getModel("LocalViewSettingDtl").setProperty("/editButtonVisible", true);
							gDetailPageView.getModel("LocalViewSettingDtl").setProperty("/reviewMode", false);
							gDetailPageView.getModel("LocalViewSettingDtl").setProperty("/savedSuccessfully", true);
							setTimeout(function () {
								sap.m.MessageToast.show(oi18n.getText("SODetail.MessageToast.changessuccessfully"));
							}, 500);
							that.getDetails();
						}
						busyDialog.close();
					} else {
						oPPCCommon.removeDuplicateMsgsInMsgMgr();
						that.getView().getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
							.getData().length);
						oPPCCommon.showMessagePopover(gObjPageLayout);
						busyDialog.close();
						that.getView().byId("SaveBtn").setEnabled(true);
					}
				},
				error: function (response) {
					oPPCCommon.removeDuplicateMsgsInMsgMgr();
					that.getView().getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
						.getData()
						.length);
					oPPCCommon.showMessagePopover(gObjPageLayout)
					busyDialog.close();
					that.getView().byId("SaveBtn").setEnabled(true);
				}
			});
		},
		RejReasonSave: function (apprFlag, rejFlag, editApprFlag, TempRemarks, TempRejReason, TempRejReasonDesc) {
			oPPCCommon.removeAllMsgs();
			oPPCCommon.hideMessagePopover(gDetailPageView);
			gDetailPageView.getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
				.getData().length);
			var that = this;
			busyDialog.open();
			//session ID
			var loginID = this.getCurrentUsers("Quotations", "create");
			//Header Data
			var oHeader = this.getView().getModel("Quotations").getProperty("/");
			var oModelUpdate = this.getView().getModel("SFGW_INQ");
			oModelUpdate.setDeferredBatchGroups(["Quotations"]);
			oHeader.LoginID = loginID;
			delete oHeader.AvailableBalance;
			delete oHeader.CreditLimit;
			delete oHeader.CreditExposure;
			delete oHeader.NetAmount;
			delete oHeader.TaxAmount;
			delete oHeader.GrossAmount;
			delete oHeader.NetValue;
			delete oHeader.MRP;
			delete oHeader.TestRun;
			delete oHeader.QuotationItemDetails;
			if (oHeader.PoDate) {
				oHeader.PoDate = oPPCCommon.addHoursAndMinutesToDate({
					dDate: oHeader.PoDate
				});
			}
			if (oHeader.ReqDlvryDate) {
				oHeader.ReqDlvryDate = oPPCCommon.addHoursAndMinutesToDate({
					dDate: oHeader.ReqDlvryDate
				});
			}
			if (oHeader.ValidFrom) {
				oHeader.ValidFrom = oPPCCommon.addHoursAndMinutesToDate({
					dDate: oHeader.ValidFrom
				});
			}
			if (oHeader.ValidTo) {
				oHeader.ValidTo = oPPCCommon.addHoursAndMinutesToDate({
					dDate: oHeader.ValidTo
				});
			}
			oHeader.QuotationDate = oPPCCommon.addHoursAndMinutesToDate({
				dDate: oHeader.QuotationDate
			});
			oModelUpdate.setHeaders({
				"x-arteria-loginid": loginID
			});
			oModelUpdate.update("/Quotations(QuotationNo='" + oHeader.QuotationNo + "')", oHeader, {
				groupId: "Quotations"
			});
			//Item Data
			var aItem = this.getView().getModel("QuotationItemDetails").getProperty("/");
			for (var i = 0; i < aItem.length; i++) {
				aItem[i].LoginID = loginID;
				aItem[i].ItemPlant = oHeader.Plant;
				aItem[i].ItemPlantDesc = oHeader.PlantDesc;
				delete aItem[i].QuantityValueState;
				delete aItem[i].MaterialNoValueState;
				delete aItem[i].MaterialNoValueStateText;
				delete aItem[i].MaterialVisible;
				delete aItem[i].MatF4Input;
				delete aItem[i].MatInput;
				delete aItem[i].TempQuantity;

				aItem[i].RejReason = TempRejReason;
				aItem[i].RejReasonDesc = TempRejReasonDesc;
				oModelUpdate.setHeaders({
					"x-arteria-loginid": loginID
				});
				oModelUpdate.update("/QuotationItemDetails(QuotationNo='" + aItem[i].QuotationNo + "',ItemNo='" + aItem[i].ItemNo + "')", aItem[
					i], {
					groupId: "Quotations"
				});
			}
			oModelUpdate.submitChanges({
				groupId: "Quotations",
				success: function (oData) {
					busyDialog.close();
					if (oPPCCommon.doErrMessageExist()) {
						that.onApproval(apprFlag, rejFlag, editApprFlag, TempRemarks, TempRejReason, TempRejReasonDesc);
					} else {
						that.getView().getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
							.getData().length);
						oPPCCommon.showMessagePopover(gObjPageLayout);
						busyDialog.close();
					}
				},
				error: function (response) {
					oPPCCommon.removeDuplicateMsgsInMsgMgr();
					that.getView().getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
						.getData()
						.length);
					oPPCCommon.showMessagePopover(gObjPageLayout)
					busyDialog.close();
				}
			});
		},
		validateQuotations: function (Testrun) {
			this.validateHeader();
			this.validateItems(Testrun);
			//for enhancement
			if (this.validateQuotations_Exist) { // check whether any extension has implemented the hook...
				this.validateQuotations_Exist(); // ...and call it
			}
		},
		validateHeader: function () {
			var headerModel = this.getView().getModel("Quotations");
			// Customer NO
			if (headerModel.getProperty("/CustomerNo") === "" || headerModel.getProperty("/CustomerNo") === undefined) {
				var msg = oi18n.getText("common.message.pleaseselect", gDetailPageHeaderView.byId("LCustomerNo").getText());
				oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/CustomerNo");
			}
			// Quotation Type
			if (headerModel.getProperty("/QuotationType") === "" || headerModel.getProperty("/QuotationType") === undefined) {
				var msg = oi18n.getText("common.message.pleaseselect", gDetailPageHeaderView.byId("LQuotationType").getText());
				oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/QuotationType");
			}
			// Group Company Code
			if (headerModel.getProperty("/GrpCompCode") === "" || headerModel.getProperty("/GrpCompCode") === undefined) {
				var msg = oi18n.getText("common.message.pleaseselect", gDetailPageHeaderView.byId("LGrpCompCode").getText());
				oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/GrpCompCode");
				gDetailPageHeaderView.byId("GrpCompCode").setValueState(sap.ui.core.ValueState.Error);
				gDetailPageHeaderView.byId("GrpCompCode").setValueStateText(msg);
			} else {
				gDetailPageHeaderView.byId("GrpCompCode").setValueState(sap.ui.core.ValueState.None);
				gDetailPageHeaderView.byId("GrpCompCode").setValueStateText("");
			}
			// Bill To Party
			if (headerModel.getProperty("/BillToParty") === "" || headerModel.getProperty("/BillToParty") === undefined) {
				var msg = oi18n.getText("common.message.pleaseselect", gDetailPageHeaderView.byId("LBillToParty").getText());
				oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/BillToParty");
				gDetailPageHeaderView.byId("BillToParty").setValueState(sap.ui.core.ValueState.Error);
				gDetailPageHeaderView.byId("BillToParty").setValueStateText(msg);
			} else {
				gDetailPageHeaderView.byId("BillToParty").setValueState(sap.ui.core.ValueState.None);
				gDetailPageHeaderView.byId("BillToParty").setValueStateText("");
			}
			// Payer
			if (headerModel.getProperty("/Payer") === "" || headerModel.getProperty("/Payer") === undefined) {
				var msg = oi18n.getText("common.message.pleaseselect", gDetailPageHeaderView.byId("LPayer").getText());
				oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/Payer");
				gDetailPageHeaderView.byId("Payer").setValueState(sap.ui.core.ValueState.Error);
				gDetailPageHeaderView.byId("Payer").setValueStateText(msg);
			} else {
				gDetailPageHeaderView.byId("Payer").setValueState(sap.ui.core.ValueState.None);
				gDetailPageHeaderView.byId("Payer").setValueStateText("");
			}
			// Sales Office
			if (headerModel.getProperty("/SalesOffice") === "" || headerModel.getProperty("/SalesOffice") === undefined) {
				var msg = oi18n.getText("common.message.pleaseselect", gDetailPageHeaderView.byId("LSalesOffice").getText());
				oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/SalesOffice");
			}
			// Plant
			if (headerModel.getProperty("/Plant") === "" || headerModel.getProperty("/Plant") === undefined) {
				var msg = oi18n.getText("common.message.pleaseselect", gDetailPageHeaderView.byId("LPlant").getText());
				oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/Plant");
			}
			// Payterm
			if (headerModel.getProperty("/Payterm") === "" || headerModel.getProperty("/Payterm") === undefined) {
				var msg = oi18n.getText("common.message.pleaseselect", gDetailPageHeaderView.byId("LPayterm").getText());
				oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/Payterm");
				gDetailPageHeaderView.byId("Payterm").setValueState(sap.ui.core.ValueState.Error);
				gDetailPageHeaderView.byId("Payterm").setValueStateText(msg);
			} else {
				gDetailPageHeaderView.byId("Payterm").setValueState(sap.ui.core.ValueState.None);
				gDetailPageHeaderView.byId("Payterm").setValueStateText("");
			}
			// ShippCondition
			if (headerModel.getProperty("/ShippCondition") === "" || headerModel.getProperty("/ShippCondition") === undefined) {
				var msg = oi18n.getText("common.message.pleaseselect", gDetailPageHeaderView.byId("LShippCondition").getText());
				oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/ShippCondition");
				gDetailPageHeaderView.byId("ShippCondition").setValueState(sap.ui.core.ValueState.Error);
				gDetailPageHeaderView.byId("ShippCondition").setValueStateText(msg);
			} else {
				gDetailPageHeaderView.byId("ShippCondition").setValueState(sap.ui.core.ValueState.None);
				gDetailPageHeaderView.byId("ShippCondition").setValueStateText("");
			}
			// ShipToParty
			if (headerModel.getProperty("/ShipToParty") === "" || headerModel.getProperty("/ShipToParty") === undefined) {
				var msg = oi18n.getText("common.message.pleaseselect", gDetailPageHeaderView.byId("LShipToParty").getText());
				oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/ShipToParty");
				gDetailPageHeaderView.byId("ShipToParty").setValueState(sap.ui.core.ValueState.Error);
				gDetailPageHeaderView.byId("ShipToParty").setValueStateText(msg);
			} else {
				gDetailPageHeaderView.byId("ShipToParty").setValueState(sap.ui.core.ValueState.None);
				gDetailPageHeaderView.byId("ShipToParty").setValueStateText("");
			}
			// TransportZone
			if (headerModel.getProperty("/TransportZone") === "" || headerModel.getProperty("/TransportZone") === undefined) {
				var msg = oi18n.getText("common.message.pleaseselect", gDetailPageHeaderView.byId("LTransportZone").getText());
				oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/TransportZone");
				gDetailPageHeaderView.byId("TransportZone").setValueState(sap.ui.core.ValueState.Error);
				gDetailPageHeaderView.byId("TransportZone").setValueStateText(msg);
			} else {
				gDetailPageHeaderView.byId("TransportZone").setValueState(sap.ui.core.ValueState.None);
				gDetailPageHeaderView.byId("TransportZone").setValueStateText("");
			}
			// Req Delivery Date
			if (headerModel.getProperty("/ReqDlvryDate") === null || headerModel.getProperty("/ReqDlvryDate") === undefined) {
				var msg = oi18n.getText("common.message.pleaseselect", gDetailPageHeaderView.byId("LReqDlvryDate").getText());
				oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/ReqDlvryDate");
				gDetailPageHeaderView.byId("ReqDlvryDate").setValueState(sap.ui.core.ValueState.Error);
				gDetailPageHeaderView.byId("ReqDlvryDate").setValueStateText(msg);
			} else {
				gDetailPageHeaderView.byId("ReqDlvryDate").setValueState(sap.ui.core.ValueState.None);
				gDetailPageHeaderView.byId("ReqDlvryDate").setValueStateText("");
			}
			if (headerModel.getProperty("/PoDate") !== undefined && headerModel.getProperty("/PoDate") !== null) {
				if (headerModel.getProperty("/PoNo") === "" || headerModel.getProperty("/PoNo") === undefined) {
					var msg = oi18n.getText("common.message.pleaseeneter", gDetailPageHeaderView.byId("LCustomerPO").getText());
					oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/ReqDlvryDate");
					gDetailPageHeaderView.byId("CustomerPO").setValueState(sap.ui.core.ValueState.Error);
					gDetailPageHeaderView.byId("CustomerPO").setValueStateText(msg);
				} else {
					gDetailPageHeaderView.byId("CustomerPO").setValueState(sap.ui.core.ValueState.None);
					gDetailPageHeaderView.byId("CustomerPO").setValueStateText("");
				}
				if (this.isFutureDate(headerModel.getProperty("/PoDate"))) {
					var msg = oi18n.getText("common.message.futureDate", gDetailPageHeaderView.byId("LCustomerPODate").getText());
					oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/ReqDlvryDate");
					gDetailPageHeaderView.byId("PoDate").setValueState(sap.ui.core.ValueState.Error);
					gDetailPageHeaderView.byId("PoDate").setValueStateText(msg);
				} else {
					gDetailPageHeaderView.byId("PoDate").setValueState(sap.ui.core.ValueState.None);
					gDetailPageHeaderView.byId("PoDate").setValueStateText("");
				}
			}
			if (this.validateHeader_Exist) {
				this.validateHeader_Exist();
			}
		},
		isFutureDate: function (value) {
			var that = this;
			var CurrentDate = that.getView().getModel("LocalViewSettingDtl").getProperty("/CurrentDate");
			var dateFrom = new Date(value);
			CurrentDate.setHours(0, 0, 0, 0);
			dateFrom.setHours(0, 0, 0, 0);
			var dateDifference = (CurrentDate - dateFrom) / (1000 * 60 * 60 * 24);
			var valid = false;
			if (dateDifference < 0) {
				valid = true;
			}
			return valid;
		},
		validateItems: function (TestRun) {
			//get items
			var aItem = this.getView().getModel("QuotationItemDetails").getProperty("/");
			var isValid = true;
			//items
			var materialEntered = false;
			for (var i = 0; i < aItem.length; i++) {
				if (aItem[i].Material !== "") {
					materialEntered = true;
				}
			}
			if (!materialEntered) {
				var msg = oi18n.getText("QuoteCreate.Message.MinimumOneItemExist");
				oPPCCommon.addMsg_MsgMgr(msg, "error", "Material");
				oPPCCommon.showMessagePopover(gObjPageLayout);
				return;
			}
			if (aItem.length <= 0) {
				var msg = oi18n.getText("QuoteCreate.Message.MinimumOneItemExist");
				oPPCCommon.addMsg_MsgMgr(msg, "error", "Quantity");
				oPPCCommon.showMessagePopover(gObjPageLayout);
				return isValid;
			} else {
				for (var i = 0; i < aItem.length; i++) {
					isValid = true;
					oPPCCommon.removeMsgsInMsgMgrById("/UI/Quantity-" + i);
					aItem[i].QuantityValueState = sap.ui.core.ValueState.None;
					aItem[i].QuantityValueStateText = "";
					this.getView().getModel("QuotationItemDetails").setProperty("/", aItem);
					var msg = "";
					if (aItem[i].Material !== "" && aItem[i].Material !== undefined) {
						if (aItem[i].Quantity === "" || aItem[i].Quantity === undefined || aItem[i].Quantity === null) {
							msg = oi18n.getText("QuoteCreate.Message.QtyEmpty", aItem[i].ItemNo);
							isValid = false;
						} else if (parseFloat(aItem[i].Quantity) === 0) {
							msg = oi18n.getText("QuoteCreate.Message.QtyWithZero", aItem[i].ItemNo);
							isValid = false;
						} else if (parseFloat(aItem[i].Quantity) < 0) {
							msg = oi18n.getText("QuoteCreate.Message.QtyWithNegative", aItem[i].ItemNo);
							isValid = false;
						} else if ((parseFloat(aItem[i].Quantity) > 0) && (this._oComponent.getModel("LocalViewSettingDtl").getProperty(
								"/HeadereditApprove"))) {
							if (parseFloat(aItem[i].Quantity) > parseFloat(aItem[i].TempQuantity)) {
								msg = oi18n.getText("QuoteCreate.Message.QtyGreaterThan", [aItem[i].TempQuantity, aItem[i].ItemNo]);
								isValid = false;
							}
						}
						if (!isValid) {
							aItem[i].QuantityValueState = sap.ui.core.ValueState.Error;
							aItem[i].QuantityValueStateText = msg;
							this.getView().getModel("QuotationItemDetails").setProperty("/", aItem);
							oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/Quantity-" + i);
						}
						if (TestRun === "X") {
							var NetValue = aItem[i].NetValue;
							if (aItem[i].ItemCategory !== "TANN") {
								if (NetValue === "0.00" || NetValue === "0" || NetValue === null || NetValue === undefined || NetValue === "undefined" ||
									NetValue === "NaN" || NetValue === 0) {
									msg = "Net Amount Can't be Zero for Item No " + aItem[i].ItemNo;
									oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/NetValue-" + i);
									isValid = false;
								}
							}
						}
					}
				}
			}
			//for enhancement
			if (this.validateItems_Exist) {
				this.validateItems_Exist();
			}

			return isValid;
		},
		clearAllErrors: function () {
			this.clearValueState(["FPODate", "FIncoterm1"]);
			var oData = sap.ui.getCore().getMessageManager().getMessageModel().getData();
			for (var i = 0; i < oData.length; i++) {
				var msgObj = oData[i];
				if (msgObj.id.indexOf("/UI/") > -1) {
					oPPCCommon.removeMsgsInMsgMgrById(msgObj.id);
				}
			}
		},

		clearValueState: function (aFieldId) {
			for (var i = 0; i < aFieldId.length; i++) {
				gDetailPageHeaderView.byId(aFieldId[i]).setValueState("None");
				gDetailPageHeaderView.byId(aFieldId[i]).setValueStateText("");
			}
		},
		onApprove: function () {
			var title = oi18n.getText("SODetail.Dialog.Approve.comments");
			var dIcon = "sap-icon://accept";
			var state = "Success";
			this.onApprovalDialog("X", "", "", title, dIcon, state);
		},
		onReject: function () {
			var title = oi18n.getText("SODetail.Dialog.Reject.comments");
			var dIcon = "sap-icon://decline";
			var state = "Error";
			this.onApprovalDialog("", "X", "", title, dIcon, state);
		},
		onApprovalDialog: function (apprFlag, rejFlag, editApprFlag, title, dIcon, state) {
			var that = this;
			oPPCCommon.removeAllMsgs();
			oPPCCommon.hideMessagePopover(gDetailPageView);
			gDetailPageView.getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
				.getData().length);
			that.getView().getModel("LocalViewSettingDtl").setProperty("/TempRemarks", "");
			that.getView().getModel("LocalViewSettingDtl").setProperty("/TempRejReason", "");
			that.getView().getModel("LocalViewSettingDtl").setProperty("/TempRejReasonDesc", "");
			var RejReasonVisible;
			if (rejFlag === "X") {
				RejReasonVisible = true;
			} else {
				RejReasonVisible = false;
			}
			var oPanel = new sap.m.Panel();
			var RemarksLabel = new sap.m.Label({
				text: "Remarks: ",
				required: RejReasonVisible,
				width: "8rem"
			});
			RemarksLabel.addStyleClass("sapUiTinyMarginEnd");
			RemarksLabel.addStyleClass("sapUiTinyMarginTop");
			var RemarksTextArea = new sap.m.TextArea({
				width: "12rem",
				maxLength: oPPCCommon.getMaxLengthFromMetadata({
					oDataModel: this._oComponent.getModel("PCGW"),
					sEntityType: "Task",
					sPropertyName: "Comments"
				}),
				placeholder: 'Remarks',
				liveChange: function (oEvent) {
					that.getView().getModel("LocalViewSettingDtl").setProperty("/TempRemarks", oEvent.getSource().getValue().trim());
				}
			});
			// RemarksTextArea.addStyleClass("sapUiTinyMarginBegin");
			var RemarksHBox = new sap.m.HBox();
			// RemarksHBox.addStyleClass("sapUiTinyMarginTop");
			RemarksHBox.addItem(RemarksLabel);
			RemarksHBox.addItem(RemarksTextArea);
			var VBox = new sap.m.VBox();
			VBox.addItem(RemarksHBox);
			oPanel.addContent(VBox);
			if (rejFlag === "X") {
				var RejLabel = new sap.m.Label({
					text: "Rejection Reason: ",
					required: RejReasonVisible,
					width: "8rem"
				});
				RejLabel.addStyleClass("sapUiTinyMarginEnd");
				RejLabel.addStyleClass("sapUiTinyMarginTop");
				var ItemTemplate = new sap.ui.core.Item({
					key: "{Key}",
					text: "{Key}{Seperator}{Text}",
					tooltip: "{Key}{Seperator}{Text}"
				});
				var RejReason = new sap.m.Select({
					items: {
						path: "/",
						template: ItemTemplate
					},
					width: "12rem",
					change: function (oEvent) {
						if (oEvent.getSource().getSelectedKey()) {
							var Key = oEvent.getSource().getSelectedKey();
							that.getView().getModel("LocalViewSettingDtl").setProperty("/TempRejReason", Key);
							var RejReasonDD = [];
							var TempRejReasonDesc = "";
							if (that.getView().getModel("RejReasonDD")) {
								RejReasonDD = that.getView().getModel("RejReasonDD").getProperty("/");
							}
							for (var k = 0; k < RejReasonDD.length; k++) {
								if (Key === RejReasonDD[k].Key) {
									TempRejReasonDesc = RejReasonDD[k].Text;
								}
							}
							that.getView().getModel("LocalViewSettingDtl").setProperty("/TempRejReasonDesc", TempRejReasonDesc);
						} else {
							that.getView().getModel("LocalViewSettingDtl").setProperty("/TempRejReason", "");
							that.getView().getModel("LocalViewSettingDtl").setProperty("/TempRejReasonDesc", "");
						}
					}
				});
				RejReason.setModel(that.getView().getModel("RejReasonDD"));
				var RejReasonHBox = new sap.m.HBox();
				RejReasonHBox.addItem(RejLabel);
				RejReasonHBox.addItem(RejReason);
				var VBox1 = new sap.m.VBox();
				VBox1.addItem(RejReasonHBox);
				oPanel.addContent(VBox1);
			}
			var dialog = new sap.m.Dialog({
				title: title,
				icon: dIcon,
				state: state,
				type: 'Message',
				content: oPanel,
				beginButton: new sap.m.Button({
					text: 'Submit',
					type: "Accept",
					icon: "sap-icon://activities",
					press: function () {
						oPPCCommon.removeAllMsgs();
						// var sText = sap.ui.getCore().byId('confirmDialogTextarea').getValue();
						var TempRemarks = that.getView().getModel("LocalViewSettingDtl").getProperty("/TempRemarks");
						var TempRejReason = that.getView().getModel("LocalViewSettingDtl").getProperty("/TempRejReason");
						var TempRejReasonDesc = that.getView().getModel("LocalViewSettingDtl").getProperty("/TempRejReasonDesc");
						if (apprFlag === "X") {
							that.onApproval(apprFlag, rejFlag, editApprFlag, TempRemarks, TempRejReason, TempRejReasonDesc);
							dialog.close();
						} else if (rejFlag === "X") {
							if (TempRemarks !== "" && TempRejReason !== "") {
								that.RejReasonSave(apprFlag, rejFlag, editApprFlag, TempRemarks, TempRejReason, TempRejReasonDesc);
								dialog.close();
							} else {
								if (TempRemarks === "") {
									var msg = "Please Enter Remarks";
									oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/Remarks");
								}
								if (TempRejReason === "") {
									var msg = "Please Select Rejection Reason";
									oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/Remarks");
								}
								if (!oPPCCommon.doErrMessageExist()) {
									oPPCCommon.displayMsg_MsgBox(that.getView(), oPPCCommon.getMsgsFromMsgMgr(), "error");
								}
							}
						}
					}
				}),
				endButton: new sap.m.Button({
					text: 'Cancel',
					type: "Reject",
					icon: "sap-icon://sys-cancel",
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});
			dialog.open();
		},
		onApproval: function (apprFlag, rejFlag, editApprFlag, sText) {
			var that = this;
			// var oTasks = that.getView().getModel("Tasks").getProperty("/");
			oPPCCommon.removeAllMsgs();
			oPPCCommon.hideMessagePopover(gDetailPageView);
			gDetailPageView.getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
				.getData()
				.length);
			if (oPPCCommon.doErrMessageExist()) {
				busyDialog.open();
				var oModelapprovalUpdate = this._oComponent.getModel("PCGW");
				oModelapprovalUpdate.setUseBatch(true);
				var loginID = oSSCommon.getCurrentUsers("Tasks", "update");
				var oDecisionKey = "";
				var oInstanceID = "";
				var oSONo = oPPCCommon.getPropertyValueFromContextPath(contextPath, "QuotationNo");
				var oInstanceID = oPPCCommon.getPropertyValueFromContextPath(contextPath, "InstanceID");
				// for (var i = 0; i < oTasks.length; i++) {
				// 	if (oTasks[i].EntityKeyID === oSONo) {
				// 		oInstanceID = oTasks[i].InstanceID;
				// 	}
				// }
				if (apprFlag === "X") {
					oDecisionKey = "01";
				} else if (rejFlag === "X") {
					oDecisionKey = "02";
				} else {
					oDecisionKey = "01"; //"03"
				}
				var oHeader = {};
				oHeader.InstanceID = oInstanceID;
				oHeader.EntityType = "QOT";
				oHeader.DecisionKey = oDecisionKey;
				oHeader.LoginID = loginID;
				oHeader.EntityKey = oSONo;
				oHeader.Comments = sText;
				oModelapprovalUpdate.setDeferredBatchGroups(["updateTask"]);
				oModelapprovalUpdate.setHeaders({
					"x-arteria-loginid": loginID
				});
				oModelapprovalUpdate.update("/Tasks(InstanceID='" + oHeader.InstanceID + "',EntityType='QOT')", oHeader, {
					groupId: "updateTask"
				});
				oModelapprovalUpdate.setHeaders({
					"x-arteria-loginid": loginID
				});
				oModelapprovalUpdate.submitChanges({
					groupId: "updateTask",
					success: function (oData) {
						busyDialog.close();
						gDetailPageView.getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
							.getData()
							.length);
						var message = oPPCCommon.getMsgsFromMsgMgr();
						that.onApprovalSuccess(message, oData);
					},
					error: function (response) {
						busyDialog.close();
						oPPCCommon.removeDuplicateMsgsInMsgMgr();
						gDetailPageView.getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
							.getData()
							.length);
						if (gDetailPageView.getModel("LocalViewSettingDtl").getProperty("/messageLength") > 0) {
							oPPCCommon.showMessagePopover(gSODetailHeaderEditView);
						}
					}
				});
			} else {
				gDetailPageView.getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
					.getData()
					.length);
				oPPCCommon.showMessagePopover(gSODetailHeaderEditView);
			}
		},
		onApprovalSuccess: function (message, CPGUID) {
			oPPCCommon.removeAllMsgs();
			oPPCCommon.hideMessagePopover(gDetailPageView);
			gDetailPageView.getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
				.getData()
				.length);
			var that = this;
			var dialog = new sap.m.Dialog({
				title: 'Success',
				type: 'Message',
				state: 'Success',
				content: new sap.m.Text({
					text: message
				}),
				endButton: new sap.m.Button({
					text: "OK",
					press: function () {
						// gDetailPageView.getModel("LocalViewSettingDtl").setProperty("/detailMode", true);
						// gDetailPageView.getModel("LocalViewSettingDtl").setProperty("/editMode", false);
						// gDetailPageView.getModel("LocalViewSettingDtl").setProperty("/cancelMode", false);
						// gDetailPageView.getModel("LocalViewSettingDtl").setProperty("/reviewMode", false);
						// that._oRouter.navTo("quotapprovelist", {
						// 	contextPath: ""
						// }, true);
						that.backToList();
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});
			dialog.open();
		},
		getTasks: function () {
			var view = gDetailPageView;
			var that = this;
			var oTasks = that.getView().getModel("Tasks").getProperty("/");
			var oInstanceID = "";
			var oSONo = oPPCCommon.getPropertyValueFromContextPath(contextPath, "QuotationNo");
			for (var i = 0; i < oTasks.length; i++) {
				if (oTasks[i].EntityKeyID === oSONo) {
					oInstanceID = oTasks[i].InstanceID;
				}
			}
			var odataModel = undefined;
			odataModel = view.getModel("PCGW");
			odataModel.setHeaders({
				"x-arteria-loginid": this.getCurrentUsers("Tasks", "read")
			});
			odataModel.read("/Tasks(InstanceID='" + oInstanceID +
				"',EntityType='QOT')", {
					urlParameters: {
						"$expand": "TaskDecisions,TaskHistorys"
					},
					success: function (oData) {
						that.setTasksData(oData);
						that.totalServiceCall--;
						if (that.totalServiceCall === 0) {
							busyDialog.close();
						}
					},
					error: function (error) {
						// busyDialog.close();
						that.handleoDataError(error);
						that.totalServiceCall--;
						if (that.totalServiceCall === 0) {
							busyDialog.close();
						}
					}
				});
		},
		setTasksData: function (oData) {
			this.setTaskDecisions(oData);
			this.setTaskHistorys(oData);
		},
		setTaskDecisions: function (oData) {
			// this.clearItemModel();
			var aTaskDecisions;
			aTaskDecisions = oData.TaskDecisions.results;
			var oTaskDecisionsModel = new sap.ui.model.json.JSONModel();
			oTaskDecisionsModel.setData(oData.TaskDecisions.results);
			this.getView().setModel(oTaskDecisionsModel, "TaskDecisions");

			this.setTaskDecisionButtons(aTaskDecisions);
		},
		setTaskDecisionButtons: function (aTaskDecisions) {
			this._oComponent.getModel("LocalViewSettingDtl").setProperty("/editButtonVisible", false);
			gDetailPageView.getModel("LocalViewSettingDtl").setProperty("/approveButton", false);
			gDetailPageView.getModel("LocalViewSettingDtl").setProperty("/rejectButton", false);
			// gDetailPageView.getModel("LocalViewSettingDtl").setProperty("/editApproveButton", false);

			for (var i = 0; i < aTaskDecisions.length; i++) {
				if (aTaskDecisions[i].DecisionKey === "01") {
					gDetailPageView.getModel("LocalViewSettingDtl").setProperty("/approveButton", true);
					if (aTaskDecisions[i].DecisionType === "Positive") {
						gDetailPageView.getModel("LocalViewSettingDtl").setProperty("/approveButtonType", "Accept");
					} else if (aTaskDecisions[i].DecisionType === "Negative") {
						gDetailPageView.getModel("LocalViewSettingDtl").setProperty("/approveButtonType", "Reject");
					} else {
						gDetailPageView.getModel("LocalViewSettingDtl").setProperty("/approveButtonType", "Default");
					}

				}
				if (aTaskDecisions[i].DecisionKey === "02") {
					gDetailPageView.getModel("LocalViewSettingDtl").setProperty("/rejectButton", true);
					if (aTaskDecisions[i].DecisionType === "Positive") {
						gDetailPageView.getModel("LocalViewSettingDtl").setProperty("/rejectButtonType", "Accept");
					} else if (aTaskDecisions[i].DecisionType === "Negative") {
						gDetailPageView.getModel("LocalViewSettingDtl").setProperty("/rejectButtonType", "Reject");
					} else {
						gDetailPageView.getModel("LocalViewSettingDtl").setProperty("/rejectButtonType", "Default");
					}
				}
				// if (aTaskDecisions[i].DecisionKey === "03") {
				// 	gDetailPageView.getModel("LocalViewSettingDtl").setProperty("/editApproveButton", true);
				// 	if (aTaskDecisions[i].DecisionType === "Positive") {
				// 		gDetailPageView.getModel("LocalViewSettingDtl").setProperty("/editApproveButtonType", "Accept");
				// 	} else if (aTaskDecisions[i].DecisionType === "Negative") {
				// 		gDetailPageView.getModel("LocalViewSettingDtl").setProperty("/editApproveButtonType", "Reject");
				// 	} else {
				// 		gDetailPageView.getModel("LocalViewSettingDtl").setProperty("/editApproveButtonType", "Default");
				// 	}
				// }
			}
		},
		setTaskHistorys: function (oData) {
				// this.clearItemModel();
				var oTaskHistorysModel = new sap.ui.model.json.JSONModel();
				oTaskHistorysModel.setData(oData.TaskHistorys.results);
				this.getView().setModel(oTaskHistorysModel, "TaskHistorys");
			}
			/**
			 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
			 * (NOT before the first rendering! onInit() is used for that one!).
			 * @memberOf com.arteriatech.zsf.quot.view.DetailPage
			 */
			//	onBeforeRendering: function() {
			//
			//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.arteriatech.zsf.quot.view.DetailPage
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.arteriatech.zsf.quot.view.DetailPage
		 */
		//	onExit: function() {
		//
		//	}

	});

});
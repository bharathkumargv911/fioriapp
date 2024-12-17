sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"com/arteriatech/ppc/utils/js/Common",
	"com/arteriatech/ss/utils/js/Common",
	"com/arteriatech/ss/utils/js/UserMapping",
	"com/arteriatech/ss/utils/js/CommonValueHelp", "com/arteriatech/ppc/utils/control/TableHeaderText"
], function (Controller, JSONModel, History) {
	"use strict";
	var oi18n, oUtilsI18n;
	var Device = sap.ui.Device;
	var oPPCCommon = com.arteriatech.ppc.utils.js.Common;
	var oSSCommon = com.arteriatech.ss.utils.js.Common;
	var oProductCommon, oCommonValueHelp;
	var product = "PD";
	var oBusyDialog = new sap.m.BusyDialog();
	return Controller.extend("com.arteriatech.zsf.quot.controller.DetailPageItems", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf client.newplugin.artlisttemplate.resources..view.DetailPageItems
		 */
		onInit: function () {
			this.onInitHookUp();
		},

		onInitHookUp: function () {
			this._oView = this.getView();
			gDetailPageItems = this._oView;
			/**
			 * Get reference of the Parent component i.e Component.js
			 */
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(gDetailPageItems));

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
			this._oRouter = this._oComponent.getRouter();
			if (this.onInitHookUp_Exit) {
				this.onInitHookUp_Exit();
			}
		},
		goToItemDetails: function (oEvent) {
			var oModelContext = oEvent.getSource().getBindingContext("QuotationItemDetails");
			var path = "QuotationItemDetails(QuotationNo='" + oModelContext.getProperty("QuotationNo") + "',ItemNo='" + oModelContext.getProperty(
				"ItemNo") + "')";
			this._oRouter.navTo("ItemDetailPage", {
				contextPath: path
			}, false);

			if (this.goToItemDetails_Exit) {
				this.goToItemDetails_Exit(oEvent);
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
				bLabelFromMetadata: false,
				sModel: "SFGW_INQ",
				sEntityType: "QuotationItemDetail",
				oUtilsI18n: oUtilsI18n,
				sFileName: "Quotation Detail"
			});
		},
		addItem: function (oEvent) {

			oPPCCommon.removeServerMsgsInMsgMgrByTarget("/");
			//sap.ui.controller("com.arteriatech.zsf.quot.create.controller.QuoteCreate").validateHeader();
			//this.validateQty();
			if (oPPCCommon.doErrMessageExist()) {
				if (!this.getView().getModel("MaterialSuggestorModel")) {

					this.setMaterialModel();

				} else if (this.getView().getModel("MaterialSuggestorModel").getData().length === 0) {

					this.setMaterialModel();
				}

				var that = this;
				var QuotationItemDetails = this.getView().getModel("QuotationItemDetails");
				var aItems = QuotationItemDetails.getProperty("/");

				/*			aItems.push({
								//InvoiceItemGUID: "",
								ItemNo: "",
								Material: "",
								MaterialDesc: "",
								//UOM: "",
								Quantity: "",
								//QuantityValueState: "None",
								//Currency: that.getView().getModel("SSInvoiceHeader").getProperty("/Currency"),
								UnitPrice: "0.00",
								TaxAmount: "0.00",
								GrossAmount: "0.00",
								//Discount: "0.00",
								//Freight: "0.00",
								NetValue: "0.00",
								//Remarks: "",
								//RemarksValueState: "None",
								//DeletionInd: "",
								//deleteEditable: true,
								//MaterialDisplay: false
							});
							this.getView().getModel("QuotationItemDetails").setProperty("/", aItems);*/

				//set table count and itemnos
				that.getView().getModel("LocalViewSettingDtl").setProperty("/SOItemTableCount", aItems.length);
				//this.setTabCount(this.getView().getModel("QuotationItemDetails").getProperty("/"), this);

				this.addSalesOrderItem(oEvent);
				this.getView().getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
					.getData()
					.length);
				oPPCCommon.hideMessagePopover(gObjPageLayout);
			} else {
				this.getView().getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
					.getData()
					.length);
				oPPCCommon.showMessagePopover(gObjPageLayout);
			}

			//this.removeMaterialToken();
			//this.resetMaterialInLineItems();

			//for enhancement
			if (this.addItem_Exit) {
				this.addItem_Exit();
			}
		},
		removeMaterialToken: function (oComponent) {
			var data = gDetailPageItems.getModel("QuotationItemDetails").getProperty("/");
			for (var i = 0; i < data.length; i++) {

				if (gDetailPageItems.byId("UIItemsTable").getRows().length > 0) {
					if (gDetailPageItems.byId("UIItemsTable").getRows()[i]) {
						gDetailPageItems.byId("UIItemsTable").getRows()[i].getAggregation("cells")[1].removeAllTokens();

					}
				}

			}
		},

		setTabCount: function (SOItems) {
			if (SOItems != null) {
				if (SOItems.length > 0) {
					this.getView().getModel("LocalViewSettingDtl").setProperty("/ItemsCount", "(" + SOItems.length + ")");
				} else {
					this.getView().getModel("LocalViewSettingDtl").setProperty("/ItemsCount", "");
				}
			} else {
				this.getView().getModel("LocalViewSettingDtl").setProperty("/ItemsCount", "");
			}
		},

		addSalesOrderItem: function (oEvent) {
			var SOItems = [];
			var QuotationItemDetails = this.getView().getModel("QuotationItemDetails").getProperty("/");
			if (QuotationItemDetails.length === 0) {
				this._TempQuotationItemDetails = [];
			}
			for (var i = 0; i < QuotationItemDetails.length; i++) {
				SOItems.push(QuotationItemDetails[i]);
			}
			var aItems = {
				ItemNo: "",
				Material: "",
				MaterialDesc: "",
				Quantity: "0.00",
				HSNCode: "",

				Currency: "",
				UnitPrice: "0.00",

				MRP: "0.00",
				DiscountAmount: "0.00",
				TaxAmount: "0.00",
				TaxAmount1: "0.00",
				TaxAmount2: "0.00",
				TaxAmount3: "0.00",

				GrossAmount: "0.00",
				NetValue: "0.00",
				MaterialVisible: true
			};
			SOItems.push(aItems);
			var index = +SOItems.length - 1;
			this.removeMaterialTokenByIndex(index);
			this.getView().getModel("QuotationItemDetails").setProperty("/", SOItems);

			this.getView().getModel("LocalViewSettingDtl").setProperty("/ItemsCount", SOItems.length);

			this.setItemNo(SOItems);

			//for enhancement
			if (this.addSalesOrderItem_Exit) {
				this.addSalesOrderItem_Exit();
			}
		},

		setItemNo: function (oEvent) {
			var countOfM = 0;
			var count = 0;

			var aItem = this.getView().getModel("QuotationItemDetails").getProperty("/");

			if (aItem.length > 0) {
				for (var i = 0; i < aItem.length; i++) {
					if (i > 9) {
						countOfM = countOfM + 1;
						var itemNo = (countOfM) * 10;
						itemNo = ('000' + itemNo).slice(-6);
						aItem[i].ItemNo = itemNo;
					} else {
						if (aItem[i].ItemCat !== "TANN") {
							var itemNo = (count + 1) * 10;
							itemNo = ('0000' + itemNo).slice(-6);
							aItem[i].ItemNo = itemNo;
							count = count + 1;
						}
					}
				}
			} else {

			}
			this.getView().getModel("QuotationItemDetails").setProperty("/", aItem);
		},

		MaterialNoF4: function (oEvent) {

			this.ActualMaterialNoF4(oEvent);

		},

		setMaterialModel: function () {
			var that = this;
			var SFGW_MSTModel = gDetailPageItems.getModel("SFGW_MST");
			SFGW_MSTModel.attachRequestSent(function () {
				// busyDialog.open();
			});
			SFGW_MSTModel.attachRequestCompleted(function () {
				// busyDialog.close();
			});
			var salesArea = this._oComponent.getModel("Quotations").getProperty("/SalesArea");
			salesArea = salesArea.split("/");
			var aMaterialF4Filter = new Array();
			aMaterialF4Filter = oPPCCommon.setODataModelReadFilter("", "", aMaterialF4Filter, "LoginID", "", [
				that.getCurrentUsers("MaterialByCustomers", "read")
			], false, false, false);

			aMaterialF4Filter = oPPCCommon.setODataModelReadFilter("", "", aMaterialF4Filter, "CustomerNo", "", [this._oComponent.getModel(
					"Quotations")
				.getProperty("/CustomerNo")

			], false, false, false);
			aMaterialF4Filter = oPPCCommon.setODataModelReadFilter("", "", aMaterialF4Filter, "PlantID", "", [this._oComponent.getModel(
					"Quotations")
				.getProperty("/Plant")

			], false, false, false);
			aMaterialF4Filter = oPPCCommon.setODataModelReadFilter("", "", aMaterialF4Filter, "SalesOrgID", "", [salesArea[0]

			], false, false, false);
			aMaterialF4Filter = oPPCCommon.setODataModelReadFilter("", "", aMaterialF4Filter, "DistChannelID", "", [salesArea[1]

			], false, false, false);

			SFGW_MSTModel.read("/MaterialByCustomers", {
				filters: aMaterialF4Filter,
				success: function (oData) {
					var MaterialsModel = new sap.ui.model.json.JSONModel();
					MaterialsModel.setData(oData.results);
					gDetailPageItems.setModel(MaterialsModel, "MaterialSuggestorModel");
				},
				error: function (error) {
					//alert(error);
				}
			});
		},

		ActualMaterialNoF4: function (oEvent) {

			this.getView().getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
				.getData()
				.length);
			var oBindingContext = oEvent.getSource().getBindingContext("QuotationItemDetails");
			var aItems = oBindingContext.getProperty("/");
			var index = oEvent.getSource().getId().slice(-1);
			index = parseInt(oEvent.getSource().getBindingContext("QuotationItemDetails").getPath().split("/")[1]);
			var itemIndex = parseInt(index);
			var that = this;
			this.aMaterialKeys = ["MaterialNo", "MaterialDesc"];
			oCommonValueHelp.MaterialByCustomerF4({
				oController: this,
				bMultiSelect: false,
				oi18n: oi18n,
				oUtilsI18n: oUtilsI18n,
				headerModel: this.getView().getModel("Quotations")
			}, function (tokens) {
				var jData = tokens[0].getCustomData()[0].getValue();

				//var MatId = gDetailPageItems.byId("UIItemsTable").getRows()[0].getAggregation("cells")[1];

				that.getView().byId("UIItemsTable").getRows()[itemIndex].getAggregation("cells")[1].setTokens(tokens);

				that.setSelectedMaterialToTable(jData, oBindingContext, aItems, itemIndex);

			});
			//for enhancement
			if (this.MaterialNoF4_Exit) {
				this.MaterialNoF4_Exit();
			}
		},
		setSelectedMaterialToTable: function (jData, oBindingContext, aItems, itemIndex) {
			this.getView().getModel("QuotationItemDetails").setProperty("/" + itemIndex + "/Material", jData.MaterialNo);
			this.getView().getModel("QuotationItemDetails").setProperty("/" + itemIndex + "/MaterialDesc", jData.MaterialDesc);
			this.getView().getModel("QuotationItemDetails").setProperty("/" + itemIndex + "/Currency", jData.Currency);
			this.getView().getModel("QuotationItemDetails").setProperty("/" + itemIndex + "/Uom", jData.BaseUom);
			this.getView().getModel("QuotationItemDetails").setProperty("/" + itemIndex + "/HSNCode", jData.HSNCode);
			//this.getView().getModel("QuotationItemDetails").setProperty("/" + itemIndex + "/OwnStock", jData.DistributorStock);
			this.getView().byId("UIItemsTable").getRows()[itemIndex].getAggregation("cells")[1].setTooltip(aItems[itemIndex].MaterialDesc +
				" (" + aItems[itemIndex].Material + ")");

			//for enhancement
			if (this.setSelectedMaterialToTable_Exit) {
				this.setSelectedMaterialToTable_Exit(jData, oBindingContext, aItems, itemIndex);
			}
		},
		handleMaterialTokenRemove: function (oEvent) {

			var type = oEvent.getParameter("type");
			if (type === "removed") {
				var index = oEvent.getSource().getId().slice(-1);
				var itemIndex = parseInt(index);
				var that = this;
				/*oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
				oEvent.getSource().setValueStateText("");
				oPPCCommon.removeMsgsInMsgMgrById("/UI/MaterialNo");
				oPPCCommon.removeMsgsInMsgMgrById("/UI/Material-" + itemIndex);
				oPPCCommon.hideMessagePopover(gSSInvHeaderCreate);
				this.getView().getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel().getData()
				 .length);*/

				var QuotationItemDetails = this.getView().getModel("QuotationItemDetails");
				var aItems = QuotationItemDetails.getProperty('/');
				var oBindingContext = oEvent.getSource().getBindingContext("QuotationItemDetails");
				var sPath = oBindingContext.getPath();
				var itemIndex = parseInt(sPath.split("/")[1]);

				aItems[itemIndex].Currency = "";
				aItems[itemIndex].HSNCode = "";
				aItems[itemIndex].MRP = "0.00";
				aItems[itemIndex].Quantity = "";

				aItems[itemIndex].UnitPrice = "0.00";
				aItems[itemIndex].TaxAmount = "0.00";
				aItems[itemIndex].Tax = "0.00";
				aItems[itemIndex].GrossAmount = "0.00";
				aItems[itemIndex].NetValue = "0.00";

				//that.setTabCount(that.getView().getModel("SSInvoiceItem").getProperty("/"), that);
				that.getView().getModel("QuotationItemDetails").setProperty("/", aItems);

			}

		},
		onChangeQuantity: function (oEvent) {
			var Value = oEvent.getSource().getValue();
			Value = parseFloat(Value);
			Value = Value.toFixed(3);
			oEvent.getSource().setValue(Value);
			oPPCCommon.removeAllMsgs();
			com.arteriatech.ppc.utils.js.Common.formatNumber(oEvent);
			var getPath = oEvent.getSource().getBindingContext("QuotationItemDetails").getPath().split("/")[1];
			var isValid = this.validateItems(oEvent);
			var path = oEvent.getSource().getBindingContext("QuotationItemDetails").getPath();
			var sIndex = parseInt(path.substring(path.lastIndexOf('/') + 1));
			if (isValid) {
				this.getView().getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
					.getData()
					.length);
				oPPCCommon.hideMessagePopover(gObjPageLayout);
				this.onCalculate();
			} else {
				this.getView().getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
					.getData()
					.length);
				oPPCCommon.showMessagePopover(gObjPageLayout);
			}
		},
		onCalculate: function () {
			var that = this;
			oPPCCommon.removeServerMsgsInMsgMgrByTarget("/");
			oPPCCommon.removeAllMsgs();
			gDetailPageView.oController.validateQuotations("S");
			if (oPPCCommon.doErrMessageExist()) {
				this.getView().getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
					.getData()
					.length);
				oPPCCommon.hideMessagePopover(gObjPageLayout);
				gDetailPageView.oController.callSOSimulate("S");
			} else {
				this.getView().getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
					.getData()
					.length);
				oPPCCommon.showMessagePopover(gObjPageLayout);
			}
		},
		validateItems: function (oEvent) {

			var aItem = this.getView().getModel("QuotationItemDetails").getProperty("/");
			var path = oEvent.getSource().getBindingContext("QuotationItemDetails").getPath();
			var sIndex = parseInt(path.substring(path.lastIndexOf('/') + 1));
			var source = oEvent.getSource().getId().split("-");

			oPPCCommon.removeAllMsgs();

			oPPCCommon.removeMsgsInMsgMgrById("/UI/Quantity-" + sIndex);
			oPPCCommon.removeMsgsInMsgMgrById("/UI/Material-" + sIndex);

			aItem[sIndex].QuantityValueState = sap.ui.core.ValueState.None;
			aItem[sIndex].QuantityValueStateText = "";
			aItem[sIndex].MaterialNoValueState = sap.ui.core.ValueState.None;
			aItem[sIndex].MaterialNoValueStateText = "";

			var oBindingContext = oEvent.getSource().getBindingContext("QuotationItemDetails");
			var Quantity = oBindingContext.getProperty("Quantity");
			var ItemNo = oBindingContext.getProperty("ItemNo");
			var MaterialNo = aItem[sIndex].MaterialDesc;

			var isValid = true;
			var isValidDiscount = true;
			var msg = "";
			var msg1 = "";

			if (MaterialNo === undefined || MaterialNo === "") {

				msg = oi18n.getText("QuoteCreate.Message.MaterialEmpty", aItem[sIndex].ItemNo);
				isValid = false;
				source = "/UI/Material-" + sIndex;
				aItem[sIndex].MaterialNoValueState = sap.ui.core.ValueState.Error;
				aItem[sIndex].MaterialNoValueStateText = msg;
				oPPCCommon.addMsg_MsgMgr(msg, "error", source);
				this.getView().getModel("QuotationItemDetails").setProperty("/", aItem);

			} else if (MaterialNo === "" || MaterialNo === null || MaterialNo === undefined) {
				msg = oi18n.getText("QuoteCreate.Message.MaterialEmpty", aItem[sIndex].ItemNo);
				isValid = false;
				source = "/UI/Material-" + sIndex;
				aItem[sIndex].MaterialNoValueState = sap.ui.core.ValueState.Error;
				aItem[sIndex].MaterialNoValueStateText = msg;
				oPPCCommon.addMsg_MsgMgr(msg, "error", source);
				this.getView().getModel("QuotationItemDetails").setProperty("/", aItem);
			} else {
				var oItemModel = gDetailPageItems.getModel("QuotationItemDetails").getProperty("/");
				this.clearItemValueState("MaterialNo", sIndex);
				oPPCCommon.removeMsgsInMsgMgrById("/UI/Material-" + sIndex);
				for (var k = 0; k < oItemModel.length; k++) {
					if (sIndex !== k) {
						if (MaterialNo === oItemModel[k].MaterialNo) {
							var msg1 = oi18n.getText("QuoteCreate.Message.MaterialRepeat", oItemModel[sIndex].ItemNo);
							oItemModel[sIndex].MaterialNoValueState = sap.ui.core.ValueState.Error;
							oItemModel[sIndex].MaterialNoValueStateText = msg1;
							gDetailPageItems.getModel("QuotationItemDetails").setProperty("/", oItemModel);
							oPPCCommon.addMsg_MsgMgr(msg1, "error", "/UI/Material-" + sIndex);
							return;
						}
					}
				}

				if (!Quantity) {
					msg = oi18n.getText("QuoteCreate.Message.QtyEmpty", ItemNo);
					isValid = false;
				} else if (parseFloat(Quantity) === 0) {
					msg = oi18n.getText("QuoteCreate.Message.QtyWithZero", ItemNo);
					isValid = false;
				} else if (parseFloat(Quantity) < 0) {
					msg = oi18n.getText("QuoteCreate.Message.QtyWithNegative", ItemNo);
					isValid = false;
				} else if (isNaN(Quantity)) {
					msg = oi18n.getText("QuoteCreate.Message.QtyWithNotNumber", ItemNo);
					isValid = false;
				}
				if (this._oComponent.getModel("LocalViewSettingDtl").getProperty("/HeadereditApprove")) {
					if (parseFloat(Quantity) > parseFloat(aItem[sIndex].TempQuantity)) {
						msg = oi18n.getText("QuoteCreate.Message.QtyGreaterThan", [aItem[sIndex].TempQuantity, ItemNo]);
						isValid = false;
					}

				}

				if (!isValid) {
					oEvent.getSource().setValueState("Error");
					oEvent.getSource().setValueStateText(msg);
					oPPCCommon.addMsg_MsgMgr(msg, "error", source);
					this.getView().getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
						.getData()
						.length);
					oPPCCommon.showMessagePopover(gObjPageLayout);
				}
			}

			//for enhancement
			if (this.validateItems_Exit) {
				this.validateItems_Exit();
			}

			return isValid;
		},

		clearItemValueState: function (target, itemPosition) {
			gDetailPageItems.getModel("QuotationItemDetails").setProperty("/" + itemPosition + "/" + target + "ValueState", "None");
			gDetailPageItems.getModel("QuotationItemDetails").setProperty("/" + itemPosition + "/" + target + "ValueStateText", "");
		},

		callSOSimulate: function (sIndex) {
			var that = this;
			//Dialog open
			oBusyDialog.open();
			//session ID
			var loginID = this.getCurrentUsers("Quotations", "create");
			//Generate SO Number
			// var QuotationNo = Number(new Date());
			// QuotationNo = "" + QuotationNo;
			// QuotationNo = QuotationNo.slice(0, -3);
			//Header Data
			var oHeader = this.getView().getModel("Quotations").getProperty("/");
			var QuotationNo = gDetailPageView.getModel("Quotations").getProperty("/QuotationNo");
			oHeader.QuotationNo = "" + QuotationNo;
			if (oHeader.PODate) {
				oHeader.PODate = oPPCCommon.addHoursAndMinutesToDate({
					dDate: oHeader.PODate
				});
			}
			oHeader.QuotationDate = oPPCCommon.addHoursAndMinutesToDate({
				dDate: oHeader.QuotationDate
			});
			oHeader.LoginID = loginID;
			oHeader.QuotationNo = "" + QuotationNo;
			oHeader.TestRun = "S";
			delete oHeader.MRP;
			delete oHeader.NetAmount;
			delete oHeader.TaxAmount;
			delete oHeader.GrossAmount;
			delete oHeader.NetValue;

			delete oHeader.AvailableBalance;
			delete oHeader.CreditLimit;
			delete oHeader.CreditExposure;
			delete oHeader.PoType;

			delete oHeader.remarks;

			//Item Data

			this._QuotationItemDetailsList = jQuery.extend(true, [], this._oComponent.getModel("QuotationItemDetails").getData());
			var aItem = this.getView().getModel("QuotationItemDetails").getProperty("/");
			for (var i = 0; i < aItem.length; i++) {
				aItem[i].LoginID = loginID;
				aItem[i].QuotationNo = QuotationNo;
				aItem[i].ItemPlant = oHeader.Plant;
				aItem[i].ItemPlantDesc = oHeader.PlantDesc;
				delete aItem[i].QuantityValueState;
				delete aItem[i].MaterialNoValueState;
				delete aItem[i].MaterialNoValueStateText;
				delete aItem[i].QuantityValueStateText;
				delete aItem[i].Tax;
				delete aItem[i].MaterialNo;
				delete aItem[i].MaterialVisible;
			}
			// if (sIndex !== "" && sIndex !== undefined) {
			// 	var temp = [];
			// 	temp[0] = aItem[sIndex];
			// 	if (temp[0].Quantity === "") {
			// 		temp[0].Quantity = "0";
			// 	}
			// 	oHeader.QuotationItemDetails = temp;
			// } else {
			// 	oHeader.QuotationItemDetails = aItem;
			// }
			//Call So simualte
			oHeader.QuotationItemDetails = aItem;
			var oModelCreate = this.getView().getModel("SFGW_INQ");
			oModelCreate.setUseBatch(true);
			oModelCreate.setDeferredBatchGroups(["SOSimulate"]);
			oModelCreate.setHeaders({
				"x-arteria-loginid": loginID
			});
			oModelCreate.create("/Quotations", oHeader, {
				groupId: "SOSimulate"
			});
			/*oModelCreate.read("/SOSimulateGet", {
				urlParameters: "SONo='" + SONo + "'",
				groupId: "SOSimulate"
			});
			oModelCreate.read("/SOItemDetailSimulateGet", {
				urlParameters: "SONo='" + SONo + "'",
				groupId: "SOSimulate"
			});*/
			oModelCreate.submitChanges({
				groupId: "SOSimulate",
				success: function (oData) {
					oBusyDialog.close();
					if (oPPCCommon.doErrMessageExist()) {
						/*if (oData != null) {
							if (oData.__batchResponses[1].data.results.length > 0) {
								that._oComponent.getModel("Quotations").setProperty("/", oData);
							}
							if (oData.__batchResponses[2].data.results.length > 0) {
								that._oComponent.getModel("QuotationItemDetails").setProperty("/", oData.QuotationItemDetails.results);
							}
							that.setHeaderData(oData.__batchResponses[0].__changeResponses[0].data);
							that.setItemsData(oData.__batchResponses[0].__changeResponses[0].data);
						}*/
						oPPCCommon.hideMessagePopover(gObjPageLayout);
						that.setSOData(oData.__batchResponses[0].__changeResponses[0].data, sIndex);

					} else {
						// oPPCCommon.removeDuplicateMsgsInMsgMgr();
						// that.setSOData(oData.__batchResponses[0].__changeResponses[0].data, fQtyRowId);
						that.getView().getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
							.getData()
							.length);
						oPPCCommon.showMessagePopover(gObjPageLayout);
					}
				},
				error: function (response) {
					// oPPCCommon.removeDuplicateMsgsInMsgMgr();
					that.getView().getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
						.getData()
						.length);
					oPPCCommon.showMessagePopover(gObjPageLayout)
					oBusyDialog.close();
				}
			});
		},
		setSOData: function (oData, sIndex) {

			//this.setItemsData(oData, sIndex);

			this.setHeaderData(oData);
			if (oData.QuotationItemDetails !== null) {
				this.setItemsData(oData, sIndex);
			} else {
				this._oComponent.getModel("QuotationItemDetails").setProperty("/NetValue", "0.00");
				this._oComponent.getModel("QuotationItemDetails").setProperty("/MRP", "0.00");
				this._oComponent.getModel("QuotationItemDetails").setProperty("/GrossAmount", "0.00");
				this._oComponent.getModel("QuotationItemDetails").setProperty("/DiscountAmount", "0.00");
				this._oComponent.getModel("QuotationItemDetails").setProperty("/TaxAmount", "0.00");
				this._oComponent.getModel("QuotationItemDetails").setProperty("/TaxAmount1", "0.00");
				this._oComponent.getModel("QuotationItemDetails").setProperty("/TaxAmount2", "0.00");
				this._oComponent.getModel("QuotationItemDetails").setProperty("/TaxAmount3", "0.00");

			}

		},
		setHeaderData: function (oData) {

			// var oQuotationsModel = new sap.ui.model.json.JSONModel();
			// oQuotationsModel.setData(oData);
			// this._oComponent.setModel(oQuotationsModel, "Quotations");
			this._oComponent.getModel("Quotations").setProperty("/NetAmount", oData.NetAmount);
			this._oComponent.getModel("Quotations").setProperty("/GrossAmount", oData.GrossAmount);
			this._oComponent.getModel("Quotations").setProperty("/TaxAmount", oData.TaxAmount);
			//this._oComponent.getModel("Quotations").setProperty("/Freight", oData.Freight);
			this._oComponent.getModel("Quotations").setProperty("/DiscountAmount", oData.DiscountAmount);

			//set credit limit

		},
		setItemsData: function (oData, sIndex) {
			var aData = this.getView().getModel("QuotationItemDetails").getProperty("/");

			// for (var i = 0; i < this._QuotationItemDetailsList.length; i++) {
			for (sIndex = 0; sIndex < aData.length; sIndex++) {

				for (var i = 0; i < oData.QuotationItemDetails.results.length; i++) {

					if (parseInt(oData.QuotationItemDetails.results[i].ItemNo) === parseInt(aData[sIndex].ItemNo)) {
						// aData[sIndex].Material = oData.QuotationItemDetails.results[i].Material;
						// aData[sIndex].MaterialDesc = oData.QuotationItemDetails.results[i].MaterialDesc;
						//aData[sIndex].MaterialGroup = oData.QuotationItemDetails.results[i].MaterialGroup;
						//aData[sIndex].MatGroupDesc = oData.QuotationItemDetails.results[i].MatGroupDesc;
						aData[sIndex].Uom = oData.QuotationItemDetails.results[i].Uom;
						aData[sIndex].HSNCode = oData.QuotationItemDetails.results[i].HSNCode;
						//aData[sIndex].PlantDesc = oData.QuotationItemDetails.results[i].PlantDesc;
						//aData[sIndex].LotSize = oData.QuotationItemDetails.results[i].LotSize;
						//aData[sIndex].MinimumQty = oData.QuotationItemDetails.results[i].MinimumQty;
						//aData[sIndex].MaximumQty = oData.QuotationItemDetails.results[i].MaximumQty;
						//aData[sIndex].SuggestedQty = oData.QuotationItemDetails.results[i].SuggestedQty;
						aData[sIndex].Quantity = oData.QuotationItemDetails.results[i].Quantity;
						aData[sIndex].MRP = oData.QuotationItemDetails.results[i].MRP;
						aData[sIndex].UnitPrice = oData.QuotationItemDetails.results[i].UnitPrice;
						aData[sIndex].DiscountAmount = oData.QuotationItemDetails.results[i].DiscountAmount;
						aData[sIndex].TaxAmount = oData.QuotationItemDetails.results[i].TaxAmount;
						aData[sIndex].TaxAmount1 = oData.QuotationItemDetails.results[i].TaxAmount1;
						aData[sIndex].TaxAmount2 = oData.QuotationItemDetails.results[i].TaxAmount2;
						aData[sIndex].TaxAmount3 = oData.QuotationItemDetails.results[i].TaxAmount3;
						aData[sIndex].NetValue = oData.QuotationItemDetails.results[i].NetValue;
						aData[sIndex].GrossAmount = oData.QuotationItemDetails.results[i].GrossAmount;

						aData[sIndex].DiscAmount = oData.QuotationItemDetails.results[i].DiscAmount;
						aData[sIndex].MaterialVisible = oData.QuotationItemDetails.results[i].MaterialVisible;
						// aData[sIndex].MaterialVisible = true;
						//oData.QuotationItemDetails.results[i].MaterialVisible =true;

					}

					// }

				}
				// }
			}

			for (var j = 0; j < this._QuotationItemDetailsList.length; j++) {
				for (var i = 0; i < aData.length; i++) {
					if (parseInt(this._QuotationItemDetailsList[j].ItemNo) === parseInt(aData[i].ItemNo)) {
						aData[i].MaterialVisible = this._QuotationItemDetailsList[j].MaterialVisible;
					}
				}
			}

			this.getView().getModel("QuotationItemDetails").setProperty("/", aData);
			this.getView().getModel("QuotationItemDetails").setProperty("/MaterialVisible", false);
			var aItems = this.getView().getModel("QuotationItemDetails").getData();
			var totalGrossAmt = 0;
			var totalNetAmt = 0;
			var totalTaxAmt = 0;
			for (var i = 0; i < aItems.length; i++) {
				if (aItems[i].GrossAmount) {
					totalGrossAmt += parseFloat(aItems[i].GrossAmount);
				}
				if (aItems[i].NetValue) {
					totalNetAmt += parseFloat(aItems[i].NetValue);
				}
				if (aItems[i].TaxAmount) {
					totalTaxAmt += parseFloat(aItems[i].TaxAmount);
				}
			}
			totalGrossAmt = parseFloat(Math.round(totalGrossAmt * 100) / 100).toFixed(2);
			totalNetAmt = parseFloat(Math.round(totalNetAmt * 100) / 100).toFixed(2);
			totalTaxAmt = parseFloat(Math.round(totalTaxAmt * 100) / 100).toFixed(2);
			this.getView().getModel("Quotations").setProperty("/GrossAmount", totalGrossAmt);
			this.getView().getModel("Quotations").setProperty("/NetAmount", totalNetAmt);
			this.getView().getModel("Quotations").setProperty("/TaxAmount", totalTaxAmt);
			/*sap.ui.controller("com.arteriatech.sf.so.create.zsfsocreate.controller.SOCreateCustom").setTabCount(this.getView().getModel(
				"QuotationItemDetails").getProperty("/"), this);
				
			},*/
		},
		getCurrentUsers: function (sServiceName, sRequestType) {
			var sLoginID = oSSCommon.getCurrentLoggedUser({
				sServiceName: sServiceName,
				sRequestType: sRequestType
			});
			return sLoginID;
		},
		onDeleteItem: function (oEvent) {
			var that = this;

			var source = oEvent.getSource().getId().split("-");
			var oItem = this.getView().getModel("QuotationItemDetails").getProperty("/");
			// Getting path of index
			var path = oEvent.getSource().getBindingContext("QuotationItemDetails").getPath();
			var idx = parseInt(path.substring(path.lastIndexOf("/") + 1));

			//this.removeMaterialToken();

			this._TempQuotationItemDetails = this._oComponent.getModel("QuotationItemDetails").getData();
			this._TempQuotationItemDetails.length = this._oComponent.getModel("QuotationItemDetails").getData().length;

			//delete so line item

			var m = this.getView().getModel("QuotationItemDetails");
			var d = m.getData();
			d.splice(idx, 1);
			m.setData(d);
			this.getView().getModel("LocalViewSettingDtl").setProperty("/ItemsCount", d.length);
			m.refresh();
			if (gDetailPageItems.getModel("QuotationItemDetails").getProperty("/").length > 0) {
				this.callSOSimulate();
			}
			//this.setItemNo(d);
			//this.setTabCount(this.getView().getModel("QuotationItemDetails").getProperty("/"));
			this.resetMaterialInLineItems(idx);

		},
		removeMaterialTokenByIndex: function (idx) {

			// if (this.getView().byId("UIItemsTable").getRows().length > 0) {
			// 	if (this.getView().byId("UIItemsTable").getRows()[idx]) {
			// 		this.getView().byId("UIItemsTable").getRows()[idx].getAggregation("cells")[1].removeAllTokens();

			// 	}
			// }
			// var rows = gDetailPageItems.byId("UIItemsTable").getRows();
			// for (var m = 0; m < rows.length; m++) {
			// 	for (var n = 0; n < rows[m].getCells().length; n++) {
			// 		if (rows[m].getCells()[n].getId().indexOf("inputMaterial") > 0) {
			// 			gDetailPageItems.byId(rows[m].getCells()[n].getId()).removeAllTokens();
			// 		}
			// 	}

			// }

			// var data = this.getView().getModel("QuotationItemDetails").getData();
			// for (var i = 0; i < data.length; i++) {
			// 	//var rows = gDetailPageItems.byId("UIItemsTable").getRows();
			// 	var matId = "";
			// 	for (var j = 0; j < rows[i].getCells().length; j++) {
			// 		if (rows[i].getCells()[j].getId().indexOf("inputMaterial") > 0) {
			// 			matId = rows[i].getCells()[j].getId();
			// 		//	gDetailPageItems.byId(matId).removeAllTokens();
			// 			var token = new sap.m.Token({
			// 				key: data[i].Material,
			// 				text: data[i].MaterialDesc + " (" + data[i].Material + ")"
			// 			});
			// 			gDetailPageItems.byId(matId).addToken(token);

			// 		}

			// 	}

			// }

			if (this.getView().byId("UIItemsTable").getRows().length > 0) {
				if (this.getView().byId("UIItemsTable").getRows()[idx]) {
					this.getView().byId("UIItemsTable").getRows()[idx].getAggregation("cells")[1].removeAllTokens();

				}
			}

		},
		resetMaterialInLineItems: function (idx) {
			var data = gDetailPageItems.getModel("QuotationItemDetails").getProperty("/");
			if (this.getView().byId("UIItemsTable").getRows().length > 0) {
				if (this.getView().byId("UIItemsTable").getRows()[idx]) {
					this.getView().byId("UIItemsTable").getRows()[idx].getAggregation("cells")[1].removeAllTokens();

				}
			}
		},
		formatText: function (desc, id) {
			//var text;
			if (!id && !desc) {
				return "";
			} else if (id && desc) {
				return desc + " (" + id + ")";
			} else if (id && !desc) {
				return id;
			} else if (!id && desc) {
				return desc;
			}
		},
		validateNumeric1: function (oEvent) {
			var that = this;
			oPPCCommon.removeAllMsgs();
			oPPCCommon.hideMessagePopover(gObjPageLayout);
			this.getView().getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
				.getData()
				.length);
			var oBindingContext = oEvent.getSource().getBindingContext("QuotationItemDetails");
			var qtyLbl = this.getView().byId("id_Qty").getText();
			var ItemNo = oBindingContext.getProperty("ItemNo");
			var value = oEvent.getSource().getValue();
			var reg = /[ !@#$%^&*()_+\-=\[\]{};':`~"\\|,<>\/a-z A-Z?]/;
			if (reg.test(value)) {
				oEvent.getSource().setValue("");
				var msg = oi18n.getText("QuoteCreate.message.ValidQty", [qtyLbl, ItemNo]);
				oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/Quantity-");
				if (oPPCCommon.doErrMessageExist()) {
					oEvent.getSource().setValueState(null);
					oEvent.getSource().setValueStateText("");
				} else {
					this.getView().getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
						.getData()
						.length);
					oPPCCommon.showMessagePopover(gObjPageLayout);
				}
			}
		},
		onPressPriceBreakUp: function (oEvent) {
			this.getView().getModel("LocalViewSettingDtl").setProperty("/ShippingAdress", false);
			this.getView().getModel("LocalViewSettingDtl").setProperty("/PriceBreakUp", true);
			var index = parseInt(oEvent.getSource().getBindingContext("QuotationItemDetails").getPath().split("/")[1]);
			var itemIndex = parseInt(index);
			var TempData = this.getView().getModel("QuotationItemDetails").getProperty("/" + itemIndex);
			this.getView().getModel("LocalViewSettingDtl").setProperty("/TempUnitPrice", TempData.UnitPrice);
			this.getView().getModel("LocalViewSettingDtl").setProperty("/TempGrossAmount", TempData.GrossAmount);
			this.getView().getModel("LocalViewSettingDtl").setProperty("/TempDiscAmount", TempData.DiscAmount);
			this.getView().getModel("LocalViewSettingDtl").setProperty("/TempFrieghtAmount", TempData.FrieghtAmount);
			this.getView().getModel("LocalViewSettingDtl").setProperty("/TempTax1Prcnt", TempData.Tax1Prcnt);
			this.getView().getModel("LocalViewSettingDtl").setProperty("/TempTaxAmount1", TempData.TaxAmount1);
			this.getView().getModel("LocalViewSettingDtl").setProperty("/TempTax2Prcnt", TempData.Tax2Prcnt);
			this.getView().getModel("LocalViewSettingDtl").setProperty("/TempTaxAmount2", TempData.TaxAmount2);
			this.getView().getModel("LocalViewSettingDtl").setProperty("/TempTax3Prcnt", TempData.Tax3Prcnt);
			this.getView().getModel("LocalViewSettingDtl").setProperty("/TempTaxAmount3", TempData.TaxAmount3);
			this.getView().getModel("LocalViewSettingDtl").setProperty("/TempTax4Prcnt", TempData.Tax4Prcnt);
			this.getView().getModel("LocalViewSettingDtl").setProperty("/TempTaxAmount4", TempData.TaxAmount4);
			this.getView().getModel("LocalViewSettingDtl").setProperty("/TempTaxAmount", TempData.TaxAmount);
			this.getView().getModel("LocalViewSettingDtl").setProperty("/TempNetValue", TempData.NetValue);
			this.getView().getModel("LocalViewSettingDtl").setProperty("/TempZZTCSAmount", TempData.ZZTCSAmount);
			this.getView().getModel("LocalViewSettingDtl").setProperty("/TempZZTCSPrcnt", TempData.ZZTCSPrcnt);
			this.getView().getModel("LocalViewSettingDtl").setProperty("/TempZZTDSAmount", TempData.ZZTDSAmount);
			this.getView().getModel("LocalViewSettingDtl").setProperty("/TempZZTDSPrcnt", TempData.ZZTDSPrcnt);
			this.getView().getModel("LocalViewSettingDtl").setProperty("/Quantity", TempData.Quantity);
			this.getView().getModel("LocalViewSettingDtl").setProperty("/ZZTaxValue", TempData.ZZTaxValue);
			this.getView().getModel("LocalViewSettingDtl").setProperty("/ZZTotalGST", TempData.ZZTotalGST);
			this.getView().getModel("LocalViewSettingDtl").setProperty("/ZZValueAftrGst", TempData.ZZValueAftrGst);

			if (!this.ShippingDailog) {
				this.ShippingDailog = sap.ui.xmlfragment("com.arteriatech.zsf.quot.view.ShippingAddress", this);
				this.getView().addDependent(this.ShippingDailog);
			}
			this.ShippingDailog.openBy(oEvent.getSource());
		},

	});

});
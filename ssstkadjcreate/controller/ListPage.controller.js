sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/arteriatech/ppc/utils/js/Common",
	"com/arteriatech/prd/utils/js/Common"
], function (Controller, oPPCCommon, oProductCommon, oCommonValueHelp) {
	"use strict";
	var oi18n, oPPCUtili18n;
	var busyDialog = new sap.m.BusyDialog();
	var aTempList = [];
	var flag = true;
	var tempErrArr = [];
	return Controller.extend("com.arteria.ss.stockadjustmnt.create.controller.ListPage", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.arteria.ss.stockadjustmnt.create.view.ListPage
		 */
		onInit: function () {
			this.onInitHookUp();
		},

		onInitHookUp: function () {
			gListPageView = this.getView();
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(gListPageView));
			oProductCommon = com.arteriatech.ss.utils.js.Common;
			oCommonValueHelp = com.arteriatech.ss.utils.js.CommonValueHelp;
			oi18n = this._oComponent.getModel("i18n").getResourceBundle();
			oPPCUtili18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();
			this._oRouter = this._oComponent.getRouter();
			oPPCCommon.initMsgMangerObjects();
			// this.setReasonDD();
		},
		validateFilter: function () {
			if (gList.byId("customer").getSelectedKey() === "" && gList.getModel("LocalViewSetting").getProperty("/CustomerDD")) {
				var msg = oi18n.getText("List.FilterBar.Validation.custNo", [gList.byId("Customer").getLabel()]);
				oPPCCommon.addMsg_MsgMgr(msg, "error", "FG_CustomerNo");
				gList.byId("customer").setValueState(sap.ui.core.ValueState.Error);
			} else if (gList.byId("inputCustomerNo").getTokens().length === 0 && gList.getModel("LocalViewSetting").getProperty("/CustomerVH")) {
				var msg = oi18n.getText("List.FilterBar.Validation.custNo", [gList.byId("CustomerNo").getLabel()]);
				oPPCCommon.addMsg_MsgMgr(msg, "error", "FG_CustomerNo");
			}
			if (gList.byId("StockTypes").getSelectedKey() === "") {
				var msg = oi18n.getText("List.FilterBar.Validation.custNo", [gList.byId("StockType").getLabel()]);
				oPPCCommon.addMsg_MsgMgr(msg, "error", "FG_StockType");
				gList.byId("StockTypes").setValueState(sap.ui.core.ValueState.Error);
			}
		},
		onReview: function () {
			var that = this;
			flag = true;
			busyDialog.open();
			that.getView().byId("saveBtn").setEnabled(true);
			var listItems = gList.getModel("MaterialDocs");

			oPPCCommon.removeAllMsgs();
			oPPCCommon.hideMessagePopover(gList);
			this.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel().getData()
				.length);
			if (this.getView().getModel("LocalViewSetting").getProperty("/stockMaterialT1")) {
				this.validate();
				this.validateFilter();
			} else if (this.getView().getModel("LocalViewSetting").getProperty("/stockMaterialT2")) {
				this.validateItemMaterialWise();
			} else {
				this.validateFilter();
				this.validateOtherItems();
			}
			if (that.getView().getModel("LocalViewSetting").getProperty("/sCustomerInputType") === "VH") {
				if (that.getView().getModel("SchemeCPDocuments")) {
					if (that.getView().getModel("SchemeCPDocuments").getData().length === 0) {
						var msg = "Please Upload Attachment";
						oPPCCommon.addMsg_MsgMgr(msg, "error", "FG_CustomerNo");
					}
				} else {
					var msg = "Please Upload Attachment";
					oPPCCommon.addMsg_MsgMgr(msg, "error", "FG_CustomerNo");
				}

			}
			if (gList.byId("SelectGroupIDAW").getSelectedIndex() === 2) {
				var oData = gList.getModel("ListItems").getData();
				if (oData.length === 0) {
					msg = "Please Upload atleast one Material to create Stock Adjustment";
					oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/Quantity");
				}
			}

			if (oPPCCommon.doErrMessageExist()) {
				this._oMaterialDocItemDetails1 = [];
				aTempList = [];
				this._oMaterialDocItemDetails = jQuery.extend(true, [], gList.getModel("ListItems").getData());
				aTempList = jQuery.extend(true, [], gList.getModel("ListItems").getData());
				listItems.MaterialDocItemDetails = [];
				var MaterialDocItemDetails = [];
				aTempList = [];
				var PublicIP = "";
				$.getJSON('/sap/opu/odata/ARTEC/paymentgateway/PaymentGateway/GetIP', function (data) {
					if (data !== "") {
						if (data.ip.split(",").length > 1) {
							PublicIP = data.ip.split(",")[0];
						} else {
							PublicIP = data.ip;
						}
					} else {
						PublicIP = "1234";
					}
					that.getView().getModel("LocalViewSetting").setProperty("/PublicIP", PublicIP);
				});
				for (var i = 0; i < this._oMaterialDocItemDetails.length; i++) {
					if (this._oMaterialDocItemDetails[i].MaterialNo !== "") {
						if (this._oMaterialDocItemDetails[i].MRP === "") {
							this._oMaterialDocItemDetails[i].MRP = "0";
						}
						if (gList.getModel("LocalViewSetting").getProperty("/stockMaterialT1") || gList.getModel("LocalViewSetting").getProperty(
								"/stockMaterialT2") || gList.getModel("LocalViewSetting").getProperty(
								"/stockMaterialT3")) {
							if (this._oMaterialDocItemDetails[i].AdjQty >= 0) {
								this._oMaterialDocItemDetails[i].MaterialDocItemCatSplits = [];
								if (gList.byId("StockTypes").getSelectedKey() === "1" || gList.byId("StockTypes").getSelectedKey() === "3") {
									var obj = {
										"RefDocNo": this._oMaterialDocItemDetails[i].TransRefNo,
										"RefDocItemNo": this._oMaterialDocItemDetails[i].TransRefItemNo,
										"UOM": this._oMaterialDocItemDetails[i].UOM,
										"MaterialCatID": "M001",
										"MaterialDocQty": this._oMaterialDocItemDetails[i].DiffQty.toString(),
										"MaterialCatDesc": "Good",
										"MatDocItemGUID": "",
										"MatHeaderGuid": ""
									};
									this._oMaterialDocItemDetails[i].MaterialDocItemCatSplits.push(obj);
								} else if (gList.byId("StockTypes").getSelectedKey() === "2" && gList.byId("StockSubTypes").getSelectedKey() === "SS02") {
									var obj = {
										"RefDocNo": this._oMaterialDocItemDetails[i].TransRefNo,
										"RefDocItemNo": this._oMaterialDocItemDetails[i].TransRefItemNo,
										"UOM": this._oMaterialDocItemDetails[i].UOM,
										"MaterialCatID": "M003",
										"MaterialDocQty": this._oMaterialDocItemDetails[i].DiffQty.toString(),
										"MaterialCatDesc": "Shortage",
										"MatDocItemGUID": "",
										"MatHeaderGuid": ""
									};
									this._oMaterialDocItemDetails[i].MaterialDocItemCatSplits.push(obj);
								} else if (gList.byId("StockTypes").getSelectedKey() === "2" && gList.byId("StockSubTypes").getSelectedKey() === "SS03") {
									var obj = {
										"RefDocNo": this._oMaterialDocItemDetails[i].TransRefNo,
										"RefDocItemNo": this._oMaterialDocItemDetails[i].TransRefItemNo,
										"UOM": this._oMaterialDocItemDetails[i].UOM,
										"MaterialCatID": "M002",
										"MaterialDocQty": this._oMaterialDocItemDetails[i].DiffQty.toString(),
										"MaterialCatDesc": "Damage",
										"MatDocItemGUID": "",
										"MatHeaderGuid": ""
									};
									this._oMaterialDocItemDetails[i].MaterialDocItemCatSplits.push(obj);
								}
								MaterialDocItemDetails.push({
									MaterialNo: this._oMaterialDocItemDetails[i].MaterialNo,
									MaterialDesc: this._oMaterialDocItemDetails[i].MaterialDesc,
									// MaterialDocGUID: oPPCCommon.generateUUID(),
									MatDocItemGUID: oPPCCommon.generateUUID().toUpperCase(),
									MaterialDocQty: this._oMaterialDocItemDetails[i].DiffQty.toString(),
									StockGUID: this._oMaterialDocItemDetails[i].CPStockItemGUID,
									Remarks: this._oMaterialDocItemDetails[i].Remarks,
									Currency: this._oMaterialDocItemDetails[i].Currency,
									Price: this._oMaterialDocItemDetails[i].UnitPrice,
									MRP: this._oMaterialDocItemDetails[i].MRP,
									UOM: this._oMaterialDocItemDetails[i].UOM,
									Batch: this._oMaterialDocItemDetails[i].Batch,
									ItemNo: this._oMaterialDocItemDetails[i].ItemNo,
									MFD: this._oMaterialDocItemDetails[i].ManufacturingDate,
									ExpiryDate: this._oMaterialDocItemDetails[i].ExpiryDate,
									StockRefGUID: this._oMaterialDocItemDetails[i]["StockRefGUID"],
									DMSDivisionID: this._oMaterialDocItemDetails[i].DMSDivision,
									// DMSDivisionDesc: this._oMaterialDocItemDetails[i].DmsDivisionDesc,
									ReasonID: this._oMaterialDocItemDetails[i].ReasonID,
									ReasonDesc: this._oMaterialDocItemDetails[i].ReasonDesc,
									MaterialDocItemCatSplits: this._oMaterialDocItemDetails[i].MaterialDocItemCatSplits
								});
								this._oMaterialDocItemDetails[i].ItemNo = this._oMaterialDocItemDetails[i].ItemNo.toString();
								aTempList.push(this._oMaterialDocItemDetails[i]);
							}
						} else if (gList.getModel("LocalViewSetting").getProperty("/OtherMaterial")) {
							// this._oMaterialDocItemDetails[i].DMSDivision = gList.byId("inputDMSDivision").getSelectedKeys();
							// this._oMaterialDocItemDetails[i].DmsDivisionDesc = gList.byId("inputDMSDivision").getSelectedItem().getText().split("-")[1].trim();
							this._oMaterialDocItemDetails[i].MaterialDocItemCatSplits = [];
							if (this._oMaterialDocItemDetails[i].GQuantity > 0) {
								var obj = {
									"RefDocNo": this._oMaterialDocItemDetails[i].TransRefNo,
									"RefDocItemNo": this._oMaterialDocItemDetails[i].TransRefItemNo,
									"UOM": this._oMaterialDocItemDetails[i].UOM,
									"MaterialCatID": "M001",
									"MaterialDocQty": this._oMaterialDocItemDetails[i].GQuantity,
									"MaterialCatDesc": "Good",
									"MatDocItemGUID": "",
									"MatHeaderGuid": ""
								};
								this._oMaterialDocItemDetails[i].MaterialDocItemCatSplits.push(obj);
							}
							if (this._oMaterialDocItemDetails[i].DQuantity > 0) {
								var obj = {
									"RefDocNo": this._oMaterialDocItemDetails[i].TransRefNo,
									"RefDocItemNo": this._oMaterialDocItemDetails[i].TransRefItemNo,
									"UOM": this._oMaterialDocItemDetails[i].UOM,
									"MaterialCatID": "M002",
									"MaterialDocQty": this._oMaterialDocItemDetails[i].DQuantity,
									"MaterialCatDesc": "Damage",
									"MatDocItemGUID": "",
									"MatHeaderGuid": ""
								};
								this._oMaterialDocItemDetails[i].MaterialDocItemCatSplits.push(obj);
							}
							if (this._oMaterialDocItemDetails[i].SQuantity > 0) {
								var obj = {
									"RefDocNo": this._oMaterialDocItemDetails[i].TransRefNo,
									"RefDocItemNo": this._oMaterialDocItemDetails[i].TransRefItemNo,
									"UOM": this._oMaterialDocItemDetails[i].UOM,
									"MaterialCatID": "M003",
									"MaterialDocQty": this._oMaterialDocItemDetails[i].SQuantity,
									"MaterialCatDesc": "Shortage",
									"MatDocItemGUID": "",
									"MatHeaderGuid": ""
								};
								this._oMaterialDocItemDetails[i].MaterialDocItemCatSplits.push(obj);
							}
							MaterialDocItemDetails.push({
								MaterialNo: this._oMaterialDocItemDetails[i].MaterialNo,
								MaterialDesc: this._oMaterialDocItemDetails[i].MaterialDesc,
								MaterialDocGUID: oPPCCommon.generateUUID(),
								MatDocItemGUID: oPPCCommon.generateUUID().toUpperCase(),
								MaterialDocQty: (parseInt(this._oMaterialDocItemDetails[i].GQuantity) + parseInt(this._oMaterialDocItemDetails[i].SQuantity) +
									parseInt(this._oMaterialDocItemDetails[i].DQuantity)).toString(),
								StockGUID: this._oMaterialDocItemDetails[i].CPStockItemGUID,
								RefDocNo: this._oMaterialDocItemDetails[i].RefDocNo,
								RefDocItemNo: this._oMaterialDocItemDetails[i].RefDocItemNo,
								Remarks: this._oMaterialDocItemDetails[i].Remarks,
								Currency: this._oMaterialDocItemDetails[i].Currency,
								MRP: this._oMaterialDocItemDetails[i].MRP,
								UOM: this._oMaterialDocItemDetails[i].UOM,
								Batch: this._oMaterialDocItemDetails[i].Batch,
								ExpiryDate: this._oMaterialDocItemDetails[i].ExpiryDate,
								PurchasePrice: this._oMaterialDocItemDetails[i].PurchasePrice,
								ItemNo: this._oMaterialDocItemDetails[i].ItemNo,
								AltUOM: this._oMaterialDocItemDetails[i].AltUOM,
								AltUOMDen: this._oMaterialDocItemDetails[i].AltUOMDen,
								AltUOMQty: this._oMaterialDocItemDetails[i].AltUOMQty,
								AltUOMNum: this._oMaterialDocItemDetails[i].AltUOMNum,
								SellingPrice: this._oMaterialDocItemDetails[i].SellingPrice,
								Tax1Percent: this._oMaterialDocItemDetails[i].Tax1Percent,
								Tax2Percent: this._oMaterialDocItemDetails[i].Tax2Percent,
								Tax3Percent: this._oMaterialDocItemDetails[i].Tax3Percent,
								Tier1Margin: this._oMaterialDocItemDetails[i].Tier1Margin,
								Tier2Margin: this._oMaterialDocItemDetails[i].Tier2Margin,
								Tier3Margin: this._oMaterialDocItemDetails[i].Tier3Margin,
								Tier4Margin: this._oMaterialDocItemDetails[i].Tier4Margin,
								Tier5Margin: this._oMaterialDocItemDetails[i].Tier5Margin,
								Price: this._oMaterialDocItemDetails[i].Price,
								DMSDivisionID: this._oMaterialDocItemDetails[i].DMSDivision,
								// DMSDivisionDesc: this._oMaterialDocItemDetails[i].DmsDivisionDesc,
								MFD: this._oMaterialDocItemDetails[i].ManufacturingDate,
								MaterialDocItemCatSplits: this._oMaterialDocItemDetails[i].MaterialDocItemCatSplits
							});
							this._oMaterialDocItemDetails[i].ItemNo = this._oMaterialDocItemDetails[i].ItemNo.toString();
							aTempList.push(this._oMaterialDocItemDetails[i]);
						}
					}

				}
				var jsondata = new sap.ui.model.json.JSONModel(MaterialDocItemDetails);
				that._oComponent.setModel(jsondata, "MaterialDocItemDetails");
				var jsondata1 = new sap.ui.model.json.JSONModel(aTempList);
				that._oComponent.setModel(jsondata1, "MatDocItems");
				that._oComponent.getModel("LocalViewSetting").setProperty("/MaterialItemCount", aTempList.length);
				// this.gotoSave();
				this.updateMatDoc("X");
			} else {
				this.showError();
				busyDialog.close();
			}
			if (this.onReview_Exit) {
				this.onReview_Exit();
			}
		},
		ClearValueState: function (ValueStateArray) {
			var data = gList.getModel("ListItems").getData();
			for (var i = 0; i < gList.getModel("ListItems").getData().length; i++) {
				if (data[i].GQuantity === "") {
					data[i].GQuantity = "0";
				}
				if (data[i].DQuantity === "") {
					data[i].DQuantity = "0";
				}
				if (data[i].SQuantity === "") {
					data[i].Suantity = "0";
				}
				if (data[i].MRP === "") {
					data[i].MRP = "0.00";
				}
				if (data[i].PurchasePrice === "") {
					data[i].PurchasePrice = "0.00";
				}
				for (var j = 0; j < ValueStateArray.length; j++) {
					gList.getModel("ListItems").setProperty("/" + i + "/" + ValueStateArray[j], "None");
				}
			}
		},
		validateOtherItems: function () {
			var listItems = gList.getModel("ListItems").getData();
			var valid = true;
			for (var j = 0; j < listItems.length; j++) {
				if (listItems[j].GQuantity === "") {
					listItems[j].GQuantity = "0";
				}
				if (listItems[j].SQuantity === "") {
					listItems[j].SQuantity = "0";
				}
				if (listItems[j].DQuantity === "") {
					listItems[j].DQuantity = "0";
				}
			}
			this.ClearValueState(["BatchValueState", "UOMValueState", "MRPValueState", "UnitPriceValueState", "MDateValueState",
				"EDateValueState", "RefDocNoValueState", "RefDocItemNoValueState", "QuantityValueState"
			]);
			if (gList.byId("SelectGroupIDAW").getSelectedIndex() !== 2) {
				for (var i = 0; i < listItems.length; i++) {
					if (listItems[i].MaterialNo !== "") {
						valid = false;
						var cells = gList.byId("UIListTableOther").getRows()[i].getCells();
						for (var j = 0; j < cells.length; j++) {
							// if (cells[j].getId().indexOf("DMSDivisionSelect") !== -1) {
							// 	var id = gList.byId(cells[j].getId()).getSelectedItem().getText().split("-")[0].trim();
							// 	var desc = gList.byId(cells[j].getId()).getSelectedItem().getText().split("-")[1].trim();
							// 	gList.getModel("ListItems").setProperty("/" + i + "/DMSDivision", id);
							// 	gList.getModel("ListItems").setProperty("/" + i + "/DmsDivisionDesc", desc);
							// }
							if (cells[j].getId().indexOf("inputUOM") !== -1) {
								var uom = gList.byId(cells[j].getId()).getSelectedItem().getText();
								if (uom === "") {
									var msg = "Please select UOM for Material No " + listItems[i].MaterialNo
									gList.getModel("ListItems").setProperty("/" + i + "/UOMValueState", "Error");
									gList.getModel("ListItems").setProperty("/" + i + "/UOMValueStateText", msg);
									oPPCCommon.addMsg_MsgMgr(msg, "error", "Batch" + i);
								} else {
									gList.getModel("ListItems").setProperty("/" + i + "/UOM", uom);
								}
							}
						}
						if (listItems[i].Batch === "") {
							var msg = "Please enter Batch for Material No " + listItems[i].MaterialNo;
							gList.getModel("ListItems").setProperty("/" + i + "/BatchValueState", "Error");
							gList.getModel("ListItems").setProperty("/" + i + "/BatchValueStateText", msg);
							oPPCCommon.addMsg_MsgMgr(msg, "error", "Batch" + i);
						}
						// if (listItems[i].UOM === "") {
						// 	var msg = "Please select UOM for Material No " + listItems[i].MaterialNo
						// 	gList.getModel("ListItems").setProperty("/" + i + "/UOMValueState", "Error");
						// 	gList.getModel("ListItems").setProperty("/" + i + "/UOMValueStateText", msg);
						// 	oPPCCommon.addMsg_MsgMgr(msg, "error", "Batch" + i);
						// }
						if (parseFloat(listItems[i].GQuantity) === 0) {
							var msg = "Please enter Quantity for Material No " + listItems[i].MaterialNo;
							// oPPCCommon.addMsg_MsgMgr(msg, "error", "Quantity" + i);
							gList.getModel("ListItems").setProperty("/" + i + "/QuantityValueState", "Error");
							gList.getModel("ListItems").setProperty("/" + i + "/QuantityValueStateText", msg);
							oPPCCommon.addMsg_MsgMgr(msg, "error", "Quantity" + i);
						}
						if (parseFloat(listItems[i].MRP) === 0) {
							var msg = "Please Enter MRP for Material No " + listItems[i].MaterialNo;
							gList.getModel("ListItems").setProperty("/" + i + "/MRPValueState", "Error");
							gList.getModel("ListItems").setProperty("/" + i + "/MRPValueStateText", msg);
							oPPCCommon.addMsg_MsgMgr(msg, "error", "MRP" + i);
						}
						// if (listItems[i].ManufacturingDate === null || listItems[i].ManufacturingDate === "") {
						// 	var msg = "Please Enter Manuf Date for Material No " + listItems[i].MaterialNo;
						// 	gList.getModel("ListItems").setProperty("/" + i + "/MDateValueState", "Error");
						// 	gList.getModel("ListItems").setProperty("/" + i + "/MDateValueStateText", msg);
						// 	oPPCCommon.addMsg_MsgMgr(msg, "error", "MDate" + i);
						// }

						// if (listItems[i].ExpiryDate === null || listItems[i].ExpiryDate === "") {
						// 	var msg = "Please Enter Expiry Date for Material No " + listItems[i].MaterialNo;
						// 	gList.getModel("ListItems").setProperty("/" + i + "/EDateValueState", "Error");
						// 	gList.getModel("ListItems").setProperty("/" + i + "/EDateValueStateText", msg);
						// 	oPPCCommon.addMsg_MsgMgr(msg, "error", "EDate" + i);
						// }
						// if (listItems[i].ManufacturingDate !== null && listItems[i].ManufacturingDate !== "" &&
						// 	listItems[i].ExpiryDate !== null && listItems[i].ExpiryDate !== "") {
						// 	var d1 = new Date(listItems[i].ManufacturingDate.getFullYear(), listItems[i].ManufacturingDate.getMonth(), listItems[i].ManufacturingDate
						// 		.getDate());
						// 	var d2 = new Date(listItems[i].ExpiryDate.getFullYear(), listItems[i].ExpiryDate.getMonth(), listItems[i].ExpiryDate.getDate());
						// 	if (d1 > d2) {
						// 		var msg = "Manufacturing Date Should not be greater than Expiry Date" + listItems[i].MaterialNo;
						// 		oPPCCommon.addMsg_MsgMgr(msg, "error", "MDate" + i);
						// 	}
						// }
						// if (parseFloat(listItems[i].PurchasePrice) === 0) {
						// 	var msg = "Please Enter Purchase Value for Material No " + listItems[i].MaterialNo
						// 	gList.getModel("ListItems").setProperty("/" + i + "/UnitPriceValueState", "Error");
						// 	gList.getModel("ListItems").setProperty("/" + i + "/UnitPriceValueStateText", msg);
						// 	oPPCCommon.addMsg_MsgMgr(msg, "error", "UnitPrice" + i);
						// }

						// if (!listItems[i].RefDocNo || parseFloat(listItems[i].RefDocNo) === 0) {
						// 	var msg = "Please Enter " + gList.byId("RefDocNo").getText() + " for Material No " + listItems[i].MaterialNo
						// 	gList.getModel("ListItems").setProperty("/" + i + "/RefDocNoValueState", "Error");
						// 	gList.getModel("ListItems").setProperty("/" + i + "/RefDocNoValueStateText", msg);
						// 	oPPCCommon.addMsg_MsgMgr(msg, "error", "RefDocNo" + i);
						// } 
						// if (listItems[i].RefDocNo.length !== 10) {
						// 	var msg = "Please Enter valid " + gList.byId("RefDocNo").getText() + " for Material No " + listItems[i].MaterialNo
						// 	gList.getModel("ListItems").setProperty("/" + i + "/RefDocNoValueState", "Error");
						// 	gList.getModel("ListItems").setProperty("/" + i + "/RefDocNoValueStateText", msg);
						// 	oPPCCommon.addMsg_MsgMgr(msg, "error", "RefDocNo" + i);
						// }
						// if (!listItems[i].RefDocItemNo || parseFloat(listItems[i].RefDocItemNo) === 0) {
						// 	var msg = "Please Enter " + gList.byId("LRefDocItemNo").getText() + " for Material No " + listItems[i].MaterialNo
						// 	gList.getModel("ListItems").setProperty("/" + i + "/RefDocItemNoValueState", "Error");
						// 	gList.getModel("ListItems").setProperty("/" + i + "/RefDocItemNoValueStateText", msg);
						// 	oPPCCommon.addMsg_MsgMgr(msg, "error", "RefDocItemNo" + i);
						// }

						if (parseFloat(listItems[i].PurchasePrice) > parseFloat(listItems[i].MRP)) {
							var msg = "Purchase Price Cannot not be greater than MRP";
							gList.getModel("ListItems").setProperty("/" + i + "/UnitPriceValueState", "Error");
							gList.getModel("ListItems").setProperty("/" + i + "/UnitPriceValueStateText", msg);
							oPPCCommon.addMsg_MsgMgr(msg, "error", "UnitPrice" + i);
						}
					}
				}
			}
			if (gList.byId("SelectGroupIDAW").getSelectedIndex() !== 2) {
				if (valid) {
					var msg2 = "Please add atleast one Material to create Stock Adjustment";
					oPPCCommon.addMsg_MsgMgr(msg2, "error", "material");
				}
			}

		},
		updateMatDoc: function (istestRun) {
			var that = this;
			// that.getView().setBusy(true);
			// busyDialog.open();
			var oUpdateModel = that.getView().getModel("SSGW_MM");
			// var sLoginID = 
			oUpdateModel.setUseBatch(true);
			oUpdateModel.setDeferredGroups(["Create"]);
			var MvmtTypeID = "";
			var materialType = gList.getModel("LocalViewSetting").getProperty("/StockMaterial");
			if (materialType) {
				MvmtTypeID = "801";
			} else {
				MvmtTypeID = "803";
			}
			// oUpdateModel.setHeaders({
			// 	"x-arteria-loginid": sLoginID
			// });
			if (istestRun === "X" || istestRun === "S") {
				this._MaterialDocs = jQuery.extend(true, [], this.getView().getModel("MaterialDocs").getData());
			}
			this._MaterialDocsItems = jQuery.extend(true, [], this.getView().getModel("MaterialDocItemDetails").getData());
			var MaterialDocItemDetails = this.getView().getModel("MaterialDocItemDetails").getData();
			var tempArray = [];
			var tempArray1 = [];
			var MaterialDocs = {
				MaterialDocGUID: oPPCCommon.generateUUID().toUpperCase(),
				FromGUID: that.getView().getModel("MaterialDocs").getProperty("/FromGUID"),
				ToGUID: that.getView().getModel("MaterialDocs").getProperty("/FromGUID"),
				FromTypeID: that.getView().getModel("MaterialDocs").getProperty("/CPTypeID"),
				ToTypeID: that.getView().getModel("MaterialDocs").getProperty("/CPTypeID"),
				MvmtTypeID: "802",
				LoginID: that.getCurrentUsers("MaterialDocs", "create"),
				MaterialDocDate: gList.getModel("LocalViewSetting").getProperty("/Today"),
				TestRun: istestRun,
				Source: "PORTAL"
					// MaterialDocItemDetails: [MaterialDocItemDetails[i]]
			};
			var MaterialDocs1 = {
				MaterialDocGUID: oPPCCommon.generateUUID().toUpperCase(),
				FromGUID: that.getView().getModel("MaterialDocs").getProperty("/FromGUID"),
				ToGUID: that.getView().getModel("MaterialDocs").getProperty("/FromGUID"),
				FromTypeID: that.getView().getModel("MaterialDocs").getProperty("/CPTypeID"),
				ToTypeID: that.getView().getModel("MaterialDocs").getProperty("/CPTypeID"),
				MvmtTypeID: MvmtTypeID,
				LoginID: that.getCurrentUsers("MaterialDocs", "create"),
				MaterialDocDate: gList.getModel("LocalViewSetting").getProperty("/Today"),
				TestRun: istestRun,
				Source: "PORTAL"
					// MaterialDocItemDetails: [MaterialDocItemDetails[i]]
			};
			for (var i = 0; i < MaterialDocItemDetails.length; i++) {

				delete MaterialDocItemDetails[i].StockRefGUID;
				if (parseInt(MaterialDocItemDetails[i].MaterialDocQty) < 0) {
					MaterialDocItemDetails[i].MaterialDocGUID = MaterialDocs.MaterialDocGUID;
				} else {
					MaterialDocItemDetails[i].MaterialDocGUID = MaterialDocs1.MaterialDocGUID;
				}
				MaterialDocItemDetails[i].ItemNo = MaterialDocItemDetails[i].ItemNo.toString();

				for (var j = 0; j < MaterialDocItemDetails[i].MaterialDocItemCatSplits.length; j++) {
					MaterialDocItemDetails[i].MaterialDocItemCatSplits[j].MatHeaderGuid = MaterialDocItemDetails[i].MaterialDocGUID.toUpperCase();
					MaterialDocItemDetails[i].MaterialDocItemCatSplits[j].MatDocItemGUID = MaterialDocItemDetails[i].MatDocItemGUID.toUpperCase();
					if (materialType) {
						MaterialDocItemDetails[i].MaterialDocItemCatSplits[j].MaterialDocQty = Math.abs(MaterialDocItemDetails[i].MaterialDocQty).toString();
					}
				}
				oUpdateModel.setDeferredGroups(["Create"]);
				if (parseInt(MaterialDocItemDetails[i].MaterialDocQty) < 0) {
					MaterialDocItemDetails[i].DbtCrdtIndID = "H";
					// var MaterialDocs = {
					// 	MaterialDocGUID: MaterialDocItemDetails[i].MaterialDocGUID,
					// 	FromGUID: that.getView().getModel("MaterialDocs").getProperty("/FromGUID"),
					// 	ToGUID: that.getView().getModel("MaterialDocs").getProperty("/FromGUID"),
					// 	FromTypeID: that.getView().getModel("MaterialDocs").getProperty("/CPTypeID"),
					// 	ToTypeID: that.getView().getModel("MaterialDocs").getProperty("/CPTypeID"),
					// 	MvmtTypeID: "802",
					// 	LoginID: that.getCurrentUsers("MaterialDocs", "create"),
					// 	MaterialDocDate: oPPCCommon.getCurrentDate(),
					// 	TestRun: istestRun,
					// 	Source: "PORTAL",
					// 	MaterialDocItemDetails: [MaterialDocItemDetails[i]]
					// };
					MaterialDocItemDetails[i].MaterialDocQty = Math.abs(MaterialDocItemDetails[i].MaterialDocQty).toString();
					MaterialDocItemDetails[i].MaterialDocGUID = MaterialDocs.MaterialDocGUID;
					tempArray.push(MaterialDocItemDetails[i]);
				}
				// else if (parseInt(aTempList[i].AdjQty) < parseInt(aTempList[i].Quantity)) {
				// 	MaterialDocItemDetails[i].DbtCrdtIndID = "S";
				// 	var MaterialDocs = {
				// 		MaterialDocGUID: MaterialDocItemDetails[i].MaterialDocGUID,
				// 		FromGUID: that.getView().getModel("MaterialDocs").getProperty("/FromGUID"),
				// 		ToGUID: that.getView().getModel("MaterialDocs").getProperty("/FromGUID"),
				// 		FromTypeID: that.getView().getModel("MaterialDocs").getProperty("/CPTypeID"),
				// 		ToTypeID: that.getView().getModel("MaterialDocs").getProperty("/CPTypeID"),
				// 		MvmtTypeID: "801",
				// 		LoginID: that.getCurrentUsers("MaterialDocs", "create"),
				// 		MaterialDocDate: oPPCCommon.getCurrentDate(),
				// 		TestRun: istestRun,
				// 		Source: "PORTAL",
				// 		MaterialDocItemDetails: [MaterialDocItemDetails[i]]
				// 	};
				// 	tempArray.push(MaterialDocs);
				// } 
				else {
					// var MaterialDocs = {
					// 	MaterialDocGUID: MaterialDocItemDetails[i].MaterialDocGUID,
					// 	FromGUID: that.getView().getModel("MaterialDocs").getProperty("/FromGUID"),
					// 	ToGUID: that.getView().getModel("MaterialDocs").getProperty("/FromGUID"),
					// 	FromTypeID: that.getView().getModel("MaterialDocs").getProperty("/CPTypeID"),
					// 	ToTypeID: that.getView().getModel("MaterialDocs").getProperty("/CPTypeID"),
					// 	MvmtTypeID: "803",
					// 	LoginID: that.getCurrentUsers("MaterialDocs", "create"),
					// 	MaterialDocDate: oPPCCommon.getCurrentDate(),
					// 	TestRun: istestRun,
					// 	Source: "PORTAL",
					// 	MaterialDocItemDetails: [MaterialDocItemDetails[i]]

					// };
					if (materialType) {
						MaterialDocItemDetails[i].DbtCrdtIndID = "S";
					}
					MaterialDocItemDetails[i].MaterialDocGUID = MaterialDocs1.MaterialDocGUID;
					tempArray1.push(MaterialDocItemDetails[i]);
				}
			}
			if (tempArray.length === 0) {
				flag = false;
			} else if (tempArray1.length === 0) {
				if (flag === false) {
					flag = "";
				}
			}

			MaterialDocs.MaterialDocItemDetails = tempArray;
			MaterialDocs1.MaterialDocItemDetails = tempArray1;

			var MaterialDocsTemp;
			if (flag === true) {
				MaterialDocsTemp = MaterialDocs;
				this._MaterialDocsItemsTemp = jQuery.extend(true, [], tempArray);
			} else if (flag === false) {
				MaterialDocsTemp = MaterialDocs1;
				this._MaterialDocsItemsTemp = jQuery.extend(true, [], tempArray1);
			} else {
				that.getView().getModel("MaterialDocItemDetails").setProperty("/", that._MaterialDocsItems);
				busyDialog.close();
				return;
			}
			if (tempArray1.length === 0) {
				flag = false;
			}
			var ip = that.getView().getModel("LocalViewSetting").getProperty("/PublicIP");
			if (ip === "") {
				ip = "12345";
			}
			MaterialDocsTemp.SourceID = ip;
			var finalDocType = MaterialDocsTemp.MvmtTypeID;
			oUpdateModel.create("/MaterialDocs",
				MaterialDocsTemp, {
					groupId: "Create"
				});

			oUpdateModel.submitChanges({
				groupId: "Create",
				success: function (oData) {
					// if (that.count === 0) {
					if (oPPCCommon.doErrMessageExist()) {
						if (istestRun === "X") {
							that._oComponent.getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
								.getData()
								.length);
							oPPCCommon.hideMessagePopover(gList);
							that._oComponent.getModel("LocalViewSetting").setProperty("/editMode", false);
							that._oComponent.getModel("LocalViewSetting").setProperty("/reviewMode", true);
							that._oComponent.getModel("LocalViewSetting").setProperty("/CalculateButton", false);
							that._oComponent.getModel("LocalViewSetting").setProperty("/PageHeader", oi18n.getText("List.Review.title"));
						} else if (istestRun === "S") {
							that._oComponent.getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
								.getData()
								.length);
							oPPCCommon.hideMessagePopover(gList);
							that._oComponent.getModel("LocalViewSetting").setProperty("/ReviewButtonEnable", true);
							that.setItemData(oData);
							// that._oComponent.getModel("LocalViewSetting").setProperty("/CalculateButton", false);
						} else {
							that._oComponent.getModel("LocalViewSetting").setProperty("/PageHeader", oi18n.getText("List.title"));
							if (flag === false) {
								that.updatedSuccessfully();
							}

						}
						// that.getView().setBusy(false);
						busyDialog.close();

					} else {
						oPPCCommon.removeDuplicateMsgsInMsgMgr();
						tempErrArr.push(that._MaterialDocsItemsTemp);
						flag = false;
						if (flag === false) {
							that.showError(finalDocType);
							that.getView().getModel("MaterialDocItemDetails").setProperty("/", that._MaterialDocsItems);
						}

						// if (!istestRun) {
						// 	that.getView().getModel("MaterialDocItemDetails").setProperty("/", that._MaterialDocsItemsTemp);
						// }
						that.getView().setBusy(false);
						busyDialog.close();
					}
					// }
					if (istestRun) {
						that.getView().getModel("MaterialDocItemDetails").setProperty("/", that._MaterialDocsItems);
					} else {
						if (flag === true) {
							that.getView().getModel("MaterialDocItemDetails").setProperty("/", that._MaterialDocsItems);
						}
					}
					if (flag === true) {
						flag = false;
						that.updateMatDoc(istestRun);
					}
				},
				error: function () {
					// that.count--;
					// if (that.count === 0) {
					that.showError(finalDocType);
					that.getView().setBusy(false);
					that.getView().getModel("MaterialDocItemDetails").setProperty("/", that._MaterialDocsItems);
					busyDialog.close();
					// }
					flag = false;
					if (flag === true) {
						flag = false;
						that.updateMatDoc();
					}
					// else{
					// 	that.showError();
					// 	that.getView().getModel("MaterialDocItemDetails").setProperty("/",  that._MaterialDocsItems);
					// }
				}
			});
		},
		setItemData: function (oData) {
			var that = this;
			var Items = oData.__batchResponses[0].__changeResponses[0].data.MaterialDocItemDetails.results;
			for (var i = 0; i < Items.length; i++) {
				gList.getModel("ListItems").setProperty("/" + i + "/ExpiryDate", Items[i].ExpiryDate);
				gList.getModel("ListItems").setProperty("/" + i + "/ManufacturingDate", Items[i].MFD);
				gList.getModel("ListItems").setProperty("/" + i + "/MRP", Items[i].MRP);
				gList.getModel("ListItems").setProperty("/" + i + "/PurchasePrice", Items[i].PurchasePrice);
				gList.getModel("ListItems").setProperty("/" + i + "/Currency", Items[i].Currency);
				gList.getModel("ListItems").setProperty("/" + i + "/AltUOM", Items[i].AltUOM);
				gList.getModel("ListItems").setProperty("/" + i + "/AltUOMDen", Items[i].AltUOMDen);
				gList.getModel("ListItems").setProperty("/" + i + "/AltUOMNum", Items[i].AltUOMNum);
				gList.getModel("ListItems").setProperty("/" + i + "/AltUOMQty", Items[i].AltUOMQty);
				gList.getModel("ListItems").setProperty("/" + i + "/SellingPrice", Items[i].SellingPrice);
				gList.getModel("ListItems").setProperty("/" + i + "/Tax1Percent", Items[i].Tax1Percent);
				gList.getModel("ListItems").setProperty("/" + i + "/Tax2Percent", Items[i].Tax2Percent);
				gList.getModel("ListItems").setProperty("/" + i + "/Tax3Percent", Items[i].Tax3Percent);
				gList.getModel("ListItems").setProperty("/" + i + "/Price", Items[i].Price);
				gList.getModel("ListItems").setProperty("/" + i + "/Tier1Margin", Items[i].Tier1Margin);
				gList.getModel("ListItems").setProperty("/" + i + "/Tier2Margin", Items[i].Tier2Margin);
				gList.getModel("ListItems").setProperty("/" + i + "/Tier3Margin", Items[i].Tier3Margin);
				gList.getModel("ListItems").setProperty("/" + i + "/Tier4Margin", Items[i].Tier4Margin);
				gList.getModel("ListItems").setProperty("/" + i + "/Tier5Margin", Items[i].Tier5Margin);
			}
		},
		updatedSuccessfully: function () {
			var that = this;
			that.onCreateSuccess();
		},
		onCreateSuccess: function () {
			var that = this;
			var oPanel = new sap.m.Panel();
			var oText = new sap.m.Text();
			var messageType = this.getMessageType();
			if (messageType !== "Success") {
				if (messageType === "Information") {
					oText.setText(oPPCCommon.getMsgsFromMsgMgr());
					oPanel.addContent(oText);
					var dialog = new sap.m.Dialog({
						title: messageType,
						type: 'Message',
						content: oPanel,
						buttons: [

							new sap.m.Button({
								icon: "sap-icon://home",
								text: "Home",
								press: function () {
									window.location = "#";
									dialog.close();
								}
							}),

							new sap.m.Button({
								text: 'Create New',
								press: function () {
									that._oComponent.getModel("LocalViewSetting").setProperty("/editMode", true);
									that._oComponent.getModel("LocalViewSetting").setProperty("/reviewMode", false);
									gList.byId("customer").setSelectedKey("");
									if (gList.byId("inputCustomerNo")) {
										gList.byId("inputCustomerNo").removeAllTokens();
									}
									if (gList.getModel("SchemeCPDocuments")) {
										gList.getModel("SchemeCPDocuments").setProperty("/", []);
									}
									gList.byId("StockTypes").setSelectedKey("");
									gList.byId("StockSubTypes").setSelectedKey("");
									gList.byId("inputDMSDivision").setSelectedKeys([]);
									gList.getModel("ListItems").setProperty("/", []);
									gList.getModel("MatDocItems").setProperty("/", []);
									gList.getModel("LocalViewSetting").setProperty("/ListItemsCount", 1);
									gList.getModel("LocalViewSetting").setProperty("/MaterialItemCount", 0);
									// gList.getModel("LocalViewSetting").setProperty("/stockMaterialT1", true);
									// gList.getModel("LocalViewSetting").setProperty("/stockMaterialT2", false);
									// gList.byId("PrdFeatureTypes").setSelectedKey("");
									gList.byId("inputMaterial1").removeAllTokens();
									gList.byId("inputSKUGroup").removeAllTokens();
									gList.byId("inputMaterial1").removeAllTokens();
									gList.getModel("LocalViewSetting").setProperty("/StockMaterial", true);
									gList.getModel("LocalViewSetting").setProperty("/OtherMaterial", false);

									gList.getModel("LocalViewSetting").setProperty("/stockMaterialT3", false);
									gList.getModel("LocalViewSetting").setProperty("/stockMaterialT1", true);
									gList.byId("SelectGroupIDAW").setSelectedIndex(0);
									gList.getModel("LocalViewSetting").setProperty("/StockMaterialReview", true);
									gList.byId("fileUploader").setValue("");

									// gList.getModel("LocalViewSetting").setProperty("/stockMaterialT3", false);

									gList.getModel("LocalViewSetting").setProperty("/prdFrMatEnabled", false);
									// sap.ui.controller("com.arteria.ss.stockadjustmnt.create.controller.List").getPrdFeatures();
									gList.oController.getPrdFeatures();
									gList.getModel("LocalViewSetting").setProperty("/GUID", oPPCCommon.generateUUID());
									sap.ui.controller("com.arteria.ss.stockadjustmnt.create.controller.List").removeAllTokenforItems();
									sap.ui.controller("com.arteria.ss.stockadjustmnt.create.controller.List").removeAllTokenforOtherItems();
									sap.ui.controller("com.arteria.ss.stockadjustmnt.create.controller.List").setDataOtherModel();
									sap.ui.controller("com.arteria.ss.stockadjustmnt.create.controller.List").setMaterialModel();

									//	sap.ui.controller("com.arteria.ss.stockadjustmnt.create.controller.List").setMaterialModel();
									dialog.close();
								}
							})
						],
						afterClose: function () {
							dialog.destroy();
						}
					});
					dialog.open();
					dialog.attachBrowserEvent("keydown", function (oEvent) {
						oEvent.stopPropagation();
						oEvent.preventDefault();
					});
				} else {
					oText.setText(oPPCCommon.getMsgsFromMsgMgr());
					oPanel.addContent(oText);
					var dialog = new sap.m.Dialog({
						title: messageType,
						type: 'Message',
						state: messageType,
						content: oPanel,
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
					dialog.open();
					dialog.attachBrowserEvent("keydown", function (oEvent) {
						oEvent.stopPropagation();
						oEvent.preventDefault();
					});
				}
			} else {
				oText.setText(oPPCCommon.getMsgsFromMsgMgr());
				oPanel.addContent(oText);
				var dialog = new sap.m.Dialog({
					title: 'Success',
					type: 'Standard',
					state: 'Success',
					draggable: true,
					content: oPanel,
					buttons: [
						new sap.m.Button({
							icon: "sap-icon://home",
							text: "Home",
							press: function () {
								window.location = "#";
								dialog.close();
							}
						}),
						new sap.m.Button({
							text: "Create New",
							press: function () {
								that._oComponent.getModel("LocalViewSetting").setProperty("/editMode", true);
								that._oComponent.getModel("LocalViewSetting").setProperty("/reviewMode", false);
								gList.byId("customer").setSelectedKey("");
								if (gList.byId("inputCustomerNo")) {
									gList.byId("inputCustomerNo").removeAllTokens();
								}
								if (gList.getModel("SchemeCPDocuments")) {
									gList.getModel("SchemeCPDocuments").setProperty("/", []);
								}
								gList.byId("StockTypes").setSelectedKey("");
								gList.byId("StockSubTypes").setSelectedKey("");
								gList.byId("inputDMSDivision").setSelectedKeys([]);
								gList.getModel("ListItems").setProperty("/", []);
								gList.getModel("MatDocItems").setProperty("/", []);
								gList.getModel("LocalViewSetting").setProperty("/MaterialItemCount", 0);
								gList.getModel("LocalViewSetting").setProperty("/ListItemsCount", 1);
								// sap.ui.controller("com.arteria.ss.stockadjustmnt.create.controller.List").removeAllTokenforItems();
								// sap.ui.controller("com.arteria.ss.stockadjustmnt.create.controller.List").removeAllTokenforOtherItems();
								// sap.ui.controller("com.arteria.ss.stockadjustmnt.create.controller.List").setDataOtherModel();
								gList.byId("inputMaterial1").removeAllTokens();
								gList.byId("inputSKUGroup").removeAllTokens();
								gList.byId("inputMaterial1").removeAllTokens();
								gList.getModel("LocalViewSetting").setProperty("/StockMaterial", true);
								gList.getModel("LocalViewSetting").setProperty("/OtherMaterial", false);
								gList.getModel("LocalViewSetting").setProperty("/prdFrMatEnabled", false);
								gList.getModel("LocalViewSetting").setProperty("/GUID", oPPCCommon.generateUUID());

								gList.getModel("LocalViewSetting").setProperty("/stockMaterialT3", false);
								gList.getModel("LocalViewSetting").setProperty("/stockMaterialT1", true);
								gList.byId("SelectGroupIDAW").setSelectedIndex(0);
								gList.getModel("LocalViewSetting").setProperty("/StockMaterialReview", true);
								gList.byId("fileUploader").setValue("");

								// sap.ui.controller("com.arteria.ss.stockadjustmnt.create.controller.List").getPrdFeatures();
								gList.oController.getPrdFeatures();
								sap.ui.controller("com.arteria.ss.stockadjustmnt.create.controller.List").removeAllTokenforItems();
								sap.ui.controller("com.arteria.ss.stockadjustmnt.create.controller.List").removeAllTokenforOtherItems();
								sap.ui.controller("com.arteria.ss.stockadjustmnt.create.controller.List").setDataOtherModel();
								sap.ui.controller("com.arteria.ss.stockadjustmnt.create.controller.List").setMaterialModel();
								dialog.close();
							}
						})
					],
					afterClose: function () {
						dialog.destroy();
					}
				});
				dialog.open();
				dialog.attachBrowserEvent("keydown", function (oEvent) {
					oEvent.stopPropagation();
					oEvent.preventDefault();
				});

				if (!oPPCCommon.doErrMessageExist()) {
					oText.setText(oPPCCommon.getErrorMsgsFromMsgMgr());
					oPanel.addContent(oText);
					var errorDialog = new sap.m.Dialog({
						title: 'Error',
						type: 'Message',
						state: 'Error',
						content: oPanel,
						beginButton: new sap.m.Button({
							text: 'Close',
							press: function () {
								dialog.open();
								errorDialog.close();
							}
						}),
						afterClose: function () {
							errorDialog.destroy();
						}
					});
					errorDialog.open();
					errorDialog.attachBrowserEvent("keydown", function (oEvent) {
						oEvent.stopPropagation();
						oEvent.preventDefault();
					});
				} else {
					dialog.open();
					dialog.attachBrowserEvent("keydown", function (oEvent) {
						oEvent.stopPropagation();
						oEvent.preventDefault();
					});
				}
			}

			dialog.open();
			dialog.attachBrowserEvent("keydown", function (oEvent) {
				oEvent.stopPropagation();
				oEvent.preventDefault();
			});

			if (this.onCreateSuccess_Exit) {
				this.onCreateSuccess_Exit();
			}
		},
		getMessageType: function () {
			var msgsCount = sap.ui.getCore().getMessageManager().getMessageModel().getData().length;
			var messageType = "Information";
			if (msgsCount > 0) {
				var aMessageObjects = sap.ui.getCore().getMessageManager().getMessageModel().getData();
				for (var i = 0; i < msgsCount; i++) {
					var messageModel = aMessageObjects[i];
					if (messageModel.code === "/ARTEC/SS/176") {
						messageType = "Success";
						break;
					} else {
						messageType = messageModel.type;
						break;
					}
				}
			}

			//for enhancement
			if (this.getMessageType_exist) {
				messageType = this.getMessageType_exist();
			}

			return messageType;
		},
		clearAll: function () {
			var that = this;
			var oView = gList;
			if (oView.getModel("ReasonDD")) {
				that.getModel("ReasonDD").setProperty("/", {});
			}
		},
		gotoDetail: function (GUID) {
			var path = "StockAdjustmentDetail(MaterialDocGUID='" + GUID + "')";
			oPPCCommon.crossAppNavigation("ssstkadjcreate", "ssstockadmnt", "Display", "ssstkadjcreate", "sfstkadjustment",
				"/View/" + path);
			if (this.gotoDetail_Exit) {
				this.gotoDetail_Exit();
			}
		},
		showError: function (finalDocType) {
			if (finalDocType === "802") {
				var msg = oPPCCommon.getMsgsFromMsgMgr().split("for");
				var msg1 = msg[0].trim();
				if (msg1 === "Sufficient stock is not available") {
					var msg2 = "Quantiy increase is not allowed";
				}
				oPPCCommon.addMsg_MsgMgr(msg2);
			}
			var that = this;
			that.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel().getData()
				.length);
			oPPCCommon.showMessagePopover(gList);
		},

		validate: function () {
			this.validateItem();
		},
		validateItemMaterialWise: function () {
			this.validateItem1();
		},
		getselectDD: function (ID) {
			var oInput = gList.byId(ID);
			var sText = "";
			var sID = "";
			if (oInput.getSelectedKey() !== "" && oInput.getSelectedKey() !== undefined) {
				sID = oInput.getSelectedKey();
				sText = (oInput.getSelectedItem().getText().split("-")[1]).trim();
			}
			var array = [];
			array.push(sID);
			array.push(sText);
			return array;
		},
		validateItem: function () {
			oPPCCommon.removeAllMsgs();
			var MaterialDocItemDetails = gList.getModel("ListItems").getProperty("/");
			if (MaterialDocItemDetails.length !== 0) {
				var index = [];
				var isQuantityValid = false;
				for (var i = 0; i < MaterialDocItemDetails.length; i++) {
					var isValid = true;
					var msg = "";
					var cells = gList.byId("UIListTable").getRows()[i].getCells();
					var cellId = "";
					var reasonID = "";
					if (MaterialDocItemDetails[i].MaterialNo !== "") {
						for (var m = 0; m < cells.length; m++) {
							// if (cells[m].getId().indexOf("HBoxAdjstdQty") > 0) {
							// 	cellId = cells[m].mAggregations.items[1].getId();
							// }
							if (cells[m].getId().indexOf("FReasonIDEdit") !== -1) {
								reasonID = cells[m].getId();
							}
						}
						isQuantityValid = true;
						index.push(i);
						var oView = gList;
						if (oView.byId(reasonID).getSelectedKey() === "") {
							msg = "Please select Reason for Material No " + MaterialDocItemDetails[i].MaterialNo;
							oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/QuantityM");
						}
						if (MaterialDocItemDetails[i].Batch === "" || MaterialDocItemDetails[i].Batch === "(Select)") {
							msg = "Please select Batch for Material No " + MaterialDocItemDetails[i].MaterialNo;
							oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/QuantityB");
						}
						var AdjQty = MaterialDocItemDetails[i].AdjQty + "";
						var MaterialNo = MaterialDocItemDetails[i].MaterialNo;

						if (AdjQty === "" || AdjQty === undefined || AdjQty === null || AdjQty === "NaN" || AdjQty === "undefined") {
							msg = oi18n.getText("List.Input.Adjqty.AdjQtyEmpty", MaterialNo);
							oView.getModel("ListItems").setProperty("" + i + "/QuantityValueState", "Error");
							oView.getModel("ListItems").setProperty("" + i + "/QuantityValueStateText", msg);
							oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/FAdjQty");
						} else if (parseFloat(AdjQty) < 0) {
							msg = oi18n.getText("List.Input.Adjqty.AdjQtyWithNegative", MaterialNo);
							oView.getModel("ListItems").setProperty("" + i + "/QuantityValueState", "Error");
							oView.getModel("ListItems").setProperty("" + i + "/QuantityValueStateText", msg);
							oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/FAdjQty");
						}
					}
				}
				if (!isQuantityValid) {
					msg = "Please add atleast one Material to create Stock Adjustment";
					oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/Quantity");
				}

				if (isQuantityValid) {
					for (var i = 0; i < MaterialDocItemDetails.length; i++) {
						for (var j = 0; j < index.length; j++) {
							if (i === index[j]) {
								var cells = gList.byId("UIListTable").getRows()[j].getCells();
								var cellId = "";
								var remarksId = "";
								for (var m = 0; m < cells.length; m++) {
									if (cells[m].getId().indexOf("FReasonIDEdit") > 0) {
										cellId = cells[m].getId();
									}
									if (cells[m].getId().indexOf("Remarks") > 0) {
										remarksId = cells[m].mAggregations.items[0].getId();
									}
								}
								var KeyText = this.getselectDD(cellId);
								MaterialDocItemDetails[i].ReasonID = KeyText[0];
								MaterialDocItemDetails[i].ReasonDesc = KeyText[1];
							}
						}
					}
				}
			}
		},
		validateItem1: function () {
			oPPCCommon.removeAllMsgs();
			var MaterialDocItemDetails = gList.getModel("ListItems").getProperty("/");
			if (MaterialDocItemDetails.length !== 0) {
				var index = [];
				var isSelected = false;
				var oView = gList;
				var msg;
				for (var i = 0; i < MaterialDocItemDetails.length; i++) {
					var cells = gList.byId("UIListTable").getRows()[i].getCells();
					var cellId = "";
					var reasonID = "";

					// for (var m = 0; m < cells.length; m++) {

					// 	if (cells[m].getId().indexOf("FReasonIDEdit") !== -1) {
					// 		reasonID = cells[m].getId();
					// 	}
					// }

					var AdjQty = MaterialDocItemDetails[i].AdjQty;
					if (AdjQty !== undefined) {
						AdjQty = AdjQty + "";
					}
					// var BatchNo = MaterialDocItemDetails[i].Batch;

					if (AdjQty === "" || AdjQty === undefined || AdjQty === null || AdjQty === "NaN") {
						// msg = oi18n.getText("List.Input.Adjqty.AdjQtyEmpty1", BatchNo);
						// oView.getModel("ListItems").setProperty("" + i + "/QuantityValueState", "Error");
						// oView.getModel("ListItems").setProperty("" + i + "/QuantityValueStateText", msg);
						// oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/FAdjQty");
						isSelected = false;
					}
					// else if (parseFloat(AdjQty) < 0) {
					// 	msg = oi18n.getText("List.Input.Adjqty.AdjQtyWithNegative1", BatchNo);
					// 	oView.getModel("ListItems").setProperty("" + i + "/QuantityValueState", "Error");
					// 	oView.getModel("ListItems").setProperty("" + i + "/QuantityValueStateText", msg);
					// 	oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/FAdjQty");
					// 	isSelected = false;
					// } 
					else {
						isSelected = true;
						i = MaterialDocItemDetails.length;
					}

				}
				if (!isSelected) {
					msg = "Please enter physical stock for atleast one line item";
					oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/Quantity");
				} else {
					for (var j = 0; j < MaterialDocItemDetails.length; j++) {
						var AdjQty1 = MaterialDocItemDetails[j].AdjQty;
						if (AdjQty1 !== undefined) {
							AdjQty1 = AdjQty1 + "";
						}
						var BatchNo1 = MaterialDocItemDetails[j].Batch;
						if (AdjQty1 !== "" && AdjQty1 !== undefined && AdjQty1 !== null && AdjQty1 !== "NaN") {
							if (parseFloat(AdjQty1) < 0) {
								msg = oi18n.getText("List.Input.Adjqty.AdjQtyWithNegative1", BatchNo1);
								oView.getModel("ListItems").setProperty("" + j + "/QuantityValueState", "Error");
								oView.getModel("ListItems").setProperty("" + j + "/QuantityValueStateText", msg);
								oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/FAdjQty");
							}
							if (MaterialDocItemDetails[j].ReasonID === "" || MaterialDocItemDetails[j].ReasonID === undefined) {
								msg = "Please Select Reason for Sl No For Batch " + BatchNo1;
								oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/QuantityM");
							}
						}

					}

				}
			}
		},
		gotoSave: function () {
			this._oComponent.getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
				.getData()
				.length);
			oPPCCommon.hideMessagePopover(gList);
			this._oComponent.getModel("LocalViewSetting").setProperty("/editMode", false);
			this._oComponent.getModel("LocalViewSetting").setProperty("/reviewMode", true);
		},
		onSave: function (oEvent) {
			busyDialog.open();
			var that = this;
			that.getView().byId("saveBtn").setEnabled(false);
			flag = true;
			tempErrArr = [];
			this.updateMatDoc("");
			// busyDialog.close();
		},
		navigateBack: function () {
			if (this.getView().getModel("LocalViewSetting").getProperty("/editMode") === true) {
				// this.backToList();
			}
			if (this.getView().getModel("LocalViewSetting").getProperty("/reviewMode") === true) {
				this.getView().getModel("LocalViewSetting").setProperty("/editMode", true);
				if (gList.byId("RB1-2").getSelected()) {
					this.getView().getModel("LocalViewSetting").setProperty("/CalculateButton", true);
				} else {
					this.getView().getModel("LocalViewSetting").setProperty("/CalculateButton", false);
				}
				this.getView().getModel("LocalViewSetting").setProperty("/reviewMode", false);
				this.getView().getModel("LocalViewSetting").setProperty("/PageHeader", oi18n.getText("List.title"));
				//	gList.getModel("ListItems").setProperty("/RemarksStateText", "");
				//	gList.getModel("ListItems").setProperty("/RemarksState", None);

				// this._oComponent.getModel("LocalViewSetting").setProperty("/ListItemsCount", lSnos);
				// if (gList.getModel("ListItems")) {
				// 	gList.getModel("ListItems").setProperty("/", []);
				// }
				// for (var i = 0; i < aTempList.length; i++) {
				// 	aTempList[i].AdjQty = aTempList[i].MaterialDocQty;
				// }

				// var json = new sap.ui.model.json.JSONModel(aTempList);
				// gList.setModel(json, "ListItems");
				/*	var MaterialDocItemDetails = gList.getModel("ListItems");
					for (var i = 0; i < MaterialDocItemDetails.oData.length; i++) {
						gList.getModel("ListItems").setProperty("/" + i + "AdjQty", MaterialDocItemDetails.oData[i].MaterialDocQty);
					}*/
			}
		},
		backToList: function () {
			var oHistory, sPreviousHash;
			oHistory = sap.ui.core.routing.History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				if (document.referrer !== "") {
					window.history.go(-1);
				} else {
					this.router.navTo("ListPage");
				}
			}

		},
		showPopUp: function () {
			oPPCCommon.showMessagePopover(gList);
			if (this.showPopUp_Exit) {
				this.showPopUp_Exit();
			}
		},
		getCurrentUsers: function (sServiceName, sRequestType) {
			var sLoginID = oProductCommon.getCurrentLoggedUser({
				sServiceName: sServiceName,
				sRequestType: sRequestType
			});
			return sLoginID;
		},
		validateOtherItems1: function () {
			var listItems = gList.getModel("ListItems").getData();
			var valid = true;
			for (var j = 0; j < listItems.length; j++) {
				if (listItems[j].GQuantity === "") {
					listItems[j].GQuantity = "0";
				}
				if (listItems[j].SQuantity === "") {
					listItems[j].SQuantity = "0";
				}
				if (listItems[j].DQuantity === "") {
					listItems[j].DQuantity = "0";
				}
			}
			this.ClearValueState(["BatchValueState", "UOMValueState", "MRPValueState", "UnitPriceValueState", "MDateValueState",
				"EDateValueState", "RefDocNoValueState", "RefDocItemNoValueState", "QuantityValueState"
			]);
			var isValid = true;
			for (var i = 0; i < listItems.length; i++) {
				if (listItems[i].MaterialNo !== "") {
					valid = false;
					var cells = gList.byId("UIListTableOther").getRows()[i].getCells();
					for (var j = 0; j < cells.length; j++) {
						if (cells[j].getId().indexOf("inputUOM") !== -1) {
							var uom = gList.byId(cells[j].getId()).getSelectedItem().getText();
							if (uom === "") {
								var msg = "Please select UOM for Material No " + listItems[i].MaterialNo
								gList.getModel("ListItems").setProperty("/" + i + "/UOMValueState", "Error");
								gList.getModel("ListItems").setProperty("/" + i + "/UOMValueStateText", msg);
								oPPCCommon.addMsg_MsgMgr(msg, "error", "Batch" + i);
							} else {
								gList.getModel("ListItems").setProperty("/" + i + "/UOM", uom);
							}
						}
					}
					if (listItems[i].Batch === "") {
						var msg = "Please enter Batch for Material No " + listItems[i].MaterialNo;
						// gList.getModel("ListItems").setProperty("/" + i + "/BatchValueState", "Error");
						// gList.getModel("ListItems").setProperty("/" + i + "/BatchValueStateText", msg);
						oPPCCommon.addMsg_MsgMgr(msg, "error", "Batch" + i);
						isValid = false;
					}
					if (parseFloat(listItems[i].GQuantity) === 0) {
						var msg = "Please enter Quantity for Material No " + listItems[i].MaterialNo;
						// oPPCCommon.addMsg_MsgMgr(msg, "error", "Quantity" + i);
						// gList.getModel("ListItems").setProperty("/" + i + "/QuantityValueState", "Error");
						// gList.getModel("ListItems").setProperty("/" + i + "/QuantityValueStateText", msg);
						oPPCCommon.addMsg_MsgMgr(msg, "error", "Quantity" + i);
						isValid = false;
					}
				}
			}
			if (valid) {
				var msg2 = "Please add atleast one Material to create Stock Adjustment";
				oPPCCommon.addMsg_MsgMgr(msg2, "error", "material");
				isValid = false;
			}
			return isValid;

		},
		onCalculate: function () {
			var that = this;
			flag = true;
			busyDialog.open();
			var listItems = gList.getModel("MaterialDocs");
			oPPCCommon.removeAllMsgs();
			oPPCCommon.hideMessagePopover(gList);
			this.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel().getData()
				.length);
			this.validateFilter();
			this.validateOtherItems1();
			if (oPPCCommon.doErrMessageExist()) {
				this._oMaterialDocItemDetails1 = [];
				aTempList = [];
				this._oMaterialDocItemDetails = jQuery.extend(true, [], gList.getModel("ListItems").getData());
				aTempList = jQuery.extend(true, [], gList.getModel("ListItems").getData());
				listItems.MaterialDocItemDetails = [];
				var MaterialDocItemDetails = [];
				aTempList = [];
				for (var i = 0; i < this._oMaterialDocItemDetails.length; i++) {
					if (this._oMaterialDocItemDetails[i].MaterialNo !== "") {
						if (this._oMaterialDocItemDetails[i].MRP === "") {
							this._oMaterialDocItemDetails[i].MRP = "0";
						}
						this._oMaterialDocItemDetails[i].MaterialDocItemCatSplits = [];
						if (this._oMaterialDocItemDetails[i].GQuantity > 0) {
							var obj = {
								"RefDocNo": this._oMaterialDocItemDetails[i].TransRefNo,
								"RefDocItemNo": this._oMaterialDocItemDetails[i].TransRefItemNo,
								"UOM": this._oMaterialDocItemDetails[i].UOM,
								"MaterialCatID": "M001",
								"MaterialDocQty": this._oMaterialDocItemDetails[i].GQuantity,
								"MaterialCatDesc": "Good",
								"MatDocItemGUID": "",
								"MatHeaderGuid": ""
							};
							this._oMaterialDocItemDetails[i].MaterialDocItemCatSplits.push(obj);
						}
						if (this._oMaterialDocItemDetails[i].DQuantity > 0) {
							var obj = {
								"RefDocNo": this._oMaterialDocItemDetails[i].TransRefNo,
								"RefDocItemNo": this._oMaterialDocItemDetails[i].TransRefItemNo,
								"UOM": this._oMaterialDocItemDetails[i].UOM,
								"MaterialCatID": "M002",
								"MaterialDocQty": this._oMaterialDocItemDetails[i].DQuantity,
								"MaterialCatDesc": "Damage",
								"MatDocItemGUID": "",
								"MatHeaderGuid": ""
							};
							this._oMaterialDocItemDetails[i].MaterialDocItemCatSplits.push(obj);
						}
						if (this._oMaterialDocItemDetails[i].SQuantity > 0) {
							var obj = {
								"RefDocNo": this._oMaterialDocItemDetails[i].TransRefNo,
								"RefDocItemNo": this._oMaterialDocItemDetails[i].TransRefItemNo,
								"UOM": this._oMaterialDocItemDetails[i].UOM,
								"MaterialCatID": "M003",
								"MaterialDocQty": this._oMaterialDocItemDetails[i].SQuantity,
								"MaterialCatDesc": "Shortage",
								"MatDocItemGUID": "",
								"MatHeaderGuid": ""
							};
							this._oMaterialDocItemDetails[i].MaterialDocItemCatSplits.push(obj);
						}
						MaterialDocItemDetails.push({
							MaterialNo: this._oMaterialDocItemDetails[i].MaterialNo,
							MaterialDesc: this._oMaterialDocItemDetails[i].MaterialDesc,
							MaterialDocGUID: oPPCCommon.generateUUID(),
							MatDocItemGUID: oPPCCommon.generateUUID().toUpperCase(),
							MaterialDocQty: (parseInt(this._oMaterialDocItemDetails[i].GQuantity) + parseInt(this._oMaterialDocItemDetails[i].SQuantity) +
								parseInt(this._oMaterialDocItemDetails[i].DQuantity)).toString(),
							Remarks: this._oMaterialDocItemDetails[i].Remarks,
							UOM: this._oMaterialDocItemDetails[i].UOM,
							Batch: this._oMaterialDocItemDetails[i].Batch,
							ItemNo: this._oMaterialDocItemDetails[i].ItemNo,
							DMSDivisionID: this._oMaterialDocItemDetails[i].DMSDivision,
							MaterialDocItemCatSplits: this._oMaterialDocItemDetails[i].MaterialDocItemCatSplits
						});
						this._oMaterialDocItemDetails[i].ItemNo = this._oMaterialDocItemDetails[i].ItemNo.toString();
						aTempList.push(this._oMaterialDocItemDetails[i]);
					}
				}
				var jsondata = new sap.ui.model.json.JSONModel(MaterialDocItemDetails);
				that._oComponent.setModel(jsondata, "MaterialDocItemDetails");
				var jsondata1 = new sap.ui.model.json.JSONModel(aTempList);
				that._oComponent.setModel(jsondata1, "MatDocItems");
				that._oComponent.getModel("LocalViewSetting").setProperty("/MaterialItemCount", aTempList.length);
				this.updateMatDoc("S");
			} else {
				this.showError();
				busyDialog.close();
			}
			if (this.onCalculate_Exit) {
				this.onCalculate_Exit();
			}

		}
	});
});
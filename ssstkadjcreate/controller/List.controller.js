sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"com/arteriatech/ppc/utils/js/Common",
	"com/arteriatech/prd/utils/js/Common",
	"com/arteriatech/prd/utils/js/UserMapping",
	"com/arteriatech/prd/utils/js/CommonValueHelp",
	"sap/m/MessageBox"
], function (Controller, JSONModel, History, oPPCCommon, oProductCommon, oProductUserMapping, oCommonValueHelp, MessageBox) {
	"use strict";
	var oi18n, oUtilsI18n;
	var Device = sap.ui.Device;
	var busyDialog = new sap.m.BusyDialog();
	var sl = new Array();
	var ContractUploadFileList = [];
	var aDialog;
	var aFlag;
	var oUtilsI18n;
	var DocumentStore;
	var oDialog = new sap.m.BusyDialog();
	var indexOfPattern;
	var vMaximumFileSize;
	var gSchemeGUID;
	var vIndex = 0;
	var aSimulateItem = [];
	return Controller.extend("com.arteria.ss.stockadjustmnt.create.controller.List", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind ordeevent handlers and do other one-time initialization.
		 * @memberOf com.arteria.ss.stockadjustmnt.create.view.List
		 */
		onInit: function () {
			this.onInitHookUp();
		},

		onInitHookUp: function () {
			gList = this.getView();
			this._oView = this.getView();
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(gList));

			oProductCommon = com.arteriatech.ss.utils.js.Common;
			oCommonValueHelp = com.arteriatech.ss.utils.js.CommonValueHelp;
			oProductUserMapping = com.arteriatech.ss.utils.js.UserMapping;

			oi18n = this._oComponent.getModel("i18n").getResourceBundle();
			oUtilsI18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();
			//Router Initialisation
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			//Attach event for routing on view patter matched 

			this._oRouter.attachRouteMatched(this.onRouteMatched, this);
			this.setHeaderData();

			this.setDefaultSettings();

			this.setValuehelpPropety();

			// this.setDMSDivModel();

			if (this.onInitHookUp_Exit) {
				this.onInitHookUp_Exit();
			}
		},

		ToolbarMaterialF4: function (oEvent) {
			oEvent.getSource().setValueState("None");
			oEvent.getSource().setValueStateText("");
			var that = this;
			oPPCCommon.removeAllMsgs();
			oPPCCommon.hideMessagePopover(this.getView());
			var fDMSDivision = oPPCCommon.getKeysFromMultiCombo(this.getView(), "inputDMSDivision");
			this.validateMandatory();
			this.aKeys = ["MaterialNo", "MaterialDesc"];
			if (oPPCCommon.doErrMessageExist()) {
				this.cpStockF4({
					oController: this,
					oi18n: oi18n,
					oUtilsI18n: oUtilsI18n,
					bMultiSelect: false,
					sCustomer: that.getSelectedCustomerCode(),
					sCPTypeID: "01",
					dmsDivision: fDMSDivision,
					sCPGUID: that.getView().getModel("MaterialDocs").getData().FromGUID

				}, function (tokens) {
					var jData = tokens[0].getCustomData()[0].getValue();
					var SOCreateItem = that.getView().getModel("ListItems");
					var aItems = SOCreateItem.getProperty("/");
					for (var i = 0; i < aItems.length; i++) {

						if (jData.MaterialNo === aItems[i].MaterialNo) {

							var msg = that.oi18n.getText("Create.material.Exists");
							MessageBox.error(
								msg, {
									styleClass: "sapUiSizeCompact"
								}
							);
							return;

						}

					}
					that.getView().getModel("LocalViewSetting").setProperty("/MaterialTokens", []);
					that.getView().getModel("LocalViewSetting").setProperty("/MaterialTokens", [jData]);
					var selectedStockType = that.getView().byId("StockTypes").getSelectedKey();
					if (selectedStockType === "1") {
						that.setBatchModel(jData.MaterialNo);
					} else {
						that.setBatchModelCpStock(jData.MaterialNo);
					}

					that.updateMaterialToTableRow(jData);

				});
			} else {
				this.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel().getData()
					.length);
				oPPCCommon.showMessagePopover(gObjectPageLayout);
			}

			// var oBindingContext = oEvent.getSource().getBindingContext("SSInvoiceItem");
			// var sPath = oBindingContext.getPath();

		},
		MatF4: function (oEvent) {
			//var customer = this.getView().byId("CustomerID").getSelectedKey();
			this.validateMandatory();
			if (oPPCCommon.doErrMessageExist()) {
				var that = this;
				var fDMSDivision = oPPCCommon.getKeysFromMultiCombo(this.getView(), "inputDMSDivision");
				var index = oEvent.getSource().getId().slice(-1);
				index = parseInt(oEvent.getSource().getBindingContext("ListItems").getPath().split("/")[1]);
				var itemIndex = parseInt(index);
				var SOCreateItem = this.getView().getModel("ListItems");
				var aItems = SOCreateItem.getProperty('/');
				var oBindingContext = oEvent.getSource().getBindingContext("ListItems");
				var cells = this.getView().byId("UIListTable").getRows()[itemIndex].getCells();
				// for (var j = 0; j < cells.length; j++) {
				// 	if (cells[j].getId().indexOf("inputMaterial") !== -1) {
				// 		this.MaterialInput = this.getView().byId(cells[j].getId());
				// 		this.getView().byId(cells[j].getId()).setValueState("None");
				// 		this.getView().byId(cells[j].getId()).setValueStateText("");
				// 	}
				// }
				this.aKeys = ["MaterialNo", "MaterialDesc"];
				this.cpStockF4({
					oController: this,
					oi18n: oi18n,
					oUtilsI18n: oUtilsI18n,
					bMultiSelect: false,
					sCustomer: that.getSelectedCustomerCode(),
					sCPTypeID: "01",
					dmsDivision: fDMSDivision,
					sCPGUID: that.getView().getModel("MaterialDocs").getData().FromGUID

				}, function (tokens) {
					var tokenTextLength = 15;
					var jData = tokens[0].getCustomData()[0].getValue();
					var bValidMaterial = true;
					//bValidMaterial = that.validateMaterial(jData, oEvent.getSource(), itemIndex);
					if (bValidMaterial) {
						// that.MaterialInput.addToken(tokens[0]);
						//------------------>
						// var Text1 = tokens[0].mProperties.key;
						// var Text = tokens[0].mProperties.text;
						// tokens[0].mProperties.text = that.TextAbstract(Text, Text1, tokenTextLength);
						//	that.MaterialInput.addToken(tokens[0]);
						//<--------------------
						that.setSelectedMaterialToTable(jData, oBindingContext, aItems, itemIndex);
						that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/OrderMaterialGroupID", jData.OrderMaterialGroupID);
						that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/OrderMaterialGroupDesc", jData.OrderMaterialGroupDesc);
						that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/DMSDivision", jData.DMSDivision);
						that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/DmsDivisionDesc", jData.DmsDivisionDesc);
						// that.getMaterialUOMs(jData.MaterialNo, itemIndex);
						var selectedStockType = that.getView().byId("StockTypes").getSelectedKey();
						if (selectedStockType === "1") {
							that.setBatchModel(jData.MaterialNo);
						} else {
							that.setBatchModelCpStock(jData.MaterialNo);
						}

					} else {
						// that.MaterialTokenInput.setValue(tokens[0].getCustomData()[0].getValue().MaterialNo);
						that.getView().byId("UIListTable").getRows()[itemIndex].getAggregation("cells")[1].removeAllTokens();
						that.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
							.getData()
							.length);
						oPPCCommon.showMessagePopover(gList);
					}

				});
			} else {
				oPPCCommon.displayMsg_MsgBox(this.getView(), oPPCCommon.getMsgsFromMsgMgr(), "error");
			}
		},
		formatToken: function (text, key) {
			if (key !== "") {
				text = text + "(" + key + ")";
			}

			if (text === null) {
				return "";
			}
			if (text.length <= 10) {
				return text;
			}
			text = text.substring(0, 10);
			// last = text.lastIndexOf(" ");
			// text = text.substring(0, last);
			return text + "...";
		},
		onToolMatLiveChange: function () {
			var tokenLength = this.getView().byId("toolbarMaterialNoID").getTokens().length;
			if (tokenLength > 0) {
				this.getView().byId("toolbarMaterialNoID").setValue("");
				return;
			}
		},
		ToolbarMatSuggestionSelected: function (oEvent) {
			var that = this;
			this.getView().getModel("LocalViewSetting").setProperty("/MaterialTokens", []);
			var SOCreateItem = this.getView().getModel("ListItems");
			var aItems = SOCreateItem.getProperty("/");
			oEvent.getSource().setValueState("None");
			oEvent.getSource().setValueStateText("");
			var selectedObject = oEvent.getParameter("selectedRow").getBindingContext("MatSuggestorModel").getObject();
			// for (var i = 0; i < aItems.length; i++) {
			// 	if (selectedObject.MaterialNo === aItems[i].MaterialNo) {
			// 		var msg = "Material Already Exists";
			// 		MessageBox.error(
			// 			msg, {
			// 				styleClass: "sapUiSizeCompact"
			// 			}
			// 		);
			// 		this.getView().byId("toolbarMaterialNoID").removeAllTokens();
			// 		return;

			// 	}
			// }

			jQuery.sap.delayedCall(100, this, function () {
				this.getView().byId("toolbarMaterialNoID").focus();
			});
			this.getView().getModel("LocalViewSetting").setProperty("/MaterialTokens", [selectedObject]);
			this.localData = selectedObject;
			// this.setBatch(selectedObject);
			var selectedStockType = this.getView().byId("StockTypes").getSelectedKey();
			if (selectedStockType === "1") {
				that.setBatchModel(selectedObject.MaterialNo, false);
			} else {
				that.setBatchModelCpStock(selectedObject.MaterialNo, false);
			}

			// this.updateMaterialToTableRow(selectedObject);
		},
		setBatchModelCpStock: function (MaterialNo, flag, index) {
			var that = this;
			// busyDialog.open();
			var oMaterialModel = gList.getModel("SSGW_MM");
			var fDMSDivision = oPPCCommon.getKeysFromMultiCombo(gList, "inputDMSDivision");

			var aMaterialF4Filter = new Array();
			oProductCommon.getCurrentLoggedUser({
				sServiceName: "CPStockItems",
				sRequestType: "read"
			}, function (LoginID) {
				aMaterialF4Filter = oCommonValueHelp.setODataModelReadFilter(gList, "",
					aMaterialF4Filter, "CPGUID", sap.ui.model.FilterOperator.EQ, [gList.getModel("MaterialDocs").getData().FromGUID],
					false,
					false, false);
				aMaterialF4Filter = oCommonValueHelp.setODataModelReadFilter(gList, "",
					aMaterialF4Filter, "CPTypeID", "", [gList.getModel("MaterialDocs").getData().CPTypeID], false, false, false);

				aMaterialF4Filter = oPPCCommon.setODataModelReadFilter(gList, "", aMaterialF4Filter,
					"MaterialNo", "", [MaterialNo], false, false, false);

				aMaterialF4Filter = oPPCCommon.setODataModelReadFilter("", "", aMaterialF4Filter, "LoginID", "", [LoginID], false, false,
					false);
				aMaterialF4Filter = oPPCCommon.setODataModelReadFilter("", "", aMaterialF4Filter, "StockOwner", "", ["01"], false, false,
					false);

				if (gList.byId("StockTypes").getSelectedKey()) {
					aMaterialF4Filter = oPPCCommon.setODataModelReadFilter(gList, "", aMaterialF4Filter,
						"StockTypeID", "", [gList.byId("StockTypes").getSelectedKey()], false, false, false);
				} else {
					aMaterialF4Filter = oPPCCommon.setODataModelReadFilter(gList, "", aMaterialF4Filter,
						"StockTypeID", "", ["1"], false, false, false);
				}

				// aMaterialF4Filter = oPPCCommon.setODataModelReadFilter(gList, "", aMaterialF4Filter,
				// 		"StockSubTypeID", sap.ui.model.FilterOperator.EQ, [gList.byId("StockSubTypes").getSelectedKey()], false, false,
				// 		false);

				oMaterialModel.read("/CPStockItems", {
					filters: aMaterialF4Filter,
					urlParameters: {
						"$expand": "CPStockItemSnos"
					},
					success: function (oData) {
						oData = oPPCCommon.formatItemsOData({
							oData: oData.results
						});

						var aBatchDD = oData[0].CPStockItemSnos.results;
						var aNewBatchDD = [];
						for (var i = 0; i < aBatchDD.length; i++) {
							if (aBatchDD[i].Batch !== "") {
								aNewBatchDD.push(aBatchDD[i]);

							}
						}
						if (flag) {
							that.getView().getModel("ListItems").setProperty("/" + index + "/BatchSuggestorModel", aNewBatchDD);
						} else {
							var oItemSerialNoModel = new sap.ui.model.json.JSONModel();
							oItemSerialNoModel.setData(aNewBatchDD);
							gList.setModel(oItemSerialNoModel, "BatchSuggestorModel");
						}
						// var ChannelPartnerModel = new sap.ui.model.json.JSONModel();
						// ChannelPartnerModel.setData(oData);
						// gList.setModel(ChannelPartnerModel, "BatchSuggestorModel");
						// gList.getModel("LocalViewSetting").setProperty("/MaterialVisible", true);
						busyDialog.close();

					},
					error: function (error) {
						// gList.getModel("LocalViewSetting").setProperty("/MaterialVisible", true);
						// busyDialog.close();
						//alert(error);
					}
				});
			});
			//for enhancement
			if (this.setBatchModelCpStock_Exit) {
				this.setBatchModelCpStock_Exit();
			}
		},
		// setBatch: function (localData) {
		// 	var that = this;
		// 	var aBatchDD = [];
		// 	aBatchDD = localData.CPStockItemSnos.results;
		// 	var aNewBatchDD = [];
		// 	for (var i = 0; i < aBatchDD.length; i++) {
		// 		if (aBatchDD[i].Batch !== "") {
		// 			aBatchDD[i].seperator = " - ";
		// 			aNewBatchDD.push(aBatchDD[i]);
		// 		}
		// 	}
		// 	// if (aNewBatchDD.length > 0) {
		// 	// 	aNewBatchDD.unshift({
		// 	// 		Batch: "(Select)"
		// 	// 	});
		// 	// }
		// 	var oItemSerialNoModel = new sap.ui.model.json.JSONModel();
		// 	oItemSerialNoModel.setData(aNewBatchDD);
		// 	this.getView().setModel(oItemSerialNoModel, "ToolBarBatchDD");
		// },
		validateToolBarBatches: function (selectedBatchObject) {
			var oItemModel = this.getView().getModel("ListItems").getProperty("/");
			// var sIndex = parseInt(path.substring(path.lastIndexOf("/") + 1));
			var MaterialNo = selectedBatchObject.MaterialNo;
			var CPSnoGUID = selectedBatchObject.CPSnoGUID;
			var Batch = selectedBatchObject.Batch;
			var invoice = selectedBatchObject.TransRefNo;
			oPPCCommon.removeAllMsgs();
			var selectedStockType = this.getView().byId("StockTypes").getSelectedKey();
			if (selectedStockType === "1") {
				for (var k = 0; k < oItemModel.length; k++) {
					// if (sIndex !== k) {
					if (MaterialNo === oItemModel[k].MaterialNo) {
						if (Batch === oItemModel[k].Batch) {
							var msg = "Batch already exists";
							oPPCCommon.addMsg_MsgMgr(msg, "error", "Material");
							break;
						}
					}
					// }
				}
			} else {
				for (var k = 0; k < oItemModel.length; k++) {
					// if (sIndex !== k) {
					if (MaterialNo === oItemModel[k].MaterialNo) {
						if (Batch === oItemModel[k].Batch && oItemModel[k].StockRefGUID === CPSnoGUID) {
							var msg = "Batch already exists";
							oPPCCommon.addMsg_MsgMgr(msg, "error", "Material");
							break;
						}
					}
					// }
				}
			}

		},
		onToolBarBatchChange: function (oEvent) {
			var that = this;
			oEvent.getSource().setValueState("None");
			var selectedBatch = oEvent.getParameter("selectedItem");
			var selectedBatchContext = selectedBatch.getBindingContext("ToolBarBatchDD");
			var sPath = selectedBatchContext.getPath();
			var selectedBatchObject = selectedBatchContext.getObject();
			var invoiceItemContext = oEvent.getSource().getSelectedItem().getBindingContext("ToolBarBatchDD");
			var invoiceItemObject = invoiceItemContext.getObject();
			var invoiceItemPath = invoiceItemContext.getPath();
			this.validateToolBarBatches(selectedBatchObject, invoiceItemPath);
			if (oPPCCommon.doErrMessageExist()) {
				this.getView().getModel("LocalViewSetting").setProperty("/MRP", selectedBatchObject.MRP);
				this.getView().getModel("LocalViewSetting").setProperty("/ManufacturingDate", selectedBatchObject.ManufacturingDate);
				this.getView().getModel("LocalViewSetting").setProperty("/ExpiryDate", selectedBatchObject.ExpiryDate);
				this.getView().getModel("LocalViewSetting").setProperty("/PrimaryTradeDis", selectedBatchObject.PriDiscountPer);
				this.getView().getModel("LocalViewSetting").setProperty("/UnitPrice", selectedBatchObject.UnitPrice);
				this.getView().getModel("LocalViewSetting").setProperty("/Quantity", selectedBatchObject.Quantity);
				this.getView().getModel("LocalViewSetting").setProperty("/StockRefGUID", selectedBatchObject.CPSnoGUID);
				this.getView().getModel("LocalViewSetting").setProperty("/Batch", selectedBatchObject.Batch);
			} else {
				oEvent.getSource().setSelectedKey("(Select)");
				oEvent.getSource().setValueState("Error");
				oPPCCommon.showMessagePopover(gList);
			}
			// this.getView().getModel("LocalViewSetting").setProperty("/Batch", oEvent.getSource().getSelectedItem().getKey());
			// this.getView().getModel("LocalViewSetting").setProperty("/AuditorReasonDesc", oEvent.getSource().getSelectedItem().getText().split(
			// 	"-")[1].trim());
		},
		validateToolBarNumeric1: function (oEvent) {
			var that = this;
			oPPCCommon.removeAllMsgs();
			oPPCCommon.hideMessagePopover(gList);
			gList.getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel().getData()
				.length);
			var qtyLbl = this.getView().byId("sFAdjQtyLabel").getText();
			var value = oEvent.getSource().getValue();
			var reg = /[ !@#$%^&*()_+\-=\[\]{};':.`~"\\|,<>\/a-z A-Z?]/;
			if (reg.test(value)) {
				oEvent.getSource().setValue("");
				var msg = oi18n.getText("ROCreate.message.ToolBarValidQty", [qtyLbl]);
				oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/Quantity-");
				if (oPPCCommon.doErrMessageExist()) {
					oEvent.getSource().setValueState(null);
					oEvent.getSource().setValueStateText("");
				} else {
					that.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
						.getData()
						.length);
					oPPCCommon.showMessagePopover(gList);
				}
			}
		},
		onChangeToolBarReasonDesc: function (oEvent) {
			if (oEvent.getSource().getSelectedKey() !== "") {
				this.getView().getModel("LocalViewSetting").setProperty("/ReasonID", oEvent.getSource().getSelectedItem().getKey());
				this.getView().getModel("LocalViewSetting").setProperty("/ReasonDesc", oEvent.getSource().getSelectedItem().getText().split(
					"-")[1].trim());

			}
		},
		AddInsertToolbar: function () {
			oPPCCommon.removeAllMsgs();
			var localData = this.getView().getModel("LocalViewSetting").getProperty("/");
			var valid = true;
			var msg;
			if (localData.MaterialTokens) {
				if (localData.MaterialTokens.length) {

				} else {
					this.getView().getModel("LocalViewSetting").getProperty("/ToolbarMatValueState", "Error");
					this.getView().getModel("LocalViewSetting").getProperty("/ToolbarMatValueStateText", "PLease Enter Material No");
					valid = false;
					msg = "Please Enter Material";
					oPPCCommon.addMsg_MsgMgr(msg, "error", "");
				}
			} else {
				msg = "Please Enter Material";
				valid = false;
				oPPCCommon.addMsg_MsgMgr(msg, "error", "");
			}
			// if (localData.Batch) {

			// } else {
			// 	this.getView().getModel("LocalViewSetting").getProperty("/ToolbarQntyValueState", "Error");
			// 	this.getView().getModel("LocalViewSetting").getProperty("/ToolbarQntyValueStateText", "PLease Enter Material No");
			// 	valid = false;
			// 	msg = "Please Select Batch";
			// 	oPPCCommon.addMsg_MsgMgr(msg, "error", "");
			// }
			// if (localData.Quantity) {

			// } else {
			// 	valid = false;
			// 	msg = "Please Enter Physical Stock";
			// 	oPPCCommon.addMsg_MsgMgr(msg, "error", "");
			// }

			var Batch = this.getView().byId("multiInputBatch2").getTokens();

			var BatchVal = Batch.map(function (oToken) {
				return oToken.getKey();
			}).join(",");

			if (BatchVal) {

			} else {
				this.getView().getModel("LocalViewSetting").getProperty("/ToolbarQntyValueState", "Error");
				this.getView().getModel("LocalViewSetting").getProperty("/ToolbarQntyValueStateText", "PLease Enter Material No");
				valid = false;
				msg = "Please Select Batch";
				oPPCCommon.addMsg_MsgMgr(msg, "error", "");
			}

			var Quantity = this.getView().byId("sFAdjQty").getValue();
			if (Quantity) {

			} else {
				valid = false;
				msg = "Please Enter Physical Stock";
				oPPCCommon.addMsg_MsgMgr(msg, "error", "");
			}

			if (localData.ReasonID) {

			} else {
				valid = false;
				msg = "Please Select Reason";
				oPPCCommon.addMsg_MsgMgr(msg, "error", "");
			}

			if (valid) {
				this.getView().getModel("LocalViewSetting").setProperty("/toolBarInputControl", this.getView().byId("toolbarMaterialNoID"));
				this.updateMaterialToTableRow();
				// this.getView().byId("toolbarMaterialNoID").focus();
			} else {

				oPPCCommon.displayMsg_MsgBox(this.getView(), oPPCCommon.getMsgsFromMsgMgr(), "error");
			}

		},
		updateMaterialToTableRow: function () {
			var localData = this.localData;
			var Data = this.getView().getModel("LocalViewSetting").getProperty("/");
			var that = this;
			var aBatchDD = [];
			aBatchDD = this.getView().getModel("BatchSuggestorModel").getData();
			var aNewBatchDD = [];
			for (var i = 0; i < aBatchDD.length; i++) {
				if (aBatchDD[i].Batch !== "") {
					aBatchDD[i].seperator = " - ";
					aNewBatchDD.push(aBatchDD[i]);
				}
			}
			if (aNewBatchDD.length > 0) {
				// aNewBatchDD.unshift({
				// 	Batch: "(Select)"
				// });
			}

			var Batch = this.getView().byId("multiInputBatch2").getTokens();

			var BatchVal = Batch.map(function (oToken) {
				return oToken.getKey();
			}).join(",");

			// aNewBatchDD.push(BatchVal);
			var Quantity = Data.BookStk;
			var AdjQty = Data.AdjQty;
			var DiffQty = parseFloat(Quantity) - parseFloat(AdjQty);
			DiffQty = parseFloat(DiffQty).toFixed(2);
			var eachInvoiceItem = {
				materialEdit: false,
				MaterialNo: localData.MaterialNo,
				MaterialDesc: localData.MaterialDesc,
				MaterialTokens: [{
					Material: localData.MaterialNo,
					MaterialDesc: that.TextAbstract(localData.MaterialDesc, localData.MaterialNo, 15)
				}],
				BatchTokens: [{
					Batch: BatchVal,
					Tooltip: that.TextAbstract(BatchVal, BatchVal, 15)
				}],
				OrderMaterialGroupID: localData.OrderMaterialGroupID,
				OrderMaterialGroupDesc: localData.OrderMaterialGroupDesc,
				DMSDivision: localData.DMSDivision,
				DmsDivisionDesc: localData.DmsDivisionDesc,
				UOM: localData.UOM,
				// Batch: Data.Batch,
				AdjQty: Data.AdjQty,
				ReasonID: Data.ReasonID,
				MRP: Data.MRP,
				ManufacturingDate: Data.ManufacturingDate,
				ExpiryDate: Data.ExpiryDate,
				PrimaryTradeDis: Data.PrimaryTradeDis,
				UnitPrice: Data.UnitPrice,
				Quantity: Quantity,
				StockRefGUID: Data.StockRefGUID,
				Batch: Data.Batch,
				Currency: localData.Currency,
				DiffQty: DiffQty

			};
			eachInvoiceItem.TempBatches = aNewBatchDD;
			// if (localData.CPStockItemSnos.results && localData.CPStockItemSnos.results.length) {
			// 	var batchCPStock = aNewBatchDD;
			// 	for (var i in batchCPStock) {
			// 		eachInvoiceItem.TransRefNo = batchCPStock[i].TransRefNo;
			// 		eachInvoiceItem.Batch = batchCPStock[i].Batch;
			// 		break;
			// 	}
			// }
			var oDataTemp = this.getView().getModel("ListItems").getProperty("/");
			if (oDataTemp.length) {
				var countOfM = 0;
				var temoCount = 0;
				var itemNo = 0;
				oDataTemp = oDataTemp.filter(function (eachItem) {

					if (eachItem.MaterialNo !== "") {
						countOfM = temoCount + 1;
						itemNo = countOfM * 10;
						itemNo = ("0000" + itemNo).slice(-6);
						eachInvoiceItem.ItemNo = itemNo;
						temoCount++;
						return true;
					}
					return false;
				});
			}
			countOfM = temoCount + 1;
			itemNo = countOfM * 10;
			itemNo = ("0000" + itemNo).slice(-6);
			eachInvoiceItem.ItemNo = itemNo;
			oDataTemp.push(eachInvoiceItem);
			var inoviceItemLength = oDataTemp.length;
			// if (inoviceItemLength > 5) {
			// 	inoviceItemLength = 5;
			// }
			var balnkRow = oDataTemp.length > 5 ? 1 : 5 - oDataTemp.length;
			//	oDataTemp = this.getBlankInvoiceItemToTable(balnkRow, oDataTemp);
			this.getView().getModel("ListItems").setProperty("/", oDataTemp);

			this.getView().getModel("LocalViewSetting").setProperty("/ListItemsCount", oDataTemp.length);
			//this.checkForNewLineItem();

			that.addBlankInvoiceItemToTable(oDataTemp);
			this.getView().getModel("LocalViewSetting").setProperty("/MaterialTokens", []);
			this.getView().getModel("LocalViewSetting").setProperty("/BatchTokens", []);
			// this.getView().getModel("ToolBarBatchDD").setProperty("/", []);
			this.getView().getModel("LocalViewSetting").setProperty("/Batch", "");
			this.getView().getModel("LocalViewSetting").setProperty("/ReasonID", "");
			this.getView().getModel("LocalViewSetting").setProperty("/Quantity", "");
			this.getView().getModel("LocalViewSetting").setProperty("/BookStk", "");
			this.getView().getModel("LocalViewSetting").setProperty("/StkDifference", "");
			this.getView().byId("sFAdjQty").setValue("");
			this.getView().byId("sFReasonIDEdit").setSelectedKey("");
			// this.getView().byId("sUIFromBatchDD").setSelectedKey("");
			// this.getView().getModel("LocalViewSetting").setProperty("/ItemsCount", oDataTemp.length);

		},
		formatBatchDisplay: function (batch, eachBatch) {
			var eachBatchDisplay = "(Select)";
			if (eachBatch.Batch !== "(Select)") {
				var mfdDate = new Date(eachBatch.ManufacturingDate);
				var mfd = "";
				if (mfdDate.getDate()) {
					mfd = mfdDate.toLocaleDateString();
				}
				eachBatchDisplay = eachBatch.Batch + "-" + eachBatch.TransRefNo
			} else {
				eachBatchDisplay = eachBatch.Batch;
			}

			return eachBatchDisplay;
		},
		addBlankInvoiceItemToTable: function (aItems) {

			var itemToCreate = 1;
			var temoCount = 0;
			var countOfM = 0;
			var itemNo = 0;
			// if (oItems.length) {
			// 	oItems = oItems.filter(function (eachInv) {
			// 		if (eachInv.ISFreeGoodsItem !== "X") {
			// 			countOfM = temoCount + 1;
			// 			itemNo = countOfM * 10;
			// 			itemNo = ("0000" + itemNo).slice(-6);
			// 			temoCount++;
			// 			eachInv.ItemNo = itemNo;
			// 		}
			// 		return true;
			// 	});
			// }
			if (aItems.length < 5) {
				itemToCreate = 5 - aItems.length;
			}
			// if(oItems === undefined)
			// {
			// 	oItems= [];
			// 	oItems.length= 0;
			// 	itemToCreate= 5 - oItems.length;
			// }
			countOfM = 0;
			itemNo = 0;
			// for (var h = oItems.length; h < 5; h++) {
			var length = aItems.length;
			for (var h = 0; h < itemToCreate; h++) {

				aItems.push({

					MaterialTokens: [],

					MaterialNo: "",
					MaterialDesc: "",
					MaterialDocGUID: "",
					MaterialDocQty: "",
					StockGUID: "",
					Remarks: "",
					Currency: "",
					Price: "",
					MRP: "",
					UOM: "",
					Batch: "",
					ExpiryDate: null,
					ItemNo: "",
					DMSDivisionID: "",
					DMSDivisionDesc: "",
					MFD: ""
				});
			}

			//	var inoviceItemLength = aItems.length;
			// if (inoviceItemLength > 5) {
			// 	inoviceItemLength = 5;
			// }
			this.getView().getModel("ListItems").setProperty("/", aItems);
			this.getView().getModel("LocalViewSetting").setProperty("/ListItemsCount", aItems.length);
			this.setItemNo(aItems);
		},
		MatF4Filter: function () {
			var that = this;
			this.validateMandatory();
			if (oPPCCommon.doErrMessageExist()) {
				var fDMSDivision = oPPCCommon.getKeysFromMultiCombo(this.getView(), "inputDMSDivision");
				this.aKeys = ["MaterialNo", "MaterialDesc"];
				this.MaterialInput = that.getView().byId("inputMaterial1");
				this.cpStockF4({
					oController: this,
					oi18n: oi18n,
					oUtilsI18n: oUtilsI18n,
					bMultiSelect: false,
					sCustomer: that.getSelectedCustomerCode(),
					sCPTypeID: "01",
					dmsDivision: fDMSDivision,
					sCPGUID: that.getView().getModel("MaterialDocs").getData().FromGUID

				}, function (tokens) {
					that.getView().byId("inputMaterial1").removeAllTokens();
					var tokenTextLength = 10;
					var jData = tokens[0].getCustomData()[0].getValue();
					var bValidMaterial = true;
					//	that.validateMaterial(jData, oEvent.getSource(), itemIndex);
					if (bValidMaterial) {

						var Text1 = tokens[0].mProperties.key;
						var Text = tokens[0].mProperties.text;
						tokens[0].mProperties.text = that.TextAbstract(Text, Text1, tokenTextLength);
						that.MaterialInput.addToken(tokens[0]);
						that.setSelectedMaterialToTable1(jData);
					} else {
						// that.MaterialTokenInput.setValue(tokens[0].getCustomData()[0].getValue().MaterialNo);
						that.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
							.getData()
							.length);
						oPPCCommon.showMessagePopover(gList);
					}

				});
			} else {
				oPPCCommon.displayMsg_MsgBox(this.getView(), oPPCCommon.getMsgsFromMsgMgr(), "error");
			}
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
		setSelectedMaterialToTable: function (jData, oBindingContext, aItems, itemIndex) {
			var that = this;
			//get cpstockitemsno for mfd,batch and primary trade discount
			var aBatchDD = [];
			// this.callCPStockItemsForSNOs({
			// CPStockItemGUID: jData.CPStockItemGUID,
			// callBack: function(mParameter) {
			var Batch = "",
				MFD = null,
				sExpiryDate = null;
			// if (jData.CPStockItemSnos) {
			// 	if (jData.CPStockItemSnos) {
			if (jData.CPStockItemSnos.results) {
				if (jData.CPStockItemSnos.results.length > 0) {
					if (jData.CPStockItemSnos.results.length === 1) {
						Batch = jData.CPStockItemSnos.results[0].Batch;
						MFD = jData.CPStockItemSnos.results[0].ManufacturingDate;
						sExpiryDate = jData.CPStockItemSnos.results[0].ExpiryDate;
					}
					aBatchDD = jData.CPStockItemSnos.results;
					var aNewBatchDD = [];
					for (var i = 0; i < aBatchDD.length; i++) {
						if (aBatchDD[i].Batch !== "") {
							aBatchDD[i].seperator = " - ";
							aNewBatchDD.push(aBatchDD[i]);
						}
					}
					if (aNewBatchDD.length > 0) {
						aNewBatchDD.unshift({
							Batch: "(Select)"
						});
					}
					var oItemSerialNoModel = new sap.ui.model.json.JSONModel();
					oItemSerialNoModel.setData(aNewBatchDD);
					var oBatch = gList.byId("UIListTable").getRows()[itemIndex].getAggregation("cells")[2];
					//make batch dd empty
					if (oBatch.getModel("BatchDD")) {
						oBatch.getModel("BatchDD").setProperty("/", aNewBatchDD);
						that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/TempBatches", aNewBatchDD);
					} else {
						that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/TempBatches", aNewBatchDD);
						oBatch.setModel(oItemSerialNoModel, "BatchDD");
					}
				}
			}
			aItems[itemIndex].MaterialNo = jData.MaterialNo;
			aItems[itemIndex].MaterialDesc = jData.MaterialDesc;
			aItems[itemIndex].UOM = jData.UOM;
			aItems[itemIndex].Currency = jData.Currency;

			aItems[itemIndex].materialEdit = false;
			var MaterialTokens = [{
				Material: jData.MaterialNo,
				MaterialDesc: that.TextAbstract(jData.MaterialDesc, jData.MaterialNo, 15)
			}];

			that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/MaterialTokens", MaterialTokens);
			// aItems[itemIndex].StockRefGUID = jData.CPSnoGUID;
			gList.getModel("ListItems").setProperty("/", aItems);
			if (aBatchDD.length > 0) {
				//	that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/StockRefGuid ", aBatchDD[0].CPSnoGUID);
			}
			this.checkForNewLineItem();
			if (this.setSelectedMaterialToTable_Exit) {
				this.setSelectedMaterialToTable_Exit(jData, oBindingContext, aItems, itemIndex);
			}
		},
		handleMaterialTokenRemoveToolbar: function (oEvent) {
			var type = oEvent.getParameter("type");
			if (type === "removed") {
				this.getView().getModel("LocalViewSetting").setProperty("/UMODD", []);
				if (this.getView().getModel("LocalViewSetting")) {
					this.getView().getModel("LocalViewSetting").setProperty("/MaterialTokens", []);
					this.getView().getModel("LocalViewSetting").setProperty("/Batch", "");
					this.getView().getModel("LocalViewSetting").setProperty("/ReasonID", "");
					this.getView().getModel("LocalViewSetting").setProperty("/Quantity", "");
				}
				if (this.getView().getModel("ToolBarBatchDD")) {
					this.getView().getModel("ToolBarBatchDD").setProperty("/", []);
				}
				if (this.getView().byId("sFAdjQty")) {
					this.getView().byId("sFAdjQty").setValue("");
				}
				if (this.getView().byId("sFReasonIDEdit")) {
					this.getView().byId("sFReasonIDEdit").setSelectedKey("");
				}
				if (this.getView().byId("sUIFromBatchDD")) {
					this.getView().byId("sUIFromBatchDD").setSelectedKey("");
				}
			}
		},
		setSelectedMaterialToTable1: function (jData) {
			var that = this;
			//get cpstockitemsno for mfd,batch and primary trade discount
			// that.getView().getModel("ListItems").setProperty("/",{});
			// var SOCreateItem = this.getView().getModel("ListItems");
			// var aItems = SOCreateItem.getProperty('/');
			var aItems = [];
			var aBatchDD = [];
			// this.callCPStockItemsForSNOs({
			// CPStockItemGUID: jData.CPStockItemGUID,
			// callBack: function(mParameter) {
			var Batch = "",
				MFD = null,
				sExpiryDate = null;
			// if (jData.CPStockItemSnos) {
			// 	if (jData.CPStockItemSnos) {
			if (jData.CPStockItemSnos.results) {
				if (jData.CPStockItemSnos.results.length > 0) {
					if (jData.CPStockItemSnos.results.length === 1) {
						Batch = jData.CPStockItemSnos.results[0].Batch;
						MFD = jData.CPStockItemSnos.results[0].ManufacturingDate;
						sExpiryDate = jData.CPStockItemSnos.results[0].ExpiryDate;
					}
					aBatchDD = jData.CPStockItemSnos.results;
					var aNewBatchDD = [];
					for (var i = 0; i < aBatchDD.length; i++) {
						if (aBatchDD[i].Batch !== "") {
							// aBatchDD[i].seperator = " - ";
							aNewBatchDD.push(aBatchDD[i]);
						}
					}
					var count = 0;
					for (var j = 0; j < aNewBatchDD.length; j++) {
						count = count + 10;
						var ItemNo = count;
						aItems.push({
							ItemNo: ItemNo,
							Batch: aNewBatchDD[j].Batch,
							MaterialNo: jData.MaterialNo,
							MaterialDesc: jData.MaterialDesc,
							UOM: jData.UOM,
							Currency: jData.Currency,
							OrderMaterialGroupID: jData.OrderMaterialGroupID,
							OrderMaterialGroupDesc: jData.OrderMaterialGroupDesc,
							DMSDivision: jData.DMSDivision,
							DmsDivisionDesc: jData.DmsDivisionDesc,
							ManufacturingDate: aNewBatchDD[j].ManufacturingDate,
							ExpiryDate: aNewBatchDD[j].ExpiryDate,
							MRP: aNewBatchDD[j].MRP,
							// aItems[i].UnitPrice = aBatch[j].UnitPrice;
							Quantity: aNewBatchDD[j].Quantity,
							StockRefGUID: aNewBatchDD[j].CPSnoGUID
								// enableLineItem: false

						});
						that.getView().getModel("ListItems").setProperty("/" + j + "/DiffQty", aNewBatchDD[j].Quantity);
						that.getView().getModel("ListItems").setProperty("/" + j + "/StockRefGuid ", aNewBatchDD[j].CPSnoGUID);
					}

					gList.getModel("ListItems").setProperty("/", aItems);
					that.getView().getModel("LocalViewSetting").setProperty("/ListItemsCount", aItems.length);
					//make batch dd empty

				}
			}
			// aItems[itemIndex].MaterialNo = jData.MaterialNo;
			// aItems[itemIndex].MaterialDesc = jData.MaterialDesc;
			// aItems[itemIndex].UOM = jData.UOM;
			// aItems[itemIndex].Currency = jData.Currency;
			// gList.getModel("ListItems").setProperty("/", aItems);

			// this.checkForNewLineItem();
			// if (this.setSelectedMaterialToTable_Exit) {
			// 	this.setSelectedMaterialToTable_Exit(jData, oBindingContext, aItems, itemIndex);
			// }
		},
		checkForNewLineItem: function () {
			var data = this.getView().getModel("ListItems").getData();
			var totMatLength = 0;
			for (var i = 0; i < data.length; i++) {
				if (data[i].MaterialNo !== "") {
					totMatLength = totMatLength + 1;
				}
			}
			if (totMatLength === data.length) {
				this.addExistingItem();
			}
		},
		tokenRemoved: function (oEvent) {
			var path = oEvent.getSource().getBindingContext("ListItems").getPath().split("/")[1];
			if (oEvent.getParameter("type") === "removed") {
				var rows = this.getView().byId("UIListTable").getRows();
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/MaterialNo", "");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/MaterialDesc", "");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/Batch", "");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/Quantity", "0");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/ManufacturingDate", null);
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/ExpiryDate", null);
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/MRP", "0.00");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/UOM", "");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/UOMs", []);
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/Currency", "");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/TrnsfdQty", "0");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/OrderMaterialGroupID", "");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/DMSDivision", "");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/OrderMaterialGroupDesc", "");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/DmsDivisionDesc", "");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/AdjQty", "0");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/DiffQty", "0");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/GQuantity", "0");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/SQuantity", "0.00");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/DQuantity", "0.00");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/PurchasePrice", "0.00");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/DQuantity", "0.00");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/ReasonID", "");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/RefDocNo", "");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/RefDocItemNo", "");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/Remarks", "");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/TempBatches", []);
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/BatchSuggestorModel", []);
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/BatchTokens", []);
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/MaterialTokens", []);

				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/Batch", "");
				var cells = rows[path].getCells();
				// for (var j = 0; j < cells.length; j++) {
				// 	if (cells[j].getId().indexOf("inputMaterial") !== -1) {
				// 		var matCellId = cells[j].getId();
				// 		this.getView().byId(matCellId).removeAllTokens();
				// 	}

				// }
			}

		},
		tokenRemovedOth: function (oEvent) {
			var path = oEvent.getSource().getBindingContext("ListItems").getPath().split("/")[1];
			if (oEvent.getParameter("type") === "removed") {
				gList.getModel("LocalViewSetting").setProperty("/CalculateButton", true);
				gList.getModel("LocalViewSetting").setProperty("/CalculateButtonEnable", true);
				gList.getModel("LocalViewSetting").setProperty("/ReviewButtonEnable", false);
				var rows = this.getView().byId("UIListTable").getRows();
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/MaterialNo", "");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/MaterialDesc", "");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/Batch", "");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/Quantity", "0");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/ManufacturingDate", null);
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/ExpiryDate", null);
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/MRP", "0.00");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/UOM", "");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/UOMs", []);
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/Currency", "");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/TrnsfdQty", "0");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/OrderMaterialGroupID", "");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/DMSDivision", "");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/OrderMaterialGroupDesc", "");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/DmsDivisionDesc", "");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/AdjQty", "0");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/DiffQty", "0");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/GQuantity", "0");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/SQuantity", "0.00");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/DQuantity", "0.00");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/PurchasePrice", "0.00");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/DQuantity", "0.00");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/ReasonID", "");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/RefDocNo", "");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/RefDocItemNo", "");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/Remarks", "");
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/TempBatches", []);
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/BatchSuggestorModel", []);
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/BatchTokens", []);
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/MaterialTokens", []);

				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/Batch", "");
				var cells = rows[path].getCells();
				// for (var j = 0; j < cells.length; j++) {
				// 	if (cells[j].getId().indexOf("inputMaterial") !== -1) {
				// 		var matCellId = cells[j].getId();
				// 		this.getView().byId(matCellId).removeAllTokens();
				// 	}

				// }
			}

		},
		tokenRemovedFilter: function (oEvent) {
			if (oEvent.getParameter("type") === "removed") {

				gList.getModel("ListItems").setProperty("/", []);
				gList.getModel("LocalViewSetting").setProperty("/ListItemsCount", 1);
			}
		},
		onBatchChange: function (oEvent) {
			var that = this;
			oPPCCommon.hideMessagePopover(gList);
			oPPCCommon.removeAllMsgs();
			var oBindingContext = oEvent.getSource().getBindingContext("ListItems");

			//	var isValid = that.validateBatches(oEvent);
			if (oEvent.getSource().getSelectedKey() !== "(Select)") {
				var batchId = "";
				var sBatchQty = oEvent.getSource().getSelectedItem().getText().trim();
				var invoice = oEvent.getSource().getSelectedItem().getAdditionalText();
				sBatchQty = sBatchQty.split(" ")[0].trim();
				//	var aBatch = oEvent.getSource().getModel("BatchDD").getData();

				var selectedBatch = oEvent.getParameter("selectedItem");
				var selectedBatchContext = selectedBatch.getBindingContext("ListItems");
				var sPath = selectedBatchContext.getPath();
				var selectedBatchObject = selectedBatchContext.getObject();
				var invoiceItemContext = oEvent.getSource().getBindingContext("ListItems");
				var invoiceItemObject = invoiceItemContext.getObject();
				var invoiceItemPath = invoiceItemContext.getPath();
				// var InvoiceNo = oEvent.getSource().getSelectedItem().getAdditionalText();
				var ListItems = this.getView().getModel("ListItems");
				var aItems = ListItems.getProperty('/');
				var exists = false;

				this.validateBatches(selectedBatchObject, invoiceItemPath, oEvent);
				if (oPPCCommon.doErrMessageExist()) {
					this.getView().getModel("ListItems").setProperty(invoiceItemPath + "/MRP", selectedBatchObject.MRP);
					this.getView().getModel("ListItems").setProperty(invoiceItemPath + "/ManufacturingDate", selectedBatchObject.ManufacturingDate);
					this.getView().getModel("ListItems").setProperty(invoiceItemPath + "/ExpiryDate", selectedBatchObject.ExpiryDate);
					this.getView().getModel("ListItems").setProperty(invoiceItemPath + "/PrimaryTradeDis", selectedBatchObject.PriDiscountPer);
					this.getView().getModel("ListItems").setProperty(invoiceItemPath + "/UnitPrice", selectedBatchObject.UnitPrice);
					this.getView().getModel("ListItems").setProperty(invoiceItemPath + "/Quantity", selectedBatchObject.Quantity);
					this.getView().getModel("ListItems").setProperty(invoiceItemPath + "/StockRefGUID", selectedBatchObject.CPSnoGUID);
					this.getView().getModel("ListItems").setProperty(invoiceItemPath + "/Batch", selectedBatchObject.Batch);
					var AdjQty = this.getView().getModel("ListItems").getProperty(invoiceItemPath + "/AdjQty");
					if (AdjQty && selectedBatchObject.Quantity) {
						var DiffQty = parseFloat(selectedBatchObject.Quantity) - parseFloat(AdjQty);
						DiffQty = parseFloat(DiffQty).toFixed(2);
						this.getView().getModel("ListItems").setProperty(invoiceItemPath + "/DiffQty", DiffQty);
					}
				} else {
					oEvent.getSource().setSelectedKey("(Select)");
					//	oEvent.getSource().setValueState("Error");
					// var msg = "Batch already exists";
					// oPPCCommon.addMsg_MsgMgr(msg, "error", "Material");
					oPPCCommon.showMessagePopover(gList);
				}
				// for (var i = 0; i < aItems.length; i++) {
				// 	var cells = this.getView().byId("UIListTable").getRows()[i].getCells();
				// 	for (var j = 0; j < cells.length; j++) {
				// 		if (cells[j].getId().indexOf("UIFromBatchDD") !== -1) {
				// 			batchId = cells[j].getId();
				// 		}

				// 	}
				// 	if (this.getView().byId(batchId).getSelectedItem()) {
				// 		if (i !== index && this.getView().byId(batchId).getSelectedItem().getAdditionalText() === oEvent.getParameter("selectedItem").getAdditionalText() &&
				// 			aItems[i].MaterialNo ===
				// 			aItems[index].MaterialNo && this.getView().byId(batchId).getSelectedItem().getText() === oEvent.getParameter("selectedItem").getText()
				// 		) {
				// 			exists = true;
				// 		}
				// 	}

				// }
				// if (!exists) {
				// 	for (var i = 0; i < aItems.length; i++) {

				// 		if (index === i) {
				// 			aItems[i].sBatchQty = sBatchQty;
				// 			for (var j = 0; j < aBatch.length; j++) {
				// 				if (aItems[i].Batch === aBatch[j].Batch && aBatch[j].TransRefNo === invoice) {
				// 					aItems[i].ManufacturingDate = aBatch[j].ManufacturingDate;
				// 					aItems[i].ExpiryDate = aBatch[j].ExpiryDate;
				// 					aItems[i].MRP = aBatch[j].MRP;
				// 					aItems[i].StockRefGUID = aBatch[j].CPSnoGUID;
				// 					// aItems[i].UnitPrice = aBatch[j].UnitPrice;
				// 					aItems[i].Quantity = aBatch[j].Quantity;
				// 					that.getView().getModel("ListItems").setProperty("/" + index + "/DiffQty", aBatch[j].Quantity);
				// 					that.getView().getModel("ListItems").setProperty("/" + index + "/StockRefGuid ", aBatch[j].CPSnoGUID);
				// 					break;
				// 				}
				// 			}
				// 			this.getView().getModel("ListItems").setProperty("/", aItems);
				// 		}
				// 	}
				// } else {
				// 	oEvent.getSource().setSelectedKey("(Select)");
				// 	//	oEvent.getSource().setValueState("Error");
				// 	var msg = "Batch already exists";
				// 	oPPCCommon.addMsg_MsgMgr(msg, "error", "Material");
				// 	oPPCCommon.showMessagePopover(gList);
				// }
			}
		},
		validateBatches: function (selectedBatchObject, path) {
			var oItemModel = this.getView().getModel("ListItems").getProperty("/");
			var sIndex = parseInt(path.substring(path.lastIndexOf("/") + 1));
			var MaterialNo = selectedBatchObject.MaterialNo;
			var CPSnoGUID = selectedBatchObject.CPSnoGUID;
			var Batch = selectedBatchObject.Batch;
			var invoice = selectedBatchObject.TransRefNo;
			oPPCCommon.removeAllMsgs();
			var selectedStockType = this.getView().byId("StockTypes").getSelectedKey();
			if (selectedStockType === "1") {
				for (var k = 0; k < oItemModel.length; k++) {
					if (sIndex !== k) {
						if (MaterialNo === oItemModel[k].MaterialNo) {
							if (Batch === oItemModel[k].Batch) {
								var msg1 = oi18n.getText("SSInvoiceCreate.Message.BatchRepeat", oItemModel[sIndex].ItemNo);
								oPPCCommon.addMsg_MsgMgr(msg1, "error", "/UI/Batch-" + sIndex);
								break;
							}
						}
					}
				}
			} else {
				for (var k = 0; k < oItemModel.length; k++) {
					if (sIndex !== k) {
						if (MaterialNo === oItemModel[k].MaterialNo) {
							if (Batch === oItemModel[k].Batch && oItemModel[k].StockRefGUID === CPSnoGUID) {
								var msg1 = oi18n.getText("SSInvoiceCreate.Message.BatchRepeat", oItemModel[sIndex].ItemNo);
								oPPCCommon.addMsg_MsgMgr(msg1, "error", "/UI/Batch-" + sIndex);
								break;
							}
						}
					}
				}
			}
		},
		callCPStockItemsForSNOs: function (mParameter) {
			// var that = this;
			var SOItemsListModel = gList.getModel("SSGW_MM");
			SOItemsListModel.setHeaders({
				"x-arteria-loginid": oProductCommon.getCurrentUsers("CPStockItemSnos", "read")
			});
			SOItemsListModel.read("/CPStockItemDetails(guid'" + mParameter.CPStockItemGUID + "')", {
				urlParameters: {
					"$expand": "CPStockItemSnos"
				},
				success: function (oData) {
					oData = oPPCCommon.formatItemsOData({
						oData: oData
					});

					mParameter.callBack({
						aData: oData
					});
				},
				error: function (error) {
					//oPPCCommon.dialogErrorMessage(error, oUtilsI18n.getText("common.Dialog.Error.ServiceError.Header"));

					mParameter.callBack({
						aData: null
					});
				}

			});
			if (this.callCPStockItemsForSNOs_Exit) {
				this.callCPStockItemsForSNOs_Exit();
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
			busyDialog.open();
			var that = this;
			var json = new sap.ui.model.json.JSONModel([]);
			this.getView().setModel(json, "ListItems");
			// gListPageView.setBusy(true);
			this.setDefaultSettings();
			var oDataModel = this.getView().getModel("PUGW");
			oProductCommon.setODataModel(oDataModel);
			oProductCommon.getCustomerInputType(function (customerInputType) {
				// customerInputType = "VH"
				that.sCustomerInputType = customerInputType;
				that.getView().getModel("LocalViewSetting").setProperty("/sCustomerInputType", customerInputType);
				that.getCustomers("", function () {
					gListPageView.setBusy(false);
				});
			});
			// var selectedCustomer = "";
			// var oDataModel = this.getView().getModel("PUGW");
			// oProductCommon.setODataModel(oDataModel);
			// var that = this;
			// this.sCustomerInputType = "DD";
			// var oHistory = sap.ui.core.routing.History.getInstance();
			// this.contextPath = oEvent.getParameter("arguments").contextPath;
			// oPPCCommon.removeAllMsgs();
			// if (oHistory.getDirection() !== "Backwards") {
			// 	this.onReset();
			// 	this.setDefaultSettings();
			// 	// this.getDateDDValues();
			// 	if (oEvent.getParameter("name") === "SearchListPage") {
			// 		this.contextPath = oEvent.getParameter("arguments").contextPath;
			// 		oProductCommon.getCustomerInputType(function(customerInputType) {
			// 			that.sCustomerInputType = customerInputType;
			// 			that.getView().getModel("LocalViewSetting").setProperty("/sCustomerInputType", customerInputType);
			// 			that.getParametersFromContext(that.contextPath);
			// 		});
			// 	} else {
			// 		if (sap.ui.Device.system.phone) {
			// 			this.onSearch();
			// 		} else {

			// 		}
			// 	}
			// } else if (oEvent.getParameter("name") === "ListPage") {
			// 	// this.onReset();
			// 	selectedCustomer = "";
			// 	this.setDefaultSettings();
			// 	oProductCommon.getCustomerInputType(function(customerInputType) {
			// 		that.sCustomerInputType = customerInputType;
			// 		that.getView().getModel("LocalViewSetting").setProperty("/sCustomerInputType", customerInputType);
			// 		that.getCustomers(selectedCustomer, function() {
			// 			gListPageView.setBusy(false);
			// 		});
			// 	});
			// } else {
			// 	gListPageView.setBusy(false);
			// }
		},
		selectCPTypes: function (oEvent) {

			var that = this;
			var key = oEvent.getSource().getSelectedKey();

			this.removeAllTokenforItems();
			if (this.getView().getModel("ListItems")) {
				this.getView().getModel("ListItems").setProperty("/", []);
			}
			this.getView().getModel("LocalViewSetting").setProperty("/ListItemsCount", 1);
			var prdFrValue = this.getView().getModel("LocalViewSetting").getProperty("/ProductFeatureValue");
			if (prdFrValue !== "X") {
				this.setDataModel();
				if (this.getView().getModel("LocalViewSetting")) {
					this.getView().getModel("LocalViewSetting").setProperty("/MaterialTokens", []);
					this.getView().getModel("LocalViewSetting").setProperty("/BatchTokens", []);
					this.getView().getModel("LocalViewSetting").setProperty("/Batch", "");
					this.getView().getModel("LocalViewSetting").setProperty("/ReasonID", "");
					this.getView().getModel("LocalViewSetting").setProperty("/Quantity", "");
				}
				if (this.getView().getModel("ToolBarBatchDD")) {
					this.getView().getModel("ToolBarBatchDD").setProperty("/", []);
				}
				if (this.getView().byId("sFAdjQty")) {
					this.getView().byId("sFAdjQty").setValue("");
				}
				if (this.getView().byId("sFReasonIDEdit")) {
					this.getView().byId("sFReasonIDEdit").setSelectedKey("");
				}
				if (this.getView().byId("sUIFromBatchDD")) {
					this.getView().byId("sUIFromBatchDD").setSelectedKey("");
				}
			}
			// this.getView().byId("PrdFeatureTypes").setSelectedKey("");
			//	this.getView().byId("inputMaterial1").removeAllTokens();
			this.getView().byId("inputSKUGroup").removeAllTokens();
			this.getView().byId("inputDMSDivision").setSelectedKeys();
			// this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT2", false);
			// this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT1", true);
			this.getView().getModel("LocalViewSetting").setProperty("/MaterialVisible", false);
			// this.setDataModel();
			if (key !== "") {
				oEvent.getSource().setValueState("None");
				oEvent.getSource().setValueStateText("");
				that.setMaterialModel();
				that.setSKUGRPModel();
				// that.setSKUGRPModel();
				if (key === "1") {
					this.getView().byId("StockSubType").setVisible(false);
					this.getView().byId("StockSubTypes").setSelectedKey("");
				} else if (key === "2") {
					this.getView().byId("StockSubType").setMandatory(true);
					this.getView().byId("StockSubType").setVisible(true);
				} else {
					this.getView().byId("StockSubType").setMandatory(false);
					this.getView().byId("StockSubType").setVisible(false);
				}
			} else {
				this.getView().byId("StockSubType").setMandatory(false);
				this.getView().byId("StockSubType").setVisible(false);

				if (this.getView().getModel("MatSuggestorModel")) {
					this.getView().getModel("MatSuggestorModel").setProperty("/", []);
				}

				if (this.getView().getModel("SKUGRPSuggestorModel")) {
					this.getView().getModel("SKUGRPSuggestorModel").setProperty("/", []);
				}
			}
			if (that.getView().byId("SelectGroupIDAW").getSelectedIndex() === 2) {
				gList.getModel("ListItems").setData([]);
			}

		},

		getCurrentServerDate: function (oController, callback) {
			//get odata model object from the ui5 app
			var oModelData = oController._oComponent.getModel("PCGW");
			// var sUrl = oModelData.sServiceUrl;
			// sUrl = sUrl + "/Today";
			// var currentDate = new Date();
			oModelData.read("/Today", {
				dataType: "json",
				success: function (data) {
					if (callback) {
						callback(data.Today.Today);
					}
				},
				error: function (error) {
					if (callback) {
						// callback();

						MessageBox.error(
							"Cannot laod Server Date", {
								styleClass: "sapUiSizeCompact"
							}
						);

					}
				}
			});

			// var oResponse = jQuery.sap.sjax({
			// 	url: sUrl,
			// 	dataType: "json"
			// });
			// try {
			// 	if (oResponse.success) {
			// 		//handle response and retrive the
			// 		var oServerCfg = {};
			// 		oServerCfg = oResponse.data;
			// 		var sJsonDate = oServerCfg.d.Today.Now;
			// 		currentDate = new Date(parseInt(sJsonDate.substr(6)));
			// 		if (callback) {
			// 			callback(currentDate);
			// 		}
			// 	} else {
			// 		currentDate = new Date();
			// 		if (callback) {
			// 			callback(currentDate);
			// 		}
			// 	}
			// } catch (error) {
			// 	//handle error
			// 	currentDate = new Date();
			// 	if (callback) {
			// 		callback(currentDate);
			// 	}
			// }

			//it will return server date
			// return currentDate;
		},
		setHeaderData: function () {
			var that = this;
			var MaterialDocs = new Object();
			MaterialDocs.MaterialDocDate = null;
			var oMatDocModel = new sap.ui.model.json.JSONModel();
			oMatDocModel.setData(MaterialDocs);
			that._oComponent.setModel(oMatDocModel,
				"MaterialDocs");

		},

		onChangeDate: function () {},
		setDmsValidation: function () {
			var msg = oi18n.getText("common.message.pleaseselect", [this.getView().byId("DMSDivision").getLabel()]);
			oPPCCommon.addMsg_MsgMgr(msg, "error", "DMSDivision");
		},
		onReset: function () {
			//Remove Tokens from all MultiInputs 
			var aValueHelpIDs = ["inputCustomerNo", "inputSKUGroup"]; //<ToAdd all ValueHelp IDs with cama seperation>
			this.clearTokens(aValueHelpIDs);
			//Clear Model
			if (gList.getModel("ListItems") !== undefined) {
				gList.getModel("ListItems").setProperty("/", []);
				this.resetUITable();
			}
			if (this.onReset_Exit) {
				this.onReset_Exit();
			}
		},
		ontokenChange: function (oEvent) {
			var that = this;
			if (oEvent.getParameters().type === "removed") {
				if (that.getView().byId("inputCustomerNo").getTokens().length === 0) {
					if (gList.getModel("ListItems") !== undefined) {
						gList.getModel("ListItems").setProperty("/", {});
						that.resetUITable();
						that._oComponent.getModel("LocalViewSetting").setProperty("/ListItemsCount", 1);
					}
				}
			}
		},
		resetUITable: function () {
			oPPCCommon.clearUITable(gList, "UIListTable", "ListItems");
			if (this.resetUITable_Exit) {
				this.resetUITable_Exit();
			}
		},
		clearTokens: function (mParameters) {
			for (var i = 0; i < mParameters.length; i++) {
				gList.byId(mParameters[i]).removeAllTokens();
			}
		},
		setDefaultSettings: function () {
			var oViewSettingModel = new sap.ui.model.json.JSONModel();
			this.viewSettingData = {
				DateFormat: oProductCommon.getDateFormat(),
				PageHeader: oi18n.getText("List.title"),
				TableRowCount: 0,
				messageLength: 0,
				ListItemsCount: 1,
				MaterialItemCount: 0,
				CustomerColumnVisibleInF4: true,
				CustomerDD: false,
				CustomerMC: false,
				CustomerVH: false,
				editMode: true,
				reviewMode: false,
				StockFieldVisibility: true,
				CustomerNo: "",
				CustomerName: "",
				// ToDay: oPPCCommon.getCurrentServerDate(this),
				SAVisible: true,
				addstkVisible: false,
				sCustomerInputType: "",
				createstkButton: true,
				addnewVisible: true,
				Adjvisible: false,
				StockMaterial: true,
				OtherMaterial: false,
				gCPTypeID: "",
				gCPGUID: "",
				Distributor: true,
				MicroDistributor: false,
				tokenTextLength: 10,
				prdFrEnabled: true,
				prdFrMatEnabled: false,
				stockMaterialT1: false,
				stockMaterialT2: true,
				ProductFeatureValue: "",
				MaterialVisible: false,
				CalculateButton: false,
				GUID: oPPCCommon.generateUUID(),
				stockMaterialT3: false,
				AttachmentsVisible: true,
				StockMaterialReview: true
			};
			oViewSettingModel.setData(this.viewSettingData);
			this._oComponent.setModel(oViewSettingModel, "LocalViewSetting");
			this.getView().setModel(oViewSettingModel, "LocalViewSetting");
			if (this.setDefaultSettings_Exit) {
				this.setDefaultSettings_Exit();
			}
		},
		ClearValueState: function (ValueStateArray) {
			var data = gList.getModel("ListItems").getData();
			for (var i = 0; i < gList.getModel("ListItems").getData().length; i++) {
				// if (data[i].GQuantity === "") {
				// 	data[i].GQuantity = "0";
				// }
				// if (data[i].DQuantity === "") {
				// 	data[i].DQuantity = "0";
				// }
				// if (data[i].SQuantity === "") {
				// 	data[i].Suantity = "0";
				// }
				// if (data[i].MRP === "") {
				// 	data[i].MRP = "0.00";
				// }
				// if (data[i].PurchasePrice === "") {
				// 	data[i].PurchasePrice = "0.00";
				// }
				for (var j = 0; j < ValueStateArray.length; j++) {
					gList.getModel("ListItems").setProperty("/" + i + "/" + ValueStateArray[j], "None");
				}
			}
		},

		onChangeGQty: function (oEvent) {
			// com.arteriatech.ppc.utils.js.Common.formatNumber(oEvent);
			var that = this;
			this.ClearValueState(["MRPValueState"]);
			oPPCCommon.removeAllMsgs();
			oPPCCommon.hideMessagePopover(gList);
			gList.getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel().getData()
				.length);
			var oBindingContext = oEvent.getSource().getBindingContext("ListItems");
			var qtyLbl = this.getView().byId("id_Qty").getText();
			var ItemNo = oBindingContext.getProperty("ItemNo");
			var value = oEvent.getSource().getValue();
			var reg = /[ !@#$%^&*()_+\-=\[\]{};':.`~"\\|,<>\/a-z A-Z?]/;
			if (reg.test(value)) {
				oEvent.getSource().setValue("0");
				var msg = oi18n.getText("ROCreate.message.ValidQty", [qtyLbl, ItemNo]);
				oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/Quantity-");
				if (oPPCCommon.doErrMessageExist()) {
					oEvent.getSource().setValueState(null);
					oEvent.getSource().setValueStateText("");
					this.ClearValueState(["QuantityValueState"])
					gList.getModel("LocalViewSetting").setProperty("/CalculateButton", true);
					gList.getModel("LocalViewSetting").setProperty("/CalculateButtonEnable", false);
					gList.getModel("LocalViewSetting").setProperty("/ReviewButtonEnable", false);
				} else {
					that.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
						.getData()
						.length);
					oPPCCommon.showMessagePopover(gList);
				}
			}
			// this.ClearValueState(["QuantityValueState"]);
		},
		onChangeMRP: function (oEvent) {
			com.arteriatech.ppc.utils.js.Common.formatNumber(oEvent);
			this.ClearValueState(["MRPValueState"]);
		},
		onChangePurchasePrice: function (oEvent) {
			com.arteriatech.ppc.utils.js.Common.formatNumber(oEvent);
			this.ClearValueState(["UnitPriceValueState"]);
		},
		onChangeBatch: function () {
			var isValid;
			gList.getModel("LocalViewSetting").setProperty("/CalculateButton", true);
			gList.getModel("LocalViewSetting").setProperty("/CalculateButtonEnable", false);
			gList.getModel("LocalViewSetting").setProperty("/ReviewButtonEnable", false);
			isValid = this.validateOtherItems();
			if (isValid) {
				this.getView().getModel("LocalViewSetting").setProperty("/CalculateButtonEnable", true);
				oPPCCommon.hideMessagePopover(gList);
				gList.getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel().getData()
					.length);
			} else {
				oPPCCommon.hideMessagePopover(gList);
				gList.getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel().getData()
					.length);
				gList.getModel("LocalViewSetting").setProperty("/messageLength", 0);
				this.getView().getModel("LocalViewSetting").setProperty("/CalculateButtonEnable", false);
				if (sap.ui.getCore().getMessageManager().getMessageModel().getData().length > 0) {
					// oPPCCommon.showMessagePopover(gObjectPageLayout);
				}
			}
		},
		onChangeGoodQty: function () {
			var isValid;
			gList.getModel("LocalViewSetting").setProperty("/CalculateButton", true);
			gList.getModel("LocalViewSetting").setProperty("/CalculateButtonEnable", false);
			gList.getModel("LocalViewSetting").setProperty("/ReviewButtonEnable", false);
			isValid = this.validateOtherItems();
			if (isValid) {
				this.getView().getModel("LocalViewSetting").setProperty("/CalculateButtonEnable", true);
				oPPCCommon.hideMessagePopover(gList);
				gList.getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel().getData()
					.length);
			} else {
				oPPCCommon.hideMessagePopover(gList);
				gList.getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel().getData()
					.length);
				gList.getModel("LocalViewSetting").setProperty("/messageLength", 0);
				this.getView().getModel("LocalViewSetting").setProperty("/CalculateButtonEnable", false);
				if (sap.ui.getCore().getMessageManager().getMessageModel().getData().length > 0) {
					// oPPCCommon.showMessagePopover(gObjectPageLayout);
				}
			}
		},
		onUMOChange: function () {
			var isValid;
			gList.getModel("LocalViewSetting").setProperty("/CalculateButton", true);
			gList.getModel("LocalViewSetting").setProperty("/CalculateButtonEnable", false);
			gList.getModel("LocalViewSetting").setProperty("/ReviewButtonEnable", false);
			isValid = this.validateOtherItems();
			if (isValid) {
				this.getView().getModel("LocalViewSetting").setProperty("/CalculateButtonEnable", true);
				oPPCCommon.hideMessagePopover(gList);
				gList.getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel().getData()
					.length);
			} else {
				oPPCCommon.hideMessagePopover(gList);
				gList.getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel().getData()
					.length);
				gList.getModel("LocalViewSetting").setProperty("/messageLength", 0);
				this.getView().getModel("LocalViewSetting").setProperty("/CalculateButtonEnable", false);
				if (sap.ui.getCore().getMessageManager().getMessageModel().getData().length > 0) {
					// oPPCCommon.showMessagePopover(gObjectPageLayout);
				}
			}
		},
		onChangeRefDocNo: function (oEvent) {
			this.ClearValueState(["RefDocNoValueState"]);
		},
		onChangeRefDocItemNo: function (oEvent) {
			this.ClearValueState(["RefDocItemNoValueState"]);
		},
		setVisibility: function (data, visiblity) {
			for (var i = 0; i < data.length; i++) {
				this.getView().byId(data[i]).setVisible(visiblity);
				// if (visiblity) {
				// 	if (data[i] === "matF4") {
				// 		var selectedKey = this.getView().byId("PrdFeatureTypes").getSelectedKey();
				// 		if (selectedKey === "01") {
				// 			this.getView().byId(data[i]).setVisible(true);
				// 		} else {
				// 			this.getView().byId(data[i]).setVisible(false);
				// 		}
				// 	}
				// }
			}
		},
		// onSelect1: function (oEvent) {
		// 	oPPCCommon.removeAllMsgs();
		// 	var that = this;
		// 	that.CustomerTokenInput.removeAllTokens();
		// 	// this.getView().byId("StockSubTypes").setSelectedKey("");
		// 	this.getView().byId("StockTypes").setSelectedKey("");
		// 	gList.getModel("LocalViewSetting").setProperty("/MaterialVisible", false);
		// 	this.getView().byId("StockSubType").setVisible(false);
		// 	// this.getView().byId("PrdFeatureTypes").setSelectedKey("");
		// 	this.getView().byId("inputSKUGroup").removeAllTokens();
		// 	this.getView().byId("inputMaterial1").removeAllTokens();
		// 	//	this.getView().byId("inputDMSDivision").setSelectedKeys("");
		// 	this.getView().byId("inputsDMSDivision").setSelectedKeys("");
		// 	// this.getView().byId("customer").setSelectedKey();
		// 	// this.getView().byId("inputMaterial").removeAllTokens();
		// 	// this.getView().byId("inputOtherMaterial").removeAllTokens();
		// 	gList.getModel("LocalViewSetting").setProperty("/messageLength", 0);
		// 	this.resetOtherMaterialTable();
		// 	if (this.getView().byId("SelectGroupIDAW").getSelectedIndex() === 1) {
		// 		gList.getModel("LocalViewSetting").setProperty("/CalculateButton", true);
		// 		gList.getModel("LocalViewSetting").setProperty("/CalculateButtonEnable", false);
		// 		gList.getModel("LocalViewSetting").setProperty("/ReviewButtonEnable", false);
		// 		var data = ["StockType", "SKUGroup"];
		// 		// this.getView().getModel("ListItems").setProperty("/", []);
		// 		this.removeAllTokenforItems();
		// 		this.removeAllTokenforItemsRadio();
		// 		if (this.getView().getModel("ListItems")) {
		// 			this.getView().getModel("ListItems").setProperty("/", []);
		// 		}
		// 		if (this.getView().getModel("OtherMatSuggestorModel")) {
		// 			this.getView().getModel("OtherMatSuggestorModel").setProperty("/", []);
		// 		}
		// 		if (this.getView().getModel("MatSuggestorModel")) {
		// 			this.getView().getModel("MatSuggestorModel").setProperty("/", []);
		// 		}

		// 		this.setVisibility(data, false);
		// 		this.setDataModel();
		// 		this.getView().getModel("LocalViewSetting").setProperty("/prdFrMatEnabled", false);
		// 		this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT2", false);
		// 		this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT1", false);
		// 		// this.setDataOtherModel();
		// 		this.setOtherMaterialSuggestion();
		// 	} else if (this.getView().byId("SelectGroupIDAW").getSelectedIndex() === 2) {

		// 		// gList.getModel("LocalViewSetting").setProperty("/CalculateButton", true);
		// 		// gList.getModel("LocalViewSetting").setProperty("/CalculateButtonEnable", false);
		// 		// gList.getModel("LocalViewSetting").setProperty("/ReviewButtonEnable", false);
		// 		gList.getModel("LocalViewSetting").setProperty("/StockMaterialUpload", true);
		// 		var data = ["SKUGroup"];
		// 		// this.getView().getModel("ListItems").setProperty("/", []);
		// 		// gList.getModel("ListItems").getData()
		// 		// this.getView().getModel("ListItems").setProperty("/", []);

		// 		this.removeAllTokenforItems();
		// 		this.removeAllTokenforItemsRadio();
		// 		if (this.getView().getModel("ListItems")) {
		// 			this.getView().getModel("ListItems").setProperty("/", []);
		// 		}
		// 		if (this.getView().getModel("OtherMatSuggestorModel")) {
		// 			this.getView().getModel("OtherMatSuggestorModel").setProperty("/", []);
		// 		}
		// 		if (this.getView().getModel("MatSuggestorModel")) {
		// 			this.getView().getModel("MatSuggestorModel").setProperty("/", []);
		// 		}

		// 		this.setVisibility(data, false);
		// 		this.setDataModel();
		// 		this.getView().getModel("LocalViewSetting").setProperty("/prdFrMatEnabled", false);
		// 		this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT2", false);
		// 		this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT1", false);
		// 		// this.setDataOtherModel();
		// 		this.setOtherMaterialSuggestion();

		// 		this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT3", true);
		// 		this.getView().getModel("LocalViewSetting").setProperty("/AttachmentsVisible", false);
		// 		this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT2", false);
		// 		this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT1", false);
		// 		// gList.getModel("MatDocItems").setData([]);
		// 		this.getView().getModel("LocalViewSetting").setProperty("/Uploadatacount", 0);
		// 		if (gList.getModel("MaterialDocs").getData().FromGUID) {
		// 			that.setBatchForExcelUpload();
		// 		}
		// 	} else {
		// 		gList.getModel("LocalViewSetting").setProperty("/CalculateButton", false);
		// 		gList.getModel("LocalViewSetting").setProperty("/CalculateButtonEnable", false);
		// 		gList.getModel("LocalViewSetting").setProperty("/ReviewButtonEnable", true);
		// 		if (this.getView().getModel("ListItems")) {
		// 			this.getView().getModel("ListItems").setProperty("/", []);
		// 		}
		// 		this.getView().getModel("LocalViewSetting").setProperty("/ListItemsCount", 1);
		// 		var prdFrValue = this.getView().getModel("LocalViewSetting").getProperty("/ProductFeatureValue");
		// 		if (prdFrValue !== "X") {
		// 			this.setDataModel();
		// 			var data = ["StockType"];
		// 			this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT1", true);
		// 			this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT2", false);
		// 			this.getView().getModel("LocalViewSetting").setProperty("/prdFrMatEnabled", false);
		// 			this.setVisibility(data, true);
		// 		} else {
		// 			var data = ["StockType", "SKUGroup"];
		// 			this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT2", true);
		// 			this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT1", false);
		// 			this.getView().getModel("LocalViewSetting").setProperty("/prdFrMatEnabled", true);
		// 			this.setVisibility(data, true);
		// 		}
		// 		this.getView().getModel("LocalViewSetting").setProperty("/AttachmentsVisible", true);
		// 		this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT3", false);
		// 		// this.setDataModel();
		// 		// this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT2", false);
		// 		// this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT1", true);

		// 	}
		// },

		onSelect1: function (oEvent) {
			oPPCCommon.removeAllMsgs();
			var that = this;
			// that.CustomerTokenInput.removeAllTokens();
			// this.getView().byId("StockSubTypes").setSelectedKey("");
			this.getView().byId("StockTypes").setSelectedKey("");
			gList.getModel("LocalViewSetting").setProperty("/MaterialVisible", false);

			this.getView().byId("StockSubType").setVisible(false);
			// this.getView().byId("PrdFeatureTypes").setSelectedKey("");
			this.getView().byId("inputSKUGroup").removeAllTokens();
			this.getView().byId("inputMaterial1").removeAllTokens();
			//	this.getView().byId("inputDMSDivision").setSelectedKeys("");
			this.getView().byId("inputsDMSDivision").setSelectedKeys("");

			// this.getView().byId("customer").setSelectedKey();

			// this.getView().byId("inputMaterial").removeAllTokens();
			// this.getView().byId("inputOtherMaterial").removeAllTokens();
			gList.getModel("LocalViewSetting").setProperty("/messageLength", 0);
			this.resetOtherMaterialTable();
			if (this.getView().byId("SelectGroupIDAW").getSelectedIndex() === 1) {
				gList.getModel("LocalViewSetting").setProperty("/CalculateButton", true);
				gList.getModel("LocalViewSetting").setProperty("/CalculateButtonEnable", false);
				gList.getModel("LocalViewSetting").setProperty("/ReviewButtonEnable", false);
				var data = ["StockType", "SKUGroup"];
				// this.getView().getModel("ListItems").setProperty("/", []);
				this.removeAllTokenforItems();
				this.removeAllTokenforItemsRadio();
				if (this.getView().getModel("ListItems")) {
					this.getView().getModel("ListItems").setProperty("/", []);
				}
				if (this.getView().getModel("OtherMatSuggestorModel")) {
					this.getView().getModel("OtherMatSuggestorModel").setProperty("/", []);
				}
				if (this.getView().getModel("MatSuggestorModel")) {
					this.getView().getModel("MatSuggestorModel").setProperty("/", []);
				}

				this.setVisibility(data, false);
				this.setDataModel();
				this.getView().getModel("LocalViewSetting").setProperty("/prdFrMatEnabled", false);
				this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT2", false);
				this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT1", false);
				this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT3", false);
				this.getView().getModel("LocalViewSetting").setProperty("/StockMaterialReview", true);
				// this.setDataOtherModel();
				this.setOtherMaterialSuggestion();
			} else {

				gList.getModel("LocalViewSetting").setProperty("/StockMaterial", true);
				gList.getModel("LocalViewSetting").setProperty("/CalculateButton", false);
				gList.getModel("LocalViewSetting").setProperty("/CalculateButtonEnable", false);
				gList.getModel("LocalViewSetting").setProperty("/ReviewButtonEnable", true);
				if (this.getView().getModel("ListItems")) {
					this.getView().getModel("ListItems").setProperty("/", []);
				}
				this.getView().getModel("LocalViewSetting").setProperty("/ListItemsCount", 1);
				var prdFrValue = this.getView().getModel("LocalViewSetting").getProperty("/ProductFeatureValue");
				if (prdFrValue !== "X") {
					this.setDataModel();
					var data = ["StockType"];
					if (this.getView().byId("SelectGroupIDAW").getSelectedIndex() === 2) {
						this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT1", false);
						this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT3", true);
						this.getView().getModel("LocalViewSetting").setProperty("/Uploadatacount", 0);
						this.getView().getModel("LocalViewSetting").setProperty("/StockMaterialReview", false);
						gList.getModel("ListItems").setData([]);
						gList.byId("fileUploader").setValue("");

					} else {
						this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT1", true);
						this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT3", false);
						this.getView().getModel("LocalViewSetting").setProperty("/StockMaterialReview", true);
					}
					this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT2", false);
					this.getView().getModel("LocalViewSetting").setProperty("/prdFrMatEnabled", false);
					this.setVisibility(data, true);
				} else {
					var data = ["StockType", "SKUGroup"];
					this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT2", true);
					this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT1", false);
					this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT3", false);
					this.getView().getModel("LocalViewSetting").setProperty("/prdFrMatEnabled", true);
					this.getView().getModel("LocalViewSetting").setProperty("/StockMaterialReview", true)
					this.setVisibility(data, true);
				}
				// this.setDataModel();
				// this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT2", false);
				// this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT1", true);
			}

		},
		setOtherMaterialSuggestion: function () {
			var that = this;
			var oMaterialModel = this._oComponent.getModel("SFGW_MST");
			var fDMSDivision = oPPCCommon.getKeysFromMultiCombo(this.getView(), "inputsDMSDivision");
			// oMaterialModel.attachRequestSent(function () {
			// 	busyDialog.open();
			// });
			// oMaterialModel.attachRequestCompleted(function () {
			// 	busyDialog.close();
			// });
			var aMaterialF4Filter = new Array();
			aMaterialF4Filter = oPPCCommon.setODataModelReadFilter("", "", aMaterialF4Filter, "LoginID", "", [
				that.getCurrentUsers("Materials", "read")
			], false, false, false);
			aMaterialF4Filter = oPPCCommon.setODataModelReadFilter("", "", aMaterialF4Filter, "DivisionID", "", fDMSDivision.split(";"), true,
				false, false);
			oMaterialModel.read("/Materials", {
				filters: aMaterialF4Filter,
				// urlParameters: {
				// 	"$select": "MaterialNo,MaterialDesc,BaseUom,MaterialGrp,MaterialGrpDesc,BatchOrSerial,ProdHier,ProdHierDesc,DivisionID"
				// },
				success: function (oData) {
					oData = oPPCCommon.formatItemsOData({
						oData: oData.results
					});
					var ChannelPartnerModel = new sap.ui.model.json.JSONModel();
					ChannelPartnerModel.setData(oData);
					gList.setModel(ChannelPartnerModel, "OtherMatSuggestorModel");
				},
				error: function (error) {
					//alert(error);
				}
			});
		},

		setDataOtherModel: function () {
			var data = [];

			for (var i = 0; i < 5; i++) {

				var obj = {

					MaterialNo: "",
					MaterialDesc: "",
					CPStockItemGUID: oPPCCommon.generateUUID(),
					ExpiryDate: null,
					OrderMaterialGroupID: "",
					OrderMaterialGroupDesc: "",
					ManufacturingDate: null,
					GQuantity: "0",
					DQuantity: "0",
					SQuantity: "0",
					Currency: "",
					UOM: "",
					Batch: "",
					PurchasePrice: "0.00",
					BatchValueState: "None",
					BatchValueStateText: "",
					UOMValueState: "None",
					UOMValueStateText: "",
					MRP: "0.00",
					MRPValueState: "None",
					MRPValueStateText: "",
					UnitPrice: "0.00",
					UnitPriceValueState: "None",
					UnitPriceValueStateText: "",
					InvoiceItemGUID: "",
					QuantityValueState: "None",
					MDateValueState: "None",
					MDateValueStateText: "",
					EDateValueState: "None",
					EDateValueStateText: "",
					Remarks: "",
					RemarksState: "None",
					DeletionInd: "",
					BatchOrSerial: ""
				};
				data.push(obj);
			}
			var json = new sap.ui.model.json.JSONModel(data);
			gList.setModel(json, "ListItems");
			gList.getModel("LocalViewSetting").setProperty("/ListItemsCount", data.length);
		},
		onSelect: function (oEvent) {
			var exists = false;
			for (var i = 0; i < this.getView().getModel("ListItems").getData().length; i++) {
				if (this.getView().getModel("ListItems").getData()[i].Selected === true) {
					exists = true;
					this._oComponent.getModel("LocalViewSetting").setProperty("/addnewVisible", false);
					this._oComponent.getModel("LocalViewSetting").setProperty("/createstkButton", true);
				}
			}
			if (!exists) {
				this._oComponent.getModel("LocalViewSetting").setProperty("/addnewVisible", true);
				this._oComponent.getModel("LocalViewSetting").setProperty("/createstkButton", false);
			}
		},
		setMaterialItemModel: function () {
			var oTRCalbckItemModel = [{
				CallBackItemNo: "",
				TestRequestNo: "",
				TestRequestRevNo: 0,
				NoOfTyres: "",
				PercentWear: "1",
				AnalysisReason: "",
				TargetPlantID: "",
				TargetPlantDesc: "",
				ConcernedPerson: "",
				UOM: ""
			}];

			var oTestreqItemModel = new sap.ui.model.json.JSONModel([]);
			// oTestreqItemModel.setData(oTRCalbckItemModel);
			gListPageView.setModel(oTestreqItemModel, "TestRequestCallBacks");

			// gTRCreateView.setModel(oTRCalbckItemModel, "TestRequestCallBacks");
			if (this.setMaterialItemModel_Exit) {
				this.setMaterialItemModel_Exit();
			}
		},
		onChangeReasonDesc: function (oEvent) {
			if (oEvent.getSource().getSelectedKey() !== "") {
				var path = oEvent.getSource().getBindingContext("ListItems").getPath();
				oEvent.getSource().getBindingContext("ListItems").getModel().setProperty(path + "/ReasonDesc", oEvent.getSource()
					.getSelectedItem().getText().split(" - ")[1].trim());
			}
		},

		// onChangeReasonDesc: function (oEvent) {
		// 	if (oEvent.getSource().getSelectedKey()) {
		// 		this.getView().getModel("ListItems").setProperty("/ReasonID", oEvent.getSource().getSelectedKey());
		// 		this.getView().getModel("ListItems").setProperty("/ReasonDesc", (oEvent.getSource().getSelectedItem().getText().split("-")[1]).trim());
		// 	} else {
		// 		this.getView().getModel("ListItems").setProperty("/ReasonID", "");
		// 		this.getView().getModel("ListItems").setProperty("/ReasonDesc", "");
		// 	}
		// },
		validateNumeric1: function (oEvent) {
			var that = this;
			oPPCCommon.removeAllMsgs();
			oPPCCommon.hideMessagePopover(gList);
			gList.getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel().getData()
				.length);
			var oBindingContext = oEvent.getSource().getBindingContext("ListItems");
			var qtyLbl = this.getView().byId("FAdjQtyEdit").getText();
			var ItemNo = oBindingContext.getProperty("ItemNo");
			var value = oEvent.getSource().getValue();
			var reg = /[ !@#$%^&*()_+\-=\[\]{};':."\\|,<>\/a-z A-Z?]/;
			if (reg.test(value)) {
				oEvent.getSource().setValue("");
				var msg = oi18n.getText("ROCreate.message.ValidQty", [qtyLbl, ItemNo]);
				oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/Quantity-");
				if (oPPCCommon.doErrMessageExist()) {
					oEvent.getSource().setValueState(null);
					oEvent.getSource().setValueStateText("");
				} else {
					that.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
						.getData()
						.length);
					oPPCCommon.showMessagePopover(gList);
				}
			}
		},

		onChangeAdjQty: function (oEvent) {
			com.arteriatech.ppc.utils.js.Common.formatNumber(oEvent);
			oPPCCommon.removeAllMsgs();
			oPPCCommon.hideMessagePopover(gList);
			gList.getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel().getData()
				.length);
			// var aItems = this.getView().getModel("ListItems").getData();
			var that = this;
			var oBindingContext = oEvent.getSource().getBindingContext("ListItems");
			var index = oBindingContext.getPath();
			var Quantity = oBindingContext.getProperty("Quantity") + "";
			var AdjQty = oBindingContext.getProperty("AdjQty") + "";
			var MaterialNo = oBindingContext.getProperty("MaterialNo");
			this.getView().getModel("ListItems").setProperty(index + "/QuantityValueState", "None");
			this.getView().getModel("ListItems").setProperty(index + "/QuantityValueStateText", "");
			var msg = "";
			var DiffQty = "0";
			var isValid = true;

			if (AdjQty === "" || AdjQty === undefined || AdjQty === null || AdjQty === "NaN") {
				isValid = false;
				msg = oi18n.getText("List.Input.Adjqty.AdjQtyEmpty", MaterialNo);
				this.getView().getModel("ListItems").setProperty(index + "/QuantityValueState", "Error");
				this.getView().getModel("ListItems").setProperty(index + "/QuantityValueStateText", msg);
				oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/FAdjQty");
			} else if (AdjQty.indexOf('.') > -1) {
				isValid = false;
				msg = oi18n.getText("List.Input.Adjqty.AdjQtyWithZero", MaterialNo);
				this.getView().getModel("ListItems").setProperty(index + "/QuantityValueState", "Error");
				this.getView().getModel("ListItems").setProperty(index + "/QuantityValueStateText", msg);
				oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/FAdjQty");
			} else if (parseFloat(AdjQty) < 0) {
				isValid = false;
				msg = oi18n.getText("List.Input.Adjqty.AdjQtyWithNegative", MaterialNo);
				this.getView().getModel("ListItems").setProperty(index + "/QuantityValueState", "Error");
				this.getView().getModel("ListItems").setProperty(index + "/QuantityValueStateText", msg);
				oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/FAdjQty");
			} else if (parseFloat(AdjQty) > parseFloat(Quantity)) {
				DiffQty = parseFloat(Quantity) - parseFloat(AdjQty);
				DiffQty = parseFloat(DiffQty).toFixed(2);
				this.getView().getModel("ListItems").setProperty(index + "/DiffQty", DiffQty);
			} else if (parseFloat(AdjQty) < parseFloat(Quantity)) {
				DiffQty = parseFloat(Quantity) - parseFloat(AdjQty);
				DiffQty = parseFloat(DiffQty).toFixed(2);
				this.getView().getModel("ListItems").setProperty(index + "/DiffQty", DiffQty);
			} else if (parseFloat(AdjQty) === parseFloat(Quantity)) {
				msg = oi18n.getText("List.Input.Adjqty.AdjQtyWithZero", MaterialNo);
				DiffQty = parseFloat(Quantity) - parseFloat(AdjQty);
				DiffQty = parseFloat(DiffQty).toFixed(2);
				this.getView().getModel("ListItems").setProperty(index + "/DiffQty", DiffQty);
			}

			if (!isValid) {
				that.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
					.getData()
					.length);
				oPPCCommon.showMessagePopover(gList);
			}

			// com.arteriatech.ppc.utils.js.Common.formatNumber(oEvent);
			// oPPCCommon.removeAllMsgs();
			// var aItems = this.getView().getModel("ListItems").getData();
			// var a = 0;
			// var Quantity;
			// var msg = "";
			// var AdjQty;
			// var DiffQty, ReasonID;
			// var getPath = "";
			// var that = this;
			// for (var i = 0; i < aItems.length; i++) {
			// 	if (aItems[i].AdjQty === undefined) {
			// 		// 
			// 	} else if (aItems[i].AdjQty > aItems[i].Quantity) {
			// 		// book stock means Quantity is larger than AdjQty 
			// 		aItems[i].DiffQty = aItems[i].Quantity - aItems[i].AdjQty;
			// 	} else if (aItems[i].AdjQty < aItems[i].Quantity) {
			// 		// Book stock(Quantity) is greater than physical stock (AdjQty) 
			// 		aItems[i].DiffQty = aItems[i].Quantity - aItems[i].AdjQty;
			// 	} else if (aItems[i].AdjQty === aItems[i].Quantity) {
			// 		msg = oi18n.getText("List.Input.Adjqty.AdjQtyWithZero", aItems[i].ItemNo);
			// 		aItems[i].DiffQty = aItems[i].Quantity - aItems[i].AdjQty;
			// 	}
			// }
		},

		// getDateDDValues: function () {
		// 	var sDateRange = oProductCommon.getProductFeatureValue({
		// 		Types: "DTRNGCHK"
		// 	});
		// 	this.DateDifference = sDateRange;
		// 	this.PreviousSelectedKeyDate = this.DateDifference;
		// 	var oneMonthBackDate = oPPCCommon.getCurrentServerDate(this);
		// 	oneMonthBackDate.setDate(oneMonthBackDate.getDate() + parseInt(this.DateDifference));
		// 	this.Date = {
		// 		FromDate: oneMonthBackDate,
		// 		ToDate: oPPCCommon.getCurrentServerDate(this)
		// 	};
		// 	/*for Date*/
		// 	if (this.getView().getModel("DateViewSetting")) {
		// 		this.getView().getModel("DateViewSetting").setProperty("/", {});
		// 	}
		// 	var oDataDate = [{
		// 		DateKey: "",
		// 		DateDesc: "Any"
		// 	}, {
		// 		DateKey: "0",
		// 		DateDesc: "Today"
		// 	}, {
		// 		DateKey: "-1",
		// 		DateDesc: "Today and Yesterday"
		// 	}, {
		// 		DateKey: "-7",
		// 		DateDesc: "Last Seven Days"
		// 	}, {
		// 		DateKey: "-30",
		// 		DateDesc: "Last One Month"
		// 	}, {
		// 		DateKey: "MS",
		// 		DateDesc: "Manual Selection"
		// 	}];
		// 	oPPCCommon.getDateDropDownValue(oDataDate, this, "inputDate", "DateViewSetting", this.DateDifference);
		// },
		getPrdFeatures: function () {
			var that = this;
			var oModelData = gList.getModel("PCGW");
			var oStatusFilter = new Array();
			oStatusFilter = oPPCCommon.setODataModelReadFilter(gList, "", oStatusFilter, "Typeset", sap.ui.model.FilterOperator.EQ, [
				"SS"
			], false, false, false);
			oStatusFilter = oPPCCommon.setODataModelReadFilter(gList, "", oStatusFilter, "Types", "", ["STADJSELCT"], false, false,
				false);
			that.getDropdown(oModelData, "ConfigTypsetTypeValues", oStatusFilter, "Types", "TypeValue", busyDialog, gList,
				"PrdFr1", "Select",
				function (response1) {
					// var oPrdFr = [{
					// 	Key: "",
					// 	Text: "Select"
					// }, {
					// 	Key: response1[0].Text,
					// 	Seperator: "-",
					// 	Text: response1[0].Text
					// }];
					// var json = new sap.ui.model.json.JSONModel(oPrdFr);
					// that.getView().setModel(json, "PrdFr");

					if (response1[0].Text === "X") {
						gList.getModel("LocalViewSetting").setProperty("/stockMaterialT2", true);
						gList.getModel("LocalViewSetting").setProperty("/stockMaterialT1", false);
						gList.getModel("LocalViewSetting").setProperty("/prdFrMatEnabled", true);
						gList.getModel("LocalViewSetting").setProperty("/ProductFeatureValue", response1[0].Text);
						if (gList.getModel("ListItems")) {
							gList.getModel("ListItems").setProperty("/", []);
						}
						gList.getModel("LocalViewSetting").setProperty("/ListItemsCount", 1);
					} else {
						that.setDataModel();
						gList.getModel("LocalViewSetting").setProperty("/stockMaterialT2", false);
						gList.getModel("LocalViewSetting").setProperty("/stockMaterialT1", true);
						gList.getModel("LocalViewSetting").setProperty("/prdFrMatEnabled", false);
						gList.getModel("LocalViewSetting").setProperty("/ProductFeatureValue", "");
					}
				});
		},
		// getPrdFeatures: function () {
		// 	var oPrdFr = [{
		// 		Key: "",
		// 		Text: "Select"
		// 	}, {
		// 		Key: "01",
		// 		Seperator: "-",
		// 		Text: "Enable"
		// 	}, {
		// 		Key: "02",
		// 		Seperator: "-",
		// 		Text: "Disable"
		// 	}];
		// 	var json = new sap.ui.model.json.JSONModel(oPrdFr);
		// 	this.getView().setModel(json, "PrdFr");
		// },
		onPrdFrChange: function (oEvent) {
			if (this.getView().getModel("ListItems")) {
				this.getView().getModel("ListItems").setProperty("/", []);
			}
			var selectedKey = oEvent.getSource().getSelectedKey();
			if (selectedKey === "X") {
				this.getView().getModel("LocalViewSetting").setProperty("/prdFrMatEnabled", true);
				this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT2", true);
				this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT1", false);
				this.getView().getModel("LocalViewSetting").setProperty("/ListItemsCount", 1);
				//	this.getView().byId("inputMaterial1").removeAllTokens();
			}
			// else if (selectedKey === "02") {
			// 	this.getView().getModel("LocalViewSetting").setProperty("/prdFrMatEnabled", false);
			// 	this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT2", false);
			// 	this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT1", true);
			// 	this.setDataModel();
			// } 
			else {
				this.getView().getModel("LocalViewSetting").setProperty("/prdFrMatEnabled", false);
				this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT2", false);
				this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT1", true);
				this.setDataModel();
			}
		},
		onDateSelectionChanged: function (oEvent) {
			var that = this;
			var oDateSelect = oEvent.getSource();
			var sSelectedKey = oEvent.getParameter("selectedItem").getKey();
			oProductCommon.openManualDateSelectionDialog(this, sSelectedKey, oDateSelect, this.PreviousSelectedKeyDate, "DateViewSetting",
				oi18n,
				"inputDate",
				function (date) {
					that.Date.FromDate = date.fromDate;
					that.Date.ToDate = date.toDate;
				});
			this.PreviousSelectedKeyDate = oEvent.getParameter("selectedItem").getKey();
			if (oEvent.getParameter("selectedItem").getKey() !== "MS") {
				this.PreviousSelectedKeyDate = oEvent.getParameter("selectedItem").getKey();
			}
		},
		confirmDialog: function () {
			var that = this;
			var dialog = new sap.m.Dialog({
				title: 'Confirm',
				type: 'Message',
				stete: 'Warning',
				icon: 'sap-icon://message-warning',
				content: new sap.m.Text({
					text: oi18n.getText("List.Footer.Clear.confirmation")
				}),
				beginButton: new sap.m.Button({
					text: 'Yes',
					press: function () {
						that.clearAll();
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
		clearAll: function () {
			this.onReset();
			oPPCCommon.removeAllMsgs();
			oPPCCommon.hideMessagePopover(gList);
			gList.getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel().getData()
				.length);
		},
		/*--------------------------------------------Suggestor Model -----------------------------------------*/
		setCustomersModel: function () {
			var that = this;
			var mSFGWMSTModel = this._oComponent.getModel("SFGW_MST");
			mSFGWMSTModel.attachRequestSent(function () {
				busyDialog.open();
			});
			mSFGWMSTModel.attachRequestCompleted(function () {
				busyDialog.close();
			});
			var aCustomerF4Filter = new Array();
			aCustomerF4Filter = oPPCCommon.setODataModelReadFilter("", "", aCustomerF4Filter, "LoginID", "", [
				oProductCommon.getCurrentUsers("Customers", "read")
			], false, false, false);
			mSFGWMSTModel.read("/Customers", {
				filters: aCustomerF4Filter,
				urlParameters: {
					"$select": "CustomerNo,Name"
				},
				success: function (oData) {
					var CustModel = new sap.ui.model.json.JSONModel();
					CustModel.setData(oData.results);
					that._oComponent.setModel(CustModel, "CustomerSuggestorModel");
				},
				error: function () {}
			});
		},
		setSKUGRPModel: function () {
			var that = this;
			var mSSGWMMModel = this._oComponent.getModel("SFGW_MST");
			// var loginID = oProductCommon.getCurrentUsers("OrderMaterialGroups", "read");
			var fDMSDivision = oPPCCommon.getKeysFromMultiCombo(this.getView(), "inputDMSDivision");
			// mSSGWMMModel.attachRequestSent(function () {
			// 	busyDialog.open();
			// });
			// mSSGWMMModel.attachRequestCompleted(function () {
			// 	busyDialog.close();
			// });
			var aSKUGPF4Filter = new Array();
			oProductCommon.getCurrentLoggedUser({
				sServiceName: "OrderMaterialGroups",
				sRequestType: "read"
			}, function (LoginID) {
				aSKUGPF4Filter = oPPCCommon.setODataModelReadFilter("", "", aSKUGPF4Filter, "LoginID", "", [LoginID], false, false, false);
				aSKUGPF4Filter = oPPCCommon.setODataModelReadFilter("", "", aSKUGPF4Filter, "DMSDivision", "", fDMSDivision.split(";"), true,
					false,
					false);
				mSSGWMMModel.read("/OrderMaterialGroups", {
					filters: aSKUGPF4Filter,
					success: function (oData) {
						var data = [];
						if (data.length === 0) {
							data.push(oData.results[0]);
						}
						for (var i = 0; i < oData.results.length; i++) {
							var exists = false;
							for (var j = 0; j < data.length; j++) {
								if (data[j].OrderMaterialGroupID === oData.results[i].OrderMaterialGroupID) {
									exists = true;
								}
							}
							if (!exists) {
								data.push(oData.results[i]);
							}
						}
						var SKGRPModel = new sap.ui.model.json.JSONModel();
						SKGRPModel.setData(data);
						that._oComponent.setModel(SKGRPModel, "SKUGRPSuggestorModel");
					},
					error: function () {}
				});
			});
		},
		handleSKUGRPSuggest: function (oEvent) {

			var that = this;

			this.validateMandatory("", "");

			if (oPPCCommon.doErrMessageExist()) {

				oPPCCommon.handleSuggest({
					oEvent: oEvent,
					aProperties: ["OrderMaterialGroupID", "OrderMaterialGroupDesc"],
					sBinding: "suggestionItems"
				});
			} else {
				oEvent.getSource().setValue("");
				oPPCCommon.displayMsg_MsgBox(this.getView(), oPPCCommon.getMsgsFromMsgMgr(), "error");
			}

		},
		suggestionSKUGRPItemSelected: function (oEvent) {
			var that = this;
			this.suggestionSKUItemSelected({
					oEvent: oEvent,
					thisController: this,
					sModelName: "SKUGRPSuggestorModel",
					sKey: "OrderMaterialGroupID",
					sDescription: "OrderMaterialGroupDesc"
				},
				function (key, desc, jData) {
					if (that.getView().getModel("ListItems")) {
						that.getView().getModel("ListItems").setProperty("/", []);
					}
					that.getView().getModel("LocalViewSetting").setProperty("/ListItemsCount", 1);
					var prdFrValue = that.getView().getModel("LocalViewSetting").getProperty("/ProductFeatureValue");
					if (that.getView().getModel("LocalViewSetting").getProperty("/StockMaterial")) {
						if (prdFrValue !== "X") {
							that.setDataModel();
						}
					} else {
						that.setDataModel();
					}

					that.setMaterialModel();
					//	that.getView().byId("inputDMSDivision").setSelectedKeys([]);
					//	that.getView().byId("inputMaterial1").removeAllTokens();
				}

			);
			this.getView().byId("inputSKUGroup").setValueState("None");
			this.getView().byId("inputSKUGroup").setValueStateText("");
		},
		suggestionSKUItemSelected: function (mParemeters, callBack) {
			var that = this;
			var tokenTextLength = 10;
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
					text: that.TextAbstract(desc, key, tokenTextLength),
					tooltip: desc + " (" + key + ")"
				}));
				mParemeters.oEvent.getSource().setValue("");
			} else {
				var key = mParemeters.thisController.getView().getModel(mParemeters.sModelName).getProperty(sPath + "/" + mParemeters.sKey);
				var desc = mParemeters.thisController.getView().getModel(mParemeters.sModelName).getProperty(sPath + "/" + mParemeters.sDescription);
				mParemeters.oEvent.getSource().removeAllTokens();
				mParemeters.oEvent.getSource().addToken(new sap.m.Token({
					key: key,
					text: that.TextAbstract(desc, key, tokenTextLength),
					tooltip: desc + " (" + key + ")"
				}));
				mParemeters.oEvent.getSource().setValue("");
			}
			var jData = mParemeters.thisController.getView().getModel(mParemeters.sModelName).getProperty(sPath);
			if (callBack) {
				callBack(key, desc, jData);
			}
		},
		onChangeSKUGRP: function (oEvent) {
			var that = this;

			this.validateMandatory("", "");

			if (oPPCCommon.doErrMessageExist()) {
				oPPCCommon.suggestionOnChange({
						oEvent: oEvent,
						thisController: this,
						sModelName: "SKUGRPSuggestorModel",
						sKey: "OrderMaterialGroupID",
						sDescription: "OrderMaterialGroupDesc"
					},
					function (enteredVal, bFound, key, desc) {
						if (enteredVal !== "") {
							if (!bFound) {
								var msg = oi18n.getText("List.Filterbar.MultiInput.custNoError", [that.getView().byId("SKUGroup").getLabel()]);
								oEvent.getSource().setValueStateText(msg);
								oPPCCommon.displayMsg_MsgBox(that.getView(), msg, "error");
							} else {

								that.setMaterialModel();
							}

						}
					}
				);
			} else {
				oEvent.getSource().setValue("");
				oPPCCommon.displayMsg_MsgBox(this.getView(), oPPCCommon.getMsgsFromMsgMgr(), "error");
			}

		},
		getSelectedDMSDiv: function (oEvent) {
			var that = this;
			this.removeAllTokenforItems();
			this.removeAllTokenforOtherItems();
			// this.getView().byId("PrdFeatureTypes").setSelectedKey();
			//	this.getView().byId("inputMaterial1").removeAllTokens();
			this.getView().byId("inputSKUGroup").removeAllTokens();

			// this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT2", false);
			// if (this.getView().getModel("LocalViewSetting").getProperty("/OtherMaterial") === true) {
			// 	this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT1", false);
			// }
			// else{
			// 	this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT1", true);
			// }
			// this.getView().getModel("LocalViewSetting").setProperty("/prdFrMatEnabled", false);
			if (this.getView().getModel("ListItems")) {
				this.getView().getModel("ListItems").setProperty("/", []);
			}
			this.getView().getModel("LocalViewSetting").setProperty("/ListItemsCount", 1);
			var prdFrValue = this.getView().getModel("LocalViewSetting").getProperty("/ProductFeatureValue");
			if (this.getView().getModel("LocalViewSetting").getProperty("/StockMaterial")) {
				if (prdFrValue !== "X") {
					this.setDataModel();
				}
			} else {
				this.setDataModel();
			}
			if (this.getView().getModel("LocalViewSetting").getProperty("/stockMaterialT1") || this.getView().getModel("LocalViewSetting").getProperty(
					"/stockMaterialT2")) {
				this.setSKUGRPModel();
				this.setMaterialModel();
			} else {
				// setTimeout(function () {
				that.setOtherMaterialSuggestion();
				// }, 10000);

			}
		},
		changeSubStockType: function (oEvent) {
			this.removeAllTokenforItems();
			// this.getView().byId("PrdFeatureTypes").setSelectedKey();
			//	this.getView().byId("inputMaterial1").removeAllTokens();
			this.getView().byId("inputDMSDivision").setSelectedKeys([]);
			// this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT2", false);
			// this.getView().getModel("LocalViewSetting").setProperty("/stockMaterialT1", true);
			// this.getView().getModel("LocalViewSetting").setProperty("/prdFrMatEnabled", false);
			if (this.getView().getModel("ListItems")) {
				this.getView().getModel("ListItems").setProperty("/", []);
			}
			this.getView().getModel("LocalViewSetting").setProperty("/ListItemsCount", 1);
			var prdFrValue = this.getView().getModel("LocalViewSetting").getProperty("/ProductFeatureValue");
			if (prdFrValue !== "X") {
				this.setDataModel();
				if (this.getView().getModel("LocalViewSetting")) {
					this.getView().getModel("LocalViewSetting").setProperty("/MaterialTokens", []);
					this.getView().getModel("LocalViewSetting").setProperty("/BatchTokens", []);
					this.getView().getModel("LocalViewSetting").setProperty("/Batch", "");
					this.getView().getModel("LocalViewSetting").setProperty("/ReasonID", "");
					this.getView().getModel("LocalViewSetting").setProperty("/Quantity", "");
				}
				if (this.getView().getModel("ToolBarBatchDD")) {
					this.getView().getModel("ToolBarBatchDD").setProperty("/", []);
				}
				if (this.getView().byId("sFAdjQty")) {
					this.getView().byId("sFAdjQty").setValue("");
				}
				if (this.getView().byId("sFReasonIDEdit")) {
					this.getView().byId("sFReasonIDEdit").setSelectedKey("");
				}
				if (this.getView().byId("sUIFromBatchDD")) {
					this.getView().byId("sUIFromBatchDD").setSelectedKey("");
				}
			}

		},
		handleDMSDivSuggest: function (oEvent) {
			oPPCCommon.handleSuggest({
				oEvent: oEvent,
				aProperties: ["DMSDivision", "DmsDivisionDesc"],
				sBinding: "suggestionItems"
			});
		},
		suggestionDMSDivItemSelected: function (oEvent) {
			oPPCCommon.suggestionItemSelected({
					oEvent: oEvent,
					thisController: this,
					sModelName: "DMSDivSuggestorModel",
					sKey: "DMSDivision",
					sDescription: "DmsDivisionDesc"
				},
				function () {}
			);
			this.getView().byId("inputDMSDivision").setValueState("None");
			this.getView().byId("inputDMSDivision").setValueStateText("");
		},
		onChangeDMSDiv: function (oEvent) {
			var that = this;
			oPPCCommon.suggestionOnChange({
					oEvent: oEvent,
					thisController: this,
					sModelName: "DMSDivSuggestorModel",
					sKey: "DMSDivision",
					sDescription: "DmsDivisionDesc"
				},
				function (enteredVal, bFound, key, desc) {
					if (enteredVal !== "") {
						if (!bFound) {
							var msg = oi18n.getText("List.Filterbar.MultiInput.custNoError", [that.getView().byId("DMSDivision").getLabel()]);
							oPPCCommon.displayMsg_MsgBox(that.getView(), msg, "error");
						}
					}
				}
			);
		},
		/*------------------------------------------Add Material Item ------------------------*/
		// addItem: function() {
		// 	var that = this;
		// 	this.MaterialNoF4();
		// },
		deleteitem: function (oEvent) {
			var path = oEvent.getSource().getBindingContext("ListItems").getPath().split("")[1];
			var model = oEvent.getSource().getBindingContext("ListItems").getModel();
			model.getData().splice(path, 1);
			model.refresh();
			for (var i = 0; i < model.getData().length; i++) {
				model.getData()[i].slno = i + 1;
			}
			this.getView().getModel("LocalViewSetting").setProperty("/MaterialItemCount", model.getData().length);
			model.refresh();

		},

		/*------------------------------------------Extracting Value from Contextpath------------------------*/
		getParametersFromContext: function (contextPath) {
			var that = this;
			this.iTotalValueHelps = 4;
			var sCustomer = oPPCCommon.getPropertyValueFromContextPath(that.contextPath, "Distributor");
			var sSKUGroup = oPPCCommon.getPropertyValueFromContextPath(that.contextPath, "OrderMaterialGroupID");
			var dValidFrom = oPPCCommon.getPropertyValueFromContextPath(that.contextPath, "TicketDate");
			var DMSDivision = oPPCCommon.getPropertyValueFromContextPath(that.contextPath, "DMSDivision");
			var Material = oPPCCommon.getPropertyValueFromContextPath(this.contextPath, "MaterialNo");
			var loginID = oProductCommon.getCurrentUsers("CPStockItems", "read");
			var sStockOwner = "01",
				sCptype = "01";
			var StockSubTypeID = oPPCCommon.getPropertyValueFromContextPath(that.contextPath, "StockSubTypeID");
			var StockTypeID = oPPCCommon.getPropertyValueFromContextPath(that.contextPath, "StockTypeID");
			that.getView().getModel("MaterialDocs").setProperty("/FromGUID", sCustomer);
			if (this.sCustomerInputType === "VH") {
				this.setCustomerInputVisibility();
				if (sCustomer !== "") {
					var sCustomerFilters = new Array();
					sCustomerFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "inputCustomerNo", sCustomerFilters, "CustomerNo", sap.ui
						.model
						.FilterOperator.EQ, sCustomer.split(";"), true, false, false);
					var oModelData = this._oComponent.getModel("SFGW_MST");
					oProductCommon.createTokens(oModelData, "Customers", sCustomerFilters, "CustomerNo", "Name", this.getView().byId(
						"inputCustomerNo"), function () {
						that.callService();
					});
				} else {
					that.getCustomers(sCustomer);
					that.callService();
				}
			} else {
				that.getCustomers(sCustomer);
			}
			if (DMSDivision) {
				this.getView().byId("inputDMSDivision").setSelectedKeys(DMSDivision);
				that.callService();
			} else {
				that.callService();
			}
			if (sSKUGroup !== "") {
				var sCustomerFilters = new Array();
				sCustomerFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "inputSKUGroup", sCustomerFilters,
					"OrderMaterialGroupID",
					sap.ui.model
					.FilterOperator.EQ, sSKUGroup.split(";"), true, false, false);
				// var sCpguid = this.getView().getModel("MaterialDocs").getProperty("/FromGUID");
				// sCustomerFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", sCustomerFilters, "CPGUID", "", [sCpguid], false, false,
				// 	false);
				// sCustomerFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", sCustomerFilters, "CPTypeID", "", [sCptype], false,
				// 	false, false);
				// sCustomerFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", sCustomerFilters, "StockTypeID", "", ["1"], false,
				// 	false, false);
				// sCustomerFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", sCustomerFilters, "StockOwner", "", [sStockOwner], false,
				// 	false, false);
				sCustomerFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", sCustomerFilters, "LoginID", sap.ui.model.FilterOperator
					.EQ, [loginID],
					false, false, false);
				var oModelData = this._oComponent.getModel("SFGW_MST");
				oProductCommon.createTokens(oModelData, "OrderMaterialGroups", sCustomerFilters, "OrderMaterialGroupID",
					"OrderMaterialGroupDesc",
					this.getView()
					.byId(
						"inputSKUGroup"),
					function () {
						that.callService();
					});
			} else {
				//	that.getCustomers(sCustomer);
				that.callService();
			}
			if (Material !== "") {
				var MaterialNoFilters = new Array();

				MaterialNoFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", MaterialNoFilters, "CPGUID", sap.ui.model.FilterOperator
					.EQ, [sCustomer], true, false, false);
				MaterialNoFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "Material", MaterialNoFilters, "MaterialNo", sap.ui.model
					.FilterOperator
					.EQ, Material.split(";"), true, false, false);
				MaterialNoFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", MaterialNoFilters, "CPTypeID", sap.ui.model.FilterOperator
					.EQ, ["01"], true, false, false);
				MaterialNoFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", MaterialNoFilters, "StockOwner", sap.ui.model.FilterOperator
					.EQ, ["01"], true, false, false);
				MaterialNoFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", MaterialNoFilters, "StockTypeID", sap.ui.model.FilterOperator
					.EQ, ["1"], true, false, false);
				var oModelData = this._oComponent.getModel("SSGW_MM");

				oProductCommon.createTokens(oModelData, "CPStockItems", MaterialNoFilters, "MaterialNo", "MaterialDesc", this.getView().byId(
					"inputMaterial"), function () {
					that.callService();
				});
			} else {
				that.callService();
			}
			this.getView().byId("StockTypes").setSelectedKey(StockTypeID);
			this.getView().byId("StockSubTypes").setSelectedKey(StockSubTypeID);
			if (StockTypeID !== "") {
				if (StockTypeID === "1") {
					this.getView().byId("StockSubType").setVisible(false);
					this.getView().byId("StockSubTypes").setSelectedKey("");
				} else if (StockTypeID === "2") {
					this.getView().byId("StockSubType").setMandatory(true);
					this.getView().byId("StockSubType").setVisible(true);
				} else {
					this.getView().byId("StockSubType").setMandatory(false);
					this.getView().byId("StockSubType").setVisible(false);
				}
			} else {
				this.getView().byId("StockSubType").setMandatory(false);
				this.getView().byId("StockSubType").setVisible(true);
			}

			if (this.getParametersFromContext_Exit) {
				this.getParametersFromContext_Exit();
			}
		},
		callService: function () {
			this.iTotalValueHelps--;
			if (this.iTotalValueHelps === 0) {
				gListPageView.setBusy(false);
				this.getTableDetails();
			}
		},
		/*-----------------------------------------Search event on Go from Filterbar-------------------------*/
		onSearch: function () {
			var that = this;
			oPPCCommon.removeAllMsgs();
			if (this.getView().getModel("ListItems")) {
				this.getView().getModel("ListItems").setProperty("/", []);
				this.getView().getModel("LocalViewSetting").setProperty("/ListItemsCount", 1);
			}
			if (this.checkValueState()) {
				this.validateMandatory();
				if (oPPCCommon.doErrMessageExist()) {
					var contextPath = this.prepareContext();
					this.getView().getModel("LocalViewSetting").setProperty("/StockMaterial", true);
					this.getView().getModel("LocalViewSetting").setProperty("/OtherMaterial", false);
					if (this.contextPath !== undefined && this.contextPath === contextPath) {
						this.resetUITable();
						this.getTableDetails();

					} else {
						this._oRouter.navTo("SearchListPage", {
							contextPath: contextPath
						}, false);
					}
				} else {
					oPPCCommon.displayMsg_MsgBox(this.getView(), oPPCCommon.getMsgsFromMsgMgr(), "error");
				}
			} else {
				oPPCCommon.displayMsg_MsgBox(this.getView(), oPPCCommon.getMsgsFromMsgMgr(), "error");
			}
		},

		validateMandatory: function (messageArea, SKUgroup) {
			oPPCCommon.removeAllMsgs();
			if (this.sCustomerInputType === "VH") {
				if (this.getView().byId("inputCustomerNo").getTokens().length === 0) {
					this.byId("inputCustomerNo").setValueState(sap.ui.core.ValueState.Error);
					var msg = oi18n.getText("List.FilterBar.Validation.custNo", [this.getView().byId("CustomerNo").getLabel()]);
					this.byId("inputCustomerNo").setValueStateText(msg);
					oPPCCommon.addMsg_MsgMgr(msg, "error", "FG_CustomerNo");
				} else {
					if (this.byId("inputCustomerNo").getValue() === "") {
						this.byId("inputCustomerNo").setValueState(sap.ui.core.ValueState.None);
					}
				}
			} else {
				if (this.getView().byId("customer").getSelectedKey() === "") {
					var msg = oi18n.getText("List.FilterBar.Validation.custNo", [this.getView().byId("Customer").getLabel()]);
					oPPCCommon.addMsg_MsgMgr(msg, "error", "FG_CustomerNo");
				}

			}
			// if (SKUgroup === undefined) {
			// 	if (this.getView().byId("inputSKUGroup").getTokens().length === 0) {
			// 		this.byId("inputCustomerNo").setValueState(sap.ui.core.ValueState.Error);
			// 		var msg = oi18n.getText("List.FilterBar.Validation.custNo", [this.getView().byId("SKUGroup").getLabel()]);
			// 		this.byId("inputSKUGroup").setValueStateText(msg);
			// 		oPPCCommon.addMsg_MsgMgr(msg, "error", "FG_SKUGroup");
			// 	} else {
			// 		this.getView().byId("inputSKUGroup").setValueState("None");
			// 	}
			// }
			if (this.getView().getModel("LocalViewSetting").getProperty("/StockMaterial")) {
				if (this.getView().byId("StockTypes").getSelectedKey() === "") {
					var custMsg = oi18n.getText("List.FilterBar.Validation.custNo", [this.getView().byId("StockType").getLabel()]);
					oPPCCommon.addMsg_MsgMgr(custMsg, "error", "StockType");
				}
				if (this.getView().byId("StockTypes").getSelectedKey() === "2" && this.getView().byId("StockSubTypes").getSelectedKey() === "") {
					var subtypMsg = oi18n.getText("List.FilterBar.Validation.custNo", [this.getView().byId("StockSubType").getLabel()]);
					oPPCCommon.addMsg_MsgMgr(subtypMsg, "error", "StockSubType");
				}
			}
			// if (this.getView().byId("inputDMSDivision").getSelectedKeys().length === 0) {
			// 	var DMSMsg = oi18n.getText("List.FilterBar.Validation.custNo", [this.getView().byId("DMSDivision").getLabel()]);
			// 	oPPCCommon.addMsg_MsgMgr(DMSMsg, "error", "DMSDivision");
			// }
			if (this.validateMandatory_Exit) {
				this.validateMandatory_Exit();
			}
		},
		prepareContext: function () {
			var contextPath = "";
			var aDistributor = "";
			if (this.sCustomerInputType === "DD") {
				aDistributor = this.getSelectedCustomerCode();
			} else if (this.sCustomerInputType === "VH") {
				aDistributor = oPPCCommon.getKeysFromTokens(this.getView(), "inputCustomerNo");
			}
			var stockType = this.getView().byId("StockTypes").getSelectedKey();
			var StockSubTypeID = this.getView().byId("StockSubTypes").getSelectedKey();
			var aSKUGroup = oPPCCommon.getKeysFromTokens(this.getView(), "inputSKUGroup");
			var MaterialNo = oPPCCommon.getKeysFromTokens(this.getView(), "inputMaterial");
			var dDate = this.getView().getModel("MaterialDocs").getProperty("/MaterialDocDate");
			var sDMSDiv = oPPCCommon.getKeysFromMultiCombo(this.getView(), "inputDMSDivision");
			contextPath = "Distributor=" + aDistributor + ",OrderMaterialGroupID=" + aSKUGroup + ",Date=" + dDate + ",DMSDivision=" +
				sDMSDiv +
				",StockTypeID=" + stockType + ",StockSubTypeID=" + StockSubTypeID + ",MaterialNo=" + MaterialNo + ")";
			if (this.prepareContext_Exit) {
				contextPath = this.prepareContext_Exit(contextPath);
			}
			return contextPath;
		},
		getTableDetails: function (callback) {
			var that = this;
			var oView = this.getView();
			busyDialog.open();
			var DMSDivision = oPPCCommon.getPropertyValueFromContextPath(that.contextPath, "DMSDivision");
			var loginID = oProductCommon.getCurrentUsers("CPStockItems", "read");

			var sStockOwner = "01",
				sCptype = "01";
			var StkItemsListModel = this._oComponent.getModel("SSGW_MM");
			var aTableF4Filter = new Array();
			var sSKUGroup = oPPCCommon.getPropertyValueFromContextPath(that.contextPath, "OrderMaterialGroupID");
			aTableF4Filter = oPPCCommon.setODataModelReadFilter(this.getView(), "inputSKUGroup", aTableF4Filter, "OrderMaterialGroupID",
				sap.ui
				.model
				.FilterOperator.EQ, sSKUGroup.split(";"), true, false, false);
			var sCpguid = this.getView().getModel("MaterialDocs").getProperty("/FromGUID");
			aTableF4Filter = oPPCCommon.setODataModelReadFilter(oView, "", aTableF4Filter, "CPGUID", "", [sCpguid], false, false, false);
			aTableF4Filter = oPPCCommon.setODataModelReadFilter(oView, "", aTableF4Filter, "CPTypeID", "", [sCptype], false, false, false);
			aTableF4Filter = oPPCCommon.setODataModelReadFilter(oView, "", aTableF4Filter, "StockOwner", "", [sStockOwner], false, false,
				false);
			aTableF4Filter = oPPCCommon.setODataModelReadFilter(oView, "", aTableF4Filter, "LoginID", sap.ui.model.FilterOperator.EQ, [
					loginID
				],
				false, false, false);
			aTableF4Filter = oPPCCommon.setODataModelReadFilter(oView, "", aTableF4Filter, "StockTypeID", "", [this.getView().byId(
					"StockTypes")
				.getSelectedKey()
			], false, false, false);
			var Material = oPPCCommon.getPropertyValueFromContextPath(this.contextPath, "MaterialNo");
			aTableF4Filter = oPPCCommon.setODataModelReadFilter(oView, "", aTableF4Filter, "DMSDivision", "", DMSDivision.split(";"), true,
				false, false);
			aTableF4Filter = oPPCCommon.setODataModelReadFilter(oView, "", aTableF4Filter, "MaterialNo", sap.ui.model.FilterOperator.EQ, [
					Material
				],
				false, false, false);

			// aTableF4Filter = oPPCCommon.setODataModelReadFilter(oView, "", aTableF4Filter, "StockTypeID", sap.ui.model.FilterOperator.EQ, [this
			// 		.getView().byId("StockTypes").getSelectedKey()
			// 	],
			// 	false, false, false);
			aTableF4Filter = oPPCCommon.setODataModelReadFilter(oView, "", aTableF4Filter, "StockSubTypeID", sap.ui.model.FilterOperator.EQ, [
					this.getView().byId("StockSubTypes").getSelectedKey()
				],
				false, false, false);

			StkItemsListModel.attachRequestSent(function () {
				busyDialog.open();
			});
			StkItemsListModel.attachRequestCompleted(function () {
				busyDialog.close();
			});
			StkItemsListModel.read("/CPStockItems", {
				filters: aTableF4Filter,
				urlParameters: {
					"$expand": "CPStockItemSnos"
				},
				success: function (oData) {
					if (oData.results.length > 0) {
						var Snos = [];
						var tmpSnos = [];
						var datalength = oData.results.length;
						for (var i = 0; i < oData.results.length; i++) {
							datalength--;
							if (oData.results[i].CPStockItemSnos.results.length > 0) {
								for (var j = 0; j < oData.results[i].CPStockItemSnos.results.length; j++) {
									tmpSnos = oData.results[i].CPStockItemSnos.results[j];
									oData.results[i].CPStockItemSnos.results[j].DMSDivision = oData.results[i].DMSDivision;
									oData.results[i].CPStockItemSnos.results[j].DmsDivisionDesc = oData.results[i].DmsDivisionDesc;
									oData.results[i].CPStockItemSnos.results[j].OrderMaterialGroupID = oData.results[i].OrderMaterialGroupID;
									oData.results[i].CPStockItemSnos.results[j].OrderMaterialGroupDesc = oData.results[i].OrderMaterialGroupDesc;
									Snos.push(tmpSnos);
								}
							}
							if (datalength === 0) {
								var oSlnoItemsModel = new sap.ui.model.json.JSONModel();
								oSlnoItemsModel.setData(Snos);
								that.getView().setModel(oSlnoItemsModel, "ListItems");
								that.getView().getModel("LocalViewSetting").setProperty("/ListItemsCount", Snos.length);
								setTimeout(busyDialog.close(), 1000);

							}
						}
						// for (var j = 0; j < 1000; j++) {
						// 	Snos.push(Snos[0]);
						// }
						// if (Snos.length > 0) {

						// setTimeout(function() {
						// 	busyDialog.close();
						// }, 100);

						// that.setTableTitleCount(Snos.length);

						//oView.setBusy(false);
						// } else {
						// 	that.getView().setBusy(true);
						// 	that.setNodataFound();
						// }
					} else {
						busyDialog.close();
						that.getView().setBusy(false);
						that.setNodataFound();
					}
				},
				error: function (error) {
					busyDialog.close();
					that.getView().setBusy(false);
					that.setNodataFound();
					oPPCCommon.dialogErrorMessage(error, oUtilsI18n.getText("common.Dialog.Error.ServiceError.Header"));
					oView.setBusy(false);
				}
			});
		},
		setTableTitleCount: function (dataCount) {
			if (dataCount > 0) {
				this.getView().byId("ListTableTitle").setText(oi18n.getText("List.Table.TitleCount", [dataCount]));
				this.getView().byId("UIListTableTitle").setText(oi18n.getText("List.Table.TitleCount", [dataCount]));

			} else {
				this.getView().byId("ListTableTitle").setText(oi18n.getText("List.Table.Title"));
				this.getView().byId("UIListTableTitle").setText(oi18n.getText("List.Table.Title"));

			}
		},
		navigateBack: function () {
			if (this.getView().getModel("LocalViewSetting").getProperty("/editMode") === true) {
				this.backToList();
			}
			if (this.getView().getModel("LocalViewSetting").getProperty("/reviewMode") === true) {
				this.getView().getModel("LocalViewSetting").setProperty("/editMode", true);
				this.getView().getModel("LocalViewSetting").setProperty("/reviewMode", false);
				this.getView().getModel("LocalViewSetting").setProperty("/PageHeader", oi18n.getText("List.title"));
				var MaterialDocItemDetails = this._oComponent.getModel("QuantityModel");
				//for (var i = 0; i < MaterialDocItemDetails.oData.length; i++) {
				//this._oComponent.getModel("QuantityModel").setProperty("/Quantity", MaterialDocItemDetails.oData[i].Quantity);
				// this._oComponent.getModel("QuantityModel").setProperty("/Quantity", MaterialDocItemDetails[i].Quantity);
				//	}
				// this._oComponent.getModel("MaterialDocItemDetails").setProperty("/QuantityValueState", "None");
				// this._oComponent.getModel("MaterialDocItemDetails").setProperty("/QuantityValueStateText", "");
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
		prepareSTKItemsODataFilter: function (LoginID) {
			var STKItemsFilters = new Array();

			/*STKItemsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "inputCustomerNo", STKItemsFilters, "CustomerNo", "", "", true, true,
				false);
			STKItemsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "inputDate", STKItemsFilters, "Date", sap.ui.model.FilterOperator
					.BT, [this.Date.FromDate, this.Date.ToDate], false, false, false);*/
			STKItemsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", STKItemsFilters, "LoginID", "", [LoginID], false,
				false,
				false);

			if (this.prepareSTKItemsODataFilter_Exit) {
				STKItemsFilters = this.prepareSTKItemsODataFilter_Exit(STKItemsFilters);
			}
			return STKItemsFilters;
		},
		setNodataFound: function () {
			var oView = this.getView();
			/** Clear Model of the view */
			if (oView.getModel("ListItems") !== undefined) {
				oView.getModel("ListItems").setProperty("/", {});
			}
			oView.byId("ListTable").setNoDataText(oUtilsI18n.getText("common.NoResultsFound"));
			oView.byId("UIListTable").setNoData(oUtilsI18n.getText("common.NoResultsFound"));
			oView.byId("UIListTable").setVisibleRowCount(2);
			oView.byId("UIListTable").setMinAutoRowCount(2);
			oView.getModel("LocalViewSetting").setProperty("/ListItemsCount", 1);
		},

		checkValueState: function () {
			if (this.sCustomerInputType === "VH") {
				if (this.getView().byId("inputCustomerNo").getValueState() === "Error") {
					return false;
				} else {
					return true;
				}
			} else {
				return true;
			}
		},
		applyTableGrouping: function (sPropertyKey, sPropertyText, sPropertyLabel, aDefaultSorter) {
			oPPCCommon.setGroupInTable(this.getView(), "ListTable", sPropertyKey, true, sPropertyLabel, sPropertyText, aDefaultSorter);
		},
		applyUITableGrouping: function () {
			var oColumn = this.getView().byId("UIListTable").getColumns()[2];
			var sOrder = "Descending";
			this.getView().byId("UIListTable").sort(oColumn, sOrder, false);
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
		validate: function () {
			// this.validateItem();
		},
		updateStockHeader: function (istestRun) {
			this._oMaterialDocs = jQuery.extend({}, this._oComponent.getModel("MaterialDocs").getData());
			if (istestRun === true) {
				this._oMaterialDocs.TestRun = "X";
			} else {
				this._oMaterialDocs.TestRun = "";
			}
			// this._oMaterialDocs.TestRun = istestRun;
			return this._oMaterialDocs;
		},
		updateMaterialDocItemDetails: function (MaterialDocGUID) {
			this._oMaterialDocItemDetails = jQuery.extend(true, [], gSAItemView.getModel("MaterialDocItemDetails").getData());
			for (var i = 0; i < this._oMaterialDocItemDetails.length; i++) {
				this._oMaterialDocItemDetails[i].MaterialDocGUID = MaterialDocGUID;
				this._oMaterialDocItemDetails[i].MatDocItemGUID = oPPCCommon.generateUUID();
				this._oMaterialDocItemDetails[i].MaterialDocQty = this._oMaterialDocItemDetails[i].AdjQty;
				this._oMaterialDocItemDetails[i].StockGUID = this._oMaterialDocItemDetails[i].CPStockItemGUID;
				this._oMaterialDocItemDetails[i].MFD = this._oMaterialDocItemDetails[i].ManufacturingDate;
				delete this._oMaterialDocItemDetails[i].__metadata;
				delete this._oMaterialDocItemDetails[i].ManufacturingDate;
				delete this._oMaterialDocItemDetails[i].DiffQty;
				delete this._oMaterialDocItemDetails[i].AdjQty;
				delete this._oMaterialDocItemDetails[i].SKUGroupDesc;
				delete this._oMaterialDocItemDetails[i].CPStockItemGUID;
				delete this._oMaterialDocItemDetails[i].ManufacturingDate;
				delete this._oMaterialDocItemDetails[i].Quantity;
				delete this._oMaterialDocItemDetails[i].RemarksState;
				delete this._oMaterialDocItemDetails[i].RemarksStateText;
				delete this._oMaterialDocItemDetails[i].QuantityValueState;
				delete this._oMaterialDocItemDetails[i].QuantityValueStateText;
			}
			return this._oMaterialDocItemDetails;
		},
		gotoSave: function () {
			this._oComponent.getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
				.getData()
				.length);
			oPPCCommon.hideMessagePopover(gList);
			this._oComponent.getModel("LocalViewSetting").setProperty("/editMode", false);
			this._oComponent.getModel("LocalViewSetting").setProperty("/reviewMode", true);
		},
		showError: function () {
			this._oComponent.getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
				.getData().length);
			oPPCCommon.showMessagePopover(gList);
		},
		gotoDetail: function (GUID) {
			var path = "StockAdjustmentDetail(MaterialDocGUID='" + GUID + "')";
			oPPCCommon.crossAppNavigation("ssstkadjcreate", "ssstockadmnt", "Display", "ssstkadjcreate", "ssstockadmnt",
				"/View/" + path);
			if (this.gotoDetail_Exit) {
				this.gotoDetail_Exit();
			}
		},
		/*-------------------------------------Customer/Customer Related Functions---------------------------*/
		// getCustomers: function(selectedCustomer, callBack) {
		// 	var that = this;
		// 	that.setCustomerInputVisibility();
		// 	if (this.sCustomerInputType !== "VH") {
		// 		var oCustomerModel = this._oComponent.getModel("SFGW_MST");
		// 		oProductUserMapping.getCustomers(oCustomerModel, "000002", "2", busyDialog, that.getView(), function(customer) {
		// 			that.callService();

		// 			that.getView().getModel("MaterialDocs").setProperty("/FromGUID", customer[0].CustomerNo);

		// 			if (that.sCustomerInputType === "DD") {
		// 				that.getView().byId("customer").setSelectedKey(selectedCustomer);
		// 			} else if (that.sCustomerInputType === "MC") {
		// 				if (customer.length > 1) {
		// 					customer.splice(0, 1);
		// 					that.getView().getModel("Customers").setProperty("/", customer);
		// 				}
		// 				that.getView().byId("customerMultiCombo").setSelectedKeys(selectedCustomer.split(";"));
		// 			}
		// 			var oDDModel = new sap.ui.model.json.JSONModel();
		// 			for (var i = 0; i < customer.length; i++) {
		// 				if (customer[i].CPTypeID === "02") {
		// 					customer[i].FormattedCustomerNo = customer[i].CPGUID;
		// 				} else {
		// 					customer[i].FormattedCustomerNo = customer[i].CustomerNo;
		// 				}
		// 			}
		// 			oDDModel.setData(customer);
		// 			gList.setModel(oDDModel, "Customers");
		// 			that.setDataModel();
		// 			that.getView().getModel("LocalViewSetting").setProperty("/gCPTypeID", customer[0].CPTypeID);
		// 			that.getView().getModel("LocalViewSetting").setProperty("/gCPGUID", customer[0].CPGUID);
		// 			that.getView().getModel("LocalViewSetting").setProperty("/gCPNo", customer[0].CustomerNo);
		// 			that.getView().getModel("LocalViewSetting").setProperty("/gCPName", customer[0].Name);
		// 			that.getDropDowns();
		// 			that.setSKUGRPModel();
		// 			if (callBack) {
		// 				callBack(customer);
		// 			}
		// 		}, "", "true");
		// 	} else {
		// 		// var oCustomerModel2 = this._oComponent.getModel("SFGW_MST");
		// 		// that._oGetCustomers(oCustomerModel2, "000002", "2", busyDialog, this._oComponent, function(Customers) {
		// 		// 	var oDDModel = new sap.ui.model.json.JSONModel();
		// 		// 	for (var i = 0; i < Customers.length; i++) {
		// 		// 		if (Customers[i].CPTypeID === "02") {
		// 		// 			Customers[i].FormattedCustomerNo = Customers[i].CPGUID;
		// 		// 		} else {
		// 		// 			Customers[i].FormattedCustomerNo = Customers[i].CustomerNo;
		// 		// 		}
		// 		// 	}
		// 		// 	oDDModel.setData(Customers);
		// 		// 	gList.setModel(oDDModel, "Customers");
		// 		// }, "create");
		// 		// that.setSKUGRPModel();
		// 		that.getDropDowns();
		// 		gListPageView.setBusy(false);
		// 	}
		// },

		getCustomers: function (selectedCustomer, callBack) {
			/**
			 * set partner dropdown using utils method getPartners
			 * Paremeters: 1)oDateModel 2)Partner Type 3)User Type 4)busyDialog 5)view 6)callback function
			 */
			var that = this;
			that.setCustomerInputVisibility();

			if (this.sCustomerInputType !== "VH") {
				var oCustomerModel = this._oComponent.getModel("SFGW_MST");
				oProductUserMapping.getCustomers(oCustomerModel, "000002", "2", busyDialog, this.getView(), function (customer) {
					that.callService();
					busyDialog.close();
					that.getCurrentServerDate(that, function (Today) {
						that.getView().getModel("LocalViewSetting").setProperty("/Today", Today);
						that.getView().getModel("MaterialDocs").setProperty("/MaterialDocDate", Today);
					});

					that.getDropDowns();
					// this.setMaterialModel();
					if (customer[0].CPTypeID === "02") {
						that.getView().getModel("LocalViewSetting").setProperty("/Distributor", false);
						that.getView().getModel("LocalViewSetting").setProperty("/MicroDistributor", true);
						that.getView().getModel("MaterialDocs").setProperty("/FromGUID", customer[0].CPGUID);
						that.getView().getModel("MaterialDocs").setProperty("/CPTypeID", customer[0].CPTypeID);

					} else {

						that.getView().getModel("LocalViewSetting").setProperty("/Distributor", true);
						that.getView().getModel("LocalViewSetting").setProperty("/MicroDistributor", false);
						that.getView().getModel("MaterialDocs").setProperty("/FromGUID", customer[0].CustomerNo);
						that.getView().getModel("MaterialDocs").setProperty("/CPTypeID", customer[0].CPTypeID);
					}

					// that.getView().getModel("MaterialDocs").setProperty("/FromGUID", customer[0].CustomerNo);
					// that.getView().getModel("MaterialDocs").setProperty("/CPTypeID", customer[0].CPTypeID);

					if (that.sCustomerInputType === "DD") {
						that.getView().byId("customer").setSelectedKey(selectedCustomer);
					} else if (that.sCustomerInputType === "MC") {
						if (customer.length > 1) {
							customer.splice(0, 1);
							that.getView().getModel("Customers").setProperty("/", customer);

						}
						that.getView().byId("customerMultiCombo").setSelectedKeys(selectedCustomer.split(";"));
					}
					// if (customer.length > 1) {
					// 	that.setOtherMaterialSuggestion();
					// }
					if (customer.length === 1) {
						that.getView().getModel("LocalViewSetting").setProperty("/CustomerNo", customer[0].CustomerNo);
						that.getView().getModel("LocalViewSetting").setProperty("/CustomerName", customer[0].Name);
						//	that.setSKUGRPModel();
						//that.setOtherMaterialSuggestion();
					}
					var oDDModel = new sap.ui.model.json.JSONModel();
					for (var i = 0; i < customer.length; i++) {
						if (customer[i].CPTypeID === "02") {
							customer[i].FormattedCustomerNo = customer[i].CPGUID;
						} else {
							customer[i].FormattedCustomerNo = customer[i].CustomerNo;
						}
					}
					oDDModel.setData(customer);
					gList.setModel(oDDModel, "Customers");
					// that.setDataModel();

					that.getView().getModel("LocalViewSetting").setProperty("/gCPTypeID", customer[0].CPTypeID);
					that.getView().getModel("LocalViewSetting").setProperty("/gCPGUID", customer[0].CPGUID);
					that.getView().getModel("LocalViewSetting").setProperty("/gCPNo", customer[0].CustomerNo);
					that.getView().getModel("LocalViewSetting").setProperty("/gCPName", customer[0].Name);

					//that.setSKUGRPModel();
					//that.setMaterialModel();
					//	that.setOtherMaterialSuggestion();
					//	that.setSKUGRPModel();

				});
			} else {
				busyDialog.close();
				that.setCustomerF4Model();
				that.getDropDowns();
				that.getCurrentServerDate(that, function (Today) {
					that.getView().getModel("LocalViewSetting").setProperty("/Today", Today);
					that.getView().getModel("MaterialDocs").setProperty("/MaterialDocDate", Today);
				});
				gListPageView.setBusy(false);
			}

		},

		SKUChange: function () {
			var that = this;

			if (that.getView().getModel("ListItems")) {
				that.getView().getModel("ListItems").setProperty("/", []);
			}
			that.getView().getModel("LocalViewSetting").setProperty("/ListItemsCount", 1);
			var prdFrValue = that.getView().getModel("LocalViewSetting").getProperty("/ProductFeatureValue");
			if (that.getView().getModel("LocalViewSetting").getProperty("/StockMaterial")) {
				if (prdFrValue !== "X") {
					that.setDataModel();
					that.removeAllTokenforItems();
				}
			} else {
				that.setDataModel();
			}
			//	that.getView().byId("inputDMSDivision").setSelectedKeys([]);
			that.setMaterialModel();
			//	that.getView().byId("inputMaterial1").removeAllTokens();

		},
		setMaterialModel: function () {
			var that = this;
			// busyDialog.open();
			var oMaterialModel = gList.getModel("SSGW_MM");
			var fDMSDivision = oPPCCommon.getKeysFromMultiCombo(gList, "inputDMSDivision");

			var aMaterialF4Filter = new Array();
			oProductCommon.getCurrentLoggedUser({
				sServiceName: "CPStockItems",
				sRequestType: "read"
			}, function (LoginID) {
				aMaterialF4Filter = oCommonValueHelp.setODataModelReadFilter(gList, "",
					aMaterialF4Filter, "CPGUID", sap.ui.model.FilterOperator.EQ, [gList.getModel("MaterialDocs").getData().FromGUID],
					false,
					false, false);
				aMaterialF4Filter = oCommonValueHelp.setODataModelReadFilter(gList, "",
					aMaterialF4Filter, "CPTypeID", "", [gList.getModel("MaterialDocs").getData().CPTypeID], false, false, false);
				aMaterialF4Filter = oCommonValueHelp.setODataModelReadFilter(gList, "",
					aMaterialF4Filter, "StockOwner", "", ["01"], false, false, false);

				// aMaterialF4Filter = oCommonValueHelp.setODataModelReadFilter(gList, "",
				// 	aMaterialF4Filter, "ExpiryDateFlag", "", ["X"], false, false, false);
				if (gList.byId("StockTypes").getSelectedKey()) {
					aMaterialF4Filter = oPPCCommon.setODataModelReadFilter(gList, "", aMaterialF4Filter,
						"StockTypeID", "", [gList.byId("StockTypes").getSelectedKey()], false, false, false);
				} else {
					aMaterialF4Filter = oPPCCommon.setODataModelReadFilter(gList, "", aMaterialF4Filter,
						"StockTypeID", "", ["1"], false, false, false);
				}
				aMaterialF4Filter = oPPCCommon.setODataModelReadFilter(gList, "", aMaterialF4Filter,
					"DMSDivision", "", fDMSDivision.split(";"), true, false, false);
				var sku = oPPCCommon.getKeysFromTokens(gList, "inputSKUGroup");
				aMaterialF4Filter = oPPCCommon.setODataModelReadFilter(gList, "inputSKUGroup", aMaterialF4Filter,
					"OrderMaterialGroupID",
					sap.ui.model.FilterOperator.EQ, sku.split(";"), true, false, false);
				aMaterialF4Filter = oPPCCommon.setODataModelReadFilter(gList, "", aMaterialF4Filter,
					"StockSubTypeID", sap.ui.model.FilterOperator.EQ, [gList.byId("StockSubTypes").getSelectedKey()], false, false,
					false);
				aMaterialF4Filter = oPPCCommon.setODataModelReadFilter("", "", aMaterialF4Filter, "LoginID", "", [LoginID], false, false,
					false);
				oMaterialModel.read("/CPStockItems", {
					filters: aMaterialF4Filter,
					urlParameters: {
						"$expand": "CPStockItemSnos"
					},
					success: function (oData) {
						oData = oPPCCommon.formatItemsOData({
							oData: oData.results
						});
						var ChannelPartnerModel = new sap.ui.model.json.JSONModel();
						ChannelPartnerModel.setData(oData);
						gList.setModel(ChannelPartnerModel, "MatSuggestorModel");
						gList.getModel("LocalViewSetting").setProperty("/MaterialVisible", true);
						// busyDialog.close();

					},
					error: function (error) {
						gList.getModel("LocalViewSetting").setProperty("/MaterialVisible", true);
						// busyDialog.close();
						//alert(error);
					}
				});
			});
			//for enhancement
			if (this.setMaterialModel_Exit) {
				this.setMaterialModel_Exit();
			}
		},
		setBatchForExcelUpload: function (callBack) {
			var that = this;
			busyDialog.open();
			var oMaterialModel = gList.getModel("SSGW_MM");

			var aMaterialF4Filter = new Array();
			oProductCommon.getCurrentLoggedUser({
				sServiceName: "CPBatchStkSet",
				sRequestType: "read"
			}, function (LoginID) {
				aMaterialF4Filter = oCommonValueHelp.setODataModelReadFilter(gList, "",
					aMaterialF4Filter, "CPGuid", sap.ui.model.FilterOperator.EQ, [gList.getModel("MaterialDocs").getData().FromGUID],
					false,
					false, false);
				aMaterialF4Filter = oCommonValueHelp.setODataModelReadFilter(gList, "",
					aMaterialF4Filter, "CPType", "", [gList.getModel("MaterialDocs").getData().CPTypeID], false, false, false);

				// aMaterialF4Filter = oPPCCommon.setODataModelReadFilter(gList, "", aMaterialF4Filter,
				// 	"MaterialNo", "", [MaterialNo], false, false, false);

				aMaterialF4Filter = oPPCCommon.setODataModelReadFilter("", "", aMaterialF4Filter, "LoginID", "", [LoginID], false, false,
					false);
				aMaterialF4Filter = oPPCCommon.setODataModelReadFilter("", "", aMaterialF4Filter, "StockOwner", "", ["01"], false, false,
					false);

				if (gList.byId("StockTypes").getSelectedKey()) {
					aMaterialF4Filter = oPPCCommon.setODataModelReadFilter(gList, "", aMaterialF4Filter,
						"StockType", "", [gList.byId("StockTypes").getSelectedKey()], false, false, false);
				} else {
					aMaterialF4Filter = oPPCCommon.setODataModelReadFilter(gList, "", aMaterialF4Filter,
						"StockType", "", ["1"], false, false, false);
				}
				aMaterialF4Filter = oPPCCommon.setODataModelReadFilter(gList, "", aMaterialF4Filter,
					"StockBy", "", ["01"], false, false, false);
				aMaterialF4Filter = oPPCCommon.setODataModelReadFilter(gList, "", aMaterialF4Filter,
					"ExpiryDateFlag", "", ["X"], false, false, false);

				// aMaterialF4Filter = oPPCCommon.setODataModelReadFilter(gList, "", aMaterialF4Filter,
				// 		"StockSubTypeID", sap.ui.model.FilterOperator.EQ, [gList.byId("StockSubTypes").getSelectedKey()], false, false,
				// 		false);

				oMaterialModel.read("/CPBatchStkSet", {
					filters: aMaterialF4Filter,
					// urlParameters: {
					// 	"$orderby": "MaterialDesc asc"
					// },
					success: function (oData) {
						oData = oPPCCommon.formatItemsOData({
							oData: oData.results
						});
						for (var i = 0; i < oData.length; i++) {
							oData[i].ExpDate = oProductCommon.getFormattedDate(oData[i].ExpDate);
						}
						//for sorting the matrial number
						oData.sort(function (a, b) {
							if (a.MaterialDesc < b.MaterialDesc) {
								return -1;
							}
							if (a.MaterialDesc > b.MaterialDesc) {
								return 1;
							}
							return 0;
						});
						var oItemSerialNoModel = new sap.ui.model.json.JSONModel();
						oItemSerialNoModel.setData(oData);
						gList.setModel(oItemSerialNoModel, "BatchExcelUploadModel");
						gList.getModel("ListItems").setData([]);
						busyDialog.close();
						if (callBack) {
							callBack();
						}

					},
					error: function (error) {
						// gList.getModel("LocalViewSetting").setProperty("/MaterialVisible", true);
						busyDialog.close();
						//alert(error);
					}
				});
			});
			//for enhancement
			if (this.setMaterialModel_Exit) {
				this.setMaterialModel_Exit();
			}
		},

		setBatchModel: function (MaterialNo, flag, index) {
			var that = this;
			// busyDialog.open();
			var oMaterialModel = gList.getModel("SSGW_MM");

			var aMaterialF4Filter = new Array();
			oProductCommon.getCurrentLoggedUser({
				sServiceName: "CPBatchStkSet",
				sRequestType: "read"
			}, function (LoginID) {
				aMaterialF4Filter = oCommonValueHelp.setODataModelReadFilter(gList, "",
					aMaterialF4Filter, "CPGuid", sap.ui.model.FilterOperator.EQ, [gList.getModel("MaterialDocs").getData().FromGUID],
					false,
					false, false);
				aMaterialF4Filter = oCommonValueHelp.setODataModelReadFilter(gList, "",
					aMaterialF4Filter, "CPType", "", [gList.getModel("MaterialDocs").getData().CPTypeID], false, false, false);

				aMaterialF4Filter = oPPCCommon.setODataModelReadFilter(gList, "", aMaterialF4Filter,
					"MaterialNo", "", [MaterialNo], false, false, false);

				aMaterialF4Filter = oPPCCommon.setODataModelReadFilter("", "", aMaterialF4Filter, "LoginID", "", [LoginID], false, false,
					false);
				aMaterialF4Filter = oPPCCommon.setODataModelReadFilter("", "", aMaterialF4Filter, "StockOwner", "", ["01"], false, false,
					false);

				if (gList.byId("StockTypes").getSelectedKey()) {
					aMaterialF4Filter = oPPCCommon.setODataModelReadFilter(gList, "", aMaterialF4Filter,
						"StockType", "", [gList.byId("StockTypes").getSelectedKey()], false, false, false);
				} else {
					aMaterialF4Filter = oPPCCommon.setODataModelReadFilter(gList, "", aMaterialF4Filter,
						"StockType", "", ["1"], false, false, false);
				}
				aMaterialF4Filter = oPPCCommon.setODataModelReadFilter(gList, "", aMaterialF4Filter,
					"StockBy", "", ["01"], false, false, false);
				// aMaterialF4Filter = oPPCCommon.setODataModelReadFilter(gList, "", aMaterialF4Filter,
				// 		"StockSubTypeID", sap.ui.model.FilterOperator.EQ, [gList.byId("StockSubTypes").getSelectedKey()], false, false,
				// 		false);

				oMaterialModel.read("/CPBatchStkSet", {
					filters: aMaterialF4Filter,
					// urlParameters: {
					// 	"$expand": "CPStockItemSnos"
					// },
					success: function (oData) {
						oData = oPPCCommon.formatItemsOData({
							oData: oData.results
						});

						// var aBatchDD = oData[0].CPStockItemSnos.results;
						var aNewBatchDD = [];
						for (var i = 0; i < oData.length; i++) {
							if (oData[i].Batch !== "") {
								aNewBatchDD.push(oData[i]);

							}
						}
						if (flag) {
							var oItemSerialNoModel = new sap.ui.model.json.JSONModel();
							oItemSerialNoModel.setData(aNewBatchDD);
							// gList.setModel(oItemSerialNoModel, "BatchSuggestorModelItemWise");
							/// var tempModel = gList.getModel("BatchSuggestorModelItemWise");
							that.getView().getModel("ListItems").setProperty("/" + index + "/BatchSuggestorModel", aNewBatchDD);
						} else {
							var oItemSerialNoModel = new sap.ui.model.json.JSONModel();
							oItemSerialNoModel.setData(aNewBatchDD);
							gList.setModel(oItemSerialNoModel, "BatchSuggestorModel");
						}
						// var ChannelPartnerModel = new sap.ui.model.json.JSONModel();
						// ChannelPartnerModel.setData(oData);
						// gList.setModel(ChannelPartnerModel, "BatchSuggestorModel");
						// gList.getModel("LocalViewSetting").setProperty("/MaterialVisible", true);
						busyDialog.close();

					},
					error: function (error) {
						// gList.getModel("LocalViewSetting").setProperty("/MaterialVisible", true);
						// busyDialog.close();
						//alert(error);
					}
				});
			});
			//for enhancement
			if (this.setMaterialModel_Exit) {
				this.setMaterialModel_Exit();
			}
		},

		getSelectedCustomerCode: function () {
			var customerCode;
			if (this.sCustomerInputType === "DD") {
				customerCode = this.getView().byId("customer").getSelectedKey();
				// that.getView().getModel("LocalViewSetting").setProperty("/CustomerNo", customerCode);
			} else if (this.sCustomerInputType === "MC") {
				var aCustomer = this.getView().byId("customerMultiCombo").getSelectedKeys();
				if (aCustomer.length > 0) {
					customerCode = aCustomer[0];
					for (var i = 1; i < aCustomer.length; i++) {
						if (aCustomer[i] !== "") {
							customerCode += ";" + aCustomer[i];
						}
					}
				}
			} else if (this.sCustomerInputType === "VH") {
				customerCode = oPPCCommon.getKeysFromTokens(this.getView(), "inputCustomerNo");
				// that.getView().getModel("LocalViewSetting").setProperty("/CustomerNo", customerCode);
			}
			return customerCode;
		},
		getSelectedVendorCode: function () {
			var customerCode = "";
			var aData = this._oComponent.getModel("Customers").getData();
			if (this.geView()) {
				if (this.sCustomerInputType === "DD") {
					customerCode = aData[0].CPNo;
				} else if (this.sCustomerInputType === "VH") {
					customerCode = oPPCCommon.getKeysFromTokens(this.getView(), "inputCustomerNo");
				}
			}
			return customerCode;
		},
		_oGetCustomers: function (oCustomerModel, RoleID, UserType, busyDialog, view, requestCompleted, appType) {
			if (view.getModel("SSGW_MST")) {
				oCustomerModel = view.getModel("SSGW_MST");
			}
			var that = this;
			var aCustomerFilters = new Array();
			oProductCommon.getCurrentLoggedUser({
				sServiceName: "UserChannelPartners",
				sRequestType: "read"
			}, function (LoginID) {
				aCustomerFilters = oPPCCommon.setODataModelReadFilter("", "", aCustomerFilters, "LoginID", "", [LoginID], false, false,
					false);
				var serviceName = "Customers";
				if (view.getModel("SSGW_MST")) {
					serviceName = "UserChannelPartners";
				}
				oCustomerModel.read("/" + serviceName, {
					filters: aCustomerFilters,
					success: function (oData) {
						if (oData.results.length > 0) {
							if (oData.results[0].CPTypeID === "02") {
								that.distributorDetails(oData.results[0].CPGUID);
							} else {
								// that.setCustomerDetails(oData.results[0].CPGUID);
							}
							var oCustomersModel = new sap.ui.model.json.JSONModel();
							oCustomersModel.setData(oData.results);
							if (oData.results.length > 0) {
								view.setModel(oCustomersModel, "Customers");
								var Customers = view.getModel("Customers").getData();
								that.getView().getModel("LocalViewSetting").setProperty("/gCPTypeDesc", Customers[0].CPTypeDesc);
								that.getView().getModel("LocalViewSetting").setProperty("/gCPTypeID", Customers[0].CPTypeID);
								that.getView().getModel("LocalViewSetting").setProperty("/gCPGUID", Customers[0].CPGUID);
								that.getView().getModel("LocalViewSetting").setProperty("/gCPNo", Customers[0].CustomerNo);
								that.getView().getModel("LocalViewSetting").setProperty("/gCPName", Customers[0].Name);
								//	that.setSKUGRPModel();
								that.getDropDowns();
								requestCompleted(Customers);
								gListPageView.setBusy(false);
							}
						}
					},
					error: function (error) {
						//	busyDialog.close();
					}
				});
			});
		},
		setDataModel: function () {
			var that = this;
			var data = [];
			var num = 1;
			var count = 0;
			for (var i = 0; i < 5; i++) {
				count = count + 10;
				var ItemNo = count;
				var obj = {
					ItemNo: ItemNo,
					MaterialNo: "",
					MaterialDesc: "",
					MaterialDocGUID: "",
					MaterialDocQty: "",
					StockGUID: "",
					Remarks: "",
					Currency: "",
					Price: "",
					MRP: "",
					PurchasePrice: "",
					UOM: "",
					Batch: "",
					ExpiryDate: null,
					materialEdit: true,
					DMSDivisionID: "",
					DMSDivisionDesc: "",
					ManufacturingDate: null,
					GQuantity: "0",
					SQuantity: "0",
					DQuantity: "0"
				};
				data.push(obj);
			}
			var jsonModel = new sap.ui.model.json.JSONModel(data);
			that.getView().setModel(jsonModel, "ListItems");
			that.getView().getModel("LocalViewSetting").setProperty("/ListItemsCount", data.length);
		},
		setCustomerF4Model: function () {
			var that = this;
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
					gList.setModel(CustomerF4Model, "CustomerF4SuggestorModel");
				},
				error: function (error) {
					//alert(error);
				}
			});
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
			that.suggestionItemSelected({
					oEvent: oEvent,
					thisController: this,
					sModelName: "CustomerF4SuggestorModel",
					sKey: "CustomerNo",
					sDescription: "Name"
				},
				function (key, desc, jData) {
					if (key) {

						that.getView().getModel("LocalViewSetting").setProperty("/CustomerNo", key);
						that.getView().getModel("LocalViewSetting").setProperty("/CustomerName", desc);

						that.getView().getModel("MaterialDocs").setProperty("/FromGUID", key);
						that.getView().getModel("MaterialDocs").setProperty("/ToGUID", key);
						that.getView().getModel("MaterialDocs").setProperty("/CPTypeID", "01");
						that.setOtherMaterialSuggestion();
						that.setMaterialModel();
					}

				}
			);
			this.getView().byId("inputCustomerNo").setValueState("None");
			this.getView().byId("inputCustomerNo").setValueStateText("");
		},
		suggestionItemSelected: function (mParemeters, callBack) {
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
					sDescription: "Name"
				},
				function (enteredVal, bFound, key, desc, jData) {
					if (enteredVal !== "") {
						if (!bFound) {
							var msg = oi18n.getText("List.Filterbar.MultiInput.custNoError", [that.getView().byId("CustomerNo").getLabel()]);
							oPPCCommon.displayMsg_MsgBox(that.getView(), msg, "error");
						} else {
							that.getView().getModel("LocalViewSetting").setProperty("/CustomerNo", key);
							that.getView().getModel("LocalViewSetting").setProperty("/CustomerName", desc);

							that.getView().getModel("MaterialDocs").setProperty("/FromGUID", key);
							that.getView().getModel("MaterialDocs").setProperty("/ToGUID", key);
							that.getView().getModel("MaterialDocs").setProperty("/CPTypeID", "01");
							that.setOtherMaterialSuggestion();
							that.setMaterialModel();
						}
					}
				});
		},
		CustomerF4: function () {
			var that = this;
			oCommonValueHelp.CustomerF4({
				oController: this,
				oi18n: oi18n,
				oUtilsI18n: oUtilsI18n,
				bMultiSelect: false,
			}, function (tokens) {
				that.sCustomer = tokens[0].mProperties.key;
				that.sCustomerName = tokens[0].mProperties.text.split(" (")[0];
				that.getView().getModel("LocalViewSetting").setProperty("/CustomerNo", that.sCustomer);
				that.getView().getModel("LocalViewSetting").setProperty("/CustomerName", that.sCustomerName);
				that.CustomerTokenInput = that.getView().byId("inputCustomerNo");
				that.CustomerTokenInput.removeAllTokens();
				var oToken = new sap.m.Token({
					key: that.sCustomer,
					text: that.TextAbstract(that.sCustomerName, that.sCustomer, 5),
					tooltip: that.sCustomerName + " (" + that.sCustomer + ")"
				});
				var cust = [];
				that.getView().getModel("MaterialDocs").setProperty("/CPTypeID", tokens[0].mAggregations.customData[0].mProperties.value.CPTypeID);
				cust.push(tokens[0].mAggregations.customData[0].mProperties.value);
				that.getView().getModel("MaterialDocs").setProperty("/FromGUID", cust[0].CustomerNo);
				that.getView().getModel("MaterialDocs").setProperty("/ToGUID", cust[0].CustomerNo);
				that.getView().getModel("MaterialDocs").setProperty("/CPTypeID", "01");
				that.CustomerTokenInput.addToken(oToken);
				if (tokens.length > 0) {
					that.setOtherMaterialSuggestion();
					that.setMaterialModel();
				}
			});
		},
		UserCustomerF4: function (mParameters, requestCompleted) {
			if (mParameters.controlID === undefined ||
				mParameters.controlID === null) {}
			if (mParameters.bMultiSelect === undefined ||
				mParameters.bMultiSelect === null) {
				mParameters.bMultiSelect = false;
			}
			var sF4Heading = "Distributor";

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
					var tokenTextLength = 10;
					if (mParameters.oController.CustomerTokenInput) {
						var tokens = oControlEvent.getParameter("tokens");
						var Text1 = tokens[0].mProperties.key;
						var Text = tokens[0].getCustomData()[0].mProperties.value.Name;
						tokens[0].mProperties.text = mParameters.oController.TextAbstract(Text, Text1, tokenTextLength);
						// tokens[0].setTooltip(Text + " (" + Text1 + ")");
						mParameters.oController.CustomerTokenInput.setTokens(tokens);
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
			this.setUserCustomerF4Columns(oValueHelpDialog, mParameters);
			this.setUserCustomerF4FilterBar(oValueHelpDialog, mParameters);
			if (sap.ui.Device.support.touch === false) {
				oValueHelpDialog.addStyleClass("sapUiSizeCompact");
			}
			oValueHelpDialog.open();
			if (mParameters.oController.CustomerTokenInput) {
				oValueHelpDialog.setTokens(mParameters.oController.CustomerTokenInput.getTokens());
			}
		},
		setUserCustomerF4Columns: function (oValueHelpDialog, mParameters) {
			var sCustomerNoLbl = "Distributor No";
			var sNameLbl = "Distributor Name";

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
					label: new sap.m.Text({
						text: sCustomerNoLbl
					}),
					template: new sap.m.Text({
						text: "{CPNo}"
					}),
					sortProperty: "CPNo",
					filterProperty: "CPNo"
				}));
				oValueHelpDialog.getTable().addColumn(new sap.ui.table.Column({
					label: new sap.m.Text({
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
		setUserCustomerF4FilterBar: function (oValueHelpDialog, mParameters) {
			var oTokenInputValue = "";
			if (mParameters.oController.CustomerTokenInput) {
				oTokenInputValue = mParameters.oController.CustomerTokenInput.getValue();
			}
			var code = new sap.m.Input({
				value: oTokenInputValue,
				maxLength: oPPCCommon.getMaxLengthFromMetadata({
					oDataModel: mParameters.oController.getView().getModel("SFGW_MST"),
					sEntityType: "UserCustomer",
					sPropertyName: "CustomerNo",
					oUtilsI18n: mParameters.oUtilsI18n
				})
			});
			var desc = new sap.m.Input({

			});
			var sCustomerNoLbl = "Distributor No";
			var sNameLbl = "Distributor Name";

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
						groupName: "gn1",
						name: "n2",
						label: sNameLbl,
						control: desc
					})
				],
				search: function (oEvent) {
					var codeValue = code.getValue();
					var descValue = desc.getValue();
					var aCustomerF4Filter = new Array();
					aCustomerF4Filter = oPPCCommon.setODataModelReadFilter("", "", aCustomerF4Filter, "LoginID", "", [oProductCommon.getCurrentLoggedUser({
						sServiceName: "UserCustomers",
						sRequestType: "read"
					})], false, false, false);
					aCustomerF4Filter = oPPCCommon.setODataModelReadFilter(mParameters.oController.getView(), "",
						aCustomerF4Filter, "CPNo", "", [codeValue], false, false, false);
					aCustomerF4Filter = oPPCCommon.setODataModelReadFilter(mParameters.oController.getView(), "",
						aCustomerF4Filter, "Name", "", [descValue], false, false, false);
					var mSFGWMSTModel = mParameters.oController._oComponent.getModel("SSGW_MST");
					mSFGWMSTModel.attachRequestSent(function () {
						busyDialog.open();
					});
					mSFGWMSTModel.attachRequestCompleted(function () {
						busyDialog.close();
					});
					mSFGWMSTModel
						.read(
							"/UserChannelPartners", {
								filters: aCustomerF4Filter,
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
									// 	if (oValueHelpDialog.getTable().getModel() !== undefined) {
									// 	oValueHelpDialog.getTable().getModel().setProperty("/", {});
									// }
									// oValueHelpDialog.getTable().setNoData(mParameters.oUtilsI18n.getText("common.NoResultsFound"));
									// oCommonValueHelp.dialogErrorMessage(error, "No Data Found");
									if (oValueHelpDialog.getTable().getModel() !== undefined) {
										oValueHelpDialog.getTable().getModel().setProperty("/", {});
									}
									oValueHelpDialog.getTable().setNoData(mParameters.oUtilsI18n.getText("common.NoResultsFound"));
									oCommonValueHelp.dialogErrorMessage(error, "No Data Found");
								}
							});
				},
				reset: function () {}
			}));
		},
		setCPNoF4Details: function (tokens) {
			var that = this;
			var oCPNoF4Model = new sap.ui.model.json.JSONModel();
			oCPNoF4Model.setData(tokens);
			gList.setModel(oCPNoF4Model, "Customers");
			that.getView().getModel("LocalViewSetting").setProperty("/gCPTypeDesc", tokens.CPTypeDesc);
			that.getView().getModel("LocalViewSetting").setProperty("/gCPTypeID", tokens.CPTypeID);
			that.getView().getModel("LocalViewSetting").setProperty("/gCPGUID", tokens.CPGUID);
			that.getView().getModel("LocalViewSetting").setProperty("/gCPNo", tokens.CustomerNo);
			that.getView().getModel("LocalViewSetting").setProperty("/gCPName", tokens.Name);
			if (this.setCPNoF4Details_Exit) {
				this.setCPNoF4Details_Exit(tokens);
			}

		},
		distributorDetails: function (GUID) {
			GUID = GUID.substring(0, 8) + "-" + GUID.substring(8, 12) + "-" + GUID.substring(12, 16) + "-" + GUID.substring(16, 20) + "-" +
				GUID.substring(20, GUID.length);
			var that = this;
			var view = this.getView();
			var oSSGWMSTModel = view.getModel("SSGW_MST");
			var thisController = this;
			var LoginID = that.getCurrentUsers("ChannelPartners", "read");
			oSSGWMSTModel.setHeaders({
				"x-arteria-loginid": LoginID
			});
			oSSGWMSTModel.read("/ChannelPartners(CPGUID=guid'" + GUID + "')", {
				urlParameters: {
					"$expand": "CPDMSDivisions,CPPartnerFunctions"
				},
				success: function (oData) {
					// thisController.setDataFromParent(oData);
				},
				error: function (error) {}
			});

			if (this.distributorDetails_Exit) {
				this.distributorDetails_Exit();
			}
		},
		setCustomerDetails: function (CustomerNo) {
			var view = this.getView();
			var oSSGWMSTModel = view.getModel("SFGW_MST");
			var thisController = this;
			var LoginID = this.getCurrentUsers("ChannelPartners", "read");
			oSSGWMSTModel.setHeaders({
				"x-arteria-loginid": LoginID
			});
			oSSGWMSTModel.read("/Customers(CustomerNo='" + CustomerNo + "')", {
				success: function (oData) {
					// thisController.setDataFromParent(oData);
				},
				error: function (error) {}
			});

			if (this.setCustomerDetails_Exit) {
				this.setCustomerDetails_Exit();
			}
		},
		/*oProductUserMapping.getCustomers(oCustomerModel, "000002", "2", busyDialog, that.getView(), function(customer) {
			if (that.sCustomerInputType === "DD") {
				that.getView().byId("customer").setSelectedKey(selectedCustomer);
			} else if (that.sCustomerInputType === "MC") {
				if (customer.length > 1) {
					customer.splice(0, 1);
					that.getView().getModel("Customers").setProperty("/", customer);
				}
				that.getView().byId("customerMultiCombo").setSelectedKeys(selectedCustomer.split(";"));
			}

			var oDDModel = new sap.ui.model.json.JSONModel();
			for (var i = 0; i < customer.length; i++) {
				if (customer[i].CPTypeID === "02") {
					customer[i].FormattedCustomerNo = customer[i].CPGUID;
				} else {
					customer[i].FormattedCustomerNo = customer[i].CustomerNo;
				}
			}
			oDDModel.setData(customer);
			gList.setModel(oDDModel, "Customers");
			that.getView().getModel("LocalViewSetting").setProperty("/gCPTypeID", customer[0].CPTypeID);
			that.getView().getModel("LocalViewSetting").setProperty("/gCPGUID", customer[0].CPGUID);
			that.getView().getModel("LocalViewSetting").setProperty("/gCPNo", customer[0].CustomerNo);
			// that.getView().getModel("POs").setProperty("/CPTypeID", customer[0].CPTypeID);
			that.setSKUGRPModel();
			that.getDropDowns();
			if (callBack) {
				callBack(customer);
			}
		}, "", "true");*/
		/*} else {
					
				if (callBack) {
					callBack();
				}
			}
		},*/
		getEntityLock1: function () {
			var that = this;
			var gListPageView = this.getView();
			var oModelData = this._oComponent.getModel("PCGW");
			var aDMSDivF4Filter = new Array();
			aDMSDivF4Filter = oPPCCommon.setODataModelReadFilter("", "", aDMSDivF4Filter, "ModelID", "", ["SSGW_MST"], false, false, false);
			aDMSDivF4Filter = oPPCCommon.setODataModelReadFilter("", "", aDMSDivF4Filter, "EntityType", "", ["EntityLock"], false,
				false,
				false);
			aDMSDivF4Filter = oPPCCommon.setODataModelReadFilter("", "", aDMSDivF4Filter, "PropName", "", ["CPGuid"], false, false, false);
			that.getDropdown(oModelData, "ValueHelps", aDMSDivF4Filter, "ID", "Description", busyDialog,
				gListPageView,
				"EntityLockDD", "",
				function (oData) {
					console.log(oData);
				});
			if (this.setDMSDivDD_Exit) {
				this.setDMSDivDD_Exit();
			}
		},
		getEntityLock: function (CPType, CPGuid) {
			var that = this;
			var SSGW_MST_MSTModel = this._oComponent.getModel("PCGW");
			var LoginID = that.getCurrentUsers("EntityLockSet", "read");
			SSGW_MST_MSTModel.setHeaders({
				"x-arteria-loginid": LoginID
			});
			SSGW_MST_MSTModel.read("/EntityLockSet(CPGuid='" + CPGuid + "')", {
				// SSGW_MST_MSTModel.read("/EntityLockSet", {
				// 	filters: aSPF4Filter,
				// urlParameters: {
				// 	"$select": "LockedbyIDtype,LockedbyID"
				// },
				success: function (oData) {
					console.log(oData);
				},
				error: function (error) {
					console.log(error);
				}
			});

		},
		getSelectedCustomerName: function (oEvent) {
			var that = this;
			var custcontrl = oEvent.getSource().getSelectedItem().getBindingContext("Customers").getObject();
			that.getView().getModel("MaterialDocs").setProperty("/CPTypeID", custcontrl.CPTypeID);
			this.getView().getModel("MaterialDocs").setProperty("/FromGUID", oEvent.getSource().getSelectedKey());

			that.getView().getModel("LocalViewSetting").setProperty("/CustomerNo", custcontrl.CustomerNo);
			that.getView().getModel("LocalViewSetting").setProperty("/CustomerName", custcontrl.Name);

			if (custcontrl.CPTypeID === "01") {
				this.getView().getModel("LocalViewSetting").setProperty("/Distributor", true);
				this.getView().getModel("LocalViewSetting").setProperty("/MicroDistributor", false);
			} else {
				this.getView().getModel("LocalViewSetting").setProperty("/Distributor", false);
				this.getView().getModel("LocalViewSetting").setProperty("/MicroDistributor", true);
			}
			this.getView().byId("customer").setTooltip(this.getCustomerName());
			this.getView().byId("inputSKUGroup").removeAllTokens();
			//	this.getView().byId("inputMaterial").removeAllTokens();
			var cust = this.getView().byId("customer").getSelectedKey();
			if (cust !== "") {
				oEvent.getSource().setValueState("None");
				oEvent.getSource().setValueStateText("");
				that.setOtherMaterialSuggestion();
				that.setMaterialModel();
			}

			if (that.getView().byId("SelectGroupIDAW").getSelectedIndex() === 2) {
				gList.getModel("ListItems").setData([]);
				gList.byId("fileUploader").setValue("");
			}
			that.getEntityLock(custcontrl.CPTypeID, cust);

		},
		getCustomerName: function () {
			if (this.getView().byId("customer").getSelectedItem().getText().split("-").length > 1) {
				this.getView().getModel("LocalViewSetting").setProperty("/CustomerColumnVisibleInF4", false);
				return this.getView().byId("customer").getSelectedItem().getText().split("-")[1].trim();
			} else {
				this.getView().getModel("LocalViewSetting").setProperty("/CustomerColumnVisibleInF4", true);
				return this.getView().byId("customer").getSelectedItem().getText().split("-")[0].trim();
			}
		},
		setCustomerColumnVisibility: function () {
			if (this.getView().byId("customer").getSelectedItem().getText().split("-").length > 1) {
				this.getView().getModel("LocalViewSetting").setProperty("/CustomerColumnVisibleInResult", false);
			} else {
				this.getView().getModel("LocalViewSetting").setProperty("/CustomerColumnVisibleInResult", true);
			}
		},
		setCustomerInputVisibility: function () {
			if (this.sCustomerInputType === "DD") {
				this.getView().getModel("LocalViewSetting").setProperty("/CustomerDD", true);
				this.getView().getModel("LocalViewSetting").setProperty("/CustomerVH", false);
			} else if (this.sCustomerInputType === "VH") {
				this.getView().getModel("LocalViewSetting").setProperty("/CustomerVH", true);
				this.getView().getModel("LocalViewSetting").setProperty("/CustomerDD", false);
			}
			if (this.setCustomerInputVisibility_Exit) {
				this.setCustomerInputVisibility_Exit();
			}
		},
		/*------------------------------------Get Drop downs--------------------------------*/
		getDropDowns: function () {

			// this.iTotalDDs = 1;
			this.setDMSDivDD();
			this.setReasonDD();
			this.StockTypesDD();
			this.stockSubType();
			//		this.setUOM();
			this.getPrdFeatures();
			if (this.getDropDowns_Exit) {
				this.getDropDowns_Exit();
			}
		},
		setUOM: function () {
			var oModelData = this._oComponent.getModel("PCGW");
			var oMarketDDFilter = new Array();
			oMarketDDFilter = oPPCCommon.setODataModelReadFilter(this.getView(), "", oMarketDDFilter, "Typeset", sap.ui.model.FilterOperator
				.EQ, ["STAUOM"], false, false, false);
			this.getDropdown(oModelData, "ConfigTypesetTypes", oMarketDDFilter, "Types", "TypesName", busyDialog,
				this.getView(),
				"UOMs", "Select",
				function (oData) {
					if (oData.length > 0) {
						// sap.m.messageToast("");
					}
				});
			if (this.setUOM_Exit) {
				this.setUOM_Exit();
			}
		},
		getDropdown: function (oModel, sEntitySet, oFilters, sKey, sText, busyDialog, view, modelName, defaultValue, requestCompleted,
			bLoginIDOptional, appKey, bMustAddNone, mParameters) {

			var aDDValue = new Array();
			/*oModel.attachRequestSent(
					function()
					{
						busyDialog.open();
					});  
			oModel.attachRequestCompleted(
					function()
					{ 
						busyDialog.close();
					}); */
			if (oModel) {
				// if ((bLoginIDOptional === undefined || !bLoginIDOptional) && sEntitySet !== "ConfigTypesetTypes" && sEntitySet !== "ConfigTypsetTypeValues")  {
				// com.arteriatech.ppc.utils.js.Common.getCurrentLoggedUser({sServiceName: sEntitySet+"_"+(Math.random().toFixed(2)*100).toFixed(0), sRequestType: "read", Application: appKey}, function(LoginID){
				// oFilters = com.arteriatech.ppc.utils.js.Common.setODataModelReadFilter("", "", oFilters, "LoginID", "", [LoginID], false, false, false);
				oProductCommon.getCurrentLoggedUser({
					sServiceName: sEntitySet,
					sRequestType: "read",
					Application: appKey
				}, function (LoginID) {
					if (sEntitySet === "ConfigTypsetTypeValues") {
						oFilters = oPPCCommon.setODataModelReadFilter("", "", oFilters, "LoginId", "", [LoginID], false, false, false);
					} else {
						oFilters = oPPCCommon.setODataModelReadFilter("", "", oFilters, "LoginID", "", [LoginID], false, false, false);
					}
					oModel.read("/" + sEntitySet, {
						filters: oFilters,
						success: function (oData) {
							if (oData.results.length > 0) {
								if (defaultValue != null && defaultValue != undefined && defaultValue != "" && (oData.results.length != 1 || ((
										defaultValue == "None" || defaultValue == "Select") && bMustAddNone))) {
									aDDValue.push({
										Key: "",
										Text: "(" + defaultValue + ")"
									});
								}
								for (var i = 0; i < oData.results.length; i++) {
									aDDValue.push({
										Key: oData.results[i][sKey],
										Text: oData.results[i][sText],
										Seperator: " - "
									});
								}
								var oDDModel = new sap.ui.model.json.JSONModel();
								oDDModel.setData(aDDValue);
								if (mParameters) {
									if (mParameters.bSetSizeLimit) {
										oDDModel.setSizeLimit(aDDValue.length);
									}
								}
								view.setModel(oDDModel, modelName);
							}
							if (requestCompleted)
								requestCompleted(aDDValue);
						},
						error: function (error) {
							busyDialog.close();
							com.arteriatech.ppc.utils.js.Common.showServiceErrorPopup(error);
						}
					});
				});
				// }
				// else {
				// 	oModel.read("/"+sEntitySet, {
				// 		filters: oFilters,
				// 		success: function(oData){
				// 			if(oData.results.length > 0)
				// 			{
				// 				if((oData.results.length != 1 || ((defaultValue == "None" || defaultValue == "Select") && bMustAddNone)) && defaultValue != null && defaultValue != undefined && defaultValue != "")
				// 				{
				// 					aDDValue.push({Key: "", Text: "("+defaultValue+")"});
				// 				}
				// 				for(var i=0; i<oData.results.length; i++)
				// 				{
				// 					aDDValue.push({
				// 						Key 	:	oData.results[i][sKey],
				// 						Text :	oData.results[i][sText],
				// 						Seperator 	:	" - "
				// 					});
				// 				}
				// 				var oDDModel = new sap.ui.model.json.JSONModel();    
				// 				oDDModel.setData(aDDValue); 
				// 				if(mParameters){
				//                             if(mParameters.bSetSizeLimit){
				//                                 oDDModel.setSizeLimit(aDDValue.length);
				//                             }
				//                         }
				// 				view.setModel(oDDModel, modelName);
				// 			}
				// 			if(requestCompleted) 
				// 				requestCompleted(aDDValue);
				// 		}, 
				// 		error: function(error)
				// 		{
				// 			busyDialog.close();
				// 			com.arteriatech.ppc.utils.js.Common.showServiceErrorPopup(error);
				// 		}
				// 	});
				// }
			} else {
				var oDDModel = new sap.ui.model.json.JSONModel();
				oDDModel.setData([]);
				view.setModel(oDDModel, modelName);
				if (requestCompleted) {
					requestCompleted([]);
				}
			}
		},
		setDMSDivDD: function () {
			var that = this;
			var gListPageView = this.getView();
			var oModelData = this._oComponent.getModel("PCGW");
			var aDMSDivF4Filter = new Array();
			// aDMSDivF4Filter = oPPCCommon.setODataModelReadFilter("", "", aDMSDivF4Filter, "LoginID", "", [oProductCommon.getCurrentUsers(
			// 	"ChannelPartners", "read")], false, false, false);
			aDMSDivF4Filter = oPPCCommon.setODataModelReadFilter("", "", aDMSDivF4Filter, "ModelID", "", ["SSGW_MST"], false, false, false);
			aDMSDivF4Filter = oPPCCommon.setODataModelReadFilter("", "", aDMSDivF4Filter, "EntityType", "", ["ChannelPartner"], false,
				false,
				false);
			aDMSDivF4Filter = oPPCCommon.setODataModelReadFilter("", "", aDMSDivF4Filter, "PropName", "", ["DMSDiv"], false, false, false);
			/*aDMSDivF4Filter = oPPCCommon.setODataModelReadFilter("", "", aDMSDivF4Filter, "ParentID", sap.ui.model.FilterOperator.EQ, ["01"],
				false, false, false);*/
			that.getDropdown(oModelData, "ValueHelps", aDMSDivF4Filter, "ID", "Description", busyDialog,
				gListPageView,
				"DMSDivisionDD", "",
				function (oData) {
					if (oData) {
						gListPageView.setBusy(false);
						// var sDmsDiv = oPPCCommon.getPropertyValueFromContextPath(that.contextPath, "DMSDivision");
						// if (sDmsDiv)
						// 	that.getView().byId("inputDMSDivision").setSelectedKeys(sDmsDiv.split(";"));
						if (oData.length === 1) {
							that.getView().byId("inputDMSDivision").setSelectedKeys(oData[0].Key);
							//	that.setMaterialModel();

						}
					}
				});
			if (this.setDMSDivDD_Exit) {
				this.setDMSDivDD_Exit();
			}
		},
		setReasonDD: function () {
			// var gSADetailView = this.getView();
			var oModelData = this._oComponent.getModel("PCGW");
			var oMarketDDFilter = new Array();
			oMarketDDFilter = oPPCCommon.setODataModelReadFilter(this.getView(), "", oMarketDDFilter, "Typeset", sap.ui.model.FilterOperator
				.EQ, ["STKADR"], false, false, false);
			this.getDropdown(oModelData, "ConfigTypesetTypes", oMarketDDFilter, "Types", "TypesName", busyDialog,
				this.getView(),
				"ReasonDD", "Select",
				function (oData) {
					if (oData.length > 0) {
						// sap.m.messageToast("");
					}
				});
			if (this.setReasonDD_Exit) {
				this.setReasonDD_Exit();
			}
		},
		StockTypesDD: function () {

			var that = this;
			// var gSADetailView = this.getView();
			var oModelData = this._oComponent.getModel("PCGW");
			var oMarketDDFilter = new Array();
			oMarketDDFilter = oPPCCommon.setODataModelReadFilter(this.getView(), "", oMarketDDFilter, "Typeset", sap.ui.model.FilterOperator
				.EQ, ["STKTPS"], false, false, false);
			that.getDropdown(oModelData, "ConfigTypesetTypes", oMarketDDFilter, "Types", "TypesName", busyDialog,
				this.getView(),
				"StockTypes", "Select",
				function (oData) {
					if (oData.length === 1) {
						gList.getModel("StockTypes").setProperty("/Key", oData[0].Key);
						that.setMaterialModel();
						that.setSKUGRPModel();

						// sap.m.messageToast("");
					}
				});
			if (this.StockTypesDD_Exit) {
				this.StockTypesDD_Exit();
			}
		},

		stockSubType: function () {
			var that = this;
			var oModelData = this._oComponent.getModel("PCGW");
			var oMarketDDFilter = new Array();
			oMarketDDFilter = oPPCCommon.setODataModelReadFilter(this.getView(), "", oMarketDDFilter, "Typeset", sap.ui.model.FilterOperator
				.EQ, ["BLKSST"], false, false, false);
			this.getDropdown(oModelData, "ConfigTypesetTypes", oMarketDDFilter, "Types", "TypesName", busyDialog,
				this.getView(),
				"StockSubTypes", "Select",
				function (oData) {
					if (oData.length > 0) {
						// sap.m.messageToast("");
					}
					if (oData.length === 1) {

					}
				});
			if (this.stockSubType_Exit) {
				this.stockSubType_Exit();
			}
		},
		callBusyDialog: function () {
			this.iTotalDDs--;
			if (this.iTotalValueHelps === 0) {
				gList.setBusy(false);
			}
		},

		/*------------------------------------------Value Help----------------------------------------*/
		/*--------Add Validator--------------*/
		setValuehelpPropety: function () {
			var that = this;
			// var tokenTextLength = that.getView().getModel("LocalViewSetting").getProperty("/tokenTextLength");
			var tokenTextLength = 15;
			//Customer F4
			this.CustomerTokenInput = this.getView().byId("inputCustomerNo");
			this.aCustomerKeys = ["CustomerNo", "Name"];
			this.aBatchKeys = ["Batch", "Batch"];
			// this.CustomerTokenInput.addValidator(function (args) {
			// 	//declare basic peoperties based on model
			// 	var oDataModel = that._oComponent.getModel("SFGW_MST");
			// 	//call getTokenForInput
			// 	args.text = args.text.toUpperCase();
			// 	var F4Filters = new Array();
			// 	var fCustomerNo = new sap.ui.model.Filter("CustomerNo", sap.ui.model.FilterOperator.EQ, args.text);
			// 	F4Filters.push(fCustomerNo);
			// 	oProductCommon.getTokenForInput(args, oDataModel, "Customers", F4Filters, "CustomerNo", "Name", that.CustomerTokenInput,
			// 		"Customer",
			// 		function (tokens, isTokenExist, aData) {
			// 			that.sCustomer = tokens.mProperties.key;
			// 			that.sCustomerName = tokens.mProperties.text.split(" (")[0];
			// 			that.CustomerTokenInput = that.getView().byId("inputCustomerNo");
			// 			that.CustomerTokenInput.removeAllTokens();
			// 			var oToken = new sap.m.Token({
			// 				key: that.sCustomer,
			// 				text: that.TextAbstract(that.sCustomerName, that.sCustomer, 5),
			// 				tooltip: that.sCustomerName + " (" + that.sCustomer + ")"
			// 			});
			// 			that.CustomerTokenInput.addToken(oToken);
			// 			// tokens.forEach(function (eachElement) {	
			// 			tokens.setTooltip(tokens.mProperties.text);
			// 			// tokens.mProperties.text = that.TextAbstract(tokens.mProperties.text.split("(")[0].trim(), tokens.mProperties
			// 			// 	.key, tokenTextLength);
			// 			// });
			// 			if (isTokenExist) {
			// 				that.getView().getModel("MaterialDocs").setProperty("/FromGUID", aData[0].CustomerNo);
			// 				that.getView().getModel("MaterialDocs").setProperty("/ToGUID", aData[0].CustomerNo);
			// 				that.getView().getModel("MaterialDocs").setProperty("/CPTypeID", "01");
			// 				// that.getView().getModel("MaterialDocs").setProperty("/ToGUID", aData[0].CustomerNo);
			// 			}
			// 		});

			// });
			/*this.SKUGrpTokenInput = this.getView().byId("inputSKUGroup");
			this.SKUGrpKeys = ["SKUGroup", "SKUGroupDesc"];
			this.SKUGrpTokenInput.addValidator(function(SKGargs) {
				var oDataModel = that._oComponent.getModel("SSGW_MM");
				SKGargs.text = SKGargs.text.toUpperCase();
				var sKGrpF4Filters = new Array();
				var fSKUGrp = new sap.ui.model.Filter("SKUGroup", sap.ui.model.FilterOperator.EQ, SKGargs.text);
				sKGrpF4Filters.push(fSKUGrp);
				oProductCommon.getTokenForInput(SKGargs, oDataModel, "CPStockItems", sKGrpF4Filters, "SKUGroup", "SKUGroupDesc", that.SKUGrpTokenInput,
					"SKUGroup");
			});*/
			if (this.setValuehelpPropety_Exit) {
				this.setValuehelpPropety_Exit();
			}
		},

		getAllSelectedCustomerName: function () {
			var customerName = "";
			if (this.sCustomerInputType === "DD") {
				customerName = this.getCustomerName();
			} else if (this.sCustomerInputType === "MC") {
				var aCustomer = this.getView().byId("customerMultiCombo").getSelectedItems();
				if (aCustomer.length > 0) {
					customerName = aCustomer[0].getText().split(" - ")[1] + " (" + aCustomer[0].getText().split(" - ")[0] + ")";
					for (var i = 1; i < aCustomer.length; i++) {
						customerName += "; " + aCustomer[i].getText().split(" - ")[1] + " (" + aCustomer[i].getText().split(" - ")[0] + ")";
					}
				}
			} else if (this.sCustomerInputType === "VH") {
				customerName = oPPCCommon.getTextFromTokens(this.getView(), "inputCustomerNo");
			}

			if (customerName === "") {
				customerName = "(All)";
			}
			return customerName;
		},
		MaterialNoF4: function (oEvent) {
			var that = this;
			var tokenTextLength = that.getView().getModel("LocalViewSetting").getProperty("/tokenTextLength");
			oPPCCommon.removeAllMsgs();
			var index = oEvent.getSource().getId().slice(-1);
			index = parseInt(oEvent.getSource().getBindingContext("ListItems").getPath().split("/")[1]);
			var itemIndex = parseInt(index);
			this.validateMandatory();
			var SOCreateItem = this.getView().getModel("ListItems");
			var aItems = SOCreateItem.getProperty('/');
			var oBindingContext = oEvent.getSource().getBindingContext("ListItems");
			var cells = this.getView().byId("UIListTableOther").getRows()[itemIndex].getCells();
			for (var j = 0; j < cells.length; j++) {
				if (cells[j].getId().indexOf("inputOtherMaterial") !== -1) {
					this.MaterialInput = this.getView().byId(cells[j].getId());
				}
			}
			if (oPPCCommon.doErrMessageExist()) {
				var fDMSDivision = oPPCCommon.getKeysFromMultiCombo(this.getView(), "inputsDMSDivision");
				this.MaterialKeys = ["MaterialNo", "MaterialDesc"];
				that.materialF4({
					oController: this,
					oi18n: oi18n,
					oUtilsI18n: oUtilsI18n,
					controlID: "inputSKUGroup",
					modelID: "SFGW_MST",
					entityType: "Materials",
					tokenInput: this.MaterialInput,
					defaultVisible: false,
					dmsDivision: fDMSDivision
						// sCustomerCode: that.getSelectedCustomerCode(),
						// sCustomerName: that.getAllSelectedCustomerName()
				}, function (oTokens) {

					oTokens.forEach(function (eachtoken) {
						eachtoken.setTooltip(eachtoken.mProperties.text);
						eachtoken.mProperties.text = that.TextAbstract(eachtoken.mProperties.text.split("(")[0].trim(), eachtoken.mProperties.key,
							tokenTextLength);
					});
					that.MaterialInput.setTokens(oTokens);

					that.addItemstoOtherTable(oTokens, itemIndex);

				});
			} else {
				oPPCCommon.displayMsg_MsgBox(this.getView(), oPPCCommon.getMsgsFromMsgMgr(), "error");
			}
		},
		addItemstoOtherTable: function (tokens, itemIndex) {
			var that = this;
			var mateData = tokens[0].getCustomData()[0].getProperty("value");
			var UMOArray = [{
				Uom: mateData.BaseUom
			}, {
				Uom: mateData.AlternativeUOM1
			}];
			this.getView().getModel("ListItems").setProperty("/" + itemIndex + "/MaterialNo", mateData.MaterialNo);
			this.getView().getModel("ListItems").setProperty("/" + itemIndex + "/MaterialDesc", mateData.MaterialDesc);
			that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/OrderMaterialGroupID", mateData.ProdHier);
			that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/OrderMaterialGroupDesc", mateData.ProdHierDesc);
			that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/DMSDivision", mateData.DivisionID);
			that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/UOMs", UMOArray);
			this.checkForNewLineItem();
		},
		addItemstoTable: function (tokens) {
			var that = this;
			//	var addStkItem = this.getView().getModel("ListItems");
			var aItems = this.getView().getModel("ListItems").getData();
			if (aItems.length === 0) {
				for (var i = 0; i < tokens.length; i++) {
					var mateData = tokens[i].getCustomData()[0].getProperty("value");
					aItems.push({
						MaterialNo: mateData.MaterialNo,
						MaterialDesc: mateData.MaterialDesc,
						CPStockItemGUID: oPPCCommon.generateUUID(),
						ExpiryDate: null,
						OrderMaterialGroupID: mateData.MaterialGrp,
						OrderMaterialGroupDesc: mateData.MaterialGrpDesc,
						ManufacturingDate: null,
						GQuantity: "0",
						DQuantity: "0",
						SQuantity: "0",
						Currency: "",
						UOM: "",
						Batch: "",
						BatchValueState: "None",
						BatchValueStateText: "",
						PurchasePrice: "0.00",
						UOMValueState: "None",
						UOMValueStateText: "",
						MRP: mateData.MRP,
						MRPValueState: "None",
						MRPValueStateText: "",
						UnitPrice: "0.00",
						UnitPriceValueState: "None",
						UnitPriceValueStateText: "",
						InvoiceItemGUID: "",
						QuantityValueState: "None",
						MDateValueState: "None",
						MDateValueStateText: "",
						EDateValueState: "None",
						EDateValueStateText: "",
						Remarks: "",
						RemarksState: "None",
						DeletionInd: "",
						BatchOrSerial: ""
					});
				}
			} else {
				for (var k = 0; k < tokens.length; k++) {
					var exists = false;
					var mateData = tokens[k].getCustomData()[0].getProperty("value");
					for (var j = 0; j < aItems.length; j++) {
						if (mateData.MaterialNo === aItems[j].MaterialNo) {
							exists = true;
						}
					}
					if (!exists) {
						aItems.push({
							MaterialNo: mateData.MaterialNo,
							MaterialDesc: mateData.MaterialDesc,
							CPStockItemGUID: oPPCCommon.generateUUID(),
							ExpiryDate: null,
							OrderMaterialGroupID: mateData.MaterialGrp,
							OrderMaterialGroupDesc: mateData.MaterialGrpDesc,
							ManufacturingDate: null,
							GQuantity: "0",
							DQuantity: "0",
							SQuantity: "0",
							UnitPrice: "0.00",
							PurchasePrice: "0.00",
							Currency: "",
							BatchValueState: "None",
							BatchValueStateText: "",
							UOMValueState: "None",
							UOMValueStateText: "",
							MRPValueState: "None",
							MRPValueStateText: "",
							UnitPriceValueState: "None",
							UnitPriceValueStateText: "",
							UOM: "",
							Batch: "",
							MRP: mateData.MRP,
							InvoiceItemGUID: "",
							QuantityValueState: "None",
							Remarks: "",
							RemarksState: "None",
							DeletionInd: "",
							BatchOrSerial: ""
						});
					} else {
						oPPCCommon.addMsg_MsgMgr(mateData.MaterialNo + " already Exists", "error", "Material");
					}
				}
			}
			this.getView().getModel("ListItems").setProperty("/", aItems);
			this.getView().getModel("LocalViewSetting").setProperty("/ListItemsCount", aItems.length);
			if (!oPPCCommon.doErrMessageExist()) {
				this.popUp();
			}
		},
		materialF4: function (mParameters, requestCompleted) {
			mParameters.bMultiSelect = false;
			var sBasicSearchText = "";
			var oValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
				basicSearchText: sBasicSearchText,
				title: 'Materials',
				supportMultiselect: mParameters.bMultiSelect,
				supportRanges: false,
				supportRangesOnly: false,
				key: mParameters.oController.MaterialKeys[0],
				descriptionKey: mParameters.oController.MaterialKeys[1],
				stretch: sap.ui.Device.system.phone,
				ok: function (oControlEvent) {
					if (!mParameters.isByPlusButton) {
						if (requestCompleted) {
							requestCompleted(oControlEvent.getParameter("tokens"));
						}
					} else {
						if (requestCompleted) {
							requestCompleted(oControlEvent.getParameter("tokens"));
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
			this.MaterialF4Columns(oValueHelpDialog, mParameters);
			this.MaterialF4FilterBar(oValueHelpDialog, mParameters);
			if (sap.ui.Device.support.touch === false) {
				oValueHelpDialog.addStyleClass("sapUiSizeCompact");
			}
			oValueHelpDialog.open();
			if (mParameters.oController.SKUGrpTokenInput) {
				oValueHelpDialog.setTokens(mParameters.oController.SKUGrpTokenInput.getTokens());
			}
		},
		MaterialF4FilterBar: function (oValueHelpDialog, mParameters) {
			var that = this;
			var sSKUGroupLabel = "Material No";
			var sSKUGroupDescLabel = "Material Desc";
			var oTokenInputValue = "";
			var code = new sap.m.Input({
				value: oTokenInputValue,
				maxLength: oPPCCommon.getMaxLengthFromMetadata({
					oDataModel: mParameters.oController.getView().getModel("SFGW_MST"),
					sEntityType: "Material",
					sPropertyName: "MaterialNo",
					oUtilsI18n: mParameters.oUtilsI18n
				})
			});
			var desc = new sap.m.Input({
				maxLength: oPPCCommon.getMaxLengthFromMetadata({
					oDataModel: mParameters.oController.getView().getModel("SFGW_MST"),
					sEntityType: "Material",
					sPropertyName: "MaterialDesc",
					oUtilsI18n: mParameters.oUtilsI18n
				})
			});
			oValueHelpDialog.setFilterBar(new sap.ui.comp.filterbar.FilterBar({
				advancedMode: true,
				filterGroupItems: [
					new sap.ui.comp.filterbar.FilterGroupItem({
						groupName: "gn1",
						name: "n1",
						label: sSKUGroupLabel,
						control: code
					}),
					new sap.ui.comp.filterbar.FilterGroupItem({
						groupName: "gn1",
						name: "n2",
						label: sSKUGroupDescLabel,
						control: desc
					})
				],
				search: function (oEvent) {
					var codeValue = code.getValue();
					var descValue = desc.getValue();
					var aSKgroupF4Filter = new Array();
					aSKgroupF4Filter = oPPCCommon.setODataModelReadFilter("", "", aSKgroupF4Filter, "LoginID", "", [
						oProductCommon.getCurrentUsers("Materials", "read")
					], false, false, false);
					aSKgroupF4Filter = oPPCCommon.setODataModelReadFilter("", "", aSKgroupF4Filter, "MaterialNo", "", [
						codeValue
					], false, false, false);
					aSKgroupF4Filter = oPPCCommon.setODataModelReadFilter("", "", aSKgroupF4Filter, "MaterialDesc", "", [
						descValue
					], false, false, false);
					aSKgroupF4Filter = oPPCCommon.setODataModelReadFilter("", "", aSKgroupF4Filter, "DivisionID", "", mParameters.dmsDivision
						.split(
							";"), true, false, false);
					var oSSGWMMModel = mParameters.oController._oComponent.getModel("SFGW_MST");
					oSSGWMMModel.attachRequestSent(function () {
						busyDialog.open();
					});
					oSSGWMMModel.attachRequestCompleted(function () {
						busyDialog.close();
					});
					oSSGWMMModel.setHeaders({
						"x-arteria-loginid": oProductCommon.getCurrentUsers("Materials", "read")
					});
					oSSGWMMModel.read("/Materials", {
						filters: aSKgroupF4Filter,
						success: function (oData) {
							var MaterialsModel = new sap.ui.model.json.JSONModel();
							if (oValueHelpDialog.getTable().bindRows) {
								oValueHelpDialog.getTable().clearSelection();
								MaterialsModel.setData(oData.results);
								oValueHelpDialog.getTable().setModel(MaterialsModel);
								oValueHelpDialog.getTable().bindRows("/");
								if (oData.results.length === 0) {
									oValueHelpDialog.getTable().setNoData(mParameters.oUtilsI18n.getText("common.NoResultsFound"));
								}
							} else {
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
								oValueHelpDialog.getTable().getModel().setProperty("/", {});
							}
							oValueHelpDialog.getTable().setNoData(mParameters.oUtilsI18n.getText("common.NoResultsFound"));
							oCommonValueHelp.dialogErrorMessage(error, "No Data Found");
						}
					});
				},
				reset: function () {}
			}));
		},
		MaterialF4Columns: function (oValueHelpDialog, mParameters) {
			var sMaterialNoLabel = "Material No";
			var sMaterialDescLabel = "Material Desc";
			if (oValueHelpDialog.getTable().bindItems) {
				var oColModel = new sap.ui.model.json.JSONModel();
				oColModel.setData({
					cols: [{
						label: sMaterialNoLabel,
						template: "MaterialNo"
					}, {
						label: sMaterialDescLabel,
						template: "MaterialNo"
					}]
				});
				oValueHelpDialog.getTable().setModel(oColModel, "columns");
			} else {
				oValueHelpDialog.getTable().addColumn(
					new sap.ui.table.Column({
						label: new sap.m.Text({
							text: sMaterialNoLabel
						}),
						template: new sap.m.Text({
							text: "{MaterialNo}"
						}),
						sortProperty: "MaterialNo",
						filterProperty: "MaterialNo"
					}));
				oValueHelpDialog.getTable().addColumn(
					new sap.ui.table.Column({
						label: new sap.m.Text({
							text: sMaterialDescLabel
						}),
						template: new sap.m.Text({
							text: "{MaterialDesc}"
						}),
						sortProperty: "MaterialDesc",
						filterProperty: "MaterialDesc"
					}));
				oValueHelpDialog.getTable().setNoData(
					mParameters.oUtilsI18n.getText("common.NoItemSelected"));
			}

		},
		SKUGroupF4: function () {
			oPPCCommon.removeAllMsgs();
			this.validateMandatory("", "");
			if (oPPCCommon.doErrMessageExist()) {
				var that = this;
				var fDMSDivision = oPPCCommon.getKeysFromMultiCombo(this.getView(), "inputDMSDivision");
				this.SKUGrpTokenInput = this.getView().byId("inputSKUGroup");
				this.SKUGrpKeys = ["OrderMaterialGroupID", "OrderMaterialGroupDesc"];
				that.selectedSKUGrpF4({
					oController: this,
					oi18n: oi18n,
					oUtilsI18n: oUtilsI18n,
					controlID: "inputSKUGroup",
					modelID: "SFGW_MST",
					entityType: "OrderMaterialGroups",
					tokenInput: this.SKUGrpTokenInput,
					defaultVisible: false,
					dmsDivision: fDMSDivision
						// sCustomerCode: that.getSelectedCustomerCode(),
						// sCustomerName: that.getAllSelectedCustomerName()
				}, function (tokens) {
					var tokenTextLength = 10

					tokens.forEach(function (eachtoken) {
						eachtoken.setTooltip(eachtoken.mProperties.text);
						eachtoken.mProperties.text = that.TextAbstract(eachtoken.mProperties.text.split("(")[0].trim(), eachtoken.mProperties.key,
							tokenTextLength);
					});
					that.SKUGrpTokenInput.setTokens(tokens);

					if (that.getView().getModel("ListItems")) {
						that.getView().getModel("ListItems").setProperty("/", []);
					}
					that.getView().getModel("LocalViewSetting").setProperty("/ListItemsCount", 1);
					var prdFrValue = that.getView().getModel("LocalViewSetting").getProperty("/ProductFeatureValue");
					if (that.getView().getModel("LocalViewSetting").getProperty("/StockMaterial")) {
						if (prdFrValue !== "X") {
							that.setDataModel();
						}
					} else {
						that.setDataModel();
					}
					// that.getView().byId("inputDMSDivision").setSelectedKeys([]);
					//	that.getView().byId("inputMaterial1").removeAllTokens();

					that.setMaterialModel();
				});
			} else {
				oPPCCommon.displayMsg_MsgBox(this.getView(), oPPCCommon.getMsgsFromMsgMgr(), "error");
			}
		},
		selectedSKUGrpF4: function (mParameters, requestCompleted) {
			if (mParameters.controlID === undefined || mParameters.controlID === null) {
				mParameters.controlID = "inputSKUGroup";
			}
			if (mParameters.bMultiSelect === undefined || mParameters.bMultiSelect === null) {
				mParameters.bMultiSelect = true;
			}
			var sBasicSearchText = "";
			var oTokenMaterialInput = "";
			if (mParameters.oController.SKUGrpTokenInput) {
				oTokenMaterialInput = mParameters.oController.SKUGrpTokenInput.getValue();
			}
			if (!mParameters.isByPlusButton) {
				sBasicSearchText = oTokenMaterialInput;
			}
			var oValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
				basicSearchText: sBasicSearchText,
				title: mParameters.oi18n.getText("List.ValueHelp.SKUGroup"),
				supportMultiselect: mParameters.bMultiSelect,
				supportRanges: false,
				supportRangesOnly: false,
				key: mParameters.oController.SKUGrpKeys[0],
				descriptionKey: mParameters.oController.SKUGrpKeys[1],
				stretch: sap.ui.Device.system.phone,
				ok: function (oControlEvent) {
					var tokenTextLength = 10;
					if (!mParameters.isByPlusButton) {
						var tokens = oControlEvent.getParameter("tokens");
						tokens.forEach(function (eachElement) {
							var Text1 = eachElement.mProperties.key;
							var Text = eachElement.mProperties.text;
							eachElement.mProperties.text = mParameters.oController.TextAbstract(Text, Text1, tokenTextLength);
							eachElement.setTooltip(Text + " (" + Text1 + ")");
						});

						mParameters.oController.SKUGrpTokenInput.setTokens(tokens);
						mParameters.oController.getView().byId(mParameters.controlID).setValueState(sap.ui.core.ValueState.None);
						mParameters.oController.getView().byId(mParameters.controlID).setValueStateText("");

						if (requestCompleted) {
							requestCompleted(mParameters.oController.SKUGrpTokenInput.getTokens());
						}
					} else {
						if (requestCompleted) {
							requestCompleted(oControlEvent.getParameter("tokens"));
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
			this.setSKUGrpF4Columns(oValueHelpDialog, mParameters);
			this.setSKUGrpF4FilterBar(oValueHelpDialog, mParameters);
			if (sap.ui.Device.support.touch === false) {
				oValueHelpDialog.addStyleClass("sapUiSizeCompact");
			}
			oValueHelpDialog.open();
			if (mParameters.oController.SKUGrpTokenInput) {
				oValueHelpDialog.setTokens(mParameters.oController.SKUGrpTokenInput.getTokens());
			}
		},
		setSKUGrpF4Columns: function (oValueHelpDialog, mParameters) {
			var sMaterialNoLabel = "SKU Group ID";
			var sMaterialDescLabel = "SKU Group Desc";
			if (oValueHelpDialog.getTable().bindItems) {
				var oColModel = new sap.ui.model.json.JSONModel();
				oColModel.setData({
					cols: [{
						label: sMaterialNoLabel,
						template: "OrderMaterialGroupID"
					}, {
						label: sMaterialDescLabel,
						template: "OrderMaterialGroupDesc"
					}]
				});
				oValueHelpDialog.getTable().setModel(oColModel, "columns");
			} else {
				oValueHelpDialog.getTable().addColumn(
					new sap.ui.table.Column({
						label: new sap.m.Text({
							text: sMaterialNoLabel
						}),
						template: new sap.m.Text({
							text: "{OrderMaterialGroupID}"
						}),
						sortProperty: "OrderMaterialGroupID",
						filterProperty: "OrderMaterialGroupID"
					}));
				oValueHelpDialog.getTable().addColumn(
					new sap.ui.table.Column({
						label: new sap.m.Text({
							text: sMaterialDescLabel
						}),
						template: new sap.m.Text({
							text: "{OrderMaterialGroupDesc}"
						}),
						sortProperty: "OrderMaterialGroupDesc",
						filterProperty: "OrderMaterialGroupDesc"
					}));
				oValueHelpDialog.getTable().setNoData(
					mParameters.oUtilsI18n.getText("common.NoItemSelected"));
			}
		},
		setSKUGrpF4FilterBar: function (oValueHelpDialog, mParameters) {
			var sSKUGroupLabel = "SKU Group ID";
			var sSKUGroupDescLabel = "SKU Group Desc";
			var oTokenInputValue = "";
			if (mParameters.oController.SKUGrpTokenInput) {
				oTokenInputValue = mParameters.oController.SKUGrpTokenInput.getValue();
			}
			var code = new sap.m.Input({
				value: oTokenInputValue,
				maxLength: oPPCCommon.getMaxLengthFromMetadata({
					oDataModel: mParameters.oController.getView().getModel("SSGW_MM"),
					sEntityType: "CPStockItem",
					sPropertyName: "OrderMaterialGroupID",
					oUtilsI18n: mParameters.oUtilsI18n
				})
			});
			var desc = new sap.m.Input({
				maxLength: oPPCCommon.getMaxLengthFromMetadata({
					oDataModel: mParameters.oController.getView().getModel("SSGW_MM"),
					sEntityType: "CPStockItem",
					sPropertyName: "OrderMaterialGroupDesc",
					oUtilsI18n: mParameters.oUtilsI18n
				})
			});
			oValueHelpDialog.setFilterBar(new sap.ui.comp.filterbar.FilterBar({
				advancedMode: true,
				filterGroupItems: [
					new sap.ui.comp.filterbar.FilterGroupItem({
						groupName: "gn1",
						name: "n1",
						label: sSKUGroupLabel,
						control: code
					}),
					new sap.ui.comp.filterbar.FilterGroupItem({
						groupName: "gn2",
						name: "n2",
						label: sSKUGroupDescLabel,
						control: desc
					})
				],
				search: function (oEvent) {
					var codeValue = code.getValue();
					var descValue = desc.getValue();
					var aSKgroupF4Filter = new Array();
					aSKgroupF4Filter = oPPCCommon.setODataModelReadFilter("", "", aSKgroupF4Filter, "LoginID", "", [
						oProductCommon.getCurrentUsers("OrderMaterialGroups", "read")
					], false, false, false);
					aSKgroupF4Filter = oPPCCommon.setODataModelReadFilter("", "", aSKgroupF4Filter, "DMSDivision", "", mParameters.dmsDivision
						.split(
							";"), true, false, false);
					aSKgroupF4Filter = oPPCCommon.setODataModelReadFilter(mParameters.oController.getView(), "",
						aSKgroupF4Filter, "OrderMaterialGroupID", "", [codeValue], false, false, false);
					aSKgroupF4Filter = oPPCCommon.setODataModelReadFilter(mParameters.oController.getView(), "",
						aSKgroupF4Filter, "OrderMaterialGroupDesc", "", [descValue], false, false, false);
					var oSSGWMMModel = mParameters.oController._oComponent.getModel("SFGW_MST");
					oSSGWMMModel.attachRequestSent(function () {
						busyDialog.open();
					});
					oSSGWMMModel.attachRequestCompleted(function () {
						busyDialog.close();
					});
					oSSGWMMModel.setHeaders({
						"x-arteria-loginid": oProductCommon.getCurrentUsers("OrderMaterialGroups", "read")
					});
					oSSGWMMModel.read("/OrderMaterialGroups", {
						filters: aSKgroupF4Filter,
						success: function (oData) {
							var data = [];
							if (data.length === 0) {
								data.push(oData.results[0]);
							}
							for (var i = 0; i < oData.results.length; i++) {
								var exists = false;
								for (var j = 0; j < data.length; j++) {
									if (data[j].OrderMaterialGroupID === oData.results[i].OrderMaterialGroupID) {
										exists = true;
									}
								}
								if (!exists) {
									data.push(oData.results[i]);
								}
							}
							var MaterialsModel = new sap.ui.model.json.JSONModel();
							if (oValueHelpDialog.getTable().bindRows) {
								oValueHelpDialog.getTable().clearSelection();
								MaterialsModel.setData(data);
								oValueHelpDialog.getTable().setModel(MaterialsModel);
								oValueHelpDialog.getTable().bindRows("/");
								if (oData.results.length === 0) {
									oValueHelpDialog.getTable().setNoData(mParameters.oUtilsI18n.getText("common.NoResultsFound"));
								}
							} else {
								var oRowsModel = new sap.ui.model.json.JSONModel();
								oRowsModel.setData(data);
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
								oValueHelpDialog.getTable().getModel().setProperty("/", {});
							}
							oValueHelpDialog.getTable().setNoData(mParameters.oUtilsI18n.getText("common.NoResultsFound"));
							oCommonValueHelp.dialogErrorMessage(error, "No Data Found");
						}
					});
				},
				reset: function () {}
			}));
		},

		/*------------------------------------------Table Filter, Sorter & Export to EXCEL-------------------------------------*/
		handleViewSettingsDialogButtonPressed: function (oEvent) {
			if (!this.ListDialog) {
				this.ListDialog = sap.ui.xmlfragment("com.arteria.ss.stockadjustmnt.create.util.Dialog", this);
			}
			var oModel = this.getView().getModel("<ToAdd Model Name> Eg: PSGW_PUR");
			this.ListDialog.setModel(oModel, "<ToAdd Model Name> Eg: PSGW_PUR");
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.ListDialog);
			this.ListDialog.open();
		},
		sorterFilterSTK: function () {
			if (!this._busyDialog) {
				this._busyDialog = sap.ui.xmlfragment("com.arteria.ss.stockadjustmnt.create.util.Dialog", this);
			}
			var oModel = this.getView().getModel("SSGW_MM");
			this._busyDialog.setModel(oModel, "SSGW_MM");
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._busyDialog);
			this._busyDialog.open();
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
					if (that.sCustomerInputType === "VH") {
						if (that.getView().byId("inputDistributor").getTokens().length !== 1) {
							oPPCCommon.setGroupInTable(oView, "ListTable", "CustomerNo", true, "Customer", "CustomerName", aDefaultSorter);
						}
					}
				}
			}, oCustomFilter);
		},
		exportToExcel: function (oEvent) {
			if (Device.system.desktop) {
				oPPCCommon.copyAndApplySortingFilteringFromUITable({
					thisController: this,
					mTable: this.getView().byId("ListTable"),
					uiTable: this.getView().byId("UIListTable")
				});
			}
			var table = this.getView().byId("ListTable");
			var oModel = this.getView().getModel("ListItems");
			oPPCCommon.exportToExcel(table, oModel);
		},
		deleteItem: function (oEvent) {
			var path = oEvent.getSource().getBindingContext("ListItems").getPath().split("")[1];
			oEvent.getSource().getBindingContext("ListItems").getModel().getData().splice(path, 1);
			oEvent.getSource().getBindingContext("ListItems").getModel().refresh();
			var datalength = oEvent.getSource().getBindingContext("ListItems").getModel().getData().length;
			this._oComponent.getModel("LocalViewSetting").setProperty("/ListItemsCount", datalength);

		},
		/*----------------------------------------------Navigation-------------------------------------------------------*/
		gotoDetails: function (GUID) {
			var path = "StockAdjustmentDetail(MaterialDocGUID='" + GUID + "')";
			oPPCCommon.crossAppNavigation("ssstkadjcreate", "ssstockadmnt", "Display", "ssstkadjcreate", "ssstockadmnt",
				"/View/" + path);
			if (this.gotoDetail_Exit) {
				this.gotoDetail_Exit();
			}
			/*this._oRouter.navTo("DetailPage", {
					contextPath: path
				}, false);*/
		},
		cpStockF4: function (mParameters, requestCompleted) {
			if (mParameters.controlID === undefined || mParameters.controlID === null) {
				mParameters.controlID = "inputMaterial";
			}
			if (mParameters.bMultiSelect === undefined || mParameters.bMultiSelect === null) {
				mParameters.bMultiSelect = true;
			}
			var oTokenMaterialInput = "";
			if (mParameters.oController.MaterialInput) {
				oTokenMaterialInput = mParameters.oController.MaterialInput.getValue();
			}
			var oValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
				basicSearchText: oTokenMaterialInput,
				title: mParameters.oi18n.getText("List.ValueHelp.Material.header"),
				supportMultiselect: mParameters.bMultiSelect,
				supportRanges: false,
				supportRangesOnly: false,
				key: mParameters.oController.aKeys[0],
				descriptionKey: mParameters.oController.aKeys[1],
				stretch: sap.ui.Device.system.phone,
				ok: function (oControlEvent) {
					if (mParameters.oController.MaterialInput) {
						// mParameters.oController.MaterialInput.setTokens(oControlEvent.getParameter("tokens"));
						mParameters.oController.getView().byId(mParameters.controlID).setValueState(sap.ui.core.ValueState.None);
						mParameters.oController.getView().byId(mParameters.controlID).setValueStateText("");
					}

					if (requestCompleted) {
						requestCompleted(oControlEvent.getParameter("tokens"));
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
			this.setCPStockF4Columns(oValueHelpDialog, mParameters);
			this.setCPStockF4FilterBar(oValueHelpDialog, mParameters);

			if (sap.ui.Device.support.touch === false) {
				oValueHelpDialog.addStyleClass("sapUiSizeCompact");
			}

			oValueHelpDialog.open();
			if (mParameters.oController.MaterialTokenInput) {
				oValueHelpDialog.setTokens(mParameters.oController.MaterialTokenInput.getTokens());
			}
			//for enhancement
			if (this.utilMaterialF4_Exit) {
				this.utilMaterialF4_Exit();
			}
		},
		setCPStockF4Columns: function (oValueHelpDialog, mParameters) {
			/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Getting Property Names From MetaData ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
			/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Edited By RM ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
			var sMaterialNoLabel = oPPCCommon.getLableFromMetadata({
				oDataModel: mParameters.oController.getView().getModel("SSGW_MM"),
				sEntityType: "CPStockItem",
				sPropertyName: "MaterialNo",
				oUtilsI18n: mParameters.oUtilsI18n
			});
			var sMaterialDescLabel = oPPCCommon.getLableFromMetadata({
				oDataModel: mParameters.oController.getView().getModel("SSGW_MM"),
				sEntityType: "CPStockItem",
				sPropertyName: "MaterialDesc",
				oUtilsI18n: mParameters.oUtilsI18n
			});
			var sBatch = oPPCCommon.getLableFromMetadata({
				oDataModel: mParameters.oController.getView().getModel("SSGW_MM"),
				sEntityType: "CPStockItemSno",
				sPropertyName: "Batch",
				oUtilsI18n: mParameters.oUtilsI18n
			});
			var sQuantity = oPPCCommon.getLableFromMetadata({
				oDataModel: mParameters.oController.getView().getModel("SSGW_MM"),
				sEntityType: "CPStockItemSno",
				sPropertyName: "Quantity",
				oUtilsI18n: mParameters.oUtilsI18n
			});
			var sMRP = oPPCCommon.getLableFromMetadata({
				oDataModel: mParameters.oController.getView().getModel("SSGW_MM"),
				sEntityType: "CPStockItemSno",
				sPropertyName: "MRP",
				oUtilsI18n: mParameters.oUtilsI18n
			});
			var sStkConLabel = oPPCCommon.getLableFromMetadata({
				oDataModel: mParameters.oController.getView().getModel("SSGW_MM"),
				sEntityType: "CPBatchStk",
				sPropertyName: "StockConversion",
				oUtilsI18n: mParameters.oUtilsI18n
			});
			var sPriDiscountPer = oPPCCommon.getLableFromMetadata({
				oDataModel: mParameters.oController.getView().getModel("SSGW_MM"),
				sEntityType: "CPStockItemSno",
				sPropertyName: "PriDiscountPer",
				oUtilsI18n: mParameters.oUtilsI18n
			});

			if (oValueHelpDialog.getTable().bindItems) {
				var oColModel = new sap.ui.model.json.JSONModel();
				oColModel.setData({
					cols: [{
						label: sMaterialNoLabel,
						template: "MaterialNo"
					}, {
						label: sMaterialDescLabel,
						template: "MaterialDesc"
					}, ]
				});
				oValueHelpDialog.getTable().setModel(oColModel, "columns");
			} else {

				oValueHelpDialog.getTable().addColumn(new sap.ui.table.Column({
					label: new com.arteriatech.ppc.utils.control.TableHeaderText({
						text: sMaterialNoLabel
					}),
					template: new sap.m.Text({
						text: "{MaterialNo}"
					}),
					sortProperty: "MaterialNo",
					filterProperty: "MaterialNo",
					autoResizable: true,
					// width: "5%"

				}));
				oValueHelpDialog.getTable().addColumn(new sap.ui.table.Column({
					label: new com.arteriatech.ppc.utils.control.TableHeaderText({
						text: sMaterialDescLabel
					}),
					template: new sap.m.Text({
						text: "{MaterialDesc}"
					}),
					sortProperty: "MaterialDesc",
					filterProperty: "MaterialDesc",
					autoResizable: true,
					// width: "10%"

				}));
				oValueHelpDialog.getTable().addColumn(new sap.ui.table.Column({
					label: new com.arteriatech.ppc.utils.control.TableHeaderText({
						text: sMRP
					}),
					template: new sap.m.Text({
						text: "{MRP}"
					}),
					sortProperty: "MRP",
					filterProperty: "MRP",
					autoResizable: true,
					// width: "5%"

				}));
				oValueHelpDialog.getTable().addColumn(new sap.ui.table.Column({
					label: new com.arteriatech.ppc.utils.control.TableHeaderText({
						text: sStkConLabel
					}),
					template: new sap.m.Text({
						text: "{StockConversion}"
					}),
					sortProperty: "StockConversion",
					filterProperty: "StockConversion",
					width: "10rem"
				}));
			}
			//for enhancement
			if (this.setMaterialF4Columns_Exit) {
				this.setMaterialF4Columns_Exit();
			}
		},
		setCPStockF4FilterBar: function (oValueHelpDialog, mParameters) {
			var that = this;
			/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Getting Property Names From MetaData ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
			/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Edited By RM ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
			var sMaterialNoLabel = oPPCCommon.getLableFromMetadata({
				oDataModel: mParameters.oController.getView().getModel("SSGW_MM"),
				sEntityType: "CPStockItem",
				sPropertyName: "MaterialNo",
				oUtilsI18n: mParameters.oUtilsI18n
			});
			var sMaterialDescLabel = oPPCCommon.getLableFromMetadata({
				oDataModel: mParameters.oController.getView().getModel("SSGW_MM"),
				sEntityType: "CPStockItem",
				sPropertyName: "MaterialDesc",
				oUtilsI18n: mParameters.oUtilsI18n
			});

			var busyDialog = new sap.m.BusyDialog();
			var oTokenInputValue = "";
			if (mParameters.oController.CPTokenInput) {
				oTokenInputValue = mParameters.oController.CPTokenInput.getValue();
			}
			var code = new sap.m.Input({
				value: oTokenInputValue,
				maxLength: oPPCCommon.getMaxLengthFromMetadata({
					oDataModel: mParameters.oController.getView().getModel("SSGW_MM"),
					sEntityType: "CPStockItem",
					sPropertyName: "CPNo",
					oUtilsI18n: mParameters.oUtilsI18n
				})
			});
			var desc = new sap.m.Input({

			});

			oValueHelpDialog.setFilterBar(new sap.ui.comp.filterbar.FilterBar({
				advancedMode: true,
				filterGroupItems: [
					new sap.ui.comp.filterbar.FilterGroupItem({
						groupTitle: "Material",
						groupName: "gn1",
						name: "n1",
						label: sMaterialNoLabel,
						control: code
					}),
					new sap.ui.comp.filterbar.FilterGroupItem({
						groupTitle: "Material",
						groupName: "gn1",
						name: "n2",
						label: sMaterialDescLabel,
						control: desc
					})
					/*new sap.ui.comp.filterbar.FilterGroupItem({
						groupTitle: "Default",
						groupName: "gn2",
						name: "n3",
						label: mParameters.oi18n.getText("List.ValueHelp.Material.CustomerNo"),
						control: oCustomer
					}),*/
				],
				search: function (oEvent) {
					// oValueHelpDialog.getTable().setBusy(true);
					var codeValue = code.getValue();
					var descValue = desc.getValue();
					var sLoginID = oProductCommon.getCurrentUsers("CPStockItems", "read");
					var aMaterialF4Filter = new Array();
					aMaterialF4Filter = oPPCCommon.setODataModelReadFilter("", "", aMaterialF4Filter, "LoginID", "", [sLoginID], false, false,
						false);
					if (mParameters.sCPGUID) {
						aMaterialF4Filter = oPPCCommon.setODataModelReadFilter(mParameters.oController.getView(),
							"",
							aMaterialF4Filter, "CPGUID", sap.ui.model.FilterOperator.EQ, [mParameters.sCPGUID], false, false, false);
					} else {
						aMaterialF4Filter = oPPCCommon.setODataModelReadFilter(mParameters.oController.getView(),
							"",
							aMaterialF4Filter, "CPGUID", sap.ui.model.FilterOperator.EQ, [mParameters.sCustomer], false, false, false);
					}
					aMaterialF4Filter = oPPCCommon.setODataModelReadFilter(mParameters.oController.getView(),
						"",
						aMaterialF4Filter, "CPTypeID", "", ["01"], false, false, false);

					aMaterialF4Filter = oPPCCommon.setODataModelReadFilter(mParameters.oController.getView(),
						"",
						aMaterialF4Filter, "StockOwner", "", ["01"], false, false, false);

					// aMaterialF4Filter = oPPCCommon.setODataModelReadFilter(mParameters.oController.getView(),
					// 	"",
					// 	aMaterialF4Filter, "ExpiryDateFlag", "", ["X"], false, false, false);

					aMaterialF4Filter = oPPCCommon.setODataModelReadFilter(mParameters.oController.getView(), "",
						aMaterialF4Filter, "MaterialNo", "", [codeValue], false, false, false);
					aMaterialF4Filter = oPPCCommon.setODataModelReadFilter(mParameters.oController.getView(), "",
						aMaterialF4Filter, "MaterialDesc", "", [descValue], false, false, false);
					aMaterialF4Filter = oPPCCommon.setODataModelReadFilter(mParameters.oController.getView(), "", aMaterialF4Filter,
						"DMSDivision", "", mParameters.dmsDivision.split(";"), true, false, false);
					aMaterialF4Filter = oPPCCommon.setODataModelReadFilter(mParameters.oController.getView(), "", aMaterialF4Filter,
						"StockTypeID", "", [that.getView().byId("StockTypes")
							.getSelectedKey()
						], false, false, false);
					var sku = oPPCCommon.getKeysFromTokens(that.getView(), "inputSKUGroup");
					aMaterialF4Filter = oPPCCommon.setODataModelReadFilter(
						that.getView(),
						"inputSKUGroup",
						aMaterialF4Filter,
						"OrderMaterialGroupID",
						sap.ui.model.FilterOperator.EQ,
						sku.split(";"),
						true,
						false,
						false);
					aMaterialF4Filter = oPPCCommon.setODataModelReadFilter(mParameters.oController.getView(), "", aMaterialF4Filter,
						"StockSubTypeID", sap.ui.model.FilterOperator.EQ, [
							that.getView().byId("StockSubTypes").getSelectedKey()
						],
						false, false, false);

					var SSGW_MMModel = mParameters.oController._oComponent.getModel("SSGW_MM");
					SSGW_MMModel.attachRequestSent(function () {
						busyDialog.open();
					});
					SSGW_MMModel.attachRequestCompleted(function () {
						busyDialog.close();
						//oValueHelpDialog.getTable().setBusy(false);
					});
					SSGW_MMModel.setHeaders({
						"x-arteria-loginid": sLoginID
					});
					SSGW_MMModel.read("/CPStockItems", {
						filters: aMaterialF4Filter,
						urlParameters: {

							"$expand": "CPStockItemSnos"

						},
						success: function (oData) {

							if (oValueHelpDialog.getTable().bindRows) {
								var tempArray = [];
								if (oData.results.length > 0) {
									var MaterialsModel = new sap.ui.model.json.JSONModel();
									oValueHelpDialog.getTable().clearSelection();

									for (var i = 0; i < oData.results.length; i++) {
										tempArray.push(oData.results[i]);
										// for (var j = 0; j < oData.results[i].CPStockItemSnos.results.length; j++) {
										// 	if (oData.results[i].CPStockItemSnos.results[j].Quantity) {
										// 		if (parseFloat(oData.results[i].CPStockItemSnos.results[j].Quantity) !== 0) {
										// 			oData.results[i].CPStockItemSnos.results[j].UnrestrictedQty = oData.results[i].UnrestrictedQty;
										// 			tempArray.push(oData.results[i].CPStockItemSnos.results[j]);
										// 		}
										// 	}

										// }
									}

									MaterialsModel.setData(tempArray);
									oValueHelpDialog.getTable().setModel(MaterialsModel);
									oValueHelpDialog.getTable().bindRows("/");

								} else {
									if (oValueHelpDialog.getTable().getModel() != undefined)
										oValueHelpDialog.getTable().getModel().setProperty("/", {});
									oValueHelpDialog.getTable().setNoData(mParameters.oUtilsI18n.getText("common.NoResultsFound"));
								}
							} else {

								//Setting Rows for sap.m.Table....................................
								var temArray1 = [];
								var oRowsModel = new sap.ui.model.json.JSONModel();
								for (var j = 0; j < oData.results[j].length; j++) {
									if (oData.results[j].CPStockItemSnos) {
										temArray1.push(oData.results[j].CPStockItemSnos);
									}

								}
								oRowsModel.setData(temArray1);
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
							// if (oData.results.length > 0) {
							// 	oValueHelpDialog.update();
							// }
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
			//for enhancement
			if (this.setCPMaterialF4FilterBar_Exit) {
				this.setCPMaterialF4FilterBar_Exit();
			}
		},
		handleMaterialSuggest: function (oEvent) {
			this.validateMandatory();
			if (oPPCCommon.doErrMessageExist()) {
				oPPCCommon.handleSuggest({
					oEvent: oEvent,
					aProperties: ["MaterialNo", "MaterialDesc"],
					sBinding: "suggestionRows"
				});
			} else {
				oEvent.getSource().setValue("");
				oPPCCommon.displayMsg_MsgBox(this.getView(), oPPCCommon.getMsgsFromMsgMgr(), "error");
			}
		},
		handleOtherMaterialSuggest: function (oEvent) {
			this.validateMandatory();
			if (oPPCCommon.doErrMessageExist()) {
				oPPCCommon.handleSuggest({
					oEvent: oEvent,
					aProperties: ["MaterialNo", "MaterialDesc"],
					sBinding: "suggestionRows"
				});
			} else {
				oEvent.getSource().setValue("");
				oPPCCommon.displayMsg_MsgBox(this.getView(), oPPCCommon.getMsgsFromMsgMgr(), "error");
			}
		},
		suggestionMatItemSelected1: function (oEvent) {
			var that = this;
			that.suggestionMatTokenItemSelected({
					oEvent: oEvent,
					thisController: that,
					sModelName: "MatSuggestorModel",
					sKey: "MaterialNo",
					sDescription: "MaterialDesc"
				},
				function (key, desc, jData) {
					that.setSelectedMaterialToTable1(jData);

				});
			if (this.suggestionMatItemSelected1_Exit) {
				this.suggestionMatItemSelected1_Exit(oEvent);
			}
		},
		suggestionMatItemSelected: function (oEvent) {
			var that = this;
			oPPCCommon.removeAllMsgs();
			this.validateMandatory();
			if (oPPCCommon.doErrMessageExist()) {
				var index = oEvent.getSource().getId().slice(-1);
				index = parseInt(oEvent.getSource().getBindingContext("ListItems").getPath().split("/")[1]);
				var itemIndex = parseInt(index);
				var SOCreateItem = this.getView().getModel("ListItems");
				var aItems = SOCreateItem.getProperty('/');
				var oBindingContext = oEvent.getSource().getBindingContext("ListItems");
				var cells = this.getView().byId("UIListTable").getRows()[itemIndex].getCells();
				// for (var j = 0; j < cells.length; j++) {
				// 	if (cells[j].getId().indexOf("inputMaterial") !== -1) {
				// 		this.MaterialInput = this.getView().byId(cells[j].getId());
				// 		this.getView().byId(cells[j].getId()).setValueState("None");
				// 		this.getView().byId(cells[j].getId()).setValueStateText("");
				// 	}
				// }
				this.suggestionMatTokenItemSelected({
						oEvent: oEvent,
						thisController: this,
						sModelName: "MatSuggestorModel",
						sKey: "MaterialNo",
						sDescription: "MaterialDesc"
					},
					function (key, text, jData) {
						// var jData = jData;
						var bValidMaterial = true;
						//	bValidMaterial = that.validateMaterial(jData, oEvent.getSource(), itemIndex);
						if (bValidMaterial) {
							//	that.MaterialInput.addToken(tokens[0]);
							oEvent.getSource().setValueState("None");
							oEvent.getSource().setValueStateText("");
							that.setSelectedMaterialToTable(jData, oBindingContext, aItems, itemIndex);

							that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/OrderMaterialGroupID", jData.OrderMaterialGroupID);
							that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/OrderMaterialGroupDesc", jData.OrderMaterialGroupDesc);
							that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/DMSDivision", jData.DMSDivision);
							that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/DmsDivisionDesc", jData.DmsDivisionDesc);
							// that.getMaterialUOMs(jData.MaterialNo, itemIndex);
							var selectedStockType = that.getView().byId("StockTypes").getSelectedKey();
							if (selectedStockType === "1") {
								that.setBatchModel(jData.MaterialNo, true, itemIndex);
							} else {
								that.setBatchModelCpStock(jData.MaterialNo, true, itemIndex);
							}

						} else {
							// that.MaterialTokenInput.setValue(tokens[0].getCustomData()[0].getValue().MaterialNo);
							that.getView().byId("UIListTable").getRows()[itemIndex].getAggregation("cells")[1].removeAllTokens();
							oEvent.getSource().setValue("");
							that.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
								.getData()
								.length);
							oPPCCommon.showMessagePopover(gList);
						}

					});
			} else {
				oEvent.getSource().setValue("");
				oPPCCommon.displayMsg_MsgBox(this.getView(), oPPCCommon.getMsgsFromMsgMgr(), "error");
			}

			//for enhancement
			if (this.suggestionMatItemSelected_Exit) {
				this.suggestionMatItemSelected_Exit(oEvent);
			}
		},
		suggestionMatTokenItemSelected: function (mParemeters, callBack) {
			var that = this;
			var tokenTextLength = 10;
			mParemeters.oEvent.getSource().setValueState("None");
			mParemeters.oEvent.getSource().setValueStateText("");
			var sPath = mParemeters.oEvent.getParameter("selectedRow").getBindingContext(mParemeters.sModelName).getPath();
			if (mParemeters.sGUID) {
				var keyGUID = mParemeters.thisController.getView().getModel(mParemeters.sModelName).getProperty(sPath + "/" + mParemeters.sGUID);
				var key = mParemeters.thisController.getView().getModel(mParemeters.sModelName).getProperty(sPath + "/" + mParemeters.sKey);
				var desc = mParemeters.thisController.getView().getModel(mParemeters.sModelName).getProperty(sPath + "/" + mParemeters.sDescription);
				mParemeters.oEvent.getSource().removeAllTokens();
				mParemeters.oEvent.getSource().addToken(new sap.m.Token({
					key: keyGUID,
					text: that.TextAbstract(desc, key, tokenTextLength),
					tooltip: desc + " (" + key + ")"
				}));
				mParemeters.oEvent.getSource().setValue("");
			} else {
				var key = mParemeters.thisController.getView().getModel(mParemeters.sModelName).getProperty(sPath + "/" + mParemeters.sKey);
				var desc = mParemeters.thisController.getView().getModel(mParemeters.sModelName).getProperty(sPath + "/" + mParemeters.sDescription);
				mParemeters.oEvent.getSource().removeAllTokens();
				mParemeters.oEvent.getSource().addToken(new sap.m.Token({
					key: key,
					text: that.TextAbstract(desc, key, tokenTextLength),
					tooltip: desc + " (" + key + ")"
				}));
				mParemeters.oEvent.getSource().setValue("");
			}
			var jData = mParemeters.thisController.getView().getModel(mParemeters.sModelName).getProperty(sPath);
			if (callBack) {
				callBack(key, desc, jData);
			}
		},
		suggestionOtherMatItemSelected: function (oEvent) {
			var that = this;
			oPPCCommon.removeAllMsgs();

			this.validateMandatory();
			if (oPPCCommon.doErrMessageExist()) {
				var index = oEvent.getSource().getId().slice(-1);
				index = parseInt(oEvent.getSource().getBindingContext("ListItems").getPath().split("/")[1]);
				var itemIndex = parseInt(index);
				var SOCreateItem = this.getView().getModel("ListItems");
				var aItems = SOCreateItem.getProperty('/');
				var oBindingContext = oEvent.getSource().getBindingContext("ListItems");
				var cells = this.getView().byId("UIListTableOther").getRows()[itemIndex].getCells();
				for (var j = 0; j < cells.length; j++) {
					if (cells[j].getId().indexOf("inputOtherMaterial") !== -1) {
						this.MaterialInput = this.getView().byId(cells[j].getId());
					}
				}
				that.suggestionNewMatItemSelected({
						oEvent: oEvent,
						thisController: this,
						sModelName: "OtherMatSuggestorModel",
						sKey: "MaterialNo",
						sDescription: "MaterialDesc"
					},
					function (key, text, jData) {
						// var jData = jData;
						// var bValidMaterial = that.validateOtherMaterial(jData);
						// if (bValidMaterial) {
						//	that.MaterialInput.addToken(tokens[0]);
						//	that.setSelectedMaterialToTable(jData, oBindingContext, aItems, itemIndex);
						var UMOArray = [{
							Uom: jData.BaseUom
						}, {
							Uom: jData.AlternativeUOM1
						}];
						that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/MaterialNo", jData.MaterialNo);
						that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/MaterialDesc", jData.MaterialDesc);
						that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/OrderMaterialGroupID", jData.ProdHier);
						that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/OrderMaterialGroupDesc", jData.ProdHierDesc);
						that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/DMSDivision", jData.DivisionID);
						that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/UOMs", UMOArray);
						that.checkForNewLineItem();
						that.callBatchModel(jData.MaterialNo, jData.Batch, itemIndex);
						// that.getMaterialUOMs(jData.MaterialNo, itemIndex);
						// } else {
						// 	// that.MaterialTokenInput.setValue(tokens[0].getCustomData()[0].getValue().MaterialNo);
						// 	that.getView().byId("UIListTableOther").getRows()[itemIndex].getAggregation("cells")[1].removeAllTokens();
						// 	that.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
						// 		.getData()
						// 		.length);
						// 	oPPCCommon.showMessagePopover(gList);
						// }

					});
			} else {
				oEvent.getSource().setValue("");
				oPPCCommon.displayMsg_MsgBox(this.getView(), oPPCCommon.getMsgsFromMsgMgr(), "error");
			}

			//for enhancement
			if (this.suggestionOtherMatItemSelected_Exit) {
				this.suggestionOtherMatItemSelected_Exit(oEvent);
			}
		},
		BatchF4: function (oEvent) {
			oPPCCommon.removeServerMsgsInMsgMgrByTarget("/");
			var oBindingContext = oEvent.getSource().getBindingContext("ListItems");
			var aItems = oBindingContext.getProperty("/");
			//	var index = oEvent.getSource().getId().slice(-1);
			var index = oEvent.getSource().getBindingContext("ListItems").getPath().split("/")[1];
			var itemIndex = parseInt(index);
			var lineNo = itemIndex + 1;

			if (aItems[index].MaterialNo === "" || aItems[index].MaterialNo === null || aItems[index].MaterialNo === undefined) {
				var msg = "Please enter Material for Item No " + aItems[index].ItemNo;
				oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/MaterialNo");
			}
			if (oPPCCommon.doErrMessageExist()) {

				var that = this;
				this.BatchbyCustomerF4({
					oController: this,
					oi18n: oi18n,
					oUtilsI18n: oUtilsI18n,
					bMultiSelect: false,
					controlID: "multiInputBatch",
					sCPTypeID: this.getView().getModel("LocalViewSetting").getProperty("/gCPTypeID"),
					CPNo: this.getView().getModel("LocalViewSetting").getProperty("/gCPNo"),
					MaterialNo: aItems[index].MaterialNo
				}, function (tokens) {
					var jData = tokens[0].getCustomData()[0].getValue();
					if (jData) {
						var BatchToken = [{
							Batch: jData.Batch,
							Tooltip: jData.Batch + "(" + jData.Batch + ")"
						}];
						that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/BatchTokens", BatchToken);
						that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/Batch", jData.Batch);
						// that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/ExpiryDate", jData.ExpiryDate);
						// that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/ManufacturingDate", jData.MFD);
						that.onChangeBatch();

					}
				});
				oPPCCommon.hideMessagePopover(gList);
				that.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
					.getData()
					.length);
			} else {
				this.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
					.getData()
					.length);
				oPPCCommon.showMessagePopover(gList);
			}
			//for enhancement
			if (this.MaterialF4_Exit) {
				this.MaterialF4_Exit(oEvent);
			}
		},
		BatchF41: function (oEvent) {
			var that = this;
			var selectedStockType = that.getView().byId("StockTypes").getSelectedKey();
			if (selectedStockType === "1") {
				that.BatchF42CpBatchStk(oEvent, false);
			} else {
				that.BatchF42CpStock(oEvent, false);
			}
		},
		// BatchF41: function (oEvent) {

		// 	var gEvent = jQuery.extend({}, oEvent);
		// 	oPPCCommon.removeServerMsgsInMsgMgrByTarget("/");
		// 	var oBindingContext = oEvent.getSource().getBindingContext("ListItems");
		// 	var aItems = oBindingContext.getProperty("/");
		// 	//	var index = oEvent.getSource().getId().slice(-1);
		// 	var index = oEvent.getSource().getBindingContext("ListItems").getPath().split("/")[1];
		// 	var itemIndex = parseInt(index);
		// 	var lineNo = itemIndex + 1;

		// 	if (aItems[index].MaterialNo === "" || aItems[index].MaterialNo === null || aItems[index].MaterialNo === undefined) {
		// 		var msg = "Please enter Material for Item No " + aItems[index].ItemNo;
		// 		oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/MaterialNo");
		// 	}
		// 	if (oPPCCommon.doErrMessageExist()) {

		// 		var that = this;
		// 		this.BatchbyCustomerF41({
		// 			oController: this,
		// 			oi18n: oi18n,
		// 			oUtilsI18n: oUtilsI18n,
		// 			bMultiSelect: false,
		// 			controlID: "multiInputBatch1",
		// 			sCPTypeID: that.getView().getModel("MaterialDocs").getProperty("/CPTypeID"),
		// 			CPNo: this.getView().getModel("MaterialDocs").getProperty("/FromGUID"),
		// 			MaterialNo: aItems[index].MaterialNo
		// 		}, function (tokens) {
		// 			var jData = tokens[0].getCustomData()[0].getValue();
		// 			if (jData) {
		// 				var BatchToken = [{
		// 					Batch: jData.Batch,
		// 					Tooltip: jData.Batch + "(" + jData.Batch + ")"
		// 				}];
		// 				that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/BatchTokens", BatchToken);
		// 				that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/Batch", jData.Batch);
		// 				// that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/ExpiryDate", jData.ExpiryDate);
		// 				// that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/ManufacturingDate", jData.MFD);

		// 				that.onBatchChange2(gEvent, jData);

		// 			}
		// 		});
		// 		oPPCCommon.hideMessagePopover(gList);
		// 		that.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
		// 			.getData()
		// 			.length);
		// 	} else {
		// 		this.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
		// 			.getData()
		// 			.length);
		// 		oPPCCommon.showMessagePopover(gList);
		// 	}
		// 	//for enhancement
		// 	if (this.MaterialF4_Exit) {
		// 		this.MaterialF4_Exit(oEvent);
		// 	}
		// },
		BatchF42: function (oEvent) {
			var that = this;
			var selectedStockType = that.getView().byId("StockTypes").getSelectedKey();
			if (selectedStockType === "1") {
				that.BatchF42CpBatchStk(oEvent, true);
			} else {
				that.BatchF42CpStock(oEvent, true);
			}
		},
		BatchF42CpBatchStk: function (oEvent, flag) {

			var gEvent = jQuery.extend({}, oEvent);
			oPPCCommon.removeServerMsgsInMsgMgrByTarget("/");

			if (flag === true) {
				var MaterialNo = this.getView().byId("toolbarMaterialNoID").getTokens();

				var MaterialNoVal = MaterialNo.map(function (oToken) {
					return oToken.getKey();
				}).join(",");

				// var MaterialNoTxt = MaterialNo.map(function (oToken) {
				// 	return oToken.getText();
				// }).join(",");

				// var oBindingContext = oEvent.getSource().getBindingContext("ListItems");
				// var aItems = oBindingContext.getProperty("/");
				// //	var index = oEvent.getSource().getId().slice(-1);
				// var index = oEvent.getSource().getBindingContext("ListItems").getPath().split("/")[1];
				// var itemIndex = parseInt(index);
				// var lineNo = itemIndex + 1;

				if (MaterialNoVal === "" || MaterialNoVal === null || MaterialNoVal === undefined) {
					var msg = "Please enter Material for Item No " + MaterialNoVal;
					oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/MaterialNo");
				}
			} else {
				var oBindingContext = oEvent.getSource().getBindingContext("ListItems");
				var aItems = oBindingContext.getProperty("/");
				//	var index = oEvent.getSource().getId().slice(-1);
				var index = oEvent.getSource().getBindingContext("ListItems").getPath().split("/")[1];
				var itemIndex = parseInt(index);
				var lineNo = itemIndex + 1;

				if (aItems[index].MaterialNo === "" || aItems[index].MaterialNo === null || aItems[index].MaterialNo === undefined) {
					var msg = "Please enter Material for Item No " + aItems[index].ItemNo;
					oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/MaterialNo");
				}
				var MaterialNoVal = aItems[index].MaterialNo;
			}
			if (oPPCCommon.doErrMessageExist()) {

				var that = this;
				this.BatchbyCustomerF42({
					oController: this,
					oi18n: oi18n,
					oUtilsI18n: oUtilsI18n,
					bMultiSelect: false,
					controlID: "multiInputBatch2",
					sCPTypeID: that.getView().getModel("MaterialDocs").getProperty("/CPTypeID"),
					CPNo: this.getView().getModel("MaterialDocs").getProperty("/FromGUID"),
					MaterialNo: MaterialNoVal
				}, function (tokens) {
					var jData = tokens[0].getCustomData()[0].getValue();
					if (jData) {
						if (flag) {
							var BatchToken = [{
								Batch: jData.Batch,
								Tooltip: jData.Batch + "(" + jData.Batch + ")"
							}];
							// that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/BatchTokens", BatchToken);
							// that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/Batch", jData.Batch);
							that.getView().getModel("LocalViewSetting").setProperty("/BatchTokens", []);
							that.getView().getModel("LocalViewSetting").setProperty("/BatchTokens", BatchToken);

							// that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/ExpiryDate", jData.ExpiryDate);
							// that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/ManufacturingDate", jData.MFD);

							that.onBatchChange1(gEvent, jData);
						} else {
							var BatchToken = [{
								Batch: jData.Batch,
								Tooltip: jData.Batch + "(" + jData.Batch + ")"
							}];
							that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/BatchTokens", BatchToken);
							that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/Batch", jData.Batch);
							// that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/ExpiryDate", jData.ExpiryDate);
							// that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/ManufacturingDate", jData.MFD);

							that.onBatchChange2(gEvent, jData);
						}
					}
				});
				oPPCCommon.hideMessagePopover(gList);
				that.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
					.getData()
					.length);
			} else {
				this.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
					.getData()
					.length);
				oPPCCommon.showMessagePopover(gList);
			}
			//for enhancement
			if (this.MaterialF4_Exit) {
				this.MaterialF4_Exit(oEvent);
			}
		},
		BatchF42CpStock: function (oEvent, flag) {

			var gEvent = jQuery.extend({}, oEvent);
			oPPCCommon.removeServerMsgsInMsgMgrByTarget("/");
			if (flag === true) {
				var MaterialNo = this.getView().byId("toolbarMaterialNoID").getTokens();

				var MaterialNoVal = MaterialNo.map(function (oToken) {
					return oToken.getKey();
				}).join(",");

				// var MaterialNoTxt = MaterialNo.map(function (oToken) {
				// 	return oToken.getText();
				// }).join(",");

				// var oBindingContext = oEvent.getSource().getBindingContext("ListItems");
				// var aItems = oBindingContext.getProperty("/");
				// //	var index = oEvent.getSource().getId().slice(-1);
				// var index = oEvent.getSource().getBindingContext("ListItems").getPath().split("/")[1];
				// var itemIndex = parseInt(index);
				// var lineNo = itemIndex + 1;

				if (MaterialNoVal === "" || MaterialNoVal === null || MaterialNoVal === undefined) {
					var msg = "Please enter Material for Item No " + MaterialNoVal;
					oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/MaterialNo");
				}
			} else {
				var oBindingContext = oEvent.getSource().getBindingContext("ListItems");
				var aItems = oBindingContext.getProperty("/");
				//	var index = oEvent.getSource().getId().slice(-1);
				var index = oEvent.getSource().getBindingContext("ListItems").getPath().split("/")[1];
				var itemIndex = parseInt(index);
				var lineNo = itemIndex + 1;

				if (aItems[index].MaterialNo === "" || aItems[index].MaterialNo === null || aItems[index].MaterialNo === undefined) {
					var msg = "Please enter Material for Item No " + aItems[index].ItemNo;
					oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/MaterialNo");
				}
				var MaterialNoVal = aItems[index].MaterialNo;
			}
			if (oPPCCommon.doErrMessageExist()) {

				var that = this;
				this.BatchbyCustomerF4CpStock({
					oController: this,
					oi18n: oi18n,
					oUtilsI18n: oUtilsI18n,
					bMultiSelect: false,
					controlID: "multiInputBatch2",
					sCPTypeID: that.getView().getModel("MaterialDocs").getProperty("/CPTypeID"),
					CPNo: this.getView().getModel("MaterialDocs").getProperty("/FromGUID"),
					MaterialNo: MaterialNoVal
				}, function (tokens) {
					var jData = tokens[0].getCustomData()[0].getValue();
					if (jData) {
						if (flag) {
							var BatchToken = [{
								Batch: jData.Batch,
								Tooltip: jData.Batch + "(" + jData.Batch + ")"
							}];
							// that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/BatchTokens", BatchToken);
							// that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/Batch", jData.Batch);
							that.getView().getModel("LocalViewSetting").setProperty("/BatchTokens", []);
							that.getView().getModel("LocalViewSetting").setProperty("/BatchTokens", BatchToken);

							// that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/ExpiryDate", jData.ExpiryDate);
							// that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/ManufacturingDate", jData.MFD);

							that.onBatchChange1(gEvent, jData);
						} else {

							var BatchToken = [{
								Batch: jData.Batch,
								Tooltip: jData.Batch + "(" + jData.Batch + ")"
							}];
							that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/BatchTokens", BatchToken);
							that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/Batch", jData.Batch);
							// that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/ExpiryDate", jData.ExpiryDate);
							// that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/ManufacturingDate", jData.MFD);

							that.onBatchChange2(gEvent, jData);

						}

					}
				});
				oPPCCommon.hideMessagePopover(gList);
				that.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
					.getData()
					.length);
			} else {
				this.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
					.getData()
					.length);
				oPPCCommon.showMessagePopover(gList);
			}
			//for enhancement
			if (this.MaterialF4_Exit) {
				this.MaterialF4_Exit(oEvent);
			}
		},
		BatchbyCustomerF4CpStock: function (mParameters, requestCompleted) {
			if (mParameters.controlID === undefined || mParameters.controlID === null) {
				mParameters.controlID = "inputMaterial";
			}
			if (mParameters.bMultiSelect === undefined || mParameters.bMultiSelect === null) {
				mParameters.bMultiSelect = true;
			}
			var oTokenMaterialInput = "";
			if (mParameters.oController.BatchTokenInput) {
				oTokenMaterialInput = mParameters.oController.BatchTokenInput.getValue();
			}
			var oValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
				basicSearchText: oTokenMaterialInput,
				title: mParameters.oi18n.getText("List.ValueHelp.Batch.header"),
				supportMultiselect: mParameters.bMultiSelect,
				supportRanges: false,
				supportRangesOnly: false,
				key: mParameters.oController.aBatchKeys[0],
				descriptionKey: mParameters.oController.aBatchKeys[1],
				stretch: sap.ui.Device.system.phone,
				ok: function (oControlEvent) {
					if (mParameters.oController.BatchTokenInput) {
						mParameters.oController.BatchTokenInput.setTokens(oControlEvent.getParameter("tokens"));
						mParameters.oController.getView().byId(mParameters.controlID).setValueState(sap.ui.core.ValueState.None);
						mParameters.oController.getView().byId(mParameters.controlID).setValueStateText("");
					}

					if (requestCompleted) {
						requestCompleted(oControlEvent.getParameter("tokens"));
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
			this.BatchbyCustomerF4ColumnsCpStock(oValueHelpDialog, mParameters);
			this.BatchbyCustomerF4FilterBarCpStock(oValueHelpDialog, mParameters);

			if (sap.ui.Device.support.touch === false) {
				oValueHelpDialog.addStyleClass("sapUiSizeCompact");
			}

			oValueHelpDialog.open();
			if (mParameters.oController.BatchTokenInput) {
				oValueHelpDialog.setTokens(mParameters.oController.BatchTokenInput.getTokens());
			}
			//for enhancement
			if (this.utilMaterialF4_Exit) {
				this.utilMaterialF4_Exit();
			}
		},
		BatchbyCustomerF4ColumnsCpStock: function (oValueHelpDialog, mParameters) {
			/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Getting Property Names From MetaData ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
			/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Edited By RM ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
			var sBatchLabel = oPPCCommon.getLableFromMetadata({
				oDataModel: mParameters.oController.getView().getModel("SSGW_MM"),
				sEntityType: "CPStockItem",
				sPropertyName: "Batch",
				oUtilsI18n: mParameters.oUtilsI18n
			});
			// var sMFDLabel = oPPCCommon.getLableFromMetadata({
			// 	oDataModel: mParameters.oController.getView().getModel("SSGW_MM"),
			// 	sEntityType: "CPStockItem",
			// 	sPropertyName: "MRP",
			// 	oUtilsI18n: mParameters.oUtilsI18n
			// });
			var sExpiryDateLabel = oPPCCommon.getLableFromMetadata({
				oDataModel: mParameters.oController.getView().getModel("SSGW_MM"),
				sEntityType: "CPStockItem",
				sPropertyName: "ExpiryDate",
				oUtilsI18n: mParameters.oUtilsI18n
			});

			if (oValueHelpDialog.getTable().bindItems) {
				var oColModel = new sap.ui.model.json.JSONModel();
				oColModel.setData({
					cols: [{
							label: sBatchLabel,
							template: "Batch"
						},
						// {
						// 	label: sMFDLabel,
						// 	template: "MRP"
						// }, 
						{
							label: sExpiryDateLabel,
							template: "ExpiryDate"
						},
					]
				});
				oValueHelpDialog.getTable().setModel(oColModel, "columns");

			} else {

				oValueHelpDialog.getTable().addColumn(new sap.ui.table.Column({
					label: new com.arteriatech.ppc.utils.control.TableHeaderText({
						text: sBatchLabel
					}),
					template: new sap.m.Text({
						text: "{Batch}"
					}),
					sortProperty: "Batch",
					filterProperty: "Batch"
				}));
				// oValueHelpDialog.getTable().addColumn(new sap.ui.table.Column({
				// 	label: new com.arteriatech.ppc.utils.control.TableHeaderText({
				// 		text: sMFDLabel
				// 	}),
				// 	template: new sap.m.Text({
				// 		// text: "{path:'MFD' , formatter: 'com.arteriatech.ss.utils.js.Common.getFormattedDate' }"
				// 	}),
				// 	sortProperty: "MRP",
				// 	// filterProperty: "MFD"
				// 	// filterType: "{type: 'sap.ui.model.type.Date', formatOptions: { UTC: true, pattern: 'dd/MM/yyyy' }}"
				// }));
				oValueHelpDialog.getTable().addColumn(new sap.ui.table.Column({
					label: new com.arteriatech.ppc.utils.control.TableHeaderText({
						text: sExpiryDateLabel
					}),
					template: new sap.m.Text({
						text: "{path:'ExpiryDate' , formatter: 'com.arteriatech.ss.utils.js.Common.getFormattedDate' }"
					}),
					sortProperty: "ExpiryDate",
					// filterProperty: "ExpiryDate"
				}));
				oValueHelpDialog.getTable().setNoData(mParameters.oUtilsI18n.getText("common.NoItemSelected"));
			}
			//for enhancement
			if (this.setMaterialF4Columns_Exit) {
				this.setMaterialF4Columns_Exit();
			}
		},
		BatchbyCustomerF4FilterBarCpStock: function (oValueHelpDialog, mParameters) {

			var that = this;
			/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Getting Property Names From MetaData ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
			/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Edited By RM ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
			var sBatchLabel = oPPCCommon.getLableFromMetadata({
				oDataModel: mParameters.oController.getView().getModel("SSGW_MM"),
				sEntityType: "CPStockItem",
				sPropertyName: "Batch",
				oUtilsI18n: mParameters.oUtilsI18n
			});
			// var sMaterialDescLabel = oPPCCommon.getLableFromMetadata({
			// 	oDataModel: mParameters.oController.getView().getModel("SFGW_MIS"),
			// 	sEntityType: "CPStockItem",
			// 	sPropertyName: "MaterialDesc",
			// 	oUtilsI18n: mParameters.oUtilsI18n
			// });

			var busyDialog = new sap.m.BusyDialog();
			var oTokenInputValue = "";
			if (mParameters.oController.CPTokenInput) {
				oTokenInputValue = mParameters.oController.CPTokenInput.getValue();
			}
			var code = new sap.m.Input({
				value: oTokenInputValue,
				maxLength: oPPCCommon.getMaxLengthFromMetadata({
					oDataModel: mParameters.oController.getView().getModel("SSGW_MM"),
					sEntityType: "CPStockItem",
					sPropertyName: "Batch",
					oUtilsI18n: mParameters.oUtilsI18n
				})
			});
			var desc = new sap.m.Input({

			});

			oValueHelpDialog.setFilterBar(new sap.ui.comp.filterbar.FilterBar({
				advancedMode: true,
				filterGroupItems: [
					new sap.ui.comp.filterbar.FilterGroupItem({
						groupTitle: "Batch",
						groupName: "gn1",
						name: "n1",
						label: sBatchLabel,
						control: code
					})
					// new sap.ui.comp.filterbar.FilterGroupItem({
					// 	groupTitle: "Material",
					// 	groupName: "gn1",
					// 	name: "n2",
					// 	label: sMaterialDescLabel,
					// 	control: desc
					// })
					/*new sap.ui.comp.filterbar.FilterGroupItem({
						groupTitle: "Default",
						groupName: "gn2",
						name: "n3",
						label: mParameters.oi18n.getText("List.ValueHelp.Material.CustomerNo"),
						control: oCustomer
					}),*/
				],
				search: function (oEvent) {
					// oValueHelpDialog.getTable().setBusy(true);
					var codeValue = code.getValue();
					// var descValue = desc.getValue();
					var sLoginID = mParameters.oController.getCurrentUsers("CPStockItems", "read");
					var aMaterialF4Filter = new Array();
					aMaterialF4Filter = oPPCCommon.setODataModelReadFilter("", "", aMaterialF4Filter, "LoginID", "", [sLoginID], false, false,
						false);
					aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(mParameters.oController.getView(),
						"",
						aMaterialF4Filter, "CPGUID", sap.ui.model.FilterOperator.EQ, [mParameters.CPNo], false, false, false);

					aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(mParameters.oController.getView(),
						"",
						aMaterialF4Filter, "CPTypeID", "", [mParameters.sCPTypeID], false, false, false);
					aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(mParameters.oController.getView(),
						"",
						aMaterialF4Filter, "MaterialNo", "", [mParameters.MaterialNo], false, false, false);

					aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(mParameters.oController.getView(),
						"",
						aMaterialF4Filter, "Batch", "", [codeValue], false, false, false);
					aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(mParameters.oController.getView(),
						"",
						aMaterialF4Filter, "StockOwner", "", ["01"], false, false, false);

					if (gList.byId("StockTypes").getSelectedKey()) {
						aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(gList, "", aMaterialF4Filter,
							"StockTypeID", "", [gList.byId("StockTypes").getSelectedKey()], false, false, false);
					} else {
						aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(gList, "", aMaterialF4Filter,
							"StockTypeID", "", ["1"], false, false, false);
					}

					// aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(gList, "", aMaterialF4Filter,
					// "StockSubTypeID", sap.ui.model.FilterOperator.EQ, [gList.byId("StockSubTypes").getSelectedKey()], false, false,
					// false);
					// aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(mParameters.oController.getView(), "", aMaterialF4Filter,
					// 	"StockTypeID", "", [that.getView().byId("StockTypes")
					// 		.getSelectedKey()
					// 	], false, false, false);

					// aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(mParameters.oController.getView(), "",
					// 	aMaterialF4Filter, "MaterialDesc", "", [descValue], false, false, false);

					var SSGW_MMModel = mParameters.oController._oComponent.getModel("SSGW_MM");
					SSGW_MMModel.attachRequestSent(function () {
						busyDialog.open();
					});
					SSGW_MMModel.attachRequestCompleted(function () {
						busyDialog.close();
						//oValueHelpDialog.getTable().setBusy(false);
					});
					SSGW_MMModel.setHeaders({
						"x-arteria-loginid": sLoginID
					});
					SSGW_MMModel.read("/CPStockItems", {
						filters: aMaterialF4Filter,
						urlParameters: {
							"$expand": "CPStockItemSnos"
						},
						//urlParameters: {"$select" : "MaterialNo,MaterialDesc,BaseUom"},
						// 		urlParameters: sURL,
						success: function (oData) {

							if (oValueHelpDialog.getTable().bindRows) {
								if (oData.results.length > 0) {

									oData = oPPCCommon.formatItemsOData({
										oData: oData.results
									});

									var aBatchDD = oData[0].CPStockItemSnos.results;
									var aNewBatchDD = [];
									for (var i = 0; i < aBatchDD.length; i++) {
										if (aBatchDD[i].Batch !== "") {
											aNewBatchDD.push(aBatchDD[i]);

										}
									}

									var MaterialsModel = new sap.ui.model.json.JSONModel();
									oValueHelpDialog.getTable().clearSelection();
									MaterialsModel.setData(aNewBatchDD);
									oValueHelpDialog.getTable().setModel(MaterialsModel);
									oValueHelpDialog.getTable().bindRows("/");

								} else {
									if (oValueHelpDialog.getTable().getModel() != undefined)
										oValueHelpDialog.getTable().getModel().setProperty("/", {});
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
							// if (oData.results.length > 0) {
							// 	oValueHelpDialog.update();
							// }
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
			//for enhancement
			if (this.setCPMaterialF4FilterBar_Exit) {
				this.setCPMaterialF4FilterBar_Exit();
			}
		},
		onBatchChange1: function (oEvent, jData) {
			var that = this;
			oPPCCommon.hideMessagePopover(gList);
			oPPCCommon.removeAllMsgs();
			var oBindingContext = oEvent.getSource().getBindingContext("ListItems");

			//	var isValid = that.validateBatches(oEvent);
			// if (oEvent.getSource().getSelectedKey() !== "(Select)") {
			// var batchId = "";
			// var sBatchQty = oEvent.getSource().getSelectedItem().getText().trim();
			// var invoice = oEvent.getSource().getSelectedItem().getAdditionalText();
			// sBatchQty = sBatchQty.split(" ")[0].trim();
			//	var aBatch = oEvent.getSource().getModel("BatchDD").getData();

			// var selectedBatch = oEvent.getParameter("selectedItem");
			// var selectedBatchContext = selectedBatch.getBindingContext("ListItems");
			// var sPath = selectedBatchContext.getPath();
			// var selectedBatchObject = selectedBatchContext.getObject();
			// var invoiceItemContext = oEvent.getSource().getBindingContext("ListItems");
			// var invoiceItemObject = invoiceItemContext.getObject();
			// var invoiceItemPath = invoiceItemContext.getPath();
			// // var InvoiceNo = oEvent.getSource().getSelectedItem().getAdditionalText();
			// var ListItems = this.getView().getModel("ListItems");
			// var aItems = ListItems.getProperty('/');
			// var exists = false;
			// var selectedBatchObject = oEvent.getParameter("selectedItem").getBindingContext("BatchSuggestorModel").getObject();
			var selectedBatchObject = jData;

			this.validateToolBarBatches(selectedBatchObject);
			var Stocktyp = gList.byId("StockTypes").getSelectedKey();
			if (oPPCCommon.doErrMessageExist()) {
				this.getView().getModel("LocalViewSetting").setProperty("/MRP", selectedBatchObject.MRP);
				this.getView().getModel("LocalViewSetting").setProperty("/ManufacturingDate", selectedBatchObject.ManufDate);
				this.getView().getModel("LocalViewSetting").setProperty("/ExpiryDate", selectedBatchObject.ExpDate);
				this.getView().getModel("LocalViewSetting").setProperty("/PrimaryTradeDis", selectedBatchObject.PriDiscountPer);
				this.getView().getModel("LocalViewSetting").setProperty("/UnitPrice", selectedBatchObject.UnitPrice);
				this.getView().getModel("LocalViewSetting").setProperty("/Quantity", selectedBatchObject.Unrestricted);
				this.getView().getModel("LocalViewSetting").setProperty("/StockRefGUID", selectedBatchObject.CPStockItmGuid);
				this.getView().getModel("LocalViewSetting").setProperty("/Batch", selectedBatchObject.Batch);
				//	this.getView().getModel("LocalViewSetting").setProperty("/BookStk", selectedBatchObject.Unrestricted);
				if (Stocktyp === '1') {
					this.getView().getModel("LocalViewSetting").setProperty("/BookStk", selectedBatchObject.Unrestricted);
				} else if (Stocktyp === '2') {
					this.getView().getModel("LocalViewSetting").setProperty("/BookStk", selectedBatchObject.Quantity);
				} else {
					this.getView().getModel("LocalViewSetting").setProperty("/BookStk", selectedBatchObject.FreeQty);
				}
				var AdjQty = this.getView().getModel("LocalViewSetting").getProperty("/AdjQty");
				if (AdjQty && selectedBatchObject.Unrestricted) {
					var DiffQty = parseFloat(selectedBatchObject.Unrestricted) - parseFloat(AdjQty);
					DiffQty = parseFloat(DiffQty).toFixed(2);
					this.getView().getModel("LocalViewSetting").setProperty("/DiffQty", DiffQty);
				}
			} else {
				// oEvent.getSource().setSelectedKey("");
				//	oEvent.getSource().setValueState("Error");
				// var msg = "Batch already exists";
				// oPPCCommon.addMsg_MsgMgr(msg, "error", "Material");
				this.getView().byId("multiInputBatch2").removeAllTokens();
				oPPCCommon.showMessagePopover(gList);
			}

			// }
		},
		onChangeToolQty: function (oEvent) {
			var enteredQty = this.getView().getModel("LocalViewSetting").getProperty("/AdjQty");
			var bookStk = this.getView().getModel("LocalViewSetting").getProperty("/BookStk");
			var actStk = parseInt(bookStk) - parseInt(enteredQty);
			// actStk = actStk.toFixed(2);
			this.getView().getModel("LocalViewSetting").setProperty("/StkDifference", actStk);
		},
		onBatchChange2: function (oEvent, jData) {
			var that = this;
			oPPCCommon.hideMessagePopover(gList);
			oPPCCommon.removeAllMsgs();
			var oBindingContext = oEvent.getSource().getBindingContext("ListItems");

			// var selectedBatch = oEvent.getParameter("selectedItem");
			// 		var selectedBatchContext = selectedBatch.getBindingContext("ListItems");
			// 		var sPath = selectedBatchContext.getPath();
			// 		var selectedBatchObject = selectedBatchContext.getObject();
			var invoiceItemContext = oEvent.getSource().getBindingContext("ListItems");
			var invoiceItemObject = invoiceItemContext.getObject();
			var invoiceItemPath = invoiceItemContext.getPath();
			// var InvoiceNo = oEvent.getSource().getSelectedItem().getAdditionalText();
			var ListItems = this.getView().getModel("ListItems");
			var aItems = ListItems.getProperty('/');
			// var exists = false;

			// var selectedBatchObject = oEvent.getParameter("selectedItem").getBindingContext("BatchSuggestorModel").getObject();
			var selectedBatchObject = jData;

			this.validateBatches(selectedBatchObject, invoiceItemPath);
			var Stocktyp = gList.byId("StockTypes").getSelectedKey();
			if (oPPCCommon.doErrMessageExist()) {
				this.getView().getModel("ListItems").setProperty(invoiceItemPath + "/MRP", selectedBatchObject.MRP);
				this.getView().getModel("ListItems").setProperty(invoiceItemPath + "/ManufacturingDate", selectedBatchObject.ManufDate);
				this.getView().getModel("ListItems").setProperty(invoiceItemPath + "/ExpiryDate", selectedBatchObject.ExpDate);
				this.getView().getModel("ListItems").setProperty(invoiceItemPath + "/PrimaryTradeDis", selectedBatchObject.PriDiscountPer);
				this.getView().getModel("ListItems").setProperty(invoiceItemPath + "/UnitPrice", selectedBatchObject.UnitPrice);
				if (Stocktyp === '1') {
					this.getView().getModel("ListItems").setProperty(invoiceItemPath + "/Quantity", selectedBatchObject.Unrestricted);
				} else if (Stocktyp === '2') {
					this.getView().getModel("ListItems").setProperty(invoiceItemPath + "/Quantity", selectedBatchObject.Quantity);
				} else {
					this.getView().getModel("ListItems").setProperty(invoiceItemPath + "/Quantity", selectedBatchObject.FreeQty);
				}
				this.getView().getModel("ListItems").setProperty(invoiceItemPath + "/StockRefGUID", selectedBatchObject.CPStockItmGuid);
				this.getView().getModel("ListItems").setProperty(invoiceItemPath + "/Batch", selectedBatchObject.Batch);
				var AdjQty = this.getView().getModel("ListItems").getProperty(invoiceItemPath + "/AdjQty");
				if (AdjQty && selectedBatchObject.Quantity) {
					var DiffQty = parseFloat(selectedBatchObject.Quantity) - parseFloat(AdjQty);
					DiffQty = parseFloat(DiffQty).toFixed(2);
					this.getView().getModel("ListItems").setProperty(invoiceItemPath + "/DiffQty", DiffQty);
				}
			} else {
				oEvent.getSource().removeAllTokens();
				// oEvent.getSource().setSelectedKey("");
				//	oEvent.getSource().setValueState("Error");
				// var msg = "Batch already exists";
				// oPPCCommon.addMsg_MsgMgr(msg, "error", "Material");
				oPPCCommon.showMessagePopover(gList);
			}

			// }
		},
		onBatchChange3: function (oEvent, jData) {
			var that = this;
			oPPCCommon.hideMessagePopover(gList);
			oPPCCommon.removeAllMsgs();
			var oBindingContext = oEvent.getSource().getBindingContext("ListItems");

			// var selectedBatch = oEvent.getParameter("selectedItem");
			// 		var selectedBatchContext = selectedBatch.getBindingContext("ListItems");
			// 		var sPath = selectedBatchContext.getPath();
			// 		var selectedBatchObject = selectedBatchContext.getObject();
			var invoiceItemContext = oEvent.getSource().getBindingContext("ListItems");
			var invoiceItemObject = invoiceItemContext.getObject();
			var invoiceItemPath = invoiceItemContext.getPath();
			// var InvoiceNo = oEvent.getSource().getSelectedItem().getAdditionalText();
			var ListItems = this.getView().getModel("ListItems");
			var aItems = ListItems.getProperty('/');
			// var exists = false;

			// var selectedBatchObject = oEvent.getParameter("selectedRow").getBindingContext("BatchSuggestorModel").getObject();
			var selectedBatchObject = jData;

			// this.validateBatches(selectedBatchObject, invoiceItemPath);
			if (oPPCCommon.doErrMessageExist()) {
				this.getView().getModel("ListItems").setProperty(invoiceItemPath + "/MRP", selectedBatchObject.MRP);
				this.getView().getModel("ListItems").setProperty(invoiceItemPath + "/ManufacturingDate", selectedBatchObject.ManufacturingDate);
				this.getView().getModel("ListItems").setProperty(invoiceItemPath + "/ExpiryDate", selectedBatchObject.ExpiryDate);
				this.getView().getModel("ListItems").setProperty(invoiceItemPath + "/PrimaryTradeDis", selectedBatchObject.PriDiscountPer);
				this.getView().getModel("ListItems").setProperty(invoiceItemPath + "/UnitPrice", selectedBatchObject.UnitPrice);
				this.getView().getModel("ListItems").setProperty(invoiceItemPath + "/Quantity", selectedBatchObject.Quantity);
				this.getView().getModel("ListItems").setProperty(invoiceItemPath + "/StockRefGUID", selectedBatchObject.CPSnoGUID);
				this.getView().getModel("ListItems").setProperty(invoiceItemPath + "/Batch", selectedBatchObject.Batch);
				var AdjQty = this.getView().getModel("ListItems").getProperty(invoiceItemPath + "/AdjQty");
				if (AdjQty && selectedBatchObject.Quantity) {
					var DiffQty = parseFloat(selectedBatchObject.Quantity) - parseFloat(AdjQty);
					DiffQty = parseFloat(DiffQty).toFixed(2);
					this.getView().getModel("ListItems").setProperty(invoiceItemPath + "/DiffQty", DiffQty);
				}
			} else {
				// oEvent.getSource().setSelectedKey("");
				//	oEvent.getSource().setValueState("Error");
				// var msg = "Batch already exists";
				// oPPCCommon.addMsg_MsgMgr(msg, "error", "Material");
				oPPCCommon.showMessagePopover(gList);
			}

			// }
		},

		onBatchChange4: function (oEvent, jData) {
			var that = this;
			oPPCCommon.hideMessagePopover(gList);
			oPPCCommon.removeAllMsgs();
			var oBindingContext = oEvent.getSource().getBindingContext("ListItems");

			// var selectedBatchObject = oEvent.getParameter("selectedItem").getBindingContext("BatchSuggestorModel").getObject();
			var selectedBatchObject = jData;

			// this.validateBatches(selectedBatchObject);
			if (oPPCCommon.doErrMessageExist()) {
				this.getView().getModel("LocalViewSetting").setProperty("/MRP", selectedBatchObject.MRP);
				this.getView().getModel("LocalViewSetting").setProperty("/ManufacturingDate", selectedBatchObject.ManufacturingDate);
				this.getView().getModel("LocalViewSetting").setProperty("/ExpiryDate", selectedBatchObject.ExpiryDate);
				this.getView().getModel("LocalViewSetting").setProperty("/PrimaryTradeDis", selectedBatchObject.PriDiscountPer);
				this.getView().getModel("LocalViewSetting").setProperty("/UnitPrice", selectedBatchObject.UnitPrice);
				this.getView().getModel("LocalViewSetting").setProperty("/Quantity", selectedBatchObject.Quantity);
				this.getView().getModel("LocalViewSetting").setProperty("/StockRefGUID", selectedBatchObject.CPSnoGUID);
				this.getView().getModel("LocalViewSetting").setProperty("/Batch", selectedBatchObject.Batch);
				var AdjQty = this.getView().getModel("LocalViewSetting").getProperty("/AdjQty");
				if (AdjQty && selectedBatchObject.Quantity) {
					var DiffQty = parseFloat(selectedBatchObject.Quantity) - parseFloat(AdjQty);
					DiffQty = parseFloat(DiffQty).toFixed(2);
					this.getView().getModel("LocalViewSetting").setProperty("/DiffQty", DiffQty);
				}
			} else {
				// oEvent.getSource().setSelectedKey("");
				//	oEvent.getSource().setValueState("Error");
				// var msg = "Batch already exists";
				// oPPCCommon.addMsg_MsgMgr(msg, "error", "Material");
				oPPCCommon.showMessagePopover(gList);
			}

			// }
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
			this.ClearValueState1(["BatchValueState", "UOMValueState", "MRPValueState", "UnitPriceValueState", "MDateValueState",
				"EDateValueState", "RefDocNoValueState", "RefDocItemNoValueState", "QuantityValueState"
			]);
			var isValid = true;
			for (var i = 0; i < listItems.length; i++) {
				if (listItems[i].MaterialNo !== "") {
					valid = false;
					var cells = gList.byId("UIListTableOther").getRows()[i].getCells();
					// for (var j = 0; j < cells.length; j++) {
					// 	if (cells[j].getId().indexOf("inputUOM") !== -1) {
					// 		var uom = gList.byId(cells[j].getId()).getSelectedItem().getText();
					// 		if (uom === "") {
					// 			var msg = "Please select UOM for Material No " + listItems[i].MaterialNo
					// 			gList.getModel("ListItems").setProperty("/" + i + "/UOMValueState", "Error");
					// 			gList.getModel("ListItems").setProperty("/" + i + "/UOMValueStateText", msg);
					// 			oPPCCommon.addMsg_MsgMgr(msg, "error", "Batch" + i);
					// 		} else {
					// 			gList.getModel("ListItems").setProperty("/" + i + "/UOM", uom);
					// 		}
					// 	}
					// }
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
		formateMatToken: function (text, key) {
			var length = 5;
			if (key !== "") {
				text = text + "(" + key + ")";
			}

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

		BatchbyCustomerF41: function (mParameters, requestCompleted) {
			if (mParameters.controlID === undefined || mParameters.controlID === null) {
				mParameters.controlID = "inputMaterial";
			}
			if (mParameters.bMultiSelect === undefined || mParameters.bMultiSelect === null) {
				mParameters.bMultiSelect = true;
			}
			var oTokenMaterialInput = "";
			if (mParameters.oController.BatchTokenInput) {
				oTokenMaterialInput = mParameters.oController.BatchTokenInput.getValue();
			}
			var oValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
				basicSearchText: oTokenMaterialInput,
				title: mParameters.oi18n.getText("List.ValueHelp.Batch.header"),
				supportMultiselect: mParameters.bMultiSelect,
				supportRanges: false,
				supportRangesOnly: false,
				key: mParameters.oController.aBatchKeys[0],
				descriptionKey: mParameters.oController.aBatchKeys[1],
				stretch: sap.ui.Device.system.phone,
				ok: function (oControlEvent) {
					if (mParameters.oController.BatchTokenInput) {
						mParameters.oController.BatchTokenInput.setTokens(oControlEvent.getParameter("tokens"));
						mParameters.oController.getView().byId(mParameters.controlID).setValueState(sap.ui.core.ValueState.None);
						mParameters.oController.getView().byId(mParameters.controlID).setValueStateText("");
					}

					if (requestCompleted) {
						requestCompleted(oControlEvent.getParameter("tokens"));
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
			this.BatchbyCustomerF4Columns2(oValueHelpDialog, mParameters);
			this.BatchbyCustomerF4FilterBar2(oValueHelpDialog, mParameters);

			if (sap.ui.Device.support.touch === false) {
				oValueHelpDialog.addStyleClass("sapUiSizeCompact");
			}

			oValueHelpDialog.open();
			if (mParameters.oController.BatchTokenInput) {
				oValueHelpDialog.setTokens(mParameters.oController.BatchTokenInput.getTokens());
			}
			//for enhancement
			if (this.utilMaterialF4_Exit) {
				this.utilMaterialF4_Exit();
			}
		},
		BatchbyCustomerF42: function (mParameters, requestCompleted) {
			if (mParameters.controlID === undefined || mParameters.controlID === null) {
				mParameters.controlID = "inputMaterial";
			}
			if (mParameters.bMultiSelect === undefined || mParameters.bMultiSelect === null) {
				mParameters.bMultiSelect = true;
			}
			var oTokenMaterialInput = "";
			if (mParameters.oController.BatchTokenInput) {
				oTokenMaterialInput = mParameters.oController.BatchTokenInput.getValue();
			}
			var oValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
				basicSearchText: oTokenMaterialInput,
				title: mParameters.oi18n.getText("List.ValueHelp.Batch.header"),
				supportMultiselect: mParameters.bMultiSelect,
				supportRanges: false,
				supportRangesOnly: false,
				key: mParameters.oController.aBatchKeys[0],
				descriptionKey: mParameters.oController.aBatchKeys[1],
				stretch: sap.ui.Device.system.phone,
				ok: function (oControlEvent) {
					if (mParameters.oController.BatchTokenInput) {
						mParameters.oController.BatchTokenInput.setTokens(oControlEvent.getParameter("tokens"));
						mParameters.oController.getView().byId(mParameters.controlID).setValueState(sap.ui.core.ValueState.None);
						mParameters.oController.getView().byId(mParameters.controlID).setValueStateText("");
					}

					if (requestCompleted) {
						requestCompleted(oControlEvent.getParameter("tokens"));
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
			this.BatchbyCustomerF4Columns2(oValueHelpDialog, mParameters);
			this.BatchbyCustomerF4FilterBar2(oValueHelpDialog, mParameters);

			if (sap.ui.Device.support.touch === false) {
				oValueHelpDialog.addStyleClass("sapUiSizeCompact");
			}

			oValueHelpDialog.open();
			if (mParameters.oController.BatchTokenInput) {
				oValueHelpDialog.setTokens(mParameters.oController.BatchTokenInput.getTokens());
			}
			//for enhancement
			if (this.utilMaterialF4_Exit) {
				this.utilMaterialF4_Exit();
			}
		},
		BatchbyCustomerF4: function (mParameters, requestCompleted) {
			if (mParameters.controlID === undefined || mParameters.controlID === null) {
				mParameters.controlID = "inputMaterial";
			}
			if (mParameters.bMultiSelect === undefined || mParameters.bMultiSelect === null) {
				mParameters.bMultiSelect = true;
			}
			var oTokenMaterialInput = "";
			if (mParameters.oController.BatchTokenInput) {
				oTokenMaterialInput = mParameters.oController.BatchTokenInput.getValue();
			}
			var oValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
				basicSearchText: oTokenMaterialInput,
				title: mParameters.oi18n.getText("List.ValueHelp.Batch.header"),
				supportMultiselect: mParameters.bMultiSelect,
				supportRanges: false,
				supportRangesOnly: false,
				key: mParameters.oController.aBatchKeys[0],
				descriptionKey: mParameters.oController.aBatchKeys[1],
				stretch: sap.ui.Device.system.phone,
				ok: function (oControlEvent) {
					if (mParameters.oController.BatchTokenInput) {
						mParameters.oController.BatchTokenInput.setTokens(oControlEvent.getParameter("tokens"));
						mParameters.oController.getView().byId(mParameters.controlID).setValueState(sap.ui.core.ValueState.None);
						mParameters.oController.getView().byId(mParameters.controlID).setValueStateText("");
					}

					if (requestCompleted) {
						requestCompleted(oControlEvent.getParameter("tokens"));
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
			this.BatchbyCustomerF4Columns(oValueHelpDialog, mParameters);
			this.BatchbyCustomerF4FilterBar(oValueHelpDialog, mParameters);

			if (sap.ui.Device.support.touch === false) {
				oValueHelpDialog.addStyleClass("sapUiSizeCompact");
			}

			oValueHelpDialog.open();
			if (mParameters.oController.BatchTokenInput) {
				oValueHelpDialog.setTokens(mParameters.oController.BatchTokenInput.getTokens());
			}
			//for enhancement
			if (this.utilMaterialF4_Exit) {
				this.utilMaterialF4_Exit();
			}
		},
		BatchbyCustomerF4Columns: function (oValueHelpDialog, mParameters) {
			/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Getting Property Names From MetaData ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
			/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Edited By RM ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
			var sBatchLabel = oPPCCommon.getLableFromMetadata({
				oDataModel: mParameters.oController.getView().getModel("SFGW_MIS"),
				sEntityType: "MaterialBatch",
				sPropertyName: "Batch",
				oUtilsI18n: mParameters.oUtilsI18n
			});
			var sMFDLabel = oPPCCommon.getLableFromMetadata({
				oDataModel: mParameters.oController.getView().getModel("SFGW_MIS"),
				sEntityType: "MaterialBatch",
				sPropertyName: "MFD",
				oUtilsI18n: mParameters.oUtilsI18n
			});
			var sExpiryDateLabel = oPPCCommon.getLableFromMetadata({
				oDataModel: mParameters.oController.getView().getModel("SFGW_MIS"),
				sEntityType: "MaterialBatch",
				sPropertyName: "ExpiryDate",
				oUtilsI18n: mParameters.oUtilsI18n
			});

			if (oValueHelpDialog.getTable().bindItems) {
				var oColModel = new sap.ui.model.json.JSONModel();
				oColModel.setData({
					cols: [{
						label: sBatchLabel,
						template: "Batch"
					}, {
						label: sMFDLabel,
						template: "MFD"
					}, {
						label: sExpiryDateLabel,
						template: "ExpiryDate"
					}, ]
				});
				oValueHelpDialog.getTable().setModel(oColModel, "columns");

			} else {

				oValueHelpDialog.getTable().addColumn(new sap.ui.table.Column({
					label: new com.arteriatech.ppc.utils.control.TableHeaderText({
						text: sBatchLabel
					}),
					template: new sap.m.Text({
						text: "{Batch}"
					}),
					sortProperty: "Batch",
					filterProperty: "Batch"
				}));
				oValueHelpDialog.getTable().addColumn(new sap.ui.table.Column({
					label: new com.arteriatech.ppc.utils.control.TableHeaderText({
						text: sMFDLabel
					}),
					template: new sap.m.Text({
						text: "{path:'MFD' , formatter: 'com.arteriatech.ss.utils.js.Common.getFormattedDate' }"
					}),
					sortProperty: "MFD",
					// filterProperty: "MFD"
					// filterType: "{type: 'sap.ui.model.type.Date', formatOptions: { UTC: true, pattern: 'dd/MM/yyyy' }}"
				}));
				oValueHelpDialog.getTable().addColumn(new sap.ui.table.Column({
					label: new com.arteriatech.ppc.utils.control.TableHeaderText({
						text: sExpiryDateLabel
					}),
					template: new sap.m.Text({
						text: "{path:'ExpiryDate' , formatter: 'com.arteriatech.ss.utils.js.Common.getFormattedDate' }"
					}),
					sortProperty: "ExpiryDate",
					// filterProperty: "ExpiryDate"
				}));
				oValueHelpDialog.getTable().setNoData(mParameters.oUtilsI18n.getText("common.NoItemSelected"));
			}
			//for enhancement
			if (this.setMaterialF4Columns_Exit) {
				this.setMaterialF4Columns_Exit();
			}
		},
		BatchbyCustomerF4FilterBar: function (oValueHelpDialog, mParameters) {
			/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Getting Property Names From MetaData ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
			/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Edited By RM ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
			var sBatchLabel = oPPCCommon.getLableFromMetadata({
				oDataModel: mParameters.oController.getView().getModel("SFGW_MIS"),
				sEntityType: "MaterialBatch",
				sPropertyName: "Batch",
				oUtilsI18n: mParameters.oUtilsI18n
			});
			// var sMaterialDescLabel = oPPCCommon.getLableFromMetadata({
			// 	oDataModel: mParameters.oController.getView().getModel("SFGW_MIS"),
			// 	sEntityType: "CPStockItem",
			// 	sPropertyName: "MaterialDesc",
			// 	oUtilsI18n: mParameters.oUtilsI18n
			// });

			var busyDialog = new sap.m.BusyDialog();
			var oTokenInputValue = "";
			if (mParameters.oController.CPTokenInput) {
				oTokenInputValue = mParameters.oController.CPTokenInput.getValue();
			}
			var code = new sap.m.Input({
				value: oTokenInputValue,
				maxLength: oPPCCommon.getMaxLengthFromMetadata({
					oDataModel: mParameters.oController.getView().getModel("SFGW_MIS"),
					sEntityType: "MaterialBatch",
					sPropertyName: "Batch",
					oUtilsI18n: mParameters.oUtilsI18n
				})
			});
			var desc = new sap.m.Input({

			});

			oValueHelpDialog.setFilterBar(new sap.ui.comp.filterbar.FilterBar({
				advancedMode: true,
				filterGroupItems: [
					new sap.ui.comp.filterbar.FilterGroupItem({
						groupTitle: "Material",
						groupName: "gn1",
						name: "n1",
						label: sBatchLabel,
						control: code
					})
					// new sap.ui.comp.filterbar.FilterGroupItem({
					// 	groupTitle: "Material",
					// 	groupName: "gn1",
					// 	name: "n2",
					// 	label: sMaterialDescLabel,
					// 	control: desc
					// })
					/*new sap.ui.comp.filterbar.FilterGroupItem({
						groupTitle: "Default",
						groupName: "gn2",
						name: "n3",
						label: mParameters.oi18n.getText("List.ValueHelp.Material.CustomerNo"),
						control: oCustomer
					}),*/
				],
				search: function (oEvent) {
					// oValueHelpDialog.getTable().setBusy(true);
					var codeValue = code.getValue();
					// var descValue = desc.getValue();
					var sLoginID = mParameters.oController.getCurrentUsers("MaterialBatchs", "read");
					var aMaterialF4Filter = new Array();
					aMaterialF4Filter = oPPCCommon.setODataModelReadFilter("", "", aMaterialF4Filter, "LoginID", "", [sLoginID], false, false,
						false);
					aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(mParameters.oController.getView(),
						"",
						aMaterialF4Filter, "ParentGUID", sap.ui.model.FilterOperator.EQ, [mParameters.CPNo], false, false, false);

					aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(mParameters.oController.getView(),
						"",
						aMaterialF4Filter, "ParentType", "", [mParameters.sCPTypeID], false, false, false);
					aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(mParameters.oController.getView(),
						"",
						aMaterialF4Filter, "MaterialNo", "", [mParameters.MaterialNo], false, false, false);

					aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(mParameters.oController.getView(),
						"",
						aMaterialF4Filter, "Batch", "", [codeValue], false, false, false);
					// aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(mParameters.oController.getView(), "",
					// 	aMaterialF4Filter, "MaterialDesc", "", [descValue], false, false, false);

					var SSGW_MMModel = mParameters.oController._oComponent.getModel("SFGW_MIS");
					SSGW_MMModel.attachRequestSent(function () {
						busyDialog.open();
					});
					SSGW_MMModel.attachRequestCompleted(function () {
						busyDialog.close();
						//oValueHelpDialog.getTable().setBusy(false);
					});
					SSGW_MMModel.setHeaders({
						"x-arteria-loginid": sLoginID
					});
					SSGW_MMModel.read("/MaterialBatchs", {
						filters: aMaterialF4Filter,
						//urlParameters: {"$select" : "MaterialNo,MaterialDesc,BaseUom"},
						// 		urlParameters: sURL,
						success: function (oData) {

							if (oValueHelpDialog.getTable().bindRows) {
								if (oData.results.length > 0) {
									var MaterialsModel = new sap.ui.model.json.JSONModel();
									oValueHelpDialog.getTable().clearSelection();
									MaterialsModel.setData(oData.results);
									oValueHelpDialog.getTable().setModel(MaterialsModel);
									oValueHelpDialog.getTable().bindRows("/");

								} else {
									if (oValueHelpDialog.getTable().getModel() != undefined)
										oValueHelpDialog.getTable().getModel().setProperty("/", {});
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
							// if (oData.results.length > 0) {
							// 	oValueHelpDialog.update();
							// }
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
			//for enhancement
			if (this.setCPMaterialF4FilterBar_Exit) {
				this.setCPMaterialF4FilterBar_Exit();
			}
		},
		BatchbyCustomerF4Columns1: function (oValueHelpDialog, mParameters) {
			/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Getting Property Names From MetaData ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
			/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Edited By RM ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
			var sBatchLabel = oPPCCommon.getLableFromMetadata({
				oDataModel: mParameters.oController.getView().getModel("SSGW_MM"),
				sEntityType: "CPStockItem",
				sPropertyName: "Batch",
				oUtilsI18n: mParameters.oUtilsI18n
			});
			// var sMFDLabel = oPPCCommon.getLableFromMetadata({
			// 	oDataModel: mParameters.oController.getView().getModel("SSGW_MM"),
			// 	sEntityType: "CPStockItem",
			// 	sPropertyName: "MRP",
			// 	oUtilsI18n: mParameters.oUtilsI18n
			// });
			var sExpiryDateLabel = oPPCCommon.getLableFromMetadata({
				oDataModel: mParameters.oController.getView().getModel("SSGW_MM"),
				sEntityType: "CPStockItem",
				sPropertyName: "ExpiryDate",
				oUtilsI18n: mParameters.oUtilsI18n
			});

			if (oValueHelpDialog.getTable().bindItems) {
				var oColModel = new sap.ui.model.json.JSONModel();
				oColModel.setData({
					cols: [{
							label: sBatchLabel,
							template: "Batch"
						},
						// {
						// 	label: sMFDLabel,
						// 	template: "MRP"
						// }, 
						{
							label: sExpiryDateLabel,
							template: "ExpiryDate"
						},
					]
				});
				oValueHelpDialog.getTable().setModel(oColModel, "columns");

			} else {

				oValueHelpDialog.getTable().addColumn(new sap.ui.table.Column({
					label: new com.arteriatech.ppc.utils.control.TableHeaderText({
						text: sBatchLabel
					}),
					template: new sap.m.Text({
						text: "{Batch}"
					}),
					sortProperty: "Batch",
					filterProperty: "Batch"
				}));
				// oValueHelpDialog.getTable().addColumn(new sap.ui.table.Column({
				// 	label: new com.arteriatech.ppc.utils.control.TableHeaderText({
				// 		text: sMFDLabel
				// 	}),
				// 	template: new sap.m.Text({
				// 		// text: "{path:'MFD' , formatter: 'com.arteriatech.ss.utils.js.Common.getFormattedDate' }"
				// 	}),
				// 	sortProperty: "MRP",
				// 	// filterProperty: "MFD"
				// 	// filterType: "{type: 'sap.ui.model.type.Date', formatOptions: { UTC: true, pattern: 'dd/MM/yyyy' }}"
				// }));
				oValueHelpDialog.getTable().addColumn(new sap.ui.table.Column({
					label: new com.arteriatech.ppc.utils.control.TableHeaderText({
						text: sExpiryDateLabel
					}),
					template: new sap.m.Text({
						text: "{path:'ExpiryDate' , formatter: 'com.arteriatech.ss.utils.js.Common.getFormattedDate' }"
					}),
					sortProperty: "ExpiryDate",
					// filterProperty: "ExpiryDate"
				}));
				oValueHelpDialog.getTable().setNoData(mParameters.oUtilsI18n.getText("common.NoItemSelected"));
			}
			//for enhancement
			if (this.setMaterialF4Columns_Exit) {
				this.setMaterialF4Columns_Exit();
			}
		},
		BatchbyCustomerF4FilterBar1: function (oValueHelpDialog, mParameters) {

			var that = this;
			/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Getting Property Names From MetaData ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
			/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Edited By RM ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
			var sBatchLabel = oPPCCommon.getLableFromMetadata({
				oDataModel: mParameters.oController.getView().getModel("SSGW_MM"),
				sEntityType: "CPStockItem",
				sPropertyName: "Batch",
				oUtilsI18n: mParameters.oUtilsI18n
			});
			// var sMaterialDescLabel = oPPCCommon.getLableFromMetadata({
			// 	oDataModel: mParameters.oController.getView().getModel("SFGW_MIS"),
			// 	sEntityType: "CPStockItem",
			// 	sPropertyName: "MaterialDesc",
			// 	oUtilsI18n: mParameters.oUtilsI18n
			// });

			var busyDialog = new sap.m.BusyDialog();
			var oTokenInputValue = "";
			if (mParameters.oController.CPTokenInput) {
				oTokenInputValue = mParameters.oController.CPTokenInput.getValue();
			}
			var code = new sap.m.Input({
				value: oTokenInputValue,
				maxLength: oPPCCommon.getMaxLengthFromMetadata({
					oDataModel: mParameters.oController.getView().getModel("SSGW_MM"),
					sEntityType: "CPStockItem",
					sPropertyName: "Batch",
					oUtilsI18n: mParameters.oUtilsI18n
				})
			});
			var desc = new sap.m.Input({

			});

			oValueHelpDialog.setFilterBar(new sap.ui.comp.filterbar.FilterBar({
				advancedMode: true,
				filterGroupItems: [
					new sap.ui.comp.filterbar.FilterGroupItem({
						groupTitle: "Batch",
						groupName: "gn1",
						name: "n1",
						label: sBatchLabel,
						control: code
					})
					// new sap.ui.comp.filterbar.FilterGroupItem({
					// 	groupTitle: "Material",
					// 	groupName: "gn1",
					// 	name: "n2",
					// 	label: sMaterialDescLabel,
					// 	control: desc
					// })
					/*new sap.ui.comp.filterbar.FilterGroupItem({
						groupTitle: "Default",
						groupName: "gn2",
						name: "n3",
						label: mParameters.oi18n.getText("List.ValueHelp.Material.CustomerNo"),
						control: oCustomer
					}),*/
				],
				search: function (oEvent) {
					// oValueHelpDialog.getTable().setBusy(true);
					var codeValue = code.getValue();
					// var descValue = desc.getValue();
					var sLoginID = mParameters.oController.getCurrentUsers("CPStockItems", "read");
					var aMaterialF4Filter = new Array();
					aMaterialF4Filter = oPPCCommon.setODataModelReadFilter("", "", aMaterialF4Filter, "LoginID", "", [sLoginID], false, false,
						false);
					aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(mParameters.oController.getView(),
						"",
						aMaterialF4Filter, "CPGUID", sap.ui.model.FilterOperator.EQ, [mParameters.CPNo], false, false, false);

					aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(mParameters.oController.getView(),
						"",
						aMaterialF4Filter, "CPTypeID", "", [mParameters.sCPTypeID], false, false, false);
					aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(mParameters.oController.getView(),
						"",
						aMaterialF4Filter, "MaterialNo", "", [mParameters.MaterialNo], false, false, false);

					aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(mParameters.oController.getView(),
						"",
						aMaterialF4Filter, "Batch", "", [codeValue], false, false, false);
					aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(mParameters.oController.getView(),
						"",
						aMaterialF4Filter, "StockOwner", "", ["01"], false, false, false);

					if (gList.byId("StockTypes").getSelectedKey()) {
						aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(gList, "", aMaterialF4Filter,
							"StockTypeID", "", [gList.byId("StockTypes").getSelectedKey()], false, false, false);
					} else {
						aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(gList, "", aMaterialF4Filter,
							"StockTypeID", "", ["1"], false, false, false);
					}

					// aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(gList, "", aMaterialF4Filter,
					// 	"StockSubTypeID", sap.ui.model.FilterOperator.EQ, [gList.byId("StockSubTypes").getSelectedKey()], false, false,
					// 	false);				
					// aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(mParameters.oController.getView(), "", aMaterialF4Filter,
					// 	"StockTypeID", "", [that.getView().byId("StockTypes")
					// 		.getSelectedKey()
					// 	], false, false, false);

					// aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(mParameters.oController.getView(), "",
					// 	aMaterialF4Filter, "MaterialDesc", "", [descValue], false, false, false);

					var SSGW_MMModel = mParameters.oController._oComponent.getModel("SSGW_MM");
					SSGW_MMModel.attachRequestSent(function () {
						busyDialog.open();
					});
					SSGW_MMModel.attachRequestCompleted(function () {
						busyDialog.close();
						//oValueHelpDialog.getTable().setBusy(false);
					});
					SSGW_MMModel.setHeaders({
						"x-arteria-loginid": sLoginID
					});
					SSGW_MMModel.read("/CPStockItems", {
						filters: aMaterialF4Filter,
						urlParameters: {
							"$expand": "CPStockItemSnos"
						},
						//urlParameters: {"$select" : "MaterialNo,MaterialDesc,BaseUom"},
						// 		urlParameters: sURL,
						success: function (oData) {

							if (oValueHelpDialog.getTable().bindRows) {
								if (oData.results.length > 0) {

									oData = oPPCCommon.formatItemsOData({
										oData: oData.results
									});

									var aBatchDD = oData[0].CPStockItemSnos.results;
									var aNewBatchDD = [];
									for (var i = 0; i < aBatchDD.length; i++) {
										if (aBatchDD[i].Batch !== "") {
											aNewBatchDD.push(aBatchDD[i]);

										}
									}

									var MaterialsModel = new sap.ui.model.json.JSONModel();
									oValueHelpDialog.getTable().clearSelection();
									MaterialsModel.setData(aNewBatchDD);
									oValueHelpDialog.getTable().setModel(MaterialsModel);
									oValueHelpDialog.getTable().bindRows("/");

								} else {
									if (oValueHelpDialog.getTable().getModel() != undefined)
										oValueHelpDialog.getTable().getModel().setProperty("/", {});
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
							// if (oData.results.length > 0) {
							// 	oValueHelpDialog.update();
							// }
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
			//for enhancement
			if (this.setCPMaterialF4FilterBar_Exit) {
				this.setCPMaterialF4FilterBar_Exit();
			}
		},

		BatchbyCustomerF4Columns2: function (oValueHelpDialog, mParameters) {
			/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Getting Property Names From MetaData ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
			/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Edited By RM ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
			var sBatchLabel = oPPCCommon.getLableFromMetadata({
				oDataModel: mParameters.oController.getView().getModel("SSGW_MM"),
				sEntityType: "CPBatchStk",
				sPropertyName: "Batch",
				oUtilsI18n: mParameters.oUtilsI18n
			});
			// var sMFDLabel = oPPCCommon.getLableFromMetadata({
			// 	oDataModel: mParameters.oController.getView().getModel("SSGW_MM"),
			// 	sEntityType: "CPStockItem",
			// 	sPropertyName: "MRP",
			// 	oUtilsI18n: mParameters.oUtilsI18n
			// });
			var sExpiryDateLabel = oPPCCommon.getLableFromMetadata({
				oDataModel: mParameters.oController.getView().getModel("SSGW_MM"),
				sEntityType: "CPBatchStk",
				sPropertyName: "ExpDate",
				oUtilsI18n: mParameters.oUtilsI18n
			});
			var sStockLabel = "Book Stock";

			if (oValueHelpDialog.getTable().bindItems) {
				var oColModel = new sap.ui.model.json.JSONModel();
				oColModel.setData({
					cols: [{
							label: sBatchLabel,
							template: "Batch"
						},
						// {
						// 	label: sMFDLabel,
						// 	template: "MRP"
						// }, 
						{
							label: sExpiryDateLabel,
							template: "ExpiryDate"
						},
					]
				});
				oValueHelpDialog.getTable().setModel(oColModel, "columns");

			} else {

				oValueHelpDialog.getTable().addColumn(new sap.ui.table.Column({
					label: new com.arteriatech.ppc.utils.control.TableHeaderText({
						text: sBatchLabel
					}),
					template: new sap.m.Text({
						text: "{Batch}"
					}),
					sortProperty: "Batch",
					filterProperty: "Batch"
				}));
				// oValueHelpDialog.getTable().addColumn(new sap.ui.table.Column({
				// 	label: new com.arteriatech.ppc.utils.control.TableHeaderText({
				// 		text: sMFDLabel
				// 	}),
				// 	template: new sap.m.Text({
				// 		// text: "{path:'MFD' , formatter: 'com.arteriatech.ss.utils.js.Common.getFormattedDate' }"
				// 	}),
				// 	sortProperty: "MRP",
				// 	// filterProperty: "MFD"
				// 	// filterType: "{type: 'sap.ui.model.type.Date', formatOptions: { UTC: true, pattern: 'dd/MM/yyyy' }}"
				// }));
				oValueHelpDialog.getTable().addColumn(new sap.ui.table.Column({
					label: new com.arteriatech.ppc.utils.control.TableHeaderText({
						text: sStockLabel
					}),
					template: new sap.m.Text({
						text: "{Unrestricted}"
					}),
					sortProperty: "Unrestricted",
					filterProperty: "Unrestricted"
				}));
				oValueHelpDialog.getTable().addColumn(new sap.ui.table.Column({
					label: new com.arteriatech.ppc.utils.control.TableHeaderText({
						text: sExpiryDateLabel
					}),
					template: new sap.m.Text({
						text: "{path:'ExpDate' , formatter: 'com.arteriatech.ss.utils.js.Common.getFormattedDate' }"
					}),
					sortProperty: "ExpDate",
					// filterProperty: "ExpiryDate"
				}));
				oValueHelpDialog.getTable().setNoData(mParameters.oUtilsI18n.getText("common.NoItemSelected"));
			}
			//for enhancement
			if (this.setMaterialF4Columns_Exit) {
				this.setMaterialF4Columns_Exit();
			}
		},
		BatchbyCustomerF4FilterBar2: function (oValueHelpDialog, mParameters) {

			var that = this;
			/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Getting Property Names From MetaData ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
			/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Edited By RM ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
			var sBatchLabel = oPPCCommon.getLableFromMetadata({
				oDataModel: mParameters.oController.getView().getModel("SSGW_MM"),
				sEntityType: "CPStockItem",
				sPropertyName: "Batch",
				oUtilsI18n: mParameters.oUtilsI18n
			});
			// var sMaterialDescLabel = oPPCCommon.getLableFromMetadata({
			// 	oDataModel: mParameters.oController.getView().getModel("SFGW_MIS"),
			// 	sEntityType: "CPStockItem",
			// 	sPropertyName: "MaterialDesc",
			// 	oUtilsI18n: mParameters.oUtilsI18n
			// });

			var busyDialog = new sap.m.BusyDialog();
			var oTokenInputValue = "";
			if (mParameters.oController.CPTokenInput) {
				oTokenInputValue = mParameters.oController.CPTokenInput.getValue();
			}
			var code = new sap.m.Input({
				value: oTokenInputValue,
				maxLength: oPPCCommon.getMaxLengthFromMetadata({
					oDataModel: mParameters.oController.getView().getModel("SSGW_MM"),
					sEntityType: "CPStockItem",
					sPropertyName: "Batch",
					oUtilsI18n: mParameters.oUtilsI18n
				})
			});
			var desc = new sap.m.Input({

			});

			oValueHelpDialog.setFilterBar(new sap.ui.comp.filterbar.FilterBar({
				advancedMode: true,
				filterGroupItems: [
					new sap.ui.comp.filterbar.FilterGroupItem({
						groupTitle: "Batch",
						groupName: "gn1",
						name: "n1",
						label: sBatchLabel,
						control: code
					})
					// new sap.ui.comp.filterbar.FilterGroupItem({
					// 	groupTitle: "Material",
					// 	groupName: "gn1",
					// 	name: "n2",
					// 	label: sMaterialDescLabel,
					// 	control: desc
					// })
					/*new sap.ui.comp.filterbar.FilterGroupItem({
						groupTitle: "Default",
						groupName: "gn2",
						name: "n3",
						label: mParameters.oi18n.getText("List.ValueHelp.Material.CustomerNo"),
						control: oCustomer
					}),*/
				],
				search: function (oEvent) {
					// oValueHelpDialog.getTable().setBusy(true);
					var codeValue = code.getValue();
					// var descValue = desc.getValue();
					var sLoginID = mParameters.oController.getCurrentUsers("CPStockItems", "read");
					var aMaterialF4Filter = new Array();
					aMaterialF4Filter = oPPCCommon.setODataModelReadFilter("", "", aMaterialF4Filter, "LoginID", "", [sLoginID], false, false,
						false);
					aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(mParameters.oController.getView(),
						"",
						aMaterialF4Filter, "CPGuid", sap.ui.model.FilterOperator.EQ, [mParameters.CPNo], false, false, false);

					aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(mParameters.oController.getView(),
						"",
						aMaterialF4Filter, "CPType", "", [mParameters.sCPTypeID], false, false, false);
					aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(mParameters.oController.getView(),
						"",
						aMaterialF4Filter, "MaterialNo", "", [mParameters.MaterialNo], false, false, false);

					aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(mParameters.oController.getView(),
						"",
						aMaterialF4Filter, "Batch", "", [codeValue], false, false, false);
					aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(mParameters.oController.getView(),
						"",
						aMaterialF4Filter, "StockOwner", "", ["01"], false, false, false);
					aMaterialF4Filter = oPPCCommon.setODataModelReadFilter(mParameters.oController.getView(), "",
						aMaterialF4Filter, "StockBy", "", ["01"], false, false, false);
					if (gList.byId("StockTypes").getSelectedKey()) {
						aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(gList, "", aMaterialF4Filter,
							"StockType", "", [gList.byId("StockTypes").getSelectedKey()], false, false, false);
					} else {
						aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(gList, "", aMaterialF4Filter,
							"StockType", "", ["1"], false, false, false);
					}

					// aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(gList, "", aMaterialF4Filter,
					// "StockSubTypeID", sap.ui.model.FilterOperator.EQ, [gList.byId("StockSubTypes").getSelectedKey()], false, false,
					// false);
					// aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(mParameters.oController.getView(), "", aMaterialF4Filter,
					// 	"StockTypeID", "", [that.getView().byId("StockTypes")
					// 		.getSelectedKey()
					// 	], false, false, false);

					// aMaterialF4Filter = com.arteriatech.ss.utils.js.CommonValueHelp.setODataModelReadFilter(mParameters.oController.getView(), "",
					// 	aMaterialF4Filter, "MaterialDesc", "", [descValue], false, false, false);

					var SSGW_MMModel = mParameters.oController._oComponent.getModel("SSGW_MM");
					SSGW_MMModel.attachRequestSent(function () {
						busyDialog.open();
					});
					SSGW_MMModel.attachRequestCompleted(function () {
						busyDialog.close();
						//oValueHelpDialog.getTable().setBusy(false);
					});
					SSGW_MMModel.setHeaders({
						"x-arteria-loginid": sLoginID
					});
					SSGW_MMModel.read("/CPBatchStkSet", {
						filters: aMaterialF4Filter,
						// urlParameters: {
						// 	"$expand": "CPStockItemSnos"
						// },
						//urlParameters: {"$select" : "MaterialNo,MaterialDesc,BaseUom"},
						// 		urlParameters: sURL,
						success: function (oData) {

							if (oValueHelpDialog.getTable().bindRows) {
								if (oData.results.length > 0) {

									oData = oPPCCommon.formatItemsOData({
										oData: oData.results
									});

									var aBatchDD = oData;
									var aNewBatchDD = [];
									for (var i = 0; i < aBatchDD.length; i++) {
										if (aBatchDD[i].Batch !== "") {
											aBatchDD[i].Unrestricted = parseInt(aBatchDD[i].Unrestricted);
											aNewBatchDD.push(aBatchDD[i]);

										}
									}

									var MaterialsModel = new sap.ui.model.json.JSONModel();
									oValueHelpDialog.getTable().clearSelection();
									MaterialsModel.setData(aNewBatchDD);
									oValueHelpDialog.getTable().setModel(MaterialsModel);
									oValueHelpDialog.getTable().bindRows("/");
									var aColumn = oValueHelpDialog.getTable().getColumns()[1];
									var sBookStk = "Descending"; // ? "dDescending" : "Ascending";
									oValueHelpDialog.getTable().sort(aColumn, sBookStk, true);

								} else {
									if (oValueHelpDialog.getTable().getModel() != undefined)
										oValueHelpDialog.getTable().getModel().setProperty("/", {});
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
							// if (oData.results.length > 0) {
							// 	oValueHelpDialog.update();
							// }
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
			//for enhancement
			if (this.setCPMaterialF4FilterBar_Exit) {
				this.setCPMaterialF4FilterBar_Exit();
			}
		},
		prepareMaterialODataFilter: function (LoginID, material, batch) {
			var BatchItemsFilters = new Array();
			BatchItemsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", BatchItemsFilters, "LoginID", "", [LoginID], false,
				false,
				false);
			BatchItemsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", BatchItemsFilters, "MaterialNo", sap.ui.model.FilterOperator
				.EQ, [
					material
				], false, false, false);
			BatchItemsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", BatchItemsFilters, "Batch", sap.ui.model.FilterOperator
				.EQ, [
					batch
				], false, false, false);
			return BatchItemsFilters;
		},
		callBatchModel: function (material, batch, itemIndex) {
			var that = this;
			var DebitItemsListModel = this._oComponent.getModel("SFGW_MIS");
			this.getView().setBusy(true);
			var LoginID = this.getCurrentUsers("MaterialBatchs", "read");
			DebitItemsListModel.setHeaders({
				"x-arteria-loginid": LoginID
			});

			DebitItemsListModel.read("/MaterialBatchs", {
				filters: that.prepareMaterialODataFilter(LoginID, material, batch),
				success: function (oData) {
					if (oData.results.length > 0) {
						// var InvoiceDataModel = new sap.ui.model.json.JSONModel();
						// InvoiceDataModel.setData(oData.results);
						// that._oComponent.setModel(InvoiceDataModel, "batchSuggestorModel");

						oData = oPPCCommon.formatItemsOData({
							oData: oData.results
						});
						var jDataInvItems = that.getView().getModel("ListItems").getData();
						jDataInvItems[itemIndex].BatchSuggestorModel = oData;
						that.getView().getModel("ListItems").setProperty("/" + itemIndex, jDataInvItems[itemIndex]);
					}
					// else {
					// 	that.setNodataFound();
					// }
					that.getView().setBusy(false);
				},
				error: function (error) {
					// that.setNodataFound();
					// oPPCCommon.dialogErrorMessage(error, oUtilsI18n.getText("common.Dialog.Error.ServiceError.Header"));
					that.getView().setBusy(false);
				}
			});
			if (this.callBatchModel_Exit) {
				this.callBatchModel_Exit();
			}
		},
		suggestionItemSelectedBatch: function (oEvent) {
			var that = this;
			var index = oEvent.getSource().getBindingContext("ListItems").getPath().split("/")[1];

			var itemIndex = parseInt(index);
			that.suggestionItemSelectd({
					oEvent: oEvent,
					thisController: this,
					sModelName: "ListItems",
					sKey: "Batch",
					sDescription: "Batch"
						//sGUID: "SPGUID"
				},
				function (key, desc, jData) {
					var BatchToken = [{
						Batch: jData.Batch,
						Tooltip: jData.Batch + "(" + jData.Batch + ")"
					}];
					that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/BatchTokens", BatchToken);
					that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/Batch", jData.Batch);
					// that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/ExpiryDate", jData.ExpiryDate);
					// that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/ManufacturingDate", jData.MFD);
					that.onChangeBatch();
				}
			);

			if (this.suggestionItemSelectedBatch_Exit) {
				this.suggestionItemSelectedBatch_Exit(oEvent);
			}
		},

		suggestionItemSelectedBatch2: function (oEvent) {
			var that = this;
			var gEvent = jQuery.extend({}, oEvent);
			var tempIndex = oEvent.getSource().getBindingContext("ListItems").getPath();
			var index = oEvent.getSource().getBindingContext("ListItems").getPath().split("/")[1];
			var itemIndex = parseInt(index);
			// var sModel = that.getView().getModel("ListItems").getProperty("/" + itemIndex + "/BatchSuggestorModel");
			that.suggestionItemSelectd({
					oEvent: oEvent,
					thisController: this,
					sModelName: "ListItems",
					sKey: "Batch",
					sDescription: "Batch",
					index: tempIndex
						//sGUID: "SPGUID"
				},
				function (key, desc, jData) {
					var BatchToken = [{
						Batch: jData.Batch,
						Tooltip: jData.Batch + "(" + jData.Batch + ")"
					}];
					that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/BatchTokens", BatchToken);
					that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/Batch", jData.Batch);
					// that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/ExpiryDate", jData.ExpiryDate);
					// that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/ManufacturingDate", jData.MFD);
					// that.onChangeBatch();
					that.onBatchChange2(gEvent, jData);

				}
			);

			if (this.suggestionItemSelectedBatch_Exit) {
				this.suggestionItemSelectedBatch_Exit(oEvent);
			}
		},

		suggestionItemSelectedBatch1: function (oEvent) {
			var that = this;
			var gEvent = jQuery.extend({}, oEvent);
			// var index = oEvent.getSource().getBindingContext("ListItems").getPath().split("/")[1];
			// var itemIndex = parseInt(index);
			that.suggestionItemSelectd({
					oEvent: oEvent,
					thisController: this,
					sModelName: "BatchSuggestorModel",
					sKey: "Batch",
					sDescription: "Batch"
						//sGUID: "SPGUID"
				},
				function (key, desc, jData) {
					var BatchToken = [{
						Batch: jData.Batch,
						Tooltip: jData.Batch + "(" + jData.Batch + ")"
					}];
					// that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/BatchTokens", BatchToken);
					// that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/Batch", jData.Batch);

					that.getView().getModel("LocalViewSetting").setProperty("/BatchTokens", []);
					that.getView().getModel("LocalViewSetting").setProperty("/BatchTokens", BatchToken);
					that.onBatchChange1(gEvent, jData);

					// that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/ExpiryDate", jData.ExpiryDate);
					// that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/ManufacturingDate", jData.MFD);
					// that.onChangeBatch();

				}
			);

			if (this.suggestionItemSelectedBatch_Exit) {
				this.suggestionItemSelectedBatch_Exit(oEvent);
			}
		},

		suggestionItemSelectd: function (mParemeters, callBack) {
			var that = this;
			var tokenTextLength = that.getView().getModel("LocalViewSetting").getProperty("/tokenTextLength");
			mParemeters.oEvent.getSource().setValueState("None");
			mParemeters.oEvent.getSource().setValueStateText("");
			var sPath;
			if (mParemeters.index === undefined) {
				if (mParemeters.sModelName === "SalesPersonSuggestorModel" || mParemeters.sModelName === "BatchSuggestorModel") {
					sPath = mParemeters.oEvent.getParameter("selectedRow").getBindingContext(mParemeters.sModelName).getPath();
				} else {
					sPath = mParemeters.oEvent.getParameter("selectedItem").getBindingContext(mParemeters.sModelName).getPath();
				}
			} else {
				sPath = mParemeters.index;
				var tempLength = mParemeters.oEvent.getParameter("selectedRow").getBindingContextPath("ListItems").length - 1;
				var sPath1 = mParemeters.oEvent.getParameter("selectedRow").getBindingContextPath("ListItems").charAt(tempLength)

			}

			if (mParemeters.sGUID) {
				var keyGUID = mParemeters.thisController.getView().getModel(mParemeters.sModelName).getProperty(sPath + "/" + mParemeters.sGUID);
				var key = mParemeters.thisController.getView().getModel(mParemeters.sModelName).getProperty(sPath + "/" + mParemeters.sKey);
				var desc = mParemeters.thisController.getView().getModel(mParemeters.sModelName).getProperty(sPath + "/" + mParemeters.sDescription);
				mParemeters.oEvent.getSource().removeAllTokens();
				mParemeters.oEvent.getSource().addToken(new sap.m.Token({
					key: keyGUID,
					text: that.TextAbstract(desc, key, 5),
					tooltip: desc + " (" + key + ")"
				}));
				mParemeters.oEvent.getSource().setValue("");
			} else {
				if (mParemeters.index === undefined) {
					var key = mParemeters.thisController.getView().getModel(mParemeters.sModelName).getProperty(sPath + "/" + mParemeters.sKey);
					var desc = mParemeters.thisController.getView().getModel(mParemeters.sModelName).getProperty(sPath + "/" + mParemeters.sDescription);
					mParemeters.oEvent.getSource().removeAllTokens();
					mParemeters.oEvent.getSource().addToken(new sap.m.Token({
						key: key,
						text: that.TextAbstract(desc, key, 5),
						tooltip: desc + " (" + key + ")"
					}));
					mParemeters.oEvent.getSource().setValue("");
				} else {

					var key = mParemeters.thisController.getView().getModel(mParemeters.sModelName).getProperty(sPath + "/BatchSuggestorModel/" +
						sPath1 + "/" + mParemeters.sKey);
					var desc = mParemeters.thisController.getView().getModel(mParemeters.sModelName).getProperty(sPath + "/BatchSuggestorModel/" +
						sPath1 + "/" + mParemeters.sDescription);
					mParemeters.oEvent.getSource().removeAllTokens();
					mParemeters.oEvent.getSource().addToken(new sap.m.Token({
						key: key,
						text: that.TextAbstract(desc, key, 5),
						tooltip: desc + " (" + key + ")"
					}));
					mParemeters.oEvent.getSource().setValue("");
				}
			}
			if (mParemeters.index === undefined) {
				var jData = mParemeters.thisController.getView().getModel(mParemeters.sModelName).getProperty(sPath);
			} else {
				var jData = mParemeters.thisController.getView().getModel(mParemeters.sModelName).getProperty(sPath + "/BatchSuggestorModel/" +
					sPath1);
			}
			if (callBack) {
				callBack(key, desc, jData);
			}
		},
		OnBatchF4Remove: function (oEvent) {
			var that = this;
			if (oEvent.getParameters().type === "removed") {
				gList.getModel("LocalViewSetting").setProperty("/CalculateButton", true);
				gList.getModel("LocalViewSetting").setProperty("/CalculateButtonEnable", false);
				gList.getModel("LocalViewSetting").setProperty("/ReviewButtonEnable", false);
				var index = oEvent.getSource().getBindingContext("ListItems").getPath().split("/")[1];
				var itemIndex = parseInt(index);
				that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/BatchTokens", []);
				that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/Batch", "");
				// that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/ExpiryDate", null);
				// that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/ManufacturingDate", null);
				// that.onChangeBatch(oEvent);
			}
		},
		OnBatchF4RemoveTool: function (oEvent) {
			var that = this;
			if (oEvent.getParameters().type === "removed") {

				// var index = oEvent.getSource().getBindingContext("ListItems").getPath().split("/")[1];
				// var itemIndex = parseInt(index);
				// that.getView().getModel("ListItems").setProperty("/BatchTokens", []);
				// that.getView().getModel("ListItems").setProperty("/Batch", "");
				that.getView().getModel("LocalViewSetting").setProperty("/BatchTokens", []);
				that.getView().getModel("LocalViewSetting").setProperty("/BookStk", "");
				that.getView().getModel("LocalViewSetting").setProperty("/StkDifference", "");
				that.getView().getModel("LocalViewSetting").setProperty("/AdjQty", "");
				that.getView().byId("sFReasonIDEdit").setSelectedKey("");
				// that.getView().getModel("LocalViewSetting").setProperty("/BatchTokens", BatchToken);
				// that.getView().getModel("LocalViewSetting").setProperty("/BatchTokens", BatchToken);
				// that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/ExpiryDate", null);
				// that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/ManufacturingDate", null);
				// that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/Quantity", "");
				// that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/AdjQty", "");
				// that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/DiffQty", "");
				// that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/ReasonID", "");
				// that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/MRP", "");
				// that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/Batch", "");
				// that.onChangeBatch(oEvent);
			}
		},
		handleBatchSuggest: function (oEvent) {
			oPPCCommon.removeAllMsgs();
			oPPCCommon.hideMessagePopover(gList);
			this.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
				.getData().length);
			var oBindingContext = oEvent.getSource().getBindingContext("ListItems");
			var aItems = oBindingContext.getProperty("/");
			//	var index = oEvent.getSource().getId().slice(-1);
			var index = oEvent.getSource().getBindingContext("ListItems").getPath().split("/")[1];
			var itemIndex = parseInt(index);
			var lineNo = itemIndex + 1;

			if (aItems[index].MaterialNo === "" || aItems[index].MaterialNo === null || aItems[index].MaterialNo === undefined) {
				var msg = "Please enter Material for Item No " + aItems[index].ItemNo;
				oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/MaterialNo");
			}
			// this.validate(oEvent);
			if (oPPCCommon.doErrMessageExist()) {
				this.handleSuggest({
					oEvent: oEvent,
					aProperties: ["Batch", "Batch"],
					sBinding: "suggestionRows"
				});
			} else {
				oEvent.getSource().setValue("");
				this.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
					.getData().length);
				oPPCCommon.showMessagePopover(gList);
			}

			//for enhancement
			if (this.handleBatchSuggest_Exit) {
				this.handleBatchSuggest_Exit(oEvent);
			}
		},
		handleBatchSuggest1: function (oEvent) {
			oPPCCommon.removeAllMsgs();
			oPPCCommon.hideMessagePopover(gList);
			this.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
				.getData().length);
			// var oBindingContext = oEvent.getSource().getBindingContext("ListItems");
			// var aItems = oBindingContext.getProperty("/");
			// //	var index = oEvent.getSource().getId().slice(-1);
			// var index = oEvent.getSource().getBindingContext("ListItems").getPath().split("/")[1];
			// var itemIndex = parseInt(index);
			// var lineNo = itemIndex + 1;

			// if (aItems[index].MaterialNo === "" || aItems[index].MaterialNo === null || aItems[index].MaterialNo === undefined) {
			// 	var msg = "Please enter Material for Item No " + aItems[index].ItemNo;
			// 	oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/MaterialNo");
			// }
			// this.validate(oEvent);
			if (oPPCCommon.doErrMessageExist()) {
				this.handleSuggest({
					oEvent: oEvent,
					aProperties: ["Batch", "Batch"],
					sBinding: "suggestionRows"
				});
			} else {
				oEvent.getSource().setValue("");
				this.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
					.getData().length);
				oPPCCommon.showMessagePopover(gList);
			}

			//for enhancement
			if (this.handleBatchSuggest_Exit) {
				this.handleBatchSuggest_Exit(oEvent);
			}
		},
		handleSuggest: function (mParemeters) {
			var sTerm = mParemeters.oEvent.getParameter("suggestValue");
			var aFilters = [];

			if (sTerm) {
				for (var i = 0; i < mParemeters.aProperties.length; i++) {
					aFilters.push(new sap.ui.model.Filter(mParemeters.aProperties[i], sap.ui.model.FilterOperator.StartsWith, sTerm));
				}
			}
			var allFilters = new sap.ui.model.Filter(aFilters, false);
			mParemeters.oEvent.getSource().getBinding(mParemeters.sBinding).filter(allFilters);
		},

		suggestionNewMatItemSelected: function (mParemeters, callBack) {
			var that = this;
			var tokenTextLength = that.getView().getModel("LocalViewSetting").getProperty("/tokenTextLength");
			mParemeters.oEvent.getSource().setValueState("None");
			mParemeters.oEvent.getSource().setValueStateText("");
			var sPath = mParemeters.oEvent.getParameter("selectedRow").getBindingContext(mParemeters.sModelName).getPath();
			if (mParemeters.sGUID) {
				var keyGUID = mParemeters.thisController.getView().getModel(mParemeters.sModelName).getProperty(sPath + "/" + mParemeters.sGUID);
				var key = mParemeters.thisController.getView().getModel(mParemeters.sModelName).getProperty(sPath + "/" + mParemeters.sKey);
				var desc = mParemeters.thisController.getView().getModel(mParemeters.sModelName).getProperty(sPath + "/" + mParemeters.sDescription);
				mParemeters.oEvent.getSource().removeAllTokens();
				mParemeters.oEvent.getSource().addToken(new sap.m.Token({
					key: keyGUID,
					text: that.TextAbstract(desc, key, tokenTextLength),
					tooltip: desc + " (" + key + ")"
				}));
				mParemeters.oEvent.getSource().setValue("");
			} else {
				var key = mParemeters.thisController.getView().getModel(mParemeters.sModelName).getProperty(sPath + "/" + mParemeters.sKey);
				var desc = mParemeters.thisController.getView().getModel(mParemeters.sModelName).getProperty(sPath + "/" + mParemeters.sDescription);
				mParemeters.oEvent.getSource().removeAllTokens();
				mParemeters.oEvent.getSource().addToken(new sap.m.Token({
					key: key,
					text: that.TextAbstract(desc, key, tokenTextLength),
					tooltip: desc + " (" + key + ")"
				}));
				mParemeters.oEvent.getSource().setValue("");
			}
			var jData = mParemeters.thisController.getView().getModel(mParemeters.sModelName).getProperty(sPath);
			if (callBack) {
				callBack(key, desc, jData);
			}
		},
		validateOtherMaterial: function (jData) {
			var data = this.getView().getModel("ListItems").getData();
			var exist = true;
			for (var i = 0; i < data.length; i++) {
				if (jData.MaterialNo === data[i].MaterialNo) {
					exist = false;
					var msg = "Material " + jData.MaterialNo + " already exists";
					oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/MaterialNo");
				}
			}
			return exist;
		},
		onChangeOtherMaterial: function (oEvent) {
			oPPCCommon.removeAllMsgs();
			this.validateMandatory();
			if (oPPCCommon.doErrMessageExist()) {
				var that = this;
				var index = oEvent.getSource().getId().slice(-1);
				index = parseInt(oEvent.getSource().getBindingContext("ListItems").getPath().split("/")[1]);
				var itemIndex = parseInt(index);
				var SOCreateItem = this.getView().getModel("ListItems");
				var aItems = SOCreateItem.getProperty('/');
				var oBindingContext = oEvent.getSource().getBindingContext("ListItems");
				var cells = this.getView().byId("UIListTableOther").getRows()[itemIndex].getCells();
				for (var j = 0; j < cells.length; j++) {
					if (cells[j].getId().indexOf("inputOtherMaterial") !== -1) {
						this.MaterialInput = this.getView().byId(cells[j].getId());
					}
				}
				that.suggestionOnChange({
						oEvent: oEvent,
						thisController: this,
						sModelName: "OtherMatSuggestorModel",
						sKey: "MaterialNo",
						sDescription: "MaterialDesc"
					},
					function (enteredVal, bFound, key, desc, jData) {
						//var jData = tokens[0].getCustomData()[0].getValue();
						// var bValidMaterial = that.validateOtherMaterial(jData);
						// if (bValidMaterial) {
						var UMOArray = [{
							Uom: jData.BaseUom
						}, {
							Uom: jData.AlternativeUOM1
						}];
						that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/MaterialNo", jData.MaterialNo);
						that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/MaterialDesc", jData.MaterialDesc);
						that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/OrderMaterialGroupID", jData.ProdHier);
						that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/OrderMaterialGroupDesc", jData.ProdHierDesc);
						that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/DMSDivisionID", jData.DivisionID);
						that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/UOMs", UMOArray);
						that.checkForNewLineItem();
						// } else {
						// 	// that.MaterialTokenInput.setValue(tokens[0].getCustomData()[0].getValue().MaterialNo);
						// 	that.getView().byId("UIListTableOther").getRows()[itemIndex].getAggregation("cells")[1].removeAllTokens();
						// 	that.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
						// 		.getData()
						// 		.length);
						// 	oPPCCommon.showMessagePopover(gList);
						// }

					}
				);
			} else {
				oEvent.getSource().setValue("");
				oPPCCommon.displayMsg_MsgBox(this.getView(), oPPCCommon.getMsgsFromMsgMgr(), "error");
			}

			//for enhancement
			if (this.onChangeOtherMaterial_Exit) {
				this.onChangeOtherMaterial_Exit(oEvent);
			}
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
					mParemeters.oEvent.getSource().setValueStateText("Please enter valid " + mParemeters.sKey);
				}
			}
			if (callBack) {
				callBack(enteredVal, bFound, key, desc, jData);
			}
		},
		onChangeMaterial1: function (oEvent) {
			var that = this;
			oPPCCommon.removeAllMsgs();
			this.validateMandatory();
			if (oPPCCommon.doErrMessageExist()) {
				that.suggestionOnChange({
						oEvent: oEvent,
						thisController: this,
						sModelName: "MatSuggestorModel",
						sKey: "MaterialNo",
						sDescription: "MaterialDesc"
					},
					function (enteredVal, bFound, key, desc, jData) {
						that.setSelectedMaterialToTable1(jData);

					}
				);
			} else {
				oEvent.getSource().setValue("");
				oPPCCommon.displayMsg_MsgBox(this.getView(), oPPCCommon.getMsgsFromMsgMgr(), "error");
			}
			if (this.onChangeMaterial1_Exit) {
				this.onChangeMaterial1_Exit(oEvent);
			}
		},
		onChangeMaterial: function (oEvent) {
			oPPCCommon.removeAllMsgs();
			this.validateMandatory();
			if (oPPCCommon.doErrMessageExist()) {
				var that = this;
				var index = oEvent.getSource().getId().slice(-1);
				index = parseInt(oEvent.getSource().getBindingContext("ListItems").getPath().split("/")[1]);
				var itemIndex = parseInt(index);
				var SOCreateItem = this.getView().getModel("ListItems");
				var aItems = SOCreateItem.getProperty('/');
				var oBindingContext = oEvent.getSource().getBindingContext("ListItems");
				var cells = this.getView().byId("UIListTable").getRows()[itemIndex].getCells();
				// for (var j = 0; j < cells.length; j++) {
				// 	if (cells[j].getId().indexOf("inputMaterial") !== -1) {
				// 		this.MaterialInput = this.getView().byId(cells[j].getId());
				// 		this.getView().byId(cells[j].getId()).setValueState("None");
				// 		this.getView().byId(cells[j].getId()).setValueStateText("");
				// 	}
				// }
				oPPCCommon.suggestionOnChange({
						oEvent: oEvent,
						thisController: this,
						sModelName: "MatSuggestorModel",
						sKey: "MaterialNo",
						sDescription: "MaterialDesc"
					},
					function (enteredVal, bFound, key, desc, jData) {
						//var jData = tokens[0].getCustomData()[0].getValue();
						var bValidMaterial = true;
						//that.validateMaterial(jData, oEvent.getSource(), itemIndex);
						if (bFound) {
							//that.MaterialInput.addToken(tokens[0]);
							oEvent.getSource().setValueState("None");
							oEvent.getSource().setValueStateText("");
							that.setSelectedMaterialToTable(jData, oBindingContext, aItems, itemIndex);
							that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/OrderMaterialGroupID", jData.OrderMaterialGroupID);
							that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/OrderMaterialGroupDesc", jData.OrderMaterialGroupDesc);
							that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/DMSDivision", jData.DMSDivision);
							that.getView().getModel("ListItems").setProperty("/" + itemIndex + "/DmsDivisionDesc", jData.DmsDivisionDesc);
							// that.getMaterialUOMs(jData.MaterialNo, itemIndex);
						} else {
							// that.MaterialTokenInput.setValue(tokens[0].getCustomData()[0].getValue().MaterialNo);
							// that.getView().byId("UIListTable").getRows()[itemIndex].getAggregation("cells")[1].removeAllTokens();
							oEvent.getSource().setValue("");
							that.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
								.getData()
								.length);
							oPPCCommon.showMessagePopover(gList);
						}

					}
				);
			} else {
				oEvent.getSource().setValue("");
				oPPCCommon.displayMsg_MsgBox(this.getView(), oPPCCommon.getMsgsFromMsgMgr(), "error");
			}

			//for enhancement
			if (this.onChangeMaterial_Exit) {
				this.onChangeMaterial_Exit(oEvent);
			}
		},
		onDeleteItem: function (oEvent) {
			var that = this;
			//	this.removeAllTokenforItems();
			var path = oEvent.getSource().getBindingContext("ListItems").getPath().split("")[1];
			oEvent.getSource().getBindingContext("ListItems").getModel().getData().splice(path, 1);
			oEvent.getSource().getBindingContext("ListItems").getModel().refresh();
			var data = oEvent.getSource().getBindingContext("ListItems").getModel().getData();
			oEvent.getSource().getBindingContext("ListItems").getModel().refresh();
			this.getView().getModel("LocalViewSetting").setProperty("/ListItemsCount", data.length);

			// var rows = this.getView().byId("UIListTable").getRows();
			// oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/MaterialNo", "");
			// oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/MaterialDesc", "");
			// oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/Batch", "");
			// oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/Quantity", "0");
			// oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/ManufacturingDate", null);
			// oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/ExpiryDate", null);
			// oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/MRP", "0.00");
			// oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/UOM", "");
			// oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/UOMs", []);
			// oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/Currency", "");
			// oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/TrnsfdQty", "0");
			// oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/OrderMaterialGroupID", "");
			// oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/DMSDivision", "");
			// oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/OrderMaterialGroupDesc", "");
			// oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/DmsDivisionDesc", "");
			// oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/AdjQty", "0");
			// oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/DiffQty", "0");
			// oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/GQuantity", "0");
			// oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/SQuantity", "0.00");
			// oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/DQuantity", "0.00");
			// oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/PurchasePrice", "0.00");
			// oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/DQuantity", "0.00");
			// oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/ReasonID", "");
			// oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/RefDocNo", "");
			// oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/RefDocItemNo", "");
			// oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/Remarks", "");
			// oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/TempBatches", []);

			// oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/MaterialTokens", []);

			// oEvent.getSource().getBindingContext("ListItems").getModel().setProperty("/" + path + "/Batch", "");

			this.setItemNo();
			//	setTimeout(function () {
			//	that.addTokenstoLineItems();
			//sthat.checkForNewLineItem();
			if (data.length === 0) {
				that.setDataModel();
			}
			//	}, 100);
		},
		onDeleteItem1: function (oEvent) {
			var that = this;
			var path = oEvent.getSource().getBindingContext("ListItems").getPath().split("")[1];
			oEvent.getSource().getBindingContext("ListItems").getModel().getData().splice(path, 1);
			oEvent.getSource().getBindingContext("ListItems").getModel().refresh();
			var data = oEvent.getSource().getBindingContext("ListItems").getModel().getData();
			oEvent.getSource().getBindingContext("ListItems").getModel().refresh();
			this.getView().getModel("LocalViewSetting").setProperty("/ListItemsCount", data.length);
		},
		onDeleteOtherItem: function (oEvent) {
			var that = this;
			this.removeAllTokenforOtherItems();
			gList.getModel("LocalViewSetting").setProperty("/CalculateButton", true);
			gList.getModel("LocalViewSetting").setProperty("/CalculateButtonEnable", true);
			gList.getModel("LocalViewSetting").setProperty("/ReviewButtonEnable", false);
			var path = oEvent.getSource().getBindingContext("ListItems").getPath().split("")[1];
			oEvent.getSource().getBindingContext("ListItems").getModel().getData().splice(path, 1);
			oEvent.getSource().getBindingContext("ListItems").getModel().refresh();
			var data = oEvent.getSource().getBindingContext("ListItems").getModel().getData();
			// for (var i = 0; i < data.length; i++) {
			// 	data[i].ItemNo = i + 1;
			// }
			oEvent.getSource().getBindingContext("ListItems").getModel().refresh();
			this.getView().getModel("LocalViewSetting").setProperty("/ListItemsCount", data.length);
			setTimeout(function () {
				that.addTokenstoOtherLineItems();
				that.checkForNewLineItem();
				if (data.length === 0) {
					that.setDataModel();
					// if (data.length === 0) {
					// 	that.setDataModel();
					// }
				}
			}, 100);
		},
		addTokenstoOtherLineItems: function () {
			var that = this;
			var tokenTextLength = 10;
			var data = this.getView().getModel("ListItems").getData();
			var rows = this.getView().byId("UIListTableOther").getRows();
			for (var i = 0; i < data.length; i++) {
				var cells = rows[i].getCells();
				var token = new sap.m.Token({
					key: data[i].MaterialNo,
					text: that.TextAbstract(data[i].MaterialDesc, data[i].MaterialNo, tokenTextLength),
					tooltip: data[i].MaterialDesc + "(" + data[i].MaterialNo + ")"
				});
				for (var j = 0; j < cells.length; j++) {
					if (cells[j].getId().indexOf("inputOtherMaterial") !== -1) {
						var matCellId = cells[j].getId();
						if (data[i].MaterialNo !== "") {
							this.getView().byId(matCellId).addToken(token);
						}
					}
				}

			}
		},
		addTokenstoLineItems: function () {
			var that = this;
			var tokenTextLength = 25;
			var data = gList.getModel("ListItems").getData();
			var rows = gList.byId("UIListTable").getRows();
			var num = 1;
			var itemNo = "";
			for (var i = 0; i < data.length; i++) {
				itemNo = 1 * num;
				num++;
				data[i].ItemNo = itemNo;
				var cells = rows[i].getCells();
				var token = new sap.m.Token({
					key: data[i].MaterialNo,
					text: that.TextAbstract(data[i].MaterialDesc, data[i].MaterialNo, tokenTextLength),
					tooltip: data[i].MaterialDesc + "(" + data[i].MaterialNo + ")"
				});
				for (var j = 0; j < cells.length; j++) {
					// if (cells[j].getId().indexOf("inputMaterial") !== -1) {
					// 	var matCellId = cells[j].getId();
					// 	if (data[i].MaterialNo !== "") {
					// 		gList.byId(matCellId).addToken(token);
					// 	}
					// }
					// if (cells[j].getId().indexOf("UIFromBatchDD") !== -1) {
					// 	var batchCellId = cells[j].getId();
					// 	var json = new sap.ui.model.json.JSONModel(data[i].CPStockItemSnos);
					// 	gList.byId(batchCellId).setModel(json, "BatchDD");
					// }
					// if (cells[j].getId().indexOf("FReasonIDEdit") !== -1) {
					// 	var reasonCellId = cells[j].getId();
					// 	gList.byId(reasonCellId).setSelectedKey(data[i].ReasonID);
					// }
				}

			}
			gList.getModel("ListItems").setData(data);
		},
		removeAllTokenforOtherItems: function () {
			var rows = gList.byId("UIListTableOther").getRows();
			for (var i = 0; i < rows.length; i++) {
				var cells = rows[i].getCells();
				for (var j = 0; j < cells.length; j++) {
					if (cells[j].getId().indexOf("inputOtherMaterial") !== -1) {
						var matCellId = cells[j].getId();
						gList.byId(matCellId).removeAllTokens();
					}
				}

			}

		},
		resetOtherMaterialTable: function () {
			var rows = gList.byId("UIListTableOther").getRows();
			for (var i = 0; i < rows.length; i++) {
				var cells = rows[i].getCells();
				for (var j = 0; j < cells.length; j++) {
					if (cells[j].getId().indexOf("inputOtherMaterial") !== -1) {
						var matCellId = cells[j].getId();
						gList.byId(matCellId).removeAllTokens();
					}
				}

			}
		},
		removeAllTokenforItems: function () {
			var rows = gList.byId("UIListTable").getRows();
			for (var i = 0; i < rows.length; i++) {
				var cells = rows[i].getCells();
				for (var j = 0; j < cells.length; j++) {
					// if (cells[j].getId().indexOf("inputMaterial") !== -1) {
					// 	var matCellId = cells[j].getId();
					// 	gList.byId(matCellId).removeAllTokens();
					// }

					if (cells[j].getId().indexOf("UIFromBatchDD") !== -1) {
						var batchCellId = cells[j].getId();
						var json = new sap.ui.model.json.JSONModel([]);
						gList.byId(batchCellId).setModel(json, "BatchDD");
					}
					// if (cells[j].getId().indexOf("FReasonIDEdit") !== -1) {
					// 	var reasonCellId = cells[j].getId();
					// 	gList.byId(reasonCellId).setSelectedKey(" ");
					// }
				}

			}

		},
		removeAllTokenforItemsRadio: function () {
			var rows = gList.byId("UIListTableOther").getRows();
			for (var i = 0; i < rows.length; i++) {
				var cells = rows[i].getCells();
				for (var j = 0; j < cells.length; j++) {
					if (cells[j].getId().indexOf("inputOtherMaterial") !== -1) {
						var matCellId = cells[j].getId();
						gList.byId(matCellId).removeAllTokens();
					}

				}

			}

		},
		validateMaterial: function (jData, oMaterial, itemIndex) {
			gList.getModel("ListItems").setProperty("/" + itemIndex + "/MaterialNoValueState", sap.ui.core.ValueState.None);
			gList.getModel("ListItems").setProperty("/" + itemIndex + "/MaterialNoValueStateText", "");
			oPPCCommon.removeMsgsInMsgMgrById("/UI/MaterialNo");
			oPPCCommon.hideMessagePopover(gList);
			this.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
				.getData()
				.length);

			var bValidMaterial = true;
			var MaterialNo = jData.MaterialNo;
			if (MaterialNo) {
				var SOCreateItem = gList.getModel("ListItems");
				var aItems = SOCreateItem.getProperty("/");
				aItems[itemIndex].Material = jData.MaterialNo;
				for (var i = 0; i < aItems.length; i++) {
					if (itemIndex !== i) {
						if (aItems[i].MaterialNo === MaterialNo) {
							bValidMaterial = false;
							break;
						}
					}
				}
			}

			if (!bValidMaterial) {
				// oMaterial.setValueState(sap.ui.core.ValueState.Error);
				var msg = oi18n.getText("SSStockCreate.Message.MaterialRepeat1", MaterialNo) + " " + oi18n.getText(
					"SSStockCreate.Message.MaterialRepeat2");
				// oMaterial.setValueStateText(msg);
				gList.getModel("ListItems").setProperty("/" + itemIndex + "/MaterialNoValueState", sap.ui.core.ValueState.Error);
				gList.getModel("ListItems").setProperty("/" + itemIndex + "/MaterialNoValueStateText", msg);
				oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/MaterialNo");
			}

			//for enhancement
			if (this.validateMaterial_Exit) {
				bValidMaterial = this.validateMaterial_Exit(jData, oMaterial, itemIndex);
			}

			return bValidMaterial;
		},
		addExistingItem: function () {
			var items = this.getView().getModel("ListItems").getData();
			var obj = {
				MaterialNo: "",
				MaterialDesc: "",
				MaterialDocGUID: "",
				MaterialDocQty: "",
				StockGUID: "",
				Remarks: "",
				Currency: "",
				Price: "",
				MRP: "",
				UOM: "",
				Batch: "",
				ExpiryDate: null,
				ItemNo: "",
				DMSDivisionID: "",
				DMSDivisionDesc: "",
				MFD: "",
				GQuantity: "0",
				DQuantity: "0",
				SQuantity: "0"
			};
			items.push(obj);
			this.getView().getModel("ListItems").setProperty("/", items);
			this.getView().getModel("LocalViewSetting").setProperty("/ListItemsCount", items.length);
			this.setItemNo(items);

		},
		setItemNo: function (Items) {

			var count = 0;
			var aItem = this.getView().getModel("ListItems").getProperty("/");

			for (var i = 0; i < aItem.length; i++) {
				count = count + 10;
				aItem[i].ItemNo = count;

			}

			this.getView().getModel("ListItems").setProperty("/", aItem);
			if (this.setItemNo_Exit) {
				this.setItemNo_Exit(Items);
			}

		},
		addOtherItem: function () {
			var items = this.getView().getModel("ListItems").getData();

			items.push({

				MaterialNo: "",
				MaterialDesc: "",
				CPStockItemGUID: oPPCCommon.generateUUID(),
				ExpiryDate: null,
				OrderMaterialGroupID: "",
				OrderMaterialGroupDesc: "",
				ManufacturingDate: null,
				GQuantity: "0",
				DQuantity: "0",
				SQuantity: "0",
				Currency: "",
				UOM: "",
				Batch: "",
				BatchValueState: "None",
				BatchValueStateText: "",
				UOMValueState: "None",
				UOMValueStateText: "",
				MRP: "0.00",
				MRPValueState: "None",
				MRPValueStateText: "",
				UnitPrice: "0.00",
				UnitPriceValueState: "None",
				UnitPriceValueStateText: "",
				InvoiceItemGUID: "",
				QuantityValueState: "None",
				MDateValueState: "None",
				MDateValueStateText: "",
				EDateValueState: "None",
				EDateValueStateText: "",
				Remarks: "",
				RemarksState: "None",
				DeletionInd: "",
				BatchOrSerial: ""
			});
			this.getView().getModel("ListItems").setProperty("/", items);
			this.getView().getModel("LocalViewSetting").setProperty("/ListItemsCount", items.length);
		},
		/*----------------------------------------------ShowPopUp-------------------------------------------------------*/
		popUp: function () {
			oPPCCommon.showMessagePopover(gList);
		},
		selectAllItems: function (oEvent) {
			var selected = oEvent.mParameters.selected;
			var items = this.getView().getModel("ListItems").getProperty("/");
			if (selected === true) {
				for (var i = 0; i < items.length; i++) {
					this.getView().getModel("ListItems").setProperty("/" + i + "/SelectedItem", true);
					this.getView().getModel("ListItems").setProperty("/" + i + "/enableLineItem", true);
				}
			} else {
				for (var i = 0; i < items.length; i++) {
					this.getView().getModel("ListItems").setProperty("/" + i + "/SelectedItem", false);
					this.getView().getModel("ListItems").setProperty("/" + i + "/enableLineItem", false);
					this.getView().getModel("ListItems").setProperty("/" + i + "/AdjQty", "");
					this.getView().getModel("ListItems").setProperty("/" + i + "/DiffQty", "");
					this.getView().getModel("ListItems").setProperty("/" + i + "/ReasonID", "");
					this.getView().getModel("ListItems").setProperty("/" + i + "/Remarks", "");

				}
			}
		},
		SelectItem: function (oEvent) {
			var selected = oEvent.mParameters.selected;
			var path = oEvent.getSource().getBindingContext("ListItems").getPath();
			var idx = parseInt(path.substring(path.lastIndexOf('/') + 1));
			if (selected === true) {
				this.getView().getModel("ListItems").setProperty("/" + idx + "/enableLineItem", true);
			} else {
				this.getView().getModel("ListItems").setProperty("/" + idx + "/enableLineItem", false);
				this.getView().getModel("ListItems").setProperty("/" + idx + "/AdjQty", "");
				this.getView().getModel("ListItems").setProperty("/" + idx + "/DiffQty", "");
				this.getView().getModel("ListItems").setProperty("/" + idx + "/ReasonID", "");
				this.getView().getModel("ListItems").setProperty("/" + idx + "/Remarks", "");
			}
		},
		onChangeMFDdate: function (oEvent) {
			var that = this;
			this.ClearValueState(["MDateValueState"]);
			oPPCCommon.removeAllMsgs();
			oPPCCommon.hideMessagePopover(gList);
			var path = oEvent.getSource().getBindingContext("ListItems").getPath();
			var idx = parseInt(path.substring(path.lastIndexOf('/') + 1));
			var listItems = gList.getModel("ListItems").getData();
			// that.getView().getModel("ListItems").setProperty("/" + idx + "/ManufacturingDate", null);
			var MFDdate = oEvent.getSource().getDateValue();
			if (typeof (MFDdate) != "object") {
				var split = MFDdate.split('/');
				var date = new Date(split[2], split[1] - 1, split[0]); //Y M D

				MFDdate = oPPCCommon.addHoursAndMinutesToDate({
					dDate: date
				});
			}
			if (MFDdate === null || MFDdate === "") {
				var msg = "Please Select Manuf Date for Material No " + listItems[idx].MaterialNo;
				oPPCCommon.addMsg_MsgMgr(msg, "error", "MDate" + idx);
				oPPCCommon.showMessagePopover(gList);
				that.getView().getModel("ListItems").setProperty("/" + idx + "/ManufacturingDate", null);
			}
			if (MFDdate !== null && MFDdate !== "") {
				var Today = that.getView().getModel("LocalViewSetting").getProperty("/Today");
				var d1 = new Date(MFDdate.getFullYear(), MFDdate.getMonth(), MFDdate.getDate());
				var d2 = new Date(Today.getFullYear(), Today.getMonth(), Today.getDate());
				if (d1 > d2) {
					var msg = "Manuf Date cannot be Future Date for Material No " + listItems[idx].MaterialNo;
					oPPCCommon.addMsg_MsgMgr(msg, "error", "MDate" + idx);
					oPPCCommon.showMessagePopover(gList);
					that.getView().getModel("ListItems").setProperty("/" + idx + "/ManufacturingDate", null);
				} else {
					that.getView().getModel("ListItems").setProperty("/" + idx + "/ManufacturingDate", MFDdate);
				}
			}
		},
		onChangeExpiryDate: function (oEvent) {
			var that = this;
			this.ClearValueState(["EDateValueState"]);
			oPPCCommon.removeAllMsgs();
			oPPCCommon.hideMessagePopover(gList);
			var path = oEvent.getSource().getBindingContext("ListItems").getPath();
			var idx = parseInt(path.substring(path.lastIndexOf('/') + 1));
			var listItems = gList.getModel("ListItems").getData();
			var MFDdate = that.getView().getModel("ListItems").getProperty("/" + idx + "/ManufacturingDate");
			if (MFDdate === null || MFDdate === "") {
				var msg = "Please Enter Manuf Date for Material No " + listItems[idx].MaterialNo;
				oPPCCommon.addMsg_MsgMgr(msg, "error", "MDate" + idx);
				oPPCCommon.showMessagePopover(gList);
				that.getView().getModel("ListItems").setProperty("/" + idx + "/ExpiryDate", null);
			} else {
				var Expirydate = oEvent.getSource().getDateValue();
				if (typeof (Expirydate) != "object") {
					var split = Expirydate.split('/');
					var date = new Date(split[2], split[1] - 1, split[0]); //Y M D

					Expirydate = oPPCCommon.addHoursAndMinutesToDate({
						dDate: date
					});

				}
				if (Expirydate === null || Expirydate === "") {
					var msg = "Please Enter Expiry Date for Material No " + listItems[idx].MaterialNo;
					oPPCCommon.addMsg_MsgMgr(msg, "error", "EDate" + idx);
					oPPCCommon.showMessagePopover(gList);
					that.getView().getModel("ListItems").setProperty("/" + idx + "/ExpiryDate", null);
				}
				if (Expirydate !== null && Expirydate !== "") {
					var d1 = new Date(MFDdate.getFullYear(), MFDdate.getMonth(), MFDdate.getDate());
					var d2 = new Date(Expirydate.getFullYear(), Expirydate.getMonth(), Expirydate.getDate());
					if (d2 < d1) {
						var msg = "Expiry Date Should be Greater than or Equal to Manuf Date for Material No" + listItems[idx].MaterialNo;
						oPPCCommon.addMsg_MsgMgr(msg, "error", "EDate" + idx);
						oPPCCommon.showMessagePopover(gList);
						that.getView().getModel("ListItems").setProperty("/" + idx + "/ExpiryDate", null);
					} else {
						that.getView().getModel("ListItems").setProperty("/" + idx + "/ExpiryDate", Expirydate);
					}
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
			this.ClearValueState1(["BatchValueState", "UOMValueState", "MRPValueState", "UnitPriceValueState", "MDateValueState",
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
		ClearValueState1: function (ValueStateArray) {
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
		selectDocumentType: function (oEvent) {
			// alert("Hai");
			var that = this;
			this.getDocumentStore();
			var oPanel = new sap.m.Panel();
			var DocTypeLabel = new sap.m.Label({
				text: oi18n.getText("ContractAttachments.Page.UploadCollection.Dialog.DoumentType"),
				required: true
			});
			//DocTypeLabel.addStyleClass("sapUiMediumMarginBegin");
			DocTypeLabel.addStyleClass("sapUiTinyMarginEnd");
			DocTypeLabel.addStyleClass("sapUiTinyMarginTop");
			//var FileChooserLabel=new sap.m.Label({id:"label" , text:"Select File:"});
			var DocTypeHBox = new sap.m.HBox();
			DocTypeHBox.addStyleClass("sapUiTinyMarginTop");
			//var FileChooser=new sap.m.HBox();
			var VBox = new sap.m.VBox();
			var Text = new sap.m.Text({
				text: ""
			});
			var oDocTypeItemTemplate = new sap.ui.core.Item({
				key: "{Key}",
				text: "{Key}{Seperator}{Text}{Mandatory}",
				tooltip: "{Key}{Seperator}{Text}"
			});
			this.DocType = new sap.m.Select({
				items: {
					path: "/",
					template: oDocTypeItemTemplate
				}
			});
			// this.DocType.setModel(this.getView().getModel("DocTypeDD"));
			// this.DocType.addStyleClass("sapUiTinyMarginBegin");
			var UploadCollection = new sap.m.UploadCollection({
				width: "100%",
				maximumFilenameLength: 55,
				maximumFileSize: 10,
				multiple: false,
				sameFilenameAllowed: false,
				instantUpload: false,
				showSeparators: "All",
				noDataText: oUtilsI18n.getText("common.NoAttachments"),
				change: function (oEvent) {
					that.onChange(oEvent);
				},
				fileDeleted: function (oEvent) {
					that.onFileDeleted(oEvent);
				},
				filenameLengthExceed: function (oEvent) {
					that.onFilenameLengthExceed(oEvent);
				},
				fileSizeExceed: function (oEvent) {
					that.onFileSizeExceed(oEvent);
				},
				typeMissmatch: function (oEvent) {
					that.onTypeMissmatch(oEvent);
				},
				beforeUploadStarts: function (oEvent) {
					that.onBeforeUploadStarts(oEvent);
				},
				uploadComplete: function (oEvent) {
					that.onUploadComplete(oEvent);
				},
				uploadUrl: "/sap/opu/odata/ARTEC/SCGW/SchemeDocuments"
			});
			DocTypeHBox.addItem(DocTypeLabel);
			DocTypeHBox.addItem(this.DocType);
			// if (DocumentStore === "A") {
			// 	VBox.addItem(DocTypeHBox);
			// 	VBox.addItem(Text);
			// }
			VBox.addItem(UploadCollection);
			VBox.addStyleClass("sapUiTinyMargin");
			oPanel.addContent(VBox);
			this.dialog = new sap.m.Dialog({
				title: oi18n.getText("ContractAttachments.Page.UploadCollection.Dialog.Title"),
				type: 'Standard',
				width: "50%",
				height: "50%",
				resizable: true,
				contentWidth: "50%",
				contentHeight: "50%",
				state: 'None',
				icon: 'sap-icon://attachment',
				draggable: true,
				content: oPanel,
				buttons: [new sap.m.Button({
						text: oi18n.getText("ContractAttachments.Page.UploadCollection.Dialog.Title"),
						press: function () {
							oPPCCommon.removeAllMsgs();
							if (that.validateContractAttachments(UploadCollection)) {
								that.startUpload(UploadCollection);
								that.dialog.close();
							} else {
								var message = oPPCCommon.getMsgsFromMsgMgr();
								oPPCCommon.displayMsg_MsgBox(that.getView(), message, "error");
							}
						}
					}),
					new sap.m.Button({
						text: oi18n.getText("ContractAttachments.Page.UploadCollection.Dialog.Button.Cancel"),
						press: function () {
							//that.getInvoiceContractDocumentss(that._oComponent);
							that.dialog.close();
						}
					})
				],
				afterClose: function () {
					//that.dialog.destroy();
				}
			});
			aDialog = that.dialog;
			that.dialog.open();
			if (sap.ui.Device.support.touch === false) {
				that.dialog.addStyleClass("sapUiSizeCompact");
			}
		},
		onChange: function (oEvent) {
			var that = this;
			var token = this._oComponent.getModel("SCGW").getSecurityToken();
			var oUploadCollection = this.getView().byId('UploadCollectionView');
			var url = this._oComponent.getModel("SCGW").sServiceUrl + "/SchemeDocuments";
			var sLoginID = this.getCurrentUsers("SchemeDocuments", "write");
			var oHeaderLoginId = new sap.m.UploadCollectionParameter({
				name: "x-arteria-loginid",
				value: sLoginID
			});
			var oHeaderToken = new sap.m.UploadCollectionParameter({
				name: "x-csrf-token",
				value: token
			});
			var oHeaderMethod = new sap.m.UploadCollectionParameter({
				name: "type",
				value: "POST"
			});
			var sFileName = oEvent.getParameter("mParameters").files[0].name;

			var oHeaderSlug;

			// var DocTypeID = this.getView().getModel("DocTypeDD").getData()[0].Key;
			DocumentStore = that.getView().getModel("LocalViewSetting").getProperty("/DocumentStore");
			// SchemeGUID = gSchemeDetails.getModel("Schemes").getProperty("/SchemeGUID").toUpperCase();
			gSchemeGUID = that.getView().getModel("LocalViewSetting").getProperty("/GUID").toUpperCase();
			oHeaderSlug = new sap.m.UploadCollectionParameter({
				name: "SLUG",
				value: "SchemeGUID:" + gSchemeGUID + ",DocumentStore:" + DocumentStore + ",FileName:" +
					sFileName +
					",LoginID:" + sLoginID
			});

			oUploadCollection.setUploadUrl(url);
			oUploadCollection.addHeaderParameter(oHeaderLoginId);
			oUploadCollection.addHeaderParameter(oHeaderSlug);
			oUploadCollection.addHeaderParameter(oHeaderToken);
			oUploadCollection.addHeaderParameter(oHeaderMethod);
		},
		onFileDeleted: function (oEvent) {
			this.getView().setBusy(true);
			oPPCCommon.removeAllMsgs();
			var that = this;
			var URL;
			var DocumentDeleteModel = this._oComponent.getModel("SCGW");
			var sLoginID = this.getCurrentUsers("SchemeDocuments", "delete");
			// DocumentDeleteModel.setUseBatch(false);
			DocumentDeleteModel.setHeaders({
				"x-arteria-loginid": sLoginID
			});
			var token = this._oComponent.getModel("SCGW").getSecurityToken();
			DocumentDeleteModel.setHeaders({
				"x-csrf-token": token
			});
			var SchemeGUID = gSchemeGUID;
			var SchemeGuid = "guid'" + SchemeGUID + "'";
			URL = "SchemeDocuments(SchemeGUID=" + SchemeGuid + ",DocumentID='" + escape(oEvent.getParameters().documentId) +
				"',DocumentStore='" + DocumentStore + "')";
			DocumentDeleteModel.remove("/" + URL, {
				headers: {
					"x-arteria-loginid": sLoginID
				},
				success: function () {
					oPPCCommon.removeDuplicateMsgsInMsgMgr();
					var message = oPPCCommon.getMsgsFromMsgMgr();
					vIndex++;
					that.getContractDocumentss(that._oComponent, oi18n.getText(
						"ContractAttachments.message.deleted"));

				},
				error: function (error) {
					oPPCCommon.removeDuplicateMsgsInMsgMgr();
					var message = oPPCCommon.getMsgsFromMsgMgr();
					oPPCCommon.displayMsg_MsgBox(that.getView(), message, "error");
					oDialog.close();
				}
			});
		},
		getDocumentStore: function () {
			var that = this;
			var view = this.getView();
			var oModelData = this._oComponent.getModel("PCGW");
			var oStatusFilter = new Array();

			oStatusFilter = oPPCCommon.setODataModelReadFilter(view, "", oStatusFilter, "Typeset", sap.ui.model.FilterOperator
				.EQ, ["PC"], false, false, false);
			oStatusFilter = oPPCCommon.setODataModelReadFilter(view, "", oStatusFilter, "Types", sap.ui.model.FilterOperator
				.EQ, ["DMSSTORE"], false, false, false);

			oProductCommon.getDropdown(oModelData, "ConfigTypsetTypeValues", oStatusFilter, "TypeValue", "Types", busyDialog, this.getView(),
				"DocumentStore", "",
				function (aDDValue) {
					that.getView().getModel("LocalViewSetting").setProperty("/DocumentStore", aDDValue[0].Key);
					// var gDocumentStore = aDDValue[0].Key;
				});
		},
		onFilenameLengthExceed: function (UploadCollection) {
			if (UploadCollection.mParameters.mParameters.fileName.length > 55) {
				var msg1 = oi18n.getText("File name Length Exceeded");
				oPPCCommon.displayMsg_MsgBox(this.getView(), msg1, "error");
			}
			if (this.onFilenameLengthExceed_Exit) {
				this.onFilenameLengthExceed_Exit();
			}
		},
		onBeforeUploadStarts: function (oEvent) {
			var sLoginID = this.getCurrentUsers("SchemeDocuments", "write");
			var oHeaderLoginId = new sap.m.UploadCollectionParameter({
				name: "x-arteria-loginid",
				value: sLoginID
			});
			var oHeaderSlug;
			var token = this._oComponent.getModel("SCGW").getSecurityToken();

			var oHeaderToken = new sap.m.UploadCollectionParameter({
				name: "x-csrf-token",
				value: token
			});

			var DocTypeID = "STK_ADJ";
			vIndex++;
			// var DocTypeDesc = this.DocType.getSelectedItem().getText().split(" - ")[1].trim();
			var sFileName = oEvent.mParameters.fileName;
			// ContractNo = this.getView().getModel("Contracts").getProperty("/ContractNo");
			var SchemeGUID = gSchemeGUID;
			SchemeGUID = SchemeGUID.split("-").join('');
			// var DocTypeID = this.getView().getModel("DocTypeDD").getData()[0].Key;
			var DocumentID = oPPCCommon.generateUUID().toUpperCase();
			DocumentID = DocumentID.split("-").join('');
			oHeaderSlug = new sap.m.UploadCollectionParameter({
				name: "SLUG",
				value: "SchemeGUID:" + SchemeGUID + ",DocumentStore:" + DocumentStore + ",DocumentID:" + DocumentID + ",DocumentTypeID:" +
					DocTypeID + ",FileName:" +
					sFileName +
					",LoginID:" + sLoginID
			});
			oEvent.getParameters().addHeaderParameter(oHeaderToken);
			oEvent.getParameters().addHeaderParameter(oHeaderLoginId);
			oEvent.getParameters().addHeaderParameter(oHeaderSlug);

		},
		onUploadComplete: function (oEvent) {
			if (oEvent.getParameter("files")[0].status === 201) {
				this.getContractDocumentss(this._oComponent, oi18n.getText(
					"ContractAttachments.message.uploaded"));
				this.getView().setBusy(false);
			} else {
				var message = "";
				var response = oEvent.getParameter("files")[0].responseRaw;
				message = oPPCCommon.parseoDataXMLErrorMessage(response);
				this.getContractDocumentss(this._oComponent, oi18n.getText(
					"ContractAttachments.message.notuploaded") + message);
				this.getView().setBusy(false);
			}
		},
		getContractDocumentss: function (component, message) {
			var that = this;
			var SchemeDetails = this.getView();
			var controllerthis = this;
			var mandatoryDocs = "";
			var DocumentTypeID = [];
			// this.DynamicSideContent = gSchemeDetails.byId("ObjectPageLayout");
			var ContractDocumentsModel = component.getModel("SCGW");
			var LoginID = controllerthis.getCurrentUsers("SchemeDocuments", "read");
			ContractDocumentsModel.attachRequestSent(
				function () {});
			ContractDocumentsModel.attachRequestCompleted(function () {});
			ContractDocumentsModel.setHeaders({
				"x-arteria-loginid": LoginID
			});

			ContractDocumentsModel.read("/SchemeDocuments", {
				filters: controllerthis.prepareContractDocumentsODataFilter(component, LoginID),
				success: function (oData) {
					oPPCCommon.removeAllMsgs();
					oPPCCommon.hideMessagePopover(that.getView());
					that.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
						.getData().length);
					if (oData.results.length > 0) {
						var DocsModel = new sap.ui.model.json.JSONModel();
						for (var i = 0; i < oData.results.length; i++) {
							// var LoginIDz = controllerthis.getCurrentUsers("SchemeDocuments", "read");
							var sServiceURL = SchemeDetails.getModel("SCGW").sServiceUrl;
							var SchemeGuid = "guid'" + oData.results[i].SchemeGUID + "'";
							var sUrl = sServiceURL + "/SchemeDocuments(SchemeGUID=" + SchemeGuid + ",DocumentID='" +
								oData.results[i].DocumentID + "',DocumentStore='" + oData.results[i].DocumentStore +
								"')/$value";
							oData.results[i].DocumentUrl = oPPCCommon.getDocumentURL({
								sServiceUrl: sUrl,
								sApplication: "PD"
							});
						}
						DocsModel.setData(oData.results);
						SchemeDetails.getModel("LocalViewSetting").setProperty("/AttachmentCount", oData.results.length);
						if (component.getModel("SchemeCPDocuments")) {
							component.getModel("SchemeCPDocuments").setProperty("/", {});
						}
						component.setModel(DocsModel, "SchemeCPDocuments");

					} else {
						if (component.getModel("SchemeCPDocuments")) {
							component.getModel("SchemeCPDocuments").setProperty("/", {});
							SchemeDetails.getModel("LocalViewSetting").setProperty("/AttachmentCount", 0);

						}
					}
					vIndex--;
					if (vIndex === 0) {
						if (message) {
							setTimeout(function () {
								sap.m.MessageToast.show(message);
							}, 10);
						}
						that.getView().setBusy(false);

						oDialog.close();
					}

				},
				error: function (error) {
					if (component.getModel("SchemeDocuments")) {
						component.getModel("SchemeDocuments").setProperty("/", {});
					}
					oPPCCommon.removeAllMsgs();
					if (message) {
						setTimeout(function () {
							sap.m.MessageToast.show(message);
						}, 10);
					}
					if (DocumentStore === "A") {
						controllerthis.setMessageStrip(mandatoryDocs, component);

					}
					that.getView().setBusy(false);
					oDialog.close();
				}
			});
		},
		setMessageStrip: function (mandatoryDocs, component) {
			for (var k = 0; k < mandatoryDocs.length; k++) {
				if (mandatoryDocs[k].Count === 0) {
					if (mandatoryDocs === "") {
						mandatoryDocs = "'" + mandatoryDocs[k].Text + "'";
					} else {
						mandatoryDocs = mandatoryDocs + "," + "'" + gPOMandatoryDocType[k].Text + "'";
					}
				}
			}

			if (mandatoryDocs === "") {
				component.getModel("LocalAttachmentModel").setProperty("/MessageStripVisible", false);
			} else {
				var i18nProperty = "ContractAttachmentsA.ContractDocuments.DocTypeAttachmentMandatoryError";
				var msg = oi18n.getText(i18nProperty, mandatoryDocs);
				component.getModel("LocalAttachmentModel").setProperty("/MessageStripVisible", true);
				component.getModel("LocalAttachmentModel").setProperty("/MessageStripMessage", msg);
			}
		},
		prepareContractDocumentsODataFilter: function (component, LoginID) {
			var schemeGUID = gSchemeGUID;
			// schemeGUID = "guid'" + schemeGUID + "'";
			var that = this;
			var oModelData = component.getModel("SCGW");

			var ContractDocumentsFilters = new Array();
			ContractDocumentsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ContractDocumentsFilters, "LoginID", "", [
					LoginID
				],
				false, false, false);
			ContractDocumentsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ContractDocumentsFilters, "SchemeGUID", sap.ui
				.model
				.FilterOperator.EQ, [schemeGUID], true, false, false);

			ContractDocumentsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ContractDocumentsFilters, "DocumentStore", sap
				.ui
				.model
				.FilterOperator.EQ, [DocumentStore], true, false, false);
			// ContractDocumentsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ContractDocumentsFilters, "DocumentStore", sap.ui
			// 	.model
			// 	.FilterOperator.EQ, [DocumentStore], true, false, false);
			// ContractDocumentsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ContractDocumentsFilters, "DocumentStore", sap.ui
			// 	.model
			// 	.FilterOperator.EQ, [DocumentStore], true, false, false);

			return ContractDocumentsFilters;
		},

		validateContractAttachments: function (UploadCollection) {
			var valid = true;
			if (UploadCollection.getItems().length === 0) {
				var msg2 = oi18n.getText("ContractAttachmentsA.Page.Upload.AttachmentErrorMsg");
				var msgObj = oPPCCommon.addMsg_MsgMgr(msg2, "error", "FGroup_Attachment");
				valid = false;
			}
			return valid;
		},
		//Download format
		onDownloadFormat: function () {
			var that = this;
			if (this.sCustomerInputType === "DD") {
				if (gList.getModel("MaterialDocs").getData().FromGUID) {
					that.setBatchForExcelUpload(function () {
						that.onDownloadFormat1();
					})
				} else {
					var msg = "Please Select the Distributor"
					MessageBox.error(
						msg, {
							styleClass: "sapUiSizeCompact"
						}
					);
				}
			} else if (this.sCustomerInputType === "VH") {
				if (that.getView().byId("inputCustomerNo").getTokens().length != 0) {
					that.setBatchForExcelUpload(function () {
						that.onDownloadFormat1();
					})
				} else {
					var msg = "Please Add the Distributor"
					MessageBox.error(
						msg, {
							styleClass: "sapUiSizeCompact"
						}
					);
				}
			}
		},

		onDownloadFormat1: function () {
			var that = this;
			var oData = gList.getModel("BatchExcelUploadModel").getData();
			var Reason = this.ReasonText();
			var getStckUploadCol = this.getHeaderColumnForExcel(Reason);
			var rows = new Array();
			rows.push(getStckUploadCol.retailerMainHeader, getStckUploadCol.stockHeader);

			// rows.push(getStckUploadCol.stockHeader);

			// var Parent = this.getView().getModel("LocalViewSetting").getProperty("/customerNo");
			for (var i = 0; i < oData.length; i++) {

				var getTypeWiseUploadColItem = that.getHeaderColumnForExcelTypeWiseItem(oData, i);
				rows.push(getTypeWiseUploadColItem.typeWiseItem);
			}
			var csvContent = "";
			rows.forEach(function (rowArray) {
				var row = rowArray.join(",");
				csvContent += row + "\r\n";
			});
			// rows.unshift(getStckUploadCol.retailerMainHeader);
			var fileName = "StockAdjustmentEntry.csv";
			// fileName = fileName + "_STKUPLOAD.csv";
			// console.log(csvContent);
			var hiddenElement = document.createElement("a");
			var blob = new Blob([csvContent], {
				type: 'text/csv;charset=utf-8;'
			});
			hiddenElement.href = "oData:text/csv;charset=utf-8," + encodeURI(csvContent);
			hiddenElement.target = "_blank";
			hiddenElement.download = fileName;
			// hiddenElement.click();
			if (hiddenElement.download !== undefined) { // feature detection
				// Browsers that support HTML5 download attribute
				var url = URL.createObjectURL(blob);
				hiddenElement.setAttribute("href", url);
				hiddenElement.setAttribute("download", fileName);
				hiddenElement.style.visibility = 'hidden';
				document.body.appendChild(hiddenElement);
				hiddenElement.click();
				document.body.removeChild(hiddenElement);
			}
			that.getView().setBusy(false);
			// that.setItemNo();

		},
		getHeaderColumnForExcelTypeWiseItem: function (data, index) {

			// var Parent = this.getSelectedCustomerCode();
			var Parent = this.getView().getModel("LocalViewSetting").getProperty("/CustomerNo");
			var customerName = this.getView().getModel("LocalViewSetting").getProperty("/CustomerName");
			// if (this.sCustomerInputType === "VH") {
			// 	customerName = customerName.split("(")[0];
			// }
			data[index].Reason = "";
			data[index].PhysicalStock = "";
			data[index].Parent = Parent;
			data[index].customerName = customerName;
			var typeWiseUploadColumnItem = {
				// retailerMainHeader: ["", "", "", "", "", "", "", "", "Saleable Stock", "", "Damaged/Expired Stock", ""],
				typeWiseItem: [
					data[index].Parent,
					data[index].customerName,
					data[index].MaterialNo,
					data[index].MaterialDesc,
					data[index].Batch,
					data[index].Unrestricted,
					data[index].Uom,
					data[index].PhysicalStock,
					data[index].Uom,
					data[index].MRP,
					data[index].Currency,
					data[index].ExpDate,
					// data[index].StockType,
					data[index].Reason,
					// data[index].DmsDivision

				]
			};
			return typeWiseUploadColumnItem;
		},
		ReasonText: function () {
			var Reason = this.getView().getModel("ReasonDD").getData();
			var ResonText = "";
			for (var i = 0; i < Reason.length; i++) {
				if (Reason[i].Key != "") {
					if (ResonText === "") {
						ResonText = Reason[i].Key + "-" + Reason[i].Text;
					} else {
						ResonText = ResonText + "," + Reason[i].Key + "-" + Reason[i].Text;
					}

				}
				// retailerMainHeader: ["Reason", Reason[i].Key + "-" + Reason[i].Text]
			}
			return ResonText;
		},
		getHeaderColumnForExcel: function (Reason) {
			// var Reason = this.getView().getModel("ReasonDD").getData();
			Reason = Reason.split(",");
			Reason.unshift("Reason:");
			var stockUploadColumn = {
				retailerMainHeader: Reason,
				stockHeader: ["CustomerNo", "CustomerName", "MaterialNo", "MaterialDesc", "Batch", "BookStock", "Unit",
					"PhysicalStock", "Unit", "MRP", "Currency", "ExpiryDate",
					"Reason"
				]
			};
			return stockUploadColumn;
		},
		getConvertedTime: function (fdate) {
			if (fdate) {
				var oformatDate = new Date(fdate);
				oformatDate = oPPCCommon.addHoursAndMinutesToDate({
					dDate: oformatDate

				});
				return oformatDate;
			} else {
				return null;
			}
		},

		handleUploadComplete: function (e) {
			// initializing 'this'key word to that variable
			oPPCCommon.removeAllMsgs();
			var that = this;
			aSimulateItem.splice(0, aSimulateItem.length);
			// Getting file properties
			var file = e.getParameter("files") && e.getParameter("files")[0];
			// Validating and Reading file
			if (file && window.FileReader) {
				// File reader initialization
				var reader = new FileReader();
				var that = this;
				// File reader On Event by loading data
				reader.onload = function (evn) {
					// Getting result to String format
					var strCSV = evn.target.result; //string in CSV
					// Splitting result line by line
					var lines = strCSV.split("\n");
					// Initialization new empty array
					var result = [];
					// splitting header name of line[0]

					if (lines[0].split(":")[0].split("-")[0] === "01") {
						var headers = lines[1].split(",");
					} else {
						var headers = lines[1].split(",");
					}
					// Getting lost index count from header
					var headerLstIndexCnt = headers[headers.length - 1].length;

					// if (regex.test(headers[0]) == true) {
					// 	headers[0] = headers[0].substring(3, 9);
					// }
					// headers[0] = headers[0].substring(3,9);
					// Looping data and storing into 'obj' variable

					if (lines[0].split(":")[0].split("-")[0] === "01") {
						for (var i = 2; i < lines.length - 1; i++) {
							var obj = {};
							// Getting result set from current rows  
							var currentline = lines[i].split(",");
							// Statement for remvoing line break from lost column
							currentline[headers.length - 1] = currentline[headers.length - 1].replace(/(\r\n|\n|\r)/gm, "");
							// Looping data to store result set to header name
							for (var j = 0; j < headers.length; j++) {

								var headerCnt = headers.length;
								// State condition validation, when j is equal to headers.length
								if (j === (headerCnt - 1)) {
									// Getting lost index string from header without double quatation
									headers[j] = headers[headers.length - 1].substring(0, headerLstIndexCnt - 1);
								}
								// Adding result to 'obj' variable with header name and values
								obj[headers[j]] = currentline[j];
							}
							// Array pushing data 
							result.push(obj);
						}

					} else {
						for (var i = 2; i < lines.length - 1; i++) {
							var obj = {};
							// Getting result set from current rows  
							var currentline = lines[i].split(",");
							// Statement for remvoing line break from lost column
							currentline[headers.length - 1] = currentline[headers.length - 1].replace(/(\r\n|\n|\r)/gm, "");
							// Looping data to store result set to header name
							for (var j = 0; j < headers.length; j++) {
								var headerCnt = headers.length;
								// State condition validation, when j is equal to headers.length
								if (j === (headerCnt - 1)) {
									// Getting lost index string from header without double quatation
									headers[j] = headers[headers.length - 1].substring(0, headerLstIndexCnt - 1);
								}
								// Adding result to 'obj' variable with header name and values
								obj[headers[j]] = currentline[j];
							}
							// Array pushing data 
							result.push(obj);
						}
					}

					aSimulateItem = result;
				};
				// Getting as a string from file records
				reader.readAsBinaryString(file);
			}
		},
		handleUploadPress: function () {
			oPPCCommon.removeAllMsgs();
			this.getView().setBusy(true);
			this.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
				.getData()
				.length);
			oPPCCommon.hideMessagePopover();
			var that = this;
			var count = 0;
			var itemNo;
			var inputValue = that.getView().byId("fileUploader").getValue();
			if (inputValue === "") {
				MessageBox.error(
					"Please select a file", {
						styleClass: "sapUiSizeCompact"
					}
				);
				this.getView().setBusy(false);
				return;
			}
			that.getView().setBusy(true);
			// var oItemSerialNoModel = new sap.ui.model.json.JSONModel();
			// oItemSerialNoModel.setData([]);
			// gList.setModel(oItemSerialNoModel, "ListItems");
			var oFileField = this.getView().byId("fileUploader");
			var fileLength = oFileField.oFileUpload.files.length;
			var allowedExtensions = /(csv)$/i;

			var validExts = ".csv";
			var oFileName = this.getView().byId("fileUploader").getValue().split("(")[0];
			var fileExt = oFileName.substring(oFileName.lastIndexOf('.'));
			var Reason = this.getView().getModel("ReasonDD").getData(); //for reason
			if (fileLength > 0) {
				if (!allowedExtensions.exec(fileExt) || fileExt === validExts) {
					// Condition Statement for validating file =  records
					if (aSimulateItem.length > 0) {
						var aValidItems = [];
						var countOfM = 0;
						for (var i = 0; i < aSimulateItem.length; i++) {

							if (aSimulateItem[i].Batch.length !== 10) {
								aSimulateItem[i].Batch = aSimulateItem[i].Batch.padStart(10, "0");
							}
							// countOfM = countOfM + 1;
							var Expirydate = aSimulateItem[i].ExpiryDate;
							Expirydate = Expirydate.replaceAll("/", "-");
							var split = Expirydate.split('-');
							var date = new Date(split[2], split[1] - 1, split[0]); //Y M D

							Expirydate = oPPCCommon.addHoursAndMinutesToDate({
								dDate: date
							});
							if (aSimulateItem[i].PhysicalStock != "") {
								var flag = false;
								// aValidItems.push(aSimulateItem[i])
								// }
								// var itemNo = 0;
								// itemNo = countOfM * 10;
								// itemNo = ("0000" + itemNo).slice(-6);

								// if(aSimulateItem[i].PhysicalStock != "")
								for (var j = 0; j < Reason.length; j++) {
									var Difference = parseFloat(aSimulateItem[i].BookStock) - parseFloat(aSimulateItem[i].PhysicalStock);
									if (Reason[j].Key != "") {
										if (aSimulateItem[i].Reason.length === 1) {
											if (parseInt(Reason[j].Key) * 1 === parseInt(aSimulateItem[i].Reason)) {
												aSimulateItem[i].Reason = Reason[j].Key;
											}
										}
										if (aSimulateItem[i].Reason === Reason[j].Key || aSimulateItem[i].Reason === Reason[j].Text) {
											countOfM = countOfM + 1;
											var itemNo = 0;
											itemNo = countOfM * 10;
											itemNo = ("0000" + itemNo).slice(-6);
											aValidItems.push({
												ItemNo: itemNo,
												Batch: aSimulateItem[i].Batch,
												Quantity: aSimulateItem[i].BookStock, //Qua
												// CustomerName: aSimulateItem[i].CustomerName,
												// CustomerNo: aSimulateItem[i].CustomerNo,
												ExpiryDate: Expirydate,
												MaterialDesc: aSimulateItem[i].MaterialDesc,
												MaterialNo: aSimulateItem[i].MaterialNo,
												AdjQty: aSimulateItem[i].PhysicalStock,
												ReasonID: Reason[j].Key,
												ReasonDesc: Reason[j].Text,
												StockType: aSimulateItem[i].StockType,
												UOM: aSimulateItem[i].Unit,
												MRP: aSimulateItem[i].MRP,
												Currency: aSimulateItem[i].Currency,
												DiffQty: Difference.toString(),
												DMSDivision: aSimulateItem[i].DmsDivision
											});
											flag = true;
										}
									}
								}
								if (!flag) {
									var msg = "Please Enter the Valid Reason for MaterialNo " + aSimulateItem[i].MaterialNo + " for Batch " + aSimulateItem[i]
										.Batch;
									oPPCCommon.addMsg_MsgMgr(msg, "error");
								}

							}

						}

						this.getView().setBusy(false);
						gList.getModel("ListItems").setProperty("/", aValidItems);
						that.getView().getModel("LocalViewSetting").setProperty("/Uploadatacount", 0);
						if (!oPPCCommon.doErrMessageExist()) {
							// oPPCCommon.removeDuplicateMsgsInMsgMgr();
							this.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
								.getData()
								.length);
							oPPCCommon.showMessagePopover(gList);
						}
						if (aValidItems.length > 0) {
							if (aValidItems.length < 10) {
								gList.getModel("LocalViewSetting").setProperty("/Uploadatacount", aValidItems.length);
								// oPPCCommon.showMessagePopover(gList);
							} else {
								gList.getModel("LocalViewSetting").setProperty("/Uploadatacount", 10);
								// oPPCCommon.showMessagePopover(gList);
							}
						} else {
							// oPPCCommon.showMessagePopover(gList);
							gList.getModel("LocalViewSetting").setProperty("/Uploadatacount", 0);
						}

					}

				}

			}

			that.getView().setBusy(false);

		},

		startUpload: function (UploadCollectionControl) {
			this.getView().setBusy(true);
			var oUploadCollection = UploadCollectionControl;
			var oHeaderMethod = new sap.m.UploadCollectionParameter({
				name: "type",
				value: "POST"
			});
			oUploadCollection.addHeaderParameter(oHeaderMethod);
			var url = this._oComponent.getModel("SCGW").sServiceUrl + "/SchemeDocuments";
			var token = this._oComponent.getModel("SCGW").getSecurityToken();

			var oHeaderToken = new sap.m.UploadCollectionParameter({
				name: "x-csrf-token",
				value: token
			});

			oUploadCollection.addHeaderParameter(oHeaderToken);
			oUploadCollection.addHeaderParameter(oHeaderMethod);
			oUploadCollection.setUploadUrl(url);
			oUploadCollection.upload();
		},
	});

});
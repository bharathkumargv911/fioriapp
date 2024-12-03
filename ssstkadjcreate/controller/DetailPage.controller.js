sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"com/arteriatech/ppc/utils/js/Common",
	"com/arteriatech/prd/utils/js/Common"
], function(Controller, JSONModel, History, oPPCCommon, oProductCommon) {
	"use strict";
	var oi18n, oUtilsI18n;
	var Device = sap.ui.Device;
	var oBusyDialog = new sap.m.Dialog();
	var busyDialog = new sap.m.BusyDialog();
	var oCommonValueHelp;
	var product = "PD";
	return Controller.extend("com.arteria.ss.stockadjustmnt.create.controller.DetailPage", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.arteria.ss.stockadjustmnt.create.view.DetailPage
		 */
		onInit: function() {
			this.onInitHookUp();
		},

		onInitHookUp: function() {
			gSADetailView = this.getView();
			/**
			 * Get reference of the Parent component i.e Component.js
			 */
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(gSADetailView));

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
			oi18n = this._oComponent.getModel("i18n").getResourceBundle();
			oUtilsI18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();

			//Router Initialisation
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			//Attach event for routing on view patter matched 
			this._oRouter.attachRouteMatched(this.onRouteMatched, this);
			oPPCCommon.initMsgMangerObjects();
			this.setReasonDD();
			if (this.onInitHookUp_Exit) {
				this.onInitHookUp_Exit();
			}
		},

		onRouteMatched: function(oEvent) {
			if (oEvent.getParameter("name") !== "DetailPage") {
				return;
			}

			//ToAdd
		},
		setDropDowns: function() {
			this.iTotalDDs = 1;
			gSADetailView.setBusy(true);
			this.setReasonDD();
			if (this.getDropDowns_Exit) {
				this.getDropDowns_Exit();
			}
		},
		showPopUp: function() {
			oPPCCommon.showMessagePopover(gSAItemView);
		},
		setReasonDD: function() {
			var that = this;
			var gSADetailView = this.getView();
			var oModelData = this._oComponent.getModel("PCGW");
			var oMarketDDFilter = new Array();
			oMarketDDFilter = oPPCCommon.setODataModelReadFilter(gSADetailView, "", oMarketDDFilter, "Typeset", sap.ui.model.FilterOperator
				.EQ, ["STKADR"], false, false, false);
			oPPCCommon.getDropdown(oModelData, "ConfigTypesetTypes", oMarketDDFilter, "Types", "TypesName", oBusyDialog,
				gSADetailView,
				"ReasonDD", "Select",
				function() {
					/*if (oData.length > 0) {
						that.callBusyDialog();
					}*/

				});
			//for enhancement
			if (this.setMarketDD_Exit) {
				this.setMarketDD_Exit();
			}
		},
		callBusyDialog: function() {
			this.iTotalDDs--;
			if (this.iTotalValueHelps === 0) {
				gSADetailView.setBusy(false);
			}
		},
		/*--------------------------------------------Navigation--------------------------------------------*/

		navigateBack: function() {

			if (this.getView().getModel("LocalViewSetting").getProperty("/editMode") === true) {
				this.backToList();
			}
			if (this.getView().getModel("LocalViewSetting").getProperty("/reviewMode") === true) {
				this.getView().getModel("LocalViewSetting").setProperty("/editMode", true);
				this.getView().getModel("LocalViewSetting").setProperty("/reviewMode", false);
				var MaterialDocItemDetails = this._oComponent.getModel("QuantityModel");
				//for (var i = 0; i < MaterialDocItemDetails.oData.length; i++) {
				//this._oComponent.getModel("QuantityModel").setProperty("/Quantity", MaterialDocItemDetails.oData[i].Quantity);
				// this._oComponent.getModel("QuantityModel").setProperty("/Quantity", MaterialDocItemDetails[i].Quantity);
				//	}
				this._oComponent.getModel("MaterialDocItemDetails").setProperty("/QuantityValueState", "None");
				this._oComponent.getModel("MaterialDocItemDetails").setProperty("/RemarksState", "None");
				this._oComponent.getModel("MaterialDocItemDetails").setProperty("/QuantityValueStateText", "");
				this._oComponent.getModel("MaterialDocItemDetails").setProperty("/RemarksStateText", "");
				//
			}
		},
		backToList: function() {
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
		onReview: function() {
			var listItems = this._oComponent.getModel("MaterialDocs");
			oPPCCommon.removeAllMsgs();
			oPPCCommon.hideMessagePopover(gSAItemView);
			this.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel().getData()
				.length);
			this.validate();
			if (oPPCCommon.doErrMessageExist()) {
				listItems.setProperty("/MaterialDocDate", oPPCCommon.addHoursAndMinutesToDate({
					dDate: listItems.getProperty("/MaterialDocDate")
				}));
				// Create / update
				this.updateMatDoc(true);
			} else {
				this.showError();
			}
			if (this.onReview_Exit) {
				this.onReview_Exit();
			}

		},
		validate: function() {
			this.validateItem();
		},
		validateItem: function() {
			oPPCCommon.removeAllMsgs();
			var MaterialDocItemDetails = this._oComponent.getModel("MaterialDocItemDetails").getProperty("/");
			if (MaterialDocItemDetails.length !== 0) {
				for (var i = 0; i < MaterialDocItemDetails.length; i++) {
					var isValid = true;
					var msg = "";
					var AdjQty = MaterialDocItemDetails[i].AdjQty;
					var Remarks = MaterialDocItemDetails[i].Remarks;
					if (MaterialDocItemDetails[i].ReasonID === "" || MaterialDocItemDetails[i].ReasonID === undefined) {
						msg = oi18n.getText("common.message.pleaseselect", [gSAItemView.byId("FReasonID").getText()]);
						oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/ReasonID");
					}
					if (AdjQty === "" || AdjQty === undefined || AdjQty === null) {
						msg = oi18n.getText("common.message.pleaseeneter", [gSAItemView.byId("FAdjQtyEdit").getText()]);
						isValid = false;
					} else {
						isValid = true;
					}
					if (!isValid) {
						MaterialDocItemDetails[i].QuantityValueState = sap.ui.core.ValueState.Error;
						MaterialDocItemDetails[i].QuantityValueStateText = msg;
						gSAItemView.getModel("MaterialDocItemDetails").setProperty("/", MaterialDocItemDetails);
						oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/AdjQty" + i);
					} else {

						MaterialDocItemDetails[i].QuantityValueState = sap.ui.core.ValueState.None;
						MaterialDocItemDetails[i].QuantityValueStateText = "";
					}
					if (Remarks === "" || Remarks === undefined || Remarks === null) {
						msg = oi18n.getText("common.message.pleaseeneter", [gSAItemView.byId("FRemarksEdit").getText()]);
						isValid = false;
					} else {
						isValid = true;
						// this._oComponent.getModel("MaterialDocItemDetails").setProperty("/RemarksState", "None");
						// this._oComponent.getModel("MaterialDocItemDetails").setProperty("/RemarksStateText", "");
					}
					if (!isValid) {
						MaterialDocItemDetails[i].RemarksState = sap.ui.core.ValueState.Error;
						MaterialDocItemDetails[i].RemarksStateText = msg;
						gSAItemView.getModel("MaterialDocItemDetails").setProperty("/", MaterialDocItemDetails);
						oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/Remarks" + i);
					} else {
						MaterialDocItemDetails[i].RemarksState = sap.ui.core.ValueState.None;
						MaterialDocItemDetails[i].RemarksStateText = "";
					}
				}
			}
		},
		updateMatDoc: function(istestRun, oEvent) {
			var that = this;
			oEvent.getSource().setEnabled(false);
			// that.getView().setBusy(true);
			busyDialog.open();
			that.oUpdateModel = that.getView().getModel("SSGW_MM");
			var _oMaterialDocs = this.updateStockHeader(istestRun);
			// _oMaterialDocs = [];

			// _oMaterialDocs.LoginID = oProductCommon.getCurrentUsers("MaterialDocs", "create");
			// that.oUpdateModel.setHeaders({
			// 	"x-arteria-loginid": _oMaterialDocs.LoginID
			// });
			// var items = this.updateMaterialDocItemDetails(_oMaterialDocs.MaterialDocGUID);
			_oMaterialDocs.MaterialDocItemDetails = this.updateMaterialDocItemDetails(_oMaterialDocs.MaterialDocGUID);

			/*for (var i = 0; i < items.length; i++) {
				_oMaterialDocs.MaterialDocItemDetails = [];
				if (items[i].MvmtTypeID === "801") {
					_oMaterialDocs.MvmtTypeID = "801";
					delete items[i].MvmtTypeID;
					_oMaterialDocs.MaterialDocItemDetails = new Array(items[i]);
				} else if (items[i].MvmtTypeID === "802") {
					_oMaterialDocs.MvmtTypeID = "802";
					delete items[i].MvmtTypeID;
					_oMaterialDocs.MaterialDocItemDetails = new Array(items[i]);
				} else {
					_oMaterialDocs.MaterialDocItemDetails = new Array(items[i]);
				}*/
			that.oUpdateModel.create("/MaterialDocs", _oMaterialDocs, {
				success: function(aData) {
					oPPCCommon.removeDuplicateMsgsInMsgMgr();
					if (oPPCCommon.doErrMessageExist()) {
						if (istestRun) {
							setTimeout(function() {
								that.gotoSave();
								// that.getView().setBusy(false);
								busyDialog.close();
							}, 2000);
						} else {
							that.updatedSuccessfully(aData.MaterialDocGUID);
						}
					} else {
						// that.getView().setBusy(false);
						busyDialog.close();
						that.showError();
					}
				},
				error: function() {
					// that.getView().setBusy(false);
					busyDialog.close();
					that.showError();
				}
			});
			// }

		},
		updateStockHeader: function(istestRun) {
			this._oMaterialDocs = jQuery.extend({}, this._oComponent.getModel("MaterialDocs").getData());
			if (istestRun === true) {
				this._oMaterialDocs.TestRun = "X";
			} else {
				this._oMaterialDocs.TestRun = "";
			}
			// this._oMaterialDocs.TestRun = istestRun;
			return this._oMaterialDocs;
		},
		updateMaterialDocItemDetails: function(MaterialDocGUID) {
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
		gotoSave: function() {
			this._oComponent.getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel().getData()
				.length);
			oPPCCommon.hideMessagePopover(gSAItemView);
			this._oComponent.getModel("LocalViewSetting").setProperty("/editMode", false);
			this._oComponent.getModel("LocalViewSetting").setProperty("/reviewMode", true);
		},
		showError: function() {
			this._oComponent.getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
				.getData().length);
			oPPCCommon.showMessagePopover(gSAItemView);
		},
		onSave: function(oEvent) {
			oEvent.getSource().setEnabled(false);
			this.updateMatDoc(false);
		},
		updatedSuccessfully: function(GUID) {
			var that = this;
			that.onCreateSuccess(GUID);
		},
		onCreateSuccess: function(GUID) {
			var that = this;
			var dialog = new sap.m.Dialog({
				title: 'Success',
				type: 'Standard',
				state: 'Success',
				draggable: true,
				content: [
					new sap.m.Text({
						text: oPPCCommon.getInfoMsgsFromMsgMgr()
					})
				],
				buttons: [
					new sap.m.Button({
						text: oi18n.getText("view"),
						press: function() {
							that.gotoDetail(GUID);
							dialog.close();
						}
					}),
					new sap.m.Button({
						text: oi18n.getText("CreateNew"),
						press: function() {
							that._oRouter.navTo("ListPage", false);
							dialog.close();
						}
					})
				],
				afterClose: function() {
					dialog.destroy();
				}
			});
			dialog.open();
			dialog.attachBrowserEvent("keydown", function(oEvent) {
				oEvent.stopPropagation();
				oEvent.preventDefault();
			});
			if (this.onCreateSuccess_Exit) {
				this.onCreateSuccess_Exit();
			}
		},
		gotoDetail: function(GUID) {
			var path = "StockAdjustmentDetail(MaterialDocGUID='" + GUID + "')";
			oPPCCommon.crossAppNavigation("ssstkadjcreate", "ssstockadmnt", "Display", "ssstkadjcreate", "ssstockadmnt",
				"/View/" + path);
			if (this.gotoDetail_Exit) {
				this.gotoDetail_Exit();
			}
		},

		addItemUIMessageToMM: function(view, target, itemPosition) {
			var i18nProperty = "common.message.pleaseeneter";
			if (target === "ReasonID") {
				i18nProperty = "common.message.pleaseselect";
			}
			var msg = oi18n.getText(i18nProperty, view.byId("F" + target).getText());
			this._oComponent.getModel("MaterialDocItemDetails").setProperty("/" + itemPosition + "/" + target + "ValueState", "Error");
			this._oComponent.getModel("MaterialDocItemDetails").setProperty("/" + itemPosition + "/" + target + "ValueStateText", msg);
			msg = msg + " for Item " + this._oComponent.getModel("MaterialDocItemDetails").getProperty("/" + itemPosition + "/ItemNo");
			oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/" + target + "-" + itemPosition);
		},
		addErrorMessages: function(view, controlID, msg) {
			view.byId(controlID).setValueState("Error");
			view.byId(controlID).setValueStateText(msg);
			oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/" + controlID);
		},
		clearAllErrors: function() {
			this.clearValueState(["Fdebitnote"]);
			var oData = sap.ui.getCore().getMessageManager().getMessageModel().getData();
			for (var i = 0; i < oData.length; i++) {
				var msgObj = oData[i];
				if (msgObj.id.indexOf("/UI/") > -1) {
					oPPCCommon.removeMsgsInMsgMgrById(msgObj.id);
				}
			}
			this._oComponent.getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
				.getData()
				.length);
			oPPCCommon.hideMessagePopover(gSAItemView);
		},
		clearValueState: function(aFieldId) {
			for (var i = 0; i < aFieldId.length; i++) {
				if (!gSAItemView.byId(aFieldId[i]) instanceof sap.m.Input) {
					gSAItemView.byId(aFieldId[i]).setValueState("None");
					gSAItemView.byId(aFieldId[i]).setValueStateText("");
				}
			}
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.arteria.ss.stockadjustmnt.create.view.DetailPage
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.arteria.ss.stockadjustmnt.create.view.DetailPage
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.arteria.ss.stockadjustmnt.create.view.DetailPage
		 */
		//	onExit: function() {
		//
		//	}

	});

});
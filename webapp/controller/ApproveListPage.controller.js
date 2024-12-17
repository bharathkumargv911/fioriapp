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
	var oProductCommon, oCommonValueHelp, oProductUserMapping;

	var product = "PD";

	var busyDialog = new sap.m.BusyDialog();

	return Controller.extend("com.arteriatech.zsf.quot.controller.ApproveListPage", {

		onInit: function () {
			gApproveListPage = this.getView();
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(gApproveListPage));
			oi18n = this._oComponent.getModel("i18n").getResourceBundle();
			oPPCUtili18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();
			this.setdefaultsettings1();
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

		},
		setdefaultsettings1: function () {
			var that = this;
			var oViewSettingModel = new sap.ui.model.json.JSONModel();
			this.viewSettingData = {
				messagelength: 0,
				approveButton: false,
				rejectButton: false,
				selectedCheckbox: false
			};
			oViewSettingModel.setData(this.viewSettingData);
			that._oComponent.setModel(oViewSettingModel, "LocalViewSettingApprv");
			this.getRejReasonDD();

		},
		getRejReasonDD: function () {
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
						that.getView().getModel("LocalViewSettingApprv").setProperty("/TempRejReason", aDDValue[0].Key);
						that.getView().getModel("LocalViewSettingApprv").setProperty("/TempRejReasonDesc", aDDValue[0].Text);
					}
				});
			//for enhancement
			if (this.getRejReasonDD_Exit) {
				this.getRejReasonDD_Exit();
			}
		},

		onApprove: function () {
			busyDialog.open();
			var selectedIndices = false;
			var Tasks = this._oComponent.getModel("Tasks").getProperty("/");
			var QuotationNo;
			for (var i = 0; i < Tasks.length; i++) {
				if (Tasks[i].selectedCheckbox) {
					selectedIndices = true;
					QuotationNo = Tasks[i].EntityKeyID;
					i = Tasks.length;
				} else {
					selectedIndices = false;
				}
			}
			if (selectedIndices === true) {
				this.getDetails(QuotationNo, "X");
				// this.onApproval("X", "", "");
			} else {
				oPPCCommon.displayMsg_MsgBox(gApproveListPage, "Please select atleast one SOR for Approve", "error");
				busyDialog.close();
			}
		},
		onReject: function () {
			var title = oi18n.getText("SODetail.Dialog.Reject.comments");
			var dIcon = "sap-icon://decline";
			var state = "Error";
			busyDialog.open();
			var selectedIndices = false;
			var Tasks = this._oComponent.getModel("Tasks").getProperty("/");
			var QuotationNo;
			// var selectedIndices = gApproveList.byId("UIApproveTable_All").getSelectedIndices();
			for (var i = 0; i < Tasks.length; i++) {
				if (this.getView().getModel("Tasks").getProperty("/" + i + "/selectedCheckbox") === true) {
					selectedIndices = true;
					QuotationNo = Tasks[i].EntityKeyID;

					i = Tasks.length;

				} else {
					selectedIndices = false;
				}
			}
			if (selectedIndices === true) {
				this.getDetails(QuotationNo, "", title, dIcon, state);

				// this.onApprovalDialog("", "X", "", title, dIcon, state);

			} else {
				oPPCCommon.displayMsg_MsgBox(gApproveListPage, "Please select atleast one SOR for Reject", "error");
				busyDialog.close();
			}
		},
		onApprovalDialog: function (apprFlag, rejFlag, editApprFlag, title, dIcon, state) {
			var that = this;
			oPPCCommon.removeAllMsgs();
			oPPCCommon.hideMessagePopover(gApproveListPage);
			gApproveListPage.getModel("LocalViewSettingApprv").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
				.getData().length);
			that.getView().getModel("LocalViewSettingApprv").setProperty("/TempRemarks", "");
			that.getView().getModel("LocalViewSettingApprv").setProperty("/TempRejReason", "");
			that.getView().getModel("LocalViewSettingApprv").setProperty("/TempRejReasonDesc", "");
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
					that.getView().getModel("LocalViewSettingApprv").setProperty("/TempRemarks", oEvent.getSource().getValue().trim());
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
							that.getView().getModel("LocalViewSettingApprv").setProperty("/TempRejReason", Key);
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
							that.getView().getModel("LocalViewSettingApprv").setProperty("/TempRejReasonDesc", TempRejReasonDesc);
						} else {
							that.getView().getModel("LocalViewSettingApprv").setProperty("/TempRejReason", "");
							that.getView().getModel("LocalViewSettingApprv").setProperty("/TempRejReasonDesc", "");
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
						var TempRemarks = that.getView().getModel("LocalViewSettingApprv").getProperty("/TempRemarks");
						var TempRejReason = that.getView().getModel("LocalViewSettingApprv").getProperty("/TempRejReason");
						var TempRejReasonDesc = that.getView().getModel("LocalViewSettingApprv").getProperty("/TempRejReasonDesc");
						if (apprFlag === "X") {
							that.onApproval(apprFlag, rejFlag, editApprFlag, TempRemarks, TempRejReason, TempRejReasonDesc);
							dialog.close();
						} else if (rejFlag === "X") {
							if (TempRemarks !== "" && TempRejReason !== "") {
								// that.onApproval(apprFlag, rejFlag, editApprFlag, TempRemarks, TempRejReason, TempRejReasonDesc);
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
		getDetails: function (QuotationNo, Flag, title, dIcon, state) {
			busyDialog.open();
			oPPCCommon.removeAllMsgs();
			var view = this.getView();
			var that = this;
			var odataModel;
			odataModel = view.getModel("SFGW_INQ");
			odataModel.setHeaders({
				"x-arteria-loginid": this.getCurrentUsers("Quotations", "read")
			});
			odataModel.read("/Quotations(QuotationNo='" + QuotationNo + "')", {
				urlParameters: {
					"$expand": "QuotationItemDetails"
				},
				success: function (oData) {
					that.setQuotationData(oData);
					if (Flag === "X") {
						if (sap.ui.getCore().getMessageManager().getMessageModel().getData().length > 0) {
							oPPCCommon.removeDuplicateMsgsInMsgMgr();
							var message = oPPCCommon.getMsgsFromMsgMgr();
							oPPCCommon.displayMsg_MsgBox(that.getView(), message, "Information");
						} else {
							that.onApproval("X", "", "");
						}
					} else {
						that.getRejReasonDD(oData.CustomerNo);
						that.onApprovalDialog("", "X", "", title, dIcon, state);
					}
					busyDialog.close();
				},
				error: function (error) {
					busyDialog.close();
					that.handleoDataError(error);
				}
			});
		},
		getCurrentUsers: function (sServiceName, sRequestType) {
			var sLoginID = oProductCommon.getCurrentLoggedUser({
				sServiceName: sServiceName,
				sRequestType: sRequestType
			});
			return sLoginID;
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
			this.getView().getModel("LocalViewSettingApprv").setProperty("/PoDate", Date);
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
				this.getView().getModel("LocalViewSettingApprv").setProperty("/ItemsCount", oData.QuotationItemDetails.results.length);
				this.getView().getModel("LocalViewSettingApprv").setProperty("/BatchNo", oData.QuotationItemDetails.results[0].BatchNo);
			} else {
				// this.setQuotItemsNoDataFound();
				// this.getView().getModel("LocalViewSettingDtl").setProperty("/BatchNo", "");
			}
			if (this.setQuotationItems_Exit) {
				this.setQuotationItems_Exit(oData);
			}
		},

		setDropdowns: function (Data) {
			this.getRejReasonDD(Data.CustomerNo);
		},
		RejReasonSave: function (apprFlag, rejFlag, editApprFlag, TempRemarks, TempRejReason, TempRejReasonDesc) {
			oPPCCommon.removeAllMsgs();
			oPPCCommon.hideMessagePopover(gApproveListPage);
			gApproveListPage.getModel("LocalViewSettingApprv").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
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
						that.getView().getModel("LocalViewSettingApprv").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
							.getData().length);
						oPPCCommon.showMessagePopover(gObjPageLayout);
						busyDialog.close();
					}
				},
				error: function (response) {
					oPPCCommon.removeDuplicateMsgsInMsgMgr();
					that.getView().getModel("LocalViewSettingApprv").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
						.getData()
						.length);
					oPPCCommon.showMessagePopover(gObjPageLayout)
					busyDialog.close();
				}
			});
		},

		onApproval: function (apprFlag, rejFlag, editApprFlag, TempRemarks, TempRejReason, TempRejReasonDesc) {
			var that = this;
			oPPCCommon.removeAllMsgs();
			oPPCCommon.hideMessagePopover(gApproveListPage);
			var oModelUpdate = this._oComponent.getModel("PCGW");
			oModelUpdate.setUseBatch(true);
			var loginID = oSSCommon.getCurrentUsers("Tasks", "update");
			var sItems = [];
			var oDecisionKey = "";
			var Tasks = this._oComponent.getModel("Tasks").getProperty("/");
			if (apprFlag === "X") {
				oDecisionKey = "01";
			} else if (rejFlag === "X") {
				oDecisionKey = "02";
			} else {
				oDecisionKey = "01";
			}
			for (var i = 0; i < Tasks.length; i++) {
				if (Tasks[i].selectedCheckbox) {
					sItems.push({
						InstanceID: (Tasks[i].InstanceID).toString(),
						EntityType: "QOT",
						DecisionKey: oDecisionKey,
						LoginID: loginID,
						EntityKey: (Tasks[i].EntityKeyID).toString(),

					});
				}
			}
			for (var j = 0; j < sItems.length; j++) {
				oModelUpdate.setDeferredBatchGroups(["updateTask"]);
				oModelUpdate.setHeaders({
					"x-arteria-loginid": oSSCommon.getCurrentUsers("Tasks", "update")
				});
				oModelUpdate.update("/Tasks(InstanceID='" + sItems[j].InstanceID + "',EntityType='QOT')", sItems[j], {
					groupId: "updateTask"
				});
				this.count = sItems.length;
				oModelUpdate.submitChanges({
					groupId: "updateTask",
					success: function (oData) {
						oPPCCommon.removeDuplicateMsgsInMsgMgr();
						that.count--;
						if (that.count === 0) {
							if (apprFlag) {
								// setTimeout(function () {
								// 	sap.m.MessageToast.show("Dealer/Retailer Approved Successfully");
								// }, 500);
								gApproveListPage.getModel("LocalViewSettingApprv").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
									.getData()
									.length);
								var message = oPPCCommon.getMsgsFromMsgMgr();
								busyDialog.close();
								that.onApprovalSuccess(message, oData);
								// window.history.go(-1);
								that.getView().getModel("LocalViewSettingApprv").setProperty("/approveButton", false);
								that.getView().getModel("LocalViewSettingApprv").setProperty("/selectedCheckbox", false);
							} else {
								// setTimeout(function () {
								// 	sap.m.MessageToast.show("Dealer/Retailer Rejected Successfully");
								// }, 500);
								busyDialog.close();
								var message = oPPCCommon.getMsgsFromMsgMgr();
								that.getView().getModel("LocalViewSettingApprv").setProperty("/rejectButton", false);
								that.onApprovalSuccess(message, oData);
								// window.history.go(-1);
							}
						}
					},
					error: function (response) {
						that.count--;
						if (that.count === 0) {
							busyDialog.close();
							oPPCCommon.removeDuplicateMsgsInMsgMgr();
						}
					}
				});
			}
		},
		onApprovalSuccess: function (message, CPGUID) {
			// busyDialog.open();
			oPPCCommon.removeAllMsgs();
			oPPCCommon.hideMessagePopover(gApproveListPage);
			gApproveListPage.getModel("LocalViewSettingApprv").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
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
						gApproveListView.oController.getQuotApproveList();
						// busyDialog.close();
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});
			dialog.open();
		}

	});

});
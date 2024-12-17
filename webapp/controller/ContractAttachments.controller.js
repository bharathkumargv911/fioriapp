sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/arteriatech/zsf/quot/util/Formatter",
	"com/arteriatech/ppc/utils/js/Common",
	"com/arteriatech/ss/utils/js/Common",
	"com/arteriatech/ss/utils/js/UserMapping",
	"com/arteriatech/ss/utils/js/CommonValueHelp"
], function(Controller, Formatter, oPPCCommon, oSSCommon, oSSUserMapping, oSSCommonValueHelp) {
	"use strict";
	var oi18n = "",
		oUtilsI18n = "";
	var vIndex = 0;
	var busyDialog = new sap.m.BusyDialog();
	var ContractUploadFileList = [];
	var aDialog;
	var aFlag;
	var oUtilsI18n;
	var DocumentStore;
	var oDialog = new sap.m.BusyDialog();
	var indexOfPattern;
	var vMaximumFileSize;
	var ContractNo;

	return Controller.extend("com.arteriatech.zsf.quot.controller.ContractAttachments", {

		onInit: function() {
			this.onInitHookup();
		},
		onInitHookup: function() {
			gContractAttachmentView = this.getView();
			
		// 	this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(gASNAttachmentView));
		// oi18n = this._oComponent.getModel("i18n").getResourceBundle();
		// oUtilsI18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();

		// this.router = sap.ui.core.UIComponent.getRouterFor(this);
			
			
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(gContractAttachmentView));
			oi18n = this._oComponent.getModel("i18n").getResourceBundle();
			oUtilsI18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();
			oPPCCommon.initMsgMangerObjects();
			DocumentStore = oSSCommon.getProductFeatureValue({
				Types: "DMSSTORE"
			});
			this.getDocType();

			if (this.onInitHookup_Exit) {
				this.onInitHookup_Exit();
			}
		},
		getDocType: function() {
			var that = this;
			var sDocTypeset = "QOTDTY";

			var oModelData = this._oComponent.getModel("PCGW");
			var oDocTypeFilter = new Array();
			oDocTypeFilter = oPPCCommon.setODataModelReadFilter(this.getView(), "", oDocTypeFilter, "Typeset", sap.ui.model.FilterOperator.EQ, [
				sDocTypeset
			], false, false, false);
			oSSCommon.getDropdown(oModelData, "ConfigTypesetTypes", oDocTypeFilter, "Types", "TypesName", oDialog, this.getView(),
				"DocTypeDD",
				"None",
				function() {
					that.setMandatoryDocTypeDD(that.getView().getModel("DocTypeDD").getData());
					that.setMandatoryDoucumentType(that.getView().getModel("DocTypeDD").getData());
				});
		},
		setMandatoryDocTypeDD: function(DocTypeData) {
			var oModel = new sap.ui.model.json.JSONModel();
			for (var i = 0; i < DocTypeData.length; i++) {
				if (DocTypeData[i].AddtionalText === "X") {
					DocTypeData[i].Mandatory = "*";
				}
			}
			oModel.setData(DocTypeData);
			this.getView().setModel(oModel, "DocTypeDD");
		},
		getDocTypeDropdown: function(oModel, sEntitySet, oFilters, AdditionalTypeField, sKey, sText, busyDialog, view, modelName,
			defaultValue, requestCompleted, bLoginIDOptional, appKey, bMustAddNone) {
			var aDDValue = new Array();
			oModel.read("/" + sEntitySet, {
				filters: oFilters,
				success: function(oData) {
					if (oData.results.length > 0) {
						if (oData.results.length !== 1 && defaultValue != null && defaultValue !== undefined && defaultValue !== "") {
							aDDValue.push({
								Key: "",
								Text: "(" + defaultValue + ")",
								AddtionalText: ""
							});
						}
						for (var i = 0; i < oData.results.length; i++) {
							aDDValue.push({
								Key: oData.results[i][sKey],
								Text: oData.results[i][sText],
								Seperator: " - ",
								AddtionalText: oData.results[i][AdditionalTypeField]
							});
						}
						var oDDModel = new sap.ui.model.json.JSONModel();
						oDDModel.setData(aDDValue);
						view.setModel(oDDModel, modelName);
					}
					if (requestCompleted) {
						requestCompleted(aDDValue);
					}
				},
				error: function(error) {
					busyDialog.close();
					oPPCCommon.showServiceErrorPopup(error);
				}
			});
		},
		startUpload: function(UploadCollectionControl) {
			gDetailPageView.setBusy(true);
			var oUploadCollection = UploadCollectionControl;
			var oHeaderMethod = new sap.m.UploadCollectionParameter({
				name: "type",
				value: "POST"
			});
			oUploadCollection.addHeaderParameter(oHeaderMethod);
			var url = this._oComponent.getModel("SFGW_INQ").sServiceUrl + "/QuotationDocuments";
			var token = this._oComponent.getModel("SFGW_INQ").getSecurityToken();

			var oHeaderToken = new sap.m.UploadCollectionParameter({
				name: "x-csrf-token",
				value: token
			});

			oUploadCollection.addHeaderParameter(oHeaderToken);
			oUploadCollection.addHeaderParameter(oHeaderMethod);
			oUploadCollection.setUploadUrl(url);
			oUploadCollection.upload();
		},
		selectDocumentType: function(oEvent) {
			var that = this;
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
			this.DocType.setModel(this.getView().getModel("DocTypeDD"));
			this.DocType.addStyleClass("sapUiTinyMarginBegin");
			var UploadCollection = new sap.m.UploadCollection({
				width: "100%",
				maximumFilenameLength: 55,
				maximumFileSize: 10,
				multiple: false,
				sameFilenameAllowed: false,
				instantUpload: false,
				showSeparators: "All",
				noDataText: oUtilsI18n.getText("common.NoAttachments"),
				change: function(oEvent) {
					that.onChange(oEvent);
				},
				fileDeleted: function(oEvent) {
					that.onFileDeleted(oEvent);
				},
				filenameLengthExceed: function(oEvent) {
					that.onFilenameLengthExceed(oEvent);
				},
				fileSizeExceed: function(oEvent) {
					that.onFileSizeExceed(oEvent);
				},
				typeMissmatch: function(oEvent) {
					that.onTypeMissmatch(oEvent);
				},
				beforeUploadStarts: function(oEvent) {
					that.onBeforeUploadStarts(oEvent);
				},
				uploadComplete: function(oEvent) {
					that.onUploadComplete(oEvent);
				},
				uploadUrl: "/sap/opu/odata/ARTEC/SFGW_INQ/QuotationDocuments"
			});
			DocTypeHBox.addItem(DocTypeLabel);
			DocTypeHBox.addItem(this.DocType);
			if (DocumentStore === "A") {
				VBox.addItem(DocTypeHBox);
				VBox.addItem(Text);
			}
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
						press: function() {
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
						press: function() {
							//that.getInvoiceContractDocumentss(that._oComponent);
							that.dialog.close();
						}
					})
				],
				afterClose: function() {
					//that.dialog.destroy();
				}
			});
			aDialog = that.dialog;
			that.dialog.open();
			if (sap.ui.Device.support.touch === false) {
				that.dialog.addStyleClass("sapUiSizeCompact");
			}
		},
		onFilenameLengthExceed: function(UploadCollection) {
			if (UploadCollection.mParameters.mParameters.fileName.length > 55) {
				var msg1 = oi18n.getText("File name Length Exceeded");
				oPPCCommon.displayMsg_MsgBox(this.getView(), msg1, "error");
			}
			if (this.onFilenameLengthExceed_Exit) {
				this.onFilenameLengthExceed_Exit();
			}
		},
		onFileSizeExceed: function(UploadCollection) {
			// if (UploadCollection.mParameters.mParameters.fileSize > 50) {
			var msg1 = oi18n.getText("File Size Exceeded");
			oPPCCommon.displayMsg_MsgBox(this.getView(), msg1, "error");
			// }
			if (this.onFileSizeExceed_Exit) {
				this.onFileSizeExceed_Exit();
			}
		},
		validateContractAttachments: function(UploadCollection) {
			var valid = true;
			if (this.DocType.getSelectedKey() === "" && UploadCollection.getItems().length === 0) {
				var msg1 = oi18n.getText("ContractAttachmentsA.Page.Upload.DocTypeErrorMsg");
				var msgObj = oPPCCommon.addMsg_MsgMgr(msg1, "error", "FGroup_DocType");
				var msg2 = oi18n.getText("ContractAttachmentsA.Page.Upload.AttachmentErrorMsg");
				var msgObj = oPPCCommon.addMsg_MsgMgr(msg2, "error", "FGroup_Attachment");
				valid = false;
			} else if (this.DocType.getSelectedKey() === "") {
				var msg = oi18n.getText("ContractAttachmentsA.Page.Upload.DocTypeErrorMsg");
				var msgObj = oPPCCommon.addMsg_MsgMgr(msg, "error", "FGroup_DocType");
				valid = false;
			} else if (UploadCollection.getItems().length === 0) {
				var msg2 = oi18n.getText("ContractAttachmentsA.Page.Upload.AttachmentErrorMsg");
				var msgObj = oPPCCommon.addMsg_MsgMgr(msg2, "error", "FGroup_Attachment");
				valid = false;
			}
			return valid;
		},
		setMandatoryDoucumentType: function(DocTypeData) {
			gPOMandatoryDocType = [];
			for (var i = 0; i < DocTypeData.length; i++) {
				if (DocTypeData[i].AddtionalText === "X") {
					gPOMandatoryDocType.push({
						"Key": DocTypeData[i].Key,
						"Text": DocTypeData[i].Text,
						"AddtionalText": DocTypeData[i].AddtionalText,
						"FoundAttachment": false,
						"Count": 0
					});
				}
			}
		},
		getCurrentUsers: function(sServiceName, sRequestType) {
			var sLoginID = oPPCCommon.getCurrentLoggedUser({
				sServiceName: sServiceName,
				sRequestType: sRequestType,
					Application: "PD"
			});
			return sLoginID;
		},
		onChange: function(oEvent) {

			var token = this._oComponent.getModel("SFGW_INQ").getSecurityToken();
			var oUploadCollection = this.getView().byId('UploadCollection');
			var url = this._oComponent.getModel("SFGW_INQ").sServiceUrl + "/QuotationDocuments";
			
			var sLoginID = this.getCurrentUsers("ContractDocuments", "write");
			
			
			// this.getCurrentUsers1("QuotationDocuments", "write", function(sLoginID) {
			// 	sLoginID=sLoginID;
			// });
			// var sLoginID = this.getCurrentUsers("QuotationDocuments", "write");
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
			

			var DocTypeID = this.getView().getModel("DocTypeDD").getData()[0].Key;
			var QuotationNo = this.getView().getModel("Quotations").getProperty("/QuotationNo");
			oHeaderSlug = new sap.m.UploadCollectionParameter({
				name: "SLUG",
				value: "QuotationNo:" + QuotationNo + ",DocumentStore:" + DocumentStore + ",DocumentTypeID:" + DocTypeID + ",FileName:" +
					sFileName +
					",LoginID:" + sLoginID
			});

			oUploadCollection.setUploadUrl(url);
			oUploadCollection.addHeaderParameter(oHeaderLoginId);
			oUploadCollection.addHeaderParameter(oHeaderSlug);
			oUploadCollection.addHeaderParameter(oHeaderToken);
			oUploadCollection.addHeaderParameter(oHeaderMethod);
		},


		
			onFileDeleted: function(oEvent) {
		//gASNdetailView.setBusy(true);
		oPPCCommon.removeAllMsgs();
		var URL;
		var that = this;
		var DocumentDeleteModel = this._oComponent.getModel("SFGW_INQ");
		var ListItemsFilters = new Array();
		
		ListItemsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListItemsFilters, "LoginID", sap.ui.model.FilterOperator
				.EQ, [
					this.getCurrentUsers("ContractDocuments", "delete")
				], false, false, false);
		
		 var sLoginID = this.getCurrentUsers("ContractDocuments", "delete");
		// DocumentDeleteModel.setUseBatch(false);
		DocumentDeleteModel.setHeaders({
			"x-arteria-loginid": sLoginID
		});
		var token = this._oComponent.getModel("SFGW_INQ").getSecurityToken();
		DocumentDeleteModel.setHeaders({
			"x-csrf-token": token
		});
		var QuotationNo;
		// if (indexOfPattern === -1) {
			QuotationNo = this._oComponent.getModel("Quotations").getProperty("/QuotationNo");
			URL = "QuotationDocuments(QuotationNo='" + QuotationNo + "',DocumentID='" + escape(oEvent.getParameters().documentId) +
				"',DocumentStore='" + DocumentStore + "')";
		// } 
		
		// else {
		// 	ASNNumber = this._oComponent.getModel("ASNItemHeader").getProperty("/ASNNumber");
		// 	var ASNItemNumber = this._oComponent.getModel("ASNItemHeader").getProperty("/ASNItemNumber");
		// 	URL = "ASNVendorInvDocuments(ASNNumber='" + ASNNumber + "',ASNItemNumber='" + ASNItemNumber + "',DocumentID='" + escape(oEvent.getParameters()
		// 		.documentId) + "',DocumentStore='" + DocumentStore + "')";
		// }
		
		DocumentDeleteModel.remove("/" + URL, {
			// filters: sLoginID,
			headers: {
				"x-arteria-loginid": sLoginID
			},
			// success: function() {
			// 	oPPCCommon.removeDuplicateMsgsInMsgMgr();
			// 	var message = oPPCCommon.getMsgsFromMsgMgr();
			// 	if (indexOfPattern === -1) {
			// 		sap.ui.controller("com.arteriatech.pps.asn.controller.ASNDetail").getASNVIDocumentLists(that._oComponent, oi18n.getText(
			// 			"asnattchment.message.deleted"), this);
			// 	} else {
			// 		sap.ui.controller("com.arteriatech.pps.asn.controller.ASNItemDetail").getASNVIDocumentLists(that._oComponent, oi18n.getText(
			// 			"asnattchment.message.deleted"), this);
			// 	}
			// },
			// error: function(error) {
			// 	oPPCCommon.removeDuplicateMsgsInMsgMgr();
			// 	var message = oPPCCommon.getMsgsFromMsgMgr();
			// 	oPPCCommon.displayMsg_MsgBox(that.getView(), message, "error");
			// }
			
						success: function() {
					oPPCCommon.removeDuplicateMsgsInMsgMgr();
					var message = oPPCCommon.getMsgsFromMsgMgr();
					vIndex++;
					that.getContractDocumentss(that._oComponent, oi18n.getText(
						"ContractAttachments.message.deleted"));

				},
				error: function(error) {
					oPPCCommon.removeDuplicateMsgsInMsgMgr();
					var message = oPPCCommon.getMsgsFromMsgMgr();
					oPPCCommon.displayMsg_MsgBox(that.getView(), message, "error");
					oDialog.close();
				}
		});
	},
		
		
	getCurrentUsers1: function(sServiceName, sRequestType, callBack) {
			if (callBack) {
				oSSCommon.getCurrentLoggedUser({
					sServiceName: sServiceName,
					sRequestType: sRequestType
				}, function(LoginID) {
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
		
		fileSizeFormatter: function(sSize) {
			jQuery.sap.require("sap.ui.core.format.FileSizeFormat");
			//Check whether value is numeric or not
			if (jQuery.isNumeric(sSize)) {
				return sap.ui.core.format.FileSizeFormat.getInstance({
					//binaryFilesize: if true, base 2 is used: 1 Kibibyte = 1024 Byte, ... , otherwise base 10 is used: 1 Kilobyte = 1000 Byte (Default is false)
					binaryFilesize: false,
					//no of digits to display for fraction 
					maxFractionDigits: 1,
					//no of digits  to display for Integer 
					maxIntegerDigits: 3
				}).format(sSize); /*Returns a NumberFormat instance for float*/
			} else {
				return sSize; /*If not numeric it will return with out formatting*/
			}
		},
		onBeforeUploadStarts: function(oEvent) {
			// var sLoginID = this.getCurrentUsers("QuotationsDocuments", "write");
		var sLoginID = this.getCurrentUsers("ContractDocuments", "write");
			
			
			var oHeaderLoginId = new sap.m.UploadCollectionParameter({
				name: "x-arteria-loginid",
				value: sLoginID
			});
			var oHeaderSlug;
			var token = this._oComponent.getModel("SFGW_INQ").getSecurityToken();

			var oHeaderToken = new sap.m.UploadCollectionParameter({
				name: "x-csrf-token",
				value: token
			});

			var DocTypeID = this.DocType.getSelectedKey();
			vIndex++;
			// var DocTypeDesc = this.DocType.getSelectedItem().getText().split(" - ")[1].trim();
			var sFileName = oEvent.mParameters.fileName;
			var QuotationNo = this.getView().getModel("Quotations").getProperty("/QuotationNo");
			// var DocTypeID = this.getView().getModel("DocTypeDD").getData()[0].Key;
			oHeaderSlug = new sap.m.UploadCollectionParameter({
				name: "SLUG",
				value: "QuotationNo:" + QuotationNo + ",DocumentStore:" + DocumentStore + ",DocumentTypeID:" + DocTypeID + ",FileName:" +
					sFileName +
					",LoginID:" + sLoginID
			});
			oEvent.getParameters().addHeaderParameter(oHeaderToken);
			oEvent.getParameters().addHeaderParameter(oHeaderLoginId);
			oEvent.getParameters().addHeaderParameter(oHeaderSlug);

		},
		onUploadTerminated: function(oEvent) {
			// get parameter file name
			var sFileName = oEvent.getParameter("fileName");
			// get a header parameter (in case no parameter specified, the callback function getHeaderParameter returns all request headers)
			var oRequestHeaders = oEvent.getParameters().getHeaderParameter();
			sap.m.MessageToast.show(sFileName + " Terminated");
		},
		onUploadComplete: function(oEvent) {
			if (oEvent.getParameter("files")[0].status === 201) {
				this.getContractDocumentss(this._oComponent, oi18n.getText(
					"ContractAttachments.message.uploaded"));
				gDetailPageView.setBusy(false);
			} else {
				var message = "";
				var response = oEvent.getParameter("files")[0].responseRaw;
				message = oPPCCommon.parseoDataXMLErrorMessage(response);
				this.getContractDocumentss(this._oComponent, oi18n.getText(
					"ContractAttachments.message.notuploaded") + message);
				gDetailPageView.setBusy(false);
			}
		},
	
		
			getContractDocumentss: function(oData) {
			var oView = this.getView();
			// oView.byId("PoAttachment_ID").setBusy(true);
			var that = this;
			var ContractItemsListModel = this._oComponent.getModel("SFGW_INQ");
			
			
			
		var sLoginID = this.getCurrentUsers("ContractDocuments", "write");
			
			
			var QuotationNo = that.getView().getModel("Quotations").getProperty("/QuotationNo");
	
			// this.getCurrentUsers1("QuotationDocuments", "read", function(LoginID) {
				ContractItemsListModel.setHeaders({
					"x-arteria-loginid": sLoginID
				});
				ContractItemsListModel.read("/QuotationDocuments", {
					filters: that.prepareContractContractDocumentsODataFilter(sLoginID, QuotationNo),
					success: function(oData) {
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
						that.getView().setBusy(false);

					},
					error: function() {
						// oView.getModel("LocalViewSettingDt1").setProperty("/AttachmentCount", 0);
						that.getView().setBusy(false);

					}

				// });
			});
		},
		prepareContractContractDocumentsODataFilter: function(LoginID, QuotationNo) {
			// var DocumentStore = oProductCommon.getProductFeatureValue({
			// 	Types: "DMSSTORE"
			// });
var DocumentStore="A";
			var ContractDocumentsFilters = new Array();
			ContractDocumentsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ContractDocumentsFilters, "LoginID", "", [LoginID],
				false, false, false);
			ContractDocumentsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ContractDocumentsFilters, "QuotationNo", sap.ui.model
				.FilterOperator.EQ, [QuotationNo], true, false, false);
			ContractDocumentsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ContractDocumentsFilters, "DocumentStore", sap.ui
				.model
				.FilterOperator.EQ, [DocumentStore], true, false, false);

			return ContractDocumentsFilters;
		},
		
		
		setMessageStrip: function(mandatoryDocs, component) {
			for (var k = 0; k < gPOMandatoryDocType.length; k++) {
				if (gPOMandatoryDocType[k].Count === 0) {
					if (mandatoryDocs === "") {
						mandatoryDocs = "'" + gPOMandatoryDocType[k].Text + "'";
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
		prepareContractDocumentsODataFilter: function(component, LoginID) {
			var that = this;
			var oModelData = component.getModel("SFGW_INQ");
			var QuotationNo= that.getView().getModel("Quotations").getProperty("/QuotationNo");

			var ContractDocumentsFilters = new Array();
			ContractDocumentsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ContractDocumentsFilters, "LoginID", "", [LoginID],
				false, false, false);
			ContractDocumentsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ContractDocumentsFilters, "QuotationNo", sap.ui.model
				.FilterOperator.EQ, [QuotationNo], true, false, false);

			ContractDocumentsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ContractDocumentsFilters, "DocumentStore", sap.ui
				.model
				.FilterOperator.EQ, [DocumentStore], true, false, false);

			return ContractDocumentsFilters;
		}

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.arteriatech.sf.contracts.view.ContractAttachments
		 */
		//	onInit: function() {
		//
		//	},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.arteriatech.sf.contracts.view.ContractAttachments
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.arteriatech.sf.contracts.view.ContractAttachments
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.arteriatech.sf.contracts.view.ContractAttachments
		 */
		//	onExit: function() {
		//
		//	}

	});

});
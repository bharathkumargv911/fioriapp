jQuery.sap.require("com.arteriatech.ppc.utils.js.Common");
jQuery.sap.require("com.arteriatech.ss.utils.js.Common");
var oSSCommon = com.arteriatech.ss.utils.js.Common;
var oPPCCommon = com.arteriatech.ppc.utils.js.Common;
var oi18n;
var oUtilsI18n;
var aDialog;
var DocumentStore;
var oDialog = new sap.m.BusyDialog();
var sVINDOCFlag;
var indexOfPattern;
var vMaximumFileSize;
sap.ui.controller("com.arteriatech.zsf.quot.controller.ASNVIAttachment", {
	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created.
	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	 * @memberOf webapp.view.ASNAttchment
	 */
	onInit: function() {
		this.onInitHookUp();
	},
	onInitHookUp: function() {
		gASNAttachmentView = this.getView();
		this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(gASNAttachmentView));
		oi18n = this._oComponent.getModel("i18n").getResourceBundle();
		oUtilsI18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();

		this.router = sap.ui.core.UIComponent.getRouterFor(this);

		sVINDOCFlag = oSSCommon.getProductFeatureValue({
			Types: "VINDOC"
		});
		DocumentStore = oSSCommon.getProductFeatureValue({
			Types: "DMSSTORE"
		});
		var Url = window.location.hash;
		indexOfPattern = Url.indexOf("ViewItem");
		vMaximumFileSize = oSSCommon.getProductFeatureValue({
			Types: "ATTACHSIZE"
		});
		if (!vMaximumFileSize) {
			vMaximumFileSize = "2";
		}
		vMaximumFileSize = parseInt(vMaximumFileSize);
		var oLocalAttachCountModel = new sap.ui.model.json.JSONModel();
		var oLocalAttachCountModel = new sap.ui.model.json.JSONModel();
		oLocalAttachCountModel.setData({
			Count: 0,
			UploadEnable: false,
			ToolbarButtonVisible: false,
			maximumFileSize: vMaximumFileSize
		});
		this._oComponent.setModel(oLocalAttachCountModel, "LocalAttachmentCount");

		if (this.onInitHookUp_Exit) {
			this.onInitHookUp();
		}
	},
	getCurrentUsers: function(sServiceName, sRequestType) {
		var sLoginID = oPPSCommon.getCurrentLoggedUser({
			sServiceName: sServiceName,
			sRequestType: sRequestType
		});
		return sLoginID;
	},

	onChange: function(oEvent) {
		var flag = 0;
		var filename = oEvent.getParameter("files")[0].name;
		var iChars = "!@#$%^&*+=-[]\\\';,/{}|\":<>?";
		for (var i = 0; i < filename.length; i++) {
			if (filename.charAt(i) === ".") {
				flag++;
			}
			if (iChars.indexOf(filename.charAt(i)) != -1 || flag > 1) {
				aDialog.close();
				this.fileNameValid();
					return;
			}
		}
		var token = this._oComponent.getModel("PSGW_SHP").getSecurityToken();
		var oUploadCollection = oEvent.getSource();
		var oHeaderToken = new sap.m.UploadCollectionParameter({
			name: "x-csrf-token",
			value: token
		});
		//gASNdetailView.setBusy(true);
		var sLoginID = this.getCurrentUsers("ASNVendorInvDocuments", "write");
		var oHeaderLoginId = new sap.m.UploadCollectionParameter({
			name: "x-arteria-loginid",
			value: sLoginID
		});
		var aTempVar = oEvent.getParameters("mParameters").files[0].name.split(".");
		var sFileName = aTempVar[0];
		for (var i = 1; i < aTempVar.length - 1; i++) {
			sFileName = sFileName + "." + aTempVar[i];
		}
		var url = this._oComponent.getModel("PSGW_SHP").sServiceUrl + "/ASNVendorInvDocuments";
		var oHeaderMethod = new sap.m.UploadCollectionParameter({
			name: "type",
			value: "POST"
		});
		var oHeaderSlug;
		var ASNNumber;
		if (indexOfPattern === -1) {
			ASNNumber = this._oComponent.getModel("ASNs").getProperty("/ASNNumber");
			oHeaderSlug = new sap.m.UploadCollectionParameter({
				name: "SLUG",
				value: "ASNNumber: " + ASNNumber + ",DocumentStore:" + DocumentStore + ",FileName:" + sFileName + ",LoginID:" + sLoginID
			});
		} else {
			ASNNumber = this._oComponent.getModel("ASNItemHeader").getProperty("/ASNNumber");
			var ASNItemNumber = this._oComponent.getModel("ASNItemHeader").getProperty("/ASNItemNumber");
			oHeaderSlug = new sap.m.UploadCollectionParameter({
				name: "SLUG",
				value: "ASNNumber: " + ASNNumber + ",ASNItemNumber:" + ASNItemNumber + ",DocumentStore:" + DocumentStore + ",FileName:" +
					sFileName + ",LoginID:" + sLoginID
			});
		}
		oUploadCollection.addHeaderParameter(oHeaderMethod);
		oUploadCollection.setUploadUrl(url);

		oUploadCollection.addHeaderParameter(oHeaderLoginId);
		oUploadCollection.addHeaderParameter(oHeaderSlug);
		oUploadCollection.addHeaderParameter(oHeaderToken);

	},
	fileNameValid: function() {
		var that = this;
		var dialog = new sap.m.Dialog({
			title: 'Inavlid FileName',
			type: 'Message',
			state: 'Error',
			icon: 'sap-icon://message-warning',
			content: [
				new sap.m.Text({
					text: "Please rename your file name and try again."
				}),
				new sap.m.Text({
					text: "NOTE: Dont use any special characters instead use '_' if required"
				})
			],

			beginButton: new sap.m.Button({
				text: 'OK',
				press: function() {
					that.selectDocumentType();
					dialog.close();
				}
			}),

			afterClose: function() {
				dialog.destroy();
			}
		});
		dialog.open();
	},
	onFileDeleted: function(oEvent) {
		//gASNdetailView.setBusy(true);
		oPPCCommon.removeAllMsgs();
		var URL;
		var that = this;
		var DocumentDeleteModel = this._oComponent.getModel("PSGW_SHP");
		var sLoginID = this.getCurrentUsers("ASNVendorInvDocuments", "delete");
		// DocumentDeleteModel.setUseBatch(false);
		DocumentDeleteModel.setHeaders({
			"x-arteria-loginid": sLoginID
		});
		var token = this._oComponent.getModel("PSGW_SHP").getSecurityToken();
		DocumentDeleteModel.setHeaders({
			"x-csrf-token": token
		});
		var ASNNumber;
		if (indexOfPattern === -1) {
			ASNNumber = this._oComponent.getModel("ASNs").getProperty("/ASNNumber");
			URL = "ASNVendorInvDocuments(ASNNumber='" + ASNNumber + "',ASNItemNumber='',DocumentID='" + escape(oEvent.getParameters().documentId) +
				"',DocumentStore='" + DocumentStore + "')";
		} else {
			ASNNumber = this._oComponent.getModel("ASNItemHeader").getProperty("/ASNNumber");
			var ASNItemNumber = this._oComponent.getModel("ASNItemHeader").getProperty("/ASNItemNumber");
			URL = "ASNVendorInvDocuments(ASNNumber='" + ASNNumber + "',ASNItemNumber='" + ASNItemNumber + "',DocumentID='" + escape(oEvent.getParameters()
				.documentId) + "',DocumentStore='" + DocumentStore + "')";
		}
		DocumentDeleteModel.remove("/" + URL, {
			headers: {
				"x-arteria-loginid": sLoginID
			},
			success: function() {
				oPPCCommon.removeDuplicateMsgsInMsgMgr();
				var message = oPPCCommon.getMsgsFromMsgMgr();
				if (indexOfPattern === -1) {
					sap.ui.controller("com.arteriatech.pps.asn.controller.ASNDetail").getASNVIDocumentLists(that._oComponent, oi18n.getText(
						"asnattchment.message.deleted"), this);
				} else {
					sap.ui.controller("com.arteriatech.pps.asn.controller.ASNItemDetail").getASNVIDocumentLists(that._oComponent, oi18n.getText(
						"asnattchment.message.deleted"), this);
				}
			},
			error: function(error) {
				oPPCCommon.removeDuplicateMsgsInMsgMgr();
				var message = oPPCCommon.getMsgsFromMsgMgr();
				oPPCCommon.displayMsg_MsgBox(that.getView(), message, "error");
			}
		});
	},
	/*	for format file size in attachments
	@sSize: Parameter will hold size of the file
	*/
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
	onFileSizeExceed: function(oEvent) {
		var fileName = oEvent.getParameter("files")[0].name;
		var msg2 = oi18n.getText("ASNAttachment.Page.Upload.FileMessage");
		var message = fileName + " " + msg2;
		//var message ="File "+fileName+" exceeds maximum size of file upload .5 MB" ;
		oPPCCommon.displayMsg_MsgBox(gASNAttachmentView, message, "error");
	},
	onBeforeUploadStarts: function(oEvent) {
		//var oUploadCollection =oEvent.getSource();

	},
	onUploadTerminated: function(oEvent) {
		// get parameter file name
		var sFileName = oEvent.getParameter("fileName");
		// get a header parameter (in case no parameter specified, the callback function getHeaderParameter returns all request headers)
		var oRequestHeaders = oEvent.getParameters().getHeaderParameter();
		//gASNdetailView.setBusy(false);
		sap.m.MessageToast.show(sFileName + " Terminated");
	},
	onUploadComplete: function(oEvent) {
			var that = this;
			if (oEvent.getParameter("files")[0].status === 201) {
				if (indexOfPattern === -1) {
					sap.ui.controller("com.arteriatech.pps.asn.controller.ASNDetail").getASNVIDocumentLists(this._oComponent, oi18n.getText(
						"asnattchment.message.uploaded"), this);
				} else {
					sap.ui.controller("com.arteriatech.pps.asn.controller.ASNItemDetail").getASNVIDocumentLists(this._oComponent, oi18n.getText(
						"asnattchment.message.uploaded"), this);
				}
			} else {
				var message = "";
				var response = oEvent.getParameter("files")[0].responseRaw;
				message = oPPCCommon.parseoDataXMLErrorMessage(response);
				if (indexOfPattern === -1) {
					sap.ui.controller("com.arteriatech.pps.asn.controller.ASNDetail").getASNVIDocumentLists(this._oComponent, oi18n.getText(
						"asnattchment.message.notuploaded") + message, this);
				} else {
					sap.ui.controller("com.arteriatech.pps.asn.controller.ASNItemDetail").getASNVIDocumentLists(this._oComponent, oi18n.getText(
						"asnattchment.message.notuploaded") + message, this);
				}
				/*oPPCCommon.dialogErrorMessage(oEvent.getParameter("files")[0].status, "Error", function(){
				    that.getPODocumentLists();
				});*/
			}
			that.getView().getModel("LocalViewSettingDtl").setProperty("/popup", 0);
			//gASNdetailView.setBusy(false);
		}
		/*	 format file size in attachments method end*/
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf webapp.view.ASNAttchment
		 */
		//	onBeforeRendering: function() {
		//
		//	},

	/**
	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 * @memberOf webapp.view.ASNAttchment
	 */
	//	onAfterRendering: function() {
	//
	//	},

	/**
	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	 * @memberOf webapp.view.ASNAttchment
	 */
	//	onExit: function() {
	//
	//	}

});
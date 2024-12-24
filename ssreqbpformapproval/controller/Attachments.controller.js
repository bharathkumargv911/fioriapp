sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/arteriatech/ppc/utils/js/Common",
], function (Controller, oPPCCommon) {
	"use strict";

	var oi18n = "",
		oUtilsI18n = "";
	var busyDialog = new sap.m.BusyDialog();

	return Controller.extend("com.arteriatech.ssreqbpformapproval.controller.Attachments", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.arteriatech.ssreqbpformapproval.view.Attachments
		 */
		onInit: function () {
			gAttachment=this.getView();
			this._oView = this.getView();
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this._oView));
			oi18n = this._oComponent.getModel("i18n").getResourceBundle();
			oUtilsI18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();
			oPPCCommon.initMsgMangerObjects();
		},

		viewAttachemets: function (oEvent) {
			var that = this;
			busyDialog.open();
			var oModelContext = oEvent.getSource().getBindingContext("Attachments");
			var idx = parseInt(oModelContext.getPath().split("/")[1]);
			var Certificates = that.getView().getModel("Attachments").getData();
			var Doctype = oModelContext.getProperty("CertificateType");
			// var Mimtype = this.getMimeType();
			var ImageURL = Certificates[idx].ImageURL;
			// if (!ImageURL) {
			var DocsTypes = that.getSourceDetailsForCert(Doctype, idx)
			that.getDocuments(idx, DocsTypes, "", function (Data) {
				$.ajax({
					url: "/sap/opu/odata/ARTEC/ProcessDocument/ProcessDocument?" + Data.ImageURL,
					type: "GET",
					dataType: "JSON",
					async: false,
					jsonpCallback: "getJSON",
					contentType: "application/json; charset=utf-8",
					success: function (data, textStatus, jqXHR) {
						busyDialog.close();
						var base64ConversionRes = data.FileContent;
						if (base64ConversionRes) {
							const byteString = window.atob(base64ConversionRes);
							const arrayBuffer = new ArrayBuffer(byteString.length);
							const int8Array = new Uint8Array(arrayBuffer);
							for (let i = 0; i < byteString.length; i++) {
								int8Array[i] = byteString.charCodeAt(i);
							}
							const blob = new Blob([int8Array], {
								type: Data.MimeType
							});
							const url = URL.createObjectURL(blob);
							// CertificateDocuments[index].DocumentUrl = url;
							window.open(url);
						}
					},
					error: function (xhr, status, e) {
						busyDialog.close();
						oPPCCommon.removeDuplicateMsgsInMsgMgr();
						if (index !== CertificateDocumentsLength - 1) {
							index = index + 1;
							that.getDocumentURL(CertificateDocuments, index, CertificateDocumentsLength, callBack);
						} else {
							if (callBack) {
								callBack([]);
							}
						}
					}
				});

			});
			// } else {
			// 	that.getDocuments(idx, DocsTypes, "", function (Data) {
			// 		$.ajax({
			// 			url: "/sap/opu/odata/ARTEC/ProcessDocument/ProcessDocument?" + ImageURL,
			// 			type: "GET",
			// 			dataType: "JSON",
			// 			async: false,
			// 			jsonpCallback: "getJSON",
			// 			contentType: "application/json; charset=utf-8",
			// 			success: function (data, textStatus, jqXHR) {
			// 				busyDialog.close();
			// 				var base64ConversionRes = data.FileContent;
			// 				if (base64ConversionRes) {
			// 					const byteString = window.atob(base64ConversionRes);
			// 					const arrayBuffer = new ArrayBuffer(byteString.length);
			// 					const int8Array = new Uint8Array(arrayBuffer);
			// 					for (let i = 0; i < byteString.length; i++) {
			// 						int8Array[i] = byteString.charCodeAt(i);
			// 					}
			// 					const blob = new Blob([int8Array], {
			// 						type: Data.MimeType
			// 					});
			// 					const url = URL.createObjectURL(blob);
			// 					// CertificateDocuments[index].DocumentUrl = url;
			// 					window.open(url);
			// 				}
			// 			},
			// 			error: function (xhr, status, e) {
			// 				busyDialog.close();
			// 				oPPCCommon.removeDuplicateMsgsInMsgMgr();
			// 				if (index !== CertificateDocumentsLength - 1) {
			// 					index = index + 1;
			// 					that.getDocumentURL(CertificateDocuments, index, CertificateDocumentsLength, callBack);
			// 				} else {
			// 					if (callBack) {
			// 						callBack([]);
			// 					}
			// 				}
			// 			}
			// 		});
			// 	});
			// }
		},

		getSourceDetailsForCert: function (DocType, itemIndex) {
			var that = this;
			if (that.getView().getModel("DoumentTypesDD")) {
				var DoumentTypesDDModel = that.getView().getModel("DoumentTypesDD").getProperty("/");
			}
			var Valid = false;
			for (var i = 0; i < DoumentTypesDDModel.length; i++) {
				if (DoumentTypesDDModel[i].DocumentType === DocType) {
					return DoumentTypesDDModel[i];
				}
			}
		},
		getDocuments: function (idx, DocsTypes, gDeleteFlag, callback) {
			var that = this;
			var json = new sap.ui.model.json.JSONModel([]);
			that.getView().setModel(json, "CertificateDocuments");
			var oModelData = this._oComponent.getModel("PCGWHANA");
			var Certificates = gGSTView.getModel("Attachments").getData();
			var oStatusFilter = new Array();
			if (Certificates[idx].CertificateGUID) {
				oStatusFilter = oPPCCommon.setODataModelReadFilter(this.getView(), "", oStatusFilter, "ObjectKey", sap.ui.model.FilterOperator
					.EQ, [Certificates[idx].CertificateGUID], false, false, false);
			}

			oModelData.read("/DocumentLinks", {
				filters: oStatusFilter,
				success: function (oData) {
					// var json = new sap.ui.model.json.JSONModel(oData.results);
					// that._oComponent.setModel(json, "CertificateDocuments");
					if (oData.results.length > 0) {
						if (DocsTypes) {
							var Certificates = that.getView().getModel("Attachments").getData();
							var Url = "RepositoryID=" + DocsTypes.DocumentRepositoryGUID + "&" + "Source=" + DocsTypes.Source + "&" + "DocumentID=" +
								oData.results[0].DocumentID;
							Certificates[idx].ImageURL = Url;
							Certificates[idx].ImageFlag = true;
							if (!Certificates[idx].UpdateFlag) {
								Certificates[idx].New = true;
							}
							that.getView().getModel("Attachments").setData(Certificates);
							if (that.dialog) {
								that.dialog.close();
							}

							if (callback) {
								oData.results[0].ImageURL = Url;
								callback(oData.results[0]);
							}
						}
						// if (callback) {
						// 	callback(oData.results[0]);
						// }

					} else {
						if (callBack) {
							callBack(oData.results);
						}
					}
				},
				error: function (error) {
					if (callBack) {
						callBack([]);
					}
				}
			});
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.arteriatech.ssreqbpformapproval.view.Attachments
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.arteriatech.ssreqbpformapproval.view.Attachments
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.arteriatech.ssreqbpformapproval.view.Attachments
		 */
		//	onExit: function() {
		//
		//	}

	});

});
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/UploadCollectionParameter",
	"com/arteriatech/ppc/utils/js/Common",
	"sap/ui/core/Fragment",
	"sap/m/Dialog",
	"sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, UploadCollectionParameter, oPPCCommon,
	Fragment, Dialog,
	MessageBox) {
	"use strict";
	var oi18n = "",
		oUtilsI18n = "";
	var busyDialog = new sap.m.BusyDialog();
	var DuplicateAttachements = [];
	var FileTypes = ["pdf", "png", "jpg", "jpeg"];
	var FileSize = 1;
	var busyDialog = new sap.m.BusyDialog();
	var busyDialog1 = new sap.m.BusyDialog();

	return Controller.extend("com.arteriatech.ssreqbpformapproval.controller.TDSDeclaration", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.arteriatech.ssreqbpformapproval.view.TDSDeclaration
		 */
		onInit: function () {
			gDocumentsview = this.getView();
			this._oView = this.getView();
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this._oView));
			oi18n = this._oComponent.getModel("i18n").getResourceBundle();
			oUtilsI18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();
			oPPCCommon.initMsgMangerObjects();
		},

		viewAttachemets: function (oEvent) {
			var that = this;
			busyDialog1.open();
			var oModelContext = oEvent.getSource().getBindingContext("TDSCertificates");
			var idx = parseInt(oModelContext.getPath().split("/")[1]);
			var Certificates = that.getView().getModel("TDSCertificates").getData();
			var Doctype = oModelContext.getProperty("CertificateType");
			var DocsTypes = that.getSourceDetailsForCert(Doctype, idx);
			var sURL = "";
			// if (!Certificates[idx].ImageURL) {
			that.getDocuments(idx, DocsTypes, "", function (Data) {
				Certificates[idx].DoctypeData = Data;
				if (window.location.host.split("-")[0] === "flpnwc") {
					sURL = "/sap/fiori/" + "ssbpboardingapprove" + "/sap/opu/odata/ARTEC/ProcessDocument/ProcessDocument/?";
				} else {
					sURL = "/sap/opu/odata/ARTEC/ProcessDocument/ProcessDocument/?";
				}
				$.ajax({
					url: sURL + Data.ImageURL,
					type: "GET",
					dataType: "JSON",
					async: false,
					jsonpCallback: "getJSON",
					contentType: "application/json; charset=utf-8",
					success: function (data, textStatus, jqXHR) {
						busyDialog1.close();
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
						} else {
							sap.m.MessageBox.error(
								data.Message, {
									styleClass: "sapUiSizeCompact"
								}
							);
						}
					},
					error: function (xhr, status, e) {
						busyDialog1.close();
						oPPCCommon.removeDuplicateMsgsInMsgMgr();
					}
				});
			});

		},
		getDocuments: function (idx, DocsTypes, gDeleteFlag, callback) {
			var that = this;
			var json = new sap.ui.model.json.JSONModel([]);
			that.getView().setModel(json, "CertificateDocuments");
			var oModelData = gDetailPageView.getModel("PCGWHANA");

			var Certificates = gDocumentsview.getModel("TDSCertificates").getData();
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

							var Certificates = that.getView().getModel("TDSCertificates").getData();

							var Url = "RepositoryID=" + DocsTypes.DocumentRepositoryGUID + "&" + "Source=" + DocsTypes.Source + "&" + "DocumentID=" +
								oData.results[0].DocumentID;
							Certificates[idx].ImageURL = Url;

							that.getView().getModel("TDSCertificates").setData(Certificates);

							if (callback) {
								oData.results[0].ImageURL = Url;
								callback(oData.results[0]);
							}
						}
						if (callback) {
							callback(oData.results[0]);
						}

					} else {
						if (callback) {
							callback(oData.results);
						}
					}
				},
				error: function (error) {
					busyDialog1.close();
					if (callback) {
						callback([]);
					}
				}
			});
		},
		getSourceDetailsForCert: function (DocType, itemIndex) {
			var that = this;
			if (gDetailPageView.getModel("DoumentTypesDD")) {
				var DoumentTypesDDModel = gDetailPageView.getModel("DoumentTypesDD").getProperty("/");
			}
			var Valid = false;
			for (var i = 0; i < DoumentTypesDDModel.length; i++) {
				if (DoumentTypesDDModel[i].DocumentType === DocType) {
					return DoumentTypesDDModel[i];
				}
			}

		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.arteriatech.ssreqbpformapproval.view.TDSDeclaration
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.arteriatech.ssreqbpformapproval.view.TDSDeclaration
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.arteriatech.ssreqbpformapproval.view.TDSDeclaration
		 */
		//	onExit: function() {
		//
		//	}

	});

});
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"com/arteriatech/ppc/utils/js/Common",
	"com/arteriatech/ss/utils/js/Common",
	"com/arteriatech/ss/utils/js/UserMapping",
	"com/arteriatech/ss/utils/js/CommonValueHelp",
	"com/arteriatech/ppc/utils/control/TableHeaderText"
], function (Controller, JSONModel, History, oPPCCommon, oSSCommon) {
	"use strict";
	var oi18n, oUtilsI18n;
	var Device = sap.ui.Device;
	var oPPCCommon = com.arteriatech.ppc.utils.js.Common;
	var oProductCommon, oCommonValueHelp;
	var product = "PD";
	var busyDialog = new sap.m.BusyDialog();
	return Controller.extend("com.arteriatech.zsf.quot.controller.DetailPageHeader", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf client.newplugin.artlisttemplate.resources..view.DetailPageHeader
		 */
		onInit: function () {
			this.onInitHookUp();
		},

		onInitHookUp: function () {
			this._oView = this.getView();
			gDetailPageHeaderView = this._oView;
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this._oView));
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
			// var PoDate = this.getView().byId("PoDate");
			// PoDate.addDelegate({
			// 	onAfterRendering: function () {
			// 		PoDate.$().find('INPUT').attr('disabled', true);
			// 	}
			// }, PoDate);
			var ReqDlvryDate = this.getView().byId("ReqDlvryDate");
			ReqDlvryDate.addDelegate({
				onAfterRendering: function () {
					ReqDlvryDate.$().find('INPUT').attr('disabled', true);
				}
			}, ReqDlvryDate);
			var fValidFromEdit = this.getView().byId("fValidFromEdit");
			fValidFromEdit.addDelegate({
				onAfterRendering: function () {
					fValidFromEdit.$().find('INPUT').attr('disabled', true);
				}
			}, fValidFromEdit);
			if (this.onInitHookUp_Exit) {
				this.onInitHookUp_Exit();
			}
		},
		onPressShippingAdress: function (oEvent) {
			this.getView().getModel("LocalViewSettingDtl").setProperty("/ShippingAdress", true);
			this.getView().getModel("LocalViewSettingDtl").setProperty("/PriceBreakUp", false);
			if (!this.ShippingDailog) {
				this.ShippingDailog = sap.ui.xmlfragment("com.arteriatech.zsf.quot.view.ShippingAddress", this);
				this.getView().addDependent(this.ShippingDailog);
			}
			this.ShippingDailog.openBy(oEvent.getSource());
		},
		onSelectTextType: function (oEvent) {
			var flag = false;
			var aTextTypes = gDetailPageHeaderView.getModel("QuotationTexts").getProperty("/");
			var SelectedRecord = this.getView().byId("TextType").getSelectedKey();
			for (var i = 0; i < aTextTypes.length; i++) {

				if (aTextTypes[i].TextID === SelectedRecord) {
					this.getView().byId("hederTextCommentAreaId").setValue(aTextTypes[i].Text);
					flag = true;
				}
			}

		},
		onSelectSalesArea: function (oEvent) {

			var that = this;
			this.QuotationItemDetails = [];
			var itemNo = 10;
			for (var i = 0; i < 5; i++) {

				if (i !== 0) {
					itemNo = ("0000" + (parseInt(itemNo) + 10));
				} else {
					itemNo = "0000" + itemNo;
				}

				this.QuotationItemDetails.push({

					ItemNo: itemNo,
					Material: "",
					MaterialDesc: "",
					Quantity: "",
					//QuantityValueState: "None",
					Currency: "",
					HSNCode: "",
					MRP: "0.00",
					UnitPrice: "0.00",
					GrossAmount: "0.00",
					TaxAmount: "0.00",
					TaxAmount1: "0.00",
					TaxAmount2: "0.00",
					TaxAmount3: "0.00",
					DiscountAmount: "0.00",
					NetValue: "0.00"
						//Text: "",

				});
			}

			//Resetting Sales Office and Sales Group..............................................
			if (that.getView().getModel("SalesOffices")) {
				that.getView().getModel("SalesOffices").setProperty("/", []);
			}
			that.getView().getModel("Quotations").setProperty("/SalesOffice", "");
			that.getView().getModel("Quotations").setProperty("/SalesOfficeDesc", "");
			that.getView().byId("FSalesOffice").setSelectedKey("");

			that.getView().getModel("Quotations").setProperty("/SalesGroup", "");
			that.getView().getModel("Quotations").setProperty("/SaleGrpDesc", "");

			//Ship to party Resetting...............................................................
			if (that.getView().getModel("ShipToParties")) {
				that.getView().getModel("ShipToParties").setProperty("/", []);
			}
			that.getView().getModel("Quotations").setProperty("/ShipToParty", "");
			that.getView().getModel("Quotations").setProperty("/ShipToPartyName", "");
			if (that._oComponent.getModel("Quotations")) {
				that._oComponent.getModel("Quotations").setProperty("/Address1", "");
				that._oComponent.getModel("Quotations").setProperty("/Address2", "");
				that._oComponent.getModel("Quotations").setProperty("/Address3", "");
				that._oComponent.getModel("Quotations").setProperty("/Address4", "");
				that._oComponent.getModel("Quotations").setProperty("/District", "");
				that._oComponent.getModel("Quotations").setProperty("/City", "");
				that._oComponent.getModel("Quotations").setProperty("/PostalCode", "");
				that._oComponent.getModel("Quotations").setProperty("/CountryCode", undefined);
				that._oComponent.getModel("Quotations").setProperty("/CountryCodeDesc", "");
				that._oComponent.getModel("Quotations").setProperty("/State", undefined);
				that._oComponent.getModel("Quotations").setProperty("/StateDesc", "");
				that._oComponent.getModel("Quotations").setProperty("/CreditLimit", "0.00");
				that._oComponent.getModel("Quotations").setProperty("/CreditExposure", "0.00");
				that._oComponent.getModel("Quotations").setProperty("/AvailableBalance", "0.00");
				that._oComponent.getModel("Quotations").setProperty("/Currency", "");
			}

			//Resetting Plant...........................................................................
			if (that.getView().getModel("Plants")) {
				that.getView().getModel("Plants").setProperty("/", []);
			}
			that.getView().getModel("Quotations").setProperty("/Plant", "");
			that.getView().getModel("Quotations").setProperty("/PlantDesc", "");

			//Resetting Incoterm1 and PaymentTerm...........................................................................
			if (that.getView().getModel("Incoterms1")) {
				that.getView().getModel("Incoterms1").setProperty("/", []);
			}

			if (that.getView().getModel("Incoterms2")) {
				that.getView().getModel("Incoterms2").setProperty("/", []);
			}

			if (that.getView().getModel("Payterms")) {
				that.getView().getModel("Payterms").setProperty("/", []);
			}

			that.getView().getModel("Quotations").setProperty("/Incoterm1", "");
			that.getView().getModel("Quotations").setProperty("/Incoterm1Desc", "");

			that.getView().getModel("Quotations").setProperty("/Incoterm2", "");
			that.getView().getModel("Quotations").setProperty("/Incoterm2", "");

			that.getView().getModel("Quotations").setProperty("/Payterm", "");
			that.getView().getModel("Quotations").setProperty("/PaytermDesc", "");

			//Resetting Material........................................................................
			if (that.getView().getModel("QuotationItemDetails")) {
				that.getView().getModel("QuotationItemDetails").setProperty("/", this.QuotationItemDetails);
			}
			that.getView().getModel("LocalViewSettingDtl").setProperty("/SOItemTableCount", 5);
			that.getView().getModel("LocalViewSettingDtl").setProperty("/tableCount", "");

			//Set visibilities...................................................................

			if (oEvent.getSource().getSelectedKey()) {
				that.sSalesArea = oEvent.getSource().getSelectedKey();
				that.sSalesAreaName = (oEvent.getSource().getSelectedItem().getText().split("-")[1]).trim();
				that.getView().getModel("Quotations").setProperty("/SalesArea", that.sSalesArea);
				that.getView().getModel("Quotations").setProperty("/SalesAreaDesc", that.sSalesAreaName);
				//set load symbol to view
				that.getView().setBusy(true);
				//set total backend calls count
				that.totalDDforCreate = 5;

				// that.setShipToPartyDD(that.getView().getModel("Quotations").getProperty("/CustomerNo"));
				that.setSalesOfficeDD(that.getView().getModel("Quotations").getProperty("/CustomerNo"));
				// that.setPlantDD(that.getView().getModel("Quotations").getProperty("/CustomerNo"));
				that.setIncoterm1DD(that.getView().getModel("Quotations").getProperty("/CustomerNo"));
				that.setIncoterm2DD(that.getView().getModel("Quotations").getProperty("/CustomerNo"));
				that.setPaytermDD(that.getView().getModel("Quotations").getProperty("/CustomerNo"));

			} else {
				that.sSalesArea = "";
				that.sSalesAreaName = "";
				that.getView().getModel("Quotations").setProperty("/SalesArea", "");
				that.getView().getModel("Quotations").setProperty("/SalesAreaDesc", "");
			}
		},
		setShipToPartyDD: function (customer) {
			var that = this;
			var view = gDetailPageHeaderView;

			var oModelData = this._oComponent.getModel("PCGW");
			var oFilter = new Array();
			oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "ModelID", sap.ui
				.model.FilterOperator.EQ, ["SFGW_INQ"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "EntityType", sap
				.ui.model.FilterOperator.EQ, ["Quotation"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "PropName", sap.ui
				.model.FilterOperator.EQ, ["ShipToParty"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "PartnerNo", sap.ui
				.model.FilterOperator.EQ, [customer], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "ParentID", sap.ui
				.model.FilterOperator.EQ, [that.sSalesArea], false, false, false);

			oSSCommon.getDropdown(oModelData, "ValueHelps", oFilter, "ID", "Description", busyDialog, view,
				"ShipToParties", "None",
				function (aDDValue) {
					that.closeBusyDialog();
					if (aDDValue.length === 0) {
						var oDDModel = new sap.ui.model.json.JSONModel();
						oDDModel.setData(aDDValue);
						view.setModel(oDDModel, "ShipToParties");
						that.getView().getModel("Quotations").setProperty("/ShipToParty", "");
						that.getView().getModel("Quotations").setProperty("/ShipToPartyName", "");

						if (that._oComponent.getModel("Quotations")) {
							that._oComponent.getModel("Quotations").setProperty("/Address1", "");
							that._oComponent.getModel("Quotations").setProperty("/Address2", "");
							that._oComponent.getModel("Quotations").setProperty("/Address3", "");
							that._oComponent.getModel("Quotations").setProperty("/Address4", "");
							that._oComponent.getModel("Quotations").setProperty("/District", "");
							that._oComponent.getModel("Quotations").setProperty("/City", "");
							that._oComponent.getModel("Quotations").setProperty("/PostalCode", "");
							that._oComponent.getModel("Quotations").setProperty("/CountryCode", undefined);
							that._oComponent.getModel("Quotations").setProperty("/CountryCodeDesc", "");
							that._oComponent.getModel("Quotations").setProperty("/State", undefined);
							that._oComponent.getModel("Quotations").setProperty("/StateDesc", "");
							that._oComponent.getModel("Quotations").setProperty("/CreditLimit", "0.00");
							that._oComponent.getModel("Quotations").setProperty("/CreditExposure", "0.00");
							that._oComponent.getModel("Quotations").setProperty("/AvailableBalance", "0.00");
							that._oComponent.getModel("Quotations").setProperty("/Currency", "");
						}
						if (that.getView().getModel("LocalViewSettingDtl")) {
							that.getView().getModel("LocalViewSettingDtl").setProperty("/CreditLimit", "0.00");
							that.getView().getModel("LocalViewSettingDtl").setProperty("/CreditExposure", "0.00");
						}
					}
					if (aDDValue.length === 1) {
						that.sShipToParty = aDDValue[0].Key;
						that.getView().getModel("Quotations").setProperty("/ShipToParty", that.sShipToParty);
						that.getView().getModel("Quotations").setProperty("/ShipToPartyName", aDDValue[0].Text);
						that.getCustomerDetail(sShipToParty);
					} else {
						if (that._oComponent.getModel("Quotations")) {
							that._oComponent.getModel("Quotations").setProperty("/Address1", "");
							that._oComponent.getModel("Quotations").setProperty("/Address2", "");
							that._oComponent.getModel("Quotations").setProperty("/Address3", "");
							that._oComponent.getModel("Quotations").setProperty("/Address4", "");
							that._oComponent.getModel("Quotations").setProperty("/District", "");
							that._oComponent.getModel("Quotations").setProperty("/City", "");
							that._oComponent.getModel("Quotations").setProperty("/PostalCode", "");
							that._oComponent.getModel("Quotations").setProperty("/CountryCode", undefined);
							that._oComponent.getModel("Quotations").setProperty("/CountryCodeDesc", "");
							that._oComponent.getModel("Quotations").setProperty("/State", undefined);
							that._oComponent.getModel("Quotations").setProperty("/StateDesc", "");
							that._oComponent.getModel("Quotations").setProperty("/CreditLimit", "0.00");
							that._oComponent.getModel("Quotations").setProperty("/CreditExposure", "0.00");
							that._oComponent.getModel("Quotations").setProperty("/AvailableBalance", "0.00");
							that._oComponent.getModel("Quotations").setProperty("/Currency", "");
						}
						if (that.getView().getModel("LocalViewSettingDtl")) {
							that.getView().getModel("LocalViewSettingDtl").setProperty("/CreditLimit", "0.00");
							that.getView().getModel("LocalViewSettingDtl").setProperty("/CreditExposure", "0.00");
						}
					}
				}, false, false, {
					bSetSizeLimit: true
				});
			//for enhancement
			if (this.setShipToPartyDD_Exit) {
				this.setShipToPartyDD_Exit();
			}
		},
		setSalesOfficeDD: function (customer) {
			var that = this;
			var view = gDetailPageHeaderView;
			that.getView().getModel("LocalViewSettingDtl").setProperty("/bSalesOfficeRequired", false);
			var oModelData = this._oComponent.getModel("PCGW");
			var oFilter = new Array();
			oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "ModelID", sap.ui
				.model.FilterOperator.EQ, ["SFGW_INQ"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "EntityType", sap
				.ui.model.FilterOperator.EQ, ["Quotation"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "PropName", sap.ui
				.model.FilterOperator.EQ, ["SalesOffice"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "PartnerNo", sap.ui
				.model.FilterOperator.EQ, [customer], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "ParentID", sap.ui
				.model.FilterOperator.EQ, [that.sSalesArea], false, false, false);

			oSSCommon.getDropdown(oModelData, "ValueHelps", oFilter, "ID", "Description", busyDialog, view,
				"SalesOffices", "None",
				function (aDDValue) {
					that.closeBusyDialog();
					if (aDDValue.length === 0) {
						var oDDModel = new sap.ui.model.json.JSONModel();
						oDDModel.setData(aDDValue);
						view.setModel(oDDModel, "SalesOffices");

						var oDDModel = new sap.ui.model.json.JSONModel();
						oDDModel.setData(aDDValue);
						view.setModel(oDDModel, "SalesGroups");
					}
					if (aDDValue.length === 1) {
						that.sSalesOffice = aDDValue[0].Key;
						that.getView().getModel("Quotations").setProperty("/SalesOffice", aDDValue[0].Key);
						that.getView().getModel("Quotations").setProperty("/SalesOfficeDesc", aDDValue[0].Text);
						that.setSalesGroupDD(customer);
						that.getView().getModel("LocalViewSettingDtl").setProperty("/bSalesOfficeRequired", true);
					} else {
						that.closeBusyDialog();
					}
				});
			//for enhancement
			if (this.setSalesOfficeDD_Exit) {
				this.setSalesOfficeDD_Exit();
			}
		},
		setPlantDD: function (customer) {
			var that = this;
			var view = gDetailPageHeaderView;

			var oModelData = this._oComponent.getModel("PCGW");
			var oFilter = new Array();
			oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "ModelID", sap.ui
				.model.FilterOperator.EQ, ["SFGW_INQ"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "EntityType", sap
				.ui.model.FilterOperator.EQ, ["Quotation"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "PropName", sap.ui
				.model.FilterOperator.EQ, ["Plant"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "PartnerNo", sap.ui
				.model.FilterOperator.EQ, [customer], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "ParentID", sap.ui
				.model.FilterOperator.EQ, [that.sSalesArea], false, false, false);

			oSSCommon.getDropdown(oModelData, "ValueHelps", oFilter, "ID", "Description", busyDialog, view,
				"Plants", "None",
				function (aDDValue) {
					if (aDDValue.length === 0) {
						var oDDModel = new sap.ui.model.json.JSONModel();
						oDDModel.setData(aDDValue);
						view.setModel(oDDModel, "Plants");
					}
					that.closeBusyDialog();
					if (aDDValue.length === 1) {
						that.sPlant = aDDValue[0].Key;
						that.setMaterialModel();
					}
				});
			//for enhancement
			if (this.setPlantDD_Exit) {
				this.setPlantDD_Exit();
			}
		},
		setIncoterm1DD: function (customer) {
			var that = this;
			var view = gDetailPageHeaderView;

			var oModelData = this._oComponent.getModel("PCGW");
			var oFilter = new Array();
			oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "ModelID", sap.ui
				.model.FilterOperator.EQ, ["SFGW_INQ"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "EntityType", sap
				.ui.model.FilterOperator.EQ, ["Quotation"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "PropName", sap.ui
				.model.FilterOperator.EQ, ["Incoterm1"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "PartnerNo", sap.ui
				.model.FilterOperator.EQ, [customer], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "ParentID", sap.ui
				.model.FilterOperator.EQ, [that.sSalesArea], false, false, false);

			oSSCommon.getDropdown(oModelData, "ValueHelps", oFilter, "ID", "Description", busyDialog, view,
				"Incoterms1", "None",
				function (aDDValue) {
					that.closeBusyDialog();
					if (aDDValue.length === 0) {
						var oDDModel = new sap.ui.model.json.JSONModel();
						oDDModel.setData(aDDValue);
						view.setModel(oDDModel, "Incoterms1");
					}
					if (aDDValue.length === 1) {
						that.getView().getModel("Quotations").setProperty("/Incoterm1", aDDValue[0].Key);
						that.getView().getModel("Quotations").setProperty("/Incoterm1Desc", aDDValue[0].Text);
					}
				});
			//for enhancement
			if (this.setIncoterm1DD_Exit) {
				this.setIncoterm1DD_Exit();
			}
		},

		setIncoterm2DD: function (customer) {
			var that = this;
			var view = gDetailPageHeaderView;

			var oModelData = this._oComponent.getModel("PCGW");
			var oFilter = new Array();
			oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "ModelID", sap.ui
				.model.FilterOperator.EQ, ["SFGW_INQ"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "EntityType", sap
				.ui.model.FilterOperator.EQ, ["Quotation"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "PropName", sap.ui
				.model.FilterOperator.EQ, ["Incoterm2"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "PartnerNo", sap.ui
				.model.FilterOperator.EQ, [customer], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "ParentID", sap.ui
				.model.FilterOperator.EQ, [that.sSalesArea], false, false, false);

			oSSCommon.getDropdown(oModelData, "ValueHelps", oFilter, "ID", "Description", busyDialog, view,
				"Incoterms2", "None",
				function (aDDValue) {
					that.closeBusyDialog();
					if (aDDValue.length === 0) {
						var oDDModel = new sap.ui.model.json.JSONModel();
						oDDModel.setData(aDDValue);
						view.setModel(oDDModel, "Incoterms2");
					}
					if (aDDValue.length === 1) {
						aDDValue.splice(0, 0, {
							Key: "",
							Text: "(None)"
						});
						that.getView().getModel("Incoterms2").setProperty("/", aDDValue);
						//gDetailPageHeaderView.byId("Incoterm2").setSelectedKey("");
						that.Incoterm2 = aDDValue[0].Key;
					}
				});
			//for enhancement
			if (this.setIncoterm2DD_Exit) {
				this.setIncoterm2DD_Exit();
			}
		},

		setPaytermDD: function (customer) {
			var that = this;
			var view = gDetailPageHeaderView;

			var oModelData = this._oComponent.getModel("PCGW");
			var oFilter = new Array();
			oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "ModelID", sap.ui
				.model.FilterOperator.EQ, ["SFGW_INQ"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "EntityType", sap
				.ui.model.FilterOperator.EQ, ["Quotation"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "PropName", sap.ui
				.model.FilterOperator.EQ, ["Payterm"], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "PartnerNo", sap.ui
				.model.FilterOperator.EQ, [customer], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter(view, "", oFilter, "ParentID", sap.ui
				.model.FilterOperator.EQ, [that.sSalesArea], false, false, false);

			oSSCommon.getDropdown(oModelData, "ValueHelps", oFilter, "ID", "Description", busyDialog, view,
				"Payterms", "None",
				function (aDDValue) {
					that.closeBusyDialog();
					if (aDDValue.length === 0) {
						var oDDModel = new sap.ui.model.json.JSONModel();
						oDDModel.setData(aDDValue);
						view.setModel(oDDModel, "Payterms");
					}
					if (aDDValue.length === 1) {
						that.Payterm = aDDValue[0].Key;
					}
				});
			//for enhancement
			if (this.setPaytermDD_Exit) {
				this.setPaytermDD_Exit();
			}
		},
		closeBusyDialog: function () {
			this.totalDDforCreate--;
			if (this.totalDDforCreate === 0) {
				// oDialog.close();
				this.getView().setBusy(false);
			}
		},
		getCustomerDetail: function (ShipToParty) {
			var that = this;
			if (ShipToParty) {
				var odataModel = this._oComponent.getModel("SFGW_MST");
				oSSCommon.getCurrentLoggedUser({
					sServiceName: "CustomerPartnerFunctions",
					sRequestType: "read"
				}, function (LoginID) {
					odataModel.setHeaders({
						"x-arteria-loginid": LoginID
					});
					odataModel.read("/CustomerPartnerFunctions", {
						filters: that.prepareCustomerDetailsODataFilter(LoginID, ShipToParty),
						success: function (oData) {
							that.setShipToPartyData(oData.results[0]);
						},
						error: function (error) {
							oPPCCommon.removeDuplicateMsgsInMsgMgr();
							var message = oPPCCommon.getMsgsFromMsgMgr();
							that.setNodataFound();
							oPPCCommon.displayMsg_MsgBox(that.getView(), message, "error");
						}
					});
				});
			}
		},
		setShipToPartyData: function (oData) {
			var that = this;
			if (oData === undefined) {
				this._oComponent.getModel("Quotations").setProperty("/Address1", "");
				this._oComponent.getModel("Quotations").setProperty("/Address2", "");
				this._oComponent.getModel("Quotations").setProperty("/Address3", "");
				this._oComponent.getModel("Quotations").setProperty("/Address4", "");
				this._oComponent.getModel("Quotations").setProperty("/District", "");
				this._oComponent.getModel("Quotations").setProperty("/City", "");
				this._oComponent.getModel("Quotations").setProperty("/PostalCode", "");
				this._oComponent.getModel("Quotations").setProperty("/CountryCode", "");
				this._oComponent.getModel("Quotations").setProperty("/CountryCodeDesc", "");
				this._oComponent.getModel("Quotations").setProperty("/State", "");
				this._oComponent.getModel("Quotations").setProperty("/StateDesc", "");
				this._oComponent.getModel("Quotations").setProperty("/CreditLimit", "0.00");
				this._oComponent.getModel("Quotations").setProperty("/CreditExposure", "0.00");
				this._oComponent.getModel("Quotations").setProperty("/AvailableBalance", "0.00");
				this._oComponent.getModel("Quotations").setProperty("/Currency", "");
				this.getView().getModel("LocalViewSettingDtl").setProperty("/CreditLimit", "0.00");
				this.getView().getModel("LocalViewSettingDtl").setProperty("/CreditExposure", "0.00");
			} else {
				this._oComponent.getModel("Quotations").setProperty("/Address1", oData.Address1);
				this._oComponent.getModel("Quotations").setProperty("/Address2", oData.Address2);
				this._oComponent.getModel("Quotations").setProperty("/Address3", oData.Address3);
				this._oComponent.getModel("Quotations").setProperty("/Address4", oData.Address4);
				this._oComponent.getModel("Quotations").setProperty("/District", oData.District);
				this._oComponent.getModel("Quotations").setProperty("/City", oData.City);
				this._oComponent.getModel("Quotations").setProperty("/PostalCode", oData.PostalCode);
				this._oComponent.getModel("Quotations").setProperty("/CountryCode", oData.CountryID);
				this._oComponent.getModel("Quotations").setProperty("/CountryCodeDesc", oData.CountryDesc);
				this._oComponent.getModel("Quotations").setProperty("/State", oData.Region);
				this._oComponent.getModel("Quotations").setProperty("/StateDesc", oData.RegionDesc);
				this._oComponent.getModel("Quotations").setProperty("/CreditLimit", oData.CreditLimit);
				this._oComponent.getModel("Quotations").setProperty("/CreditExposure", oData.CreditExposure);
				this._oComponent.getModel("Quotations").setProperty("/AvailableBalance", ((oData.CreditLimit * 1) - (oData.CreditExposure * 1)).toFixed(
					2));
				this.getView().getModel("LocalViewSettingDtl").setProperty("/CreditLimit", oData.CreditLimit);
				this.getView().getModel("LocalViewSettingDtl").setProperty("/CreditExposure", oData.CreditExposure);
			}
		},
		getCurrentUsers: function (sServiceName, sRequestType) {
			var sLoginID = oSSCommon.getCurrentLoggedUser({
				sServiceName: sServiceName,
				sRequestType: sRequestType
			});
			return sLoginID;
		},
		prepareCustomerDetailsODataFilter: function (LoginID, ShipToParty) {
			var that = this;
			var CustomerDetailsFilters = new Array();
			var oSalesArea = that.getView().getModel("Quotations").getProperty("/SalesArea");
			if (oSalesArea.includes("-")) {
				oSalesArea = oSalesArea.replaceAll("-", "/");
			}
			var oCustomer = that.getView().getModel("Quotations").getProperty("/CustomerNo");
			CustomerDetailsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", CustomerDetailsFilters, "CustomerNo", sap.ui.model
				.FilterOperator.EQ, [oCustomer], false, false, false);
			CustomerDetailsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", CustomerDetailsFilters, "PartnerFunctionID", sap.ui
				.model
				.FilterOperator.EQ, ["SH"], false, false, false);
			CustomerDetailsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", CustomerDetailsFilters, "SalesArea", sap.ui.model
				.FilterOperator.EQ, [oSalesArea], false, false, false);
			CustomerDetailsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", CustomerDetailsFilters, "PartnerCustomerNo", sap.ui
				.model
				.FilterOperator.EQ, [ShipToParty], false, false, false);
			CustomerDetailsFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", CustomerDetailsFilters, "LoginID", sap.ui.model.FilterOperator
				.EQ, [LoginID], false, false, false);
			if (this.prepareCustomerDetailsODataFilter_Exit) {
				CustomerDetailsFilters = this.prepareSOItemsODataFilter_Exit(CustomerDetailsFilters);
			}
			return CustomerDetailsFilters;
		},
		setMaterialModel: function () {
			var that = this;
			var SFGW_MSTModel = this._oComponent.getModel("SFGW_MST");
			SFGW_MSTModel.attachRequestSent(function () {
				// busyDialog.open();
			});
			SFGW_MSTModel.attachRequestCompleted(function () {
				// busyDialog.close();
			});
			var salesArea = that.sSalesArea;
			salesArea = salesArea.split("/");
			var aMaterialF4Filter = new Array();
			aMaterialF4Filter = oPPCCommon.setODataModelReadFilter("", "", aMaterialF4Filter, "LoginID", "", [
				that.getCurrentUsers("MaterialByCustomers", "read")
			], false, false, false);

			aMaterialF4Filter = oPPCCommon.setODataModelReadFilter("", "", aMaterialF4Filter, "CustomerNo", "", [this._oComponent.getModel(
				"Quotations").getProperty("/CustomerNo")], false, false, false);
			aMaterialF4Filter = oPPCCommon.setODataModelReadFilter("", "", aMaterialF4Filter, "PlantID", "", [that.sPlant], false, false, false);
			aMaterialF4Filter = oPPCCommon.setODataModelReadFilter("", "", aMaterialF4Filter, "SalesOrgID", "", [salesArea[0]], false, false,
				false);
			aMaterialF4Filter = oPPCCommon.setODataModelReadFilter("", "", aMaterialF4Filter, "DistChannelID", "", [salesArea[1]], false, false,
				false);

			SFGW_MSTModel.read("/MaterialByCustomers", {
				filters: aMaterialF4Filter,
				success: function (oData) {
					var MaterialsModel = new sap.ui.model.json.JSONModel();
					MaterialsModel.setData(oData.results);
					gDetailPageItems.setModel(MaterialsModel, "MaterialSuggestorModel");
					//gSalesOrderCreate.setBusy(false);
				},
				error: function (error) {
					//alert(error);
				}
			});
		},
		onSelectIncoterm1: function (oEvent) {
			if (oEvent.getSource().getSelectedKey()) {
				this.getView().getModel("Quotations").setProperty("/Incoterm1", oEvent.getSource().getSelectedKey());
				this.getView().getModel("Quotations").setProperty("/Incoterm1Desc", (oEvent.getSource().getSelectedItem().getText().split("-")[1])
					.trim());
			} else {
				this.getView().getModel("Quotations").setProperty("/Incoterm1", "");
				this.getView().getModel("Quotations").setProperty("/Incoterm1Desc", "");
			}
		},
		onSelectGroupCompanyDD: function (oEvent) {
			oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			oEvent.getSource().setValueStateText("");
			if (oEvent.getSource().getSelectedKey()) {
				var Text = oEvent.getSource().getSelectedItem().getBindingContext("GroupCompanyDD").getObject().Text;
				this.getView().getModel("Quotations").setProperty("/GrpCompCode", oEvent.getSource().getSelectedKey());
				this.getView().getModel("Quotations").setProperty("/GrpCompName", Text);
			} else {
				this.getView().getModel("Quotations").setProperty("/GrpCompCode", "");
				this.getView().getModel("Quotations").setProperty("/GrpCompName", "");
			}
		},
		onSelectBillToPartyDD: function (oEvent) {
			oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			oEvent.getSource().setValueStateText("");
			if (oEvent.getSource().getSelectedKey()) {
				var Text = oEvent.getSource().getSelectedItem().getBindingContext("BillToPartyDD").getObject().Text;
				var BpGstNO = oEvent.getSource().getSelectedItem().getBindingContext("BillToPartyDD").getObject().BpGstNO;
				this.getView().getModel("Quotations").setProperty("/BillToParty", oEvent.getSource().getSelectedKey());
				this.getView().getModel("Quotations").setProperty("/BillToDesc", Text);
				this.getView().getModel("Quotations").setProperty("/BpGstNO", BpGstNO);
				// gSalesOrderCreate.oController.setShipToPartyDD(this.getView().getModel("Quotations").getProperty("/CustomerNo"), oEvent.getSource()
				// 	.getSelectedKey());
			} else {
				this.getView().getModel("Quotations").setProperty("/BillToParty", "");
				this.getView().getModel("Quotations").setProperty("/BillToDesc", "");
				this.getView().getModel("Quotations").setProperty("/BpGstNO", "");
			}
		},
		onSelectPayerDD: function (oEvent) {
			oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			oEvent.getSource().setValueStateText("");
			if (oEvent.getSource().getSelectedKey()) {
				var Text = oEvent.getSource().getSelectedItem().getBindingContext("PayerDD").getObject().BusinessPartnerName;
				this.getView().getModel("Quotations").setProperty("/Payer", oEvent.getSource().getSelectedKey());
				this.getView().getModel("Quotations").setProperty("/PayerDesc", Text);
			} else {
				this.getView().getModel("Quotations").setProperty("/Payer", "");
				this.getView().getModel("Quotations").setProperty("/PayerDesc", "");
			}
		},
		onSelectShippConditionDD: function (oEvent) {
			oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			oEvent.getSource().setValueStateText("");
			if (oEvent.getSource().getSelectedKey()) {
				var Text = oEvent.getSource().getSelectedItem().getBindingContext("ShippConditionDD").getObject().Text;
				this.getView().getModel("Quotations").setProperty("/ShippCondition", oEvent.getSource().getSelectedKey());
				this.getView().getModel("Quotations").setProperty("/ShippCondDesc", Text);
			} else {
				this.getView().getModel("Quotations").setProperty("/ShippCondition", "");
				this.getView().getModel("Quotations").setProperty("/ShippCondDesc", "");
			}
		},
		onSelectTransportZoneDD: function (oEvent) {
			oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			oEvent.getSource().setValueStateText("");
			if (oEvent.getSource().getSelectedKey()) {
				var Text = oEvent.getSource().getSelectedItem().getBindingContext("TransportZoneDD").getObject().Text;
				this.getView().getModel("Quotations").setProperty("/TransportZone", oEvent.getSource().getSelectedKey());
				this.getView().getModel("Quotations").setProperty("/TransZoneDesc", Text);
			} else {
				this.getView().getModel("Quotations").setProperty("/TransportZone", "");
				this.getView().getModel("Quotations").setProperty("/TransZoneDesc", "");
			}
		},
		onSelectPricingZoneDD: function (oEvent) {
			oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			oEvent.getSource().setValueStateText("");
			if (oEvent.getSource().getSelectedKey()) {
				var Text = oEvent.getSource().getSelectedItem().getBindingContext("PricingZoneDD").getObject().Text;
				this.getView().getModel("Quotations").setProperty("/PriceList", oEvent.getSource().getSelectedKey());
				this.getView().getModel("Quotations").setProperty("/PriceListDesc", Text);
			} else {
				this.getView().getModel("Quotations").setProperty("/PriceList", "");
				this.getView().getModel("Quotations").setProperty("/PriceListDesc", "");
			}
		},
		onSelectShipToParty: function (oEvent) {
			oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			oEvent.getSource().setValueStateText("");
			var sShipToParty = oEvent.getSource().getSelectedKey();
			if (sShipToParty === "") {
				this.getView().getModel("Quotations").setProperty("/ShipToParty", sShipToParty);
				this.getView().getModel("Quotations").setProperty("/ShipToPartyName", sShipToParty);
				this.sShipToParty = sShipToParty;
				this._oComponent.getModel("Quotations").setProperty("/Address1", "");
				this._oComponent.getModel("Quotations").setProperty("/Address2", "");
				this._oComponent.getModel("Quotations").setProperty("/Address3", "");
				this._oComponent.getModel("Quotations").setProperty("/Address4", "");
				this._oComponent.getModel("Quotations").setProperty("/District", "");
				this._oComponent.getModel("Quotations").setProperty("/City", "");
				this._oComponent.getModel("Quotations").setProperty("/PostalCode", "");
				this._oComponent.getModel("Quotations").setProperty("/CountryCode", "");
				this._oComponent.getModel("Quotations").setProperty("/CountryCodeDesc", "");
				this._oComponent.getModel("Quotations").setProperty("/State", "");
				this._oComponent.getModel("Quotations").setProperty("/StateDesc", "");
				this._oComponent.getModel("Quotations").setProperty("/CreditLimit", "0.00");
				this._oComponent.getModel("Quotations").setProperty("/CreditExposure", "0.00");
				this._oComponent.getModel("Quotations").setProperty("/AvailableBalance", "0.00");
				this._oComponent.getModel("Quotations").setProperty("/Currency", "");
				this.getView().getModel("LocalViewSetting").setProperty("/CreditLimit", "0.00");
				this.getView().getModel("LocalViewSetting").setProperty("/CreditExposure", "0.00");
			} else {
				var Text = oEvent.getSource().getSelectedItem().getBindingContext("ShipToParties").getObject().Text;
				this.getView().getModel("Quotations").setProperty("/ShipToParty", oEvent.getSource().getSelectedKey());
				this.getView().getModel("Quotations").setProperty("/ShipToPartyName", Text);
				this.sShipToParty = sShipToParty;
				this.getCustomerDetail(sShipToParty);
				gDetailPageView.oController.getBilltoParties(sShipToParty);
				gDetailPageView.oController.TransportZoneDD(sShipToParty);
				gDetailPageView.oController.PricingZoneDD(sShipToParty);

			}
		},
		onSelectPayterm: function (oEvent) {
			oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			oEvent.getSource().setValueStateText("");
			if (oEvent.getSource().getSelectedKey()) {
				var Text = oEvent.getSource().getSelectedItem().getBindingContext("Payterms").getObject().Text;
				this.getView().getModel("Quotations").setProperty("/Payterm", oEvent.getSource().getSelectedKey());
				this.getView().getModel("Quotations").setProperty("/PaytermDesc", Text);
			} else {
				this.getView().getModel("Quotations").setProperty("/Payterm", "");
				this.getView().getModel("Quotations").setProperty("/PaytermDesc", "");
			}
		},
		onChangePoNo: function (oEvent) {
			oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			oEvent.getSource().setValueStateText("");
		},
		onChangePoDate: function (oEvent) {
			var that = this;
			oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			oEvent.getSource().setValueStateText("");
			oPPCCommon.removeAllMsgs();
			that.getView().getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
				.getData().length);
			oPPCCommon.hideMessagePopover(gObjPageLayout);
			var FromDate1 = oEvent.getSource().mProperties.value;
			if (FromDate1) {
				if (typeof (FromDate1) != "object") {
					var split = FromDate1.split('/');
					if (split.length === 3) {
						var date = new Date(split[2], split[1] - 1, split[0]); //Y M D
						FromDate1 = oPPCCommon.addHoursAndMinutesToDate({
							dDate: date
						});
						that.getView().getModel("Quotations").setProperty("/PoDate", FromDate1);
						if (that.isFutureDate(FromDate1)) {
							var msg = oi18n.getText("QuotationCreate.Message.PoDate", that.getView().byId("LCustomerPODate").getText());
							oPPCCommon.addMsg_MsgMgr(msg, "error", "PoDate");
							this.getView().getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
								.getData()
								.length);
							oPPCCommon.showMessagePopover(gObjPageLayout);
							this.getView().getModel("Quotations").setProperty("/PoDate", null);
							this.getView().getModel("LocalViewSettingDtl").setProperty("/PoDate", "");
							oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
							oEvent.getSource().setValueStateText(msg);
						}
					} else {
						this.getView().getModel("Quotations").setProperty("/PoDate", null);
						this.getView().getModel("LocalViewSettingDtl").setProperty("/PoDate", "");
						var msg = oi18n.getText("List.Filterbar.MultiInput.custNoError", that.getView().byId("LCustomerPODate").getText());
						oPPCCommon.addMsg_MsgMgr(msg, "error", "PoDate");
						this.getView().getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
							.getData()
							.length);
						oPPCCommon.showMessagePopover(gObjPageLayout);
						oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
						oEvent.getSource().setValueStateText(msg);
						oEvent.getSource().setValue("");
					}
				}
			} else {
				this.getView().getModel("Quotations").setProperty("/PoDate", null);
				this.getView().getModel("LocalViewSettingDtl").setProperty("/PoDate", "");
			}
		},
		onChangeReqDlvryDate: function (oEvent) {
			oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			oEvent.getSource().setValueStateText("");
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
		onChangeBatchNo: function (oEvent) {
			oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			oEvent.getSource().setValueStateText("");
		},
		onLiveChangeBatchNo: function (oEvent) {
			oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			oEvent.getSource().setValueStateText("");
			var that = this;
			oPPCCommon.hideMessagePopover(gObjPageLayout);
			oPPCCommon.removeAllMsgs();
			var value = oEvent.getSource().getValue();
			var reg = /[ !@#$%^&*()_+\-=\[\]{};':.`~"\\|,<>\/?]/;
			if (reg.test(value)) {
				oEvent.getSource().setValue("");
				var msg = oi18n.getText("Common.Please.Enter", gDetailPageHeaderView.byId("LBatchNo").getText());
				oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/LBatchNo-");
				if (oPPCCommon.doErrMessageExist()) {
					oEvent.getSource().setValueState("None");
					oEvent.getSource().setValueStateText("");
				} else {
					oEvent.getSource().setValueState("Error");
					oEvent.getSource().setValueStateText(msg);
				}
			}
		},

	});

});
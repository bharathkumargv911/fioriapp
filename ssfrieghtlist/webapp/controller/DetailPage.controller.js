sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"com/arteriatech/ppc/utils/js/Common",
	"com/arteriatech/ss/utils/js/Common"
], function (Controller, JSONModel, History, oPPCCommon, oSSCommon) {
	"use strict";
	var oi18n, oUtilsI18n;
	var oSSCommon = com.arteriatech.ss.utils.js.Common;
	var Device = sap.ui.Device;
	var oProductCommon, oCommonValueHelp;
	var oProductUserMapping;
	var contextPath = "";
	var busyDialog = new sap.m.BusyDialog();
	var gPath = "";
	var itemindex;
	// var LoginID = sap.ushell.Container.getService("UserInfo");
	// var rLoginID = LoginID.getId();
	// var sLoginID = rLoginID.toUpperCase();
	var sLoginID = "P000003"
	return Controller.extend("com.arteriatech.ssfrieghtlist.controller.DetailPage", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.arteriatech.ssfrieghtlist.view.DetailPage
		 */
		onInit: function () {
			gDetailPageView = this.getView();
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(gDetailPageView));

			oProductCommon = com.arteriatech.ss.utils.js.Common;
			oCommonValueHelp = com.arteriatech.ss.utils.js.CommonValueHelp;
			gListView = this.getView().byId("ObjectPageLayout")
			oi18n = this._oComponent.getModel("i18n").getResourceBundle();
			oUtilsI18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.attachRouteMatched(this.onRouteMatched, this);
			oPPCCommon.initMsgMangerObjects();

			if (this.onInitHookUp_Exit) {
				this.onInitHookUp_Exit();
			}
		},
		onRouteMatched: function (oEvent) {
			var that = this;
			that.getView().setBusy(true);
			if (oEvent.getParameter("name") !== "DetailPage") {
				return;
			}
			this.setDefaultSettings();
			this.setDefaultSettings1();
			this.setDropDowns();
			var path = oEvent.getParameter("arguments").contextPath;
			itemindex = oPPCCommon.getPropertyValueFromContextPath(path, "index");
			itemindex = parseFloat(itemindex);
			contextPath = oEvent.getParameter("arguments").contextPath.split(",")[0];
			var oHistory = sap.ui.core.routing.History.getInstance();
			if (oPPCCommon.getFLPTileAction().split("&")[0] === "ApprovalView") {
				// if (true) {
				// this.getTaskCollections();
				var workflowdata = gList.getModel("ListItems").getProperty("/");
				var appuserName = workflowdata[itemindex].CurrentApprover[0].apprUsrname;

				// if (appuserName == 'SOM1' || appuserName == 'BDM1' || appuserName == 'NSM1') {
				// 	this.getView().getModel("LocalViewSettingDt").setProperty("/ReqBtn", true);
				// }
				// this.getView().getModel("LocalViewSettingDt").setProperty("/ReqBtn", true);

				this.getView().getModel("LocalViewSettingDt").setProperty("/ApprovalView", true);

				this.getView().getModel("LocalViewSettingDt").setProperty("/ListView", false);
			} else {
				this.getView().getModel("LocalViewSettingDt").setProperty("/ApprovalView", false);
				this.getView().getModel("LocalViewSettingDt").setProperty("/ReqCorrection", false);
				this.getView().getModel("LocalViewSettingDt").setProperty("/ListView", true);
			}
			if (oHistory.getDirection() !== "Backwards") {

				if (oEvent.getParameter("name") === "DetailPage") {
					setTimeout(function () {
						that.getCPDetails();
						that.getFrieghtDetails();
						that.getEntityAttributes();
					}, 2000);
				} else if (oEvent.getParameter("name") === "ApproveDetailPage") {
					//examples
				} else if (oHistory.getDirection() === "Unknown" && oEvent.getParameter("name") === "changePage") {
					contextPath = oEvent.getParameter("arguments").contextPath;
					this._oRouter.navTo("DetailPage", {
						contextPath: contextPath
					}, true);
				} else if (oEvent.getParameter("name") === "changePage") {
					contextPath = oEvent.getParameter("arguments").contextPath;
					// this.gotoEdit();
				} else if (oEvent.getParameter("name") === "changePage") {

				}
			} else {
				if (oEvent.getParameter("name") === "DetailPage") {
					// this.getCPDetails();
				}
			}
		},
		setDropDowns: function () {
			this.getAggregatorsID();
			this.getDistributorTypes();
			this.getDistributorStatusDD();
			this.getStateID();
		},
		getEntityAttributes: function () {
			var that = this;
			var oModelData = this._oComponent.getModel("PCGWHANA");
			var oStatusFilter = new Array();
			oStatusFilter = oPPCCommon.setODataModelReadFilter(this.getView(), "", oStatusFilter, "Attribute2", sap.ui.model.FilterOperator
				.EQ, [gPartnerGuid], false, false, false);
			oStatusFilter = oPPCCommon.setODataModelReadFilter(this.getView(), "", oStatusFilter, "AggregatorID", sap.ui.model.FilterOperator
				.EQ, [gAggregatorID], false, false, false);
			oModelData.read("/EntityAttributes", {
				filters: oStatusFilter,
				success: function (oData) {
					oData = oPPCCommon.formatItemsOData({
						oData: oData
					});
					// var ojsonmodel = new sap.ui.model.json.JSONModel({});
					// gDistributorCreate.setModel(ojsonmodel, "EntityAttributesModel");
					if (oData.length > 0) {
						gEntityGuid = oData[0].EntityAttrGUID;;
					}

				},
				error: function (error) {
					if (callBack) {
						callBack([]);
					}
				}
			});
		},
		setDefaultSettings: function () {
			/**
			 * All view related local settings should be mapped in a Model and is called LocalViewSetting
			 */
			var that = this;
			var oViewSettingModel = new sap.ui.model.json.JSONModel();
			this.viewSettingData = {
				editMode: true,
				reviewMode: true,
				SaveBtnvis: false,
				detailMode: false,
				editbtn: true,
				DateFormat: oSSCommon.getDateFormat(),
				messageLength: 0,
				VisitCount: 0,
				ToDay: new Date(),
				required: false,
				CPRefItemCount: 0,
				AddInfoCount: 0,
				visibleODAmount: false,
				visibleTDSGreater: false,
				visibleTDSLess: false,
				ReqCorrection: true,
				CPInfraQuestionCount: 0,
				FSSAIDocumentsCount: 0,
				AttachmentTableCount: 0,
				PANDocumentsCount: 0,
				TDSDocConut: 0,
				TanVisble: false,
				ITRDocumentsCount: 0,
				BankDocumentsCount: 0,
				ApprovalView: false,
				ListView: true,
				showStatus: true,
				PendingVisible: false,
				RemarkVisible: false,
				ReqBtn: false
			};
			oViewSettingModel.setData(this.viewSettingData);
			gDetailPageView.setModel(oViewSettingModel, "LocalViewSettingDt");
			this.getCurrentServerDate(this, function (Today) {
				that.getView().getModel("LocalViewSettingDt").setProperty("/Today", Today);
			});
			// this.setTableTitle(0);
			if (this.setDefaultSettings_Exit) {
				this.setDefaultSettings_Exit();
			}
		},
		onBack: function () {
			window.history.go(-1);
		},
		getCPDetails: function () {
			var that = this;
			busyDialog.open();
			var view = that.getView();
			var oSSGW_MSTModel = that._oComponent.getModel("SSGWHANA");
			var guid = oPPCCommon.getPropertyValueFromContextPath(contextPath, "CP_GUID");
			guid = guid.split("guid")[1];
			gPartnerGuid = guid;
			// oSSGW_MSTModel.setHeaders({
			// 	"x-arteria-loginid": loginID
			// });
			oSSGW_MSTModel.read("/ChannelPartners(ChannelPartnerGUID='" + guid + "')", {
				urlParameters: {
					"$expand": "ChannelPartnerCPAddInfos,ChannelPartnerCPReferences,ChannelPartnerCPDMSDivisions"
				},
				success: function (oData) {

					that.setChannelPartnersModel(oData);
				},
				error: function (error) {
					busyDialog.close();
					that.handleoDataError(error);
				}
			});

			if (this.getCPDetails_Exit) {
				this.getCPDetails_Exit();
			}
		},
		setChannelPartnersModel: function (oData) {
			var that = this;
			//Header Model
			var OnBoardingType = that.getView().getModel("OnBoardingTypeDD").getData();
			var StatusModel = that.getView().getModel("DistributorStatusDD").getData();

			for (var j = 0; j < StatusModel.length; j++) {
				if (StatusModel[j].key == oData.ProspectStatusID) {
					oData.ProspectStatusDes = StatusModel[j].Text;
				}
			}
			for (var i = 0; i < OnBoardingType.length; i++) {
				if (oData.CPTypeID === OnBoardingType[i].key) {
					oData.CPTypeDesc = OnBoardingType[i].Text;
				}
				if (oData.CPTypeID === "01") {
					that.getView().getModel("LocalViewSettingDt").setProperty("/reasonVisibility", false);
					that.getView().getModel("LocalViewSettingDt").setProperty("/awCodeAndBusinessTurnoverVisibility", false);
				} else if (oData.CPTypeID === "02") {
					that.getView().getModel("LocalViewSettingDt").setProperty("/reasonVisibility", true);
					that.getView().getModel("LocalViewSettingDt").setProperty("/awCodeAndBusinessTurnoverVisibility", true);
				} else if (oData.CPTypeID === "03") {
					that.getView().getModel("LocalViewSettingDt").setProperty("/reasonVisibility", false);
					that.getView().getModel("LocalViewSettingDt").setProperty("/awCodeAndBusinessTurnoverVisibility", false);
				} else if (oData.CPTypeID === "04") {
					that.getView().getModel("LocalViewSettingDt").setProperty("/reasonVisibility", true);
					that.getView().getModel("LocalViewSettingDt").setProperty("/awCodeAndBusinessTurnoverVisibility", false);
				}
			}
			// StateDesc
			var State = that.getView().getModel("StateModel").getData();
			for (var i = 0; i < State.length; i++) {
				if (oData.StateID === State[i].key) {
					oData.StateDesc = State[i].Text;
				}
			}

			oData.DOB = this.formatDate(oData.DateOfBirth);
			oData.OpeningTime = this.formateTime(oData.OpeningTime);
			oData.ClosingTime = this.formateTime(oData.ClosingTime);

			var CPHeaderModel = new sap.ui.model.json.JSONModel();
			CPHeaderModel.setData(oData);
			this.getView().setModel(CPHeaderModel, "CPHeaderModel");
			this.getView().setModel(CPHeaderModel, "CPHeaderModel");

			busyDialog.close();

		},
		formatDate: function (date) {
			if (date) {
				let day = date.getDate();
				let month = date.getMonth() + 1; // Months are zero-based
				let year = date.getFullYear();
				// Add leading zeros to day and month if needed
				if (day < 10) {
					day = '0' + day;
				}
				if (month < 10) {
					month = '0' + month;
				}
				return `${day}/${month}/${year}`;
			} else {
				return null;
			}
		},
		formateTime: function (val) {
			if (val) {
				// Calculate total seconds
				var milliseconds = val.ms;
				var totalSeconds = Math.floor(milliseconds / 1000);

				// Calculate hours, minutes, and seconds
				var hours = Math.floor(totalSeconds / 3600);
				var minutes = Math.floor((totalSeconds % 3600) / 60);
				var seconds = totalSeconds % 60;

				// Format to hh:mm:ss
				var formattedTime =
					String(hours).padStart(2, '0') + ':' +
					String(minutes).padStart(2, '0') + ':' +
					String(seconds).padStart(2, '0');

				return formattedTime;
			} else {
				return null;
			}
		},
		getCurrentServerDate: function (oController, callback) {
			var oModelData = oController._oComponent.getModel("PCGW");
			oModelData.read("/Today", {
				dataType: "json",
				success: function (data) {
					if (callback) {
						callback(data.Today.Today);
					}
				},
				error: function (error) {
					if (callback) {
						MessageBox.error(oi18n.getText("SOCreate.ServerDate.CanNot.Load"), {
							styleClass: "sapUiSizeCompact"
						});
					}
				}
			});
		},
		getAggregatorsID: function () {
			var that = this;
			var sUrl = "/sap/opu/odata/ARTEC/PCGW_UTILS/CPDestination";
			var mRequestData = [{}];
			mRequestData[0].destinationName = "PCGWHANA";
			mRequestData[0].Application = "PD";
			mRequestData[0].Method = "read";
			mRequestData[0].IsTestRun = "";
			mRequestData[0].FmName = "";
			$.ajax({
				url: sUrl,
				type: "POST",
				dataType: "JSON",
				async: true,
				data: {
					destination: JSON.stringify(mRequestData)
				},
				success: function (data, textStatus, jqXHR) {
					gAggregatorID = data.destination[0].PCGWHANA.AggregatorID;
					that.getView().getModel("LocalViewSettingDt").setProperty("/AggregatorID", data.destination[0].PCGWHANA.AggregatorID);
				}
			});
		},
		getStateID: function () {
			var that = this;
			var oModel = this._oComponent.getModel("PCGWHANA");
			var ListFilters = [];
			var oItemsModel = new JSONModel();
			oItemsModel.setData([]);
			that._oComponent.setModel(oItemsModel, "States");
			oModel.read("/States", {
				filters: ListFilters,
				success: function (oData) {
					oData = oPPCCommon.formatItemsOData({
						oData: oData
					});
					var json = [{
						Key: "",
						Separator: "",
						Text: "(Select)"

					}];
					if (oData.length > 0) {
						for (var i = 0; i < oData.length; i++) {
							json.push({
								key: oData[i].StateID,
								Separator: " - ",
								Text: oData[i].State
							});
						}
						var ojsonmodel = new sap.ui.model.json.JSONModel();
						ojsonmodel.setData(json);
						that.getView().setModel(ojsonmodel, "StateModel");
					}
				},
				error: function (error) {
					BusyDialog.close();
					oPPCCommon.dialogErrorMessage(error, oUtilsI18n.getText("common.Dialog.Error.ServiceError.Header"));
				}
			});

		},
		getDistributorStatusDD: function () {
			var that = this;
			var oModel = this._oComponent.getModel("PCGWHANA");
			var ListFilters = [];
			var oItemsModel = new JSONModel();
			oItemsModel.setData([]);
			that._oComponent.setModel(oItemsModel, "ConfigTypsetTypeValues");
			ListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListFilters, "Typeset", sap.ui.model.FilterOperator
				.EQ, ["ONDBST"], false, false, false);
			oModel.read("/ConfigTypsetTypeValues", {
				filters: ListFilters,
				success: function (oData) {
					oData = oPPCCommon.formatItemsOData({
						oData: oData
					});
					var json = [];
					if (oData.length > 0) {
						for (var i = 0; i < oData.length; i++) {
							json.push({
								key: oData[i].Types,
								Text: oData[i].TypeValue
							});
						}
						var ojsonmodel = new sap.ui.model.json.JSONModel();
						ojsonmodel.setData(json);
						that.getView().setModel(ojsonmodel, "DistributorStatusDD");
					}
				},
				error: function (error) {
					BusyDialog.close();
					oPPCCommon.dialogErrorMessage(error, oUtilsI18n.getText("common.Dialog.Error.ServiceError.Header"));
				}
			});

		},
		getDistributorTypes: function () {
			var that = this;
			var oModel = this._oComponent.getModel("PCGWHANA");
			var ListFilters = [];
			var oItemsModel = new JSONModel();
			oItemsModel.setData([]);
			that._oComponent.setModel(oItemsModel, "ConfigTypsetTypeValues");
			ListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListFilters, "Typeset", sap.ui.model.FilterOperator
				.EQ, ["OBTYPE"], false, false, false);
			oModel.read("/ConfigTypsetTypeValues", {
				filters: ListFilters,
				success: function (oData) {
					oData = oPPCCommon.formatItemsOData({
						oData: oData
					});
					var json = [{
						Key: "",
						Text: "(Select)"

					}];
					if (oData.length > 0) {
						for (var i = 0; i < oData.length; i++) {
							json.push({
								key: oData[i].TypeValue,
								Text: oData[i].Typesname
							});
						}
						var ojsonmodel = new sap.ui.model.json.JSONModel();
						ojsonmodel.setData(json);
						that.getView().setModel(ojsonmodel, "OnBoardingTypeDD");

					}
				},
				error: function (error) {
					oPPCCommon.dialogErrorMessage(error, oUtilsI18n.getText("common.Dialog.Error.ServiceError.Header"));
				}
			});

		},
		getFrieghtDetails: function () {
			debugger;
			var that = this;
			var view = this.getView();
			var oModel = view.getModel("ZART_ONBOARDING");
			var LoginID = this.getCurrentUsers("FrieghtModel", "read");
			// var LoginID = "";
			oModel.setHeaders({
				"x-arteria-loginid": LoginID
			});
			var FrieghtModel = gList.getModel("ListItems").getData();
			FrieghtModel = FrieghtModel[itemindex];
			var Editable = FrieghtModel.CurrentLevel;
			if (FrieghtModel.Items.ExistingAWCode) {

				if (Editable === 1 && !(FrieghtModel.Usercomments.FrightData)) {
					that.getView().getModel("LocalViewSettingDtl").setProperty("/editable", true);
					var ItemsFilters = [];
					ItemsFilters = oPPCCommon.setODataModelReadFilter(view, "", ItemsFilters, "LoginID", sap.ui.model
						.FilterOperator
						.EQ, [LoginID], false, false, false);
					ItemsFilters = oPPCCommon.setODataModelReadFilter(view, "", ItemsFilters, "CustomerNo", sap.ui.model
						.FilterOperator
						.EQ, [FrieghtModel.Items.ExistingAWCode], false, false, false);
					oModel.read("/CustFreights", {
						filters: ItemsFilters,
						success: function (oData) {
							// oData = oPPCCommon.formatItemsOData({
							// 	oData: oData
							// });
							busyDialog.close();
							if (oData.results.length > 0) {
								// that.setItemData(oData.results);
								var oModel = new JSONModel();
								oModel.setData(oData.results);
								gDetailPageView.setModel(oModel, "FrieghtModel");
								that.getView().getModel("LocalViewSettingDtl").setProperty("/UiTableReplace", true);
								that.getView().getModel("LocalViewSettingDtl").setProperty("/tableRowCount", oData.results.length);
							} else {
								that.setNodataFound();
								that.getView().getModel("LocalViewSettingDtl").setProperty("/UiTableReplace", true);
								that.getView().getModel("LocalViewSettingDtl").setProperty("/tableRowCount", 0);
							}
							that.getView().setBusy(false);
						},
						error: function (error) {
							busyDialog.close();
							that.getView().setBusy(false);
						}
					});
				} else if (Editable === 1 && (FrieghtModel.Usercomments.FrightData)) {
					busyDialog.close();
					that.getView().getModel("LocalViewSettingDtl").setProperty("/editable", true);
					var oModel = new JSONModel();
					oModel.setData(FrieghtModel.Usercomments.FrightData);
					gDetailPageView.setModel(oModel, "FrieghtModel");
					that.getView().getModel("LocalViewSettingDtl").setProperty("/UiTableReplace", true);
					that.getView().getModel("LocalViewSettingDtl").setProperty("/tableRowCount", FrieghtModel.Usercomments.FrightData.length);
					that.getView().setBusy(false);
				} else {
					busyDialog.close();
					var oModel = new JSONModel();
					oModel.setData(FrieghtModel.Usercomments.FrightData);
					gDetailPageView.setModel(oModel, "FrieghtModel");
					that.getView().getModel("LocalViewSettingDtl").setProperty("/UiTableReplace", true);
					that.getView().getModel("LocalViewSettingDtl").setProperty("/tableRowCount", FrieghtModel.Usercomments.FrightData.length);
					that.getView().setBusy(false);
				}
			} else if (Editable === 1 && (FrieghtModel.Usercomments.FrightData)) {
				busyDialog.close();
				that.getView().getModel("LocalViewSettingDtl").setProperty("/editable", true);
				var oModel = new JSONModel();
				oModel.setData(FrieghtModel.Usercomments.FrightData);
				gDetailPageView.setModel(oModel, "FrieghtModel");
				that.getView().getModel("LocalViewSettingDtl").setProperty("/UiTableNew", true);
				that.getView().getModel("LocalViewSettingDtl").setProperty("/tableRowCount", FrieghtModel.Usercomments.FrightData.length);
			} else if (Editable != 1 && (FrieghtModel.Usercomments.FrightData)) {
				busyDialog.close();
				that.getView().getModel("LocalViewSettingDtl").setProperty("/editable", false);
				var oModel = new JSONModel();
				oModel.setData(FrieghtModel.Usercomments.FrightData);
				gDetailPageView.setModel(oModel, "FrieghtModel");
				that.getView().getModel("LocalViewSettingDtl").setProperty("/UiTableNew", true);
				that.getView().getModel("LocalViewSettingDtl").setProperty("/tableRowCount", FrieghtModel.Usercomments.FrightData.length);
			} else {
				busyDialog.close();
				var json = [{
					CustomerNo: "",
					CustomerName: "",
					CustomerCity: "",
					TruckType: "",
					CurrentFreigthRate: "",
					AdditionalCost: "",
					DerivedFreight: "",
				}];
				var oModel = new JSONModel();
				oModel.setData(json);
				gDetailPageView.setModel(oModel, "FrieghtModel");
				that.getView().getModel("LocalViewSettingDtl").setProperty("/editable", true);
				that.getView().getModel("LocalViewSettingDtl").setProperty("/tableRowCount", json.length);
				that.getView().getModel("LocalViewSettingDtl").setProperty("/UiTableNew", true);
			}
			that.getView().setBusy(false);
			if (this.getFrieghtDetails_Exit) {
				this.getFrieghtDetails_Exit();
			}
		},
		addLineItem: function () {
			var FrieghtData = {
				CustomerNo: "",
				CustomerName: "",
				CustomerCity: "",
				TruckType: "",
				CurrentFreigthRate: "",
				AdditionalCost: "",
				DerivedFreight: "",
			};
			var oData = this.getView().getModel("FrieghtModel").getData();
			oData.push(FrieghtData);
			this.getView().getModel("FrieghtModel").setProperty("/", oData);
			this.getView().getModel("LocalViewSettingDtl").setProperty("/tableRowCount", oData.length);
			// this.getView().getModel("LocalViewSettingDtCreate").setProperty("/ItemsCount", length);

		},
		onCancel: function (oEvent) {
			var path = oEvent.getSource().getBindingContext("FrieghtModel").getPath();
			var idx = parseInt(path.substring(path.lastIndexOf("/") + 1));
			var Data = this.getView().getModel("FrieghtModel");
			var model = Data.getData();
			model.splice(idx, 1);
			Data.setData(model);
			Data.refresh();
			this.getView().getModel("LocalViewSettingDtl").setProperty("/tableRowCount", model.length);
		},
		setNodataFound: function () {
			var oView = this.getView();
			if (gDetailPageView.getModel("FrieghtModel") !== undefined) {
				gDetailPageView.getModel("FrieghtModel").setProperty("/", {});
			}
			if (Device.system.desktop) {
				oView.byId("UiTable").setNoData(oUtilsI18n.getText("common.NoResultsFound"));
			} else {
				oView.byId("miTable").setNoDataText(oUtilsI18n.getText("common.NoResultsFound"));
			}
			// this.setTableTitle(0);
			if (this.setNodataFound_Exit) {
				this.setNodataFound_Exit();
			}
		},
		postEntityAttributes: function (taskId) {
			var that = this;
			var oHeader = that.PrepareEntityAttributesFilters();
			var oModel = that.getView().getModel("PCGWHANA")
			if (!gEntityGuid) {

				oModel.create("/EntityAttributes", oHeader, {
					success: function (oData) {
						// busyDialog.close();
						var oComponent = that.getOwnerComponent(); // Get the component instance
						oComponent._refreshTask(taskId);
					},
					error: function (error) {
						// busyDialog.close();
						// var msg = oPPCCommon.getMsgsFromMsgMgr();
						// oPPCCommon.removeDuplicateMsgsInMsgMgr();
						// oPPCCommon.displayMsg_MsgBox(that.getView(), msg, "error");
					}
				});
			} else {
				oModel.update("/EntityAttributes('" + gEntityGuid + "')", oHeader, {
					success: function (oData) {
						// busyDialog.close();
						var oComponent = that.getOwnerComponent(); // Get the component instance
						oComponent._refreshTask(taskId);

						// that._refreshTask(taskId);
					},
					error: function (error) {
						// busyDialog.close();
						// oPPCCommon.removeDuplicateMsgsInMsgMgr();
						// oPPCCommon.displayMsg_MsgBox(that.getView(), msg, "error");
					}
				});
			}
		},
		_refreshTask: function (taskId) {
			var startupParameters = this.getComponentData().startupParameters;
			this.getComponentData().startupParameters.inboxAPI.updateTask("NA", taskId);
		},
		PrepareEntityAttributesFilters: function () {
			var that = this;
			var CreatedOn = oPPCCommon.addHoursAndMinutesToDate({
				dDate: that.getView().getModel("LocalViewSettingDt").getProperty("/Today")
			});
			var today = that.getView().getModel("LocalViewSettingDt").getProperty("/Today");
			var CreatedAt = "PT" + today.getHours() + "H" + today.getMinutes() + "M" + today.getSeconds() + "S";
			// var CPModel = that.getView().getModel("CPModel").getProperty("/");
			var Guid = "";
			var JsonValue = gDetailPageView.getModel("FrieghtModel").getData();
			var Model = gList.getModel("ListItems").getData();
			var PartnerGuid = gPartnerGuid;
			if (gEntityGuid) {
				Guid = gEntityGuid;
			} else {
				Guid = oPPCCommon.generateUUID().toUpperCase();
			}
			var oHeader = {
				EntityAttrGUID: Guid,
				EntityKey: "FRIEGH",
				Attribute2: PartnerGuid,
				Attribute3: "",
				Attribute4: "",
				Value: JsonValue,
				Source: "Portal",
				AggregatorID: "AGGRBIL",
				CreatedBy: sLoginID,
				// CreatedOn: CreatedOn,
				// CreatedAt: CreatedAt,
				SourceReferenceID: ""
			};

			oHeader.Value = JSON.stringify(oHeader.Value);
			return oHeader;
			// return JSON.stringify(oHeader, null, 2);
		},
		setDefaultSettings1: function () {
			var oViewSettingModel = new sap.ui.model.json.JSONModel();
			var viewSettingData = {
				tableRowCount: 0,
				editMode: false,
				detailMode: true,
				showCancelBtn: false,
				showEditBtn: true,
				messageLength: 0,
				UiTableCount: 0,
				editable: false,
				UiTableReplace: false,
				UiTableNew: false,
				messageLength: 0,
				visibleRowCount: 0,
				navBackbtn: false,
				visiblePartnerTable: false,
				visibleOnbrdTpyeReplace: false,
				visibleOnbrdTpyeOthers: false,
				Question: "",
				UploadQuestionCount: 0,
				PartnersCount: 0,
				EditMode: false,
				ReviewMode: false,
				ClientID: "",
				ClientSecret: "",
				APIKey: "",
				PANAPIKey: "",
				InfreaSelected: false,
				InfreaSelectedValueState: "None",
				BusinessType: false,
				BusinessTypeText: "",
				BusinessTypeValue: "",
				Today: "",
				CertificatesCount: 0,
				showHTMLContent: false,
				showNormalContent: false,
				showUpdateContent: false,
				CPInfraQuestionCount: 0,
				visibleTDSGreater: false,
				visibleTDSLess: false,
				DocumentsCount: 0,
				visibleDeduted: false,
				visibleTAN: false,
				RadioButton: false,
				RadioButton1: false,
				RadioButton2: false,
				ITRDocumentsCount: 0,
				FSSAIDocumentsCount: 0,
				PANDocumentsCount: 0,
				visibleODAmount: false,
				BankDocumentsCount: 0,
				GSTDocumentsCount: 0,
				MaxDate: null,
				MinDate: null,
				PartnerEdit: true,
				finalWeekText: "",
				GstVerified: false,
				PanVerified: false,
				FSSAIVerified: false,
				AccountVerified: false,
				SaleDistrict: "",
				DraftSave: false,
				StatusID: "",
				ApprovalStatus: "",
				SavedMode: false,
				showStatus: false,
				OTPPage: false,
				DetailPage: false,
				OTPInput: false,
				OTPButton: true,
				OTP: "",
				FssaiDetail: false,
				PanDetail: false,
				GstDeatil: false,
				BankDeatil: false,
				URL1: "",
				Idno1: "",
				Idno2: "",
				ClearButton: false,
				Editable: false
			};
			oViewSettingModel.setData(viewSettingData);
			this.getView().setModel(oViewSettingModel, "LocalViewSettingDtl");

		},
		onChangeProposedFrieght: function (oEvent) {
			var oModelContext = oEvent.getSource().getBindingContext("FrieghtModel");
			var FrieghtModel = this.getView().getModel("FrieghtModel").getData();
			var idx = parseInt(oModelContext.getPath().split("/")[1]);
			var ProposedFrieght = FrieghtModel[idx].ProposedFrieght;
			if (ProposedFrieght) {
				var DerivedFreight = FrieghtModel[idx].DerivedFreight;
				var ProposedFrieght = FrieghtModel[idx].ProposedFrieght
				FrieghtModel[idx].Gap = (ProposedFrieght - DerivedFreight).toFixed(2);
				var Percentage = (FrieghtModel[idx].Gap / DerivedFreight) * 100;
				FrieghtModel[idx].GapPercentage = Percentage.toFixed(2) + " %";
				if (FrieghtModel[idx].GapPercentage === "0.00 %") {
					gFrieght = true;
				}
				this.getView().getModel("FrieghtModel").setData(FrieghtModel);
			} else {
				FrieghtModel[idx].Gap = ""
				FrieghtModel[idx].GapPercentage = ""
				this.getView().getModel("FrieghtModel").setData(FrieghtModel);
			}
		},
		getCurrentUsers: function (sServiceName, sRequestType) {
			var sLoginID = this.getCurrentLoggedUser({
				sServiceName: sServiceName,
				sRequestType: sRequestType
			});
			return sLoginID;
		},
		getCurrentLoggedUser: function (mParameter, callBack) {
			var that = this;
			var bASync = false;
			if (callBack) {
				bASync = true;
			}
			var sLoginID = "";
			var href = window.location.href;
			if (!(location.href.indexOf("testService.html") > -1)) {
				var mRequestData = {};
				mRequestData.destname = "pugw_utils_op";
				mParameter.Application = "PD";

				if (mParameter.Application != "" && mParameter.Application != null && mParameter.Application != undefined) {
					mRequestData.Application = mParameter.Application;
				} else {
					mRequestData.Application = "PD";
				}
				if (mParameter.sServiceName != "" && mParameter.sServiceName != null && mParameter.sServiceName != undefined) {
					mRequestData.Object = mParameter.sServiceName + "_" + (Math.random().toFixed(2) * 100).toFixed(0);
				} else {
					mRequestData.Object = "";
				}
				if (mParameter.sRequestType != "" && mParameter.sRequestType != null && mParameter.sRequestType != undefined) {
					mRequestData.Method = mParameter.sRequestType;
				} else {
					mRequestData.Method = "";
				}
				if (mParameter.FmName != "" && mParameter.FmName != null && mParameter.FmName != undefined) {
					mRequestData.FmName = mParameter.FmName;
				} else {
					mRequestData.FmName = "";
				}
				if (mParameter.IsTestRun != "" && mParameter.IsTestRun != null && mParameter.IsTestRun != undefined) {
					mRequestData.IsTestRun = mParameter.IsTestRun;
				} else {
					mRequestData.IsTestRun = "";
				}
				var LoginIDURL = this.getFeatureValue({
					isProduct: true,
					Types: "LOGINIDURL"
				});
				if (LoginIDURL !== undefined && LoginIDURL !== "") {
					LoginIDURL = LoginIDURL;
					var sUrl = LoginIDURL + "GetLoginID/";
					//Call the ajax to get the logged id.
					$.ajax({
						url: sUrl,
						jsonpCallback: "getJSON",
						contentType: "text/plain",
						async: bASync,
						data: mRequestData,
						success: function (data, textStatus, jqXHR) {
							if (data.Error != "" && data.Error != null && data.Error != undefined) {
								//alert("LoginID Error: "+data.Error);
								that.showServiceErrorPopup({
									statusCode: "404",
									statusText: "User Session Not Found",
									responseText: data.Error
								});
							} else {
								sLoginID = data.UserSession;
							}
							if (callBack) {
								callBack(sLoginID);
							}
						},
						error: function (xhr, status, e) {
							sLoginID = "";

							if (e !== "Forbidden") {
								setTimeout(function () {
									sap.m.MessageToast.show("Your session has expired, please login again");
								}, 5);
								setTimeout(function () {
									var URLOrigin = window.location.origin;
									var URLPathname = window.location.pathname;
									var URLSearch = "";
									if (window.location.search) {
										URLSearch = window.location.search;
										URLSearch.replace("?undefined", "");
									}
									var logoutPageURL = URLOrigin + "/logout/logoff.html?returnUrl=" + URLPathname + URLSearch;
									window.open(logoutPageURL, "_self");
								}, 500);

							} else {
								if (callBack) {
									callBack(sLoginID);
								}
							}
						}
					});
				} else {
					sLoginID = "";
					if (callBack) {
						callBack(sLoginID);
					}
				}
			}
			return sLoginID;
		},
		getFeatureValue: function (mParameter) {
			var sTypeValue = "";
			//check is product type or app type
			if (mParameter.isProduct) {
				//handle prioduct type value
				//check product features is available gloablly or not
				if (sap.ui.getCore().getModel("ProductFeatures")) {
					//get product global model
					var oProductFeaturesModel = sap.ui.getCore().getModel("ProductFeatures");
					var aData = oProductFeaturesModel.oData;
					for (var i = 0; i < aData.length; i++) {
						//fetch the typevalue by checking the types input
						if (aData[i].Types === mParameter.Types) {
							sTypeValue = aData[i].TypeValue;
							break;
						}
					} //end of for loop
				} else

				{
					sTypeValue = "/sap/opu/odata/ARTEC/PCGW_UTILS/";
				}
				//end of global model if condition
			} else {
				//handle app type value
				//check app features is available gloablly or not
				if (sap.ui.getCore().getModel("AppFeatures")) {
					//get app global model
					var oAppFeaturesModel = sap.ui.getCore().getModel("AppFeatures");
					var aData = oAppFeaturesModel.oData;
					for (var i = 0; i < aData.length; i++) {
						//fetch the typevalue by checking the typeset & types input
						if (aData[i].Typeset === mParameter.Typeset && aData[i].Types === mParameter.Types) {
							sTypeValue = aData[i].TypeValue;
							break;
						}
					} //end of for loop
				} //end of global model if condition

			}
			//end of is product if check condition
			return sTypeValue;
		},
		onApprove: function () {
			var that = this;
			this.getView().getModel("LocalViewSettingDt").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
				.getData()
				.length);
			oPPCCommon.hideMessagePopover();
			// that.validateData();
			if (oPPCCommon.doErrMessageExist()) {
				that.onApproveButton()
			} else {
				this.getView().getModel("LocalViewSettingDt").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
					.getData()
					.length);
				oPPCCommon.showMessagePopover(gListView);
			}
		},
		validateData: function () {
			var Data = this.getView().getModel("FrieghtModel").getData();
			for (var i = 0; i < Data.length; i++) {
				if (!Data[i].AWDistance) {
					Data[i].AWDistanceState = "Error";
					oPPCCommon.addMsg_MsgMgr("Please Enter Existing AW Distance in item " + (parseInt(i) + 1));
				} else {
					Data[i].AWDistanceState = "None";
				}
				if (!Data[i].ProposedDistance) {
					Data[i].ProposedDistanceState = "Error";
					oPPCCommon.addMsg_MsgMgr("Please Enter Proposed Distance in item " + (parseInt(i) + 1));
				} else {
					Data[i].ProposedDistanceState = "None";
				}
				if (!Data[i].ProposedFrieght) {
					Data[i].ProposedFrieghtState = "Error";
					oPPCCommon.addMsg_MsgMgr("Please Enter Proposed Frieght in item " + (parseInt(i) + 1));
				} else {
					Data[i].ProposedDistanceState = "None";
				}
				if (!Data[i].UnloadingCharges) {
					Data[i].UnloadingChargesState = "Error";
					oPPCCommon.addMsg_MsgMgr("Please Enter Unloading Charges in item " + (parseInt(i) + 1));
				} else {
					Data[i].UnloadingChargesState = "None";
				}
			}
			this.getView().getModel("FrieghtModel").setData(Data);
		},
		onApproveButton: function () {

			var that = this;
			// var oItem;
			// var oItem = that.getModel("CustomerItemData").getProperty("/");

			var dialog = new sap.m.Dialog({

				title: 'Approve',
				type: 'Message',
				contentWidth: "40%",
				content: [
					new sap.m.Label({
						text: 'Comments',
						labelFor: 'submitDialogTextarea'

					}),
					new sap.m.TextArea('submitDialogTextarea', {
						width: '100%',
						placeholder: 'Add comment (required)',
						maxLength: 250
					})
				],

				beginButton: new sap.m.Button({
					text: 'OK',
					press: function () {

						var sComments = sap.ui.getCore().byId('submitDialogTextarea').getValue();
						if (sComments) {
							that._completeTask("01", sComments);
							dialog.close();
						} else {
							sap.m.MessageBox.error(
								"Please Enter UserCommand", {
									styleClass: "sapUiSizeCompact"
								}
							);
						}

					}
				}),
				endButton: new sap.m.Button({
					text: 'Close',
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

		onReject: function () {
			var that = this;
			// var LoginID = sap.ushell.Container.getService("UserInfo");
			// var rLoginID = LoginID.getId();
			// var sLoginID = rLoginID.toUpperCase();
			// oItem = that.getModel("CustomerItemData").getProperty("/");

			var dialog = new sap.m.Dialog({
				title: 'Reject',
				type: 'Message',
				contentWidth: "40%",
				content: [
					new sap.m.Label({
						text: 'Comments',
						labelFor: 'submitDialogTextarea1'
					}),
					new sap.m.TextArea('submitDialogTextarea1', {
						width: '100%',
						placeholder: 'Add comment (required)',
						maxLength: 250
					})
				],
				beginButton: new sap.m.Button({
					text: 'OK',
					press: function () {
						// input comment
						var sComments = sap.ui.getCore().byId('submitDialogTextarea1').getValue();
						// oItem.COMMENTS = {};
						// oItem.COMMENTS.USERCOMMENTS = sComments;
						// that.getModel("CustomerItemData").setProperty("/Usercomments/Comments", sComments);
						if (sComments) {
							that._completeTask("02", sComments);
							dialog.close();
						} else {
							sap.m.MessageBox.error(
								"Please Enter UserCommand", {
									styleClass: "sapUiSizeCompact"
								}
							);
						}
					}
				}),
				endButton: new sap.m.Button({
					text: 'Close',
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
		_completeTask: function (DecisionKey, sComments, apprRoleid) {
			var items = gList.getModel("ListItems").getProperty("/");
			// for (var i = 0; i < items.length; i++) {
			// 	if (items[i].selectedItem) {
			this.confirmTask(items[itemindex], DecisionKey, sComments, apprRoleid);
			// }
			// }
		},
		confirmTask: function (iItem, DecisionKeys, sComments, apprRoleid1) {
			var taskId = iItem.InstanceID
			var Data = "";
			var ApproverData = [];

			var today = new Date();
			var dd = today.getDate();
			var mm = today.getMonth() + 1; //January is 0!
			var yyyy = today.getFullYear();
			var hour = today.getHours();
			var Minutes = today.getMinutes();
			var Seconds = today.getSeconds();
			var today1 = (dd + '.' + mm + '.' + yyyy + ' ' + hour + ':' + Minutes + ':' + Seconds);

			var commentUserAction = DecisionKeys;
			var commentUserAction1 = "";
			if (commentUserAction === "01") {
				commentUserAction1 = "03";
			} else {
				commentUserAction1 = "04";
			}
			var Data = gDetailPageView.getModel("FrieghtModel").getData();
			var loginId = iItem.CurrentApprover[0].apprUserid;

			var token = this._fetchToken();
			iItem.STATUS = "COMPLETED";

			var that = this;
			var Approver = gList.getModel("ListItems").getData()[itemindex].Approvers;
			var data = JSON.stringify({
				status: "COMPLETED",
				context: {
					Usercomments: {
						LoginID: loginId,
						Comments: sComments,
						StatusID: commentUserAction1,
						DecisionKey: commentUserAction,
						FrightData: Data // Directly use the Data array here
					}
				}
			});
			if (gFrieght) {
				Approver = Approver.slice(0, 2);
				var data = JSON.stringify({
					status: "COMPLETED",
					context: {
						Approvers: Approver,
						Usercomments: {
							LoginID: loginId,
							Comments: sComments,
							StatusID: commentUserAction1,
							DecisionKey: commentUserAction,
							FrightData: Data // Directly use the Data array here
						}
					}
				});
			}

			$.ajax({
				url: "/bpmworkflowruntime/rest/v1/task-instances/" + taskId,
				method: "PATCH",
				contentType: "application/json",
				data: data,
				headers: {
					"X-CSRF-Token": token
				},
				success: function (data, textStatus, jqXHR) {
					that.postEntityAttributes(taskId);
				}
			});

			// });

		},

		postEntityAttributes: function (taskId) {
			var that = this;
			var oHeader = that.PrepareEntityAttributesFilters();
			var oModel = that.getView().getModel("PCGWHANA")
			if (!gEntityGuid) {

				oModel.create("/EntityAttributes", oHeader, {
					success: function (oData) {

						that._refreshTask(taskId);
					},
					error: function (error) {
						// busyDialog.close();
						// var msg = oPPCCommon.getMsgsFromMsgMgr();
						// oPPCCommon.removeDuplicateMsgsInMsgMgr();
						// oPPCCommon.displayMsg_MsgBox(that.getView(), msg, "error");
					}
				});
			} else {
				oModel.update("/EntityAttributes('" + gEntityGuid + "')", oHeader, {
					success: function (oData) {

						that._refreshTask(taskId);
					},
					error: function (error) {
						// busyDialog.close();
						// oPPCCommon.removeDuplicateMsgsInMsgMgr();
						// oPPCCommon.displayMsg_MsgBox(that.getView(), msg, "error");
					}
				});
			}
		},
		_refreshTask: function () {
			// setTimeout(function () {
			sap.m.MessageToast.show("Updated");
			window.history.go(-1);
			// }, 4000);
		},
		_fetchToken: function () {
			var token;
			$.ajax({
				url: "/bpmworkflowruntime/rest/v1/xsrf-token",
				method: "GET",
				async: false,
				headers: {
					"X-CSRF-Token": "Fetch"
				},
				success: function (result, xhr, data) {
					token = data.getResponseHeader("X-CSRF-Token");
				}
			});
			return token;
		},
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.arteriatech.ssfrieghtlist.view.DetailPage
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.arteriatech.ssfrieghtlist.view.DetailPage
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.arteriatech.ssfrieghtlist.view.DetailPage
		 */
		//	onExit: function() {
		//
		//	}

	});

});
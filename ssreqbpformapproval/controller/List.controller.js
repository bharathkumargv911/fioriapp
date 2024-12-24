sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/arteriatech/ppc/utils/js/Common",
	"com/arteriatech/ss/utils/js/Common",
	"com/arteriatech/ss/utils/js/UserMapping",
	"com/arteriatech/ss/utils/js/CommonValueHelp",
	"sap/ui/model/json/JSONModel"
], function (Controller, oPPCCommon, oSSCommon, oSSUserMapping, oSSCommonValueHelp, JSONModel) {
	"use strict";
	var busyDialog = new sap.m.BusyDialog();
	var obusyDialog = new sap.m.BusyDialog();
	var oi18n = "",
		oUtilsI18n = "";
	var Device = sap.ui.Device;
	var Pusers;

	var taskData = [];
	var count = 0;
	var count1 = 0;

	return Controller.extend("com.arteriatech.ssreqbpformapproval.controller.List", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.arteriatech.ssreqbpformapproval.view.List
		 */
		onInit: function () {
			this.onInitHookUp();
		},
		onInitHookUp: function () {
			gList = this.getView();
			this._oView = this.getView();
			oPPCCommon.initMsgMangerObjects();
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this._oView));
			oi18n = this._oComponent.getModel("i18n").getResourceBundle();
			oUtilsI18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.attachRouteMatched(this.onRouteMatched, this);

		},
		onRouteMatched: function (oEvent) {
			var that = this;
			if (oEvent.getParameter("name") !== "List" && oEvent.getParameter("name") !== "ListPage") {
				return;
			}
			this.setDefaultSettings();
			this.setOnBoardingStatusDD();
			this.setOnBoardingApprovalStatusDD();
			// this.getCreatedOnDateDDValues();
			if (oPPCCommon.getFLPTileAction().split("&")[0] === "ApprovalView") {
			// if (true) {
				this.getTaskCollections();
				this.getView().getModel("LocalViewSetting").setProperty("/ApprovalView", true);
				this.getView().getModel("LocalViewSetting").setProperty("/ListView", false);
			} else {
				this.getCreatedOnDateDDValues();
				this.getView().getModel("LocalViewSetting").setProperty("/ApprovalView", false);
				this.getView().getModel("LocalViewSetting").setProperty("/ListView", true);
			}

		},
		setDefaultSettings: function () {

			var data = {
				tableCount: 0,
				ApprovalView: false,
				ListView: true,
				ItemsCount: 0,
				StatusID: ""
			};
			var model = new sap.ui.model.json.JSONModel(data);
			this.getView().setModel(model, "LocalViewSetting");
		},

		setOnBoardingStatusDD: function () {
			var that = this;
			var oModel = this._oComponent.getModel("PCGWHANA");
			var ListFilters = [];
			var oItemsModel = new JSONModel();
			oItemsModel.setData([]);
			that._oComponent.setModel(oItemsModel, "ConfigTypsetTypeValues");
			ListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListFilters, "Typeset", sap.ui.model.FilterOperator
				.EQ, ["ONSTAS"], false, false, false);
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
								Key: oData[i].TypeValue,
								Text: oData[i].Typesname,
								Seperator: " - "
							});
						}
						var ojsonmodel = new sap.ui.model.json.JSONModel();
						ojsonmodel.setData(json);
						that.getView().setModel(ojsonmodel, "StatusDD");
					}
				},
				error: function (error) {
					BusyDialog.close();
					oPPCCommon.dialogErrorMessage(error, oUtilsI18n.getText("common.Dialog.Error.ServiceError.Header"));
				}
			});

		},
		setOnBoardingApprovalStatusDD: function () {
			var that = this;
			var oModel = this._oComponent.getModel("PCGWHANA");
			var ListFilters = [];
			var oItemsModel = new JSONModel();
			oItemsModel.setData([]);
			that._oComponent.setModel(oItemsModel, "ConfigTypsetTypeValues");
			ListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListFilters, "Typeset", sap.ui.model.FilterOperator
				.EQ, ["ONAPST"], false, false, false);
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
								Key: oData[i].TypeValue,
								Text: oData[i].Typesname,
								Seperator: " - "
							});
						}
						var ojsonmodel = new sap.ui.model.json.JSONModel();
						ojsonmodel.setData(json);
						that.getView().setModel(ojsonmodel, "ApprovalStatusDD");
					}
				},
				error: function (error) {
					BusyDialog.close();
					oPPCCommon.dialogErrorMessage(error, oUtilsI18n.getText("common.Dialog.Error.ServiceError.Header"));
				}
			});

		},

		getTaskCollections: function (callback) {

			// oPPCCommon.removeAllMsgs();
			var that = this;
			busyDialog.open();
			// var aFilters = [];
			taskData = [];
			count = 0;
			count1 = 0;
			// isValidCount = 0; //for approve validation
			// approveFlag = true; //for approve validation
			// instancrArr = []; //for approve validation
			var oDataModel = that._oComponent.getModel("tcm");

			// aFilters = oPPCCommon.setODataModelReadFilter(this.getView, "", aFilters, "Status", sap.ui.model.FilterOperator
			// 	.EQ, ["Ready"], false, false, false);
			// aFilters = oPPCCommon.setODataModelReadFilter(this.getView, "", aFilters, "Status", sap.ui.model.FilterOperator
			// 	.EQ, ["RESERVED"], false, false, false);
			// aFilters = oPPCCommon.setODataModelReadFilter(this.getView, "", aFilters, "Status", sap.ui.model.FilterOperator
			// 	.EQ, ["IN_PROGRESS"], false, false, false);
			// aFilters = oPPCCommon.setODataModelReadFilter(this.getView, "", aFilters, "Status", sap.ui.model.FilterOperator
			// 	.EQ, ["EXECUTED"], false, false, false);
			// aFilters = oPPCCommon.setODataModelReadFilter(this.getView, "", aFilters, "Status", sap.ui.model.FilterOperator
			// 	.EQ, ["RUNNING"], false, false, false);

			oDataModel.read("/TaskCollection", {
				// filters: aFilters,
				success: function (oData) {
					var VData = oData.results;
					var aData = [];
					for (var z = 0; z < VData.length; z++) {
						if (VData[z].TaskDefinitionName === "BP Onboarding Approve") {
							aData.push(VData[z]);
						}
					}
					var oComparisionsModel = new JSONModel();
					if (aData.length > 0) {
						for (var i = 0; i < aData.length; i++) {
							aData[i].CreatedTime = that.Time(aData[i].CreatedOn);
							aData[i].CreatedOnDate = aData[i].CreatedOn.getFullYear() + "-" + (aData[i].CreatedOn.getMonth() + 1) + "-" + aData[i].CreatedOn
								.getDate();
						}
						aData.sort(function (a, b) {
							return new Date(b.CreatedOnDate + " " + b.CreatedTime) - new Date(a.CreatedOnDate + " " + a.CreatedTime);
						});
						oComparisionsModel.setData(aData);
						/** Set Model to the view */

						that.getView().setModel(oComparisionsModel, "TasksModel");
						count = aData.length;
						for (var j = 0; j < aData.length; j++) {
							that.getDescisionTasks(aData[j].InstanceID);
						}

						if (callback) {
							callback();
						}
						that.getView().setBusy(false);

					} else {
						oComparisionsModel.setData([]);
						that.getView().setModel(oComparisionsModel, "TasksModel");
						that.getView().setModel(oComparisionsModel, "ListItems");
						that.getView().setBusy(false);
						busyDialog.close();
						if (callback) {
							callback();
						}
					}

				},
				error: function (error) {
					// oDialog.close();
					busyDialog.close();
					that.getView().setBusy(false);
					// that.closeBusyDialog();

				}
			});
		},

		getDescisionTasks: function (InstanceID) {
			var taskId;
			var that = this;
			// that.getView().setBusy(true);

			taskId = InstanceID;

			var contextModel = new sap.ui.model.json.JSONModel("/bpmworkflowruntime/rest/v1/task-instances/" + taskId + "/context");
			contextModel.attachRequestCompleted(function (oEvent) {
				contextModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
				var oTasksModel = new sap.ui.model.json.JSONModel();
				contextModel.oData.InstanceID = taskId;
				oTasksModel.setData(contextModel.oData);
				count1 = count1 + 1;
				taskData.push(contextModel.oData);
				if (count1 === count) {
					that.setListData();
				}
				// that.setBPReqModel(contextModel.oData.ChannelPartners[0].StateID);

				this.getView().setModel(oTasksModel, "TaskInstances");
				// that.setDeliveryData(contextModel.oData.deliveryDetails);

				// that.getUserProfiles();
				// that.setBPReqsData(contextModel.oData);

				// that.getView().setBusy(false);

			}, this);

		},

		setListData: function () {
			var tempArr = [];
			for (var i = 0; i < taskData.length; i++) {

				var taskTitle = "Approve OnBording for " + taskData[i].header.CPName + " (" + taskData[i].header.CPNo + ")";

				taskData[i].taskTitle = taskTitle;

				// var obj = {
				// 	"taskTitle": taskTitle,
				// 	"EntityType": taskData[i].EntityType,
				// 	"instanceGuid": taskData[i].instanceGuid,
				// 	"EntityTypeDesc": taskData[i].EntityTypeDesc,
				// 	"InstanceID": taskData[i].InstanceID,
				// 	"StatusID": taskData[i].StatusID
				// };
				tempArr.push(taskData[i]);
				contextData.push(taskData[i]);
			}
			var oDataModel = new sap.ui.model.json.JSONModel();
			oDataModel.setData(tempArr);
			gList.setModel(oDataModel, "ListItems");

			busyDialog.close();
			this.getView().getModel("LocalViewSetting").setProperty("/tableCount", tempArr.length);
			// if (tempArr.length < 10) {
			// 	this.getView().getModel("LocalViewSetting").setProperty("/tableCount", tempArr.length);
			// } else {
			// 	this.getView().getModel("LocalViewSetting").setProperty("/tableCount", 10);
			// }

		},
		Time: function (fValue) {
			if (fValue) {
				var date = new Date(fValue);
				var timeinmiliseconds = date.getTime();
				var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({
					pattern: "HH:mm:ss"
				});
				var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;
				var timeStr = timeFormat.format(new Date(timeinmiliseconds + TZOffsetMs));
				return timeStr;
			} else {
				return fValue;
			}
		},
		onSearch: function () {
			var that = this;
			oPPCCommon.removeAllMsgs();
			if (oPPCCommon.doErrMessageExist()) {
				// that.getCheckList();
				// that.onSave()
				that.getfromData();
			} else {
				oPPCCommon.displayMsg_MsgBox(this.getView(), oPPCCommon.getMsgsFromMsgMgr(), "error");
			}
		},

		getfromData: function () {
			var that = this;
			var SSGWModel = this.getView().getModel("SSGWHANA");
			busyDialog.open();
			var oFilters = new Array();
			oFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", oFilters, "CHANGE_HISTORY.CREATEDON", sap.ui.model.FilterOperator
				.BT, [
					this.CreateOn.FromDate, this.CreateOn.ToDate
				], false, false, false);

			var StatusID = that.getView().byId("StatusID").getSelectedKeys();

			for (var i = 0; i < StatusID.length; i++) {
				oFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", oFilters, "STATUS", sap.ui.model.FilterOperator
					.EQ, [
						StatusID[i]
					], false, false, false);
			}

			var ApprovalStatus = that.getView().byId("ApprovalStatusID").getSelectedKeys();

			for (var i = 0; i < ApprovalStatus.length; i++) {

				oFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", oFilters, "APPRVL_STATUS", sap.ui.model.FilterOperator
					.EQ, [
						ApprovalStatus[i]
					], false, false, false);
			}

			SSGWModel.read("/SS_CP", {
				filters: oFilters,
				success: function (oData) {
					that.setTableData(oData.results);
					busyDialog.close();
				},
				error: function (error) {
					// that.setNodataFound();
					busyDialog.close();
					oPPCCommon.dialogErrorMessage(error, oUtilsI18n.getText("common.Dialog.Error.ServiceError.Header"));
					// that.getView().setBusy(false);
				}
			});
		},
		setTableData: function (oData) {
			var that = this;

			var StatusDD = this.getView().getModel("StatusDD").getData();
			var ApprovalStatusDD = this.getView().getModel("ApprovalStatusDD").getData();

			var model = new sap.ui.model.json.JSONModel();
			model.setData(oData);
			that.getView().setModel(model, "CPModels");

			that.getView().getModel("LocalViewSetting").setProperty("/ItemsCount", oData.length);

		},
		gotoDetails1: function (oEvent) {
			var path = "";
			var oModelContext = oEvent.getSource().getBindingContext("CPModels");

			if (oModelContext.getProperty("CP_GUID")) {
				if (oModelContext.getProperty("CP_GUID") !== undefined && oModelContext.getProperty("CP_GUID") !== "" && oModelContext.getProperty(
						"CP_GUID") !== null) {
					path = "ChannelPartners(CP_GUID=guid'" + oModelContext.getProperty("CP_GUID") + "')";
					this._oRouter.navTo("DetailPage", {
						contextPath: path
					}, false);
				} else {
					var msg = "CP_GUID is Undefined";
					oPPCCommon.displayMsg_MsgBox(this.getView(), msg, "error");
					return;
				}
			} else {
				var msg = "CP_GUID is Undefined";
				oPPCCommon.displayMsg_MsgBox(this.getView(), msg, "error");
				return;
			}

			if (this.gotoDetails_Exit) {
				this.gotoDetails_Exit(oEvent);
			}
		},
		gotoDetails: function (oEvent) {
			var path = "";
			var oModelContext = oEvent.getSource().getBindingContext("ListItems");
			var path = oEvent.getSource().getBindingContext("ListItems").getPath();
			var idx = parseInt(path.substring(path.lastIndexOf("/") + 1), 10);
			gList.setBusy(true);
			if (oModelContext.getProperty("header/CPGUID")) {
				if (oModelContext.getProperty("header/CPGUID") !== undefined && oModelContext.getProperty("header/CPGUID") !== "" && oModelContext
					.getProperty(
						"header/CPGUID") !== null) {
					path = "ChannelPartners(CP_GUID=guid'" + oModelContext.getProperty("header/CPGUID") + "'),index=" + idx + "";
					this._oRouter.navTo("DetailPage", {
						contextPath: path
					}, false);
				} else {
					var msg = "CP_GUID is Undefined";
					oPPCCommon.displayMsg_MsgBox(this.getView(), msg, "error");
					return;
				}
			} else {
				var msg = "CP_GUID is Undefined";
				oPPCCommon.displayMsg_MsgBox(this.getView(), msg, "error");
				return;
			}

			if (this.gotoDetails_Exit) {
				this.gotoDetails_Exit(oEvent);
			}
		},

		getDateDDValues: function () {

			var sDateRange = oSSCommon.getProductFeatureValue({
				Types: "DTRNGCHK"
			});
			this.SODateDifference = sDateRange;
			this.PreviousSelectedKeySODate = this.SODateDifference;
			var oneMonthBackDate = oPPCCommon.getCurrentDate();
			oneMonthBackDate.setDate(oneMonthBackDate.getDate() + parseInt(this.SODateDifference));
			this.SODate = {
				FromDate: oneMonthBackDate,
				ToDate: oPPCCommon.getCurrentDate()
			};
			/*for SO Date*/
			if (this.getView().getModel("SODateViewSetting")) {
				this.getView().getModel("SODateViewSetting").setProperty("/", {});
			}
			var oDataDate = [{
				DateKey: "",
				DateDesc: "Any"
			}, {
				DateKey: "0",
				DateDesc: "Today"
			}, {
				DateKey: "-1",
				DateDesc: "Today and Yesterday"
			}, {
				DateKey: "-7",
				DateDesc: "Last Seven Days"
			}, {
				DateKey: "-30",
				DateDesc: "Last One Month"
			}, {
				DateKey: "MS",
				DateDesc: "Manual Selection"
			}];
			oPPCCommon.getDateDropDownValue(oDataDate, this, "inputSODate", "SODateViewSetting", this.SODateDifference);
		},

		onSODateSelectionChanged: function (oEvent) {
			var that = this;
			var oDateSelect = oEvent.getSource();
			var sSelectedKey = oEvent.getParameter("selectedItem").getKey();
			oSSCommon.openManualDateSelectionDialog(this, sSelectedKey, oDateSelect, this.PreviousSelectedKeySODate, "SODateViewSetting",
				oi18n,
				"inputSODate",
				function (date) {
					that.SODate.FromDate = date.fromDate;
					that.SODate.ToDate = date.toDate;
				});
			this.PreviousSelectedKeySODate = oEvent.getParameter("selectedItem").getKey();
			if (oEvent.getParameter("selectedItem").getKey() !== "MS") {
				this.PreviousSelectedKeySODate = oEvent.getParameter("selectedItem").getKey();
			}
		},

		//Date Selection
		handleChange: function (oEvent) {
			var dateVal = oEvent.getSource().getDateValue();
			this.getView().getModel("LocalViewSetting").setProperty("/dateV", dateVal);
		},
		handleChange1: function (oEvent) {
			var dateVal1 = oEvent.getSource().getDateValue();
			var fromdate = this.getView().getModel("LocalViewSetting").getProperty("/dateV");
			if (fromdate === undefined || fromdate === null || fromdate == "") {
				sap.m.MessageBox.error(
					"Please select the From Date", {
						styleClass: "sapUiSizeCompact"
					}
				);
				oEvent.getSource().setDateValue();
				return;
			}
			this.getView().getModel("LocalViewSetting").setProperty("/dateT", dateVal1);
		},

		//Export To Excel
		exportToExcel1: function (oEvent) {
			var that = this;
			var table = that.getView().byId("mTable");
			var oModel = that.getView().getModel("CPModels");
			var sfileName = "FromReport";
			oPPCCommon.exportToExcel(table, oModel, {
				bExportAll: false,
				oController: that,
				bLabelFromMetadata: false,
				sModel: "PCGWHANA",
				sEntityType: "SS_CP",
				oUtilsI18n: that.oUtilsI18n,
				sFileName: sfileName
			});
		},
		onSave: function () {

			var data = {
				ChannelPartner4GUID: oPPCCommon.generateUUID(),
				ChannelPartnerGUID: "83453e31-8b3e-48f3-9b4e-87258cac7497",
				AggregatorID: "AGGRBIL",
				Name: "Chris",
				Business: "284193945673",
				MobileNo: "9345475076"
					// CreatedBy:
					// CreatedAt:
					// CreatedOn:
			}
			var oModel = this.getView().getModel("SSGWHANA");
			// var oHeader = this.prepareHeader();
			oModel.create("/CPReferences", data, {
				success: function (oData) {
					console.log(oData);
					// that.SurveyResultItem(odata.SurveyResultGUID);

				},
				error: function (error) {
					oBusyDialog.close();
					oPPCCommon.removeDuplicateMsgsInMsgMgr();
					that.getView().getModel("LocalViewSettingDtl").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
						.getData().length);
					oPPCCommon.showMessagePopover(gPsctVendrView);
				}
			});

		},

		getCreatedOnDateDDValues: function () {
			var sDateRange = oSSCommon.getProductFeatureValue({
				Types: "DTRNGCHK"
			});
			this.SODateDifference = sDateRange;
			this.PreviousSelectedKeySODate = this.SODateDifference;
			var oneMonthBackDate = oPPCCommon.getCurrentDate();
			oneMonthBackDate.setDate(oneMonthBackDate.getDate() + parseInt(this.SODateDifference));
			this.CreateOn = {
				FromDate: oneMonthBackDate,
				ToDate: oPPCCommon.getCurrentDate()
			};
			/*for SO Date*/
			if (this.getView().getModel("SOCreatedOnDateViewSetting")) {
				this.getView().getModel("SOCreatedOnDateViewSetting").setProperty("/", {});
			}
			var oDataDate = [{
				DateKey: "",
				DateDesc: "Any"
			}, {
				DateKey: "0",
				DateDesc: "Today"
			}, {
				DateKey: "-1",
				DateDesc: "Today and Yesterday"
			}, {
				DateKey: "-7",
				DateDesc: "Last Seven Days"
			}, {
				DateKey: "-30",
				DateDesc: "Last One Month"
			}, {
				DateKey: "MS",
				DateDesc: "Manual Selection"
			}];
			oPPCCommon.getDateDropDownValue(oDataDate, this, "inputCreatedOnDate", "SOCreatedOnDateViewSetting", this.SODateDifference);
		},

		onCreateOnDateSelectionChanged: function (oEvent) {
			var that = this;
			var oDateSelect = oEvent.getSource();
			var sSelectedKey = oEvent.getParameter("selectedItem").getKey();
			oSSCommon.openManualDateSelectionDialog(this, sSelectedKey, oDateSelect, this.PreviousSelectedKeySODate,
				"SOCreatedOnDateViewSetting",
				oi18n,
				"inputCreatedOnDate",
				function (date) {
					that.CreateOn.FromDate = date.fromDate;
					that.CreateOn.ToDate = date.toDate;
				});
			this.PreviousSelectedKeySODate = oEvent.getParameter("selectedItem").getKey();
			if (oEvent.getParameter("selectedItem").getKey() !== "MS") {
				this.PreviousSelectedKeySODate = oEvent.getParameter("selectedItem").getKey();
			}
		},

		//fromat

		formatImage: function (fValue) {
			var img;
			if (fValue === '20') {
				img = 'sap-icon://status-in-process';
				return img;
			}
			if (fValue === '30') {
				img = 'sap-icon://status-completed';
				return img;
			} else if (fValue === '10') {
				img = 'sap-icon://status-error';
				return img;
			}
		},
		formatImageColors1: function (fValue) {
			var img;
			if (fValue === '20') //OPEN
			{
				img = "Warning";
				img = "#d14900"; // Dark Orange     
				return img;
			} else if (fValue === '10') //Partially Billed
			{
				img = "Error";
				img = "#FF0000"; //red
				return img;
			} else if (fValue === '30') {
				img = "Success";
				img = "#008000"; //green
				return img;
			}
		},
		ApprovalformatImage: function (fValue) {
			var img;
			if (fValue === '01') {
				img = 'sap-icon://status-in-process';
				return img;
			}
			if (fValue === '03') {
				img = 'sap-icon://status-completed';
				return img;
			} else if (fValue === '02') {
				img = 'sap-icon://status-negative';
				return img;
			}
		},
		ApprovalformatImageColors1: function (fValue) {
			var img;
			if (fValue === '01') //OPEN
			{
				img = "Warning";
				img = "#FFA500"; // Dark Orange     
				return img;
			} else if (fValue === '02') //Partially Billed
			{
				img = "Error";
				img = "#FF0000"; //red
				return img;
			} else if (fValue === '03') {
				img = "Success";
				img = "#008000"; //green
				return img;
			}
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.arteriatech.SDWHVisitAdherence.view.List
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.arteriatech.SDWHVisitAdherence.view.List
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.arteriatech.SDWHVisitAdherence.view.List
		 */
		//	onExit: function() {
		//
		//	}

	});

});
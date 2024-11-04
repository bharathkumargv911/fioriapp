sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "com/arteriatech/ss/utils/js/Common",
"com/arteriatech/ppc/utils/js/Common"
],
function (BaseController, oSSCommon, oPPCommon) {
  "use strict";
  
      return BaseController.extend("pytabledetails.controller.App", {
        onInit: function() {
          
          // this._oComponent = sap.ui.component(sap.ui.Component.getOwnerIdFor(this.getView()));
          // var oDataModel = this._oComponent.getModel("PCGW");
          // var oUtilsI18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();
          // this._oRouter = sap.ui.core.UIComponent.getRouteFor(this);
          oPPCommon.initMsgMangerObjects();


          if(sap.ui.Device.support.touch===false){
              this.getView().addStyleClass("sapUiSizeCompact");
          }
          if(this.onInitHookUp_Exit){
              this.onInitHookUp();
          }
        }
      });
    }
  );
  
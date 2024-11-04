sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "com/arteriatech/ss/utils/js/Common",
"com/arteriatech/ppc/utils/js/Common"
],
function (BaseController, oSSCommon, oPPCommon) {
  "use strict";
  
      return BaseController.extend("pyregisterapp.controller.App", {
        onInit: function() {
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
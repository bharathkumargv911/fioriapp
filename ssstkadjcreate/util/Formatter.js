jQuery.sap.require("sap.ca.ui.model.format.AmountFormat");
jQuery.sap.require('sap.m.MessageBox');
jQuery.sap.require("sap.ca.ui.message.message");  
jQuery.sap.require("sap.ui.core.format.NumberFormat");
//date format from Json format

function formatTextColor(val)
{
	try
	{
		if(val=="P")
		{
			return "Success";
		}
	}
	catch(err)
	{
		return "None";
	}
}
function formatCurrencyforCreditandDebit(val,currency)
{
	var value = parseFloat(val);
	try
	{
		if(value === 0)
		{
			currency="";
	    	return currency;
		}
		else
		{
			return currency;
		}
	}
	catch(err)
	{
		return "";
	}
}
function formatCreditandDebitAmount(val)
{
	var value = parseFloat(val);
	try
	{
		if(value === 0)
		{
			return "";
	    	
		}
		else
		{
			//val = parseFloat(val);
	    	return val;
		}
	}
	catch(err)
	{
		return "";
	}
}
function formatNumberState(val)
{
	var state="";
	try
	{
	val = parseFloat(val);
	if(val > 0)
		{
			state="Success";
		}
	else
		{
			state="Error";
		}
	}
	catch(err)
	{
		state="None";
	}
	return state; 
}
function formatTextId(desc,item,id)
{
	var text;
	if((id==="" && desc==="")|| (id===undefined && desc===undefined) || (id===null && desc===null))
	{
		text="";
	}
	else
	{
		if(id==="" || id===undefined)
		{
			text=desc;
		}
		else
		{
			text=desc+" /"+item+"("+id+")";
		}
	}
	return text;
}
function formatText(desc,id)
{
var text="";
 if((id!=="" && desc!=="")|| (id!==undefined && desc!==undefined))
 {
  if(id==="" || id===undefined)
  {
   text=desc;
  }
  else if(desc==="" || desc===undefined)
  {
 	text=id;
 }
 else
  {
   text=desc+" "+"("+id+")";
  }
 }
 else
 {
  text="";
 }
 return text;
};
function formatStatusRejVisibility(val)
{
	var invRej=false;
	try
	{
		if(val==04)
		{
			invRej=true;
		}
		else
		{
			invRej=false;
		}
	}
	catch(err)
	{
		invRej=false;
	}
	return invRej;
}
function formatDocTypeImage(fValue)
{      
	var img ;  
	if(fValue=="KR")
	{
		img = 'sap-icon://expense-report';
		return img;
	}
	if(fValue=="AB")
	{
		img = 'sap-icon://accounting-document-verification';
		return img;
	}
	if(fValue=="KZ")
	{
		img = 'sap-icon://sales-order';
		return img;
	}
	if(fValue=="ZP")
	{
		img = 'sap-icon://payment-approval';
		return img;
	}
	if(fValue=="RE")
	{
		img = 'sap-icon://sales-document';
		return img;
	}
	if(fValue=="KG")
		{
			img = 'sap-icon://customer-financial-fact-sheet';
			return img;
		}
	if(fValue=="DZ")
		{
			img ='sap-icon://sales-order';
			return img;
		}
	if(fValue=="RV")
	{
		img ='sap-icon://expense-report';
			return img;
	}

}
function formatDocTypeTooltip(val)
{
	try
	{
		if(val=="RV")
		{
			return "Invoice";
		}
		if(val=="AB")
		{
			return "Journal";
		}
		if(val=="DZ")
		{
			return "Payment";
		}
		if(val=="CP")
		{
			return "Payment";
		}
		if(val=="RE")
		{
			return "Gross inv. receipt";
		}
		if(val=="KG")
		{
			return "Customer credit memo";
		}
	}
	catch(err)
	{
		return "";
	}
}
function formatStatusDelIndVisibility(val)
{
	var invMarkForDel=false;
	try
	{
		if(val==05)
		{
			invMarkForDel=true;
		}
		else
		{
			invMarkForDel=false;
		}
	}
	catch(err)
	{
		invMarkForDel=false;
	}
	return invMarkForDel;
}
function formatEmphasized(val)
{
	try
	{
	val = parseFloat(val);
	if(val > 0)
		{
			return true;
		}
	else
		{
			return false;
		}
	}
	catch(err)
	{
		return false;
	}
}
function formatEmptyAmnt(fValue){
  try {
   if(fValue === "0.00"){
    return fValue;
   }else{
    return fValue;
   }
   
 } catch (err) {
  return "";
 }
}
function formatStatusTooltip(val)
{
	try
	{
		if(val=="P")
		{
			return "Posted";
		}
	}
	catch(err)
	{
		return "Payment Posted";
	}
}
function formatItemTypeImageTooltip(val)
{
	try
	{
		if(val=="VI")
		{
			return "Vendor Invoice";
		}
		if(val=="DN")
		{
			return "Debit Note";
		}
	}
	catch(err)
	{
		return "Payment Posted";
	}
}
function formatImage(fValue){      
	var img ;  
	if(fValue=="P")
	{
		img = 'sap-icon://payment-approval';
		return img;
	}
}
function formatItemTypeImage(fValue){      
	var img ;  
	if(fValue=="VI")
	{
		img = 'sap-icon://sales-document';
		return img;
	}
	if(fValue=="DN")
	{
		img = 'sap-icon://document-text';
		return img;
	}
}

function formatImageColor(fValue){      
	var color ;  
	if(fValue=="P")
	{
		color = "#007833";
		return color;
	}
	
}
function formatItemTypeImageColor(fValue){      
	var color ;  
	if(fValue=="VI")
	{
		color = "#007CC0";
		return color;
	}
	if(fValue=="DN")
	{
		color = "#007833";
		return color;
	}
	
}

function date(fValue) {
	if(fValue)
	{
		var sJsonDate = fValue;/\/(.+)\//.exec(sJsonDate);  
		var oDate = eval("new " + RegExp.$1); 
		var day 	= ('0'+(oDate.getDate())).slice(-2);
		var month = ('0'+(oDate.getMonth()+1)).slice(-2);
		var year 	= oDate.getFullYear();
		var date 	= day+"/"+month+"/"+year;
		return date;
	}
	else {
		return "";
	}
}
function checkToDateLNFromDate(date1, date2)
{
	var dateFrom =new Date(date1);
	var dateTo =new Date(date2);
	dateFrom.setHours(0,0,0,0);
	dateTo.setHours(0,0,0,0);
	var diffDays = (dateTo - dateFrom)/(1000*60*60*24); 
	var valid = false;
	/*
			if(diffDays<=-1)
			 {
				valid = false;
			}
			return valid;*/
	if(diffDays<0)
	{
		valid = true;
	}
	/* else if(diffDays>0)
			{

			   return false;
			}
			 else
				 {
				 return true;
				 }*/
	return valid;
}
//Future Date
function checkFutureDate(value)
{
	var CurrentDate = new Date();
	var dateFrom =new Date(value);
	CurrentDate.setHours(0,0,0,0);
	dateFrom.setHours(0,0,0,0);
	var dateDifference = (CurrentDate - dateFrom)/(1000*60*60*24);
	var valid = false;
	/*   if(dateDifference >=1)
	    	{
	    	valid = false;
	    	}
		    return valid; */
	if(dateDifference <0)
	{
		valid =  true;
	}
	return valid;
}
function checkPastDate(deliveryDate){
	var currentDate = new Date();
	var difference = ((currentDate - deliveryDate)/(1000*60*60*24));
	var valid = true;
	if(difference >= 1)
	{
		valid=false;
	}
	return valid; 
}
function getCurrentDate() {
	return new Date();
}
function getDate(value) {
	var date = new Date();
	date.setDate(date.getDate() - value);
	return date;
}
function after30daysDate() {
	var cur = new Date();
	cur.setDate(cur.getDate() + 30);
	return cur;
}
function validateDate(fValue) 
{
	re = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
	if(fValue != '' && !fValue.match(re)) {
		return false;
	}
	else
	{
		return true;
	}

}
function dateValueHdr(fValue) {

	if(fValue)
	{
		var sJsonDate = fValue;/\/(.+)\//.exec(sJsonDate);  
		var oDate = eval("new " + RegExp.$1); 
		var day 	= ('0'+(oDate.getDate())).slice(-2);
		var month = ('0'+(oDate.getMonth()+1)).slice(-2);
		var year 	= oDate.getFullYear();
		var date 	= day+"/"+month+"/"+year;
		return date;
	}

}
function validByDatesDifference(date1,date2,noOfDays){
	var dateFrom =new Date(date1);
	var dateTo =new Date(date2);	
	var diffDays = (dateTo - dateFrom)/(1000*60*60*24); 
	var valid = false;
	if(diffDays <= noOfDays){
		valid = true;
	}
	return valid;
}
//convering date to 2015-03-27T00:00:00
function getOdataDateFormat(oInputDate){
	var oInputDate_var = oInputDate.toString();
	//Changing the From date format
	var oInputDateArr = oInputDate_var.split(" ");
	var odateNum = oInputDateArr[2];
	var oMonthStr = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(oInputDateArr[1]) / 3 + 1 ;
	var oMonthNum = "00"+oMonthStr;
	oMonthNum = oMonthNum.slice(-2);
	var oYearNum = oInputDateArr[3];
	return oYearNum+"-"+oMonthNum+"-"+odateNum+"T00:00:00";
}
function validateEmail(email) {
	var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}
function validateMobile(phone) {
	var re = /^\+?([0-9]{2})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/;
	return re.test(phone);
}
function validateLandline(landline) {
	var re = /^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/i;
	return re.test(landline);
}
function validPostalCode(postalCode){
	var re = (/^-?\d*(\.\d+)?$/);
	return re.test(postalCode);
}	

function amountFormat(fValue) {
	if(fValue)
	{
		/*var amnt = parseFloat(fValue).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
			    var x = amnt;
			    var res = x;
			    if(x.length>6){
			     x=x.toString();
			     var lastThree = x.substring(x.length-6);
			     var otherNumbers = x.substring(0,x.length-6);
			     if(otherNumbers != '')
			      res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;*/

		var sCurrentLocale = sap.ui.getCore().getConfiguration().getLanguage();
		fValue.toLocaleString(sCurrentLocale);
		return fValue;
	}
}
function checkNull(value)
{
	if(value == undefined || value == "")
	{
		return true;
	}
	else
	{
		return false;
	}
}
//ajax error message
function displayErrorMsg(err,view){
	/* var msgSize= err.responseJSON.error.innererror.errordetails.length;
		     var oMessage = ""; var dupMsg = ""; var backendMsg = "";
		     for(var i=0;i<msgSize;i++)
		      {
		    	 backendMsg = "";
		    	 if(dupMsg != backendMsg){
		    	 oMessage=oMessage+"\n"+err.responseJSON.error.innererror.errordetails[i].message;
		    	 }
		    	 dupMsg = err.responseJSON.error.innererror.errordetails[i].message;
		      }
		     jQuery.sap.require("sap.ca.ui.message.message");  
		     sap.ca.ui.message.showMessageBox({type: sap.ca.ui.message.Type.ERROR, message:oMessage});  */
	if(err != null && err != undefined && err != ""){
		var displayMsg = "";
		var msg = "<html>";

		if(err.responseText.startsWith(msg)){
			parser=new DOMParser();
			htmlDoc=parser.parseFromString(err.responseText, "text/html");
			var h2Arr = htmlDoc.getElementsByTagName('H2');
			displayMsg = h2Arr[0].innerHTML;
		}
		else{
			var msgSize= err.responseJSON.error.innererror.errordetails.length;
			var oMessage = ""; 
			var msgArr = err.responseJSON.error.innererror.errordetails;


			var arr = {};
			for ( var i=0; i < msgArr.length; i++ )
				arr[msgArr[i]['message']] = msgArr[i];

			msgArr = new Array();
			for ( var key in arr )
				msgArr.push(arr[key]);

			for(var i=0;i<msgArr.length;i++)
			{
				oMessage = msgArr[i].message;
				displayMsg = displayMsg+"\n"+oMessage;
			}  
		}
		/*jQuery.sap.require("sap.ca.ui.message.message");  
		       sap.ca.ui.message.showMessageBox({type: sap.ca.ui.message.Type.ERROR, message:displayMsg});  */


		if(view != undefined && view != null && view != ""){
			displayErrorOfText(view,displayMsg);
		}else{
			displayMessageErr(displayMsg);
		}

	}
}
//ajax success message
function displaySuccMsg(message, fnClose, view){
	var messageText = "";
	var xml= message["sap-message"];
	var oXML = jQuery.parseXML(xml);
	$( oXML ).find("message").each(function(a, b){
		messageText = messageText+"\n"+ $(b).text();
	})
	if(fnClose != undefined && fnClose != null && fnClose != ""){

		if(view != undefined && view != null && view != ""){
			displaySuccessForOnClose(view,messageText,fnClose);
		}else{
			new  sap.ca.ui.message.showMessageBox(
					{
						type: sap.ca.ui.message.Type.SUCCESS,
						message: messageText,
					},
					fnClose
			);
		}
	}
	else{
		if(view != undefined && view != null && view != ""){
			displaySuccessOfText(view,messageText)
		}else{
			displayMessageSuccess(messageText);
		}
	}

}



//oData error message
function displayErrMsg(error, view){
	var displayMsg = "";
	var oXMLMsg1 = [];
	var message=error.response;
	if(message.statusCode != "403"){
		var xml=message["body"];
		var oXML = jQuery.parseXML(xml);
		$( oXML ).find("message").each(function(a, b){
			oXMLMsg1.push($(b).text());
		})

		var oMessage = "";

		var arr = {};
		for ( var i=0; i < oXMLMsg1.length; i++ )
			arr[oXMLMsg1[i]] = oXMLMsg1[i];

		var oXMLMsg2 = new Array();
		for ( var key in arr )
			oXMLMsg2.push(arr[key]);

		for(var i=0;i<oXMLMsg2.length;i++)
		{
			oMessage = oXMLMsg2[i];
			displayMsg = displayMsg+"\n"+oMessage;
		} 
	}
	else{
		displayMsg = message.statusCode +" "+ message.statusText+ " error" ;
	}
	if(view != undefined && view != null && view != ""){
		displayErrorOfText(view,displayMsg);
	}else{
		displayMessageErr(displayMsg);
	}
}

//open new window to see the pdf, which is coming from backend
function printPdf(loginUrl)
{
	window.open(loginUrl,'winname','directories=no,titlebar=no,navigationtoolbar=no,addressbar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no');
}
//json date format
function formatJDate(aData,dateArr){
	var dateStr = "";
	for(var j=0; j<dateArr.length; j++){
		dateStr = "";
		dateStr = dateArr[j];
		for(var i=0; i<aData.length; i++ )
		{
			var fValue=aData[i][dateStr];
			if(fValue != null && fValue != "" && fValue != undefined){
				var sJsonDate = fValue;/\/(.+)\//.exec(sJsonDate);  
				var oDate = eval("new " + RegExp.$1); 
				oDate.setHours("00");
				oDate.setMinutes("00");
				oDate.setSeconds("00");
				aData[i][dateStr]=oDate;
			}
		}
	}
	return aData;
}

function formatAmount (fAmount, fCurr) {
	// return sap.ca.ui.model.format.AmountFormat.getInstance("","").format(fAmount);
	var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
		//  maxFractionDigits: 2,
		groupingEnabled: true,
		groupingSeparator: ",",
		decimalSeparator: "."
	}); //Returns a NumberFormat instance for float
	if(fAmount != "" && fAmount != null && fAmount != undefined){
		var amnt = oNumberFormat.format(fAmount);
		return amnt;
	}else{
		return fAmount;
	}
}

function formatQty(fQty, fUOM) {
	// return sap.ca.ui.model.format.QuantityFormat.getInstance("","").format(fQty);
	var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
		maxFractionDigits: 3,
		groupingEnabled: true,
		groupingSeparator: ",",
		decimalSeparator: "."
	}); //Returns a NumberFormat instance for float
	if(fQty != "" && fQty != null && fQty != undefined){
		var qty = oNumberFormat.format(fQty);
		return qty;
	}else{
		return fQty;
	}
}
function endsWith(str, suffix) {
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
function toInteger(stringVal){
	if(stringVal != null)
		return parseInt(stringVal);
}
function toDecimal(stringVal){
	if(stringVal != null)
		return parseDecimal(stringVal);
}
/*function getTokenForSingleInput(view,fieldId)
		{
			var oMultiInputObj = view.byId(fieldId);
			//this one supports only one token in the field
			oMultiInputObj.addValidator(function(args){
				oMultiInputObj.removeAllTokens();
			    var oToken = new sap.m.Token({key: args.text, text: args.text});
			    args.asyncCallback(oToken);
			    return sap.m.MultiInput.WaitForAsyncValidation;
			  });
		 }
		function getTokenForMultipleInput(view,fieldId)
		{
			var oMultiInputObj = view.byId(fieldId);
			//this one supports only one token in the field
			oMultiInputObj.addValidator(function(args){
			    var oToken = new sap.m.Token({key: args.text, text: args.text});
			    args.asyncCallback(oToken);
			    return sap.m.MultiInput.WaitForAsyncValidation;
			  });
	     }*/
function getTokenForSingleInput(args, oMultiInputObj, url, codeName, desc, view, controlId, errorText)
{
	var oDialog = new sap.m.BusyDialog();
	oDialog.open();
	$.ajax({       
		url :url,
		jsonpCallback : 'getJSON',    
		contentType : "application/json",    
		dataType : 'json', 
		//async : false,
		success : function(data, textStatus, jqXHR) 
		{    
			view.byId(controlId).setValueState(sap.ui.core.ValueState.None);
			view.byId(controlId).setValueStateText("");
			oMultiInputObj.removeAllTokens();
			var oModel1 = new sap.ui.model.json.JSONModel();    
			oModel1.setData(data); 
			var aData = oModel1.getProperty("/d/results"); 
			var oToken = "";
			var codeVal = "";
			var nameVal = "";

			if(codeName != "" && codeName != null && codeName != undefined){
				codeVal = aData[0][codeName];
			}else{
				codeVal = args.text;
			}
			if(desc == "" || desc == null || desc == undefined){
				nameVal = args.text;
			}else{
				if(aData[0][desc] == undefined && aData[0][desc] == "" ){
					nameVal = args.text;
				}else{
					nameVal = aData[0][desc]+" ("+args.text+")";
				}
			}
			oToken = new sap.m.Token({key: codeVal, text: nameVal});

			args.asyncCallback(oToken);
			oDialog.close();
			return sap.m.MultiInput.WaitForAsyncValidation;
		},
		error : function (err){ 
			oDialog.close();
			view.byId(controlId).setValueState(sap.ui.core.ValueState.Error);
			view.byId(controlId).setValueStateText("Please enter valid "+errorText);
//			displayErrorMsg(err);
		}
	});
}
function getTokenForMultipleInput(args, oMultiInputObj,url,desc,view)
{
	var oDialog = new sap.m.BusyDialog();
	oDialog.open();
	$.ajax({       
		url :url,
		jsonpCallback : 'getJSON',    
		contentType : "application/json",    
		dataType : 'json', 
		// async : false,
		success : function(data, textStatus, jqXHR) 
		{    
			var oModel1 = new sap.ui.model.json.JSONModel();    
			oModel1.setData(data); 
			var aData = oModel1.getProperty("/d/results"); 
			var oToken = "";
			if(desc == "" || desc == null || desc == undefined){
				oToken = new sap.m.Token({key: args.text, text: args.text});
			}else{
				if(aData[0][desc] == undefined && aData[0][desc] == "" ){
					oToken = new sap.m.Token({key: args.text, text: args.text});
				}else{
					oToken = new sap.m.Token({key: args.text, text: aData[0][desc]+" ("+args.text+")"});
				}
			}
			args.asyncCallback(oToken);
			oDialog.close();
			return sap.m.MultiInput.WaitForAsyncValidation;
		},
		error : function (err){ 
			oDialog.close();
			displayErrorMsg(err,view);
		}
	});
}

function amountParseFloatWithM(amnt){
	var parsedVal = parseFloat(amnt);
	var fixedVal = parsedVal.toFixed(2);
	var concatVal = fixedVal+"m";
	return concatVal;
}

function quantityParseFloatWithM(qty){
	var parsedVal = parseFloat(qty);
	var fixedVal = parsedVal.toFixed(3);
	var concatVal = fixedVal+"m";
	return concatVal;
}

function amountParseFloat(amnt){
	var parsedVal = parseFloat(amnt);
	var fixedVal = parsedVal.toFixed(1);
	//var concatVal = fixedVal+"m";
	//return concatVal;
	return fixedVal;
}

function quantityParseFloat(qty){
	var parsedVal = parseFloat(qty);
	var fixedVal = parsedVal.toFixed(2);
	//var concatVal = fixedVal+"m";
	//return concatVal;
	return fixedVal;
}


function isInteger(value){
	if ((undefined === value) || (null === value)) {
		return false;
	}
	return value % 1 == 0;
}

String.prototype.startsWith = function (str){
	return this.indexOf(str) == 0;
};

function displayErrorOfTextObj(view,messageArea){
	var bCompact = !!view.$().closest(".sapUiSizeCompact").length;
	sap.m.MessageBox.error(
			messageArea.getText(),
			{
				styleClass: bCompact? "sapUiSizeCompact" : ""
			}
	);
}

function displayErrorOfText(view,messageArea){
	var bCompact = !!view.$().closest(".sapUiSizeCompact").length;
	sap.m.MessageBox.error(
			messageArea,
			{
				styleClass: bCompact? "sapUiSizeCompact" : ""
			}
	);
}

function displaySuccessForOnClose(view,messageArea,fnClose){
	var bCompact = !!view.$().closest(".sapUiSizeCompact").length;
	sap.m.MessageBox.success(
			messageArea,
			{
				styleClass: bCompact? "sapUiSizeCompact" : "",
						onClose: fnClose,
			}
	);
}

function displaySuccessOfText(view,messageArea){
	var bCompact = !!view.$().closest(".sapUiSizeCompact").length;
	sap.m.MessageBox.success(
			messageArea,
			{
				styleClass: bCompact? "sapUiSizeCompact" : ""
			}
	);
}

//opens popup here, to display the error message, mainly for validations
function errorPopUp(messageArea,view){
	if(view != null && view != undefined && view != ""){
		displayErrorOfText(view,messageArea);
	}else{
		displayMessageErr(messageArea.getText());
	}
}
function displayMessageErr(displayMsg){
	sap.ca.ui.message.showMessageBox({type: sap.ca.ui.message.Type.ERROR, message:displayMsg}); 
}
function displayMessageSuccess(displayMsg){
	sap.ca.ui.message.showMessageBox({type: sap.ca.ui.message.Type.SUCCESS, message:displayMsg}); 
}
function closeDialog(counter,oDialog){
	counter = counter-1;
	if(counter == 0){
		oDialog.close();
	}
	return counter;
}
function getCurrentServerDate(){
	var sUrl = sap.ui.getCore().getModel("PDGW_COM").sServiceUrl;
	sUrl = sUrl+"/Today";
	var currentDate = null;
	$.ajax({  
		url :sUrl ,
		jsonpCallback : 'getJSON',    
		contentType : "application/json",    
		dataType : 'json', 
		async:false,
		success : function(data, textStatus, jqXHR) 
		{    
			var oModel1 = new sap.ui.model.json.JSONModel();    
			oModel1.setData(data); 
			var aData = oModel1.getProperty("/d/results"); 
			var dateArr =[];
			dateArr.push("Today");
			aData=formatJDate(aData,dateArr);
			currentDate =aData[0].Today; //Mon Oct 12 2015 00:00:00 GMT+0530 (India Standard Time)
		},
		error : function (err){ 
		},
	});
	return currentDate; 
}

//Future Date
function checkFutureDateWithServerDate(value)
{
	var CurrentDate = getCurrentServerDate();
	var dateFrom =new Date(value);
	CurrentDate.setHours(0,0,0,0);
	dateFrom.setHours(0,0,0,0);
	var dateDifference = (CurrentDate - dateFrom)/(1000*60*60*24);
	var valid = false;
	/*   if(dateDifference >=1)
		    	{
		    	valid = false;
		    	}
			    return valid; */
	if(dateDifference <0)
	{
		valid =  true;
	}
	return valid;
}
function checkPastDateWithServerDate(deliveryDate){
	var currentDate = getCurrentServerDate();
	var difference = ((currentDate - deliveryDate)/(1000*60*60*24));
	var valid = true;
	if(difference >= 1)
	{
		valid=false;
	}
	return valid; 
}
function getRequiredServerDate(value) {
	var date = getCurrentServerDate();
	date.setDate(date.getDate() - value);
	return date;
}
function getAfter30DaysServerDate() {
	var cur = getCurrentServerDate();
	cur.setDate(cur.getDate() + 30);
	return cur;
}
function setCommonModel(sServiceUrl){
	var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
	oModel.setCountSupported(false);
	sap.ui.getCore().setModel(oModel,"PDGW_COM");
}
function closeDialog(pendingAjaxCallCount,oDialog){
	pendingAjaxCallCount = pendingAjaxCallCount -1;
	if(pendingAjaxCallCount == 0){
		oDialog.close();
	}
	return pendingAjaxCallCount;
}
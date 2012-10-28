/**
 * This Utility knows various formats
 * @author nomiad | guavestudios
 * @version 0.3
 */

function Format() {
    var currentArgs=null;
    var _customVariables;
    var _customVariablesUsed=false;
    
    this.format=function(format,args){
        currentArgs = Array.prototype.slice.call(arguments,1);
        //console.info(this.currentArgs);
        if (format==null) return "Error: undefined Format";
	if (arguments.length<2) return format;
	if (format.indexOf("{") == -1) return format; //optimized
	var that=this;
	var str=format.replace(Format.placeholderPattern, function(){return format_replace.apply(that,arguments);});
        if (_customVariablesUsed) {
            _customVariablesUsed=false;
            _customVariables=null;
        }
        return str;
    }
    
    function format_replace(params){
        var args=arguments;
        try {
            var res=args[0];
            if (args[Format.PLP_PARAMS]==undefined || args[Format.PLP_PARAMS]==Format.EMPTY) {
                    res=getValue.call(this,args).toString();
            } else {
                    var c = args[Format.PLP_PARAMS].charAt(0);
                    if (c=="d") {// format as fixed
                        if (!isNaN(getValue.call(this,args))) {
                                    res= format_number.call(this,args[Format.PLP_PARAMS],getValue.call(this,args));
                            }
                    } else if (c == "?") {
                            res= format_parseIf.call(this,args[Format.PLP_PARAMS],getValue.call(this,args));
                    } else if (c == "h") { //hexadecimal
                            res= format_decimal.call(this,args[Format.PLP_PARAMS],getValue.call(this,args));
                    } else if (c == "s") {
                            res= format_tabs.call(this,args[Format.PLP_PARAMS], getValue.call(this,args));
                    }
            }
            if (args[Format.PLP_ASSIGN] != undefined && args[Format.PLP_ASSIGN]!=Format.EMPTY) {
                    if (!_customVariablesUsed) {
                        _customVariables={};
                        _customVariablesUsed=true;
                    }
                    
                    _customVariables[args[Format.PLP_ASSIGN]] = res;
                    return "";
            }
            //console.info("return: "+res);
        } catch(e){
            console.warn("Format problem: '"+args[0]+"' in '"+args[7].substr(0,16)+"...'");
        }
        return res;
    }
    
    function getValue(args) {
            //console.info(args);
            if (args[Format.PLP_SUBSELECT] != Format.EMPTY) {
                    var val;
                    if (args[Format.PLP_SELECT] != Format.EMPTY) {
                            val = currentArgs[parseInt(args[Format.PLP_SELECT],10)];
                    } else {
                            val = currentArgs[0];
                    }
                    return val[args[Format.PLP_SUBSELECT]];
            }
            if (args[Format.PLP_SELECTVAR] != undefined && args[Format.PLP_SELECTVAR]!=Format.EMPTY) {
               if (_customVariablesUsed)
                    return _customVariables[args[Format.PLP_SELECTVAR]];
               else return "NA";
            }
            return currentArgs[parseInt(args[Format.PLP_SELECT],10)];
    }
    function format_decimal(rule,nr){
        return nr.toString(16).toUpperCase();
    }
    function format_parseIf(rule,param) {
        //{0:?!=1|Elemente|Element}
        var obj = Format.parseIfReg.exec(rule);
        if (obj != null) {
            var nr = parseFloat(obj[2]);
            var res = false;
            switch (obj[1]) {
                case "!=":res = param !=nr;break;
                case "<":res = param<nr;break;
                case ">":res = param>nr;break;
                case "==":res = param==nr;break;
            }
            if (res) return obj[3];
            else return obj[4];
        }
        return rule;
    }
    function format_number(rule,nr) {
        var res = Format.formatNumberReg.exec(rule);
        //if (!isNaN(getValue.call(this,args))) {
        if (res != null) {
            var digits = 0;
            var forceDigits = 0;
            var corr=nr;
            if (res[3] != null) { //find digits
                digits = res[4].length;
                forceDigits = (res[4].charAt(0)=="?")?0:digits;
            }
            
            //do rounding
            corr = corr * Math.pow(10, digits);
            if (res[5] == "c") corr = Math.ceil(corr);
            else if (res[5] == "f") corr = Math.floor(corr);
            else corr = Math.round(corr);
            corr = corr / Math.pow(10, digits);
            
            //format digits
            var mainStr = corr.toString();
            var digStr = "";
            if (mainStr.indexOf(".") > -1 && digits > 0) {
                var a = corr.toString().split(".");
                digStr = a[1];
                mainStr = a[0];
            }
            
            //force digits
            if (forceDigits > 0) {
                while (digStr.length < forceDigits) 
                    digStr += "0";
            }
            
            
            //format min leading length
            var minLen = res[2].length;
            while (mainStr.length < minLen)
                mainStr = "0" + mainStr;
            
            //format 1000ds points
            if (res[1] != null) {
                var ms = "";
                for (var i = mainStr.length - 1, ilen = mainStr.length - 1; i >= 0; i--) {
                    ms = mainStr.charAt(i) + ms;
                    if (((ilen-i)%3)==2 && i>0) ms=res[1]+ms;
                }
                mainStr = ms;
            }
            
            if (digStr.length>0) return mainStr+res[3]+digStr;
            return mainStr;
            
        }
        return rule;
    }
    function format_tabs(rule,param) {
        var res = Format.parseTabsReg.exec(rule);
        if (res != null) {
            var result = param.toString();
            var orient = res[1];
            var filler = res[3];
            var len = parseInt(res[2],10);
            var mo=0;
            while (result.length < len) {
                switch(orient) {
                    case "m":
                        if (mo%2==0) result = result+filler;
                        else result = filler+result;
                        mo++;
                        break;
                    case "l":
                        result = result+filler;
                        break;
                    case "r":
                    default:
                        result = filler+result;
                        break;
                    
                }
            }
            return result;
        }
        return param;
    }
}
Format.placeholderPattern =/\{(?:\$([a-zA-Z0-9]{1,4})=|)(\$([a-zA-Z0-9]{1,4})|[0-9]{1,2}|)(?:\.|)(?:#|)([a-zA-Z0-9]{1,15}?|)(?:\:(.+?)|)\}/g;
Format.parseIfReg = /^\?(.{1,2})([0-9]{1,5})\|(.*?)\|(.*?)$/;
Format.formatNumberReg =/^d(?:(\.|\,|\')|)([#]{1,5})(?:(\.|\,)([#\?]{1,4})|)([cfr]|)$/;
Format.parseTabsReg=/^s([l,r,m])([0-9]{1,2})\|(.)/;
Format.EMPTY = "";

//place holder positions
Format.PLP_ASSIGN = 1;
Format.PLP_SELECT = 2;
Format.PLP_SELECTVAR = 3;
Format.PLP_SUBSELECT = 4;
Format.PLP_PARAMS = 5;

Format.getInstance=function(){
    if (Format.instance==null) Format.instance=new Format();
    return Format.instance;
}
Format.format=function(format,args){
    return Format.getInstance().format.apply(Format.getInstance(),arguments);
}


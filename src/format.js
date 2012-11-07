/**
 * This Utility knows various formats
 * @author nomiad | guavestudios
 * @license MIT -> LICENSE
 * @version 0.3
 */
 
(function(exports){

    var Format=function Format() {
        var that=this;
        var currentArgs=null;
        var _customVariables;
        var _customVariablesUsed=false;
        var _plugins={                          //default plugins
                "d":format_number,
                "h":format_decimal,
                "?":format_parseIf,
                "s":format_tabs
        };
        var F=Format.defaultFormat;
        
        this.format=function(format,args){
            currentArgs = Array.prototype.slice.call(arguments,1);
            if (format==null) return "Error: undefined Format";
            if (arguments.length<2) return format;
            if (format.indexOf(F.placeholderIndexOfCheck) == -1) return format; //optimized
            var str=format.replace(F.placeholderPattern, function(){return format_replace.apply(that,arguments);});
            if (_customVariablesUsed) {
                _customVariablesUsed=false;
                _customVariables=null;
            }
            return str;
        };
        
        //plugin interface
        this.getValue=getValue;
        this.addPlugin=addPlugin;
        
        
        function addPlugin(plugin){
            // {id:"s",fnc:function,init:null|function}
            _plugins[plugin.id]=plugin.fnc;
            if(plugin.init) plugin.init(this);    
        }
        
        
        function format_replace(params){
            var args=arguments;
            try {
                var res=args[0];
                if (args[F.PLP_PARAMS]==undefined || args[F.PLP_PARAMS]==F.EMPTY) {
                    res=getValue.call(this,args).toString();
                } else {
                    var c = args[F.PLP_PARAMS].charAt(0);
                    var plug=_plugins[c];
                    if (plug!=null){  //check plugin for formatting
                        res=plug.call(this,args[F.PLP_PARAMS],getValue.call(this,args));
                    }
                }
                if (args[F.PLP_ASSIGN] != undefined && args[F.PLP_ASSIGN]!=F.EMPTY) {
                    if (!_customVariablesUsed) {
                        _customVariables={};
                        _customVariablesUsed=true;
                    }
                    
                    _customVariables[args[F.PLP_ASSIGN]] = res;
                    return "";
                }
            } catch(e) {
                res=args[0];
                if (window.console!=null)
                    console.warn("Format problem: '"+args[0]+"' in '"+args[7].substr(0,16)+"...'");
            }
            return res;
        }
        
        function getValue(args) {
                if (args[F.PLP_SUBSELECT] != F.EMPTY) {
                        var val;
                        if (args[F.PLP_SELECT] != F.EMPTY) {
                                val = currentArgs[parseInt(args[F.PLP_SELECT],10)];
                        } else {
                                val = currentArgs[0];
                        }
                        return getValuePath(val,args[F.PLP_SUBSELECT].split("."),0);
                }
                if (args[F.PLP_SELECTVAR] != undefined && args[F.PLP_SELECTVAR]!=F.EMPTY) {
                   if (_customVariablesUsed)
                        return _customVariables[args[F.PLP_SELECTVAR]];
                   else return "NA";
                }
                return currentArgs[parseInt(args[F.PLP_SELECT],10)];
        }
        function getValuePath(obj,path,depth){
            if (depth==null) depth=0;
            var name=path[depth];
            
            if (name==null) return obj;
            else return getValuePath(obj[name],path,depth+1);
            
        }
        
        function format_decimal(rule,nr){
            return nr.toString(16).toUpperCase();
        }
        function format_parseIf(rule,param) {
            //{0:?!=1|Elemente|Element}
            var obj = F.parseIfReg.exec(rule);
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
        function format_number(rule,val) {
            var res = F.formatNumberReg.exec(rule);
            var nr=val;
            
            //check if its a number
            if (isNaN(nr)) return rule;
            
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
            var res = F.parseTabsReg.exec(rule);
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
    
    Format.defaultFormat={
        placeholderIndexOfCheck: "{",
        //                    {  $a                   =    $a | 0-99                 .        :                                 
        placeholderPattern: /\{(?:\$([a-zA-Z0-9]{1,4})=|)(\$([a-zA-Z0-9]{1,4})|[0-9]{1,2}|)(?:\.|)(?:#|)([a-zA-Z0-9\.]{1,60}?|)(?:\:(.+?)|)\}/g,
        parseIfReg:         /^\?(.{1,2})([0-9]{1,5})\|(.*?)\|(.*?)$/,
        formatNumberReg:    /^d(?:(\.|\,|\')|)([#]{1,5})(?:(\.|\,)([#\?]{1,4})|)([cfr]|)$/,
        parseTabsReg:       /^s([l,r,m])([0-9]{1,2})\|(.)/,
        EMPTY: "",
        
        //place holder positions
        PLP_ASSIGN: 1,
        PLP_SELECT: 2,
        PLP_SELECTVAR: 3,
        PLP_SUBSELECT: 4,
        PLP_PARAMS: 5
    };
    
    Format.getInstance=function(){
        if (Format.instance==null) Format.instance=new Format();
        return Format.instance;
    }
    Format.format=function(format,args){
        return Format.getInstance().format.apply(Format.getInstance(),arguments);
    }
    
    //publish to exports
    exports["Format"]=Format;
    
    //expose to amd if is available
    if ( typeof define === "function" && define.amd ) {
        define( "jsfmt", [], function () { return Format; } );
    }

}(window));


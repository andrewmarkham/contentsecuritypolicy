//>>built
define("epi/shell/TimeZoneUtils",[],function(){return {getOffset:function(_1){var _2=new RegExp("([A-Z]+[+-][0-9]{2})([0-9]{2})");var _3=_1.toString().match(_2);return _3[1]+":"+_3[2];}};});
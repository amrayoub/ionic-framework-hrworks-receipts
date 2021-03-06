angular.module('hrworks.globalMethods', ['ionic'])

.factory('generateGUID', function() {
    return function() {
       var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = Math.random() * 16 | 0,
			v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
		return guid;
    };
})

.factory('getDateFormat', function($localstorage) {
    return function() {
		if($localstorage.getObjects('language').language == 'de') {
			return 'dd.MM.yyyy';
		} else {
			return 'MM/dd/yyyy';
		}
    };
});
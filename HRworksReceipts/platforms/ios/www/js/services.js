angular.module('ionic.utils', [])

.factory('$localstorage', ['$window', function ($window) {
			return {
				set : function (key, value) {
					$window.localStorage[key] = value;
				},
				get : function (key, defaultValue) {
					return $window.localStorage[key] || defaultValue;
				},
				setObject : function (key, value) {
					$window.localStorage[key] = JSON.stringify(value);
				},
				insertObject : function (key, value) {
					var objects = JSON.parse($window.localStorage[key] || '{}');
					objects.push(value);
					$window.localStorage[key] = JSON.stringify(objects);
				},
				getObjects : function (key) {
					return JSON.parse($window.localStorage[key] || '{}');
				},
				getIndex : function (key, guid) {
					var objects = JSON.parse($window.localStorage[key] || '{}');
					for (var i = 0; i < objects.length; i++) {
						if (objects[i].guid == guid) {
							return i;
						}
					}
				},
				getObject : function (key, guid) {
					var objects = JSON.parse($window.localStorage[key] || '{}');
					for (var i = 0; i < objects.length; i++) {
						if (objects[i].guid == guid) {
							return objects[i];
						}
					}
				},
				getCurrencyObject: function (symbol) {
					var objects = JSON.parse($window.localStorage['currencies'] || '{}');
					for (var i = 0; i < objects.length; i++) {
						if (objects[i].symbol == symbol) {
							return objects[i];
						}
					}
				},
				getObjectById: function (key, id) {
					var objects = JSON.parse($window.localStorage[key] || '{}');
					for (var i = 0; i < objects.length; i++) {
						if (objects[i].id == id) {
							
							return objects[i];
						}
					}
				},
				removeObject : function (key, guid) {
					var objects = JSON.parse($window.localStorage[key] || '{}');
					for (var i = 0; i < objects.length; i++) {
						if (objects[i].guid == guid) {
							objects.splice(i, 1);
							$window.localStorage[key] = JSON.stringify(objects);
							return;
						}
					}
				},
				updateObject : function (key, value) {
					var objects = JSON.parse($window.localStorage[key] || '{}');
					for (var i = 0; i < objects.length; i++) {
						if (objects[i].guid == value.guid) {
							objects[i] = value;
							$window.localStorage[key] = JSON.stringify(objects);
							return;
						}
					}
				}
			}
		}
	]);
angular.module('starter.services', [])

.factory('GetCurrentUrl', function ($localstorage, $http, $translate, $cordovaNetwork, $ionicPopup) {
	var translationsArray = [];
	$translate(['NOINTERNETACCESS_TITLE', 'NOINTERNETACCESS_TEMPLATE']).then(function (translations) {
		translationsArray["NOINTERNETACCESS_TITLE"] = translations.NOINTERNETACCESS_TITLE;
		translationsArray["NOINTERNETACCESS_TEMPLATE"] = translations.NOINTERNETACCESS_TEMPLATE;
	})
	return {
		get : function(targetServer, companyId) {
			if($cordovaNetwork.isOffline()) {
				$ionicPopup.alert({
					title: translationsArray["NOINTERNETACCESS_TITLE"],
					template: translationsArray["NOINTERNETACCESS_TEMPLATE"]
				});
				return false;
			}
			var url = "https://ssl.hrworks.de/cgi-bin/hrw.dll/" + targetServer + "/HrwGetCurrentUrl";
			var jsonObject = {};
			jsonObject.companyId = companyId;
			 return $http({
				url: url,
				method: "POST",
				data: JSON.stringify(jsonObject),
				headers: {'Content-Type': 'application/x-www-form-urlencoded' ,  'Content-Transfer-Encoding': 'utf-8' }
			})
		}
	}
})
.factory('getData', function ($q, $localstorage, $http, $timeout, $cordovaDevice, $translate, $ionicPopup, GetCurrentUrl) {
	var translationsArray = [];
	$translate(['NOANSWERFROMTHESERVER_TITLE', 'NOANSWERFROMTHESERVER_TEMPLATE']).then(function (translations) {
		translationsArray["NOANSWERFROMTHESERVER_TITLE"] = translations.NOANSWERFROMTHESERVER_TITLE;
		translationsArray["NOANSWERFROMTHESERVER_TEMPLATE"] = translations.NOANSWERFROMTHESERVER_TEMPLATE;
	})
	generateSignature = function(companyId, personId, request, timeStamp, password) {
		var generatedString = companyId + "\r\n" + personId + "\r\n" + timeStamp + "\r\n" + request + "\r\n";
		return rstr2b64(rstr_hmac_sha1(str2rstr_utf8(password), rstr_sha1(str2rstr_utf8(generatedString))));
	}
	get = function(type, url) {
		var userData = $localstorage.getObjects('user');
		correctReceipts = function(receipts) {
			var newReceipts = [];
			for(var i = 0; i < receipts.length; i++) {
				console.log(receipts[i]);
				var theNewReceipt = receipts[i];
				theNewReceipt.date = theNewReceipt.date.replace(/-/g, "");
				theNewReceipt.currency = theNewReceipt.currency.symbol;
				theNewReceipt.kindOfPayment = theNewReceipt.kindOfPayment.id;
				if(theNewReceipt.receiptKind.isHotel) {
					theNewReceipt.endDate = theNewReceipt.endDate.replace(/-/g, "");
				}
				theNewReceipt.receiptKind = theNewReceipt.receiptKind.id;

				newReceipts.push(theNewReceipt);
			}
			return newReceipts;
		}
		
		var apiName = "HrwGet" + type + "Api";
		var api = url + "HrwGet" + type + "Api";
		var request = apiName + " class";
		var jsonObject = {};
		if(type == "Receipts") {
			api = url + "HrwSynchronizeImportReceiptsApi";
			var request = "HrwSynchronizeImportReceiptsApi class";
			jsonObject.importReceipts = correctReceipts($localstorage.getObjects('receipts'));
		}
		jsonObject.companyId = userData.companyId;
		jsonObject.personId = userData.personId;
		jsonObject.dateAndTime = (new Date()).toISO8601();
		jsonObject.mobileApplicationAuthorization = "HRworksMobileApp";
		jsonObject.deviceId = $cordovaDevice.getUUID();
		jsonObject.languageKey = $translate.use();
		jsonObject.version = "1";
		jsonObject.signature = generateSignature(jsonObject.companyId, jsonObject.personId, request, jsonObject.dateAndTime, userData.mobilePassword);
		console.log(jsonObject);
		return $http({
			url: api,
			method: "POST",
			data: JSON.stringify(jsonObject),
			headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=iso-8895-1' }
		});
	};
	changeReceiptObject = function(receipts) {
		updatedReceiptsCollection = new Array();
		changeDate = function(theDate) {
			year = theDate.substr(0,4);
			month = theDate.substr(4,2);
			day = theDate.substr(6,2);
			return year + "-" + month + "-" + day;
		}
		for(var i = 0; i < receipts.length; i++) {
			receipt = receipts[i];
			receipt.receiptKind = $localstorage.getObjectById('receiptKinds', receipt.receiptKind);
			receipt.currency = $localstorage.getCurrencyObject(receipt.currency);
			receipt.kindOfPayment = $localstorage.getObjectById('kindsOfPayment', receipt.kindOfPayment);
			receipt.date = changeDate(receipt.date);
			if(receipt.receiptKind.isHotel) {
				receipt.endDate = changeDate(receipt.endDate);
			}
			updatedReceiptsCollection.push(receipt);
		}
		return updatedReceiptsCollection;
	}
	return {
		all : function() {
			var deferred = $q.defer();
			var userData = $localstorage.getObjects('user');
			var url = GetCurrentUrl.get(userData.targetServer, userData.companyId);
			url.success(function (data, status, headers, config) {
				get('KindsOfPayment', data.url).success(function (data, status, headers, config) {
					$localstorage.setObject('kindsOfPayment', data.result);
				}).then(function() {
					get('ReceiptKinds', data.url).success(function (data, status, headers, config) {
						$localstorage.setObject('receiptKinds', data.result);
					}).then(function() {
						get('Currencies', data.url).success(function (data, status, headers, config) {
							$localstorage.setObject('currencies', data.result);
						}).then(function() {
							get('Receipts', data.url).success(function (data, status, headers, config) {
								updatedReceipts = changeReceiptObject(data.result);
								$localstorage.setObject('receipts', updatedReceipts);
								deferred.resolve(data);		
							})
						})
					})
				})
			}).error(function(data, status, headers, config) {
				return false
			});
			return deferred.promise;
		},
		userLogin : function(user) {
			var deferred = $q.defer();
			var url = GetCurrentUrl.get(user.targetServer, user.companyId);
			console.log(url);
			var request = "HrwRegisterDeviceApi class";
			jsonObject = {};
			jsonObject.companyId = user.companyId;
			jsonObject.personId = user.personId;
			jsonObject.dateAndTime = (new Date()).toISO8601();
			jsonObject.mobileApplicationAuthorization = "HRworksMobileApp";
			jsonObject.deviceId = $cordovaDevice.getUUID();
			jsonObject.deviceName = $cordovaDevice.getModel();
			jsonObject.languageKey = $translate.use();
			jsonObject.version = "1";
			jsonObject.signature = generateSignature(jsonObject.companyId, jsonObject.personId, request, jsonObject.dateAndTime, user.mobilePassword);
			url.success(function (data, status, headers, config) {
				$http({
					url: data.url + "HrwRegisterDeviceApi",
					method: "POST",
					data: JSON.stringify(jsonObject),
					headers: {'Content-Type': 'application/x-www-form-urlencoded' }
				}).success(function (data, status, headers, config) {
					deferred.resolve(data);			
				}).error(function(){
					$ionicPopup.alert({
						title: translationsArray["NOANSWERFROMTHESERVER_TITLE"],
						template: translationsArray["NOANSWERFROMTHESERVER_TEMPLATE"]
					});
				})
			}).error(function(data, status, headers, config) {
				return false
			});
			return deferred.promise;
		}
	}
})
.factory('LastCurrency', function () {
	var lastReceipt = {
		description : "Euro",
		isPreferred : true,
		symbol : "EUR"
	};
	return {
		all : function () {
			return lastReceipt;
		}
	}
});
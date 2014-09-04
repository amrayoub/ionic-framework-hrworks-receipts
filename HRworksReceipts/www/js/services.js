angular.module('ionic.utils', [])

// Setter and Getter methodes for the $localstorage
.factory('$localstorage', ['$window', function ($window) {
	return {
		set : function (key, value) {
			$window.localStorage[key] = value;
		},
		get : function (key, defaultValue) {
			return $window.localStorage[key] || defaultValue;
		},
		setObject : function (key, value) {
			$window.localStorage[key] = angular.toJson(value);
		},
		insertObject : function (key, value) {
			var objects = angular.fromJson($window.localStorage[key] || '{}');
			objects.push(value);		
			$window.localStorage[key] = angular.toJson(objects);
		},
		getObjects : function (key) {
			return angular.fromJson($window.localStorage[key] || '{}');
		},
		getIndex : function (key, guid) {
			var objects = angular.fromJson($window.localStorage[key] || '{}');
			for (var i = 0; i < objects.length; i++) {
				if (objects[i].guid == guid) {
					return i;
				}
			}
			return -1;
		},
		getObject : function (key, guid) {
			var objects = angular.fromJson($window.localStorage[key] || '{}');
			for (var i = 0; i < objects.length; i++) {
				if (objects[i].guid == guid) {
					return objects[i];
				}
			}
			return -1;
		},
		getCurrencyObject : function (symbol) {
			var objects = angular.fromJson($window.localStorage['currencies'] || '{}');
			for (var i = 0; i < objects.length; i++) {
				if (objects[i].symbol == symbol) {
					return objects[i];
				}
			}
			return -1;
		},
		getObjectById : function (key, id) {
			var objects = angular.fromJson($window.localStorage[key] || '{}');
			for (var i = 0; i < objects.length; i++) {
				if (objects[i].id == id) {
					return objects[i];
				}
			}
			return -1;
		},
		removeObject : function (key, guid) {
			var objects = angular.fromJson($window.localStorage[key] || '{}');
			for (var i = 0; i < objects.length; i++) {
				if (objects[i].guid == guid) {
					objects.splice(i, 1);
					$window.localStorage[key] = angular.toJson(objects);
					return;
				}
			}
		},
		updateObject : function (key, value) {
			var objects = angular.fromJson($window.localStorage[key] || '{}');
			for (var i = 0; i < objects.length; i++) {
				if (objects[i].guid == value.guid) {	
					objects[i] = value;
					$window.localStorage[key] = angular.toJson(objects);
					return;
				}
			}
		}
	}
}]);
angular.module('starter.services', [])

// API: Get the current url form the server
.factory('GetCurrentUrl', function ($http) {
	return {
		get : function (targetServer, companyId) {
			var url = "https://ssl.hrworks.de/cgi-bin/hrw.dll/" + targetServer + "/HrwGetCurrentUrl";
			var jsonObject = {};
			jsonObject.companyId = companyId;
			return $http({
				url : url,
				method : "POST",
				data : angular.toJson(jsonObject),
				headers : {
					'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
				}
			})
		}
	}
})

// API
.factory('ApiRequester', function ($q, $localstorage, $http, $cordovaDevice, $translate, $ionicPopup, GetCurrentUrl) {
	var translationsArray = [];
	$translate(['NOANSWERFROMTHESERVER_TITLE', 'NOANSWERFROMTHESERVER_TEMPLATE']).then(function (translations) {
		translationsArray["NOANSWERFROMTHESERVER_TITLE"] = translations.NOANSWERFROMTHESERVER_TITLE;
		translationsArray["NOANSWERFROMTHESERVER_TEMPLATE"] = translations.NOANSWERFROMTHESERVER_TEMPLATE;
	})
	generateSignature = function (companyId, personId, request, timeStamp, password) {
		var generatedString = companyId + "\r\n" + personId + "\r\n" + timeStamp + "\r\n" + request + "\r\n";
		return rstr2b64(rstr_hmac_sha1(str2rstr_utf8(password), rstr_sha1(str2rstr_utf8(generatedString))));
	}
	createApiRequestObject = function(user, request) {
		var apiVersion = "1";
		requestObject = {};
		requestObject.companyId = user.companyId;
		requestObject.personId = user.personId;
		requestObject.dateAndTime = (new Date()).toISO8601();
		requestObject.mobileApplicationAuthorization = "HRworksMobileApp";
		requestObject.deviceId = $cordovaDevice.getUUID();
		requestObject.deviceName = $cordovaDevice.getModel();
		requestObject.languageKey = $translate.use();
		requestObject.version = apiVersion;
		requestObject.isCharsetUtf8 = true;
		requestObject.signature = generateSignature(requestObject.companyId, requestObject.personId, request, requestObject.dateAndTime, user.mobilePassword);
		return requestObject;
	}
	get = function (type, url) {
		var userData = $localstorage.getObjects('user');
		correctReceipts = function (receipts) {
			var newReceipts = [];
			for (var i = 0; i < receipts.length; i++) {
				var theNewReceipt = receipts[i];
				theNewReceipt.date = theNewReceipt.date.replace(/-/g, "");
				if(typeof theNewReceipt.currency !== 'undefined') {
					theNewReceipt.currency = theNewReceipt.currency.symbol;
				}
				if(typeof theNewReceipt.kindOfPayment !== 'undefined') {
					theNewReceipt.kindOfPayment = theNewReceipt.kindOfPayment.id;
				}
				if(typeof theNewReceipt.receiptKind !== 'undefined') {
					if (theNewReceipt.receiptKind.isHotel) {
						theNewReceipt.endDate = theNewReceipt.endDate.replace(/-/g, "");
					}
					theNewReceipt.receiptKind = theNewReceipt.receiptKind.id;
				}
				newReceipts.push(theNewReceipt);
			}
			return newReceipts;
		}
		var apiName = "HrwGet" + type + "Api";
		if (type == "Receipts") {
			apiName = "HrwSynchronizeImportReceiptsApi";
		}
		var apiUrl = url + apiName;
		var request = apiName + " class";
		var requestObject = createApiRequestObject(userData, request);
		if (type == "Receipts") {
			requestObject.importReceipts = correctReceipts($localstorage.getObjects('receipts'));;
		}
		return $http({
			url : apiUrl,
			method : "POST",
			data : angular.toJson(requestObject),
			headers: {
				'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
			}
		});
	};
	changeReceiptObject = function (receipts) {
		updatedReceiptsCollection = new Array();
		// TODO was passier bei hotelbeleg mit leerem endDatum
		changeDate = function (theDate) {
			year = theDate.substr(0, 4);
			month = theDate.substr(4, 2);
			day = theDate.substr(6, 2);
			return year + "-" + month + "-" + day;
		}
		for (var i = 0; i < receipts.length; i++) {
			receipt = receipts[i];
			receipt.receiptKind = $localstorage.getObjectById('receiptKinds', receipt.receiptKind);
			receipt.currency = $localstorage.getCurrencyObject(receipt.currency);
			receipt.kindOfPayment = $localstorage.getObjectById('kindsOfPayment', receipt.kindOfPayment);
			receipt.date = changeDate(receipt.date);
			if(typeof receipt.receiptKind !== 'undefined') {
				if (receipt.receiptKind.isHotel) {
					receipt.endDate = changeDate(receipt.endDate);
				}
			}
			updatedReceiptsCollection.push(receipt);
		}
		return updatedReceiptsCollection;
	}
	return {
		synchroniseAll : function () {
			noConnectionToTheServer = function (data) {
				deferred.resolve(data);
				$ionicPopup.alert({
					title : translationsArray["NOANSWERFROMTHESERVER_TITLE"],
					template : translationsArray["NOANSWERFROMTHESERVER_TEMPLATE"]
				});
				return deferred.promise;
			}
			var deferred = $q.defer();
			var userData = $localstorage.getObjects('user');
			// URL is the GetCurrentUrl.get request
			var url = GetCurrentUrl.get(userData.targetServer, userData.companyId);
			console.log(url);
			url.success(function (data, status, headers, config) {
				get('KindsOfPayment', data.url).success(function (data, status, headers, config) {
					$localstorage.setObject('kindsOfPayment', data.result);
				}).error(function (data, status, headers, config) {
					noConnectionToTheServer(data);
				}).then(function () {
					get('ReceiptKinds', data.url).success(function (data, status, headers, config) {
						$localstorage.setObject('receiptKinds', data.result);
					}).error(function (data, status, headers, config) {
						noConnectionToTheServer(data);
					}).then(function () {
						get('Currencies', data.url).success(function (data, status, headers, config) {
							$localstorage.setObject('currencies', data.result);
						}).error(function (data, status, headers, config) {
							noConnectionToTheServer(data);
						}).then(function () {
							get('Receipts', data.url).success(function (data, status, headers, config) {
								updatedReceipts = changeReceiptObject(data.result);
								$localstorage.setObject('receipts', updatedReceipts);
								deferred.resolve(data);
							}).error(function (data, status, headers, config) {
								noConnectionToTheServer(data);
							})
						})
					})
				})
			}).error(function (data, status, headers, config) {
				return;
			});
			return deferred.promise;
		},
		userLogout : function (user) {
			var url = GetCurrentUrl.get(user.targetServer, user.companyId);
			var request = "HrwCheckOutDeviceApi class";
			requestObject = createApiRequestObject(user, request);
			url.success(function (data, status, headers, config) {
				$http({
					url : data.url + "HrwCheckOutDeviceApi",
					method : "POST",
					data : angular.toJson(requestObject),
					headers : {
						'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
					}
				})
			})
		},
		userLogin : function (user) {
			var deferred = $q.defer();
			var url = GetCurrentUrl.get(user.targetServer, user.companyId);
			var request = "HrwRegisterDeviceApi class";
			requestObject = createApiRequestObject(user, request);
			url.success(function (data, status, headers, config) {
				$http({
					url : data.url + "HrwRegisterDeviceApi",
					method : "POST",
					data : angular.toJson(requestObject),
					headers : {
						'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
					}
				}).success(function (data, status, headers, config) {
					deferred.resolve(data);
				}).error(function () {
					deferred.resolve(data);
					return deferred.promise;
				})
			}).error(function (data, status, headers, config) {
				$ionicPopup.alert({
					title : translationsArray["NOANSWERFROMTHESERVER_TITLE"],
					template : translationsArray["NOANSWERFROMTHESERVER_TEMPLATE"]
				});
				deferred.resolve(data);
				return deferred.promise;
			});
			return deferred.promise;
		}
	}
});
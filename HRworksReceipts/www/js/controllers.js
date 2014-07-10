angular.module('starter.controllers', ['ionic'])

.controller('loginCtrl', function($scope, $state, $localstorage, $timeout, $ionicPopup, getData) {
	$scope.user = {};
	$scope.user.companyId = "jaco";
	$scope.user.personId = "jaco";
	$scope.user.mobilePassword = "hjpjpkf";
	$scope.user.targetServer = "area51-0";
	$scope.login = function (user) {
		var promise = getData.userLogin(user);
		promise.then(function(success) {
			if(success.errors.length == 0) {
				console.log(success);
				console.log(success.result);
				console.log(success.result.person);
				$scope.user.person = success.result.person;
				$localstorage.setObject("user", user);
				$state.go("tab.receipts");
			} else {
				if(success.errors[0].errorId == "8") {
					$ionicPopup.alert({
						title: 'Fehler bei der Anmeldung:',
						template: 'Die Anmeldedaten sind fehlerhaft!'
					});
				} else {
					console.log(success.errors[0]);
				}
			}
		}, function(failed) {
			console.log(failed);
		});		   
	};
})
.controller('receiptCtrl', function ($scope, $localstorage, $location, $ionicViewService, $filter, $ionicActionSheet, $state, $ionicPopup, $ionicModal, $timeout, $stateParams) {
	
	$localstorage.setObject('copyGUID', new Array());
	var tabs = document.querySelectorAll('div.tabs')[0];
	tabs = angular.element(tabs);
	angular.element(document).find('ion-content').addClass('remove-tabs');
	tabs.css('display', 'none');
	$scope.$on('$destroy', function() {
		tabs.css('display', '');
		
	});
	console.log($ionicViewService);
	$scope.receiptKinds = $localstorage.getObjects('receiptKinds');
	$scope.kindsOfPayment = $localstorage.getObjects('kindsOfPayment');
	$scope.currencies = $localstorage.getObjects('currencies');
	$scope.form = {};
	$scope.form.date = $filter('date')(new Date(), 'yyyy-MM-dd');
	$scope.form.currency = $localstorage.getObjects('lastCurrency');
	$scope.form.persons = $localstorage.getObjects('user').person + ',';
	$scope.form.kindOfPayment = "";
	$scope.form.receiptKind = "";
	$scope.form.amount = "0.00";
	if ($stateParams.guid != "new") {
		$scope.form = $localstorage.getObject('receipts', $stateParams.guid);
		$scope.receiptTitle = "Beleg Bearbeiten";
	} else {
		$scope.receiptTitle = "Neuer Beleg";
	}
	$scope.changeit = function (val) {
		val = val.toString();
		var period = val.indexOf(".");
		if (period > -1) {
			val = val.substring(0, period) + val.substring(period + 1)
		}
		var len = val.length;
		while (len < 3) {
			val = "0" + val;
			len = val.length;
		}
		val = val.substring(0, len - 2) + "." + val.substring(len - 2, len);
		while (val.length > 4 && (val[0] == 0 || isNaN(val[0]))) {
			val = val.substring(1)
		}
		if (val[0] == ".") {
			val = "0" + val
		}
		$scope.form.amount = val;
	};
	$scope.generateGUID = function () {
		var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
				var r = Math.random() * 16 | 0,
				v = c == 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
		return guid;
	};
	$scope.textRequiredError = function () {
		$ionicPopup.alert({
			title : '<b>Bezeichnung:</b>',
			content : "Dieses Feld ist ein Pflichfeld"
		});
	};
	$scope.isEdit = function () {
		if ($stateParams.guid != "new") {
			return true;
		}
	};
	$scope.saveCopyReceipt = function () {
		theReceiptCopy = {
			text : $scope.form.text,
			amount : parseFloat($scope.form.amount),
			date : $scope.form.date,
			receiptKind : $scope.form.receiptKind,
			kindOfPayment : $scope.form.kindOfPayment,
			currency : $scope.form.currency,
			timeStamp : $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ss.sssZ'),
			guid : $scope.generateGUID()
		};
		if($scope.form.receiptKind.isHotel == true) {
			theReceiptCopy.endDate = $scope.form.endDate;
		}
		if($scope.form.receiptKind.isBusinessEntertainment == true) {
			theReceiptCopy.reason = $scope.form.reason;
			theReceiptCopy.persons = $scope.form.persons;
			theReceiptCopy.place = $scope.form.place;
		}
		theReceiptCopy.guid = $stateParams.guid;
		$localstorage.updateObject('receipts', theReceiptCopy);
		theReceiptCopy.guid = $scope.generateGUID();
		theReceiptCopy.text = 'Kopie von ' + $scope.form.text;
		theReceiptCopy.timeStamp = $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ss.sssZ');
		$localstorage.insertObject('receipts', theReceiptCopy);
		$localstorage.setObject('copyGUID', {
			guid : theReceiptCopy.guid
		});
		$scope.$viewHistory.backView.go();
	};
	$scope.hideData = {};
	$scope.setHideAlert = function () {
		$localstorage.setObject('hideAlert', {
			hideAlert : true
		});
	};
	$scope.showActionsheet = function () {
		$ionicActionSheet.show({
			titleText : 'Belegoptionen:',
			buttons : [{
					text : '<i class="icon ion-ios7-copy-outline"></i> Kopieren'
				},
			],
			destructiveText : 'L&ouml;schen',
			cancelText : 'Abbrechen',
			scope : $scope,
			buttonClicked : function (index) {
				if (index == 0) {
					if (!$scope.form.text || !$scope.form.amount || !$scope.form.date
						 || !$scope.form.receiptKind || !$scope.form.kindOfPayment || !$scope.form.currency) {
						$ionicPopup.alert({
							title : '<b>Fehler:</b>',
							content : 'Der Beleg konnte nicht kopiert werden, da nicht alle Felder ausgef&uuml;llt sind.'
						});
						return true;
					} else {
						if($localstorage.getObjects('hideAlert').hideAlert == true) {
							$scope.saveCopyReceipt();
							return true;
						} else {
							var confirmPopup = $ionicPopup.show({
								title : '<b>Beleg kopieren:</b>',
								template : 'Der Beleg wird gespeichert und kopiert! Wollen Sie diese Aktion durchf&uuml;hren?<br><input type="checkbox" ng-model="hideData.hideAlert"><font size="2"> Diese Meldung nicht mehr anzeigen.</font>',
								scope : $scope,
								buttons : [{
										text : 'Abbrechen',
										onTap : function (e) {
											return 1;
										}
									}, {
										text : '<b>OK</b>',
										type : 'button-positive',
										onTap : function (e) {
											if (typeof $scope.hideData.hideAlert === "undefined") {
												return 2;
											} else {
												return 3;
											}
										}
									},
								]
							});
						confirmPopup.then(function (res) {
							if (res == 1) {
								return true;
							}
							if (res == 3) {
								$scope.setHideAlert();
							}
							$scope.saveCopyReceipt();						
						})
						return true;
					}
				}
				}
			},
			destructiveButtonClicked : function () {
				console.log($scope.form.guid);
				$localstorage.removeObject('receipts', $scope.form.guid);
				$scope.$viewHistory.backView.go();
			}
		});
	};
	$scope.saveReceipt = function () {
		var errorMessage = "";
		if (!$scope.form.text) {}
		if (!$scope.form.amount) {
			errorMessage = errorMessage + "" + "Betrag<br>";
		}
		if (!$scope.form.date) {
			errorMessage = errorMessage + "" + "Datum<br>";
		}
		if (!$scope.form.receiptKind) {
			errorMessage = errorMessage + "" + "Belegart<br>";
		}
		if (!$scope.form.kindOfPayment) {
			errorMessage = errorMessage + "" + "Zahlungsart<br>";
		}
		if (!$scope.form.currency) {
			errorMessage = errorMessage + "" + "Währung<br>";
		}
		if (errorMessage.length > 0) {
			$ionicPopup.alert({
				title : '<b>Folgende Eingaben fehlen oder sind fehlerhaft:</b>',
				content : errorMessage
			});
		} else {
			theReceipt = {
				text : $scope.form.text,
				amount : parseFloat($scope.form.amount),
				date : $scope.form.date,
				receiptKind : $scope.form.receiptKind,
				kindOfPayment : $scope.form.kindOfPayment,
				currency : $scope.form.currency,
				timeStamp : $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ss.sssZ'),
			};
			if($scope.form.receiptKind.isHotel == true) {
				theReceipt.endDate = $scope.form.endDate;
			}
			if($scope.form.receiptKind.isBusinessEntertainment == true) {
				theReceipt.reason = $scope.form.reason;
				theReceipt.persons = $scope.form.persons;
				theReceipt.place = $scope.form.place;
			}
			if ($stateParams.guid == "new") {
				theReceipt.guid = $scope.generateGUID();
				$localstorage.insertObject('receipts', theReceipt);
			} else {
				theReceipt.guid = $stateParams.guid;
				$localstorage.updateObject('receipts', theReceipt);
			}
			$localstorage.setObject('lastCurrency', $scope.form.currency);
			if ($scope.$viewHistory.backView != null) {
				$scope.$viewHistory.backView.go();
			}
		}
	};
	// Currencie Modal
	$ionicModal.fromTemplateUrl('currencies-modal.html', {
		scope : $scope,
		animation : 'slide-in-up'
	}).then(function (modal) {
		$scope.CurrenciesModal = modal;
	});
	$scope.data = {
		showListCurrencies : false,
		showListReceiptKinds : false,
		showListkindsOfPayment : false,
		searchQueryCurrencies : "",
		searchQueryReceiptKinds : "",
		searchQueryKindsOfPayment : ""
	};
	$scope.openCurrenciesModal = function () {

		$scope.CurrenciesModal.show();
		$timeout(function () {
			$scope.showListCurrencies = true;
		}, 100)
		$timeout(function() {
			document.getElementById('currenciesSearch').focus();
		}, 0);
	};
	$scope.closeCurrenciesModal = function () {
		$scope.CurrenciesModal.hide();
	};
	$scope.type = true;
	$scope.setType = function (event) {
		if (angular.element(event.target).text() == "Favoriten") {
			$scope.type = true;
		} else {
			$scope.type = '';
		}
	};
	$scope.clearSearchCurrencies = function () {
		$scope.data.searchQueryCurrencies = '';
	};

	$scope.selectCurrency = function (currency) {
		$scope.form.currency = currency;
		$scope.closeCurrenciesModal();
	};
	// receiptKinds Modal
	$ionicModal.fromTemplateUrl('receiptKinds-modal.html', {
		scope : $scope,
		animation : 'slide-in-up'
	}).then(function (modal) {
		$scope.receiptKindsModal = modal;
	});

	$scope.openReceiptKindsModal = function () {
		$scope.receiptKindsModal.show();
		$timeout(function () {
			$scope.showListReceiptKinds = true;
		}, 100)
		$timeout(function() {
			document.getElementById('receiptKindsSearch').focus();
		}, 0);
	};
	$scope.closeReceiptKindsModal = function () {
		$scope.receiptKindsModal.hide();
	};
	$scope.clearSearchReceiptKinds = function () {
		$scope.data.searchQueryReceiptKinds = '';
	};
	$scope.selectReceiptKind = function (receiptKind) {
		$scope.form.receiptKind = receiptKind;
		$scope.closeReceiptKindsModal();
	};
	// KindsOfPayment Modal
	$ionicModal.fromTemplateUrl('kindsOfPayment-modal.html', {
		scope : $scope,
		animation : 'slide-in-up'
	}).then(function (modal) {
		$scope.kindsOfPaymentModal = modal;
	});
	$scope.data = {};
	$scope.openKindsOfPaymentModal = function () {
			$scope.kindsOfPaymentModal.show();
			$timeout(function () {
				$scope.showListKindsOfPayment = true;
			}, 100);
			$timeout(function() {
			document.getElementById('kindsOfPaymentSearch').focus();
			}, 0);
		};
	$scope.closeKindsOfPaymentModal = function () {
		$scope.kindsOfPaymentModal.hide();
	};
	$scope.clearSearchKindsOfPayment = function () {
		$scope.data.searchQueryKindsOfPayment = '';
	};
	$scope.selectKindOfPayment = function (kindOfPayment) {
		$scope.form.kindOfPayment = kindOfPayment;
		$scope.closeKindsOfPaymentModal();
	};
	$scope.go = function (hash) {
		$location.path(hash);
	}
})

.controller('receiptsCtrl', function ($scope, $timeout, $localstorage, $ionicLoading, $location, $state, getData) {
	if (typeof $localstorage.getObjects('user').personId === 'undefined') {
		$state.go('login');
	}
	if (typeof $localstorage.getObjects('copyGUID').guid !== 'undefined') {
		$location.path('/tab/receipt/' + $localstorage.getObjects('copyGUID').guid);
	}
	$scope.go = function (hash) {
		$location.path(hash);
	}
	$scope.receipts = $localstorage.getObjects('receipts');
	$scope.doSync = function () {
		getData.all();
		$ionicLoading.show({
			template : 'Synchronisieren...',
			duration : '1000'
		});
	$timeout(function() {
		$scope.receipts = $localstorage.getObjects('receipts');
	},1000); 
	}
	$scope.doRefresh = function () {
        console.log("start doRefresh");
		getData.all();
        $timeout(function() {
            $scope.$broadcast('scroll.refreshComplete');
			$scope.receipts = $localstorage.getObjects('receipts');
			console.log("done");
        },1000);     
	};
	$scope.hide = function () {
		$ionicLoading.hide();
	};
	$timeout(function() {
		if ($localstorage.getObjects('currencies').length == 0) {
		$scope.doSync();
		}
	}, 200);
	$scope.removeReceipt = function (guid) {
		var x = $localstorage.getIndex('receipts', guid);
		$scope.receipts.splice(x, 1);
		$localstorage.removeObject('receipts', guid);
	};
})

.controller('settingsCtrl', function ($scope, $http, $localstorage, $filter, $translate, getData) {
	$scope.form = {};
	$scope.form.companyId = "ClassWare";
	$scope.form.personId = "hum";
	$scope.form.mobilePassword = "tevfw5h";
	$scope.form.targetServer = "area51-0";
	$scope.saveSettings = function() {
		getData.all();
		$localstorage.setObject('user', $scope.form);
	};
	$scope.type = true;
	$scope.changeLang = function (key, event) {
		if (angular.element(event.target).hasClass('de')) {
			$scope.type = true;
		} else {
			$scope.type = '';
		}
		$translate.use(key).then(function (key) {
		console.log("Sprache zu " + key + " gewechselt.");
		}, function (key) {
		console.log("Irgendwas lief schief.");
		});
	};
	$scope.sendPostRequest = function() {
		var expectedSignature = "meuWFCJcq7q1EUjHMKc1df3SEG4="
		var signature = $scope.generateSignature(
			"acme",								// companyId
			"joe",								// personId
			"HrwGetKindsOfPaymentApi class",	// request
			"2012-05-10T14:02:39.533+02:00",	// timeStamp string
			"QUXW72V");							// mobilePassword
		if (expectedSignature == signature)
			alert("calculation correct \n"
				+ signature);
		else
			alert("Error: expected: " + expectedSignature + "\n"
			+ "calculated: " + signature);
	};
	$scope.generateSignature = function (companyId, personId, request, timeStamp, password) {
		var generatedString = companyId + "\r\n" + personId + "\r\n" + timeStamp + "\r\n" + request + "\r\n";
		return rstr2b64(rstr_hmac_sha1(str2rstr_utf8(password), rstr_sha1(str2rstr_utf8(generatedString))));
	};
	$scope.postRequestSucceed = function (data, textStatus, jqXHR) {
		alert("" + JSON.stringify(data));
		console.log(data);
	};
	$scope.sendPostRequest = function () {
		var api = "HrwGetCurrenciesApi";
		var url = "https://ssl.hrworks.de/cgi-bin/hrw.dll/" + $scope.form.targetServer + "/" + api;
		var request = api + " class";
		var password = $scope.form.mobilePassword;
		var jsonObject = {};

		// Create the json object
		jsonObject.companyId = $scope.form.companyId;
		jsonObject.personId = $scope.form.personId;
		jsonObject.dateAndTime = (new Date()).toISO8601();
		jsonObject.mobileApplicationAuthorization = "HRworksMobileApp";
		jsonObject.deviceId = "1";
		jsonObject.languageKey = "de";
		jsonObject.version = "1";
		jsonObject.signature = $scope.generateSignature(jsonObject.companyId, jsonObject.personId, request, jsonObject.dateAndTime, password);

		console.log(jsonObject);
		console.log(JSON.stringify(jsonObject));
		
		$http({
            url: url,
            method: "POST",
            data: JSON.stringify(jsonObject),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
			}).success(function (data, status, headers, config) {
                $scope.persons = data; // assign  $scope.persons here as promise is resolved here 
            }).error(function (data, status, headers, config) {
                $scope.status = status;
			});
	}; 
	generateGUID = function () {
		var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
				var r = Math.random() * 16 | 0,
				v = c == 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
		return guid;
	};
	$scope.create100Receipts = function () {
		for (var i = 0; i < 100; i++) {
			$localstorage.insertObject('receipts', {
				text : 'Beleg' + i,
				amount : "123",
				date : '2012-03-04',
				receiptKind : {
					description : "Bewirtung 100%",
					id : "2",
					isBusinessEntertainment : false,
					isHotel : false
				},
				kindOfPayment : {
					description : "Amex Privat",
					id : "1"
				},
				currency : {
					description : "Euro",
					isPreferred : true,
					symbol : "EUR"
				},
				timeStamp : $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ss.sssZ'),
				guid : generateGUID()
			});
		}
	}
})

.controller('infosCtrl', function ($scope) {
})

.controller('updateReceiptCtrl', function ($scope, $localstorage, $stateParams) {
	console.log($localstorage.getObject('receipts', $stateParams.guid));
});

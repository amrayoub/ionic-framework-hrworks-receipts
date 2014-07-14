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
	$scope.receiptKinds = $localstorage.getObjects('receiptKinds');
	$scope.kindsOfPayment = $localstorage.getObjects('kindsOfPayment');
	$scope.currencies = $localstorage.getObjects('currencies');
	$scope.form = {};
	$scope.form.date = $filter('date')(new Date(), 'yyyy-MM-dd');
	$scope.form.currency = $localstorage.getObjects('lastCurrency');
	$scope.form.persons = "";
	$scope.form.persons = $localstorage.getObjects('user').person + ',';
	$scope.form.kindOfPayment = "";
	$scope.form.receiptKind = "";
	if ($stateParams.guid != "new") {
		$scope.form = $localstorage.getObject('receipts', $stateParams.guid);
		$scope.receiptTitle = "Beleg Bearbeiten";
	} else {
		$scope.receiptTitle = "Neuer Beleg";
	}
	$scope.selectAmountInputType = function () {
		if(ionic.Platform.isIOS()) {
			return "number";
		}
		if(ionic.Platform.isAndroid()) {
			return "text";
		}
		return "text";
	}
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
	$scope.amountValid = function() {
		var regex  = /^(\d+(?:[\.\,]\d{0,2})?)$/;
		if (!regex.test($scope.form.amount) && typeof $scope.form.amount !== 'undefined' ) {
			return false;
		}
		return true;
	}
	$scope.personsValid = function() {
		if($scope.form.receiptKind.isBusinessEntertainment == true) {
			if($scope.form.persons.length > 0) {
				var thePersonsArray = $scope.form.persons.split(",");
				theNewPersonsArray = [];
				for(var i = 0;	i < thePersonsArray.length; i++) {
					if (thePersonsArray[i] !== "" && thePersonsArray[i] !== null) {
						theNewPersonsArray.push(thePersonsArray[i]);
					}
				}
				if (theNewPersonsArray.length < 2) {
					return false;
				} else {
					return true;
				}
			}
		}
	}
	$scope.saveReceipt = function () {
		$scope.form.amount = $scope.form.amount.toString().replace(",",".");
		var error = false;
		if ($scope.form.date > $scope.form.endDate) {
			error =  true;
		}
		if ($scope.amountValid() == false) {
			error = true;
		}
		if ($scope.personsValid() == false) {
			error = true;
		}
		if (error == false) {
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
	$ionicModal.fromTemplateUrl('templates/currencies-modal.html', {
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
		}, 100);
		$timeout(function() {
			document.getElementById('currenciesSearch').focus();
		}, 100);
	};
	$scope.closeCurrenciesModal = function () {
		$scope.CurrenciesModal.hide();
	};
	$scope.type = true;
	$scope.setType = function (event) {
		if (angular.element(event.target).hasClass('fav')) {
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
	$ionicModal.fromTemplateUrl('templates/receiptKinds-modal.html', {
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
		}, 100);
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
	$ionicModal.fromTemplateUrl('templates/kindsOfPayment-modal.html', {
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
		}, 100);
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

.controller('settingsCtrl', function ($ionicPopup, $state, $scope, $http, $localstorage, $filter, $translate, getData) {
	$scope.form = {};
	$scope.form.companyId = "jaco";
	$scope.form.personId = "jaco";
	$scope.form.mobilePassword = "hjpjpkf";
	$scope.form.targetServer = "area51-0";
	$scope.saveSettings = function() {
		$scope.saveSettings = function() {
		getData.all();
		$localstorage.setObject('user', $scope.form);
		}
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
	$scope.postRequestSucceed = function (data, textStatus, jqXHR) {
		alert("" + JSON.stringify(data));
		console.log(data);
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
				amount : 123,
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

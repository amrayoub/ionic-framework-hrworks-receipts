angular.module('starter.controllers', ['ionic'])

// Controller of the Receipt View
.controller('receiptCtrl', function ($scope, $localstorage, $filter, $ionicActionSheet, $ionicPopup, $ionicModal, $timeout, $stateParams, $translate) {
	$translate(['EDIT_RECEIPT', 'NEWRECEIPT', 'OPTIONS', 'COPY', 'ERROR', 'COPYRECEIPT_ERROR', 'COPYRECEIPT', 'COPYRECEIPT_INFO', 'CANCEL', 'OK', 'SAVE', 'CHOOSE_DATE', 'DELETE', 'COPYOF', 'DELETERECEIPT', 'DELETERECEIPT_TEMPLATE', 'YES', 'NO']).then(function (translations) {

		// Clears the copyGUID of the localStorage
		$localstorage.setObject('copyGUID', new Array());

		// HACK: removes the tabs in the view. Update if there is a better way
		angular.element(document.querySelectorAll('div.tabs')[0]).addClass('hide-on-keyboard-open');
		
		// Put the data form the localStorage into the scope
		$scope.receiptKinds = $localstorage.getObjects('receiptKinds');
		$scope.kindsOfPayment = $localstorage.getObjects('kindsOfPayment');
		$scope.currencies = $localstorage.getObjects('currencies');
		$scope.form = {};
		if($translate.use() == "de") {
			$scope.form.amount = "0,00";
			$scope.dateFormat = 'dd.MM.yyyy';
		} else {
			$scope.form.amount = "0.00";
			scope.dateFormat = 'MM/dd/yyyy';
		}
		$scope.form.date = $filter('date')(new Date(), 'yyyy-MM-dd');
		$scope.form.currency = $localstorage.getObjects('lastCurrency');
		$scope.form.persons = "";
		$scope.form.persons = $localstorage.getObjects('user').person + ', ';
		$scope.showAlternativeDatepicker = $localstorage.getObjects('user').alternativeDatepicker;
		$scope.form.kindOfPayment = "";
		var kindsOfPaymentCollection = $localstorage.getObjects('kindsOfPayment');
		$scope.form.kindOfPayment = kindsOfPaymentCollection[0];
		for (var j = 0; j < kindsOfPaymentCollection.length; j++) {
			if (kindsOfPaymentCollection[j].description == "Bar Privat" || kindsOfPaymentCollection[j].description == "Cash private" ) {
				$scope.form.kindOfPayment = kindsOfPaymentCollection[j];
				break;
			}
		}
		$scope.form.receiptKind = "";
		$scope.amountTransformer = function (amount) {
			amount = amount.toString();
			dotOrComma = ".";
			if($translate.use() == "de") {
				var dotOrComma = ",";
			}
			var period = amount.indexOf(dotOrComma);
			if (period > -1) {
				amount = amount.substring(0, period) + amount.substring(period + 1);
			}
			var amountLength = amount.length;
			while (amountLength < 3) {
				amount = "0" + amount;
				amountLength = amount.length;
			}
			amount = amount.substring(0, amountLength - 2) + dotOrComma + amount.substring(amountLength - 2, amountLength);
			while (amount.length > 4 && (amount[0] == 0 || isNaN(amount[0]))) {
				amount = amount.substring(1);
			}
			if (amount[0] == dotOrComma) {
				amount = "0" + amount;
			}
			if(amount.charAt(amount.length-1) == "," || amount.charAt(amount.length-1) == ".") {
				amount = amount.replace(".", "");
				amount = amount.replace(",", "");
			}
			$scope.form.amount = amount;
		};
		
		// Return true if there is a GUID of a receipt
		$scope.isEdit = function () {
			return $stateParams.guid != "new";
		}

		// Set the title of the view

		if ($scope.isEdit()) {
			$scope.form = $localstorage.getObject('receipts', $stateParams.guid);
			$scope.form.amount = $filter('number')($scope.form.amount, 2);
			$scope.receiptTitle = translations.EDIT_RECEIPT;
		} else {
			$scope.receiptTitle = translations.NEWRECEIPT;
		}
		$scope.form.endDate = $filter('date')(new Date(), 'yyyy-MM-dd');
		$scope.openDatePicker = function(inputName) {
			$scope.tmp = {};
			$scope.tmp.datePickerDate = new Date();
			$scope.tmp.datePickerDate.setFullYear($scope.form.date.slice(0,4));
			$scope.tmp.datePickerDate.setMonth($scope.form.date.slice(5,7)-1);
			$scope.tmp.datePickerDate.setDate($scope.form.date.slice(8,10));
			if(inputName == "endDate") {
				$scope.tmp.datePickerDate.setFullYear($scope.form.endDate.slice(0,4));
				$scope.tmp.datePickerDate.setMonth($scope.form.endDate.slice(5,7)-1);
				$scope.tmp.datePickerDate.setDate($scope.form.endDate.slice(8,10));
			}
			$ionicPopup.show({
				template: "<datetimepicker ng-model='tmp.datePickerDate'></datetimepicker>",
				title : translations.CHOOSE_DATE,
				scope: $scope,
				buttons: [{ 
						text: translations.CANCEL, 
					},{
						text: translations.SAVE,
						type: 'button-positive',
						onTap: function(e) {
							var theDate = $scope.tmp.datePickerDate;
							theDate = theDate.getFullYear() + '-' + ('0' + (theDate.getMonth()+1)).slice(-2) + '-' + ('0' + theDate.getDate()).slice(-2);
							if(inputName == "date") {
								$scope.form.date = theDate;
							}
							if(inputName == "endDate") {
								$scope.form.endDate = theDate;
							}
						}
					}
				]
			});
		}

		// Create a GUID
		$scope.generateGUID = function () {
			var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
				var r = Math.random() * 16 | 0,
				v = c == 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
			return guid;
		}

		// Write into the localeStorage that the user doesn't want to see the info altert again
		$scope.hideData = {};
		$scope.setHideAlert = function () {
			$localstorage.setObject('hideAlert', {
				hideAlert : true
			});
		};

		// Show the ActionSheet with the options
		$scope.showActionsheet = function () {
			$ionicActionSheet.show({
				titleText : translations.OPTIONS,
				buttons : [{
						text : "<i class='icon ion-ios7-copy-outline'></i> " + translations.COPYRECEIPT
					},
				],				
				destructiveText : translations.DELETE,
				cancelText : translations.CANCEL,
				scope : $scope,
				buttonClicked : function (index) {
					if (index == 0) {
						if(angular.element(document.querySelectorAll('form')).hasClass('ng-invalid')) {
							$ionicPopup.alert({
								title : "<b>" + translations.COPYRECEIPT + "</b>",
								content : translations.COPYRECEIPT_ERROR
							});
							return;
						}
						
						if ($localstorage.getObjects('hideAlert').hideAlert) {
							$scope.saveReceipt(true, true);
							return;
						} else {
							var confirmPopup = $ionicPopup.show({
								title : "<b>" + translations.COPYRECEIPT + "</b>",
								template : translations.COPYRECEIPT_INFO,
								scope : $scope,
								buttons : [{
									text : "<b>" + translations.OK + "</b>",
									type : "button-positive",
									onTap : function (e) {
										console.log("!");
										if (typeof $scope.hideData.hideAlert !== "undefined") {
											$scope.setHideAlert();
										}
										$scope.saveReceipt(true, true);	
									}
								}, {
									text : translations.CANCEL,
									onTap : function (e) {
										return;
									}
								}
							]
						});
						return;
					}
				}
			},
				destructiveButtonClicked : function () {
					$ionicPopup.show({
						title : "<b>" + translations.DELETERECEIPT + "</b>",
						template : translations.DELETERECEIPT_TEMPLATE,
						scope : $scope,
						buttons : [{
								text : "<b>" + translations.YES + "</b>",
								type : "button-positive",
								onTap : function (e) {
									$localstorage.removeObject('receipts', $scope.form.guid);
									$scope.$viewHistory.backView.go();
								}
							}, {
								text : translations.NO,
								onTap : function (e) {
									return true;
								}
							}
						]
					});
				}
			});
		}
		// Check if the person input is valid
		$scope.personsValid = function () {
			if ($scope.form.receiptKind.isBusinessEntertainment) {
				if ($scope.form.persons.length > 0) {
					var thePersonsArray = $scope.form.persons.split(",");
					theNewPersonsArray = [];
					for (var i = 0; i < thePersonsArray.length; i++) {
						if (thePersonsArray[i] !== "" && thePersonsArray[i] !== null) {
							theNewPersonsArray.push(thePersonsArray[i]);
						}
					}
					if (theNewPersonsArray.length >= 2) {
						return false;
					} else {
						return true;
					}
				} else {
					return true;
				}
			}
		}

		// Save receipt
		$scope.submitted = false;
		$scope.saveReceipt = function(isValid, isCopy) {
			$scope.submitted = true;
			if (isValid) {
				$scope.form.amount = $scope.form.amount.toString().replace(",", ".");
				theReceipt = {
					text : $scope.form.text,
					amount : parseFloat($scope.form.amount),
					date : $scope.form.date,
					receiptKind : $scope.form.receiptKind,
					kindOfPayment : $scope.form.kindOfPayment,
					currency : $scope.form.currency,
					timeStamp : $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ss.sssZ'),
				};
				if ($scope.form.receiptKind.isHotel) {
					theReceipt.endDate = $scope.form.endDate;
				}
				if ($scope.form.receiptKind.isBusinessEntertainment) {
					theReceipt.reason = $scope.form.reason;
					theReceipt.persons = $scope.form.persons;
					theReceipt.place = $scope.form.place;
				}
				if(isCopy) {
					theReceipt.guid = $scope.generateGUID();
					theReceipt.text = translations.COPYOF + ' ' + $scope.form.text;
					$localstorage.insertObject('receipts', theReceipt);
					$localstorage.setObject('copyGUID', {
						guid : theReceipt.guid
					});
				} else {
					if ($scope.isEdit()) {
						theReceipt.guid = $stateParams.guid;
						$localstorage.updateObject('receipts', theReceipt);
					} else {
						theReceipt.guid = $scope.generateGUID();
						$localstorage.insertObject('receipts', theReceipt);
					}
				}
				$localstorage.setObject('lastCurrency', $scope.form.currency);
				if ($scope.$viewHistory.backView != null) {
					$scope.$viewHistory.backView.go();
				}
			}
		};
		// blur InputItem
		$scope.blurInputItems = function() {
			$timeout(function() {
				if(document.querySelectorAll('input:focus').length > 0) {
					document.querySelectorAll('input:focus')[0].blur();
				}
			},300);
		}
		// Write Modal information into the scope
		$scope.data = {
			showListCurrencies : false,
			showListReceiptKinds : false,
			showListkindsOfPayment : false,
			searchQueryCurrencies : "",
			searchQueryReceiptKinds : "",
			searchQueryKindsOfPayment : ""
		};

		// Currencies Modal
		$ionicModal.fromTemplateUrl('templates/currencies-modal.html', {
			scope : $scope,
			animation : 'slide-in-up'
		}).then(function (modal) {
			$scope.CurrenciesModal = modal;
		});

		// Open Currencies Modal
		$scope.openCurrenciesModal = function () {
			$scope.blurInputItems();
			$scope.CurrenciesModal.show();
			$timeout(function () {
				$scope.showListCurrencies = true;
			}, 400);
		};

		// Close Currencies Modal
		$scope.closeCurrenciesModal = function () {
			$scope.CurrenciesModal.hide();
		};

		$scope.isFavorite = true;
		$scope.setFavorite = function (event) {
			if (angular.element(event.target).hasClass('favorite')) {
				$scope.isFavorite = true;
			} else {
				$scope.isFavorite = '';
			}
		};

		// Clear the currencies searchbox
		$scope.clearSearchCurrencies = function () {
			$scope.data.searchQueryCurrencies = '';
		};

		// Select a currency
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

		// Open the receiptKinds Modal
		$scope.openReceiptKindsModal = function () {
			$scope.blurInputItems();
			$scope.receiptKindsModal.show();
			$timeout(function () {
				$scope.showListReceiptKinds = true;
			}, 300)
		};

		// Close the receiptKinds Modal
		$scope.closeReceiptKindsModal = function () {
			$scope.receiptKindsModal.hide();
		};

		// Clear the receiptKind searchbox
		$scope.clearSearchReceiptKinds = function () {
			$scope.data.searchQueryReceiptKinds = '';
		};

		// Select a receiptKind
		$scope.selectReceiptKind = function (receiptKind) {
			$scope.form.receiptKind = receiptKind;
			$scope.closeReceiptKindsModal();
		};

		// KindsOfPayment Modal
		$ionicModal.fromTemplateUrl('templates/kindsOfPayment-modal.html', {
			scope : $scope,
			animation : 'slide-in-up',
		}).then(function (modal) {
			$scope.kindsOfPaymentModal = modal;
		});

		// Open KindsOfPayment Modal
		$scope.data = {};
		$scope.openKindsOfPaymentModal = function () {
			$scope.kindsOfPaymentModal.show();
			$timeout(function () {
				$scope.showListKindsOfPayment = true;
			}, 100);
		};

		// Close KindsOfPayment Modal
		$scope.closeKindsOfPaymentModal = function () {
			$scope.kindsOfPaymentModal.hide();
		};

		// Select KindsOfPayment
		$scope.selectKindOfPayment = function (kindOfPayment) {
			$scope.form.kindOfPayment = kindOfPayment;
			$scope.closeKindsOfPaymentModal();
		};
	});
})

.controller('receiptsCtrl', function ($scope, $ionicPopup, $cordovaNetwork, $timeout, $localstorage, $ionicLoading, $translate, $location, $ionicModal, getData) {

	$translate(['WRONGCREDENTIALS_TITLE', 'WRONGCREDENTIALS_TEMPLATE']).then(function (translations) {
		
		$ionicModal.fromTemplateUrl('templates/login-modal.html', {
			scope : $scope,
			hardwareBackButtonClose : false
		}).then(function (modal) {
			$scope.LoginModal = modal;
			if (typeof $localstorage.getObjects('user').personId === 'undefined') {
				$scope.LoginModal.show();
			}
		});
		if($localstorage.getObjects('language').language == 'de') {
			$scope.dateFormat = 'dd.MM.yyyy';
		} else {
			$scope.dateFormat = 'MM/dd/yyyy';
		}
		$scope.user = {};
		$scope.user.alternativeDatepicker = false;
		$scope.login = function (user) {
			var promise = getData.userLogin(user);
			if (promise == false) {
				return false;
			}
			$ionicLoading.show({
				template : "<i class='icon ion-loading-c'></i><br> {{ 'PLEASEWAIT' | translate }}",
			});
			promise.then(function (success) {
				if (success.errors.length == 0) {
					$scope.user.person = success.result.person;
					$localstorage.setObject("user", user);
					var dataPromise = getData.all();
					dataPromise.then(function (success) {
						$scope.receipts = $localstorage.getObjects('receipts');
						$ionicLoading.hide();
						$scope.LoginModal.hide();
					})
				} else {
					if (success.errors[0].errorId == "8") {
						$ionicLoading.hide();
						$ionicPopup.alert({
							scope: $scope,
							title : translations.WRONGCREDENTIALS_TITLE,
							template : translations.WRONGCREDENTIALS_TEMPLATE
						});
					} else {
						$ionicPopup.alert({
							title : translations.WRONGCREDENTIALS_TITLE,
							template : success.errors[0]
						});
						$ionicLoading.hide();
					}
				}
			});
		};
		if (typeof $localstorage.getObjects('copyGUID').guid !== 'undefined') {
			$location.path('/tab/receipt/' + $localstorage.getObjects('copyGUID').guid);
		}
		$scope.go = function (hash) {
			$location.path(hash);
		}
		$scope.receipts = $localstorage.getObjects('receipts');
		$scope.doSync = function () {
			$ionicLoading.show({
				templateUrl : 'templates/synchronize.html',
			});
			if ($cordovaNetwork.isOffline()) {
				$ionicLoading.hide();
				$ionicPopup.alert({
					template : "{{ 'NOINTERNETACCESS_TEMPLATE' | translate }}"
				});
			} 
			var promise = getData.all();
			promise.then(function () {
				$scope.receipts = $localstorage.getObjects('receipts');
				$ionicLoading.hide();
			});
		}
		$scope.pullToRefresh = function () {
			$scope.$broadcast('scroll.refreshComplete');
			$scope.doSync();
			$scope.receipts = $localstorage.getObjects('receipts');
		};
		$scope.removeReceipt = function (guid) {
			var x = $localstorage.getIndex('receipts', guid);
			$scope.receipts.splice(x, 1);
			$localstorage.removeObject('receipts', guid);
		};

		$scope.openLoginModal = function () {
			$scope.LoginModal.show();
		};
	})

})

// Controller of the View Settings
.controller('settingsCtrl', function ($ionicPopup, $ionicLoading, $state, $scope, $http, $localstorage, $cordovaNetwork, $filter, $translate, getData) {

	// HACK: Hides the tabs if the keyboard is open
	angular.element(document.querySelectorAll('div.tabs')[0]).addClass('hide-on-keyboard-open');

	// Load the translations for the controller
	$translate(['SUCCESS_SETTINGS_TITLE', 'SUCCESS_SETTINGS_TEMPLATE', 'SUCCESS_SETTINGS_TITLE', 'ERROR_SETTINGS_TEMPLATE']).then(function (translations) {

		// Get the user datas from the localStorage
		$scope.form = $localstorage.getObjects('user');

		// Save the Settings
		$scope.saveSettings = function (form) {
			// Sync before changing the Settings
			$ionicLoading.show({
				templateUrl : 'templates/synchronize.html',
			});
			if ($cordovaNetwork.isOffline()) {
				$ionicLoading.hide();
				$ionicPopup.alert({
					template : "{{ 'NOINTERNETACCESS_TEMPLATE' | translate }}"
				});
				return;
			}
			var savePromise = getData.all();
			savePromise.then(function (success) {
			var promise = getData.userLogin(form);
				promise.then(function (success) {
					if (success.errors.length == 0) {
					getData.userLogout($localstorage.getObjects("user"));
						$scope.form.person = success.result.person;
						$localstorage.setObject('receipts', new Array());
						$localstorage.setObject("user", form);
						var promise = getData.all();
						promise.then(function () {
							$ionicLoading.hide();
							$ionicPopup.alert({
								title : translations.SUCCESS_SETTINGS_TITLE,
								template : translations.SUCCESS_SETTINGS_TEMPLATE
							});
						})
					} else {
						if (success.errors[0].errorId == "8") {
							$ionicPopup.alert({
								title : translations.ERROR_SETTINGS_TITLE,
								template : translations.ERROR_SETTINGS_TEMPLATE
							});
						} else {
							$ionicPopup.alert({
								title : translations.ERROR_SETTINGS_TITLE,
								template : success.errors[0]
							});
							$ionicLoading.hide();
						}
					}
				}, function (failed) {
					$ionicLoading.hide();
				});
			}, function (failed) {
					return false;
			});
		};

		// Set type to true if the language is "de"
		if ($translate.use() == "de") {
			$scope.type = true;
		} else {
			$scope.type = "";
		};

		// Change language
		$scope.changeLang = function (key, event) {
			if (angular.element(event.target).hasClass('de')) {
				$scope.type = true;
			} else {
				$scope.type = '';
			}
			$translate.use(key).then(function (key) {
				$localstorage.setObject('language', {
					language : key
				});
				if ($cordovaNetwork.isOffline()) {
					return false;
				}
				$ionicLoading.show({
					templateUrl : 'templates/synchronize.html',
				});
				var promise = getData.all();
				promise.then(function () {
					$ionicLoading.hide();
				})
			});
		};
	});
})

// Controller of the Info View
.controller('infosCtrl', function ($scope, $window) {
	// TODO: note HACK 
	angular.element(document.querySelectorAll('div.tabs')[0]).addClass('hide-on-keyboard-open');
	$scope.mail = {};
	$scope.mail.subject = "";
	$scope.mail.text = "";
	$scope.sendFeedback = function () {
		$window.location.href = "mailto:mobile.support@hrworks.de?subject=" + $scope.mail.subject + "&body=" + $scope.mail.text;
	}
})

angular.module('starter.controllers', ['ionic'])

// Controller of the Receipt View
.controller('receiptCtrl', function ($scope, $localstorage, $filter, $ionicActionSheet, $ionicPopup, $ionicModal, $timeout, $stateParams, $translate, generateGUID, getDateFormat) {
	$translate(['EDIT_RECEIPT', 'NEWRECEIPT', 'OPTIONS', 'COPY', 'ERROR', 'COPYRECEIPT_ERROR', 'COPYRECEIPT', 'COPYRECEIPT_INFO', 'CANCEL', 'OK', 'SAVE', 'CHOOSE_DATE', 'CHOOSE_AMOUNT', 'DELETE', 'COPYOF', 'DELETERECEIPT', 'DELETERECEIPT_TEMPLATE', 'YES', 'NO']).then(function (translations) {

		// Clears the copyGUID of the localStorage
		// TODO: new Array ==> zu String
		$localstorage.setObject('copyGUID', new Array());

		// HACK: removes the tabs in the view. Update if there is a better way
		var tabs = document.querySelectorAll('div.tabs')[0];
		tabs = angular.element(tabs);
		angular.element(document).find('ion-content').addClass('remove-tabs');
		tabs.css('display', 'none');
		$scope.$on('$destroy', function () {
			tabs.css('display', '');
		});
		// HACK: end

		// Put the data form the localStorage into the scope
		$scope.receiptKinds = $localstorage.getObjects('receiptKinds');
		$scope.kindsOfPayment = $localstorage.getObjects('kindsOfPayment');
		$scope.currencies = $localstorage.getObjects('currencies');
		$scope.form = {};
		$scope.showAlternativeAmountpicker = $localstorage.getObjects('user').alternativeAmountpicker;
		
		$scope.getDateFormat = getDateFormat;
		if($scope.showAlternativeAmountpicker) {
			$scope.dateFormat = $scope.getDateFormat();
			console.log($scope.dateFormat);
			if($translate.use() == "de") {
				$scope.form.amount = "0,00";
			} else {
				$scope.form.amount = "0.00";
			}
		} else {
			$scope.form.amount = 0.00;
		}
		$scope.form.date = $filter('date')(new Date(), 'yyyy-MM-dd');
		var newDate = new Date();
		$scope.form.endDate = $filter('date')(newDate.setDate(newDate.getDate() + 1), 'yyyy-MM-dd');
		$scope.form.currency = $localstorage.getObjects('lastCurrency');
		$scope.form.persons = $localstorage.getObjects('user').person + ',';
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
		// Return true if there is a GUID of a receipt
		$scope.isEdit = function () {
			return $stateParams.guid != "new";
		}

		// Set the title of the view
		if ($scope.isEdit()) {
			$scope.form = $localstorage.getObject('receipts', $stateParams.guid);
			if($scope.showAlternativeAmountpicker) {
				$scope.form.amount = $scope.form.amount.toString();
				if($scope.form.amount.indexOf(".") == -1) {
					$scope.form.amount = $scope.form.amount + ".00";
				}
				if($translate.use() == "de") {
					$scope.form.amount = $scope.form.amount.replace(".", ",");
				}
			}
			$scope.receiptTitle = translations.EDIT_RECEIPT;
		} else {
			$scope.receiptTitle = translations.NEWRECEIPT;
		}
		$scope.openDatePicker = function(inputName) {
			$scope.tmp = {};
			date = $scope.form.date;
			if(inputName == "endDate") {
				date = $scope.form.endDate
			}
			$scope.tmp.datePickerDate = new Date(date.slice(0,4), date.slice(5,7)-1, date.slice(8,10));			
			$timeout(function() {
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
			}, 200);
		}
		$scope.resetAmountPickerEntry = function() {
			$scope.isFirstButtonClick = true;
			$scope.isAfterDecimalPoint = false;
			$scope.isFirstAfterDecimalPointPosition = true;
		}
		$scope.resetAmountPickerEntry();
		$scope.positionIcon = "ion-chevron-right";
		
		$scope.goBeforeDecimalPoint = function () {
			$scope.isAfterDecimalPoint = false;
		}
		$scope.temporaryAmount = $scope.form.amount;
		$scope.dotOrComma = ".";
		if($translate.use() == "de") {
			$scope.dotOrComma = ",";
		}
		$scope.addToAmount = function(addingNumber) {
			var theAmount = $scope.temporaryAmount;
			var indexOfPeriod = theAmount.indexOf($scope.dotOrComma);
			var beforeDecimalPointString;
			var afterDecimalPointString;
			if (indexOfPeriod > -1) {
				beforeDecimalPointString = theAmount.substring(0, indexOfPeriod);
				afterDecimalPointString = theAmount.substring(indexOfPeriod + 1);
			}
			if(addingNumber == "," || addingNumber == ".") {
				$scope.isAfterDecimalPoint = true;
				return;
			}
			if($scope.isAfterDecimalPoint) {
				if(addingNumber == "del") {
					addingNumber = "0";
				}
				if($scope.isFirstAfterDecimalPointPosition) {
					afterDecimalPointString = addingNumber + afterDecimalPointString.substring(1, 2);
				} else {
					afterDecimalPointString = afterDecimalPointString.substring(0, 1) + addingNumber;
				}
				$scope.isFirstAfterDecimalPointPosition = !$scope.isFirstAfterDecimalPointPosition;				
			} else {
				if(addingNumber == "del") {
					beforeDecimalPointString = beforeDecimalPointString.substring(0, beforeDecimalPointString.length - 1);
					if(beforeDecimalPointString == "") {
						beforeDecimalPointString = "0";
					}
					$scope.temporaryAmount = beforeDecimalPointString + $scope.dotOrComma + afterDecimalPointString;
					return;
				}
				if(beforeDecimalPointString == "0") {
					beforeDecimalPointString = "";
				}
				if($scope.isFirstButtonClick) {
					beforeDecimalPointString = addingNumber;
					$scope.isFirstButtonClick = false;
				} else {
					beforeDecimalPointString = beforeDecimalPointString + addingNumber;
				}
			}
			$scope.temporaryAmount = beforeDecimalPointString + $scope.dotOrComma + afterDecimalPointString;
		}
		
		$scope.openAmountPicker = function() {
			$scope.resetAmountPickerEntry();
			$timeout(function() {
				$ionicPopup.confirm({
					// TODO: übersetzung
					title: "<b>" + translations.CHOOSE_AMOUNT + "</b>",
					scope: $scope,
					templateUrl: 'templates/amountPicker.html',
					buttons : [{
						text : translations.CANCEL,
						onTap: function(e) {
							$scope.temporaryAmount = $scope.form.amount;
						}
					},{
						text : "<b>" + translations.OK + "</b>",
						type : "button-positive",
						onTap: function(e) {
							$scope.form.amount = $scope.temporaryAmount;
						}
					}]
				});
			}, 300);
		}

		// Create a GUID
		// Write the global methode generateGUID from globaleMethode.js into the $scope
		$scope.generateGUID = generateGUID;

		// Write into the localeStorage that the user doesn't want to see the info altert again
		$scope.hideData = {};
		$scope.setHideAlert = function () {
			$localstorage.setObject('hideAlert', {
				hideAlert : true
			});
		}

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
								buttons : [ {
									text : translations.CANCEL,
									onTap : function (e) {
										return;
									}
								},{
									text : "<b>" + translations.OK + "</b>",
									type : "button-positive",
									onTap : function (e) {
										if (typeof $scope.hideData.hideAlert !== "undefined") {
											$scope.setHideAlert();
										}
										$scope.saveReceipt(true, true);	
									}
								}]
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
								text : translations.NO,
								onTap : function (e) {
									return true;
								}
							},{
								text : "<b>" + translations.YES + "</b>",
								type : "button-positive",
								onTap : function (e) {
									$localstorage.removeObject('receipts', $scope.form.guid);
									$scope.$viewHistory.backView.go();
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
					return !(theNewPersonsArray.length >= 2);
				} else {
					return true;
				}
			}
		}

		// Save receipt
		$scope.submitted = false;
		$scope.saveReceipt = function(isValid, isCopy) {
			$scope.submitted = true;
			var checkEndDate = $scope.form.date; 
			checkEndDate = new Date(checkEndDate.slice(0,4), checkEndDate.slice(5,7)-1, checkEndDate.slice(8,10));	
			if (!$scope.form.receiptKind.isHotel) {
				$scope.form.endDate = checkEndDate.setDate(checkEndDate.getDate() + 1);
				$scope.form.endDate = $filter('date')($scope.form.endDate, 'yyyy-MM-dd');
			}
				console.log($scope.form.endDate);
				console.log($scope.form.date < $scope.form.endDate);
			if (isValid && $scope.form.date < $scope.form.endDate) {
				if($scope.showAlternativeAmountpicker) {
					if($translate.use() == "de") {
						// TODO: voesricht bei eingabe von "100.00,26", testen
						$scope.form.amount = $scope.form.amount.replace(",", ".");
					}
					$scope.form.amount = parseFloat($scope.form.amount);
				}
				
				theReceipt = {
					text : $scope.form.text,
					amount : parseFloat($scope.form.amount.toFixed(2)),
					date : $scope.form.date,
					receiptKind : $scope.form.receiptKind,
					kindOfPayment : $scope.form.kindOfPayment,
					currency : $scope.form.currency,
					timeStamp : $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ss.sssZ'),
				}
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
				// The if-statement is just for the browser to catch the error if there is no backview
				if ($scope.$viewHistory.backView != null) {
					$scope.$viewHistory.backView.go();
				}
			}
		}
		// blur InputItem
		// TODO: HACK kommentieren, wieso wird gebraucht?
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
		}

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
		}

		// Close Currencies Modal
		$scope.closeCurrenciesModal = function () {
			$scope.CurrenciesModal.hide();
		}

		$scope.isFavorite = true;
		$scope.setFavorite = function (event) {
			$scope.isFavorite = angular.element(event.target).hasClass('favorite'); 
		}

		// Clear the currencies searchbox
		$scope.clearSearchCurrencies = function () {
			$scope.data.searchQueryCurrencies = '';
		}

		// Select a currency
		$scope.selectCurrency = function (currency) {
			$scope.form.currency = currency;
			$scope.closeCurrenciesModal();
		}

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
			// TODO: hack notieren
			$timeout(function () {
				$scope.showListReceiptKinds = true;
			}, 300)
		}

		/*
		TODO: Methoden zusammenfassen ?
		$scope.closeModal = function (modal) {
			modal.hide();
		}
		*/
		// Close the receiptKinds Modal
		$scope.closeReceiptKindsModal = function () {
			$scope.receiptKindsModal.hide();
		}

		// Clear the receiptKind searchbox
		$scope.clearSearchReceiptKinds = function () {
			$scope.data.searchQueryReceiptKinds = '';
		}

		// Select a receiptKind
		$scope.selectReceiptKind = function (receiptKind) {
			$scope.form.receiptKind = receiptKind;
			$scope.closeReceiptKindsModal();
		}

		// KindsOfPayment Modal
		$ionicModal.fromTemplateUrl('templates/kindsOfPayment-modal.html', {
			scope : $scope,
			animation : 'slide-in-up',
		}).then(function (modal) {
			$scope.kindsOfPaymentModal = modal;
		})

		// Open KindsOfPayment Modal
		$scope.data = {};
		$scope.openKindsOfPaymentModal = function () {
			$scope.kindsOfPaymentModal.show();
			// TODO: hack notieren
			$timeout(function () {
				$scope.showListKindsOfPayment = true;
			}, 100);
		}

		// Close KindsOfPayment Modal
		$scope.closeKindsOfPaymentModal = function () {
			$scope.kindsOfPaymentModal.hide();
		}

		// Select KindsOfPayment
		$scope.selectKindOfPayment = function (kindOfPayment) {
			$scope.form.kindOfPayment = kindOfPayment;
			$scope.closeKindsOfPaymentModal();
		}
	});
})

.controller('receiptsCtrl', function ($scope, $ionicPopup, $cordovaNetwork, $localstorage, $ionicLoading, $translate, $location, $ionicModal, $filter, ApiRequester, generateGUID, getDateFormat ) {
	$translate(['WRONGCREDENTIALS_TITLE', 'WRONGCREDENTIALS_TEMPLATE', 'COPYOF']).then(function (translations) {
		$ionicModal.fromTemplateUrl('templates/login-modal.html', {
			scope : $scope,
			animation : 'slide-in-up',
			hardwareBackButtonClose : false
		}).then(function (modal) {
			$scope.LoginModal = modal;
			if (typeof $localstorage.getObjects('user').personId === 'undefined') {
				$scope.LoginModal.show();
			}
		});
		
		$scope.getDateFormat = getDateFormat;
		$scope.user = {};
		$scope.user.alternativeDatepicker = false;
		$scope.user.alternativeAmountpicker = false;
		// TODO: Produktiv ändern in "0"
		$scope.user.targetServer = "area51-0";
		$scope.submitted = false;
		$scope.login = function (isValid) {
			$scope.submitted = true;
			if (isValid) {
				var promise = ApiRequester.userLogin($scope.user);
				if (!promise) {
					return false;
				}
				$ionicLoading.show({
					template : "<i class='icon ion-loading-c'></i><br> {{ 'PLEASEWAIT' | translate }}",
				});
				promise.then(function (success) {
					if (success.errors.length == 0) {
						$scope.user.person = success.result.person;
						$localstorage.setObject("user", $scope.user);
						var dataPromise = ApiRequester.synchroniseAll();
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
								template : success.errors[0].errorText
							});
							$ionicLoading.hide();
						}
					}
				});
			}
		}
		if (typeof $localstorage.getObjects('copyGUID').guid !== 'undefined') {
			// TODO: vorsicht mit rückgabewert
			$location.path('/tab/receipt/' + $localstorage.getObjects('copyGUID').guid);
		}
		$scope.go = function (hash) {
			$location.path(hash);
		}
		$scope.receipts = $localstorage.getObjects('receipts');
		$scope.transformateAmount = function(amount) {
			if($translate.use() == "de") {
				return accounting.formatNumber(amount, 2, ".", ",");
			} else {
				return accounting.formatNumber(amount, 2, ",", ".");
			}
		}
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
			var promise = ApiRequester.synchroniseAll();
			promise.then(function () {
				$scope.receipts = $localstorage.getObjects('receipts');
				$ionicLoading.hide();
			});
		}
		$scope.pullToRefresh = function () {
			$scope.$broadcast('scroll.refreshComplete');
			$scope.doSync();
			$scope.receipts = $localstorage.getObjects('receipts');
		}
		// DOTO: Delete function rdy for beta 12
		$scope.deleteReceipt = function (guid) {
			$scope.receipts.splice($localstorage.getIndex('receipts', guid), 1);
			$localstorage.removeObject('receipts', guid);
		}
		$scope.generateGUID = generateGUID;
		// DOTO: Copy function rdy for beta 12
		$scope.copyReceipt = function (guid) {
			var theNewReceipt = $localstorage.getObject('receipts', guid);
			theNewReceipt.text = translations.COPYOF + ' ' + theNewReceipt.text;
			theNewReceipt.guid = $scope.generateGUID();
			theNewReceipt.timeStamp = $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ss.sssZ');
			$localstorage.insertObject('receipts', theNewReceipt);
			$location.path('/tab/receipt/' + theNewReceipt.guid);
		}
		$scope.openLoginModal = function () {
			$scope.LoginModal.show();
		}
	})

})

// Controller of the View Settings
.controller('settingsCtrl', function ($scope, $ionicPopup, $ionicLoading, $localstorage, $cordovaNetwork, $translate, ApiRequester) {

	// HACK: Hides the tabs if the keyboard is open
	angular.element(document.querySelectorAll('div.tabs')[0]).addClass('hide-on-keyboard-open');

	// Load the translations for the controller
	$translate(['SUCCESS_SETTINGS_TITLE', 'SUCCESS_SETTINGS_TEMPLATE', 'ERROR_SETTINGS_TITLE', 'SUCCESS_SETTINGS_TITLE', 'ERROR_SETTINGS_TEMPLATE']).then(function (translations) {

		// Get the user datas from the localStorage
		$scope.form = $localstorage.getObjects('user');

		// Save the Settings
		$scope.submitted = false;
		$scope.saveSettings = function (isValid) {
			$scope.submitted = true;
			if(isValid) {
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
				var synchronizePromise = ApiRequester.synchroniseAll();
				synchronizePromise.then(function (success) {
					var loginPromise = ApiRequester.userLogin($scope.form);
					loginPromise.then(function (success) {
						if (success.errors.length == 0) {
							ApiRequester.userLogout($localstorage.getObjects("user"));
							$scope.form.person = success.result.person;
							$localstorage.setObject('receipts', new Array());
							$localstorage.setObject("user", $scope.form);
							var newSynchronizePromise = ApiRequester.synchroniseAll();
							newSynchronizePromise.then(function () {
								$ionicLoading.hide();
								$ionicPopup.alert({
									template : "{{ 'SUCCESS_SETTINGS_TEMPLATE' | translate }}"
								});
							})
						} else {
							if (success.errors[0].errorId == "8") {
								$ionicPopup.alert({
									template : "{{ 'ERROR_SETTINGS_TEMPLATE' | translate }}"
								});
								$ionicLoading.hide();
								$scope.form = $localstorage.getObjects("user");
							} else {
								$ionicPopup.alert({
									template : success.errors[0].errorText
								});
								$scope.form = $localstorage.getObjects("user");
								$ionicLoading.hide();
							}
						}
					}, function (failed) {
						// TODO: "kann sich glaub ich selber" werden fehler gesetzt ?
						$ionicLoading.hide();
					});
				}, function (failed) {
					return;
				});
			}
		}
		
		$scope.isAndroid = ionic.Platform.isAndroid();

		// Set isGerman to true if the language is "de"
			$scope.isGerman = $translate.use() == "de";

		// Change language
		$scope.changeLang = function (key, event) {
			$scope.isGerman = angular.element(event.target).hasClass('de');
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
				// TODO: "getData.all()" sendet auch daten, also nciht nur getdata
				var synchronizePromise = ApiRequester.synchroniseAll();
				synchronizePromise.then(function () {
					$ionicLoading.hide();
				})
			});
		}
	});
})

// Controller of the Info View
.controller('infosCtrl', function ($scope, $window) {
	// HACK: Add Hide on keyboard open class
	angular.element(document.querySelectorAll('div.tabs')[0]).addClass('hide-on-keyboard-open');
	$scope.isAndroid = ionic.Platform.isAndroid();
	$scope.mail = {};
	$scope.mail.subject = "";
	$scope.mail.text = "";
	$scope.sendFeedback = function () {
		$window.location.href = "mailto:mobile.support@hrworks.de?subject=" + $scope.mail.subject + "&body=" + $scope.mail.text;
	}
})

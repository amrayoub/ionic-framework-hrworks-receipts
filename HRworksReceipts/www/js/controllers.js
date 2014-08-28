angular.module('starter.controllers', ['ionic'])

// Controller of the Receipt View
.controller('receiptCtrl', function ($scope, $localstorage, $filter, $ionicActionSheet, $ionicPopup, $ionicModal, $timeout, $stateParams, $translate) {
	$translate(['EDIT_RECEIPT', 'NEWRECEIPT', 'OPTIONS', 'COPY', 'ERROR', 'COPYRECEIPT_ERROR', 'COPYRECEIPT', 'COPYRECEIPT_INFO', 'CANCEL', 'OK', 'SAVE', 'CHOOSE_DATE', 'DELETE', 'COPYOF', 'DELETERECEIPT', 'DELETERECEIPT_TEMPLATE', 'YES', 'NO']).then(function (translations) {

		// Clears the copyGUID of the localStorage
		$localstorage.setObject('copyGUID', new Array());

		// HACK: removes the tabs in the view. Update if there is a better way
		var tabs = document.querySelectorAll('div.tabs')[0];
		tabs = angular.element(tabs);
		angular.element(document).find('ion-content').addClass('remove-tabs');
		tabs.css('display', 'none');
		$scope.$on('$destroy', function () {
			tabs.css('display', '');
		});
		
		// Put the data form the localStorage into the scope
		$scope.receiptKinds = $localstorage.getObjects('receiptKinds');
		$scope.kindsOfPayment = $localstorage.getObjects('kindsOfPayment');
		$scope.currencies = $localstorage.getObjects('currencies');
		$scope.form = {};
		$scope.showAlternativeAmountpicker = $localstorage.getObjects('user').alternativeAmountpicker;
		if($translate.use() == "de" && $scope.showAlternativeAmountpicker) {
			$scope.form.amount = "0,00";
			$scope.dateFormat = 'dd.MM.yyyy';
		}
		if($translate.use() == "en" && $scope.showAlternativeAmountpicker) {
			$scope.form.amount = "0.00";
			$scope.dateFormat = 'MM/dd/yyyy';
		}
		if(!$scope.showAlternativeAmountpicker) {
			$scope.form.amount = 0.00;
		}
		$scope.form.date = $filter('date')(new Date(), 'yyyy-MM-dd');
		$scope.form.currency = $localstorage.getObjects('lastCurrency');
		$scope.form.persons = "";
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
		$scope.isFirstButtonClick = true;
		$scope.isAfterDecimalPoint = false;
		$scope.isFirstAfterDecimalPointPosition = true;
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
			var period = theAmount.indexOf($scope.dotOrComma);
			if (period > -1) {
				var beforeDecimalPoint = theAmount.substring(0, period);
				var afterDecimalPoint = theAmount.substring(period + 1);
			}
			if(addingNumber == "," || addingNumber == ".") {
				$scope.isAfterDecimalPoint = true;
				return;
			}
			if(!$scope.isAfterDecimalPoint) {
				if(addingNumber == "del") {
				beforeDecimalPoint = beforeDecimalPoint.substring(0,beforeDecimalPoint.length-1);
					if(beforeDecimalPoint == "") {
						beforeDecimalPoint = "0";
					}
				$scope.temporaryAmount = beforeDecimalPoint + $scope.dotOrComma + afterDecimalPoint;
				return;
				}
				if(beforeDecimalPoint == "0") {
					beforeDecimalPoint = "";
				}
				if($scope.isFirstButtonClick) {
					beforeDecimalPoint = addingNumber;
					$scope.isFirstButtonClick = false;
				} else {
					beforeDecimalPoint = beforeDecimalPoint + addingNumber;
				}
			} else {
				if(addingNumber == "del") {
					addingNumber = "0";
				}
				if($scope.isFirstAfterDecimalPointPosition) {
					afterDecimalPoint = addingNumber + afterDecimalPoint.substring(1,2);
					$scope.isFirstAfterDecimalPointPosition = false;
				} else {
					afterDecimalPoint = afterDecimalPoint.substring(0,1) + addingNumber;
					$scope.isFirstAfterDecimalPointPosition = true;
				}
			}
			$scope.temporaryAmount = beforeDecimalPoint + $scope.dotOrComma + afterDecimalPoint;
		}
		
		$scope.openAmountPicker = function() {
			$scope.isAfterDecimalPoint = false;
			$scope.isFirstAfterDecimalPointPosition = true;
			$scope.isFirstButtonClick = true;
			$timeout(function() {
				$ionicPopup.confirm({
					title: 'Betrag wählen',
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
			}, 200);
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
								buttons : [ {
									text : translations.CANCEL,
									onTap : function (e) {
										return;
									}
								},{
									text : "<b>" + translations.OK + "</b>",
									type : "button-positive",
									onTap : function (e) {
										console.log("!");
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
			if (isValid && $scope.form.endDate >= $scope.form.date ) {
				if($scope.showAlternativeAmountpicker) {
					if($translate.use() == "de") {
						$scope.form.amount = $scope.form.amount.replace(",", ".");
					}
					$scope.form.amount = parseFloat($scope.form.amount);
				}
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

.controller('receiptsCtrl', function ($scope, $ionicPopup, $cordovaNetwork, $localstorage, $ionicLoading, $translate, $location, $ionicModal, getData) {
	$translate(['WRONGCREDENTIALS_TITLE', 'WRONGCREDENTIALS_TEMPLATE']).then(function (translations) {
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
		
		if($localstorage.getObjects('language').language == 'de') {
			$scope.dateFormat = 'dd.MM.yyyy';
		} else {
			$scope.dateFormat = 'MM/dd/yyyy';
		}
		$scope.user = {};
		$scope.user.alternativeDatepicker = false;
		$scope.user.alternativeAmountpicker = false;
		// TODO: Produktiv ändern in "0"
		$scope.user.targetServer = "area51-0";
		$scope.submitted = false;
		$scope.login = function (isValid) {
			$scope.submitted = true;
			if (isValid) {
				var promise = getData.userLogin($scope.user);
				if (promise == false) {
					return false;
				}
				$ionicLoading.show({
					template : "<i class='icon ion-loading-c'></i><br> {{ 'PLEASEWAIT' | translate }}",
				});
				promise.then(function (success) {
					if (success.errors.length == 0) {
						$scope.user.person = success.result.person;
						$localstorage.setObject("user", $scope.user);
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
								template : success.errors[0].errorText
							});
							$ionicLoading.hide();
						}
					}
				});
			}
		};
		if (typeof $localstorage.getObjects('copyGUID').guid !== 'undefined') {
			$location.path('/tab/receipt/' + $localstorage.getObjects('copyGUID').guid);
		}
		$scope.go = function (hash) {
			$location.path(hash);
		}
		$scope.receipts = $localstorage.getObjects('receipts');
		if($translate.use() == "de") {
			for(i = 0; i < $scope.receipts.length; i++) {
				$scope.receipts[i].amount = $scope.receipts[i].amount.toString().replace('.',',');
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
.controller('settingsCtrl', function ($scope, $ionicPopup, $ionicLoading, $localstorage, $cordovaNetwork, $translate, getData) {

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
				var savePromise = getData.all();
				savePromise.then(function (success) {
				var promise = getData.userLogin($scope.form);
					promise.then(function (success) {
						if (success.errors.length == 0) {
						getData.userLogout($localstorage.getObjects("user"));
							$scope.form.person = success.result.person;
							$localstorage.setObject('receipts', new Array());
							$localstorage.setObject("user", $scope.form);
							var promise = getData.all();
							promise.then(function () {
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
						$ionicLoading.hide();
					});
				}, function (failed) {
						return false;
				});
			}
		};
		
		$scope.isAndroid = ionic.Platform.isAndroid();

		// Set isGerman to true if the language is "de"
		if ($translate.use() == "de") {
			$scope.isGerman = true;
		} else {
			$scope.isGerman = "";
		};

		// Change language
		$scope.changeLang = function (key, event) {
			if (angular.element(event.target).hasClass('de')) {
				$scope.isGerman = true;
			} else {
				$scope.isGerman = '';
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
	$scope.isAndroid = ionic.Platform.isAndroid();
	$scope.mail = {};
	$scope.mail.subject = "";
	$scope.mail.text = "";
	$scope.sendFeedback = function () {
		$window.location.href = "mailto:mobile.support@hrworks.de?subject=" + $scope.mail.subject + "&body=" + $scope.mail.text;
	}
})

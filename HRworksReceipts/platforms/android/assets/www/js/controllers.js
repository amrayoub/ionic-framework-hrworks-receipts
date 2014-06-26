angular.module('starter.controllers', ['ionic'])

.controller('addReceiptCtrl', function ($scope, $localstorage, $filter, $state, $ionicPopup, $ionicModal, $timeout) {
	$scope.receiptKinds = $localstorage.getObjects('receiptKinds');
	$scope.kindsOfPayment = $localstorage.getObjects('kindsOfPayment');
	$scope.currencies = $localstorage.getObjects('currencies');
	$scope.form = {};
	$scope.form.date = $filter('date')(new Date(), 'yyyy-MM-dd');
	$scope.form.currency = $localstorage.getObjects('lastCurrency');
	$scope.form.kindOfPayment = $scope.kindsOfPayment[1];
	$scope.form.receiptKind = $scope.receiptKinds[0];
	generateGUID = function () {
		var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
				var r = Math.random() * 16 | 0,
				v = c == 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
		return guid;
	};
	$scope.createReceipt = function () {
		var error = 0;
		var errorMessage = "";
		if (!$scope.form.text) {
			error = 1;
			errorMessage = errorMessage + "" + "Bezeichnung<br>";
		}
		if (!$scope.form.amount) {
			error = 1;
			errorMessage = errorMessage + "" + "Betrag<br>";
		}
		if (!$scope.form.date) {
			error = 1;
			errorMessage = errorMessage + "" + "Datum<br>";
		}
		if (!$scope.form.receiptKind) {
			error = 1;
			errorMessage = errorMessage + "" + "Belegart<br>";
		}
		if (!$scope.form.kindOfPayment) {
			error = 1;
			errorMessage = errorMessage + "" + "Zahlungsart<br>";
		}
		if (!$scope.form.currency) {
			error = 1;
			errorMessage = errorMessage + "" + "Währung<br>";
		}
		if (error == 1) {
			$ionicPopup.alert({
				title : '<b>Folgende Eingaben fehlen oder sind fehlerhaft:</b>',
				content : errorMessage
			});
		} else {
			$localstorage.insertObject('receipts', {
				text : $scope.form.text,
				amount : $scope.form.amount,
				date : $scope.form.date,
				receiptKind : $scope.form.receiptKind.id,
				kindOfPayment : $scope.form.kindOfPayment.id,
				currency : $scope.form.currency.symbol,
				timestamp : $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ss.sssZ'),
				guid : generateGUID()
			});
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
		showList1 : false,
		showList2 : false,
		showList2 : false,
	};
	console.log($scope.data);
	$scope.openCurrenciesModal = function () {
		$scope.CurrenciesModal.show();
		$timeout(function () {
			$scope.showList1  = true;
		}, 300)
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
	$scope.clearSearchCurrency = function () {
		$scope.data.searchQueryCurrencies = '';
	};
	$scope.selectCurrency = function (currency) {
		$scope.form.currency = currency;
		$timeout(function () {
			$scope.closeCurrenciesModal();
		}, 300)
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
			$scope.showList2 = true;
		}, 300)
	};
	$scope.closeReceiptKindsModal = function () {
		$scope.receiptKindsModal.hide();
	};
	$scope.clearSearchReceiptKind = function () {
		$scope.data.searchQueryReceiptsKind = '';
	};
	$scope.selectReceiptKind = function (receiptKind) {
		$scope.form.receiptKind = receiptKind;
		$timeout(function () {
			$scope.closeReceiptKindsModal();
		}, 300)
	};
	// receiptKinds Modal
	$ionicModal.fromTemplateUrl('kindsOfPayment-modal.html', {
		scope : $scope,
		animation : 'slide-in-up'
	}).then(function (modal) {
		$scope.kindsOfPaymentModal = modal;
	});
	$scope.data = {
		
	};
	$scope.openKindsOfPaymentModal = function () {
		$scope.kindsOfPaymentModal.show();
		$timeout(function () {
			$scope.showList3 = true;
		}, 300)
	};
	$scope.closeKindsOfPaymentModal = function () {
		$scope.kindsOfPaymentModal.hide();
	};
	$scope.clearSearchKindOfPayment = function () {
		$scope.data.searchQueryKindsOfPayment = '';
	};
	$scope.selectKindOfPayment = function (kindOfPayment) {
		$scope.form.kindOfPayment = kindOfPayment;
		$timeout(function () {
			$scope.closeKindsOfPaymentModal();
		}, 300)
	};
})

.controller('receiptsCtrl', function ($scope, $localstorage, $ionicLoading, $location) {

	$scope.go = function (hash) {
		$location.path(hash);
	}
	$scope.receipts = $localstorage.getObjects('receipts');

	$scope.getReceiptKindDescription = function (receiptKindId) {
		for (var i = 0; i < $localstorage.getObjects('receiptKinds').length; i++) {
			if ($localstorage.getObjects('receiptKinds')[i].id == receiptKindId) {
				return $localstorage.getObjects('receiptKinds')[i].description;
			}
		}
		return false;
	};
	$scope.getItemHeight = function (item, index) {
		return (index % 1) === 0 ? 80 : 80;
	};
	$scope.getItemWidth = function (item) {
		return 100;
	};
	$scope.show = function () {
		$ionicLoading.show({
			template : 'Synchronisieren...',
			duration : '1000'
		});
	};
	$scope.hide = function () {
		$ionicLoading.hide();
	};
	$scope.removeReceipt = function (guid) {
		var x = $localstorage.getIndex('receipts', guid);
		console.log(x);
		$scope.receipts.splice(x, 1);
		$localstorage.removeObject('receipts', guid);
	};
})

.controller('settingsCtrl', function ($scope, $localstorage, $filter) {
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
				receiptKind : '1',
				kindOfPayment : '1',
				currency : "EUR",
				timestamp : $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ss.sssZ'),
				guid : generateGUID()
			});
		}
	};
})

.controller('infosCtrl', function ($scope) {})

.controller('updateReceiptCtrl', function ($scope, $localstorage, $stateParams) {
	console.log($localstorage.getObject('receipts', $stateParams.guid));
});

angular.module('starter.controllers', ['ionic'])

.controller('addReceiptCtrl', function ($scope, $localstorage, $filter, $state, $ionicModal) {
	$scope.form = {};
	$scope.form.date = $filter('date')(new Date(), 'yyyy-MM-dd');
	console.log($scope.form);
	$scope.receiptKinds = $localstorage.getObjects('receiptKinds');
	$scope.receiptKindsSelected = $scope.receiptKinds[0];
	$scope.kindsOfPayment = $localstorage.getObjects('kindsOfPayment');
	$scope.kindsOfPaymentSelected = $scope.kindsOfPayment[1];
	$scope.currencies = $localstorage.getObjects('currencies');
	$scope.currenciesSelected = $scope.currencies[33];
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
		if (!$scope.form.text) {
			error = 1;
		}
		if (!$scope.form.amount) {
			error = 1;
		}
		if (!$scope.form.date) {
			error = 1;
		}
		if (error == 1) {
			console.log("Validierungs Fehler");
		} else {
			$localstorage.insertObject('receipts', {
				text : $scope.form.text,
				amount : $scope.form.amount,
				date : $scope.form.date,
				receiptKind : "1",
				kindOfPayment : "1",
				currency : "EUR",
				timestamp : $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ss.sssZ'),
				guid : generateGUID()
			});
			if ($scope.$viewHistory.backView != null) {
				$scope.$viewHistory.backView.go();
			}
		}
	};
	$ionicModal.fromTemplateUrl('currencies-modal.html', {
		scope : $scope,
		animation : 'slide-in-up'
	}).then(function (modal) {
		$scope.modal = modal;
	});
	$scope.openModal = function () {
		$scope.modal.show();
	};
	$scope.closeModal = function () {
		$scope.modal.hide();
	};
	//Cleanup the modal when we're done with it!
	$scope.$on('$destroy', function () {
		$scope.modal.remove();
	});
	// Execute action on hide modal
	$scope.$on('modal.hidden', function () {
		// Execute action
	});
	// Execute action on remove modal
	$scope.$on('modal.removed', function () {
		// Execute action
	});
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
		return '100%';
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

.controller('accountCtrl', function ($scope) {})

.controller('feedbackCtrl', function ($scope) {})

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

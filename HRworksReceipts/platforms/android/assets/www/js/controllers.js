angular.module('starter.controllers', ['ionic'])

.controller('addReceiptCtrl', function($scope, $localstorage, $filter, $state) {
	$scope.form = {};
	$scope.form.date = new Date(2013,4,12);
	console.log($scope.form);
	$scope.receiptKinds = $localstorage.getObject('receiptKinds');
	$scope.receiptKindsSelected = $scope.receiptKinds[0];
	$scope.kindsOfPayment = $localstorage.getObject('kindsOfPayment');
	$scope.kindsOfPaymentSelected = $scope.kindsOfPayment[1];
	$scope.currencies = $localstorage.getObject('currencies');
	$scope.currenciesSelected = $scope.currencies[33];
	generateGUID = function(){
		var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});    
		return guid;
	};
	$scope.createReceipt = function () {
		var error = 0;
		if(!$scope.form.text) {
			error = 1;
		}
		if(!$scope.form.amount) {
			error = 1;
		}
		if(!$scope.form.date) {
			error = 1;
		}
		if(error == 1) {
			console.log("Validierungs Fehler");
		} else {
			$localstorage.insertObject('receipts', {
				text : $scope.form.text,
				amount : $scope.form.amount,
				date : $scope.form.date,
				receiptKind : "1",
				kindOfPayment : "1",
				currency : "EUR",
				timestamp : Date(),
				guid: generateGUID()
			});
			if($scope.$viewHistory.backView != null){
				$scope.$viewHistory.backView.go();
			}
		}
	};
	console.log($scope);
})

.controller('receiptsCtrl', function($scope, $localstorage, $ionicLoading) {

	$scope.receipts = $localstorage.getObject('receipts');
	

	$scope.getReceiptKindDescription = function(receiptKindId) {
		for (var i = 0; i < $localstorage.getObject('receiptKinds').length; i++) {
			if ($localstorage.getObject('receiptKinds')[i].id == receiptKindId) {
				return $localstorage.getObject('receiptKinds')[i].description;
			}
		}
		return false;
	};
	$scope.getItemHeight = function(item, index) {
		return (index % 1) === 0 ? 80 : 80;
	};
	$scope.getItemWidth = function(item) {
		return '100%';
	};
	$scope.show = function() {
		$ionicLoading.show({
			template: 'Synchronisieren...',
			duration: '1000'
		});
	};
	$scope.hide = function(){
		$ionicLoading.hide();
	};
})

.controller('accountCtrl', function($scope) {
})

.controller('feedbackCtrl', function($scope) {
})

.controller('settingsCtrl', function($scope, $localstorage) {
	generateGUID = function(){
		var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});    
		return guid;
	};
	$scope.create100Receipts = function() {
		for(var i= 0; i < 100; i++) {
			$localstorage.insertObject('receipts', {
				text : 'Beleg' + i,
				amount : 123,
				date : '20120304',
				receiptKind : '1',
				kindOfPayment : '1',
				currency : "EUR",
				timestamp : Date(),
				guid: generateGUID()
			});
		}
	};
})

.controller('infosCtrl', function($scope) {
})



.controller('updateReceiptCtrl', function($scope, $localstorage, $stateParams, Friends) {
	$scope.friend = $localstorage.get($stateParams.friendId);
});
angular.module('starter.controllers', [])

.controller('receiptsCtrl', function($scope, $localstorage) {
	$scope.friends = $localstorage.getObject('receipts');
})

.controller('FriendsCtrl', function($scope, Friends) {
  $scope.friends = Friends.all();
})

.controller('FriendDetailCtrl', function($scope, $stateParams, Friends) {
  $scope.friend = Friends.get($stateParams.friendId);
})

.controller('AccountCtrl', function($scope) {
})

.controller('feedbackCtrl', function($scope) {
})

.controller('settingsCtrl', function($scope) {
})

.controller('infosCtrl', function($scope) {
})

.controller('addReceiptsCtrl', function($scope) {
});
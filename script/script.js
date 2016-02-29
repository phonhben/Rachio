let app = angular.module('rachioZones', []);

let rachioApi = function ($http) {

    let getUserId = function () {
        return $http.get('https://api.rach.io/1/public/person/info', { headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer c3667b81-92a6-4913-b83c-64cc713cbc1e' } })
                    .then(function (response) {
                        return response.data;
                    });
    };

    let getUserInfo = function (user) {
        return $http.get("https://api.rach.io/1/public/person/" + user, { headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer c3667b81-92a6-4913-b83c-64cc713cbc1e' } })
                    .then(function (response) {
                        return response.data;
                    });
    };

    let getCurrentScheduleInfo = function (id) {
        return $http.get("https://api.rach.io/1/public/device/" + id + "/current_schedule", { headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer c3667b81-92a6-4913-b83c-64cc713cbc1e' } })
                    .then(function (response) {
                        return response.data;
                    });
    };
    let getZoneInfo = function (id) {
        return $http.get("https://api.rach.io/1/public/zone/" + id, { headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer c3667b81-92a6-4913-b83c-64cc713cbc1e' } })
                    .then(function (response) {
                        return response.data;
                    });
    };
    let putZoneInfo = function (zoneId, duration) {        
        let data = { id: zoneId, duration: duration }
        return $http.put("https://api.rach.io/1/public/zone/start", data, { headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer c3667b81-92a6-4913-b83c-64cc713cbc1e' } })
    };
    let putZoneAllInfo = function (data) {        
        return $http.put("https://api.rach.io/1/public/zone/start_multiple", data, { headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer c3667b81-92a6-4913-b83c-64cc713cbc1e' } })
    };
    return {
        getUserId: getUserId,
        getUserInfo: getUserInfo,
        getCurrentScheduleInfo: getCurrentScheduleInfo,
        getZoneInfo: getZoneInfo,
        putZoneInfo: putZoneInfo,
        putZoneAllInfo: putZoneAllInfo
    };

};

let module = angular.module("rachioZones");
module.factory("rachioApi", rachioApi);

let MainController = function (
       $scope, rachioApi) {    
    let onUserIdComplete = function (data) {
        $scope.userId = data.id;
        rachioApi.getUserInfo($scope.userId).then(onUserData, onError);
    };

    let onUserData = function (data) {
        $scope.user = data;
    };

    let onCurrentScheduleComplete = function (data) {
        $scope.currentSchedule = null;
        if (!$.isEmptyObject(data)) {
            $scope.currentSchedule = data;
            rachioApi.getZoneInfo(data.zoneId).then(onZoneComplete, onError);
        }        
    };

    let onZoneComplete = function (data) {
        $scope.zone = data;
        $("#status").show();
    };

    let onError = function (reason) {
        $scope.error = "Could not fetch the data.";
    };
    
    $scope.getCurrentSchedule = function (id) {
        rachioApi.getCurrentScheduleInfo(id).then(onCurrentScheduleComplete, onError);
    };

    $scope.StartAllZone = function (allZones, device, $timeout) {
        let data = { "zones": [] };
        for (let x in allZones) {            
            data.zones.push({ "id": allZones[x].zoneId, "duration": allZones[x].duration, "sortOrder": allZones[x].sortOrder });
        };        
        rachioApi.putZoneAllInfo(data).then($timeout(rachioApi.getCurrentScheduleInfo(device.id).then(onCurrentScheduleComplete, onError), 300));
    };

    $scope.StartZone = function (zone, device) {
        rachioApi.putZoneInfo(zone.zoneId, zone.duration).then(rachioApi.getCurrentScheduleInfo(device.id).then(onCurrentScheduleComplete, onError));
    };

    rachioApi.getUserId().then(onUserIdComplete, onError);

};

app.controller("user", MainController);


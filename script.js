class Ship {
    constructor(size) {
        this.isAlive = true;
        this.size = size;
        this.imgUrl = './images/ship' + size + '.png';
        this.isVertical = false;
        this.bodyArray = [];
        this.occupiedPlace = [];
        this.base = [];
    }

    get body() {
        if (!this.bodyArray.length) {
            if (this.isVertical) {
                for (let i = 0; i < this.size; i++) {
                    this.bodyArray.push([this.base[0] + i, this.base[1]]);
                }
            }
            else {
                for (let i = 0; i < this.size; i++) {
                    this.bodyArray.push([this.base[0], this.base[1] + i]);
                }
            }
        }
        return this.bodyArray;
    }

    set shipPlace(array) {
        this.occupiedPlace = array;
    }

    get shipPlace() {
        if (!this.occupiedPlace.length) {
            for (let j = -1; j < 2; j++) {
                if (this.isVertical) {
                    for (let i = -1; i <= this.size; i++) {
                        this.occupiedPlace.push([this.base[0] + i, this.base[1] + j]);
                    }
                }
                else {
                    for (let i = -1; i <= this.size; i++) {
                        this.occupiedPlace.push([this.base[0] + j, this.base[1] + i]);
                    }
                }
            }
        }
        return this.occupiedPlace;
    }

    get imageHtml() {
        let rotateClass = (this.isVertical) ? 'class="rotated"' : '';
        return '<img src="' + this.imgUrl + '" ' + rotateClass + '>';
    }

    crushed() {
        this.isAlive = false;
        this.imgUrl = './images/sunk/ship' + this.size + '.png';
    }
}

let navyPrototype = {
    '10': {
        maxcount: 1,
        items: []
    },
    '5': {
        maxcount: 2,
        items: []
    },
    '2': {
        maxcount: 3,
        items: []
    }
};

function hasInterseption(array1, array2) {

    let hasIntersept = false;//no inerseption
    loop:
        for (let i = 0; i < array1.length; i++) {
            for (let j = 0; j < array2.length; j++) {
                if (array1[i][0] == array2[j][0] && array1[i][1] == array2[j][1]) {
                    hasIntersept = true;
                }
            }
        }
    return hasIntersept;
}

function notTrespassing(row, col, shipSize, isVerticalShip) {
    return (isVerticalShip) ? (row + shipSize) < 21 : (col + shipSize) < 21;
}

(function () {
    let app = angular.module('seaBattle', ['ngSanitize', 'directs']);

    app.run(function ($rootScope) {
        $rootScope.userScore = 0;
        $rootScope.computerScore = 0;

        $rootScope.beforeRun = true;

        $rootScope.userNavy = JSON.parse(JSON.stringify(navyPrototype));
        $rootScope.compNavy = JSON.parse(JSON.stringify(navyPrototype));


        $rootScope.shotHTML = '<img src="./images/shot.png">'
    });

    app.controller('compFieldController', ['$scope', '$rootScope', function ($scope, $rootScope) {

        $scope.fieldElements = new Array(20);
        for (let i = 0; i < $scope.fieldElements.length; i++) {
            $scope.fieldElements[i] = new Array(20);
        }

        (function placeCompNavy() {
            let compShipsnumber = 6;
            let shipSizes = [10, 5, 5, 2, 2, 2];
            while (compShipsnumber) {
                let row = parseInt(Math.random() * 20);
                let col = parseInt(Math.random() * 20);
                let size = shipSizes[0];
                let currentShip = new Ship(size);
                currentShip.isVertical = parseInt(Math.random() * 2);

                if (currentShip && notTrespassing(row, col, currentShip.size, currentShip.isVertical)) {
                    currentShip.base = [row, col];
                    let notsuitable = false;
                    loopForCompNavy:
                        for (let shipGroup in $rootScope.compNavy) {
                            for (let ship of $rootScope.compNavy[shipGroup].items) {
                                if (notsuitable = hasInterseption(currentShip.shipPlace, ship.body)) {
                                    break loopForCompNavy;
                                }
                            }

                        }
                    if (!notsuitable) {
                        $rootScope.compNavy[currentShip.size].items.push(currentShip);
                        shipSizes.shift();
                        --compShipsnumber;
                        // $scope.fieldElements[row][col]=currentShip.imageHtml;//for testing
                    }
                }
            }
        })();


        $scope.clickAction = function (row, col) {
            let gotIt = false;
            loopForCompNavy:
                for (let shipGroup in $rootScope.compNavy) {
                    for (let ship of $rootScope.compNavy[shipGroup].items) {
                        if (hasInterseption([[row, col]], ship.body)) {
                            console.log('has user interseption ');
                            gotIt=true;
                            if(ship.isAlive){
                                $rootScope.userScore += ship.size;
                                ship.crushed();
                                $scope.fieldElements[ship.base[0]][ship.base[1]] = ship.imageHtml;
                                if ($rootScope.userScore == 26) {
                                    alert('Congratulations!!! You win!!! Press "Ok" to play again.');
                                    location.reload();
                                }
                            }
                            break loopForCompNavy;
                        }
                    }
                }
                if(!gotIt){
                    $scope.fieldElements[row][col] = $rootScope.shotHTML;
                }
            $rootScope.$broadcast('shotIsDone');
        }
    }]);


    app.controller('userFieldController', ['$scope', '$rootScope', function ($scope, $rootScope) {
        let userShipsnumber = 6;

        $scope.fieldElements = new Array(20);
        for (let i = 0; i < $scope.fieldElements.length; i++) {
            $scope.fieldElements[i] = new Array(20);
        }

        $scope.tookShip = function (size) {
            if ($rootScope.userNavy[size].maxcount > $rootScope.userNavy[size].items.length) {
                $scope.currentShip = new Ship(size);
            }
        };

        $scope.clickAction = function (row, col) {
            if ($rootScope.beforeRun) {
                if ($scope.currentShip && notTrespassing(row, col, $scope.currentShip.size, $scope.currentShip.isVertical)) {
                    $scope.currentShip.base = [row, col];
                    let notsuitable = false;
                    loopForUserNavy:
                        for (let shipGroup in $rootScope.userNavy) {

                            for (let ship of $rootScope.userNavy[shipGroup].items) {
                                if (notsuitable = hasInterseption($scope.currentShip.shipPlace, ship.body)) {
                                    $scope.currentShip.shipPlace = [];
                                    break loopForUserNavy;
                                }
                            }
                        }

                    if (!notsuitable) {
                        $rootScope.userNavy[$scope.currentShip.size].items.push($scope.currentShip);

                        $scope.fieldElements[row][col] = $scope.currentShip.imageHtml;
                        $scope.currentShip = undefined;
                        if (!--userShipsnumber) {
                            $rootScope.beforeRun = false;
                        }
                    }
                }
            }
        };

        $scope.rotateCurrent = function () {
            if ($scope.currentShip) {
                $scope.currentShip.isVertical = !$scope.currentShip.isVertical;
            }
        };


        $scope.$on('shotIsDone', function (event, data) {
            let row = parseInt(Math.random() * 20);
            let col = parseInt(Math.random() * 20);

            let gotIt = false;
            loopForUserNavy:
                for (let shipGroup in $rootScope.userNavy) {
                    for (let ship of $rootScope.userNavy[shipGroup].items) {
                        if (hasInterseption([[row, col]], ship.body)) {
                            gotIt=true;
                            if(ship.isAlive){
                                ship.crushed();
                                $rootScope.computerScore += ship.size;
                                $scope.fieldElements[ship.base[0]][ship.base[1]] = ship.imageHtml;
                                if ($rootScope.computerScore == 26) {
                                    alert('Sorry, but computer wins!!! Press "Ok" to play again.');
                                    location.reload();
                                }
                            }
                            break loopForUserNavy;
                        }
                    }
                }
            if(!gotIt){
                $scope.fieldElements[row][col] = $rootScope.shotHTML;
            }
        });
    }]);

})();
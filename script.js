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

    // set base(array) {//[row,column] top or left of ship (depends on ship's orientation)
    //     this.baseArray = array;
    // }
    //
    // get base() {
    //     return this.baseArray;
    // }

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

    set shipPlace(array){
        this.occupiedPlace=array;
    }

    get shipPlace() {
        if (!this.occupiedPlace.length){
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
    // console.log(array1);
    // console.log(array2);

    let hasIntersept = false;//no inerseption
    loop:
        for (let i = 0; i < array1.length; i++) {
            for(let j = 0; j < array2.length; j++){
                if(array1[i][0]==array2[j][0] && array1[i][1]==array2[j][1]){
                    hasIntersept=true;
                }
            }
            // if (~array2.indexOf(array1[i])) {//if array2 has item from array1
            //     hasIntersept = true;
            //     break loop;
            // }
        }
        // console.log('hasInterseption returned '+hasIntersept);
    return hasIntersept;
}

function notTrespassing(row, col, shipSize, isVerticalShip) {
    return (isVerticalShip) ? (row + shipSize) < 21 : (col + shipSize) < 21;
}

function hitTheShip(row,col,navy){
    let gotIt=false;
    loopForNavy:
        for (let shipGroup in navy) {
            for (let ship of navy[shipGroup].items) {
                // console.log('['+row+','+col+'] in '+ship.body);
                if (hasInterseption([[row,col]], ship.body)) {
                    ship.crushed();
                    gotIt=ship;
                    //$scope.fieldElements[row][col]=ship.imageHtml;
                    // $rootScope.userScore++;
                    break loopForNavy;
                }
            }
        }
    return gotIt;
}


(function () {
    let app = angular.module('seaBattle', ['ngSanitize', 'directs']);

    app.run(function ($rootScope) {
        $rootScope.userScore = 0;
        $rootScope.computerScore = 0;

        $rootScope.beforeRun = true;

        // $rootScope.userNavy = Object.create(navyPrototype);
        $rootScope.userNavy = JSON.parse(JSON.stringify(navyPrototype));
        $rootScope.compNavy = JSON.parse(JSON.stringify(navyPrototype));
        // $rootScope.compNavy = Object.create(navyPrototype);

        // $rootScope.userShots = [];
        // $rootScope.compShots = [];

        $rootScope.shotHTML='<img src="./images/shot.png">'
    });

    app.controller('compFieldController', ['$scope', '$rootScope', function($scope, $rootScope) {

        $scope.fieldElements = new Array(20);
        for (let i = 0; i < $scope.fieldElements.length; i++) {
            $scope.fieldElements[i] = new Array(20);
        }

        (function placeCompNavy(){
            let compShipsnumber=6;
            let shipSizes=[10,5,5,2,2,2];
            while(compShipsnumber){
                // console.log('placeCompNavy: '+compShipsnumber);
                let row=parseInt(Math.random()*20);
                let col=parseInt(Math.random()*20);
                // let size=([2,5,10])[parseInt(Math.random()*3)];
                let size=shipSizes[0];
                let currentShip=new Ship(size);
                currentShip.isVertical=parseInt(Math.random()*2);

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
                    if(!notsuitable) {
                        $rootScope.compNavy[currentShip.size].items.push(currentShip);
                        shipSizes.shift();
                        $scope.fieldElements[row][col] = currentShip.imageHtml;
                        --compShipsnumber;
                    }
                }
            }
        })();




        $scope.clickAction = function (row, col) {
            // $rootScope.userShots.push([row, col]);
            let crushedShip=hitTheShip(row, col, $rootScope.compNavy);
            if(crushedShip){
                $scope.fieldElements[crushedShip.base[0]][crushedShip.base[1]]=crushedShip.imageHtml;
                $rootScope.userScore+=crushedShip.size;
                if($rootScope.userScore==26){
                    alert('Congratulations!!! You win!!! Press "Ok" to play again.');
                    location.reload();
                }
            }else{
                $scope.fieldElements[row][col]=$rootScope.shotHTML;
                // $scope.$emit('shotIsDone',0);
                $rootScope.$broadcast('shotIsDone');
            }
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
            if($rootScope.beforeRun){
                if ($scope.currentShip && notTrespassing(row, col, $scope.currentShip.size, $scope.currentShip.isVertical)) {
                    $scope.currentShip.base = [row, col];
                    let notsuitable = false;
                    loopForUserNavy:
                        for (let shipGroup in $rootScope.userNavy) {

                            for (let ship of $rootScope.userNavy[shipGroup].items) {
                                if (notsuitable = hasInterseption($scope.currentShip.shipPlace, ship.body)) {
                                    $scope.currentShip.shipPlace=[];
                                    break loopForUserNavy;
                                }
                            }
                        }

                    if(!notsuitable) {
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
            if($scope.currentShip){
                $scope.currentShip.isVertical = !$scope.currentShip.isVertical;
            }
        };


        $scope.$on('shotIsDone', function(event, data) {
            let row=parseInt(Math.random()*20);
            let col=parseInt(Math.random()*20);
            let crushedShip=hitTheShip(row,col,$rootScope.userNavy);
            if(crushedShip){
                $scope.fieldElements[crushedShip.base[0]][crushedShip.base[1]]=crushedShip.imageHtml;
                $rootScope.computerScore+=crushedShip.size;
                if($rootScope.computerScore==26){
                    alert('Sorry, but computer wins!!! Press "Ok" to play again.');
                    location.reload();
                }
            }else{
                $scope.fieldElements[row][col]=$rootScope.shotHTML;
            }
        });


        // $scope.computerShot=function(){
        //     let row=parseInt(Math.random()*20);
        //     let col=parseInt(Math.random()*20);
        //     let crushedShip=hitTheShip(row,col,$rootScope.userNavy);
        //     if(crushedShip){
        //         $scope.fieldElements[crushedShip.base[0]][crushedShip.base[1]]=crushedShip.imageHtml;
        //         $rootScope.computerScore+=crushedShip.size;
        //         if($rootScope.computerScore==26){
        //             alert('Sorry, but computer wins!!! Press "Ok" to play again.');
        //             location.reload();
        //         }
        //     }else{
        //         $scope.fieldElements[row][col]=$rootScope.shotHTML;
        //     }
        // };

    }]);

})();
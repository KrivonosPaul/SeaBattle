(function(){
    let app=angular.module('directs',[]);
    // app.directive('userPreparation', function(){
    //     return {
    //         restrict:'E',
    //         templateUrl:'./templates/prepare.html'
    //     };
    // });

    app.directive('userField', function(){
        return{
            restrict:'E',
            templateUrl:'./templates/field.html'
        }
    });
    app.directive('userFieldOnStart', function(){
        return{
            restrict:'E',
            templateUrl:'./templates/prepare.html'
        };
    });
    app.directive('compField',function(){
        return {
            restrict:'E',
            templateUrl:'./templates/field.html'
        }
    });
    app.directive('scores',function(){
        return {
            restrict:'E',
            templateUrl:'./templates/scores.html'
        }
    });
})();
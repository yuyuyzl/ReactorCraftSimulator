/**
 * Created by user on 2016/2/4.
 */
(function(){
    var app=angular.module("main",[]);

    app.controller("mainController",function(){
        this.col=16;
        this.row=16;
        this.chosen=1
        this.fun=function(n){
            var ans=[];
            for (var i=0;i<n;i++){
                ans.push(i);
            }
            return ans;
        }
    });

})();
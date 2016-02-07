/**
 * Created by user on 2016/2/4.
 */

(function(){
    var app=angular.module("main",[]);

    app.controller("mainController",function(){
        this.col=8;
        this.row=8;
        this.chosen=1
        this.fun=function(n){
            var ans=[];
            for (var i=0;i<n;i++){
                ans.push(i);
            }
            return ans;
        }
        this.getwidth=function(){
            return document.body.clientHeight
        }
        this.inc=function(n){
            if (typeof(n)=="number")n++;
            else n=Number(n)+1;
            return n;
        }
        this.blockNames=[null,"Fuel Rod","Steam Boiler","Reflector","Steel Block"]
        this.blockimg=["img/blank.png","img/fuel_top.png","img/boiler.png","img/reflector.png","img/steel.png"]

    });

})();

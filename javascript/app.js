/**
 * Created by user on 2016/2/4.
 */

(function(){
    var app=angular.module("main",[]);

    app.controller("mainController",['$sce','$q','$scope','$timeout',function($sce,$q,$scope,$timeout){
        this.col=8;
        this.row=8;
        this.chosen=1;

        this.clearData=function(){
            this.data=[];
            for (var i=0;i<32;i++)this.data.push(new Array(32));
        }
        this.clearData();
        this.getRangeArray=function(n){
            var ans=[];
            for (var i=0;i<n;i++){
                ans.push(i);
            }
            return ans;
        };

        this.inc=function(n){
            if (typeof(n)=="number")n++;
            else n=Number(n)+1;
            return n;
        };
        this.blockNames=["Air","Fuel Rod","Steam Boiler","Reflector","Steel Block"];
        this.blockImg=["img/blank.png","img/fuel_top.png","img/boiler.png","img/reflector.png","img/steel.png"];
        this.blockValue=[null,Block.Type.CORE,Block.Type.BOILER,Block.Type.REFLECTOR,Block.Type.STEEL];
        this.outputHtml=function(s){
            console.log(s);
            $scope.outputFieldSafe=$sce.trustAsHtml(s);
        }
        this.outputHtml("No output.<br>Run an emulation now!<br>Let's Rock!");



        this.emulate=function(){
            //var deferred=$q.defer();
            var a=this;
            //$timeout(function(){


                var wd=RecWorld.createNew(Math.max(a.col,a.row));
                //console.log(this.data.length)
                for (var i=0;i<a.data.length;i++){
                    //console.log(this.data[i].length)
                    for (var j=0;j<a.data[i].length;j++){
                        //console.log(i+" "+j);
                        if (a.data[i][j]!=null)wd.setBlock(a.blockValue[a.data[i][j]],i,j);
                    }
                }
                for (var i=0;i<3000000;i++){
                    wd.doTick();
                    if (wd.worldTick%1000000==0)this.outputHtml(wd.printWorld())//deferred.notify(wd.printWorld());
                    wd.worldTick++;
                }
            this.outputHtml(wd.printWorld())//deferred.resolve(wd.printWorld());
            //},0);
            //return deferred.promise;



        }
    }]);

})();

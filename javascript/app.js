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
        //*************从这里开始往下看@imbushuo********************
        this.outputHtml=function(s){//这个函数输出到右下角和更新绑定的outputFieldSafe域
            console.log(s);
            $scope.outputFieldSafe=$sce.trustAsHtml(s);
        }
        this.outputHtml("No output.<br>Run an emulation now!<br>Let's Rock!");
        this.emulate=function(){    //主要的模拟过程，现在只有温度传导可用
            //var deferred=$q.defer();
            var a=this;
            //$timeout(function(){


                var wd=RecWorld.createNew(Math.max(a.col,a.row));//下面是根据data数组生成世界
                //console.log(this.data.length)
                for (var i=0;i<a.data.length;i++){
                    //console.log(this.data[i].length)
                    for (var j=0;j<a.data[i].length;j++){
                        //console.log(i+" "+j);
                        if (a.data[i][j]!=null)wd.setBlock(a.blockValue[a.data[i][j]],i,j);
                    }
                }//上面是根据data数组生成世界，这一步不占用时间


                //主要耗时过程
                for (var i=0;i<3000000;i++){
                    wd.doTick();//实际上每一次doTick都是相对很短时间的，但是要做相当大量才能得出结果
                    if (wd.worldTick%1000000==0)this.outputHtml(wd.printWorld())//deferred.notify(wd.printWorld());//希望经过指定更新步数或者指定时间后更新一次状态栏
                    wd.worldTick++;
                }
            this.outputHtml(wd.printWorld())//deferred.resolve(wd.printWorld());结束后最后更新一次状态栏
            //},0);
            //return deferred.promise;



        }
    }]);
////*************看到这里就可以了@imbushuo********************
})();

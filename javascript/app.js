/**
 * Created by user on 2016/2/4.
 */

(function(){
    var app=angular.module("main",[]);

    app.controller("mainController",['$sce',function($sce){
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
        this.outputField="No output.<br>Run an emulation now!<br>Let's Rock!";

        this.outputFieldSafe=$sce.trustAsHtml(this.outputField);
        this.emulate=function(){
            this.outputField="Rock and Roll!";
            this.outputFieldSafe=$sce.trustAsHtml(this.outputField);

            var wd=RecWorld.createNew(Math.max(this.col,this.row));
            //console.log(this.data.length)
            for (var i=0;i<this.data.length;i++){
                //console.log(this.data[i].length)
                for (var j=0;j<this.data[i].length;j++){
                    //console.log(i+" "+j);
                    if (this.data[i][j]!=null)wd.setBlock(this.blockValue[this.data[i][j]],i,j);
                }
            }
            for (var i=0;i<30000;i++){
                wd.doTick();
                wd.worldTick++;
            }
            this.outputField=wd.printWorld();
            this.outputFieldSafe=$sce.trustAsHtml(this.outputField);

        }
    }]);

})();

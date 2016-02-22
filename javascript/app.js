/**
 * Created by user on 2016/2/4.
 */

(function(){
    var app=angular.module("main",[]);

    app.controller("mainController",['$sce','$q','$scope','$timeout',function($sce,$q,$scope,$timeout){
        this.col=8;
        this.row=8;
        this.chosen=1;
        this.cappcount=0;
        this.fuelType=0;
        this.maxtime=30000000;
        this.refreshRate=200;
        this.stopNow=false;
        this.clearData=function(){
            this.data=[];
            for (var i=0;i<32;i++)this.data.push(new Array(32));
        };
        this.clearData();
        this.GetQueryString=function(name){
            var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if(r!=null)return  unescape(r[2]);
            return null;
        }
        this.encodeData=function(data,x,y,ft,cp){
            var s=x+"_"+y+"_";
            for (var i=0;i<x;i++)
                for (var j=0;j<y;j++)s+=data[i][j]==null?'0':['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H'][data[i][j]]
            s+="_"+(cp?(ft+8):ft)
            return s;


        }
        this.decodeData=function(s){
            console.log(s)
            var a=s.split("_")
            console.log(a)
            this.col= a[0];
            this.row=a[1];
            var k=0
            for (var i=0;i<this.col;i++)
                for (var j=0;j<this.row;j++){
                    this.data[i][j]=['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H'].indexOf(a[2][k]);
                    k++;
                }
            if (a[3]>=8){
                this.fuelType=a[3]-8;
                this.cappcount=11;
            }else this.fuelType=a[3];
        }
        var dataget=this.GetQueryString('data');
        if (dataget!=null)this.decodeData(dataget);
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
        this.blockNames=["Air","Fuel Rod","Steam Boiler","Reflector","Steel Block","Bedingot Block","Concrete","Obsidian","Water"];
        this.blockImg=["img/blank.png","img/fuel_top.png","img/boiler.png","img/reflector.png","img/steel.png","img/bedrock.png","img/concrete.png","img/obsidian.png","img/water_still.png"];
        this.blockValue=[null,Block.Type.CORE,Block.Type.BOILER,Block.Type.REFLECTOR,Block.Type.STEEL,Block.Type.BEDINGOT,Block.Type.CONCRETE,Block.Type.OBSIDIAN,Block.Type.WATER];

        this.outputHtml=function(s){
            //console.log(s);
            $scope.outputFieldSafe=$sce.trustAsHtml(s);

        };
        this.outputHtml("Nothing to output.<br>Choose block from the list above and left-click to place it into the world on the left.<br>And then, Let's Rock!");
        this.emulate=function(){
            this.stopNow=false;
            var a=this;
            var wd=RecWorld.createNew(Math.max(a.col,a.row)+1, a.cappcount>10, a.fuelType);
            for (var i=0;i<a.data.length;i++){
                    //console.log(this.data[i].length)
                for (var j=0;j<a.data[i].length;j++){
                        //console.log(i+" "+j);
                    if (a.data[i][j]!=null)wd.setBlock(a.blockValue[a.data[i][j]],i,j);
                }
            }
            var emdefer=function(){
                var deferred=$q.defer();
                setTimeout(function(){
                    var sd=Date.now();
                    while(Date.now()-sd< a.refreshRate && wd.worldTick< a.maxtime && !a.stopNow){
                        try{
                            wd.doTick();
                        }catch (err){
                            deferred.reject(err);
                            return;
                        }

                        wd.worldTick++;
                    }
                    if (a.stopNow)deferred.reject("Stopped by user.");else deferred.resolve();
                },0);
                return deferred.promise;
            };
            function doemulate() {
                emdefer().then(function () {
                    a.outputHtml(wd.printWorld(null));
                    if (wd.worldTick< a.maxtime)doemulate();
                },function(reason){
                    a.outputHtml(reason+'<br>'+wd.printWorld(null));
                });
            }
            doemulate();
        }
    }]);

})();

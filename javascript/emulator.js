/**
 * Created by user on 2016/2/7.
 */


//BaseTile.java
var Basetile={
    createNew:function(){
        var tile={};
        tile.temperature=0;
        tile.setTemperature=function(newTemperature) {
            this.temperature = newTemperature;
        };
        tile.updateTempurature=function(recWorld,x,z){
            var dT=recWorld.ambientTemp-this.temperature;
            if(dT!=0){
                var d=64;
                var diff=(1+dT/d);
                if (diff<=1)diff=dT/Math.abs(dT);
                this.temperature+=diff;
            }
            for (var i=0;i<6;i++){
                var dir = ForgeDirections[i];
                var dx = x + dir.offsetX;
                var dy = dir.offsetY;
                var dz = z + dir.offsetZ;
                var block = recWorld.getBlock(dx, dy, dz);
                var te = recWorld.getTileEntity(dx, dy, dz);
                if (block != null && te!=null) {

                    var bt = te;

                    var T = bt.temperature;
                    dT = T - this.temperature;
                    if (dT > 0) {

                        var newT = T - dT / 4;
                        this.temperature += dT / 4;
                        bt.setTemperature(newT);

                    }

                }
            }

            for (i=2;i<6;i++){
                dir = ForgeDirections[i];
                dx = x + dir.offsetX;
                dy = dir.offsetY;
                dz = z + dir.offsetZ;
                block = recWorld.getBlock(dx, dy, dz);
                te = recWorld.getTileEntity(dx, dy, dz);
                if (block != null && te!=null) {

                    bt = te;
                    if ((this.type==TileType.FISSION && bt.type==TileType.FISSION) ||
                        (this.type==TileType.BREEDER && ((bt.type==TileType.BREEDER)||(bt.type==TileType.SODIUM_HEATER)))) {
                        T = bt.temperature;
                        dT = - T + this.temperature;
                        if (dT > 0) {

                            newT = T + dT / 16;
                            this.temperature -= dT / 16;
                            bt.setTemperature(newT);

                        }
                    }
                }
            }
        };

        return tile;
    }
};
//RecWorld.java
var RecWorld={
    createNew:function(mr,isCapp,fuelType,ambientTemp){
        var recworld={};
        recworld.isCapp=isCapp;
        recworld.mr=mr;
        recworld.fuelType=fuelType;
        recworld.ambientTemp=ambientTemp;
        if (fuelType==0) {//uranium
            recworld.fuelFissionChance = 25;
            recworld.fuelStepTemp=20;
            recworld.fuelConsumeChance=3;
        }
        if (fuelType==1){
            recworld.fuelFissionChance = 30;
            recworld.fuelStepTemp=30;
            recworld.fuelConsumeChance=4;
        }

        recworld.worldTick=0;
        recworld.steam=0;
        recworld.fuelConsumed=0;
        recworld.plutoniumProduced=0;
        recworld.isRemote=false;
        recworld.coreCount=0;
        recworld.tiles=[];
        recworld.neutronEscaped=0;
        recworld.maxtemptot=-1;
        recworld.maxtemptots=null;
        for(var i=0;i<mr;i++){
            recworld.tiles.push(new Array(mr));
        }
        recworld.world=[];
        for(var i=0;i<mr;i++){
            recworld.world.push(new Array(mr));
        }
        recworld.tileArray=[];
        recworld.doTick=function(){

            this.tileArray.forEach(function(te){


                    te.update(recworld, te.getX(), te.getZ());

            });
            //console.log("finished!!!!!!!!!!!!!!!!")
        };
        recworld.printWorld=function(outtype){
            var s="";
            var maxs=null;
            var maxtemp=-1;
            this.tileArray.forEach(function(te){
                //console.log(recworld.getBlock(te.entity_x,0,te.entity_z).type+" at "+te.entity_x+","+te.entity_z+" is "+te.temperature);
                if (outtype!=null && outtype.contains(recworld.getBlock(te.entity_x,0,te.entity_z).type))
                    s+=Block.Name[recworld.getBlock(te.entity_x,0,te.entity_z).type]+" at "+te.entity_x+","+te.entity_z+" is "+Math.round(te.temperature)+"<br>";
                if (te.temperature>maxtemp) {
                    maxs=Block.Name[recworld.getBlock(te.entity_x,0,te.entity_z).type]+" at "+te.entity_x+","+te.entity_z+" is the hottest @"+Math.round(te.temperature);
                    maxtemp=te.temperature;
                }
            });
            //console.log("The time is "+recworld.worldTick);
            if (maxs!=null){s+=maxs+'(now)<br>';
            if (maxtemp>this.maxtemptot) {
                this.maxtemptots=maxs+"(till now)<br>";
                this.maxtemptot=maxtemp;
            }}
            if (this.maxtemptots!=null)s+=this.maxtemptots;
            s+="The tick is "+recworld.worldTick +"<br>";
            s+="The day is "+(recworld.worldTick/1728000).toFixed(2) +"<br>";
            //console.log("Total steam is "+recworld.steam);
            if (recworld.steam>0)s+="Steam / second: "+(recworld.steam*20/recworld.worldTick).toFixed(2)+"<br>";
            if (recworld.steam>0)s+="Running HPTs: "+(recworld.steam*20/recworld.worldTick/102).toFixed(2)+"<br>";
            if (recworld.steam>0)s+="Steam / second / Rod: "+(recworld.steam*20/recworld.worldTick/recworld.coreCount).toFixed(2)+"<br>";
            if (recworld.fuelConsumed!=0)s+="Uranium consumed / second: "+(recworld.fuelConsumed*20/recworld.worldTick/100).toFixed(4)+"<br>";
            if (recworld.plutoniumProduced!=0)s+="Plutonium produced / second: "+(recworld.plutoniumProduced*20/recworld.worldTick/100).toFixed(6)+"<br>";
            if (recworld.fuelConsumed>0 && recworld.steam>0)s+="Efficiency: "+(recworld.steam/recworld.fuelConsumed).toFixed(2)+"<br>";
            if (recworld.fuelConsumed==0 && recworld.plutoniumProduced!=0 && recworld.steam>0)s+="Efficiency(Plutonium): "+(-recworld.steam/recworld.plutoniumProduced*4).toFixed(2)+"<br>";
            s+="Escaped Neutron / second: "+(recworld.neutronEscaped*20/recworld.worldTick).toFixed(2);
            return s;
        };
        recworld.checkCoord=function(x, z) {
            if (x < 0 || z < 0) {
                return false;
            }
            if (x >= mr) {
                return false;
            }
            if (z >= mr) {
                return false;
            }
            return true;
        };
        recworld.getBlock=function(x,y,z){
            if (y != 0) {
                return null;//block.air -> null
            }
            if (!this.checkCoord(x, z)) {
                return null;//block.air -> null
            }
            //console.log("X"+x+"Z"+z)
            var b = this.world[x][z];
            if(b == null)
            {
                return null;//block.air -> null
            }else
            {
                return b;
            }
        };
        recworld.getBlockMetadata=function(x,y,z){return 0};
        recworld.getTileEntity=function(x,y,z) {
            if (y != 0) {
                return null;
            }
            if (!this.checkCoord(x, z)) {
                return null;
            }
            return this.tiles[x][z];

        };
        recworld.getTemp=function (x,z) {
            var te=this.getTileEntity(x,0,z);
            if(te!=null){
                return te.temperature;
            }else return 0;
        };
        recworld.setBlock=function(t,x,z){
            if (this.checkCoord(x,z)){
                var b= Block.createNew();
                b.type=t;
                recworld.world[x][z]=b;
                switch (t){
                    case Block.Type.CORE:
                        var te=TileFuelCore.createNew(x,z);
                        recworld.tiles[x][z]=te;
                        recworld.tileArray.push(te);
                        recworld.coreCount++;
                        console.log("CoreCount++");
                        break;
                    case Block.Type.BOILER:
                        var te=TileBoiler.createNew(x,z);
                        recworld.tiles[x][z]=te;
                        recworld.tileArray.push(te);
                        break;
                    case Block.Type.BREEDER:
                        var te=TileBreederCore.createNew(x,z);
                        recworld.tiles[x][z]=te;
                        recworld.tileArray.push(te);
                        break;
                    case Block.Type.SODIUM_HEATER:
                        var te=TileSodiumHeater.createNew(x,z);
                        recworld.tiles[x][z]=te;
                        recworld.tileArray.push(te);
                        break;

                }
            }
        };

        return recworld;
    }
};
//Block.java
var Block={
    Type:{
        AIR:0, NORMAL:1, WATER:2, STEEL:3, CONCRETE:4, BEDINGOT:5, LEAD:6, OBSIDIAN:7, CORE:8, BOILER:9, REFLECTOR:10, BREEDER:11, SODIUM_HEATER:12
    },
    Name:[null,null,null,null,null,null,null,null,"Fuel Rod","Steam Boiler",null,"Breeder Core","Sodium Heater"],
    createNew:function(){
        var block={};
        block.hasTileEntity=function(){
            switch (this.type) {
                case Block.Type.CORE:
                case Block.Type.BOILER:
                case Block.Type.BREEDER:
                case Block.Type.SODIUM_HEATER:
                    return true;
                default:
                    return false;
            }
        };
        block.isNeutronShield=function(){
            switch (this.type) {
                case Block.Type.WATER:
                case Block.Type.STEEL:
                case Block.Type.CONCRETE:
                case Block.Type.BEDINGOT:
                case Block.Type.LEAD:
                case Block.Type.OBSIDIAN:
                    return true;
                default:
                    return false;
            }
        };
        block.getAbsorptionChance=function(t){
            switch(this.type)
            {
                case Block.Type.WATER:
                    return 30;
                case Block.Type.STEEL:
                    return 90;
                case Block.Type.CONCRETE:
                    return 60;
                case Block.Type.BEDINGOT:
                    return 97.5;
                case Block.Type.LEAD:
                    return 75;
                case Block.Type.OBSIDIAN:
                    return 50;
                default :
                    return 0;
            }
        };
        return block;
    }
};
//ForgeDirection.java
function createNewDir(x, y, z){
    var dir={};
    dir.offsetX = x;
    dir.offsetY = y;
    dir.offsetZ = z;
    dir.getOpposite=function(){
        switch (this){
            case ForgeDirection.UP:return ForgeDirection.DOWN;
            case ForgeDirection.DOWN:return ForgeDirection.UP;
            case ForgeDirection.NORTH:return ForgeDirection.SOUTH;
            case ForgeDirection.SOUTH:return ForgeDirection.NORTH;
            case ForgeDirection.WEST:return ForgeDirection.EAST;
            case ForgeDirection.EAST:return ForgeDirection.WEST;
        }
    };
    return dir;
}
var ForgeDirection={
    DOWN:createNewDir(0,-1,0),
    UP:createNewDir(0,1,0),
    NORTH:createNewDir(0,0,-1),
    SOUTH:createNewDir(0,0,1),
    WEST:createNewDir(-1,0,0),
    EAST:createNewDir(1,0,0)
};
var ForgeDirections=[ForgeDirection.DOWN,ForgeDirection.UP,
    ForgeDirection.NORTH,ForgeDirection.SOUTH,
    ForgeDirection.WEST,ForgeDirection.EAST];
var getRandomDirection=function(){
    return [ForgeDirection.NORTH,ForgeDirection.SOUTH,
        ForgeDirection.WEST,ForgeDirection.EAST,ForgeDirection.EAST][Math.floor(Math.random()*4)];
};
//ReikaRandomHelper.java
var ReikaRandomHelper={
    doWithChance:function(num){
        if (num >= 100.0) {
            return true;
        } else {
            if (num > 1.0) {
                num /= 100.0;
            }

            return num >= 1.0 || (num > 0.0 && (num < 1.0E-14 ? Math.random() * 1.0E13 < num * 1.0E13 : Math.random() < num));
        }
    }
};

var TileType={
    BOILER:0,FISSION:1,BREEDER:2,SODIUM_HEATER:3
}

//TileBoiler.java
var TileBoiler={
    createNew:function(x,z){
        var tb=Basetile.createNew();
        tb.type=TileType.BOILER;
        tb.entity_x=x;
        tb.entity_z=z;
        tb.getX=function (){
            return this.entity_x;
        };
        tb.getZ=function(){
            return this.entity_z;
        };
        tb.update= function (recWorld,x,z) {
            if (recWorld.worldTick%20==0){
                this.updateTempurature(recWorld,x,z);
                if (this.temperature>=2000){
                    throw("Boiler @ ("+x+","+z+") Overheated @ Tick "+recWorld.worldTick);

                }
            }
            if (this.temperature>100) {
                recWorld.steam++;
                if (recWorld.isCapp) this.temperature -= 10;//this is modified by wz
                else this.temperature-=5;
            }

        };
        tb.onNeutron=function(recWorld,x,y,z,type){
            return type==NeutronType.BREEDER?ReikaRandomHelper.doWithChance(80):false;
        }

        return tb;
    }
};
var TileSodiumHeater={
    createNew:function(x,z){
        var tb=Basetile.createNew();
        tb.type=TileType.SODIUM_HEATER;
        tb.entity_x=x;
        tb.entity_z=z;
        tb.getX=function (){
            return this.entity_x;
        };
        tb.getZ=function(){
            return this.entity_z;
        };
        tb.update= function (recWorld,x,z) {
            if (recWorld.worldTick%20==0){
                this.updateTempurature(recWorld,x,z);
                if (this.temperature>=2000){
                    throw("Sodium Heater @ ("+x+","+z+") Overheated @ Tick "+recWorld.worldTick);

                }
            }
            if (this.temperature>300) {
                this.temperature -= 123;

                if (recWorld.isCapp) recWorld.steam+= 12;//this is modified by wz
                else recWorld.steam+=24;
            }

        };
        tb.onNeutron=function(recWorld,x,y,z,type){
            return type==NeutronType.FISSION?ReikaRandomHelper.doWithChance(90):false;
        }
        return tb;
    }
};

//TileFuelCore.java

var TileFuelCore={
    createNew:function(x,z){
        var tb=Basetile.createNew();
        tb.type=TileType.FISSION
        tb.entity_x=x;
        tb.entity_z=z;
        tb.emulator=NeutronEmulatorV2.createNew();
        tb.getX=function (){
            return this.entity_x;
        };
        tb.getZ=function(){
            return this.entity_z;
        };
        tb.spawnNeutronBurst=function(recWorld,x,z){

            this.emulator.fireNeutron(recWorld, x, 0, z, getRandomDirection(),NeutronType.FISSION);
            this.emulator.fireNeutron(recWorld, x, 0, z, getRandomDirection(),NeutronType.FISSION);
            this.emulator.fireNeutron(recWorld, x, 0, z, getRandomDirection(),NeutronType.FISSION);
        };
        tb.onNeutron=function(recWorld,x,y,z,type){
            if (type ==NeutronType.FISSION || type==NeutronType.DECAY){
                if (ReikaRandomHelper.doWithChance(1/9)){
                    return true;
                }
                if (ReikaRandomHelper.doWithChance(recWorld.fuelFissionChance)){
                    if (ReikaRandomHelper.doWithChance(recWorld.fuelConsumeChance)){
                        if (recWorld.fuelType==0)recWorld.fuelConsumed++;
                        if (recWorld.fuelType==1)recWorld.plutoniumProduced--;
                    }
                    this.spawnNeutronBurst(recWorld,x,z);
                    this.temperature+=recWorld.fuelStepTemp;
                return true;
                }
            }
            return false;
        };
        tb.update=function(recWorld,x,z){
            this.emulator.onTick(recWorld);
            //console.log("CORE UPDATE CALLED")
            //console.log(recWorld.worldTick);
            if (ReikaRandomHelper.doWithChance(1/20))this.emulator.fireNeutron(recWorld,x,0,z,getRandomDirection(),NeutronType.DECAY);
            if (recWorld.worldTick%20==0){
                //this.temperature=400;

                this.updateTempurature(recWorld,x,z);



                if (this.temperature>=1800){

                    //console.log(x+" "+z+" Overheat!")
                    throw("Fuel Rod @ ("+x+","+z+") Overheated @ Tick "+recWorld.worldTick);
                }
            }
        };
        return tb;
    }
};

//TileBreederCore.java

var TileBreederCore={
    createNew:function(x,z){
        var tb=Basetile.createNew();
        //console.log("Created Breedercore");
        tb.type=TileType.BREEDER;
        tb.entity_x=x;
        tb.entity_z=z;
        tb.emulator=NeutronEmulatorV2.createNew();
        tb.getX=function (){
            return this.entity_x;
        };
        tb.getZ=function(){
            return this.entity_z;
        };
        tb.spawnNeutronBurst=function(recWorld,x,z){
            this.emulator.fireNeutron(recWorld, x, 0, z, getRandomDirection(),NeutronType.BREEDER);
            this.emulator.fireNeutron(recWorld, x, 0, z, getRandomDirection(),NeutronType.BREEDER);
            this.emulator.fireNeutron(recWorld, x, 0, z, getRandomDirection(),NeutronType.BREEDER);
        };
        tb.onNeutron=function(recWorld,x,y,z,type){
            //console.log("B-RECEIVED-"+type);
            if (ReikaRandomHelper.doWithChance(1/9)){
                return true;
            }

            if (ReikaRandomHelper.doWithChance(25)){
                if (type==NeutronType.BREEDER && ReikaRandomHelper.doWithChance(5)){
                    recWorld.fuelConsumed+=5/4;
                    recWorld.plutoniumProduced+=5;
                    this.temperature+=50;
                }else{
                    this.temperature+=this.temperature>=700?30:20;
                }
                this.spawnNeutronBurst(recWorld,x,z);

                return true;
            }
            return false;
        };

        tb.update=function(recWorld,x,z){
            this.emulator.onTick(recWorld);
            //console.log("CORE UPDATE CALLED")
            //console.log(recWorld.worldTick);
            if (ReikaRandomHelper.doWithChance(1/20)){

                this.emulator.fireNeutron(recWorld,x,0,z,getRandomDirection(),NeutronType.DECAY);
            }
            if (recWorld.worldTick%10==0){
                //this.temperature=400;

                this.updateTempurature(recWorld,x,z);

                if (this.temperature>=1800){

                    //console.log(x+" "+z+" Overheat!")
                    throw("Breeder Core @ ("+x+","+z+") Overheated @ Tick "+recWorld.worldTick);
                }
            }
        };
        return tb;
    }
};

//NeutronEmulatorV2.java
var NeutronType={
    DECAY:0,
    FISSION:1,
    BREEDER:2
}
var getTicksByDistance=function(dist){
    return  Math.floor((dist / 0.75) - 1);
};
var NeutronEmulatorV2={
    createNew:function(){
        var ne={};
        ne.MAX_DISTANCE=16;
        var NeutronTracker={
            createNew:function(){
                var nt={};

                nt.initNeutron=function(direction,x,y,z,type){
                    nt.direction=direction;
                    nt.x=x;
                    nt.y=y;
                    nt.z=z;
                    nt.age=0;
                    nt.steps=0;
                    nt.type=type;
                };
                nt.goForward=function(){

                    this.steps++;

                    this.x+=this.direction.offsetX;
                    this.z+=this.direction.offsetZ;
                };
                nt.turnBack=function(){this.direction=this.direction.getOpposite()};
                return nt;
            }
        };
        var NeutronTrackerList={
            Entry:{
                createNew:function(){
                    var e=NeutronTracker.createNew();
                    e.next=null;
                    e.prev=null;
                    return e;
                }
            },
            freelist:null,head:null,
            remove:function(entry){
                //console.log(entry.steps)
                // update "next"
                if (entry.next != null) {
                    entry.next.prev = entry.prev;
                }
                // update "prev"
                if (entry.prev == null) {
                    this.head = entry.next;
                } else {
                    entry.prev.next = entry.next;
                    entry.prev = null;
                }
                // add to freelist
                if (this.freelist != null) {
                    this.freelist.prev = entry;
                    entry.next = this.freelist;
                    this.freelist = entry;
                } else {
                    this.freelist = entry;
                    entry.next = null;
                }
            },
            spawnNeutron:function(){
                var entry=null;
                if(this.freelist==null){
                    //console.log("new")
                    entry=NeutronTrackerList.Entry.createNew();
                }else{
                    //console.log("restoring object")
                    entry=this.freelist;
                    if (this.freelist.next!=null)this.freelist.next.prev=null;
                    this.freelist=this.freelist.next;
                }
                entry.next=this.head;
                if (this.head!=null){
                    this.head.prev=entry;
                }
                this.head=entry;

                return entry;
            }

        };
        var testAbsorbed=function(neutron,recWorldObj){

            var block=recWorldObj.getBlock(neutron.x,0,neutron.z);
            if (block==null || block.type==Block.Type.AIR){
                return false;
            }
            if (block.type==Block.Type.REFLECTOR){
                if (ReikaRandomHelper.doWithChance(0.25)){
                    neutron.turnBack();
                    return false;
                }
                if (ReikaRandomHelper.doWithChance(0.5)){
                    return true;
                }
            }
            if (block.type==Block.Type.STEEL && recWorldObj.isCapp){
                return true;
            }
            //console.log("X"+neutron.x+" Z"+neutron.z+" s"+neutron.steps+" t"+recWorldObj.worldTick)
            //console.log(block.type);
            if (block.type==Block.Type.BREEDER || block.type==Block.Type.CORE|| block.type==Block.Type.BOILER|| block.type==Block.Type.SODIUM_HEATER){

                var te=recWorldObj.getTileEntity(neutron.x,neutron.y,neutron.z);


                    return te.onNeutron(recWorldObj, neutron.x, neutron.y, neutron.z, neutron.type);



            }

            return ReikaRandomHelper.doWithChance(block.getAbsorptionChance());
        };
        ne.onTick=function(recWorldObj){
            var _entry=NeutronTrackerList.head;
            while (_entry!=null){
                var neutron=_entry;
                _entry=_entry.next;
                if (neutron.steps>= this.MAX_DISTANCE){
                    NeutronTrackerList.remove(neutron);
                    recWorldObj.neutronEscaped++;
                    continue;
                }

                if (getTicksByDistance(neutron.steps) <= neutron.age++){
                    var oldDirection = neutron.direction;
                    if (testAbsorbed(neutron,recWorldObj)){
                        //console.log("test true & called remove")
                        NeutronTrackerList.remove(neutron);
                    }else{
                        neutron.goForward();
                        if (oldDirection!=neutron.direction){
                            //console.log("1")
                            neutron.age++;
                            if (testAbsorbed(neutron,recWorldObj)){
                                NeutronTrackerList.remove(neutron);
                            }else{
                                neutron.goForward();
                            }
                        }
                    }
                }
            }
        };
        ne.fireNeutron=function(recWorldObj,x,y,z,direction,type){
            //console.log(x,z,direction);
            var neutron=NeutronTrackerList.spawnNeutron();
            neutron.initNeutron(direction,x,y,z,type);
            neutron.goForward();
        };
        return ne;
    }
};


/*
wd=RecWorld.createNew(8);
wd.setBlock(Block.Type.CORE,1,2);
wd.setBlock(Block.Type.CORE,1,3);
wd.setBlock(Block.Type.CORE,1,4);

for (var i=0;i<300000000;i++){
    wd.doTick();
    wd.worldTick++;
    //console.log(wd.printWorld());
}


*/

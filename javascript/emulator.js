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
            var dT=0-this.temperature;
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
                if (block != null && te!=null && te.hasOwnProperty("temperature")) {

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
        };

        return tile;
    }
};
//RecWorld.java
var RecWorld={
    createNew:function(mr){
        var recworld={};
        recworld.worldTick=0;
        recworld.steam=0;
        recworld.isRemote=false;
        recworld.coreCount=0;
        recworld.tiles=[];
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
        recworld.printWorld=function(){
            var s=""
            this.tileArray.forEach(function(te){
                //console.log(recworld.getBlock(te.entity_x,0,te.entity_z).type+" at "+te.entity_x+","+te.entity_z+" is "+te.temperature);
                s+=Block.Name[recworld.getBlock(te.entity_x,0,te.entity_z).type]+" at "+te.entity_x+","+te.entity_z+" is "+Math.round(te.temperature)+"<br>"
            });
            //console.log("The time is "+recworld.worldTick);
            s+="The tick is "+recworld.worldTick +"<br>"
            s+="The day is "+recworld.worldTick/1728000 +"<br>"
            //console.log("Total steam is "+recworld.steam);
            s+="Steam / minute is "+recworld.steam*20*60/recworld.worldTick;
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
                        break;
                    case Block.Type.BOILER:
                        var te=TileBoiler.createNew(x,z);
                        recworld.tiles[x][z]=te;
                        recworld.tileArray.push(te);
                        break;

                        break;//todo FILL THIS
                }
            }
        };

        return recworld;
    }
};
//Block.java
var Block={
    Type:{
        AIR:0, NORMAL:1, WATER:2, STEEL:3, CONCRETE:4, BEDINGOT:5, LEAD:6, OBSIDIAN:7, CORE:8, BOILER:9, REFLECTOR:10
    },
    Name:[null,null,null,null,null,null,null,null,"Fuel Rod","Steam Boiler",null],
    createNew:function(){
        var block={};
        block.hasTileEntity=function(){
            switch (this.type) {
                case Block.Type.CORE:
                case Block.Type.BOILER:
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
                    return 100;
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
}
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

//TileBoiler.java
var TileBoiler={
    createNew:function(x,z){
        var tb=Basetile.createNew();
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
                    //TODO HANDLE OVERHEAT

                }
            }
            if (this.temperature>100) {
                recWorld.steam++;
                this.temperature -= 10;//this is modified by wz
            }

        };

        return tb;
    }
};

//TileFuelCore.java

var TileFuelCore={
    createNew:function(x,z){
        var tb=Basetile.createNew();
        tb.entity_x=x;
        tb.entity_z=z;
        tb.emulator=NeutronEmulatorV2.createNew();
        tb.getX=function (){
            return this.entity_x;
        };
        tb.getZ=function(){
            return this.entity_z;
        };
        tb.spawnNeutronButst=function(recWorld,x,z){

            this.emulator.fireNeutron(recWorld, x, 0, z, getRandomDirection());
            this.emulator.fireNeutron(recWorld, x, 0, z, getRandomDirection());
            this.emulator.fireNeutron(recWorld, x, 0, z, getRandomDirection());
        }
        tb.onNeutron=function(recWorld,x,y,z){

            if (ReikaRandomHelper.doWithChance(1/9)){
                return true;
            }
            if (ReikaRandomHelper.doWithChance(30)){
                this.spawnNeutronButst(recWorld,x,z);
                this.temperature+=30;
                return true;
            }
            return false;
        };
        tb.update=function(recWorld,x,z){
            this.emulator.onTick(recWorld);
            //console.log("CORE UPDATE CALLED")
            //console.log(recWorld.worldTick);
            if (ReikaRandomHelper.doWithChance(1/20))this.emulator.fireNeutron(recWorld,x,0,z,getRandomDirection());
            if (recWorld.worldTick%20==0){
                //this.temperature=400;

                this.updateTempurature(recWorld,x,z);

                if (this.temperature>=2000){
                    //TODO HANDLE OVERHEAT
                    console.log(x+" "+z+" Overheat!")
                    throw(x+" "+z+" Overheat!"+recWorld.worldTick);
                }
            }
        };
        return tb;
    }
};

//NeutronEmulatorV2.java
var getTicksByDistance=function(dist){
    return  Math.floor((dist / 0.75) - 1);
}
var NeutronEmulatorV2={
    createNew:function(){
        var ne={};
        ne.MAX_DISTANCE=16;
        var NeutronTracker={
            createNew:function(){
                var nt={}

                nt.initNeutron=function(direction,x,y,z){
                    nt.direction=direction;
                    nt.x=x;
                    nt.y=y;
                    nt.z=z;
                    nt.age=0;
                    nt.steps=0
                }
                nt.goForward=function(){

                    this.steps++;

                    this.x+=this.direction.offsetX;
                    this.z+=this.direction.offsetZ;
                }
                nt.turnBack=function(){this.direction=this.direction.getOpposite()}
                return nt;
            }
        }
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
                    if (this.freelist.next!=null)this.freelist.next.prev=null
                    this.freelist=this.freelist.next;
                }
                entry.next=this.head;
                if (this.head!=null){
                    this.head.prev=entry;
                }
                this.head=entry;

                return entry;
            }

        }
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
            if (block.type==Block.Type.STEEL){
                return true;
            }
            //console.log("X"+neutron.x+" Z"+neutron.z+" s"+neutron.steps+" t"+recWorldObj.worldTick)
            //console.log(block.type);
            if (block.type==Block.Type.CORE){

                var te=recWorldObj.getTileEntity(neutron.x,neutron.y,neutron.z);


                return te.onNeutron(recWorldObj,neutron.x,neutron.y,neutron.z);

            }
            //ToDo handle normal block
            return false;
        }
        ne.onTick=function(recWorldObj){
            var _entry=NeutronTrackerList.head;
            while (_entry!=null){
                var neutron=_entry;
                _entry=_entry.next;
                if (neutron.steps>= this.MAX_DISTANCE){
                    NeutronTrackerList.remove(neutron);
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
        }
        ne.fireNeutron=function(recWorldObj,x,y,z,direction){
            //console.log(x,z,direction);
            var neutron=NeutronTrackerList.spawnNeutron();
            neutron.initNeutron(direction,x,y,z);
            neutron.goForward();
        }
        return ne;
    }
}


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

/**
 * Created by user on 2016/2/7.
 */
var Basetile={
    createNew:function(){
        var tile={}
        tile.temperature=0;
        tile.setTemperature=function(newTemperature) {
            this.temperature = newTemperature;
        }
        return tile;
    }
}

var RecWorld={
    createNew:function(){
        var recworld={}
        recworld.worldTick=0;
        recworld.steam=0;
        recworld.isRemote=false;
        recworld.coreCount=0;
        recworld.tiles=null;
        recworld.world=null;
        recworld.doTick=function(){
            for(var te in this.tileArray){
                te.update(this, te.getX(), te.getZ());
            }
        }
        recworld.checkCoord=function(x, z) {
            if (x < 0 || z < 0) {
                return false;
            }
            if (x >= 32) {
                return false;
            }
            if (z >= 32) {
                return false;
            }
            return true;
        }
        recworld.getBlock=function(x,y,z){
            if (y != 0) {
                return null;//block.air -> null
            }
            if (!checkCoord(x, z)) {
                return null;//block.air -> null
            }
            var b = this.world[x][z];
            if(b == null)
            {
                return null;//block.air -> null
            }else
            {
                return b;
            }
        }
        recworld.getBlockMetadata=function(x,y,z){return 0}
        recworld.getTileEntity=function(x,y,z) {
            if (y != 0) {
                return null;
            }
            if (!checkCoord(x, z)) {
                return null;
            }
            return this.tiles[x][z];

        }
        return recworld;
    }
}

var Block={
    Type:{
        AIR:0, NORMAL:1, WATER:2, STEEL:3, CONCRETE:4, BEDINGOT:5, LEAD:6, OBSIDIAN:7, CORE:8, BOILER:9, REFLECTOR:10
    },
    createNew:function(){
        var block={};
        block.hasTileEntity=function(meta){
            switch (this.type) {
                case Block.Type.CORE:
                case Block.Type.BOILER:
                case Block.Type.REFLECTOR:
                    return true;
                default:
                    return false;
            }
        }
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
        }
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
        }
        return block;
    }
}
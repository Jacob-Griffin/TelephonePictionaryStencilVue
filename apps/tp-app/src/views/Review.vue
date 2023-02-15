<script>
import "byfo-components/dist/components/tp-content";
import {getGameData} from '../firebase/firestore';
export default {
    data(){
        return {
            stacks:{},
            selected: false,
            currentIndex: 0,
            contentElement: undefined,
            imagesCached:new Set()
        }
    },
    computed:{
        gameid(){
            return this.$route.params.gameid;
        },
        players(){
            let players = Object.keys(this.stacks);
            return players.sort();
        },
        item(){
            return this.stacks[this.selected][this.currentIndex];
        },
        indices(){
            let array = [];
            for(let i = 0; i < Object.keys(this.stacks).length; i++){
                array.push(i);
            }
            return array;
        }
    },
    methods:{
        clickPlayer(username){
            this.selected = username;
            this.currentIndex = 0;
            for(let i = 1; i < Object.keys(this.stacks).length; i+=2){
                //Go through odd rounds and pre-emptively grab the images so that they instant-load on view
                this.cacheImage(username,i);
            }
        },
        increment(){
            if(this.currentIndex >= this.indices.length) return;
            this.currentIndex += 1;
        },
        decrement(){
            if(this.currentIndex <= 0) return;
            this.currentIndex -=1;
        },
        cacheImage(player,idx){
            const imgURL = this.stacks[player][idx].content;
            //If we already cached this image, move on
            if(this.imagesCached.has(imgURL)) return;

            //Otherwise, grab it
            fetch(imgURL); 
            //We don't actually need to do anything with the fetched data, 
            //we're just pre-emptively grabbing it so that the page can use the cached version instantly instead of waiting
            this.imagesCached.add(imgURL);
        }
    },
    async beforeMount(){
        this.stacks = await getGameData(this.gameid);
    }
}
</script>

<template>
    <div class="playerSelector">
        <button @click="()=>clickPlayer(player)" v-for="player in players" :class="player == selected ? 'small selected' : 'small'">{{ player }}</button>
    </div>
    <section v-if="selected">
        <h4><strong>From:</strong> {{ stacks[selected][currentIndex].from }}</h4>
        <div class="main-row">
            <p @click="decrement" class="arrow">{{ currentIndex > 0 ? '<' : '' }}</p>
            <tp-content :content="stacks[selected][currentIndex].content" :type="stacks[selected][currentIndex].contentType"></tp-content>
            <p @click="increment" class="arrow">{{ currentIndex < indices.length-1 ? '>' : '' }}</p>
        </div>
        <div class="carousel-dots">
            <p v-for="index in indices" :class="index == currentIndex ? 'dot dot-selected' : 'dot'" @click="()=>currentIndex = index">•</p>
        </div>
    </section>
</template>

<style>
    .playerSelector{
        width: 100%;
        max-width: 1280px;
        display:flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        margin-bottom:2rem;
        gap:.5rem;
    }

    .main-row{
        width:100%;
        display:flex;
        align-items: center;
        font-size: xx-large;
        gap:.5rem
    }

    .main-row p{
        cursor: pointer;
        color:#ccc;
        flex-grow: 1;
        width:4%;
        user-select: none;
    }

    .main-row tp-content{
        flex-grow:48;
    }

    .dot{
        color:#444
    }

    .dot-selected{
        color:#ccc
    }

    .carousel-dots{
        display:flex;
        flex-direction: row;
        flex-wrap: nowrap;
        width:fit-content;
        gap:.25rem;
        cursor: pointer;
        user-select: none;
        font-size: xx-large;
        font-weight: 700;
    }

    section{
        display: flex;
        flex-direction: column;
        align-items: center;
        width:100%;
        max-width:1280px;
        gap:1rem;
    }

</style>
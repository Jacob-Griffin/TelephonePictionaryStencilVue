<script setup>
//These are auto-imports for the stencil components
import 'byfo-components/tp-input-zone';
import 'byfo-components/tp-player-list';
import '@component/byfo-content';
import '@component/byfo-timer';

import { computed, onMounted, onBeforeUnmount, ref, inject } from 'vue';
import { useRoute } from 'vue-router';

import { config, sortNamesBy, decodePath } from 'byfo-utils/rollup';

const store = inject('TpStore');
const firebase = inject('Firebase');

const name = store.username;
const gameid = useRoute().params.gameid;
const isHosting = store.hosting === gameid;

const inputzone = ref(null);
const landscapeDismissed = ref(store.landscapeDismissed ?? false);
const isSending = ref(false);

const playerlist = ref([]);

const dismissLandscapeMode = () => {
  store.setLandscapeDismissed(true);
  landscapeDismissed.value = true;
}

const roundData = ref({
  roundnumber: 0,
  endTime: -1,
});
const roundnumber = computed(() => roundData.value.roundnumber);
const isText = computed(()=> roundnumber.value % 2 === 0);

const content = ref({
  content: '',
  contentType: 'text',
});

//Toggles whether to show the actual gameplay or not
const finishedRound = ref(-1);
const waiting = computed(() => finishedRound.value >= roundnumber.value);
const stuckSignal = ref(false);
const stuck = computed(() => {
  //Stuck signal is just to get dependencies
  if (stuckSignal.value) {
    stuckSignal.value = false;
  }
  const timeDiff = Date.now() - roundData.value.endTime;
  return roundData.value.endTime !== -1 && timeDiff > 4000;
});
//Which players are done with the current round
const widthVar = ref('');

let redirect = false;
//Check the game status and redirect if necessary
const status = await firebase.getGameStatus(gameid);
if (!status.started && store.hosting !== gameid) {
  location.href = redirect = `/lobby/${gameid}`;
} else if (status.finished) {
  location.href = redirect = `/review/${gameid}`;
} else {
  //Check if the current game was exited improperly
  const rejoinNumber = store.rejoinNumber;
  if (rejoinNumber) {
    const rejoined = await firebase.turnInMissing(gameid, rejoinNumber);
    if (!rejoined) {
      location.href = redirect = '/';
    }
  }
}

const subscriptions = [];

//Grab who you're sending to and recieving from (only need it once)
const people = !redirect && (await firebase.getToAndFrom(gameid, name));
const staticRoundInfo = !redirect && (await firebase.getStaticRoundInfo(gameid));

//Subscribe to changes in roundnumber
if(!redirect){
  const playerNumber = await firebase.getPlayerNumber(gameid, name);
  const missingListener = firebase.attachMissingListener(gameid,playerNumber);

  const handleRoundData = async snapshot => {
    const newRound = snapshot.val();
    if (newRound === null) {
      //If the data no longer exists, go to the review page
      missingListener.cancel(); // This is an expected navigation, don't give "missing"
      location.href = `/review/${gameid}`;
      return;
    }

    //Adjust grab the current round data
    roundData.value = newRound;

    //If this is the first round, there is no "from" data to fetch
    if (newRound.roundnumber === 0) return;

    //Grab the data of your "from" player using pre-updated round#
    content.value = await firebase.fetchCard(gameid, people?.from, roundnumber.value - 1);
  }

  subscriptions.push(firebase.attachRoundListener(gameid, handleRoundData));

  window.addEventListener('visibilitychange',()=>{
    if(document.visibilityState === 'visible' && waiting.value){
      firebase.resyncRoundData(gameid,handleRoundData);
    }
  })

  //Subscribe to see when the game gets finished
  subscriptions.push(firebase.attachFinishedListener(gameid,snapshot => {
    const result = [];
    const pulledData = snapshot.val();
    for (let name in pulledData) {
      const username = decodePath(name);
      result.push({
        username,
        lastRound: pulledData[name],
      });
    }
    playerlist.value = sortNamesBy(result, 'username');
  }));

  //Add event listeners
  onMounted(() => {
    document.addEventListener('tp-submitted', async ({ detail:{content,forced} }) => {
      const submittedRound = roundnumber.value;
      if(finishedRound.value === roundnumber.value || isSending.value){
        // No double submissions
        return;
      }
      try{
        isSending.value = true;
        await firebase.submitRound(gameid, name, roundnumber.value, content, staticRoundInfo,forced);
        finishedRound.value = submittedRound;
        window.scroll({top:0});
      } catch (e) {
      } finally {
        isSending.value = false;
      }
    });

    //All this does is request a new computation for stuck.value, since the template won't poll, and dependencies haven't changed
    document.addEventListener('tp-stuck-signal', e => (stuckSignal.value = true));

    document.addEventListener('keydown', event => {
      if (event.metaKey && event.key === 'z' && !isText.value) {
        //ctrl+z during a drawing round will send an undo input
        const undoEvent = new CustomEvent('undo-input');
        inputzone?.dispatchEvent(undoEvent);
        return;
      }
      if (event.metaKey && event.key === 'Z' && !isText.value) {
        //ctrl+shift+z (aka ctrl+Z) during a drawing round will send a redo input
        const redoEvent = new CustomEvent('redo-input');
        inputzone?.dispatchEvent(redoEvent);
        return;
      }
    });

    finishedRound.value = firebase.fetchFinishedRound(gameid,name);
  });

  //Wrap up firebase subscriptions on unmount
  onBeforeUnmount(() => {
    subscriptions.forEach(unsub => unsub?.());
  });
}
const timeValue = config.addTimeIncrement;
const addTime = e => {
  firebase.sendAddTime(gameid,timeValue*1000);
};

const scrollToCanvas = e => {
  window.scrollTo(0,2000)
}
</script>

<template>
  <section v-if="waiting" class="mb-4">
    <h1 class="needs-backdrop">Waiting for next round</h1>
    <tp-player-list :players="playerlist" :roundData="roundData" :lastRound="staticRoundInfo.lastRound" :addTime="isHosting ? addTime : undefined" :messageStart="stuck ? 'Stuck? [Knowlege base](https://github.com/Jacob-Griffin/TelephonePictionary2.0/wiki/Knowlege-Base)' : ''"></tp-player-list>
  </section>
  <section id="not-waiting" v-else>
    <h2 class="needs-backdrop">Round {{ roundnumber+1 }}/{{ (~~staticRoundInfo.lastRound)+1 }}</h2>
    <p v-if="roundData.roundnumber != 0"><strong>From:</strong> {{ people.from }}</p>
    <section id="gameplay-elements" :class="isText ? 'mb-4' : ''">
      <a id="canvas-link" @click="scrollToCanvas" v-if="!isText">Scroll to Canvas</a>
      <byfo-content v-if="roundnumber != 0" :content="content.content" :type="content.contentType" :sendingTo="isText ? undefined : people.to"></byfo-content>
      <div class='really needs-backdrop' v-if="roundData.endTime !== -1 && isText">
        <byfo-timer class='timer' :endtime="roundData.endTime"></byfo-timer>
      </div>
      <tp-input-zone :round="roundnumber" ref="inputzone" :characterLimit="config.textboxMaxCharacters" :sendingTo="people.to" :isSending="isSending">
        <div slot="timer" class='really needs-backdrop' v-if="roundData.endTime !== -1 && !isText">
          <byfo-timer class="timer" :endtime="roundData.endTime"></byfo-timer>
        </div>
      </tp-input-zone>
    </section>
    <section id="landscape-enforcer" v-if="!isText && !waiting && !landscapeDismissed">
      <h2>We recommend rotating your device to landscape mode for a better drawing experience</h2>
      <a @click="dismissLandscapeMode">No thanks</a>
    </section>
  </section>
</template>

<style scoped>
.mb-4 {
  margin-bottom: 1rem;
}

.float-bottom-right {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
}

section {
  width: 100%;
  padding-inline: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

#gameplay-elements byfo-content{
  max-width: 1100px;
}

#player-to {
  display: none;
}


* {
  user-select: none;
}

#canvas-link {
  position: absolute;
  right: 2rem;
  top: -2.5rem;
  font-size: 1rem;
  color: var(--color-button-text);
  background-color: var(--color-button);
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
}

#landscape-enforcer {
  display: none;
}

.timer {
  width: fit-content;
  align-self: center;
}

tp-input-zone {
  max-width: 100rem;
}

@media screen and (((max-width: 500px) and (max-aspect-ratio:0.9))) {
  #landscape-enforcer {
    position: fixed;
    top:0;
    left:0;
    right:0;
    bottom:0;
    background-color: #000C;
    color:white;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #not-waiting {
    padding-inline: 0;
    --tp-canvas-width-override: 95vw;
    --tp-controls-gap: 0.25rem;
  }
}

@media screen and ((max-aspect-ratio:1.6) and (max-width:1200px)) {
  tp-input-zone {
    --flip-pos:column;
    --horizontal: center;
    --flip-height: 10rem;
    --full-width: 100%;
  }
}

@media screen and (min-height: 600px) {
  #canvas-link {
    display: none;
  }
}
</style>

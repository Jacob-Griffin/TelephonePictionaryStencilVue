<script setup>
//These are auto-imports for the stencil/native components
import 'byfo-native-components/byfo-timer';
import 'byfo-native-components/byfo-content';
import 'byfo-components/dist/components/tp-input-zone';

import { computed, onMounted, onBeforeUnmount, ref, inject } from 'vue';
import { useRoute } from 'vue-router';

import { getGameStatus, submitRound, fetchCard, getToAndFrom, getStaticRoundInfo, turnInMissing, getPlayerNumber, sendAddTime } from '../firebase/rtdb';
import { onValue, onDisconnect, ref as dbRef } from 'firebase/database';
import { rtdb } from '../../Firebase';

import { sortNames, calculatePlayerNameWidth } from '../utils/strings';
import globalLimits from '../utils/globalLimits';

const store = inject('TpStore');

const name = store.username;
const gameid = useRoute().params.gameid;
const isHosting = store.hosting === gameid;

const inputzone = ref(null);

const roundData = ref({
  roundnumber: 0,
  endTime: -1,
});
const roundnumber = computed(() => roundData.value.roundnumber);

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
const finishedPlayers = ref([]);
const widthVar = ref('');

let redirect = false;
//Check the game status and redirect if necessary
const status = await getGameStatus(gameid);
if (!status.started && store.hosting !== gameid) {
  location.href = redirect = `/lobby/${gameid}`;
} else if (status.finished) {
  location.href = redirect = `/review/${gameid}`;
} else {
  //Check if the current game was exited improperly
  const rejoinNumber = store.rejoinNumber;
  if (rejoinNumber) {
    const rejoined = await turnInMissing(gameid, rejoinNumber);
    if (!rejoined) {
      location.href = redirect = '/';
    }
  }
}

const playerNumber = !redirect && (await getPlayerNumber(gameid, name));

const statusref = playerNumber && dbRef(rtdb, `players/${gameid}/${playerNumber}/status`);
if (statusref) onDisconnect(statusref).set('missing');

//Grab who you're sending to and recieving from (only need it once)
const people = !redirect && (await getToAndFrom(gameid, name));
const staticRoundInfo = !redirect && (await getStaticRoundInfo(gameid));

//Subscribe to changes in roundnumber
const roundRef = !redirect && dbRef(rtdb, `game/${gameid}/round`);
const roundSubscription =
  roundRef &&
  onValue(roundRef, async snapshot => {
    const newRound = snapshot.val();
    if (newRound === null) {
      //If the data no longer exists, go to the review page
      onDisconnect(statusref).cancel(); // This is an expected navigation, don't give "missing"
      location.href = `/review/${gameid}`;
      return;
    }

    //Adjust grab the current round data
    roundData.value = newRound;

    //If this is the first round, there is no "from" data to fetch
    if (newRound.roundnumber === 0) return;

    //Grab the data of your "from" player using pre-updated round#
    content.value = await fetchCard(gameid, people?.from, roundnumber.value - 1);
  });

//Subscribe to see when the game gets finished
const finishedRef = !redirect && dbRef(rtdb, `game/${gameid}/finished`);
const finishedSubscription =
  finishedRef &&
  onValue(finishedRef, snapshot => {
    const result = [];
    const pulledData = snapshot.val();
    for (let name in pulledData) {
      result.push({
        name,
        lastRound: pulledData[name],
      });
    }
    finishedPlayers.value = sortNames(result, 'name');
    widthVar.value = calculatePlayerNameWidth(finishedPlayers.value);
  });

const timeValue = 30; //Seconds to be added on "add time"
const addTime = e => {
  sendAddTime(gameid, timeValue * 1000);
};

const scrollToCanvas = e => {
  window.scrollTo(0,2000)
}

//Add event listeners
onMounted(() => {
  document.addEventListener('tp-submitted', ({ detail }) => {
    const contentObject = {
      content: detail,
      contentType: roundnumber.value % 2 == 0 ? 'text' : 'image',
    };
    submitRound(gameid, name, roundnumber.value, contentObject, staticRoundInfo);
    finishedRound.value = roundnumber.value;
  });

  document.addEventListener('byfo-time-input', ({ detail }) => {
    timeError.value = detail.timeError;
    timeValue.value = detail.value;
  });

  //All this does is request a new computation for stuck.value, since the template won't poll, and dependencies haven't changed
  document.addEventListener('tp-stuck-signal', e => (stuckSignal.value = true));

  document.addEventListener('keydown', event => {
    const isOddRound = !!(roundnumber.value % 2);
    if (event.metaKey && event.key === 'z' && isOddRound) {
      //ctrl+z during a drawing round will send an undo input
      const undoEvent = new CustomEvent('undo-input');
      inputzone?.dispatchEvent(undoEvent);
      return;
    }
    if (isOddRound && event.metaKey && event.key === 'Z') {
      //ctrl+shift+z (aka ctrl+Z) during a drawing round will send a redo input
      const redoEvent = new CustomEvent('redo-input');
      inputzone?.dispatchEvent(redoEvent);
      return;
    }
  });
});

//Wrap up firebase subscriptions on unmount
onBeforeUnmount(() => {
  const unsub = unsubFunction => unsubFunction?.();

  unsub(roundSubscription);
  unsub(finishedSubscription);
});
</script>

<template>
  <section v-if="waiting">
    <h1 class="needs-backdrop">Waiting for next round</h1>
    <section class="playerlist">
      Round {{ roundnumber }}
      <byfo-timer v-if="roundData.endTime !== -1 && !stuck" :endtime="roundData.endTime"></byfo-timer>
      <p v-if="stuck">Stuck? <a href="https://github.com/Jacob-Griffin/TelephonePictionary2.0/wiki/Knowlege-Base">Knowlege base</a></p>
      <div v-for="player in finishedPlayers">
        <span :class="player.lastRound < roundData.roundnumber ? 'pending' : 'ready'">{{ player.lastRound < roundData.roundnumber ? '•' : '✓' }}</span>
        <p>{{ player.name }}</p>
      </div>
      <button @click="addTime" class="small" v-if="isHosting && roundData.endTime > 0">Add {{ timeValue }}s</button>
    </section>
  </section>
  <section id="not-waiting" v-else>
    <h2 class="needs-backdrop">Round {{ roundnumber }}</h2>
    <p v-if="roundData.roundnumber != 0"><strong>From:</strong> {{ people.from }}</p>
    <section id="gameplay-elements">
      <a id="canvas-link" @click="scrollToCanvas">Scroll to Canvas</a>
      <byfo-content v-if="roundnumber != 0" :content="content.content" :type="content.contentType"></byfo-content>
      <byfo-timer v-if="roundData.endTime !== -1" :endtime="roundData.endTime"></byfo-timer>
      <tp-input-zone :round="roundnumber" ref="inputzone" :characterLimit="globalLimits.textboxMaxCharacters" :sendingTo="people.to"/>
    </section>
    <section id="landscape-enforcer" v-if="roundnumber % 2 === 1 && !waiting">
      <h2>Please rotate your device landscape</h2>
    </section>
  </section>
</template>

<style scoped>
section {
  width: 100%;
  padding-inline: 2rem;
  box-sizing: border-box;
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

.playerlist > div {
  max-width: 600px;
}

.playerlist > div > p {
  width: v-bind('widthVar');
  text-align: left;
}
.playerlist > div > span {
  flex: 1;
  text-align: right;
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
@media screen and ((max-width: 600px) and (max-aspect-ratio:1)) {
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
}
@media screen and (min-height: 600px) {
  #canvas-link {
    display: none;
  }
}
</style>

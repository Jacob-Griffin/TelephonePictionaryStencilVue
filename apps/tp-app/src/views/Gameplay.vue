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

import { sortNames } from '../utils/strings';
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
const stuck = ref(false);
const stuckTimeout = ref('');
//Which players are done with the current round
const finishedPlayers = ref([]);

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
    clearTimeout(stuckTimeout.value);
    stuckTimeout.value = '';
    stuck.value = false;
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
  });

//Time input handler for host (maybe this should be webcomponent?)
const timeError = ref('');
const msToAdd = ref(-1);
const handleTimeadd = e => {
  const input = e.target.value;
  if (input.length === 0) {
    timeError.value = '';
    return -1;
  }
  const matches = input.match(/^([0-9]+)(:[0-5][0-9])?$/);
  if (matches === null) {
    timeError.value = 'Improper format. Must be ss or mm:ss';
    msToAdd.value = -1;
    return;
  }
  let seconds = parseInt(matches[1]);
  if (matches[2]) {
    const secondString = matches[2].replace(/:/, '');
    let minutes = seconds;
    seconds = parseInt(secondString) + minutes * 60;
  }
  if (seconds > globalLimits.maxRoundLength * 60) {
    timeError.value = `Cannot add more than ${globalLimits.maxRoundLength} minutes or ${globalLimits.maxRoundLength * 60} seconds`;
    msToAdd.value = -1;
    return;
  } else if (seconds < 5) {
    timeError.value = 'Must add at least 5 seconds';
    msToAdd.value = -1;
    return;
  } else {
    timeError.value = '';
  }
  msToAdd.value = seconds * 1000; //Unix timestamps, like we use are in ms
};

const addTime = e => {
  if (!isHosting || msToAdd.value < 1000) return;
  sendAddTime(gameid, msToAdd.value);
};

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

  document.addEventListener(
    'tp-timer-finished',
    () =>
      (stuckTimeout.value = setTimeout(() => {
        stuck.value = waiting.value && roundData.value.endTime > 0;
        console.log(roundData.value);
      }, 5000)),
  );

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
        <p>{{ player.name }}</p>
        <span :class="player.lastRound < roundData.roundnumber ? 'pending' : 'ready'">{{ player.lastRound < roundData.roundnumber ? '•' : '✓' }}</span>
      </div>
      <div class="time-adder" v-if="isHosting && roundData.endTime > 0">
        <input @input="handleTimeadd" type="text" placeholder="mm:ss" /> <button @click="addTime" class="small" :disabled="msToAdd < 1000">Add Time</button>
      </div>
      <p v-if="timeError">{{ timeError }}</p>
    </section>
  </section>
  <section id="not-waiting" v-else>
    <h2 class="needs-backdrop">Round {{ roundnumber }}</h2>
    <section id="gameplay-elements">
      <byfo-content v-if="roundnumber != 0" :content="content.content" :type="content.contentType"></byfo-content>
      <byfo-timer v-if="roundData.endTime !== -1" :endtime="roundData.endTime"></byfo-timer>
      <tp-input-zone :round="roundnumber" ref="inputzone" :characterLimit="globalLimits.textboxMaxCharacters" :sendingTo="people.to" />
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

#gameplay-elements {
  max-width: 1100px;
}

#player-to {
  display: none;
}

.playerlist > div {
  max-width: 600px;
}
.playerlist > div > p {
  flex: 1;
  text-align: left;
}
.playerlist > div > span {
  flex: 1;
  text-align: right;
}

.time-adder {
  margin-top: 1rem;
  width: fit-content;
  display: flex;
  align-items: center;
}

.time-adder input {
  max-width: 10ch;
}

tp-input-zone {
  touch-action: none;
}

* {
  user-select: none;
}
</style>

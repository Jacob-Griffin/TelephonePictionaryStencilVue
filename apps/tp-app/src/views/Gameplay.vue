<script>
//These are auto-imports for the stencil components
import "byfo-components/dist/components/tp-content";
import "byfo-components/dist/components/tp-timer";
import "byfo-components/dist/components/tp-input-zone";
import {
  getGameStatus,
  submitRound,
  fetchCard,
  getToAndFrom,
  getStaticRoundInfo,
  turnInMissing,
  getPlayerNumber
} from "../firebase/rtdb";
import globalLimits from "../globalLimits";
import { onValue, onDisconnect, ref } from "firebase/database";
import { rtdb } from "../../Firebase";
import { sortNames } from "../utils/strings";

export default {
  data() {
    return {
      roundData: {
        roundnumber: 0,
        endTime: Date.now() + 180000,
      },
      content: {
        content: "",
        contentType: "text",
      },
      people: {
        from: "",
        to: "",
      },
      staticRoundInfo: {
        lastRound: 1000,
        roundLength: 180000,
      },
      waiting: false,
      name: window.localStorage.getItem("username"),
      globalListeners: {
        "tp-submitted": this.onSendHandler,
        keydown: this.keyHandler,
      },
      globalLimits,
      finished: [],
      unsubscribes: [],
    };
  },
  methods: {
    onSendHandler({ detail }) {
      const contentObject = {
        content: detail,
        contentType: this.roundData.roundnumber % 2 == 0 ? "text" : "image",
      };
      submitRound(
        this.gameid,
        this.name,
        this.roundData.roundnumber,
        contentObject,
        this.staticRoundInfo
      );
      this.waiting = true;
      //Stopping the waiting will come from a round listener
    },
    keyHandler(event) {
      const isOddRound = !!(this.roundData.roundnumber % 2);
      if (event.metaKey && event.key === "z" && isOddRound) {
        //ctrl+z during a drawing round will send an undo input
        const undoEvent = new CustomEvent("undo-input");
        this.$refs.inputzone.dispatchEvent(undoEvent);
        return;
      }
      if (isOddRound && event.metaKey && event.key === "Z") {
        //ctrl+shift+z (aka ctrl+Z) during a drawing round will send a redo input
        const redoEvent = new CustomEvent("redo-input");
        this.$refs.inputzone.dispatchEvent(redoEvent);
        return;
      }
    },
  },
  computed: {
    gameid() {
      return this.$route.params.gameid;
    },
  },
  async beforeMount() {
    const status = await getGameStatus(this.$route.params.gameid);
    if (!status.started) {
      window.open(`/lobby/${this.$route.params.gameid}`, "_self");
      return;
    }
    if (status.finished) {
      window.open(`/review/${this.$route.params.gameid}`, "_self");
      return;
    }

    let playerNumber = localStorage.getItem('rejoinNumber');
    if(playerNumber){
      const rejoined = turnInMissing(this.$route.params.gameid,playerNumber);
      if(!rejoined){
        window.open(`/`, "_self");
      }
    }

    playerNumber ||= await getPlayerNumber(gameid,username);

    const statusref = playerNumber && ref(rtdb, `players/${this.gameid}/${playerNumber}/status`);
    onDisconnect(statusref).set('missing');

    //Grab who you're sending to and recieving from (only need it once)
    this.people = await getToAndFrom(this.gameid, this.name);
    this.staticRoundInfo = await getStaticRoundInfo(this.gameid);

    //Subscribe to changes in roundnumber
    const roundRef = ref(rtdb, `game/${this.gameid}/round`);
    const roundSubscription = onValue(roundRef, async (snapshot) => {
      const newRound = snapshot.val();
      if (newRound === null) {
        //If the data no longer exists, go to the review page
        onDisconnect(statusref).cancel() // This is an expected navigation, don't give "missing"
        localStorage.setItem('rejoinNumber',undefined); //The user has nothing to rejoin
        window.open(`/review/${this.$route.params.gameid}`, "_self");
        return;
      }
      if (newRound.roundnumber === 0) {
        this.roundData = newRound;
        return;
      }

      //Adjust changes to the round
      this.roundData = newRound;

      //Grab the data of your "from" player using pre-updated round#
      this.content = await fetchCard(
        this.gameid,
        this.people.from,
        this.roundData.roundnumber - 1
      );
      this.waiting = false;
    });

    const finishedRef = ref(rtdb, `game/${this.gameid}/finished`);
    const finishedSubscription = onValue(finishedRef, (snapshot) => {
      let result = [];
      let pulledData = snapshot.val();
      for (let name in pulledData) {
        result.push({
          name,
          lastRound: pulledData[name],
        });
      }
      this.finished = sortNames(result,'name');
    });

    this.unsubscribes.push(roundSubscription);
    this.unsubscribes.push(finishedSubscription);
  },
  mounted() {
    //Add global (document) event listeners here
    for (let event in this.globalListeners) {
      document.addEventListener(event, this.globalListeners[event]);
    }
  },
  beforeUnmount() {
    //iterate through the saved event globalListeners and detach them
    for (let event in this.globalListeners) {
      document.removeEventListener(event, this.globalListeners[event]);
    }
    this.unsubscribes.forEach((unsub) => unsub());
  },
};
</script>

<template>
  <section v-if="waiting">
    <h1 class="needs-backdrop">Waiting for next round</h1>
    <section class="playerlist">
        Round {{ roundData.roundnumber }}
        <tp-timer
          v-if="roundData.endTime !== -1"
          :endtime="roundData.endTime"
        ></tp-timer>
      <div v-for="player in finished">
        <p>{{ player.name }}</p>
        <span
          :class="
            player.lastRound < roundData.roundnumber ? 'pending' : 'ready'
          "
          >{{ player.lastRound < roundData.roundnumber ? "•" : "✓" }}</span
        >
      </div>
    </section>
  </section>
  <section id="not-waiting" v-else>
    <h2 class="needs-backdrop">Round {{ roundData.roundnumber }}</h2>
    <section id="gameplay-elements">
      <tp-content
        v-if="roundData.roundnumber != 0"
        :content="content.content"
        :type="content.contentType"
      />
      <tp-timer
        v-if="roundData.endTime !== -1"
        :endtime="roundData.endTime"
      ></tp-timer>
      <tp-input-zone :round="roundData.roundnumber" ref="inputzone" :characterLimit="globalLimits.textboxMaxCharacters" :sendingTo="people.to"/>
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

#gameplay-elements{
  max-width: 1100px;
}

#player-to {
  display: none;
}

.playerlist > div {
  max-width: 600px;
}
.playerlist > div > p{
  flex: 1;
  text-align: left;
}
.playerlist > div > span{
  flex: 1;
  text-align: right;
}

tp-input-zone {
  touch-action: none;
}

* {
  user-select: none;
}
</style>

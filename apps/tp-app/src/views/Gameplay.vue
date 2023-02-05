<script>
//These are auto-imports for the stencil components
import { TpContent } from "byfo-components/dist/components/tp-content";
import { TpTimer } from "byfo-components/dist/components/tp-timer";
import { TpInputZone } from "byfo-components/dist/components/tp-input-zone";

export default {
  data() {
    return {
      roundData: {
        round: 1,
        from: "me",
        to: "you",
        content: "You got this prompt",
        contentType: "text",
        endTime: Date.now() + 180000,
      },
      waiting: false,
      globalListeners: {
        "tp-submitted": this.onSendHandler,
        "round-progressed": this.getNextRound,
      },
    };
  },
  methods: {
    onSendHandler({ detail }) {
      //TEMPORARY: send back own data to self to test round-progression data updates
      const loopBackEvent = new CustomEvent("round-progressed", { detail });
      setTimeout(() => {
        document.dispatchEvent(loopBackEvent);
      }, Math.floor(Math.random() * 5000));
      this.waiting = true;
    },
    getNextRound({ detail }) {
      //
      this.roundData = {
        round: this.roundData.round + 1,
        from: "me",
        to: "you",
        content: detail,
        contentType: this.roundData.round % 2 === 0 ? "text" : "image",
        endTime: Date.now() + 180000,
      };
      this.waiting = false;
    },
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
  },
};
</script>

<template>
  <h1 v-if="waiting">Waiting for next round</h1>
  <section v-else>
    <p v-if="roundData.round != 0">
      <strong>From:</strong> {{ roundData.from }}
    </p>
    <tp-content
      v-if="roundData.round != 0"
      :content="roundData.content"
      :type="roundData.contentType"
    />
    <tp-timer :endtime="roundData.endTime"></tp-timer>
    <tp-input-zone :round="roundData.round" />
  </section>
</template>

<style>
section {
  max-width: 1280px;
  padding: 2rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
</style>

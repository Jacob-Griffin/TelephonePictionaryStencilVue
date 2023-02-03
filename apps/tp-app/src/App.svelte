<script lang="typescript">
  //These are auto-imports for the stencil 
  import { TpContent } from "byfo-components/dist/components/tp-content";
  import { TpTimer } from "byfo-components/dist/components/tp-timer";
  import { TpInputZone } from "byfo-components/dist/components/tp-input-zone";

  let roundData = {
    round: 1,
    from: "me",
    to: "you",
    content: "You got this prompt",
    contentType: "text",
    endTime: Date.now()+180000
  }

  let waiting = false;

  const newRoundHandler = (event) =>{
    roundData = event.detail;
    waiting = false;
  }
  document.addEventListener('newRound',newRoundHandler);

  const submittedHandler = (event) =>{
    waiting = true;
  }
  document.addEventListener('tpSubmitted',submittedHandler);
</script>

{#if !waiting}
  <main>
    {#if roundData.round != 0}
      <p><strong>From:</strong> {roundData.from}</p>
      <tp-content content={roundData.content} type={roundData.contentType}/>
    {/if}
    <tp-timer endtime={roundData.endTime}></tp-timer>
    <tp-input-zone round={roundData.round} />
  </main>
{/if}
{#if waiting}
  <main>
    <h3>Waiting for other players</h3>
  </main>
{/if}

<style>
  main{
    display:flex;
    width:100%;
    flex-direction: column;
    justify-content: center;
    padding: 2rem;
    box-sizing: border-box;
  }
</style>

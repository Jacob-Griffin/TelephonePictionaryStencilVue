<script lang="typescript">
  import { defineCustomElements } from "byfo-components/loader";
  defineCustomElements();
  const handler = function (event: CustomEvent<string>) {
    console.log(`'${event.type}'' event recieved with data "${event.detail}"`);
  };
  document.addEventListener("tpSubmitted", handler);
</script>

<main>
  <tp-input-zone round="0" />
</main>

<style>
  main{
    display:flex;
    width:100%;
    flex-direction: column;
    justify-content: center;
  }
</style>

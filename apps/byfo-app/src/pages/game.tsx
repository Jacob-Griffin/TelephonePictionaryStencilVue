import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import {} from "../firebase/rtdb";

import RoundData from "../types/RoundData";
import type { Component } from "solid-js";

const Game: Component = () => {
  const name = document.cookie.search(/(?<=username = \w+)[^;]+/);
  const [round, setRound] = createSignal(0);
  const [waiting, setWaiting] = createSignal(false);
  const [incomingGameData, setIncomingGameData] = createStore(new RoundData());
  const [outgoingData, setOutgoingGameData] = createStore(new RoundData());
  const endtime = Date.now() + 180000;
  const roundChanged = () => {};

  return (
    <section class="bg-gray-100 text-gray-700 p-8">
      {waiting() ? (
        <h1 class="text-2xl font-bold">Home</h1>
      ) : (
        <>
          {round() !== 0 ? (
            <>
              <p>
                <strong>From:</strong> {incomingGameData.from}
              </p>
              <tp-content
                content={incomingGameData.content}
                type={incomingGameData.contentType}
              />
            </>
          ) : null}
          <tp-timer endtime={endtime}/>
          <tp-input-zone round={round()} />
        </>
      )}
    </section>
  );
};

export default Game;

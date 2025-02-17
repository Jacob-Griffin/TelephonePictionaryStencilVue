<script setup>
import { inject, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { liteClient } from 'algoliasearch/lite';
import { searchAPIKey, searchAppId } from '../../algolia.secrets';

const searchClient = liteClient(searchAppId, searchAPIKey);

const store = inject('TpStore');
const searchAs = ref(store.searchAs);

const searchBar = ref(null);
const results = ref(null);

const route = useRoute();
const initialQuery = route.query?.q;
const text = ref(initialQuery);

const search = async () => {
  if (!text.value) {
    return;
  }

  const {
    results: [{ hits }],
  } = await searchClient.searchForHits({ requests: [{ indexName: 'blow_your_face_off_index', query: text.value }] });
  console.log(hits);
  results.value = [];
  if (!(hits.length > 0)) {
    return;
  }

  const boilerplate = /lastmodified|objectID|path|_highlightResult|stackNames/;
  results.value = hits.map(hit => {
    const gameId = hit.objectID;
    const highlights = [];
    for (const stackname in hit) {
      if (boilerplate.test(stackname)) {
        continue;
      }
      const newHighlights = [];
      Object.values(hit._highlightResult[stackname]).forEach(round => {
        if (round.matchedWords.length > 0) {
          newHighlights.push(round.value);
        }
      });
      if (newHighlights.length > 0) {
        highlights.push({
          stack: stackname,
          results: newHighlights,
        });
      }
    }
    return { gameId, highlights };
  });
};
const setText = e => {
  text.value = e.target.value;
};
const handleResultClick = (_, result) => {
  let dest = `/review/${result.gameId}`;
  if (result.highlights.length === 1) {
    dest += `?stack=${result.highlights[0].stack}`;
  }
  //We may be able to figure out which stack they were looking for if there were multiple in one game, but we'll not assume for now
  location.href = dest;
};
onMounted(() => {
  document.addEventListener('tp-settings-changed', e => {
    if (e.detail.setting === 'searchAs') {
      searchAs.value = e.detail.value;
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      search();
    }
  });
  if (initialQuery) {
    searchBar.value.value = initialQuery;
    search();
  }
});
</script>
<template>
  <main>
    <input type="text" @input="setText" placeholder="Search" />
    <button @click="search" :disabled="!text">Search</button>
    <section>
      <article v-for="result in results" :key="result.gameId" @click="e => handleResultClick(e, result)">
        <h2>Game {{ result.gameId }}</h2>
        <div v-for="stack in result.highlights" :key="stack.stack">
          <h3>{{ stack.stack }}'s Stack:</h3>
          <ul>
            <li v-for="string in stack.results" :key="string" v-html="string"></li>
          </ul>
        </div>
      </article>
      <article v-if="results?.length === 0">
        <h3>No results</h3>
      </article>
    </section>
  </main>
</template>

<style>
main {
  gap: 1rem;
  max-width: 1200px;
  align-items: center;
}
input[type='text'] {
  text-align: start;
  padding: 1rem;
  max-width: unset;
}
button {
  align-self: center;
}
section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
}
article {
  background-color: var(--color-backdrop);
  color: var(--color-backdrop-text);
  padding: 1.5rem;
  border-radius: 0.75rem;
  cursor: pointer;
}
em {
  background-color: var(--color-important);
  color: white;
}
.legacy-check {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
</style>

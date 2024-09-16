<script setup>
    import { inject, onMounted, ref, computed } from 'vue';
    import { useRoute } from 'vue-router';

    import createSearchClient from 'algoliasearch';
    import { searchAPIKey, searchAppId } from '../../algolia.secrets';

    const searchClient = createSearchClient(searchAppId, searchAPIKey);
    const searchIndex = searchClient.initIndex('blow_your_face_off_index');

    const store = inject('TpStore');
    const searchAs = ref(store.searchAs);

    const searchBar = ref(null);
    const results = ref(null);

    const route = useRoute();
    const initialQuery = route.query?.q;
    console.log(initialQuery);
    const text = ref(initialQuery);

    const search = async () => {
        if(!text.value){
            return;
        }

        const { hits } = await searchIndex.search(text.value);
        results.value = [];
        if(!(hits.length > 0)){
            return;
        }

        const boilerplate = /lastmodified|objectID|path|_highlightResult|stackNames/;
        results.value = hits.map(hit => {
            const gameId = hit.objectID;
            const highlights = [];
            for(const stackname in hit){
                if(boilerplate.test(stackname)){
                    continue;
                }
                const newHighlights = [];
                Object.values(hit._highlightResult[stackname]).forEach(round => {
                    if(round.matchedWords.length > 0){
                        newHighlights.push(round.value);
                    }
                });
                if(newHighlights.length > 0){
                    highlights.push({
                        stack: stackname,
                        results: newHighlights
                    })
                }
            }
            return {gameId,highlights};
        });
    }
    const setText = (e) => {
        text.value = e.target.value;
    }
    const handleResultClick = (e, result) => {
        let dest = `/review/${result.gameId}`
        if(result.highlights.length === 1){
            dest += `?stack=${result.highlights[0].stack}`;
        }
        //We may be able to figure out which stack they were looking for if there were multiple in one game, but we'll not assume for now
        location.href = dest;
    }
    onMounted(()=>{
        document.addEventListener('tp-settings-changed',e=>{
            if(e.detail.setting === 'searchAs'){
                searchAs.value = e.detail.value;
            }
        });
        document.addEventListener('keydown',e => {
            if(e.key === 'Enter'){
                search();
            }
        })
        if(initialQuery){
            searchBar.value.value = initialQuery;
            search();
        }
    });
</script>
<template>
    <main>
        <input type='text' @input="setText" ref="searchBar" placeholder="Search" class="search-bar"/>
        <button @click="search" :disabled="!text">Search</button>
        <section>
            <article v-for="result in results" @click="e=>handleResultClick(e,result)">
                <h2>Game {{ result.gameId }}</h2>
                <div v-for="stack in result.highlights">
                    <h3>{{ stack.stack }}'s Stack:</h3>
                    <ul>
                        <li v-for="string in stack.results" v-html="string"></li>
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
        gap:1rem;
        max-width: 1200px;
        align-items: center;
        overflow-y: hidden;
    }
    input[type="text"].search-bar {
        text-align: start;
        padding: 1rem;
        max-width: unset;
    }
    button {
        flex-shrink: 0;
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
        border-radius: .75rem;
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
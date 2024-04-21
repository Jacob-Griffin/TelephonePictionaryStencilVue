<script setup>
    import { inject, onMounted, ref } from 'vue';
    import { useRoute } from 'vue-router';

    import createSearchClient from 'algoliasearch';
    import { searchAPIKey, searchAppId } from '../../algolia.secrets';

    const searchClient = createSearchClient(searchAppId, searchAPIKey);
    const searchIndex = searchClient.initIndex('blow_your_face_off_index');

    const store = inject('TpStore');
    const searchAs = store.searchAs;

    const searchBar = ref(null);
    const results = ref([]);

    const route = useRoute();
    const initialQuery = route.query?.q;
    

    const search = async () => {
        const text = searchBar.value?.value;
        if(!text){
            return;
        }

        if(!searchAs){
            return;
        }

        const { hits } = await searchIndex.search(text,{filters:`stackNames:"${searchAs}"`});
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
        })
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
        if(initialQuery){
            searchBar.value.value = initialQuery;
            search();
        }
    });
</script>
<template>
    <main>
        <input type='text' ref='searchBar' placeholder="Search"/>
        <button @click="search" :disabled="!searchAs">Search</button>
        <h3 v-if="!searchAs">Search requires a username to try and limit it to games you were a part of. Set your "Search as" username in settings</h3>
        <p v-else>Searching as {{ searchAs }}</p>
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
        </section>
    </main>
</template>

<style>
    main {
        gap:1rem;
        max-width: 1200px;
        align-items: stretch;
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
        border-radius: .75rem;
        cursor: pointer;
    }
    em {
        background-color: var(--color-important);
        color: white;
    }
</style>
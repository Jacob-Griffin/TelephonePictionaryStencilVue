import { setDoc, doc } from 'firebase/firestore';
import { db } from '../../Firebase'; 

export async function storeGame(gameid,stacks){
    const docRef = doc(db,`games/${gameid}`);
    await setDoc(docRef,stacks);
    return true;
}
import { setDoc, getDoc, doc, getDocFromServer } from 'firebase/firestore';
import { db } from '../../Firebase';

export async function storeGame(gameid, stacks) {
  const docRef = doc(db, `games/${gameid}`);
  await setDoc(docRef, stacks);
  return true;
}

export async function getGameData(gameid) {
  const docRef = doc(db, `games/${gameid}`);
  const snapshot = await getDocFromServer(docRef);
  const gameData = snapshot.data();
  return gameData;
}

import { storage } from "../../Firebase";
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

export async function uploadImage(gameid,player,round,imgData){
    const imgref = ref(storage,`/games/${gameid}/${round}/${player}.png`);
    await uploadBytes(imgref,imgData,{contentType:'image/png'})
    return getDownloadURL(imgref);
}
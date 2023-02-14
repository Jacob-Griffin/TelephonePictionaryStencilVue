import { storage } from "../../Firebase";
import { getDownloadURL, ref, updateMetadata, uploadBytes } from 'firebase/storage';

export async function uploadImage(gameid,player,round,imgData){
    const imgref = ref(storage,`/games/${gameid}/${round}/${player}.png`);
    updateMetadata(imgref,{cacheControl:'public,max-age=86400'});
    await uploadBytes(imgref,imgData,{contentType:'image/png'})
    return getDownloadURL(imgref);
}
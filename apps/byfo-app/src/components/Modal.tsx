import { createSignal } from "solid-js"
import { validUsername, validGameId, invalidCharactersList } from '../utils/expressions';

export default function Modal(props){
    const [error,setError] = createSignal('');
    const [username,setUsername] = createSignal('');
    const [gameid,setGameid] = createSignal('');

    const buttonDisabled = () => {
        let error = '';
        console.log(username());

        if(gameid()){
            //If there is a gameid, but invalid, set an error
            if(!validGameId(gameid)){
                error = 'Valid game ids are 1-6 digits'
            }
        }
        else if(props.modalName !== 'host'){
            //If there isn't a gameid and this isn't a host modal, quit now
            setError('');
            return true;
        }

        if(username()){
            //If there is a name but invalid, set an error
            if(!validUsername(username())){
                error = `Names cannot include ${invalidCharactersList(username())}`;
            }
        }
        else{
            //If there isn't a name, quit now
            setError('');
            return true;
        }

        // Set the new error message
        setError(error);
        // if error exists, buttonDisabled is true
        return !!error;
    }

    const closeModal = () =>{
        props.setActiveModal(undefined);
    }


    const inputStyle = "text-black rounded-md h-12 w-full max-w-64";

    return (
        <div class={props.modalName ? `fixed flex top-0 left-0 justify-center items-center w-screen h-screen p-0 m-0 bg-black bg-opacity-40` : ''} hidden={!props.modalName}>
            {props.modalName ? 
                <article class="relative bg-app border border-gray-500 w-full max-w-lg h-fit max-h-lg p-8 rounded-lg flex flex-col items-center justify-between gap-4">
                    <button class="absolute top-0 right-0 h-6 w-6 text-lg m-2 mt-1 align-bottom" onClick={closeModal}>x</button>

                    <h2 class="text-xl font-semibold">{props.header}</h2>
                    {props.needsName ?
                        <>
                            <p>Name:</p>
                            <input type='text' class={inputStyle} onInput={(e)=>setUsername((e.target as HTMLInputElement).value)}></input>
                        </>  
                        :
                        null  
                    }
                    {props.needsId ?
                        <>
                            <p>Game Id:</p>
                            <input type='text' class={inputStyle} onInput={(e)=>setGameid((e.target as HTMLInputElement).value)}></input>
                        </>  
                        :
                        null  
                    }
                    <button class="h-12 w-24 p-2 disabled:bg-gray-400 rounded-md text-white text-lg bg-brand-primary" disabled={props.verifyInputs ? buttonDisabled() : false}>Host</button>
                </article>
            :
                null
            }
        </div>
    )
} 
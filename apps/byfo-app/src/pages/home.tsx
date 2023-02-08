import { createSignal } from "solid-js";
import Logo from "../components/Logo";
import Modal from "../components/Modal";

export default function Home() {
  const modals = {
    join: {
      modalName:'join',
      header:"Join a game",
      needsName:true,
      needsId:true,
      needsVerification:true
    },
    host: {
      modalName: 'host',
      header: "Host a game",
      needsName:true,
      needsId:false,
      needsVerification:true
    },
    view: {
      modalName:'view',
      header:"Review an old game",
      needsName:false,
      needsId:true,
      needsVerification:false
    }
  };

  const [activeModal,setActiveModal] = createSignal(undefined);

  const openModal = (event) => {
    const modalName = event.target.id;
    setActiveModal(modals[modalName])
    return true;
  };

  return (
    <section class="bg-app text-gray-700 p-8 h-full flex flex-col justify-center items-center gap-8">
      <Logo large></Logo>
      <div class="flex flex-col gap-4 w-full max-w-xl items-center justify-around">
        {Object.keys(modals).map((modalName) => (
          <button
            class="h-20 w-full text-xl text-center bg-brand-primary hover:bg-brand-select rounded-lg text-white"
            onClick={openModal} id={modalName}
          >
            {modals[modalName].header}
          </button>
        ))}
      </div>
      <Modal {...activeModal()} setActiveModal={setActiveModal}/>
    </section>
  );
}

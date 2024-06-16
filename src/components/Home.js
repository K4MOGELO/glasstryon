import VirtualTryOn from "./VirtualTryOn";
import glasses01 from "./glasses/glasses01.png"
import glasses02 from "./glasses/glasses02.png"
import glasses03 from "./glasses/glasses03.png"
import glasses04 from "./glasses/glasses04.png"
import glasses05 from "./glasses/glasses05.png"
import { useState } from "react";


const glasses = [
  {
    glassesSrc: glasses01,
    GlassName: "glasses 01",
    ImagePath: "./glasses/glasses01.png",
  },
  {
    glassesSrc: glasses02,
    GlassName: "glasses 02",
    ImagePath: "./glasses/glasses02.png",
  },

  {
    glassesSrc: glasses03,
    GlassName: "glasses 03",
    ImagePath: "./glasses/glasses03.png",
  },
  {
    glassesSrc: glasses04,
    GlassName: "glasses 04",
    ImagePath: "./glasses/glasses04.png",
  },
  {
    glassesSrc: glasses05,
    GlassName: "glasses 05",
    ImagePath: "./glasses/glasses05.png",
  },



]



export default function Home() {
  const [model, setModel] = useState(glasses[0]);
  const [showGlasses, setShowGlasses] = useState(false);

  console.log(glasses);

  const openModal = (glass) => {
    setModel(glass);
    setShowGlasses(true);
  };

  const closeModal = () => {
    setShowGlasses(false);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-3 gap-4">
        {glasses.map((glass, index) => (
          <div key={index} className="text-center">
            <button onClick={() => openModal(glass)} className="focus:outline-none">
              <img src={glass.ImagePath} alt={glass.GlassName} className="object-cover mx-auto mb-2" />
              <h2 className="text-lg font-semibold">{glass.GlassName}</h2>
            </button>
          </div>
        ))}
      </div>

      {showGlasses && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-green-500 p-8 rounded shadow-lg relative  ">
            <button className="z-50 absolute top-0 right-0 m-4 text-xl font-bold" onClick={closeModal}>
              &times; Back
            </button>
            <VirtualTryOn GlassesModel={model} />
          </div>
        </div>
      )}
    </div>
  );
}

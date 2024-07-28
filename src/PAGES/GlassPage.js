
// TryOnButton.js
import React, { useState } from 'react';

import glasses01 from './glasses/glasses01.png';
import glasses02 from './glasses/glasses02.png';
import glasses03 from './glasses/glasses03.png';
import glasses04 from './glasses/glasses04.png';
import glasses05 from './glasses/glasses05.png';

const glassesList = [
  { glassesSrc: glasses01, GlassName: 'glasses01' },
  { glassesSrc: glasses02, GlassName: 'glasses02' },
  { glassesSrc: glasses03, GlassName: 'glasses03' },
  { glassesSrc: glasses04, GlassName: 'glasses04' },
  { glassesSrc: glasses05, GlassName: 'glasses05' },
];

const TryOnButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGlasses, setSelectedGlasses] = useState('');

  const openModal = (glassesId) => {
    setSelectedGlasses(glassesId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      {glassesList.map(glass => (
        <button
          key={glass.GlassName}
          onClick={() => openModal(glass.GlassName)}
          className="px-6 py-3 text-white bg-blue-500 rounded-lg shadow-lg hover:bg-blue-600 transition my-2"
        >
          Try On {glass.GlassName}
        </button>
      ))}
      <Modal isOpen={isModalOpen} onClose={closeModal} glassesId={selectedGlasses} />
    </div>
  );
};

export default TryOnButton;



const Modal = ({ isOpen, onClose, glassesId }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex justify-center items-center">
      <div className="relative w-full h-full max-w-4xl max-h-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-2xl font-bold bg-red-600 hover:bg-red-800 rounded-full p-2"
        >
          &times;
        </button>
        <iframe

          src={`https://glasstryon.vercel.app/glasses/${glassesId}`}
          // src={`http://localhost:3000/glasses/${glassesId}`}
          title="Try On Glasses"
          width="100%"
          height="100%"
          style={{ border: 'none' }}
        />
      </div>
    </div>
  );
};


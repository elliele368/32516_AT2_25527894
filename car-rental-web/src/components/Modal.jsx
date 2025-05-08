import React from 'react';
import closeIcon from '../assets/close.svg';

const Modal = ({ title, status, image, message, description, buttons, onClose }) => {
  return (
    <div className="w-[591px] bg-white rounded-lg shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-slate-200 inline-flex flex-col justify-start items-start">
      <div className="self-stretch px-5 py-3 border-b border-slate-200 inline-flex justify-between items-center">
        <div className="flex-1 flex justify-start items-center gap-2">
          <div className="text-zinc-700 text-xl font-bold leading-7">{title}</div>
          {status && (
            <div className="h-9 px-2 py-0.5 bg-slate-200 rounded flex justify-center items-center gap-2.5">
              <div className="text-neutral-500 text-base font-semibold leading-none tracking-tight">{status}</div>
            </div>
          )}
        </div>
        <button className="w-5 h-5 relative" onClick={onClose}>
          <img src={closeIcon} alt="Close" className="w-5 h-5" />
        </button>
      </div>
      <div className="self-stretch px-10 pt-5 pb-8 flex flex-col justify-start items-center gap-6">
        <div className="self-stretch flex flex-col justify-start items-center gap-4">
          <img src={image} alt="modal graphic" className="w-96 h-52 object-contain" />
          <div className="self-stretch flex flex-col justify-start items-center gap-3">
            <div className="text-center text-yellow-600 text-base font-bold leading-snug tracking-tight">{message}</div>
            <div className="w-96 text-center text-zinc-500 text-base font-normal leading-tight tracking-tight">{description}</div>
          </div>
        </div>
        {buttons && (
          <div className="self-stretch inline-flex justify-center items-center gap-3">
            {buttons.map((btn, i) => (
              <div key={i} className="flex-1">{btn}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
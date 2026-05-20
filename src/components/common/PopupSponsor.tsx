'use client';
import { useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

export default function PopupSponsor() {
  const [open, setOpen] = useState(false);
  const imgUrl = 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; // reliable placeholder image

  return (
    <>
      <button
          onClick={() => setOpen(true)}
          className="fixed top-4 right-4 z-50 bg-white text-black font-barlow font-bold uppercase text-sm py-2 px-4 rounded shadow-lg hover:scale-105 transition"
        >
          Show Sponsor
        </button>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm z-[999]">
          <div className="relative bg-deep-black rounded-lg overflow-hidden shadow-xl max-w-md w-full">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={imgUrl} alt="Puma Sponsor" width={600} height={400} className="object-cover" />
          </div>
        </div>
      )}
    </>
  );
}

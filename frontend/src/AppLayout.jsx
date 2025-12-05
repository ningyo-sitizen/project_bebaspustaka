// src/components/AppLayout.jsx

import React, { useState } from 'react';
import { 
  IconMapPin,
  IconPhone,
  IconMail,
  IconBrandInstagram, 
  IconBrandX,         
  IconBrandYoutube,   
} from '@tabler/icons-react';


// Tinggi Footer disimulasikan agar padding bawah main dapat disesuaikan
const FOOTER_HEIGHT_CLASS = 'pb-36'; 

const AppLayout = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const Navbar = null; // Menghapus definisi Navbar


  const Footer = (
    <footer className="w-full mt-auto font-jakarta">
        
        <div className="bg-white border-t border-gray-300">
            <div className={`grid grid-cols-4 w-full px-20 py-8 gap-x-6`}> 
                
                {/* Kolom 1: Info PNJ */}
                <div className="col-span-1"> 
                    <h3 className="text-base font-semibold mb-3 text-[#023048]">
                        BEBAS PUSTAKA PNJ
                    </h3>
                    <p className="text-sm mb-4 leading-relaxed text-[#4A4848]">
                        Platform online untuk pengecekan status dan persetujuan data Bebas Pustaka mahasiswa Politeknik Negeri Jakarta.
                    </p>
                    <div className="flex space-x-3 mt-4">
                        <a href="#" className="w-7 h-7 border border-gray-400 rounded-full flex items-center justify-center transition-colors hover:border-blue-500">
                            <IconBrandInstagram className="w-4 h-4 text-gray-700" stroke={1.5} />
                        </a>
                        <a href="#" className="w-7 h-7 border border-gray-400 rounded-full flex items-center justify-center transition-colors hover:border-blue-500">
                            <IconBrandX className="w-4 h-4 text-gray-700" stroke={1.5} />
                        </a>
                        <a href="#" className="w-7 h-7 border border-gray-400 rounded-full flex items-center justify-center transition-colors hover:border-blue-500">
                            <IconBrandYoutube className="w-4 h-4 text-gray-700" stroke={1.5} />
                        </a>
                    </div>
                </div>
                
                {/* Kolom 2: Alamat */}
                <div className="col-span-1">
                    <h4 className="flex items-center font-normal mb-3 text-sm text-[#4A4848]">
                        <IconMapPin className="w-5 h-5 mr-2 text-[#667790]" stroke={1.5} /> Alamat
                    </h4>
                    <p className="text-sm leading-relaxed text-[#4A4848]">
                        Universitas Indonesia, Gedung Perpustakaan, Politeknik Negeri Jakarta, Kukusan, Kecamatan Beji, Kota Depok, Jawa Barat 16425
                    </p>
                </div>
                
                {/* Kolom 3: Telepon */}
                <div className="col-span-1">
                    <h4 className="flex items-center font-normal mb-3 text-sm text-[#4A4848]">
                        <IconPhone className="w-5 h-5 mr-2 text-[#667790]" stroke={1.5} /> Telepon
                    </h4>
                    <p className="text-sm leading-relaxed text-[#4A4848]">
                        021-7270036 ext.303
                        <br />
                        087886168799
                    </p>
                </div>
                
                {/* Kolom 4: Email */}
                <div className="col-span-1">
                    <h4 className="flex items-center font-normal mb-3 text-sm text-[#4A4848]">
                        <IconMail className="w-5 h-5 mr-2 text-[#667790]" stroke={1.5} /> Email
                    </h4>
                    <p className="text-sm leading-relaxed text-[#4A4848]">
                        perpustakaan@pnj.ac.id
                    </p>
                </div>
            </div>
        </div>

        {/* Bagian Copyright */}
        <div className="bg-[#023048] py-4 text-center w-full">
            <p className="text-xs text-white">
                Copyright Bebas Pustaka PNJ © 2025
            </p>
        </div>
    </footer>
  );

  // --- LAYOUT UTAMA ---
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-jakarta">
      <main className={`flex-1 bg-white ${FOOTER_HEIGHT_CLASS}`}> 
        {/* AREA INI KOSONG */}
      </main>

      {Footer}
    </div>
  );
};

export default AppLayout;
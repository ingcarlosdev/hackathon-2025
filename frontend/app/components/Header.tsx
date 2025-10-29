"use client";

import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full bg-[#aa0f16] py-4  mb-12 px-8 flex items-center shadow-md">
      <Image src="/sioma-logo.png" alt="Sioma Logo" width={171} height={171} />
    </header>
  );
}

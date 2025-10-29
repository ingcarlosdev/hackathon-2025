import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-[#aa0f16] py-4 px-6 flex items-center gap-4 shadow-md">
      <Image src="/sioma-logo.png" alt="Sioma Logo" width={171} height={171} />
      <h1 className="text-white text-3xl font-semibold tracking-wide">PALMAS CHECKER</h1>
    </header>
  );
}


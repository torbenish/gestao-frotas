import Image from "next/image";
import lightLogo from "@/assets/logo-sde-black.png";
import darkLogo from "@/assets/logo-sde-white.png";

export default function Logo() {
  return (
    <>
      <Image
        src={lightLogo}
        alt="Logo SDE"
        className="h-96 w-auto object-contain dark:hidden"
      />
      <Image
        src={darkLogo}
        alt="Logo SDE (branco)"
        className="h-96 w-auto object-contain hidden dark:block"
      />
    </>
  );
}

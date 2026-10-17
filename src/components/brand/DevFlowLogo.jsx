import Image from "next/image";

const sizes = {
  mark: "h-9 w-9",
  sidebar: "h-8 w-[118px]",
  header: "h-8 w-[132px]",
  home: "h-9 w-[158px]",
};

export default function DevFlowLogo({ size = "header" }) {
  const isMark = size === "mark";
  const renderedWidth =
    size === "home" ? 158 : size === "sidebar" ? 100 : 132;

  return (
    <span
      className={`relative block shrink-0 overflow-hidden ${sizes[size] || sizes.header}`}
      aria-hidden="true"
    >
      <Image
        src="/logo.png"
        alt=""
        fill
        // The image is scaled up below, so report its rendered width to Next's
        // optimizer to avoid requesting a too-small source for the logo.
        sizes={`${Math.ceil(renderedWidth * 1.6)}px`}
        quality={100}
        className={`object-cover mix-blend-multiply dark:mix-blend-normal ${
          isMark
            ? "object-[25%_center]"
            : "[transform:scale(1.6)] object-center"
        }`}
      />
    </span>
  );
}

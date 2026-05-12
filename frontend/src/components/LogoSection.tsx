import ImageWithFallback from "./ImageWithFallback";

export function NirmaanLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-10 h-10 rounded-lg overflow-hidden">
        <ImageWithFallback
          src="/nirmaan-logo.png"
          alt="Nirmaan Logo"
          fill
          sizes="40px"
          className="object-contain"
          fallbackText="N"
          fallbackClassName="w-full h-full rounded-lg"
        />
      </div>
      <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">NIRMAAN</span>
    </div>
  );
}

export function GiftLogo() {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-[var(--muted)]">In collaboration with</span>
      <div className="relative w-20 h-10 rounded overflow-hidden">
        <ImageWithFallback
          src="/gift-logo.svg"
          alt="GIFT Logo"
          fill
          className="object-contain"
          fallbackText="GIFT"
          fallbackClassName="w-full h-full rounded text-xs"
        />
      </div>
    </div>
  );
}

export function CombinedLogo() {
  return (
    <div className="flex flex-col gap-2">
      <NirmaanLogo />
      <GiftLogo />
    </div>
  );
}

export function FooterLogo() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="relative w-12 h-12 rounded-lg overflow-hidden">
          <ImageWithFallback
            src="/nirmaan-logo.png"
            alt="Nirmaan Logo"
            fill
            sizes="48px"
            className="object-contain"
            fallbackText="N"
            fallbackClassName="w-full h-full rounded-lg"
          />
        </div>
        <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">NIRMAAN</span>
      </div>
      <GiftLogo />
    </div>
  );
}

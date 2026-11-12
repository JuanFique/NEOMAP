import { useEffect, useState } from 'react';

/** Ilustración arquitectónica de respaldo cuando no hay foto de la entrada. */
function Placeholder() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-100">
      <svg viewBox="0 0 200 110" className="h-24 w-auto" aria-hidden>
        <rect x="0" y="92" width="200" height="18" fill="#E4DDD0" />
        <rect x="24" y="18" width="152" height="74" fill="#F4F7FB" stroke="#A9BCD4" strokeWidth="1.5" />
        <rect x="24" y="18" width="152" height="10" fill="#DCE6F2" stroke="#A9BCD4" strokeWidth="1.5" />
        <rect x="82" y="44" width="36" height="48" fill="#C5D5E8" stroke="#7B93B3" strokeWidth="1.5" />
        <line x1="100" y1="44" x2="100" y2="92" stroke="#7B93B3" strokeWidth="1.5" />
        <circle cx="96" cy="70" r="1.6" fill="#16325C" />
        <circle cx="104" cy="70" r="1.6" fill="#16325C" />
        <rect x="36" y="42" width="30" height="22" fill="#FFFFFF" stroke="#A9BCD4" strokeWidth="1.5" />
        <rect x="134" y="42" width="30" height="22" fill="#FFFFFF" stroke="#A9BCD4" strokeWidth="1.5" />
        <line x1="51" y1="42" x2="51" y2="64" stroke="#A9BCD4" strokeWidth="1" />
        <line x1="149" y1="42" x2="149" y2="64" stroke="#A9BCD4" strokeWidth="1" />
        <rect x="88" y="33" width="24" height="7" rx="2" fill="#16325C" />
        <circle cx="14" cy="80" r="9" fill="#6FA36B" />
        <rect x="13" y="86" width="2" height="8" fill="#7C6A58" />
        <circle cx="187" cy="80" r="9" fill="#6FA36B" />
        <rect x="186" y="86" width="2" height="8" fill="#7C6A58" />
      </svg>
      <p className="text-xs font-medium text-slate-500">Vista de entrada no disponible</p>
    </div>
  );
}

export function EntrancePhoto({ url, alt }: { url: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);
  return (
    <div className="aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
      {url && !failed ? (
        <img src={url} alt={alt} className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <Placeholder />
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

type Property = {
  id: string;
  name: string;
  type: string;
  area: string;
  annualRent: number;
  inspectionFee: number;
  agencyFee: number;
  cautionFee: number;
  legalFee: number;
  total: number;
  available: boolean;
  isCurrentHome: boolean;
};

export default function PropertyPanel({ onUpdate }: { onUpdate: (data: any) => void }) {
  const [listings, setListings] = useState<Property[]>([]);
  const [rentCredit, setRentCredit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/game/property", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        setNotice(data.error ?? "Could not load properties.");
      } else {
        setListings(data.listings ?? []);
        setRentCredit(Number(data.rentCredit ?? 0));
      }
    } catch {
      setNotice("Could not connect to the property market.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function rent(propertyId: string) {
    setLoading(true);
    setNotice("");
    try {
      const response = await fetch("/api/game/property/rent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });
      const data = await response.json();
      if (!response.ok) {
        setNotice(data.error ?? "Could not complete the move.");
      } else {
        setNotice(data.message);
        onUpdate(data);
        await load();
      }
    } catch {
      setNotice("Could not connect to the property market.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-slate-200 bg-white p-7">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Abuja Property Market</p>
        <h1 className="mt-2 text-3xl font-black">Find your place.</h1>
        <p className="mt-2 text-sm text-slate-500">Move-in cost includes annual rent, inspection, agency, caution and legal fees. Inspection and agency fees are non-refundable.</p>
        {rentCredit > 0 && (
          <p className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
            Unused rent credit: ₦{rentCredit.toLocaleString()}. This is applied when moving to another property; fees are not refunded.
          </p>
        )}
        {notice && <div role="status" className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">{notice}</div>}

        {loading && !listings.length ? (
          <p className="mt-6 text-sm text-slate-500">Loading listings...</p>
        ) : (
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {listings.map((property) => {
              const dueAfterCredit = Math.max(0, property.total - rentCredit);
              const disabled = loading || !property.available || property.isCurrentHome;
              return (
                <div key={property.id} className="rounded-2xl border border-slate-200 p-5">
                  <p className="font-black">{property.name}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{property.area} · {property.type}</p>
                  <p className="mt-4 text-xl font-black">₦{property.annualRent.toLocaleString()} <span className="text-xs font-semibold text-slate-400">/ year</span></p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <span>Inspection ₦{property.inspectionFee.toLocaleString()}</span>
                    <span>Agency ₦{property.agencyFee.toLocaleString()}</span>
                    <span>Caution ₦{property.cautionFee.toLocaleString()}</span>
                    <span>Legal ₦{property.legalFee.toLocaleString()}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-sm font-black">Due ₦{dueAfterCredit.toLocaleString()}</p>
                      {rentCredit > 0 && <p className="mt-1 text-[10px] text-slate-500">Before credit ₦{property.total.toLocaleString()}</p>}
                    </div>
                    <button
                      onClick={() => void rent(property.id)}
                      disabled={disabled}
                      className="rounded-xl bg-slate-950 px-4 py-3 text-xs font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
                    >
                      {property.isCurrentHome ? "Current home" : property.available ? "Rent" : "Occupied"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

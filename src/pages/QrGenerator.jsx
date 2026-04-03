import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function QrGenerator() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [tableCount, setTableCount] = useState(1);
  const qrRef = useRef(null);

  useEffect(() => {
    if (user?.restaurantId) {
      axios
        .get(`${import.meta.env.VITE_API_URL}/restaurants`)
        .then((res) => {
          const r = res.data.find((x) => x.id === user.restaurantId);
          setRestaurant(r);
        })
        .catch(console.error);
    }
  }, [user]);

  const handlePrint = () => {
    const printContent = qrRef.current.innerHTML;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Codes - ${restaurant?.name || "QBito"}</title>
          <style>
            body { font-family: sans-serif; display: flex; flex-wrap: wrap; gap: 40px; justify-content: center; padding: 20px; }
            .qr-card { 
              border: 2px dashed #ccc; 
              padding: 20px; 
              text-align: center; 
              border-radius: 16px;
              width: 180px;
              page-break-inside: avoid;
            }
            .qr-card h2 { margin: 0 0 10px 0; font-size: 16px; font-weight: 800; color: #000; }
            .qr-card p { margin: 10px 0 0 0; font-size: 14px; color: #555; font-weight: bold; }
            .print-btn { display: none; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!restaurant) return <div className="p-10 text-center">Loading restaurant info...</div>;

  const baseUrl = "http://localhost:5173/restro";

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 border border-glass-border">
        <h2 className="text-2xl font-extrabold tracking-tight">QR Code Generator</h2>
        <p className="text-sm text-gray-400 mt-1">
          Generate and print table-specific QR codes for <strong className="text-white">{restaurant.name}</strong>.
        </p>

        <div className="mt-6 flex flex-wrap items-end gap-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest font-bold block mb-2">
              Number of Tables
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={tableCount}
              onChange={(e) => setTableCount(Number(e.target.value))}
              className="w-[120px] rounded-xl px-4 py-3 bg-white/5 border border-white/10 outline-none focus:border-orange-500/50 transition text-sm"
            />
          </div>
          <button
            onClick={handlePrint}
            className="px-6 py-3 rounded-xl bg-orange-500 text-black font-extrabold hover:bg-orange-400 transition shadow-[0_0_20px_rgba(249,115,22,0.3)] flex items-center gap-2"
          >
            🖨️ Print QR Codes
          </button>
        </div>
      </div>

      <div className="glass-panel p-6 border border-glass-border">
        <div ref={qrRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: tableCount }).map((_, idx) => {
            const tableNo = idx + 1;
            const link = `${baseUrl}/${restaurant.slug}/table/${tableNo}`;

            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                key={tableNo}
                className="qr-card bg-white rounded-2xl p-4 flex flex-col items-center shadow-lg border-2 border-dashed border-gray-300 pointer-events-none"
              >
                <h2 className="text-sm font-extrabold text-black mb-3 pb-2 border-b border-gray-200 w-full text-center truncate">
                  {restaurant.name}
                </h2>
                <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                  <QRCodeSVG value={link} size={100} level="H" fgColor="#000000" bgColor="#FFFFFF" />
                </div>
                <p className="mt-3 text-lg font-black text-orange-600">
                  Table {tableNo}
                </p>
                <p className="text-[9px] text-gray-500 mt-1 uppercase font-bold tracking-wider">
                  Scan to Order
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

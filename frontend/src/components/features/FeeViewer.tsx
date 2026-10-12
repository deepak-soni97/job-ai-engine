import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface FeeViewerProps {
  feeText?: string;
}

export const FeeViewer: React.FC<FeeViewerProps> = ({ feeText }) => {
  const text = (feeText || '').trim();

  if (!text || text.toUpperCase() === 'NA' || text.toLowerCase() === 'refer notification') {
    return (
      <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-600">
        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
        <span>Refer official notification for fee structure and concessions.</span>
      </div>
    );
  }

  // Check if completely Free / Nil
  if (/^(?:nil|free|no fee|0)/i.test(text) || text.toLowerCase().includes('free application')) {
    return (
      <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-emerald-900 text-sm block">100% Free Application</span>
          <span className="text-xs text-emerald-700">No application fee required for any category.</span>
        </div>
      </div>
    );
  }

  // Parse if piped format (from scraped tables)
  const isPiped = text.includes('|');
  const items = isPiped ? text.split('|').map(s => s.trim()).filter(Boolean) : [text];

  // Function to highlight currency amounts and categories
  const formatFeeString = (str: string) => {
    const regex = /((?:Rs\.?|₹|INR)\s*\d+(?:[,\d]+)?(?:\/-)?(?:\s*\([^)]*\))?)|(\bGeneral\b|\bOBC\b|\bSC\b|\bST\b|\bWomen\b|\bEx-Servicemen\b|\bPwD\b|\bEWS\b)/gi;

    const parts: React.ReactNode[] = [];
    let last = 0;
    let m: RegExpExecArray | null;

    while ((m = regex.exec(str)) !== null) {
      if (m.index > last) {
        parts.push(str.substring(last, m.index));
      }
      const [, amount, category] = m;
      if (amount) {
        parts.push(
          <span
            key={m.index}
            className="inline-flex items-center font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded text-xs border border-emerald-300 mx-1 shadow-2xs"
          >
            💰 {amount}
          </span>
        );
      } else if (category) {
        parts.push(
          <span
            key={m.index}
            className="font-bold text-blue-800 bg-blue-100/80 px-1.5 py-0.5 rounded text-[11px] border border-blue-200 mx-0.5"
          >
            {category}
          </span>
        );
      }
      last = regex.lastIndex;
    }

    if (last < str.length) {
      parts.push(str.substring(last));
    }

    return parts;
  };

  return (
    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs text-xs sm:text-sm text-slate-700 leading-relaxed max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300">
      {isPiped ? (
        <ul className="space-y-1.5">
          {items.map((item, idx) => {
            // Skip pure column headers if redundant
            if (/^(?:category|application fee|fee amount)$/i.test(item)) return null;
            return (
              <li key={idx} className="flex items-start gap-2 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span className="grow">{formatFeeString(item)}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <div>{formatFeeString(text)}</div>
      )}
    </div>
  );
};

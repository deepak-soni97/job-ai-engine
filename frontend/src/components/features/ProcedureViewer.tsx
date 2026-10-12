import React from 'react';
import { Calendar, Globe, CreditCard, Camera, AlertTriangle, ExternalLink } from 'lucide-react';

interface ProcedureViewerProps {
  procedureText?: string;
  deadlineDate?: string;
}

export const ProcedureViewer: React.FC<ProcedureViewerProps> = ({ procedureText, deadlineDate }) => {
  const text = (procedureText || '').trim();

  if (!text) {
    return (
      <div className="text-xs sm:text-sm text-slate-500 italic bg-slate-50 p-4 rounded-xl border border-slate-200">
        Check official notification for step-by-step application instructions.
      </div>
    );
  }

  // 1. Extract Quick Summary Metadata
  const extractedDateMatch = text.match(/(?:before|last date|deadline|by)\s*([0-3]?\d[-/.][0-1]?\d[-/.](?:20)?\d{2}(?:\s*(?:at\s*)?[0-2]?\d:[0-5]\d\s*(?:Hrs|AM|PM|am|pm)?)?)/i) 
    || text.match(/([0-3]?\d[-/.][0-1]?\d[-/.](?:20)?\d{2}\s*(?:at\s*)?[0-2]?\d:[0-5]\d\s*(?:Hrs|AM|PM|am|pm)?)/i);
  
  const displayDeadline = extractedDateMatch ? extractedDateMatch[1] : (deadlineDate || null);

  const portalMatch = text.match(/(?:https?:\/\/|www\.)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s,)]*)?/i);
  const displayPortal = portalMatch ? portalMatch[0] : null;

  const photoSpecsMatch = text.match(/(?:photo|photograph|signature)[^.]*?(\d+(?:\.\d+)?\s*(?:cm|mm)\s*x\s*\d+(?:\.\d+)?\s*(?:cm|mm)[^.]*?(?:kb|DPI|dpi))/i);
  const displaySpecs = photoSpecsMatch ? photoSpecsMatch[0] : null;

  const paymentMatch = text.match(/(?:Debit Card|Credit Card|Internet Banking|UPI|payment gateway|Net Banking|online payment)/i);

  // 2. Split into distinct paragraphs or steps
  let paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  if (paragraphs.length === 1 && paragraphs[0].length > 400) {
    // If it's a huge block, split by numbered steps or large sentence clusters
    const parts = paragraphs[0].split(/(?=(?:\d+\.|\bStep\s*\d+:|\bVisit the official|\bUpload all|\bPay the application|\bSubmit the application))/i);
    if (parts.length > 1) {
      paragraphs = parts.map(p => p.trim()).filter(Boolean);
    }
  }

  // 3. Highlight tokens function
  const renderHighlightedContent = (rawText: string) => {
    // Regex matching dates, times, amounts, URLs, photo specs, important keywords
    const regex = /(https?:\/\/[^\s,)]+|www\.[^\s,)]+|[a-zA-Z0-9.-]+\.(?:gov\.in|nic\.in|org\.in|edu\.in))\b|(\b[0-3]?\d[-/.][0-1]?\d[-/.](?:20)?\d{2}(?:\s+at\s+[0-2]?\d:[0-5]\d\s*(?:Hrs|AM|PM)?)?|\b[0-2]?\d:[0-5]\d\s*(?:Hrs|AM|PM))\b|((?:Rs\.?|₹|INR)\s*\d+(?:[,\d]+)?(?:\/-)?|\bFee is exempt\b|\bNo Fee\b|\bFree\b)|(\d+(?:\.\d+)?\s*(?:cm|mm)\s*x\s*\d+(?:\.\d+)?\s*(?:cm|mm)|\d+\s*DPI|\d+(?:-\d+)?\s*(?:kb|mb|KB|MB)|JPG\/JPEG|PDF|PNG)|(\bImportant\b|\bNotice\b|\bNote\b|\bMandatory\b|\bEnsure\b|\bWarning\b|\bStrictly\b)/gi;

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(rawText)) !== null) {
      if (match.index > lastIndex) {
        elements.push(rawText.substring(lastIndex, match.index));
      }

      const [, url, dateOrTime, fee, spec, alertWord] = match;

      if (url) {
        const fullUrl = url.startsWith('http') ? url : `https://${url}`;
        elements.push(
          <a
            key={match.index}
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200 underline decoration-blue-400 transition-colors mx-0.5"
          >
            <Globe className="w-3 h-3 text-blue-600 inline shrink-0" />
            <span>{url}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
          </a>
        );
      } else if (dateOrTime) {
        elements.push(
          <span
            key={match.index}
            className="inline-flex items-center gap-1 font-bold text-amber-900 bg-amber-100/90 px-1.5 py-0.5 rounded text-xs border border-amber-300 shadow-2xs mx-0.5"
          >
            <Calendar className="w-3 h-3 text-amber-700 inline shrink-0" />
            <span>{dateOrTime}</span>
          </span>
        );
      } else if (fee) {
        elements.push(
          <span
            key={match.index}
            className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded text-xs border border-emerald-300 shadow-2xs mx-0.5"
          >
            <CreditCard className="w-3 h-3 text-emerald-700 inline shrink-0" />
            <span>{fee}</span>
          </span>
        );
      } else if (spec) {
        elements.push(
          <span
            key={match.index}
            className="inline-flex items-center gap-1 font-semibold text-indigo-800 bg-indigo-50 px-1.5 py-0.5 rounded text-xs border border-indigo-200 mx-0.5"
          >
            <Camera className="w-3 h-3 text-indigo-600 inline shrink-0" />
            <span>{spec}</span>
          </span>
        );
      } else if (alertWord) {
        elements.push(
          <span
            key={match.index}
            className="inline-flex items-center gap-1 font-bold text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded text-xs border border-rose-300 mx-0.5"
          >
            <AlertTriangle className="w-3 h-3 text-rose-600 inline shrink-0" />
            <span>{alertWord}</span>
          </span>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < rawText.length) {
      elements.push(rawText.substring(lastIndex));
    }

    return elements;
  };

  return (
    <div className="space-y-3">
      {/* Quick Highlights Toolbar */}
      {(displayDeadline || displayPortal || paymentMatch || displaySpecs) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-amber-50/60 rounded-xl border border-blue-100/80 text-xs">
          {displayDeadline && (
            <div className="flex items-center gap-2 font-medium text-slate-800 bg-white/90 px-2.5 py-1.5 rounded-lg border border-amber-200/80 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                <strong className="text-amber-800">Deadline:</strong> {displayDeadline}
              </span>
            </div>
          )}

          {displayPortal && (
            <div className="flex items-center gap-2 font-medium text-slate-800 bg-white/90 px-2.5 py-1.5 rounded-lg border border-blue-200/80 shadow-2xs truncate">
              <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">
                <strong className="text-blue-800">Portal:</strong>{' '}
                <a
                  href={displayPortal.startsWith('http') ? displayPortal : `https://${displayPortal}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline font-semibold hover:text-blue-800"
                >
                  {displayPortal}
                </a>
              </span>
            </div>
          )}

          {paymentMatch && (
            <div className="flex items-center gap-2 font-medium text-slate-800 bg-white/90 px-2.5 py-1.5 rounded-lg border border-emerald-200/80 shadow-2xs">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                <strong className="text-emerald-800">Payment:</strong> Online Gateway (Cards / Net Banking)
              </span>
            </div>
          )}

          {displaySpecs && (
            <div className="flex items-center gap-2 font-medium text-slate-800 bg-white/90 px-2.5 py-1.5 rounded-lg border border-indigo-200/80 shadow-2xs truncate">
              <Camera className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">
                <strong className="text-indigo-800">Upload Specs:</strong> 3.5cm x 3.5cm Photo (50-100 kb)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Step by Step Flow Container with Custom Scrollbar */}
      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 rounded-xl p-1">
        {paragraphs.map((para, idx) => (
          <div
            key={idx}
            className="relative flex gap-3 p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all text-xs sm:text-sm text-slate-700 leading-relaxed font-normal"
          >
            <div className="flex flex-col items-center">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs ring-2 ring-blue-100">
                {idx + 1}
              </span>
              {idx < paragraphs.length - 1 && (
                <div className="w-0.5 grow bg-slate-200 my-1 rounded-full" />
              )}
            </div>

            <div className="grow pt-0.5">
              <p className="whitespace-pre-wrap">{renderHighlightedContent(para)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

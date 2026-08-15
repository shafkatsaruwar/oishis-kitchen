import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Avery 5163 / 8163 geometry, in inches — identical to the iOS PDF generator.
export const LABEL_W = 4;
export const LABEL_H = 2;
const LEFT_MARGIN = 0.15;
const TOP_MARGIN = 0.5;
const COL_GAP = 0.2;
const COLS = 2;
const ROWS = 5;
export const PER_SHEET = COLS * ROWS;

// Same steps the iOS shrink loop lands on, so both renderers agree
function nameSize(name = '') {
  if (name.length > 30) return 14;
  if (name.length > 22) return 16;
  if (name.length > 15) return 20;
  return 28;
}

/**
 * One 4"x2" label. Mirrors drawLabel() in the iOS app: gold capsule across the
 * top, logo boxed on the left, dish name and note in the middle, pickup details
 * borderless on the right.
 */
export function Label({ name, note, date, time }) {
  return (
    <div className="ok-label">
      <div className="ok-label-bar" />
      <div className="ok-label-body">
        <div className="ok-label-logo">
          <img src="/logo.png" alt="" />
        </div>
        <div className="ok-label-text">
          <div className="ok-label-name" style={{ fontSize: `${nameSize(name)}pt` }}>
            {name}
          </div>
          {note && <div className="ok-label-note">{note}</div>}
        </div>
        {(date || time) && (
          <div className="ok-label-pickup">
            <div className="ok-label-pickup-cap">Pickup</div>
            {date && <div className="ok-label-pickup-val">{date}</div>}
            {time && <div className="ok-label-pickup-val">{time}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Sheet map, preview, and printing for an already-expanded list of labels — one
 * entry per physical label. Shared by the per-order dialog and the standalone
 * label page so both lay out identically on the sheet.
 */
export default function LabelSheet({ labels }) {
  const [usedSlots, setUsedSlots] = useState([]);

  const totalLabels = labels.length;
  const freeOnFirstSheet = PER_SHEET - usedSlots.length;
  const sheetIsFull = usedSlots.length >= PER_SHEET;

  const sheetsNeeded = useMemo(() => {
    if (totalLabels === 0) return 0;
    if (totalLabels <= freeOnFirstSheet) return 1;
    return 1 + Math.ceil((totalLabels - freeOnFirstSheet) / PER_SHEET);
  }, [totalLabels, freeOnFirstSheet]);

  // Lay the labels onto sheets, leaving the already-peeled slots empty
  const sheets = useMemo(() => {
    const pages = [];
    let idx = 0;
    let firstPage = true;
    while (idx < labels.length) {
      const page = new Array(PER_SHEET).fill(null);
      for (let slot = 0; slot < PER_SHEET; slot++) {
        if (idx >= labels.length) break;
        if (firstPage && usedSlots.includes(slot)) continue;
        page[slot] = labels[idx];
        idx += 1;
      }
      pages.push(page);
      firstPage = false;
    }
    return pages;
  }, [labels, usedSlots]);

  const firstSheetAssignment = useMemo(() => {
    const map = {};
    let placed = 0;
    for (let slot = 0; slot < PER_SHEET; slot++) {
      if (usedSlots.includes(slot)) continue;
      if (placed >= totalLabels) break;
      placed += 1;
      map[slot] = placed;
    }
    return map;
  }, [usedSlots, totalLabels]);

  const firstFreeSlot = [...Array(PER_SHEET).keys()].find((s) => !usedSlots.includes(s));

  const toggleSlot = (slot) =>
    setUsedSlots((prev) => (prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]));

  const handlePrint = () => {
    const detail =
      usedSlots.length > 0
        ? ` Skipping ${usedSlots.length} used, starting at position ${firstFreeSlot + 1}.`
        : '';
    const ok = window.confirm(
      `Label paper loaded?\n\nThis prints ${totalLabels} label${totalLabels === 1 ? '' : 's'} on ` +
        `${sheetsNeeded} sheet${sheetsNeeded === 1 ? '' : 's'}.${detail}\n\n` +
        'Load your 4"x2" label sheets (Avery 5163 / 8163) before continuing — plain paper will waste the job.'
    );
    if (ok) window.print();
  };

  const preview = labels[0];

  return (
    <>
      <div className="print:hidden">
        {/* Sheet map */}
        <h4 className="text-xs font-semibold text-gray-500 tracking-wide mb-2">
          SHEET IN THE PRINTER
        </h4>
        <p className="text-xs text-gray-600 mb-3">
          Click any labels you've already used. Printing starts at the first free one.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[...Array(PER_SHEET).keys()].map((slot) => {
            const isUsed = usedSlots.includes(slot);
            const number = firstSheetAssignment[slot];
            return (
              <button
                key={slot}
                onClick={() => toggleSlot(slot)}
                className={cn(
                  'h-11 rounded-md border flex items-center justify-center text-sm font-bold transition-colors',
                  isUsed
                    ? 'border-dashed border-gray-300 bg-gray-100 text-gray-400'
                    : number
                      ? 'border-amber-400 bg-amber-50 text-amber-700'
                      : 'border-gray-200 bg-white text-gray-300'
                )}
                aria-label={`Sheet position ${slot + 1}${isUsed ? ', already used' : ''}`}
              >
                {isUsed ? <X className="w-4 h-4" /> : number || ''}
              </button>
            );
          })}
        </div>
        {sheetIsFull && (
          <p className="text-xs text-orange-600 mt-2">
            This sheet is full — load a fresh one and clear the map.
          </p>
        )}
        {usedSlots.length > 0 && (
          <button onClick={() => setUsedSlots([])} className="text-xs text-amber-600 mt-2 underline">
            Clear — fresh sheet
          </button>
        )}

        {/* Preview */}
        {preview && (
          <>
            <h4 className="text-xs font-semibold text-gray-500 tracking-wide mb-2 mt-5">
              LABEL PREVIEW
            </h4>
            <div className="ok-label-preview">
              <Label {...preview} />
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Actual label: 4" × 2" — fits standard Avery 5163/8163 sheets
            </p>
          </>
        )}

        {/* Summary + print */}
        <div className="border-t border-gray-200 pt-4 mt-5 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">Total labels</span>
            <span className="font-bold text-amber-600">{totalLabels}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Sheets needed</span>
            <span className="text-gray-600">
              {sheetsNeeded === 0 ? '—' : `${sheetsNeeded} sheet${sheetsNeeded === 1 ? '' : 's'}`}
            </span>
          </div>
          {usedSlots.length > 0 && !sheetIsFull && (
            <div className="flex justify-between">
              <span className="text-gray-700">Starts at position</span>
              <span className="text-gray-600 tabular-nums">{firstFreeSlot + 1}</span>
            </div>
          )}
        </div>

        <Button
          onClick={handlePrint}
          disabled={totalLabels === 0 || sheetIsFull}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white mt-4"
        >
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
      </div>

      {/* Print surface. Portalled to <body> because the print rules hide every
          direct child of body except this one — nested inside the React tree it
          would be hidden along with #root, printing a blank page. */}
      {createPortal(
        <div className="ok-print-root" aria-hidden="true">
          {sheets.map((page, pageIdx) => (
            <div className="ok-sheet" key={pageIdx}>
              {page.map((label, slot) =>
                label ? (
                  <div
                    key={slot}
                    className="ok-slot"
                    style={{
                      left: `${LEFT_MARGIN + (slot % COLS) * (LABEL_W + COL_GAP)}in`,
                      top: `${TOP_MARGIN + Math.floor(slot / COLS) * LABEL_H}in`,
                    }}
                  >
                    <Label {...label} />
                  </div>
                ) : null
              )}
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

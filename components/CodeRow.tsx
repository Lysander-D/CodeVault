import React from 'react';
import { Copy, Check, Circle, CheckCircle2 } from 'lucide-react';
import { CodeItem } from '../types';

interface CodeRowProps {
  code: CodeItem;
  onCopy: (code: CodeItem) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  isEditing: boolean;
}

export const CodeRow: React.FC<CodeRowProps> = ({ code, onCopy, onToggle, onDelete, isEditing }) => {
  return (
    <div 
      className={`relative flex items-center bg-white pl-4 min-h-[56px] transition-colors group ${
        code.isUsed ? 'bg-slate-50' : 'active:bg-slate-50'
      }`}
    >
      {/* Delete Button (Visible in Edit Mode) */}
      {isEditing && (
        <button
          onClick={() => onDelete(code.id)}
          className="mr-3 text-red-500 hover:bg-red-50 p-1 rounded-full transition-colors animate-in slide-in-from-left-2 duration-200"
        >
          <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
             <div className="w-2.5 h-0.5 bg-white rounded-full" />
          </div>
        </button>
      )}

      {/* Main Content Area - Click to Copy */}
      <div 
        onClick={() => !isEditing && onCopy(code)}
        className="flex-1 py-3 pr-4 cursor-pointer flex flex-col justify-center overflow-hidden"
      >
        <div className="flex items-center justify-between gap-3">
          <span 
            className={`font-mono text-[15px] truncate transition-all duration-300 ${
              code.isUsed ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-900 font-medium'
            }`}
          >
            {code.value}
          </span>
        </div>
      </div>

      {/* Action Button (Right Side) */}
      <div className="pr-4 pl-2 py-3 border-l border-transparent">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(code.id);
          }}
          className={`transition-all duration-200 ${
            code.isUsed ? 'text-slate-400' : 'text-slate-300 hover:text-blue-500'
          }`}
        >
          {code.isUsed ? (
            <CheckCircle2 size={22} className="fill-slate-100" />
          ) : (
            <Circle size={22} strokeWidth={1.5} />
          )}
        </button>
      </div>

      {/* Separator Line (Simulating iOS list separator) */}
      <div className="absolute bottom-0 right-0 left-4 h-[1px] bg-slate-100 group-last:hidden" />
    </div>
  );
};
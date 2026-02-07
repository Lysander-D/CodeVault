import React, { useState, useEffect } from 'react';
import { Plus, X, ArrowRight } from 'lucide-react';
import { CategoryType } from '../types';

interface InputSectionProps {
  onParse: (text: string, category: CategoryType) => void;
  defaultCategory: CategoryType;
  categories: CategoryType[];
}

export const InputSection: React.FC<InputSectionProps> = ({ onParse, defaultCategory, categories }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(defaultCategory);

  // Sync internal state with prop change (when user switches tabs or renames them)
  useEffect(() => {
    // Ensure selected category exists in the new list, otherwise fallback to first
    if (categories.includes(defaultCategory)) {
      setSelectedCategory(defaultCategory);
    } else if (categories.length > 0) {
      setSelectedCategory(categories[0]);
    }
  }, [defaultCategory, categories]);

  const handleParse = () => {
    if (!text.trim()) return;
    onParse(text, selectedCategory);
    setText('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <div className="px-4 mb-6">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center justify-center gap-2 text-blue-600 font-medium active:scale-95 transition-transform"
        >
          <Plus size={20} />
          Add New Codes
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 mb-6">
      <div className="bg-white rounded-xl p-4 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            Import Codes
          </h3>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1 bg-slate-100 rounded-full"
          >
            <X size={16} />
          </button>
        </div>
        
        {/* Category Selection */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
            Select Category
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Text Input */}
        <textarea
          className="w-full bg-slate-50 rounded-lg p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 resize-none min-h-[120px]"
          placeholder="Paste messy text here... (e.g., chat logs, emails). We'll extract 20-60 char codes automatically."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        
        {/* Action Button */}
        <button
          onClick={handleParse}
          disabled={!text.trim()}
          className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all ${
            text.trim() 
              ? 'bg-blue-600 text-white shadow-md shadow-blue-200 active:scale-[0.98]' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          Extract to {selectedCategory}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
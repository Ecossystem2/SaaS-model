/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useCallback, useState, useRef } from 'react';
import { ArrowUpTrayIcon, SparklesIcon, XMarkIcon, PhotoIcon, DocumentIcon } from '@heroicons/react/24/outline';

interface InputAreaProps {
  onGenerate: (prompt: string, file?: File) => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onGenerate, isGenerating, disabled = false }) => {
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isGenerating) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, [disabled, isGenerating]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !isGenerating) {
        setIsDragging(true);
    }
  }, [disabled, isGenerating]);

  const handleSubmit = () => {
    if ((!prompt && !file) || isGenerating) return;
    onGenerate(prompt, file || undefined);
    setPrompt("");
    setFile(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
    }
  };

  const removeFile = (e: React.MouseEvent) => {
      e.stopPropagation();
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
        <div 
            className={`
                relative group
                bg-zinc-900/80 backdrop-blur-xl
                border transition-all duration-300 ease-out
                ${isDragging ? 'border-blue-500 ring-1 ring-blue-500/50 scale-[1.02]' : 'border-zinc-700/50 hover:border-zinc-600'}
                ${isGenerating ? 'opacity-80 pointer-events-none' : ''}
                rounded-2xl shadow-2xl
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={() => setIsDragging(false)}
        >
            {/* Gradient Glow Effect */}
            <div className={`absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 blur-lg -z-10`} />

            <div className="p-4 flex flex-col gap-4">
                
                {/* Text Input Area */}
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Descreva o que você quer construir ou arraste um arquivo..."
                    className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 text-lg resize-none focus:outline-none min-h-[60px] max-h-[200px]"
                    rows={prompt.length > 50 ? 3 : 1}
                />

                {/* File Preview Pill */}
                {file && (
                    <div className="flex items-center gap-3 bg-zinc-800/50 rounded-lg p-2 pr-3 w-fit border border-zinc-700 animate-in fade-in zoom-in duration-200">
                        <div className="w-10 h-10 rounded bg-zinc-700 flex items-center justify-center flex-shrink-0">
                            {file.type.startsWith('image/') ? (
                                <img 
                                    src={URL.createObjectURL(file)} 
                                    alt="preview" 
                                    className="w-full h-full object-cover rounded opacity-80"
                                    onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                                />
                            ) : (
                                <DocumentIcon className="w-6 h-6 text-zinc-400" />
                            )}
                        </div>
                        <div className="flex flex-col min-w-0 max-w-[150px] sm:max-w-[200px]">
                            <span className="text-xs font-medium text-zinc-200 truncate">{file.name}</span>
                            <span className="text-[10px] text-zinc-500 uppercase">{(file.size / 1024).toFixed(1)} KB</span>
                        </div>
                        <button 
                            onClick={removeFile}
                            className="ml-2 p-1 hover:bg-zinc-700 rounded-full text-zinc-400 hover:text-zinc-200 transition-colors"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Drag Overlay (Only visible when dragging) */}
                {isDragging && (
                    <div className="absolute inset-0 z-20 rounded-2xl bg-zinc-900/90 flex flex-col items-center justify-center border-2 border-dashed border-blue-500 text-blue-400">
                        <ArrowUpTrayIcon className="w-10 h-10 mb-2 animate-bounce" />
                        <span className="font-medium text-lg">Solte o arquivo para enviar</span>
                    </div>
                )}

                {/* Bottom Toolbar */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
                    <div className="flex items-center gap-2">
                         <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors group/file"
                            title="Enviar Imagem ou PDF"
                        >
                             <PhotoIcon className="w-5 h-5" />
                             <span className="sr-only">Upload</span>
                         </button>
                         <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                            accept="image/*,application/pdf"
                         />
                         <div className="hidden sm:block text-xs text-zinc-600 font-mono ml-2">
                            {!file ? "Arraste imagens/PDFs" : "Arquivo anexado"}
                         </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={(!prompt && !file) || isGenerating}
                        className={`
                            flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-sm transition-all duration-200
                            ${(!prompt && !file) || isGenerating
                                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02]'
                            }
                        `}
                    >
                        {isGenerating ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Pensando...</span>
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-4 h-4" />
                                <span>Gerar</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
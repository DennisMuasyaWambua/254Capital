import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, CheckCircle } from 'lucide-react';
interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  onFilesSelected: (files: File[]) => void;
  helperText?: string;
}
export function FileUpload({
  label,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSizeMB = 5,
  onFilesSelected,
  helperText
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...newFiles]);
      onFilesSelected([...files, ...newFiles]);
    }
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
      onFilesSelected([...files, ...newFiles]);
    }
  };
  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesSelected(newFiles);
  };
  return (
    <div className="w-full">
      {label &&
      <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
        </label>
      }

      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragging ? 'border-[#008080] bg-[#E0F2F2]/30' : 'border-slate-300 hover:border-[#008080] hover:bg-slate-50'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          accept={accept}
          onChange={handleFileSelect} />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="p-3 bg-slate-100 rounded-full">
            <UploadCloud className="h-6 w-6 text-slate-500" />
          </div>
          <div className="text-sm text-slate-600">
            <span className="font-semibold text-[#008080]">
              Click to upload
            </span>{' '}
            or drag and drop
          </div>
          <p className="text-xs text-slate-500">
            {accept.replace(/\./g, '').toUpperCase().replace(/,/g, ', ')} (Max{' '}
            {maxSizeMB}MB)
          </p>
        </div>
      </div>

      {helperText &&
      <p className="mt-2 text-xs text-slate-500">{helperText}</p>
      }

      {files.length > 0 &&
      <ul className="mt-4 space-y-2">
          {files.map((file, index) =>
        <li
          key={index}
          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">

              <div className="flex items-center space-x-3 overflow-hidden">
                <FileText className="h-5 w-5 text-slate-400 flex-shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-slate-700 truncate">
                    {file.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>
              <button
            onClick={(e) => {
              e.stopPropagation();
              removeFile(index);
            }}
            className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-red-500 transition-colors">

                <X className="h-4 w-4" />
              </button>
            </li>
        )}
        </ul>
      }
    </div>);

}
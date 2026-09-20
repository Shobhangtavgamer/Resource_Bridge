import { useCallback, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { ImagePlus, Trash2, UploadCloud } from "lucide-react";
import { formatBytes } from "@/lib/formatBytes";
import { cn } from "@/lib/utils";
import { FadeInImage } from "@/components/motion/FadeInImage";

const DEFAULT_ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export interface ImageUploaderProps {
  onFileChange: (file: File | null) => void;
  accept?: string[];
  maxSizeMB?: number;
  previewUrl?: string | null;
  error?: string;
  disabled?: boolean;
  label?: string;
  hint?: string;
  id?: string;
  className?: string;
}

export function ImageUploader({
  onFileChange,
  accept = DEFAULT_ACCEPT,
  maxSizeMB = 10,
  previewUrl,
  error: externalError,
  disabled = false,
  label = "Upload a photo",
  hint,
  id,
  className,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const resolvedError = externalError || error;
  const currentPreview = preview ?? previewUrl;

  const validate = useCallback(
    (candidate: File): string | null => {
      if (!accept.includes(candidate.type)) {
        return `Only ${accept.map((type) => type.replace("image/", "")).join(", ")} files are supported.`;
      }
      if (candidate.size > maxSizeMB * 1024 * 1024) {
        return `Photo must be smaller than ${maxSizeMB} MB.`;
      }
      return null;
    },
    [accept, maxSizeMB],
  );

  const handleFile = useCallback(
    (candidate: File) => {
      const validationError = validate(candidate);
      if (validationError) {
        setError(validationError);
        setFile(null);
        setPreview(null);
        onFileChange(null);
        if (inputRef.current) inputRef.current.value = "";
        return;
      }
      setError(null);
      setFile(candidate);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(candidate));
      onFileChange(candidate);
    },
    [validate, onFileChange, preview],
  );

  const clear = useCallback(() => {
    setFile(null);
    setError(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    onFileChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [onFileChange, preview]);

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const candidate = event.target.files?.[0];
    if (candidate) handleFile(candidate);
  };

  const onDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (disabled) return;
    const candidate = event.dataTransfer.files?.[0];
    if (candidate) handleFile(candidate);
  };

  const hasPreview = Boolean(currentPreview);

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept.join(",")}
        className="sr-only"
        onChange={onInputChange}
        disabled={disabled}
        aria-hidden="true"
        tabIndex={-1}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={onDrop}
        className={cn(
          "relative w-full overflow-hidden rounded-xl border-2 border-dashed text-left transition-colors",
          "focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/25",
          disabled && "cursor-not-allowed opacity-60",
          resolvedError
            ? "border-red-300 bg-red-50/40"
            : "border-ink-300 bg-white hover:border-brand-400 hover:bg-brand-50/40",
        )}
      >
        {hasPreview ? (
          <>
            <FadeInImage
              src={currentPreview!}
              alt="Photo preview of the donated item"
              className="h-48 w-full object-cover"
            />
            <span className="absolute inset-0 bg-ink-950/0 transition-colors hover:bg-ink-950/10" />
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-ink-950/70 px-3 py-1.5 text-xs font-medium text-white">
              <ImagePlus className="h-4 w-4" aria-hidden />
              Replace photo
            </span>
          </>
        ) : (
          <span className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <UploadCloud className="h-6 w-6" aria-hidden />
            </span>
            <span className="text-sm font-medium text-ink-900">{label}</span>
            <span className="text-xs text-ink-500">
              {hint ?? `Drag & drop or click to browse · up to ${maxSizeMB} MB`}
            </span>
          </span>
        )}
      </button>

      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-xs text-ink-500" role="status">
          {resolvedError ? (
            <span className="font-medium text-red-600">{resolvedError}</span>
          ) : file ? (
            `${file.name} · ${formatBytes(file.size)}`
          ) : (
            "No photo selected"
          )}
        </p>
        {hasPreview && (
          <button
            type="button"
            onClick={clear}
            disabled={disabled}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
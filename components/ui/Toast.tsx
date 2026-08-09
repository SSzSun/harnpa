'use client';

type ToastProps = {
  message: string;
  /** Controls mount; the parent owns the dismiss timer. */
  show: boolean;
};

export function Toast({ message, show }: ToastProps) {
  return (
    // Always mounted so screen readers announce the change, not the insertion.
    <div aria-live="polite" aria-atomic="true" className="pointer-events-none fixed inset-x-0 top-20 z-50 flex justify-center px-4">
      {show && (
        <div className="flex animate-toast-in items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-canvas shadow-lift">
          <svg className="h-4 w-4 shrink-0 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          {message}
        </div>
      )}
    </div>
  );
}

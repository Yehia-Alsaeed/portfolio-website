export default function Loading() {
  return (
    <div aria-live="polite" role="status">
      <p className="sr-only">Loading page</p>
      <div aria-hidden="true">
        <div className="border-b-2 border-line pb-8 pt-12">
          <div className="h-4 w-40 bg-soft" />
          <div className="mt-6 h-20 w-[min(560px,80%)] bg-soft" />
          <div className="mt-5 h-3 w-64 bg-soft" />
        </div>
        <div className="grid grid-cols-2 gap-5 border-b border-line py-4 min-[821px]:grid-cols-4">
          <div className="h-9 bg-soft" />
          <div className="h-9 bg-soft" />
          <div className="h-9 bg-soft" />
          <div className="h-9 bg-soft" />
        </div>
      </div>
    </div>
  );
}

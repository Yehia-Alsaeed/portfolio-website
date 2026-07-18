export default function Loading() {
  return (
    <div aria-live="polite" role="status">
      <p className="sr-only">Loading page</p>
      <div aria-hidden="true">
        <div className="border-line border-b-2 pt-12 pb-8">
          <div className="bg-soft h-4 w-40" />
          <div className="bg-soft mt-6 h-20 w-[min(560px,80%)]" />
          <div className="bg-soft mt-5 h-3 w-64" />
        </div>
        <div className="border-line grid grid-cols-2 gap-5 border-b py-4 min-[821px]:grid-cols-4">
          <div className="bg-soft h-9" />
          <div className="bg-soft h-9" />
          <div className="bg-soft h-9" />
          <div className="bg-soft h-9" />
        </div>
      </div>
    </div>
  );
}

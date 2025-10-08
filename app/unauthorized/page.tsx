export default function UnauthorizedPage() {
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-4 rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
      <h1 className="text-lg font-semibold">Access blocked</h1>
      <p className="text-sm">
        This module requires an elevated TRS role. Ask a SuperAdmin or Principal to review your
        permissions or request access through governance.
      </p>
    </main>
  )
}

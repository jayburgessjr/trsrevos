export default function DocumentsPage() {
  return (
    <div className='flex h-full flex-col'>
      <header className='border-b border-[color:var(--color-outline)] bg-[color:var(--color-surface)] px-6 py-5 shadow-sm'>
        <h1 className='text-2xl font-semibold text-[color:var(--color-text)]'>Documents</h1>
        <p className='mt-1 max-w-2xl text-sm text-[color:var(--color-text-muted)]'>
          Centralized access to internal documentation and playbooks hosted in Notion.
        </p>
      </header>
      <div className='flex-1 overflow-hidden'>
        <iframe
          title='TRS Documents'
          src='https://raspy-shade-ce2.notion.site/ebd/284e7690094f8097afdbfe0969ef5435'
          className='h-full w-full'
          style={{ minHeight: 600 }}
          frameBorder={0}
          allowFullScreen
        />
      </div>
    </div>
  )
}

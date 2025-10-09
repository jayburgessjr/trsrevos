import { ContentStudio } from './content-studio'
import { computeMetrics, getContentState } from '@/core/content/store'
import { nextBestContent } from '@/core/content/recommender'
import { computeMediaMetrics, getMediaState } from '@/core/mediaAgent/store'
import { suggestMediaFromPipeline } from '@/core/mediaAgent/recommender'

export default async function ContentPage({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
  const tab = searchParams?.tab ?? 'Overview'
  const contentState = getContentState()
  const metrics = computeMetrics()
  const suggestions = nextBestContent()
  const mediaState = getMediaState()
  const mediaMetrics = computeMediaMetrics()
  const mediaIdeas = suggestMediaFromPipeline()

  const body = (
    <ContentStudio
      initialItems={contentState.items}
      initialVariants={contentState.variants}
      initialDistributions={contentState.distributions}
      initialTouches={contentState.touches}
      metrics={metrics}
      suggestions={suggestions}
      mediaIdeas={mediaIdeas}
      mediaProjects={mediaState.projects}
      mediaDistributions={mediaState.distributions}
      mediaMetrics={mediaMetrics}
    />
  )

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-4">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-black">Content Studio</h1>
          <p className="text-sm text-gray-500">Activate, test, and distribute revenue assets.</p>
          <div className="text-xs text-gray-500">Active view: {tab}</div>
        </div>
        <form action="#">
          <button className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs text-black">New Asset</button>
        </form>
      </header>
      <div className="rounded-xl border border-gray-200 bg-white">
        {body}
      </div>
    </div>
  )
}

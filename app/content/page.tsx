import { ContentStudio } from './content-studio'
import { computeMetrics, getContentState } from '@/core/content/store'
import { nextBestContent } from '@/core/content/recommender'
import { computeMediaMetrics, getMediaState } from '@/core/mediaAgent/store'
import { suggestMediaFromPipeline } from '@/core/mediaAgent/recommender'
import { TopTabs } from '@/components/kit/TopTabs'

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
    <div className="min-h-screen bg-white text-black">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <TopTabs />
        <div className="text-xs text-gray-600">{tab}</div>
      </div>
      <main className="max-w-7xl mx-auto p-4">{body}</main>
    </div>
  )
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/kit/Card";
import { fetchContentPiece, updateContentPiece } from "@/core/content/api";
import type { ContentPiece } from "@/core/content/types";

export default function ContentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [content, setContent] = useState<ContentPiece | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState<Partial<ContentPiece>>({});

  useEffect(() => {
    let active = true;

    fetchContentPiece(params.id).then((piece) => {
      if (active && piece) {
        setContent(piece);
        setEditedContent(piece);
      }
    });

    return () => {
      active = false;
    };
  }, [params.id]);

  const handleSave = async () => {
    if (content && editedContent) {
      const updated = await updateContentPiece(content.id, editedContent);
      if (updated) {
        setContent(updated);
        setIsEditing(false);
      }
    }
  };

  const handleShare = () => {
    if (content) {
      const shareText = `Check out: ${content.title}`;
      const shareUrl = window.location.href;

      if (navigator.share) {
        navigator.share({
          title: content.title,
          text: shareText,
          url: shareUrl,
        }).catch(console.error);
      } else {
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
    }
  };

  const handleDownload = () => {
    if (content) {
      const data = JSON.stringify(content, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${content.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (!content) {
    return (
      <div className="w-full px-6 py-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-black">Content not found</h2>
          <Link href="/content" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
            Back to Content
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/content" className="text-gray-600 hover:text-black">
            ← Back
          </Link>
          <h1 className="text-2xl font-semibold text-black">{content.title}</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Share
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Download
          </button>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedContent(content);
                }}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800"
              >
                Save
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-black mb-4">Content Details</h2>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editedContent.title || ''}
                    onChange={(e) => setEditedContent({ ...editedContent, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editedContent.description || ''}
                    onChange={(e) => setEditedContent({ ...editedContent, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={editedContent.status || ''}
                      onChange={(e) => setEditedContent({ ...editedContent, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="Idea">Idea</option>
                      <option value="Draft">Draft</option>
                      <option value="Review">Review</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Published">Published</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                    <select
                      value={editedContent.purpose || ''}
                      onChange={(e) => setEditedContent({ ...editedContent, purpose: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="Inspire">Inspire</option>
                      <option value="Sell">Sell</option>
                      <option value="Add Value">Add Value</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">Description</div>
                  <div className="text-base text-gray-900 mt-1">{content.description || 'No description'}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Type</div>
                    <div className="text-base text-gray-900 mt-1">{content.contentType}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Format</div>
                    <div className="text-base text-gray-900 mt-1">{content.format}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Status</div>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-1 ${
                      content.status === 'Published' ? 'bg-emerald-100 text-emerald-800' :
                      content.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                      content.status === 'Review' ? 'bg-amber-100 text-amber-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {content.status}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Purpose</div>
                    <div className="text-base text-gray-900 mt-1">{content.purpose}</div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {content.performanceMetrics && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-black mb-4">Performance Metrics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Views</div>
                  <div className="text-2xl font-semibold text-black mt-1">
                    {content.performanceMetrics.views?.toLocaleString() || 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Engagement</div>
                  <div className="text-2xl font-semibold text-black mt-1">
                    {content.performanceMetrics.engagement?.toLocaleString() || 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Clicks</div>
                  <div className="text-2xl font-semibold text-black mt-1">
                    {content.performanceMetrics.clicks || 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Shares</div>
                  <div className="text-2xl font-semibold text-black mt-1">
                    {content.performanceMetrics.shares || 0}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-black mb-4">Metadata</h2>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-gray-500">Created By</div>
                <div className="text-gray-900 font-medium">{content.createdBy}</div>
              </div>
              {content.assignedTo && (
                <div>
                  <div className="text-gray-500">Assigned To</div>
                  <div className="text-gray-900 font-medium">{content.assignedTo}</div>
                </div>
              )}
              <div>
                <div className="text-gray-500">Target Audience</div>
                <div className="text-gray-900 font-medium">{content.targetAudience}</div>
              </div>
              {content.channel && (
                <div>
                  <div className="text-gray-500">Channel</div>
                  <div className="text-gray-900 font-medium">{content.channel}</div>
                </div>
              )}
              {content.aiGenerated && (
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                    AI Generated
                  </span>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-black mb-4">Timeline</h2>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-gray-500">Created</div>
                <div className="text-gray-900">
                  {new Date(content.createdAt).toLocaleDateString()}
                </div>
              </div>
              {content.scheduledDate && (
                <div>
                  <div className="text-gray-500">Scheduled</div>
                  <div className="text-gray-900">
                    {new Date(content.scheduledDate).toLocaleDateString()}
                  </div>
                </div>
              )}
              {content.publishedDate && (
                <div>
                  <div className="text-gray-500">Published</div>
                  <div className="text-gray-900">
                    {new Date(content.publishedDate).toLocaleDateString()}
                  </div>
                </div>
              )}
              <div>
                <div className="text-gray-500">Last Updated</div>
                <div className="text-gray-900">
                  {new Date(content.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </Card>

          {content.tags && content.tags.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-black mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {content.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

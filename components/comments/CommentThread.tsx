'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Button } from '@/ui/button'
import { Textarea } from '@/ui/textarea'
import { Badge } from '@/ui/badge'
import { MessageSquare, Reply, Edit, Trash2, Send, X } from 'lucide-react'
import { useRevosData } from '@/app/providers/RevosDataProvider'
import type { Comment } from '@/lib/revos/types'
import { cn } from '@/lib/utils'

interface CommentThreadProps {
  projectId?: string
  documentId?: string
  title?: string
  description?: string
}

interface CommentItemProps {
  comment: Comment
  replies: Comment[]
  onReply: (comment: Comment) => void
  onEdit: (comment: Comment) => void
  onDelete: (comment: Comment) => void
  depth?: number
}

function CommentItem({ comment, replies, onReply, onEdit, onDelete, depth = 0 }: CommentItemProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className={cn("space-y-3", depth > 0 && "ml-8 border-l-2 border-border pl-4")}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-semibold text-emerald-700">
          {comment.author[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-foreground">{comment.author}</span>
            <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
            {comment.isEdited && (
              <Badge variant="outline" className="text-xs">Edited</Badge>
            )}
          </div>
          <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{comment.content}</p>
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => onReply(comment)}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Reply className="h-3 w-3" />
              Reply
            </button>
            <button
              onClick={() => onEdit(comment)}
              className="text-xs text-gray-600 hover:text-gray-700 flex items-center gap-1"
            >
              <Edit className="h-3 w-3" />
              Edit
            </button>
            <button
              onClick={() => onDelete(comment)}
              className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
            {replies.length > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-gray-600 hover:text-gray-700"
              >
                {isExpanded ? 'Hide' : 'Show'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>
        </div>
      </div>

      {isExpanded && replies.length > 0 && (
        <div className="space-y-3">
          {replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              replies={[]}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function CommentThread({ projectId, documentId, title, description }: CommentThreadProps) {
  const { comments, createComment, updateComment, deleteComment } = useRevosData()
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null)
  const [editingComment, setEditingComment] = useState<Comment | null>(null)
  const [editContent, setEditContent] = useState('')

  // Filter comments for this resource
  const resourceComments = useMemo(() => {
    if (!comments) return []
    return comments.filter(comment => {
      if (projectId) return comment.projectId === projectId && !comment.documentId
      if (documentId) return comment.documentId === documentId
      return false
    })
  }, [comments, projectId, documentId])

  // Organize comments into threads
  const commentThreads = useMemo(() => {
    const topLevel = resourceComments.filter(c => !c.parentCommentId)
    return topLevel.map(comment => ({
      comment,
      replies: resourceComments.filter(c => c.parentCommentId === comment.id)
    }))
  }, [resourceComments])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    createComment({
      content: newComment.trim(),
      projectId,
      documentId,
      parentCommentId: replyingTo?.id,
    })

    setNewComment('')
    setReplyingTo(null)
  }

  const handleEdit = (comment: Comment) => {
    setEditingComment(comment)
    setEditContent(comment.content)
  }

  const handleSaveEdit = () => {
    if (!editingComment || !editContent.trim()) return

    updateComment({
      id: editingComment.id,
      content: editContent.trim(),
    })

    setEditingComment(null)
    setEditContent('')
  }

  const handleDelete = (comment: Comment) => {
    if (confirm('Delete this comment and all its replies?')) {
      deleteComment(comment.id)
    }
  }

  const handleReply = (comment: Comment) => {
    setReplyingTo(comment)
    setNewComment(`@${comment.author} `)
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[#015e32]" />
          <CardTitle className="text-lg">{title || 'Discussion'}</CardTitle>
        </div>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{resourceComments.length} {resourceComments.length === 1 ? 'comment' : 'comments'}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* New Comment Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {replyingTo && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Reply className="h-3 w-3" />
              <span>Replying to {replyingTo.author}</span>
              <button
                type="button"
                onClick={() => {
                  setReplyingTo(null)
                  setNewComment('')
                }}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="resize-none"
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={!newComment.trim()} className="bg-[#015e32] hover:bg-[#01753d]">
              <Send className="h-4 w-4 mr-2" />
              {replyingTo ? 'Reply' : 'Comment'}
            </Button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-6">
          {commentThreads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No comments yet. Start the discussion!</p>
            </div>
          ) : (
            commentThreads.map(({ comment, replies }) => (
              <div key={comment.id}>
                {editingComment?.id === comment.id ? (
                  <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleSaveEdit} size="sm" className="bg-[#015e32] hover:bg-[#01753d]">
                        Save
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingComment(null)
                          setEditContent('')
                        }}
                        size="sm"
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <CommentItem
                    comment={comment}
                    replies={replies}
                    onReply={handleReply}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

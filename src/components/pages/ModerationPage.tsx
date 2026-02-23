import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Warning } from '@phosphor-icons/react'
import { useContentItems, useModerateContent } from '@/hooks/use-api'
import { toast } from 'sonner'
import type { ContentItem } from '@/types'

export function ModerationPage() {
  const { data: pendingData, isLoading: pendingLoading, error: pendingError, refetch: refetchPending } = useContentItems({ status: 'pending' })
  const { data: reviewedData, isLoading: reviewedLoading, refetch: refetchReviewed } = useContentItems({ status: 'approved,rejected' })
  const { mutate: moderate, isPending: moderating } = useModerateContent()

  const pendingItems = pendingData?.items || []
  const reviewedItems = reviewedData?.items || []

  const handleModerate = async (id: string, action: 'approve' | 'reject') => {
    try {
      await moderate({ id, action })
      toast.success(`Content ${action}d successfully`)
      refetchPending()
      refetchReviewed()
    } catch (error) {
      toast.error(`Failed to ${action} content`)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Content Moderation</h1>
        <p className="text-muted-foreground mt-1">
          Review and moderate flagged content from the community.
        </p>
      </div>

      {pendingError && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-3 pt-6">
            <Warning className="h-5 w-5 text-destructive" />
            <div className="flex-1">
              <p className="font-medium text-destructive">Failed to load content</p>
              <p className="text-sm text-muted-foreground">{pendingError.message}</p>
            </div>
            <button
              onClick={() => refetchPending()}
              className="text-sm font-medium text-primary hover:underline"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            Pending {!pendingLoading && <Badge className="ml-2">{pendingItems.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingLoading ? (
            Array.from({ length: 3 }).map((_, i) => <ModerationCardSkeleton key={i} />)
          ) : pendingItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No pending items to review</p>
              </CardContent>
            </Card>
          ) : (
            pendingItems.map((item) => (
              <ModerationCard
                key={item.id}
                item={item}
                onModerate={handleModerate}
                moderating={moderating}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="reviewed" className="space-y-4">
          {reviewedLoading ? (
            Array.from({ length: 3 }).map((_, i) => <ModerationCardSkeleton key={i} />)
          ) : reviewedItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No reviewed items</p>
              </CardContent>
            </Card>
          ) : (
            reviewedItems.map((item) => <ModerationCard key={item.id} item={item} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ModerationCard({
  item,
  onModerate,
  moderating,
}: {
  item: ContentItem
  onModerate?: (id: string, action: 'approve' | 'reject') => void
  moderating?: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">
                <Badge variant="outline" className="capitalize">
                  {item.type}
                </Badge>
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                by <span className="font-medium">{item.authorUsername}</span>
              </span>
            </div>
            <CardDescription className="flex items-center gap-2">
              <span>Flagged {item.flagCount} times</span>
              {item.status === 'pending' && (
                <Badge variant="destructive" className="text-xs">
                  Needs Review
                </Badge>
              )}
              {item.status === 'approved' && (
                <Badge className="text-xs bg-green-100 text-green-700">Approved</Badge>
              )}
              {item.status === 'rejected' && (
                <Badge variant="destructive" className="text-xs">
                  Rejected
                </Badge>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm">{item.content}</p>
        </div>

        {item.status === 'pending' && onModerate ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => onModerate(item.id, 'approve')}
              disabled={moderating}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onModerate(item.id, 'reject')}
              disabled={moderating}
            >
              Reject
            </Button>
            <Button size="sm" variant="outline">
              View Context
            </Button>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            {item.moderatedBy && (
              <>
                Reviewed by <span className="font-medium">{item.moderatedBy}</span> on{' '}
                {new Date(item.moderatedAt!).toLocaleDateString()}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ModerationCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-28" />
        </div>
      </CardContent>
    </Card>
  )
}

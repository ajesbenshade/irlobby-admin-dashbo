import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { mockContentItems } from '@/lib/mock-data'
import type { ContentItem } from '@/types'

export function ModerationPage() {
  const pendingItems = mockContentItems.filter((item) => item.status === 'pending')
  const reviewedItems = mockContentItems.filter((item) => item.status !== 'pending')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Content Moderation</h1>
        <p className="text-muted-foreground mt-1">
          Review and moderate flagged content from the community.
        </p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            Pending <Badge className="ml-2">{pendingItems.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No pending items to review</p>
              </CardContent>
            </Card>
          ) : (
            pendingItems.map((item) => <ModerationCard key={item.id} item={item} />)
          )}
        </TabsContent>

        <TabsContent value="reviewed" className="space-y-4">
          {reviewedItems.map((item) => (
            <ModerationCard key={item.id} item={item} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ModerationCard({ item }: { item: ContentItem }) {
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

        {item.status === 'pending' ? (
          <div className="flex gap-2">
            <Button size="sm" variant="default">
              Approve
            </Button>
            <Button size="sm" variant="destructive">
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

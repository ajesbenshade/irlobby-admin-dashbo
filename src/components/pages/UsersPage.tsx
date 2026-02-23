import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MagnifyingGlass, DotsThreeVertical } from '@phosphor-icons/react'
import { mockUsers } from '@/lib/mock-data'
import type { User } from '@/types'

export function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-1">
          View and manage user accounts, roles, and permissions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {filteredUsers.length} of {mockUsers.length} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by username or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reports</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <UserRow key={user.id} user={user} />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function UserRow({ user }: { user: User }) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <img
            src={user.avatarUrl}
            alt={user.username}
            className="h-8 w-8 rounded-full"
          />
          <div className="font-medium">{user.username}</div>
        </div>
      </TableCell>
      <TableCell className="font-mono text-sm">{user.email}</TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">
          {user.role}
        </Badge>
      </TableCell>
      <TableCell>
        <StatusBadge status={user.status} />
      </TableCell>
      <TableCell>
        {user.reportCount > 0 ? (
          <span className="text-destructive font-medium">{user.reportCount}</span>
        ) : (
          <span className="text-muted-foreground">0</span>
        )}
      </TableCell>
      <TableCell>
        <button className="text-muted-foreground hover:text-foreground">
          <DotsThreeVertical className="h-5 w-5" />
        </button>
      </TableCell>
    </TableRow>
  )
}

function StatusBadge({ status }: { status: User['status'] }) {
  const variants: Record<User['status'], { class: string; label: string }> = {
    active: { class: 'bg-green-100 text-green-700 border-green-200', label: 'Active' },
    suspended: { class: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Suspended' },
    banned: { class: 'bg-red-100 text-red-700 border-red-200', label: 'Banned' },
  }

  const variant = variants[status]

  return (
    <Badge className={`${variant.class} border`} variant="outline">
      {variant.label}
    </Badge>
  )
}

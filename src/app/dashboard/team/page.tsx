'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Pencil,
  Calendar,
  Mail,
  Phone,
  RefreshCw,
  MoreHorizontal,
  UserMinus,
  UserPlus,
  Loader2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StaffFormModal } from '@/features/dashboard/components'
import {
  getStaffMembers,
  createStaffMember,
  updateStaffMember,
  updateStaffWorkingHours,
  updateStaffSkills,
  deactivateStaffMember,
  reactivateStaffMember,
  assignRole,
  type StaffMember,
  type CreateStaffInput,
} from '@/features/dashboard/actions'
import { getServicesForCalendar } from '@/features/dashboard/actions'

// TODO: Get from auth context
const SALON_ID = process.env.NEXT_PUBLIC_DEFAULT_SALON_ID || 'default-salon-id'

export default function TeamPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [staffMembers, setStaffMembers] = React.useState<StaffMember[]>([])
  const [services, setServices] = React.useState<Array<{ id: string; name: string }>>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const [showStaffModal, setShowStaffModal] = React.useState(false)
  const [editingStaff, setEditingStaff] = React.useState<StaffMember | null>(null)

  // Fetch data on mount
  React.useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [staffData, servicesData] = await Promise.all([
        getStaffMembers(SALON_ID),
        getServicesForCalendar(SALON_ID),
      ])
      setStaffMembers(staffData)
      setServices(servicesData.map((s) => ({ id: s.id, name: s.name })))
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast({
        title: 'Fehler',
        description: 'Daten konnten nicht geladen werden.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchData()
    setIsRefreshing(false)
  }

  const handleCreateStaff = async (data: CreateStaffInput) => {
    const result = await createStaffMember(SALON_ID, data)
    if (result.success) {
      await fetchData()
    }
    return result
  }

  const handleUpdateStaff = async (data: CreateStaffInput) => {
    if (!editingStaff) return { success: false, error: 'Kein Mitarbeiter ausgewählt' }

    // Update basic info
    const basicResult = await updateStaffMember(editingStaff.id, {
      displayName: data.displayName,
      email: data.email,
      phone: data.phone,
      title: data.title,
      bio: data.bio,
      color: data.color,
      isBookable: data.isBookable,
    })

    if (!basicResult.success) return basicResult

    // Update working hours
    if (data.workingHours) {
      await updateStaffWorkingHours(editingStaff.id, data.workingHours)
    }

    // Update skills
    if (data.serviceIds) {
      await updateStaffSkills(editingStaff.id, data.serviceIds)
    }

    // Update role if staff has a linked profile and role changed
    if (editingStaff.profileId && data.role && data.role !== editingStaff.role) {
      // TODO: Get actual user ID from auth context for assignedBy
      await assignRole(editingStaff.profileId, SALON_ID, data.role, 'system')
    }

    await fetchData()
    return { success: true }
  }

  const handleDeactivate = async (staffId: string) => {
    const result = await deactivateStaffMember(staffId)
    if (result.success) {
      toast({
        title: 'Mitarbeiter deaktiviert',
        description: 'Der Mitarbeiter wurde erfolgreich deaktiviert.',
      })
      await fetchData()
    } else {
      toast({
        title: 'Fehler',
        description: result.error || 'Mitarbeiter konnte nicht deaktiviert werden.',
        variant: 'destructive',
      })
    }
  }

  const handleReactivate = async (staffId: string) => {
    const result = await reactivateStaffMember(staffId)
    if (result.success) {
      toast({
        title: 'Mitarbeiter reaktiviert',
        description: 'Der Mitarbeiter wurde erfolgreich reaktiviert.',
      })
      await fetchData()
    } else {
      toast({
        title: 'Fehler',
        description: result.error || 'Mitarbeiter konnte nicht reaktiviert werden.',
        variant: 'destructive',
      })
    }
  }

  const openCreateModal = () => {
    setEditingStaff(null)
    setShowStaffModal(true)
  }

  const openEditModal = (staff: StaffMember) => {
    setEditingStaff(staff)
    setShowStaffModal(true)
  }

  const activeStaff = staffMembers.filter((s) => s.isActive)
  const inactiveStaff = staffMembers.filter((s) => !s.isActive)

  // Calculate today's working staff
  const today = new Date()
  const dayOfWeek = today.getDay() === 0 ? '7' : String(today.getDay())
  const todayWorkingCount = activeStaff.filter((s) =>
    s.workingHours.some((wh) => wh.dayOfWeek === dayOfWeek)
  ).length

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Lade Team-Daten...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihr Team und deren Arbeitszeiten
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={openCreateModal}>
            <Plus className="mr-2 h-4 w-4" />
            Mitarbeiter hinzufügen
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Team-Mitglieder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffMembers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aktive Mitarbeiter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeStaff.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Heute im Dienst
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayWorkingCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {staffMembers.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Noch keine Mitarbeiter erfasst. Fügen Sie Ihr erstes Team-Mitglied hinzu.
              </p>
              <Button onClick={openCreateModal}>
                <Plus className="mr-2 h-4 w-4" />
                Ersten Mitarbeiter hinzufügen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Staff */}
      {activeStaff.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Aktive Mitarbeiter</CardTitle>
            <CardDescription>
              Mitarbeiter, die aktuell im Team aktiv sind
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeStaff.map((member) => (
                <Card key={member.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback
                            style={{ backgroundColor: member.color, color: 'white' }}
                          >
                            {member.displayName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{member.displayName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {member.title || member.role || 'Mitarbeiter'}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditModal(member)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeactivate(member.id)}
                          >
                            <UserMinus className="mr-2 h-4 w-4" />
                            Deaktivieren
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mt-4 space-y-2">
                      {member.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          {member.email}
                        </div>
                      )}
                      {member.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {member.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {member.workingHours.length > 0
                          ? member.workingHours
                              .map((wh) => {
                                const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
                                return days[parseInt(wh.dayOfWeek) % 7] || wh.dayOfWeek
                              })
                              .join(', ')
                          : 'Keine Arbeitszeiten'}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1">
                      {member.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {member.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{member.skills.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      {member.isBookable ? (
                        <Badge variant="default" className="text-xs">
                          Online buchbar
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Nicht buchbar
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inactive Staff */}
      {inactiveStaff.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inaktive Mitarbeiter</CardTitle>
            <CardDescription>
              Mitarbeiter, die momentan nicht aktiv sind
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inactiveStaff.map((member) => (
                <Card key={member.id} className="opacity-60">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {member.displayName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{member.displayName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {member.title || 'Mitarbeiter'}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditModal(member)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleReactivate(member.id)}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Reaktivieren
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Badge variant="secondary" className="mt-4">
                      Inaktiv
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff Form Modal */}
      <StaffFormModal
        open={showStaffModal}
        onOpenChange={setShowStaffModal}
        staff={editingStaff}
        services={services}
        onSubmit={editingStaff ? handleUpdateStaff : handleCreateStaff}
      />
    </div>
  )
}

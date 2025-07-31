"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BaseModal } from '../base/BaseModal'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Users } from 'lucide-react'

interface AssignTaskModalProps {
  isOpen: boolean
  onClose: () => void
  domain: string
  companyId: string
}

export function AssignTaskModal({ isOpen, onClose, domain, companyId }: AssignTaskModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [students, setStudents] = useState([])
  const [tasks, setTasks] = useState([])
  const [selectedAssignments, setSelectedAssignments] = useState<Record<string, string[]>>({})
  
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen, domain, companyId])

  const fetchData = async () => {
    try {
      // Fetch students and tasks for this domain
      const [studentsRes, tasksRes] = await Promise.all([
        fetch(`/api/company/${companyId}/students?domain=${domain}`),
        fetch(`/api/company/${companyId}/tasks?domain=${domain}&unassigned=true`)
      ])

      if (studentsRes.ok && tasksRes.ok) {
        const studentsData = await studentsRes.json()
        const tasksData = await tasksRes.json()
        setStudents(studentsData)
        setTasks(tasksData)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const handleAssignmentChange = (studentId: string, taskId: string, checked: boolean) => {
    setSelectedAssignments(prev => {
      const newAssignments = { ...prev }
      if (!newAssignments[studentId]) {
        newAssignments[studentId] = []
      }
      
      if (checked) {
        newAssignments[studentId] = [...newAssignments[studentId], taskId]
      } else {
        newAssignments[studentId] = newAssignments[studentId].filter(id => id !== taskId)
      }
      
      return newAssignments
    })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const assignments = Object.entries(selectedAssignments)
        .flatMap(([studentId, taskIds]) => 
          taskIds.map(taskId => ({ studentId, taskId }))
        )

      const response = await fetch('/api/company/tasks/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignments }),
      })

      if (!response.ok) {
        throw new Error('Failed to assign tasks')
      }

      toast({
        title: "Tasks Assigned",
        description: "Tasks have been assigned successfully.",
      })

      onClose()
      setSelectedAssignments({})
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign tasks. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const totalAssignments = Object.values(selectedAssignments)
    .reduce((sum, tasks) => sum + tasks.length, 0)

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={`Assign Tasks - ${domain}`} size="lg">
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Select tasks to assign to students in the {domain} domain.
        </div>

        {students.length === 0 || tasks.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {students.length === 0 ? 'No students available' : 'No unassigned tasks'}
            </h3>
            <p className="text-muted-foreground">
              {students.length === 0 
                ? `There are no students in the ${domain} domain.`
                : `All tasks in the ${domain} domain have been assigned.`
              }
            </p>
          </div>
        ) : (
          <>
            {/* Tasks Header */}
            <div className="border-b pb-2">
              <h3 className="font-medium">Available Tasks ({tasks.length})</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {tasks.map((task: any) => (
                  <Badge key={task.id} variant="outline" className="text-xs">
                    {task.title}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Students and Assignment Matrix */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {students.map((student: any) => (
                <div key={student.id} className="border rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={student.image || undefined} />
                      <AvatarFallback>
                        {student.name?.charAt(0) || student.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium">{student.name || student.email}</h4>
                      <p className="text-sm text-muted-foreground">
                        {student.internshipTitle}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {selectedAssignments[student.id]?.length || 0} selected
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {tasks.map((task: any) => (
                      <div key={task.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${student.id}-${task.id}`}
                          checked={selectedAssignments[student.id]?.includes(task.id) || false}
                          onCheckedChange={(checked) => 
                            handleAssignmentChange(student.id, task.id, checked as boolean)
                          }
                        />
                        <label 
                          htmlFor={`${student.id}-${task.id}`}
                          className="text-sm font-medium cursor-pointer flex-1"
                        >
                          {task.title}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            {totalAssignments > 0 && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm font-medium">
                  {totalAssignments} assignment{totalAssignments !== 1 ? 's' : ''} selected
                </p>
              </div>
            )}
          </>
        )}

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || totalAssignments === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              `Assign ${totalAssignments} Task${totalAssignments !== 1 ? 's' : ''}`
            )}
          </Button>
        </div>
      </div>
    </BaseModal>
  )
}
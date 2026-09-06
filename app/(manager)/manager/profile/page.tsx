'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { User, Mail, Phone, Lock, Save, Edit2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ProfilePage() {
  const { data: session } = useSession()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(session?.user?.name ?? 'Andrew Rentz')
  const [phone, setPhone] = useState('(334) 750-2059')
  const [email] = useState(session?.user?.email ?? 'manager@parmerproperties.com')

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" description="Manage your account details and preferences">
        <Button
          variant="outline"
          onClick={() => setEditing(!editing)}
          className="flex items-center gap-2"
        >
          <Edit2 className="w-4 h-4" />
          {editing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar card */}
        <Card>
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-[#2D3561] flex items-center justify-center text-white text-3xl font-bold">
              {name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900 text-lg">{name}</p>
              <p className="text-sm text-gray-500">{email}</p>
              <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#2D3561]/10 text-[#2D3561]">
                Property Manager
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Details card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Full Name
                </label>
                {editing ? (
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3561]/20 focus:border-[#2D3561]"
                  />
                ) : (
                  <p className="text-sm text-gray-900 py-2">{name}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email Address
                </label>
                <p className="text-sm text-gray-500 py-2">{email}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Phone Number
                </label>
                {editing ? (
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3561]/20 focus:border-[#2D3561]"
                  />
                ) : (
                  <p className="text-sm text-gray-900 py-2">{phone}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Role
                </label>
                <p className="text-sm text-gray-900 py-2">Property Manager</p>
              </div>
            </div>

            {editing && (
              <div className="pt-2 flex justify-end">
                <Button
                  className="bg-[#2D3561] hover:bg-[#3d4780] text-white flex items-center gap-2"
                  onClick={() => setEditing(false)}
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Password card */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Security</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">Password</p>
                <p className="text-xs text-gray-500 mt-0.5">Last changed: Never</p>
              </div>
              <Button variant="outline" className="text-sm">
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

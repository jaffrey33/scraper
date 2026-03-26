'use client'

import { LogOut, UserRound } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from '@/context/authContext'
import Link from 'next/link'
function Header() {
  const {logout} = useAuth()
  return (
    <header className='p-4 bg-accent'>
      <div className='h-32' />
      <nav className='container xl:w-3/4 mx-auto flex justify-between items-center'>
        <div className='flex items-center gap-1'>
          <h1 className='text-2xl font-bold'>Property Management System</h1>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className='bg-muted text-accent-foreground hover:bg-muted/80'>
              <UserRound className='h-5 w-5' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuGroup>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem>
                <Link href="/profile" className='w-full'>
                Profile
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} >
                <LogOut />
                Sign out</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </header>
  )
}

export default Header
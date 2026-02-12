'use client'

import { UserRound } from 'lucide-react'
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
function Header() {
  const {logout} = useAuth()
  return (
    <header className='p-4 bg-accent'>
      <div className='h-32' />
      <nav className='container lg:w-3/5 mx-auto flex justify-between items-center'>
        <div className='flex items-center gap-1'>

          <h1 className='text-4xl font-bold'>Scraper</h1>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button >
              <UserRound className='h-5 w-5' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className='text-red-400 hover:text-red-500'>Logout</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </header>
  )
}

export default Header
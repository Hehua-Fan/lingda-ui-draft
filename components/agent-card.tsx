"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { MoreHorizontal, Trash2, Copy, Clock } from "lucide-react"

export interface Agent {
  id: string
  name: string
  description: string
  avatar?: string
  status: "published" | "draft" | "private"
  createdAt: Date
  updatedAt: Date
  category?: string
  industry?: "internet" | "finance" | "healthcare" | "education" | "entertainment" | "others"
}

interface AgentCardProps {
  agent: Agent
  onView?: (agent: Agent) => void
  onDelete?: (agent: Agent) => void
  onCopy?: (agent: Agent) => void
  onTimer?: (agent: Agent) => void
}

const getStatusLabel = (status: string) => {
  return status === "published" ? "已发布" : "未发布"
}

const getStatusStyle = (status: string) => {
  if (status === "published") {
    return {
      className: "bg-green-100 text-green-700",
      variant: "secondary" as const
    }
  } else {
    return {
      className: "bg-gray-100 text-gray-600",
      variant: "secondary" as const
    }
  }
}

export function AgentCard({ agent, onView, onDelete, onCopy, onTimer }: AgentCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // 防止点击菜单时触发卡片点击
    if ((e.target as HTMLElement).closest('[data-dropdown-trigger]')) {
      return
    }
    onView?.(agent)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(agent)
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCopy?.(agent)
  }

  const handleTimer = (e: React.MouseEvent) => {
    e.stopPropagation()
    onTimer?.(agent)
  }

  return (
    <Card 
      className="cursor-pointer h-full border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 bg-white"
      onClick={handleCardClick}
    >
      
      <CardContent className="p-5 h-full relative">
        <div className="space-y-3 h-full flex flex-col">
          {/* Header with Avatar, Name and Menu */}
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 shrink-0 shadow-lg rounded-md">
              {agent.avatar ? (
                <AvatarImage src={agent.avatar} alt={agent.name} className="rounded-md" />
              ) : (
                <AvatarFallback 
                  className="text-white text-sm font-bold rounded-md"
                  style={{ backgroundColor: '#2c80ff' }}
                >
                  {getInitials(agent.name)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm leading-5 line-clamp-1">
                {agent.name}
              </h3>
              {/* 行业标签 */}
              {agent.industry && (
                <div className="mt-2">
                  <Badge 
                    variant="secondary" 
                    className="text-xs"
                    style={{ backgroundColor: '#2c80ff20', color: '#2c80ff' }}
                  >
                    {agent.industry === "internet" && "互联网"}
                    {agent.industry === "finance" && "金融"}
                    {agent.industry === "healthcare" && "医疗"}
                    {agent.industry === "education" && "教育"}
                    {agent.industry === "entertainment" && "娱乐"}
                    {agent.industry === "others" && "其他"}
                  </Badge>
                </div>
              )}
            </div>
            
            {/* 右上角三个点菜单 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild data-dropdown-trigger>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-gray-100 shrink-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="right" className="w-28">
                <DropdownMenuItem onClick={handleCopy} className="text-sm">
                  <Copy className="h-4 w-4" />
                  复制
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleTimer} className="text-sm">
                  <Clock className="h-4 w-4" />
                  定时
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleDelete} 
                  className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed flex-1">
            {agent.description}
          </p>

          {/* Footer with Status and Time */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-200">
            <Badge 
              variant={getStatusStyle(agent.status).variant}
              className={cn(
                "text-xs font-medium",
                getStatusStyle(agent.status).className
              )}
            >
              {getStatusLabel(agent.status)}
            </Badge>
            
            <time className="text-xs text-muted-foreground font-medium">
              修改于 {format(agent.updatedAt, 'yyyy-MM-dd HH:mm:ss')}
            </time>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

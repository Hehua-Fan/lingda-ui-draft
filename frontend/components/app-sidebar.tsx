"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"
import {
  Search,
  User,
  BookOpen,
  Database,
  Wrench,
  Settings,
  BarChart3,
  ChevronDown,
  Plus,
  Bell,
  Key,
  Globe,
  Lock,
  LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface SidebarItem {
  id: string
  label: string
  icon: React.ElementType
  hasSubmenu?: boolean
}

const sidebarItems: SidebarItem[] = [
  { id: "discover", label: "发现智能体", icon: Search },
  { id: "my-agents", label: "我的智能体", icon: User },
  { id: "knowledge", label: "知识库", icon: BookOpen },
  { id: "database", label: "数据库", icon: Database },
  { id: "toolbox", label: "工具箱", icon: Wrench },
  { id: "mcp-management", label: "MCP管理", icon: Settings },
  { id: "dashboard", label: "数据看板", icon: BarChart3 },
  { id: "system-management", label: "系统管理", icon: Settings, hasSubmenu: true }
]

interface AppSidebarProps {
  className?: string
  isMobile?: boolean
  isOpen?: boolean
  onClose?: () => void
}

export function AppSidebar({ className, isMobile = false, isOpen = true, onClose }: AppSidebarProps) {
  const router = useRouter()
  const [activeItem, setActiveItem] = useState("my-agents")
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [activeSettingsTab, setActiveSettingsTab] = useState("api-key")

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  return (
    <div className={cn(
      "flex h-full w-64 flex-col",
      isMobile && "fixed inset-y-0 left-0 z-50 transition-transform duration-300",
      isMobile && !isOpen && "-translate-x-full",
      className
    )}>
      {/* Mobile backdrop */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar content */}
      <div className="relative z-50 flex h-full w-64 flex-col bg-white border-r border-gray-200 shadow-lg">
        {/* Header */}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={120}
              height={32}
              className="h-10 w-auto"
            />
          </div>
        </div>

        {/* Create Agent Button */}
        <div className="px-6 py-4">
          <Button 
            className="w-full shadow-lg transform transition-all duration-300 text-white hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: '#2c80ff' }}
            onClick={() => router.push('/agent')}
          >
            <Plus className="mr-2 h-4 w-4" />
            创建智能体
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-4">
          <nav className="space-y-2 py-4">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = activeItem === item.id
              const isExpanded = expandedItems.includes(item.id)

              return (
                <div key={item.id} className="animate-fade-in">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left font-medium transition-all duration-200 hover:bg-gray-100 cursor-pointer",
                      isActive && "bg-blue-50 text-blue-600 shadow-sm"
                    )}
                    onClick={() => {
                      setActiveItem(item.id)
                      if (item.hasSubmenu) {
                        toggleExpanded(item.id)
                      }
                      if (isMobile) {
                        onClose?.()
                      }
                    }}
                  >
                    <Icon className={cn(
                      "mr-3 h-4 w-4 transition-colors",
                      isActive && "text-blue-600"
                    )} />
                    <span className="flex-1">{item.label}</span>
                    {item.hasSubmenu && (
                      <ChevronDown 
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          isExpanded && "rotate-180"
                        )}
                      />
                    )}
                  </Button>
                  
                  {/* Submenu (if exists and expanded) */}
                  {item.hasSubmenu && isExpanded && (
                    <div className="ml-6 mt-1 space-y-1 animate-slide-up">
                      <Button variant="ghost" size="sm" className="w-full justify-start font-normal text-sm hover:bg-gray-50 cursor-pointer">
                        子菜单项 1
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start font-normal text-sm hover:bg-gray-50 cursor-pointer">
                        子菜单项 2
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </ScrollArea>
        
        {/* 底部用户信息区域 */}
        <div className="mt-auto p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full h-auto p-3 justify-start hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 w-full">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src="/avatar.jpeg" alt="Frank" />
                    <AvatarFallback 
                      className="text-white font-medium text-sm"
                      style={{ backgroundColor: '#2c80ff' }}
                    >
                      F
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900 truncate">Frank</p>
                    <Badge variant="secondary" className="text-xs mt-1">默认角色</Badge>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="start" 
              side="right"
              sideOffset={-20}
              className="w-56"
            >
                {/* 用户信息头部 */}
                <div className="flex items-center gap-3 p-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/avatar.jpeg" alt="Frank" />
                    <AvatarFallback 
                      className="text-white font-medium text-sm"
                      style={{ backgroundColor: '#2c80ff' }}
                    >
                      F
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">Frank</p>
                    <Badge variant="secondary" className="text-xs mt-1">默认角色</Badge>
                  </div>
                </div>
                
                <DropdownMenuSeparator />
                
                {/* 个人密钥 */}
                <DropdownMenuItem 
                  className="p-3 cursor-pointer"
                  onClick={() => {
                    setActiveSettingsTab("api-key")
                    setSettingsDialogOpen(true)
                  }}
                >
                  <Key className="mr-3 h-4 w-4" />
                  <span>个人密钥</span>
                </DropdownMenuItem>
                
                {/* 语言 */}
                <DropdownMenuItem 
                  className="p-3 cursor-pointer"
                  onClick={() => {
                    setActiveSettingsTab("language")
                    setSettingsDialogOpen(true)
                  }}
                >
                  <Globe className="mr-3 h-4 w-4" />
                  <span>语言</span>
                </DropdownMenuItem>
                
                {/* 产品更新动态 */}
                <DropdownMenuItem 
                  className="p-3 cursor-pointer"
                  onClick={() => {
                    window.open('https://example.com/product-updates', '_blank')
                    if (isMobile) {
                      onClose?.()
                    }
                  }}
                >
                  <Bell className="mr-3 h-4 w-4" />
                  <span>产品更新动态</span>
                </DropdownMenuItem>
                
                {/* 修改密码 */}
                <DropdownMenuItem 
                  className="p-3 cursor-pointer"
                  onClick={() => {
                    setActiveSettingsTab("change-password")
                    setSettingsDialogOpen(true)
                  }}
                >
                  <Lock className="mr-3 h-4 w-4" />
                  <span>修改密码</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* 退出登录 */}
                <DropdownMenuItem className="p-3 cursor-pointer">
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>退出登录</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 统一设置弹窗 */}
        <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
          <DialogContent className="sm:max-w-[800px] h-[600px] p-0">
            <div className="flex h-full">
              {/* 左侧导航 */}
              <div className="w-64 border-r border-gray-200 bg-gray-50 p-4">
                <DialogHeader className="pb-4">
                  <DialogTitle>设置</DialogTitle>
                </DialogHeader>
                <nav className="space-y-1">
                  <Button
                    variant={activeSettingsTab === "api-key" ? "secondary" : "ghost"}
                    className="w-full justify-start cursor-pointer"
                    onClick={() => setActiveSettingsTab("api-key")}
                  >
                    <Key className="mr-3 h-4 w-4" />
                    个人密钥
                  </Button>
                  <Button
                    variant={activeSettingsTab === "language" ? "secondary" : "ghost"}
                    className="w-full justify-start cursor-pointer"
                    onClick={() => setActiveSettingsTab("language")}
                  >
                    <Globe className="mr-3 h-4 w-4" />
                    语言设置
                  </Button>
                  <Button
                    variant={activeSettingsTab === "change-password" ? "secondary" : "ghost"}
                    className="w-full justify-start cursor-pointer"
                    onClick={() => setActiveSettingsTab("change-password")}
                  >
                    <Lock className="mr-3 h-4 w-4" />
                    修改密码
                  </Button>
                </nav>
              </div>

              {/* 右侧内容 */}
              <div className="flex-1 p-6 overflow-y-auto">
                {activeSettingsTab === "api-key" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">个人密钥</h3>
                      <p className="text-gray-600 mb-4">管理您的API密钥，用于访问平台服务。</p>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="font-medium text-sm">当前API密钥</p>
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono flex-1">
                            sk-***************************abc
                          </code>
                          <Button size="sm" variant="outline" className="cursor-pointer">复制</Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          出于安全考虑，只显示密钥的部分内容。
                        </p>
                      </div>
                      <div className="pt-4">
                        <Button variant="outline" className="cursor-pointer">重新生成密钥</Button>
                      </div>
                    </div>
                  </div>
                )}

                {activeSettingsTab === "language" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">语言设置</h3>
                      <p className="text-gray-600 mb-4">选择您偏好的界面语言。</p>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <input type="radio" id="zh" name="language" value="zh" defaultChecked className="w-4 h-4" />
                          <label htmlFor="zh" className="text-sm font-medium">简体中文</label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <input type="radio" id="en" name="language" value="en" className="w-4 h-4" />
                          <label htmlFor="en" className="text-sm font-medium">English</label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <input type="radio" id="ja" name="language" value="ja" className="w-4 h-4" />
                          <label htmlFor="ja" className="text-sm font-medium">日本語</label>
                        </div>
                      </div>
                      <div className="pt-4">
                        <Button style={{ backgroundColor: '#2c80ff' }} className="text-white cursor-pointer">
                          保存更改
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {activeSettingsTab === "change-password" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">修改密码</h3>
                      <p className="text-gray-600 mb-4">为了您的账户安全，请定期更新密码。</p>
                    </div>
                    <div className="space-y-4 max-w-md">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">当前密码</label>
                        <input type="password" className="w-full px-3 py-2 border border-gray-200 rounded-md" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">新密码</label>
                        <input type="password" className="w-full px-3 py-2 border border-gray-200 rounded-md" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">确认新密码</label>
                        <input type="password" className="w-full px-3 py-2 border border-gray-200 rounded-md" />
                      </div>
                      <div className="pt-4">
                        <Button className="w-full cursor-pointer" style={{ backgroundColor: '#2c80ff' }}>
                          确认修改
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination"
import { Search, Plus, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { AgentCard, type Agent } from "./agent-card"

// Mock data for demonstration
const mockAgents: Agent[] = [
  {
    id: "1",
    name: "AI Daily News Feishu",
    description: "飞书AI每日资讯机人 - AI信息翻译",
    status: "published",
    createdAt: new Date("2025-08-16T07:00:35Z"),
    updatedAt: new Date("2025-08-16T07:00:35Z"),
    category: "资讯",
    industry: "internet"
  },
  {
    id: "2", 
    name: "gpt-image-1",
    description: "文生图",
    status: "published",
    createdAt: new Date("2025-08-09T12:08:58Z"),
    updatedAt: new Date("2025-08-09T12:08:58Z"),
    category: "图像",
    industry: "internet"
  },
  {
    id: "3",
    name: "金融风控助手",
    description: "基于AI的智能风险控制和评估系统",
    status: "published", 
    createdAt: new Date("2025-08-08T19:35:06Z"),
    updatedAt: new Date("2025-08-08T19:35:06Z"),
    category: "风控",
    industry: "finance"
  },
  {
    id: "4",
    name: "投资分析专家",
    description: "专业的投资组合分析和市场预测工具",
    status: "published",
    createdAt: new Date("2025-08-03T02:02:51Z"),
    updatedAt: new Date("2025-08-03T02:02:51Z"),
    category: "投资",
    industry: "finance"
  },
  {
    id: "5",
    name: "Beta",
    description: "测试AutoWorkflow",
    status: "published",
    createdAt: new Date("2025-08-27T11:15:12Z"),
    updatedAt: new Date("2025-08-27T11:15:12Z"),
    category: "测试",
    industry: "others"
  },
  {
    id: "6",
    name: "AutoWorkflow", 
    description: "自动化编排工作流",
    status: "draft",
    createdAt: new Date("2025-07-31T22:20:09Z"),
    updatedAt: new Date("2025-07-31T22:20:09Z"),
    category: "工作流",
    industry: "internet"
  },
  {
    id: "7",
    name: "在线教育助手",
    description: "智能化教学内容生成和学习路径规划",
    status: "published",
    createdAt: new Date("2025-08-11T19:02:36Z"),
    updatedAt: new Date("2025-08-11T19:02:36Z"),
    category: "教育",
    industry: "education"
  },
  {
    id: "8",
    name: "医疗诊断助手",
    description: "辅助医生进行疾病诊断和治疗建议",
    status: "private",
    createdAt: new Date("2025-09-01T15:08:05Z"),
    updatedAt: new Date("2025-09-01T15:08:05Z"),
    category: "医疗",
    industry: "healthcare"
  },
  {
    id: "9",
    name: "银行客服机器人",
    description: "专业的银行业务咨询和客户服务智能体",
    status: "draft",
    createdAt: new Date("2025-07-31T22:20:09Z"),
    updatedAt: new Date("2025-07-31T22:20:09Z"),
    category: "客服",
    industry: "finance"
  },
  {
    id: "10",
    name: "娱乐内容创作",
    description: "创意内容生成和娱乐活动策划助手",
    status: "draft",
    createdAt: new Date("2025-09-01T15:08:05Z"),
    updatedAt: new Date("2025-09-01T15:08:05Z"),
    category: "创作",
    industry: "entertainment"
  },
  {
    id: "11",
    name: "健康管理助手",
    description: "个人健康数据分析和建议系统",
    status: "published",
    createdAt: new Date("2025-08-20T10:30:00Z"),
    updatedAt: new Date("2025-08-20T10:30:00Z"),
    category: "健康",
    industry: "healthcare"
  },
  {
    id: "12",
    name: "智能翻译器",
    description: "多语言实时翻译和语言学习辅助",
    status: "published",
    createdAt: new Date("2025-08-18T14:15:30Z"),
    updatedAt: new Date("2025-08-18T14:15:30Z"),
    category: "翻译",
    industry: "education"
  },
  {
    id: "13",
    name: "数据分析专家",
    description: "商业数据分析和可视化报告生成",
    status: "published",
    createdAt: new Date("2025-08-15T09:45:20Z"),
    updatedAt: new Date("2025-08-15T09:45:20Z"),
    category: "分析",
    industry: "internet"
  },
  {
    id: "14",
    name: "社交媒体管理",
    description: "自动化社交媒体内容发布和互动管理",
    status: "draft",
    createdAt: new Date("2025-08-12T16:20:10Z"),
    updatedAt: new Date("2025-08-12T16:20:10Z"),
    category: "营销",
    industry: "internet"
  },
  {
    id: "15",
    name: "法律咨询助手",
    description: "法律条文查询和初步法律建议提供",
    status: "published",
    createdAt: new Date("2025-08-10T11:30:45Z"),
    updatedAt: new Date("2025-08-10T11:30:45Z"),
    category: "法律",
    industry: "others"
  },
  {
    id: "16",
    name: "房产投资顾问",
    description: "房地产市场分析和投资建议系统",
    status: "published",
    createdAt: new Date("2025-08-08T13:50:25Z"),
    updatedAt: new Date("2025-08-08T13:50:25Z"),
    category: "投资",
    industry: "finance"
  },
  {
    id: "17",
    name: "营养膳食规划",
    description: "个性化营养计划和膳食推荐系统",
    status: "draft",
    createdAt: new Date("2025-08-05T08:25:35Z"),
    updatedAt: new Date("2025-08-05T08:25:35Z"),
    category: "营养",
    industry: "healthcare"
  },
  {
    id: "18",
    name: "创业项目评估",
    description: "创业项目可行性分析和商业计划助手",
    status: "published",
    createdAt: new Date("2025-08-03T15:40:15Z"),
    updatedAt: new Date("2025-08-03T15:40:15Z"),
    category: "创业",
    industry: "others"
  },
  {
    id: "19",
    name: "音乐创作工具",
    description: "AI辅助音乐创作和编曲系统",
    status: "published",
    createdAt: new Date("2025-08-01T12:15:50Z"),
    updatedAt: new Date("2025-08-01T12:15:50Z"),
    category: "音乐",
    industry: "entertainment"
  },
  {
    id: "20",
    name: "保险咨询顾问",
    description: "保险产品比较和个人保险规划建议",
    status: "draft",
    createdAt: new Date("2025-07-30T09:30:40Z"),
    updatedAt: new Date("2025-07-30T09:30:40Z"),
    category: "保险",
    industry: "finance"
  },
  {
    id: "21",
    name: "职业规划导师",
    description: "个人职业发展路径规划和建议系统",
    status: "published",
    createdAt: new Date("2025-07-28T14:20:30Z"),
    updatedAt: new Date("2025-07-28T14:20:30Z"),
    category: "职业",
    industry: "education"
  },
  {
    id: "22",
    name: "智能客服系统",
    description: "多渠道智能客户服务和问题解决",
    status: "published",
    createdAt: new Date("2025-07-25T10:45:15Z"),
    updatedAt: new Date("2025-07-25T10:45:15Z"),
    category: "客服",
    industry: "internet"
  },
  {
    id: "23",
    name: "税务筹划助手",
    description: "个人和企业税务优化建议系统",
    status: "draft",
    createdAt: new Date("2025-07-22T16:35:25Z"),
    updatedAt: new Date("2025-07-22T16:35:25Z"),
    category: "税务",
    industry: "finance"
  },
  {
    id: "24",
    name: "儿童教育顾问",
    description: "儿童学习能力评估和教育方案推荐",
    status: "published",
    createdAt: new Date("2025-07-20T11:20:40Z"),
    updatedAt: new Date("2025-07-20T11:20:40Z"),
    category: "教育",
    industry: "education"
  },
  {
    id: "25",
    name: "旅游规划师",
    description: "个性化旅游路线规划和预算管理",
    status: "published",
    createdAt: new Date("2025-07-18T13:15:55Z"),
    updatedAt: new Date("2025-07-18T13:15:55Z"),
    category: "旅游",
    industry: "entertainment"
  },
  {
    id: "26",
    name: "心理健康咨询",
    description: "心理健康评估和情感支持系统",
    status: "draft",
    createdAt: new Date("2025-07-15T09:50:20Z"),
    updatedAt: new Date("2025-07-15T09:50:20Z"),
    category: "心理",
    industry: "healthcare"
  },
  {
    id: "27",
    name: "企业管理顾问",
    description: "企业运营优化和管理策略建议",
    status: "published",
    createdAt: new Date("2025-07-12T15:30:10Z"),
    updatedAt: new Date("2025-07-12T15:30:10Z"),
    category: "管理",
    industry: "others"
  },
  {
    id: "28",
    name: "技术文档生成",
    description: "自动化技术文档编写和代码注释",
    status: "published",
    createdAt: new Date("2025-07-10T12:40:35Z"),
    updatedAt: new Date("2025-07-10T12:40:35Z"),
    category: "文档",
    industry: "internet"
  },
  {
    id: "29",
    name: "股票分析师",
    description: "股票市场分析和投资组合优化建议",
    status: "draft",
    createdAt: new Date("2025-07-08T08:25:45Z"),
    updatedAt: new Date("2025-07-08T08:25:45Z"),
    category: "股票",
    industry: "finance"
  },
  {
    id: "30",
    name: "美食推荐系统",
    description: "基于个人喜好的美食推荐和菜谱分享",
    status: "published",
    createdAt: new Date("2025-07-05T17:20:30Z"),
    updatedAt: new Date("2025-07-05T17:20:30Z"),
    category: "美食",
    industry: "entertainment"
  }
]

type OwnershipFilter = "all" | "my-created" | "authorized"
type StatusFilter = "all" | "published" | "draft" | "private"
type IndustryFilter = "all" | "internet" | "finance" | "healthcare" | "education" | "entertainment" | "others"

interface AgentsContentProps {
  className?: string
}

export function AgentsContent({ className }: AgentsContentProps) {
  const router = useRouter()
  const [ownershipFilter, setOwnershipFilter] = useState<OwnershipFilter>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [industryFilter, setIndustryFilter] = useState<IndustryFilter>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  
  const itemsPerPage = 15 // 3行5列

  const filteredAgents = mockAgents.filter(agent => {
    const matchesOwnership = ownershipFilter === "all" || 
      (ownershipFilter === "my-created") || 
      (ownershipFilter === "authorized")
    const matchesStatus = statusFilter === "all" || agent.status === statusFilter
    const matchesIndustry = industryFilter === "all" || agent.industry === industryFilter
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesOwnership && matchesStatus && matchesIndustry && matchesSearch
  })

  // 分页计算
  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedAgents = filteredAgents.slice(startIndex, endIndex)

  // 当筛选条件改变时重置到第一页
  const handleFilterChange = (callback: () => void) => {
    callback()
    setCurrentPage(1)
  }

  const handleAgentView = (agent: Agent) => {
    console.log("Viewing agent:", agent)
    // Handle agent view action
  }

  const handleAgentDelete = (agent: Agent) => {
    console.log("Deleting agent:", agent)
    // TODO: 实现删除逻辑
    // 这里可以添加确认对话框和删除API调用
  }

  const handleAgentCopy = (agent: Agent) => {
    console.log("Copying agent:", agent)
    // TODO: 实现复制逻辑
    // 这里可以复制智能体配置或创建副本
  }

  const handleAgentTimer = (agent: Agent) => {
    console.log("Setting timer for agent:", agent)
    // TODO: 实现定时功能
    // 这里可以打开定时设置对话框或调用定时API
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* 页面标题和介绍 */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">我的智能体</h1>
          <p className="text-gray-600">管理和查看您创建的所有智能体</p>
        </div>

        {/* 筛选和搜索行 */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
          {/* 左侧：搜索框 */}
          <div className="relative w-full lg:w-80 lg:flex-shrink-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                              <Input
                    placeholder="搜索智能体..."
                    value={searchQuery}
                    onChange={(e) => handleFilterChange(() => setSearchQuery(e.target.value))}
                    className="pl-10 h-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
                  />
          </div>

          {/* 右侧：筛选器和漏斗图标 */}
          <div className="flex items-center gap-3 lg:ml-auto">
                              {/* 来源筛选 */}
                  <Select value={ownershipFilter} onValueChange={(value: OwnershipFilter) => handleFilterChange(() => setOwnershipFilter(value))}>
                    <SelectTrigger className="w-[130px] h-10 flex-shrink-0 bg-white border-gray-200">
                      <SelectValue placeholder="来源" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部来源</SelectItem>
                      <SelectItem value="my-created">我创建的</SelectItem>
                      <SelectItem value="authorized">授权给我的</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* 状态筛选 */}
                  <Select value={statusFilter} onValueChange={(value: StatusFilter) => handleFilterChange(() => setStatusFilter(value))}>
                    <SelectTrigger className="w-[130px] h-10 flex-shrink-0 bg-white border-gray-200">
                      <SelectValue placeholder="状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="published">已发布</SelectItem>
                      <SelectItem value="draft">未发布</SelectItem>

                    </SelectContent>
                  </Select>

                  {/* 行业筛选 */}
                  <Select value={industryFilter} onValueChange={(value: IndustryFilter) => handleFilterChange(() => setIndustryFilter(value))}>
                    <SelectTrigger className="w-[130px] h-10 flex-shrink-0 bg-white border-gray-200">
                      <SelectValue placeholder="行业" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部行业</SelectItem>
                      <SelectItem value="internet">互联网</SelectItem>
                      <SelectItem value="finance">金融</SelectItem>
                      <SelectItem value="healthcare">医疗</SelectItem>
                      <SelectItem value="education">教育</SelectItem>
                      <SelectItem value="entertainment">娱乐</SelectItem>
                      <SelectItem value="others">其他</SelectItem>
                    </SelectContent>
                  </Select>

            {/* 筛选图标 */}
            <div className="flex items-center justify-center w-10 h-10 rounded-md border border-gray-200 bg-white">
              <Filter className="h-4 w-4 text-gray-500" />
            </div>
          </div>
        </div>

        {/* 智能体网格 */}
        <div>
          {paginatedAgents.length > 0 ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {paginatedAgents.map((agent) => (
                <AgentCard 
                  key={agent.id}
                  agent={agent}
                  onView={handleAgentView}
                  onDelete={handleAgentDelete}
                  onCopy={handleAgentCopy}
                  onTimer={handleAgentTimer}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-20">
              <div className="max-w-lg mx-auto">
                <div 
                  className="w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#2c80ff20' }}
                >
                  <Search className="w-10 h-10" style={{ color: '#2c80ff' }} />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {searchQuery ? "未找到匹配的智能体" : "暂无智能体"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery 
                    ? "尝试使用其他关键词搜索，或调整过滤条件" 
                    : "创建您的第一个智能体，开始探索AI的无限可能"
                  }
                </p>
                {!searchQuery && (
                  <Button 
                    className="shadow-lg text-white hover:opacity-90 transition-opacity cursor-pointer"
                    style={{ backgroundColor: '#2c80ff' }}
                    onClick={() => router.push('/agent')}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    创建智能体
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 分页控件 */}
        {filteredAgents.length > 0 && totalPages > 1 && (
          <div className="flex justify-center mt-10">
            <Pagination>
              <PaginationContent>
                <PaginationItem className="mr-5">
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) {
                        setCurrentPage(currentPage - 1)
                      }
                    }}
                    className={`gap-1 px-2.5 cursor-pointer ${currentPage <= 1 ? "pointer-events-none opacity-50" : ""}`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:block">上一页</span>
                  </PaginationLink>
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage(page)
                      }}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem className="ml-5">
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) {
                        setCurrentPage(currentPage + 1)
                      }
                    }}
                    className={`gap-1 px-2.5 cursor-pointer ${currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}`}
                  >
                    <span className="hidden sm:block">下一页</span>
                    <ChevronRight className="h-4 w-4" />
                  </PaginationLink>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  )
}

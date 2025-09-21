'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Edit3,
  FileText,
  Globe,
  GitBranch,
  Save,
  Share2,
  Clock,
  MessageSquare,
  Webhook,
  Server,
  Calendar,
  Camera,
  Upload,
  Plus,
  X as XIcon,
} from 'lucide-react';

interface AgentHeaderProps {
  agentName?: string;
  agentAvatar?: string;
  lastSaved?: string;
  onSave?: () => void;
  onPublish?: () => void;
}

export default function AgentHeader({
  agentName = "智能客服助手",
  agentAvatar = "/avatar.jpeg",
  lastSaved = "08-21 15:35:08",
  onSave,
  onPublish,
}: AgentHeaderProps) {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isEnvOpen, setIsEnvOpen] = useState(false);
  const [isVersionOpen, setIsVersionOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);

  // 智能体名片设置状态
  const [profileData, setProfileData] = useState({
    avatar: agentAvatar,
    name: agentName,
    description: "专业的客服智能体，能够处理常见客户咨询，提供7x24小时服务。",
    category: "客服",
    conversationBackground: "您正在与专业的智能客服助手交流，我具备丰富的客户服务经验，能够帮助您解决各种问题。我会以耐心、专业、友好的态度为您提供服务。",
    greeting: "你好！我是智能客服助手，很高兴为您服务。有什么可以帮助您的吗？",
  });

  // 环境变量状态
  const [envVars, setEnvVars] = useState([
    { key: "API_KEY", value: "sk-****************************", description: "OpenAI API Key" },
    { key: "DATABASE_URL", value: "postgresql://****", description: "数据库连接地址" },
  ]);

  // 版本历史状态
  const [versions] = useState([
    { version: "v1.2.3", date: "2024-08-21 15:35:08", author: "张三", description: "优化对话逻辑，增加情感识别" },
    { version: "v1.2.2", date: "2024-08-20 14:22:15", author: "李四", description: "修复知识库检索bug" },
    { version: "v1.2.1", date: "2024-08-19 09:18:30", author: "王五", description: "初始版本发布" },
  ]);

  const addEnvVar = () => {
    setEnvVars([...envVars, { key: "", value: "", description: "" }]);
  };



  return (
    <div className="flex items-center justify-between px-4 py-2 bg-background border-b">
      {/* 左侧：返回按钮和智能体信息 */}
      <div className="flex items-center gap-3">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/')}
          className="h-8 w-8 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <Avatar className="h-8 w-8">
          <AvatarImage src={agentAvatar} alt={agentName} />
          <AvatarFallback className="text-sm">{agentName.slice(0, 2)}</AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold">{agentName}</h2>
            {/* 名片编辑按钮 */}
            <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 cursor-pointer">
                  <Edit3 className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>智能体名片</DialogTitle>
                  <DialogDescription>
                    配置智能体的基本信息和设置
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* 1. 头像 */}
                  <div className="space-y-3">
                    <Label>头像</Label>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={profileData.avatar} alt={profileData.name} />
                        <AvatarFallback className="text-lg">{profileData.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-1" />
                          上传头像
                        </Button>
                        <Button variant="outline" size="sm">
                          <Camera className="h-4 w-4 mr-1" />
                          拍照
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* 2. 智能体名称 */}
                  <div className="space-y-2">
                    <Label htmlFor="agent-name">智能体名称</Label>
                    <Input
                      id="agent-name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      placeholder="请输入智能体名称"
                    />
                  </div>

                  {/* 3. 描述 */}
                  <div className="space-y-2">
                    <Label htmlFor="agent-description">智能体描述</Label>
                    <Textarea
                      id="agent-description"
                      value={profileData.description}
                      onChange={(e) => setProfileData({...profileData, description: e.target.value})}
                      placeholder="请输入智能体功能描述"
                      rows={3}
                    />
                  </div>

                  {/* 4. 分类 */}
                  <div className="space-y-2">
                    <Label htmlFor="agent-category">分类</Label>
                    <Select 
                      value={profileData.category} 
                      onValueChange={(value) => setProfileData({...profileData, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择智能体分类" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="客服">客服</SelectItem>
                        <SelectItem value="销售">销售</SelectItem>
                        <SelectItem value="教育">教育</SelectItem>
                        <SelectItem value="医疗">医疗</SelectItem>
                        <SelectItem value="金融">金融</SelectItem>
                        <SelectItem value="娱乐">娱乐</SelectItem>
                        <SelectItem value="工具">工具</SelectItem>
                        <SelectItem value="助手">助手</SelectItem>
                        <SelectItem value="分析">分析</SelectItem>
                        <SelectItem value="创作">创作</SelectItem>
                        <SelectItem value="其他">其他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 5. 对话背景 */}
                  <div className="space-y-2">
                    <Label htmlFor="conversation-background">对话背景</Label>
                    <Textarea
                      id="conversation-background"
                      value={profileData.conversationBackground}
                      onChange={(e) => setProfileData({...profileData, conversationBackground: e.target.value})}
                      placeholder="请描述智能体的角色背景和专业领域"
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      对话背景将帮助智能体更好地理解自己的角色定位和专业能力
                    </p>
                  </div>

                  {/* 6. 开场白 */}
                  <div className="space-y-2">
                    <Label htmlFor="agent-greeting">开场白</Label>
                    <Textarea
                      id="agent-greeting"
                      value={profileData.greeting}
                      onChange={(e) => setProfileData({...profileData, greeting: e.target.value})}
                      placeholder="请输入开场白内容"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      开场白是用户与智能体首次交互时显示的欢迎消息
                    </p>
                  </div>
                </div>
                
                <DialogFooter className="mt-6">
                  <Button variant="outline" onClick={() => setIsProfileOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={() => setIsProfileOpen(false)}>
                    保存设置
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>保存于 {lastSaved}</span>
          </div>
        </div>
      </div>

      {/* 右侧：功能按钮 */}
      <div className="flex items-center gap-1">

        {/* 工作流可解释性报告 */}
        <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4" />
              可解释性报告
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>工作流可解释性报告</DialogTitle>
              <DialogDescription>
                分析当前工作流的逻辑结构和执行路径
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* 工作流概览 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">工作流概览</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">5</div>
                    <div className="text-sm text-muted-foreground">节点总数</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">3</div>
                    <div className="text-sm text-muted-foreground">执行路径</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">2.3s</div>
                    <div className="text-sm text-muted-foreground">平均执行时间</div>
                  </div>
                </div>
              </div>

              {/* 节点分析 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">节点分析</h3>
                <div className="space-y-3">
                  {[
                    { name: "输入节点", type: "输入", description: "接收用户消息，进行初步处理", usage: "100%" },
                    { name: "意图识别", type: "处理", description: "使用NLP模型识别用户意图", usage: "98%" },
                    { name: "知识检索", type: "处理", description: "从知识库中检索相关信息", usage: "85%" },
                    { name: "回复生成", type: "处理", description: "基于检索结果生成回复", usage: "95%" },
                    { name: "输出节点", type: "输出", description: "返回最终回复给用户", usage: "100%" },
                  ].map((node, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{node.type}</Badge>
                          <span className="font-medium">{node.name}</span>
                        </div>
                        <Badge variant="secondary">{node.usage}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{node.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={() => setIsReportOpen(false)}>关闭</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 环境变量 */}
        <>
          <Button variant="outline" size="sm" onClick={() => setIsEnvOpen(true)} className="cursor-pointer">
            <Globe className="h-4 w-4" />
            环境变量
          </Button>
          
          {isEnvOpen && (
            <div className="fixed top-[60px] right-4 h-[calc(100vh-68px)] w-[350px] bg-white rounded-xl shadow-xl z-50 flex flex-col animate-in slide-in-from-right duration-300 border border-gray-200">
              {/* 关闭按钮 */}
              <button
                onClick={() => setIsEnvOpen(false)}
                className="absolute top-4 right-4 rounded-full p-1 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <XIcon className="h-4 w-4 text-gray-500" />
                <span className="sr-only">关闭</span>
              </button>
              
              {/* 标题区域 */}
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">环境变量</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  环境变量是一种存储敏感信息的方法，如 API 密钥、数据库密码等。它们被存储在工作流程中，而不是代码中，以便在不同环境中共享。
                </p>
              </div>
            
              {/* 内容区域 */}
              <div className="flex-1 p-6">
                {/* 添加环境变量按钮 - 左对齐且更小 */}
                <Button 
                  onClick={addEnvVar} 
                  className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  添加环境变量
                </Button>
              </div>
            </div>
          )}
        </>

        {/* 版本管理 */}
        <Dialog open={isVersionOpen} onOpenChange={setIsVersionOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <GitBranch className="h-4 w-4" />
              版本管理
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>版本管理</DialogTitle>
              <DialogDescription>
                查看和管理智能体的版本历史
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {versions.map((version, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        {version.version}
                      </Badge>
                      {index === 0 && <Badge variant="outline">当前版本</Badge>}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {version.date}
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium">{version.description}</p>
                    <p className="text-xs text-muted-foreground">作者: {version.author}</p>
                  </div>
                  {index !== 0 && (
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" size="sm">
                        回滚到此版本
                      </Button>
                      <Button variant="outline" size="sm">
                        查看变更
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <DialogFooter>
              <Button onClick={() => setIsVersionOpen(false)}>关闭</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Separator orientation="vertical" className="h-6" />

        {/* 保存按钮 */}
        <Button variant="outline" size="sm" onClick={onSave} className="cursor-pointer">
          <Save className="h-4 w-4" />
          保存
        </Button>

        {/* 发布按钮 */}
        <Dialog open={isPublishOpen} onOpenChange={setIsPublishOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
              <Share2 className="h-4 w-4" />
              发布
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>发布智能体</DialogTitle>
              <DialogDescription>
                选择发布方式，让你的智能体为更多用户服务
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="workplace" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="workplace" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  工作平台调用
                </TabsTrigger>
                <TabsTrigger value="external" className="flex items-center gap-2">
                  <Webhook className="h-4 w-4" />
                  外部平台调用
                </TabsTrigger>
                <TabsTrigger value="agent" className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  智能体调用
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="workplace" className="space-y-4 mt-6">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    发布至企业协作平台，作为消息机器人为团队服务
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <Button variant="outline" className="h-20 flex flex-col gap-2 hover:bg-blue-50">
                      <div className="text-2xl">🕊️</div>
                      <span className="text-sm font-medium">飞书</span>
                      <span className="text-xs text-muted-foreground">Feishu Bot</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-2 hover:bg-green-50">
                      <div className="text-2xl">💼</div>
                      <span className="text-sm font-medium">企微</span>
                      <span className="text-xs text-muted-foreground">WeWork Bot</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-2 hover:bg-orange-50">
                      <div className="text-2xl">📱</div>
                      <span className="text-sm font-medium">钉钉</span>
                      <span className="text-xs text-muted-foreground">DingTalk Bot</span>
                    </Button>
                  </div>
                  <div className="mt-6 space-y-3">
                    <h4 className="font-medium">配置说明</h4>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>• 点击对应平台按钮后，系统将生成专用的 Webhook URL</p>
                      <p>• 需要在对应平台的机器人管理页面配置 Webhook 地址</p>
                      <p>• 机器人将自动响应 @消息和私聊消息</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="external" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    生成 REST API 接口，让外部系统可以调用你的智能体
                  </p>
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">REST API Endpoint</p>
                          <code className="text-sm text-muted-foreground bg-background px-2 py-1 rounded">
                            https://api.lingda.ai/v1/agents/{agentName.toLowerCase().replace(/\s+/g, '-')}
                          </code>
                        </div>
                        <Button variant="outline" size="sm">
                          复制链接
                        </Button>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">API Key</p>
                          <code className="text-sm text-muted-foreground bg-background px-2 py-1 rounded">
                            sk-****************************
                          </code>
                        </div>
                        <Button variant="outline" size="sm">
                          生成新密钥
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium">调用示例</h4>
                    <div className="bg-background border rounded-lg p-4">
                      <pre className="text-sm overflow-x-auto">
{`curl -X POST "https://api.lingda.ai/v1/agents/${agentName.toLowerCase().replace(/\s+/g, '-')}/chat" \\
  -H "Authorization: Bearer sk-****************************" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "你好，我需要帮助",
    "session_id": "user123"
  }'`}
                      </pre>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="agent" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    发布为 MCP (Model Context Protocol) Server，让其他智能体可以调用当前智能体的能力
                  </p>
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">MCP Server URL</p>
                          <code className="text-sm text-muted-foreground bg-background px-2 py-1 rounded">
                            mcp://lingda.ai:3001/{agentName.toLowerCase().replace(/\s+/g, '-')}
                          </code>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            启动服务
                          </Button>
                          <Button variant="outline" size="sm">
                            复制配置
                          </Button>
                        </div>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium mb-1">服务状态</p>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-muted-foreground">运行中</span>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium mb-1">可用工具</p>
                          <p className="text-muted-foreground">3 个工具函数</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium">工具清单</h4>
                    <div className="space-y-2">
                      {[
                        { name: "chat", description: "与智能体进行对话交互" },
                        { name: "get_context", description: "获取智能体的上下文信息" },
                        { name: "get_capabilities", description: "查询智能体的能力列表" },
                      ].map((tool, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <code className="font-medium">{tool.name}</code>
                            <p className="text-sm text-muted-foreground">{tool.description}</p>
                          </div>
                          <Badge variant="outline">函数</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsPublishOpen(false)}>
                取消
              </Button>
              <Button onClick={() => {
                setIsPublishOpen(false);
                onPublish?.();
              }}>
                确认发布
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

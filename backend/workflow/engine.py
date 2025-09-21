"""
工作流执行引擎
负责解析工作流定义，管理节点执行顺序，处理浏览器会话
"""

import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Optional, Set
from playwright.async_api import async_playwright, Browser, Page

from models.workflow import WorkflowDefinition, ExecutionResult, StepResult
from nodes.base import ExecutionContext
from nodes import node_registry

logger = logging.getLogger(__name__)


class WorkflowEngine:
    """工作流执行引擎"""
    
    def __init__(self):
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None
        self.playwright = None
    
    async def execute(self, workflow: WorkflowDefinition) -> ExecutionResult:
        """
        执行工作流
        
        Args:
            workflow: 工作流定义
            
        Returns:
            ExecutionResult: 执行结果
        """
        start_time = datetime.now()
        execution_result = ExecutionResult(
            execution_id="",  # 将在main.py中设置
            workflow_id=workflow.workflow_id,
            status="running",
            start_time=start_time,
            steps=[]
        )
        
        try:
            # 启动浏览器
            await self._start_browser()
            
            # 创建执行上下文
            context = ExecutionContext(self.browser, self.page)
            
            # 构建执行图
            execution_graph = self._build_execution_graph(workflow)
            
            # 找到开始节点
            start_nodes = self._find_start_nodes(workflow, execution_graph)
            
            if not start_nodes:
                raise ValueError("未找到开始节点")
            
            # 执行工作流
            await self._execute_nodes(
                workflow, 
                execution_graph, 
                start_nodes, 
                context, 
                execution_result
            )
            
            execution_result.status = "completed"
            logger.info(f"工作流执行完成: {workflow.workflow_id}")
            
        except Exception as e:
            logger.error(f"工作流执行失败: {workflow.workflow_id}, 错误: {str(e)}")
            execution_result.status = "failed"
            execution_result.error = str(e)
        
        finally:
            # 关闭浏览器
            await self._stop_browser()
            
            execution_result.end_time = datetime.now()
            if execution_result.start_time and execution_result.end_time:
                execution_result.total_duration = (
                    execution_result.end_time - execution_result.start_time
                ).total_seconds()
        
        return execution_result
    
    async def _start_browser(self):
        """启动浏览器"""
        self.playwright = await async_playwright().start()
        
        # 启动浏览器（可配置为headless或有界面模式）
        self.browser = await self.playwright.chromium.launch(
            headless=False,  # 设为False可以看到浏览器界面，调试时很有用
            args=[
                '--no-sandbox',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled',
                '--disable-web-security'
            ]
        )
        
        # 创建新页面
        self.page = await self.browser.new_page()
        
        # 设置用户代理，避免被检测为bot
        await self.page.set_extra_http_headers({
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
        })
        
        # 设置视口大小
        await self.page.set_viewport_size({"width": 1920, "height": 1080})
        
        logger.info("浏览器启动成功")
    
    async def _stop_browser(self):
        """关闭浏览器"""
        if self.page:
            await self.page.close()
            self.page = None
        
        if self.browser:
            await self.browser.close()
            self.browser = None
        
        if self.playwright:
            await self.playwright.stop()
            self.playwright = None
        
        logger.info("浏览器已关闭")
    
    def _build_execution_graph(self, workflow: WorkflowDefinition) -> Dict[str, List[str]]:
        """
        构建执行图 - 节点ID到其后继节点ID列表的映射
        
        Args:
            workflow: 工作流定义
            
        Returns:
            Dict[str, List[str]]: 执行图
        """
        graph = {}
        
        # 初始化所有节点
        for node in workflow.nodes:
            graph[node.id] = []
        
        # 根据边构建图
        for edge in workflow.edges:
            if edge.source in graph:
                graph[edge.source].append(edge.target)
        
        return graph
    
    def _find_start_nodes(self, workflow: WorkflowDefinition, graph: Dict[str, List[str]]) -> List[str]:
        """
        找到开始节点（没有入边的节点或类型为start的节点）
        
        Args:
            workflow: 工作流定义
            graph: 执行图
            
        Returns:
            List[str]: 开始节点ID列表
        """
        # 找到所有有入边的节点
        nodes_with_incoming = set()
        for edge in workflow.edges:
            nodes_with_incoming.add(edge.target)
        
        # 开始节点：没有入边的节点或者类型为start的节点
        start_nodes = []
        for node in workflow.nodes:
            if (node.id not in nodes_with_incoming or 
                node.data.nodeType.value == "start"):
                start_nodes.append(node.id)
        
        return start_nodes
    
    async def _execute_nodes(self, 
                           workflow: WorkflowDefinition,
                           graph: Dict[str, List[str]], 
                           current_nodes: List[str],
                           context: ExecutionContext,
                           execution_result: ExecutionResult):
        """
        递归执行节点
        
        Args:
            workflow: 工作流定义
            graph: 执行图
            current_nodes: 当前要执行的节点ID列表
            context: 执行上下文
            execution_result: 执行结果对象
        """
        if not current_nodes:
            return
        
        # 并行执行当前层的所有节点
        tasks = []
        for node_id in current_nodes:
            task = self._execute_single_node(workflow, node_id, context)
            tasks.append(task)
        
        # 等待所有节点执行完成
        step_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 处理执行结果
        next_nodes = set()
        for i, result in enumerate(step_results):
            node_id = current_nodes[i]
            
            if isinstance(result, Exception):
                # 节点执行出错
                error_result = StepResult(
                    node_id=node_id,
                    node_type=self._get_node_type(workflow, node_id),
                    status="failed",
                    start_time=datetime.now(),
                    end_time=datetime.now(),
                    error=str(result)
                )
                execution_result.steps.append(error_result)
                logger.error(f"节点执行异常: {node_id}, 错误: {result}")
                
                # 出错时不继续执行后续节点
                continue
            else:
                # 节点执行成功
                execution_result.steps.append(result)
                
                if result.status == "success":
                    # 添加后续节点到执行队列
                    next_nodes.update(graph.get(node_id, []))
        
        # 递归执行下一层节点
        if next_nodes:
            await self._execute_nodes(
                workflow, 
                graph, 
                list(next_nodes), 
                context, 
                execution_result
            )
    
    async def _execute_single_node(self, 
                                 workflow: WorkflowDefinition, 
                                 node_id: str,
                                 context: ExecutionContext) -> StepResult:
        """
        执行单个节点
        
        Args:
            workflow: 工作流定义
            node_id: 节点ID
            context: 执行上下文
            
        Returns:
            StepResult: 节点执行结果
        """
        # 找到节点定义
        node_def = None
        for node in workflow.nodes:
            if node.id == node_id:
                node_def = node
                break
        
        if not node_def:
            raise ValueError(f"未找到节点定义: {node_id}")
        
        # 获取节点类型
        node_type = node_def.data.nodeType.value
        
        # 跳过注释节点
        if node_type == "comment":
            return StepResult(
                node_id=node_id,
                node_type=node_def.data.nodeType,
                status="skipped",
                start_time=datetime.now(),
                end_time=datetime.now(),
                result_data={"message": "注释节点已跳过"}
            )
        
        # 获取节点类
        if node_type not in node_registry:
            raise ValueError(f"不支持的节点类型: {node_type}")
        
        node_class = node_registry[node_type]
        
        # 创建节点实例
        node_instance = node_class(node_id, node_def.data.params)
        
        # 执行节点
        return await node_instance.safe_execute(context)
    
    def _get_node_type(self, workflow: WorkflowDefinition, node_id: str):
        """获取节点类型"""
        for node in workflow.nodes:
            if node.id == node_id:
                return node.data.nodeType
        return None

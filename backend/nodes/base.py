"""
节点基类
定义所有节点的通用接口和基础功能
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from playwright.async_api import Page, Browser
from datetime import datetime
import logging

from models.workflow import StepResult, NodeType

logger = logging.getLogger(__name__)


class ExecutionContext:
    """执行上下文 - 在节点间传递数据和状态"""
    
    def __init__(self, browser: Browser, page: Page):
        self.browser = browser
        self.page = page
        self.variables: Dict[str, Any] = {}  # 存储变量
        self.extracted_data: List[Dict[str, Any]] = []  # 存储提取的数据
        self.loop_counters: Dict[str, int] = {}  # 循环计数器
        self.screenshots_dir = "screenshots"
        
    def set_variable(self, name: str, value: Any):
        """设置变量"""
        self.variables[name] = value
        
    def get_variable(self, name: str, default: Any = None) -> Any:
        """获取变量"""
        return self.variables.get(name, default)
        
    def add_extracted_data(self, data: Dict[str, Any]):
        """添加提取的数据"""
        self.extracted_data.append(data)


class BaseNode(ABC):
    """节点基类"""
    
    # 子类需要设置的属性
    node_type: NodeType = None
    display_name: str = ""
    description: str = ""
    required_params: List[str] = []
    optional_params: List[str] = []
    
    def __init__(self, node_id: str, params: Dict[str, Any]):
        self.node_id = node_id
        self.params = params
        self._validate_params()
    
    def _validate_params(self):
        """验证参数"""
        missing_params = []
        for param in self.required_params:
            if param not in self.params:
                missing_params.append(param)
        
        if missing_params:
            raise ValueError(f"节点 {self.node_id} 缺少必需参数: {missing_params}")
    
    @abstractmethod
    async def execute(self, context: ExecutionContext) -> StepResult:
        """
        执行节点逻辑
        
        Args:
            context: 执行上下文
            
        Returns:
            StepResult: 执行结果
        """
        pass
    
    async def take_screenshot(self, context: ExecutionContext, suffix: str = "") -> Optional[str]:
        """截图"""
        try:
            import os
            os.makedirs(context.screenshots_dir, exist_ok=True)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{self.node_id}_{timestamp}{suffix}.png"
            path = os.path.join(context.screenshots_dir, filename)
            
            await context.page.screenshot(path=path, full_page=True)
            return path
        except Exception as e:
            logger.warning(f"截图失败: {e}")
            return None
    
    def create_step_result(self, 
                          status: str,
                          start_time: datetime,
                          end_time: Optional[datetime] = None,
                          result_data: Optional[Dict[str, Any]] = None,
                          error: Optional[str] = None,
                          screenshot_path: Optional[str] = None) -> StepResult:
        """创建步骤结果"""
        return StepResult(
            node_id=self.node_id,
            node_type=self.node_type,
            status=status,
            start_time=start_time,
            end_time=end_time or datetime.now(),
            result_data=result_data,
            error=error,
            screenshot_path=screenshot_path
        )
    
    async def safe_execute(self, context: ExecutionContext) -> StepResult:
        """安全执行节点 - 包含错误处理"""
        start_time = datetime.now()
        screenshot_path = None
        
        try:
            logger.info(f"开始执行节点: {self.node_id} ({self.node_type})")
            
            # 执行前截图
            screenshot_path = await self.take_screenshot(context, "_before")
            
            # 执行节点逻辑
            result = await self.execute(context)
            
            # 执行后截图
            if result.status == "success":
                await self.take_screenshot(context, "_after")
            
            logger.info(f"节点执行成功: {self.node_id}")
            return result
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f"节点执行失败: {self.node_id}, 错误: {error_msg}")
            
            # 错误时截图
            await self.take_screenshot(context, "_error")
            
            return self.create_step_result(
                status="failed",
                start_time=start_time,
                error=error_msg,
                screenshot_path=screenshot_path
            )

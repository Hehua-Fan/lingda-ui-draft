"""
控制流节点实现
包含开始、结束等流程控制节点
"""

from datetime import datetime
from .base import BaseNode, ExecutionContext
from models.workflow import NodeType, StepResult


class StartNode(BaseNode):
    """开始节点"""
    
    node_type = NodeType.START
    display_name = "开始"
    description = "工作流开始节点"
    required_params = []
    optional_params = []
    
    async def execute(self, context: ExecutionContext) -> StepResult:
        start_time = datetime.now()
        
        # 初始化一些基础变量
        context.set_variable("start_time", start_time.isoformat())
        context.set_variable("page_url", context.page.url)
        
        return self.create_step_result(
            status="success",
            start_time=start_time,
            result_data={
                "message": "工作流已开始",
                "initial_url": context.page.url
            }
        )


class EndNode(BaseNode):
    """结束节点"""
    
    node_type = NodeType.END
    display_name = "结束"
    description = "工作流结束节点"
    required_params = []
    optional_params = []
    
    async def execute(self, context: ExecutionContext) -> StepResult:
        start_time = datetime.now()
        
        # 计算总执行时间
        start_time_str = context.get_variable("start_time")
        if start_time_str:
            start_dt = datetime.fromisoformat(start_time_str)
            total_duration = (start_time - start_dt).total_seconds()
        else:
            total_duration = 0
        
        return self.create_step_result(
            status="success",
            start_time=start_time,
            result_data={
                "message": "工作流已完成",
                "total_duration": total_duration,
                "total_extracted_data": len(context.extracted_data),
                "final_url": context.page.url,
                "variables_count": len(context.variables)
            }
        )

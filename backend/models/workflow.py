"""
工作流相关数据模型
定义工作流、节点、执行结果等数据结构
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Union
from datetime import datetime
from enum import Enum


class NodeType(str, Enum):
    """节点类型枚举"""
    VISIT_PAGE = "visit_page"
    CLICK_ELEMENT = "click_element" 
    INPUT_TEXT = "input_text"
    SCROLL_PAGE = "scroll_page"
    PAGINATION = "pagination"
    WAIT = "wait"
    LOOP = "loop"
    EXTRACT_DATA = "extract_data"
    START = "start"
    END = "end"
    COMMENT = "comment"


class NodeData(BaseModel):
    """节点数据"""
    label: str
    description: Optional[str] = ""
    nodeType: NodeType
    # 节点参数 - 根据不同节点类型会有不同的参数
    params: Dict[str, Any] = Field(default_factory=dict)


class WorkflowNode(BaseModel):
    """工作流节点"""
    id: str
    type: str  # React Flow的节点类型
    position: Dict[str, float]  # {x: 100, y: 200}
    data: NodeData


class WorkflowEdge(BaseModel):
    """工作流边/连接"""
    id: str
    source: str  # 源节点ID
    target: str  # 目标节点ID
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None


class WorkflowDefinition(BaseModel):
    """工作流定义"""
    workflow_id: str
    name: str
    description: Optional[str] = ""
    nodes: List[WorkflowNode]
    edges: List[WorkflowEdge]
    created_at: Optional[Union[datetime, str]] = None
    updated_at: Optional[Union[datetime, str]] = None

    def __init__(self, **data):
        # 处理字符串格式的日期时间
        if 'created_at' in data and isinstance(data['created_at'], str):
            try:
                data['created_at'] = datetime.fromisoformat(data['created_at'].replace('Z', '+00:00'))
            except:
                data['created_at'] = datetime.now()
        elif 'created_at' not in data:
            data['created_at'] = datetime.now()
            
        if 'updated_at' in data and isinstance(data['updated_at'], str):
            try:
                data['updated_at'] = datetime.fromisoformat(data['updated_at'].replace('Z', '+00:00'))
            except:
                data['updated_at'] = datetime.now()
        elif 'updated_at' not in data:
            data['updated_at'] = datetime.now()
            
        super().__init__(**data)


class StepResult(BaseModel):
    """单个步骤执行结果"""
    node_id: str
    node_type: NodeType
    status: str  # success, failed, skipped
    start_time: datetime
    end_time: Optional[datetime] = None
    result_data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    screenshot_path: Optional[str] = None


class ExecutionResult(BaseModel):
    """工作流执行结果"""
    execution_id: str
    workflow_id: str
    status: str  # running, completed, failed, stopped
    start_time: datetime
    end_time: Optional[datetime] = None
    steps: List[StepResult] = Field(default_factory=list)
    error: Optional[str] = None
    total_duration: Optional[float] = None  # 总执行时间（秒）


# 各节点类型的参数定义
class VisitPageParams(BaseModel):
    """访问页面节点参数"""
    url: str
    wait_for_load: bool = True
    timeout: int = 30000  # 毫秒


class ClickElementParams(BaseModel):
    """点击元素节点参数"""
    selector: str  # CSS选择器或XPath
    selector_type: str = "css"  # css, xpath
    wait_timeout: int = 10000
    click_type: str = "single"  # single, double, right


class InputTextParams(BaseModel):
    """输入文本节点参数"""
    selector: str
    selector_type: str = "css"
    text: str
    clear_first: bool = True
    press_enter: bool = False


class ScrollPageParams(BaseModel):
    """滚动页面节点参数"""
    direction: str  # up, down, left, right, to_element
    distance: Optional[int] = None  # 像素距离
    target_selector: Optional[str] = None  # 滚动到特定元素
    smooth: bool = True


class PaginationParams(BaseModel):
    """分页节点参数"""
    next_button_selector: str
    max_pages: Optional[int] = None
    stop_condition: Optional[str] = None  # 停止条件选择器


class WaitParams(BaseModel):
    """等待节点参数"""
    wait_type: str  # time, element, condition
    duration: Optional[int] = None  # 毫秒
    element_selector: Optional[str] = None
    condition: Optional[str] = None


class LoopParams(BaseModel):
    """循环节点参数"""
    loop_type: str  # count, condition, infinite
    count: Optional[int] = None
    condition: Optional[str] = None
    max_iterations: int = 100  # 防止无限循环


class ExtractDataParams(BaseModel):
    """提取数据节点参数"""
    selectors: Dict[str, str]  # 字段名: 选择器
    extract_type: str = "text"  # text, attribute, html
    attribute_name: Optional[str] = None
    multiple: bool = False  # 是否提取多个元素


# 参数类型映射
NODE_PARAMS_MAP = {
    NodeType.VISIT_PAGE: VisitPageParams,
    NodeType.CLICK_ELEMENT: ClickElementParams,
    NodeType.INPUT_TEXT: InputTextParams,
    NodeType.SCROLL_PAGE: ScrollPageParams,
    NodeType.PAGINATION: PaginationParams,
    NodeType.WAIT: WaitParams,
    NodeType.LOOP: LoopParams,
    NodeType.EXTRACT_DATA: ExtractDataParams,
}

"""
节点模块
包含所有浏览器自动化节点的实现
"""

from .base import BaseNode
from .browser_nodes import (
    VisitPageNode,
    ClickElementNode,
    InputTextNode,
    ScrollPageNode,
    PaginationNode,
    WaitNode,
    LoopNode,
    ExtractDataNode
)
from .control_nodes import StartNode, EndNode

# 节点注册表 - 将节点类型映射到具体的节点类
node_registry = {
    "visit_page": VisitPageNode,
    "click_element": ClickElementNode,
    "input_text": InputTextNode,
    "scroll_page": ScrollPageNode,
    "pagination": PaginationNode,
    "wait": WaitNode,
    "loop": LoopNode,
    "extract_data": ExtractDataNode,
    "start": StartNode,
    "end": EndNode,
}

__all__ = [
    "BaseNode",
    "VisitPageNode",
    "ClickElementNode", 
    "InputTextNode",
    "ScrollPageNode",
    "PaginationNode",
    "WaitNode",
    "LoopNode",
    "ExtractDataNode",
    "StartNode",
    "EndNode",
    "node_registry"
]

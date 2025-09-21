#!/usr/bin/env python3
"""
测试工作流脚本
用于测试浏览器自动化节点功能
"""

import asyncio
import json
from datetime import datetime
from workflow.engine import WorkflowEngine
from models.workflow import WorkflowDefinition, WorkflowNode, WorkflowEdge, NodeData, NodeType

def create_test_workflow():
    """创建测试工作流"""
    
    # 定义节点
    nodes = [
        # 开始节点
        WorkflowNode(
            id="start_1",
            type="default",
            position={"x": 100, "y": 100},
            data=NodeData(
                label="开始",
                description="工作流开始",
                nodeType=NodeType.START,
                params={}
            )
        ),
        
        # 访问页面节点
        WorkflowNode(
            id="visit_1", 
            type="default",
            position={"x": 300, "y": 100},
            data=NodeData(
                label="访问百度",
                description="访问百度首页",
                nodeType=NodeType.VISIT_PAGE,
                params={
                    "url": "https://www.baidu.com",
                    "wait_for_load": True,
                    "timeout": 30000
                }
            )
        ),
        
        # 等待节点
        WorkflowNode(
            id="wait_1",
            type="default", 
            position={"x": 500, "y": 100},
            data=NodeData(
                label="等待2秒",
                description="等待页面完全加载",
                nodeType=NodeType.WAIT,
                params={
                    "wait_type": "time",
                    "duration": 2000
                }
            )
        ),
        
        # 输入文本节点
        WorkflowNode(
            id="input_1",
            type="default",
            position={"x": 700, "y": 100}, 
            data=NodeData(
                label="输入搜索词",
                description="在搜索框输入关键词",
                nodeType=NodeType.INPUT_TEXT,
                params={
                    "selector": "#kw",
                    "text": "Python自动化",
                    "clear_first": True,
                    "press_enter": False
                }
            )
        ),
        
        # 点击搜索按钮
        WorkflowNode(
            id="click_1",
            type="default",
            position={"x": 900, "y": 100},
            data=NodeData(
                label="点击搜索",
                description="点击搜索按钮",
                nodeType=NodeType.CLICK_ELEMENT,
                params={
                    "selector": "#su",
                    "selector_type": "css",
                    "click_type": "single"
                }
            )
        ),
        
        # 等待搜索结果
        WorkflowNode(
            id="wait_2",
            type="default",
            position={"x": 1100, "y": 100},
            data=NodeData(
                label="等待结果",
                description="等待搜索结果加载",
                nodeType=NodeType.WAIT,
                params={
                    "wait_type": "element",
                    "element_selector": "#content_left",
                    "duration": 10000
                }
            )
        ),
        
        # 提取搜索结果
        WorkflowNode(
            id="extract_1",
            type="default",
            position={"x": 1300, "y": 100},
            data=NodeData(
                label="提取结果",
                description="提取前5个搜索结果",
                nodeType=NodeType.EXTRACT_DATA,
                params={
                    "selectors": {
                        "titles": "h3 a",
                        "links": "h3 a",
                        "descriptions": ".c-abstract"
                    },
                    "extract_type": "text", 
                    "multiple": True
                }
            )
        ),
        
        # 结束节点
        WorkflowNode(
            id="end_1",
            type="default",
            position={"x": 1500, "y": 100},
            data=NodeData(
                label="结束",
                description="工作流结束",
                nodeType=NodeType.END,
                params={}
            )
        )
    ]
    
    # 定义连接边
    edges = [
        WorkflowEdge(id="edge_1", source="start_1", target="visit_1"),
        WorkflowEdge(id="edge_2", source="visit_1", target="wait_1"), 
        WorkflowEdge(id="edge_3", source="wait_1", target="input_1"),
        WorkflowEdge(id="edge_4", source="input_1", target="click_1"),
        WorkflowEdge(id="edge_5", source="click_1", target="wait_2"),
        WorkflowEdge(id="edge_6", source="wait_2", target="extract_1"),
        WorkflowEdge(id="edge_7", source="extract_1", target="end_1")
    ]
    
    return WorkflowDefinition(
        workflow_id="test_workflow_1",
        name="百度搜索测试工作流",
        description="自动访问百度、搜索关键词并提取结果",
        nodes=nodes,
        edges=edges
    )

async def test_simple_workflow():
    """测试简单工作流"""
    print("=" * 60)
    print("测试简单工作流（仅访问页面）")
    print("=" * 60)
    
    # 创建简单的工作流
    simple_workflow = WorkflowDefinition(
        workflow_id="simple_test",
        name="简单测试",
        description="仅访问一个网页",
        nodes=[
            WorkflowNode(
                id="start",
                type="default", 
                position={"x": 0, "y": 0},
                data=NodeData(
                    label="开始",
                    nodeType=NodeType.START,
                    params={}
                )
            ),
            WorkflowNode(
                id="visit",
                type="default",
                position={"x": 200, "y": 0}, 
                data=NodeData(
                    label="访问例子网站",
                    nodeType=NodeType.VISIT_PAGE,
                    params={
                        "url": "https://httpbin.org/get",
                        "wait_for_load": True
                    }
                )
            ),
            WorkflowNode(
                id="end", 
                type="default",
                position={"x": 400, "y": 0},
                data=NodeData(
                    label="结束",
                    nodeType=NodeType.END,
                    params={}
                )
            )
        ],
        edges=[
            WorkflowEdge(id="e1", source="start", target="visit"),
            WorkflowEdge(id="e2", source="visit", target="end")
        ]
    )
    
    # 执行工作流
    engine = WorkflowEngine()
    try:
        result = await engine.execute(simple_workflow)
        
        print(f"执行状态: {result.status}")
        print(f"总耗时: {result.total_duration:.2f}秒")
        print(f"执行步骤数: {len(result.steps)}")
        
        for i, step in enumerate(result.steps, 1):
            print(f"  步骤 {i}: {step.node_id} - {step.status}")
            if step.error:
                print(f"    错误: {step.error}")
            if step.result_data:
                print(f"    结果: {json.dumps(step.result_data, indent=4, ensure_ascii=False)}")
    
    except Exception as e:
        print(f"测试失败: {e}")
        import traceback
        traceback.print_exc()

async def test_full_workflow():
    """测试完整工作流"""
    print("\n" + "=" * 60) 
    print("测试完整工作流（百度搜索）")
    print("=" * 60)
    
    workflow = create_test_workflow()
    engine = WorkflowEngine()
    
    try:
        print("开始执行工作流...")
        result = await engine.execute(workflow)
        
        print(f"\n执行完成!")
        print(f"状态: {result.status}")
        print(f"总耗时: {result.total_duration:.2f}秒")
        print(f"执行步骤: {len(result.steps)}")
        
        print("\n详细步骤:")
        for i, step in enumerate(result.steps, 1):
            print(f"\n{i}. 节点: {step.node_id}")
            print(f"   类型: {step.node_type}")
            print(f"   状态: {step.status}")
            if step.error:
                print(f"   错误: {step.error}")
            if step.result_data:
                print(f"   结果数据: {json.dumps(step.result_data, indent=4, ensure_ascii=False)}")
        
        # 如果有提取的数据，显示出来
        if hasattr(result, 'extracted_data') and result.extracted_data:
            print("\n提取的数据:")
            for data in result.extracted_data:
                print(json.dumps(data, indent=2, ensure_ascii=False))
    
    except Exception as e:
        print(f"测试失败: {e}")
        import traceback
        traceback.print_exc()

async def main():
    """主测试函数"""
    print("Lingda UI Backend 测试程序")
    print("测试各种浏览器自动化节点")
    
    # 先测试简单工作流
    await test_simple_workflow()
    
    # 询问是否测试完整工作流
    print("\n" + "=" * 60)
    response = input("是否测试完整的百度搜索工作流？(y/n): ")
    if response.lower() in ['y', 'yes', '是']:
        await test_full_workflow()
    
    print("\n测试完成！")

if __name__ == "__main__":
    asyncio.run(main())

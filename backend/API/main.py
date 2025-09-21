"""
Lingda UI Backend - Browser Automation Workflow Engine
FastAPI服务器，用于执行前端定义的浏览器自动化工作流
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import asyncio
import logging
from datetime import datetime
import uuid

import sys
import os
# 添加backend目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from workflow.engine import WorkflowEngine
from models.workflow import WorkflowDefinition, ExecutionResult
from nodes import node_registry

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 创建FastAPI应用
app = FastAPI(
    title="Lingda UI Backend",
    description="浏览器自动化工作流执行引擎",
    version="1.0.0"
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],  # Next.js开发服务器
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 工作流执行引擎实例
workflow_engine = WorkflowEngine()

# 存储执行结果的内存缓存（生产环境应使用数据库）
execution_results: Dict[str, ExecutionResult] = {}


@app.get("/")
async def root():
    """根路径 - API状态检查"""
    return {
        "message": "Lingda UI Backend is running",
        "version": "1.0.0",
        "available_nodes": list(node_registry.keys()),
        "timestamp": datetime.now().isoformat()
    }


@app.get("/nodes")
async def get_available_nodes():
    """获取所有可用的节点类型"""
    nodes_info = {}
    for node_type, node_class in node_registry.items():
        nodes_info[node_type] = {
            "name": node_class.display_name,
            "description": node_class.description,
            "required_params": node_class.required_params,
            "optional_params": node_class.optional_params
        }
    return nodes_info


@app.post("/workflow/execute")
async def execute_workflow(workflow: WorkflowDefinition, background_tasks: BackgroundTasks):
    """
    执行工作流
    返回执行ID，可以通过ID查询执行状态
    """
    execution_id = str(uuid.uuid4())
    
    # 创建执行结果记录
    execution_results[execution_id] = ExecutionResult(
        execution_id=execution_id,
        workflow_id=workflow.workflow_id,
        status="running",
        start_time=datetime.now(),
        steps=[]
    )
    
    # 在后台执行工作流
    background_tasks.add_task(run_workflow, execution_id, workflow)
    
    return {
        "execution_id": execution_id,
        "status": "started",
        "message": "工作流已开始执行"
    }


@app.get("/workflow/status/{execution_id}")
async def get_execution_status(execution_id: str):
    """获取工作流执行状态"""
    if execution_id not in execution_results:
        raise HTTPException(status_code=404, detail="执行记录不存在")
    
    return execution_results[execution_id]


@app.post("/workflow/stop/{execution_id}")
async def stop_workflow(execution_id: str):
    """停止工作流执行"""
    if execution_id not in execution_results:
        raise HTTPException(status_code=404, detail="执行记录不存在")
    
    result = execution_results[execution_id]
    if result.status == "running":
        result.status = "stopped"
        result.end_time = datetime.now()
        return {"message": "工作流已停止"}
    else:
        return {"message": f"工作流当前状态：{result.status}，无法停止"}


async def run_workflow(execution_id: str, workflow: WorkflowDefinition):
    """在后台运行工作流"""
    try:
        logger.info(f"开始执行工作流: {execution_id}")
        result = await workflow_engine.execute(workflow)
        
        # 更新执行结果
        execution_results[execution_id] = result
        execution_results[execution_id].execution_id = execution_id
        
        logger.info(f"工作流执行完成: {execution_id}, 状态: {result.status}")
        
    except Exception as e:
        logger.error(f"工作流执行失败: {execution_id}, 错误: {str(e)}")
        execution_results[execution_id].status = "failed"
        execution_results[execution_id].error = str(e)
        execution_results[execution_id].end_time = datetime.now()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

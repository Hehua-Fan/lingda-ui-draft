#!/usr/bin/env python3
"""
健康检查脚本
用于测试后端API是否正常运行
"""

import requests
import json
import sys
from datetime import datetime

def test_health_check():
    """测试健康检查接口"""
    try:
        print("测试健康检查接口...")
        response = requests.get("http://localhost:8000/", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 服务器正常运行")
            print(f"   版本: {data.get('version')}")
            print(f"   时间: {data.get('timestamp')}")
            print(f"   可用节点: {len(data.get('available_nodes', []))}")
            return True
        else:
            print(f"❌ 健康检查失败: HTTP {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ 无法连接到服务器，请确保后端已启动")
        return False
    except Exception as e:
        print(f"❌ 健康检查出错: {e}")
        return False

def test_nodes_endpoint():
    """测试节点信息接口"""
    try:
        print("\n测试节点信息接口...")
        response = requests.get("http://localhost:8000/nodes", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 获取节点信息成功")
            print(f"   支持的节点类型:")
            for node_type, info in data.items():
                print(f"     - {node_type}: {info['name']}")
            return True
        else:
            print(f"❌ 获取节点信息失败: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ 获取节点信息出错: {e}")
        return False

def test_simple_workflow():
    """测试简单工作流执行"""
    print("\n测试简单工作流执行...")
    
    # 创建一个最简单的测试工作流
    workflow_data = {
        "workflow_id": "health_check_workflow",
        "name": "健康检查工作流", 
        "description": "用于健康检查的简单工作流",
        "nodes": [
            {
                "id": "start_1",
                "type": "default",
                "position": {"x": 0, "y": 0},
                "data": {
                    "label": "开始",
                    "description": "开始节点",
                    "nodeType": "start",
                    "params": {}
                }
            },
            {
                "id": "end_1", 
                "type": "default",
                "position": {"x": 200, "y": 0},
                "data": {
                    "label": "结束",
                    "description": "结束节点", 
                    "nodeType": "end",
                    "params": {}
                }
            }
        ],
        "edges": [
            {
                "id": "edge_1",
                "source": "start_1",
                "target": "end_1"
            }
        ],
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    try:
        # 提交工作流执行
        print("   提交工作流...")
        response = requests.post(
            "http://localhost:8000/workflow/execute",
            json=workflow_data,
            timeout=10
        )
        
        if response.status_code != 200:
            print(f"❌ 提交工作流失败: HTTP {response.status_code}")
            print(f"   响应: {response.text}")
            return False
            
        result = response.json()
        execution_id = result.get("execution_id")
        
        if not execution_id:
            print("❌ 未获得执行ID")
            return False
            
        print(f"   执行ID: {execution_id}")
        
        # 等待执行完成
        import time
        max_wait = 30  # 最多等待30秒
        wait_count = 0
        
        while wait_count < max_wait:
            time.sleep(1)
            wait_count += 1
            
            # 查询执行状态
            status_response = requests.get(
                f"http://localhost:8000/workflow/status/{execution_id}",
                timeout=5
            )
            
            if status_response.status_code == 200:
                status_data = status_response.json()
                status = status_data.get("status")
                
                print(f"   状态: {status} ({wait_count}s)")
                
                if status in ["completed", "failed"]:
                    if status == "completed":
                        print("✅ 工作流执行成功")
                        print(f"   执行步骤: {len(status_data.get('steps', []))}")
                        return True
                    else:
                        print("❌ 工作流执行失败")
                        print(f"   错误: {status_data.get('error')}")
                        return False
            else:
                print(f"❌ 查询状态失败: HTTP {status_response.status_code}")
                return False
        
        print("❌ 工作流执行超时")
        return False
        
    except Exception as e:
        print(f"❌ 工作流测试出错: {e}")
        return False

def main():
    """主函数"""
    print("=" * 50)
    print("Lingda UI Backend 健康检查")
    print("=" * 50)
    
    success_count = 0
    total_tests = 3
    
    # 基础健康检查
    if test_health_check():
        success_count += 1
    
    # 节点信息检查
    if test_nodes_endpoint():
        success_count += 1
    
    # 简单工作流测试
    if test_simple_workflow():
        success_count += 1
    
    print("\n" + "=" * 50)
    print(f"健康检查完成: {success_count}/{total_tests} 通过")
    
    if success_count == total_tests:
        print("🎉 所有测试通过，后端运行正常！")
        sys.exit(0)
    else:
        print("⚠️  部分测试失败，请检查后端状态")
        sys.exit(1)

if __name__ == "__main__":
    main()

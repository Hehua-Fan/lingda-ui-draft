#!/usr/bin/env python3
"""
启动脚本
用于启动Lingda UI Backend服务器
"""

import asyncio
import subprocess
import sys
import os
from pathlib import Path

def install_dependencies():
    """安装Python依赖"""
    print("安装Python依赖...")
    subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)

def install_playwright_browsers():
    """安装Playwright浏览器"""
    print("安装Playwright浏览器...")
    subprocess.run([sys.executable, "-m", "playwright", "install"], check=True)

def main():
    """主函数"""
    print("=" * 50)
    print("Lingda UI Backend 启动器")
    print("=" * 50)
    
    # 确保在正确的目录中
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    try:
        # 安装依赖
        install_dependencies()
        install_playwright_browsers()
        
        print("\n" + "=" * 50)
        print("启动服务器...")
        print("API文档地址: http://localhost:8000/docs")
        print("服务器地址: http://localhost:8000")
        print("按 Ctrl+C 停止服务器")
        print("=" * 50 + "\n")
        
        # 启动服务器
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "API.main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000", 
            "--reload"
        ])
        
    except KeyboardInterrupt:
        print("\n服务器已停止")
    except Exception as e:
        print(f"启动失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

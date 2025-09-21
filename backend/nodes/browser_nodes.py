"""
浏览器操作节点实现
包含所有与浏览器交互相关的节点
"""

import asyncio
from datetime import datetime
from typing import Dict, Any, Optional, List
from urllib.parse import urlparse
import re

from .base import BaseNode, ExecutionContext
from models.workflow import NodeType, StepResult


class VisitPageNode(BaseNode):
    """访问页面节点"""
    
    node_type = NodeType.VISIT_PAGE
    display_name = "访问页面"
    description = "导航到指定的网页地址"
    required_params = ["url"]
    optional_params = ["wait_for_load", "timeout"]
    
    async def execute(self, context: ExecutionContext) -> StepResult:
        start_time = datetime.now()
        url = self.params["url"]
        timeout = self.params.get("timeout", 30000)
        wait_for_load = self.params.get("wait_for_load", True)
        
        # 验证URL格式
        parsed_url = urlparse(url)
        if not parsed_url.scheme:
            url = "https://" + url
        
        await context.page.goto(url, timeout=timeout)
        
        if wait_for_load:
            # 等待页面加载完成
            await context.page.wait_for_load_state("networkidle")
        
        # 获取最终URL（可能有重定向）
        final_url = context.page.url
        
        return self.create_step_result(
            status="success",
            start_time=start_time,
            result_data={
                "requested_url": url,
                "final_url": final_url,
                "title": await context.page.title()
            }
        )


class ClickElementNode(BaseNode):
    """点击元素节点"""
    
    node_type = NodeType.CLICK_ELEMENT
    display_name = "点击元素"
    description = "点击页面上的指定元素"
    required_params = ["selector"]
    optional_params = ["selector_type", "wait_timeout", "click_type"]
    
    async def execute(self, context: ExecutionContext) -> StepResult:
        start_time = datetime.now()
        selector = self.params["selector"]
        selector_type = self.params.get("selector_type", "css")
        timeout = self.params.get("wait_timeout", 10000)
        click_type = self.params.get("click_type", "single")
        
        # 等待元素出现
        if selector_type == "xpath":
            locator = context.page.locator(f"xpath={selector}")
        else:
            locator = context.page.locator(selector)
        
        await locator.wait_for(state="visible", timeout=timeout)
        
        # 滚动到元素可见区域
        await locator.scroll_into_view_if_needed()
        
        # 执行点击
        if click_type == "double":
            await locator.dblclick()
        elif click_type == "right":
            await locator.click(button="right")
        else:
            await locator.click()
        
        # 获取元素信息
        element_text = await locator.text_content()
        element_tag = await locator.evaluate("el => el.tagName")
        
        return self.create_step_result(
            status="success",
            start_time=start_time,
            result_data={
                "selector": selector,
                "element_text": element_text,
                "element_tag": element_tag,
                "click_type": click_type
            }
        )


class InputTextNode(BaseNode):
    """输入文本节点"""
    
    node_type = NodeType.INPUT_TEXT
    display_name = "输入文本"
    description = "在指定的输入框中输入文本"
    required_params = ["selector", "text"]
    optional_params = ["selector_type", "clear_first", "press_enter"]
    
    async def execute(self, context: ExecutionContext) -> StepResult:
        start_time = datetime.now()
        selector = self.params["selector"]
        text = self.params["text"]
        selector_type = self.params.get("selector_type", "css")
        clear_first = self.params.get("clear_first", True)
        press_enter = self.params.get("press_enter", False)
        
        # 支持变量替换
        if "${" in text:
            for var_name, var_value in context.variables.items():
                text = text.replace(f"${{{var_name}}}", str(var_value))
        
        if selector_type == "xpath":
            locator = context.page.locator(f"xpath={selector}")
        else:
            locator = context.page.locator(selector)
        
        await locator.wait_for(state="visible", timeout=10000)
        await locator.scroll_into_view_if_needed()
        
        if clear_first:
            await locator.clear()
        
        await locator.type(text)
        
        if press_enter:
            await locator.press("Enter")
        
        return self.create_step_result(
            status="success",
            start_time=start_time,
            result_data={
                "selector": selector,
                "text": text,
                "cleared_first": clear_first,
                "pressed_enter": press_enter
            }
        )


class ScrollPageNode(BaseNode):
    """滚动页面节点"""
    
    node_type = NodeType.SCROLL_PAGE
    display_name = "滚动页面"
    description = "滚动页面到指定位置或方向"
    required_params = ["direction"]
    optional_params = ["distance", "target_selector", "smooth"]
    
    async def execute(self, context: ExecutionContext) -> StepResult:
        start_time = datetime.now()
        direction = self.params["direction"]
        distance = self.params.get("distance", 500)
        target_selector = self.params.get("target_selector")
        smooth = self.params.get("smooth", True)
        
        if direction == "to_element" and target_selector:
            # 滚动到指定元素
            locator = context.page.locator(target_selector)
            await locator.scroll_into_view_if_needed()
            scroll_info = "滚动到元素"
        else:
            # 按方向滚动
            scroll_script = self._generate_scroll_script(direction, distance, smooth)
            await context.page.evaluate(scroll_script)
            scroll_info = f"滚动{direction} {distance}px"
        
        # 等待滚动完成
        await asyncio.sleep(0.5)
        
        # 获取当前滚动位置
        scroll_position = await context.page.evaluate(
            "() => ({ x: window.pageXOffset, y: window.pageYOffset })"
        )
        
        return self.create_step_result(
            status="success",
            start_time=start_time,
            result_data={
                "direction": direction,
                "distance": distance,
                "scroll_position": scroll_position,
                "action": scroll_info
            }
        )
    
    def _generate_scroll_script(self, direction: str, distance: int, smooth: bool) -> str:
        """生成滚动JavaScript代码"""
        behavior = "smooth" if smooth else "auto"
        
        if direction == "down":
            return f"window.scrollBy({{ top: {distance}, behavior: '{behavior}' }})"
        elif direction == "up":
            return f"window.scrollBy({{ top: -{distance}, behavior: '{behavior}' }})"
        elif direction == "left":
            return f"window.scrollBy({{ left: -{distance}, behavior: '{behavior}' }})"
        elif direction == "right":
            return f"window.scrollBy({{ left: {distance}, behavior: '{behavior}' }})"
        else:
            return f"window.scrollBy({{ top: {distance}, behavior: '{behavior}' }})"


class PaginationNode(BaseNode):
    """分页节点"""
    
    node_type = NodeType.PAGINATION
    display_name = "分页处理"
    description = "自动处理页面分页，点击下一页按钮"
    required_params = ["next_button_selector"]
    optional_params = ["max_pages", "stop_condition"]
    
    async def execute(self, context: ExecutionContext) -> StepResult:
        start_time = datetime.now()
        next_button_selector = self.params["next_button_selector"]
        max_pages = self.params.get("max_pages", 10)
        stop_condition = self.params.get("stop_condition")
        
        pages_processed = 0
        
        while pages_processed < max_pages:
            # 检查停止条件
            if stop_condition:
                stop_elements = await context.page.locator(stop_condition).count()
                if stop_elements == 0:
                    break
            
            # 查找下一页按钮
            next_button = context.page.locator(next_button_selector)
            
            # 检查按钮是否存在且可点击
            if await next_button.count() == 0:
                break
            
            if not await next_button.is_enabled():
                break
            
            # 点击下一页
            await next_button.scroll_into_view_if_needed()
            await next_button.click()
            
            # 等待页面加载
            await context.page.wait_for_load_state("networkidle")
            await asyncio.sleep(1)  # 额外等待
            
            pages_processed += 1
        
        return self.create_step_result(
            status="success",
            start_time=start_time,
            result_data={
                "pages_processed": pages_processed,
                "max_pages": max_pages,
                "stopped_reason": "reached_max" if pages_processed >= max_pages else "no_more_pages"
            }
        )


class WaitNode(BaseNode):
    """等待节点"""
    
    node_type = NodeType.WAIT
    display_name = "等待"
    description = "等待指定时间或条件满足"
    required_params = ["wait_type"]
    optional_params = ["duration", "element_selector", "condition"]
    
    async def execute(self, context: ExecutionContext) -> StepResult:
        start_time = datetime.now()
        wait_type = self.params["wait_type"]
        
        if wait_type == "time":
            duration = self.params.get("duration", 1000)  # 毫秒
            await asyncio.sleep(duration / 1000)
            wait_info = f"等待了 {duration}ms"
        
        elif wait_type == "element":
            element_selector = self.params["element_selector"]
            timeout = self.params.get("duration", 30000)
            await context.page.locator(element_selector).wait_for(
                state="visible", 
                timeout=timeout
            )
            wait_info = f"等待元素出现: {element_selector}"
        
        elif wait_type == "condition":
            condition = self.params["condition"]
            timeout = self.params.get("duration", 30000)
            
            # 支持常见的等待条件
            if condition == "page_load":
                await context.page.wait_for_load_state("networkidle", timeout=timeout)
            elif condition == "dom_ready":
                await context.page.wait_for_load_state("domcontentloaded", timeout=timeout)
            else:
                # 自定义JavaScript条件
                await context.page.wait_for_function(condition, timeout=timeout)
            
            wait_info = f"等待条件满足: {condition}"
        
        return self.create_step_result(
            status="success",
            start_time=start_time,
            result_data={
                "wait_type": wait_type,
                "action": wait_info
            }
        )


class LoopNode(BaseNode):
    """循环节点"""
    
    node_type = NodeType.LOOP
    display_name = "循环"
    description = "循环执行指定次数或直到满足条件"
    required_params = ["loop_type"]
    optional_params = ["count", "condition", "max_iterations"]
    
    async def execute(self, context: ExecutionContext) -> StepResult:
        start_time = datetime.now()
        loop_type = self.params["loop_type"]
        
        # 注意：循环的具体执行逻辑需要在WorkflowEngine中实现
        # 这里只是记录循环开始
        
        if loop_type == "count":
            count = self.params.get("count", 1)
            context.loop_counters[self.node_id] = 0
            loop_info = f"开始计数循环，总次数: {count}"
        
        elif loop_type == "condition":
            condition = self.params["condition"]
            context.loop_counters[self.node_id] = 0
            loop_info = f"开始条件循环，条件: {condition}"
        
        elif loop_type == "infinite":
            context.loop_counters[self.node_id] = 0
            loop_info = "开始无限循环"
        
        return self.create_step_result(
            status="success",
            start_time=start_time,
            result_data={
                "loop_type": loop_type,
                "action": loop_info,
                "current_iteration": 0
            }
        )


class ExtractDataNode(BaseNode):
    """提取数据节点"""
    
    node_type = NodeType.EXTRACT_DATA
    display_name = "提取数据"
    description = "从页面中提取指定数据"
    required_params = ["selectors"]
    optional_params = ["extract_type", "attribute_name", "multiple"]
    
    async def execute(self, context: ExecutionContext) -> StepResult:
        start_time = datetime.now()
        selectors = self.params["selectors"]  # Dict[str, str]
        extract_type = self.params.get("extract_type", "text")
        attribute_name = self.params.get("attribute_name")
        multiple = self.params.get("multiple", False)
        
        extracted_data = {}
        
        for field_name, selector in selectors.items():
            try:
                locator = context.page.locator(selector)
                
                if multiple:
                    # 提取多个元素
                    elements = await locator.all()
                    values = []
                    
                    for element in elements:
                        value = await self._extract_value(element, extract_type, attribute_name)
                        if value:
                            values.append(value)
                    
                    extracted_data[field_name] = values
                else:
                    # 提取单个元素
                    if await locator.count() > 0:
                        value = await self._extract_value(locator.first, extract_type, attribute_name)
                        extracted_data[field_name] = value
                    else:
                        extracted_data[field_name] = None
                        
            except Exception as e:
                extracted_data[field_name] = f"提取失败: {str(e)}"
        
        # 将提取的数据添加到上下文
        context.add_extracted_data(extracted_data)
        
        return self.create_step_result(
            status="success",
            start_time=start_time,
            result_data={
                "extracted_data": extracted_data,
                "total_fields": len(selectors),
                "successful_fields": len([v for v in extracted_data.values() if v is not None and not str(v).startswith("提取失败")])
            }
        )
    
    async def _extract_value(self, locator, extract_type: str, attribute_name: str = None):
        """提取元素值"""
        if extract_type == "text":
            return await locator.text_content()
        elif extract_type == "html":
            return await locator.inner_html()
        elif extract_type == "attribute" and attribute_name:
            return await locator.get_attribute(attribute_name)
        else:
            return await locator.text_content()  # 默认提取文本

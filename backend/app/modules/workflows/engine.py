from playwright.sync_api import sync_playwright
import pandas as pd
from fpdf import FPDF
from io import BytesIO
import io
import json
import time

class ScrapingEngine:
    def __init__(self, nodes_data):
        self.nodes = nodes_data.get('nodes', [])
        self.edges = nodes_data.get('edges', [])
        self.results = []
        self.last_extracted_data = None
        
    def _get_node_by_id(self, node_id):
        return next((n for n in self.nodes if n['id'] == node_id), None)

    def _get_outgoing_edges(self, node_id):
        return [e for e in self.edges if e['source'] == node_id]

    def _get_locator(self, page, query, sel_type='css'):
        if not query:
            return None
        if query.startswith('//') or query.startswith('('):
            return page.locator(f"xpath={query}")
        if sel_type == 'xpath':
            try:
                loc = page.locator(f"xpath={query}")
                page.evaluate("() => {}") 
                return loc
            except Exception:
                return page.locator(query)
        return page.locator(query)

    def _block_resources(self, route):
        if route.request.resource_type in ["image", "media", "font"]:
            route.abort()
        else:
            route.continue_()

    def run(self):
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
            page = context.new_page()
            page.route("**/*", self._block_resources)
            target_ids = [e['target'] for e in self.edges]
            start_nodes = [n for n in self.nodes if n['id'] not in target_ids]
            if not start_nodes and self.nodes:
                start_nodes = [self.nodes[0]]
            current_node = start_nodes[0] if start_nodes else None
            try:
                while current_node:
                    node_type = current_node.get('type')
                    node_data = current_node.get('data', {})
                    if node_type == 'http':
                        url = node_data.get('url')
                        if url:
                            page.goto(url, wait_until="load", timeout=30000)
                    elif node_type == 'click':
                        selector = node_data.get('selector')
                        sel_type = node_data.get('selector_type', 'css')
                        if selector:
                            if sel_type == 'text':
                                page.get_by_text(selector).first.click()
                            else:
                                loc = self._get_locator(page, selector, sel_type)
                                if loc: loc.first.click()
                    elif node_type == 'input':
                        selector = node_data.get('selector')
                        sel_type = node_data.get('selector_type', 'css')
                        value = node_data.get('value', '')
                        if selector:
                            loc = self._get_locator(page, selector, sel_type)
                            if loc: loc.first.fill(value)
                    elif node_type == 'wait':
                        w_type = node_data.get('type', 'timeout')
                        if w_type == 'element':
                            selector = node_data.get('selector')
                            sel_type = node_data.get('selector_type', 'css')
                            if selector:
                                loc = self._get_locator(page, selector, sel_type)
                                if loc: loc.first.wait_for(state="visible", timeout=10000)
                        else:
                            try:
                                ms_val = node_data.get('ms')
                                ms = int(ms_val) if ms_val and str(ms_val).strip() else 2000
                            except ValueError:
                                ms = 2000
                            page.wait_for_timeout(ms)
                    elif node_type == 'selector':
                        query = node_data.get('selector')
                        sel_type = node_data.get('selector_type', 'xpath')
                        attr = node_data.get('attribute')
                        if query:
                            locator = self._get_locator(page, query, sel_type)
                            if not locator: continue
                            elements = locator.all()
                            extracted = []
                            for el in elements:
                                if attr == 'table':
                                    html = el.evaluate("""el => {
                                        const clone = el.cloneNode(true);
                                        clone.querySelectorAll('button, svg, script, style, .dtcc, .dt-column-order').forEach(n => n.remove());
                                        return clone.outerHTML;
                                    }""")
                                    try:
                                        dfs = pd.read_html(io.StringIO(html))
                                        if dfs:
                                            df = dfs[0]
                                            table_data = [df.columns.tolist()] + df.values.tolist()
                                            extracted.extend(table_data)
                                    except Exception as e:
                                        extracted.append(f"Erro ao processar tabela: {str(e)}")
                                elif attr:
                                    if attr in ['outerHTML', 'innerHTML', 'innerText']:
                                        val = el.evaluate(f"el => el.{attr}")
                                    else:
                                        tag_name = el.evaluate("el => el.tagName.toLowerCase()")
                                        if attr == 'value' and tag_name in ['input', 'textarea', 'select']:
                                            val = el.input_value()
                                        else:
                                            val = el.get_attribute(attr)
                                    extracted.append(val.strip() if val else "")
                                else:
                                    val = el.inner_text()
                                    extracted.append(val.strip() if val else "")
                            self.last_extracted_data = extracted
                    elif node_type == 'export':
                        fmt = node_data.get('format', 'JSON')
                        filename = node_data.get('filename', 'resultado')
                        self.results.append({
                            "node_id": current_node['id'],
                            "format": fmt,
                            "filename": filename,
                            "data": self.last_extracted_data
                        })
                    outgoing = self._get_outgoing_edges(current_node['id'])
                    if outgoing:
                        current_node = self._get_node_by_id(outgoing[0]['target'])
                    else:
                        current_node = None
                browser.close()
                return {"status": "success", "results": self.results}
            except Exception as e:
                if browser: browser.close()
                return {"status": "error", "message": str(e)}

from playwright.sync_api import Page
import pandas as pd
import io


class BaseNodeHandler:
    """Interface base para todos os handlers de nós."""

    def execute(self, page: Page, node_data: dict, context_data: dict):
        raise NotImplementedError("Cada handler deve implementar o método execute.")


class HttpNodeHandler(BaseNodeHandler):
    def execute(self, page: Page, node_data: dict, context_data: dict):
        url = node_data.get("url")
        if url:
            if not url.startswith(("http://", "https://")):
                url = "https://" + url
            page.goto(url, wait_until="load", timeout=30000)
        return None


class ClickNodeHandler(BaseNodeHandler):
    def execute(self, page: Page, node_data: dict, context_data: dict):
        selector = node_data.get("selector")
        sel_type = node_data.get("selector_type", "css")
        if selector:
            if sel_type == "text":
                page.get_by_text(selector).first.click()
            else:
                loc = context_data["engine"]._get_locator(page, selector, sel_type)
                if loc:
                    loc.first.click()
        return None


class InputNodeHandler(BaseNodeHandler):
    def execute(self, page: Page, node_data: dict, context_data: dict):
        selector = node_data.get("selector")
        sel_type = node_data.get("selector_type", "css")
        value = node_data.get("value", "")
        if selector:
            loc = context_data["engine"]._get_locator(page, selector, sel_type)
            if loc:
                loc.first.fill(value)
        return None


class WaitNodeHandler(BaseNodeHandler):
    def execute(self, page: Page, node_data: dict, context_data: dict):
        w_type = node_data.get("type", "timeout")
        if w_type == "element":
            selector = node_data.get("selector")
            sel_type = node_data.get("selector_type", "css")
            if selector:
                loc = context_data["engine"]._get_locator(page, selector, sel_type)
                if loc:
                    loc.first.wait_for(state="visible", timeout=10000)
        else:
            try:
                ms_val = node_data.get("ms")
                ms = int(ms_val) if ms_val and str(ms_val).strip() else 2000
            except ValueError:
                ms = 2000
            page.wait_for_timeout(ms)
        return None


class SelectorNodeHandler(BaseNodeHandler):
    def execute(self, page: Page, node_data: dict, context_data: dict):
        query = node_data.get("selector")
        sel_type = node_data.get("selector_type", "xpath")
        attr = node_data.get("attribute")
        engine = context_data["engine"]

        if not query:
            return None

        locator = engine._get_locator(page, query, sel_type)
        if not locator:
            return None

        elements = locator.all()
        extracted = []
        for el in elements:
            self._extract_value(el, attr, extracted)

        engine.last_extracted_data = extracted
        return None

    def _extract_value(self, el, attr: str, extracted: list):
        if not attr:
            val = el.inner_text()
            extracted.append(val.strip() if val else "")
            return

        if attr == "table":
            self._extract_table(el, extracted)
            return

        self._extract_attribute(el, attr, extracted)

    def _extract_table(self, el, extracted: list):
        html = el.evaluate(
            """el => {
            const clone = el.cloneNode(true);
            clone.querySelectorAll('button, svg, script, style, .dtcc, .dt-column-order').forEach(n => n.remove());
            return clone.outerHTML;
        }"""
        )
        try:
            dfs = pd.read_html(io.StringIO(html))
            if dfs:
                df = dfs[0]
                table_data = [df.columns.tolist()] + df.values.tolist()
                extracted.extend(table_data)
        except Exception as e:
            extracted.append(f"Erro ao processar tabela: {str(e)}")

    def _extract_attribute(self, el, attr: str, extracted: list):
        if attr in ["outerHTML", "innerHTML", "innerText"]:
            val = el.evaluate(f"el => el.{attr}")
        else:
            tag_name = el.evaluate("el => el.tagName.toLowerCase()")
            if attr == "value" and tag_name in ["input", "textarea", "select"]:
                val = el.input_value()
            else:
                val = el.get_attribute(attr)

        extracted.append(val.strip() if val else "")


class ExportNodeHandler(BaseNodeHandler):
    def execute(self, page: Page, node_data: dict, context_data: dict):
        engine = context_data["engine"]
        fmt = node_data.get("format", "JSON")
        filename = node_data.get("filename", "resultado")
        engine.results.append(
            {
                "node_id": context_data["current_node_id"],
                "format": fmt,
                "filename": filename,
                "data": engine.last_extracted_data,
            }
        )
        return None


NODE_HANDLERS = {
    "http": HttpNodeHandler(),
    "click": ClickNodeHandler(),
    "input": InputNodeHandler(),
    "wait": WaitNodeHandler(),
    "selector": SelectorNodeHandler(),
    "export": ExportNodeHandler(),
}

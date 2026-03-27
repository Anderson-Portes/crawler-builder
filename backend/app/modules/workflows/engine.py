import io
import json
import time
from playwright.sync_api import sync_playwright
import pandas as pd
from app.modules.nodes.handlers import NODE_HANDLERS


class ScrapingEngine:
    def __init__(self, nodes_data):
        self.nodes = nodes_data.get("nodes", [])
        self.edges = nodes_data.get("edges", [])
        self.results = []
        self.last_extracted_data = None

    def _get_node_by_id(self, node_id):
        return next((n for n in self.nodes if n["id"] == node_id), None)

    def _get_outgoing_edges(self, node_id):
        return [e for e in self.edges if e["source"] == node_id]

    def _get_locator(self, page, query, sel_type="css"):
        if not query:
            return None
        if query.startswith("//") or query.startswith("("):
            return page.locator(f"xpath={query}")
        if sel_type == "xpath":
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

            target_ids = [e["target"] for e in self.edges]
            start_nodes = [n for n in self.nodes if n["id"] not in target_ids]
            if not start_nodes and self.nodes:
                start_nodes = [self.nodes[0]]

            current_node = start_nodes[0] if start_nodes else None

            try:
                while current_node:
                    node_type = current_node.get("type")
                    node_data = current_node.get("data", {})

                    handler = NODE_HANDLERS.get(node_type)

                    if handler:
                        context_data = {
                            "engine": self,
                            "current_node_id": current_node["id"],
                        }
                        handler.execute(page, node_data, context_data)
                    else:
                        print(
                            f"Aviso: Nenhum handler encontrado para o tipo '{node_type}'"
                        )

                    # Navega para o próximo nó
                    outgoing = self._get_outgoing_edges(current_node["id"])
                    if outgoing:
                        current_node = self._get_node_by_id(outgoing[0]["target"])
                    else:
                        current_node = None

                browser.close()
                return {"status": "success", "results": self.results}
            except Exception as e:
                if browser:
                    browser.close()
                return {"status": "error", "message": f"Erro na Engine: {str(e)}"}

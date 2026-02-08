/**
 * Grafana API Client
 * Fetches dashboards and panels from Grafana
 */

export interface GrafanaConfig {
  baseUrl: string;
  apiKey?: string;
  username?: string;
  password?: string;
}

export interface GrafanaDashboard {
  id: number;
  title: string;
  uid: string;
  url: string;
  tags: string[];
}

export interface GrafanaPanel {
  id: number;
  title: string;
  type: string;
  targets: Array<{
    expr: string;
    refId: string;
  }>;
}

/**
 * Grafana API Client class
 */
export class GrafanaClient {
  private config: GrafanaConfig;
  private enabled: boolean;

  constructor(config: GrafanaConfig) {
    this.config = config;
    this.enabled = !!config.baseUrl;
  }

  /**
   * Get authentication headers
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.config.apiKey) {
      headers.Authorization = `Bearer ${this.config.apiKey}`;
    } else if (this.config.username && this.config.password) {
      headers.Authorization = `Basic ${btoa(`${this.config.username}:${this.config.password}`)}`;
    }

    return headers;
  }

  /**
   * Search dashboards
   */
  async searchDashboards(query: string = ""): Promise<GrafanaDashboard[]> {
    if (!this.enabled) {
      return this.mockDashboards();
    }

    const url = new URL(`${this.config.baseUrl}/api/search`);
    url.searchParams.set("type", "dash-db");
    if (query) {
      url.searchParams.set("query", query);
    }

    try {
      const response = await fetch(url.toString(), {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Grafana API error: ${response.status}`);
      }

      const data = await response.json();
      return data.map((dash: any) => ({
        id: dash.id,
        title: dash.title,
        uid: dash.uid,
        url: dash.url,
        tags: dash.tags || [],
      }));
    } catch (error) {
      console.warn("Grafana search failed, using mock data:", error);
      return this.mockDashboards();
    }
  }

  /**
   * Get dashboard by UID
   */
  async getDashboard(uid: string): Promise<any> {
    if (!this.enabled) {
      return this.mockDashboard(uid);
    }

    const url = `${this.config.baseUrl}/api/dashboards/uid/${uid}`;

    try {
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Grafana API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn("Grafana dashboard fetch failed, using mock data:", error);
      return this.mockDashboard(uid);
    }
  }

  /**
   * Get panels from a dashboard
   */
  async getDashboardPanels(uid: string): Promise<GrafanaPanel[]> {
    const dashboard = await this.getDashboard(uid);

    if (!dashboard?.dashboard?.panels) {
      return [];
    }

    return dashboard.dashboard.panels.map((panel: any) => ({
      id: panel.id,
      title: panel.title,
      type: panel.type,
      targets: panel.targets?.map((t: any) => ({
        expr: t.expr || "",
        refId: t.refId,
      })) || [],
    }));
  }

  /**
   * Mock dashboards for fallback
   */
  private mockDashboards(): GrafanaDashboard[] {
    return [
      {
        id: 1,
        title: "Node Exporter Full",
        uid: "node-exporter-full",
        url: "/d/node-exporter-full",
        tags: ["nodes", "hardware"],
      },
      {
        id: 2,
        title: "Docker and system monitoring",
        uid: "docker-monitoring",
        url: "/d/docker-monitoring",
        tags: ["docker", "containers"],
      },
      {
        id: 3,
        title: "MicroK8s Cluster",
        uid: "microk8s-cluster",
        url: "/d/microk8s-cluster",
        tags: ["kubernetes", "cluster"],
      },
    ];
  }

  /**
   * Mock dashboard for fallback
   */
  private mockDashboard(uid: string): any {
    return {
      dashboard: {
        title: "Mock Dashboard",
        uid,
        panels: [],
      },
    };
  }

  /**
   * Check if client is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get dashboard URL for iframe embedding
   */
  getDashboardEmbedUrl(uid: string, theme: "light" | "dark" = "light"): string {
    return `${this.config.baseUrl}/d/${uid}?theme=${theme}&kiosk`;
  }
}

/**
 * Create a singleton instance
 */
let grafanaClient: GrafanaClient | null = null;

export function getGrafanaClient(): GrafanaClient {
  if (!grafanaClient) {
    const config: GrafanaConfig = {
      baseUrl: process.env.NEXT_PUBLIC_GRAFANA_URL || "",
      apiKey: process.env.GRAFANA_API_KEY,
      username: process.env.GRAFANA_USERNAME,
      password: process.env.GRAFANA_PASSWORD,
    };
    grafanaClient = new GrafanaClient(config);
  }
  return grafanaClient;
}

/**
 * Reset the client
 */
export function resetGrafanaClient(): void {
  grafanaClient = null;
}

"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useServices } from "@/hooks/useDashboard";
import { Search } from "lucide-react";
import { ServiceCard } from "./ServiceCard";

export function ServicesStatus() {
  const [selectedNamespace, setSelectedNamespace] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  const { allServices, namespaces, servicesByNamespace } = useServices();

  // Filter services by namespace and search query
  const filteredServices = useMemo(() => {
    let result = selectedNamespace
      ? servicesByNamespace[selectedNamespace] || []
      : allServices;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (service) =>
          service.name.toLowerCase().includes(query) ||
          service.namespace.toLowerCase().includes(query) ||
          service.node.toLowerCase().includes(query)
      );
    }

    return result;
  }, [selectedNamespace, searchQuery, allServices, servicesByNamespace]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Running Services</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search bar */}
        <div className="mb-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search services by name, namespace, or node..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-400"
              aria-label="Search services"
            />
          </div>
        </div>

        {/* Namespace filters */}
        <div
          className="mb-4 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Service namespace filters"
        >
          <button
            onClick={() => setSelectedNamespace(null)}
            role="tab"
            aria-selected={selectedNamespace === null}
            aria-controls="services-list"
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selectedNamespace === null
                ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            }`}
          >
            All ({allServices.length})
          </button>
          {namespaces.map((namespace) => (
            <button
              key={namespace}
              onClick={() => setSelectedNamespace(namespace)}
              role="tab"
              aria-selected={selectedNamespace === namespace}
              aria-controls="services-list"
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedNamespace === namespace
                  ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              }`}
            >
              {namespace} ({servicesByNamespace[namespace]?.length || 0})
            </button>
          ))}
        </div>

        {/* Services grid */}
        <div
          id="services-list"
          role="tabpanel"
          className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3"
          aria-live="polite"
          aria-atomic="false"
        >
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <ServiceCard
                key={`${service.name}-${service.node}`}
                service={service}
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                No services found matching &quot;{searchQuery}&quot;
              </p>
            </div>
          )}
        </div>

        {/* Results summary */}
        {searchQuery && filteredServices.length > 0 && (
          <p
            className="mt-4 text-xs text-neutral-500 dark:text-neutral-400"
            role="status"
          >
            Showing {filteredServices.length} of {allServices.length} services
          </p>
        )}
      </CardContent>
    </Card>
  );
}

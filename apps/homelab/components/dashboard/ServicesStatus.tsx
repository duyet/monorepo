"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useServices } from "@/hooks/useDashboard";
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
    <div>
      <h2 className="mb-4 text-base font-semibold tracking-tight text-neutral-950 dark:text-foreground">
        Running Services
      </h2>
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
            className="w-full rounded-lg border border-[#e8e0d4] bg-white py-2 pl-10 pr-4 text-sm text-neutral-950 placeholder:text-neutral-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/12 dark:bg-[#1a1a1a] dark:text-foreground dark:placeholder:text-muted-foreground"
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
          className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
            selectedNamespace === null
              ? "bg-neutral-950 text-white dark:bg-neutral-950 dark:text-white"
              : "bg-white text-neutral-700 ring-1 ring-[#e8e0d4] hover:bg-[#fffdf7] dark:bg-[#1a1a1a] dark:text-muted-foreground dark:ring-white/12 dark:hover:bg-[#242420]"
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
            className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
              selectedNamespace === namespace
                ? "bg-neutral-950 text-white dark:bg-neutral-950 dark:text-white"
                : "bg-white text-neutral-700 ring-1 ring-[#e8e0d4] hover:bg-[#fffdf7] dark:bg-[#1a1a1a] dark:text-muted-foreground dark:ring-white/12 dark:hover:bg-[#242420]"
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
        aria-atomic={false}
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
            <p className="text-sm text-neutral-500 dark:text-muted-foreground">
              No services found matching &quot;{searchQuery}&quot;
            </p>
          </div>
        )}
      </div>

      {/* Results summary */}
      {searchQuery && filteredServices.length > 0 && (
        <p
          className="mt-4 text-xs text-neutral-500 dark:text-muted-foreground"
          role="status"
        >
          Showing {filteredServices.length} of {allServices.length} services
        </p>
      )}
    </div>
  );
}

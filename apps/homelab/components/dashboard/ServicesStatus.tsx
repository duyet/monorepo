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
    <div className="space-y-6">
      <h2 className="text-base font-semibold tracking-tight text-[var(--rd-text)]">
        Running Services
      </h2>

      {/* Search bar */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--rd-text-3)]"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Search services by name, namespace, or node..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-[var(--rd-border)] bg-[var(--rd-surface)] py-2 pl-10 pr-4 text-sm text-[var(--rd-text)] placeholder:text-[var(--rd-text-3)] focus:border-[var(--rd-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--rd-ring)]"
          aria-label="Search services"
        />
      </div>

      {/* Namespace filters */}
      <div
        className="flex flex-wrap gap-2"
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
              ? "bg-[var(--rd-text)] text-[var(--rd-bg)]"
              : "bg-[var(--rd-surface)] text-[var(--rd-text-2)] ring-1 ring-[var(--rd-border)] hover:bg-[var(--rd-surface-2)]"
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
                ? "bg-[var(--rd-text)] text-[var(--rd-bg)]"
                : "bg-[var(--rd-surface)] text-[var(--rd-text-2)] ring-1 ring-[var(--rd-border)] hover:bg-[var(--rd-surface-2)]"
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
            <p className="text-sm text-[var(--rd-text-3)]">
              No services found matching &quot;{searchQuery}&quot;
            </p>
          </div>
        )}
      </div>

      {/* Results summary */}
      {searchQuery && filteredServices.length > 0 && (
        <p
          className="mt-4 text-xs text-[var(--rd-text-3)]"
          role="status"
        >
          Showing {filteredServices.length} of {allServices.length} services
        </p>
      )}
    </div>
  );
}
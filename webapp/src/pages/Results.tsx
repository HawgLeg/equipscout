import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Filter, RefreshCw, Truck, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ListingCard, ListingCardSkeleton } from "@/components/results/ListingCard";
import { RequestModal } from "@/components/results/RequestModal";
import { RateFilter, type RateFilterValue } from "@/components/results/RateFilter";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { SearchResult, EquipmentType } from "../../../backend/src/types";

type TypeFilter = "ALL" | EquipmentType;

const equipmentTypeLabels: Record<EquipmentType, string> = {
  CTL: "Compact Track Loader",
  SKID: "Skid Steer",
  EXCAVATOR: "Excavator",
  DOZER: "Dozer / Bulldozer",
  CRANE: "Crane",
  BACKHOE: "Backhoe",
  FORKLIFT: "Forklift",
  TELEHANDLER: "Telehandler",
  ROLLER: "Roller / Compactor",
  GRADER: "Motor Grader",
  LOADER: "Wheel Loader",
  DUMP_TRUCK: "Dump Truck",
  OTHER: "Other",
};

// Auto-refresh interval: 15 minutes
const REFRESH_INTERVAL_MS = 15 * 60 * 1000;

export default function Results() {
  const [searchParams] = useSearchParams();

  // Parse query params
  const type = searchParams.get("type") as "CTL" | "SKID" | undefined;
  const location = searchParams.get("location") || "";
  const radius = parseInt(searchParams.get("radius") || "10", 10);
  const needDate = searchParams.get("needDate") || "any";

  // Local filter state
  const [availableOnly, setAvailableOnly] = useState(false);
  const [withinRadius, setWithinRadius] = useState(false);
  const [rateFilter, setRateFilter] = useState<RateFilterValue>({ maxRate: 0, period: "day" });
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);

  // Build query string for API - only send maxDayRate to backend
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (type) params.set("equipmentType", type);
    if (location) params.set("location", location);
    params.set("radius", radius.toString());
    params.set("needDate", needDate);
    if (availableOnly) params.set("availableOnly", "true");
    // Only send day rate to backend when period is "day"
    if (rateFilter.maxRate > 0 && rateFilter.period === "day") {
      params.set("maxDayRate", rateFilter.maxRate.toString());
    }
    return params.toString();
  }, [type, location, radius, needDate, availableOnly, rateFilter]);

  // Fetch results with auto-refresh every 15 minutes
  const { data: results, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ["search", queryString],
    queryFn: () => api.get<SearchResult[]>(`/api/search?${queryString}`),
    refetchInterval: REFRESH_INTERVAL_MS,
    refetchIntervalInBackground: false,
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
  });

  // Track last refresh time
  useEffect(() => {
    if (!isFetching && results) {
      setLastRefresh(new Date());
    }
  }, [results, isFetching]);

  // Manual refresh handler
  const handleManualRefresh = () => {
    refetch();
  };

  // Format time since last refresh
  const formatTimeSinceRefresh = () => {
    const now = new Date();
    const diffMs = now.getTime() - lastRefresh.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 min ago";
    if (diffMins < 60) return `${diffMins} mins ago`;
    return `${Math.floor(diffMins / 60)}h ago`;
  };

  // Search context for tracking
  const searchContext = useMemo(() => ({
    locationText: location,
    radius,
    needDate,
  }), [location, radius, needDate]);

  const handleRequestAvailability = (result: SearchResult) => {
    setSelectedResult(result);
    setModalOpen(true);
  };

  // Helper function to check if a result matches the rate filter
  const matchesRateFilter = (result: SearchResult): boolean => {
    if (rateFilter.maxRate === 0) return true;

    const { maxRate, period } = rateFilter;

    if (period === "hour") {
      // Filter by hourly rate - use rateHourMin for comparison
      if (result.rateHourMin === null) return true; // Include if no hourly rate set
      return result.rateHourMin <= maxRate;
    } else if (period === "day") {
      // Filter by daily rate - use rateDayMin for comparison
      if (result.rateDayMin === null) return true; // Include if no day rate set
      return result.rateDayMin <= maxRate;
    } else if (period === "week") {
      // Filter by weekly rate - convert max weekly to daily (week = day * 5)
      const maxDayEquivalent = maxRate / 5;
      if (result.rateDayMin === null) return true; // Include if no day rate set
      return result.rateDayMin <= maxDayEquivalent;
    }

    return true;
  };

  // Split results into sponsored and regular
  const { sponsored, regular, availableTypes } = useMemo(() => {
    if (!results) return { sponsored: [], regular: [], availableTypes: [] as EquipmentType[] };

    // Get unique equipment types from results
    const typesInResults = [...new Set(results.map((r) => r.type))] as EquipmentType[];

    let filtered = [...results];

    // Apply local filters
    if (withinRadius && radius) {
      filtered = filtered.filter((r) => r.distance !== null && r.distance <= radius);
    }

    // Apply type filter
    if (typeFilter !== "ALL") {
      filtered = filtered.filter((r) => r.type === typeFilter);
    }

    // Apply rate filter (for hour/week periods, or when backend filtering is not used)
    if (rateFilter.maxRate > 0) {
      filtered = filtered.filter(matchesRateFilter);
    }

    return {
      sponsored: filtered.filter((r) => r.isSponsored),
      regular: filtered.filter((r) => !r.isSponsored),
      availableTypes: typesInResults,
    };
  }, [results, withinRadius, radius, typeFilter, rateFilter]);

  const totalCount = sponsored.length + regular.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-lg truncate">
                {location ? `Results near ${location}` : "Search Results"}
              </h1>
              {!isLoading ? (
                <p className="text-sm text-muted-foreground">
                  {totalCount} {totalCount === 1 ? "result" : "results"} found
                </p>
              ) : null}
            </div>
            {/* Refresh button with last updated time */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Updated {formatTimeSinceRefresh()}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleManualRefresh}
                disabled={isFetching}
                title="Refresh results"
              >
                <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Filter bar */}
      <div className="sticky top-[57px] z-30 bg-background border-b">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mb-1">
            {/* Equipment Type Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={typeFilter !== "ALL" ? "default" : "outline"}
                  size="sm"
                  className="shrink-0"
                >
                  <Truck className="h-4 w-4 mr-1" />
                  {typeFilter === "ALL" ? "All Types" : equipmentTypeLabels[typeFilter]}
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-[300px] overflow-y-auto">
                <DropdownMenuItem onClick={() => setTypeFilter("ALL")}>
                  All Types
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {availableTypes.map((eqType) => (
                  <DropdownMenuItem
                    key={eqType}
                    onClick={() => setTypeFilter(eqType)}
                  >
                    {equipmentTypeLabels[eqType]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant={availableOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setAvailableOnly(!availableOnly)}
              className="shrink-0"
            >
              Available Now
            </Button>
            <Button
              variant={withinRadius ? "default" : "outline"}
              size="sm"
              onClick={() => setWithinRadius(!withinRadius)}
              className="shrink-0"
            >
              Within {radius}mi
            </Button>
            <RateFilter value={rateFilter} onChange={setRateFilter} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {/* Loading state */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          /* Error state */
          <div className="text-center py-12">
            <p className="text-lg font-medium text-foreground mb-2">Something went wrong</p>
            <p className="text-muted-foreground mb-4">We could not load the search results.</p>
            <Link to="/">
              <Button variant="outline">Back to Search</Button>
            </Link>
          </div>
        ) : totalCount === 0 ? (
          /* Empty state */
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Filter className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">No results found</p>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or expanding your search radius.
            </p>
            <Link to="/">
              <Button>Modify Search</Button>
            </Link>
          </div>
        ) : (
          /* Results list */
          <div className="space-y-6">
            {/* Sponsored section */}
            {sponsored.length > 0 ? (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="sponsored-label">
                    Sponsored
                  </Badge>
                </div>
                <div className="space-y-4">
                  {sponsored.map((result) => (
                    <ListingCard
                      key={result.id}
                      result={result}
                      onRequestAvailability={handleRequestAvailability}
                      searchContext={searchContext}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {/* Regular results */}
            {regular.length > 0 ? (
              <section>
                {sponsored.length > 0 ? (
                  <h2 className="text-sm font-medium text-muted-foreground mb-3">
                    All Results
                  </h2>
                ) : null}
                <div className="space-y-4">
                  {regular.map((result) => (
                    <ListingCard
                      key={result.id}
                      result={result}
                      onRequestAvailability={handleRequestAvailability}
                      searchContext={searchContext}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </main>

      {/* Request Availability Modal */}
      <RequestModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        result={selectedResult}
        searchContext={searchContext}
      />
    </div>
  );
}

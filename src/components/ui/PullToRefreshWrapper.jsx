import React from "react";
import { usePullToRefresh } from "../../hooks/usePullToRefresh";
import PullToRefreshIndicator from "./PullToRefreshIndicator";

/**
 * PullToRefreshWrapper
 * - onRefresh: async function to call when user triggers refresh
 * - threshold, enabled: forwarded to hook
 * - children: page content
 */
export default function PullToRefreshWrapper({
  onRefresh,
  threshold = 80,
  enabled = true,
  children,
}) {
  const ptr = usePullToRefresh(onRefresh, { threshold, enabled });

  return (
    <>
      <PullToRefreshIndicator
        isPulling={ptr.isPulling}
        isRefreshing={ptr.isRefreshing}
        progress={ptr.progress}
        threshold={ptr.threshold}
        onRefresh={onRefresh}
      />

      {children}
    </>
  );
}

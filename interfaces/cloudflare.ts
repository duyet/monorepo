type Date = {
  date: string
}

type Sum = {
  bytes: number
  requests: number
  pageViews: number
  cachedBytes: number
}

type Uniq = {
  uniques: number
}

type HttpRequests1dGroup = {
  date: Date
  sum: Sum
  uniq: Uniq
}

type Zone = {
  httpRequests1dGroups: HttpRequests1dGroup[]
}

type Viewer = {
  zones: Zone[]
}

export type CloudflareAnalyticsByDate = {
  viewer: Viewer
}

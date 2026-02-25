import { useQuery } from "@tanstack/react-query";
import { fetchICD10Data, ICD10Item } from "@/lib/data";

export function useICD10Data() {
  return useQuery({
    queryKey: ["icd10-data"],
    queryFn: fetchICD10Data,
    staleTime: Infinity, // Data is static, load once
    refetchOnWindowFocus: false,
  });
}

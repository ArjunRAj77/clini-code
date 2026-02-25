import Papa from "papaparse";

export interface ICD10Item {
  code: string;
  description: string;
  category: string;
}

export const fallbackData: ICD10Item[] = [
  { code: "E11.9", description: "Type 2 diabetes mellitus without complications", category: "Endocrine" },
  { code: "I10", description: "Essential (primary) hypertension", category: "Circulatory" },
  { code: "J45.909", description: "Unspecified asthma, uncomplicated", category: "Respiratory" },
  { code: "M54.5", description: "Low back pain", category: "Musculoskeletal" },
  { code: "R51", description: "Headache", category: "Symptoms" },
  { code: "Z00.00", description: "Encounter for general adult medical examination without abnormal findings", category: "Factors" },
  { code: "K21.9", description: "Gastro-esophageal reflux disease without esophagitis", category: "Digestive" },
  { code: "F41.1", description: "Generalized anxiety disorder", category: "Mental" },
  { code: "N39.0", description: "Urinary tract infection, site not specified", category: "Genitourinary" },
  { code: "H10.1", description: "Acute atopic conjunctivitis", category: "Eye" },
  { code: "L20.9", description: "Atopic dermatitis, unspecified", category: "Skin" },
  { code: "R05", description: "Cough", category: "Symptoms" },
  { code: "R50.9", description: "Fever, unspecified", category: "Symptoms" },
  { code: "B34.9", description: "Viral infection, unspecified", category: "Infectious" },
  { code: "E78.5", description: "Hyperlipidemia, unspecified", category: "Endocrine" }
];

export async function fetchICD10Data(): Promise<ICD10Item[]> {
  try {
    const response = await fetch("/icd10-2023.csv");
    if (!response.ok) {
      console.warn("icd10-2023.csv not found, using fallback data");
      return fallbackData;
    }

    const csvText = await response.text();
    
    return new Promise((resolve) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsedData = results.data.map((row: any) => ({
            code: row.ICDCode || row.code || row.Code || row.CODE || "???",
            description: row.Description || row.description || row.DESCRIPTION || "No description",
            category: "General" // Default category since it's not in the CSV
          })).filter(item => item.code !== "???");
          
          if (parsedData.length === 0) {
             resolve(fallbackData);
          } else {
             resolve(parsedData);
          }
        },
        error: (error) => {
          console.error("CSV Parse Error:", error);
          resolve(fallbackData);
        }
      });
    });
  } catch (error) {
    console.error("Error fetching ICD10 data:", error);
    return fallbackData;
  }
}

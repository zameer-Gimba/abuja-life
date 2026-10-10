// Abuja Life — Property & Housing listings

export const PROPERTY_LISTINGS = [
  { id: "nyanya-face-me-1", name: "Nyanya Shared Compound", type: "face-me", area: "Nyanya", annualRent: 120000, inspectionFee: 5000, agencyRate: 0.15, cautionRate: 0.05, legalRate: 0.05 },
  { id: "nyanya-sefcon-1", name: "Nyanya Sef-Con", type: "sef-con", area: "Nyanya", annualRent: 300000, inspectionFee: 5000, agencyRate: 0.15, cautionRate: 0.05, legalRate: 0.05 },
  { id: "kubwa-sefcon-1", name: "Kubwa Sef-Con", type: "sef-con", area: "Kubwa", annualRent: 450000, inspectionFee: 10000, agencyRate: 0.15, cautionRate: 0.05, legalRate: 0.05 },
  { id: "lugbe-mini-1", name: "Lugbe Mini-Flat", type: "mini-flat", area: "Lugbe", annualRent: 650000, inspectionFee: 10000, agencyRate: 0.15, cautionRate: 0.05, legalRate: 0.05 },
  { id: "gwarinpa-mini-1", name: "Gwarinpa Mini-Flat", type: "mini-flat", area: "Gwarinpa", annualRent: 900000, inspectionFee: 15000, agencyRate: 0.15, cautionRate: 0.05, legalRate: 0.05 },
  { id: "wuse2-2bed-1", name: "Wuse 2 Two-Bedroom", type: "2-bedroom", area: "Wuse 2", annualRent: 3200000, inspectionFee: 20000, agencyRate: 0.15, cautionRate: 0.05, legalRate: 0.05 },
  { id: "guzape-duplex-1", name: "Guzape Terrace Duplex", type: "duplex", area: "Guzape", annualRent: 12000000, inspectionFee: 25000, agencyRate: 0.15, cautionRate: 0.05, legalRate: 0.05 },
  { id: "maitama-mansion-1", name: "Maitama Executive Mansion", type: "mansion", area: "Maitama", annualRent: 45000000, inspectionFee: 50000, agencyRate: 0.15, cautionRate: 0.05, legalRate: 0.05 },
] as const

export type PropertyListing = (typeof PROPERTY_LISTINGS)[number]

export function calculateMoveInCost(property: PropertyListing) {
  const agencyFee = Math.round(property.annualRent * property.agencyRate)
  const cautionFee = Math.round(property.annualRent * property.cautionRate)
  const legalFee = Math.round(property.annualRent * property.legalRate)
  return { annualRent: property.annualRent, inspectionFee: property.inspectionFee, agencyFee, cautionFee, legalFee, total: property.annualRent + property.inspectionFee + agencyFee + cautionFee + legalFee }
}

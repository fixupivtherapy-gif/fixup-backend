/* ─────────────────────────────────────────────────────────────────
   Real-estate calculator math — pure functions, no UI.
   ───────────────────────────────────────────────────────────────── */

export interface MortgageInput {
  loanAmount: number;
  annualRate: number; // as percent, e.g. 7.5
  termYears: number;
}

export interface MortgageResult {
  monthlyPayment: number;
  totalInterest: number;
  totalPaid: number;
  schedulePreview: Array<{
    month: number;
    interest: number;
    principal: number;
    balance: number;
  }>;
}

export function calcMortgage(input: MortgageInput): MortgageResult {
  const { loanAmount, annualRate, termYears } = input;
  const n = termYears * 12;
  const r = annualRate / 100 / 12;

  let monthlyPayment: number;
  if (r === 0) {
    monthlyPayment = loanAmount / n;
  } else {
    monthlyPayment =
      (loanAmount * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
  }

  let balance = loanAmount;
  const schedulePreview: MortgageResult['schedulePreview'] = [];
  for (let m = 1; m <= Math.min(12, n); m++) {
    const interest = balance * r;
    const principal = monthlyPayment - interest;
    balance = Math.max(0, balance - principal);
    schedulePreview.push({ month: m, interest, principal, balance });
  }

  const totalPaid = monthlyPayment * n;
  const totalInterest = totalPaid - loanAmount;

  return { monthlyPayment, totalInterest, totalPaid, schedulePreview };
}

export interface Comp {
  address: string;
  soldPrice: number;
  sqft: number;
}

export interface ArvInput {
  subjectSqft: number;
  comps: Comp[];
}

export interface ArvResult {
  avgPricePerSqft: number;
  weightedAvgPricePerSqft: number;
  arv: number;
  arvLow: number;
  arvHigh: number;
  perCompPpsf: Array<{ address: string; ppsf: number }>;
}

export function calcArv(input: ArvInput): ArvResult {
  const { subjectSqft, comps } = input;
  const valid = comps.filter((c) => c.sqft > 0 && c.soldPrice > 0);
  if (valid.length === 0 || subjectSqft <= 0) {
    return {
      avgPricePerSqft: 0,
      weightedAvgPricePerSqft: 0,
      arv: 0,
      arvLow: 0,
      arvHigh: 0,
      perCompPpsf: [],
    };
  }

  const perCompPpsf = valid.map((c) => ({
    address: c.address,
    ppsf: c.soldPrice / c.sqft,
  }));

  const avgPricePerSqft =
    perCompPpsf.reduce((s, c) => s + c.ppsf, 0) / perCompPpsf.length;

  const totalPrice = valid.reduce((s, c) => s + c.soldPrice, 0);
  const totalSqft = valid.reduce((s, c) => s + c.sqft, 0);
  const weightedAvgPricePerSqft = totalPrice / totalSqft;

  const arv = subjectSqft * weightedAvgPricePerSqft;
  const arvLow = subjectSqft * Math.min(...perCompPpsf.map((c) => c.ppsf));
  const arvHigh = subjectSqft * Math.max(...perCompPpsf.map((c) => c.ppsf));

  return {
    avgPricePerSqft,
    weightedAvgPricePerSqft,
    arv,
    arvLow,
    arvHigh,
    perCompPpsf,
  };
}

export interface FixFlipInput {
  arv: number;
  rehabCost: number;
  holdingCost: number;
  sellingCostPct: number; // e.g. 8 for 8%
  purchasePrice: number;
  rulePct: number; // e.g. 70 for 70% rule
}

export interface FixFlipResult {
  mao: number;
  sellingCost: number;
  totalInvested: number;
  profit: number;
  roi: number;
  marginVsMao: number;
}

export function calcFixFlip(input: FixFlipInput): FixFlipResult {
  const {
    arv,
    rehabCost,
    holdingCost,
    sellingCostPct,
    purchasePrice,
    rulePct,
  } = input;

  const mao = arv * (rulePct / 100) - rehabCost;
  const sellingCost = arv * (sellingCostPct / 100);
  const totalInvested = purchasePrice + rehabCost + holdingCost + sellingCost;
  const profit = arv - totalInvested;
  const roi = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;
  const marginVsMao = mao - purchasePrice;

  return {
    mao,
    sellingCost,
    totalInvested,
    profit,
    roi,
    marginVsMao,
  };
}

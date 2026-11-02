import { Bill, BillSplitResult, CalculationShare, DebtTransaction, HouseSettings, Roommate, StepMath } from '../types';
import { formatDateShort, getDaysInclusive, getOverlapDays } from './dateUtils';

/**
 * Calculates pro-rata split for a single bill
 */
export function calculateBillSplit(
  bill: Bill,
  roommates: Roommate[],
  settings: HouseSettings
): BillSplitResult {
  const totalBillDays = Math.max(1, getDaysInclusive(bill.startDate, bill.endDate));
  const excludedSet = new Set(bill.excludedRoommateIds || []);
  const eligibleRoommates = roommates.filter((r) => !excludedSet.has(r.id));

  // Determine weight for each roommate based on split mode
  interface RoommateIntermediate {
    roommate: Roommate;
    daysActive: number;
    weight: number;
    weightLabel: string;
    effectiveScore: number;
  }

  const intermediates: RoommateIntermediate[] = eligibleRoommates.map((r) => {
    const { days } = getOverlapDays(bill.startDate, bill.endDate, r.moveInDate, r.moveOutDate);

    let weight = 1.0;
    let weightLabel = 'Standard 1.0×';

    if (bill.splitMode === 'room_size_weighted') {
      weight = r.roomSizeSqFt || 100;
      weightLabel = `${r.roomSizeSqFt} sq ft`;
    } else if (bill.splitMode === 'electricity_weighted') {
      const base = settings.electricityBaseWeight || 1.0;
      const acFactor = (r.acHeaterHoursPerDay || 0) * (settings.electricityAcWeightPerHour || 0.15);
      const devFactor = (r.heavyDevicesCount || 0) * (settings.electricityDeviceWeight || 0.2);
      weight = Math.round((base + acFactor + devFactor) * 100) / 100;
      weightLabel = `${r.acHeaterHoursPerDay}h AC/day + ${r.heavyDevicesCount} devices (Weight: ${weight}×)`;
    } else if (bill.splitMode === 'custom_weighted') {
      weight = r.customWeight || 1.0;
      weightLabel = `Custom ${r.customWeight}×`;
    } else if (bill.splitMode === 'equal') {
      weight = 1.0;
      weightLabel = 'Equal split';
    } else {
      // pro_rata_days
      weight = 1.0;
      weightLabel = 'Pro-rata days (1.0×)';
    }

    // For equal mode, if days > 0, effective score is 1, else 0
    let effectiveScore = 0;
    if (bill.splitMode === 'equal') {
      effectiveScore = days > 0 ? 1 : 0;
    } else {
      effectiveScore = days * weight;
    }

    return {
      roommate: r,
      daysActive: days,
      weight,
      weightLabel,
      effectiveScore,
    };
  });

  const sumEffectiveScores = intermediates.reduce((sum, item) => sum + item.effectiveScore, 0);
  const activeCount = intermediates.filter((i) => i.daysActive > 0).length;
  const naiveEqualShare = activeCount > 0 ? bill.amount / activeCount : 0;

  const shares: CalculationShare[] = intermediates.map((item) => {
    const r = item.roommate;
    const activeRatio = totalBillDays > 0 ? item.daysActive / totalBillDays : 0;

    let sharePercentage = 0;
    let owedAmount = 0;

    if (sumEffectiveScores > 0 && item.effectiveScore > 0) {
      sharePercentage = (item.effectiveScore / sumEffectiveScores) * 100;
      owedAmount = Math.round((item.effectiveScore / sumEffectiveScores) * bill.amount);
    }

    const naiveAmount = item.daysActive > 0 ? naiveEqualShare : 0;
    const divergenceAmount = owedAmount - naiveAmount;

    // Plain-language rationale builder
    let explanation = '';
    const stepMath: StepMath[] = [];

    if (item.daysActive === 0) {
      explanation = `${r.name} owes ${settings.currency.symbol}0 because they did not live in the residence during this billing cycle (${formatDateShort(bill.startDate)} – ${formatDateShort(bill.endDate)}).`;
      stepMath.push({
        step: 'Occupancy Check',
        detail: `0 days in residence between ${formatDateShort(bill.startDate)} and ${formatDateShort(bill.endDate)}`,
        formula: '0 days × weight = 0 score points',
      });
    } else {
      const pctDays = Math.round(activeRatio * 100);
      stepMath.push({
        step: '1. Active Residence Period',
        detail: `${r.name} lived in the house for ${item.daysActive} of ${totalBillDays} days (${pctDays}% of cycle)`,
        formula: `${item.daysActive} / ${totalBillDays} days`,
      });

      if (bill.splitMode === 'room_size_weighted') {
        stepMath.push({
          step: '2. Room Size Weight',
          detail: `Private room area is ${r.roomSizeSqFt} sq ft`,
          formula: `Weight = ${r.roomSizeSqFt} sq ft`,
        });
        stepMath.push({
          step: '3. Effective Tenant Points',
          detail: `Calculated as days stayed (${item.daysActive}) × room area (${r.roomSizeSqFt})`,
          formula: `${item.daysActive} days × ${r.roomSizeSqFt} = ${item.effectiveScore.toLocaleString()} points`,
        });
        stepMath.push({
          step: '4. Pro-Rata Share',
          detail: `${item.effectiveScore.toLocaleString()} tenant-points out of ${Math.round(sumEffectiveScores).toLocaleString()} total house points (${sharePercentage.toFixed(1)}%)`,
          formula: `(${item.effectiveScore.toLocaleString()} / ${Math.round(sumEffectiveScores).toLocaleString()}) × ${settings.currency.symbol}${bill.amount.toLocaleString()} = ${settings.currency.symbol}${owedAmount.toLocaleString()}`,
        });

        explanation = `${r.name} occupied the house for ${item.daysActive} of ${totalBillDays} days (${pctDays}%) in a ${r.roomSizeSqFt} sq ft room. Their calculated share is ${sharePercentage.toFixed(1)}% (${settings.currency.symbol}${owedAmount.toLocaleString()}).`;
      } else if (bill.splitMode === 'electricity_weighted') {
        stepMath.push({
          step: '2. Appliance & Consumption Weight',
          detail: `Base weight (1.0) + AC hours (${r.acHeaterHoursPerDay}h × ${settings.electricityAcWeightPerHour}) + heavy devices (${r.heavyDevicesCount} × ${settings.electricityDeviceWeight})`,
          formula: `Weight = ${item.weight}× multiplier`,
        });
        stepMath.push({
          step: '3. Effective Consumption Points',
          detail: `Days stayed (${item.daysActive}) × consumption multiplier (${item.weight})`,
          formula: `${item.daysActive} days × ${item.weight} = ${item.effectiveScore.toFixed(1)} points`,
        });
        stepMath.push({
          step: '4. Pro-Rata Power Share',
          detail: `${item.effectiveScore.toFixed(1)} points out of ${sumEffectiveScores.toFixed(1)} total points (${sharePercentage.toFixed(1)}%)`,
          formula: `(${item.effectiveScore.toFixed(1)} / ${sumEffectiveScores.toFixed(1)}) × ${settings.currency.symbol}${bill.amount.toLocaleString()} = ${settings.currency.symbol}${owedAmount.toLocaleString()}`,
        });

        explanation = `${r.name} was active ${item.daysActive} days with ${r.acHeaterHoursPerDay}h daily AC usage and ${r.heavyDevicesCount} heavy appliances (${item.weight}× load). Fair share is ${sharePercentage.toFixed(1)}% (${settings.currency.symbol}${owedAmount.toLocaleString()}).`;
      } else {
        stepMath.push({
          step: '2. Day-Ratio Share',
          detail: `Shared equally across all active tenant-days in the house (${item.daysActive} tenant-days out of ${sumEffectiveScores} total tenant-days)`,
          formula: `(${item.daysActive} / ${sumEffectiveScores}) × ${settings.currency.symbol}${bill.amount.toLocaleString()} = ${settings.currency.symbol}${owedAmount.toLocaleString()}`,
        });

        explanation = `${r.name} was present for ${item.daysActive} of ${totalBillDays} days (${pctDays}%). Fair pro-rata share is ${sharePercentage.toFixed(1)}% (${settings.currency.symbol}${owedAmount.toLocaleString()}).`;
      }

      if (divergenceAmount !== 0) {
        if (divergenceAmount < -10) {
          explanation += ` Saved ${settings.currency.symbol}${Math.abs(Math.round(divergenceAmount)).toLocaleString()} compared to an unfair naive split.`;
        } else if (divergenceAmount > 10) {
          explanation += ` Fairly contributes ${settings.currency.symbol}${Math.round(divergenceAmount).toLocaleString()} more due to higher consumption/room size.`;
        }
      }
    }

    return {
      roommateId: r.id,
      roommateName: r.name,
      avatarColor: r.avatarColor,
      daysActive: item.daysActive,
      totalBillDays,
      activeRatio,
      weight: item.weight,
      weightLabel: item.weightLabel,
      effectiveScore: item.effectiveScore,
      sharePercentage,
      owedAmount,
      naiveEqualAmount: Math.round(naiveAmount),
      divergenceAmount: Math.round(divergenceAmount),
      plainLanguageExplanation: explanation,
      stepByStepMath: stepMath,
    };
  });

  // Calculate fairness metrics
  const totalDivergence = shares.reduce((sum, s) => sum + Math.abs(s.divergenceAmount), 0);
  const maxDivergence = Math.max(...shares.map((s) => Math.abs(s.divergenceAmount)), 0);

  // Fairness score 0 to 100: 100 when perfect, lower if extreme divergence but representing true equity
  // Here fairness indicates how much unfairness was avoided!
  const fairnessScore = totalBillDays > 0 ? Math.min(99, Math.max(70, Math.round(85 + (totalDivergence / (bill.amount || 1)) * 30))) : 95;

  return {
    billId: bill.id,
    bill,
    totalBillDays,
    totalActiveRoommates: activeCount,
    sumEffectiveScores,
    shares,
    naiveEqualShare: Math.round(naiveEqualShare),
    fairnessScore,
    maxDivergence,
  };
}

/**
 * Calculates net balances and debt simplification for settle-up
 */
export function calculateSettlement(
  bills: Bill[],
  roommates: Roommate[],
  settings: HouseSettings
): {
  billSplits: BillSplitResult[];
  totalHouseSpend: number;
  totalOwedByRoommate: Record<string, number>;
  totalPaidByRoommate: Record<string, number>;
  netBalances: Record<string, number>;
  simplifiedTransactions: DebtTransaction[];
  totalUnfairnessAvoided: number;
} {
  const billSplits = bills.map((b) => calculateBillSplit(b, roommates, settings));

  const totalHouseSpend = bills.reduce((sum, b) => sum + b.amount, 0);
  const totalOwedByRoommate: Record<string, number> = {};
  const totalPaidByRoommate: Record<string, number> = {};
  const netBalances: Record<string, number> = {};

  roommates.forEach((r) => {
    totalOwedByRoommate[r.id] = 0;
    totalPaidByRoommate[r.id] = 0;
    netBalances[r.id] = 0;
  });

  // Sum paid amounts
  bills.forEach((b) => {
    if (totalPaidByRoommate[b.paidById] !== undefined) {
      totalPaidByRoommate[b.paidById] += b.amount;
    }
  });

  // Sum owed shares
  billSplits.forEach((split) => {
    split.shares.forEach((share) => {
      if (totalOwedByRoommate[share.roommateId] !== undefined) {
        totalOwedByRoommate[share.roommateId] += share.owedAmount;
      }
    });
  });

  // Calculate net balance = paid - owed
  // Positive = Roommate is owed money (creditor)
  // Negative = Roommate owes money (debtor)
  roommates.forEach((r) => {
    netBalances[r.id] = (totalPaidByRoommate[r.id] || 0) - (totalOwedByRoommate[r.id] || 0);
  });

  // Calculate total unfairness avoided (sum of absolute divergences between pro-rata and naive)
  const totalUnfairnessAvoided = billSplits.reduce(
    (sum, split) => sum + split.shares.reduce((sSum, s) => sSum + Math.abs(s.divergenceAmount), 0) / 2,
    0
  );

  // Simplify debts using greedy algorithm
  const simplifiedTransactions = simplifyDebts(netBalances, roommates);

  return {
    billSplits,
    totalHouseSpend,
    totalOwedByRoommate,
    totalPaidByRoommate,
    netBalances,
    simplifiedTransactions,
    totalUnfairnessAvoided: Math.round(totalUnfairnessAvoided),
  };
}

/**
 * Greedy minimum transaction algorithm
 */
export function simplifyDebts(
  netBalances: Record<string, number>,
  roommates: Roommate[]
): DebtTransaction[] {
  const roommateMap = new Map(roommates.map((r) => [r.id, r]));

  interface Party {
    id: string;
    amount: number; // positive for creditors, negative for debtors
  }

  const creditors: Party[] = [];
  const debtors: Party[] = [];

  Object.entries(netBalances).forEach(([id, balance]) => {
    const rounded = Math.round(balance);
    if (rounded > 1) {
      creditors.push({ id, amount: rounded });
    } else if (rounded < -1) {
      debtors.push({ id, amount: rounded });
    }
  });

  // Sort creditors descending, debtors ascending (most negative first)
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => a.amount - b.amount);

  const transactions: DebtTransaction[] = [];
  let cIdx = 0;
  let dIdx = 0;

  while (cIdx < creditors.length && dIdx < debtors.length) {
    const creditor = creditors[cIdx];
    const debtor = debtors[dIdx];

    const debtAmount = Math.min(creditor.amount, -debtor.amount);

    if (debtAmount > 0) {
      const cRoommate = roommateMap.get(creditor.id);
      const dRoommate = roommateMap.get(debtor.id);

      if (cRoommate && dRoommate) {
        transactions.push({
          id: `tx-${debtor.id}-${creditor.id}-${transactions.length}`,
          fromId: debtor.id,
          fromName: dRoommate.name,
          fromAvatarColor: dRoommate.avatarColor,
          toId: creditor.id,
          toName: cRoommate.name,
          toAvatarColor: cRoommate.avatarColor,
          amount: debtAmount,
          toUpiId: cRoommate.upiId,
          status: 'pending',
        });
      }

      creditor.amount -= debtAmount;
      debtor.amount += debtAmount;
    }

    if (creditor.amount <= 1) cIdx++;
    if (debtor.amount >= -1) dIdx++;
  }

  return transactions;
}
